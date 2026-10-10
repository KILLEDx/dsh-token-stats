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
   *    插在中间会移位后续所有下标（曾因此让依赖下标取值的逻辑错位）。
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
  // ⚠️ 高度口径必须用 **FW_PEEK_H（实际 74）** 而非 FW_DOCK_H（估算 70）——曾因此修过一次缺陷：
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
    //    窗口仍会出现小幅度的向上移动」——根因与修法如下，勿改回「指针居中」★★
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
    //    ⚠️ 只保下边缘、**不保上边缘**——给上边缘也做保护就又变成「上移」了（本次要修的就是它）。
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
  // ⚠️ 宽度必须与上面 `dockW` **同一口径**（曾因此出真实缺陷，勿改回 cardWidth）：
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
  // 坐标会被叠加一次小窗位置（曾因此出 bug）。
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
            // ⚠️ 折叠态也必须写死宽度（勿改回 max-content）：
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
          // ★ 折叠态不渲染该按钮（勿改回）★
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
