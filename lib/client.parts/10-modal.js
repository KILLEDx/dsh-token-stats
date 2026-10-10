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
