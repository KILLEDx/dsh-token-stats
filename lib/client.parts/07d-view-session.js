// 分片 07d · 视图：配额卡 / 会话 Top / 活动卡（QuotaCard / renderQuotaAlerts / perfTextOf / SessionCard / ActivityCard）
/**
 * 「套餐配额」卡片：每个套餐一组（订阅含的多条限额逐行展示）。
 * 行类型（computeQuotas 的 kind）：plan=通用限额；model=模型额度明细（共享总额度池内的单模型行）；
 * sum=共享总额度汇总（总使用率 = 各模型使用率相加，可 >100%）。
 * 单行 ≥80% 黄色预警、≥100% 红色超限（超限同时进顶部告警条）。
 */
function QuotaCard(quotaGroups, currency) {
  if (!quotaGroups || quotaGroups.length === 0) return null;
  function round1(v) { return Math.round(v * 10) / 10; }
  /** 通用限额行：已用 = 外部基线（填写的当前已用% − 保存时锚点）+ 本机统计。 */
  function planLine(r, ri) {
    var state = r.ratio >= 1 ? " tks-q-over" : r.ratio >= 0.8 ? " tks-q-warn" : "";
    var pct = Math.round(r.ratio * 1000) / 10;
    var remainPct = Math.round(Math.max(0, 1 - r.ratio) * 1000) / 10;
    var cur = r.unit === "cost" && r.cur ? r.cur : currency; // 金额限额按其固定币种显示
    var ext = Math.max(0, (r.basePct || 0) - (r.anchorPct || 0));
    var sub =
      "已用 " + pct + "%（" + (ext > 0 ? "外部基线 " + round1(ext) + "% + " : "") + "本机统计 " + fmtQuota(r.unit, r.usage, cur) + "）· " +
      (r.ratio >= 1 ? "已超限" : "剩余 " + remainPct + "%");
    if (r.ratio < 1 && ext <= 0) sub += "（" + fmtQuota(r.unit, r.limit - r.usage, cur) + "）";
    if (r.unit === "cost" && r.unpricedCount > 0) sub += " · 有 " + r.unpricedCount + " 个范围内模型未配价，金额统计不完整";
    return h(
      "div",
      { className: "tks-qlimit" + state, key: ri },
      h(
        "div",
        { className: "tks-mtop" },
        h("span", { className: "tks-qlabel" }, r.periodLabel + " · " + QUOTA_UNIT_LABELS[r.unit] + (r.unit === "cost" ? "（" + (CUR_SYMBOL[r.cur] || "") + "）" : "")),
        h("span", { className: "tks-mval" }, fmtQuota(r.unit, r.usage, cur) + " / " + fmtQuota(r.unit, r.limit, cur))
      ),
      h("div", { className: "tks-msub2" }, sub),
      h(
        "div",
        { className: "tks-mbar" },
        h("div", { className: "tks-mbar-fill" + state, style: { width: Math.min(100, pct) + "%" } })
      )
    );
  }
  /** 模型额度明细行（共享总额度池内）：使用率 = 该模型已用 / 该模型额度；显示 provider 尾段短名，悬停看完整 key。 */
  function modelLine(r, ri) {
    var state = r.ratio >= 1 ? " tks-q-over" : r.ratio >= 0.8 ? " tks-q-warn" : "";
    var pct = Math.round(r.ratio * 1000) / 10;
    var cur = r.unit === "cost" && r.cur ? r.cur : currency;
    var ext = Math.max(0, (r.basePct || 0) - (r.anchorPct || 0));
    var sub =
      "本机 " + fmtQuota(r.unit, r.usage, cur) + " / " + fmtQuota(r.unit, r.limit, cur) +
      (ext > 0 ? " · 外部基线 " + round1(ext) + "%" : "") +
      (r.unpriced ? " · 未配价，金额未计入" : "");
    return h(
      "div",
      {
        className: "tks-qitem" + state,
        key: "m" + ri,
        title: "模型：" + r.key + " —— 共享总额度池：该模型使用率 " + pct + "%（外部基线/当前已用 + 本机用量÷该模型额度），各模型使用率相加即总使用率"
      },
      h(
        "div",
        { className: "tks-mtop" },
        h("span", { className: "tks-qlabel tks-qkey" }, shortModelName(r.key)),
        h("span", { className: "tks-mval tks-qval-sm" }, pct + "%")
      ),
      h("div", { className: "tks-msub2" }, sub),
      h(
        "div",
        { className: "tks-mbar" },
        h("div", { className: "tks-mbar-fill" + state, style: { width: Math.min(100, pct) + "%" } })
      )
    );
  }
  /** 共享总额度汇总行：总使用率 = 各模型使用率相加（可 >100%）。 */
  function sumLine(r, ri) {
    var state = r.ratio >= 1 ? " tks-q-over" : r.ratio >= 0.8 ? " tks-q-warn" : "";
    var pct = Math.round(r.ratio * 1000) / 10;
    var sub =
      "共享总额度池（" + r.count + " 个模型）· 总使用率 = 各模型使用率相加 · 最高单项 " + Math.round(r.maxRatio * 1000) / 10 + "%" +
      (r.ratio >= 1 ? " · 额度已用尽" : "");
    return h(
      "div",
      { className: "tks-qlimit" + state, key: "s" + ri },
      h(
        "div",
        { className: "tks-mtop" },
        h("span", { className: "tks-qlabel" }, r.periodLabel + " · 共享总额度（" + QUOTA_UNIT_LABELS[r.unit] + (r.unit === "cost" ? "（" + (CUR_SYMBOL[r.cur] || "") + "）" : "") + "）"),
        h("span", { className: "tks-mval" }, "已用 " + pct + "%")
      ),
      h("div", { className: "tks-msub2" }, sub),
      h(
        "div",
        { className: "tks-mbar" },
        h("div", { className: "tks-mbar-fill" + state, style: { width: Math.min(100, pct) + "%" } })
      )
    );
  }
  var groups = quotaGroups.map(function (g, gi) {
    var lines = [];
    g.rows.forEach(function (r, ri) {
      if (r.kind === "sum") lines.push(sumLine(r, ri));
      else if (r.kind === "model") lines.push(modelLine(r, ri));
      else lines.push(planLine(r, ri));
    });
    return h(
      "div",
      { className: "tks-pblock", key: gi },
      h("div", { className: "tks-mname" }, g.plan.name),
      lines
    );
  });
  return h(
    "div",
    { className: "tks-card" },
    h("div", { className: "tks-head" }, h("span", { className: "tks-title" }, "套餐配额")),
    h("div", { className: "tks-models" }, groups)
  );
}

/** 套餐超限告警条：通用限额逐条提示；共享总额度池按汇总行提示并列出超限模型（明细行不重复告警）。 */
function renderQuotaAlerts(quotaGroups) {
  if (!quotaGroups) return null;
  var alerts = [];
  for (var i = 0; i < quotaGroups.length; i++) {
    var g = quotaGroups[i];
    for (var j = 0; j < g.rows.length; j++) {
      var r = g.rows[j];
      if (r.kind === "sum") {
        if (r.ratio >= 1) {
          alerts.push(
            h(
              "p",
              { className: "tks-alert", key: i + "-s" + j },
              "⚠ 套餐「" + g.plan.name + "」" + r.periodLabel + "共享总额度已用 " + Math.round(r.ratio * 1000) / 10 + "%（超限模型：" + (r.overKeys && r.overKeys.length > 0 ? r.overKeys.join("、") : "—") + "），额度已用尽。"
            )
          );
        }
      } else if (r.kind === "plan" && r.ratio >= 1) {
        alerts.push(
          h(
            "p",
            { className: "tks-alert", key: i + "-" + j },
            "⚠ 套餐「" + g.plan.name + "」" + r.periodLabel + "已用 " + fmtQuota(r.unit, r.usage, r.cur) + " / " + fmtQuota(r.unit, r.limit, r.cur) + "（" + QUOTA_UNIT_LABELS[r.unit] + "），已超限。"
          )
        );
      }
    }
  }
  return alerts.length > 0 ? alerts : null;
}

/**
 * 会话级性能明细文本（悬停气泡用）：用时 / 工具次数+用时 / 首字（TTFT）/ 输出（TPS）。
 * 行内只显示「用时」，其余明细经此函数进气泡（方案A）；无样本自动省略。
 */
function perfTextOf(r) {
  var pp = [];
  if (typeof r.turnMs === "number" && r.turnMs > 0) pp.push("用时 " + fmtDuration(r.turnMs));
  if ((r.toolCalls || 0) > 0) {
    pp.push("工具 " + r.toolCalls + " 次" + (r.toolMs > 0 ? "/" + fmtDuration(r.toolMs) : ""));
  }
  var tt = fmtSec(r.ttftMs);
  if (tt) pp.push("首字 " + tt);
  var tp = fmtTps(r.tps);
  if (tp) pp.push("输出 " + tp + " T/s");
  return pp.length > 0 ? pp.join(" · ") : null;
}

/** 会话 Top 视图模式：综合=主会话折叠子代理树（父行合计+拆分标识）；全部=主/子平铺混合（原视图）；主对话/子对话=按角色过滤。 */
var SESSION_VIEWS = [
  ["combined", "综合"],
  ["all", "全部"],
  ["main", "主对话"],
  ["sub", "子对话"]
];

/**
 * 「会话 Top」下钻卡片：展示所选日期区块（默认本周）内消耗最高的会话。
 * 视图按钮（卡片头部，复用 tks-tabs 样式）：
 * - 综合（默认）：只列主会话，子代理按 parentSession 递归折叠到父会话下（点父行展开/收起，嵌套逐层缩进）；
 *   父行显示合计 = 主自身 + Σ 后代子代理，并标识拆分「合计 X（主 Y · 子 Z）」（官方统计不合并数字，本视图为自定义合计）；
 *   无父可挂的子代理独立成行（带「子」徽标）。
 * - 全部：主/子平铺混合（原视图，total 降序）；主对话：只列主会话；子对话：只列子代理会话。
 * 条数上限前 10：综合按顶层行计（展开的子行不计入），其余视图按行计。
 * 行内显示会话标题（日志 session/title 事件 last-wins）；子代理行优先用 subagent/descriptor 的任务 label，
 * 无 label 回退标题/短 ID；悬停气泡含明细 + 角色信息（父会话/子代理任务）；行尾复制按钮照旧。
 */
function SessionCard(props) {
  // 必须由 11-section 以 React 元素方式渲染（h(SessionCard, {...})）——直接函数调用会把本组件
  // 的 hooks 挂到调用方（TokenStatsSection）上，条件渲染时 hooks 数量变化 → 真实 React 崩溃整页空白。
  // hooks 必须位于任何条件返回之前（渲染顺序稳定）
  var summary = props.summary;
  var sel = props.sel;
  var setTip = props.setTip;
  var cfg = props.cfg;
  var tab = props.tab; // 页签（daily/weekly/monthly/models）：无热力图选中时随页签取范围（每日=今日/每周=本周/每月=本月/累计=全部）
  var viewState = react.useState("combined");
  var view = viewState[0];
  var setView = viewState[1];
  var openState = react.useState({});
  var open = openState[0];
  var setOpen = openState[1];

  var all = summary.sessionByDay || [];
  var days = summary.days || [];
  var label, fromKey, toKey;
  if (sel) {
    // 热力图点击选中的日期区块优先（点色块覆盖为该区块）
    fromKey = sel.from;
    toKey = sel.to;
    label = sel.label;
  } else if (days.length > 0) {
    // 无选中区块时跟随页签联动（与其他卡片同一口径：每日=今日、每周=本周、每月=本月、累计=全部历史）
    var last = days[days.length - 1];
    if (tab === "daily") {
      fromKey = last.date;
      toKey = last.date;
      label = "今日";
    } else if (tab === "monthly") {
      var dt = new Date(tsOfDay(last.date));
      fromKey = dsOfDate(new Date(dt.getFullYear(), dt.getMonth(), 1));
      toKey = last.date;
      label = "本月";
    } else if (tab === "models") {
      fromKey = days[0].date;
      toKey = last.date;
      label = "累计";
    } else {
      // weekly
      var mo = mondayOf(last.date);
      fromKey = dsOfDate(mo);
      toKey = dsOfDate(addDays(mo, 6));
      label = "本周";
    }
  } else {
    return null;
  }

  // 跨天聚合：键 = 会话 id（稳定；无 id 时兜底 name）。同会话 title/label 取非空。
  var agg = {};
  for (var i = 0; i < all.length; i++) {
    var e = all[i];
    if (e.date < fromKey || e.date > toKey) continue;
    var key = e.id || e.name;
    var a = agg[key];
    if (a === undefined) {
      a = { id: e.id || null, name: e.name, full: e.full, title: e.title || null, role: e.role || "main", parent: e.parent || null, depth: e.depth || 0, label: e.label || null, total: 0, calls: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, turnMs: 0, toolCalls: 0, toolMs: 0, ttftSum: 0, ttftN: 0, outTokens: 0, outMs: 0 };
      agg[key] = a;
    }
    if (!a.title && e.title) a.title = e.title;
    if (!a.label && e.label) a.label = e.label;
    a.total += e.total || 0;
    a.calls += e.calls || 0;
    a.input += e.input || 0;
    a.output += e.output || 0;
    a.cacheRead += e.cacheRead || 0;
    a.cacheWrite += e.cacheWrite || 0;
    a.turnMs += e.turnMs || 0;
    a.toolCalls += e.toolCalls || 0;
    a.toolMs += e.toolMs || 0;
    a.ttftSum += e.ttftSum || 0;
    a.ttftN += e.ttftN || 0;
    a.outTokens += e.outTokens || 0;
    a.outMs += e.outMs || 0;
  }
  var rows = Object.keys(agg).map(function (k) {
    var a = agg[k];
    a.ttftMs = a.ttftN > 0 ? Math.round(a.ttftSum / a.ttftN) : null;
    a.tps = a.outMs > 0 ? Math.round((a.outTokens / a.outMs) * 10000) / 10 : null;
    return a;
  });

  // —— 主/子代理归组：children[parentId] = [子代理...]，parent 直接关联自然成树（嵌套递归）——
  var byId = {};
  for (var ri = 0; ri < rows.length; ri++) if (rows[ri].id) byId[rows[ri].id] = rows[ri];
  var children = {};
  for (var ci = 0; ci < rows.length; ci++) {
    var rc = rows[ci];
    if (rc.role === "subagent" && rc.parent && byId[rc.parent]) {
      if (children[rc.parent] === undefined) children[rc.parent] = [];
      children[rc.parent].push(rc);
    }
  }
  for (var ck in children) children[ck].sort(function (x, y) { return y.total - x.total; });

  /** 递归求某会话全部后代子代理的自身用量合计（不含自身）。 */
  function subTotalOf(id) {
    var kids = children[id];
    var sub = 0;
    if (kids !== undefined) for (var i = 0; i < kids.length; i++) sub += kids[i].total + subTotalOf(kids[i].id);
    return sub;
  }

  /** 会话展示名：子代理优先任务 label（subagent/descriptor），主会话用标题；无则回退工作区/uuid8。 */
  function sessLabel(r) {
    if (r.role === "subagent") return r.label || r.title || r.name;
    return r.title || r.name;
  }

  function toggleOpen(id) {
    var next = {};
    for (var k in open) next[k] = open[k];
    if (next[id]) delete next[id];
    else next[id] = true;
    setOpen(next);
  }

  /** 子代理行的角色附加说明（悬停气泡）：父会话 + 任务名。 */
  function subExtraTip(r) {
    var parentR = r.parent ? byId[r.parent] : null;
    var txt = parentR ? "父会话：" + sessLabel(parentR) : "独立子代理（父会话不在本区块）";
    if (r.label) txt += " · 子代理任务：" + r.label;
    return txt;
  }

  /** 普通行值文本：自身 token · 调用 N 次（用时已移入悬停气泡，行内不占位）。 */
  function rowValText(r) {
    return fmtTokens(r.total) + " · 调用 " + r.calls + " 次";
  }

  /** 渲染一行（含展开箭头/徽标/名称/值/复制按钮）；父行（有子）整行可点展开，复制按钮 stopPropagation 防冒泡。
   *  「[子]」徽标置于行首（超出名称对齐列、醒目色）。 */
  function renderRow(r, depth, hasKids) {
    var isOpen = open[r.id] === true;
    var sub = hasKids ? subTotalOf(r.id) : 0;
    var labelText = sessLabel(r);
    var valText, extraTip = null;
    if (hasKids && view === "combined") {
      // 合计 = 主自身 + Σ 后代子代理；行内标识拆分（官方统计不合并数字，本视图合计并拆分标识）
      valText = "合计 " + fmtTokens(r.total + sub) + "（主 " + fmtTokens(r.total) + " · 子 " + fmtTokens(sub) + "）";
      extraTip = "含 " + children[r.id].length + " 个子代理（合计 " + fmtTokens(r.total + sub) + "）";
    } else {
      valText = rowValText(r);
    }
    if (r.role === "subagent") extraTip = subExtraTip(r);
    var cls = "tks-srow";
    if (hasKids) cls += " tks-srow-exp";
    if (r.role === "subagent") cls += " tks-srow-sub";
    if (hasKids && isOpen) cls += " tks-srow-open";
    return h(
      "div",
      {
        className: cls,
        key: r.id || r.name,
        // 缩进仅限综合视图展开的子代理（嵌套层级视觉）；全部/主对话/子对话视图不走 renderRow，天然对齐
        style: view === "combined" && depth > 0 ? { marginLeft: depth * 14 + "px" } : null,
        onClick: hasKids ? function () { toggleOpen(r.id); } : null,
        onMouseOver: function (e) {
          if (setTip) anchorTip(setTip, e.currentTarget, labelText, r, cfg, r.full, perfTextOf(r), extraTip);
        },
        onMouseLeave: function () {
          if (setTip) setTip(null);
        }
      },
      [
        // 徽标在箭头前（行首，超出名称对齐列）；名称列与主行严格对齐
        r.role === "subagent" ? h("span", { className: "tks-badge" }, "[子]") : null,
        h("span", { className: "tks-sarrow", "aria-hidden": "true" }, hasKids ? (isOpen ? "▼" : "▶") : ""),
        h("span", { className: "tks-sname", title: labelText, "aria-label": labelText }, labelText),
        h("span", { className: "tks-sval" }, valText),
        h(
          "button",
          {
            type: "button",
            className: "tks-scopy",
            title: "复制会话名称",
            "aria-label": "复制会话名称「" + labelText + "」",
            onClick: function (e) {
              e.stopPropagation();
              copyText(labelText)
                .then(function () {
                  if (setTip) flashTip(setTip, e.currentTarget, "已复制会话名称：「" + labelText + "」");
                })
                .catch(function () {
                  if (setTip) flashTip(setTip, e.currentTarget, "复制失败：当前环境不支持剪贴板");
                });
            }
          },
          "复制"
        ),
        h(
          "button",
          {
            type: "button",
            className: "tks-scopy tks-scopy-id",
            title: "复制会话 ID",
            "aria-label": "复制会话 ID「" + (r.full || r.name) + "」",
            onClick: function (e) {
              e.stopPropagation();
              var txt = r.full || r.name;
              copyText(txt)
                .then(function () {
                  if (setTip) flashTip(setTip, e.currentTarget, "已复制会话 ID：「" + txt + "」");
                })
                .catch(function () {
                  if (setTip) flashTip(setTip, e.currentTarget, "复制失败：当前环境不支持剪贴板");
                });
            }
          },
          "ID"
        )
      ]
    );
  }

  /** 递归渲染节点及其展开的子节点（综合视图）。 */
  function renderNode(r, depth) {
    var kids = children[r.id] || [];
    var items = [renderRow(r, depth, kids.length > 0)];
    if (open[r.id] === true) {
      for (var i = 0; i < kids.length; i++) items.push(renderNode(kids[i], depth + 1));
    }
    return items;
  }

  // —— 视图过滤与排序（统一 top10；综合按顶层行（合计）计，
  var topRows;
  if (view === "combined") {
    topRows = [];
    for (var ti = 0; ti < rows.length; ti++) {
      var tr = rows[ti];
      if (tr.role === "main" || !tr.parent || !byId[tr.parent]) topRows.push(tr);
    }
    topRows.sort(function (x, y) { return (y.total + subTotalOf(y.id)) - (x.total + subTotalOf(x.id)); });
  } else if (view === "main") {
    topRows = rows.filter(function (r) { return r.role !== "subagent"; }).sort(function (x, y) { return y.total - x.total; });
  } else if (view === "sub") {
    topRows = rows.filter(function (r) { return r.role === "subagent"; }).sort(function (x, y) { return y.total - x.total; });
  } else {
    topRows = rows.slice().sort(function (x, y) { return y.total - x.total; });
  }
  topRows = topRows.slice(0, 10);

  var body = null;
  if (topRows.length === 0) {
    body = h("p", { className: "tks-empty" }, label + "暂无会话明细。");
  } else if (view === "combined") {
    var nodes = [];
    for (var ni = 0; ni < topRows.length; ni++) nodes = nodes.concat(renderNode(topRows[ni], 0));
    body = h("div", { className: "tks-models" }, nodes);
  } else {
    body = h(
      "div",
      { className: "tks-models" },
      topRows.map(function (r, idx) {
        return h(
          "div",
          {
            className: "tks-srow" + (r.role === "subagent" ? " tks-srow-sub" : ""),
            key: r.id || r.name,
            onMouseOver: function (e) {
              var extraTip = r.role === "subagent" ? subExtraTip(r) : null;
              if (setTip) anchorTip(setTip, e.currentTarget, sessLabel(r), r, cfg, r.full, perfTextOf(r), extraTip);
            },
            onMouseLeave: function () {
              if (setTip) setTip(null);
            }
          },
          [
            // 徽标在箭头前（行首，超出名称对齐列）；名称列与主行严格对齐（子代理行不再缩进）
            r.role === "subagent" ? h("span", { className: "tks-badge" }, "[子]") : null,
            h("span", { className: "tks-sarrow", "aria-hidden": "true" }, ""),
            h("span", { className: "tks-sname", title: sessLabel(r), "aria-label": sessLabel(r) }, idx + 1 + ". " + sessLabel(r)),
            h("span", { className: "tks-sval" }, rowValText(r)),
            h(
              "button",
              {
                type: "button",
                className: "tks-scopy",
                title: "复制会话名称",
                "aria-label": "复制会话名称「" + sessLabel(r) + "」",
                onClick: function (e) {
                  e.stopPropagation();
                  var txt = sessLabel(r);
                  copyText(txt)
                    .then(function () {
                      if (setTip) flashTip(setTip, e.currentTarget, "已复制会话名称：「" + txt + "」");
                    })
                    .catch(function () {
                      if (setTip) flashTip(setTip, e.currentTarget, "复制失败：当前环境不支持剪贴板");
                    });
                }
              },
              "复制"
            ),
            h(
              "button",
              {
                type: "button",
                className: "tks-scopy tks-scopy-id",
                title: "复制会话 ID",
                "aria-label": "复制会话 ID「" + (r.full || r.name) + "」",
                onClick: function (e) {
                  e.stopPropagation();
                  var txt = r.full || r.name;
                  copyText(txt)
                    .then(function () {
                      if (setTip) flashTip(setTip, e.currentTarget, "已复制会话 ID：「" + txt + "」");
                    })
                    .catch(function () {
                      if (setTip) flashTip(setTip, e.currentTarget, "复制失败：当前环境不支持剪贴板");
                    });
                }
              },
              "ID"
            )
          ]
        );
      })
    );
  }

  return h(
    "div",
    { className: "tks-card" },
    h(
      "div",
      { className: "tks-head" },
      h("span", { className: "tks-title" }, "会话 Top（" + label + "）"),
      h(
        "div",
        { className: "tks-tabs tks-stabs" },
        SESSION_VIEWS.map(function (t) {
          return h(
            "button",
            {
              key: t[0],
              type: "button",
              className: "tks-tab" + (view === t[0] ? " tks-tab-on" : ""),
              onClick: function () {
                setView(t[0]);
              }
            },
            t[1]
          );
        })
      )
    ),
    body
  );
}

function ActivityCard(summary, tab, setTab, fetchedAt, setTip, onPick, view) {
  var days = summary.days || [];
  var body = null;
  if (days.length === 0) {
    body = h("p", { className: "tks-empty" }, "暂无会话用量记录（本机日志尚无任何模型用量事件）。");
  } else if (tab === "daily") {
    body = DailyView(setTip, days, onPick, view);
  } else if (tab === "weekly") {
    body = RowView(setTip, buildWeekly(days, view.dayCost), function (c) {
      var endTxt = c.end ? md(dsOfDate(c.end)) : md(c.start.getFullYear() + "-" + pad2(c.start.getMonth() + 1) + "-" + pad2(c.start.getDate()));
      return "该周（" + md(dsOfDate(c.start)) + "～" + endTxt + "）";
    }, onPick, view);
  } else if (tab === "monthly") {
    body = RowView(setTip, buildMonthly(days, view.dayCost), function (c) {
      return "该月（" + c.label + "）";
    }, onPick, view);
  } else {
    // 「累计」页签不再重复渲染模型列表：明细/费用/调色已由下方「模型用量分布（累计全部）」卡片承载
    body = h("p", { className: "tks-empty" }, "各模型累计明细、费用与分布请看下方「模型用量分布（累计全部）」卡片。");
  }
  return h(
    "div",
    { className: "tks-card" },
    h(
      "div",
      { className: "tks-head" },
      h(
        "div",
        null,
        h("span", { className: "tks-title" }, "Token 活动"),
        fetchedAt ? h("span", { className: "tks-meta" }, "更新于 " + new Date(fetchedAt).toLocaleTimeString()) : null
      ),
      h(
        "div",
        { className: "tks-tabs" },
        TABS.map(function (t) {
          return h(
            "button",
            {
              key: t[0],
              type: "button",
              className: "tks-tab" + (tab === t[0] ? " tks-tab-on" : ""),
              onClick: function () {
                setTab(t[0]);
              }
            },
            t[1]
          );
        })
      )
    ),
    body
  );
}
