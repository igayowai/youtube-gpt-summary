globalThis.YGS = globalThis.YGS || {};

globalThis.YGS.log = function log(...args) {
  try {
    console.info("[YGS]", ...args);
  } catch (_) {
    // Intentionally silent.
  }
};

globalThis.YGS.warn = function warn(...args) {
  try {
    console.warn("[YGS]", ...args);
  } catch (_) {
    // Intentionally silent.
  }
};
