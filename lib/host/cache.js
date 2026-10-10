/**
 * dsh-token-stats · 磁盘解析缓存（优化方案 B：持久化「文件级解析成品」）。
 *
 * 背景：collect.js 的内存双层缓存（fileCache / aggCache）随 dsh web 重启即清空，
 * 重启后首次请求要对全部会话日志全量 zstd 解压解析，
 * 耗时约半分钟。本模块把每个日志文件的解析结果（finishParse 成品 value）按
 * mtime+size 键序列化落盘（gzip），dsh 重启后：
 *   - 文件未变 → 读磁盘缓存恢复 value，免重解（历史会话绝大多数属于此类）；
 *   - 文件变化 → 内存无 state 可增量，按现状全量重解该文件并写回缓存（活跃文件通常十几个，秒级）。
 *
 * 设计取舍：只持久化「解析成品 value」，不持久化增量续扫所需的状态（state）——
 * state 含 headerPtr / toolStartAt 等微妙增量字段，序列化还原出错难排查，正确性优先；
 * 代价是「变化文件」重启后首次需全量重解（比增量慢，但数量少、且发生在后台预热期）。
 *
 * 可靠性：
 * - 原子写：临时文件 + rename（同目录，失败时旧缓存完好）；
 * - 损坏兜底：gunzip / JSON.parse / 键校验任一失败 → 丢弃该条目，下次全量解析后重写；
 * - 清理：日志文件消失时对应缓存条目一并删除（防长期驻留）；
 * - 写失败静默：缓存只是加速层，写不进不影响统计正确性（下次解析再写）。
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, renameSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import os from "node:os";
import path from "node:path";

/** 缓存目录：$DSH_HOME/token-stats-cache/（与 token-stats.cfg.json 同级；运行时产物，非源码资产）。 */
export function cacheDir() {
  return path.join(process.env.DSH_HOME || path.join(os.homedir(), ".dsh"), "token-stats-cache");
}

/** 归档区条数上限（防无限膨胀；超出按名字顺序清理最旧，属尽力而为的兜底）。 */
const ARCHIVE_MAX = 2000;

/** 日志路径 → 缓存文件名（路径的 SHA-1 前 24 位 + .json.gz）。 */
function cacheFileName(logPath) {
  return createHash("sha1").update(logPath).digest("hex").slice(0, 24) + ".json.gz";
}

// —— 统计（用于确认磁盘缓存是否真的被命中）——
let stats = { saved: 0, restored: 0, failed: 0, removed: 0, archived: 0, archivedDropped: 0, archiveHits: 0, unarchived: 0 };
export function diskCacheStats() {
  return { ...stats };
}
export function resetDiskCacheStats() {
  stats = { saved: 0, restored: 0, failed: 0, removed: 0, archived: 0, archivedDropped: 0, archiveHits: 0, unarchived: 0 };
}

// —— value 序列化：finishParse 输出中的 Map（stepSpans / textSpans）转数组 ——
function serializeValue(value) {
  return {
    steps: value.steps || [],
    turns: value.turns || [],
    longestTurnMillis: value.longestTurnMillis || 0,
    title: value.title || null,
    sessionMeta: value.sessionMeta || null,
    subagentMeta: value.subagentMeta || null,
    stepSpans: [...(value.stepSpans || new Map())].map(([k, v]) => [k, v]),
    tools: value.tools || [],
    textSpans: [...(value.textSpans || new Map())].map(([k, v]) => [k, v])
  };
}

function deserializeValue(data) {
  return {
    steps: data.steps || [],
    turns: data.turns || [],
    longestTurnMillis: data.longestTurnMillis || 0,
    title: data.title || null,
    // 旧缓存无 sessionMeta/subagentMeta（缺字段 → null），天然兼容；下次解析重写时补齐
    sessionMeta: data.sessionMeta || null,
    subagentMeta: data.subagentMeta || null,
    stepSpans: new Map((data.stepSpans || []).map(([k, v]) => [k, v])),
    tools: data.tools || [],
    textSpans: new Map((data.textSpans || []).map(([k, v]) => [k, v]))
  };
}

/**
 * 读磁盘缓存：mtime+size 键匹配且格式完好 → 返回 { value, prefixHash }；否则返回 null。
 * key 不匹配（文件已变）时旧条目直接删除（下次解析会以新 key 重写）；损坏条目留给
 * 下次 saveDiskCache 覆盖（不主动删，避免每次失败路径都动盘）。
 */
export function loadDiskCache(logPath, key) {
  const file = path.join(cacheDir(), cacheFileName(logPath));
  let obj;
  try {
    obj = JSON.parse(gunzipSync(readFileSync(file)).toString("utf8"));
  } catch {
    stats.failed++;
    return null;
  }
  // v2：解析成品新增 sessionMeta/subagentMeta 字段——旧 v1 缓存（无角色信息）必须作废，
  // 否则子代理会话被误识别为主会话（真实故障：磁盘缓存命中时子代理会话几乎全部漏识别）。
  // v3：usage 合并口径修复（零值 attempt 遮蔽真实用量）——旧缓存里的 steps 数值是错的，
  // 必须作废重解，否则修复被磁盘缓存挡住、界面数字不变。
  // v4：新增归档机制（日志被删后解析成品移入 archive，统计不丢数）。
  if (obj && obj.v === 4 && obj.path === logPath && obj.key === key) {
    stats.restored++;
    return {
      value: deserializeValue(obj.value),
      prefixHash: typeof obj.prefixHash === "string" && obj.prefixHash !== "" ? Buffer.from(obj.prefixHash, "hex") : null
    };
  }
  // 文件已变（key 不匹配）或结构不符：旧缓存作废
  try {
    rmSync(file, { force: true });
  } catch {
    // 删除失败无害，下次 saveDiskCache 覆盖
  }
  stats.failed++;
  return null;
}

/** 写磁盘缓存（原子：临时文件 + rename）。任何失败静默——缓存只是加速层，不得影响统计正确性。 */
export function saveDiskCache(logPath, key, value, prefixHash) {
  try {
    const dir = cacheDir();
    mkdirSync(dir, { recursive: true });
    const obj = {
      v: 4, // 解析成品结构版本：v1 无 sessionMeta/subagentMeta；v2 起带角色字段；
      // v3 usage 合并口径修复；v4 新增归档机制
      path: logPath,
      key,
      prefixHash: prefixHash ? prefixHash.toString("hex") : null,
      value: serializeValue(value)
    };
    const file = path.join(dir, cacheFileName(logPath));
    const tmp = file + "." + process.pid + ".tmp";
    writeFileSync(tmp, gzipSync(Buffer.from(JSON.stringify(obj), "utf8"), { level: 6 }));
    renameSync(tmp, file);
    stats.saved++;
  } catch {
    // 写失败：静默，下次解析再写
  }
}

/**
 * 读取归档条目：日志文件已消失、但此前解析成品仍值得保留（删会话不丢数）。
 *
 * 归档语义（新增）：
 * - 日志消失时，cleanupDiskCache 不直接删除条目，而是把 **解析成品** 写进「归档区」；
 * - 归档条目**只在原会话目录没有任何存活日志时**才参与统计（防与更高版本日志双计）；
 * - 日志复活（同路径重新出现）时归档条目被移回常规区；
 * - 归档有条数上限，超出按最旧清理（防无限膨胀）。
 * @param logPath 原日志路径。
 * @returns 解析成品（value）或 null。
 */
export function loadArchivedValue(logPath) {
  const file = path.join(archiveDir(), cacheFileName(logPath));
  let obj;
  try {
    obj = JSON.parse(gunzipSync(readFileSync(file)).toString("utf8"));
  } catch {
    return null;
  }
  if (obj && obj.v === 4 && obj.path === logPath && obj.value !== undefined) {
    stats.archiveHits++;
    return deserializeValue(obj.value);
  }
  return null;
}

/** 把一条缓存条目移入归档区（原子写）。失败静默——归档只是「不丢数」的尽力而为。 */
function archiveOne(fileName) {
  const src = path.join(cacheDir(), fileName);
  let raw;
  try {
    raw = readFileSync(src);
  } catch {
    return false;
  }
  try {
    const dir = archiveDir();
    mkdirSync(dir, { recursive: true });
    const dst = path.join(dir, fileName);
    const tmp = dst + "." + process.pid + ".tmp";
    writeFileSync(tmp, raw);
    renameSync(tmp, dst);
    rmSync(src, { force: true });
    stats.archived++;
    return true;
  } catch {
    return false;
  }
}

/**
 * 列出归档区里全部条目的**原日志路径**。
 *
 * 归档文件名是路径的 SHA-1 哈希（不可反推），故归档条目内部保留了 `path` 字段；
 * 这里读出每个条目的 path 供 collect.js 判断「同目录是否仍有存活日志」（防双计的关键）。
 * 单条损坏/不可读即跳过，不影响其余条目。
 * @returns 原日志路径数组。
 */
export function listArchivedPaths() {
  let names;
  try {
    names = readdirSync(archiveDir());
  } catch {
    return [];
  }
  const out = [];
  for (const f of names) {
    if (!f.endsWith(".json.gz")) continue;
    try {
      const obj = JSON.parse(gunzipSync(readFileSync(path.join(archiveDir(), f))).toString("utf8"));
      if (obj && typeof obj.path === "string" && obj.path !== "" && obj.value !== undefined) out.push(obj.path);
    } catch {
      // 损坏条目跳过
    }
  }
  return out;
}

/** 归档目录：$DSH_HOME/token-stats-cache/archive/（与常规缓存同级，便于整体清理）。 */
export function archiveDir() {
  return path.join(cacheDir(), "archive");
}

/**
 * 清理 + 归档：日志文件消失时，把它的缓存条目**移入归档区**而非直接删除。
 *
 * 为什么不能直接删：DSH 里删除会话会连日志一起删掉，直接删缓存会让
 * 该会话的历史用量凭空消失、总量变小（用户会看到「统计数字变小了」）。
 * 归档后仍可计入统计；日志复活时（同路径重新出现）归档条目会被移回常规区，避免双计。
 * @param seenPaths 本次扫描见到的日志路径集合。
 */
export function cleanupDiskCache(seenPaths) {
  let names;
  try {
    names = readdirSync(cacheDir());
  } catch {
    return; // 缓存目录不存在 = 无缓存可清理
  }
  const wanted = new Set();
  for (const p of seenPaths) wanted.add(cacheFileName(p));
  for (const f of names) {
    if (!f.endsWith(".json.gz") || wanted.has(f)) continue;
    // 先归档再删：归档失败则保留原条目（宁可留着，也不丢数）
    if (!archiveOne(f)) {
      try {
        rmSync(path.join(cacheDir(), f), { force: true });
        stats.removed++;
      } catch {
        // 删除失败无害
      }
    }
  }
  // 日志复活：归档区里同名的条目移回常规区（说明该会话日志又出现了，归档副本不再需要）
  let archNames;
  try {
    archNames = readdirSync(archiveDir());
  } catch {
    return;
  }
  for (const f of archNames) {
    if (!f.endsWith(".json.gz") || !wanted.has(f)) continue;
    try {
      rmSync(path.join(archiveDir(), f), { force: true });
      stats.unarchived++;
    } catch {
      // 删除失败无害
    }
  }
  // 归档上限：超出按文件名（含路径哈希，无时序语义）顺序清理最旧的若干条
  try {
    const list = readdirSync(archiveDir()).filter((f) => f.endsWith(".json.gz"));
    if (list.length > ARCHIVE_MAX) {
      for (const f of list.slice(0, list.length - ARCHIVE_MAX)) {
        try {
          rmSync(path.join(archiveDir(), f), { force: true });
          stats.archivedDropped++;
        } catch {
          // 忽略
        }
      }
    }
  } catch {
    // 归档目录不存在：无需清理
  }
}
