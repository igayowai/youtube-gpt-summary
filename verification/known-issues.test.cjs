const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createRuntime, exposeProvider, plain, Button, providerEnvironment } = require("./helpers/runtime.cjs");

// These assertions express desired behavior, not acceptance of the existing bugs.
// TODO results must remain visible separately from passing regression tests.
const deferred = { todo: "Deferred from phase 1; see structure-audit-2026-09-10.md" };

test("F1: concurrent enqueue retains both requests", deferred, async () => {
  const h = createRuntime();
  h.load("src/background/service_worker.js");
  await Promise.all(["A", "B"].map((requestId) => h.context.enqueueChatGptPrompt({ requestId, prompt: "fixture" })));
  assert.deepEqual(h.session.data[h.context.YGS.CHATGPT_QUEUE_KEY].map((item) => item.requestId), ["A", "B"]);
});

test("F2: ChatGPT URL request alone does not confirm temporary mode", deferred, () => {
  const h = createRuntime();
  const env = providerEnvironment();
  env.location.search = "?temporary-chat=true";
  const api = exposeProvider(h, "chatgpt", ["getTemporaryChatActiveReason"], env);
  assert.equal(api.getTemporaryChatActiveReason(), "");
});

test("F2: Gemini generic activity text does not confirm temporary mode", deferred, () => {
  const h = createRuntime();
  const api = exposeProvider(h, "gemini", ["getGeminiTemporaryChatActiveReason"],
    providerEnvironment("This setting is listed in Gemini Apps Activity."));
  assert.equal(api.getGeminiTemporaryChatActiveReason(), "");
});

test("F3: blocked queue schedules another recovery check", deferred, async () => {
  const h = createRuntime();
  h.load("src/background/service_worker.js");
  await h.context.setActiveQueueItem({ requestId: "A", createdAt: Date.now() });
  await h.context.enqueueChatGptPrompt({ requestId: "B", prompt: "fixture" });
  h.timers.clear();
  await h.context.processChatGptQueue();
  assert.ok(h.timers.size > 0, "one waiting item has no future recovery check");
});

test("F4: concurrent pending saves retain both index entries", deferred, async () => {
  const y = createRuntime().context.YGS;
  await Promise.all(["A", "B"].map((requestId) => y.savePendingPrompt({ requestId, prompt: "fixture" })));
  assert.deepEqual(plain(await y.getPendingPromptIndex()), ["A", "B"]);
});

test("F4: pending index never exceeds its configured limit", deferred, async () => {
  const y = createRuntime().context.YGS;
  for (let i = 0; i < y.PENDING_PROMPT_MAX_ITEMS + 2; i += 1) {
    await y.savePendingPrompt({ requestId: String(i), prompt: "fixture" });
  }
  assert.ok((await y.getPendingPromptIndex()).length <= y.PENDING_PROMPT_MAX_ITEMS);
});

for (const method of ["pointer", "native"]) {
  test(`F5: Gemini ${method} activation issues only one click`, deferred, () => {
    const h = createRuntime();
    const api = exposeProvider(h, "gemini", ["clickGeminiTemporaryChatControl"], providerEnvironment());
    const button = new Button();
    api.clickGeminiTemporaryChatControl(button, method);
    assert.equal(button.events.filter((type) => type === "click" || type === "native-click").length, 1);
  });
}

test("characterization: Gemini keyboard path includes Enter followed by pointer click", () => {
  const h = createRuntime();
  const api = exposeProvider(h, "gemini", ["clickGeminiTemporaryChatControl"], providerEnvironment());
  const button = new Button();
  api.clickGeminiTemporaryChatControl(button, "keyboard");
  assert.deepEqual(button.events, ["keydown", "keyup", "pointerdown", "mousedown", "pointerup", "mouseup", "click"]);
});

for (const provider of ["chatgpt", "gemini"]) {
  test(`F6: ${provider} rejected insertion reports failure`, deferred, () => {
    const h = createRuntime();
    const api = exposeProvider(h, provider, ["injectPrompt", "inputAdapters"], providerEnvironment());
    api.inputAdapters.unshift({ name: "rejecting fixture", canHandle: () => true, inject() {}, read: () => "" });
    assert.equal(api.injectPrompt(new Button(), "expected fixture prompt"), false);
  });
}
