/**
 * dsh-token-stats · 聚合（日序列 + 总指标 + 模型/周期桶 + 日×模型/日×会话明细）。
 */

import { DAY_MS, localDateStr, tsOfDay } from "./util.js";

/** 向模型聚合桶累加一步用量；桶内值形状与 models 数组一致（calls=去重后步骤数）。
 *  perf（可选）= {turnMs, ttft, outTokens, outMs}：模型用时合计、TTFT（sum/count 平均）、
 *  输出 token 与输出耗时（sum/sum 加权平均，官方 decode 口径）。 */
function accumModel(map, key, s, perf) {
  let m = map.get(key);
  if (m === undefined) {
    m = { key, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0, calls: 0, turnMs: 0, ttftSum: 0, ttftN: 0, outTokens: 0, outMs: 0 };
    map.set(key, m);
  }
  m.input += s.input;
  m.output += s.output;
  m.cacheRead += s.cacheRead;
  m.cacheWrite += s.cacheWrite;
  m.total += s.input + s.output + s.cacheRead + s.cacheWrite;
  m.calls++;
  if (perf) {
    m.turnMs += perf.turnMs || 0; // 模型用时 = Σ(message.time − step/start)，官方 llmMs 口径
    if (perf.ttft !== null && perf.ttft > 0) {
      m.ttftSum += perf.ttft;
      m.ttftN++;
    }
    if (perf.outMs > 0 && perf.outTokens > 0) {
      m.outTokens += perf.outTokens;
      m.outMs += perf.outMs;
    }
  }
}

/** 向模型聚合桶累加一次工具调用（工具用时数据源；toolCalls/toolMs 独立于 usage 步）。 */
function accumTool(map, key, tool) {
  let m = map.get(key);
  if (m === undefined) {
    m = { key, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0, calls: 0, turnMs: 0, ttftSum: 0, ttftN: 0, outTokens: 0, outMs: 0, toolCalls: 0, toolMs: 0 };
    map.set(key, m);
  }
  m.toolCalls = (m.toolCalls || 0) + 1;
  m.toolMs = (m.toolMs || 0) + (tool.to - tool.from);
}

/** 模型桶 → 响应行：用量字段 + 性能时序（turnMs 模型用时；toolCalls/toolMs 工具次数/用时；
 *  ttftMs 平均首 token 毫秒；tps 平均输出 token/秒 = ΣoutTokens/ΣoutMs 加权（官方 decode 口径）；无样本为 null）。 */
function serializeModelRow(a) {
  return {
    key: a.key,
    input: a.input,
    output: a.output,
    cacheRead: a.cacheRead,
    cacheWrite: a.cacheWrite,
    total: a.total,
    calls: a.calls,
    turnMs: a.turnMs || 0,
    toolCalls: a.toolCalls || 0,
    toolMs: a.toolMs || 0,
    ttftMs: a.ttftN > 0 ? Math.round((a.ttftSum || 0) / a.ttftN) : null,
    tps: a.outMs > 0 ? Math.round(((a.outTokens || 0) / a.outMs) * 10000) / 10 : null
  };
}

/**
 * 单次遍历聚合出 summary（日序列 + 总指标 + 模型/周期桶）与「日 × 模型」明细。
 * days 为自首个有用量日到今天（含两端、不足补零）的稠密日序列，本地时区。
 * meta（可选）：与 parsed 对齐的会话元信息数组（{name, full}，失败文件为 null），提供时同步产出
 * 「日 × 会话」明细（供前端下钻当日 Top 会话；种子复制同样被去重，归属首个出现的文件）。
 *
 * 关键：先做**跨文件全局事件去重**再累加。派生/种子会话会把父会话的历史
 * （含 usage 事件，原时间戳与 turn/step）整段复制进新日志文件，直接跨文件求和会把同一批
 * 消耗重复计入。同一逻辑事件的
 * (time, turn:step, 四项数值) 完全一致才视为重复——turn/step 参与键可消除
 * 「同毫秒 + 数值完全相同的两个不同步骤被误删」的撞车（种子复制保留 turn/step，去重能力不变）。
 */
export function aggregate(parsed, nowMs, meta) {
  const seenEvents = new Set();
  const byDay = new Map();
  const models = new Map(); // "provider/model" -> {key,input,output,cacheRead,cacheWrite,total,calls}
  const sessByDay = new Map(); // date -> Map(sessionName -> {name,total,calls})（meta 提供时产出）
  const hourByDay = new Map(); // date -> Map(modelKey -> Array(24) of {四项+total,calls} | null)，时段单价折算用
  // 周期边界（本地时区零点）：今日 / 本周一 / 本月1号，供按周期模型桶过滤（口径与前端指标卡一致）
  const nowD = new Date(nowMs);
  const todayTs = tsOfDay(localDateStr(nowMs));
  const weekStartTs = todayTs - ((nowD.getDay() + 6) % 7) * DAY_MS;
  const monthStartTs = new Date(nowD.getFullYear(), nowD.getMonth(), 1).getTime();
  const periodToday = new Map();
  const periodWeek = new Map();
  const periodMonth = new Map();
  const maxTurnByDate = new Map(); // 本地日期 -> 该日内最长单轮毫秒（供前端按今日/本周/本月取值）
  let longestTurnMillis = 0;
  const seenTools = new Set(); // 工具调用跨文件去重键：callId（种子复制保留原 callId）
  for (let fi = 0; fi < parsed.length; fi++) {
    const f = parsed[fi];
    if (!f) continue;
    const sessName = meta ? meta[fi] ?? null : null;
    if (f.longestTurnMillis > longestTurnMillis) longestTurnMillis = f.longestTurnMillis;
    for (const t of f.turns || []) {
      const dk = localDateStr(t.start);
      const prev = maxTurnByDate.get(dk);
      if (prev === undefined || t.ms > prev) maxTurnByDate.set(dk, t.ms);
    }
    for (const s of f.steps) {
      const evKey = s.time + "|" + s.turn + ":" + s.step + "|" + s.input + "|" + s.output + "|" + s.cacheRead + "|" + s.cacheWrite;
      if (seenEvents.has(evKey)) continue;
      seenEvents.add(evKey);
      // 性能时序（跟随 usage 步骤取同文件数据；usage 已跨文件去重，span 天然不重复）：
      // 模型用时 = message.time − step/start（官方 llmMs 口径；msgTime 缺失时回退 step 起止差）；
      // TTFT = 首 token（含 reasoning）− step/start；输出速度 = Σoutput / Σ(message.time − 首 token)，加权平均。
      const spanKey = s.turn + ":" + s.step;
      const span = f.stepSpans ? f.stepSpans.get(spanKey) : undefined;
      const tspan = f.textSpans ? f.textSpans.get(spanKey) : undefined;
      const perf = { turnMs: 0, ttft: null, outTokens: 0, outMs: 0 };
      if (span !== undefined) {
        // 模型用时终点用 message.time（官方 llmMs）；无 msgTime（旧格式无 message.stream）回退 step/end
        const llmEnd = typeof tspan !== "undefined" && typeof tspan.msgTime === "number" ? tspan.msgTime : span.end;
        perf.turnMs = Math.max(0, llmEnd - span.start);
        if (tspan !== undefined && tspan.firstAt !== null && tspan.firstAt !== undefined) {
          if (tspan.firstAt >= span.start) perf.ttft = tspan.firstAt - span.start;
          // 输出耗时 = message.time − 首 token（官方 decodeMs）；只累加同时有首 token 与 output>0 的步
          const endMs = typeof tspan.msgTime === "number" ? tspan.msgTime : s.time;
          const outMs = endMs - tspan.firstAt;
          if (outMs > 0 && s.output > 0) {
            perf.outTokens = s.output;
            perf.outMs = outMs;
          }
        }
      }
      const date = localDateStr(s.time);
      let d = byDay.get(date);
      if (d === undefined) {
        d = { date, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
        byDay.set(date, d);
      }
      d.input += s.input;
      d.output += s.output;
      d.cacheRead += s.cacheRead;
      d.cacheWrite += s.cacheWrite;

      // 「日 × 会话」明细（去重后归属该步骤所在日志文件对应的会话）
      if (sessName !== null) {
        const sessKey = sessName.name; // Map 键用稳定字符串（name），对象引用不可作键
        let sm = sessByDay.get(date);
        if (sm === undefined) {
          sm = new Map();
          sessByDay.set(date, sm);
        }
        let rec = sm.get(sessKey);
        if (rec === undefined) {
          rec = { name: sessName.name, full: sessName.full, title: sessName.title || null, id: sessName.id || null, role: sessName.role || "main", parent: sessName.parent || null, depth: sessName.depth || 0, label: sessName.label || null, total: 0, calls: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, turnMs: 0, toolCalls: 0, toolMs: 0, ttftSum: 0, ttftN: 0, outTokens: 0, outMs: 0 };
          sm.set(sessKey, rec);
        }
        rec.input += s.input;
        rec.output += s.output;
        rec.cacheRead += s.cacheRead;
        rec.cacheWrite += s.cacheWrite;
        rec.total += s.input + s.output + s.cacheRead + s.cacheWrite;
        rec.calls++;
        rec.turnMs += perf.turnMs;
        if (perf.ttft !== null && perf.ttft > 0) {
          rec.ttftSum += perf.ttft;
          rec.ttftN++;
        }
        if (perf.outMs > 0 && perf.outTokens > 0) {
          rec.outTokens += perf.outTokens;
          rec.outMs += perf.outMs;
        }
      }

      // 按模型汇总（calls = 去重后的用量步骤数，一个 step = 一次模型响应）；
      // 同时归入 今日/本周/本月 三个周期桶，供前端柱状图与饼图按页签取用（口径与日序列一致）。
      const mk = typeof s.model === "string" && s.model !== "" ? s.model : "未知模型";

      // 「日 × 模型 × 小时」明细（本地时区小时桶；序列化按需，供前端按时段单价折算费用）
      const hr = new Date(s.time).getHours();
      let km = hourByDay.get(date);
      if (km === undefined) {
        km = new Map();
        hourByDay.set(date, km);
      }
      let hb24 = km.get(mk);
      if (hb24 === undefined) {
        hb24 = new Array(24).fill(null);
        km.set(mk, hb24);
      }
      let hb = hb24[hr];
      if (hb === null) {
        hb = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0, calls: 0 };
        hb24[hr] = hb;
      }
      hb.input += s.input;
      hb.output += s.output;
      hb.cacheRead += s.cacheRead;
      hb.cacheWrite += s.cacheWrite;
      hb.total += s.input + s.output + s.cacheRead + s.cacheWrite;
      hb.calls++;

      accumModel(models, mk, s, perf);
      if (s.time >= todayTs) accumModel(periodToday, mk, s, perf);
      if (s.time >= weekStartTs) accumModel(periodWeek, mk, s, perf);
      if (s.time >= monthStartTs) accumModel(periodMonth, mk, s, perf);

      // 日 × 模型明细（供任意日期范围查询内存合并与前端每日费用折算）
      let dayMap = byDay.get(date).models;
      if (dayMap === undefined) {
        dayMap = new Map();
        byDay.get(date).models = dayMap;
      }
      accumModel(dayMap, mk, s, perf);
    }
    // 工具调用（按 callId 全局去重后累加进模型/周期/日×模型/会话桶；工具用时 = to − from）
    for (const tool of f.tools || []) {
      if (seenTools.has(tool.callId)) continue;
      seenTools.add(tool.callId);
      const tmk = typeof tool.model === "string" && tool.model !== "" ? tool.model : "未知模型";
      const tdate = localDateStr(tool.from);
      accumTool(models, tmk, tool);
      if (tool.from >= todayTs) accumTool(periodToday, tmk, tool);
      if (tool.from >= weekStartTs) accumTool(periodWeek, tmk, tool);
      if (tool.from >= monthStartTs) accumTool(periodMonth, tmk, tool);
      let td = byDay.get(tdate);
      if (td !== undefined) {
        if (td.models === undefined) td.models = new Map();
        accumTool(td.models, tmk, tool);
      }
      if (sessName !== null) {
        const sessKey = sessName.name;
        let sm = sessByDay.get(tdate);
        if (sm === undefined) {
          sm = new Map();
          sessByDay.set(tdate, sm);
        }
        let rec = sm.get(sessKey);
        if (rec === undefined) {
          rec = { name: sessName.name, full: sessName.full, title: sessName.title || null, id: sessName.id || null, role: sessName.role || "main", parent: sessName.parent || null, depth: sessName.depth || 0, label: sessName.label || null, total: 0, calls: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, turnMs: 0, toolCalls: 0, toolMs: 0, ttftSum: 0, ttftN: 0, outTokens: 0, outMs: 0 };
          sm.set(sessKey, rec);
        }
        rec.toolCalls++;
        rec.toolMs += tool.to - tool.from;
      }
    }
  }

  const modelByDay = new Map();
  for (const [date, rec] of byDay) {
    modelByDay.set(date, rec.models ?? new Map());
    delete rec.models; // days 序列输出不能带内部字段
  }

  let summary;
  if (byDay.size === 0) {
    summary = {
      totals: { grandTotal: 0, grandCache: 0, peakDay: 0, peakDayCache: 0, longestTurnMillis: 0, currentStreak: 0, maxStreak: 0 },
      firstDate: null,
      days: [],
      models: [],
      periodModels: { today: [], week: [], month: [] }
    };
  } else {
    const dates = [...byDay.keys()].sort();
    const firstDate = dates[0];
    const todayStr = localDateStr(nowMs);
    const endStr = todayStr > dates[dates.length - 1] ? todayStr : dates[dates.length - 1];

    const days = [];
    let grandTotal = 0;
    let grandCache = 0;
    let peakDay = 0;
    let peakDayCache = 0;
    const flags = [];
    for (let ts = tsOfDay(firstDate); ts <= tsOfDay(endStr); ts += DAY_MS) {
      const key = localDateStr(ts);
      const rec = byDay.get(key);
      const input = rec ? rec.input : 0;
      const output = rec ? rec.output : 0;
      const cacheRead = rec ? rec.cacheRead : 0;
      const cacheWrite = rec ? rec.cacheWrite : 0;
      const total = input + output + cacheRead + cacheWrite;
      const cache = cacheRead + cacheWrite;
      days.push({ date: key, input, output, cacheRead, cacheWrite, total, maxTurn: maxTurnByDate.get(key) || 0 });
      flags.push(total > 0);
      grandTotal += total;
      grandCache += cache;
      if (total > peakDay) {
        peakDay = total;
        peakDayCache = cache;
      }
    }

    // 连续天数（在稠密序列上扫描）
    let maxStreak = 0;
    let run = 0;
    for (const on of flags) {
      if (on) {
        run++;
        if (run > maxStreak) maxStreak = run;
      } else {
        run = 0;
      }
    }
    let currentStreak = 0;
    let i = flags.length - 1;
    if (i >= 0 && !flags[i]) i--; // 今天还没用量时允许从昨天起算
    while (i >= 0 && flags[i]) {
      currentStreak++;
      i--;
    }

    summary = {
      totals: { grandTotal, grandCache, peakDay, peakDayCache, longestTurnMillis, currentStreak, maxStreak },
      firstDate,
      days,
      models: [...models.values()].sort((a, b) => b.total - a.total).map(serializeModelRow),
      periodModels: {
        today: [...periodToday.values()].filter((m) => m.total > 0).sort((a, b) => b.total - a.total).map(serializeModelRow),
        week: [...periodWeek.values()].filter((m) => m.total > 0).sort((a, b) => b.total - a.total).map(serializeModelRow),
        month: [...periodMonth.values()].filter((m) => m.total > 0).sort((a, b) => b.total - a.total).map(serializeModelRow)
      }
    };
  }

  return { summary, modelByDay, sessByDay, hourByDay };
}

/** 「日 × 模型 × 小时」Map → 稀疏数组（仅实际有用量的桶；时段单价折算用）。 */
export function serializeHours(hourByDay) {
  const out = [];
  for (const [date, km] of hourByDay) {
    for (const [key, hb24] of km) {
      for (let h = 0; h < 24; h++) {
        const b = hb24[h];
        if (b) out.push({ date, key, h, input: b.input, output: b.output, cacheRead: b.cacheRead, cacheWrite: b.cacheWrite, total: b.total, calls: b.calls });
      }
    }
  }
  return out;
}

/** 仅取 summary（保留导出供自测脚本/外部调用）。 */
export function summarize(parsed, nowMs) {
  return aggregate(parsed, nowMs).summary;
}

/** 仅取「日 × 模型」明细（保留导出供外部调用）。 */
export function buildModelByDay(parsed) {
  return aggregate(parsed, Date.now()).modelByDay;
}

/** 「日 × 模型」Map → 稀疏数组（仅出现在响应里，供前端按单价表折算每日费用 / 范围查询内存合并）。 */
export function serializeModelByDay(modelByDay) {
  const out = [];
  for (const [date, m] of modelByDay) {
    for (const [key, a] of m) {
      const row = serializeModelRow(a);
      out.push({ date, key, input: row.input, output: row.output, cacheRead: row.cacheRead, cacheWrite: row.cacheWrite, total: row.total, calls: row.calls, turnMs: row.turnMs, toolCalls: row.toolCalls, toolMs: row.toolMs, ttftMs: row.ttftMs, tps: row.tps });
    }
  }
  return out;
}

/** 每日保留的会话条数（Top 会话下钻用）。 */
export const SESSIONS_PER_DAY = 20;

/** 「日 × 会话」Map → 稀疏数组（每日按 total 降序截前 cap 条；行带性能时序：turnMs 会话用时、
 *  toolCalls/toolMs 工具次数/用时、ttftSum/ttftN 与 outTokens/outMs 为**原始累加**（前端跨天合并同会话时
 *  TTFT 按 sum/count、输出速度按 ΣoutTokens/ΣoutMs 加权重算，避免日级平均失真）；无样本 sum=0/count=0。 */
export function serializeSessions(sessByDay, cap = SESSIONS_PER_DAY) {
  const out = [];
  for (const [date, m] of sessByDay) {
    const rows = [...m.values()].sort((a, b) => b.total - a.total);
    // 截断策略：主会话按 total 降序取前 cap；**子代理会话不截断**——
    // 子代理任务通常量小，按 total 排序会被主会话挤掉，导致「子对话」视图几乎看不到子代理。
    const heads = [];
    const subs = [];
    for (const r of rows) (r.role === "subagent" ? subs : heads).push(r);
    for (const r of heads.slice(0, cap).concat(subs)) {
      out.push({
        date,
        name: r.name,
        full: r.full,
        title: r.title || null,
        id: r.id || null,
        role: r.role || "main",
        parent: r.parent || null,
        depth: r.depth || 0,
        label: r.label || null,
        total: r.total,
        calls: r.calls,
        input: r.input,
        output: r.output,
        cacheRead: r.cacheRead,
        cacheWrite: r.cacheWrite,
        turnMs: r.turnMs || 0,
        toolCalls: r.toolCalls || 0,
        toolMs: r.toolMs || 0,
        ttftSum: r.ttftSum || 0,
        ttftN: r.ttftN || 0,
        outTokens: r.outTokens || 0,
        outMs: r.outMs || 0
      });
    }
  }
  return out;
}
