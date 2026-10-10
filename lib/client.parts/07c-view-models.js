// 分片 07c · 视图：模型行与图表（PALETTE / colorOf / ColorChip / ModelRow / attachCosts / PieSvg / ChartCard）
/** 固定 12 色板：同一模型跨周期、柱状图与饼图间颜色一致（按模型名稳定映射）。 */
var PALETTE = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc948", "#b07aa1", "#ff9da7", "#9c755f", "#bab0ab", "#86bcb6", "#d37295"];

/** 用户指定的模型颜色覆盖表 { key: "#hex" }；由 syncColorOverrides 在分区页每次渲染前从配置同步。 */
var COLOR_OVERRIDES = {};

/** 每次渲染前同步覆盖表（渲染期直接调用，无 effect 延迟，改色立即反映到饼图/柱状条/图例）。 */
function syncColorOverrides(cfg) {
  COLOR_OVERRIDES = (cfg && cfg.colors) || {};
}

function colorOf(key) {
  var o = COLOR_OVERRIDES[key];
  if (o) return o;
  var hsh = 0;
  for (var i = 0; i < key.length; i++) hsh = (hsh * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTE[hsh % PALETTE.length];
}

/**
 * 可点击的模型颜色块 + 调色盘：悬浮（CSS :hover）预开，点击色块「钉住」面板（再点色块或点击面板外关闭），
 * 选色后面板保持打开便于连续试色。onPick(hex|null) 由调用方落配置。
 */
function ColorChip(props) {
  var openSt = useState(false);
  var open = openSt[0];
  var setOpen = openSt[1];
  var rootRef = useRef(null);
  useEffect(function () {
    if (!open) return;
    function onDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return function () {
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);
  var isOverride = !!(props.overrideHex);
  var swatches = PALETTE.map(function (hex) {
    return h("button", {
      key: hex,
      type: "button",
      className: "tks-color-swatch" + (props.color && props.color.toLowerCase() === hex ? " tks-color-on" : ""),
      style: { background: hex },
      title: hex,
      onClick: function () { props.onPick(hex); }
    });
  });
  return h(
    "div",
    { className: "tks-pick" + (open ? " tks-pick-open" : ""), "data-marker": "color", ref: rootRef },
    h("span", {
      className: "tks-chip tks-color-chip",
      style: { background: props.color, cursor: "pointer" },
      title: "点击钉住调色盘（再点关闭）；悬浮预览；点击/悬浮更换「" + props.modelKey + "」的图表颜色",
      onClick: function () { setOpen(!open); }
    }),
    h(
      "div",
      { className: "tks-pick-panel tks-color-panel" + (open ? " tks-panel-open" : "") },
      swatches,
      h(
        "label",
        { className: "tks-color-custom" },
        h("input", {
          type: "color",
          value: /^#[0-9a-fA-F]{6}$/.test(String(props.color)) ? props.color : "#4e79a7",
          title: "自定义颜色",
          onChange: function (e) { props.onPick(e.target.value); }
        }),
        h("span", { className: "tks-price-head" }, "自定义")
      ),
      isOverride
        ? h(
            "button",
            { type: "button", className: "tks-btn", style: { padding: "1px 8px", fontSize: "11px" }, onClick: function () { props.onPick(null); } },
            "恢复自动"
          )
        : null
    )
  );
}

/**
 * 模型行渲染（「累计」页签与「模型用量分布」图表卡共用）：
 * 名称、合计、缓存副行、调用次数、占比条；opts.tip 传入 setTip 时开启悬停明细气泡，
 * opts.color 为 true 时加色块与彩色占比条（图表卡样式），opts.cfg 提供单价表时副行附费用
 * （调用方需先在 m 上附 cost = costOf(cfg, m)，未配置单价的模型为 null 不显示）。
 */
function ModelRow(m, grand, opts, key) {
  var pct = grand > 0 ? Math.round((m.total / grand) * 1000) / 10 : 0;
  var cache = (m.cacheRead || 0) + (m.cacheWrite || 0);
  var hit = hitRatio(m.cacheRead, m.input, m.cacheWrite);
  var color = opts.color ? colorOf(m.key) : null;
  var nameChildren = opts.color
    ? [
        h(ColorChip, {
          key: "chip",
          modelKey: m.key,
          color: color,
          overrideHex: opts.cfg && opts.cfg.colors ? opts.cfg.colors[m.key] : null,
          onPick: opts.onSetColor ? function (hex) { opts.onSetColor(m.key, hex); } : undefined
        }),
        m.key
      ]
    : m.key;
  var sub = "含缓存读写 " + fmtTokens(cache) + " · 调用 " + (m.calls || 0) + " 次 · 占比 " + pct + "%" + (hit !== null ? " · 命中率 " + hit : "");
  var costTxt = opts.cfg && m.cost ? fmtCostMix(m.cost) : null;
  if (costTxt) sub += " · 费用 " + costTxt;
  var rowProps = { className: "tks-mrow" + (opts.tip ? " tks-crow" : ""), key: key };
  if (opts.tip) {
    rowProps.onMouseEnter = function (e) {
      anchorTip(opts.tip, e.currentTarget, m.key, m, opts.cfg);
    };
    rowProps.onMouseLeave = function () {
      opts.tip(null);
    };
  }
  return h(
    "div",
    rowProps,
    h(
      "div",
      { className: "tks-mtop" },
      h("span", { className: "tks-mname" }, nameChildren),
      h("span", { className: "tks-mval" }, fmtTokens(m.total))
    ),
    h("div", { className: "tks-msub2" }, sub),
    h(
      "div",
      { className: "tks-mbar" },
      h("div", { className: "tks-mbar-fill", style: { width: pct + "%", background: color || undefined } })
    )
  );
}

/** 给模型行附费用字段（双币种映射；未配置单价为 null；keyCosts 提供时为按时段单价精确聚合的费用，否则用默认单价估算）。 */
function attachCosts(rows, cfg, keyCosts) {
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (!priceOf(cfg, r.key)) {
      r.cost = null;
      continue;
    }
    r.cost = keyCosts ? keyCosts[r.key] || null : costOf(cfg, r);
  }
  return rows;
}

/** 按模型视图已并入「模型用量分布」卡片（原「累计」页签的独立模型列表已删除，避免同数据双柱状图）。 */

/** 环形饼图（circle + stroke-dasharray 分段，自 12 点方向顺时针），中心显示该周期总消耗。 */
function PieSvg(rows, grand) {
  var R = 54;
  var SW = 26;
  var C = 2 * Math.PI * R;
  var acc = 0;
  var circles = rows.map(function (m) {
    var seg = (m.total / grand) * C;
    var out = h("circle", {
      key: m.key,
      cx: 70,
      cy: 70,
      r: R,
      fill: "none",
      stroke: colorOf(m.key),
      "stroke-width": SW,
      "stroke-dasharray": seg.toFixed(2) + " " + C.toFixed(2),
      "stroke-dashoffset": String((-acc).toFixed(2)),
      transform: "rotate(-90 70 70)"
    });
    acc += seg;
    return out;
  });
  return h(
    "svg",
    { viewBox: "0 0 140 140", width: 150, height: 150, role: "img", "aria-label": "模型用量分布饼图" },
    circles,
    h("text", { x: 70, y: 66, "text-anchor": "middle", className: "tks-pie-total" }, fmtTokens(grand)),
    h("text", { x: 70, y: 82, "text-anchor": "middle", className: "tks-pie-cap" }, "token")
  );
}

/**
 * 「模型用量分布」卡片：跟随页签上下文——每日=今日、每周=本周、每月=本月、累计=全部历史；
 * 点击热力图任意方块后覆盖为该方块对应的日期/周/月区块
 * （数据来自宿主侧范围查询接口 /token-stats/summary?from=&to=，含各模型汇总与命中率）；
 * 再切页签即回到页签周期（切页签时由分区页清除所选区块）。
 * 「累计全部」直接用全局 models 明细（数据已在手，无需额外请求）。
 */
function ChartCard(summary, sel, rangeData, setTip, view, tab) {
  if (!summary) return null;
  var cfg = view.cfg;
  var rows = null;
  var label = "";
  var loading = false;
  var errorMsg = null;
  if (sel !== null) {
    label = sel.label;
    if (rangeData === null || rangeData.loading) {
      loading = true;
    } else if (rangeData.error) {
      errorMsg = rangeData.error;
    } else if (rangeData.models) {
      rows = rangeData.models;
    }
  } else if (tab === "daily") {
    label = "今日";
    rows = (summary.periodModels && summary.periodModels.today) || [];
  } else if (tab === "weekly") {
    label = "本周";
    rows = (summary.periodModels && summary.periodModels.week) || [];
  } else if (tab === "monthly") {
    label = "本月";
    rows = (summary.periodModels && summary.periodModels.month) || [];
  } else {
    label = "累计全部";
    rows = summary.models || [];
  }

  var title = h("div", null, h("span", { className: "tks-title" }, "模型用量分布（" + label + "）"));
  if (loading) {
    return h("div", { className: "tks-card" }, h("div", { className: "tks-head" }, title), h("p", { className: "tks-empty" }, "正在统计「" + label + "」区间…"));
  }
  if (errorMsg) {
    return h("div", { className: "tks-card" }, h("div", { className: "tks-head" }, title), h("p", { className: "tks-error" }, "该区间统计请求失败：" + errorMsg));
  }

  rows = rows.slice().sort(function (a, b) {
    return b.total - a.total;
  });
  var grand = 0;
  for (var i = 0; i < rows.length; i++) grand += rows[i].total;
  if (rows.length === 0 || grand <= 0) {
    return h(
      "div",
      { className: "tks-card" },
      h("div", { className: "tks-head" }, title),
      h("p", { className: "tks-empty" }, label + "暂无模型用量记录。")
    );
  }
  var totalInput = 0;
  var totalCacheRead = 0;
  var totalCacheWrite = 0;
  for (var j = 0; j < rows.length; j++) {
    totalInput += rows[j].input || 0;
    totalCacheRead += rows[j].cacheRead || 0;
    totalCacheWrite += rows[j].cacheWrite || 0;
  }
  var periodHit = hitRatio(totalCacheRead, totalInput, totalCacheWrite);
  // 「累计全部」页签行用 hours 明细精确聚合的费用（与原独立模型列表同口径）；
  // 其他周期行（今日/本周/本月/点击区块）的全局 keyCosts 口径不符，仍按默认单价估算
  attachCosts(rows, cfg, tab === "models" && !sel ? view.keyCosts : undefined);
  var periodCost = null;
  for (var k = 0; k < rows.length; k++) {
    if (rows[k].cost !== null) periodCost = addCostMap(periodCost, rows[k].cost);
  }
  var periodCostTxt = fmtCostMix(periodCost);
  return h(
    "div",
    { className: "tks-card" },
    h(
      "div",
      { className: "tks-head" },
      h(
        "div",
        null,
        h("span", { className: "tks-title" }, "模型用量分布（" + label + "）"),
        periodHit !== null ? h("span", { className: "tks-meta" }, "缓存命中率 " + periodHit) : null,
        periodCostTxt ? h("span", { className: "tks-meta" }, "模型总费用 " + periodCostTxt) : null
      )
    ),
    h(
      "div",
      { className: "tks-charts" },
      h(
        "div",
        { className: "tks-bars" },
          rows.map(function (m, idx) {
            return ModelRow(m, grand, { color: true, tip: setTip, cfg: cfg, onSetColor: view.onSetColor }, "b" + idx);
          })
      ),
      h(
        "div",
        { className: "tks-pie" },
        PieSvg(rows, grand),
        h(
          "div",
          { className: "tks-legend" },
          rows.map(function (m) {
            return h(
              "div",
              { className: "tks-litem", key: m.key },
              h(ColorChip, {
                modelKey: m.key,
                color: colorOf(m.key),
                overrideHex: cfg.colors ? cfg.colors[m.key] : null,
                onPick: view.onSetColor ? function (hex) { view.onSetColor(m.key, hex); } : undefined
              }),
              h("span", { className: "tks-lname", title: m.key }, m.key),
              h("span", null, Math.round((m.total / grand) * 1000) / 10 + "%")
            );
          })
        )
      )
    )
  );
}

