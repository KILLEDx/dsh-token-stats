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
