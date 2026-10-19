const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createRuntime, exposeProvider, Button, providerEnvironment } = require("./helpers/runtime.cjs");

const families = ["latest", "gpt-5.6-sol", "gpt-5.5"];
const efforts = ["instant", "medium", "high", "extra-high", "pro"];
const familyLabels = ["Latest", "GPT-5.6 Sol", "GPT-5.5"];
const effortLabels = ["Instant", "Medium", "High", "Extra High", "Pro"];

// Reduced current-menu fixture, not browser evidence. Actual selector/interaction helpers run in the VM.
function fixture(options = {}) {
  const h = createRuntime();
  const env = providerEnvironment();
  let model = options.model || "gpt-5.5";
  let value = options.value ?? 2;
  let opened = options.opened === true;
  let pointerOpensAt = null;
  let advanced = options.advanced === true;
  let opens = 0;
  let openedAt = 0;
  let now = 0;
  const actions = [];
  const pickerEvents = [];
  const element = () => {
    const el = new Button();
    el.getAttribute = () => null;
    return el;
  };
  const label = () => {
    const prefix = model === "latest" ? (value === 4 ? "6" : "") : (model === "gpt-5.6-sol" ? "5.6 " : "5.5 ");
    return prefix + effortLabels[value];
  };
  const text = (el, getter) => Object.defineProperties(el, {
    innerText: { get: getter }, textContent: { get: getter }
  });
  const button = element();
  button.id = "fixture-picker";
  text(button, label);
  button.matches = (selector) => selector.includes("__composer-pill");
  button.closest = (selector) => selector.includes("unified-composer") ? {} : null;
  button.dispatchEvent = (event) => {
    const shortcut = event.code === "KeyM" && event.key === "M" && event.ctrlKey && event.shiftKey
      && !event.altKey && !event.metaKey && event.keyCode === 77 && event.which === 77;
    if (event.type === "click") pickerEvents.push("pointer");
    if (shortcut) pickerEvents.push(event.type);
    if (event.type === "click" && options.pickerDelay) {
      pointerOpensAt = now + options.pickerDelay;
      return true;
    }
    if ((event.type === "click" && !options.blockPickerPointer)
      || (event.type === "keydown" && shortcut && !options.blockShortcut)) {
      opened = !opened;
      if (opened) {
        openedAt = now;
        if (!options.modern) advanced = false;
        opens += 1;
        if (options.finalDrift && opens === 2) model = "gpt-5.5";
      }
    }
    return true;
  };
  const toggle = element();
  toggle.closest = () => options.modern && advanced ? {} : null;
  text(toggle, label);
  toggle.dispatchEvent = (event) => {
    if (event.type === "click" && !options.blockToggle) {
      actions.push(["view", advanced ? "simple" : "advanced"]);
      advanced = !advanced;
    }
    return true;
  };
  const rows = families.map((family, index) => {
    const row = element();
    row.textContent = familyLabels[index] + (family === "gpt-5.5" ? (options.retirementNotice || "") : "");
    row.getAttribute = (name) => ({
      "aria-checked": String(model === family), "aria-disabled": String(options.disabled === family)
    })[name] ?? null;
    row.closest = (selector) => selector === "[inert]" && !advanced ? {} : null;
    row.dispatchEvent = (event) => {
      if (event.type === "click" || (event.type === "keydown" && event.key === "Enter")) {
        actions.push(["model", family, event.type]);
        if (!options.blockModel && (!options.pointerMiss || event.type !== "click")) {
          model = family;
          if (options.modern) advanced = false;
          if (options.closeOnModel) opened = false;
        }
      }
      return true;
    };
    return row;
  });
  const advancedPanel = element();
  advancedPanel.closest = () => advanced ? null : {};
  advancedPanel.querySelectorAll = (selector) => {
    let matches = rows.filter((row, index) => families[index] !== options.missing);
    if (selector.includes("aria-checked")) matches = matches.filter(row => row.getAttribute("aria-checked") === "true");
    if (options.duplicate && !selector.includes("aria-checked")) matches.push(rows[families.indexOf(options.duplicate)]);
    return matches;
  };
  const control = element();
  control.closest = () => advanced ? {} : null;
  control.dispatchEvent = (event) => {
    if (event.type === "keydown") {
      actions.push(["effort", event.key]);
      if (!options.blockSlider) value += event.key === "ArrowRight" ? 1 : -1;
    }
    return true;
  };
  const slider = {
    closest: () => control,
    getAttribute: (name) => ({ "aria-valuemin": "0", "aria-valuemax": "4", "aria-valuenow": String(value) })[name] ?? null
  };
  const simplePanel = element();
  simplePanel.getBoundingClientRect = () => ({ left: 0, top: 0, width: 260, height: now - openedAt < (options.panelDelay || 0) ? 0 : 44 });
  simplePanel.closest = () => advanced ? {} : null;
  simplePanel.querySelector = (selector) => {
    if (options.modern && !selector.includes("data-model-picker-power-slider")) return null;
    return now - openedAt < (options.sliderDelay || 0) ? null : slider;
  };
  const modernRoot = element();
  modernRoot.getAttribute = name => name === "data-model-picker-view" ? (advanced ? "advanced" : "simple") : null;
  modernRoot.querySelectorAll = selector => advancedPanel.querySelectorAll(selector);
  const menu = element();
  menu.getAttribute = (name) => name === "aria-labelledby" ? (options.foreignMenu ? "other-picker" : button.id) : null;
  menu.querySelector = (selector) => {
    if (options.modern) {
      if (selector.includes("data-testid") || selector.includes("aria-expanded")) return null;
      if (selector === "[data-model-picker-view]") return modernRoot;
      if (selector.includes("data-model-picker-view='simple'")) return advanced || options.inactive ? null : simplePanel;
      if (selector.includes("data-model-picker-view='advanced'")) return advanced && !options.inactive ? advancedPanel : null;
      if (selector.includes("data-model-picker-view-toggle")) return toggle;
    }
    if (selector.includes("advanced-view")) return selector.includes("data-active") && !advanced ? null : advancedPanel;
    if (selector.includes("simple-view")) return advanced ? null : simplePanel;
    if (selector.includes("aria-expanded")) return toggle;
    if (selector.includes("aria-checked")) return rows.find(row => row.getAttribute("aria-checked") === "true");
    return null;
  };
  env.document.querySelectorAll = (selector) => {
    if (pointerOpensAt !== null && now >= pointerOpensAt) {
      opened = true;
      openedAt = now;
      pointerOpensAt = null;
    }
    if (selector.startsWith("[role='menu']")) return opened ? [menu] : [];
    return selector.includes("button") ? [button] : [];
  };
  env.document.dispatchEvent = (event) => { if (event.key === "Escape") opened = false; };
  const Event = class { constructor(type, init) { this.type = type; Object.assign(this, init); } };
  Object.assign(env, { KeyboardEvent: Event, PointerEvent: Event, MouseEvent: Event });
  env.Date = class extends Date { static now() { return now; } };
  env.setTimeout = (callback, ms) => { now += ms; queueMicrotask(callback); };
  const api = exposeProvider(h, "chatgpt", ["selectChatGptPreferences", "openChatGptPicker"], env);
  return { api, h, actions, pickerEvents, current: () => ({ model, value, opened }) };
}

test("picker keeps the pointer path and never toggles an already-open menu", async () => {
  for (const opened of [false, true]) {
    const f = fixture({ opened });
    assert.ok(await f.api.openChatGptPicker(null));
    assert.deepEqual(f.pickerEvents, opened ? [] : ["pointer"]);
    assert.equal(f.current().opened, true);
  }
});

test("September 25 semantic anchors select Latest and every effort without legacy test IDs", async () => {
  for (const model of families) {
    for (const [value, effort] of efforts.entries()) {
      const f = fixture({ modern: true, model, value: (value + 2) % 5 });
      assert.equal(await f.api.selectChatGptPreferences(model, effort, null), true, JSON.stringify(f.h.logs));
      assert.deepEqual(f.current(), { model: "latest", value, opened: false });
    }
  }
});

test("modern advanced start returns through Latest; inactive panels and missing Latest fail closed", async () => {
  const f = fixture({ modern: true, advanced: true, value: 3 });
  assert.equal(await f.api.selectChatGptPreferences("latest", "none", null), true);
  assert.deepEqual(f.current(), { model: "latest", value: 3, opened: false });
  for (const options of [{ inactive: true }, { advanced: true, missing: "latest" }, { advanced: true, disabled: "latest" }]) {
    const blocked = fixture({ modern: true, ...options });
    assert.equal(await blocked.api.selectChatGptPreferences("latest", "pro", null), false);
    assert.equal(blocked.actions.some(action => action[0] === "effort"), false);
  }
});

test("picker tries exactly one Ctrl+Shift+M combination after a missed pointer", async () => {
  const f = fixture({ blockPickerPointer: true });
  assert.ok(await f.api.openChatGptPicker(null));
  assert.deepEqual(f.pickerEvents, ["pointer", "keydown", "keyup"]);
  assert.equal(f.current().opened, true);
});

test("late pointer completion at the deadline suppresses the shortcut", async () => {
  const f = fixture({ pickerDelay: 1800 });
  assert.ok(await f.api.openChatGptPicker(null));
  assert.deepEqual(f.pickerEvents, ["pointer"]);
  assert.equal(f.current().opened, true);
});

test("blocked shortcut or unrelated menu cannot pass selection or change effort", async () => {
  for (const extra of [{ blockShortcut: true }, { foreignMenu: true }]) {
    const f = fixture({ blockPickerPointer: true, ...extra });
    assert.equal(await f.api.selectChatGptPreferences("latest", "pro", null), false);
    assert.deepEqual(f.pickerEvents, ["pointer", "keydown", "keyup"]);
    assert.deepEqual(f.actions, []);
    assert.equal(f.current().opened, false);
  }
});

test("shortcut-opened picker still verifies final model and effort", async () => {
  const f = fixture({ blockPickerPointer: true });
  assert.equal(await f.api.selectChatGptPreferences("latest", "pro", null), true);
  assert.deepEqual(f.current(), { model: "latest", value: 4, opened: false });
  assert.deepEqual(f.pickerEvents, ["pointer", "keydown", "keyup", "pointer", "keydown", "keyup"]);
});

test("all old requested families select Latest before all five efforts", async () => {
  for (const model of families) {
    for (const [value, effort] of efforts.entries()) {
      const f = fixture({ model: "gpt-5.5", retirementNotice: "10월 14일 지원 종료", value: (value + 2) % 5 });
      assert.equal(await f.api.selectChatGptPreferences(model, effort, null), true, JSON.stringify(f.h.logs));
      assert.deepEqual(f.current(), { model: "latest", value, opened: false });
      assert.equal(f.actions.find(action => action[0] !== "view")[0], "model");
      assert.equal(f.actions.filter(action => action[0] === "model").length, 1);
    }
  }
});

test("Latest is actively selected while No selection preserves every initial effort", async () => {
  for (let value = 0; value < 5; value += 1) {
    const f = fixture({ value });
    assert.equal(await f.api.selectChatGptPreferences("latest", "none", null), true);
    assert.deepEqual(f.current(), { model: "latest", value, opened: false });
    assert.equal(f.actions.some(action => action[0] === "effort"), false);
  }
  const unchanged = fixture({ model: "latest" });
  assert.equal(await unchanged.api.selectChatGptPreferences("latest", "none", null), true);
  assert.deepEqual(unchanged.actions, []);
});

test("model activation confirms pointer or Enter and tolerates menu dismissal", async () => {
  for (const pointerMiss of [false, true]) {
    for (const closeOnModel of [false, true]) {
      const f = fixture({ pointerMiss, closeOnModel });
      assert.equal(await f.api.selectChatGptPreferences("gpt-5.6-sol", "pro", null), true);
      assert.deepEqual(f.current(), { model: "latest", value: 4, opened: false });
      assert.equal(f.actions.filter(action => action[0] === "model").length, pointerMiss ? 2 : 1);
    }
  }
});

test("missing, disabled, duplicate, blocked model and blocked view fail before effort changes", async () => {
  for (const options of [
    { missing: "latest" }, { disabled: "latest" }, { duplicate: "latest" },
    { blockModel: true }, { blockToggle: true }
  ]) {
    const f = fixture(options);
    assert.equal(await f.api.selectChatGptPreferences("gpt-5.6-sol", "pro", null), false);
    assert.equal(f.current().opened, false);
    assert.equal(f.actions.some(action => action[0] === "effort"), false);
    assert.ok(f.actions.filter(action => action[0] === "model").length <= 2);
  }
});

test("opening animations and late slider rendering settle without toggling the active view", async () => {
  for (const options of [{ panelDelay: 160 }, { sliderDelay: 240 }, { panelDelay: 160, sliderDelay: 320 }]) {
    const f = fixture({ ...options, model: "latest" });
    assert.equal(await f.api.selectChatGptPreferences("latest", "extra-high", null), true);
    assert.deepEqual(f.current(), { model: "latest", value: 3, opened: false });
    assert.equal(f.actions.some(action => action[0] === "view"), false);
  }
});

test("blocked slider, final model drift and invalid preferences fail closed", async () => {
  for (const options of [{ blockSlider: true }, { finalDrift: true }]) {
    const f = fixture(options);
    assert.equal(await f.api.selectChatGptPreferences("latest", "pro", null), false);
    assert.equal(f.current().opened, false);
  }
  for (const [model, effort] of [["latest", "pro-extended"], ["latest", "unknown"]]) {
    const f = fixture();
    assert.equal(await f.api.selectChatGptPreferences(model, effort, null), false);
    assert.deepEqual(f.actions, []);
  }
});
