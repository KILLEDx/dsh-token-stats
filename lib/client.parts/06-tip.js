// 分片 06/11 · 悬停气泡
/**
 * 按单元格位置定位气泡：优先放方块上方居中，靠上放不下改到下方；
 * 水平钳制在视口内。宽高约束交给 CSS（width:max-content + max-width 兜底，
 * 防绝对定位浮层被 shrink-to-fit 挤窄）。
 */
/** OpenAI 口径缓存命中率：缓存读 /（输入 + 缓存读 + 缓存写）；分母为 0 返回 null。 */
function hitRatio(cacheRead, input, cacheWrite) {
  var denom = (input || 0) + (cacheRead || 0) + (cacheWrite || 0);
  if (!(denom > 0)) return null;
  return Math.round((cacheRead / denom) * 1000) / 10 + "%";
}

/** 按元素定位气泡：优先放上方居中，靠上放不下改到下方；水平钳制在视口内。 */
function tipPos(el) {
  var rect = el.getBoundingClientRect();
  var vw = window.innerWidth || 1280;
  var half = 170;
  var x = rect.left + rect.width / 2;
  x = Math.min(Math.max(x, half + 12), vw - half - 12);
  var below = rect.top < 96;
  return { x: x, y: below ? rect.bottom + 8 : rect.top - 8, below: below };
}

/** 复制文本到剪贴板；127.0.0.1 属安全上下文，navigator.clipboard 可用。 */
function copyText(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject(new Error("当前环境不支持剪贴板 API"));
}

var COPY_TIP_TIMER = null;

/**
 * 在元素附近短暂显示一条提示（复制成功反馈等），约 1.6s 后自动消失。
 * 用「引用相等」做函数式清除：期间若 hover 触发了其他 tip（新对象引用），不清掉它。
 */
function flashTip(setTip, el, title) {
  var pos = tipPos(el);
  var snap = { x: pos.x, y: pos.y, below: pos.below, title: title, detail: null };
  setTip(snap);
  if (COPY_TIP_TIMER !== null) clearTimeout(COPY_TIP_TIMER);
  COPY_TIP_TIMER = setTimeout(function () {
    COPY_TIP_TIMER = null;
    setTip(function (cur) { return cur === snap ? null : cur; });
  }, 1600);
}

/**
 * 按元素显示气泡：
 * @param setTip 状态 setter
 * @param el 锚点元素（决定气泡位置）
 * @param phrase 主体描述（如「9月1日」「模型名」）
 * @param c 用量对象 {total,input,output,cacheRead,cacheWrite,calls,cost?}
 * @param cfg 配置（费用展示用，可省）
 * @param idText 可选附加标识（会话行传完整会话 ID，追加到 detail 尾部）
 * @param perfText 可选性能明细文本（会话行传「用时/工具/首字/输出」，追加到 detail；热力图/模型行不传）
 * @param extraText 可选附加说明（会话行传「父会话/子代理任务」等角色信息，追加到 detail；其他调用方不传向后兼容）
 */
function anchorTip(setTip, el, phrase, c, cfg, idText, perfText, extraText) {
  var pos = tipPos(el);
  // 缓存读写合计：热力图/模型条目现均带 cacheRead/cacheWrite 拆分字段（方块命中率必需），
  // 兼容旧形态只带 cache 合计的条目；两者并存时只取拆分字段，防重复相加
  var cr = c.cacheRead || 0;
  var cw = c.cacheWrite || 0;
  var cacheAll = c.cacheRead !== undefined || c.cacheWrite !== undefined ? cr + cw : c.cache || 0;
  var title = c.total <= 0 ? phrase + "无 token 用量" : phrase + "使用了 " + fmtTokens(c.total) + " 个token（缓存读写 " + fmtTokens(cacheAll) + "）";
  var detail = c.total <= 0 ? null : "输入 " + fmtTokens(c.input) + " · 输出 " + fmtTokens(c.output);
  if (c.total > 0) {
    if (cr > 0 || cw > 0) detail += " · 缓存读 " + fmtTokens(cr) + " · 缓存写 " + fmtTokens(cw);
    var hit = hitRatio(cr, c.input, cw);
    if (hit !== null) detail += " · 命中率 " + hit;
    if (c.calls) detail += " · 调用 " + c.calls + " 次";
    var costTxt = cfg && c.cost ? fmtCostMix(c.cost) : null;
    if (costTxt) detail += " · 费用 " + costTxt;
    // 性能明细（会话行专用，行内只留「用时」，工具/首字/输出进气泡）
    if (perfText) detail += " · " + perfText;
    // 角色附加说明（子代理行传「父会话」、父行传「含子代理合计」；其余调用方不传）
    if (extraText) detail = (detail ? detail + " · " : "") + extraText;
  }
  if (idText) detail = (detail ? detail + " · " : "") + "会话 ID：" + idText;
  setTip({ x: pos.x, y: pos.y, below: pos.below, title: title, detail: detail });
}

function Tip(tip) {
  if (!tip) return null;
  return h(
    "div",
    { className: "tks-tip" + (tip.below ? " tks-tip-below" : ""), style: { left: tip.x + "px", top: tip.y + "px" } },
    h("div", null, tip.title),
    tip.detail ? h("div", { className: "tks-tip-detail" }, tip.detail) : null
  );
}
