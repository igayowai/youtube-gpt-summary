globalThis.YGS = globalThis.YGS || {};

// Objects are written as text so console readers that cannot expand objects
// (for example browser automation tools) still see the full diagnostic detail.
function formatYgsLogArg(value) {
  if (value instanceof Error) {
    return `${value.name}: ${value.message}`;
  }
  if (value && typeof value === "object") {
    try {
      const text = JSON.stringify(value);
      return text.length > 2000 ? `${text.slice(0, 2000)}…` : text;
    } catch (_) {
      return String(value);
    }
  }
  return value;
}

globalThis.YGS.log = function log(...args) {
  try {
    console.info("[YGS]", ...args.map(formatYgsLogArg));
  } catch (_) {
    // Intentionally silent.
  }
};

globalThis.YGS.warn = function warn(...args) {
  try {
    console.warn("[YGS]", ...args.map(formatYgsLogArg));
  } catch (_) {
    // Intentionally silent.
  }
};
