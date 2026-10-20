const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createRuntime, exposeProvider, Button, providerEnvironment } = require("./helpers/runtime.cjs");

function fixture({ value = 2, model = "Latest", blocked = false, max = "4", mismatch = false, modelChange = false } = {}) {
  const h = createRuntime();
  const env = providerEnvironment();
  let opened = true;
  let now = 0;
  const keys = [];
  const labels = ["Instant", "중간", "High", "매우 높음", "Pro"];
  const prefix = model === "Latest" ? "" : model.replace("GPT-", "").replace(" Sol", "") + " ";
  const button = new Button();
  button.id = "effort";
  Object.defineProperties(button, {
    innerText: { get: () => prefix + labels[value] },
    textContent: { get: () => prefix + labels[value] }
  });
  button.matches = () => true;
  button.closest = () => ({});
  const control = new Button();
  control.getAttribute = () => null;
  control.dispatchEvent = (event) => {
    if (event.type === "keydown") {
      keys.push(event.key);
      if (!blocked) value += event.key === "ArrowRight" ? 1 : -1;
      if (modelChange) model = "different model";
    }
    return true;
  };
  const slider = {
    closest: () => control,
    getAttribute: (name) => ({ "aria-valuemin": "0", "aria-valuemax": max, "aria-valuenow": String(value) })[name] ?? null
  };
  const panel = { querySelector: () => slider };
  const menu = new Button();
  menu.getAttribute = (name) => name === "aria-labelledby" ? button.id : null;
  menu.querySelector = (selector) => {
    if (selector.includes("simple-view")) return panel;
    if (selector.includes("aria-expanded")) return { innerText: mismatch ? "wrong label" : prefix + labels[value] };
    if (selector.includes("aria-checked")) return { textContent: model };
    return null;
  };
  env.document.querySelectorAll = (selector) => selector.startsWith("[role='menu']") ? (opened ? [menu] : []) : [button];
  env.document.dispatchEvent = (event) => { if (event.key === "Escape") opened = false; };
  env.KeyboardEvent = class { constructor(type, init) { this.type = type; Object.assign(this, init); } };
  env.Date = class extends Date { static now() { return now; } };
  env.setTimeout = (callback, ms) => { now += ms; queueMicrotask(callback); };
  const api = exposeProvider(h, "chatgpt", ["parseChatGptEffortLabel", "readChatGptSliderState", "selectChatGptSliderEffort", "main"], env);
  return { h, env, api, button, keys, current: () => ({ value, model, opened }) };
}

test("ChatGPT parses effort independently of explicit version prefixes", () => {
  const { api } = fixture();
  for (const prefix of ["", "5.6 ", "5.5\n", "GPT-5.6 Sol "]) {
    for (const [label, expected] of [["Instant", "instant"], ["중간", "medium"], ["High", "high"], ["매우 높음", "extra-high"], ["Pro", "pro"]]) {
      assert.equal(api.parseChatGptEffortLabel(prefix + label), expected);
    }
  }
  assert.equal(api.parseChatGptEffortLabel("6Pro"), "pro");
  assert.equal(api.parseChatGptEffortLabel("Extra High"), "extra-high");
  assert.equal(api.parseChatGptEffortLabel("Pro Extended"), "");
});

test("ChatGPT slider traverses every supported destination and preserves model", async () => {
  for (const model of ["Latest", "GPT-5.6 Sol", "GPT-5.5"]) {
    for (const [target, value] of ["instant", "medium", "high", "extra-high", "pro"].entries()) {
      const f = fixture({ value: 4, model });
      assert.equal(await f.api.selectChatGptSliderEffort({ value, label: value }, null, f.button), true);
      assert.deepEqual(f.current(), { value: target, model, opened: false });
      assert.equal(f.keys.length, 4 - target);
    }
  }
  const f = fixture({ value: 0 });
  assert.equal(await f.api.selectChatGptSliderEffort({ value: "extra-high" }, null, f.button), true);
  assert.deepEqual(f.keys, ["ArrowRight", "ArrowRight", "ArrowRight"]);
  const pro = fixture({ value: 0 });
  assert.equal(await pro.api.selectChatGptSliderEffort({ value: "pro" }, null, pro.button), true);
  assert.equal(pro.current().value, 4);
});

test("ChatGPT rejects changed bounds, text mismatch, blocked steps, and model changes", async () => {
  for (const options of [{ max: "5" }, { mismatch: true }, { blocked: true }, { modelChange: true }]) {
    const f = fixture(options);
    assert.equal(await f.api.selectChatGptSliderEffort({ value: "extra-high" }, null, f.button), false);
    assert.ok(f.keys.length <= 1);
    assert.equal(f.current().opened, false);
  }
});

test("ChatGPT never silently maps legacy Pro variants to new Pro", async () => {
  for (const value of ["pro-basic", "pro-extended"]) {
    const f = fixture({ value: 4 });
    assert.equal(await f.api.selectChatGptSliderEffort({ value }, null, f.button), false);
    assert.equal(f.keys.length, 0);
  }
});

test("ChatGPT main withholds injection, clear, and send after failed selection", async () => {
  const f = fixture({ blocked: true });
  const messages = [];
  f.h.context.document.readyState = "complete";
  f.h.context.location.hash = "#ygsRequestId=fixture";
  f.h.context.document.querySelectorAll = () => [];
  f.h.context.document.querySelector = () => null;
  // Composer exists, but no model selector does. All external interactions remain mocked.
  const input = new Button();
  input.isContentEditable = true;
  f.h.context.document.querySelectorAll = (selector) => selector.includes("contenteditable") || selector === "textarea" ? [input] : [];
  f.h.context.chrome.runtime.sendMessage = async (message) => {
    messages.push(message);
    return message.type === f.h.context.YGS.MESSAGE_TYPES.GET_PENDING_PROMPT
      ? { payload: { prompt: "fixture", chatgptModelFamily: "latest", chatgptReasoningEffort: "extra-high", autoSubmit: true } } : {};
  };
  await f.api.main();
  assert.deepEqual(messages.map(m => m.type), [f.h.context.YGS.MESSAGE_TYPES.GET_PENDING_PROMPT, f.h.context.YGS.MESSAGE_TYPES.CHATGPT_PROMPT_DONE]);
  assert.equal(messages[1].payload.status, "selection-not-confirmed");
  assert.equal(input.events.length, 0);
});
