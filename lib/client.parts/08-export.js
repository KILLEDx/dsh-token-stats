// 分片 08/11 · 导出（CSV / JSON：日序列 + 模型明细，配置单价时附费用列）
function downloadFile(name, mime, content) {
  var blob = new Blob([content], { type: mime });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 1000);
}

function exportStamp() {
  var d = new Date();
  return d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + "-" + pad2(d.getHours()) + pad2(d.getMinutes());
}

/** 导出 CSV：日序列逐日一行（date,input,output,cacheRead,cacheWrite,total,cost_cny,cost_usd），配置单价时附双币种费用列；UTF-8 BOM 兼容 Excel。 */
function exportCsv(summary, cfg, dayCost) {
  var lines = ["date,input,output,cacheRead,cacheWrite,total,cost_cny,cost_usd"];
  var days = summary.days || [];
  for (var i = 0; i < days.length; i++) {
    var d = days[i];
    var m = dayCost && dayCost[d.date] ? dayCost[d.date] : null;
    lines.push([d.date, d.input, d.output, d.cacheRead, d.cacheWrite, d.total, m && m.CNY ? m.CNY.toFixed(4) : "", m && m.USD ? m.USD.toFixed(4) : ""].join(","));
  }
  downloadFile("token-stats-" + exportStamp() + ".csv", "text/csv;charset=utf-8", "\uFEFF" + lines.join("\r\n"));
}

/** 导出 JSON：结构化全量（totals + days 含双币种费用 + models 含双币种费用 + 币种/导出时间；费用不做汇率折算）。 */
function exportJson(summary, cfg, dayCost) {
  function costRow(m) {
    if (!m) return undefined;
    var out = {};
    if (m.CNY > 0) out.CNY = Math.round(m.CNY * 1e6) / 1e6;
    if (m.USD > 0) out.USD = Math.round(m.USD * 1e6) / 1e6;
    return Object.keys(out).length > 0 ? out : undefined;
  }
  var days = (summary.days || []).map(function (d) {
    var row = {
      date: d.date,
      input: d.input,
      output: d.output,
      cacheRead: d.cacheRead,
      cacheWrite: d.cacheWrite,
      total: d.total
    };
    var c = costRow(dayCost && dayCost[d.date]);
    if (c) row.cost = c;
    return row;
  });
  var models = attachCosts((summary.models || []).slice(), cfg).map(function (m) {
    var row = { key: m.key, input: m.input, output: m.output, cacheRead: m.cacheRead, cacheWrite: m.cacheWrite, total: m.total, calls: m.calls };
    var c = costRow(m.cost);
    if (c) row.cost = c;
    return row;
  });
  var obj = {
    exportedAt: new Date().toISOString(),
    currency: cfg.currency,
    totals: summary.totals,
    days: days,
    models: models
  };
  downloadFile("token-stats-" + exportStamp() + ".json", "application/json", JSON.stringify(obj, null, 2));
}
