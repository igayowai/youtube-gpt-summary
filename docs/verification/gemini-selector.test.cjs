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

test("2026-10-20 pill: the levels now read 낮음 / 보통 / 높음 ('Argon 높음'); lowest still has no secondary text", () => {
  const a = api();
  const cases = [[undefined, "low"], ["보통", "medium"], ["높음", "high"]];
  for (const [secondary, expected] of cases) {
    for (const value of ["low", "medium", "high"]) {
      assert.equal(a.isGeminiThinkingLevelSelectedBySelector(pill("Argon", secondary), a.level(value)), value === expected,
        `${secondary} vs ${value}`);
    }
  }
});

test("2026-10-20 submenu rows: each level's menu matcher hits its own row title only", () => {
  const { context } = createRuntime();
  const titles = ["낮음", "보통", "높음"];
  const matches = (title, matchers) => matchers.some((m) => m.startsWith("exact:") ? title === m.slice(6) : title.includes(m));
  for (const level of context.YGS.GEMINI_THINKING_LEVELS.filter((item) => item.value !== "none")) {
    assert.deepEqual(titles.filter((title) => matches(title, level.matchers)), [level.label.split(" ")[0]], level.value);
  }
});

test("2026-10-20 never-shown tab pill 'Gemini / Argon': model read from the second part, level left unconfirmed", () => {
  const a = api();
  const brand = pill("Gemini", "Argon");
  for (const value of ["flash-lite", "flash", "pro", "argon"]) {
    assert.equal(a.isGeminiModelSelectedBySelector(brand, a.model(value)), value === "argon", value);
  }
  for (const value of ["low", "medium", "high"]) {
    assert.equal(a.isGeminiThinkingLevelSelectedBySelector(brand, a.level(value)), false, value);
  }
  assert.equal(a.isGeminiThinkingLevelSelectedBySelector(brand, a.level("none")), true);
});
