// ======== 01-header.js ========
// 分片 01/11 · 模块包裹头 + React 句柄
// 由 scripts/build-token-stats-client.mjs 按文件名顺序拼装为 lib/client.js。
// 各分片共享同一 factory 作用域：先定义的 var/函数对后续分片可见，禁止跨分片重名。
window.__ModuleLoader__.load({
  id: "dsh-token-stats",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var react = require("react");
    var h = react.createElement;
    var useState = react.useState;
    var useEffect = react.useEffect;
    var useRef = react.useRef;

// ======== 02-styles.js ========
// 分片 02/11 · 样式（一次性注入）
var CSS = [
  ".tks-section{width:100%;max-width:900px;color:var(--dsw-alias-label-primary,#111);flex-direction:column;gap:14px;display:flex}",
  ".tks-error{margin:0;font-size:12px;color:var(--dsw-alias-state-error-primary,#c82828)}",
  ".tks-alert{margin:0;font-size:12px;line-height:18px;color:#fff;background:var(--dsw-alias-state-error-primary,#c82828);border-radius:8px;padding:6px 10px}",
  ".tks-ok{margin:0;font-size:12px;color:var(--dsw-alias-state-success-primary,var(--dsw-alias-state-ok-primary,#1a7f37))}",
  ".tks-controls{display:flex;gap:6px;flex-wrap:wrap;align-items:center}",
  ".tks-controls-label{font-size:12px;color:var(--dsw-alias-label-tertiary,#888);margin-right:2px}",
  ".tks-btn{appearance:none;font:inherit;font-size:12px;line-height:1.6;cursor:pointer;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35));border-radius:8px;padding:3px 12px;background:0 0;color:var(--dsw-alias-label-primary,#111);white-space:nowrap;transition:background .12s ease,border-color .12s ease,opacity .12s ease}",
  ".tks-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}",
  ".tks-btn-on{border-color:var(--dsw-alias-state-business-primary,#0668d6);color:var(--dsw-alias-state-business-primary,#0668d6);background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#0668d6) 8%,transparent)}",
  ".tks-btn-primary{background:var(--dsw-alias-state-business-primary,#0668d6);border-color:transparent;color:#fff}",
  ".tks-btn-primary:hover{opacity:.88;background:var(--dsw-alias-state-business-primary,#0668d6)}",
  ".tks-pill{border-radius:999px;min-width:30px;padding:2px 0;text-align:center}",
  ".tks-metrics{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:-8px}", // 与「Token 活动」卡贴近
  ".tks-streaks{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px}", // 置顶行与三卡之间留呼吸感
  ".tks-streak{flex:1;min-width:160px;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.3));border-radius:10px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--dsw-alias-bg-layer-3,transparent)}",
  ".tks-streak-label{font-size:12px;color:var(--dsw-alias-label-secondary,#555)}",
  ".tks-streak-num{font-size:16px;font-weight:600;font-variant-numeric:tabular-nums}",
  ".tks-metric{flex:1;min-width:112px;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.3));border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:2px;background:var(--dsw-alias-bg-layer-3,transparent)}",
  ".tks-num{font-size:22px;font-weight:600;font-variant-numeric:tabular-nums;line-height:1.25}",
  ".tks-mlabel{font-size:12px;color:var(--dsw-alias-label-secondary,#555)}",
  ".tks-msub{font-size:11px;color:var(--dsw-alias-label-tertiary,#888)}",
  ".tks-card{border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.3));background:var(--dsw-alias-bg-layer-3,transparent);border-radius:10px;padding:14px 16px;flex-direction:column;gap:12px;display:flex}",
  ".tks-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}",
  ".tks-title{margin:0;font-size:15px;font-weight:600}",
  ".tks-meta{font-size:11px;color:var(--dsw-alias-label-tertiary,#888);font-weight:400;margin-left:10px}",
  ".tks-tabs{display:flex;gap:4px}",
  ".tks-tab{appearance:none;font:inherit;font-size:12px;line-height:1.6;cursor:pointer;border:1px solid transparent;border-radius:7px;padding:2px 10px;background:0 0;color:var(--dsw-alias-label-secondary,#555)}",
  ".tks-tab:hover{color:var(--dsw-alias-label-primary,#111)}",
  '.tks-tab-on{background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,.1));border-color:var(--dsw-alias-border-l2,rgba(127,127,127,.25));color:var(--dsw-alias-label-primary,#111)}',
  ".tks-months{position:relative;height:15px;margin-bottom:2px;font-size:10px;color:var(--dsw-alias-label-tertiary,#888)}",
  ".tks-month{position:absolute;top:0;left:0;white-space:nowrap}",
  ".tks-grid{display:flex;gap:3px;overflow-x:auto;padding-bottom:4px}",
  ".tks-col{display:flex;flex-direction:column;gap:3px}",
  ".tks-row{display:flex;gap:3px;overflow-x:auto;padding:4px 0}",
  ".tks-cell{width:11px;height:11px;min-width:11px;border-radius:2px;box-sizing:border-box;background:transparent;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35));cursor:default}",
  ".tks-cell-none{visibility:hidden}",
  '.tks-cell:not(.tks-cell-none):hover{box-shadow:0 0 0 1px var(--dsw-alias-label-secondary,#666)}',
  '.tks-cell[data-over="1"]{box-shadow:0 0 0 2px var(--dsw-alias-state-error-primary,#c82828)}',
  '.tks-cell[data-level="1"]{border-color:transparent;background:rgba(6,104,214,.32);background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#0668d6) 32%,transparent)}',
  '.tks-cell[data-level="2"]{border-color:transparent;background:rgba(6,104,214,.6);background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#0668d6) 62%,transparent)}',
  '.tks-cell[data-level="3"]{border-color:transparent;background:rgba(6,104,214,.92);background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#0668d6) 94%,transparent)}',
  ".tks-empty{margin:0;font-size:13px;color:var(--dsw-alias-label-tertiary,#888);padding:6px 0}",
  ".tks-models{display:flex;flex-direction:column;gap:14px}",
  ".tks-mrow{display:flex;flex-direction:column;gap:4px}",
  ".tks-mtop{display:flex;align-items:baseline;justify-content:space-between;gap:10px}",
  ".tks-mname{font-size:13px;font-weight:600;font-family:Consolas,'Courier New',monospace;word-break:break-all}",
  ".tks-mval{font-size:15px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}",
  ".tks-msub2{font-size:11px;color:var(--dsw-alias-label-tertiary,#888)}",
  ".tks-mbar{height:4px;border-radius:2px;background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,.15));overflow:hidden}",
  ".tks-mbar-fill{height:100%;border-radius:2px;background:rgba(6,104,214,.75);background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#0668d6) 78%,transparent)}",
  ".tks-note{margin:0;font-size:11px;line-height:17px;color:var(--dsw-alias-label-tertiary,#888)}",
  ".tks-tip{position:fixed;z-index:9999;transform:translate(-50%,-100%);pointer-events:none;width:max-content;max-width:min(560px,calc(100vw - 24px));background:rgba(28,28,32,.96);color:#f0f0f0;border-radius:8px;padding:8px 11px;font-size:12px;line-height:18px;word-break:break-all;box-shadow:0 4px 16px rgba(0,0,0,.28)}",
  ".tks-tip-below{transform:translate(-50%,0)}",
  ".tks-tip-detail{color:#b8b8bf;font-size:11px;line-height:16px;margin-top:2px}",
  // —— 模型用量分布（横向条形图 + 饼图）——
  ".tks-charts{display:flex;gap:22px;flex-wrap:wrap;align-items:flex-start}",
  ".tks-bars{flex:1 1 300px;min-width:260px;display:flex;flex-direction:column;gap:9px}",
  ".tks-pie{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:10px}",
  ".tks-pie-total{font-size:13px;font-weight:600;fill:var(--dsw-alias-label-primary,#111)}",
  ".tks-pie-cap{font-size:9px;fill:var(--dsw-alias-label-tertiary,#888)}",
  ".tks-legend{display:flex;flex-direction:column;gap:4px;max-width:220px}",
  ".tks-litem{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--dsw-alias-label-secondary,#555);line-height:1.4}",
  ".tks-lcolor{width:9px;height:9px;min-width:9px;border-radius:2px}",
  ".tks-lname{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:Consolas,'Courier New',monospace}",
  ".tks-chip{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:6px;vertical-align:baseline;flex:none}",
  ".tks-crow{cursor:default}",
  // —— 会话 Top 下钻 ——
  ".tks-srow{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px;line-height:22px}",
  ".tks-sname{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:default}",
  ".tks-sval{white-space:nowrap;font-variant-numeric:tabular-nums;font-weight:600;flex:none}",
  // —— 会话 Top 主/子代理视图 ——
  ".tks-stabs{margin-top:2px}",
  ".tks-sarrow{flex:none;width:14px;min-width:14px;font-size:10px;text-align:center;user-select:none;color:var(--dsw-alias-label-tertiary,#888)}",
  ".tks-badge{flex:none;font-size:11px;line-height:16px;font-weight:600;margin-right:6px;color:#e5484d;font-family:Consolas,'Courier New',monospace}",
  ".tks-srow-exp{cursor:pointer}",
  ".tks-srow-exp:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08));border-radius:6px}",
  ".tks-srow-open{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.05));border-radius:6px}",
  // 复制按钮常驻可见（半透明），悬停行/按钮时加深——隐藏式按钮不可发现
  ".tks-scopy{appearance:none;border:none;background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,.08));color:var(--dsw-alias-label-secondary,#555);font:inherit;font-size:11px;line-height:18px;cursor:pointer;padding:0 7px;border-radius:6px;flex:none;transition:color .12s ease,background .12s ease,opacity .12s ease;opacity:.72}",
  ".tks-scopy-id{background:0 0;opacity:.5}",
  ".tks-srow:hover .tks-scopy{opacity:1}",
  ".tks-scopy:hover,.tks-scopy:focus-visible{color:var(--dsw-alias-state-business-primary,#0668d6);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.14));opacity:1}",
  // —— 费用单价配置弹窗 ——
  ".tks-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.42);z-index:10000;display:flex;align-items:center;justify-content:center}",
  // 表面契约：--dsw-specific-menu 为半透明层色，
  // 只有「菜单/浮层」才配它 + backdrop-filter；弹窗/吸顶表头/输入框等非菜单表面一律用不透明层色，
  // 否则内容穿透（弹窗透出遮罩变灰、吸顶表头透出滚动行）。各角色对齐官方：Modal=bg-layer-2、
  // 吸顶=bg-base/layer-1、菜单=specific-menu+blur。
  ".tks-modal{background:var(--dsw-alias-bg-layer-2,#fff);color:var(--dsw-alias-label-primary,#111);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.32);width:min(960px,calc(100vw - 40px));height:min(760px,calc(100vh - 48px));padding:14px 16px 12px;display:flex;flex-direction:column;gap:12px}",
  ".tks-modal-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex:none}",
  ".tks-modal-body{flex:1 1 auto;overflow:auto;display:flex;flex-direction:column;gap:8px;min-height:0;padding:2px 2px 6px}",
  ".tks-modal-foot{flex:none;display:flex;align-items:center;gap:8px;flex-wrap:wrap;border-top:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.25));padding-top:8px}",
  ".tks-foot-right{margin-left:auto;display:flex;gap:8px}",
  ".tks-pick{position:relative;display:inline-flex}",
  // 下拉浮层（真菜单）：不透明底打底 + @supports 切官方玻璃态，保证任何环境可读
  ".tks-pick-panel{position:absolute;top:calc(100% + 2px);left:0;z-index:30;display:none;min-width:300px;max-width:min(420px,calc(100vw - 80px));max-height:280px;overflow:auto;background:var(--dsw-alias-bg-layer-2,#fff);color:var(--dsw-alias-label-primary,#111);border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.3));border-radius:10px;box-shadow:0 10px 32px rgba(0,0,0,.22);padding:6px;flex-direction:column;gap:2px}",
  ".tks-pick:hover .tks-pick-panel,.tks-pick:focus-within .tks-pick-panel{display:flex}",
  ".tks-pick-open .tks-pick-panel,.tks-pick-panel.tks-panel-open{display:flex}",
  // 支持模糊时才升级为官方玻璃态（--dsw-specific-menu + blur）；不支持则保留上面的不透明底
  "@supports (backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px)){.tks-pick-panel{background:var(--dsw-specific-menu,#fff);-webkit-backdrop-filter:var(--dsw-menu-backdrop-filter,blur(40px) saturate(150%));backdrop-filter:var(--dsw-menu-backdrop-filter,blur(40px) saturate(150%))}}",
  ".tks-pick-search{box-sizing:border-box;width:100%;font:inherit;font-size:12px;line-height:20px;padding:3px 8px;margin-bottom:4px;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.3));border-radius:6px;background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,.06));color:inherit}",
  ".tks-pick-item{display:flex;align-items:center;gap:6px;font-size:12px;line-height:20px;padding:2px 6px;border-radius:6px;cursor:pointer;white-space:nowrap}",
  ".tks-pick-item:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}",
  ".tks-pick-item input{margin:0;cursor:pointer}",
  ".tks-pick-item-off{opacity:.55;cursor:default}",
  ".tks-color-chip{width:12px;height:12px;border-radius:4px;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35));flex:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.25)}",
  ".tks-color-panel{flex-direction:row;flex-wrap:wrap;align-items:center;gap:4px;width:196px;padding:8px}",
  ".tks-color-swatch{width:24px;height:24px;border-radius:6px;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35));cursor:pointer;padding:0;transition:transform .1s ease}",
  ".tks-color-swatch:hover{transform:scale(1.12)}",
  ".tks-color-swatch.tks-color-on{outline:2px solid var(--dsw-alias-state-business-primary,#0668d6);outline-offset:1px}",
  ".tks-color-custom{display:flex;align-items:center;gap:4px;width:100%;margin-top:2px}",
  ".tks-color-custom input[type=color]{width:30px;height:22px;padding:0;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35));border-radius:6px;background:none;cursor:pointer}",
  ".tks-pick-empty{font-size:12px;color:var(--dsw-alias-label-tertiary,#888);padding:4px 6px}",
  ".tks-pick-manual{display:flex;gap:4px;align-items:center;margin-top:4px;padding-top:6px;border-top:1px dashed var(--dsw-alias-border-l2,rgba(127,127,127,.25))}",
  ".tks-mpick-btn{max-width:170px}",
  ".tks-mpick-txt{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
  ".tks-mpick-item{appearance:none;border:none;background:0 0;font:inherit;text-align:left;width:100%}",
  ".tks-mpick-item-on{color:var(--dsw-alias-state-business-primary,#0668d6);font-weight:600}",
  ".tks-modal-title{margin:0;font-size:16px;font-weight:600;display:flex;align-items:center;justify-content:space-between;gap:10px}",
  ".tks-modal-close{appearance:none;border:none;background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,.08));font:inherit;font-size:13px;cursor:pointer;color:var(--dsw-alias-label-secondary,#555);width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center}",
  ".tks-modal-close:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.16))}",
  // 第一列固定 170px（模型小按钮宽）：主 key 按钮化后原 1.1fr 弹性列会空出大片，右侧控件随之左移
  ".tks-price-row{display:grid;grid-template-columns:170px 80px 52px repeat(4,72px) 88px 52px 30px;gap:6px;align-items:center}",
  // 吸顶表头必须不透明（官方同写法用 bg-base），否则滚动行会从表头下方透出
  ".tks-price-head-row{position:sticky;top:-2px;z-index:5;background:var(--dsw-alias-bg-base,#fff);border-bottom:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.25));padding:2px 0 4px}",
  ".tks-price-head{font-size:11px;color:var(--dsw-alias-label-tertiary,#888)}",
  ".tks-price-name{font-family:Consolas,'Courier New',monospace;font-size:12px;word-break:break-all;display:flex;align-items:center;flex-wrap:wrap;gap:4px;min-width:0}",
  ".tks-price-input{box-sizing:border-box;width:100%;font:inherit;font-size:12px;line-height:20px;padding:4px 8px;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.3));border-radius:8px;background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,.06));color:inherit;transition:border-color .12s ease,background .12s ease}",
  ".tks-price-input:focus{outline:none;border-color:var(--dsw-alias-state-business-primary,#0668d6);background:var(--dsw-alias-bg-layer-2,#fff)}",
  ".tks-pblock{display:flex;flex-direction:column;gap:8px;background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,.05));border-radius:10px;padding:10px;margin:2px 0}",
  ".tks-seg{border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.28));border-radius:10px;padding:8px 10px;display:flex;flex-direction:column;gap:7px;background:var(--dsw-alias-bg-layer-2,#fff)}",
  ".tks-seg-line{display:flex;gap:6px;align-items:center;flex-wrap:wrap}",
  ".tks-seg-dash{color:var(--dsw-alias-label-tertiary,#888);font-size:12px}",
  ".tks-seg-days{display:flex;gap:4px;align-items:center;flex-wrap:wrap}",
  ".tks-range-line{display:flex;gap:6px;align-items:center;flex-wrap:wrap;border-top:1px dashed var(--dsw-alias-border-l2,rgba(127,127,127,.25));padding-top:6px}",
  ".tks-q-warn .tks-mbar-fill{background:#f28e2b}",
  ".tks-q-warn .tks-mval{color:#b45309}",
  ".tks-q-over .tks-mbar-fill{background:var(--dsw-alias-state-error-primary,#c82828)}",
  ".tks-q-over .tks-mval{color:var(--dsw-alias-state-error-primary,#c82828)}",
  ".tks-qlimit{display:flex;flex-direction:column;gap:4px;padding:8px 0;border-top:1px dashed var(--dsw-alias-border-l2,rgba(127,127,127,.25))}",
  ".tks-qlimit:first-of-type{border-top:none;padding-top:0}",
  ".tks-qitem{display:flex;flex-direction:column;gap:3px;padding:6px 0 6px 12px;border-top:1px dotted var(--dsw-alias-border-l2,rgba(127,127,127,.2))}",
  ".tks-qkey{font-family:Consolas,'Courier New',monospace;font-size:11px;word-break:break-all}",
  ".tks-qval-sm{font-size:13px}",
  ".tks-qlabel{font-size:12px;color:var(--dsw-alias-label-secondary,#555)}",
  ".tks-select{appearance:none;font:inherit;font-size:12px;line-height:20px;padding:3px 22px 3px 6px;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.3));border-radius:6px;background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,.06));color:inherit;cursor:pointer}",
  ".tks-del{appearance:none;border:none;background:0 0;color:var(--dsw-alias-state-error-primary,#c82828);font:inherit;font-size:14px;cursor:pointer;padding:2px;border-radius:4px}",
  ".tks-del:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}",
  // —— 常驻悬浮小窗（shell.overlay）——
  // 三层结构：root（无 transform，承载 tip/panel）→ anchor（承载坐标）→ card。
  // ⚠️ tip/panel 必须在 root 下：祖先带 transform 时 position:fixed 的包含块会变成该祖先，
  // 坐标被叠加一次小窗位置（否则拖动时出现定位偏差）。
  ".tks-fw-root{position:relative;z-index:90;pointer-events:none;width:0;height:0;font-size:0;line-height:0}",
  // —— 吸附动画 ——
  //
  // ★ 缺的是哪一半 ★（勿再只做一半）：
  //    只写「拖动期间 transition:none」是不够的——**没有先加过渡、只写了停用**，
  //    全项目当时根本没有可用的 `transition`（复核：`02-styles.js` 里 transition 只命中
  //    `.tks-btn`/`.tks-scopy`/`.tks-color-swatch`/`.tks-price-input` 四个按钮类，与本浮窗无关）。
  //    于是「松手才播吸附动画」这半句无从谈起：**松手那一帧是硬跳**（完整卡片 ↔ 24×70 细条，
  //    宽高同时突变），展开/收回（24×70 ↔ 165×61）同样是硬跳。这就是吸附手感不够流畅的原因。
  //
  // ★ 白名单而非 `transition:all` ★：
  //    不可合成属性（如卡片自身的 `box-shadow`/`border-color`）每帧会触发整卡重绘，
  //    属**重绘泵**——把动画移到 `::after` 只动 `opacity` 后，重绘次数大幅下降。
  //    **加过渡时绝不能改进这一点**——故只列几何与可合成属性，
  //    **永不**把 `box-shadow`/`border-color`/`background`/`border-radius` 放进过渡列表：
  //    `border-radius` 在 `.tks-fw[data-peek="1"]` 上会变（8px ↔ 12px），过渡它就是每帧重绘，
  //    为了一处 4px 的圆角变化换来重绘泵不划算。
  //    `transform`/`opacity` 交合成器，`width`/`height`/`padding` 走布局动画（形态跃迁必须动它们，
  //    这类跃迁本来就是低频（每次交互一次），代价可接受）。
  //
  // ⚠️ `transform` 用**等时长**（180ms）是刻意的：定位（left/top/尺寸）在同一段里一起变，
  //    两者时长不一致会出现「先滑到位、再变宽」的割裂感。
  // ⚠️ 时长/缓动取 180ms + `cubic-bezier(.22,.61,.36,1)`（快出慢收，与系统吸附手感一致）；
  //    `ease-out` 也行，但这条曲线在「起步快」上更贴合快出慢收的手感。
  // ⚠️ 必须配 `prefers-reduced-motion` 兜底（见文件末尾同款降级），否则前庭敏感用户会难受。
  ".tks-fw-anchor{transition:transform .18s cubic-bezier(.22,.61,.36,1)}",
  ".tks-fw{transition:width .18s cubic-bezier(.22,.61,.36,1),height .18s cubic-bezier(.22,.61,.36,1),padding .18s cubic-bezier(.22,.61,.36,1),gap .18s cubic-bezier(.22,.61,.36,1)}",
  // ★★ 手势期间必须彻底关掉过渡 ★★
  //    过渡会让元素「滞后于指针」——拖动时如果每帧写的 transform 还带 180ms 缓动，
  //    卡片就永远追不上鼠标（因此才需要下面这条拖动期间禁用过渡的规则）。
  //    该类由 JS 在 pointerdown 置上、pointerup 摘掉（见 10c-float.js 的 fwSetSnapping 调用点）。
  //    ⚠️ `transition:none` 而不是 `transition-duration:0s`：前者彻底不参与过渡，
  //       后者在部分浏览器上仍会保留过渡的合成层提升，松手瞬间可能闪一下。
  //    ⚠️ 同时关掉两者的过渡——拖动只动 anchor，缩放同时动 anchor 与卡片尺寸。
  ".tks-fw-root[data-snap=\"0\"] .tks-fw-anchor,",
  ".tks-fw-root[data-snap=\"0\"] .tks-fw{transition:none}",
  // ⚠️ 定位**不走 CSS 变量**（不得使用 `var(--tks-fw-x)`）：
  //    自定义属性是继承属性，每帧写它会让整棵卡片子树样式缓存失效，
  //    代价随卡片节点数增长，远高于直接写 transform。
  //    现由 JS 的 fwWriteAnchorPos 直接写 transform，此处只给初值。
  //    `translate3d` 带 z 分量 → 稳定提升为合成层，拖动只需重新合成、不重绘。
  ".tks-fw-anchor{position:fixed;left:0;top:0;pointer-events:none;width:0;height:0;",
  "transform:translate3d(0,0,0)}",
  // 卡片：宽度**由内容决定**（`width:max-content`）——
  // 对比同类实现的 `.dsh-th-card`：只给 `max-width:min(420px,100vw-24px)`、不给固定 width，宽度由网格内容撑开，
  // 所以「网格多宽卡片就多宽」、天然无横向空白（正方形也能放得下一个月）。
  // 此前本插件写死 `width:232px`，导致网格要么填不满（留大片空白）、要么被迫改列数去凑——
  // 根因是「卡片定宽 + 网格自适应」的方向反了。现改为**卡片随内容**，空白问题从根上消失。
  // ⚠️ 不设 min-width：曾加 `min-width:200px` 与「格子按高度缩放」互相打架——
  //    高度限制让格子变小、内容只需 184px，而 min-width 把卡片卡在 200px，反而多出 16px 空白。
  // 拖动右下角把手缩放时由 JS 写死 width/height（覆盖 max-content），仍受 [MIN,MAX] 钳制。
  // ⚠️ `overflow:hidden` 是**溢出兜底**：
  //    卡片宽度是 max-content，拖小后若内容（固定字号的标题/数字）比设定宽，会撑破边框；
  //    hidden 保证任何情况下内容都不越界（配合 JS 的 FW_MIN_W/H 下限，正常尺寸下不会触发裁切）。
  ".tks-fw{position:relative;pointer-events:auto;box-sizing:border-box;width:max-content;max-width:min(520px,calc(100vw - 24px));overflow:hidden;",
  "display:flex;flex-direction:column;gap:6px;padding:9px 11px 10px;",
  "border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.25));border-radius:12px;",
  "background:var(--dsw-alias-bg-layer-2,#fff);",
  "box-shadow:0 6px 22px rgba(0,0,0,.16);color:var(--dsw-alias-label-primary,#111);",
  "font-size:12px;line-height:1.5;user-select:none}",
  // ★★ 形态跃迁动画修复：折叠态**写死高度**（勿删，理由见文件末尾「吸附过渡」段）★★
  //    此前两小形态的高度都是 `auto`，而 CSS 过渡由**计算值变化**触发、`auto` 又不可插值
  //    → 已声明的 `height .18s` 是**死代码**。
  //    写死 px 后过渡才真生效；数值 = 折叠态高度（标题行 16.5 + gap 6 + 数字行 22.8
  //    + padding 7×2 + border 1×2 = 61.3）。
  //    ⚠️ 折叠态**不显示「回今天」**（见 10c-float.js 的 dockBack 条件）：该按钮宽 51px，
  //    带上它内容需要 220px，会把折叠条撑到 244px 宽，得不偿失。
  ".tks-fw[data-min=\"1\"]{padding:7px 11px;height:61.3px}",
  // 折叠态内容**钉死宽度 + 禁换行**（与上面写死高度是**成对**的修法，缺一不可）。
  //
  // ★ 为什么必须钉宽度 ★
  //   宽度从 24px 过渡到 190px 的**中间过程**里，内容会按当时那个窄宽度重排：
  //   「3680.1万 + 9月30日 token」在中间宽度下先折成两行 → 今日行高 45.3px
  //   → 卡片**膨胀到 92.8px**（比两端 74/61.3 都高），随后单帧**塌缩 21.94px** 回 61.3。
  //   肉眼看到的就是「先鼓一下再猛缩」，而不是平滑变形——这才是「不够顺滑」的真凶
  //   （端点差 12.7px 只是次要因素）。
  //   ⚠️ 光有 `overflow:hidden` **不管用**（卡片本来就有）：它只裁「绘制」，
  //   不阻止 `height:auto` 的盒子按内容长大。「只钉 overflow」与「什么都不做」
  //   会膨胀到**同一个 89.8px**。必须叠加**显式高度**才能约束住。
  //   固定宽 = 卡片 190 − 左右 padding 11×2 − border 1×2 = 166px。
  ".tks-fw[data-min=\"1\"] .tks-fw-head,",
  ".tks-fw[data-min=\"1\"] .tks-fw-today{width:166px;white-space:nowrap;flex-wrap:nowrap}",
  // 停靠态（贴死锚边：鼠标悬停该标识再展开完整窗口）：
  // 贴死锚边的**细条**——内容为「运行状态点 + **竖排今日数字**」。
  // ⚠️ 与旧「吸附小条」的区别（勿回退）：旧版渲染「标题 + 数字」的 168×54 卡片，窄窗下仍遮挡内容。
  // ⚠️ 旧形态是「状态点 + 7 道色阶横杠、**零文字**」：**0 个可读字符**、含义全靠猜。
  //    现改为**竖排今日数字**：一眼可读、横向仍只占 24px。
  // ⚠️ 宽度由 JS 的 FW_PEEK_W 控制（24px），这里只改视觉，避免两处口径漂移。
  // ⚠️ 内边距必须够小：数字行高 18px + 内边距 3×2 + 边框 2 = 24px，超出会被 `overflow:hidden` 裁切。
  // ⚠️ 圆角必须**按停靠边镜像**（否则停靠时会显得「没贴住」）：
  //    旧版写死 `8px 0 0 8px`（只适配贴右缘），而卡片可以停在**左边**——
  //    左贴边时该圆角朝内，视觉上像"没贴住"。停靠边由 JS 写在 `data-dock` 上。
  //    ⚠️ 宽度写死 px 后**必须同步写死高度**（与折叠态成对，动画修复所需）：
  //    理由同 `.tks-fw[data-min="1"]`（auto 不可插值 → 过渡为死代码）。
  //    数值 74 = dock 的 min-height 62 + padding 5×2 + border 1×2。
  ".tks-fw[data-peek=\"1\"]{padding:5px 3px;gap:0;border-radius:8px 0 0 8px;height:74px}",
  ".tks-fw[data-peek=\"1\"][data-dock=\"left\"]{border-radius:0 8px 8px 0}",
  // 停靠标识容器：竖向排列「状态点 + 竖排数字」，整体居中。
  // ⚠️ `min-height` 不可省：竖排文本的高度由**字体度量**决定，
  //    内容只有 1 个字（如「0」）时容器会缩到 32px，细条忽高忽低、且与 FW_DOCK_H 估算不符。
  //    给定 min-height 保证形态稳定（数字变长时由内容自然撑开，不设 max-height）。
  ".tks-fw-dock{display:flex;flex-direction:column;align-items:center;gap:4px;min-height:62px;justify-content:center}",
  // 运行状态点（复用呼吸语义：data-run=1 时有会话在跑）。细条里比展开态稍大，否则 7px 在 24px 宽里不显眼。
  ".tks-fw-dockDot{width:6px;height:6px;min-width:6px;border-radius:50%;background:var(--dsw-alias-label-tertiary,#bbb);flex:none}",
  ".tks-fw-dockDot[data-run=\"1\"]{background:var(--dsw-alias-state-business-primary,#0668d6)}",
  // 竖排今日数字（替代旧的 7 道横杠；改书脊式）。
  // ⚠️ `writing-mode:vertical-rl` + **默认 `text-orientation:mixed`**（书脊式）：
  //    整串数字**横躺**、自上而下读，保持「一个数」的完整形态。
  //    旧版用 `text-orientation:upright` 让数字逐个正立堆叠 → 被拆成一列孤立单字、
  //    小数点夹在中间，读起来不像一个数。
  //    附带收益：文字长度转为竖向高度（直立版明显更高、遮挡更多）。
  // ⚠️ 字号 11px：细条宽 24px 要容纳数字行高，再大就会被 `overflow:hidden` 裁切。
  ".tks-fw-vnum{writing-mode:vertical-rl;text-orientation:mixed;",
  "font-size:11px;font-weight:600;line-height:1;letter-spacing:.02em;",
  "font-variant-numeric:tabular-nums;white-space:nowrap;",
  "color:var(--dsw-alias-label-primary,#111)}",
  // 标题栏：既是拖动把手，也是**唯一**的「悬停展开完整历史」触发区
  //（此前卡片任意位置悬停都会弹面板，扫过热力图时频繁误弹）。cursor:help 提示此处有悬停行为。
  ".tks-fw-head{display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:grab}",
  ".tks-fw-head:hover .tks-fw-title{color:var(--dsw-alias-label-primary,#111)}",
  ".tks-fw-head:active{cursor:grabbing}",
  ".tks-fw-title{font-size:11px;color:var(--dsw-alias-label-tertiary,#888);letter-spacing:.02em}",
  ".tks-fw-dot{width:7px;height:7px;min-width:7px;border-radius:50%;background:var(--dsw-alias-label-tertiary,#bbb);flex:none}",
  ".tks-fw-dot[data-run=\"1\"]{background:var(--dsw-alias-state-business-primary,#0668d6)}",
  // 「设置」入口按钮：一步跳到插件面板的本插件卡片页（完整设置就在该页面上）。
  // ⚠️ 四点约束（缺一就会出问题）：
  //   ① `margin-left:auto` 把它推到右侧、紧邻运行状态圆点（标题栏是 flex + space-between，
  //      不加 auto 会被三等分居中，看着像标题的一部分）；
  //   ② 常驻可见（半透明 + hover 加深）——隐藏式按钮等于没做（曾把复制按钮设成 opacity:0，几乎无人发现）；
  //   ③ **点击目标 24×24、字号 14px**：原为 16×16 + 11px 字号，
  //      低于通用最小点击目标（Windows 建议 ≥24px；官方按钮多为 28~32px），且 0.72 透明度偏淡；
  //   ④ **用负外边距抵消高度，不撑高标题行**：标题行高 16.5px（11px 字号 × 1.5），
  //      若让 24px 按钮把它撑开 → 卡片纵向固定占用 +7px（`FW_CHROME_H_BASE` 91→98）
  //      → 热力图可用高度少 7px（最小尺寸下格子 10→9px）。
  //      改 `margin:-4px 0 -4px auto` 让按钮**外框仍是 16px**：布局零变化、视觉 24×24。
  //      余量：卡片上内边距 9px − 溢出 3.75px = 5.25px；下方 gap 6px − 3.75px = 2.25px，均不重叠。
  ".tks-fw-gear{appearance:none;font:inherit;font-size:14px;line-height:1;cursor:pointer;flex:none;",
  "margin:-4px 0 -4px auto;width:24px;height:24px;padding:0;display:inline-flex;align-items:center;justify-content:center;",
  "border:1px solid transparent;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary,#777);opacity:.85}",
  ".tks-fw-gear:hover{opacity:1;color:var(--dsw-alias-label-primary,#111);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}",
  ".tks-fw-gear:focus-visible{opacity:1;outline:2px solid var(--dsw-alias-state-business-primary,#0668d6);outline-offset:1px}",
  // 数字行居中
  // 数字/标题字号随卡片缩放系数微调（--tks-fw-font-scale 由 JS 写入，默认 1）：
  // 卡片被拖小时字号同步缩小，避免固定 19px 数字撑破窄卡片（否则字体超出容器边框）。
  ".tks-fw-today{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;justify-content:center}",
  ".tks-fw-num{font-size:calc(19px * var(--tks-fw-fs,1));font-weight:600;font-variant-numeric:tabular-nums;line-height:1.2;white-space:nowrap}",
  '.tks-fw-num[data-sel="1"]{color:var(--dsw-alias-state-business-primary,#0668d6)}',
  ".tks-fw-unit{font-size:calc(11px * var(--tks-fw-fs,1));color:var(--dsw-alias-label-tertiary,#888);white-space:nowrap}",
  // 「回今天」按钮：选中历史某日后出现。做成醒目蓝色描边——10px 灰字太弱、几乎注意不到。
  // ⚠️ 不用 margin-left:auto：数字行已改为居中排布，auto 外边距会把按钮推到最右、破坏居中。
  ".tks-fw-back{appearance:none;font:inherit;font-size:11px;line-height:1.5;cursor:pointer;flex:none;",
  "border:1px solid var(--dsw-alias-state-business-primary,#0668d6);border-radius:6px;padding:2px 8px;",
  "background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#0668d6) 10%,transparent);",
  "color:var(--dsw-alias-state-business-primary,#0668d6);font-weight:500;white-space:nowrap}",
  ".tks-fw-back:hover{background:var(--dsw-alias-state-business-primary,#0668d6);color:#fff}",
  // 主窗网格：GitHub 式贡献图 —— **左侧竖排星期标 + 行=星期、列=周**（业内默认竖向形态）。
  // ⚠️ 硬约束（越过后复现下列缺陷）：
  //   ① 最初「6 列 × 11px」但卡片写死 232px → 只占 76px、右侧 2/3 空白；
  //   ② 中途曾改「横排星期标 + 7 列 × 5 行」，违背竖向热力图惯例（已否决）；
  //   ③ 又曾按宽度自适应到 11 周以填满宽 —— 周数过多（已否决）；
  //   ④ 格子封顶 30px / 40px —— 卡片放大后格子不变、比例失真（两次否决）；
  //   ⑤ 现形态：**卡片随内容（width:max-content）+ 8 周 × 7 天 + 未缩放用基准格、缩放后按可用空间自动封顶**。
  //   **必须 `grid-auto-flow:column`**，使同一行恒为同一星期、与左侧标对应。
  // 网格区：**水平居中**。
  // ⚠️ 要居中的是**网格本体**，左侧还有星期标（10px + 间隙 4px = 14px）：
  //    若直接居中「星期标+网格」，网格会偏右 7px（偏差 7.0px）；
  //    若给星期标负 margin，它又会溢出到卡片 padding 外、把卡片挤窄（卡片只剩 160px）。
  //    修法：给 gridWrap 加**左右各 14px 对称 padding**（左侧为星期标预留、右侧对称补偿），
  //    两侧等宽 → 居中后网格本体恰好落在卡片中心；星期标绝对定位在该 padding 区内。
  //    ⚠️ 这 14px×2 已计入 JS 的 FW_CHROME_W（52px），改这里必须同步改常量，否则格子算大、横向溢出。
  ".tks-fw-gridWrap{display:flex;gap:0;align-items:flex-start;justify-content:center;padding:0 14px;position:relative}",
  ".tks-fw-rail{position:absolute;left:0;top:0;display:flex;flex-direction:column;gap:var(--tks-fw-gap,2px);flex:none;width:10px}",
  ".tks-fw-railRow{height:var(--tks-fw-cell,12px);line-height:var(--tks-fw-cell,12px);font-size:9px;text-align:center;color:var(--dsw-alias-label-tertiary,#999)}",
  ".tks-fw-grid{display:grid;grid-auto-flow:column;gap:var(--tks-fw-gap,2px);flex:none}",
  // 键盘可访问：网格可聚焦，聚焦时给可见焦点环（键盘操作时才知道焦点在哪）。
  // ⚠️ 用 :focus-visible 而非 :focus——鼠标点击不该留下焦点环（点方块选日时出现会很脏）；
  //    配一条 :focus{outline:none} 兜底老浏览器（不支持 focus-visible 时不显示环，而非双环）。
  ".tks-fw-grid:focus,.tks-fwp-grid:focus{outline:none}",
  ".tks-fw-grid:focus-visible,.tks-fwp-grid:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#0668d6);outline-offset:3px;border-radius:6px}",
  // 方块圆角随格子尺寸缩放（12px 格 → 3px，30px 格 → 7.5px），避免大格看起来"太尖"
  ".tks-fw-cell{width:var(--tks-fw-cell,12px);height:var(--tks-fw-cell,12px);box-sizing:border-box;",
  "border-radius:max(2px,calc(var(--tks-fw-cell,12px) * .25));",
  "background:transparent;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.3));cursor:pointer}",
  ".tks-fw-cell[data-none=\"1\"]{visibility:hidden;cursor:default}",
  ".tks-fw-cell:not([data-none=\"1\"]):hover{box-shadow:0 0 0 1px var(--dsw-alias-label-secondary,#666)}",
  // 今天：细描边标识（不抢占选中态的高亮）
  '.tks-fw-cell[data-today="1"]{border-color:var(--dsw-alias-label-secondary,#888)}',
  // 选中的那一天：外圈高亮（点击方块后主数字切到该日）
  '.tks-fw-cell[data-sel="1"]{box-shadow:0 0 0 2px var(--dsw-alias-state-business-primary,#0668d6)}',
  // 五档色阶（四分位自适应）：1 最浅 → 4 最深
  ".tks-fw-cell[data-level=\"1\"]{border-color:transparent;background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#0668d6) 24%,transparent)}",
  ".tks-fw-cell[data-level=\"2\"]{border-color:transparent;background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#0668d6) 46%,transparent)}",
  ".tks-fw-cell[data-level=\"3\"]{border-color:transparent;background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#0668d6) 70%,transparent)}",
  ".tks-fw-cell[data-level=\"4\"]{border-color:transparent;background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#0668d6) 94%,transparent)}",
  ".tks-fw-foot{font-size:10px;color:var(--dsw-alias-label-tertiary,#999);display:flex;justify-content:space-between;gap:6px;padding:0 2px}",
  // 图例：「少 ▪▪▪▪▪ 多」说明 5 档色阶含义（此前看不出深浅代表多少）。
  // ⚠️ 色块**不复用 .tks-fw-cell**（复用会让色块依赖图例不控制的 CSS 变量与层叠，
  //    结果是「少/多 中间一片空白」）；色块的几何由 JS inline 写入（见 legendSwatch），
  //    这里只负责**颜色**，且必须与网格色阶（.tks-fw-cell[data-level] 的 4 档 + 无用量档）逐档一致。
  ".tks-fw-legend{display:flex;align-items:center;justify-content:center;gap:5px;font-size:10px;color:var(--dsw-alias-label-tertiary,#999)}",
  ".tks-fw-legend-label{flex:none}",
  ".tks-fw-legend-scale{display:flex;align-items:center;gap:3px;flex:none}",
  ".tks-fw-swatch{border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.3))}",
  ".tks-fw-swatch[data-level=\"1\"]{border-color:transparent;background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#0668d6) 24%,transparent)}",
  ".tks-fw-swatch[data-level=\"2\"]{border-color:transparent;background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#0668d6) 46%,transparent)}",
  ".tks-fw-swatch[data-level=\"3\"]{border-color:transparent;background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#0668d6) 70%,transparent)}",
  ".tks-fw-swatch[data-level=\"4\"]{border-color:transparent;background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#0668d6) 94%,transparent)}",
  // 右下角缩放把手：三条斜纹示意可拖拽；覆盖卡片右下角 16px 区域。
  ".tks-fw-grip{position:absolute;right:0;bottom:0;width:16px;height:16px;cursor:nwse-resize;",
  "background:linear-gradient(135deg,transparent 0 46%,var(--dsw-alias-label-tertiary,#bbb) 46% 54%,transparent 54% 68%,var(--dsw-alias-label-tertiary,#bbb) 68% 76%,transparent 76%);",
  "border-bottom-right-radius:12px;opacity:.55}",
  ".tks-fw-grip:hover{opacity:.95}",
  // —— 悬停展开的完整历史面板（挂在 root 下；固定定位，避免 transform 包含块问题）——
  ".tks-fwp{position:fixed;z-index:120;box-sizing:border-box;pointer-events:auto;padding:12px 14px 13px;",
  "border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.25));border-radius:12px;",
  "background:var(--dsw-alias-bg-layer-2,#fff);box-shadow:0 10px 30px rgba(0,0,0,.2);",
  "color:var(--dsw-alias-label-primary,#111);font-size:12px;line-height:1.5;user-select:none;",
  "animation:tks-fwp-in .14s ease-out}",
  "@keyframes tks-fwp-in{from{opacity:0;transform:translateY(6px) scale(.99)}to{opacity:1;transform:none}}",
  "@media (prefers-reduced-motion:reduce){.tks-fwp{animation:none}}",
  ".tks-fwp-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:8px}",
  ".tks-fwp-title{font-size:13px;font-weight:600}",
  ".tks-fwp-stats{font-size:11px;color:var(--dsw-alias-label-tertiary,#888)}",
  ".tks-fwp-months{position:relative;height:14px;margin-left:14px;font-size:10px;color:var(--dsw-alias-label-tertiary,#888)}",
  ".tks-fwp-month{position:absolute;top:0;white-space:nowrap}",
  ".tks-fwp-body{display:flex;gap:4px;align-items:flex-start;overflow-x:auto;padding-bottom:2px}",
  ".tks-fwp-rail{display:flex;flex-direction:column;gap:2px;flex:none;width:11px}",
  ".tks-fwp-railRow{height:12px;line-height:12px;font-size:9px;text-align:center;color:var(--dsw-alias-label-tertiary,#999)}",
  ".tks-fwp-grid{display:grid;grid-auto-flow:column;grid-template-rows:repeat(7,12px);gap:2px;flex:none}",
  // 面板内方块比主窗略大（12px），色阶与主窗一致
  ".tks-fwp-grid .tks-fw-cell{width:12px;height:12px}",
  // 悬浮小窗的日期气泡（复用分区页 .tks-tip 视觉，但独立类名避免与分区页 tip 状态耦合）
  ".tks-fw-tip{position:fixed;z-index:9999;transform:translate(-50%,-100%);pointer-events:none;width:max-content;",
  "max-width:min(320px,calc(100vw - 24px));background:rgba(28,28,32,.96);color:#f0f0f0;border-radius:8px;",
  "padding:7px 10px;font-size:12px;line-height:18px;word-break:break-all;box-shadow:0 4px 16px rgba(0,0,0,.28)}",
  ".tks-fw-tip-below{transform:translate(-50%,0)}",
  ".tks-fw-tip-detail{color:#b8b8bf;font-size:11px;line-height:16px;margin-top:2px}",
  // 会话运行中缓慢呼吸（蓝色描边明暗渐变）。
  //
  // 旧实现直接动画卡片自身的 `border-color` + `box-shadow`——**这两个属性都无法交给合成器**，
  // 浏览器只能每帧**重绘整张卡片**（含 22px 模糊阴影），
  // 而「只要有会话在跑就一直在烧」——正是边工作边拖窗的时候，手感发涩。
  //
  // 修法：改用 **::after 叠加层 + 只动画 `opacity`**（opacity/transform 是仅有的两个可合成属性）。
  // 同一拖动轨迹下重绘次数大幅下降。
  // ⚠️ 四条约束（缺一即回归或出问题）：
  //   ① 必须 `position:absolute`——卡片是 `display:flex`，非绝对定位的伪元素会**占一个 flex 项**、撑乱布局；
  //   ② 必须 `pointer-events:none`——叠加层铺满全卡，否则会吞掉热力图方块的点击；
  //   ③ 必须 `border-radius:inherit`——跟随卡片圆角，否则四角露出直角描边；
  //   ④ **不得改成动画卡片自身的 opacity**——那会让数字一起变淡（上一轮已明确否决「数字闪烁」）。
  '.tks-fw[data-run="1"]::after{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;',
  "border:1px solid var(--dsw-alias-state-business-primary,#0668d6);opacity:0;",
  "animation:tks-fw-breathe 3.2s ease-in-out infinite}",
  "@keyframes tks-fw-breathe{0%,100%{opacity:0}50%{opacity:.9}}",
  // 减少动态效果：不呼吸，改为常亮蓝框（语义保留，与旧版一致）。
  "@media (prefers-reduced-motion:reduce){.tks-fw[data-run=\"1\"]::after{animation:none;opacity:1}}",
  // 减少动态效果：吸附/展开的过渡**整体关闭**（与上面那条同源）。
  // ⚠️ 必须**单独成一条规则**、不能塞进上面那条的同一个声明块：上面那条的选择器带 `[data-run="1"]`，
  //    只在会话运行中才命中；而过渡降级要求**任何运行状态下都关闭**，混在一起会导致
  //    「会话没跑时仍然播吸附动画」的漏网。
  // 这条是「关」而不是「缩短」：吸附本身就是一次位移+尺寸突变，缩短到 1ms 与直接关掉等价，
  // 不如显式关掉、语义清楚。
  "@media (prefers-reduced-motion:reduce){.tks-fw-anchor,.tks-fw{transition:none}}"
].join("");

if (typeof document !== "undefined") {
  var tagId = "dsh-token-stats";
  if (document.querySelector('style[data-plugin-css="' + tagId + '"]') === null) {
    var styleEl = document.createElement("style");
    styleEl.setAttribute("data-plugin-css", tagId);
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);
  }
}

// ======== 03-format.js ========
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

// ======== 04-cost.js ========
// 分片 04/11 · 费用估算（配置读取解析 + 单价表/时段单价折算 + 套餐配额 + 预算判定）
// 配置持久化形态：localStorage 仅作首帧即时缓存，唯一权威是 $DSH_HOME/token-stats.cfg.json
// 文件（宿主半 GET/POST /token-stats/cfg 路由；弹窗保存由分区页双写）：
//   currency    显示币种 "CNY" | "USD"（新增单价行/金额限额/预算的默认币种）
//   pricesJson  JSON 数组，每项：
//               { key, keys, currency, input, output, cacheRead, cacheWrite, // 默认单价（货币/每百万 token）
//                 tiers: [{ input, output, cacheRead, cacheWrite,        // 价格档：命中时间段时整档覆盖默认价
//                           ranges: [{ s: "HH:MM", e: "HH:MM", days: [0-6] }] }] }
//               一个价格档可绑定多个时间段（days=生效星期，0=周一，空＝全周；支持跨零点如 22:00～06:00）
//               keys=共享定价的其他模型 key（同一份定价套用到多个模型，如同一模型挂在多个 provider 下）；旧配置无 keys 自动按单模型处理
//   budgetCost  日预算（数字，各币种分别比较，任一超标即触发）
//   budgetTokens 日预算（token 数）
//   ignoredModels 已忽略模型 key 数组（JSON 字符串；删除定价行时自动加入，该模型不再出现在
//               候选列表/套餐模型选择里，可随时恢复）——浏览器保存写回，见 10-modal.js
//   plansJson   套餐配额 JSON 数组 [{name, scope:"all"|"provider"|"model", prefix, key,
//               limits: [{unit:"calls"|"tokens"|"cost", period:"month"|"week"|"roll7"|"roll5h", limit}]}]
//               一个套餐（一条订阅）含多条限额——如 OpenCode Go 的 5小时/周/月三层并存；
//               旧版扁平格式（条目上直接带 unit/limit/period）读取时自动迁移为单限额套餐
// 费用不做汇率折算：每种币种各自合计，同时存在时展示为「¥CNY总额 + $USD总额」
// （旧版 rate 字段已废弃：configOf 不再读取，保存不再写入）
var CFG_LS_KEY = "dsh-token-stats.cfg.v1";
var CUR_SYMBOL = { CNY: "¥", USD: "$" };

/** 读取本地原始配置（未持久化过/环境无 localStorage 时返回空对象）。 */
function loadRawConfig() {
  try {
    if (typeof localStorage === "undefined") return {};
    var t = localStorage.getItem(CFG_LS_KEY);
    var o = t ? JSON.parse(t) : {};
    return o && typeof o === "object" ? o : {};
  } catch (e) {
    return {};
  }
}

/** 持久化原始配置（覆盖写；环境无 localStorage 时静默跳过）。 */
function saveRawConfig(raw) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(CFG_LS_KEY, JSON.stringify(raw));
  } catch (e) {}
}

var TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;
/** 日期（YYYY-MM-DD）格式校验，历史价 rates 的 from 用。 */
var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** 百分比清洗：0–999（允许 >100 表示超用），非法/负数归 0。 */
function clampPct(v) {
  var n = toNum(v);
  return n > 999 ? 999 : n;
}

/** 模型 key 的短显示名：provider/ 前缀后的 model 尾段（无斜杠则原样）；按钮、卡片、告警统一用它，完整 key 走悬停。 */
function shortModelName(key) {
  var s = String(key || "");
  var at = s.indexOf("/");
  return at >= 0 ? s.slice(at + 1) : s;
}

/** 解析限额条目的模型额度明细：key 非空且条内唯一、额度 >0 才有效；返回 [{key, limit, basePct, anchorPct}]。 */
function parseQuotaItems(list) {
  var items = [];
  if (!Array.isArray(list)) return items;
  var seen = [];
  for (var i = 0; i < list.length; i++) {
    var it = list[i];
    if (!it || typeof it.key !== "string" || it.key.trim() === "") continue;
    var k = it.key.trim();
    if (seen.indexOf(k) !== -1) continue;
    var lim = toNum(it.limit);
    if (!(lim > 0)) continue;
    seen.push(k);
    items.push({ key: k, limit: lim, basePct: clampPct(it.basePct), anchorPct: clampPct(it.anchorPct) });
  }
  return items;
}

/** 数字清洗（价格/预算/汇率输入）：全角数字/全角点/千分位逗号 → 半角后 Number；非法或负数返回 0。 */
function toNum(v) {
  var s = String(v === undefined || v === null ? "" : v)
    .trim()
    .replace(/[０-９]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) - 65248); })
    .replace(/．/g, ".")
    .replace(/,/g, "");
  var n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** 从设置快照 value 解析费用配置；字段缺省/非法一律回退安全默认值。 */
function configOf(raw) {
  var o = raw && typeof raw === "object" ? raw : {};
  var currency = o.currency === "USD" ? "USD" : "CNY";
  var prices = {};
  try {
    var list = JSON.parse(typeof o.pricesJson === "string" && o.pricesJson !== "" ? o.pricesJson : "[]");
    if (Array.isArray(list)) {
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p || typeof p.key !== "string" || p.key === "") continue;
        // 共享定价：keys = 除主 key 外同样套用这份定价的模型 key（去重去空，主 key 恒在首位）
        var keys = [p.key];
        if (Array.isArray(p.keys)) {
          for (var ki = 0; ki < p.keys.length; ki++) {
            var ek = p.keys[ki];
            if (typeof ek === "string" && ek !== "" && keys.indexOf(ek) === -1) keys.push(ek);
          }
        }
        var tiers = [];
        if (Array.isArray(p.tiers)) {
          for (var j = 0; j < p.tiers.length; j++) {
            var tw = p.tiers[j];
            if (!tw) continue;
            var ranges = [];
            if (Array.isArray(tw.ranges)) {
              for (var k2 = 0; k2 < tw.ranges.length; k2++) {
                var rg = tw.ranges[k2];
                if (!rg || !TIME_RE.test(String(rg.s || "")) || !TIME_RE.test(String(rg.e || ""))) continue;
                var days = Array.isArray(rg.days)
                  ? rg.days.filter(function (d) { return Number.isInteger(d) && d >= 0 && d <= 6; })
                  : [];
                if (days.length === 7) days = []; // 全周等价于不限星期
                ranges.push({ s: String(rg.s), e: String(rg.e), days: days });
              }
            }
            tiers.push({ input: toNum(tw.input), output: toNum(tw.output), cacheRead: toNum(tw.cacheRead), cacheWrite: toNum(tw.cacheWrite), ranges: ranges });
          }
        }
        // 历史价 rates（新增）：按「生效起始日」记录历代单价，避免改价后**历史费用被重算漂移**。
        // 形态 [{ from: "YYYY-MM-DD", input, output, cacheRead, cacheWrite }]；date 早于全部 from 的用默认价。
        var rates = [];
        if (Array.isArray(p.rates)) {
          for (var ri = 0; ri < p.rates.length; ri++) {
            var rt = p.rates[ri];
            if (!rt || !DATE_RE.test(String(rt.from || ""))) continue;
            rates.push({
              from: String(rt.from),
              input: toNum(rt.input),
              output: toNum(rt.output),
              cacheRead: toNum(rt.cacheRead),
              cacheWrite: toNum(rt.cacheWrite)
            });
          }
          rates.sort(function (a, b) { return a.from < b.from ? -1 : a.from > b.from ? 1 : 0; });
        }
        prices[p.key] = {
          keys: keys,
          currency: p.currency === "USD" ? "USD" : "CNY",
          input: toNum(p.input),
          output: toNum(p.output),
          cacheRead: toNum(p.cacheRead),
          cacheWrite: toNum(p.cacheWrite),
          tiers: tiers,
          rates: rates
        };
      }
    }
  } catch (e) {
    /* pricesJson 损坏：按未配置处理 */
  }
  var bc = toNum(o.budgetCost);
  var bt = toNum(o.budgetTokens);
  // 模型图表颜色覆盖 { key: "#rrggbb" }（模型用量分布的色块点击配置；非法值忽略）
  var colors = {};
  try {
    var cj = JSON.parse(typeof o.colorsJson === "string" && o.colorsJson !== "" ? o.colorsJson : "{}");
    if (cj && typeof cj === "object") {
      for (var ck in cj) {
        var cv = cj[ck];
        if (typeof ck === "string" && ck !== "" && /^#[0-9a-fA-F]{6}$/.test(String(cv))) colors[ck] = String(cv).toLowerCase();
      }
    }
  } catch (e) {
    /* colorsJson 损坏：按未配置处理 */
  }
  // 已忽略模型（删除定价行时自动加入，配置文件持久化；候选池不再列出，可随时恢复）
  var ignored = [];
  try {
    var il = JSON.parse(typeof o.ignoredModels === "string" && o.ignoredModels !== "" ? o.ignoredModels : "[]");
    if (Array.isArray(il)) {
      for (var ii2 = 0; ii2 < il.length; ii2++) {
        var ik = il[ii2];
        if (typeof ik === "string" && ik !== "" && ignored.indexOf(ik) === -1) ignored.push(ik);
      }
    }
  } catch (e) {
    /* ignoredModels 损坏：按无忽略处理 */
  }
  var plans = [];
  try {
    var pl = JSON.parse(typeof o.plansJson === "string" && o.plansJson !== "" ? o.plansJson : "[]");
    if (Array.isArray(pl)) {
      for (var pi = 0; pi < pl.length; pi++) {
        var q = pl[pi];
        if (!q) continue;
        // 一条套餐含多条限额；旧版扁平格式（条目自带 unit/limit/period）迁移为单限额套餐
        var rawLimits = Array.isArray(q.limits) ? q.limits : [q];
        var limits = [];
        for (var li = 0; li < rawLimits.length; li++) {
          var L = rawLimits[li];
          if (!L) continue;
          var lim = toNum(L.limit);
          // limit 允许为 0（不设总限量、只用模型额度明细）；limit>0 时才产出通用限额行
        limits.push({
          unit: L.unit === "tokens" || L.unit === "cost" ? L.unit : "calls",
          period: L.period === "week" || L.period === "roll7" || L.period === "roll5h" ? L.period : "month",
          limit: lim,
          // 金额限额在配置时固定币种，不随显示币种切换改变含义（缺省按当时显示币种）
          cur: L.unit === "cost" ? (L.cur === "USD" || L.cur === "CNY" ? L.cur : currency) : null,
          // 当前已用百分比（填订阅站显示值，含本机已耗部分）；anchorPct = 保存时自动记录的本机周期用量%，
          // 显示比例 = (basePct − anchorPct) + 本机实时用量/限量，即「填写的值 + 填写之后本机的新增」；允许 >100（超用）
          basePct: clampPct(L.basePct),
          anchorPct: clampPct(L.anchorPct),
          // 模型额度明细（共享总额度池）：各模型独立额度与当前已用%，总使用率 = 各模型使用率相加
          items: parseQuotaItems(L.items)
        });
        }
        plans.push({
          name: typeof q.name === "string" && q.name !== "" ? q.name : "套餐",
          scope: q.scope === "provider" || q.scope === "model" ? q.scope : "all",
          prefix: typeof q.prefix === "string" ? q.prefix : "",
          key: typeof q.key === "string" ? q.key : "",
          limits: limits
        });
      }
    }
  } catch (e) {
    /* plansJson 损坏：按未配置处理 */
  }
  return {
    currency: currency,
    prices: prices,
    budgetCost: bc > 0 ? bc : null,
    budgetTokens: bt > 0 ? bt : null,
    colors: colors,
    ignored: ignored,
    plans: plans
  };
}

/** 是否配置了任意时段价格档。 */
function anySegs(cfg) {
  for (var k in cfg.prices) {
    if (cfg.prices[k].tiers.length > 0) return true;
  }
  return false;
}

/** 是否需要宿主返回「日×模型×小时」明细：配置了时段单价，或任一套餐限额使用「滚动 5 小时」周期（其用量计算依赖 hours）。 */
function needHours(cfg) {
  if (anySegs(cfg)) return true;
  var plans = (cfg && cfg.plans) || [];
  for (var pi = 0; pi < plans.length; pi++) {
    var limits = plans[pi].limits || [];
    for (var li = 0; li < limits.length; li++) {
      if (limits[li].period === "roll5h") return true;
    }
  }
  return false;
}

/** 模型是否配置了单价（主 key 直查；共享定价条目按 keys 二次扫描命中）。 */
function priceOf(cfg, key) {
  if (!key) return null;
  var p = cfg.prices[key];
  if (p) return p;
  for (var k in cfg.prices) {
    var e = cfg.prices[k];
    if (e.keys && e.keys.indexOf(key) !== -1) return e;
  }
  return null;
}

/** "HH:MM" → 当日分钟数。 */
function toMin(t) {
  var p = String(t).split(":");
  return Number(p[0]) * 60 + Number(p[1]);
}

/** 本地日期 "YYYY-MM-DD" → 星期序号（0=周一…6=周日）；非法返回 null。 */
function weekdayOf(dateStr) {
  var t = tsOfDay(dateStr);
  if (!Number.isFinite(t)) return null;
  return (new Date(t).getDay() + 6) % 7;
}

/** 时间段（含星期适用范围）是否覆盖小时桶 h（0-23）+ 当天星期 dow；支持跨零点；days 空＝不限星期。 */
function rangeMatches(range, h, dow) {
  if (range.days.length > 0 && (dow === null || range.days.indexOf(dow) === -1)) return false;
  var lo = h * 60;
  var hi = h * 60 + 59;
  var sm = toMin(range.s);
  var em = toMin(range.e);
  if (sm <= em) return hi >= sm && lo <= em;
  return hi >= sm || lo <= em;
}

/** 默认价四项是否全为 0（用于"只配了价格档没填默认价"时的估算兜底）。 */
function baseAllZero(p) {
  return p.input === 0 && p.output === 0 && p.cacheRead === 0 && p.cacheWrite === 0;
}

/**
 * 按日期选历史价（rates）：取 `from ≤ date` 的**最后一条**（from 已按升序排列）；
 * 无匹配（date 早于全部 from）或未配 rates 时返回该条目自身（= 默认价）。
 *
 * 新增，解决「改价后历史费用被重算」：定价条目只存当前价时，一旦改价，
 * 所有历史日期的费用都会按新价重算、总费用凭空跳变。配上 rates 后，历史日期按当时的价算。
 * @param p 定价条目（含 rates 与默认价四项）。
 * @param date "YYYY-MM-DD"；缺省时返回默认价（无日期上下文无法选历史价）。
 */
function priceAtDate(p, date) {
  if (!p || !date || !p.rates || p.rates.length === 0) return p;
  var hit = null;
  for (var i = 0; i < p.rates.length; i++) {
    if (p.rates[i].from <= date) hit = p.rates[i];
    else break;
  }
  if (hit === null) return p; // 早于全部 from：用默认价（当作"最初的价格"）
  return {
    currency: p.currency,
    input: hit.input,
    output: hit.output,
    cacheRead: hit.cacheRead,
    cacheWrite: hit.cacheWrite,
    tiers: p.tiers,
    keys: p.keys,
    rates: p.rates
  };
}

/** 取一行用量应套用的价格档（配置顺序第一条命中的价格档；都不命中用默认价）。
 *  row 无小时桶（范围查询/周期桶的聚合行）时无法做时段匹配：若默认价全 0 但配了价格档，
 *  按第一个价格档估算（标注为估算值），避免"只填了档价没填默认价"时费用恒显示 0。
 *  row.date 存在且该条目配了历史价 rates 时，先按日期取当时的价，再在其中套时段档。 */
function priceFor(cfg, key, h, dow, date) {
  var base = priceOf(cfg, key);
  if (!base) return null;
  var p = priceAtDate(base, date);
  if (typeof h === "number" && p.tiers.length > 0) {
    for (var i = 0; i < p.tiers.length; i++) {
      var tier = p.tiers[i];
      for (var j = 0; j < tier.ranges.length; j++) {
        if (rangeMatches(tier.ranges[j], h, dow)) return tier;
      }
    }
  } else if (typeof h !== "number" && baseAllZero(p) && p.tiers.length > 0) {
    return p.tiers[0];
  }
  return p;
}

/**
 * 按单价表折算一行用量的费用，返回单币种费用映射 { CNY|USD: 金额 }（金额为该行配置币种的数值，
 * 不做汇率折算；跨币种合计由调用方按币种分别累计，展示为「¥X + $Y」）。
 * row 需含 key 与 input/output/cacheRead/cacheWrite；row.h（0-23 小时桶，来自 hours 明细）与
 * row.date 存在且该模型配了价格档时，按"小时+星期"命中价格档整档覆盖默认价。
 * **row.date 同时用于选历史价**（条目配了 rates 时按该日取当时的价，改价不会让历史费用漂移）。
 * 未配置单价返回 null。
 */
function costOf(cfg, row) {
  var p = priceOf(cfg, row.key);
  if (!p) return null;
  var dow = row.date ? weekdayOf(row.date) : null;
  var price = priceFor(cfg, row.key, row.h, dow, row.date);
  var cost =
    ((row.input || 0) * price.input +
      (row.output || 0) * price.output +
      (row.cacheRead || 0) * price.cacheRead +
      (row.cacheWrite || 0) * price.cacheWrite) /
    1e6;
  var out = {};
  out[p.currency] = cost;
  return out;
}

/** 双币种费用映射相加（b 缺省字段保持 a 的值；任一为 null 时返回另一份浅拷贝）。 */
function addCostMap(a, b) {
  if (!a) return b ? { CNY: b.CNY || 0, USD: b.USD || 0 } : null;
  if (!b) return { CNY: a.CNY || 0, USD: a.USD || 0 };
  return { CNY: (a.CNY || 0) + (b.CNY || 0), USD: (a.USD || 0) + (b.USD || 0) };
}

/** 双币种费用映射格式化：「¥X + $Y」（固定人民币在前、美元在后；只显示非零币种；全零/空返回 null）。 */
function fmtCostMix(m) {
  if (!m) return null;
  var parts = [];
  if (m.CNY > 0) parts.push(fmtCost(m.CNY, "CNY"));
  if (m.USD > 0) parts.push(fmtCost(m.USD, "USD"));
  return parts.length > 0 ? parts.join(" + ") : null;
}

/** 有无任何单价配置。 */
function hasPrices(cfg) {
  for (var k in cfg.prices) return true;
  return false;
}

/**
 * 每日费用映射 { 本地日期: {CNY,USD} }。useHours 且 hours 明细存在时按小时桶×时段单价精确折算；
 * 否则用日×模型明细 × 默认单价近似（配置了时段单价但 hours 尚未返回时会有偏差，下次轮询自动校正）。
 */
function costByDay(modelByDay, hours, cfg, useHours) {
  var out = {};
  var src = useHours && hours ? hours : modelByDay;
  for (var i = 0; i < src.length; i++) {
    var e = src[i];
    var c = costOf(cfg, e);
    if (c === null) continue;
    out[e.date] = addCostMap(out[e.date], c);
  }
  return out;
}

/** 按 hours 明细精确聚合的各模型费用 { key: {CNY,USD} }（「累计」页签行用；无 hours 返回 null）。 */
function modelCostsFromHours(hours, cfg) {
  if (!hours) return null;
  var out = {};
  for (var i = 0; i < hours.length; i++) {
    var e = hours[i];
    var c = costOf(cfg, e);
    if (c === null) continue;
    out[e.key] = addCostMap(out[e.key], c);
  }
  return out;
}

/** 双口径预算判定：token 总量与各币种费用分别比较，任一超标即超标（预算数字对各币种通用）。 */
function isOverBudget(costMap, total, cfg) {
  if (cfg.budgetTokens !== null && total > cfg.budgetTokens) return true;
  if (cfg.budgetCost !== null && costMap) {
    if ((costMap.CNY || 0) > cfg.budgetCost) return true;
    if ((costMap.USD || 0) > cfg.budgetCost) return true;
  }
  return false;
}

//#region 套餐配额（订阅制套餐：月/周/滚动窗的次数、token 或金额限量）

var QUOTA_DAY_MS = 86_400_000;
var QUOTA_PERIOD_LABELS = { month: "本月", week: "本周", roll7: "近7天", roll5h: "近5小时" };
var QUOTA_UNIT_LABELS = { calls: "调用次数", tokens: "Token 量", cost: "费用" };

/** 配额条目的模型范围匹配：all=全部；provider=模型 key 前缀；model=精确 key。 */
function quotaScopeMatch(plan, key) {
  if (plan.scope === "provider") return plan.prefix !== "" && key.indexOf(plan.prefix) === 0;
  if (plan.scope === "model") return plan.key !== "" && key === plan.key;
  return true;
}

/** 配额计量：按单位取一行用量的值（cost 取该限额固定币种的费用，未配价或该币种无消耗计 0）。 */
function quotaUnitValue(plan, cfg, entry) {
  if (plan.unit === "calls") return entry.calls || 0;
  if (plan.unit === "tokens") return entry.total || 0;
  var c = costOf(cfg, entry);
  return c ? c[plan.cur || cfg.currency] || 0 : 0;
}

/**
 * 周期窗口内按 matchFn 匹配模型的本机用量（computeQuotas 与配置弹窗锚点计算共用同一口径）：
 * month/week 按自然周期（周一起）、roll7 取最近 7 天（含今天），基于「日×模型」明细；
 * roll5h 取最近 5 个小时桶（含当前小时），基于 hours 明细。
 * L 只用 unit/period/cur 三个字段（通用限额条目或 {unit,period,cur} 形状均可）。
 */
function quotaPeriodUsage(L, matchFn, summary, cfg) {
  if (!summary) return 0;
  var usage = 0;
  if (L.period === "roll5h") {
    var hoursAll = summary.hours || [];
    var now = Date.now();
    for (var k = 0; k < 5; k++) {
      var t = new Date(now - k * 3600_000);
      var d = dsOfDate(t);
      var hh = t.getHours();
      for (var m = 0; m < hoursAll.length; m++) {
        var e = hoursAll[m];
        if (e.date === d && e.h === hh && matchFn(e.key)) usage += quotaUnitValue(L, cfg, e);
      }
    }
    return usage;
  }
  var days = summary.days || [];
  if (days.length === 0) return 0;
  var lastDate = days[days.length - 1].date;
  var mbd = summary.modelByDay || [];
  var fromKey;
  if (L.period === "month") fromKey = lastDate.slice(0, 7) + "-01";
  else if (L.period === "week") fromKey = dsOfDate(mondayOf(lastDate));
  else fromKey = dsOfDate(new Date(tsOfDay(lastDate) - 6 * QUOTA_DAY_MS));
  for (var n = 0; n < mbd.length; n++) {
    var e2 = mbd[n];
    if (e2.date < fromKey || e2.date > lastDate) continue;
    if (!matchFn(e2.key)) continue;
    usage += quotaUnitValue(L, cfg, e2);
  }
  return usage;
}

/** 已用比例 = 外部基线（填写的当前已用% − 保存时锚点%）+ 本机实时用量/限量；负值（跨周期重置）钳为 0。 */
function quotaRatio(row, usage, limit) {
  var ext = Math.max(0, (row.basePct || 0) - (row.anchorPct || 0)) / 100;
  return ext + usage / limit;
}

/**
 * 计算各套餐各限额的本期已用。每条限额可产出三类行（kind 字段区分）：
 * - plan：通用限额行（scope 范围匹配，limit>0 时）；
 * - model：模型额度明细行（items 内各模型精确 key 匹配、独立额度、独立比例）；
 * - sum：共享总额度汇总行（总使用率 = 各模型使用率相加，可 >100%，附最高单项与超限模型清单）。
 * 返回 [{plan, rows:[…]}]（无有效行产出为空数组）。
 */
function computeQuotas(plans, summary, cfg) {
  var out = [];
  if (!summary || !summary.days || summary.days.length === 0 || !plans || plans.length === 0) return out;
  for (var i = 0; i < plans.length; i++) {
    var p = plans[i];
    if (!p.limits || p.limits.length === 0) continue;
    var rows = [];
    for (var li = 0; li < p.limits.length; li++) {
      var L = p.limits[li];
      var periodLabel = QUOTA_PERIOD_LABELS[L.period] || L.period;
      // 通用限额行：scope 范围内全部模型共享一份限量
      if (L.limit > 0) {
        var usage = quotaPeriodUsage(L, function (k) {
          return quotaScopeMatch(p, k);
        }, summary, cfg);
        // 金额限额固定币种：只累计该币种的费用（不跨币种折算）
        // 漏计提示：金额限额范围内存在未配单价模型时，其调用不计入金额（统计不完整）
        var unpricedCount = 0;
        if (L.unit === "cost" && summary.models) {
          for (var mi = 0; mi < summary.models.length; mi++) {
            var mk2 = summary.models[mi].key;
            if (quotaScopeMatch(p, mk2) && !priceOf(cfg, mk2)) unpricedCount++;
          }
        }
        rows.push({
          kind: "plan",
          unit: L.unit,
          periodLabel: periodLabel,
          usage: usage,
          limit: L.limit,
          basePct: L.basePct || 0,
          anchorPct: L.anchorPct || 0,
          ratio: quotaRatio(L, usage, L.limit),
          cur: L.cur || null,
          unpricedCount: unpricedCount
        });
      }
      // 模型额度明细行 + 共享总额度汇总行（总使用率 = 各模型使用率相加）
      if (L.items && L.items.length > 0) {
        var sumRatio = 0;
        var maxRatio = 0;
        var overKeys = [];
        for (var ii = 0; ii < L.items.length; ii++) {
          var it = L.items[ii];
          var u2 = quotaPeriodUsage({ unit: L.unit, period: L.period, cur: L.cur }, function (k2) {
            return k2 === it.key;
          }, summary, cfg);
          var r2 = quotaRatio(it, u2, it.limit);
          rows.push({
            kind: "model",
            key: it.key,
            unit: L.unit,
            periodLabel: periodLabel,
            usage: u2,
            limit: it.limit,
            basePct: it.basePct || 0,
            anchorPct: it.anchorPct || 0,
            ratio: r2,
            cur: L.cur || null,
            unpriced: L.unit === "cost" && !priceOf(cfg, it.key)
          });
          sumRatio += r2;
          if (r2 > maxRatio) maxRatio = r2;
          if (r2 >= 1) overKeys.push(shortModelName(it.key));
        }
        rows.push({
          kind: "sum",
          unit: L.unit,
          periodLabel: periodLabel,
          ratio: sumRatio,
          maxRatio: maxRatio,
          overKeys: overKeys,
          count: L.items.length,
          cur: L.cur || null
        });
      }
    }
    if (rows.length > 0) out.push({ plan: p, rows: rows });
  }
  return out;
}

/** 配额用量格式化：次数取整、token 用中文单位、费用带币种符号。 */
function fmtQuota(unit, v, currency) {
  if (unit === "calls") return String(Math.round(v)) + " 次";
  if (unit === "tokens") return fmtTokens(v);
  return fmtCost(v, currency);
}
//#endregion

/** 费用格式化：¥12.34 / $0.0021（<1 时保留 4 位小数）。 */
function fmtCost(v, currency) {
  var sym = CUR_SYMBOL[currency] || "";
  if (!(typeof v === "number" && v > 0)) return sym + "0";
  return sym + (v >= 100 ? v.toFixed(0) : v >= 1 ? v.toFixed(2) : v.toFixed(4));
}

// ======== 05-dayseries.js ========
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

// ======== 06-tip.js ========
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

// ======== 07a-view-cards.js ========
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

// ======== 07b-view-heatmap.js ========
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

// ======== 07c-view-models.js ========
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

// ======== 07d-view-session.js ========
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

// ======== 08-export.js ========
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

// ======== 09-pickers.js ========
// 分片 09/11 · 通用浮层选取控件（CheckPicker 勾选多选 / ModelPickButton 单选按钮）
/** 勾选多选面板：悬浮（CSS :hover）预开，点击按钮「钉住」（再点按钮或点击面板外关闭）；带搜索过滤，勾选即时回调。
 *  面板为绝对定位浮层（不挤压布局）；搜索框为面板内局部 state。
 *  options 项：{ value, checked, disabled }；disabled 项（如行主模型）勾选框置灰不可点。 */
function CheckPicker(props) {
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
  var qSt = useState("");
  var q = qSt[0];
  var setQ = qSt[1];
  var mSt = useState("");
  var manual = mSt[0];
  var setManual = mSt[1];
  var all = props.options || [];
  var items = q === "" ? all : all.filter(function (o) { return o.value.indexOf(q) !== -1; });
  return h(
    "div",
    { className: "tks-pick" + (open ? " tks-pick-open" : ""), "data-marker": props.marker || null, ref: rootRef },
    h(
      "button",
      {
        type: "button",
        className: "tks-btn",
        title: props.title,
        onClick: function () { setOpen(!open); }
      },
      props.label
    ),
    h(
      "div",
      { className: "tks-pick-panel" + (open ? " tks-panel-open" : "") },
      h("input", {
        className: "tks-pick-search",
        placeholder: "搜索模型 key…",
        value: q,
        onChange: function (e) { setQ(e.target.value); }
      }),
      items.length === 0 ? h("span", { className: "tks-pick-empty" }, props.emptyText || "无候选模型") : null,
      items.map(function (o) {
        return h(
          "label",
          { key: o.value, className: "tks-pick-item" + (o.disabled ? " tks-pick-item-off" : "") },
          h("input", {
            type: "checkbox",
            checked: !!o.checked,
            disabled: !!o.disabled,
            onChange: function () { if (!o.disabled && props.onToggle) props.onToggle(o.value); }
          }),
          o.value
        );
      }),
      props.onManual
        ? h(
            "div",
            { className: "tks-pick-manual", key: "manual" },
            h("input", {
              className: "tks-pick-search",
              style: { marginBottom: "0", flex: "1 1 110px", minWidth: "0" },
              placeholder: "手动输入 key（备用）",
              title: "候选池之外的模型可在此手动输入（一般无需使用：候选已含日志出现过的与模型配置里的全部模型）",
              value: manual,
              onChange: function (e) { setManual(e.target.value); }
            }),
            h(
              "button",
              {
                type: "button",
                className: "tks-btn",
                onClick: function () {
                  var k = manual.trim();
                  if (k === "" || !props.onManual) return;
                  props.onManual(k);
                  setManual("");
                }
              },
              "添加"
            )
          )
        : null
    )
  );
}

/** 共享模型胶囊组已删除：改为模型名旁「模型 ×N」徽标的勾选面板（CheckPicker），悬浮展开为纯 CSS 浮层（不挤压布局、无闪烁）。 */

/** 模型单选按钮（所有"选择一个模型"场景的统一控件）：按钮只显示短名（key 的 model 尾段，
 *  超宽省略号截断），悬停 title 显示完整 key；点击弹出悬浮单选面板（带搜索），点选即回填并关闭。
 *  props：{ value, options:[key…], onChange(key), style }；当前选中的 key 即使不在 options 里也正常显示。 */
function ModelPickButton(props) {
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
  var qSt = useState("");
  var q = qSt[0];
  var setQ = qSt[1];
  var value = props.value || "";
  var all = props.options || [];
  var items = q === "" ? all : all.filter(function (o) { return o.indexOf(q) !== -1; });
  var short = shortModelName(value);
  return h(
    "div",
    { className: "tks-pick" + (open ? " tks-pick-open" : ""), ref: rootRef },
    h(
      "button",
      {
        type: "button",
        className: "tks-btn tks-mpick-btn",
        style: props.style,
        title: value !== "" ? "模型：" + value + "（点击更换）" : "选择模型（点击弹出候选列表）",
        onClick: function () { setOpen(!open); }
      },
      h("span", { className: "tks-mpick-txt" }, short === "" ? "选择模型…" : short)
    ),
    h(
      "div",
      { className: "tks-pick-panel" + (open ? " tks-panel-open" : "") },
      h("input", {
        className: "tks-pick-search",
        placeholder: "搜索模型 key…",
        value: q,
        onChange: function (e) { setQ(e.target.value); }
      }),
      items.length === 0 ? h("span", { className: "tks-pick-empty" }, "无候选模型") : null,
      items.map(function (k) {
        var on = k === value;
        return h(
          "button",
          {
            key: k,
            type: "button",
            className: "tks-pick-item tks-mpick-item" + (on ? " tks-mpick-item-on" : ""),
            title: k,
            onClick: function () {
              setOpen(false);
              if (!on && props.onChange) props.onChange(k);
            }
          },
          k
        );
      })
    )
  );
}

// ======== 10-modal.js ========
// 分片 10/11 · 费用单价配置弹窗（PricingModal，独立模态，不在设置分区页内堆表单）
/**
 * 数据模型：每模型 = 默认单价 + 若干「价格档」；一个价格档（一组四项单价）可绑定多个时间段
 * （各自带星期适用范围），命中任一时间段即整档覆盖默认价。
 * 所有编辑都通过 update(深拷贝) + 索引路径落地（禁止闭包捕获渲染期数组，避免改到旧对象）。
 * 保存组装原始配置对象交给 props.onSave（由分区页持久化：localStorage 即时缓存 + 写回配置文件 token-stats.cfg.json）；props.onSave 缺失（测试渲染）时保存按钮置灰。
 * 布局：头部（标题+?完整说明+关闭）/ 弹性主区（模型定价为主、套餐配额其后，内部滚动）/ 固定底栏（币种+预算+保存）。
 */

function PricingModal(props) {
  var init = useState(function () {
    var cfg = configOf(props.cfgRaw);
    var rows = Object.keys(cfg.prices).map(function (k) {
      var p = cfg.prices[k];
      return {
        key: k,
        keys: (p.keys || []).filter(function (x) { return x !== k; }), // 共享定价的其他模型（主 key 之外）
        currency: p.currency,
        input: String(p.input),
        output: String(p.output),
        cacheRead: String(p.cacheRead),
        cacheWrite: String(p.cacheWrite),
        tiers: p.tiers.map(function (tw) {
          return {
            input: String(tw.input),
            output: String(tw.output),
            cacheRead: String(tw.cacheRead),
            cacheWrite: String(tw.cacheWrite),
            ranges: tw.ranges.map(function (rg) {
              return { s: rg.s, e: rg.e, days: rg.days.slice() };
            })
          };
        }),
        // 历史价：按生效起始日记录历代单价，改价不让历史费用漂移。
        // ⚠️ 必须在这里读入、并在 save() 里原样写回——否则用户开一次弹窗保存就把历史价抹掉了。
        rates: (p.rates || []).map(function (rt) {
          return { from: rt.from, input: String(rt.input), output: String(rt.output), cacheRead: String(rt.cacheRead), cacheWrite: String(rt.cacheWrite) };
        }),
        ratesOpen: false,
        open: false
      };
    });
    var plans = (cfg.plans || []).map(function (q) {
      return {
        name: q.name,
        scope: q.scope,
        prefix: q.prefix,
        key: q.key,
        limits: (q.limits || []).map(function (L) {
          // 「当前已用%」输入框预填插件当前显示的总已用% = 外部基线(basePct−anchorPct) + 本机周期用量%，
          // 用户照抄订阅站显示值覆盖保存即可重新锚定；summary 快照不可用时退化为基线值
          var sumSnap = props.summary || null;
          function shownPct(row, limit, matchFn) {
            var u = sumSnap ? quotaPeriodUsage({ unit: L.unit, period: L.period, cur: L.cur }, matchFn, sumSnap, cfg) : 0;
            var shown = Math.max(0, (row.basePct || 0) - (row.anchorPct || 0)) + (limit > 0 ? (u / limit) * 100 : 0);
            return shown > 0 ? String(Math.round(shown * 10) / 10) : "";
          }
          return {
            unit: L.unit,
            period: L.period,
            limit: L.limit > 0 ? String(L.limit) : "",
            cur: L.cur || cfg.currency,
            basePct: shownPct(L, L.limit, function (k) { return quotaScopeMatch(q, k); }),
            items: (L.items || []).map(function (it) {
              return {
                key: it.key,
                limit: String(it.limit),
                basePct: shownPct(it, it.limit, function (k2) { return k2 === it.key; })
              };
            }),
            itemsOpen: (L.items || []).length > 0
          };
        })
      };
    });
    return {
      currency: cfg.currency,
      budgetCost: cfg.budgetCost === null ? "" : String(cfg.budgetCost),
      budgetTokens: cfg.budgetTokens === null ? "" : String(cfg.budgetTokens),
      rows: rows,
      plans: plans,
      ignored: (cfg.ignored || []).slice()
    };
  });
  var form = init[0];
  var setForm = init[1];
  var errSt = useState(null);
  var errMsg = errSt[0];
  var setErrMsg = errSt[1];
  var savedSt = useState(false);
  var saved = savedSt[0];
  var setSaved = savedSt[1];
  var canSave = typeof props.onSave === "function";

  var knownAll = props.known || [];
  var providers = Array.isArray(props.providers) ? props.providers : null; // null=模型配置不可读（拉取失败/测试环境）
  var cfgLive = configOf(props.cfgRaw); // 锚点/时段判断用的最新配置快照（form 编辑态之外的独立只读视图）

  /** 已忽略模型 key 集合（删除定价行时自动加入；候选池不再列出，可在「已忽略」区恢复）。 */
  var ignoredSet = form.ignored || [];

  /** 已知模型 key（过滤已忽略项）：套餐「指定模型」下拉与模型候选池共用。 */
  var known = knownAll.filter(function (k) { return ignoredSet.indexOf(k) === -1; });

  /** 可选模型池 = 日志出现过的 key + 模型配置里各 provider × model 合成的 key（去重，过滤已忽略项）。 */
  var modelPool = known.slice();
  (providers || []).forEach(function (g) {
    (g.modelIds || []).forEach(function (mid) {
      if (typeof mid !== "string" || mid === "") return;
      var fk = g.id + "/" + mid;
      if (ignoredSet.indexOf(fk) === -1 && modelPool.indexOf(fk) === -1) modelPool.push(fk);
    });
  });

  /** 已被任一定价行覆盖的 key 集合（主 key + 共享 keys）。 */
  function coveredKeys(f) {
    var set = [];
    f.rows.forEach(function (r) {
      if (r.key !== "" && set.indexOf(r.key) === -1) set.push(r.key);
      (r.keys || []).forEach(function (k) {
        if (set.indexOf(k) === -1) set.push(k);
      });
    });
    return set;
  }

  /** 尚未配置定价的可选模型（池 − 已覆盖），供"添加模型"与"共享到其他模型"下拉。 */
  function availableKeys(f) {
    var cov = coveredKeys(f);
    return modelPool.filter(function (k) { return cov.indexOf(k) === -1; });
  }

  var unpriced = availableKeys(form);

  function update(mutate) {
    setSaved(false); // 再次编辑后撤销"已保存"提示
    setForm(function (prev) {
      var next = JSON.parse(JSON.stringify(prev));
      mutate(next);
      return next;
    });
  }

  /** 以下索引路径辅助：i=模型 / ti=价格档 / ri=时间段，全部作用于深拷贝后的 next。 */
  function setRow(i, mut) {
    update(function (f) {
      mut(f.rows[i]);
    });
  }
  function setTier(i, ti, mut) {
    update(function (f) {
      mut(f.rows[i].tiers[ti]);
    });
  }
  function setRange(i, ti, ri, mut) {
    update(function (f) {
      mut(f.rows[i].tiers[ti].ranges[ri]);
    });
  }

  function addRow(key) {
    if (!key || coveredKeys(form).indexOf(key) !== -1) return;
    update(function (f) {
      f.rows.push({ key: key, keys: [], currency: f.currency, input: "", output: "", cacheRead: "", cacheWrite: "", tiers: [], open: false });
      // 手动/勾选重加已忽略模型 → 解除忽略（用户显式要求它重新出现在候选里）
      if (Array.isArray(f.ignored)) {
        var at = f.ignored.indexOf(key);
        if (at !== -1) f.ignored.splice(at, 1);
      }
    });
  }

  var PRICE_FIELDS = ["input", "output", "cacheRead", "cacheWrite"];
  var WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];
  var PRICE_PLACEHOLDERS = { input: "输入", output: "输出", cacheRead: "缓存读", cacheWrite: "缓存写" };
  // 单位标签复用 04 分片的 QUOTA_UNIT_LABELS；周期用长文案单独定义
  var PLAN_PERIOD_LABELS = { month: "自然月", week: "自然周（周一起）", roll7: "滚动 7 天", roll5h: "滚动 5 小时" };

  /** 时间输入宽容化：失焦时把 "9"→"09:00"、"9:5"→"09:05"、"930"/"0930"→"09:30"；识别不了原样保留（保存时校验）。 */
  function normalizeTimeInput(v) {
    var t = String(v).trim().replace("：", ":");
    if (t === "") return "";
    var m = t.match(/^(\d{3,4})$/); // 纯数字 3~4 位：按 HHMM 理解
    if (m) {
      var hh2 = Number(m[1].slice(0, m[1].length - 2));
      var mm2 = Number(m[1].slice(-2));
      if (hh2 <= 23 && mm2 <= 59) return pad2(hh2) + ":" + pad2(mm2);
      return t;
    }
    m = t.match(/^(\d{1,2})(?::([0-5]?\d))?$/);
    if (m) return pad2(Number(m[1])) + ":" + pad2(m[2] !== undefined ? Number(m[2]) : 0);
    return t;
  }

  function timeInput(value, placeholder, onChange) {
    return h("input", {
      className: "tks-price-input",
      style: { maxWidth: "74px", textAlign: "center", fontFamily: "Consolas,'Courier New',monospace" },
      placeholder: placeholder,
      value: value,
      onChange: onChange,
      onBlur: function (e) {
        var nv = normalizeTimeInput(e.target.value);
        if (nv !== e.target.value) onChange({ target: { value: nv } });
      }
    });
  }

  /** 星期胶囊组：days 空数组＝全周生效（全部亮起），点选切换。 */
  function weekdayPills(days, onToggle) {
    return h(
      "div",
      { className: "tks-seg-days" },
      WEEKDAYS.map(function (lbl, d) {
        var on = days.length === 0 || days.indexOf(d) !== -1;
        return h(
          "button",
          {
            key: d,
            type: "button",
            className: "tks-btn tks-pill" + (on ? " tks-btn-on" : ""),
            onClick: function () { onToggle(d); }
          },
          lbl
        );
      }),
      h("span", { className: "tks-note" }, "生效星期（不选＝全周）")
    );
  }

  /** 单个时间段行：开始 — 结束 + 星期胶囊 + 删除。 */
  function rangeLine(i, ti, ri, rg) {
    return h(
      "div",
      { key: ri, className: "tks-range-line" },
      timeInput(rg.s, "08:00", function (e) { setRange(i, ti, ri, function (r) { r.s = e.target.value; }); }),
      h("span", { className: "tks-seg-dash" }, "—"),
      timeInput(rg.e, "22:00", function (e) { setRange(i, ti, ri, function (r) { r.e = e.target.value; }); }),
      weekdayPills(rg.days, function (d) {
        setRange(i, ti, ri, function (r) {
          var idx = r.days.indexOf(d);
          if (idx === -1) r.days.push(d);
          else r.days.splice(idx, 1);
        });
      }),
      h(
        "button",
        {
          type: "button",
          className: "tks-del",
          "aria-label": "删除时间段",
          onClick: function () {
            update(function (f) { f.rows[i].tiers[ti].ranges.splice(ri, 1); });
          }
        },
        "✕"
      )
    );
  }

  /** 单个价格档卡片：四项单价 + 它绑定的多个时间段 + 删除档。 */
  function tierCard(i, ti, tw) {
    var kids = [
      h(
        "div",
        { key: "p", className: "tks-seg-line" },
        PRICE_FIELDS.map(function (field) {
          return h("input", {
            className: "tks-price-input",
            style: { maxWidth: "76px" },
            placeholder: PRICE_PLACEHOLDERS[field],
            title: "该档的" + PRICE_PLACEHOLDERS[field] + "单价",
            value: tw[field],
            onChange: function (e) { setTier(i, ti, function (t) { t[field] = e.target.value; }); }
          });
        }),
        h("span", { className: "tks-note" }, "命中下方时间段时整档覆盖默认价"),
        h(
          "button",
          {
            type: "button",
            className: "tks-del",
            "aria-label": "删除价格档",
            onClick: function () {
              update(function (f) { f.rows[i].tiers.splice(ti, 1); });
            }
          },
          "✕"
        )
      )
    ];
    tw.ranges.forEach(function (rg, ri) {
      kids.push(rangeLine(i, ti, ri, rg));
    });
    kids.push(
      h(
        "div",
        { key: "add", className: "tks-controls" },
        h(
          "button",
          {
            type: "button",
            className: "tks-btn",
            onClick: function () {
              setTier(i, ti, function (t) { t.ranges.push({ s: "", e: "", days: [] }); });
            }
          },
          "＋ 绑定时间段"
        )
      )
    );
    return h("div", { key: "tier" + ti, className: "tks-seg" }, kids);
  }

  /**
   * 历史价编辑块：按「生效起始日」记录历代单价。
   *
   * 解决的问题：定价条目只存当前价时，用户一改价，**所有历史日期的费用都会按新价重算**，
   * 总费用凭空跳变、与当时的真实账单对不上。配上历史价后，某日费用按「from ≤ 该日」的最后一条算。
   * 用法：填上「新价生效日 + 当时的四项单价」即可；该日之前仍用更早的条目（或默认价）。
   * @param i 行下标；r 该行的表单状态。
   */
  function rateBlock(i, r) {
    var rates = r.rates || [];
    function setRate(ri, mut) {
      setRow(i, function (row) {
        mut(row.rates[ri]);
      });
    }
    return h(
      "div",
      { className: "tks-pblock" },
      h(
        "p",
        { className: "tks-note" },
        "历史价：填「生效起始日 + 当时单价」，该日及之后按这条算；改价后**历史费用不再漂移**。" +
          "（不填则所有日期都用上方当前价重算）"
      ),
      rates.length === 0 ? h("p", { className: "tks-note" }, "未配置历史价。") : null,
      rates.map(function (rt, ri) {
        return h(
          "div",
          { key: "rate" + ri, className: "tks-seg-line" },
          h("input", {
            className: "tks-price-input",
            style: { maxWidth: "118px", textAlign: "center", fontFamily: "Consolas,'Courier New',monospace" },
            placeholder: "2026-10-01",
            title: "该价生效起始日（YYYY-MM-DD，含当天）",
            value: rt.from,
            onChange: function (e) { setRate(ri, function (x) { x.from = e.target.value; }); }
          }),
          PRICE_FIELDS.map(function (field) {
            return h("input", {
              className: "tks-price-input",
              style: { maxWidth: "76px" },
              placeholder: PRICE_PLACEHOLDERS[field],
              title: "该时期生效的" + PRICE_PLACEHOLDERS[field] + "单价",
              value: rt[field],
              onChange: function (e) { setRate(ri, function (x) { x[field] = e.target.value; }); }
            });
          }),
          h(
            "button",
            {
              type: "button",
              className: "tks-del",
              "aria-label": "删除这条历史价",
              onClick: function () {
                setRow(i, function (row) { row.rates.splice(ri, 1); });
              }
            },
            "✕"
          )
        );
      }),
      h(
        "div",
        { className: "tks-controls" },
        h(
          "button",
          {
            type: "button",
            className: "tks-btn",
            title: "添加一条历史价：起始日 + 当时单价（通常填「改价那天」与改价前/后的价）",
            onClick: function () {
              setRow(i, function (row) {
                if (!Array.isArray(row.rates)) row.rates = [];
                row.rates.push({ from: "", input: "", output: "", cacheRead: "", cacheWrite: "" });
              });
            }
          },
          "＋ 添加历史价"
        )
      )
    );
  }

  /** 单价行：key（可编辑，紧凑）+「模型 ×N」勾选徽标（定价套用哪些模型）+ 币种 + 四项单价
   *  + 价格档开关 + 复制 + 删除（红叉恒在行最右）。 */
  function modelBlock(r, i) {
    var covered = 1 + (r.keys || []).length;
    var kids = [
      h(
        "div",
        { className: "tks-price-row", key: r.key },
      h(
        "span",
        { className: "tks-price-name" },
        h(ModelPickButton, {
          value: r.key,
          options: modelPool,
          style: { width: "100%" },
          onChange: function (k) { setRow(i, function (row) { row.key = k; }); }
        })
      ),
        h(CheckPicker, {
          key: "picker",
          marker: "share",
          label: "模型 ×" + covered,
          title: "点击/悬浮勾选本行定价套用的模型（可多选）；首项为行主模型，不可取消（删行用红叉）",
          emptyText: "暂无其他候选模型",
          options: [{ value: r.key, checked: true, disabled: true }]
            .concat((r.keys || []).map(function (k) { return { value: k, checked: true }; }))
            .concat(availableKeys(form).map(function (k) { return { value: k, checked: false }; })),
          onToggle: function (k) {
            update(function (f) {
              var row = f.rows[i];
              var at = row.keys.indexOf(k);
              if (at !== -1) row.keys.splice(at, 1);
              else if (coveredKeys(f).indexOf(k) === -1) row.keys.push(k);
            });
          }
        }),
        h(
          "select",
          {
            className: "tks-select",
            value: r.currency,
            onChange: function (e) { setRow(i, function (row) { row.currency = e.target.value; }); }
          },
          h("option", { value: "CNY" }, "¥"),
          h("option", { value: "USD" }, "$")
        ),
        PRICE_FIELDS.map(function (field) {
          return h("input", {
            className: "tks-price-input",
            placeholder: PRICE_PLACEHOLDERS[field],
            title: "默认" + PRICE_PLACEHOLDERS[field] + "单价（未命中任何价格档时使用）",
            value: r[field],
            onChange: function (e) { setRow(i, function (row) { row[field] = e.target.value; }); }
          });
        }),
        h(
          "button",
          {
            type: "button",
            className: "tks-btn",
            style: { padding: "1px 8px", fontSize: "11px" },
            title: "峰谷价：一个价格可绑定多个时间段（如错峰价同时覆盖每天凌晨和周末）",
            onClick: function () { setRow(i, function (row) { row.open = !row.open; }); }
          },
          "价格档" + (r.tiers.length > 0 ? "（" + r.tiers.length + "）" : "")
        ),
        h(
          "button",
          {
            type: "button",
            className: "tks-btn",
            style: { padding: "1px 8px", fontSize: "11px" },
            title: "历史价：按生效起始日记录历代单价，改价后**历史日期的费用仍按当时的价计算**，不会随新价漂移",
            onClick: function () { setRow(i, function (row) { row.ratesOpen = !row.ratesOpen; }); }
          },
          "历史价" + ((r.rates || []).length > 0 ? "（" + r.rates.length + "）" : "")
        ),
        h(
          "button",
          {
            type: "button",
            className: "tks-btn",
            style: { padding: "1px 8px", fontSize: "11px" },
            title: "复制本行全部定价（含价格档）；共享模型不随复制（避免与原行重复覆盖），改 key 后点「模型 ×N」重新勾选即可",
            onClick: function () {
              update(function (f) {
                var c = JSON.parse(JSON.stringify(f.rows[i]));
                var base = c.key + "-副本";
                var nk = base;
                var n = 2;
                while (coveredKeys(f).indexOf(nk) !== -1) nk = base + n++;
                c.key = nk;
                c.keys = [];
                c.open = false;
                f.rows.splice(i + 1, 0, c);
              });
            }
          },
          "复制"
        ),
        h(
          "button",
          {
            type: "button",
            className: "tks-del",
            style: { marginLeft: "auto" },
            "aria-label": "删除 " + r.key,
            title: "删除本行定价；该模型将移入「已忽略」，不再出现在添加模型候选列表（可随时恢复）",
            onClick: function () {
              update(function (f) {
                var delKeys = [f.rows[i].key].concat(f.rows[i].keys || []).filter(function (k) { return k !== ""; });
                f.rows.splice(i, 1);
                // 删除后仍被其他行覆盖的 key（主 key 或共享 keys）不忽略；否则移入已忽略列表
                var still = coveredKeys(f);
                if (!Array.isArray(f.ignored)) f.ignored = [];
                delKeys.forEach(function (k) {
                  if (still.indexOf(k) === -1 && f.ignored.indexOf(k) === -1) f.ignored.push(k);
                });
              });
            }
          },
          "✕"
        )
      )
    ];
    if (r.open) {
      kids.push(
        h(
          "div",
          { key: r.key + "-tiers", className: "tks-pblock" },
          r.tiers.length === 0 ? h("p", { className: "tks-note" }, "未添加价格档，全天使用上方默认单价。") : null,
          r.tiers.map(function (tw, ti) {
            return tierCard(i, ti, tw);
          }),
          h(
            "div",
            { className: "tks-controls" },
            h(
              "button",
              {
                type: "button",
                className: "tks-btn",
                onClick: function () {
                  setRow(i, function (row) { row.tiers.push({ input: "", output: "", cacheRead: "", cacheWrite: "", ranges: [] }); });
                }
              },
              "＋ 添加价格档"
            )
          )
        )
      );
    }
    if (r.ratesOpen) {
      kids.push(rateBlock(i, r));
    }
    return h("div", { key: "pb" + r.key }, kids);
  }

  async function save() {
    if (!canSave) return;
    setErrMsg(null);
    var badTime = null;
    // 模型 key 唯一性校验：主 key 互相不重复；共享 keys 不得与任何主 key/共享 key 撞车（否则定价命中会有歧义）
    var seen = [];
    var dupKey = null;
    for (var vi = 0; vi < form.rows.length && dupKey === null; vi++) {
      var vr = form.rows[vi];
      var vk = String(vr.key).trim();
      if (vk !== "" && seen.indexOf(vk) !== -1) { dupKey = vk; break; }
      if (vk !== "") seen.push(vk);
      for (var vj = 0; vj < (vr.keys || []).length; vj++) {
        var vsk = String(vr.keys[vj]);
        if (vsk !== "" && seen.indexOf(vsk) !== -1) { dupKey = vsk; break; }
        if (vsk !== "") seen.push(vsk);
      }
    }
    if (dupKey !== null) {
      setErrMsg("模型 key 重复：" + dupKey + "（同一模型只能出现在一个定价条目中，重复请用「共享到其他模型」）");
      return;
    }
    var badKey = null;
    for (var bi = 0; bi < form.rows.length && badKey === null; bi++) {
      if (String(form.rows[bi].key).trim() === "") badKey = "（空模型 key，第 " + (bi + 1) + " 行）";
    }
    if (badKey !== null) {
      setErrMsg("模型 key 不能为空：" + badKey);
      return;
    }
    var prices = form.rows.map(function (r) {
      return {
        key: r.key.trim(),
        keys: (r.keys || []).slice(),
        currency: r.currency,
        input: toNum(r.input),
        output: toNum(r.output),
        cacheRead: toNum(r.cacheRead),
        cacheWrite: toNum(r.cacheWrite),
        tiers: r.tiers.map(function (tw) {
          return {
            input: toNum(tw.input),
            output: toNum(tw.output),
            cacheRead: toNum(tw.cacheRead),
            cacheWrite: toNum(tw.cacheWrite),
            ranges: tw.ranges.map(function (rg) {
              return { s: rg.s, e: rg.e, days: rg.days.slice() };
            })
          };
        }),
        // 历史价原样写回（含 from 日期）；空数组不写入字段，保持配置文件干净
        rates: (r.rates || [])
          .filter(function (rt) { return DATE_RE.test(String(rt.from || "")); })
          .map(function (rt) {
            return { from: String(rt.from), input: toNum(rt.input), output: toNum(rt.output), cacheRead: toNum(rt.cacheRead), cacheWrite: toNum(rt.cacheWrite) };
          })
      };
    });
    for (var i = 0; i < prices.length && badTime === null; i++) {
      for (var j = 0; j < prices[i].tiers.length && badTime === null; j++) {
        for (var k2 = 0; k2 < prices[i].tiers[j].ranges.length; k2++) {
          var rg = prices[i].tiers[j].ranges[k2];
          if (!TIME_RE.test(rg.s) || !TIME_RE.test(rg.e)) {
            badTime = prices[i].key + " 的时间段「" + rg.s + "～" + rg.e + "」（格式 HH:MM）";
            break;
          }
        }
      }
    }
    if (badTime !== null) {
      setErrMsg("时间格式不正确：" + badTime);
      return;
    }
    // 历史价日期校验：填了就必须是合法 YYYY-MM-DD（空行直接忽略，不阻断保存）
    var badDate = null;
    for (var di = 0; di < form.rows.length && badDate === null; di++) {
      var dr = form.rows[di];
      for (var dj = 0; dj < (dr.rates || []).length; dj++) {
        var dfv = String(dr.rates[dj].from || "").trim();
        if (dfv !== "" && !DATE_RE.test(dfv)) {
          badDate = dr.key + " 的历史价生效日「" + dfv + "」（格式 YYYY-MM-DD）";
          break;
        }
      }
    }
    if (badDate !== null) {
      setErrMsg("历史价日期格式不正确：" + badDate);
      return;
    }
    // 模型额度明细校验：key 非空、同条限额内唯一、额度 >0
    var badItem = null;
    form.plans.forEach(function (q) {
      q.limits.forEach(function (L) {
        var seen = [];
        (L.items || []).forEach(function (it, ii) {
          var k = String(it.key).trim();
          if (k === "") badItem = badItem || "第 " + (ii + 1) + " 行模型 key 为空";
          else if (seen.indexOf(k) !== -1) badItem = badItem || "模型 " + k + " 重复（同一条限额内每个模型只一行）";
          else seen.push(k);
          if (!(toNum(it.limit) > 0)) badItem = badItem || "模型 " + (k || "（空 key）") + " 的额度必须大于 0";
        });
      });
    });
    if (badItem !== null) {
      setErrMsg("模型额度明细有误：" + badItem);
      return;
    }
    // 锚点：保存前拉一次最新统计，算「保存时刻本机周期用量%」；失败降级用打开弹窗时的快照
    var snap = null;
    try {
      var res = await fetch("/token-stats/summary" + (needHours(cfgLive) ? "?hours=1" : ""));
      if (res.ok) snap = await res.json();
    } catch (e) {}
    if (!snap || typeof snap !== "object") snap = props.summary || null;
    function anchorPctOf(L2, matchFn, limit) {
      if (!snap || !(limit > 0)) return 0;
      var u = quotaPeriodUsage(L2, matchFn, snap, cfgLive);
      return Math.max(0, Math.min(999, (u / limit) * 100));
    }
    var raw = {
      currency: form.currency,
      pricesJson: JSON.stringify(prices),
      // 颜色覆盖不归本弹窗管：从最新 localStorage 原样保留，避免保存时被清掉
      colorsJson: (function () {
        var live = loadRawConfig();
        return typeof live.colorsJson === "string" ? live.colorsJson : "{}";
      })(),
      budgetCost: form.budgetCost.trim() === "" ? "" : String(toNum(form.budgetCost)),
      budgetTokens: form.budgetTokens.trim() === "" ? "" : String(toNum(form.budgetTokens)),
      // 已忽略模型：删除定价行时自动加入；保存时把「已被任一定价行覆盖」的忽略项清出（避免隐藏仍在用的模型）
      ignoredModels: JSON.stringify(
        (form.ignored || []).filter(function (k) {
          return k !== "" && coveredKeys(form).indexOf(k) === -1;
        })
      ),
      plansJson: JSON.stringify(
        form.plans.map(function (q) {
          var matchPlan = function (k) { return quotaScopeMatch(q, k); };
          return {
            name: q.name.trim() === "" ? "套餐" : q.name.trim(),
            scope: q.scope,
            prefix: q.prefix.trim(),
            key: q.key,
            limits: q.limits.map(function (L) {
              var lim = toNum(L.limit);
              var L2 = {
                unit: L.unit,
                period: L.period,
                cur: L.unit === "cost" ? (L.cur === "USD" || L.cur === "CNY" ? L.cur : form.currency) : null
              };
              return {
                unit: L.unit,
                period: L.period,
                limit: lim,
                cur: L2.cur,
                basePct: clampPct(L.basePct),
                anchorPct: anchorPctOf(L2, matchPlan, lim),
                items: (L.items || [])
                  .map(function (it) {
                    var k = String(it.key).trim();
                    var ilim = toNum(it.limit);
                    return {
                      key: k,
                      limit: ilim,
                      basePct: clampPct(it.basePct),
                      anchorPct: anchorPctOf(L2, function (k2) { return k2 === k; }, ilim)
                    };
                  })
                  .filter(function (it) { return it.key !== "" && it.limit > 0; })
              };
            })
          };
        })
      )
    };
    try {
      await Promise.resolve(props.onSave(raw));
      setSaved(true); // 保存后停留在弹窗，提示已保存；用户点"取消/✕"自行关闭
    } catch (e) {
      setErrMsg(String((e && e.message) || e));
    }
  }

  /** 单个套餐配额编辑卡：名称/范围 + 多条限额行（单位/周期/限量各自独立）+ 复制。 */
  /** 当前 prefix 对应的 provider id（如 "sensenova/" → "sensenova"；在候选分组里才反解成功）。 */
  function providerIdOfPrefix(prefix) {
    var m = String(prefix || "").match(/^([^/]+)\/$/);
    if (!m) return "";
    return importGroups().some(function (g) { return g.id === m[1]; }) ? m[1] : "";
  }

  function planCard(q, qi) {
    var kids = [
      h(
        "div",
        { className: "tks-seg-line", key: "meta" },
        h("input", {
          className: "tks-price-input",
          style: { maxWidth: "180px" },
          placeholder: "套餐名称",
          value: q.name,
          onChange: function (e) { setPlan(qi, function (x) { x.name = e.target.value; }); }
        }),
        h(
          "select",
          {
            className: "tks-select",
            title: "适用范围",
            value: q.scope,
            onChange: function (e) { setPlan(qi, function (x) { x.scope = e.target.value; }); }
          },
          h("option", { value: "all" }, "全部模型"),
          h("option", { value: "provider" }, "按 provider 前缀"),
          h("option", { value: "model" }, "指定模型")
        ),
        q.scope === "provider"
          ? h(
              "select",
              {
                className: "tks-select",
                title: "选择 provider：其名下全部模型自动归入本套餐（模型配置不可读时自动改用日志出现过的模型按前缀分组）",
                value: providerIdOfPrefix(q.prefix),
                onChange: function (e) {
                  var id = e.target.value;
                  if (!id) return;
                  setPlan(qi, function (x) { x.prefix = id + "/"; });
                }
              },
              (function () {
                var gs = importGroups();
                var ph =
                  gs.length === 0
                    ? "（无可用 provider：模型配置不可读且日志无模型）"
                    : providers && providers.length > 0
                      ? "从模型配置选择…"
                      : "从日志 provider 前缀选择…";
                return h("option", { value: "" }, ph);
              })(),
              importGroups().map(function (g) {
                return h("option", { key: g.id, value: g.id }, g.name !== g.id ? g.name + "（" + g.id + "）" : g.id);
              })
            )
          : null,
        q.scope === "provider"
          ? h("input", {
              className: "tks-price-input",
              style: { maxWidth: "220px", fontFamily: "Consolas,'Courier New',monospace" },
              placeholder: "前缀，如 opencode-go/",
              value: q.prefix,
              onChange: function (e) { setPlan(qi, function (x) { x.prefix = e.target.value; }); }
            })
          : null,
        q.scope === "model"
          ? h(ModelPickButton, {
              value: q.key,
              options: known,
              onChange: function (k) { setPlan(qi, function (x) { x.key = k; }); }
            })
          : null,
        h(
          "button",
          {
            type: "button",
            className: "tks-btn",
            style: { padding: "1px 8px", fontSize: "11px" },
            title: "复制本套餐全部设置（含限额行）；复制后改个名称/范围即可，无需重新配置",
            onClick: function () {
              update(function (f) {
                var c = JSON.parse(JSON.stringify(f.plans[qi]));
                c.name = (c.name && c.name !== "套餐" ? c.name : "套餐") + " 副本";
                f.plans.splice(qi + 1, 0, c);
              });
            }
          },
          "复制"
        ),
        h(
          "button",
          {
            type: "button",
            className: "tks-del",
            "aria-label": "删除套餐",
            onClick: function () {
              update(function (f) { f.plans.splice(qi, 1); });
            }
          },
          "✕"
        )
      )
    ];
    q.limits.forEach(function (L, li) {
      kids.push(
        h(
          "div",
          { className: "tks-seg-line", key: "L" + li },
          h(
            "select",
            {
              className: "tks-select",
              title: "计量单位",
              value: L.unit,
              onChange: function (e) { setLimit(qi, li, function (x) { x.unit = e.target.value; }); }
            },
            Object.keys(QUOTA_UNIT_LABELS).map(function (u) {
              return h("option", { key: u, value: u }, QUOTA_UNIT_LABELS[u]);
            })
          ),
          h(
            "select",
            {
              className: "tks-select",
              title: "统计周期",
              value: L.period,
              onChange: function (e) { setLimit(qi, li, function (x) { x.period = e.target.value; }); }
            },
            Object.keys(PLAN_PERIOD_LABELS).map(function (pp) {
              return h("option", { key: pp, value: pp }, PLAN_PERIOD_LABELS[pp]);
            })
          ),
          L.unit === "cost"
            ? h(
                "select",
                {
                  className: "tks-select",
                  title: "限额币种（固定，不随显示币种切换）",
                  value: L.cur,
                  onChange: function (e) { setLimit(qi, li, function (x) { x.cur = e.target.value; }); }
                },
                h("option", { value: "CNY" }, "¥"),
                h("option", { value: "USD" }, "$")
              )
            : null,
          h("input", {
            className: "tks-price-input",
            style: { maxWidth: "110px" },
            placeholder: L.unit === "cost" ? "限量（金额）" : L.unit === "tokens" ? "限量（token）" : "限量（次）",
            value: L.limit,
            onChange: function (e) { setLimit(qi, li, function (x) { x.limit = e.target.value; }); }
          }),
          h("input", {
            className: "tks-price-input",
            style: { maxWidth: "78px", textAlign: "right" },
            placeholder: "当前已用%",
            title: "照抄订阅站显示的当前已用百分比（含本机已耗部分）；保存时自动记录本机当前用量作起点，之后只累加本机新增；在别处使用后请更新此值。留空＝仅本机统计",
            value: L.basePct,
            onChange: function (e) { setLimit(qi, li, function (x) { x.basePct = e.target.value; }); }
          }),
          h(
            "button",
            {
              type: "button",
              className: "tks-btn",
              style: { padding: "1px 8px", fontSize: "11px" },
              title: "按模型细分额度（共享总额度池）：每个模型独立额度与当前已用%，各自算使用率后相加成总使用率",
              onClick: function () { setLimit(qi, li, function (x) { x.itemsOpen = !x.itemsOpen; }); }
            },
            "额度明细" + (L.items && L.items.length > 0 ? "（" + L.items.length + "）" : "")
          ),
          h(
            "button",
            {
              type: "button",
              className: "tks-del",
              "aria-label": "删除本条限额",
              onClick: function () {
                update(function (f) { f.plans[qi].limits.splice(li, 1); });
              }
            },
            "✕"
          )
        )
      );
      // 模型额度明细编辑子块（「额度明细」按钮开关；已有明细时初始即展开）
      if (L.itemsOpen) {
        kids.push(itemsBlock(qi, li, L));
      }
    });
    kids.push(
      h(
        "div",
        { className: "tks-controls", key: "add" },
        h(
          "button",
          {
            type: "button",
            className: "tks-btn",
            onClick: function () {
              setPlan(qi, function (x) { x.limits.push({ unit: "calls", period: "month", limit: "", cur: form.currency, basePct: "", items: [], itemsOpen: false }); });
            }
          },
          "＋ 添加限额"
        )
      )
    );
    return h("div", { key: qi, className: "tks-seg" }, kids);
  }

  function setPlan(qi, mut) {
    update(function (f) {
      mut(f.plans[qi]);
    });
  }

  function setLimit(qi, li, mut) {
    update(function (f) {
      mut(f.plans[qi].limits[li]);
    });
  }

  /** 整组导入的 provider 候选分组：模型配置分组（带显示名）优先合并；模型配置不可读/为空时，
   *  用日志出现过的模型 key 按 provider 前缀兜底分组——保证不依赖 llm.models RPC 也始终可用。 */
  function importGroups() {
    var map = [];
    function grp(id, name) {
      for (var i = 0; i < map.length; i++) if (map[i].id === id) return map[i];
      var g = { id: id, name: name || id, keys: [] };
      map.push(g);
      return g;
    }
    (providers || []).forEach(function (g) {
      if (!g || typeof g.id !== "string" || g.id === "") return;
      var e = grp(g.id, g.name);
      (g.modelIds || []).forEach(function (mid) {
        if (typeof mid !== "string" || mid === "") return;
        var fk = g.id + "/" + mid;
        if (ignoredSet.indexOf(fk) === -1 && e.keys.indexOf(fk) === -1) e.keys.push(fk);
      });
    });
    (known || []).forEach(function (k) {
      var at = String(k).indexOf("/");
      if (at <= 0) return;
      var e = grp(String(k).slice(0, at));
      if (e.keys.indexOf(String(k)) === -1) e.keys.push(String(k));
    });
    return map;
  }

  /** 限额的模型额度明细编辑块：每行 = 模型 key + 额度 + 当前已用%（语义同限额行的「当前已用%」）；
   *  候选池 = 日志 key ∪ 模型配置合成 key（已被本限额加入的跳过）；支持按 provider 整组导入。 */
  function itemsBlock(qi, li, L) {
    var kids = [
      h(
        "div",
        { className: "tks-seg-line", key: "ih" },
        h("span", { className: "tks-price-head" }, "模型额度明细（共享总额度池：总使用率 = 各模型使用率相加，某模型用满自己的额度即计 100%）")
      )
    ];
    (L.items || []).forEach(function (it, ii) {
      kids.push(
        h(
          "div",
          { className: "tks-seg-line", key: "it" + ii },
          h(ModelPickButton, {
            value: it.key,
            options: modelPool,
            style: { flex: "0 1 170px", minWidth: "130px" },
            onChange: function (k) { setLimit(qi, li, function (x) { x.items[ii].key = k; }); }
          }),
          h("input", {
            className: "tks-price-input",
            style: { maxWidth: "96px" },
            placeholder: "额度",
            title: "该模型本期额度（计量单位与统计周期随上方限额行）",
            value: it.limit,
            onChange: function (e) { setLimit(qi, li, function (x) { x.items[ii].limit = e.target.value; }); }
          }),
          h("input", {
            className: "tks-price-input",
            style: { maxWidth: "78px", textAlign: "right" },
            placeholder: "当前已用%",
            title: "照抄订阅站该模型的当前已用百分比（含本机已耗部分）；保存时自动记录本机用量作起点，之后只累加本机新增；留空＝仅本机统计",
            value: it.basePct,
            onChange: function (e) { setLimit(qi, li, function (x) { x.items[ii].basePct = e.target.value; }); }
          }),
          h(
            "button",
            {
              type: "button",
              className: "tks-del",
              "aria-label": "删除该模型额度",
              onClick: function () {
                update(function (f) { f.plans[qi].limits[li].items.splice(ii, 1); });
              }
            },
            "✕"
          )
        )
      );
    });
    kids.push(
      h(
        "div",
        { className: "tks-controls", key: "ia" },
        h(CheckPicker, {
          marker: "plan-items-" + qi + "-" + li,
          label: "＋ 添加模型",
          title: "勾选即添加一行模型额度（候选含日志出现过的与模型配置里的全部模型）",
          emptyText: "全部候选模型均已加入",
          options: modelPool
            .filter(function (k) {
              var dup = false;
              (L.items || []).forEach(function (e2) {
                if (e2.key === k) dup = true;
              });
              return !dup;
            })
            .map(function (k) { return { value: k, checked: false }; }),
          onToggle: function (k) {
            setLimit(qi, li, function (x) {
              if (!Array.isArray(x.items)) x.items = [];
              var dup = false;
              x.items.forEach(function (e3) {
                if (e3.key === k) dup = true;
              });
              if (!dup) x.items.push({ key: k, limit: "", basePct: "" });
            });
          }
        }),
        h(
          "select",
          {
            className: "tks-select",
            title: "按 provider 整组导入：该 provider 名下全部模型一次加入明细（已有的自动跳过），之后逐个改额度；模型配置不可读时自动改用日志出现过的模型按前缀分组",
            value: "",
            onChange: function (e) {
              var id = e.target.value;
              if (!id) return;
              setLimit(qi, li, function (x) {
                var g = null;
                importGroups().forEach(function (pp) {
                  if (pp.id === id) g = pp;
                });
                if (!g) return;
                if (!Array.isArray(x.items)) x.items = [];
                g.keys.forEach(function (fk) {
                  var dup = false;
                  x.items.forEach(function (e4) {
                    if (e4.key === fk) dup = true;
                  });
                  if (!dup) x.items.push({ key: fk, limit: "", basePct: "" });
                });
              });
            }
          },
          (function () {
            var gs = importGroups();
            var ph =
              gs.length === 0
                ? "（无可用 provider：模型配置不可读且日志无模型）"
                : providers && providers.length > 0
                  ? "按 provider 整组导入…"
                  : "按日志 provider 前缀整组导入…";
            return h("option", { value: "" }, ph);
          })(),
          importGroups().map(function (g) {
            return h("option", { key: g.id, value: g.id }, g.name !== g.id ? g.name + "（" + g.id + "）" : g.id);
          })
        )
      )
    );
    return h("div", { className: "tks-pblock", key: "items" + li }, kids);
  }

  var FULL_NOTE =
    "单价单位为「货币 / 每百万 token」，对应服务商价目表的输入 / 输出 / 缓存读 / 缓存写四列；缓存免费可填 0。每行默认单价之外可添加「价格档」：一个价格档 = 一组单价 + 多个生效时间段（可各选星期，如错峰价同时覆盖每天凌晨和周末）。同一份定价可共享给多个模型（每行「模型 ×N」勾选面板，适合同一模型挂在多个 provider 下的场景）；套餐范围支持从模型配置按 provider 一键圈定其名下全部模型；「复制」按钮可基于已有定价/套餐快速派生新条目。费用不做汇率折算：各币种分别合计，同时存在时展示为「¥X + $Y」。套餐限额的「当前已用%」照抄订阅站显示值（含本机已耗部分）：保存时自动记录本机当前用量作起点，之后只累加本机新增，在别处使用后更新该值即可；限额可「按模型细分额度」（共享总额度池）——每个模型独立额度与当前已用%，各自算使用率后相加成总使用率（某模型用满即计 100%），支持按 provider 整组导入。所有数据仅保存在本地配置文件中。";

  return h(
    "div",
    {
      className: "tks-modal-backdrop",
      onMouseDown: function (e) {
        if (e.target === e.currentTarget) props.onClose();
      }
    },
    h(
      "div",
      { className: "tks-modal", role: "dialog", "aria-label": "费用单价配置" },
      //#region 头部：标题 + ?（完整说明悬浮提示） + 关闭
      h(
        "div",
        { className: "tks-modal-head" },
        h(
          "div",
          { className: "tks-modal-title", style: { justifyContent: "flex-start" } },
          "费用单价配置",
          h("button", {
            type: "button",
            className: "tks-btn",
            style: { padding: "1px 9px" },
            "aria-label": "完整说明",
            title: FULL_NOTE
          }, "?")
        ),
        h("button", { type: "button", className: "tks-modal-close", "aria-label": "关闭", onClick: props.onClose }, "✕")
      ),
      //#endregion
      h(
        "div",
        { className: "tks-modal-body" },
        h(
          "p",
          { className: "tks-note" },
          "单价单位为「货币 / 每百万 token」，缓存免费可填 0；各币种分别合计（不折算，详见右上「?」）。"
        ),
        //#region 模型定价（主区）
        h(
          "div",
          { className: "tks-controls" },
          h(CheckPicker, {
            marker: "add",
            label: unpriced.length > 0 ? "＋ 添加模型（" + unpriced.length + " 个待配置；含模型配置中未用过的）…" : "＋ 全部已知模型均已配置",
            title: "勾选即添加一行定价（含日志出现过的与模型配置里的全部模型）；面板底部可手动输入候选池之外的 key",
            options: unpriced.map(function (k) { return { value: k, checked: false }; }),
            onToggle: function (k) { addRow(k); },
            onManual: function (k) { addRow(k); }
          }),
          (form.ignored && form.ignored.length > 0)
            ? h(
                "span",
                { className: "tks-ignored-line", "data-marker": "ignored" },
                h("span", { className: "tks-controls-label" }, "已忽略 " + form.ignored.length + " 个："),
                form.ignored.map(function (k) {
                  return h(
                    "button",
                    {
                      key: k,
                      type: "button",
                      className: "tks-btn tks-ignored-chip",
                      title: "恢复「" + k + "」（重新加入候选池）",
                      onClick: function () {
                        update(function (f) {
                          var at = f.ignored.indexOf(k);
                          if (at !== -1) f.ignored.splice(at, 1);
                        });
                      }
                    },
                    "✕ " + shortModelName(k)
                  );
                }),
                h(
                  "button",
                  {
                    type: "button",
                    className: "tks-btn tks-ignored-all",
                    title: "恢复全部已忽略模型",
                    onClick: function () {
                      update(function (f) { f.ignored = []; });
                    }
                  },
                  "全部恢复"
                )
              )
            : null
        ),
        form.rows.length === 0
          ? h("p", { className: "tks-empty" }, "尚未配置任何模型单价。")
          : [
              // 表头与数据行共用同一网格模板（列对齐）；sticky 吸附主区顶部，滚动后仍可见
              h(
                "div",
                { className: "tks-price-row tks-price-head-row", key: "thead" },
                h("span", { className: "tks-price-head" }, "模型 key"),
                h("span", { className: "tks-price-head" }, "套用模型"),
                h("span", { className: "tks-price-head" }, "币种"),
                h("span", { className: "tks-price-head", title: "输入单价（货币 / 每百万 token）" }, "输入"),
                h("span", { className: "tks-price-head", title: "输出单价（货币 / 每百万 token）" }, "输出"),
                h("span", { className: "tks-price-head", title: "缓存读单价（货币 / 每百万 token）" }, "缓存读"),
                h("span", { className: "tks-price-head", title: "缓存写单价（货币 / 每百万 token）" }, "缓存写"),
                h("span", { className: "tks-price-head" }, "价格档"),
                h("span", { className: "tks-price-head", style: { gridColumn: "span 2", textAlign: "right" } }, "操作")
              ),
              form.rows.map(modelBlock)
            ],
        //#endregion
        //#region 套餐配额
        h(
          "div",
          { className: "tks-seg-line" },
          h("span", { className: "tks-price-head" }, "套餐配额（订阅限额）"),
          h("span", { className: "tks-price-head" }, "对应 OpenCode Go / Command Code 式订阅：本期已用逼近限量时预警，超限进顶部告警条")
        ),
        form.plans.length === 0
          ? h("p", { className: "tks-empty" }, "未添加套餐配额。")
          : form.plans.map(planCard),
        h(
          "div",
          { className: "tks-controls" },
          h(
            "button",
            {
              type: "button",
              className: "tks-btn",
              onClick: function () {
                update(function (f) { f.plans.push({ name: "", scope: "all", prefix: "", key: "", limits: [{ unit: "calls", period: "month", limit: "", basePct: "", items: [], itemsOpen: false }] }); });
              }
            },
            "＋ 添加套餐配额"
          )
        )
        //#endregion
      ),
      //#region 固定底栏：显示币种 + 日预算 + 保存/取消
      h(
        "div",
        { className: "tks-modal-foot" },
        h("span", { className: "tks-price-head" }, "显示币种"),
        h(
          "select",
          {
            className: "tks-select",
            title: "新增单价行/金额限额/预算的默认币种；费用展示按各币种分别合计",
            value: form.currency,
            onChange: function (e) { update(function (f) { f.currency = e.target.value; }); }
          },
          h("option", { value: "CNY" }, "¥ 人民币（CNY）"),
          h("option", { value: "USD" }, "$ 美元（USD）")
        ),
        h("span", { className: "tks-price-head" }, "日预算（费用）"),
        h("input", {
          className: "tks-price-input",
          style: { maxWidth: "88px" },
          title: "各币种分别比较，任一币种超标即触发；留空不启用",
          placeholder: "留空不启用",
          value: form.budgetCost,
          onChange: function (e) { update(function (f) { f.budgetCost = e.target.value; }); }
        }),
        h("span", { className: "tks-price-head" }, "日预算（token）"),
        h("input", {
          className: "tks-price-input",
          style: { maxWidth: "110px" },
          title: "留空不启用",
          placeholder: "留空不启用",
          value: form.budgetTokens,
          onChange: function (e) { update(function (f) { f.budgetTokens = e.target.value; }); }
        }),
        errMsg ? h("span", { className: "tks-error", style: { flex: "1 1 120px", whiteSpace: "normal" } }, errMsg) : null,
        saved && !errMsg ? h("span", { className: "tks-ok" }, "已保存，配置立即生效。") : null,
        h(
          "div",
          { className: "tks-foot-right" },
          h("button", { type: "button", className: "tks-btn tks-btn-primary", disabled: !canSave, onClick: save, style: canSave ? undefined : { opacity: 0.5, cursor: "default" } }, "保存"),
          h("button", { type: "button", className: "tks-btn", onClick: props.onClose }, "取消")
        )
      )
      //#endregion
    )
  );
}

// ======== 10a-float-geom.js ========
// 分片 10a · 悬浮小窗：常量与几何/持久化（FW_* 常量、fwIsNarrow、边锚定换算、内容区、钳制、尺寸存取、fwCellForSize/fwGridPlan）
// 分片 10b/12 · 常驻悬浮小窗（shell.overlay 插槽）
//
// 定位（框架级浮层的实践结论，勿改）：
// - `shell.overlay` 是框架级浮层，位于所有列之上、各列滚动容器之外——只有在这个位置，
//   被拖到任何地方的窗口才不会经过其他栏位时被裁切；该层本身点击穿透，窗口需自行
//   `pointer-events:auto` 收回指针事件（见 02-styles 的 .tks-fw）。
// - 结构为三层：root → [anchor(承载坐标) → card] + tip + panel。
//   ⚠️ tip / panel 必须挂在 **root** 而非 anchor 之下：anchor 带 transform，而 CSS 规定
//   祖先有 transform 时 position:fixed 的包含块变成该祖先——气泡坐标会被叠加一次小窗位置
//   （小窗在右下角时气泡被推出视口）。此前 bug 即由此而来。
//
// 数据来源：与设置分区页同一条 /token-stats/summary 路由（宿主半聚合，零模型消耗），
// 自带轮询 + visibilitychange 暂停恢复；不与分区页共享状态，两处独立轮询互不影响。

/** 小窗位置持久化键（localStorage；与配置无关，纯界面偏好，不入 token-stats.cfg.json）。 */
var FW_POS_KEY = "dsh-token-stats.float.pos.v1";
/** 小窗折叠状态持久化键。 */
var FW_MIN_KEY = "dsh-token-stats.float.min.v1";
/** 小窗**手动停靠**状态持久化键：
 *  把卡片拖到窗口左/右边缘松手 → 记 1（停靠成细条，**最大化时也保持**）；
 *  拖离边缘松手 → 记 0（恢复完整卡片）。
 *  ⚠️ 与「窄窗自动停靠」分开存：自动停靠是**几何派生**（窗口没最大化就停靠，最大化即自动恢复），
 *    手动停靠是**显式意图**（最大化也要保持）。两者混在一个键里会互相覆盖。 */
var FW_DOCK_KEY = "dsh-token-stats.float.dock.v1";
/** 小窗尺寸持久化键（拖右下角把手缩放； */
var FW_SIZE_KEY = "dsh-token-stats.float.size.v1";
/** 小窗尺寸上下限。
 *  ⚠️ 下限必须 ≥ **内容真正需要的最小尺寸**，否则拖到最小后内容会溢出边框。
 *  内容最小宽 = 固定字号的数字行（约 161px）+ 卡片左右内边距 22 = 183px，故取 190；
 *  内容最小高 = 网格最小高（7×FW_CELL_MIN + 6×gap = 68）+ 固定行占用 114（含图例）= 182px，故取 200。
 *  注意：格子现已按「可用宽 × 可用高」双向自适应（见 fwCellForSize），
 *  任何尺寸下都会缩到装得下，不再需要靠抬高下限来兜底。 */
var FW_MIN_W = 190;
var FW_MAX_W = 520;
var FW_MIN_H = 200;
var FW_MAX_H = 640;
/** 缩放把手判定阈值（px）：指针落进右下角这个范围内才起缩放手势。
 *  ⚠️ 折叠态必须整体禁用（见 onPointerDown 的 minimized 早退）：折叠后不显示把手，
 *  但「右下角 16px 内按下即缩放」的判定若仍生效，在折叠条右下角按下想拖动时
 *  会**静默改成缩放**（改的是看不见的尺寸，展开后大小莫名变了）。 */
var FW_RESIZE_ZONE = 16;

/** 主内容区左边界的**兜底值**（px）：探测不到官方侧栏元素时使用。
 *  依据官方 `computeColumns`：侧栏未折叠时 clamp 到 [264, 420]，默认偏好 280；
 *  取 264 作兜底——宁可把可摆放区算小一点，也不让卡片越进左侧工作区。 */
var FW_AREA_FALLBACK_LEFT = 264;

/** 窄窗判定比例：窗口外框宽 < 屏幕可用宽 × 该比例 → 视为「未最大化」→ 进吸附态。
 *  按屏幕比例自适应，而非固定阈值
 *  （固定阈值在 4K 屏上会把大窗口误判为窄窗）。0.9 使 1920 屏的阈值 ≈1728：
 *  窗口态 1464 → 吸附 ✓；最大化 1918 → 展开 ✓。 */
var FW_NARROW_RATIO = 0.9;
/** 窄窗判定的**兜底阈值**（px，视口宽）：取不到可信屏幕尺寸时（headless/虚拟屏/桩环境）使用。
 *  ⚠️ 原为 1400，取值**过激**：自动化环境（视口约 1254~1280）全部 < 1400
 *  → 浮窗在自动化环境下恒为吸附态，导致「展开态」相关的校验全部失败（产品行为其实正常）。
 *  下调到 1200：真实小窗（≤1200）仍会停靠，而 1254/1280 这类常规窗口恢复正常展开。 */
var FW_NARROW_FALLBACK_W = 1200;
/** 停靠态下悬停展开的延迟（ms）：防鼠标划过时误展开（与面板的 160ms 同思路）。 */
var FW_PEEK_OPEN_DELAY_MS = 120;
/** 停靠态展开后的收起延迟（ms）：留出从展开区移回的时间，避免闪断。 */
var FW_PEEK_CLOSE_DELAY_MS = 260;
/**
 * 停靠标识宽度（px）：贴死锚边的**细条**，内容为「运行状态点 + 竖排今日数字」。
 *
 * 形态要求：吸附到窗口边缘后**完全最小化**、只保留一个标识，
 * 鼠标悬停在该标识上时再展开显示完整窗口——参照形态是流量悬浮窗的贴边细条（17×51px）。
 * 旧实现是 168px 宽的「标题 + 数字」小条（168×54，面积 9072px²），
 * 在窄窗下仍会盖住右侧内容。
 *
 *    更早的形态是 22px 宽的「状态点 + 7 道色阶横杠、**零文字**」，放大后看不出含义——
 *    细条 **0 个可读字符**（折叠态对照 23 字），横杠代表哪 7 天、哪端是今天、数值多少全靠猜。
 *    根因是为把面积压到最小（旧版 168px 宽）而**把可读性整个牺牲掉了**。
 *    现改为**竖排今日数字**（从 6 个方案中选定「② 竖排今日数字」）：
 *    一眼可读、横向仍只占 24px（与旧版 22px 几乎相同，不增加遮挡），面积仅 1.8 倍。
 *    取舍记录：方案④「横排短条」最易读但横向侵入内容区 74px，与「不遮挡」的初衷冲突，故弃用。
 *
 *    最终从 7 个真实尺寸方案中选定 **G = 书脊式旋转 + 紧凑位数**：
 *    ① `text-orientation` 由 `upright` 改**默认 mixed**（整串数字横躺、自上而下读，
 *       保持「一个数」的完整形态，不再拆成孤立单字）；
 *    ② 细条数字改用 `fmtTokensCompact`（4 位有效数字，如「3680万」）。
 *    高度 **92px → 70px**（矮 22px，遮挡更少），宽度仍 24px。
 *
 * 尺寸构成（border-box，含 1px 边框）：11px 字号竖排行高 ≈ 15 + 左右内边距 6 + 边框 2 = **24px**。
 * 竖排文字用 `writing-mode:vertical-rl`（书脊式：数字横躺、自上而下读）。
 */
var FW_PEEK_W = 24;
/**
 * 停靠标识的**贴边间距**（px）：0 = 贴死视口边缘（参照形态右边距为 0）。
 *
 * ⚠️ **展开态必须用同一个值**（见渲染段的停靠定位），这是防闪烁的关键：
 * 标识贴死边缘、悬停展开的卡片却缩进 18px 时，指针（落在标识上，距边仅约 11px）
 * 会处于展开后的卡片**之外** → 浏览器立即判定 mouseleave → 收回 → 指针又落在标识上
 * → 再展开……**无限闪烁**（同类浮层组件踩过同款坑）。
 *
 * ⚠️ **贴哪一边取决于卡片当前的锚边**（否则悬停时会闪烁并跳到屏幕另一端）：
 * 若把锚边**写死成 "right"**，而存的锚边是 `edge:"left"`——一悬停就把卡片从左边
 * 瞬移到右边（left 282 → 1157），指针随之落到卡片外 → 收回 → 再瞬移……往返死循环。
 * 现改为：细条贴「卡片所在的那一边」（`pos.edge`），展开时**同边同贴合**生长。
 */
var FW_DOCK_GAP = 0;
/**
 * 「拖到窗口边缘松手即停靠」的判定距离（px）：拖动松手时距锚边 ≤ 该值 → 停靠成细条。
 *
 * ⚠️ **取 FW_MARGIN（18）本身**，含义是「卡片被**推到了边界**」而非「接近边界」：
 *    `fwClampAnchored` 把 dx 的下限钳在 `FW_MARGIN`，故 `dx ≤ FW_MARGIN` ⇔ `dx === 18`
 *    ⇔ 卡片被拖到底、视觉上已贴住边界。若取 20 之类的"接近值"，想把卡片放在
 *    离边 19px 处也会被吸附，属于误伤。
 * ⚠️ 不能写成 `FW_MARGIN` 的**声明前引用**——`var` 按顺序求值，此处 FW_MARGIN 尚未赋值（会是 undefined）。
 */
var FW_SNAP_DIST = 18;
/**
 * 停靠标识高度（px）：**首帧估算值**，用于标识态没有真实高度时的 y 钳制。
 *
 * ⚠️ （书脊式 + 紧凑位数，G 方案）：
 *    真实浏览器中为 **70px** —— 「3680万」5 字 × 11px 字号 ≈ 55，
 *    加内边距 8、边框 2、状态点 6、间距 4 → 70。
 *    直立版（旧）为 92px：`text-orientation:upright` 时 7 字逐个正立堆叠 ≈ 74 + 18。
 *    书脊式把文字长度转为竖向高度、且紧凑位数少 2 字，**合计矮 22px（遮挡更少）**。
 *    沿用旧值 92 会让首帧 y 钳制偏大、细条被无谓上推。
 * ⚠️ 实际高度随数字位数变化（如「1.2亿」只有 4 字 → 更矮），渲染后由真实 rect 接管；
 *    本值只保证首帧不出视口。
 * ⚠️ **本值是「首帧估算」，不是定位口径**（勿再混用）：
 *    首帧 y 钳制用小的估算值（保守、不出视口）；而**布局定位**必须用实际值 `FW_PEEK_H = 74`，
 *    否则「最小必要位移」临界值偏小 4px → 指针停在细条下部时展开会闪烁。
 */
var FW_DOCK_H = 70;
/**
 * 细条形态的**实际渲染高度**（px）：**74**。
 *
 * ★ 为什么必须与 FW_DOCK_H 分开（勿合并成一个常量）★
 *    两个数服务于**两个不同用途**，数值恰好不同：
 *    · `FW_DOCK_H = 70` —— **估算值**，用于「首帧还没有实际高度时」的 y 钳制（保守起见取小）；
 *    · `FW_PEEK_H = 74` —— **定位口径**，用于「停靠态贴边定位 + 展开时算最小必要位移」。
 *
 *    本插件的 CSS 里 `.tks-fw-dock{min-height:62px}` 而定位常量取 70，真实渲染高却是 **74**
 *    （`尺寸=24×74`）——**62 / 70 / 74 三处不一致**。此前定位一律用 70，
 *    于是「最小必要位移」公式 `指针y − dockH + FW_POINTER_EDGE` 的输入高度比真实细条**矮 4px**，
 *    算出的临界值偏小：指针停在细条下部（偏移 70~74）时，展开后的折叠态（61px）**仍会**让指针掉出
 *    下边缘 → mouseleave → 收回 → 再展开……正是**闪烁死循环**；
 *    而「指针在卡内」的校验此前恰好卡在边界上（offset 68 通过、74 未覆盖）才没暴露。
 * ⚠️ 改细条内容（加/减行、改字号、改内边距）后必须**重新量取**本值，否则位移公式再次失准。
 *    取值手段：停靠态的尺寸输出会打印「尺寸=24×N」，取 N。
 */
var FW_PEEK_H = 74;
/**
 * 折叠态（标题行 + 数字行）的**宽度**（px）：**由 165 改为 190**。
 *
 * ★ 为什么必须加宽（勿凭旧注释改回 165）★
 *    折叠态内容必须**单行放得下**才能钉死宽度、消除中间宽度重排（见 02-styles 的说明）。
 *    逐元素量取：数字「3680.1万」83.02 + gap 6 + 标签「9月30日 token」74.39
 *    = **163.41px** 单行自然宽，而 165px 卡片的可用内容宽只有 **141px**（165 − padding 11×2 − border 2）
 *    → 溢出 22.4px → 换行 → 折叠态实际高 83.8px（**FW_FOLD_H=61 因此长期失真**）。
 *    取 190：可用内容宽 = 190 − 22 − 2 = **166px** ≥ 163.41，余量 2.6px。
 *    ⚠️ 折叠态**不显示「回今天」**（该按钮 51px，带上它内容需 220px、卡片要 244px）——
 *       按钮条件见 10c-float.js 的 `dockBack`。
 *
 * 用途：停靠形态下折叠态要贴锚边，而**贴右缘**时 `x = area.right − 宽度`——宽度取错就会错位
 * （若沿用 FW_W=302，实际 190 宽的卡片会离右缘 112px，看着像"没贴住"）。
 * ⚠️ 本常量必须与 CSS 的 `.tks-fw[data-min="1"] .tks-fw-head/.tks-fw-today{width:166px}`
 *    以及渲染段写的 inline `width:FW_FOLD_W+"px"` **三者一致**：定位按本值算 x，
 *    渲染宽若不等就会错位（与折叠态 137px 错位属同源问题：该套用的形态没套用）。
 */
var FW_FOLD_W = 190;
/**
 * 折叠态（标题行 + 数字行）的**高度**（px）：**61.3**。
 *
 * 用途：停靠形态下悬停/单击展开成折叠态时，渲染期还没有实际高度可用，
 * 而 y 钳制必须知道「展开后有多高」——用错高度会让底部越出视口（视口外元素点不动）。
 * ⚠️ 与 FW_DOCK_H 是**两个不同形态**的高度，不可混用：
 *    细条 74px（竖排数字），折叠态 61.3px（横排标题+数字）——展开时高度**变小**，
 *    正是这一点催生了 `dockPointerYRef` 的「最小必要位移」定位（防闪烁的关键）。
 * ★ CSS 已给折叠态**写死 height:61.3px**（让过渡真生效），故本常量是
 *   「与 CSS 一致的实际值」而非估算值——改 CSS 的 height 必须同步改这里。
 */
var FW_FOLD_H = 61.3;
/**
 * 展开时的**指针安全边距**（px）：指针距新形态的下边缘至少保留这么多。
 *
 * 用途：细条（74px）比折叠态（61px）**高**，指针停在细条下部时，若展开后 top 完全不动，
 * 该点会落到 61px 的折叠态**之外** → 浏览器立即判定 mouseleave → 收回 → 再展开
 * → **无限闪烁死循环**（顶部对齐方案在指针偏移 62/68px 时形态
 * 在 `1/L1/1/L1` 之间反复横跳）。故必须允许「下移刚好够用的距离」把指针收回卡内。
 * 取 4：足够吸收形态高度取整（`Math.round`）误差，又不至于让位移肉眼可见。
 * ⚠️ 只用于**下边缘**——上边缘不设保护，否则又会引入「上移」（见渲染段定位式说明）。
 */
var FW_POINTER_EDGE = 4;

/**
 * 是否处于「窄窗」（= 窗口**未最大化**）。
 *
 * 按**屏幕比例**自适应，而非固定阈值
 * （固定阈值在 4K 屏上会把大窗口误判为窄窗）。判定按可靠性分层：
 *
 * ① **`screen.availWidth` 与 `outerWidth` 都在**时：用「窗口占屏幕可用宽的比例」
 *    ——`outerWidth < availWidth × 0.9` → 窄窗。这是最贴近直觉的口径（"没最大化"）。
 * ② **`screen.availWidth` 缺失或异常**（headless / 虚拟屏会把 availWidth 报成 800）时：
 *    退回**视口绝对阈值** `innerWidth < FW_NARROW_FALLBACK_W`（1200）。
 *    ⚠️ 为何必须有这条兜底：headless 环境 `availWidth` 恒为 800，而视口 1574/1100
 *    都比它大 → 按比例判定永远是"非窄窗"，停靠态在自动化验证里根本进不去
 *    （桩/无头环境与真实环境不符时，先让产品在两种环境下都语义正确）。
 *
 * ⚠️ **本函数只回答「窗口是否最大化」**，不再直接决定「是否停靠」——
 *    停靠条件 = 窄窗自动停靠 **或** 手动停靠（见渲染段的 `docked`）。
 *    分开的理由（最大化状态下也应能吸附）：
 *    手动吸附必须在最大化时依然保持，而窄窗判定在最大化时必然为 false，
 *    若两者共用一个变量，手动吸附会被"最大化"立刻冲掉。
 * @returns true = 窄窗（未最大化）。
 */
function fwIsNarrow() {
  var vw = window.innerWidth || 1280;
  var sw = 0, ow = 0;
  try {
    sw = (window.screen && (window.screen.availWidth || window.screen.width)) || 0;
    ow = window.outerWidth || 0;
  } catch (e) {
    sw = 0; ow = 0;
  }
  // ① 比例判定（真实桌面：availWidth 是真实屏幕宽，outerWidth 是窗口外框宽）
  if (sw > 0 && ow > 0 && sw > vw) {
    return ow < sw * FW_NARROW_RATIO;
  }
  // ② 兜底：绝对阈值（headless / 虚拟屏 / 取不到屏幕尺寸）
  return vw < FW_NARROW_FALLBACK_W;
}
/** 小窗默认边距（右下角）。 */
var FW_MARGIN = 18;
/** 小窗尺寸估算（首帧定位用；渲染后以实际 rect 为准）。
 *  ⚠️ 高度估算必须留足余量：首帧若按偏小的高度算「右下角」，实际渲染更高时卡片底部会超出视口，
 *  落在视口外的方块**点击不会被浏览器合成 click**（真实 Chromium 上：
 *  视口 754×487 时卡片 bottom=505 > 487，pointerdown/up 都命中方块却始终没有 click）。
 *  这里取一个偏保守的估算值，并在挂载/折叠/resize 后按实际尺寸重新钳制（见下方 effect）。
 *  数值 = 9 周基准卡片尺寸（网格 9×26+8×2 = 250 宽、7×26+6×2 = 194 高，加固定占用 52/114）。 */
var FW_W = 302;
var FW_H = 308;

// —— 主窗：GitHub 式贡献图（**行 = 星期、列 = 周**，竖排星期标）——
// 形态：竖向铺开、左侧竖排星期标、按列填充（grid-auto-flow:column）。
//
// ★ 根本修法：**卡片随内容 + 格子取固定基准值**，不是「把卡片设计成正方形」★
//   参考实现的真实渲染：**卡片 185×136（横长方形，不是正方形）、网格仅 76×89px**——
//   它 `.dsh-th-card` 只给 `max-width`、**不给固定 width**，宽度由内容（「今日 3680万」那行字，163px）
//   撑开；网格（6 列 × 11px = 76px）比那行字窄，所以卡片宽度由**字**决定、高度由内容累积。
//   本插件此前写死 `width:232px`，于是网格要么填不满（大片空白）、要么被迫改列数/周数去凑——方向反了。
//   现改用该机制：卡片 `width:max-content`（随内容）+ **未缩放时格子恒为基准值**（无反馈环）。
//
// 设计约束（越过后复现下列缺陷）：
//  ① 最初用「6 列 × 11px」但卡片写死 232px → 只占 76px、右侧 2/3 空白；
//  ② 中途曾改「横排星期标 + 7 列 × 5 行」，违背竖向热力图惯例；
//  ③ 又曾按宽度自适应到 11 周以填满宽——周数过多（只需 4~5 周）；
//  ④ 再曾「格子封顶 30px」——卡片放大后格子不变，比例失真；
//  ⑤ **现形态：卡片随内容 + 6 周 × 7 天网格 + 未缩放用基准格、缩放后按可用空间自动封顶**。
/** 主窗周数（9 周 = 63 格）。
 *  ⚠️ 为何是 9 而不是参考实现的 6：
 *  卡片是 `width:max-content`（随内容），故 `cardW = 周数×格 + 间隙 + 52(横向固定占用)`、
 *  `cardH = 7×格 + 12 + fwChromeH(格)(纵向固定占用)`。两者相等解得周数：
 *   · 纵向占用 94（无图例）时 → **8 周**（格 26 → 274×288，比值 0.951）；
 *   · 纵向占用 114（**新增图例行后**）时 → **9 周**（格 26 → 302×308，比值 **0.981**）。
 *  ⚠️ 凡**增删卡片内的固定行**（如加图例），都要重解一次周数，否则卡片不再方正
 *  （加图例后仍用 8 周 → 比值从 0.951 掉到 0.890）。 */
var FW_WEEKS = 9;
/** 格子边长下限（防极端：过小看不清）。 */
var FW_CELL_MIN = 8;
/** 格子边长**绝对安全上限**：正常永远取不到（由卡片可用空间自动封顶），仅防极端参数。
 *  ⚠️ 已移除旧的固定上限 40px：卡片 300×400 与 520×640 的格子都会是 40px——
 *  卡片放大 73% 而格子纹丝不动，违背「缩放系数需一致应用于每个格子」的要求。
 *  现改为**按可用空间自动封顶**。 */
var FW_CELL_MAX = 96;
/** 基准格子边长（**未缩放时的默认尺寸**：固定值，不参与反馈计算）。
 *  ⚠️ 修正「默认格子缩水」bug：此前格子由「卡片高」反算，而卡片高又由格子决定
 *  （反馈环）；纵向固定占用常量差 2px 就被该环放大成 26px → 21px（-19%，卡片仅 188×249）。
 *  现改为**未缩放时格子恒为基准值**，卡片随内容——无反馈环、无漂移。 */
var FW_CELL_BASE = 26;
/** 网格格子间隙。 */
var FW_GAP = 2;
/** 主窗行数（= 一周 7 天，恒定）。 */
var FW_ROWS = 7;
/** 卡片**横向**固定占用合计：左右边框 1×2 + 卡片内边距 11×2 + 网格区左右对称内边距 14×2 = 52px。
 *  ⚠️ 修正：此前按 38px（PAD_X22 + RAIL_W14 + GAP2）计算，**漏掉网格区右侧那 14px
 *  对称内边距** → 可用宽被高估 14px → 窄卡片上格子算大、网格横向溢出被 overflow:hidden 裁切
 *  （345/1287 个尺寸组合中招，最大超出 12px）。基准：卡片 188px、网格 136px → 占用 52px。 */
var FW_CHROME_W = 52;
/** 卡片**纵向**固定占用中「不随字号缩放」的部分：上下边框 1×2 + 卡片内边距 9+10 + gap 6×4
 *  + 标题行 17 + **图例行 14** + 页脚 15 = 91px。数字行（19px 字号）随字号系数变化，见 fwChromeH。
 *  ⚠️ 新增图例后由 71 → 91（+图例行 14 + 多出的一段 gap 6）：
 *  凡**增删卡片内的固定行**，必须同步本常量，否则格子算大、内容纵向溢出（布局常量一律逐项反推）。 */
var FW_CHROME_H_BASE = 91;
/** 数字行的基准高度（19px 字号 × 1.2 行高 ≈ 23px，随字号系数缩放）。 */
var FW_CHROME_H_NUM = 23;

/**
 * 卡片纵向固定占用（网格区以外的高度）= 固定部分 + 数字行（随字号缩放）。
 * ⚠️ 必须用函数而非常量：字号系数 `--tks-fw-fs` 随格子变化，数字行高度随之变化，
 * 用常量会在不同尺寸下算偏（格子 21px 时真实占用 90px，常量写 92px）。
 * @param cell 格子边长（px）。
 * @returns 纵向固定占用（px，可能带小数）。
 */
function fwChromeH(cell) {
  var fs = Math.max(0.72, Math.min(1.25, cell / FW_CELL_BASE));
  return FW_CHROME_H_BASE + FW_CHROME_H_NUM * fs;
}

/**
 * 把绝对坐标写进 anchor 的 transform（**拖动/缩放/渲染期共用的唯一写入口**）。
 *
 * ★ 性能约束（不得用 CSS 变量）★
 * 旧实现写 `anchor.style.setProperty("--tks-fw-x", ...)`，由 CSS
 * `transform:translate3d(var(--tks-fw-x),var(--tks-fw-y),0)` 消费。
 * 问题：**CSS 自定义属性是继承属性**——在 anchor 上改动会使**整棵子树**的继承样式失效，
 * 每帧重算卡片内全部节点（两种写法的对比数据）：
 *   卡片内 65 个节点 → 0.032ms/帧；632 个节点 → 0.265ms/帧（**节点数放大 9.7 倍时代价增长 8.33 倍**）；
 *   同样场景直接写 transform：0.0027ms/帧、增长 1.04 倍（**相差 94 倍**）。
 * 这与「继承型属性在热路径写入」的教训同源（写 `body.style.cursor` 因 cursor 可继承，
 * 曾使 13.4k 节点页面每次点击 179ms，而只改挂件子树仅 1.3ms）。
 *
 * ⚠️ 用 `translate3d` 而非 `translate`：前者带 z 轴分量，能稳定提升为合成层，
 *    在独立层上动 transform 只需重新合成、不触发重绘。
 * @param x 绝对 left（px）。
 * @param y 绝对 top（px）。
 */
function fwWriteAnchorPos(x, y) {
  var a = fwAnchorEl;
  if (!a) return;
  a.style.transform = "translate3d(" + Math.round(x) + "px," + Math.round(y) + "px,0)";
}

/**
 * 开/关「吸附过渡」（**手势期间必须关**）。
 *
 * ★ 为什么需要 ★
 *    加了过渡之后，拖动时每帧写的 `transform` 会带 180ms 缓动 → 卡片**永远追不上指针**
 *    （表现为"黏手"、松手后还在滑）。故手势期间必须彻底关掉过渡，松手才让它播吸附动画。
 *    （同类悬浮挂件源码注释即为此：拖动期间 `transition:none`，松手才播吸附动画。）
 *
 * ★ 为什么写在**外层 root** 而不是 anchor/卡片各自身上 ★
 *    ① 拖动只动 anchor、缩放同时动 anchor 与卡片尺寸，两处都要关——
 *       写在一个共同祖先上，CSS 一条规则覆盖两者，不会漏；
 *    ② **不在热路径上写继承型属性**（CSS 自定义属性 / `cursor` 等
 *       在每帧写会让整棵子树样式缓存失效，代价高约 94 倍）。`data-snap` 是**属性**，
 *       且本函数**每次手势只调用两次**（按下 / 松手），非每帧，代价可忽略。
 *    ③ 用属性而非 `style.transition`：避免与样式表里的 `transition` 声明两套口径打架
 *       （已有一次「渲染期写变量、拖动期写 transform」两套口径漂移的事故）。
 *
 * ⚠️ 必须在**每次手势开始时无条件置 "0"**，不能只置一次：组件重挂载、异常中断、
 *    或上一次收尾未执行（丢 up）都会让属性停留在旧值。
 * ⚠️ 收尾必须置回 "1"：**悬停展开没有手势**（只是 `:hover` → setState），它依赖过渡生效；
 *    若收尾忘了置回，此后所有展开/收窄都会变成硬跳，且**不会报错**（静默功能退化）。
 * @param on true = 允许过渡（常态）；false = 关闭过渡（手势进行中）。
 */
function fwSetSnapping(on) {
  var root = fwAnchorEl ? fwAnchorEl.parentNode : null;
  if (root && root.setAttribute) root.setAttribute("data-snap", on ? "1" : "0");
}

/**
 * 把「吸附过渡」恢复为开启（手势收尾的统一出口）。
 *
 * ⚠️ 单独抽成函数是为了**收尾路径唯一**：共有 4 条会结束手势的路径
 *    （拖动 up、缩放 up、`lostpointercapture`、指针离开时的兜底清理），
 *    少一处就会留下「过渡永久关闭」的静默退化。所有路径一律调这一个函数。
 */
function fwRestoreSnapping() {
  fwSetSnapping(true);
}

/**
 * anchor 元素引用（渲染期写入，拖动/缩放期读取）。
 * ⚠️ 用模块级变量而非 React ref：拖动回调里要能直接取到，避免每帧多做一次 ref 判空。
 *    生命周期与组件一致（同一时刻只有一个浮窗实例）。
 */
var fwAnchorEl = null;

// —— 悬停展开的完整历史面板 ——
/** 悬停多久后展开（防鼠标划过误触）。 */
var FW_OPEN_DELAY_MS = 160;
/** 两个表面（卡片/面板）都失去指针后多久收起。 */
var FW_CLOSE_DELAY_MS = 220;
/** 展开面板宽度（视口不够时按视口钳制）。 */
var FW_PANEL_W = 820;
/** 展开面板方块边长。 */
var FW_PANEL_CELL = 12;
/** 判定「拖动中」的指针位移阈值（px）；取 5 降低误触。 */
var FW_DRAG_THRESHOLD = 5;

/** 本插件包名：既是 `plugins.bundle.config` 的注册键，也是官方导航 `openBundle` 的目标。 */
var FW_PKG_NAME = "dsh-token-stats";

/**
 * 官方「插件面板导航」句柄（**可选能力**；由 `apply` 经 `ctx.inject(["pluginNavigation"], cb)` 注入）。
 *
 * 用途：悬浮小窗标题栏的「设置」按钮 → 一步跳到插件面板的本插件卡片页，
 * 而完整设置表单就渲染在该页面上（本插件同时注册进 `plugins.bundle.config`，见 11-section）。
 *
 * ⚠️ 为什么用模块级变量而不是顶层裸读 `ctx.pluginNavigation`（踩过的激活期事故）：
 * cordis 的服务守卫在**读取属性这一刻**就抛 `cannot get property "X" without inject`，
 * 抛在**激活期** → 客户端条目未激活 → **DSH 整页打不开**。可选服务只能用 `ctx.inject` 探测。
 * 该服务由官方插件管理页提供；缺失时按钮不渲染，小窗其余功能照常（不耦合、不挂起）。
 */
var FW_PLUGIN_NAV = null;

/**
 * 读小窗位置。**两种格式都认**（现行为边锚定）：
 * - 新格式（边锚定）：`{edge:"right", dx, y}` / `{edge:"left", dx, y}`；
 * - 旧格式（绝对坐标）：`{x, y}` —— 迁移为边锚定后返回（不丢已有位置）。
 * @returns 边锚定位置 | null（无记录/损坏，调用方用默认右下角）。
 */
function loadFwPos() {
  try {
    var raw = window.localStorage.getItem(FW_POS_KEY);
    if (raw === null) return null;
    var p = JSON.parse(raw);
    if (!p) return null;
    // 新格式
    if ((p.edge === "right" || p.edge === "left") && typeof p.dx === "number" && typeof p.y === "number" && isFinite(p.dx) && isFinite(p.y)) {
      return { edge: p.edge, dx: p.dx, y: p.y };
    }
    // 旧格式迁移：绝对坐标 → 按「离哪边更近」判定锚边，dx = 到该边距离。
    if (typeof p.x === "number" && typeof p.y === "number" && isFinite(p.x) && isFinite(p.y)) {
      return fwAbsToAnchored(p.x, p.y, FW_W, FW_H);
    }
  } catch (e) {
    // 存储不可用/内容损坏：退回默认位置
  }
  return null;
}

/**
 * 绝对坐标 → 边锚定（旧数据迁移 / 拖动落库共用）。
 *
 * 锚边判定：以**主内容区**（而非视口）为参照——
 * 卡片中心落在主区右半 → 锚右边缘；否则锚左边缘（主区左边界）。
 * 这样"拖到最右栏位"的记录在窗口变宽后仍贴右，天然留在右栏。
 * @param x 绝对 left（px）。
 * @param y 绝对 top（px）。
 * @param w 卡片宽（px）。
 * @param h 卡片高（px，仅用于钳制 y）。
 */
function fwAbsToAnchored(x, y, w, h, gap) {
  var area = fwContentArea();
  var center = x + w / 2;
  var edge = center >= (area.left + area.right) / 2 ? "right" : "left";
  var dx = edge === "right" ? area.right - (x + w) : x - area.left;
  var fixed = fwClampAnchored(edge, dx, y, w, h, gap);
  return fixed;
}

/**
 * 边锚定 → 绝对坐标（渲染用）。
 * @param pos 边锚定位置 {edge, dx, y}。
 * @param w 卡片宽（px）。
 * @param h 卡片高（px）。
 * @param gap 贴边间距（px；缺省 FW_MARGIN）。停靠态传 FW_DOCK_GAP（0 = 贴死边缘）。
 * @returns {x, y} 绝对坐标。
 */
function fwAnchoredToAbs(pos, w, h, gap) {
  var area = fwContentArea();
  var fixed = fwClampAnchored(pos.edge, pos.dx, pos.y, w, h, gap);
  var x = fixed.edge === "right" ? area.right - w - fixed.dx : area.left + fixed.dx;
  return { x: Math.round(x), y: Math.round(fixed.y) };
}

/**
 * 主内容区（可用摆放区）的几何：**左侧工作区右边界 → 视口右边界**。
 *
 * 用途：
 * ① 相对定位——锚定/钳制都以它为准，窗口变宽后卡片自然留在右栏；
 * ② 吸附态——贴它的右缘；
 * ③ 拖动范围限制——左边界挡住，**不允许拖进左侧工作区**遮挡内容。
 *
 * 探测策略（分层，防官方类名随版本变化）：
 * ① 官方 CSS Modules 局部名后缀 `sidebarCol`（构建哈希前缀会变，**后缀稳定**）；
 * ② 兜底：按官方 `computeColumns` 的默认侧栏宽 264px 估算。
 * @returns {left, right, width} 主内容区边界（px）。
 */
function fwContentArea() {
  var vw = window.innerWidth || 1280;
  var left = FW_AREA_FALLBACK_LEFT;
  // ⚠️ 性能：拖动/缩放期间每帧都会调本函数（钳制坐标），而 `querySelector` 每次都要遍历 DOM。
  //    影响拖动手感，故加**短 TTL 缓存**（16ms ≈ 一帧，同一帧内复用；窗口变化会自然过期）。
  var now = Date.now();
  if (fwAreaCache && now - fwAreaCache.at < 16 && fwAreaCache.vw === vw) return fwAreaCache.area;
  try {
    var el = document.querySelector('[class*="sidebarCol"]');
    if (el) {
      var r = el.getBoundingClientRect();
      // 只在几何合理时采用（隐藏/折叠态宽度为 0 时退回兜底）
      if (r.width > 0 && r.right > 0 && r.right < vw) left = r.right;
    }
  } catch (e) {
    // 查询失败：用兜底值
  }
  if (!(left >= 0) || left > vw - 120) left = FW_AREA_FALLBACK_LEFT; // 异常值保护
  var area = { left: Math.round(left), right: vw, width: Math.round(vw - left) };
  fwAreaCache = { at: now, vw: vw, area: area };
  return area;
}
/** 主内容区几何的短 TTL 缓存（见 fwContentArea 的性能说明）。 */
var fwAreaCache = null;

/**
 * 钳制边锚定位置：y 在视口内；x 保证卡片**完全落在主内容区内**（不越左边界、不出右边界）。
 *
 * ⚠️ 三条边界规则（缺一就会出问题）：
 * ① **左边界 = 主内容区左边界 + gap**——「不要拖到最左侧工作区遮挡内容」；
 * ② 右边界 = 视口右缘 − gap；
 * ③ 卡片比主内容区还宽时（窄窗 + 大卡片），退化为「左对齐 + 允许溢出右侧」，不强行夹成负宽度。
 * @param edge "left" | "right"。
 * @param dx 到锚边的距离（px）。
 * @param y 绝对 top（px）。
 * @param w 卡片宽（px）。
 * @param h 卡片高（px）。
 * @param gap 贴边间距（px；缺省 FW_MARGIN）。停靠态传 FW_DOCK_GAP（0 = 贴死边缘）。
 * @returns 规范化后的边锚定位置。
 */
function fwClampAnchored(edge, dx, y, w, h, gap) {
  var area = fwContentArea();
  var vh = window.innerHeight || 800;
  var g = typeof gap === "number" && isFinite(gap) && gap >= 0 ? gap : FW_MARGIN;
  var maxDx = Math.max(0, area.width - w - g * 2);
  var d = Math.round(Math.min(Math.max(dx, g), maxDx >= g ? maxDx : g));
  var maxY = Math.max(g, vh - h - g);
  var yy = Math.round(Math.min(Math.max(y, g), maxY));
  return { edge: edge === "left" ? "left" : "right", dx: d, y: yy };
}

/** 保存小窗位置（边锚定格式；拖动/缩放/迁移后落库）。 */
function saveFwPos(pos) {
  try {
    var p = pos && (pos.edge === "left" || pos.edge === "right")
      ? { edge: pos.edge, dx: Math.round(pos.dx), y: Math.round(pos.y) }
      : fwAbsToAnchored(pos.x, pos.y, FW_W, FW_H);
    window.localStorage.setItem(FW_POS_KEY, JSON.stringify(p));
  } catch (e) {
    // 存不下不影响本次会话使用
  }
}

function loadFwMin() {
  try {
    return window.localStorage.getItem(FW_MIN_KEY) === "1";
  } catch (e) {
    return false;
  }
}

function saveFwMin(min) {
  try {
    window.localStorage.setItem(FW_MIN_KEY, min ? "1" : "0");
  } catch (e) {
    // 同上
  }
}

/** 读「手动停靠」偏好（卡片是否被拖到窗口边缘松手过）。 */
function loadFwDock() {
  try {
    return window.localStorage.getItem(FW_DOCK_KEY) === "1";
  } catch (e) {
    return false;
  }
}

/** 写「手动停靠」偏好。 */
function saveFwDock(on) {
  try {
    window.localStorage.setItem(FW_DOCK_KEY, on ? "1" : "0");
  } catch (e) {
    // 同上
  }
}

/** 读小窗尺寸；无记录/损坏返回 null（调用方用 CSS 默认宽度）。 */
function loadFwSize() {
  try {
    var raw = window.localStorage.getItem(FW_SIZE_KEY);
    if (raw === null) return null;
    var s = JSON.parse(raw);
    if (s && typeof s.w === "number" && typeof s.h === "number" && isFinite(s.w) && isFinite(s.h)) {
      return { w: clampFwW(s.w), h: clampFwH(s.h) };
    }
  } catch (e) {
    // 存储不可用/内容损坏：退回默认尺寸
  }
  return null;
}

function saveFwSize(size) {
  try {
    window.localStorage.setItem(FW_SIZE_KEY, JSON.stringify({ w: Math.round(size.w), h: Math.round(size.h) }));
  } catch (e) {
    // 存不下不影响本次会话使用
  }
}

function clampFwW(w) {
  var n = Number(w);
  // 非法/非正 → 回退到**下限**而非默认宽 FW_W：拖拽把手往左上拖过头时 w 会变负，
  // 若回退成 232 会跳过下限钳制（拖到最小却得 232×250 而非 200×260）。
  if (!isFinite(n) || n <= 0) return FW_MIN_W;
  return Math.max(FW_MIN_W, Math.min(FW_MAX_W, Math.round(n)));
}

function clampFwH(h) {
  var n = Number(h);
  if (!isFinite(n) || n <= 0) return FW_MIN_H;
  return Math.max(FW_MIN_H, Math.min(FW_MAX_H, Math.round(n)));
}

/**
 * 把**绝对坐标**钳制进主内容区（由「仅视口钳制」升级）。
 *
 * 与旧版的差别：旧版只保证「在视口内」，卡片可以被拖到最左侧工作区遮挡内容；
 * 新版以**主内容区**为界——左边界挡住、右边界贴视口，并保留 8px 边距。
 *
 * ⚠️ **gap 必须由调用方按「卡片当前是否吸附」传入**（勿再写死缺省）：
 *    吸附显示用 `FW_DOCK_GAP=0`，而这里缺省 `FW_MARGIN=18` —— **两个口径差 18px**，
 *    于是吸附态拖动（含双击时的几像素抖动）会把贴边的卡片钳到 +18（anchor 写
 *    `translate3d(282px,…)`、落库 `dx:18`），表现为「双击后卡片小幅右移」。
 *    口径唯一的做法：调用方传 `dockedRef.current ? FW_DOCK_GAP : FW_MARGIN`。
 * @param x 绝对 left（px）。
 * @param y 绝对 top（px）。
 * @param w 卡片宽（px）。
 * @param h 卡片高（px）。
 * @param gap 贴边间距（px；缺省 FW_MARGIN，**吸附态调用方必须显式传 FW_DOCK_GAP**）。
 * @returns {x, y} 绝对坐标（整数）。
 */
function clampFwPos(x, y, w, h, gap) {
  var anchored = fwAbsToAnchored(x, y, w, h, gap);
  return fwAnchoredToAbs(anchored, w, h, gap);
}

/** 默认位置：主内容区右下角（**边锚定**：贴右边缘 + 距底 FW_MARGIN）。 */
function defaultFwPos(w, h) {
  var vh = window.innerHeight || 800;
  var y = Math.max(FW_MARGIN, vh - h - FW_MARGIN);
  return fwClampAnchored("right", FW_MARGIN, y, w, h);
}

/**
 * **gap 口径的唯一来源**：吸附形态用 `FW_DOCK_GAP`，否则用 `FW_MARGIN`。
 *
 * ★ 新增原因：修「吸附态双击时卡片小幅右移」★
 *    症状：贴边卡片双击（必带几像素指针抖动 → 走拖动路径）后，
 *    卡片被钳到 +18（anchor 写 `translate3d(282px,…)`、落库 `dx:18`）。
 *    根因：**同一张卡片的「显示口径」与「钳制口径」用了两个不同的 gap**——
 *    吸附显示 `FW_DOCK_GAP=0`、钳制缺省 `FW_MARGIN=18`，差 18px 直接变成位移量
 *    （与「宽度口径分裂致 137px 错位」是同一条教训：**贴近边界的量差多少，位置就错多少**）。
 *
 * ⚠️ 判据必须是「**是否处于吸附形态**」（细条/折叠态/悬浮态都算，即 `stripForm`），
 *    **不能用「此刻是否正显示细条」**（`docked`）——双击时的指针抖动发生在**悬停展开之后**：
 *    那一刻 `docked` 已是 false 而卡片**仍贴在边缘**，用它会误选 18。
 * ⚠️ 新增任何「钳制/反算该卡片坐标」的路径都必须经本函数取 gap，不得再写字面缺省。
 *    （本函数存在的全部理由就是防这类分裂：口径只能有一处。）
 * @param stripForm 卡片是否处于吸附形态（narrow || dockManual）。
 * @returns {number} 贴边间距（px）。
 */
function fwGapFor(stripForm) {
  return stripForm ? FW_DOCK_GAP : FW_MARGIN;
}

/**
 * 格子边长（**缩放系数需一致应用于热力图容器及每个格子，
 * 确保格子之间的相对大小和布局不因缩放而失真**；并**提高上限、按可用空间自动封顶**）。
 *
 * 设计（三条硬约束）：
 *  ① **未缩放时（cardWidth ≤ 0）恒返回基准格 FW_CELL_BASE**——卡片宽度是 `max-content`（随内容），
 *     宽度由网格自身决定，不能反过来"按宽度算格子"（否则循环依赖；这正是此前
 *     「默认格子缩水到 21px」的根因：格子按高反算，而高又由格子决定，2px 常量误差被环放大 19%）。
 *  ② **缩放后（cardWidth > 0）**：格子按「可用宽 × 可用高」**双向**自适应——
 *     `cell = min(基准格 × 宽向比, 基准格 × 高向比)`，并**按可用空间自动封顶**（不再有固定 40px 上限，
 *     否则卡片放大而格子不动，违背等比要求）。
 *  ③ 所有格子共用同一 cell 值 → 格间相对大小恒等、网格宽高比恒为 weeks:7，布局不失真。
 * @param cardWidth 卡片宽（px；未缩放时传 0，表示宽度随内容、不作约束）。
 * @param cardHeight 卡片高（px；0/缺失时视为未缩放）。
 * @returns 格子边长（整数 px）。
 */
function fwCellForSize(cardWidth, cardHeight) {
  if (!(cardWidth > 0) || !(cardHeight > 0)) return FW_CELL_BASE;
  var baseGridW = FW_WEEKS * FW_CELL_BASE + (FW_WEEKS - 1) * FW_GAP;
  var baseGridH = FW_ROWS * FW_CELL_BASE + (FW_ROWS - 1) * FW_GAP;
  // 可用宽/高：扣掉**卡片**的固定占用（横向 52px、纵向随字号变化，见 fwChromeH）。
  // 高向用「基准格算出的占用」估算——数字行高度只由字号系数决定，而字号系数又由格子决定，
  // 故取基准格对应的占用值（误差 <1px，且该值偏保守：格子变小则占用变小）。
  var chromeH = fwChromeH(FW_CELL_BASE);
  var usableGridW = Math.max(0, cardWidth - FW_CHROME_W);
  var usableGridH = Math.max(0, cardHeight - chromeH);
  // 两个方向的「每格可用边长」，取较小者 → 保证两向都装得下（双向自适应，任一方向都不溢出）。
  var perW = (usableGridW - (FW_WEEKS - 1) * FW_GAP) / FW_WEEKS;
  var perH = (usableGridH - (FW_ROWS - 1) * FW_GAP) / FW_ROWS;
  var cell = Math.floor(Math.min(perW, perH));
  if (!(cell > 0)) return FW_CELL_MIN;
  return Math.max(FW_CELL_MIN, Math.min(FW_CELL_MAX, cell));
}

/** 主窗布局计划：6 周 × 7 天，格子随卡片尺寸等比变化（供渲染与测试共用同一口径）。
 *  `cardWidth` 传 0（或高 ≤ 0）表示「未缩放：宽度随内容、格子取基准值」。
 *  返回的 scale 为「相对基准格的倍率」，供字号同步缩放使用。 */
function fwGridPlan(cardWidth, cardHeight) {
  var baseGridW = FW_WEEKS * FW_CELL_BASE + (FW_WEEKS - 1) * FW_GAP;
  var baseGridH = FW_ROWS * FW_CELL_BASE + (FW_ROWS - 1) * FW_GAP;
  var cell = fwCellForSize(cardWidth, cardHeight);
  // 未缩放：卡片尺寸由内容决定（网格 + 固定占用）；缩放后：用调用方给的尺寸。
  var w = cardWidth > 0 ? cardWidth : baseGridW + FW_CHROME_W;
  var h = cardHeight > 0 && cardWidth > 0 ? cardHeight : baseGridH + fwChromeH(cell);
  return {
    cell: cell,
    weeks: FW_WEEKS,
    gridW: FW_WEEKS * cell + (FW_WEEKS - 1) * FW_GAP,
    gridH: FW_ROWS * cell + (FW_ROWS - 1) * FW_GAP,
    scale: cell / FW_CELL_BASE,
    baseW: baseGridW + FW_CHROME_W,
    baseH: baseGridH + fwChromeH(FW_CELL_BASE)
  };
}

// ======== 10b-float-grid.js ========
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

// ======== 10c-float.js ========
// 分片 10c · 悬浮小窗：组件本体（TokenFloatWindow + applyFloat 挂载）
/**
 * 常驻悬浮小窗。
 *
 * 行为：拖动移动（位置记忆）、双击折叠成标题行、会话运行中缓慢呼吸、
 * 点击方块选日、悬停方块看明细、悬停卡片展开完整历史面板。
 * 全部 hooks 前置到任何条件返回之前（React 渲染顺序稳定；hooks 顺序错乱会让整页崩溃）。
 * @param props - 插槽注入：{ remote? }（remote 用于订阅进程级会话运行状态）。
 */
function TokenFloatWindow(props) {
  var state = useState(null); // {status, data, fetchedAt} —— 与分区页同源的 summary
  var st = state[0];
  var setSt = state[1];
  var posState = useState(function () {
    return loadFwPos() || defaultFwPos(FW_W, FW_H);
  });
  var pos = posState[0];
  var setPos = posState[1];
  var minState = useState(function () {
    return loadFwMin();
  });
  var minimized = minState[0];
  var setMinimized = minState[1];
  var runState = useState(false); // 是否有会话正在运行（进程级，来自 remote 事件总线）
  var running = runState[0];
  var setRunning = runState[1];
  // 点击热力图方块选中的日期（null = 跟随「今天」）；只影响主数字显示，不影响轮询
  var selState = useState(null);
  var selDate = selState[0];
  var setSelDate = selState[1];
  // 方块悬停气泡 {x, y, below, title, detail} | null
  var tipState = useState(null);
  var tip = tipState[0];
  var setTip = tipState[1];
  // 完整历史面板是否展开（悬停 160ms 后开；两个表面都离开 220ms 后关）
  var panelState = useState(false);
  var panelOpen = panelState[0];
  var setPanelOpen = panelState[1];
  // 卡片**高度**（驱动主窗格子等比缩放；挂载、resize、用户缩放后更新）。
  // ⚠️ 不跟踪宽度：宽度是 `max-content`（随内容），跟踪它会与「按高度算格子 → 网格决定宽度」
  // 形成循环依赖（宽度反馈 + min-width 会导致横向留白）。
  var heightState = useState(FW_H);
  var cardH = heightState[0];
  var setCardH = heightState[1];
  // 卡片尺寸（用户拖右下角把手调整）。null = 用 CSS 默认宽度，不写死 style。
  var sizeState = useState(function () {
    return loadFwSize();
  });
  var size = sizeState[0];
  var setSize = sizeState[1];
  /**
   * 手势进行中（拖动移动 / 右下角缩放）。
   * ⚠️ 必须是 **state**（不能只用 draggingRef）：面板可见性要随手势变化重渲染，
   * 用 ref 不会触发渲染（等价形态：`panelOpen = open && !minimized && !dragging`）。
   *
   * 为何手势期间要收起面板：
   * 面板位置由 `safePos`（**state**）算出，而手势期间坐标只写 DOM CSS 变量 + `posRef`（不 setState，
   * 否则每帧重渲染卡顿）→ 面板停在旧坐标上、卡片却已移走，间距会由 8px 变成负值（面板被卡片盖住）。
   * 松手后 setPos 落库 → 面板按新位置重新出现，即「跟随」。
   */
  var gestureState = useState(false);
  var gesture = gestureState[0];
  var setGesture = gestureState[1];
  /**
   * 窄窗（未最大化）。**只表示窗口几何**，不再直接等于「进停靠态」——
   * 停靠条件 = `narrow` **或** 手动停靠（`dockManual`），见渲染段 `docked`。
   * ⚠️ 新增 state 必须**追加在既有 state 之后**：渲染器的 hook 按下标取值，
   *    插在中间会移位后续所有下标（否则依赖下标取值的逻辑会错位）。
   */
  var narrowState = useState(function () {
    return fwIsNarrow();
  });
  var narrow = narrowState[0];
  var setNarrow = narrowState[1];
  /** 停靠态下指针是否停在卡片上（悬停原地展开；离开后收回细条）。 */
  var peekState = useState(false);
  var peekHover = peekState[0];
  var setPeekHover = peekState[1];
  /**
   * **手动停靠**（把卡片拖到窗口左/右边缘松手 → true）。
   *
   * ⚠️ 与 `narrow` 分开存是「最大化状态下也应能吸附」的前提：
   *    窄窗判定在最大化时必然为 false，若手动停靠也挂在它下面，一最大化就被冲掉。
   * ⚠️ 追加在既有 state 之后（渲染器按下标取 hook 值，插中间会移位后续下标）。
   */
  var dockState = useState(function () {
    return loadFwDock();
  });
  var dockManual = dockState[0];
  var setDockManual = dockState[1];
  /**
   * 细条形态下的**形态档位**。
   *
   * 最终规则（吸附态）：**悬停 → 折叠态（临时）；双击 → 悬浮态（锁定）；双击悬浮态 → 折叠态（临时）**；
   * **单击不改档**（曾有的「单击锁定折叠态」语义已取消）。
   * 三档语义（细条形态下）：
   *   0 = 细条（默认态，24×74，竖排今日数字）
   *   1 = 折叠态（标题行 + 今日数字）——由**悬停**（临时）或**双击悬浮态后退一步**（临时）到达
   *   2 = 悬浮态（完整热力图）——**双击**到达（锁定，指针移开也保持）
   *
   * ⚠️ 与 `peekHover` 的区别（勿合并，两者语义不同）：
   *    `peekHover` = **临时悬停预览**（指针离开即自动收回细条），是「指针在不在」的派生态；
   *    本状态 = **显式意图**（双击选定，指针离开也保持）。
   *     两者**取较大档位**合成最终形态（见渲染段 `dockLevelEff`），故双击锁定后悬停不会把它顶回去。
   * ⚠️ 追加在既有 state 之后（渲染器按下标取 hook 值，插中间会移位后续下标）。
   */
  var dockLevelState = useState(0);
  var dockLevel = dockLevelState[0];
  var setDockLevel = dockLevelState[1];
  var narrowRef = useRef(narrow);
  /** 手动停靠偏好的最新值（自愈定时器与手势回调里要读，渲染期快照会过期）。 */
  var dockManualRef = useRef(dockManual);
  /**
   * 「当前是否处于**细条形态**」= 窄窗自动停靠 **或** 手动停靠。
   *
   * ⚠️ 悬停状态机的门槛必须用它，**不能用 `narrow`**：
   *    旧版写 `if (!narrowRef.current) return;`，于是**任何窄窗**（哪怕卡片根本没停靠）
   *    都会在指针碰到卡片时安排「展开」，而展开又会按停靠规则把卡片瞬移到边缘
   *    → 指针落到卡片外 → 收回 → 再展开……**往返闪烁**（卡片在锚边之间反复横跳）。
   *    改为「只有真的处于细条形态才参与停靠悬停」，非停靠状态下的悬停完全不触发位移。
   */
  var stripFormRef = useRef(false);
  /**
   * 「抑制悬停预览」：**显式收起**（双击悬浮态后退到折叠态以外的降档路径）后置真，指针真正离开时解除。
   *
   * ⚠️ 为何必须有（设计档位切换时发现）：切换时指针**正停在卡片上**，
   *    收起后细条立即显示；此时若自愈状态机按「指针还在元素上」判定，会在 120ms 后
   *    自动把卡片又展开 → **收不起来**（看起来像点击坏了）。
   *    抑制标志使「显式意图」优先于「悬停预览」，直到指针离开才恢复自动预览。
   * ⚠️ 语义收敛后，唯一会置真的路径是 `fwSetDockLevel(0)`（降档收起到细条）；
   *    双击悬浮态后退到折叠态时**必须显式清除**它，否则折叠态会锁死、指针移开不回细条
   *    （见 onDoubleClick 的说明）。
   */
  var peekSuppressRef = useRef(false);
  /** 「细条当前是否正在显示」（= 细条形态且未展开到任何高档）：手势判定用它（细条无缩放把手）。 */
  var dockedRef = useRef(false);
  /** 「显式展开」的最新档位（0/1/2，回调里要读写，渲染期快照会过期）。 */
  var dockLevelRef = useRef(0);
  /**
   * 「展开时的**垂直锚点**」= 指针的**绝对 clientY**（视口坐标）。
   *
   * ★★ 防闪烁的关键（新增，勿删）★★
   *    细条高 74px，展开后的折叠态只有 61px——**展开时高度变小**。
   *    若完全顶部对齐（两种形态 top 相同），指针停在细条下半部（如 y=70）时，
   *    展开后该点已落到 61px 高的元素**之外** → 浏览器立即判定 mouseleave → 收回细条
   *    → 指针又落回细条上 → 再展开……**无限闪烁**（同一根因的经典坑）。
   *    故展开时按**最小必要位移**重算 top（见渲染段定位式）：
   *    默认完全不动，仅当指针会掉出下边缘时才下移刚好够用的距离。
   *
   * ★ 折叠态悬停不得引入位移 ★
   *    旧写法是**无条件把指针居中**（`newTop = 指针y − 新形态高/2`）——
   *    指针在细条**上半部**时，居中就意味着把 top **上移**（位移量 = 指针偏移 − 新形态半高）。
   *    现改为最小必要位移后，上半部**零位移**；且本锚点**只在细条显示期间记录**
   *    （见 fwCapturePointerY），避免折叠态内移动鼠标时被反复重锚而持续上移。
   *
   * ⚠️ **必须存「绝对坐标」而非「相对细条的偏移」**（踩过的坑，勿改）：
   *    首版存的是相对偏移，展开后每帧用「当前 top + 偏移」反推指针绝对 y——
   *    而展开后的 top 已被上式改过，再叠加偏移就**每帧漂移一次**（卡片会持续上移）。
   *    存绝对值后本式**幂等**：同一指针位置无论渲染多少次都得到同一个 top。
   * ⚠️ 无指针信息时（键盘/程序化切换）退化为顶部对齐。
   */
  var dockPointerYRef = useRef(null);
  var peekTimerRef = useRef(null);
  // 停靠态「已展开」的最新值：自愈定时器回调里必须读它（闭包里的 peekHover 是渲染期快照，会过期）
  var peekHoverRef = useRef(peekHover);
  peekHoverRef.current = peekHover;
  var anchorRef = useRef(null);
  var cardRef = useRef(null);
  var dragRef = useRef(null); // {pointerId,startX,startY,originX,originY,moved}
  var posRef = useRef(pos); // 拖动期间的最新坐标（避免闭包读到旧 state）
  var draggingRef = useRef(false); // 拖动进行中：期间不得用 state 覆盖 posRef（否则拖动中若发生重渲染，坐标回跳）
  var resizeRef = useRef(null); // {pointerId,startX,startY,startW,startH}（缩放手势）
  var resizingRef = useRef(false); // 缩放进行中（与拖动互斥：拖位置 vs 改尺寸）
  var sizeRef = useRef(size); // 缩放期间的最新尺寸（避免闭包读到旧 state）
  var remoteRef = useRef(props ? props.remote : null);
  // 悬停状态机：标题栏/卡片/面板各自是否被指针覆盖 + 两个计时器
  // （head 决定「是否安排展开」，card/panel 只负责「保持展开」，见 enterSurface 说明）
  var hoverHeadRef = useRef(false);
  var hoverCardRef = useRef(false);
  var hoverPanelRef = useRef(false);
  var openTimerRef = useRef(null);
  var closeTimerRef = useRef(null);
  // 过期响应守卫：每次请求自增序号，只有最新序号的响应才写入状态
  // （慢响应晚到会覆盖新数据——自增序号的通行做法）
  var reqSeqRef = useRef(0);

  // 仅当「不在拖动中」才把 state 同步进 ref。拖动中 posRef 是权威（onPointerMove 持续写入），
  // 无条件覆盖会让轮询触发的重渲染把坐标打回上一次 state 值（拖动卡顿/回跳）。
  if (!draggingRef.current) posRef.current = pos;
  // 同理：缩放期间 sizeRef 是权威（onPointerMove 持续写入），否则重渲染会打回旧尺寸。
  if (!resizingRef.current) sizeRef.current = size;
  remoteRef.current = props ? props.remote : null;

  // —— 轮询 summary（可见期间；切走暂停，与分区页同一节奏）——
  useEffect(function () {
    var timer = null;
    function load() {
      var seq = ++reqSeqRef.current;
      fetch("/token-stats/summary")
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function (data) {
          if (seq !== reqSeqRef.current) return; // 过期响应：丢弃，别覆盖更新的数据
          setSt({ status: "ok", data: data, fetchedAt: Date.now() });
        })
        .catch(function (err) {
          if (seq !== reqSeqRef.current) return;
          setSt(function (prev) {
            return { status: "error", data: prev ? prev.data : null, message: String((err && err.message) || err), fetchedAt: prev ? prev.fetchedAt : null };
          });
        });
    }
    function start() {
      if (timer === null) {
        load();
        timer = setInterval(load, POLL_MS);
      }
    }
    function stop() {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    }
    function onVis() {
      if (document.visibilityState === "visible") start();
      else stop();
    }
    start();
    document.addEventListener("visibilitychange", onVis);
    return function () {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // —— 会话运行状态：订阅进程级 api-session/status（首条 running:true 起、最后一条 false 止）——
  // 该订阅是本窗口「呼吸」的唯一依据：remote 由插槽 inject 提供（组件不自行取 context）。
  useEffect(function () {
    var remote = remoteRef.current;
    if (!remote || typeof remote.$on !== "function") return undefined;
    var runningIds = {};
    var unsubscribe = remote.$on("api-session/status", function (sessionId, isRunning) {
      var key = sessionId === undefined || sessionId === null ? "unknown" : String(sessionId);
      if (isRunning) runningIds[key] = true;
      else delete runningIds[key];
      var any = false;
      for (var k in runningIds) {
        if (runningIds[k]) {
          any = true;
          break;
        }
      }
      setRunning(any);
    });
    return function () {
      if (typeof unsubscribe === "function") unsubscribe();
      if (openTimerRef.current !== null) clearTimeout(openTimerRef.current);
      if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // —— 视口变化重定位（由「仅钳制」升级为「按边锚定重算」）——
  //
  // 场景：卡片放在最右栏位，窗口最大化后跑到中间。
  // 根因：位置存的是**视口绝对坐标**，窗口变宽时只做「钳制进视口」→ 与栏位的相对关系丢失。
  // 现象：窗口变宽时卡片 left 恒定不变，距右栏的偏移由正值翻成较大负值，甚至侵入主内容区。
  //
  // 修法：位置语义改为**边锚定**（{edge, dx, y}）——存「距主内容区哪一边多远」，
  // 窗口变化时按新几何**重算绝对坐标**，相对关系天然保持。
  //
  // ⚠️ 依赖列表含 st/minimized/selDate：卡片高度随「有无数据」「是否选中」「是否折叠」变化，
  // 每次渲染后都要按**实际高度**重新钳制，否则底部会留在视口外——而视口外的元素点不动
  // （真实 Chromium 中：pointerdown/up 命中方块却始终没有 click）。
  useEffect(function () {
    var card = cardRef.current;
    var rect = card ? card.getBoundingClientRect() : null;
    var w = rect ? rect.width : FW_W;
    var h = rect ? rect.height : FW_H;
    // ⚠️ 只把**高度**写进 state：宽度是 `max-content`（随内容），若也写成 state 会与
    // 「按高度算格子 → 网格决定宽度」形成循环依赖（min-width + 宽度反馈会导致留白）。
    // 高度是独立约束（用户拖把手改的就是它），由它算格子、宽度自然跟随。
    // ⚠️ **折叠态不写**：折叠条的高（约 61px）不是用户意图，写进去会让展开首帧
    //    按 61px 算格子（网格缩成一小团）再被下一次测量纠正——肉眼可见的闪动。
    //    展开态的实际高才是约束，故折叠期间保持原值不动。
    // ⚠️ **停靠态同样不写**（同源问题）：细条高仅 74px，若写进 cardH，
    //    悬停展开时 y 钳制会用 74px 算（以为卡片很矮）→ 展开后底部越出视口
    //    → **视口外的元素点不动**（真实 Chromium 中可复现该故障）。
    //    判据直接读渲染写下的 data-peek（与渲染同一份事实，避免两处口径漂移）。
    var isDockStrip = !!(card && card.getAttribute && card.getAttribute("data-peek") === "1");
    if (!minimized && !isDockStrip && card && rect.height > 0 && Math.abs(rect.height - cardH) >= 0.5) setCardH(rect.height);
    // 边锚定：按新几何重算绝对坐标（旧数据已在 loadFwPos 里迁移成边锚定）
    // ⚠️ gap 必须走 `fwGapFor`（与「吸附态位移」修复的**同源位置**）：
    //    此路径在停靠形态下同样重算坐标，缺省 FW_MARGIN(18) 会把贴边的 y 钳到 18..
    //    （两种口径下 y 的上限差 18px），是同一个「显示口径=0、钳制口径=18」分裂。
    var curGap = fwGapFor(stripFormRef.current);
    var cur = posRef.current;
    var anchored = cur && (cur.edge === "left" || cur.edge === "right") ? cur : fwAbsToAnchored(cur.x, cur.y, w, h, curGap);
    var next = fwClampAnchored(anchored.edge, anchored.dx, anchored.y, w, h, curGap);
    if (!cur || next.edge !== cur.edge || next.dx !== cur.dx || next.y !== cur.y) setPos(next);
    function onResize() {
      var c = cardRef.current;
      var cr = c ? c.getBoundingClientRect() : null;
      var cw = cr ? cr.width : FW_W;
      var ch = cr ? cr.height : FW_H;
      var strip = !!(c && c.getAttribute && c.getAttribute("data-peek") === "1");
      if (!minimized && !strip && cr && cr.height > 0) setCardH(cr.height);
      // 窄窗/宽窗切换：重算窄窗态
      // ⚠️ **手动停靠不受窗口变化影响**（「最大化时也能吸附」）：
      //    这里只更新 narrow，不动 dockManual——否则一最大化就把手动吸附冲掉了。
      var nw = fwIsNarrow();
      if (nw !== narrowRef.current) {
        narrowRef.current = nw;
        setNarrow(nw);
        setPeekHover(false);
      }
      var c2 = posRef.current;
      var rGap = fwGapFor(stripFormRef.current); // 同源：resize 重定位与主 effect 必须同口径（见上方说明）
      var a2 = c2 && (c2.edge === "left" || c2.edge === "right") ? c2 : fwAbsToAnchored(c2.x, c2.y, cw, ch, rGap);
      var p2 = fwClampAnchored(a2.edge, a2.dx, a2.y, cw, ch, rGap);
      if (!c2 || p2.edge !== c2.edge || p2.dx !== c2.dx || p2.y !== c2.y) setPos(p2);
    }
    window.addEventListener("resize", onResize);
    return function () {
      window.removeEventListener("resize", onResize);
    };
  }, [minimized, st, selDate, cardH]);

  /**
   * 卡片当前是否**真的**处于指针悬停状态。
   *
   * ⚠️ 为何不能只信 `hoverCardRef`（已知缺陷，必须用浏览器真实状态复核）：
   *    细条 ↔ 展开切换时，卡片的**子节点结构整体不同**（细条渲染 `.tks-fw-dock`、
   *    展开渲染标题行/数字行/网格），React 会替换这些子节点。
   *    节点被替换时浏览器可能派发「幽灵 mouseenter」——**enter/leave 的到达顺序不保证**，
   *    若 leave 先到、enter 后到，`hoverCardRef` 就残留为 `true`，而指针其实早已移开
   *    → 收回定时器里的「refs 全空」判定永远不成立 → **细条永不收回**
   *    （现象：指针已移开，卡片却仍保持展开宽、`data-peek` 恒为 null）。
   *    改用浏览器自己维护的 `:hover` 伪类：它是**真实几何状态**，与事件到达顺序无关。
   *    （同源教训：读缓存状态而不读现实，会在位置、样式与渲染语义上同时出错。）
   * @returns true/false = 指针是否停在卡片上；**null = 无法判定**（无 ref / 老浏览器不支持 matches）。
   */
  function fwCardHovered() {
    var card = cardRef.current;
    if (!card || typeof card.matches !== "function") return null;
    try {
      return !!card.matches(":hover");
    } catch (e) {
      return null;
    }
  }

  /**
   * 记录「指针停在细条上的**绝对 clientY**」（视口坐标，供展开时算最小必要位移）。
   *
   * ★★ 防闪烁的关键数据（新增，勿删）★★
   *    细条高 74px、展开后的折叠态只有 61px——**展开时高度变小**。
   *    若完全顶部对齐（两形态 top 相同），指针停在细条下半部（如 y=70）时，
   *    展开后该点已落到 61px 高的元素**之外** → 浏览器立即判定 mouseleave → 收回细条
   *    → 指针又落回细条上 → 再展开……**无限闪烁**（同一根因的经典坑）。
   *    故在「指针进入细条」时记下它的绝对 y，展开时按**最小必要位移**重算 top
   *    （旧写法是无条件居中，会让指针在上半部时**上移**）。
   *
   * ⚠️ **只在细条显示期间记录**（见函数内守卫）：
   *    折叠态也有标题栏，若那时也重锚，折叠态内移动鼠标会让窗口持续上移。
   *
   * 数据来源：`event.clientY`（真实事件自带）。桩环境无该字段时保持 null，
   * 渲染段退化为顶部对齐——不阻断功能，只是失去这一层防闪烁保险。
   * @param event 触发悬停的鼠标事件（可空；空则保持原值）。
   */
  function fwCapturePointerY(event) {
    if (!event || typeof event.clientY !== "number") return;
    // ⚠️ **只在细条显示期间记录**（勿删）：
    //    本函数由 enterSurface 在指针进入卡片/标题栏时调用，而**折叠态也有标题栏**——
    //    若折叠态下也重锚，指针每移到一个新位置就改写 dockPointerYRef，
    //    随后任何一次重渲染都会按新锚点重算 top → 折叠态内移动鼠标**持续上移**
    //    （现象：单击进折叠态后窗口会持续小幅上移）。
    //    语义上「展开时的垂直锚点」只属于**细条 → 高档**这一次跃迁；已在折叠态/完整卡片态时，
    //    指针位置不再参与定位（此时 top 由 state 权威决定，不该被指针牵着走）。
    if (!dockedRef.current) return;
    var card = cardRef.current;
    if (!card || typeof card.getBoundingClientRect !== "function") return;
    try {
      var r = card.getBoundingClientRect();
      // 用浏览器真实几何复核：只有指针确实落在卡片垂直范围内才记录
      // （避免「指针在卡片外」时记下一个越界值，反而把展开后的卡片推到不合理的位置）
      if (event.clientY >= r.top && event.clientY <= r.bottom) dockPointerYRef.current = event.clientY;
    } catch (e) {
      // 几何不可得：保持原值
    }
  }

  /**
   * 安排「停靠态悬停预览」：延迟后按**浏览器真实悬停状态**决定是否展开到**折叠态**。
   *
   * ⚠️ 设计要点（对该缺陷的根治，勿简化）：
   *    细条 ↔ 展开切换会替换卡片的子节点（细条渲染 `.tks-fw-dock`、展开渲染标题/数字/网格），
   *    节点被替换时浏览器会派发**幽灵 mouseleave**（移除的节点触发 leave），
   *    而 enter/leave 的到达顺序不保证 → 单靠 refs 计数必然错乱：
   *    表现为「细条永不展开」（enter 被随后的幽灵 leave 清掉）或「展开后永不收回」。
   *    故**唯一权威是 `card.matches(':hover')`**（浏览器维护的真实几何状态，与事件顺序无关），
   *    refs 只作辅助。本函数与 fwSchedulePeekClose 构成自愈状态机：
   *    任一时刻被调用，都会按「现在指针到底在不在卡片上」重新收敛到正确形态。
   *
   * ★ 悬停目标由「完整卡片」改为**折叠态**（悬停出折叠态而非完整卡片）。
   *   理由：细条只有 24px 宽，只想「瞄一眼数字」时不该被塞一整张热力图；
   *   折叠态（标题 + 今日数字）信息密度恰好、遮挡小；要看完整热力图**双击**即可。
   * ⚠️ 悬停只升到**档位 1**，不得覆盖已选的更高档（双击到档位 2 后，悬停/移开都不该降级）。
   */
  function fwSchedulePeekOpen() {
    if (!stripFormRef.current) return;
    // 已双击锁定在悬浮态（档位 2）→ 悬停预览不参与，避免把它顶回折叠态
    if (dockLevelRef.current >= 2) return;
    // 刚显式收起到细条（降档路径置真）→ 在指针真正离开前不自动预览展开（见 peekSuppressRef 说明）
    if (peekSuppressRef.current) return;
    if (peekTimerRef.current !== null) {
      clearTimeout(peekTimerRef.current);
      peekTimerRef.current = null;
    }
    peekTimerRef.current = setTimeout(function () {
      peekTimerRef.current = null;
      if (!stripFormRef.current) return;
      if (dockLevelRef.current >= 2) return;
      if (peekSuppressRef.current) return;
      var hov = fwCardHovered();
      // null = 判定不了（桩/老浏览器）→ 退回 refs 口径，不阻断功能
      if (hov === false) return; // 指针已离开：不展开
      if (hov === null && !hoverCardRef.current && !hoverHeadRef.current) return;
      setPeekHover(true);
    }, FW_PEEK_OPEN_DELAY_MS);
  }

  /** 安排「停靠态收回」：延迟后若指针确实不在卡片上才收回；仍在则改判为「应展开」（自愈）。 */
  function fwSchedulePeekClose() {
    if (!stripFormRef.current) return;
    if (peekTimerRef.current !== null) {
      clearTimeout(peekTimerRef.current);
      peekTimerRef.current = null;
    }
    peekTimerRef.current = setTimeout(function () {
      peekTimerRef.current = null;
      if (!stripFormRef.current) return;
      // 抑制期间（刚显式收起）：不补展开，等指针离开后由 leaveSurface 解除抑制
      if (peekSuppressRef.current) return;
      // ⚠️ 判定顺序：**先看权威的 `:hover`，refs 只在无法判定时兜底**。
      //    反过来（先看 refs）会出问题：细条↔展开切换产生的幽灵事件让 refs 残留为真，
      //    于是「指针明明已移开、却永远不收回」（表现为卡片保持展开宽度不收回）。
      var hov = fwCardHovered();
      if (hov === true) {
        // 指针仍在卡片上（多为子节点替换产生的幽灵 leave）→ 不收回；若尚未展开则补上展开
        if (!peekHoverRef.current && dockLevelRef.current < 2) fwSchedulePeekOpen();
        return;
      }
      if (hov === null && (hoverCardRef.current || hoverHeadRef.current || hoverPanelRef.current)) return;
      setPeekHover(false);
    }, FW_PEEK_CLOSE_DELAY_MS);
  }

  /**
   * 悬停进入某个表面（'head' | 'card' | 'panel'）：取消关闭计时；**仅标题栏**可安排展开。
   *
   * 只有指针停在标题栏（「Token 统计」那一行）上才展开：鼠标扫过热力图时不再频繁误弹。
   *
   * ⚠️ 为何「保持」仍看 card/panel：面板在卡片下方时，指针从标题栏移向面板必须**穿过卡片本体**，
   * 若保持也只看标题栏，穿过途中就会判定离开 → 面板闪断收不起来。故职责拆分为
   * 「head 决定打开、card+panel 决定保持」（双计时器思路）。
   * @param which 'head' | 'card' | 'panel'
   * @param event 鼠标事件（可空）。**仅用于记录指针的垂直偏移**（防展开时高度变小导致闪烁，
   *   见 dockPointerYRef）；桩/程序化调用不传时该层保险自动退化，不影响其余逻辑。
   */
  function enterSurface(which, event) {
    if (which === "head") hoverHeadRef.current = true;
    else if (which === "card") hoverCardRef.current = true;
    else hoverPanelRef.current = true;
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    // —— 停靠态：指针进入细条 → 原地展开 ——
    // ⚠️ **原地展开**（卡片贴合边不动、向另一侧生长）：细条贴死锚边，若展开后的卡片也保持贴合，
    //    指针（在细条上，距边约 12px）始终落在卡片内 → 不会触发 mouseleave → 无闪烁死循环。
    //    （若展开时缩进 18px，指针就落到卡片外 → 立即收回 → 再展开……同类组件上踩过同款坑。）
    //    ⚠️ 细条**自带 onMouseEnter**（见渲染段说明）：卡片上的 mouseenter 只在跨边界时派发，
    //    而细条是在原卡片位置上原地收缩出来的，指针可能从未跨边界 → 必须由细条自己声明意图。
    //    ⚠️ 判据用 stripFormRef（真的处于细条形态），**不是 narrowRef**（见该 ref 的说明）。
    if (stripFormRef.current) {
      // ★ 记录指针的**绝对 clientY**（用于最小必要位移）：
      //   细条 74px 高、折叠态仅 61px 高，展开时高度变小——若完全顶部对齐，
      //   指针停在细条下半部时展开后会落到元素外 → 无限闪烁。
      //   故记下指针位置，展开时按「最小必要位移」重算 top（见 dockPointerYRef 与渲染段定位式）。
      //   ⚠️ 函数内部只在**细条显示期间**记录，折叠态内移动鼠标不会重锚（否则会持续上移）。
      fwCapturePointerY(event);
      fwSchedulePeekOpen();
    }
    // 只有标题栏悬停才安排展开（面板自身的 mouseenter 不触发打开）
    if (which !== "head") return;
    // ⚠️ **停靠态的细条/折叠态（档位 0/1）不安排历史面板**（已知的交互缺陷，必须挡住）：
    //    指针停在细条上 → 原地展开 → 展开后的**标题栏恰好落在指针下方**
    //    → 触发「悬停标题栏 160ms 弹面板」→ 面板的 mouseenter 令 hoverPanelRef 恒为真
    //    → 指针移开后判定「仍在面板上」→ **细条永不收回**（表现为 data-peek 恒为 null、卡片保持展开宽）。
    //    需求是「不管吸附还是拖到别处，鼠标指到标题就显示完整历史」，不能因噎废食。
    //    档位 2 是**双击锁定**的显式意图（不是临时预览），指针离开只收面板、卡片保持悬浮态，
    //    故不存在上面那条「细条永不收回」的死锁链——防线仍然保留给档位 0/1（临时预览）。
    if (stripFormRef.current && dockLevelRef.current < 2) return;
    // 手势中不安排展开（拖动用 draggingRef、缩放用 resizingRef，两者都要挡：
    // 缩放同样会让卡片变大、面板若同时弹出会与手势抢焦点）
    // ⚠️ 折叠判据用 `effMinimized`（有效折叠）而非 `minimized`（宽窗折叠偏好）：
    //    吸附态档位 2 下 `effMinimized` 必为 false，而 `minimized` 可能是宽窗下遗留的偏好 true
    //    → 用后者会把吸附态悬浮态的标题悬停**静默拦掉**（表现为吸附时点标题没反应）。
    if (draggingRef.current || resizingRef.current || effMinimized || panelOpen || openTimerRef.current !== null) return;
    openTimerRef.current = setTimeout(function () {
      openTimerRef.current = null;
      // 计时结束时指针须仍在标题栏上（快速划走则不展开），且未进入拖动/缩放/折叠态
      if (!hoverHeadRef.current) return;
      if (draggingRef.current || resizingRef.current || effMinimized) return;
      setPanelOpen(true);
    }, FW_OPEN_DELAY_MS);
  }

  /**
   * 悬停离开某个表面：三个表面（标题栏/卡片/面板）都空了才安排收起。
   * 从标题栏移到卡片本体（或从卡片移到下方面板）的途中不会闪断。
   */
  function leaveSurface(which) {
    if (which === "head") hoverHeadRef.current = false;
    else if (which === "card") hoverCardRef.current = false;
    else hoverPanelRef.current = false;
    // 指针离开 → 解除「抑制悬停预览」（细条形态下双击收起后，指针移开即恢复自动预览）
    if (!hoverHeadRef.current && !hoverCardRef.current && !hoverPanelRef.current) peekSuppressRef.current = false;
    // —— 停靠态：指针离开细条/展开窗口 → 收回细条（延迟收起，给移回的时间）——
    // ⚠️ 走自愈状态机（见 fwSchedulePeekClose 说明）：若延迟到期时指针其实仍在卡片上
    //    （多为子节点替换产生的幽灵 leave），不收回而是补上展开——避免「永不展开/永不收回」两种死锁。
    if (stripFormRef.current) fwSchedulePeekClose();
    if (draggingRef.current || resizingRef.current) return; // 手势中不安排收起（面板本就已隐藏，见 panelVisible）
    if (hoverHeadRef.current || hoverCardRef.current || hoverPanelRef.current) return;
    if (openTimerRef.current !== null) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(function () {
      closeTimerRef.current = null;
      if (hoverHeadRef.current || hoverCardRef.current || hoverPanelRef.current || draggingRef.current || resizingRef.current) return;
      setPanelOpen(false);
      setTip(null);
    }, FW_CLOSE_DELAY_MS);
  }

  /**
   * 指针按下：按落点决定「缩放」还是「拖动」。
   * - 落点在**右下角把手区**（.tks-fw-grip 内，或卡片右下 FW_RESIZE_ZONE 范围内）→ 起缩放手势；
   * - 其余位置 → 起拖动手势（原有行为）。
   * 缩放与拖动互斥（resizingRef / draggingRef），避免同时改坐标与尺寸。
   */
  function onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;
    var src = event.target;
    var node = cardRef.current || event.currentTarget;
    if (!node) return;
    var rect = node.getBoundingClientRect();
    // —— 缩放分支：右下角把手 ——
    // ⚠️ 折叠态**整体禁用缩放**（同源修复）：折叠后不显示把手，若判定仍生效，
    //    在折叠条右下角按下想拖动时会静默改成缩放（改的是看不见的尺寸，展开后大小莫名变了）。
    // ⚠️ **细条形态下禁用缩放**：细条不渲染把手，且此时"调尺寸"语义不成立
    //    （展开后用的是已保存的尺寸，与细条无关）。
    //    ⚠️ 判据用 `dockedRef`（**正在显示细条**）而不是 `narrowRef`（窗口窄）：
    //    旧版写 `minimized || narrowRef.current`，于是**窄窗下悬停展开成完整卡片后也无法调尺寸**
    //    （表现为拖把手时尺寸纹丝不动、位置也不动 = 手势被完全吞掉）。
    //    语义上该禁的是「细条没有把手」，与窗口是否窄无关——展开成完整卡片后把手就在那儿。
    var noResize = effMinimized || dockedRef.current;
    var onGrip = !noResize && src && typeof src.closest === "function" && src.closest(".tks-fw-grip") !== null;
    var inCorner = !noResize && typeof event.clientX === "number" && typeof event.clientY === "number" &&
      event.clientX >= rect.right - FW_RESIZE_ZONE && event.clientY >= rect.bottom - FW_RESIZE_ZONE;
    if (onGrip || inCorner) {
      var capR = false;
      if (typeof node.setPointerCapture === "function") {
        try { node.setPointerCapture(event.pointerId); capR = true; } catch (e) { capR = false; }
      }
      resizeRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startW: rect.width,
        startH: rect.height,
        captured: capR
      };
      resizingRef.current = true;
      sizeRef.current = { w: rect.width, h: rect.height };
      // ⚠️ 必须**在写第一个坐标之前**关掉过渡：缩放期间每帧写 width/height，
      //    带过渡就会「拖了但尺寸在慢慢追」，松手前看到的不是最终尺寸。
      fwSetSnapping(false);
      setGesture(true); // 手势开始 → 收起面板（否则面板停在旧坐标、被移动中的卡片盖住）
      return;
    }
    // ⚠️ 关键（真实 Chromium 中可复现）：若在卡片上 setPointerCapture，
    // 浏览器会把随后的 click 重定向到**捕获元素（卡片）**，卡片内部子元素的 click 永不触发
    // ——热力图方块的 onClick 与「回今天」按钮会整体失效（表现为切换没效果、也看不到回今天按钮）。
    // 已知行为（Chrome/Electron）：pointer-tracker#4「setPointerCapture disables click events in Chrome」、
    // vueuse#584「click events are disabled for that element and its children」。
    // 修法：事件源落在卡片内的交互元素（方块/按钮/设置齿轮）时不捕获——拖动仍可用（从标题行/空白处起拖）。
    if (src && typeof src.closest === "function" && (src.closest(".tks-fw-cell") || src.closest(".tks-fw-back") || src.closest(".tks-fw-gear"))) {
      return;
    }
    var captured = false;
    if (typeof node.setPointerCapture === "function") {
      try {
        node.setPointerCapture(event.pointerId);
        captured = true;
      } catch (e) {
        captured = false;
      }
    }
    // ★ 拖动全程使用**同一个 gap 口径**（防止吸附态双击时卡片小幅右移）：
    //    **判据必须用 `stripFormRef`（卡片处于吸附形态：细条/折叠态/悬浮态都算）**，
    //    不能用 `dockedRef`（那只表示「此刻正显示细条」）——双击时指针抖动发生在
    //    悬停展开之后，此时 `docked` 已是 false 而卡片**仍吸附在边缘**，
    //    用 dockedRef 会误选 FW_MARGIN(18) → 贴边卡片被钳到 +18（落库的 dx 变成 18，与显示位不一致）。
    //    吸附形态下 gap 必须与吸附显示一致（FW_DOCK_GAP=0）；非吸附才用 FW_MARGIN。
    //    存在 dragRef 里，供 onPointerMove 的钳制与 onPointerUp 的落库/贴边判定共用。
    var dragGap = fwGapFor(stripFormRef.current);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
      width: rect.width,
      height: rect.height,
      moved: false,
      captured: captured,
      gap: dragGap,
      // 拖动**前**距锚边的间距：松手时用它判断「贴边状态是否发生变化」。
      // ⚠️ 必须与松手时的口径完全一致（同一个 fwAbsToAnchored + 同一组宽高 + **同一个 gap**），
      //    否则「贴边判定」会在两次调用间漂移，导致误吸附或该吸附时不吸附。
      originDx: fwAbsToAnchored(rect.left, rect.top, rect.width, rect.height, dragGap).dx
    };
    draggingRef.current = true;
    // ⚠️ 拖动期间必须关掉吸附过渡：
    //    否则每帧写的 transform 带 180ms 缓动 → 卡片永远追不上指针（"黏手"）。
    //    位置：必须在 `draggingRef.current = true` **之后**调用——ref 回调里的手势守卫读它。
    fwSetSnapping(false);
    setGesture(true); // 手势开始 → 收起面板（见 gestureState 说明）
  }

  /** 指针移动：缩放中改尺寸（写 style，不 setState，避免每帧重渲染）；拖动中改坐标（transform）。 */
  function onPointerMove(event) {
    // —— 缩放中 ——
    var rz = resizeRef.current;
    if (rz && rz.pointerId === event.pointerId) {
      var nw = clampFwW(rz.startW + (event.clientX - rz.startX));
      var nh = clampFwH(rz.startH + (event.clientY - rz.startY));
      var card = cardRef.current;
      if (card) {
        card.style.width = nw + "px";
        card.style.height = nh + "px";
      }
      sizeRef.current = { w: nw, h: nh };
      // 尺寸变大时可能超出视口右下角，实时钳制位置。
      //
      // ⚠️ 坐标口径（此处修过一个真实缺陷，勿按绝对格式读）：
      //    `posRef.current` 存的是 **边锚定** `{edge, dx, y}`（与 state `pos` 同构，
      //    见上方 `posRef.current = pos`）——**不是** `{x, y}`。
      //    旧代码按绝对格式取 `posRef.current.x`，得到 `undefined` → `clampFwPos(undefined, ...)`
      //    → `fwAbsToAnchored` 算出 `dx = null` 落库（localStorage 里会出现
      //    `{"edge":"left","dx":null,"y":431}`）→ 下次读取时 `Math.max(null, 18)` 被当作 0
      //    → 卡片贴死边缘、位置漂到 `left:0`。
      //    修法：统一走「边锚定 → 钳制 → 反算绝对」的既有函数对，不手写坐标换算。
      var curAbs = fwAnchoredToAbs(posRef.current, nw, nh, fwGapFor(stripFormRef.current));
      var fixedAbs = clampFwPos(curAbs.x, curAbs.y, nw, nh, fwGapFor(stripFormRef.current));
      if (fixedAbs.x !== curAbs.x || fixedAbs.y !== curAbs.y) {
        fwWriteAnchorPos(fixedAbs.x, fixedAbs.y);
        posRef.current = fwAbsToAnchored(fixedAbs.x, fixedAbs.y, nw, nh, fwGapFor(stripFormRef.current));
      }
      return;
    }
    // —— 拖动中 ——
    var d = dragRef.current;
    if (!d || d.pointerId !== event.pointerId) return;
    var dx = event.clientX - d.startX;
    var dy = event.clientY - d.startY;
    if (!d.moved && Math.sqrt(dx * dx + dy * dy) > FW_DRAG_THRESHOLD) d.moved = true; // 欧氏距离阈值，降低误触
    // ★★ 修「吸附态双击时卡片小幅右移」★★
    // 现象：贴左缘（dx=0）双击 → anchor 被写成 `translate3d(282px,…)`（= 264+18）后又回到 264，
    //       同时 y 也会被改写、**落库 dx 变成 18/6** —— 直观表现就是「双击产生的很小的向右位移」。
    // 根因（两层，缺一不可）：
    //   ① **未过阈值就写坐标**：下面原本无条件 `fwWriteAnchorPos`，而双击几乎必然伴随几像素抖动，
    //      于是「一次点击」也会把卡片挪到抖动位置（写了又靠下一次渲染回到原处 → 肉眼可见的抖动）。
    //   ② **钳制口径与显示口径不一致**：拖动钳制走 `clampFwPos`（gap 缺省 FW_MARGIN=18），
    //      而吸附**显示**用 FW_DOCK_GAP=0 —— 差 18px，贴边卡片被顶到 +18。
    // 修法：
    //   ① **过阈值（`d.moved`）之前一律不写坐标**（拖动阈值本就该起这个作用：不过阈值不算拖动）；
    //   ② gap 按「卡片是否**吸附形态**」取（`stripFormRef`：细条/折叠态/悬浮态都算吸附），
    //      与吸附显示同口径；**不能用 `dockedRef`**——它只表示「此刻正显示细条」，
    //      悬停展开后它已是 false，而卡片仍贴在边缘（用它会误选 18）。
    //   ⚠️ 不改成「吸附态禁止拖动」：需要能把吸附的卡片拖走（解除吸附），该路径必须保留。
    if (!d.moved) return;
    // ⚠️ 用**按下时冻结**在 dragRef 里的 gap（`d.gap`），不在每次移动时重算：
    //    「拖动全程同一口径」是 originDx（按下算）与落库（松手算）能对账的前提——
    //    中途若因窗口 resize 让 stripForm 翻转，重算会让三处各用不同 gap → 贴边判定漂移。
    var dragGap = d.gap;
    var next = clampFwPos(d.originX + dx, d.originY + dy, d.width, d.height, dragGap);
    fwWriteAnchorPos(next.x, next.y);
    posRef.current = next; // 拖动期间的最新值，供 pointerup 落库
  }

  /**
   * 指针抬起：缩放或拖动结束，各自落库（localStorage）。
   * ⚠️ 必须在 pointerup **之内**释放捕获（W3C pointerevents#356：「若在 up 事件前显式释放捕获，
   * 就不影响 click 的 target 判定」）。不释放的后果：click/dblclick 被重定向到捕获元素（卡片），
   * 「双击标题行折叠」永远收不到 dblclick——真实 Chromium 中可复现。
   */
  function onPointerUp(event) {
    var node = cardRef.current || event.currentTarget;
    // —— 缩放结束 ——
    var rz = resizeRef.current;
    if (rz && rz.pointerId === event.pointerId) {
      resizeRef.current = null;
      resizingRef.current = false;
      if (node && rz.captured && typeof node.releasePointerCapture === "function") {
        try { node.releasePointerCapture(event.pointerId); } catch (e) { /* 指针已释放 */ }
      }
      var s = sizeRef.current;
      if (s) {
        setSize(s);
        saveFwSize(s);
        // 尺寸变化后按新尺寸重新钳制位置，并把实际宽高同步进 state（驱动格子等比缩放）
        // ⚠️ 与 onPointerMove 缩放分支同一口径：`posRef.current` 是**边锚定** `{edge,dx,y}`，
        //    必须经 fwAnchoredToAbs 反算绝对坐标，不得直接取 `.x`（旧代码即因此写出 dx=null）。
        var curAbs2 = fwAnchoredToAbs(posRef.current, s.w, s.h, fwGapFor(stripFormRef.current));
        var p2 = clampFwPos(curAbs2.x, curAbs2.y, s.w, s.h, fwGapFor(stripFormRef.current));
        if (p2.x !== curAbs2.x || p2.y !== curAbs2.y) {
          var anchored2 = fwAbsToAnchored(p2.x, p2.y, s.w, s.h, fwGapFor(stripFormRef.current));
          setPos(anchored2);
          saveFwPos(anchored2);
          fwWriteAnchorPos(p2.x, p2.y);
          posRef.current = anchored2;
        }
        setCardH(s.h);
      }
      // ⚠️ 收尾必须**恢复过渡**：否则此后所有吸附/展开都变成硬跳，
      //    且**不会报错**——属静默功能退化（不会抛错的那一类）。
      //    位置：放在坐标/尺寸落库**之后**，让这一步的最终几何也走过渡。
      fwRestoreSnapping();
      setGesture(false); // 手势结束 → 面板可按新位置重新出现（跟随）
      return;
    }
    // —— 拖动结束 ——
    var d = dragRef.current;
    if (!d || d.pointerId !== event.pointerId) return;
    dragRef.current = null;
    draggingRef.current = false;
    if (node && d.captured && typeof node.releasePointerCapture === "function") {
      try {
        node.releasePointerCapture(event.pointerId);
      } catch (e) {
        // 指针已释放：忽略
      }
    }
    if (d.moved) {
      var p = posRef.current;
      // ⚠️ 拖动落库前**先转成边锚定**：绝对坐标在窗口变化后会漂移，
      //    边锚定存「距主内容区哪一边多远」，窗口变宽后仍贴该边。
      //    拖动期间 posRef 存的是绝对坐标（每帧写 DOM 用），故在此转换。
      var anchored = fwAbsToAnchored(p.x, p.y, d.width, d.height, d.gap);
      // —— 手动停靠（「拖到窗口左/右边缘松手即吸附」）——
      // 判据：**贴边状态发生了变化**（拖动前不在边上 → 松手在边上 = 吸附；
      // 拖动前在边上 → 松手不在边上 = 取消吸附）。
      //
      // ⚠️ 为何用「变化」而不是「松手时是否在边上」（勿简化）：
      //    ① **默认位置本身就在边上**（`defaultFwPos` 用 FW_MARGIN=18 贴右缘），
      //       若只看「松手时在边上」，随手把默认卡片挪 3px 也会被吸成细条——明显误伤；
      //    ② 沿边上下拖动（想调 y）时 dx 恒为 18，也会被反复判定成"要吸附"。
      //    改为比较拖动前后的贴边状态后，只有**真的从别处拖到边上**才吸附。
      // ⚠️ 比较基准必须与松手判定同口径（同一个 fwAbsToAnchored + 同一组宽高），
      //    故 `originDx` 在 onPointerDown 里用**同一函数**预先算好（见 dragRef 说明）。
      var nowAtEdge = anchored.dx <= FW_SNAP_DIST;
      var wasAtEdge = typeof d.originDx === "number" && d.originDx <= FW_SNAP_DIST;
      if (nowAtEdge !== wasAtEdge) {
        // 吸附 / 取消吸附：与手动停靠偏好同步（窄窗自动停靠是几何派生，不受影响）
        var wantDock = nowAtEdge;
        if (wantDock !== dockManualRef.current) {
          dockManualRef.current = wantDock;
          setDockManual(wantDock);
          saveFwDock(wantDock);
        }
        // 两种切换都要清掉悬停预览态：形态变了，旧的 peek 语义不再成立
        setPeekHover(false);
        setDockLevel(0);
        dockLevelRef.current = 0;
        peekSuppressRef.current = false;
        if (wantDock) {
          // 进入吸附：收起历史面板与气泡（细条形态下它们无意义）
          setPanelOpen(false);
          setTip(null);
        }
      }
      setPos(anchored);
      saveFwPos(anchored);
    }
    // ⚠️ 收尾必须**恢复过渡**：这一步正是「松手后卡片滑向吸附位」的起点——
    //    若这里仍关闭过渡，吸附动画生硬的问题就会复发。
    //    位置：放在 setPos/落库**之后**，使这一步产生的最终几何（细条或完整卡片）也走过渡。
    fwRestoreSnapping();
    // 手势结束 → 面板按**新坐标**重新出现（即上述「跟随」行为）。
    // ⚠️ 必须放在 setPos 之后同一批更新里：若先恢复面板、坐标还是旧值，面板会先闪到旧位置再跳。
    setGesture(false);
  }

  /**
   * 切换细条形态的**档位**（0 细条 / 1 折叠态 / 2 完整卡片）。
   *
   * ⚠️ 必须同时置 `peekSuppressRef`（当降到低档时）：切换时指针**正停在卡片上**，
   *    若不抑制，自愈状态机会在 120ms 后按「指针仍在元素上」把卡片又展开
   *    → **点了没反应/收不起来**（看起来像点击坏了）。指针真正离开后由 leaveSurface 解除。
   * @param next 目标档位（0/1/2）。
   */
  function fwSetDockLevel(next) {
    dockLevelRef.current = next;
    setDockLevel(next);
    // 档位切换后，悬停预览态归零：最终形态完全由「显式档位」与「是否悬停」重新合成
    setPeekHover(false);
    if (next === 0) {
      // 回到细条 = 显式收起 → 抑制自动预览，直到指针离开（否则 120ms 后又被顶开）
      peekSuppressRef.current = true;
      setPanelOpen(false);
      setTip(null);
    } else {
      // 升档：取消抑制，允许自愈状态机维持当前形态
      peekSuppressRef.current = false;
      if (next === 1) {
        // 折叠态不显示历史面板与气泡（它们只属于完整卡片）
        setPanelOpen(false);
        setTip(null);
      }
    }
  }

  /**
   * 单击：**不切换任何形态**（「单击锁定」语义已取消）。
   *
   * ⚠️ 历史沿革（勿凭旧注释改回）：曾有过「细条单击 → 锁定折叠态」的设计，
   *    该语义已被取消——吸附态只保留「悬停 → 折叠态（临时）」与
   *    「双击 → 悬浮态（锁定）」。取消后也顺带消除了「单击/双击抢同一档位」所需的 260ms
   *    延迟（`FW_CLICK_DELAY_MS` 常量与 `clickTimerRef` 一并移除）。
   * ⚠️ 卡片本体仍挂 onClick（保留为空操作）：若整个删掉，事件会冒泡到外层；
   *    显式声明「不处理」比依赖「没有监听器」更稳（也便于后续若加语义时有落点）。
   * ⚠️ 方块 /「回今天」/ 齿轮等自带单击语义的元素不受影响（各自的 onClick 照常生效）。
   */
  function onClick() {
    // 单击不改档：空操作（见上方说明）
  }

  /**
   * 双击：细条形态下 **细条/折叠态 → 悬浮态（锁定）**、**悬浮态 → 折叠态（临时预览）**；
   * 宽窗下 = 原有的折叠/展开。
   *
   * ★ 双击语义的两点变化 ★
   *   ① **双击回退到折叠态**（不再直接回细条）：旧行为「悬浮态 → 细条」缺了一级，
   *      与「双击一次升一级」的直觉不符；现为「悬浮态 --双击--> 折叠态」。
   *   ② 退到的折叠态是**临时预览档**（`dockLevel=0` + `peekHover=true`）：
   *      指针还停在卡上就保持折叠态，**移开自动回细条**——因为单击锁定已取消，
   *      吸附态的折叠态只在指针停留期间存在（否则会留下一个没有出口的锁死形态）。
   *   ③ 因此这里**不再需要「取消待定单击」**（单击已不改档，无两种意图打架）。
   *
   * ⚠️ 为何细条形态下不走宽窗的折叠逻辑：折叠条与细条都是"小形态"，同时存在会分不清
   *    （旧版正是 `minimized` 一票否决 `docked`，导致曾双击折叠过就**永远看不到细条**）。
   * 热力图方块与「回今天」按钮自带单击语义，双击它们不得切换形态——
   * 用 closest 判断事件源是否落在方块/按钮内（真实 DOM 事件才有 closest，桩环境退化放行）。
   */
  function onDoubleClick(event) {
    var t = event && event.target;
    if (t && typeof t.closest === "function") {
      if (t.closest(".tks-fw-cell") || t.closest(".tks-fw-back") || t.closest(".tks-fw-gear")) return;
    }
    // —— 细条形态：细条/折叠态 ↔ 悬浮态 ——
    if (stripFormRef.current) {
      fwCapturePointerY(event);
      if (dockLevelRef.current === 2) {
        // 悬浮态 → 折叠态（临时预览档）：先落回 0 档，再显式抬起预览态
        // （顺序不可颠倒：fwSetDockLevel(0) 会置 peekSuppress=true 并清 peekHover，
        //   必须在其后覆盖，否则会先塌成细条、要等 120ms 自愈才长回折叠态 → 用户看到闪一下）
        fwSetDockLevel(0);
        peekSuppressRef.current = false;
        setPeekHover(true);
      } else {
        // 细条/折叠态 → 悬浮态（锁定，指针移开也保持）
        fwSetDockLevel(2);
      }
      return;
    }
    var next = !minimized;
    setMinimized(next);
    saveFwMin(next);
    if (next) {
      // 折叠时收起面板与气泡（面板在折叠态无意义）
      setPanelOpen(false);
      setTip(null);
    }
  }

  var summary = st && st.data ? st.data : null;
  var days = summary ? summary.days || [] : [];
  var today = days.length > 0 ? days[days.length - 1] : null;
  // —— 形态判定（必须在 scaled / panelVisible 之前算，它们都要用）——
  // 停靠条件（两条路径）：
  //   ① **窄窗自动停靠**：窗口未最大化 → 完全最小化为贴边细条（上一轮已验收的行为，保留）；
  //   ② **手动停靠**：把卡片拖到窗口左/右边缘松手 → 停靠成细条，**最大化时也保持**
  //      （即「窗口在最大化状态下也应能吸附到最小化」）。
  // 指针悬停细条 → **原地展开**完整卡片（贴合边不动、向另一侧生长，避免闪断死循环）；
  // 宽窗且未手动停靠 → 正常展开态（「窗口最大化之后则默认放大展开」）。
  // ⚠️ **折叠（双击）在细条形态下不再单独成形态**（窄窗下收起统一表现为细条）：
  //    旧版 `docked = narrow && !peekHover && !minimized` 让「曾双击折叠过」的情况
  //    在窄窗下永远只看到折叠条、**细条根本不出现**（细条不出现的直接原因）。
  var stripForm = narrow || dockManual;
  /**
   * 停靠形态的**最终档位**（0 细条 / 1 折叠态 / 2 悬浮态）= 显式档位 与 悬停预览 **取较大者**。
   *
   * 语义收敛后：**悬停 → 折叠态（临时）；双击 → 悬浮态（锁定）；单击不改档**。
   * 取 max 的理由：两者是**不同来源的意图**，谁更"展开"谁说了算——
   *   · 悬停（临时预览）升到 1，但已双击到 2 时不得把它降回 1；
   *   · 双击锁定到 2 后，指针移开（peekHover 归 false）也保持悬浮态。
   * ⚠️ 仅在细条形态下有意义；宽窗下 `stripForm=false`，本值恒被忽略（走原有折叠/展开逻辑）。
   */
  var dockLevelEff = Math.max(dockLevel, peekHover ? 1 : 0);
  /**
   * 「有效折叠」：细条形态下**按档位决定**（档位 1 = 折叠态），宽窗下按用户的折叠偏好。
   *
   * ⚠️ 为何必须区分（在 `min.v1="1"` 的旧偏好下暴露）：
   *    渲染段大量使用 `effMinimized || docked ? null : ...` 来隐藏数字行/网格/图例/页脚。
   *    此前双击折叠过（`min.v1=1`），于是**悬停细条展开后只渲染出标题行**——
   *    卡片是空的（表现为折叠条原地展开后仍无网格，看着像"点不开"）。
   *    语义上细条形态下形态由**档位**决定，宽窗折叠偏好不参与，故这里把它归零。
   */
  var effMinimized = stripForm ? dockLevelEff === 1 : minimized;
  /** 「正在显示细条」（档位 0）：细条是唯一没有缩放把手/网格的形态，手势判定读它。 */
  var docked = stripForm && dockLevelEff === 0;
  /** 「停靠期间已展开到高档」（档位 ≥1）：定位要用停靠间距、且不显示历史面板。 */
  var dockOpen = stripForm && dockLevelEff >= 1;
  // 主窗布局：**未缩放**时格子取基准值（卡片宽度随内容，见 fwCellForSize 说明）；
  // **用户缩放后**按卡片实际宽高双向自适应、按可用空间自动封顶。
  // ⚠️ 只在「用户缩放后」才把实际高作为约束传入：未缩放时高度是结果而非约束，
  //    传进去会形成「按高算格子 → 格子决定高」的反馈环（曾致默认格子缩水 19%）。
  // ⚠️ **折叠态一律按「未缩放」处理**（修「双击收起后还有空白面板」的配套修法）：
  //    折叠后卡片不套用保存尺寸（尺寸是给展开态用的），若仍按保存尺寸算格子，
  //    折叠条里的数字会跟着被拖小/拖大（字号系数由格子推得），与展开态不一致。
  var scaled = !effMinimized && !!(size && size.w > 0 && size.h > 0);
  var plan = fwGridPlan(scaled ? size.w : 0, scaled ? cardH : 0);
  var cellPx = plan.cell;
  // 字号缩放系数：随格子缩放同步（格子 26px 时 =1；拖小时字号一起缩，避免固定字号撑破窄卡片）。
  // 钳在 [0.72, 1.25]：过小看不清、过大显得笨重。
  var fontScale = Math.max(0.72, Math.min(1.25, cellPx / FW_CELL_BASE));
  var month = buildMonthGrid(days, plan.weeks);
  // 面板可见性：悬停已展开、未折叠、且**不在拖动/缩放手势中**。
  // 手势期间坐标只写 DOM（不 setState），面板若继续显示会停在旧坐标上被卡片盖住
  // （否则面板会像被固定住一样）；收起后松手即按新坐标重新出现 = 跟随。
  //    需求是「不管吸附还是拖到别处，鼠标指到标题就显示完整历史」。
  //    档位 2 是双击锁定的显式意图，指针离开只收面板、卡片保持悬浮态——不存在
  //    「细条永不收回」的死锁链（那条链只属于档位 0/1 的临时预览，防线见 enterSurface）。
  //    故条件由「非停靠」放宽为「非停靠 **或** 停靠且档位 2」。
  var panelVisible = panelOpen && !effMinimized && !gesture && (!stripForm || dockLevelEff === 2);
  var year = panelVisible ? buildYearGrid(days) : null;
  // 卡片宽度：细条态固定细条宽；其余走既有规则（保存尺寸 / CSS max-content）。
  var cardWidth = docked ? FW_PEEK_W : (size && size.w > 0 && size.h > 0 && !effMinimized ? size.w : 0);  // 位置兜底：localStorage 读回 null / 被外部改写为 null 时仍要能渲染（渲染期不得抛错，
  // 否则整个浮层连同 shell.overlay 一起崩）。**边锚定**为权威格式，绝对坐标走迁移。
  var anchoredPos = pos && (pos.edge === "left" || pos.edge === "right")
    ? pos
    : (pos && typeof pos.x === "number" && typeof pos.y === "number"
      ? fwAbsToAnchored(pos.x, pos.y, FW_W, FW_H)
      : defaultFwPos(FW_W, FW_H));
  // ⚠️ 停靠态（含**展开后**）必须整体贴合**已保存的那条锚边**，这是防「展开↔收回」无限闪烁的关键：
  //    指针停在细条上时距边仅约 12px，若展开后的卡片缩进 18px，指针就落在卡片**外**
  //    → 浏览器立即判定 mouseleave → 收回 → 指针又回到细条上 → 再展开……无限循环。
  //    故停靠期间（细条或已展开）一律用 FW_DOCK_GAP 定位，该边恒定不动。
  //
  //    旧版这里把锚边**写死成 "right"**，而保存的锚边可能是 `edge:"left"`：
  //    指针一碰卡片 → peekHover=true → 强制改成右锚定 → 卡片从左边**瞬移到右边**
  //    （卡片 left 由左缘值瞬移到右缘值）→ 指针随之落到卡片外 → :hover=false → 收回 → 又瞬移回去
  //    → **往返闪烁**（卡片在两个锚边位置之间反复横跳）。
  //    现改为**跟随已保存的锚边**（anchoredPos.edge），且 dx 取停靠间距——展开时同边同贴合生长。
  //
  //    形态档位化后出现一个新风险：细条高 74px、折叠态仅 61px——**展开时高度变小**。
  //    若完全「顶部对齐」，指针停在细条下半部（如 y=70）时，展开后该点落到 61px 的元素**之外**
  //    → 立即 mouseleave → 收回 → 再展开……**无限闪烁**（同一根因的经典坑）。
  //    早期对策是**无条件把指针居中**（`newTop = 指针绝对 y − 新形态高/2`），
  //    数学上确实保证指针恒落在新形态内——**但它引入了一个新缺陷**：
  //    指针在细条**上半部**时，居中要求把 top **上移**（位移量 = 指针偏移 − 新形态半高），
  //    现象即「从吸附态单击进折叠态后，鼠标悬停时窗口仍小幅上移」。
  //    改为**最小必要位移**：默认完全不动，仅当指针会掉出下边缘时才下移刚好够用的
  //    距离（见下方 dockY 计算）：指针偏移较小（≤ 半高差）时**零位移**，更大时仅下移刚好够用的几像素，
  //    从而保证指针恒在卡内、形态稳定无闪烁。
  // ⚠️ 高度口径必须用 **FW_PEEK_H（实际 74）** 而非 FW_DOCK_H（估算 70）——两者混用会出缺陷：
  //    这两个常量曾混用（"细条 74px" / "FW_DOCK_H 70"），而**公式吃的是这里这个值**：
  //    取 70 会让「最小必要位移」的临界值偏小 4px，指针停在细条最下部（偏移 70~74）时展开后
  //    仍会掉出折叠态（61px）下边缘 → mouseleave → 收回 → 再展开 → **闪烁死循环**。
  //    FW_PEEK_H 的取值依据与「重测时机」见 10a-float-geom.js 的同名常量说明。
  var dockH = docked ? FW_PEEK_H : (effMinimized ? FW_FOLD_H : cardH);
  var dockEdge = anchoredPos.edge === "left" ? "left" : "right";
  if (stripForm) {
    // 宽度口径（**贴右缘时决定 x，必须确定**）：
    //   细条 → 固定 FW_PEEK_W；折叠态 → 固定 FW_FOLD_W；完整卡片 → 保存尺寸。
    //
    // ⚠️ 为何折叠态必须用**固定宽**而不是 `max-content`（踩过的坑，勿改）：
    //    折叠态若走 `max-content`，宽度随数字位数变化。而贴右缘时
    //    `x = area.right − 宽度`——**宽度估错多少，卡片就错位多少**：
    //    若按展开态宽度估算、而实际折叠宽度更窄，卡片就**离右缘一段距离**，
    //    于是指针（停在细条上、距右缘约 12px）落到卡片**外面** → mouseleave → 收回 → 再展开
    //    → **闪烁死循环**（形态在细条与展开之间反复横跳）。
    //    改为固定宽后 x 与渲染宽**恒等**，指针必然落在卡片内（几何上不可能脱出）。
    //    代价：数字很短时卡片右侧略有留白——但换来形态稳定与零闪烁，取舍明确。
    // ⚠️ 高度仍由内容决定（不写死），故长数字换行时卡片会自然变高；
    //    而定位用「最小必要位移」，高度变化对指针是否仍在卡内**不敏感**（只在会掉出时才让位）。
    var dockW = docked
      ? FW_PEEK_W
      : (effMinimized ? FW_FOLD_W : (cardWidth > 0 ? cardWidth : FW_W));
    var dockY = anchoredPos.y;
    // 展开到高档时按「**最小必要位移**」重算 y（仅在细条期间记录过指针位置时有意义）。
    //
    // ★★ 现象：「从吸附态左键单击进折叠态后，鼠标悬停在窗口上，
    //    窗口仍会出现小幅度的向上移动」——根因与修法如下，不得用「指针居中」★★
    //
    // 旧写法 `dockY = 指针y − dockH / 2`（无条件把指针放到新形态**正中**）：
    //    细条 74px 高、折叠态仅 61px 高，指针停在细条**上部**时，要让指针居中就必须把 top
    //    **上移**——位移量 = `指针偏移 − 折叠态半高`：
    //      指针偏移越小，上移越多；超过半高后转为下移。
    //    即：**只要指针不在细条正中，展开就一定伴随位移**，且上半部一律是**上移**。
    //
    // 但**不能简单删掉**（「完全顶部对齐」方案已被否决）：
    //    细条比折叠态**高 13px**，若 top 完全不动，指针落在细条下部（偏移 62/68px）时，
    //    该点会落到 61px 的折叠态**之外** → 浏览器立即判定 mouseleave → 收回 → 再展开
    //    → **无限闪烁死循环**（形态在细条与折叠态之间反复横跳）。
    //
    // 故取**最小必要位移**：默认**完全不动**（零位移），仅当指针会掉出下边缘时才下移
    // 刚好够用的距离（`指针y − 高 + 安全边距`）：
    //    指针偏移小于阈值 → 位移 **0px**（不再上移）；超过阈值 → 仅下移刚好够用的几像素，
    //    且**指针恒在卡内、形态稳定无闪烁**。
    //    ⚠️ 只保下边缘、**不保上边缘**——给上边缘也做保护就又变成「上移」了（这正是要避免的行为）。
    //
    // ⚠️ 本式**必须幂等**（同一指针位置渲染任意多次都得同一个 top）：
    //    dockPointerYRef 存的是**指针绝对 clientY**，`dockY` 起点是 state 里的 y（悬停期间不变），
    //    故每次结果相同。若误存「相对细条的偏移」再叠加当前 top，展开后会每帧上移一次。
    if (!docked && typeof dockPointerYRef.current === "number") {
      var minTopForPointer = dockPointerYRef.current - dockH + FW_POINTER_EDGE;
      if (dockY < minTopForPointer) dockY = minTopForPointer;
    }
    anchoredPos = fwClampAnchored(dockEdge, FW_DOCK_GAP, dockY, dockW, dockH, FW_DOCK_GAP);
  }
  // ⚠️ 宽度必须与上面 `dockW` **同一口径**（口径不一致会出真实缺陷，不得用 cardWidth）：
  //    上面按 dockW（细条 24 / 折叠态固定宽）钳制出 anchoredPos，这里若用 cardWidth（展开态宽）
  //    反算绝对 x，贴右缘时 `x = area.right − 302` 而实际渲染宽 165 → **错位 137px**
  //    → 指针落到卡片外 → mouseleave → 收回 → 再展开 → 闪烁死循环。
  var safeW = stripForm
    ? (docked ? FW_PEEK_W : (effMinimized ? FW_FOLD_W : (cardWidth > 0 ? cardWidth : FW_W)))
    : (cardWidth > 0 ? cardWidth : FW_W);
  var safePos = fwAnchoredToAbs(anchoredPos, safeW, dockH, fwGapFor(stripForm));
  // 把「细条形态」与「正在显示细条」写进 ref：悬停状态机与手势判定读它们（渲染期快照会过期）。
  // ⚠️ 必须在**渲染体内**赋值（不能在 effect 里）：定时器回调可能在 effect 之前触发。
  stripFormRef.current = stripForm;
  dockedRef.current = docked;
  dockLevelRef.current = dockLevel;
  // 主数字显示的日期：选中优先，否则「今天」；选中日不在序列里（跨天后旧选中）则回退今天
  var byDateAll = {};
  for (var di = 0; di < days.length; di++) byDateAll[days[di].date] = days[di];
  var shown = selDate && byDateAll[selDate] ? byDateAll[selDate] : today;
  var isTodayShown = !selDate || !byDateAll[selDate] || (today && shown && shown.date === today.date);

  /** 点击方块：切换主数字到该日；再点同一天或点「今天」则回到今天。 */
  function onPickDay(date) {
    setSelDate(function (prev) {
      if (today && date === today.date) return null; // 点今天 = 取消选中
      return prev === date ? null : date; // 再点同一天 = 取消选中
    });
  }

  /**
   * 键盘导航。
   *
   * 步长 = **7 天横向（一周）、1 天纵向**，这正是网格自身的几何（7 行、按列填充）：
   * 左右 = 跨周、上下 = 跨星期。**必须按网格分别构造**——主窗与展开面板走不同的日切片，
   * 共用会让主窗的选中跳到它没渲染的日子上。
   *
   * 本插件的语义：光标**移动「选中日」**
   * （点击方块即选中该日并切换主数字），故键盘也走 `onPickDay` 之外的直接设值路径——
   * 用 setSelDate 直接赋值而非 toggle（连续按方向键时 toggle 会反复取消/选中，体验极差）。
   * @param list 该网格渲染的日序列（顺序与格子一致）。
   * @param onEscape Escape 时的附加动作（主窗收起面板）。
   * @returns keydown 处理器。
   */
  function makeKeyHandler(list, onEscape) {
    return function (event) {
      var found = -1;
      for (var index = 0; index < list.length; index++) {
        if (list[index].date === selDate) { found = index; break; }
      }
      var step = 0;
      if (event.key === "ArrowRight") step = FW_ROWS;
      else if (event.key === "ArrowLeft") step = -FW_ROWS;
      else if (event.key === "ArrowDown") step = 1;
      else if (event.key === "ArrowUp") step = -1;
      else if (event.key === "Escape") {
        event.preventDefault();
        setSelDate(null); // 回到今天
        if (typeof onEscape === "function") onEscape();
        return;
      } else if (event.key === "Enter" || event.key === " ") {
        // 回车/空格 = 选中当前焦点格（与点击等价）
        event.preventDefault();
        if (found >= 0) setSelDate(list[found].date);
        return;
      } else return;
      event.preventDefault();
      // 无选中时：从末尾（今天）起步
      var next = found === -1 ? list.length - 1 : Math.min(list.length - 1, Math.max(0, found + step));
      if (list[next] !== undefined) setSelDate(list[next].date);
    };
  }

  /** 方块悬停：按元素定位气泡（靠上放下方，水平钳制视口内）。 */
  function onCellEnter(el, c) {
    if (!el || typeof el.getBoundingClientRect !== "function") return;
    var rect = el.getBoundingClientRect();
    var vw = window.innerWidth || 1280;
    var half = 150;
    var x = Math.min(Math.max(rect.left + rect.width / 2, half + 12), vw - half - 12);
    var below = rect.top < 96;
    var title = md(c.date) + (c.total > 0 ? "：" + fmtTokens(c.total) + " token" : "：无 token 用量");
    var detail = c.total > 0
      ? "输入 " + fmtTokens(c.input) + " · 输出 " + fmtTokens(c.output) + " · 缓存读 " + fmtTokens(c.cacheRead)
      : "点击可查看该日用量";
    setTip({ x: x, y: below ? rect.bottom + 8 : rect.top - 8, below: below, title: title, detail: detail });
  }

  /** 渲染一个热力图方块（主窗与展开面板共用；cellPx 由调用方通过 CSS 变量控制）。 */
  function renderCell(c, key, bounds, isFuture) {
    var isNone = c.empty || isFuture;
    return h("div", {
      key: key,
      className: "tks-fw-cell",
      "data-none": isNone ? "1" : null,
      "data-level": isNone ? null : String(levelOf4(c.total, bounds)),
      "data-sel": !isNone && selDate === c.date ? "1" : null,
      "data-today": !isNone && today && c.date === today.date ? "1" : null,
      // 无障碍：每个格子是一个 gridcell；
      // tabIndex 只给「选中日或今天」一个（roving tabindex，避免 63 个格子全进 Tab 序列）。
      role: isNone ? null : "gridcell",
      tabIndex: !isNone && (selDate === c.date || (!selDate && today && c.date === today.date)) ? 0 : -1,
      "aria-label": isNone ? null : md(c.date) + (c.total > 0 ? "，" + fmtTokens(c.total) + " token" : "，无用量"),
      title: isNone ? null : md(c.date) + "：" + (c.total > 0 ? fmtTokens(c.total) + " token" : "无用量"),
      onClick: isNone ? undefined : function (d) {
        return function () { onPickDay(d); };
      }(c.date),
      onMouseEnter: isNone ? undefined : function (node) {
        return function (e) { onCellEnter(e.currentTarget, node); };
      }(c),
      onMouseLeave: isNone ? undefined : function () { setTip(null); }
    });
  }

  var todayKey = today ? today.date : "";
  var monthCells = [];
  if (!effMinimized && !docked) {
    for (var mi = 0; mi < month.cells.length; mi++) {
      var mc = month.cells[mi];
      monthCells.push(renderCell(mc, "m" + mi, month.bounds, !mc.empty && mc.date > todayKey));
    }
  }

  // —— 停靠细条的内容：**竖排今日数字** ——
  // ★ 为何换掉「7 道色阶横杠」（旧版，勿回退）★
  //   旧版是「状态点 + 7 道横杠、零文字」，**可读性几乎为零**：
  //   细条 **0 个可读字符**（折叠态对照 23 字），横杠代表哪 7 天、哪端是今天、数值多少全靠猜。
  //   根因是为把面积压到最小（旧版 168px 宽）而**把可读性整个牺牲掉了**。
  //
  //   ① **书脊式**（`writing-mode:vertical-rl` + 默认 `text-orientation:mixed`）：
  //      整串数字**横躺**、自上而下读，保持「一个数」的完整形态；
  //      旧版 `text-orientation:upright` 把数字拆成一列**孤立单字**、小数点夹在中间，
  //      读起来不像一个数（数字样式难认）。
  //      附带收益：文字长度转为竖向高度，比旧版**矮 22px = 遮挡更少**。
  //   ② **紧凑位数**（`fmtTokensCompact`，4 位有效数字）：每少一个字少占约 10px 竖向高度。
  // ⚠️ 数字文案与折叠态/完整卡片同源（同一个 `shown`），但**细条用紧凑格式**（有意降精度）：
  //    故 `title`/`aria-label` 一律给**全精度**值，悬停即可看到准确数字。
  var dockNumber = docked
    ? h(
        "span",
        {
          className: "tks-fw-vnum",
          // 无障碍：细条文字竖排、读屏顺序可能异常，故用 aria-label 给出完整语义
          "aria-label": (isTodayShown ? "今日" : md(shown ? shown.date : "")) + " token 用量 " + (shown ? fmtTokens(shown.total) : "无数据"),
          title: (isTodayShown ? "今日" : md(shown ? shown.date : "")) + "：" + (shown ? fmtTokens(shown.total) : "无数据") + " token"
        },
        shown ? fmtTokensCompact(shown.total) : "—"
      )
    : null;

  // 展开面板（悬停 160ms 后出现）：完整历史 53 周贡献图 + 汇总指标
  var panelNodes = null;
  if (panelVisible && year) {
    var yearCells = [];
    for (var yi = 0; yi < year.cells.length; yi++) {
      var yc = year.cells[yi];
      yearCells.push(renderCell(yc, "y" + yi, year.bounds, false));
    }
    var monthLabels = [];
    for (var li = 0; li < year.months.length; li++) {
      var lm = year.months[li];
      monthLabels.push(h("span", { className: "tks-fwp-month", key: "l" + li, style: { left: lm.col * (FW_PANEL_CELL + FW_GAP) + "px" } }, lm.label));
    }
    // 汇总指标（用全量 days 计算，与分区页口径一致）
    var sum = 0, active = 0, best = 0, bestDate = null;
    for (var si = 0; si < days.length; si++) {
      var dd = days[si];
      sum += dd.total;
      if (dd.total > 0) {
        active++;
        if (dd.total > best) {
          best = dd.total;
          bestDate = dd.date;
        }
      }
    }
    var avg = active > 0 ? Math.round(sum / active) : 0;
    var panelW = Math.min(FW_PANEL_W, (window.innerWidth || 1280) - 24);
    // 面板放在卡片上方；上方空间不足则放下方。
    // ⚠️ 下方定位必须用**卡片实际高**（cardH），不能用常量 FW_H：
    //    卡片被拉高后（如 500px）常量仍是 288 → 面板 top 算少 200+px、与卡片重叠。
    //    这与「面板位置取自不反映现实的坐标」是同一根因。
    // ★ 修「吸附态指标题时面板与卡片隔很远」★
    //    根因：`cardH` 是**上一次测量**的高度，而在停靠态里它可能是**折叠态的高（61px）**——
    //    从吸附态双击进悬浮态时，首帧 cardH 还是 61（甚至细条期的旧值），
    //    面板按「卡片只有 61 高」算 top → 面板被放到卡片下方很远（间距远大于 8px）；
    //    手动拖一下卡片触发重测后 cardH 更新，面板随即「变正常」。
    //    修法：**档位 2（悬浮态）用保存尺寸/实际高优先，其次 cardH**；折叠态仍按 cardH（那时它就是 61）。
    //    ⚠️ 不能用常量 FW_H 顶替：卡片被拉高过时必须跟着保存尺寸（上方注释的教训）。
    var cardHeightForPanel = dockLevelEff === 2
      ? ((size && size.h > 0) ? size.h : (cardH > 0 ? cardH : FW_H))
      : (cardH > 0 ? cardH : FW_H);
    var above = safePos.y > 320;
    var panelStyle = {
      left: Math.max(8, Math.min(safePos.x, (window.innerWidth || 1280) - panelW - 8)) + "px",
      width: panelW + "px"
    };
    if (above) panelStyle.bottom = Math.round((window.innerHeight || 800) - safePos.y + 8) + "px";
    else panelStyle.top = Math.round(safePos.y + cardHeightForPanel + 8) + "px";
    panelNodes = h(
      "div",
      {
        className: "tks-fwp",
        style: panelStyle,
        onMouseEnter: function () { enterSurface("panel"); },
        onMouseLeave: function () { leaveSurface("panel"); }
      },
      h(
        "div",
        { className: "tks-fwp-head" },
        h("span", { className: "tks-fwp-title" }, "Token 统计 · 完整历史"),
        h(
          "span",
          { className: "tks-fwp-stats" },
          "合计 " + fmtTokens(sum) + " · 活跃 " + active + " 天 · 日均 " + fmtTokens(avg) + (bestDate ? " · 最佳 " + md(bestDate) + " " + fmtTokens(best) : "")
        )
      ),
      h("div", { className: "tks-fwp-months" }, monthLabels),
      h(
        "div",
        { className: "tks-fwp-body" },
        h(
          "div",
          { className: "tks-fwp-rail" },
          ["一", "二", "三", "四", "五", "六", "日"].map(function (w, i) {
            return h("div", { className: "tks-fwp-railRow", key: "r" + i }, w);
          })
        ),
        h(
          "div",
          {
            className: "tks-fwp-grid",
            // 键盘可访问（与主窗网格同源）：面板走**全量日序列**，
            // 步长同为 7 天（面板也是 7 行、按列填充）。
            role: "grid",
            tabIndex: 0,
            "aria-label": "完整历史热力图，可用方向键浏览、回车选中、Esc 关闭",
            onKeyDown: makeKeyHandler(year.cells, function () { setPanelOpen(false); }),
            style: { gridTemplateColumns: "repeat(" + year.weeks + ", " + FW_PANEL_CELL + "px)" }
          },
          yearCells
        )
      )
    );
  }

  var ago = st && st.fetchedAt ? Math.max(0, Math.round((Date.now() - st.fetchedAt) / 1000)) : null;

  // 三层结构：root → [anchor → card] + tip + panel
  // tip/panel 挂在 root（不带 transform）之下，否则 position:fixed 的包含块会变成 anchor，
  // 坐标会被叠加一次小窗位置（否则出 bug）。
  // ⚠️ anchor 的定位**不用 style 传**（性能考虑）：ref 回调里直接写 transform，
  //    与拖动/缩放期共用同一个 fwWriteAnchorPos，避免"渲染期写变量、拖动期写 transform"两套口径漂移。
  return h(
    "div",
    {
      className: "tks-fw-root",
      // 「允许吸附过渡」的初始值 = 1。
      // ⚠️ 必须由 React **声明式**写在这里，而不是只在手势里 setAttribute：
      //    ① 首帧就要有过渡（首次把卡片拖到边缘松手时就得看到动画）；
      //    ② React 的 diff 语义会把「上一次渲染残留的 0」纠正回来——兜住一切未走正常收尾的路径。
      //    （React 的 diff 语义会帮忙纠偏，此处正是把纠偏交给 React。）
      //    ⚠️ 不支持 `undefined`：值必须是 "1"/"0" 之一，否则属性消失、CSS 只命中默认过渡。
      "data-snap": "1"
    },
    h(
      "div",
      {
        className: "tks-fw-anchor",
        ref: function (node) {
          anchorRef.current = node;
          fwAnchorEl = node;
          if (!node) return;
          // ⚠️ **手势进行中不得用渲染期坐标覆盖**（曾出真实缺陷，勿删）：
          //    React 每次提交都会调用 ref 回调，而渲染期的 `safePos` 是**上一帧的 state 快照**；
          //    拖动期间真实位置在 `posRef`（每帧写入），两者在「停靠态」下还会因 gap 口径不同而差一个
          //    `FW_DOCK_GAP`（停靠态用 0 钳制、非停靠态用 FW_MARGIN=18）。
          //    症状：往左拖到边缘松手后，ref 回调把卡片又拽回贴死边缘的位置，
          //    使「贴边状态」判定从"未贴边"翻成"已贴边"→ 误触发吸附成细条
          //    （表现为细条无标题行 → 后续取 .tks-fw-head 得 null）。
          //    与下方 `posRef`/`sizeRef` 的权威约定同源：手势期间 ref 是权威，渲染期不得回写。
          if (draggingRef.current || resizingRef.current) return;
          fwWriteAnchorPos(safePos.x, safePos.y);
        }
      },
      h(
        "div",
        {
          className: "tks-fw",
          ref: cardRef,
          // 调过尺寸才写 style（未调过时用 CSS 默认宽度，避免首帧被写死）；
          // --tks-fw-fs 为字号缩放系数（随格子同步，防小卡片里固定字号撑破边框）。
          // ⚠️ **折叠态不得套用保存尺寸**（修「双击收起后还有空白面板」）：
          //    尺寸是给**展开态**用的；折叠后内容只剩标题行 + 数字行（约 47px），
          //    若仍写死 height=264，卡片就保持原高、下方留出大片空白（真实 Chromium 中可复现）。
          //    折叠态改由 CSS 决定尺寸（width:max-content + 高度 auto → 随内容收缩成一条），
          //    展开时 size 原样恢复，保存的尺寸偏好不丢。
          style: {
            "--tks-fw-fs": String(fontScale),
            // 停靠态：写死宽度（贴边紧凑形态，高度随内容）；否则调过尺寸才写。
            // ⚠️ 折叠态也必须写死宽度（不得用 max-content）：
            //    定位按 FW_FOLD_W 算 x（贴右缘 = area.right − 宽），若渲染宽随数字位数变化
            //    （宽度不固定），**两者不相等就会错位**——指针落到卡片外 → 闪烁死循环
            //    （形态在细条与展开之间反复横跳）。
            //    写死后 x 与渲染宽恒等，几何上不可能脱出。
            ...(docked ? { width: FW_PEEK_W + "px" } : {}),
            ...(stripForm && !docked && effMinimized ? { width: FW_FOLD_W + "px" } : {}),
            // 调过尺寸的**展开形态**（宽窗展开态 + 停靠**档位 2 悬浮态**）写死尺寸：
            // ★ 修「两种悬浮态大小不一致」（吸附态悬浮态与拖出后的尺寸不一致，
            //   即吸附态那份没套用保存尺寸）★
            //   旧条件 `!stripForm && ...` 把**停靠态悬浮态**排除在外 → 它走 `max-content` 渲染
            //   而定位（dockW/safeW）按 `cardWidth`＝保存尺寸算 x → 两者不等，
            //   贴右缘时错位（与折叠态错位同一条教训）。
            //   现改为 `!docked && !effMinimized`：两种悬浮态**同一尺寸口径**，定位与渲染恒等。
            //   ⚠️ 排除 docked（细条有自己的宽度）与 effMinimized（折叠态尺寸由 CSS 决定）。
            ...(!docked && !effMinimized && size && size.w > 0 && size.h > 0 ? { width: size.w + "px", height: size.h + "px" } : {})
          },
          "data-run": running ? "1" : null,
          "data-min": effMinimized ? "1" : null,
          "data-peek": docked ? "1" : null,
          // 停靠边（"left"/"right"）：CSS 按它镜像圆角（左贴边时圆角朝右，见 02-styles 说明）。
          // ⚠️ 细条态才写：折叠/完整卡片形态下圆角是四角全圆，写上去会让 CSS 选择器误命中。
          "data-dock": docked ? dockEdge : null,
          // 停靠**形态档位**（0 细条 / 1 折叠态 / 2 完整卡片）：供 CSS 与测试区分停靠下的三档。
          // ⚠️ 只在停靠形态下写（宽窗下无意义，写上去会干扰既有状态）。
          "data-docklevel": stripForm ? String(dockLevelEff) : null,
          // 无障碍：细条卡片本身只有竖排数字，用 aria-label 说明它的含义（读屏才能知道这是什么）
          "aria-label": docked ? "Token 统计停靠标识：" + (isTodayShown ? "今日" : md(shown ? shown.date : "")) + " " + (shown ? fmtTokens(shown.total) : "无数据") + " token，悬停展开折叠态，双击展开悬浮态" : null,
          onPointerDown: onPointerDown,
          onPointerMove: onPointerMove,
          onPointerUp: onPointerUp,
          onPointerCancel: onPointerUp,
          // ★ 丢 up 自愈 ★
          //    onPointerUp 只在**指针还在卡片上**时可靠送达；窗口失焦、指针被其它元素抢走、
          //    或在系统级拖拽（跨窗口）结束时，up 会**丢失**，于是 `data-snap="0"` 永久留在 DOM 上
          //    → 此后所有吸附/展开都静默变成硬跳（且不报错）。
          //    `lostpointercapture` 是浏览器在**捕获终止时必然派发**的事件（不论何种原因终止），
          //    故用它作兜底：无条件恢复过渡。重复调用无副作用（幂等）。
          //    ⚠️ 不能直接复用 onPointerUp：它的入参语义不同、且会重复走落库分支。
          onLostPointerCapture: function () {
            // 仅当确实有手势在跑时才需要救——正常收尾已恢复过，重复设值无副作用但省一次 DOM 写。
            if (draggingRef.current || resizingRef.current) {
              draggingRef.current = false;
              resizingRef.current = false;
              dragRef.current = null;
              resizeRef.current = null;
            }
            fwRestoreSnapping();
          },
          // 单击：**不改形态**；
          // 双击：细条形态下「细条/折叠态 → 悬浮态；悬浮态 → 折叠态」。详见各自说明。
          onClick: onClick,
          onDoubleClick: onDoubleClick,
          // 卡片本体只负责「保持展开」（不安排打开）——指针从标题栏移向卡内/面板时不会闪断。
          // ⚠️ 必须把事件传进去：停靠态要用 clientY 记录指针垂直位置（防展开时高度变小导致闪烁）。
          onMouseEnter: function (e) { enterSurface("card", e); },
          onMouseLeave: function () { leaveSurface("card"); },
          title: docked
            ? "Token 统计（悬停展开 · 双击看悬浮态 · 拖离边缘可取消吸附）"
            : (stripForm ? "Token 统计（悬停展开 · 双击看悬浮态 · 拖离边缘可取消吸附）" : "拖动可移动 · 拖到窗口边缘可吸附为细条 · 右下角拖拽调大小 · 双击折叠 · 标题栏悬停看完整历史")
        },
        // —— 停靠细条：**运行状态点 + 竖排今日数字** ——
        // 目标为「完全最小化、只保留一个标识」；旧版渲染「标题 + 数字」小条（168×54）仍会遮挡内容。
        // ⚠️ 细条**必须自带 onMouseEnter**（已知缺陷）：卡片上的 mouseenter 只在
        //    指针**跨过卡片边界**时派发；而细条是在原卡片位置上原地收缩出来的，指针可能一直
        //    停在卡片范围内、从未跨边界 → 卡片收不到 mouseenter → 细条永不展开
        //    （表现为 `card.matches(':hover')` 为 true，但 peek 恒为 "1"、只收到 mouseleave）。
        //    细条是「新的可见表面」，它自己声明悬停意图最可靠。
        docked
          ? h(
              "div",
              {
                className: "tks-fw-dock",
                onMouseEnter: function (e) { enterSurface("card", e); },
                onMouseLeave: function () { leaveSurface("card"); }
              },
              h("span", { className: "tks-fw-dockDot", "data-run": running ? "1" : null }),
              dockNumber
            )
          : null,
        docked ? null : h(
          "div",
          {
            className: "tks-fw-head",
            // 只有标题栏悬停才触发展开
            onMouseEnter: function (e) { enterSurface("head", e); },
            onMouseLeave: function () { leaveSurface("head"); }
          },
          h("span", { className: "tks-fw-title" }, "Token 统计"),
          // 「设置」入口：
          // 一步跳到插件面板的本插件卡片页，完整设置表单就渲染在该页面上（无需再点行上的「配置」）。
          // ⚠️ 三点设计约束：
          //   ① 只在官方导航服务可用时渲染——服务缺失时按钮不该出现（点了没反应比没有更糟）；
          //   ② `stopPropagation` 必须显式调——标题栏是拖动把手，不拦住会连带起拖动手势；
          //   ③ 必须在 `onPointerDown` 的交互元素白名单里（否则卡片会 setPointerCapture，
          //      把 click 重定向到卡片 → 按钮永远收不到 click，与热力图方块踩的是同一个坑）。
          FW_PLUGIN_NAV
            ? h(
                "button",
                {
                  type: "button",
                  className: "tks-fw-gear",
                  title: "打开完整设置（插件面板 → Token 统计）",
                  "aria-label": "打开 Token 统计的完整设置",
                  onPointerDown: function (e) { e.stopPropagation(); },
                  onDoubleClick: function (e) { e.stopPropagation(); },
                  onClick: function (e) {
                    e.stopPropagation();
                    if (FW_PLUGIN_NAV && typeof FW_PLUGIN_NAV.openBundle === "function") {
                      FW_PLUGIN_NAV.openBundle(FW_PKG_NAME);
                    }
                  }
                },
                "⚙"
              )
            : null,
          h("span", { className: "tks-fw-dot", "data-run": running ? "1" : null })
        ),
        docked ? null : h(
          "div",
          { className: "tks-fw-today" },
          h("span", { className: "tks-fw-num", "data-sel": isTodayShown ? null : "1" }, shown ? fmtTokens(shown.total) : "—"),
          h("span", { className: "tks-fw-unit" }, isTodayShown ? "今日 token" : md(shown.date) + " token"),
          // 选中非今天时给一个「回到今天」按钮（点击方块已可切换，这里补显式出口）。
          //
          // ★ 折叠态不渲染该按钮★
          //    理由：按钮宽 51px，而折叠态内容单行自然宽
          //    标题 + 数字本身已接近折叠态可用宽度，
          //    再挂按钮会把折叠条撑宽约 80px（贴边时遮挡明显变多）。
          //    折叠态是**悬停临时预览**形态，按钮本就不便点按；回今天在悬浮态/完整卡片里仍可用，
          //    且点击热力图方块本身即可切换日期。故这里按 `!effMinimized` 排除折叠态。
          //    ⚠️ 判据用 `effMinimized`（有效折叠，含停靠档位 1）而非 `minimized`（宽窗折叠偏好）：
          //       停靠态下形态由档位决定，`minimized` 恒不参与（见 effMinimized 说明）。
          isTodayShown || effMinimized ? null : h(
            "button",
            {
              type: "button",
              className: "tks-fw-back",
              onClick: function (e) { e.stopPropagation(); setSelDate(null); },
              title: "回到今天"
            },
            "回今天"
          )
        ),
        effMinimized || docked
          ? null
          : h(
              "div",
              { className: "tks-fw-gridWrap", style: { "--tks-fw-cell": cellPx + "px", "--tks-fw-gap": FW_GAP + "px" } },
              // 竖排星期标（周一～周日，7 行）在网格左侧——业内默认形态（GitHub 式贡献图）。
              h(
                "div",
                { className: "tks-fw-rail" },
                ["一", "二", "三", "四", "五", "六", "日"].map(function (w, i) {
                  return h("div", { className: "tks-fw-railRow", key: "r" + i }, w);
                })
              ),
              h(
                "div",
                {
                  className: "tks-fw-grid",
                  // 键盘可访问：网格可聚焦 + 方向键走格子。
                  // 步长 7 天 = 一周（网格自身几何：7 行、按列填充）。
                  role: "grid",
                  tabIndex: 0,
                  "aria-label": "每日 token 用量热力图，可用方向键浏览、回车选中、Esc 回到今天",
                  onKeyDown: makeKeyHandler(
                    month.cells.filter(function (c) { return !(c.empty || c.date > todayKey); }),
                    function () { setPanelOpen(false); }
                  ),
                  style: {
                    gridTemplateColumns: "repeat(" + plan.weeks + ", " + cellPx + "px)",
                    gridTemplateRows: "repeat(" + FW_ROWS + ", " + cellPx + "px)"
                  }
                },
                monthCells
              )
            ),
        effMinimized || docked
          ? null
          : h(
              "div",
              { className: "tks-fw-legend" },
              h("span", { className: "tks-fw-legend-label" }, "少"),
              h(
                "span",
                { className: "tks-fw-legend-scale" },
                [0, 1, 2, 3, 4].map(function (lv) {
                  return legendSwatch(lv);
                })
              ),
              h("span", { className: "tks-fw-legend-label" }, "多")
            ),
        effMinimized || docked
          ? null
          : h(
              "div",
              { className: "tks-fw-foot" },
              h("span", null, "近 " + plan.weeks + " 周"),
              h("span", null, ago === null ? (st && st.status === "error" ? "读取失败" : "…") : ago <= 1 ? "刚刚更新" : ago + " 秒前")
            ),
        // 右下角缩放把手：按住拖动改尺寸，松手落库。
        // 折叠态不显示（折叠时卡片是标题行，调尺寸无意义）；停靠态同样不显示（细条形态无尺寸可调）。
        effMinimized || docked
          ? null
          : h("div", { className: "tks-fw-grip", title: "拖动调整大小", "aria-label": "拖动调整大小" })
      )
    ),
    // 方块悬停气泡（固定定位，不参与卡片布局；挂 root 下避免 transform 影响）
    tip
      ? h(
          "div",
          { className: "tks-fw-tip" + (tip.below ? " tks-fw-tip-below" : ""), style: { left: tip.x + "px", top: tip.y + "px" } },
          h("div", null, tip.title),
          tip.detail ? h("div", { className: "tks-fw-tip-detail" }, tip.detail) : null
        )
      : null,
    panelNodes
  );
}

/** 小窗挂载：注册到 shell.overlay（框架级浮层）。remote 供运行状态订阅。 */
function applyFloat(ctx) {
  ctx.inject(["slots", "remote"], function (scope) {
    scope.slots.inject("shell.overlay", function () {
      return scope.slots.register(
        {
          name: "shell.overlay",
          id: "dsh-token-stats-float",
          order: 45,
          inject: function () {
            return { remote: scope.remote };
          }
        },
        TokenFloatWindow
      );
    });
  });
}

// ======== 11-section.js ========
// 分片 11/11 · 分区页组件 + 插件挂载 + 模块收尾

/** 范围查询结果内存缓存（组件外，避免每次渲染重置；键 "from|to" -> {models, at}）。 */
var RANGE_CACHE = {};
var RANGE_TTL_MS = 60000; // 缓存过期时间：过期后再点同区块自动重新请求，避免一直显示旧快照

/** 分区页顶部控件行：费用单价配置入口 + 导出。 */
function renderControls(p) {
  return h(
    "div",
    { className: "tks-controls" },
    h(
      "button",
      {
        type: "button",
        className: "tks-btn",
        onClick: function () { p.setModalOpen(true); }
      },
      "费用单价配置…"
    ),
    h("button", { type: "button", className: "tks-btn", onClick: function () { exportCsv(p.summary, p.cfg, p.dayCost); } }, "导出 CSV"),
    h("button", { type: "button", className: "tks-btn", onClick: function () { exportJson(p.summary, p.cfg, p.dayCost); } }, "导出 JSON")
  );
}

/** 预算告警条：最新一天（今天）超过任一口径阈值时展示（费用按币种分别比较，任一超标即触发）。 */
function renderBudgetAlert(summary, cfg, dayCost) {
  var days = summary.days || [];
  if (days.length === 0) return null;
  var lastDay = days[days.length - 1];
  var lastCost = dayCost ? dayCost[lastDay.date] || null : null;
  var parts = [];
  if (cfg.budgetTokens !== null && lastDay.total > cfg.budgetTokens) {
    parts.push("token " + fmtTokens(lastDay.total) + " > 阈值 " + fmtTokens(cfg.budgetTokens));
  }
  if (cfg.budgetCost !== null && lastCost) {
    ["CNY", "USD"].forEach(function (cur) {
      var v = lastCost[cur] || 0;
      if (v > cfg.budgetCost) parts.push("费用 " + fmtCost(v, cur) + " > 阈值 " + fmtCost(cfg.budgetCost, cur));
    });
  }
  if (parts.length === 0) return null;
  return h("p", { className: "tks-alert" }, "⚠ " + md(lastDay.date) + "（最新一天）消耗超预算：" + parts.join("；"));
}

function TokenStatsSection(props) {
  if (props && props.view === "summary") {
    return "跨会话 token 用量、费用与套餐配额统计（读本地会话日志，零模型消耗）。";
  }
  var cfgRawState = useState(function () {
    return loadRawConfig();
  });
  var cfgRaw = cfgRawState[0];
  var setCfgRaw = cfgRawState[1];
  var cfg = configOf(cfgRaw);
  var loadState = useState(null); // {status:"ok"|"error", data, message, fetchedAt}
  var st = loadState[0];
  var setSt = loadState[1];
  var tabState = useState("daily");
  var tab = tabState[0];
  var setTab = tabState[1];
  var tipState = useState(null);
  var tip = tipState[0];
  var setTip = tipState[1];
  var selState = useState(null); // {from,to,label}：点击热力图方块选中的区块；null=默认本周
  var sel = selState[0];
  var setSel = selState[1];
  var rangeState = useState(null); // {loading,from,to,models,error,fetchedAt}
  var rangeData = rangeState[0];
  var setRd = rangeState[1];
  var modalState = useState(false);
  var modalOpen = modalState[0];
  var setModalOpen = modalState[1];
  // provider 分组（来自模型配置 RPC llm.models）：null=尚未拉取/不可用；[{id,name,modelIds}]
  var provState = useState(null);
  var providers = provState[0];
  var setProv = provState[1];
  // 配置文件（$DSH_HOME/token-stats.cfg.json，文件为唯一权威）：保存后标记脏，避免迟到的首载读取覆盖更新的本地改动
  var cfgDirtyRef = useRef(false);

  /** 切页签：清除热力图选中区块，让下方统计图回到页签周期（每日=今日/每周=本周/每月=本月/累计=全部）。 */
  function switchTab(t) {
    setSel(null);
    setRd(null);
    setTab(t);
  }

  // 首载：文件有配置 → 用文件（并同步到 localStorage 缓存）；文件缺失 → 把浏览器现有配置播种进文件
  useEffect(function () {
    fetch("/token-stats/cfg")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.found && data.cfg && typeof data.cfg === "object") {
          if (!cfgDirtyRef.current) {
            setCfgRaw(data.cfg);
            saveRawConfig(data.cfg);
          }
        } else {
          var seed = loadRawConfig();
          fetch("/token-stats/cfg", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(seed && typeof seed === "object" ? seed : {})
          }).catch(function () {});
        }
      })
      .catch(function () {});
  }, []);

  // 挂载后拉一次模型配置分组（供套餐 provider 下拉与共享模型候选）；失败静默降级为空表
  useEffect(function () {
    var remote = REMOTE_REF;
    if (!remote || !remote.llm) {
      setProv([]);
      return;
    }
    fetchProviderGroups(remote)
      .then(function (groups) {
        setProv(groups);
      })
      .catch(function () { setProv([]); });
  }, []);

  /** 持久化配置并立即生效：localStorage 即时缓存 + 实时写回配置文件（文件为唯一权威，刷新/换浏览器不丢）。 */
  function persistRaw(next) {
    cfgDirtyRef.current = true;
    setCfgRaw(next);
    saveRawConfig(next);
    fetch("/token-stats/cfg", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next)
    }).catch(function () {});
  }

  // 范围查询结果内存缓存（同一区间短时重复点击零请求，超 TTL 自动重取）；键 "from|to"
  function pickRange(from, to, label) {
    setSel({ from: from, to: to, label: label });
    var k = from + "|" + to;
    var hit = RANGE_CACHE[k];
    if (hit && Date.now() - hit.at < RANGE_TTL_MS) {
      setRd({ loading: false, from: from, to: to, models: hit.models, fetchedAt: hit.at });
      return;
    }
    setRd({ loading: true, from: from, to: to, models: null });
    fetch("/token-stats/summary?from=" + encodeURIComponent(from) + "&to=" + encodeURIComponent(to))
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        var models = (data && data.models) || [];
        RANGE_CACHE[k] = { models: models, at: Date.now() };
        setRd({ loading: false, from: from, to: to, models: models, fetchedAt: Date.now() });
      })
      .catch(function (err) {
        setRd({ loading: false, from: from, to: to, models: null, error: String((err && err.message) || err) });
      });
  }

  useEffect(function () {
    var timer = null;
    function load() {
      // 配置了时段单价或套餐含「滚动 5 小时」限额时附加 hours=1（精确折算时段价 / 统计滚动窗用量）
      var url = "/token-stats/summary" + (needHours(cfg) ? "?hours=1" : "");
      fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function (data) {
          setSt({ status: "ok", data: data, message: null, fetchedAt: Date.now() });
        })
        .catch(function (err) {
          var msg = String((err && err.message) || err);
          setSt(function (prev) {
            return { status: "error", data: prev && prev.data ? prev.data : null, message: msg, fetchedAt: prev ? prev.fetchedAt : null };
          });
        });
    }
    function start() {
      if (timer === null) {
        load();
        timer = setInterval(load, POLL_MS);
      }
    }
    function stop() {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    }
    function onVis() {
      if (document.visibilityState === "visible") start();
      else stop();
    }
    start();
    document.addEventListener("visibilitychange", onVis);
    return function () {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
    // cfg 变化（保存配置）后重新建轮询，确保 hours 参数与最新配置一致
  }, [cfgRaw]);

  var summary = st && st.data ? st.data : null;
  var diag = summary && summary.diag ? summary.diag : null;
  var priced = hasPrices(cfg);
  var segsOn = anySegs(cfg);
  syncColorOverrides(cfg); // 渲染前同步用户指定色（改色立即反映到饼图/柱状条/图例）

  /** 指定/清除某模型的图表颜色（hex=null 恢复自动）；以当前 cfgRaw 状态为基线合并，写 localStorage 并立即生效。 */
  function setColorOverride(key, hex) {
    var colors = {};
    try {
      colors = JSON.parse(typeof cfgRaw.colorsJson === "string" && cfgRaw.colorsJson !== "" ? cfgRaw.colorsJson : "{}");
    } catch (e) {
      colors = {};
    }
    if (hex) colors[key] = hex;
    else delete colors[key];
    var raw = Object.assign({}, cfgRaw, { colorsJson: JSON.stringify(colors) });
    persistRaw(raw);
  }

  var dayCost = priced && summary ? costByDay(summary.modelByDay || [], summary.hours, cfg, segsOn) : null;
  var keyCosts = priced && segsOn && summary ? modelCostsFromHours(summary.hours, cfg) : null;
  var view = { cfg: cfg, dayCost: dayCost, keyCosts: keyCosts, onSetColor: setColorOverride };
  var quotaRows = summary ? computeQuotas(cfg.plans, summary, cfg) : [];
  var knownModels = summary && summary.models ? summary.models.map(function (m) { return m.key; }) : [];

  return h(
    "div",
    { className: "tks-section" },
    st && st.status === "error" ? h("p", { className: "tks-error" }, "统计接口请求失败：" + st.message + "（保留上次数据）") : null,
    diag ? h("p", { className: "tks-error" }, "有 " + diag.filesFailed + " 个日志文件解析失败（共 " + diag.filesSeen + " 个），统计数字可能偏低。" + (diag.lastError ? "最近错误：" + diag.lastError : "")) : null,
    !summary
      ? h("p", { className: "tks-empty" }, "正在统计本地会话日志…")
      : [
          // 数组只能作为"子节点参数"传给 createElement；当 type 传入会在渲染期抛
          // Element type is invalid → 整块空白。
          renderControls({ cfg: cfg, setModalOpen: setModalOpen, summary: summary, dayCost: dayCost }),
          renderBudgetAlert(summary, cfg, dayCost),
          renderQuotaAlerts(quotaRows),
          StreakRow(summary.totals),
          ScopeCards(sel ? scopeFromSel(summary.days, sel) : scopeRange(summary.days, tab), summary.totals),
          ActivityCard(summary, tab, switchTab, st.fetchedAt, setTip, pickRange, view),
          ChartCard(summary, sel, rangeData, setTip, view, tab),
          QuotaCard(quotaRows, cfg.currency),
          // SessionCard 含 hooks（useState），必须以 React 元素方式渲染——直接函数调用会把 hooks
          // 挂到 TokenStatsSection 上，summary 从 null 变有值（条件分支）时 hooks 数量变化导致
          // 「Rendered more hooks」崩溃、分区整页空白（不得直接调用）
          h(SessionCard, { summary: summary, sel: sel, setTip: setTip, cfg: view.cfg, tab: tab }),
          h(
            "p",
            { className: "tks-note" },
            "口径：合计 = 输入 + 输出 + 缓存读 + 缓存写（各平台账单均把缓存读写计入消耗，仅单价不同）；「累计 Token」默认随页签周期取值（每日=今日、每周=本周、每月=本月、累计=全部历史），点击热力图方块后随所选日期区块显示该区块累计总量并标注该区块（如「累计 Token（8月17日～8月23日）」），再切页签回到页签周期；峰值与最长单轮同样默认随页签取值并带「（今日/本周/本月）」后缀，点击热力图方块后也随所选日期区块取值并标注该区块，连续天数恒为全局；下方柱状图与饼图跟随页签周期（每日=今日、每周=本周、每月=本月、累计=全部历史），点击热力图任意方块（日/周/月）可切换为该时间区块的模型分布与占比，再切页签回到页签周期，同模型跨区块颜色一致；费用口径按「费用单价配置」中的单价表（货币/每百万 token）折算，时段单价按用量发生的小时精确匹配（支持跨零点），未配置单价的模型不计入；费用不做汇率折算，各币种分别合计，同时存在时展示为「¥X + $Y」；超过日预算（费用/token 任一口径）的方块红圈标注；配置保存在本地配置文件（token-stats.cfg.json）与浏览器缓存，导出按钮生成 CSV/JSON 文件；数据由本插件读取本地会话日志聚合，按步结算，页面可见期间每 20 秒自动刷新（非逐 token 实时），不发起任何模型调用。"
          )
        ],
    Tip(tip),
    modalOpen
      ? h(PricingModal, {
          key: "modal",
          cfgRaw: cfgRaw,
          known: knownModels,
          providers: providers,
          summary: summary, // 打开时快照：「当前已用%」预填与保存锚点兜底用
          onClose: function () { setModalOpen(false); },
          onSave: function (raw) { persistRaw(raw); }
        })
      : null
  );
}

//#region 插件挂载

/** remote 服务引用（apply 时捕获，供分区页拉模型配置分组；测试环境无 remote 时为 undefined）。
 *
 *  数据源变迁：旧版走 `connection.api.llm.models({})`（wire 方法 llm.models）。
 *  DSH 0.1.7-alpha.1 起 connection 服务不再暴露 api 面，且 llm.models 这条 wire 方法
 *  在宿主侧早已不存在（0.1.6-alpha.2 的 dsh-llm 只有 listProviders /
 *  listConfigurableProviders / discoverModels）。现改用官方「设置 → 模型」页同源的三方法组合。
 */
var REMOTE_REF = null;

/** 拉取 provider 目录并映射为分区页消费形态 [{id, name, modelIds}]。
 *
 *  组合逻辑对齐官方 dsh-client-ui-settings-models 的 joinProviderDirectory：
 *  listProviders（已注册路由）∪ listConfigurableProviders（声明了设置路径的 provider），
 *  再逐个 discoverModels(settingsNs, {provider}) 取模型清单。
 *  remote RPC 返回信封 {ok, value, error}（官方协议，非裸数组）。
 *  任一步失败都只降级为空清单，不抛错——分区页另有「按日志 provider 前缀」兜底分组。
 */
function fetchProviderGroups(remote) {
  var llm = remote && remote.llm;
  if (!llm || typeof llm.listProviders !== "function" || typeof llm.listConfigurableProviders !== "function") {
    return Promise.resolve([]);
  }
  return Promise.resolve()
    .then(function () {
      return Promise.all([llm.listProviders(), llm.listConfigurableProviders()]);
    })
    .then(function (pair) {
      var registered = pair[0] && pair[0].ok ? pair[0].value || [] : [];
      var declared = pair[1] && pair[1].ok ? pair[1].value || [] : [];
      // 合并：声明侧提供 settingsNs（discoverModels 需要它），注册侧补齐未声明的 provider
      var groups = [];
      var seen = {};
      declared.forEach(function (entry) {
        if (!entry || typeof entry.provider !== "string" || entry.provider === "") return;
        seen[entry.provider] = true;
        groups.push({
          id: entry.provider,
          name: typeof entry.displayName === "string" && entry.displayName !== "" ? entry.displayName : entry.provider,
          settingsNs: typeof entry.settingsNs === "string" ? entry.settingsNs : "",
          modelIds: []
        });
      });
      registered.forEach(function (provider) {
        if (!provider || typeof provider.id !== "string" || provider.id === "") return;
        if (seen[provider.id]) return;
        seen[provider.id] = true;
        groups.push({
          id: provider.id,
          name: typeof provider.name === "string" && provider.name !== "" ? provider.name : provider.id,
          settingsNs: "",
          modelIds: []
        });
      });
      // 逐个探测模型清单；无 settingsNs 的（未声明配置路径）跳过，保留在候选池里但无 modelIds
      var tasks = groups.map(function (g) {
        if (g.settingsNs === "" || typeof llm.discoverModels !== "function") return Promise.resolve();
        return Promise.resolve()
          .then(function () {
            return llm.discoverModels(g.settingsNs, { provider: g.id });
          })
          .then(function (res) {
            if (!res || !res.ok) return;
            g.modelIds = (res.value || [])
              .map(function (m) { return m && typeof m.id === "string" ? m.id : ""; })
              .filter(function (x) { return x !== ""; });
          })
          .catch(function () {});
      });
      return Promise.all(tasks).then(function () {
        return groups.map(function (g) {
          return { id: g.id, name: g.name, modelIds: g.modelIds };
        });
      });
    })
    .catch(function () {
      return [];
    });
}

function apply(ctx) {
  // remote.llm 需与 remote 同时声明注入，否则 cordis 守卫抛
  // "cannot get property remote.llm without inject" → 配置页整页空白。
  ctx.inject(["slots", "remote", "remote.llm"], function (scope) {
    REMOTE_REF = scope.remote || null;
    // 0.1.7-rc.1 起：本插件无 settings 命名空间（配置走 /token-stats/cfg 文件路由），
    // 故不用 configForms.whileServed 守卫，直接注册到插件管理页行配置
    // （plugins.row.config，key = <包名>#<行id>；行 id 见 cordis.patch.yml）。
    scope.slots.inject("plugins.row.config", function () {
      return scope.slots.register(
        {
          name: "plugins.row.config",
          key: "dsh-token-stats#token-stats"
        },
        TokenStatsSection
      );
    });
    // **同一份配置再挂到「卡片详情页」**：
    // 官方导航 `openBundle(包名)` 只能跳到**卡片页**（不能直接跳到行页），
    // 故把配置也注册到 `plugins.bundle.config`（key = 包名）——点击后到达卡片页时，
    // 完整设置表单**就在页面上**，不必再点行上的「配置」。
    // ⚠️ 同一个组件注册到两个插槽是安全的：它是标准函数组件（hooks 归自己），
    //    两处各自挂载、各自独立取数，不存在「直接调用组件导致 hooks 串链」的风险。
    scope.slots.inject("plugins.bundle.config", function () {
      return scope.slots.register(
        {
          name: "plugins.bundle.config",
          key: "dsh-token-stats"
        },
        TokenStatsSection
      );
    });
  });

  // 官方「插件面板导航」服务（**可选能力**）：供悬浮小窗的「设置」按钮一步跳到本插件卡片页。
  // ⚠️ 必须走 ctx.inject 探测（项目红线一）：顶层裸读 `ctx.pluginNavigation` 在服务缺失时
  //    会在激活期抛守卫错 → 客户端条目未激活 → DSH 整页打不开。
  //    服务缺失（旧宿主/未装插件管理页）时 FW_PLUGIN_NAV 保持 null，按钮不渲染，小窗照常工作。
  ctx.inject(["pluginNavigation"], function (navScope) {
    FW_PLUGIN_NAV = navScope.pluginNavigation || null;
  });

  // 常驻悬浮小窗（shell.overlay 框架级浮层）：独立于设置分区页，挂载失败不影响分区页。
  // 单独 inject 一次，避免与上面的 remote.llm 依赖耦合（小窗只需 slots + remote）。
  applyFloat(ctx);
}

var inject = ["slots", "remote", "remote.llm"];
//#endregion

exports.apply = apply;
exports.inject = inject;
return module.exports;
  }
});
