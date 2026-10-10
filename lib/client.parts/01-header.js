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
