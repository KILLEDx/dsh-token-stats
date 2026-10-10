/**
 * dsh-token-stats · zstd 多帧解压 + 单文件日志解析。
 *
 * 数据源与关键坑（已验证，勿改）：
 * - 日志位于 sessions/<工作区编码名>/session-<uuid>/session.jsonl.zstd（旧格式，DSH ≤0.1.2）
 *   或同目录 session.v3.jsonl.zstd（新格式，DSH 0.1.5-rc.2 起）；
 * - 每个 .zstd 是大量 zstd 帧顺序拼接（单文件可达数千帧），zstdDecompressSync(整个文件)
 *   只能解出第一帧——必须循环：从当前偏移解压一帧 → 从 偏移+4 起搜索魔数
 *   28 B5 2F FD 定位下一帧 → 依次拼接各帧明文；魔数可能误报，解压失败跳过该候选继续搜；
 * - 用量事件（旧格式）：assistant/chunk 且 data.chunk.type === "usage"，按 (turn, step) 取最后一条
 *   （last-wins）；某步缺 usage chunk 时用同会话 assistant/message 的 data.usage 兜底
 *   （字段同名 inputTokens/outputTokens/cacheReadTokens/cacheWriteTokens）；
 * - 用量事件（新格式 v3/v4）：assistant/attempt 事件，usage 移入 data.stream[] 数组
 *   （stream 内 chunk.type === "usage" 的 chunk.usage），同样按 (turn, step) last-wins；
 *   注意 attempt 的 usage 只有 inputTokens/outputTokens/totalTokens 三项，**无 cacheReadTokens/cacheWriteTokens**，
 *   需从同 step 的 assistant/message data.usage 兜底补齐（message data.usage 带 cacheReadTokens）；
 *   兜底口径见下方「零值 attempt 遮蔽坑」——**逐字段取非零**，不只补 cache 两项；
 * - **零值 attempt 遮蔽坑（已修复）**：
 *   官方把 assistant/attempt 与 assistant/message 视为**同一次尝试的两种结算**（见 app.asar 内
 *   deriveTurnTokenUsage：attempt 结算失败/中断、message 结算成功，两者**从不同时给出非零 usage**）。
 *   v4 起 attempt 的 usage 大量为全 0，旧实现「attempt 优先 + message 只补 0 值字段」
 *   会让全 0 的 attempt 把真实 message 数据整个盖掉——导致大量 step 被遮蔽、input/output 合计少算。
 *   修法：同键合并时**逐字段取非零值**（attempt 优先、缺项由 message 补齐），等价于官方「取该次尝试的有效样本」，
 *   同时保留「attempt 非零时其权威性」与「v3 attempt 无 cache 字段时由 message 补 cache」两种既有行为。
 * - 模型归属：request/header 事件带 header.config.{provider, model}（会话中途换模型会追加
 *   多条 header），每个 usage 步骤归属到「seq ≤ 它的最近一条 request/header」。
 *
 * 性能时序数据（TTFT / TPS / 模型用时 / 工具调用用时，块级近似非逐 token 精确）：
 * - 模型用时：step/start → step/end 差 = 该 step 总耗时（含步内工具调用等待），按该步 usage 归属模型；
 * - 工具调用用时：tool/call → tool/result 按 callId 配对（callId 在 v3 的
 *   data.message.source.callId，兼容 data.callId），差即工具耗时，归属当时模型；
 * - TTFT（首 token 平均）：v3 无 delta 时间戳，用 assistant/message 的 stream 里
 *   text-chunks 块前最近 chunk.block-start 的 time 近似为「首个文本块开始」；old 格式用
 *   顶层 text-chunks 事件 time0。第一个文本块开始 − step 开始 = 该 step 的 TTFT；
 * - TPS（输出速度）：输出耗时 = 末文本块开始 + Σdt(该块 token 间隔) − 首文本块开始，
 *   TPS = 该步 usage.outputTokens / 输出耗时秒数。
 * 两格式的时序数据结构不同但都在 (turn, step) 上对齐，幂等规则与 usage 相同。
 *
 * 解析状态支持增量喂入：日志为 append-only，重入时只需解压并喂入新追加的帧。
 * 事件重入是幂等的：usage 按 (turn,step) last-wins、turn 起止取 min/max，重复喂同帧结果不变；
 * headers 重复追加同 seq 条目也无害（headerPtr 按 seq 前推，键相同）。
 */

import { readFileSync } from "node:fs";
import { zstdDecompressSync } from "node:zlib";
import { num } from "./util.js";

const HAS_ZSTD = typeof zstdDecompressSync === "function";

const ZSTD_MAGIC = Buffer.from([0x28, 0xb5, 0x2f, 0xfd]);

/** 在 buf 中从 from 起找下一处 zstd 帧魔数（28 B5 2F FD），找不到返回 -1。 */
export function findMagic(buf, from) {
  return buf.indexOf(ZSTD_MAGIC, from);
}

/**
 * 从 buf[from] 起循环解压多帧拼接的 zstd 流。
 * 返回 { text, lastOk }：text 为各成功帧明文的拼接；lastOk 为最后一个成功解压的帧起始偏移（无则 -1）。
 * 魔数出现在压缩数据内部会造成误报候选——解压失败就跳过该候选、继续向后搜。
 */
export function decompressFramesFrom(buf, from) {
  if (!HAS_ZSTD) {
    throw new Error("当前 Node 缺少 zlib.zstdDecompressSync（需 Node ≥ 22.15），无法解压会话日志");
  }
  const parts = [];
  let offset = findMagic(buf, from);
  let lastOk = -1;
  while (offset >= 0 && offset < buf.length) {
    try {
      parts.push(zstdDecompressSync(buf.subarray(offset)));
      lastOk = offset;
    } catch {
      // 误报魔数 / 坏帧 / 尾部不完整帧：跳过这个候选位置
    }
    offset = findMagic(buf, offset + 4);
  }
  return { text: Buffer.concat(parts).toString("utf8"), lastOk };
}

/**
 * 把"多帧顺序拼接"的 .zstd 文件解压成完整明文（全量解析入口，导出仅为自测）。
 */
export function decompressFrames(buf) {
  return decompressFramesFrom(buf, 0).text;
}

/** 新建单文件解析状态（供增量喂入）。 */
export function createParserState() {
  return {
    usageByStep: new Map(), // "turn:step" -> {time,input,output,cacheRead,cacheWrite,model}（chunk 口径，last-wins）
    msgUsageByStep: new Map(), // 同键，assistant/message 兜底口径
    turnStartAt: new Map(), // turn -> 最早 turn/start time
    turnEndAt: new Map(), // turn -> 最晚 step/end time
    headers: [], // {seq,key:"provider/model"}（按出现顺序；换模型会追加多条）
    headerPtr: -1, // 当前行之前最近的 header 下标（日志按时间追加，单指针前推即可）
    title: null, // 会话标题：session/title 事件 last-wins（含用户重命名 source:"user" 追加的事件，seq 更大天然胜出）
    titleSeq: -1,
    sessionMeta: null, // 会话身份（日志首行 type:"session" 事件）：{id, origin, parent, depth}；origin="subagent"+parent 即子代理会话
    subagentMeta: null, // 子代理描述符（subagent/descriptor 事件，仅子代理会话有）：{label, agentProvider, agentModel, mode}
    // —— 性能时序（增量幂等：起止取 min/max、配对按 callId 覆盖、文本块取 min/max）——
    stepStartAt: new Map(), // "turn:step" -> 最早 step/start time（模型用时与 TTFT 的 step 起点）
    stepEndAt: new Map(), // "turn:step" -> 最晚 step/end time（模型用时终点）
    toolStartAt: new Map(), // callId -> {time, turn, step, name, model}（tool/call 待配对）
    toolResults: new Map(), // callId -> {from, to, name, turn, step, model}（tool/result 配对完成，覆盖幂等）
    textSpans: new Map() // "turn:step" -> {firstAt, lastAt}（文本块开始/结束，TTFT 与 TPS 用；取 min/max）
  };
}

/** 把一段明文 JSONL 喂入解析状态（行级粗筛与事件分派）。 */
export function feedLines(st, text) {
  /** 当前指针位置的模型键；没有任何 header 时归入「未知模型」。 */
  function modelForCurrent() {
    return st.headerPtr >= 0 ? st.headers[st.headerPtr].key : "未知模型";
  }

  /**
   * 从 assistant/message 的 stream 取首个「非空 token」时间（对齐官方 dsh-llm 的
   * assistantStreamFirstTokenTime：复制其判定逻辑）。
   * chunk 记录：text/reasoning/tool-call delta 非空即取 record.time；
   * run 记录（reasoning-chunks/text-chunks/tool-call-chunks）：tool-call 带 name 取 time0，
   * 否则从 time0 起按 dt 累加重建 fragment 时间，取首个非空 fragment。
   * 返回时间戳毫秒；无任何 token 返回 null。
   */
  function firstTokenTimeOf(stream) {
    for (const record of stream) {
      if (!record || typeof record !== "object") continue;
      if (record.type === "chunk") {
        const chunk = record.chunk;
        if (chunk && typeof chunk.type === "string") {
          let isTok = false;
          if (chunk.type === "text-delta" || chunk.type === "reasoning-delta") isTok = chunk.text !== "";
          else if (chunk.type === "tool-call-delta") isTok = chunk.argumentsDelta !== "" || chunk.name !== undefined;
          if (isTok && typeof record.time === "number") return record.time;
        }
        continue;
      }
      if (record.type === "reasoning-chunks" || record.type === "text-chunks" || record.type === "tool-call-chunks") {
        if (record.type === "tool-call-chunks" && record.name !== undefined) return record.time0;
        const fragments = record.type === "tool-call-chunks" ? record.args : record.texts;
        if (Array.isArray(fragments) && typeof record.time0 === "number") {
          let t = record.time0;
          for (let i = 0; i < fragments.length; i++) {
            if (i > 0 && Array.isArray(record.dt)) t += record.dt[i - 1] || 0;
            if (fragments[i] !== "") return t;
          }
        }
      }
    }
    return null;
  }

  for (const line of text.split("\n")) {
    if (line === "") continue;
    // 粗筛：按事件名字符串快速排除无关行；v3 的 message/attempt 行可能同时含
    // "type":"usage" 等子串（message 带 stream 数组），不能用关键词互斥判断——
    // 粗筛只做「有没有可能相关」，具体分派一律以解析后的 ev.type 为准。
    const isCandidate =
      line.indexOf('"assistant/chunk"') !== -1 ||
      line.indexOf('"assistant/attempt"') !== -1 ||
      line.indexOf('"assistant/message"') !== -1 ||
      line.indexOf('"request/header"') !== -1 ||
      line.indexOf('"turn/start"') !== -1 ||
      line.indexOf('"turn/end"') !== -1 ||
      line.indexOf('"step/start"') !== -1 ||
      line.indexOf('"step/end"') !== -1 ||
      line.indexOf('"tool/call"') !== -1 ||
      line.indexOf('"tool/result"') !== -1 ||
      line.indexOf('"text-chunks"') !== -1 ||
      line.indexOf('"session/title"') !== -1 ||
      line.indexOf('"type":"session"') !== -1 ||
      line.indexOf('"subagent/descriptor"') !== -1;
    if (!isCandidate) continue;

    let ev;
    try {
      ev = JSON.parse(line);
    } catch {
      continue;
    }

    // 会话身份（日志首行 type:"session" 事件）：子代理会话带 origin:"subagent"+parentSession，
    // 主会话只有 delegationDepth:0。增量重入覆盖写，幂等。
    if (ev.type === "session") {
      st.sessionMeta = {
        id: typeof ev.id === "string" && ev.id !== "" ? ev.id : null,
        origin: ev.origin === "subagent" ? "subagent" : "main",
        parent: typeof ev.parentSession === "string" && ev.parentSession !== "" ? ev.parentSession : null,
        depth: Number.isInteger(ev.delegationDepth) ? ev.delegationDepth : 0
      };
      continue;
    }

    // 子代理描述符（仅子代理会话有）：任务 label 与代理实际模型（agentProvider/agentModel）。
    if (ev.type === "subagent/descriptor") {
      const d = ev.data || {};
      st.subagentMeta = {
        label: typeof d.label === "string" && d.label !== "" ? d.label : null,
        agentProvider: typeof d.agentProvider === "string" && d.agentProvider !== "" ? d.agentProvider : null,
        agentModel: typeof d.agentModel === "string" && d.agentModel !== "" ? d.agentModel : null,
        mode: typeof d.mode === "string" && d.mode !== "" ? d.mode : null
      };
      continue;
    }

    if (ev.type === "request/header") {
      const c = ev.data?.header?.config ?? {};
      const seq = Number(ev.seq);
      if (Number.isFinite(seq)) {
        const provider = typeof c.provider === "string" && c.provider !== "" ? c.provider : "?";
        const model = typeof c.model === "string" && c.model !== "" ? c.model : "?";
        st.headers.push({ seq, key: provider + "/" + model });
        st.headerPtr = st.headers.length - 1;
      }
      continue;
    }

    if (ev.type === "assistant/chunk") {
      // 旧格式：usage 事件即 assistant/chunk 且 data.chunk.type === "usage"
      const u = ev.data?.chunk?.type === "usage" ? ev.data.chunk.usage : null;
      const turn = ev.data?.turn;
      const step = ev.data?.step;
      if (u && Number.isFinite(turn) && Number.isFinite(step)) {
        while (st.headerPtr + 1 < st.headers.length && st.headers[st.headerPtr + 1].seq <= Number(ev.seq)) st.headerPtr++;
        st.usageByStep.set(turn + ":" + step, {
          time: ev.time,
          turn,
          step,
          input: num(u.inputTokens),
          output: num(u.outputTokens),
          cacheRead: num(u.cacheReadTokens),
          cacheWrite: num(u.cacheWriteTokens),
          model: modelForCurrent()
        });
      }
      continue;
    }

    // 新格式（v3）：usage 在 assistant/attempt 事件的 data.stream[] 数组里（chunk.type === "usage"）。
    // 同 (turn, step) 可能出现多条 attempt（重试/流式），last-wins 取最后一条；
    // v3 的 usage 只有 input/output/total，cache 字段由 assistant/message 兜底补齐（见 finishParse）。
    if (ev.type === "assistant/attempt") {
      const stream = Array.isArray(ev.data?.stream) ? ev.data.stream : [];
      let u = null;
      for (const c of stream) {
        if (c && c.chunk && c.chunk.type === "usage" && c.chunk.usage) u = c.chunk.usage;
      }
      const turn = ev.data?.turn;
      const step = ev.data?.step;
      if (u && Number.isFinite(turn) && Number.isFinite(step)) {
        while (st.headerPtr + 1 < st.headers.length && st.headers[st.headerPtr + 1].seq <= Number(ev.seq)) st.headerPtr++;
        st.usageByStep.set(turn + ":" + step, {
          time: ev.time,
          turn,
          step,
          input: num(u.inputTokens),
          output: num(u.outputTokens),
          cacheRead: num(u.cacheReadTokens),
          cacheWrite: num(u.cacheWriteTokens),
          model: modelForCurrent()
        });
      }
      continue;
    }

    // 会话标题（新旧格式通用）：默认标题（fallback/provider source）与用户重命名（source:"user"）
    // 都是 session/title 事件。日志 append-only，重命名追加的事件 seq 更大 → last-wins 取 seq 最大。
    // source 不区分（user 与 fallback 同构，只取最终 title 文本）。
    if (ev.type === "session/title") {
      const title = ev.data?.title;
      const seq = Number(ev.seq);
      if (typeof title === "string" && title !== "" && seq > st.titleSeq) {
        st.title = title;
        st.titleSeq = seq;
      }
      continue;
    }

    // 兜底/会话结构事件：assistant/message（usage 兜底 + v3 文本块时间）、turn/start、step/start|end、tool/call|result、顶层 text-chunks（old）。
    // 注意：assistant/message 与 assistant/attempt 行都含 "usage" 子串，但 here 只处理 message。
    if (ev.type === "assistant/message") {
      // usage 在 data.usage；兼容 data.message.usage（字段同名）。
      // ⚠️ 必须用 `!= null` 同时排除 undefined 与 **null**：宿主「未上报」可能是显式 null，
      // 若只判 undefined，null 会进入下面 num(null) 路径；更糟的是若某处直接读 u.inputTokens
      // 会抛错并被 per-file catch 吞掉——表现为**整个文件被静默跳过**。
      const raw = ev.data?.usage !== undefined && ev.data?.usage !== null
        ? ev.data.usage
        : ev.data?.message?.usage;
      const u = raw !== undefined && raw !== null ? raw : null;
      const turn = ev.data?.turn;
      const step = ev.data?.step;
      if (u && Number.isFinite(turn) && Number.isFinite(step)) {
        while (st.headerPtr + 1 < st.headers.length && st.headers[st.headerPtr + 1].seq <= Number(ev.seq)) st.headerPtr++;
        st.msgUsageByStep.set(turn + ":" + step, {
          time: ev.time,
          turn,
          step,
          input: num(u.inputTokens),
          output: num(u.outputTokens),
          cacheRead: num(u.cacheReadTokens),
          cacheWrite: num(u.cacheWriteTokens),
          model: modelForCurrent()
        });
      }
      // 首 token 时间（TTFT/TPS 数据源，对齐官方 dsh-session-stats 口径）：
      // stream 里第一个「非空 token」的时间——chunk 记录（text/reasoning/tool-call delta）直接取 time；
      // run 记录（reasoning-chunks/text-chunks/tool-call-chunks）从 time0 起按 dt 累加重建各 fragment
      // 时间，取首个非空 fragment（tool-call 带 name 时取 time0）。注意必须含 reasoning 时段——
      // 官方 decode（输出耗时）起点 = 首 token（含 reasoning），终点 = message.time（msgTime）。
      // 旧实现只取 text-chunks 块开始（跳过 reasoning），导致输出耗时被大幅低估、TPS 虚高。
      const stream = Array.isArray(ev.data?.stream) ? ev.data.stream : [];
      const firstTok = firstTokenTimeOf(stream);
      if (Number.isFinite(turn) && Number.isFinite(step)) {
        const key = turn + ":" + step;
        const prev = st.textSpans.get(key);
        if (firstTok !== null) {
          st.textSpans.set(key, { firstAt: prev ? Math.min(prev.firstAt, firstTok) : firstTok, msgTime: ev.time, lastAt: prev ? prev.lastAt : firstTok });
        } else if (prev) {
          prev.msgTime = ev.time; // 无 token 的 step 也保留 message 时间（输出耗时为 0 无意义，仅完整性）
        } else {
          st.textSpans.set(key, { firstAt: null, msgTime: ev.time, lastAt: null });
        }
      }
      continue;
    }

    // 工具调用配对（工具用时数据源）：tool/call 记录待配对，tool/result 按 callId 配对产出；
    // 增量重入时同 callId 覆盖写（Map），配对结果幂等。callId 在 v3 的 data.message.source.callId，
    // 兼容 data.callId。归属模型 = 工具发起时刻的模型（该 step 的模型已由发起时的 header 确定）。
    // 注意：必须在下方「结构事件」分支之前判断——tool/call|result 事件带 time 与数字 turn，
    // 会被该分支的 continue 拦截而永远配对不上（否则 toolCalls 恒 0）。
    if (ev.type === "tool/call") {
      const callId = ev.data?.callId;
      const turn = ev.data?.turn;
      const step = ev.data?.step;
      if (typeof callId === "string" && callId !== "" && Number.isFinite(turn) && Number.isFinite(step)) {
        st.toolStartAt.set(callId, {
          time: ev.time,
          turn,
          step,
          name: typeof ev.data?.name === "string" ? ev.data.name : "?",
          model: modelForCurrent()
        });
      }
      continue;
    }
    if (ev.type === "tool/result") {
      const callId = ev.data?.message?.source?.callId ?? ev.data?.callId;
      const start = typeof callId === "string" && callId !== "" ? st.toolStartAt.get(callId) : undefined;
      if (start !== undefined) {
        st.toolResults.set(callId, {
          callId, // 聚合层按 callId 全局去重（种子复制保留原 callId）
          from: start.time,
          to: ev.time,
          name: start.name,
          turn: start.turn,
          step: start.step,
          model: start.model // 工具发起时刻的模型（该 step 的模型已由发起时的 header 确定）
        });
        st.toolStartAt.delete(callId); // 配对完成后移除，避免残留（重入同帧时覆盖写回再配对，结果一致）
      }
      continue;
    }

    // 旧格式（≤0.1.2）顶层 text-chunks 事件：time0 = 该批文本块开始（首个 fragment 即 time0），
    // dt = token 间隔（TTFT/TPS 兜底源，无 message.stream 时用）。保留 msgTime 不被覆盖。
    if (ev.type === "text-chunks") {
      const turn = ev.data?.turn;
      const step = ev.data?.step;
      if (Number.isFinite(turn) && Number.isFinite(step) && typeof ev.time0 === "number") {
        let dtSum = 0;
        if (Array.isArray(ev.data?.dt)) for (const d of ev.data.dt) dtSum += d;
        const key = turn + ":" + step;
        const prev = st.textSpans.get(key);
        const firstAt = prev && prev.firstAt !== null ? Math.min(prev.firstAt, ev.time0) : ev.time0;
        const lastAt = prev && prev.lastAt !== null ? Math.max(prev.lastAt, ev.time0 + dtSum) : ev.time0 + dtSum;
        st.textSpans.set(key, { firstAt, lastAt, msgTime: prev ? prev.msgTime : undefined });
      }
      continue;
    }

    if (ev.time !== undefined && Number.isFinite(ev.data?.turn)) {
      const turn = ev.data.turn;
      const step = Number.isFinite(ev.data?.step) ? ev.data.step : null;
      if (ev.type === "turn/start") {
        const prev = st.turnStartAt.get(turn);
        if (prev === undefined || ev.time < prev) st.turnStartAt.set(turn, ev.time);
      } else if (ev.type === "turn/end") {
        // 官方 dsh-session-stats 口径：turn 结束时丢弃未配对的工具调用（结果总在其轮内落地）
        st.toolStartAt.clear();
      } else if (ev.type === "step/start") {
        if (step !== null) {
          const key = turn + ":" + step;
          const prev = st.stepStartAt.get(key);
          if (prev === undefined || ev.time < prev) st.stepStartAt.set(key, ev.time);
        }
      } else if (ev.type === "step/end") {
        if (step !== null) {
          const key = turn + ":" + step;
          const prev = st.stepEndAt.get(key);
          if (prev === undefined || ev.time > prev) st.stepEndAt.set(key, ev.time);
        }
        const prev = st.turnEndAt.get(turn);
        if (prev === undefined || ev.time > prev) st.turnEndAt.set(turn, ev.time);
      }
      continue;
    }
  }
}

/** 从解析状态产出最终结果：兜底合并 + 单轮耗时统计 + 性能时序数据。 */
export function finishParse(st) {
  // 兜底合并：① chunk/attempt 缺失的步骤才用 message 口径；
  // ② 同键（同一次尝试）**逐字段取非零值**——attempt 优先，其缺项/零项由 message 补齐。
  //    依据（官方 app.asar deriveTurnTokenUsage）：assistant/attempt 与 assistant/message 是同一次尝试的
  //    两种结算事件（attempt=失败/中断结算、message=成功结算），两者从不同时给出非零 usage。
  //    旧实现只补 cache 两个字段，导致全 0 的 attempt 把 message 的 input/output 整个盖掉
  //    （症状：大量 step 被遮蔽、input/output 合计少算）。
  //    逐字段取非零同时保留既有行为：attempt 非零时其 input/output 权威（重试累加语义不变）、
  //    v3 attempt 无 cache 字段时仍由 message 补 cache。
  for (const [key, u] of st.msgUsageByStep) {
    const cur = st.usageByStep.get(key);
    if (cur === undefined) {
      st.usageByStep.set(key, u);
    } else {
      if (!cur.input && u.input) cur.input = u.input;
      if (!cur.output && u.output) cur.output = u.output;
      if (!cur.cacheRead && u.cacheRead) cur.cacheRead = u.cacheRead;
      if (!cur.cacheWrite && u.cacheWrite) cur.cacheWrite = u.cacheWrite;
    }
  }

  const turns = [];
  let longestTurnMillis = 0;
  for (const [turn, start] of st.turnStartAt) {
    const end = st.turnEndAt.get(turn);
    if (end === undefined) continue;
    const ms = end - start;
    if (ms < 0) continue;
    turns.push({ start, ms }); // 按轮次开始时刻归属日期（跨零点的轮记入开始日）
    if (ms > longestTurnMillis) longestTurnMillis = ms;
  }

  // step 级起止（模型用时与 TTFT 的 step 起点）：起止都有的才产出
  const stepSpans = new Map(); // "turn:step" -> {start, end}
  for (const [key, start] of st.stepStartAt) {
    const end = st.stepEndAt.get(key);
    if (end !== undefined && end >= start) stepSpans.set(key, { start, end });
  }

  return {
    steps: [...st.usageByStep.values()],
    turns,
    longestTurnMillis,
    title: st.title,
    sessionMeta: st.sessionMeta,
    subagentMeta: st.subagentMeta,
    stepSpans, // "turn:step" -> {start, end}（模型用时 = Σ(end−start)，含步内工具等待）
    tools: [...st.toolResults.values()], // [{from,to,name,turn,step,model}]（工具调用用时 = to−from）
    textSpans: st.textSpans // "turn:step" -> {firstAt, lastAt}（TTFT = firstAt−step.start；TPS = output/((lastAt−firstAt)/1000)）
  };
}

/**
 * 解析单个会话日志（全量；导出仅为自测/外部调用）：
 * 返回 { steps:[{time,input,output,cacheRead,cacheWrite,model}], turns, longestTurnMillis }。
 * 任何失败抛错由调用方跳过该文件。
 */
export function parseLogFile(filePath) {
  const st = createParserState();
  feedLines(st, decompressFrames(readFileSync(filePath)).toString("utf8"));
  return finishParse(st);
}
