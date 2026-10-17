/**
 * dsh-token-stats · 扫描 + 三层缓存（磁盘解析缓存 → 内存文件级解析缓存含增量解析 → 聚合级签名缓存）。
 *
 * 磁盘解析缓存（lib/host/cache.js，方案 B）：把每个日志文件的解析成品按 mtime+size 键落盘，
 * 解决「dsh web 重启后内存缓存清空 → 首次请求需全量重解全部日志（解析耗时为秒级到数十秒）」。
 * 重启后文件未变者直接从磁盘恢复（历史会话绝大多数），仅变化文件全量重解。
 * 预热（lib/index.js apply 内 setTimeout）在启动后后台完成一轮扫描，用户点开即命中聚合缓存。
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DAY_MS, localDateStr, sha1, tsOfDay } from "./util.js";
import { createParserState, decompressFramesFrom, feedLines, finishParse } from "./parse.js";
import { aggregate, serializeModelByDay, serializeSessions, serializeHours } from "./aggregate.js";
import { loadDiskCache, saveDiskCache, cleanupDiskCache, loadArchivedValue, listArchivedPaths, resetDiskCacheStats } from "./cache.js";

/**
 * 会话日志文件名（DSH 0.1.5-rc.2 起从 session.jsonl.zstd 迁移为 session.v3.jsonl.zstd，
 * 事件结构同步从 assistant/chunk 变为 assistant/attempt，见 parse.js）。
 * 同一会话目录可能同时存在新旧两个文件（v3 为升级迁移后的完整历史重写），只取版本号最高的一个，
 * 避免同批用量双扫（跨文件去重键也兜不住 cache 字段缺失导致的数值差异）。
 */
function isLogFileName(name) {
  return /^session(\.v\d+)?\.jsonl\.zstd$/.test(name);
}

/** 日志文件名版本 rank：session.v3.jsonl.zstd 高于无版本号旧文件；未知更高版本自然更大。 */
function logFileRank(name) {
  const m = /^session\.v(\d+)\.jsonl\.zstd$/.exec(name);
  return m ? Number(m[1]) : 0;
}

/** 文件级解析缓存：路径 -> { key:"mtime:size", state, off, value, prefixHash }（超上限按最旧插入顺序清理）。
 *  off 为增量解析的续扫偏移（= 最后一个成功解压帧的起始位置；末帧每轮幂等重入一次）；
 *  prefixHash 为上次全量解析时的整文件 SHA-1——size 变大且前缀哈希一致才走增量，判定"追加"而非"重写"。
 *  state 为 null 表示该条目来自磁盘缓存恢复（无增量续扫状态），文件一变即按全量重解。 */
const FILE_CACHE_MAX = 500;
const fileCache = new Map();
/** 聚合级缓存：文件清单签名 -> { summary, modelByDay }。 */
let aggCache = { sig: "", summary: null, modelByDay: null };

function walkLogFiles(dir, out, depth) {
  if (depth > 6) return;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      walkLogFiles(p, out, depth + 1);
    } else if (isLogFileName(e.name)) {
      try {
        const st = statSync(p);
        if (st.isFile()) out.push({ path: p, name: e.name, rank: logFileRank(e.name), mtimeMs: st.mtimeMs, size: st.size });
      } catch {
        // 刚好被删掉的文件：跳过
      }
    }
  }
}

/**
 * 同一会话目录（path.dirname 相同）可能同时存在 session.jsonl.zstd（旧格式）与
 * session.v3.jsonl.zstd（迁移后完整重写）。只保留 rank 最高的那个文件，
 * 其余作为同会话旧副本丢掉，防止同批用量双扫。
 */
function dedupeBySession(items) {
  const best = new Map(); // 会话目录 -> 文件条目
  for (const it of items) {
    const dir = path.dirname(it.path);
    const cur = best.get(dir);
    if (cur === undefined || it.rank > cur.rank) best.set(dir, it);
  }
  return [...best.values()];
}

/**
 * 日志路径 → 会话展示名：sessions/<工作区编码名>/session-<uuid>/session.jsonl.zstd
 * → { name: "<工作区编码名>/<uuid 前 8 位>", full: "<工作区编码名>/session-<完整 uuid>", dirId: "<uuid>" }
 * （日志中无会话标题，短 ID 展示；full 为完整目录名，供前端悬停展示完整会话名；
 *   dirId 为目录内 uuid——子代理会话目录无 session- 前缀，原样取目录名，作会话 id 兜底）。
 */
function sessionNameOf(p) {
  const parts = p.split(/[\\/]/);
  const si = parts.indexOf("sessions");
  const ws = si >= 0 && parts.length > si + 2 ? parts[si + 1] : "未知工作区";
  const dir = parts.length >= 2 ? parts[parts.length - 2] : "";
  const m = dir.match(/^session-(.+)$/);
  const name = ws + "/" + (m ? m[1].slice(0, 8) : dir.slice(0, 8));
  const full = ws + "/" + dir;
  const dirId = m ? m[1] : dir;
  return { name, full, dirId };
}

/** 异步分片的时间片长度：每跑满这么久就让出一次事件循环（宿主不再被同步解析卡住）。 */
const SLICE_MS = 12;

/**
 * 扫描主体（生成器）：在「逐文件解压解析」这类重活之间 `yield`，由下方两个驱动器决定是否让出事件循环。
 *
 * 为什么用生成器而不是写成 async：
 * - dsh web 是单进程事件循环，全量解析全部日志耗时可达数十秒（冷启动）；同步跑会把宿主
 *   整体卡住这么久（启动预热期间界面/其它请求全部无响应）。
 * - 但自测脚本需要**同步拿返回值**，改成 async 会让全部脚本分叉。
 * - 生成器让**同一份解析逻辑**既能同步跑（`collectSummaryDetailed` 空转驱动）又能异步分片跑
 *   （`collectSummaryDetailedAsync` 按时间片 await）——避免为异步再抄一份解析实现（禁止复制补丁）。
 */
function* collectSummaryGen(nowMs, withHours) {
  const root = path.join(process.env.DSH_HOME || path.join(os.homedir(), ".dsh"), "sessions");
  const raw = [];
  walkLogFiles(root, raw, 0);
  const items = dedupeBySession(raw);

  // ⚠️ 顺序（必须如此）：先把「已消失日志」的缓存条目移入归档区，再算签名、再读归档清单。
  // 反过来的话，本次新归档的条目会漏计一轮（症状：archived 计数 >0 但 archiveHits=0、
  // 总量凭空少掉被删会话的量），且签名会与归档后的真实状态不一致、缓存判断失准。
  const seenPathsEarly = new Set();
  for (const it of items) seenPathsEarly.add(it.path);
  cleanupDiskCache(seenPathsEarly);

  const sigParts = [];
  for (const it of items) sigParts.push(it.path + "|" + it.mtimeMs + "|" + it.size);
  // 归档清单进签名：日志被删/复活时归档集合变化，必须触发重算（否则界面停在旧值）
  for (const p of listArchivedPaths()) sigParts.push("arch|" + p);
  const sig = sigParts.sort().join("\n") + (withHours ? "|h" : "");
  if (aggCache.summary !== null && aggCache.sig === sig) {
    return { summary: aggCache.summary, modelByDay: aggCache.modelByDay, filesSeen: items.length, filesParsed: items.length, filesFailed: 0, scanRoot: root };
  }

  let filesFailed = 0;
  let lastError = null;
  const parsed = [];
  const meta = []; // 与 parsed 对齐的会话元信息 {name, full}（失败文件为 null，保持下标对齐）
  const seenPaths = new Set();
  for (const it of items) {
    // 分片让出点：每个文件处理前 yield 一次，异步驱动器按时间片决定是否 await 让出事件循环。
    // 同步驱动器空转 yield，行为与改造前逐文件顺序解析完全一致（结果零差异）。
    yield;
    seenPaths.add(it.path);
    const sessName = sessionNameOf(it.path);
    try {
      const key = it.mtimeMs + ":" + it.size;
      let entry = fileCache.get(it.path);
      let handled = false;
      if (entry !== undefined && entry.key === key) {
        // 文件未变：直接复用（聚合级签名命中时不会走到这里，仅清单抖动时兜底）
        handled = true;
      } else if (entry !== undefined && entry.state !== null && it.size > entry.size) {
        // size 变大：校验旧前缀哈希一致（append-only 追加）才走增量，否则按重写全量重解。
        // 注意 state 为 null（磁盘缓存恢复的条目）不做增量，直接落入下方全量路径。
        const buf = readFileSync(it.path);
        if (sha1(buf, entry.size).equals(entry.prefixHash)) {
          const { text, lastOk } = decompressFramesFrom(buf, entry.off);
          if (text.length > 0) feedLines(entry.state, text);
          if (lastOk >= 0) entry.off = lastOk;
          entry.key = key;
          entry.prefixHash = sha1(buf);
          entry.value = finishParse(entry.state);
          saveDiskCache(it.path, key, entry.value, entry.prefixHash); // 增量后同步更新磁盘缓存
          handled = true;
        }
      }
      if (!handled) {
        // 磁盘缓存兜底：文件未变（mtime+size 键匹配）时直接恢复解析成品，免 zstd 重解。
        // 恢复的条目 state=null——本进程内该文件再变化时不走增量、按全量重解（见上方分支条件）。
        const disk = loadDiskCache(it.path, key);
        if (disk !== null) {
          entry = { key, state: null, off: 0, value: disk.value, prefixHash: disk.prefixHash };
          handled = true;
        }
      }
      if (!handled) {
        // 全量解析：重建状态、从 0 解压全部帧，并把成品写回磁盘缓存
        const buf = readFileSync(it.path);
        entry = { key, state: createParserState(), off: 0, value: null, prefixHash: sha1(buf) };
        const { text, lastOk } = decompressFramesFrom(buf, 0);
        feedLines(entry.state, text);
        entry.off = lastOk >= 0 ? lastOk : 0;
        entry.value = finishParse(entry.state);
        saveDiskCache(it.path, key, entry.value, entry.prefixHash);
      }
      fileCache.delete(it.path); // 先删再插，刷新插入顺序（最旧条目排在最前）
      fileCache.set(it.path, entry);
      while (fileCache.size > FILE_CACHE_MAX) {
        const oldest = fileCache.keys().next().value;
        fileCache.delete(oldest);
      }
      parsed.push(entry.value);
      // 会话标题随文件解析结果带出（日志中 session/title 事件 last-wins，含用户重命名）；无标题为 null
      // 会话身份（主/子代理区分）：日志首行 session 事件 {id, origin, parent, depth}——
      // origin="subagent" 即子代理会话；subagent/descriptor 的任务 label 作子代理显示名。id 无则目录 uuid 兜底。
      const sm = entry.value && entry.value.sessionMeta ? entry.value.sessionMeta : null;
      const sbm = entry.value && entry.value.subagentMeta ? entry.value.subagentMeta : null;
      meta.push({
        ...sessName,
        title: entry.value && entry.value.title ? entry.value.title : null,
        id: sm && sm.id ? sm.id : sessName.dirId,
        role: sm ? sm.origin : "main",
        parent: sm ? sm.parent : null,
        depth: sm ? sm.depth : 0,
        label: sbm ? sbm.label : null
      });
    } catch (err) {
      filesFailed++;
      lastError = err instanceof Error ? err.message : String(err);
      parsed.push(null); // 保持与 meta 下标对齐
      meta.push(null);
    }
  }
  // 清掉已消失文件的内存缓存，防长期驻留（磁盘缓存已在函数开头 cleanupDiskCache 处理）
  for (const p of [...fileCache.keys()]) {
    if (!seenPaths.has(p)) fileCache.delete(p);
  }

  // —— 归档条目参与统计（删会话不丢数）——
  // 语义：日志文件被删后，其解析成品被 cleanupDiskCache 移入归档区；这里把归档条目补进聚合，
  // 使用户删掉会话后总量不会凭空变小。
  // ⚠️ 顺序（必须如此）：必须先 cleanupDiskCache（把消失日志的条目**移入**归档区），
  // 再读归档清单——反过来会读到「归档前的旧清单」，导致本次新归档的条目漏计
  // （症状：archived 计数 >0 但 archiveHits=0、总量凭空少掉被删会话的量）。
  // ⚠️ 防双计（本方案唯一风险点）：**只在该会话目录已无任何存活日志时**才采用归档条目。
  // 理由：DSH 升级会在同目录同时留下 session.jsonl.zstd 与 session.v3/v4.jsonl.zstd，
  // dedupeBySession 只取最高版本；若同目录仍有存活日志，说明该会话的用量已由存活文件承载，
  // 此时再叠加归档副本就会双计。
  const liveDirs = new Set();
  for (const it of items) liveDirs.add(path.dirname(it.path));
  for (const p of listArchivedPaths()) {
    if (seenPaths.has(p)) continue; // 该路径日志已复活：已由常规扫描处理
    if (liveDirs.has(path.dirname(p))) continue; // 同目录仍有存活日志：不叠加，防双计
    const archived = loadArchivedValue(p);
    if (archived === null) continue;
    const sessName = sessionNameOf(p);
    const sm = archived.sessionMeta ? archived.sessionMeta : null;
    const sbm = archived.subagentMeta ? archived.subagentMeta : null;
    parsed.push(archived);
    meta.push({
      ...sessName,
      title: archived.title ? archived.title : null,
      id: sm && sm.id ? sm.id : sessName.dirId,
      role: sm ? sm.origin : "main",
      parent: sm ? sm.parent : null,
      depth: sm ? sm.depth : 0,
      label: sbm ? sbm.label : null
    });
  }

  const agg = aggregate(parsed, nowMs ?? Date.now(), meta);
  agg.summary.modelByDay = serializeModelByDay(agg.modelByDay);
  agg.summary.sessionByDay = serializeSessions(agg.sessByDay);
  if (withHours) agg.summary.hours = serializeHours(agg.hourByDay);
  aggCache = { sig, summary: agg.summary, modelByDay: agg.modelByDay };
  return { summary: agg.summary, modelByDay: agg.modelByDay, filesSeen: items.length, filesParsed: parsed.length, filesFailed, lastError, scanRoot: root };
}

/**
 * 同步驱动：空转跑完生成器，直接拿返回值。
 * 语义与改造前完全一致（逐文件顺序解析、返回值同形），供**自测脚本**与需要同步结果的调用方使用。
 * 宿主侧请用 `collectSummaryDetailedAsync`——同步版在全量解析时会把事件循环卡住数十秒。
 */
export function collectSummaryDetailed(nowMs, withHours) {
  const it = collectSummaryGen(nowMs, withHours);
  for (;;) {
    const r = it.next();
    if (r.done) return r.value;
  }
}

/**
 * 异步驱动：按时间片跑生成器，每跑满 `SLICE_MS` 就 await 一次让出事件循环。
 *
 * 宿主侧专用（路由 handler 与启动预热）：全量解析全部日志耗时可达数十秒，同步跑会让 dsh web
 * 在这段时间内无法响应任何请求；分片后每 12ms 让出一次，界面与其它请求保持可用。
 * 与同步版共用同一份解析逻辑，结果**零差异**（仅调度方式不同）。
 */
export async function collectSummaryDetailedAsync(nowMs, withHours) {
  const it = collectSummaryGen(nowMs, withHours);
  let sliceStart = Date.now();
  for (;;) {
    const r = it.next();
    if (r.done) return r.value;
    if (Date.now() - sliceStart >= SLICE_MS) {
      await new Promise((resolve) => setImmediate(resolve));
      sliceStart = Date.now();
    }
  }
}

/** 给路由用的简版：只回 summary；有解析失败的文件时附带 diag 诊断字段（前端提示）。
 *  withHours=true 时附带 hours 小时粒度明细（前端配置了时段单价时请求）。 */
export function collectSummary(withHours) {
  const det = collectSummaryDetailed(Date.now(), withHours === true);
  if (det.filesFailed > 0) {
    return {
      ...det.summary,
      diag: { filesFailed: det.filesFailed, lastError: det.lastError ?? null, filesSeen: det.filesSeen }
    };
  }
  return det.summary;
}

/** collectSummary 的异步版（宿主路由用）：分片让出事件循环，其余同 collectSummary。 */
export async function collectSummaryAsync(withHours) {
  const det = await collectSummaryDetailedAsync(Date.now(), withHours === true);
  if (det.filesFailed > 0) {
    return {
      ...det.summary,
      diag: { filesFailed: det.filesFailed, lastError: det.lastError ?? null, filesSeen: det.filesSeen }
    };
  }
  return det.summary;
}

/** 测试辅助：清空内存双层缓存与磁盘缓存统计（模拟「dsh 重启后首次请求」路径）。仅供自测脚本使用。 */
export function __resetHostCachesForTest() {
  fileCache.clear();
  aggCache = { sig: "", summary: null, modelByDay: null };
  resetDiskCacheStats();
}

/**
 * 按任意日期范围聚合各模型用量（含端点日；仅 total>0，total 降序）。
 * 依赖「日×模型」明细做内存合并（毫秒级）；聚合缓存命中时零成本。
 * 参数非法（非 YYYY-MM-DD 或 from > to）抛出带 status=400 的错误，由路由转 400。
 *
 * `fromDet`（可选）：调用方已经拿到的 collectSummaryDetailed 结果——路由里同一请求
 * 可能既需要范围聚合又需要汇总，复用同一份扫描结果可省掉一次完整扫描。
 */
export function collectRange(fromStr, toStr, fromDet) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fromStr) || !/^\d{4}-\d{2}-\d{2}$/.test(toStr)) {
    const err = new Error("from/to 必须是 YYYY-MM-DD");
    err.status = 400;
    throw err;
  }
  if (fromStr > toStr) {
    const err = new Error("from 不能晚于 to");
    err.status = 400;
    throw err;
  }
  const det = fromDet !== undefined ? fromDet : collectSummaryDetailed(Date.now());
  const byDay = det.modelByDay || new Map();
  const models = new Map();
  for (let ts = tsOfDay(fromStr); ts <= tsOfDay(toStr); ts += DAY_MS) {
    const dayMap = byDay.get(localDateStr(ts));
    if (dayMap === undefined) continue;
    for (const [mk, agg] of dayMap) {
      let m = models.get(mk);
      if (m === undefined) {
        m = { key: mk, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0, calls: 0, turnMs: 0, toolCalls: 0, toolMs: 0, ttftSum: 0, ttftN: 0, outTokens: 0, outMs: 0 };
        models.set(mk, m);
      }
      m.input += agg.input;
      m.output += agg.output;
      m.cacheRead += agg.cacheRead;
      m.cacheWrite += agg.cacheWrite;
      m.total += agg.total;
      m.calls += agg.calls;
      m.turnMs += agg.turnMs || 0;
      m.toolCalls += agg.toolCalls || 0;
      m.toolMs += agg.toolMs || 0;
      m.ttftSum += agg.ttftSum || 0;
      m.ttftN += agg.ttftN || 0;
      m.outTokens += agg.outTokens || 0;
      m.outMs += agg.outMs || 0;
    }
  }
  return {
    from: fromStr,
    to: toStr,
    models: [...models.values()]
      .filter((m) => m.total > 0)
      .sort((a, b) => b.total - a.total)
      .map((m) => ({
        key: m.key,
        input: m.input,
        output: m.output,
        cacheRead: m.cacheRead,
        cacheWrite: m.cacheWrite,
        total: m.total,
        calls: m.calls,
        turnMs: m.turnMs,
        toolCalls: m.toolCalls,
        toolMs: m.toolMs,
        ttftMs: m.ttftN > 0 ? Math.round(m.ttftSum / m.ttftN) : null,
        tps: m.outMs > 0 ? Math.round((m.outTokens / m.outMs) * 10000) / 10 : null
      }))
  };
}
