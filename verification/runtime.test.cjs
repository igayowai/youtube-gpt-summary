const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createHash } = require("node:crypto");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { root, readSource, plain, createRuntime } = require("./helpers/runtime.cjs");

const defaults = {
  customPrompt: null, promptMode: "default", outputLanguage: "Korean",
  chatgptModelFamily: "latest", chatgptReasoningEffort: "none", geminiModel: "none", geminiThinkingLevel: "none",
  aggressiveTranscriptPrefetch: true, autoSubmit: true, useTemporaryChat: true
};

test("all runtime JavaScript passes node --check", () => {
  const files = fs.readdirSync(path.join(root, "src"), { recursive: true }).filter((file) => file.endsWith(".js"));
  assert.equal(files.length > 0, true);
  for (const file of files) {
    const result = spawnSync(process.execPath, ["--check", path.join(root, "src", file)], { encoding: "utf8" });
    assert.equal(result.status, 0, `${file}: ${result.stderr || result.error || "syntax check failed"}`);
  }
});

test("manifest and Options references resolve; versions and permissions stay consistent", () => {
  const manifest = JSON.parse(readSource("manifest.json"));
  const { YGS } = createRuntime().context;
  assert.equal(manifest.version, YGS.VERSION);
  assert.deepEqual(manifest.permissions, ["storage", "clipboardWrite"]);
  const refs = [manifest.background.service_worker, manifest.options_page, ...Object.values(manifest.icons)];
  for (const group of manifest.content_scripts) {
    refs.push(...group.js);
    assert.equal(group.js[0], "src/shared/constants.js");
    assert.ok(group.js.indexOf("src/shared/logger.js") < group.js.length - 1);
  }
  for (const match of readSource(manifest.options_page).matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/g)) {
    refs.push(path.join(path.dirname(manifest.options_page), match[1]));
  }
  for (const ref of refs) assert.ok(fs.existsSync(path.join(root, ref)), ref);
});

test("effective prompt bytes match the pre-refactor working tree", () => {
  const { YGS } = createRuntime().context;
  const hash = (text) => createHash("sha256").update(text).digest("hex");
  assert.equal(hash(YGS.DEFAULT_SUMMARY_PROMPT), "2846a8adecb06d7c330b9ae3594723c6bfda288de0fc307c6d02f1037644c5df");
  assert.equal(hash(YGS.DEEP_SUMMARY_PROMPT), "b99967efcfe9fd9d4a900b47b8d61973e40001416b4b31c27d163009d367d18b");
});

test("settings read/save defaults, omitted fields, and null inputs", async () => {
  const h = createRuntime();
  const y = h.context.YGS;
  assert.deepEqual(plain(y.DEFAULT_SETTINGS), defaults);
  assert.deepEqual(plain(await y.getSettings()), defaults);
  for (const input of [undefined, null, {}]) {
    assert.deepEqual(plain(await y.saveSettings(input)), defaults);
    const { chatgptModelFamily, ...persistedDefaults } = defaults;
    assert.deepEqual(h.local.data, persistedDefaults);
  }
});

test("legacy effort aliases map compatibly without overwriting the legacy field", async () => {
  const aliases = {
    chatgptModel: {
      thinking: "high", pro: "pro", extra_high: "extra-high", extrahigh: "extra-high",
      "pro-basic": "pro", "pro-extended": "pro", pro_basic: "pro", probasic: "pro", pro_extended: "pro", proextended: "pro"
    },
    geminiModel: { fast: "flash-lite", thinking: "flash" }
  };
  for (const [field, entries] of Object.entries(aliases)) {
    for (const [legacy, expected] of Object.entries(entries)) {
      const input = { [field]: `  ${legacy.toUpperCase()}  ` };
      const h = createRuntime({ settings: input });
      const outputField = field === "chatgptModel" ? "chatgptReasoningEffort" : field;
      assert.equal((await h.context.YGS.getSettings())[outputField], expected);
      assert.equal((await h.context.YGS.saveSettings(input))[outputField], expected);
      if (field === "chatgptModel") assert.equal(h.local.data.chatgptModel, input.chatgptModel);
    }
  }
});

test("every supported settings choice round-trips without adding storage keys", async () => {
  const h = createRuntime();
  const y = h.context.YGS;
  const lists = {
    promptMode: Object.values(y.PROMPT_MODES),
    outputLanguage: y.OUTPUT_LANGUAGES.map((entry) => entry.value),
    chatgptReasoningEffort: y.CHATGPT_REASONING_EFFORTS.map((entry) => entry.value),
    geminiModel: y.GEMINI_MODELS.map((entry) => entry.value),
    geminiThinkingLevel: y.GEMINI_THINKING_LEVELS.map((entry) => entry.value)
  };
  for (const [field, values] of Object.entries(lists)) {
    for (const value of values) {
      const saved = await y.saveSettings({ [field]: value, unrelated: "must not be persisted" });
      assert.equal(saved[field], value);
      assert.equal((await y.getSettings())[field], value);
      assert.deepEqual(Object.keys(h.local.data).sort(), Object.keys(defaults).filter(key => key !== "chatgptModelFamily").sort());
    }
  }
});

test("explicit new effort takes precedence without rewriting legacy or unrelated storage", async () => {
  for (const [chatgptReasoningEffort, expected] of [["none", "none"], ["high", "high"], [null, "none"], ["invalid", "none"]]) {
    const initial = { chatgptModel: "pro-extended", chatgptReasoningEffort, unrelated: "preserved" };
    const h = createRuntime({ settings: initial });
    const settings = await h.context.YGS.getSettings();
    assert.equal(settings.chatgptReasoningEffort, expected);
    assert.deepEqual(h.local.data, initial);
    await h.context.YGS.saveSettings(settings);
    assert.equal(h.local.data.chatgptModel, "pro-extended");
    assert.equal(h.local.data.unrelated, "preserved");
    assert.equal((await h.context.YGS.getSettings()).chatgptReasoningEffort, expected);
  }
});

test("all old model requests become Latest through queue, direct-open and pending retrieval", async () => {
  for (const chatgptModelFamily of ["latest", "gpt-5.6-sol", "gpt-5.5"]) {
    for (const chatgptReasoningEffort of ["none", "instant", "medium", "high", "extra-high", "pro"]) {
      for (const queued of [false, true]) {
        const h = createRuntime();
        h.load("src/background/service_worker.js");
        const payload = { requestId: "fixture", prompt: "dummy fixture", chatgptModelFamily, chatgptReasoningEffort };
        if (queued) {
          assert.equal((await h.context.enqueueChatGptPrompt(payload)).ok, true);
          await h.context.processChatGptQueue();
        } else {
          assert.equal((await h.context.openChatGptWithPrompt(payload)).ok, true);
        }
        assert.equal(h.openedTabs.length, 1);
        const stored = await h.context.YGS.getPendingPrompt("fixture");
        assert.equal(stored.chatgptModelFamily, "latest");
        assert.equal(stored.chatgptReasoningEffort, chatgptReasoningEffort);
        assert.equal(Object.hasOwn(stored, "chatgptModel"), false);
      }
    }
  }
});

test("already pending legacy requests normalize at read time without mutating their original payload", async () => {
  const h = createRuntime();
  const y = h.context.YGS;
  const key = y.makePendingPromptStorageKey("legacy");
  const legacy = { requestId: "legacy", prompt: "dummy", chatgptModelFamily: "gpt-5.5", chatgptModel: "pro-basic", createdAt: Date.now() };
  await h.session.set({ [key]: legacy });
  const read = await y.getPendingPrompt("legacy");
  assert.equal(read.chatgptModelFamily, "latest");
  assert.equal(read.chatgptReasoningEffort, "pro");
  assert.deepEqual(h.session.data[key], legacy);
});

test("invalid values use defaults; explicit false flags and custom text survive", async () => {
  const y = createRuntime().context.YGS;
  assert.deepEqual(plain(await y.saveSettings({
    promptMode: "invalid", outputLanguage: "invalid", chatgptModel: "invalid",
    geminiModel: "invalid", geminiThinkingLevel: "invalid", customPrompt: "   ",
    autoSubmit: "false", useTemporaryChat: 0, aggressiveTranscriptPrefetch: null
  })), defaults);
  const saved = await y.saveSettings({
    customPrompt: "  custom instruction  ", autoSubmit: false,
    useTemporaryChat: false, aggressiveTranscriptPrefetch: false
  });
  assert.deepEqual(plain(saved), {
    ...defaults, customPrompt: "custom instruction", autoSubmit: false,
    useTemporaryChat: false, aggressiveTranscriptPrefetch: false
  });
});

test("missing or failing local storage preserves existing error behavior", async () => {
  const h = createRuntime();
  h.context.chrome.storage.local = null;
  assert.deepEqual(plain(await h.context.YGS.getSettings()), defaults);
  await assert.rejects(h.context.YGS.saveSettings({}), /unavailable/);
  h.context.chrome.storage.local = h.local;
  h.local.get = async () => { throw new Error("read failed"); };
  await assert.rejects(h.context.YGS.getSettings(), /read failed/);
  h.local.set = async () => { throw new Error("write failed"); };
  await assert.rejects(h.context.YGS.saveSettings({}), /write failed/);
});

test("prompt modes, empty-transcript stop, language, and timestamps are preserved", () => {
  const y = createRuntime().context.YGS;
  assert.equal(y.buildFinalPrompt({ transcript: "  " }).mode, "emptyTranscriptStop");
  const input = { title: "Fixture", url: "https://example.test/", transcript: "[00:01] dummy caption" };
  for (const [mode, instruction] of [
    ["default", y.DEFAULT_SUMMARY_PROMPT], ["deep", y.DEEP_SUMMARY_PROMPT], ["custom", "custom fixture"]
  ]) {
    const built = y.buildFinalPrompt({ ...input, promptMode: mode, customPrompt: "custom fixture", outputLanguage: "English" });
    assert.equal(built.mode, "normal");
    assert.ok(built.prompt.startsWith(instruction));
    assert.ok(built.prompt.includes("Respond in English."));
    assert.ok(built.prompt.endsWith(input.transcript));
  }
  assert.equal(y.formatTranscriptEntries([
    { start: 61, text: "a  b" }, { start: 3601, text: "c" }, { start: 0, text: " " }
  ]), "[01:01] a b\n[01:00:01] c");
});

test("request URLs and single pending-prompt save/read/clear/expiry still work", async () => {
  const y = createRuntime().context.YGS;
  const id = "fixture+a & b";
  for (const url of [y.getChatGptUrlForRequest(id, false), y.getGeminiUrlForRequest(id)]) {
    assert.equal(new URLSearchParams(new URL(url).hash.slice(1)).get("ygsRequestId"), id);
  }
  assert.equal(new URL(y.getChatGptUrlForRequest(id, false)).searchParams.get("temporary-chat"), "true");
  assert.equal(new URL(y.getChatGptUrlForRequest(id, true)).search, "");
  await y.savePendingPrompt({ requestId: id, prompt: "dummy fixture", autoSubmit: false });
  assert.equal((await y.getPendingPrompt(id)).autoSubmit, false);
  await y.clearPendingPrompt(id);
  assert.equal(await y.getPendingPrompt(id), null);
  await y.savePendingPrompt({ requestId: id, prompt: "dummy fixture", createdAt: Date.now() - y.PENDING_PROMPT_TTL_MS - 10 });
  assert.equal(await y.getPendingPrompt(id), null);
  assert.deepEqual(plain(await y.getPendingPromptIndex()), []);
});
