importScripts(
  "../shared/constants.js",
  "../shared/logger.js",
  "../shared/storage.js"
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then((response) => sendResponse(response))
    .catch((error) => {
      globalThis.YGS.warn("Background message handler failed", error);
      sendResponse({
        ok: false,
        error: String(error?.message || error || "Unknown background error")
      });
    });

  return true;
});

let queueStartTimer = null;
let queueProcessing = false;

async function handleMessage(message, sender) {
  switch (message?.type) {
    case globalThis.YGS.MESSAGE_TYPES.OPEN_CHATGPT_WITH_PROMPT:
      return openChatGptWithPrompt(addSourceTabPlacement(message.payload, sender));

    case globalThis.YGS.MESSAGE_TYPES.OPEN_GEMINI_WITH_PROMPT:
      return openGeminiWithPrompt(addSourceTabPlacement(message.payload, sender));

    case globalThis.YGS.MESSAGE_TYPES.ENQUEUE_CHATGPT_PROMPT:
      return enqueueChatGptPrompt(addSourceTabPlacement(message.payload, sender));

    case globalThis.YGS.MESSAGE_TYPES.GET_PENDING_PROMPT:
      return getPendingPrompt(message.requestId);

    case globalThis.YGS.MESSAGE_TYPES.CLEAR_PENDING_PROMPT:
      return clearPendingPrompt(message.requestId);

    case globalThis.YGS.MESSAGE_TYPES.CHATGPT_PROMPT_DONE:
      return completeActiveQueueItem(message.payload);

    default:
      return {
        ok: false,
        error: "Unknown message type"
      };
  }
}

async function enqueueChatGptPrompt(payload) {
  if (!payload || typeof payload.prompt !== "string" || payload.prompt.length === 0) {
    return {
      ok: false,
      error: "Missing prompt payload"
    };
  }

  const requestId = String(payload.requestId || globalThis.YGS.createRequestId());
  const normalizedPayload = {
    ...payload,
    requestId,
    createdAt: Number(payload.createdAt || Date.now())
  };

  const queue = await getChatGptQueue();
  const nextQueue = queue.filter((item) => item?.requestId !== requestId);
  nextQueue.push(normalizedPayload);

  while (nextQueue.length > globalThis.YGS.CHATGPT_QUEUE_MAX_ITEMS) {
    nextQueue.shift();
  }

  await setChatGptQueue(nextQueue);
  globalThis.YGS.log("Queued ChatGPT prompt", {
    requestId,
    queueLength: nextQueue.length
  });

  const active = await getActiveQueueItem();
  if (!active || isStaleActiveQueueItem(active)) {
    scheduleQueueProcessing(0);
  } else {
    scheduleQueueProcessing(globalThis.YGS.CHATGPT_QUEUE_START_DELAY_MS);
  }

  return {
    ok: true,
    queued: true,
    requestId,
    queueLength: nextQueue.length,
    activeRequestId: active?.requestId || null
  };
}

function scheduleQueueProcessing(delayMs) {
  if (queueStartTimer) {
    clearTimeout(queueStartTimer);
  }

  queueStartTimer = setTimeout(() => {
    queueStartTimer = null;
    processChatGptQueue().catch((error) => {
      globalThis.YGS.warn("ChatGPT queue processing failed", error);
    });
  }, Math.max(0, Number(delayMs || 0)));
}

async function processChatGptQueue() {
  if (queueProcessing) {
    return;
  }

  queueProcessing = true;
  try {
    const active = await getActiveQueueItem();
    if (active && !isStaleActiveQueueItem(active)) {
      return;
    }

    if (active && isStaleActiveQueueItem(active)) {
      globalThis.YGS.warn("Clearing stale ChatGPT queue active item", {
        requestId: active.requestId
      });
      await setActiveQueueItem(null);
    }

    const queue = await getChatGptQueue();
    const next = queue.shift();
    await setChatGptQueue(queue);

    if (!next) {
      return;
    }

    const requestId = String(next.requestId || globalThis.YGS.createRequestId());
    const payload = {
      ...next,
      requestId,
      createdAt: Number(next.createdAt || Date.now())
    };

    await setActiveQueueItem({
      requestId,
      createdAt: Date.now(),
      sourceVideoTitle: payload.video?.title || ""
    });

    const response = await openChatGptWithPrompt(payload);
    if (!response.ok) {
      await setActiveQueueItem(null);
      if (queue.length > 0) {
        scheduleQueueProcessing(1000);
      }
      return;
    }

    await setActiveQueueItem({
      requestId,
      tabId: response.tabId || null,
      createdAt: Date.now(),
      sourceVideoTitle: payload.video?.title || ""
    });

    globalThis.YGS.log("Started ChatGPT queue item", {
      requestId,
      remaining: queue.length,
      tabId: response.tabId || null
    });
  } finally {
    queueProcessing = false;
  }
}

async function completeActiveQueueItem(payload) {
  const requestId = String(payload?.requestId || "");
  const active = await getActiveQueueItem();

  if (!active || !requestId || active.requestId !== requestId) {
    globalThis.YGS.log("Ignoring ChatGPT queue completion for non-active request", {
      requestId,
      activeRequestId: active?.requestId || null
    });
    return {
      ok: true,
      ignored: true
    };
  }

  await setActiveQueueItem(null);
  globalThis.YGS.log("Completed ChatGPT queue item", {
    requestId,
    status: payload?.status || "unknown"
  });

  scheduleQueueProcessing(1200);
  const queue = await getChatGptQueue();
  return {
    ok: true,
    completed: true,
    requestId,
    queueLength: queue.length
  };
}

async function openChatGptWithPrompt(payload) {
  if (!payload || typeof payload.prompt !== "string" || payload.prompt.length === 0) {
    return {
      ok: false,
      error: "Missing prompt payload"
    };
  }

  const requestId = String(payload.requestId || globalThis.YGS.createRequestId());
  const normalizedPayload = {
    ...payload,
    requestId,
    createdAt: Number(payload.createdAt || Date.now())
  };

  let stored = false;
  try {
    await globalThis.YGS.savePendingPrompt(normalizedPayload);
    stored = true;
  } catch (error) {
    globalThis.YGS.warn("Failed to save pending prompt; ChatGPT will still be opened for manual paste", error);
  }

  const useTemporaryChat = normalizedPayload.useTemporaryChat !== false;
  const url = globalThis.YGS.getChatGptUrlForRequest(requestId, !useTemporaryChat);

  try {
    const tab = await createAdjacentOrFallbackTab(url, normalizedPayload);
    return {
      ok: true,
      stored,
      requestId,
      tabId: tab?.id || null
    };
  } catch (error) {
    globalThis.YGS.warn("Failed to open ChatGPT tab", error);
    return {
      ok: false,
      stored,
      requestId,
      error: String(error?.message || error || "Failed to open ChatGPT tab")
    };
  }
}

async function openGeminiWithPrompt(payload) {
  if (!payload || typeof payload.prompt !== "string" || payload.prompt.length === 0) {
    return {
      ok: false,
      error: "Missing prompt payload"
    };
  }

  const requestId = String(payload.requestId || globalThis.YGS.createRequestId());
  const normalizedPayload = {
    ...payload,
    requestId,
    useTemporaryChat: false,
    chatgptModelFamily: "latest",
    chatgptReasoningEffort: "none",
    geminiModel: payload.geminiModel || "none",
    geminiThinkingLevel: payload.geminiThinkingLevel || "none",
    createdAt: Number(payload.createdAt || Date.now())
  };

  let stored = false;
  try {
    await globalThis.YGS.savePendingPrompt(normalizedPayload);
    stored = true;
  } catch (error) {
    globalThis.YGS.warn("Failed to save pending prompt; Gemini will still be opened for manual paste", error);
  }

  const url = globalThis.YGS.getGeminiUrlForRequest(requestId);

  try {
    const tab = await createAdjacentOrFallbackTab(url, normalizedPayload);
    return {
      ok: true,
      stored,
      requestId,
      tabId: tab?.id || null
    };
  } catch (error) {
    globalThis.YGS.warn("Failed to open Gemini tab", error);
    return {
      ok: false,
      stored,
      requestId,
      error: String(error?.message || error || "Failed to open Gemini tab")
    };
  }
}

async function getChatGptQueue() {
  const sessionStorage = getSessionStorage();
  if (!sessionStorage) {
    return [];
  }

  const data = await sessionStorage.get(globalThis.YGS.CHATGPT_QUEUE_KEY);
  const queue = data[globalThis.YGS.CHATGPT_QUEUE_KEY];
  return Array.isArray(queue) ? queue.filter((item) => item && typeof item.prompt === "string") : [];
}

async function setChatGptQueue(queue) {
  const sessionStorage = getSessionStorage();
  if (!sessionStorage) {
    throw new Error("chrome.storage.session is unavailable");
  }

  await sessionStorage.set({
    [globalThis.YGS.CHATGPT_QUEUE_KEY]: Array.isArray(queue) ? queue : []
  });
}

async function getActiveQueueItem() {
  const sessionStorage = getSessionStorage();
  if (!sessionStorage) {
    return null;
  }

  const data = await sessionStorage.get(globalThis.YGS.CHATGPT_QUEUE_ACTIVE_KEY);
  const active = data[globalThis.YGS.CHATGPT_QUEUE_ACTIVE_KEY];
  return active && typeof active === "object" ? active : null;
}

async function setActiveQueueItem(active) {
  const sessionStorage = getSessionStorage();
  if (!sessionStorage) {
    throw new Error("chrome.storage.session is unavailable");
  }

  if (!active) {
    await sessionStorage.remove(globalThis.YGS.CHATGPT_QUEUE_ACTIVE_KEY);
    return;
  }

  await sessionStorage.set({
    [globalThis.YGS.CHATGPT_QUEUE_ACTIVE_KEY]: active
  });
}

function isStaleActiveQueueItem(active) {
  const createdAt = Number(active?.createdAt || 0);
  return !createdAt || Date.now() - createdAt > globalThis.YGS.CHATGPT_QUEUE_ACTIVE_STALE_MS;
}

function getSessionStorage() {
  try {
    const sessionStorage = chrome?.storage?.session;
    if (
      sessionStorage
      && typeof sessionStorage.get === "function"
      && typeof sessionStorage.set === "function"
      && typeof sessionStorage.remove === "function"
    ) {
      return sessionStorage;
    }
  } catch (_) {
    // Fall through to null.
  }

  return null;
}

function addSourceTabPlacement(payload, sender) {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const tab = sender?.tab;
  if (!tab || typeof tab.id !== "number") {
    return payload;
  }

  return {
    ...payload,
    sourceTab: {
      id: tab.id,
      windowId: typeof tab.windowId === "number" ? tab.windowId : null,
      index: typeof tab.index === "number" ? tab.index : null
    }
  };
}

async function getAdjacentTabCreateProperties(url, payload) {
  const properties = {
    url,
    active: true
  };

  const sourceTab = payload?.sourceTab;
  if (!sourceTab || typeof sourceTab !== "object") {
    return properties;
  }

  const liveSourceTab = await getLiveSourceTab(sourceTab.id);
  const placementTab = liveSourceTab || sourceTab;

  if (typeof placementTab.windowId === "number") {
    properties.windowId = placementTab.windowId;
  }

  if (typeof placementTab.index === "number") {
    properties.index = placementTab.index + 1;
  }

  if (liveSourceTab && typeof liveSourceTab.id === "number") {
    properties.openerTabId = liveSourceTab.id;
  }

  return properties;
}

async function createAdjacentOrFallbackTab(url, payload) {
  const properties = await getAdjacentTabCreateProperties(url, payload);

  try {
    return await chrome.tabs.create(properties);
  } catch (error) {
    globalThis.YGS.warn("Failed to open adjacent tab; retrying default tab placement", error);
    return chrome.tabs.create({ url, active: true });
  }
}

async function getLiveSourceTab(tabId) {
  if (typeof tabId !== "number") {
    return null;
  }

  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab || typeof tab.id !== "number") {
      return null;
    }

    return {
      id: tab.id,
      windowId: typeof tab.windowId === "number" ? tab.windowId : null,
      index: typeof tab.index === "number" ? tab.index : null
    };
  } catch (_) {
    return null;
  }
}

async function getPendingPrompt(requestId) {
  if (!requestId) {
    return {
      ok: false,
      payload: null,
      error: "Missing requestId"
    };
  }

  const payload = await globalThis.YGS.getPendingPrompt(String(requestId));
  return {
    ok: true,
    payload
  };
}

async function clearPendingPrompt(requestId) {
  if (!requestId) {
    return {
      ok: false,
      error: "Missing requestId"
    };
  }

  await globalThis.YGS.clearPendingPrompt(String(requestId));
  return {
    ok: true
  };
}
