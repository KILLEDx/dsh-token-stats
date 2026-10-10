// 分片 03/11 · 常量与格式化
var POLL_MS = 20000; // 可见期间轮询间隔；日志批量落盘有延迟，20 秒已足够"准实时"

/** 中文单位数字：亿固定 2 位小数（如 4.00亿），万 1 位小数去尾零，其余整数。 */
function fmtTokens(n) {
  if (!(typeof n === "number" && n > 0)) return "0";
  if (n >= 1e8) return (n / 1e8).toFixed(2) + "亿";
  if (n >= 1e4) {
    var w = (n / 1e4).toFixed(1);
    if (w.slice(-2) === ".0") w = w.slice(0, -2);
    return w + "万";
  }
  return String(Math.round(n));
}

/**
 * 紧凑数字（**仅停靠细条使用**）：4 位有效数字、去小数。
 *
 * ★
 * 细条竖排时每多一个字就多占约 10px 竖向高度（直接等于遮挡量），故细条只保留 4 位有效数字：
 * `3680.1万 → 3680万`、`1.23亿 → 1.2亿`、`4567 → 4567`、`123 → 123`。
 * ⚠️ 精度代价约 0.1 万（≈1000 token）——**只在细条这一处降精度**，
 *    折叠态与完整卡片仍用 `fmtTokens` 全精度，且 `title`/`aria-label` 也给全精度值，
 *    故「一眼看个大概、悬停/展开看准确值」两条路径都在。
 * @param n token 数。
 */
function fmtTokensCompact(n) {
  if (!(typeof n === "number" && n > 0)) return "0";
  if (n >= 1e8) {
    var yi = (n / 1e8).toFixed(1);
    if (yi.slice(-2) === ".0") yi = yi.slice(0, -2);
    return yi + "亿";
  }
  if (n >= 1e4) return Math.round(n / 1e4) + "万";
  return String(Math.round(n));
}

/** 墙钟时长：「X小时X分」，不足 1 小时「X分钟」，不足 1 分钟「<1分钟」。 */
function fmtDuration(ms) {
  var mins = Math.round((ms || 0) / 60000);
  if (mins < 1) return "<1分钟";
  var hr = Math.floor(mins / 60);
  var m = mins % 60;
  return hr > 0 ? hr + "小时" + m + "分" : m + "分钟";
}

/** 毫秒 → 首 token 延迟显示：≥60 秒「X分X秒」，≥1 秒「X.X秒」，否则「<1秒」。 */
function fmtSec(ms) {
  if (!(typeof ms === "number" && ms > 0)) return null;
  if (ms >= 60000) {
    var m = Math.floor(ms / 60000);
    var s = Math.round((ms % 60000) / 1000);
    return m + "分" + (s > 0 ? s + "秒" : "");
  }
  if (ms >= 1000) return (ms / 1000).toFixed(1) + "秒";
  return "<1秒";
}

/** token/秒：≥100 取整，否则保留 1 位小数（无有效值返回 null）。 */
function fmtTps(tps) {
  if (!(typeof tps === "number" && tps > 0)) return null;
  return tps >= 100 ? String(Math.round(tps)) : String(Math.round(tps * 10) / 10);
}

function fmtDays(n) {
  return (n || 0) + "天";
}

function pad2(n) {
  var s = String(n);
  return s.length < 2 ? "0" + s : s;
}

/** "YYYY-MM-DD" → "M月D日"。 */
function md(dateStr) {
  var p = String(dateStr).split("-");
  return Number(p[1]) + "月" + Number(p[2]) + "日";
}
