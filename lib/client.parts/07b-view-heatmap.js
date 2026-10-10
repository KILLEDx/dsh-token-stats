// 分片 07b · 视图：热力图方块与行列视图（renderCell / DailyView / RowView）
/** 渲染单个方块；cfg 提供双口径预算阈值，超标方块加 data-over 红圈。 */
function renderCell(setTip, c, phrase, key, onPick, cfg) {
  if (!c) return h("div", { key: key, className: "tks-cell tks-cell-none" });
  return h("div", {
    key: key,
    className: "tks-cell",
    "data-level": String(levelOf(c.total, c.bounds)),
    "data-over": cfg && (c.total > 0 || (c.cost || 0) > 0) && isOverBudget(c.cost || 0, c.total, cfg) ? "1" : null,
    "aria-label": phrase + (c.total > 0 ? "：" + fmtTokens(c.total) + " token" : "：无 token 用量"),
    onMouseEnter: function (e) {
      anchorTip(setTip, e.currentTarget, phrase, c, cfg);
    },
    onMouseLeave: function () {
      setTip(null);
    },
    // 点击方块 → 下方图表切换为该方块对应时间区块
    onClick: onPick && c.range ? function () {
      onPick(c.range.from, c.range.to, c.range.label);
    } : undefined
  });
}

function DailyView(setTip, days, onPick, view) {
  var built = buildDaily(days, view.dayCost);
  var flat = [];
  for (var ci = 0; ci < built.columns.length; ci++) {
    var col = built.columns[ci];
    for (var ri = 0; ri < col.length; ri++) {
      if (col[ri]) flat.push(col[ri]);
    }
  }
  var bounds = levelBounds(flat);
  var cols = built.columns.map(function (col, ci2) {
    return h(
      "div",
      { className: "tks-col", key: ci2 },
      col.map(function (c, ri2) {
        if (!c) return renderCell(setTip, null, "", ci2 + "-" + ri2, null, view.cfg);
        c.bounds = bounds;
        return renderCell(setTip, c, md(c.date), ci2 + "-" + ri2, onPick, view.cfg);
      })
    );
  });
  return h(
    "div",
    null,
    h(
      "div",
      { className: "tks-months" },
      built.labels.map(function (l) {
        return h("span", { className: "tks-month", key: l.col, style: { left: l.col * 14 + "px" } }, l.text);
      })
    ),
    h("div", { className: "tks-grid" }, cols)
  );
}

function RowView(setTip, cells, phraseOf, onPick, view) {
  var bounds = levelBounds(cells);
  return h(
    "div",
    { className: "tks-row" },
    cells.map(function (c, i) {
      c.bounds = bounds;
      return renderCell(setTip, c, phraseOf(c, i), "c" + i, onPick, view.cfg);
    })
  );
}

