/**
 * dsh-token-stats — node (host) 入口。
 *
 * 在 dsh web 宿主进程内注册一条路由：
 *   GET /token-stats/summary           扫描 $DSH_HOME/sessions 下全部会话日志并聚合 token 用量（无参数）
 *   GET /token-stats/summary?from=&to= 按任意日期范围 [from, to]（含端点日，YYYY-MM-DD）聚合各模型用量，
 *                                      供前端点击热力图方块后联动展示该时间段模型分布
 *
 * 返回 JSON（口径：计费口径总量 = 输入 + 输出 + 缓存读 + 缓存写）：
 * {
 *   totals: { grandTotal, grandCache, peakDay, peakDayCache, longestTurnMillis, currentStreak, maxStreak },
 *   firstDate: "YYYY-MM-DD" | null,
 *   days: [{ date, input, output, cacheRead, cacheWrite, total, maxTurn }],  // 自首个有用量日起到今天，逐日稠密
 *   models: [{ key: "provider/model", input, output, cacheRead, cacheWrite, total, calls,
 *              turnMs, toolCalls, toolMs, ttftMs, tps }],  // 后五项为性能时序（模型用时/工具次数/工具用时/平均首token毫秒/输出token每秒加权，无样本 null）
 *   periodModels: { today: [...], week: [...], month: [...] },  // 与 models 同形状（含性能时序字段）
 *   modelByDay: [{ date, key, input, output, cacheRead, cacheWrite, total, calls, turnMs, toolCalls, toolMs, ttftMs, tps }],  // 「日×模型」稀疏明细，供前端折算每日费用
 *   sessionByDay: [{ date, name: "工作区/uuid前8位", full: "工作区/session-<完整uuid>", title: "会话标题|null", id: "会话id|null", role: "main|subagent", parent: "父会话id|null", depth: 0, label: "子代理任务名|null", total, calls, input, output, cacheRead, cacheWrite, turnMs, toolCalls, toolMs, ttftSum, ttftN, outTokens, outMs }]  // 「日×会话」稀疏明细（每日降序截前 20），供前端下钻当日 Top 会话；full 为完整目录名（悬停展示用），title 为日志 session/title 事件 last-wins（默认标题 fallback/provider、用户重命名 user 均跟随）；id/role/parent/depth 来自日志首行 type:"session" 事件（origin="subagent"+parentSession 即子代理会话；目录无 session- 前缀），label 来自 subagent/descriptor 事件（子代理任务名，作显示名）；性能时序为会话级聚合——turnMs/toolCalls/toolMs 为合计，ttftSum/ttftN 与 outTokens/outMs 为原始累加（前端跨天合并同会话时 TTFT 按 sum/count、输出速度按 ΣoutTokens/ΣoutMs 加权）
 * }
 *
 * 安全：路由只应答回环地址请求（127.0.0.1 / ::1 / ::ffff:127.0.0.1），否则 403。
 *
 * 结构：解析 lib/host/parse.js、聚合 lib/host/aggregate.js、扫描与缓存 lib/host/collect.js、
 *       共享工具 lib/host/util.js；本文件只保留插件挂载（apply）与测试兼容再导出。
 */

import { isLoopback } from "./host/util.js";
import { collectRange, collectSummaryAsync, collectSummaryDetailedAsync } from "./host/collect.js";
import { readFile, rename } from "node:fs/promises";
import * as fsSync from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

/** Cordis plugin name. */
export const name = "dsh-token-stats";

/** Required services: the route registry. */
export const inject = ["webServer"];

const ROUTE_PATH = "/token-stats/summary";
const CFG_PATH = "/token-stats/cfg";
/** 配置文件唯一权威位置：$DSH_HOME/token-stats.cfg.json（浏览器端定价/套餐/颜色等配置的落盘副本）。 */
export function cfgFilePath() {
  return path.join(process.env.DSH_HOME || path.join(os.homedir(), ".dsh"), "token-stats.cfg.json");
}

const CFG_BODY_LIMIT = 512 * 1024;

function readBody(req, limit, cb) {
  let size = 0;
  const chunks = [];
  req.on("data", (c) => {
    size += c.length;
    if (size > limit) {
      cb(new Error("body too large"));
      req.destroy();
      return;
    }
    chunks.push(c);
  });
  req.on("end", () => cb(null, Buffer.concat(chunks).toString("utf8")));
  req.on("error", (err) => cb(err));
}

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(body);
}

/**
 * 注册 GET /token-stats/summary。先过回环闸，再交给处理函数。
 * @param ctx - host plugin context carrying webServer.
 */
export function apply(ctx) {
  // 启动预热（优化方案 B）：dsh web 启动后延迟后台跑一轮扫描 + 聚合，填满内存缓存。
  // 磁盘解析缓存命中时预热仅 1~5 秒（未变文件读缓存、变化文件重解），此后用户点开
  // Token 统计直接命中聚合缓存（毫秒级），不再有「打开等半分钟」。首次（无磁盘缓存）
  // 预热即全量解析全部日志，属一次性成本。
  // ⚠️ 必须用**异步分片版**：同步解析会把单进程事件循环长时间卡住，
  //    期间界面与所有其它请求全部无响应。分片版每 12ms 让出一次，宿主保持可用。
  // unref 使计时器不阻塞宿主进程退出（对常驻 dsh 无影响）。
  const warmupDelayMs = 5000;
  ctx.effect(
    () => {
      const timer = setTimeout(() => {
        void (async () => {
          try {
            const t0 = Date.now();
            const det = await collectSummaryDetailedAsync(Date.now(), false);
            ctx.logger?.info?.(`${name}: 预热完成（${det.filesSeen} 个日志文件，${Date.now() - t0}ms）`);
          } catch (err) {
            ctx.logger?.warn?.(err instanceof Error ? err : new Error(String(err)));
          }
        })();
      }, warmupDelayMs);
      timer.unref?.();
      return () => clearTimeout(timer);
    },
    `${name}: 启动预热`
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: "exact",
        path: ROUTE_PATH,
        handler: (req, res) => {
          if (!isLoopback(req)) {
            res.writeHead(403);
            res.end();
            return;
          }
          if (req.method !== "GET") {
            res.writeHead(405, { allow: "GET" });
            res.end();
            return;
          }
          const u = new URL(req.url, "http://127.0.0.1");
          const from = u.searchParams.get("from");
          const to = u.searchParams.get("to");
          const withHours = u.searchParams.get("hours") === "1";
          if ((from !== null) !== (to !== null)) {
            // 范围查询必须成对给 from/to，只给一个属于参数错误（此前会静默忽略）
            json(res, 400, { error: "from/to 必须同时提供" });
            return;
          }
          void Promise.resolve()
            .then(async () => {
              // 异步分片版：解析期间按时间片让出事件循环，宿主界面不被卡住（见 collect.js 说明）。
              // 同一请求只扫一次：范围查询复用这份扫描结果的 modelByDay（避免扫两遍）。
              const det = await collectSummaryDetailedAsync(Date.now(), from === null && withHours);
              if (from !== null && to !== null) return collectRange(from, to, det);
              if (det.filesFailed > 0) {
                return {
                  ...det.summary,
                  diag: { filesFailed: det.filesFailed, lastError: det.lastError ?? null, filesSeen: det.filesSeen }
                };
              }
              return det.summary;
            })
            .then((data) => json(res, 200, data))
            .catch((err) => {
              const status = err && err.status === 400 ? 400 : 500;
              ctx.logger?.warn?.(err instanceof Error ? err : new Error(String(err)));
              if (!res.headersSent) json(res, status, { error: status === 400 ? String(err.message) : "统计失败：内部错误" });
              else res.end();
            });
        }
      }),
    `${name}: ${ROUTE_PATH} route`
  );

  // GET/POST /token-stats/cfg —— 定价/套餐等配置的文件读写（文件为唯一权威，浏览器保存实时写回）。
  // GET：文件存在 → {found:true, cfg}；不存在/损坏 → {found:false, error?}。
  // POST：body 必须是 JSON 对象，原子写（临时文件 + rename），防中途失败损坏配置。
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: "exact",
        path: CFG_PATH,
        handler: (req, res) => {
          if (!isLoopback(req)) {
            res.writeHead(403);
            res.end();
            return;
          }
          if (req.method === "GET") {
            readFile(cfgFilePath(), "utf8")
              .then((text) => {
                try {
                  json(res, 200, { found: true, cfg: JSON.parse(text) });
                } catch (err) {
                  json(res, 200, { found: false, error: "配置文件不是合法 JSON：" + err.message });
                }
              })
              .catch(() => json(res, 200, { found: false }));
            return;
          }
          if (req.method === "POST") {
            readBody(req, CFG_BODY_LIMIT, (err, body) => {
              if (err) {
                json(res, 400, { error: "请求体读取失败或超限" });
                return;
              }
              let parsed;
              try {
                parsed = JSON.parse(body);
              } catch {
                json(res, 400, { error: "配置不是合法 JSON" });
                return;
              }
              if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
                json(res, 400, { error: "配置必须是 JSON 对象" });
                return;
              }
              const file = cfgFilePath();
              const tmp = file + ".tmp";
              try {
                fsSync.writeFileSync(tmp, JSON.stringify(parsed, null, 2), "utf8");
                rename(tmp, file)
                  .then(() => json(res, 200, { ok: true }))
                  .catch((e) => json(res, 500, { error: "写入失败：" + e.message }));
              } catch (e) {
                json(res, 500, { error: "写入失败：" + e.message });
              }
            });
            return;
          }
          res.writeHead(405, { allow: "GET, POST" });
          res.end();
        }
      }),
    `${name}: ${CFG_PATH} route`
  );
}

//#region 测试兼容再导出（自测脚本与本目录 verify 脚本从 lib/index.js 导入这些名字）

export { decompressFrames, parseLogFile } from "./host/parse.js";
export { aggregate, summarize, buildModelByDay } from "./host/aggregate.js";
export { collectSummaryDetailed, collectSummaryDetailedAsync, collectSummary, collectSummaryAsync, collectRange, __resetHostCachesForTest } from "./host/collect.js";
export { diskCacheStats, resetDiskCacheStats, cacheDir } from "./host/cache.js";

//#endregion
