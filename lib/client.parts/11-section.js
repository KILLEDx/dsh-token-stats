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
          // Element type is invalid → 整块空白（本次踩坑）。
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
          // 「Rendered more hooks」崩溃、分区整页空白（勿改回直接调用）
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
