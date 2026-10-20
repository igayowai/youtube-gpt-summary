const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createRuntime, exposeProvider, Button, providerEnvironment } = require("./helpers/runtime.cjs");

// Reduced sketch of the 2026-10-19 Gemini mode pill (docs/ui-dom-captures/live-ui-2026-10-19.md),
// not browser evidence. Primary text is the model; secondary text is the thinking level and is
// absent for the lowest level.
function pill(primary, secondary) {
  const text = (value) => ({ textContent: value, innerText: value });
  const container = {
    innerText: [primary, secondary].filter(Boolean).join("\n"),
    querySelector: (selector) => {
      if (selector === ".picker-primary-text") return text(primary);
      if (selector === ".picker-secondary-text") return secondary === undefined ? null : text(secondary);
      return null;
    }
  };
  const button = new Button();
  button.innerText = container.innerText;
  button.textContent = container.innerText;
  button.querySelector = (selector) => selector.includes("logo-pill-label-container") ? container : null;
  return button;
}

function api() {
  const h = createRuntime();
  const exposed = exposeProvider(h, "gemini",
    ["isGeminiModelSelectedBySelector", "isGeminiThinkingLevelSelectedBySelector"], providerEnvironment());
  const model = (value) => h.context.YGS.GEMINI_MODELS.find((item) => item.value === value);
  const level = (value) => h.context.YGS.GEMINI_THINKING_LEVELS.find((item) => item.value === value);
  return { ...exposed, model, level };
}

test("2026-10-19 pill: primary text selects exactly one model, including Argon", () => {
  const a = api();
  const cases = { "Flash-Lite": "flash-lite", Flash: "flash", Pro: "pro", Argon: "argon" };
  for (const [primary, expected] of Object.entries(cases)) {
    for (const value of ["flash-lite", "flash", "pro", "argon"]) {
      assert.equal(a.isGeminiModelSelectedBySelector(pill(primary, "보통"), a.model(value)), value === expected,
        `${primary} vs ${value}`);
    }
  }
});

test("2026-10-19 pill: secondary text gives the level and a missing one means 최저가", () => {
  const a = api();
  const cases = [[undefined, "low"], ["", "low"], ["보통", "medium"], ["최고가", "high"]];
  for (const [secondary, expected] of cases) {
    for (const value of ["low", "medium", "high"]) {
      assert.equal(a.isGeminiThinkingLevelSelectedBySelector(pill("Argon", secondary), a.level(value)), value === expected,
        `${secondary} vs ${value}`);
    }
  }
  assert.equal(a.isGeminiThinkingLevelSelectedBySelector(pill("Pro", "보통"), a.level("none")), true);
});
