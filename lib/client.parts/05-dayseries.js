// 分片 05/11 · 日序列派生（周 / 月视图与费用口径档位都由稠密日序列在浏览器端算）
function tsOfDay(dateStr) {
  var p = String(dateStr).split("-");
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])).getTime();
}

function dsOfDate(d) {
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}

function addDays(d, n) {
  var x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}

/** 该日期所在周的周一（本地时区）。 */
function mondayOf(dateStr) {
  var t = tsOfDay(dateStr);
  var d = new Date(t);
  var dow = (d.getDay() + 6) % 7; // 周一=0
  return addDays(d, -dow);
}

/** 每日视图：列=周、行=周一～周日；月份标签标在月份切换的那一列。dayCost 提供每日费用（费用口径）。 */
function buildDaily(days, dayCost) {
  if (!days || days.length === 0) return { labels: [], columns: [] };
  var first = days[0];
  var last = days[days.length - 1];
  var byDate = {};
  for (var i = 0; i < days.length; i++) byDate[days[i].date] = days[i];
  var columns = [];
  var labels = [];
  var prevMonth = -1;
  for (var mon = mondayOf(first.date); mon.getTime() <= mondayOf(last.date).getTime(); mon = addDays(mon, 7)) {
    var col = [];
    for (var r = 0; r < 7; r++) {
      var d = addDays(mon, r);
      var key = dsOfDate(d);
      if (key < first.date || key > last.date) {
        col.push(null); // 范围外占位，保持行列对齐
        continue;
      }
      var rec = byDate[key];
      col.push({
        date: key,
        total: rec ? rec.total : 0,
        cost: dayCost ? dayCost[key] || null : null,
        cache: rec ? rec.cacheRead + rec.cacheWrite : 0,
        cacheRead: rec ? rec.cacheRead : 0,
        cacheWrite: rec ? rec.cacheWrite : 0,
        input: rec ? rec.input : 0,
        output: rec ? rec.output : 0,
        range: { from: key, to: key, label: md(key) } // 点击联动：该方块 = 该自然日
      });
    }
    var mid = addDays(mon, 3);
    if (mid.getMonth() !== prevMonth) {
      labels.push({ col: columns.length, text: mid.getMonth() + 1 + "月" });
      prevMonth = mid.getMonth();
    }
    columns.push(col);
  }
  return { labels: labels, columns: columns };
}

function blankAgg(start, end) {
  return { start: start, end: end, total: 0, cost: null, cache: 0, cacheRead: 0, cacheWrite: 0, input: 0, output: 0 };
}

/** 每周视图：一个方块 = 一个自然周（周一为起点）合计。 */
function buildWeekly(days, dayCost) {
  if (!days || days.length === 0) return [];
  var first = days[0];
  var last = days[days.length - 1];
  var byDate = {};
  for (var i = 0; i < days.length; i++) byDate[days[i].date] = days[i];
  var out = [];
  for (var mon = mondayOf(first.date); mon.getTime() <= mondayOf(last.date).getTime(); mon = addDays(mon, 7)) {
    var agg = blankAgg(new Date(mon.getTime()), null);
    for (var r = 0; r < 7; r++) {
      var d = addDays(mon, r);
      var key = dsOfDate(d);
      if (key < first.date || key > last.date) continue;
      var rec = byDate[key];
      if (!rec) continue;
      agg.total += rec.total;
      agg.cost = addCostMap(agg.cost, dayCost ? dayCost[key] : null);
      agg.cache += rec.cacheRead + rec.cacheWrite;
      agg.cacheRead += rec.cacheRead;
      agg.cacheWrite += rec.cacheWrite;
      agg.input += rec.input;
      agg.output += rec.output;
      if (agg.end === null || d.getTime() > agg.end.getTime()) agg.end = new Date(d.getTime());
    }
    var endD = addDays(mon, 6);
    agg.range = { from: dsOfDate(mon), to: dsOfDate(endD), label: md(dsOfDate(mon)) + "～" + md(dsOfDate(endD)) }; // 点击联动：该方块 = 整个自然周
    out.push(agg);
  }
  return out;
}

/** 每月视图：一个方块 = 一个自然月合计。 */
function buildMonthly(days, dayCost) {
  if (!days || days.length === 0) return [];
  var sums = {}; // "YYYY-MM" -> agg
  for (var i = 0; i < days.length; i++) {
    var r = days[i];
    var mk = r.date.slice(0, 7);
    var a = sums[mk];
    if (a === undefined) {
      a = { ym: mk, total: 0, cost: null, cache: 0, cacheRead: 0, cacheWrite: 0, input: 0, output: 0 };
      sums[mk] = a;
    }
    a.total += r.total;
    a.cost = addCostMap(a.cost, dayCost ? dayCost[r.date] : null);
    a.cache += r.cacheRead + r.cacheWrite;
    a.cacheRead += r.cacheRead;
    a.cacheWrite += r.cacheWrite;
    a.input += r.input;
    a.output += r.output;
  }
  var first = new Date(tsOfDay(days[0].date));
  var last = new Date(tsOfDay(days[days.length - 1].date));
  var out = [];
  var cur = new Date(first.getFullYear(), first.getMonth(), 1);
  var endM = new Date(last.getFullYear(), last.getMonth(), 1);
  while (cur <= endM) {
    var key = cur.getFullYear() + "-" + pad2(cur.getMonth() + 1);
    var hit = sums[key];
    var lastDay = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
    out.push({
      label: cur.getFullYear() + "年" + (cur.getMonth() + 1) + "月",
      total: hit ? hit.total : 0,
      cost: hit ? hit.cost : null,
      cache: hit ? hit.cache : 0,
      cacheRead: hit ? hit.cacheRead : 0,
      cacheWrite: hit ? hit.cacheWrite : 0,
      input: hit ? hit.input : 0,
      output: hit ? hit.output : 0,
      range: { from: dsOfDate(cur), to: cur.getFullYear() + "-" + pad2(cur.getMonth() + 1) + "-" + pad2(lastDay), label: cur.getFullYear() + "年" + (cur.getMonth() + 1) + "月" } // 点击联动：该方块 = 整个自然月
    });
    cur.setMonth(cur.getMonth() + 1);
  }
  return out;
}

/** 非零值三分位切档阈值；getV 取值函数（token 口径取 total，费用口径取 cost）。 */
function levelBounds(cells, getV) {
  var gv = getV || function (c) { return c.total; };
  var nz = [];
  for (var i = 0; i < cells.length; i++) {
    var c = cells[i];
    if (c && gv(c) > 0) nz.push(gv(c));
  }
  if (nz.length === 0) return [1, 1];
  nz.sort(function (a, b) {
    return a - b;
  });
  return [nz[Math.floor(((nz.length - 1) * 1) / 3)], nz[Math.floor(((nz.length - 1) * 2) / 3)]];
}

function levelOf(v, bounds) {
  if (!(v > 0)) return 0;
  if (v <= bounds[0]) return 1;
  if (v <= bounds[1]) return 2;
  return 3;
}
