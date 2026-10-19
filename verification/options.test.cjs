const assert = require("node:assert/strict");
const { test } = require("node:test");
const path = require("node:path");
const { createRuntime, readSource, plain } = require("./helpers/runtime.cjs");

function makeControl(value = "") {
  const listeners = new Map();
  const classes = new Set();
  return {
    value, checked: false, textContent: "", children: [], classes,
    addEventListener(type, callback) { listeners.set(type, callback); },
    async fire(type) { await listeners.get(type)?.(); },
    replaceChildren(...children) { this.children = children; },
    closest() {
      return { classList: { toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); } } };
    }
  };
}

async function loadOptions({ settings = {}, failRead = false } = {}) {
  const h = createRuntime({ settings, shared: false });
  const html = readSource("src/options/options.html");
  const controls = Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => [match[1], makeControl()]));
  const radios = [...html.matchAll(/<input\b[^>]*name="promptMode"[^>]*value="([^"]+)"[^>]*>/g)]
    .map((match) => makeControl(match[1]));
  assert.equal(radios.length, 3);
  for (const radio of radios) {
    let checked = false;
    Object.defineProperty(radio, "checked", {
      get: () => checked,
      set(value) {
        if (value) for (const other of radios) if (other !== radio) other.checked = false;
        checked = Boolean(value);
      }
    });
  }
  h.context.document = {
    getElementById(id) { return controls[id] || null; },
    querySelectorAll(selector) {
      assert.equal(selector, "input[name='promptMode']");
      return radios;
    },
    createElement(tag) { assert.equal(tag, "option"); return makeControl(); }
  };
  if (failRead) h.local.get = async () => { throw new Error("fixture read failure"); };
  // Follow the actual HTML script order, without preloading any YGS helpers.
  for (const match of html.matchAll(/<script\b[^>]*src="([^"]+)"/g)) {
    await h.load(path.join("src/options", match[1]));
  }
  return { ...h, controls, radios };
}

test("Options loads in HTML order and renders exactly the configured choices", async () => {
  const h = await loadOptions();
  const y = h.context.YGS;
  for (const [id, choices] of [
    ["outputLanguage", y.OUTPUT_LANGUAGES],
    ["chatgptReasoningEffort", y.CHATGPT_REASONING_EFFORTS],
    ["geminiModel", y.GEMINI_MODELS], ["geminiThinkingLevel", y.GEMINI_THINKING_LEVELS]
  ]) {
    assert.deepEqual(h.controls[id].children.map((option) => ({ value: option.value, label: option.textContent })),
      plain(choices.map(({ value, label }) => ({ value, label }))));
    assert.equal(h.controls[id].value, y.DEFAULT_SETTINGS[id]);
  }
  assert.equal(h.controls.customPrompt.value, "");
  assert.equal(h.controls.autoSubmit.checked, true);
  assert.equal(h.radios.find((radio) => radio.checked).value, "default");
  assert.deepEqual(h.radios.filter((radio) => radio.classes.has("is-selected")).map((radio) => radio.value), ["default"]);
});

test("Options loads saved legacy choices, custom text, and false flags", async () => {
  const h = await loadOptions({ settings: {
    promptMode: "custom", customPrompt: "  saved text  ", outputLanguage: "English",
    chatgptModel: "pro", geminiModel: "fast", geminiThinkingLevel: "extended",
    aggressiveTranscriptPrefetch: false, autoSubmit: false, useTemporaryChat: false
  } });
  assert.equal(h.controls.customPrompt.value, "saved text");
  assert.equal(h.controls.chatgptModelFamily, undefined);
  assert.equal(h.controls.chatgptReasoningEffort.value, "pro");
  assert.equal(h.controls.geminiModel.value, "flash-lite");
  assert.equal(h.controls.geminiThinkingLevel.value, "extended");
  assert.equal(h.controls.outputLanguage.value, "English");
  for (const id of ["aggressiveTranscriptPrefetch", "autoSubmit", "useTemporaryChat"]) {
    assert.equal(h.controls[id].checked, false);
  }
  assert.equal(h.radios.find((radio) => radio.checked).value, "custom");
});

test("Options save normalizes the form, updates selection and clears status on its timer", async () => {
  const h = await loadOptions();
  const c = h.controls;
  c.customPrompt.value = "  new instruction  ";
  c.outputLanguage.value = "English";
  c.chatgptReasoningEffort.value = "extra-high";
  c.geminiModel.value = "pro";
  c.geminiThinkingLevel.value = "extended";
  c.aggressiveTranscriptPrefetch.checked = false;
  c.autoSubmit.checked = false;
  c.useTemporaryChat.checked = false;
  const custom = h.radios.find((radio) => radio.value === "custom");
  custom.checked = true;
  await custom.fire("change");
  assert.deepEqual(h.radios.filter((radio) => radio.classes.has("is-selected")).map((radio) => radio.value), ["custom"]);
  await c.saveButton.fire("click");
  assert.deepEqual(h.local.data, {
    customPrompt: "new instruction", promptMode: "custom", outputLanguage: "English",
    chatgptReasoningEffort: "extra-high", geminiModel: "pro", geminiThinkingLevel: "extended",
    aggressiveTranscriptPrefetch: false, autoSubmit: false, useTemporaryChat: false
  });
  assert.equal(c.customPrompt.value, "new instruction");
  assert.equal(c.status.textContent, "Saved.");
  const timer = [...h.timers.values()].find((entry) => entry.ms === 1500);
  assert.ok(timer);
  timer.callback();
  assert.equal(c.status.textContent, "");
});

test("Options failed load uses defaults and still allows a later save", async () => {
  const h = await loadOptions({ failRead: true });
  const defaults = h.context.YGS.DEFAULT_SETTINGS;
  assert.equal(h.controls.customPrompt.value, "");
  for (const id of ["outputLanguage", "chatgptReasoningEffort", "geminiModel", "geminiThinkingLevel"]) {
    assert.equal(h.controls[id].value, defaults[id]);
  }
  for (const id of ["aggressiveTranscriptPrefetch", "autoSubmit", "useTemporaryChat"]) {
    assert.equal(h.controls[id].checked, defaults[id]);
  }
  assert.equal(h.radios.find((radio) => radio.checked).value, defaults.promptMode);
  await h.controls.saveButton.fire("click");
  assert.equal(h.controls.status.textContent, "Saved.");
});

test("Options saves and reopens effort while preserving the retired model and old effort", async () => {
  const h = await loadOptions({ settings: { chatgptModel: "pro-extended", chatgptModelFamily: "gpt-5.5" } });
  assert.equal(h.controls.chatgptReasoningEffort.value, "pro");
  assert.equal(h.controls.chatgptReasoningEffort.children.filter(option => option.value.startsWith("pro")).length, 1);
  h.controls.chatgptReasoningEffort.value = "none";
  await h.controls.saveButton.fire("click");
  const reopened = await loadOptions({ settings: h.local.data });
  assert.equal(reopened.controls.chatgptModelFamily, undefined);
  assert.equal(reopened.local.data.chatgptModelFamily, "gpt-5.5");
  assert.equal((await reopened.context.YGS.getSettings()).chatgptModelFamily, "latest");
  assert.equal(reopened.controls.chatgptReasoningEffort.value, "none");
  assert.equal(reopened.local.data.chatgptModel, "pro-extended");
});

test("Options failed save preserves stored settings and edited form with an error status", async () => {
  const h = await loadOptions({ settings: { customPrompt: "old instruction" } });
  h.controls.customPrompt.value = "unsaved edit";
  h.local.set = async () => { throw new Error("fixture write failure"); };
  await h.controls.saveButton.fire("click");
  assert.equal(h.local.data.customPrompt, "old instruction");
  assert.equal(h.controls.customPrompt.value, "unsaved edit");
  assert.equal(h.controls.status.textContent, "Save failed. Check extension errors.");
  assert.equal(h.timers.size, 0);
});
