// 分片 10b · 悬浮小窗：网格与色阶（buildMonthGrid / buildYearGrid / levelBounds4 / levelOf4 / legendSwatch）
/**
 * 主窗网格：GitHub 式贡献图——**行 = 星期（周一～周日，7 行）、列 = 周**，按**列**填充。
 *
 * 起始日 = 今天所在周的周一往前推 (weeks−1) 周；首列恒为周一那周、末列恒为本周，
 * 格子数恒为 `weeks × 7`（尾部未来日按 isFuture 隐藏，不补空）。
 * CSS 用 `grid-auto-flow:column` + `grid-template-rows:repeat(7, cell)`，使 d=0→(行0,列0)、
 * d=7→(行0,列1)……即「同一行恒为同一星期」，与左侧竖排星期标严格对应。
 * @param days 日序列。
 * @param weeks 周数（默认 FW_WEEKS = 5）。
 * @returns { cells, bounds, weeks }
 */
function buildMonthGrid(days, weeks) {
  var out = { cells: [], bounds: [1, 1, 1, 1], weeks: weeks };
  if (!days || days.length === 0) return out;
  var n = Math.max(1, Math.floor(weeks || FW_WEEKS));
  var byDate = {};
  for (var i = 0; i < days.length; i++) byDate[days[i].date] = days[i];
  var last = days[days.length - 1].date;
  var thisMon = mondayOf(last);
  var startDate = addDays(thisMon, -(n - 1) * 7);
  var cells = [];
  var active = [];
  var total = n * 7;
  for (var d = 0; d < total; d++) {
    var key = dsOfDate(addDays(startDate, d));
    var rec = byDate[key];
    var cell = {
      date: key,
      total: rec ? rec.total : 0,
      input: rec ? rec.input : 0,
      output: rec ? rec.output : 0,
      cacheRead: rec ? rec.cacheRead : 0,
      cacheWrite: rec ? rec.cacheWrite : 0,
      empty: false
    };
    if (key <= last) active.push(cell); // 未来日不参与色阶分位计算
    cells.push(cell);
  }
  out.cells = cells;
  out.weeks = n;
  out.bounds = levelBounds4(active);
  return out;
}

/**
 * 完整历史网格（展开面板）：按自然年铺 53 列 × 7 行的贡献图。
 * 数据源同上；行=周一～周日，列=周。
 * @param days 日序列。
 * @returns { cells, bounds, months: [{col,label}], weeks }
 */
function buildYearGrid(days) {
  var out = { cells: [], bounds: [1, 1, 1, 1], months: [], weeks: 0 };
  if (!days || days.length === 0) return out;
  var byDate = {};
  for (var i = 0; i < days.length; i++) byDate[days[i].date] = days[i];
  var first = days[0].date;
  var last = days[days.length - 1].date;
  var startMon = mondayOf(first);
  var endMon = mondayOf(last);
  var cells = [];
  var active = [];
  var months = [];
  var prevMonth = -1;
  var col = 0;
  for (var mon = new Date(startMon.getTime()); mon.getTime() <= endMon.getTime(); mon = addDays(mon, 7)) {
    for (var r = 0; r < 7; r++) {
      var d = addDays(mon, r);
      var key = dsOfDate(d);
      if (key < first || key > last) {
        cells.push({ empty: true, date: "" });
        continue;
      }
      var rec = byDate[key];
      var cell = {
        date: key,
        total: rec ? rec.total : 0,
        input: rec ? rec.input : 0,
        output: rec ? rec.output : 0,
        cacheRead: rec ? rec.cacheRead : 0,
        cacheWrite: rec ? rec.cacheWrite : 0,
        empty: false
      };
      active.push(cell);
      cells.push(cell);
    }
    var mid = addDays(mon, 3);
    if (mid.getMonth() !== prevMonth) {
      months.push({ col: col, label: mid.getMonth() + 1 + "月" });
      prevMonth = mid.getMonth();
    }
    col++;
  }
  out.cells = cells;
  out.weeks = col;
  out.months = months;
  out.bounds = levelBounds4(active);
  return out;
}

/**
 * 五档色阶阈值（四分位）：对非零日取 25/50/75% 分位 + 最大值。
 *
 * 从三分位升级到四分位（GitHub 式 5 档），在用量波动大时层次更清晰；
 * 仍按「观测到的非零日」自适应，避免固定阈值让低用量日永远落在最低档。
 * @param cells 单元格数组（含 total）。
 * @returns [t1,t2,t3,t4] 四个阈值；无数据时返回全 1。
 */
function levelBounds4(cells) {
  var nz = [];
  for (var i = 0; i < cells.length; i++) {
    if (cells[i] && cells[i].total > 0) nz.push(cells[i].total);
  }
  if (nz.length === 0) return [1, 1, 1, 1];
  nz.sort(function (a, b) {
    return a - b;
  });
  var at = function (p) {
    return nz[Math.min(nz.length - 1, Math.max(0, Math.round(p * (nz.length - 1))))];
  };
  var t1 = at(0.25);
  var t2 = at(0.5);
  var t3 = at(0.75);
  // 全等值时（所有非零日相同）避免 5 档全挤在 1 档：把阈值抬到该值，使它们落在中档
  if (t1 === t3) return [t1, t1, t1, t1];
  return [t1, t2, t3, nz[nz.length - 1]];
}

/** 五档判定：0=无用量，1~4 依次加深（阈值来自 levelBounds4）。 */
function levelOf4(v, bounds) {
  if (!(v > 0)) return 0;
  if (v <= bounds[0]) return 1;
  if (v <= bounds[1]) return 2;
  if (v <= bounds[2]) return 3;
  return 4;
}

/**
 * 图例色块。
 *
 * ⚠️ **色块自带全部几何**（尺寸/圆角/背景 inline 写入），**不复用网格的 `.tks-fw-cell`**：
 * 复用会让色块依赖图例不控制的 CSS 变量与层叠，导致图例中段无样式呈现
 * （曾表现为「少/多 中间一片空白」）。色块是**美术件**，自己带几何最稳。
 * @param level 色档 0~4。
 * @returns 色块元素。
 */
function legendSwatch(level) {
  var size = 10;
  return h("span", {
    className: "tks-fw-swatch",
    "data-level": String(level),
    "aria-hidden": "true",
    style: {
      display: "inline-block",
      flex: "0 0 auto",
      width: size + "px",
      height: size + "px",
      minWidth: size + "px",
      minHeight: size + "px",
      borderRadius: "2.5px",
      boxSizing: "border-box"
    }
  });
}

