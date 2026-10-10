/**
 * dsh-token-stats · 宿主半共享小工具（日期/数字/哈希/回环闸）。
 * 全部为纯函数，无副作用；被 parse / aggregate / collect 与入口共同引用。
 */

import { createHash } from "node:crypto";

/** 一天的毫秒数。 */
export const DAY_MS = 86_400_000;

export function pad2(n) {
  const s = String(n);
  return s.length < 2 ? "0" + s : s;
}

/** epoch ms → 本地时区 YYYY-MM-DD（禁止 toISOString().slice(0,10)，那是 UTC，深夜会话会归错天）。 */
export function localDateStr(ms) {
  const d = new Date(ms);
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}

/** 本地 YYYY-MM-DD → 本地零点 epoch ms。 */
export function tsOfDay(dateStr) {
  const p = String(dateStr).split("-");
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])).getTime();
}

/** 用量数字清洗：非有限/非正一律归 0。 */
export function num(v) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** 缓冲区（或其前 n 字节）的 SHA-1，用于判定日志文件是"追加"还是"重写"。 */
export function sha1(buf, n) {
  return createHash("sha1").update(n === undefined ? buf : buf.subarray(0, n)).digest();
}

/** 是否来自回环地址（防局域网触发）。 */
export function isLoopback(req) {
  const addr = req.socket?.remoteAddress ?? "";
  return addr === "127.0.0.1" || addr === "::1" || addr === "::ffff:127.0.0.1";
}
