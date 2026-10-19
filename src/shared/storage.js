globalThis.YGS = globalThis.YGS || {};

globalThis.YGS.getSettings = async function getSettings() {
  const defaults = globalThis.YGS.DEFAULT_SETTINGS;
  const localStorage = getChromeStorageArea("local");
  if (!localStorage) {
    globalThis.YGS.warn("chrome.storage.local is unavailable; using default settings");
    return normalizeSettings(defaults);
  }

  const data = await localStorage.get([...Object.keys(defaults), "chatgptModel"]);
  return normalizeSettings(data);
};

function normalizeSettings(data) {
  const defaults = globalThis.YGS.DEFAULT_SETTINGS;
  return {
    customPrompt: globalThis.YGS.normalizeCustomPrompt(data.customPrompt),
    promptMode: normalizePromptMode(data.promptMode),
    outputLanguage: normalizeOutputLanguage(data.outputLanguage),
    ...normalizeChatGptSelection(data),
    geminiModel: normalizeGeminiModel(data.geminiModel),
    geminiThinkingLevel: normalizeGeminiThinkingLevel(data.geminiThinkingLevel),
    aggressiveTranscriptPrefetch: typeof data.aggressiveTranscriptPrefetch === "boolean"
      ? data.aggressiveTranscriptPrefetch
      : defaults.aggressiveTranscriptPrefetch,
    autoSubmit: typeof data.autoSubmit === "boolean" ? data.autoSubmit : defaults.autoSubmit,
    useTemporaryChat: typeof data.useTemporaryChat === "boolean" ? data.useTemporaryChat : defaults.useTemporaryChat
  };
}

globalThis.YGS.saveSettings = async function saveSettings(settings) {
  const normalized = normalizeSettings(settings ?? {});

  const localStorage = getChromeStorageArea("local");
  if (!localStorage) {
    throw new Error("chrome.storage.local is unavailable");
  }

  // The retired model preference remains untouched for rollback compatibility.
  const { chatgptModelFamily, ...persisted } = normalized;
  await localStorage.set(persisted);
  return normalized;
};

function normalizePromptMode(value) {
  const mode = String(value || "").trim();
  const allowed = Object.values(globalThis.YGS.PROMPT_MODES);
  return allowed.includes(mode) ? mode : globalThis.YGS.DEFAULT_SETTINGS.promptMode;
}

function normalizeOutputLanguage(value) {
  const language = String(value || "").trim();
  return getOutputLanguageValues().includes(language)
    ? language
    : globalThis.YGS.DEFAULT_SETTINGS.outputLanguage;
}

function normalizeChatGptSelection(data) {
  // Keep the legacy field intact on disk; new explicit preferences take precedence.
  const effort = Object.prototype.hasOwnProperty.call(data, "chatgptReasoningEffort")
    ? data.chatgptReasoningEffort : data.chatgptModel;
  return {
    chatgptModelFamily: "latest",
    chatgptReasoningEffort: normalizeChatGptReasoningEffort(effort)
  };
}

function normalizeChatGptReasoningEffort(value) {
  const model = String(value || "").trim().toLowerCase();
  if (model === "thinking") {
    return "high";
  }
  if (["pro", "pro-basic", "pro-extended", "pro_basic", "probasic", "pro_extended", "proextended"].includes(model)) {
    return "pro";
  }
  if (model === "extra_high" || model === "extrahigh") {
    return "extra-high";
  }
  return getChatGptReasoningEffortValues().includes(model)
    ? model
    : globalThis.YGS.DEFAULT_SETTINGS.chatgptReasoningEffort;
}

function normalizeGeminiModel(value) {
  const model = String(value || "").trim().toLowerCase();
  if (model === "fast") {
    return "flash-lite";
  }
  if (model === "thinking") {
    return "flash";
  }
  return getGeminiModelValues().includes(model)
    ? model
    : globalThis.YGS.DEFAULT_SETTINGS.geminiModel;
}

function normalizeGeminiThinkingLevel(value) {
  const level = String(value || "").trim().toLowerCase();
  return getGeminiThinkingLevelValues().includes(level)
    ? level
    : globalThis.YGS.DEFAULT_SETTINGS.geminiThinkingLevel;
}

function getOutputLanguageValues() {
  return globalThis.YGS.OUTPUT_LANGUAGES.map((language) => language.value);
}

function getChatGptReasoningEffortValues() {
  return globalThis.YGS.CHATGPT_REASONING_EFFORTS.map((model) => model.value);
}

function getGeminiModelValues() {
  return globalThis.YGS.GEMINI_MODELS.map((model) => model.value);
}

function getGeminiThinkingLevelValues() {
  return globalThis.YGS.GEMINI_THINKING_LEVELS.map((level) => level.value);
}

globalThis.YGS.createRequestId = function createRequestId() {
  const randomPart = globalThis.crypto && typeof globalThis.crypto.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `ygs-${randomPart}`;
};

globalThis.YGS.makePendingPromptStorageKey = function makePendingPromptStorageKey(requestId) {
  return `${globalThis.YGS.PENDING_PROMPT_KEY_PREFIX}${String(requestId ?? "")}`;
};

globalThis.YGS.getChatGptUrlForRequest = function getChatGptUrlForRequest(requestId, useFallback) {
  const base = useFallback
    ? globalThis.YGS.CHATGPT_FALLBACK_URL
    : globalThis.YGS.CHATGPT_TEMPORARY_CHAT_URL;

  const hash = `ygsRequestId=${encodeURIComponent(requestId)}`;
  return `${base}#${hash}`;
};

globalThis.YGS.getGeminiUrlForRequest = function getGeminiUrlForRequest(requestId) {
  const hash = `ygsRequestId=${encodeURIComponent(requestId)}`;
  return `${globalThis.YGS.GEMINI_URL}#${hash}`;
};

globalThis.YGS.getPendingPromptIndex = async function getPendingPromptIndex() {
  const sessionStorage = getChromeStorageArea("session");
  if (!sessionStorage) {
    return [];
  }

  const data = await sessionStorage.get(globalThis.YGS.PENDING_PROMPT_INDEX_KEY);
  const ids = data[globalThis.YGS.PENDING_PROMPT_INDEX_KEY];
  return Array.isArray(ids) ? ids.filter(Boolean).map(String) : [];
};

globalThis.YGS.setPendingPromptIndex = async function setPendingPromptIndex(ids) {
  const sessionStorage = getChromeStorageArea("session");
  if (!sessionStorage) {
    throw new Error("chrome.storage.session is unavailable");
  }

  await sessionStorage.set({
    [globalThis.YGS.PENDING_PROMPT_INDEX_KEY]: Array.from(new Set(ids.filter(Boolean).map(String)))
  });
};

globalThis.YGS.prunePendingPrompts = async function prunePendingPrompts() {
  const ids = await globalThis.YGS.getPendingPromptIndex();
  const now = Date.now();
  const keep = [];
  const removeKeys = [];

  for (const requestId of ids) {
    const key = globalThis.YGS.makePendingPromptStorageKey(requestId);
    const item = await chrome.storage.session.get(key);
    const payload = item[key];
    const createdAt = Number(payload?.createdAt || 0);
    const expired = !createdAt || now - createdAt > globalThis.YGS.PENDING_PROMPT_TTL_MS;

    if (expired) {
      removeKeys.push(key);
    } else {
      keep.push(requestId);
    }
  }

  while (keep.length > globalThis.YGS.PENDING_PROMPT_MAX_ITEMS) {
    const removedId = keep.shift();
    removeKeys.push(globalThis.YGS.makePendingPromptStorageKey(removedId));
  }

  if (removeKeys.length > 0) {
    const sessionStorage = getChromeStorageArea("session");
    if (sessionStorage) {
      await sessionStorage.remove(removeKeys);
    }
  }

  await globalThis.YGS.setPendingPromptIndex(keep);
  return keep;
};

globalThis.YGS.savePendingPrompt = async function savePendingPrompt(payload) {
  if (!payload || typeof payload.prompt !== "string" || payload.prompt.length === 0) {
    throw new Error("Invalid pending prompt payload");
  }

  const requestId = String(payload.requestId || globalThis.YGS.createRequestId());
  const normalizedPayload = {
    requestId,
    prompt: payload.prompt,
    autoSubmit: payload.autoSubmit === true,
    useTemporaryChat: payload.useTemporaryChat !== false,
    ...normalizeChatGptSelection(payload),
    geminiModel: normalizeGeminiModel(payload.geminiModel),
    geminiThinkingLevel: normalizeGeminiThinkingLevel(payload.geminiThinkingLevel),
    createdAt: Number(payload.createdAt || Date.now()),
    source: payload.source === "youtube" ? "youtube" : "youtube",
    mode: payload.mode === "emptyTranscriptStop" ? "emptyTranscriptStop" : "normal",
    video: payload.video || null
  };

  await globalThis.YGS.prunePendingPrompts();

  const key = globalThis.YGS.makePendingPromptStorageKey(requestId);
  const ids = await globalThis.YGS.getPendingPromptIndex();
  const nextIds = ids.filter((id) => id !== requestId);
  nextIds.push(requestId);

  const sessionStorage = getChromeStorageArea("session");
  if (!sessionStorage) {
    throw new Error("chrome.storage.session is unavailable");
  }

  await sessionStorage.set({
    [key]: normalizedPayload,
    [globalThis.YGS.PENDING_PROMPT_INDEX_KEY]: nextIds
  });

  return normalizedPayload;
};

globalThis.YGS.getPendingPrompt = async function getPendingPrompt(requestId) {
  const key = globalThis.YGS.makePendingPromptStorageKey(requestId);
  const sessionStorage = getChromeStorageArea("session");
  if (!sessionStorage) {
    return null;
  }

  const data = await sessionStorage.get(key);
  const payload = data[key];

  if (!payload || typeof payload.prompt !== "string") {
    return null;
  }

  const createdAt = Number(payload.createdAt || 0);
  if (!createdAt || Date.now() - createdAt > globalThis.YGS.PENDING_PROMPT_TTL_MS) {
    await sessionStorage.remove(key);
    const ids = await globalThis.YGS.getPendingPromptIndex();
    await globalThis.YGS.setPendingPromptIndex(ids.filter((id) => id !== requestId));
    return null;
  }

  return { ...payload, ...normalizeChatGptSelection(payload) };
};

globalThis.YGS.clearPendingPrompt = async function clearPendingPrompt(requestId) {
  const key = globalThis.YGS.makePendingPromptStorageKey(requestId);
  const sessionStorage = getChromeStorageArea("session");
  if (!sessionStorage) {
    return;
  }

  await sessionStorage.remove(key);
  const ids = await globalThis.YGS.getPendingPromptIndex();
  await globalThis.YGS.setPendingPromptIndex(ids.filter((id) => id !== requestId));
};

function getChromeStorageArea(areaName) {
  try {
    const storageArea = globalThis.chrome?.storage?.[areaName];
    if (
      storageArea
      && typeof storageArea.get === "function"
      && typeof storageArea.set === "function"
    ) {
      return storageArea;
    }
  } catch (_) {
    // Fall through to null.
  }

  return null;
}
