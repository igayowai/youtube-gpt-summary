const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createRuntime, exposeProvider, Button, providerEnvironment } = require("./helpers/runtime.cjs");

// Reduced sketch of the 2026-10-19 composer, not browser evidence. A real send removes the
// send button, shows a "중지" stop button, empties the editor and moves the URL to /c/<id>.
function fixture({ acceptOnClick = 1, clearOnly = false, detached = false } = {}) {
  const h = createRuntime();
  const env = providerEnvironment();
  let text = "prompt text";
  let sent = false;
  let clicks = 0;
  let now = 0;
  const input = new Button();
  input.isConnected = true;
  Object.defineProperty(input, "innerText", { get: () => text });
  input.getAttribute = (name) => ({ contenteditable: "true", role: "textbox" })[name] ?? null;
  const send = new Button();
  send.type = "submit";
  send.disabled = false;
  send.getAttribute = (name) => name === "aria-label" ? "보내기" : null;
  send.click = () => {
    clicks += 1;
    if (clearOnly) {
      text = "";
    } else if (clicks === acceptOnClick) {
      sent = true;
      text = "";
      env.location.pathname = "/c/test";
    }
  };
  const stop = new Button();
  stop.getAttribute = (name) => name === "aria-label" ? "중지" : null;
  env.location.pathname = "/";
  env.HTMLButtonElement = Button;
  // Detached mode mirrors the 2026-10-19 re-render: the editor that received the prompt is
  // detached, and a new editor inside the form (holding the same text) replaced it.
  const live = new Button();
  live.isConnected = true;
  Object.defineProperty(live, "innerText", { get: () => text });
  const form = { querySelectorAll: (selector) => selector.includes("보내기") && !sent ? [send] : [] };
  live.closest = (selector) => selector === "form" ? form : null;
  if (detached) {
    input.isConnected = false;
    const wrapper = { querySelectorAll: () => [] };
    input.closest = (selector) => selector.includes("composer") ? wrapper : null;
  }
  env.document.querySelectorAll = (selector) => {
    if (selector.includes("stop-button")) return sent ? [stop] : [];
    if (detached && selector.includes("data-composer-input")) return [live];
    if (selector.includes("보내기")) return sent || detached ? [] : [send];
    return [];
  };
  env.Date = class extends Date { static now() { return now; } };
  env.setTimeout = (callback, ms) => { now += ms; queueMicrotask(callback); };
  const api = exposeProvider(h, "chatgpt", ["submitPrompt"], env);
  return { api, h, input, clicks: () => clicks };
}

test("a send click that ChatGPT ignores is retried until the send is confirmed", async () => {
  const f = fixture({ acceptOnClick: 2 });
  assert.equal(await f.api.submitPrompt(f.input), true, JSON.stringify(f.h.logs));
  assert.equal(f.clicks(), 2);
});

test("a send that never lands reports failure after the retry window", async () => {
  const f = fixture({ acceptOnClick: 999 });
  assert.equal(await f.api.submitPrompt(f.input), false);
  assert.ok(f.clicks() >= 3 && f.clicks() <= 20, String(f.clicks()));
});

test("a late-accepted click (about 20 seconds in) is still confirmed", async () => {
  const f = fixture({ acceptOnClick: 6 });
  assert.equal(await f.api.submitPrompt(f.input), true, JSON.stringify(f.h.logs));
  assert.equal(f.clicks(), 6);
});

test("an emptied editor without a send signal is not clicked again", async () => {
  const f = fixture({ clearOnly: true });
  assert.equal(await f.api.submitPrompt(f.input), false);
  assert.equal(f.clicks(), 1);
});

test("a re-rendered composer is followed: the send button is found from the live editor", async () => {
  const f = fixture({ detached: true });
  assert.equal(await f.api.submitPrompt(f.input), true, JSON.stringify(f.h.logs));
  assert.equal(f.clicks(), 1);
});
