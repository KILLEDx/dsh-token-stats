// 分片 07a · 视图：指标卡与区间聚合（TABS / MetricCard / StreakRow / scope* / ScopeCards）
// 分片 07/11 · 视图渲染（指标卡 / 热力图 / 模型行 / 图表卡 / 会话 Top / 活动卡）
// view = { cfg: configOf 结果, dayCost: {日期: {CNY,USD}} | null }（费用为双币种分账映射，不做汇率折算）
var TABS = [
  ["daily", "每日"],
  ["weekly", "每周"],
  ["monthly", "每月"],
  ["models", "累计"]
];

function MetricCard(props) {
  return h(
    "div",
    { className: "tks-metric", key: props.key },
    h("div", { className: "tks-num" }, props.num),
    h("div", { className: "tks-mlabel" }, props.label),
    props.sub ? h("div", { className: "tks-msub" }, props.sub) : null
  );
}

/** 置顶行：连续天数两项（全局口径，不随时间页签变化）。 */
function StreakRow(totals) {
  return h(
    "div",
    { className: "tks-streaks" },
    h(
      "div",
      { className: "tks-streak", key: "cur" },
      h("span", { className: "tks-streak-label" }, "当前连续天数"),
      h("span", { className: "tks-streak-num" }, fmtDays(totals.currentStreak))
    ),
    h(
      "div",
      { className: "tks-streak", key: "max" },
      h("span", { className: "tks-streak-label" }, "最长连续天数"),
      h("span", { className: "tks-streak-num" }, fmtDays(totals.maxStreak))
    )
  );
}

/** 通用区间指标聚合：统计稠密日序列中 date ∈ [fromKey, toKey] 的合计/峰值/最长单轮。 */
function scopeMetrics(days, fromKey, toKey, label) {
  var total = 0;
  var cache = 0;
  var peak = 0;
  var peakCache = 0;
  var lt = 0;
  if (days) {
    for (var i = 0; i < days.length; i++) {
      var day = days[i];
      if (day.date < fromKey || (toKey !== null && day.date > toKey)) continue;
      total += day.total;
      cache += (day.cacheRead || 0) + (day.cacheWrite || 0);
      if (day.total > peak) {
        peak = day.total;
        peakCache = (day.cacheRead || 0) + (day.cacheWrite || 0);
      }
      if ((day.maxTurn || 0) > lt) lt = day.maxTurn || 0;
    }
  }
  return { label: label, total: total, cache: cache, peak: peak, peakCache: peakCache, longestTurn: lt };
}

/**
 * 三卡的时间范围：每日=今日、每周=本周（周一起）、每月=本月（1 号起）；
 * 累计/按模型页签返回 null（用全局 totals）。
 */
function scopeRange(days, tab) {
  if (!days || days.length === 0 || tab === "models") return null;
  var last = days[days.length - 1];
  var startKey;
  if (tab === "daily") {
    startKey = last.date;
  } else if (tab === "weekly") {
    startKey = dsOfDate(mondayOf(last.date));
  } else {
    var t = tsOfDay(last.date);
    var d = new Date(t);
    startKey = dsOfDate(new Date(d.getFullYear(), d.getMonth(), 1));
  }
  return scopeMetrics(days, startKey, null, tab === "daily" ? "今日" : tab === "weekly" ? "本周" : "本月");
}

/**
 * 点击色块选中的任意日期范围 [from, to]（含端点）的指标：从稠密日序列直接计算，无需额外请求；
 * label 用点击方块的日期分布文案（如「8月17日～8月23日」）。
 */
function scopeFromSel(days, sel) {
  return scopeMetrics(days, sel.from, sel.to, sel.label);
}

/**
 * 三张指标卡：
 * 卡1「累计 Token」默认随页签周期取值（每日=今日、每周=本周、每月=本月；「累计」页签=全部历史全局总量），
 * 点击热力图方块后随所选日期区块取值并标注该区块（scope 为 scopeFromSel 结果，含该区块 total/cache，
 * 标签如「累计 Token（8月17日～8月23日）」；scope 为 null 时回退全局总量）；
 * 卡2/卡3 有周期范围时随页签取值并带「（今日/本周/本月）」后缀，按模型页签回退全局。
 */
function ScopeCards(scope, totals) {
  return h(
    "div",
    { className: "tks-metrics" },
    h(MetricCard, {
      key: "total",
      num: fmtTokens(scope ? scope.total : totals.grandTotal),
      label: "累计 Token" + (scope ? "（" + scope.label + "）" : "（全部）"),
      sub: "含缓存读写 " + fmtTokens(scope ? scope.cache : totals.grandCache)
    }),
    h(MetricCard, {
      key: "peak",
      num: fmtTokens(scope ? scope.peak : totals.peakDay),
      label: "峰值 Token" + (scope ? "（" + scope.label + "）" : ""),
      sub: "含缓存读写 " + fmtTokens(scope ? scope.peakCache : totals.peakDayCache)
    }),
    h(MetricCard, {
      key: "turn",
      num: fmtDuration(scope ? scope.longestTurn : totals.longestTurnMillis),
      label: "最长单轮耗时" + (scope ? "（" + scope.label + "）" : "")
    })
  );
}

