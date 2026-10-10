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

