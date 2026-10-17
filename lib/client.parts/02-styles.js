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
