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
// 历史（多轮修正，勿再回退）：
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
 * ★ 性能修复（勿改回 CSS 变量）★
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
 * 设计（三条，勿再回退）：
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

