globalThis.YGS = globalThis.YGS || {};

(() => {
  const ROOT_ID = globalThis.YGS.UI.youtubeButtonRootId;
  const BUTTON_ID = globalThis.YGS.UI.youtubeButtonId;
  const GEMINI_BUTTON_ID = globalThis.YGS.UI.youtubeGeminiButtonId;

  let lastUrl = location.href;
  let routeTimer = null;
  let prefetchTimer = null;
  let transcriptUiWarmupTimer = null;
  let routeEpoch = 0;

  const transcriptMemoryCache = new Map();
  const transcriptPrefetchPromises = new Map();

  function isWatchPage() {
    const url = new URL(location.href);
    return url.hostname === "www.youtube.com" && url.pathname === "/watch" && url.searchParams.has("v");
  }

  function getVideoIdFromUrl(urlValue) {
    try {
      const url = new URL(urlValue || location.href);
      if (url.pathname === "/watch") {
        return url.searchParams.get("v") || "";
      }
      return "";
    } catch (_) {
      return "";
    }
  }

  function getVideoTitle() {
    const candidates = [
      "h1.ytd-watch-metadata yt-formatted-string",
      "h1.title yt-formatted-string",
      "h1",
      "meta[name='title']",
      "meta[property='og:title']"
    ];

    for (const selector of candidates) {
      const element = document.querySelector(selector);
      if (!element) {
        continue;
      }

      if (element.tagName === "META") {
        const content = element.getAttribute("content");
        if (content && content.trim()) {
          return content.trim();
        }
      }

      const text = element.textContent;
      if (text && text.trim()) {
        return text.trim();
      }
    }

    return document.title.replace(/\s*-\s*YouTube\s*$/i, "").trim();
  }

  function ensureButtonStyles() {
    if (document.getElementById("ygs-gpt-summary-style")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "ygs-gpt-summary-style";
    style.textContent = `
#${ROOT_ID} {
  position: fixed;
  right: max(16px, env(safe-area-inset-right));
  bottom: max(16px, env(safe-area-inset-bottom));
  z-index: 2147483647;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  max-width: min(440px, calc(100vw - 32px));
  pointer-events: auto;
}
#${ROOT_ID} .ygs-summary-button {
  appearance: none;
  border: 0;
  border-radius: 18px;
  padding: 10px 16px;
  font: 500 14px/1.2 Roboto, Arial, sans-serif;
  background: #0f0f0f;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.24);
  white-space: nowrap;
  transition: background-color 160ms ease, color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}
#${ROOT_ID} .ygs-summary-button:hover {
  transform: translateY(-1px);
}
#${BUTTON_ID}:hover {
  background: #272727;
}
#${GEMINI_BUTTON_ID} {
  background: #1a73e8;
  color: #ffffff;
}
#${GEMINI_BUTTON_ID}:hover {
  background: #1558b0;
}
#${ROOT_ID} .ygs-summary-button.ygs-transcript-ready {
  background: #b9f6ca;
  color: #10391f;
  box-shadow: inset 0 0 0 1px rgba(16, 57, 31, 0.16);
}
#${ROOT_ID} .ygs-summary-button.ygs-transcript-ready:hover {
  background: #9df1b3;
}
#${ROOT_ID} .ygs-summary-button:disabled {
  cursor: wait;
  opacity: 0.7;
  transform: none;
}
@media (prefers-color-scheme: light) {
  #${BUTTON_ID} {
    background: #0f0f0f;
    color: #ffffff;
  }
}
@media (max-width: 520px) {
  #${ROOT_ID} {
    left: 12px;
    right: 12px;
    bottom: max(12px, env(safe-area-inset-bottom));
  }
  #${ROOT_ID} .ygs-summary-button {
    flex: 1 1 0;
    min-width: 0;
    padding-inline: 12px;
  }
}
    `.trim();

    document.documentElement.appendChild(style);
  }

  function removeButton() {
    const existing = document.getElementById(ROOT_ID);
    if (existing) {
      existing.remove();
    }
  }

  function findButtonContainer() {
    const selectors = [
      "#secondary-inner",
      "#secondary",
      "ytd-watch-metadata #top-row",
      "#below",
      "ytd-watch-flexy"
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
    }

    return document.body;
  }

  function insertYoutubeButton() {
    if (!isWatchPage()) {
      removeButton();
      return;
    }

    scheduleTranscriptPrefetch("watch-page-ready");
    scheduleTranscriptUiWarmup("watch-page-ready");

    if (document.getElementById(ROOT_ID)) {
      updateTranscriptReadyButton(getVideoIdFromUrl(location.href));
      return;
    }

    ensureButtonStyles();

    const root = document.createElement("div");
    root.id = ROOT_ID;

    const button = createSummaryButton({
      id: BUTTON_ID,
      target: "chatgpt",
      text: "Summarize with GPT",
      ariaLabel: "Summarize with GPT"
    });
    const geminiButton = createSummaryButton({
      id: GEMINI_BUTTON_ID,
      target: "gemini",
      text: "Summarize with Gemini",
      ariaLabel: "Summarize with Gemini"
    });

    root.appendChild(button);
    root.appendChild(geminiButton);

    document.body.appendChild(root);
    updateTranscriptReadyButton(getVideoIdFromUrl(location.href));
  }

  function createSummaryButton({ id, target, text, ariaLabel }) {
    const button = document.createElement("button");
    button.id = id;
    button.type = "button";
    button.className = "ygs-summary-button";
    button.dataset.ygsTarget = target;
    button.textContent = text;
    button.setAttribute("aria-label", ariaLabel);
    button.addEventListener("click", handleButtonClick);
    return button;
  }

  async function handleButtonClick(event) {
    const button = event.currentTarget;
    if (button.disabled) {
      return;
    }

    const target = button instanceof HTMLElement && button.dataset.ygsTarget === "gemini"
      ? "gemini"
      : "chatgpt";
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Preparing transcript...";

    try {
      const video = {
        videoId: getVideoIdFromUrl(location.href),
        title: getVideoTitle(),
        url: location.href
      };

      const entries = await getTranscriptEntriesForClick(video.videoId);
      const transcript = globalThis.YGS.formatTranscriptEntries(entries);

      if (globalThis.YGS.isEmptyTranscript(transcript)) {
        globalThis.YGS.warn("Transcript unavailable for this video; not opening AI tab", {
          videoId: video.videoId,
          entryCount: Array.isArray(entries) ? entries.length : 0
        });
        button.textContent = "Transcript unavailable";
        await sleep(1600);
        return;
      }

      const settings = await globalThis.YGS.getSettings();
      const built = globalThis.YGS.buildFinalPrompt({
        title: video.title,
        url: video.url,
        transcript,
        customPrompt: settings.customPrompt,
        promptMode: settings.promptMode,
        outputLanguage: settings.outputLanguage
      });

      await copyToClipboardSilently(built.prompt);

      if (target === "gemini") {
        button.textContent = "Opening Gemini...";
        await openGeminiWithPrompt({
          prompt: built.prompt,
          autoSubmit: settings.autoSubmit === true,
          geminiModel: settings.geminiModel,
          geminiThinkingLevel: settings.geminiThinkingLevel,
          createdAt: Date.now(),
          source: "youtube",
          mode: built.mode,
          video
        });
      } else {
        button.textContent = "Queued for ChatGPT...";
        await enqueueChatGptPrompt({
          prompt: built.prompt,
          autoSubmit: settings.autoSubmit === true,
          useTemporaryChat: settings.useTemporaryChat !== false,
          chatgptModelFamily: settings.chatgptModelFamily,
          chatgptReasoningEffort: settings.chatgptReasoningEffort,
          createdAt: Date.now(),
          source: "youtube",
          mode: built.mode,
          video
        });
      }
    } catch (error) {
      globalThis.YGS.warn("YouTube button flow failed", error);
    } finally {
      button.disabled = false;
      button.textContent = originalText;
      updateTranscriptReadyButton(getVideoIdFromUrl(location.href));
    }
  }

  async function enqueueChatGptPrompt(partialPayload) {
    const requestId = globalThis.YGS.createRequestId();
    const payload = {
      requestId,
      ...partialPayload
    };

    globalThis.YGS.log("Using ChatGPT selection settings", {
      model: payload.chatgptModelFamily,
      effort: payload.chatgptReasoningEffort
    });

    try {
      const response = await chrome.runtime.sendMessage({
        type: globalThis.YGS.MESSAGE_TYPES.ENQUEUE_CHATGPT_PROMPT,
        payload
      });

      if (!response || response.ok !== true) {
        globalThis.YGS.warn("Background did not confirm ChatGPT queue", response);
        openChatGptWindowFallback(requestId, payload.useTemporaryChat);
      } else {
        globalThis.YGS.log("ChatGPT prompt queued", {
          requestId,
          queueLength: response.queueLength,
          activeRequestId: response.activeRequestId || null
        });
      }
    } catch (error) {
      globalThis.YGS.warn("Failed to ask background to queue ChatGPT prompt", error);
      openChatGptWindowFallback(requestId, payload.useTemporaryChat);
    }
  }

  async function openGeminiWithPrompt(partialPayload) {
    const requestId = globalThis.YGS.createRequestId();
    const payload = {
      requestId,
      ...partialPayload
    };

    if (payload.geminiModel && payload.geminiModel !== "none") {
      globalThis.YGS.log("Using Gemini model setting", {
        geminiModel: payload.geminiModel
      });
    }

    if (payload.geminiThinkingLevel && payload.geminiThinkingLevel !== "none") {
      globalThis.YGS.log("Using Gemini thinking level setting", {
        geminiThinkingLevel: payload.geminiThinkingLevel
      });
    }

    try {
      const response = await chrome.runtime.sendMessage({
        type: globalThis.YGS.MESSAGE_TYPES.OPEN_GEMINI_WITH_PROMPT,
        payload
      });

      if (!response || response.ok !== true) {
        globalThis.YGS.warn("Background did not confirm Gemini open", response);
        openGeminiWindowFallback(requestId);
      } else {
        globalThis.YGS.log("Gemini prompt opened", {
          requestId,
          tabId: response.tabId || null
        });
      }
    } catch (error) {
      globalThis.YGS.warn("Failed to ask background to open Gemini prompt", error);
      openGeminiWindowFallback(requestId);
    }
  }

  function openGeminiWindowFallback(requestId) {
    try {
      const url = globalThis.YGS.getGeminiUrlForRequest(requestId);
      globalThis.open(url, "_blank", "noopener");
    } catch (error) {
      globalThis.YGS.warn("Gemini window.open fallback failed", error);
    }
  }

  async function copyToClipboardSilently(text) {
    try {
      await navigator.clipboard.writeText(text);
      globalThis.YGS.log("Prompt copied to clipboard");
      return;
    } catch (error) {
      globalThis.YGS.log("navigator.clipboard.writeText failed; trying execCommand fallback", error);
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      globalThis.YGS.log("Prompt copied with execCommand fallback");
    } catch (error) {
      globalThis.YGS.warn("Clipboard fallback failed", error);
    }
  }

  function openChatGptWindowFallback(requestId, useTemporaryChat) {
    try {
      const url = globalThis.YGS.getChatGptUrlForRequest(requestId, useTemporaryChat === false);
      globalThis.open(url, "_blank", "noopener");
    } catch (error) {
      globalThis.YGS.warn("window.open fallback failed", error);
    }
  }

  async function getTranscriptEntriesForClick(videoId) {
    const cached = getCachedTranscriptEntries(videoId);
    if (cached.length > 0) {
      globalThis.YGS.log("Using prefetched transcript cache", {
        videoId,
        count: cached.length
      });
      return cached;
    }

    const pendingPrefetch = transcriptPrefetchPromises.get(String(videoId || ""));
    if (pendingPrefetch) {
      const prefetched = await waitForPrefetchResult(
        pendingPrefetch,
        globalThis.YGS.TRANSCRIPT_PREFETCH_CLICK_WAIT_MS
      );

      if (prefetched.length > 0) {
        globalThis.YGS.log("Using in-flight prefetch result", {
          videoId,
          count: prefetched.length
        });
        return prefetched;
      }
    }

    const entries = await extractTranscriptEntries({
      allowDomFallback: true,
      reason: "button-click",
      videoId
    });

    if (entries.length > 0) {
      cacheTranscriptEntries(videoId, entries, "button-click");
    }

    return entries;
  }

  function scheduleTranscriptPrefetch(reason) {
    clearTimeout(prefetchTimer);
    const scheduledEpoch = routeEpoch;
    prefetchTimer = setTimeout(() => {
      const videoId = getVideoIdFromUrl(location.href);
      beginTranscriptPrefetch(videoId, reason, scheduledEpoch).catch((error) => {
        globalThis.YGS.warn("Transcript prefetch failed", error);
      });
    }, 300);
  }

  function scheduleTranscriptUiWarmup(reason) {
    clearTimeout(transcriptUiWarmupTimer);
    const scheduledEpoch = routeEpoch;
    transcriptUiWarmupTimer = setTimeout(() => {
      const videoId = getVideoIdFromUrl(location.href);
      warmUpTranscriptDomFallback(videoId, reason, scheduledEpoch).catch((error) => {
        globalThis.YGS.warn("Transcript UI warmup failed", error);
      });
    }, 350);
  }

  async function warmUpTranscriptDomFallback(videoId, reason, epoch = routeEpoch) {
    const normalizedVideoId = String(videoId || "");
    if (!normalizedVideoId || !isWatchPage() || isStaleTranscriptJob(normalizedVideoId, epoch)) {
      return;
    }

    const settings = await getSettingsForTranscriptPrefetch();
    if (settings.aggressiveTranscriptPrefetch !== true) {
      return;
    }

    const cached = getCachedTranscriptEntriesWithoutButtonUpdate(normalizedVideoId);
    if (cached.length > 0 || countTranscriptDomCandidates() > 0) {
      return;
    }

    globalThis.YGS.log("Starting transcript UI warmup", {
      videoId: normalizedVideoId,
      reason
    });

    const expanded = await waitForAndExpandDescriptionForTranscriptButton(2200, {
      videoId: normalizedVideoId,
      routeEpoch: epoch
    });

    if (isStaleTranscriptJob(normalizedVideoId, epoch)) {
      return;
    }

    const button = findShowTranscriptButton() || await waitForShowTranscriptButton(expanded ? 1000 : 500, {
      videoId: normalizedVideoId,
      routeEpoch: epoch
    });

    if (!button || isStaleTranscriptJob(normalizedVideoId, epoch)) {
      return;
    }

    try {
      clickElementLikeUser(button);
      globalThis.YGS.log("Clicked YouTube Show transcript button during UI warmup");
    } catch (error) {
      globalThis.YGS.warn("Failed to click Show transcript button during UI warmup", error);
    }
  }

  async function beginTranscriptPrefetch(videoId, reason, epoch = routeEpoch) {
    const normalizedVideoId = String(videoId || "");
    if (!normalizedVideoId || !isWatchPage() || isStaleTranscriptJob(normalizedVideoId, epoch)) {
      return [];
    }

    const cached = getCachedTranscriptEntries(normalizedVideoId);
    if (cached.length > 0) {
      return cached;
    }

    if (transcriptPrefetchPromises.has(normalizedVideoId)) {
      return transcriptPrefetchPromises.get(normalizedVideoId);
    }

    const settings = await getSettingsForTranscriptPrefetch();
    const allowDomFallback = settings.aggressiveTranscriptPrefetch === true;
    const prefetchType = allowDomFallback ? "aggressive" : "quiet";

    const promise = (async () => {
      if (isStaleTranscriptJob(normalizedVideoId, epoch)) {
        return [];
      }

      globalThis.YGS.log(`Starting ${prefetchType} transcript prefetch`, {
        videoId: normalizedVideoId,
        reason,
        allowDomFallback
      });

      const entries = await extractTranscriptEntries({
        allowDomFallback,
        reason: `prefetch:${reason || "route"}`,
        videoId: normalizedVideoId,
        routeEpoch: epoch
      });

      if (isStaleTranscriptJob(normalizedVideoId, epoch)) {
        globalThis.YGS.log("Discarding stale transcript prefetch result", {
          videoId: normalizedVideoId,
          reason
        });
        return [];
      }

      if (entries.length > 0) {
        cacheTranscriptEntries(normalizedVideoId, entries, `prefetch:${reason || "route"}`);
      } else {
        globalThis.YGS.log(`${prefetchType} transcript prefetch found no transcript`, {
          videoId: normalizedVideoId,
          allowDomFallback
        });
      }

      return entries;
    })().finally(() => {
      transcriptPrefetchPromises.delete(normalizedVideoId);
    });

    transcriptPrefetchPromises.set(normalizedVideoId, promise);
    return promise;
  }

  async function getSettingsForTranscriptPrefetch() {
    try {
      return await globalThis.YGS.getSettings();
    } catch (error) {
      globalThis.YGS.warn("Failed to load settings for transcript prefetch; using defaults", error);
      return globalThis.YGS.DEFAULT_SETTINGS;
    }
  }

  async function waitForPrefetchResult(promise, timeoutMs) {
    if (!promise) {
      return [];
    }

    const timeout = new Promise((resolve) => {
      setTimeout(() => resolve([]), Math.max(0, Number(timeoutMs || 0)));
    });

    try {
      const result = await Promise.race([promise, timeout]);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      globalThis.YGS.warn("In-flight transcript prefetch failed before click use", error);
      return [];
    }
  }

  function getCachedTranscriptEntries(videoId) {
    const normalizedVideoId = String(videoId || "");
    if (!normalizedVideoId) {
      return [];
    }

    const cached = transcriptMemoryCache.get(normalizedVideoId);
    if (!cached || !Array.isArray(cached.entries)) {
      return [];
    }

    const age = Date.now() - Number(cached.createdAt || 0);
    if (age < 0 || age > globalThis.YGS.TRANSCRIPT_MEMORY_CACHE_TTL_MS) {
      transcriptMemoryCache.delete(normalizedVideoId);
      updateTranscriptReadyButton(normalizedVideoId);
      return [];
    }

    return cached.entries;
  }

  function cacheTranscriptEntries(videoId, entries, source) {
    const normalizedVideoId = String(videoId || "");
    if (!normalizedVideoId || !Array.isArray(entries) || entries.length === 0) {
      return;
    }

    transcriptMemoryCache.set(normalizedVideoId, {
      entries,
      createdAt: Date.now(),
      source: source || "unknown"
    });

    while (transcriptMemoryCache.size > globalThis.YGS.TRANSCRIPT_MEMORY_CACHE_MAX_ITEMS) {
      const oldestKey = transcriptMemoryCache.keys().next().value;
      transcriptMemoryCache.delete(oldestKey);
    }

    globalThis.YGS.log("Transcript cached in current YouTube tab memory", {
      videoId: normalizedVideoId,
      count: entries.length,
      source
    });
    updateTranscriptReadyButton(normalizedVideoId);
  }

  function updateTranscriptReadyButton(videoId) {
    const buttons = getSummaryButtons();
    if (buttons.length === 0) {
      return;
    }

    const normalizedVideoId = String(videoId || "");
    const currentVideoId = getVideoIdFromUrl(location.href);
    const ready = Boolean(
      normalizedVideoId
      && currentVideoId
      && normalizedVideoId === currentVideoId
      && getCachedTranscriptEntriesWithoutButtonUpdate(normalizedVideoId).length > 0
    );

    for (const button of buttons) {
      button.classList.toggle("ygs-transcript-ready", ready);
      const baseLabel = button.dataset.ygsTarget === "gemini"
        ? "Summarize with Gemini"
        : "Summarize with GPT";
      if (ready) {
        button.title = "Transcript ready";
        button.setAttribute("aria-label", `${baseLabel}. Transcript ready.`);
      } else {
        button.title = "";
        button.setAttribute("aria-label", baseLabel);
      }
    }
  }

  function getSummaryButtons() {
    return [BUTTON_ID, GEMINI_BUTTON_ID]
      .map((id) => document.getElementById(id))
      .filter((button) => button instanceof HTMLButtonElement);
  }

  function isStaleTranscriptJob(videoId, epoch) {
    const numericEpoch = Number(epoch);
    if (Number.isFinite(numericEpoch) && numericEpoch !== routeEpoch) {
      return true;
    }

    const normalizedVideoId = String(videoId || "");
    if (!normalizedVideoId) {
      return false;
    }

    const currentVideoId = getVideoIdFromUrl(location.href);
    return Boolean(currentVideoId && normalizedVideoId !== currentVideoId);
  }

  function getCachedTranscriptEntriesWithoutButtonUpdate(videoId) {
    const normalizedVideoId = String(videoId || "");
    if (!normalizedVideoId) {
      return [];
    }

    const cached = transcriptMemoryCache.get(normalizedVideoId);
    if (!cached || !Array.isArray(cached.entries)) {
      return [];
    }

    const age = Date.now() - Number(cached.createdAt || 0);
    if (age < 0 || age > globalThis.YGS.TRANSCRIPT_MEMORY_CACHE_TTL_MS) {
      transcriptMemoryCache.delete(normalizedVideoId);
      return [];
    }

    return cached.entries;
  }

  async function extractTranscriptEntries(options = {}) {
    const allowDomFallback = options.allowDomFallback !== false;
    const videoId = String(options.videoId || getVideoIdFromUrl(location.href) || "");
    const extractors = [
      ["captionTracks", () => extractCaptionTrackTranscriptEntries(videoId)],
      ["innertubePlayerCaptionTracks", () => extractInnertubePlayerCaptionTranscriptEntries(videoId)],
      ["innertubeTranscript", () => extractInnertubeTranscriptEntries(videoId)]
    ];

    if (allowDomFallback) {
      extractors.push(
        ["visibleTranscriptPanel", () => collectTranscriptPanelEntriesFromDom(options)],
        ["autoOpenedTranscriptPanel", () => openTranscriptPanelAndExtract(options)]
      );
    }

    for (const [name, extractor] of extractors) {
      if (isStaleTranscriptJob(videoId, options.routeEpoch)) {
        globalThis.YGS.log("Stopping stale transcript extraction", {
          videoId,
          reason: options.reason || "unknown",
          extractor: name
        });
        return [];
      }

      try {
        const entries = await extractor();
        if (isStaleTranscriptJob(videoId, options.routeEpoch)) {
          globalThis.YGS.log("Ignoring stale transcript extractor result", {
            videoId,
            reason: options.reason || "unknown",
            extractor: name
          });
          return [];
        }

        if (Array.isArray(entries) && entries.length > 0) {
          globalThis.YGS.log(`Transcript extraction succeeded via ${name}`, {
            count: entries.length,
            reason: options.reason || "unknown"
          });
          return entries;
        }
      } catch (error) {
        globalThis.YGS.warn(`Transcript extractor failed: ${name}`, error);
      }
    }

    const logNoEntries = allowDomFallback ? globalThis.YGS.warn : globalThis.YGS.log;
    logNoEntries("No transcript entries found after selected extractors", {
      allowDomFallback,
      reason: options.reason || "unknown"
    });
    return [];
  }

  async function extractCaptionTrackTranscriptEntries(videoId) {
    const playerResponse = await findPlayerResponse(videoId);
    const tracks = getCaptionTracks(playerResponse);
    const selectedTrack = chooseCaptionTrack(tracks);
    if (!selectedTrack || !selectedTrack.baseUrl) {
      globalThis.YGS.log("No caption track found in player response");
      return [];
    }

    return fetchTranscriptEntries(selectedTrack.baseUrl);
  }

  async function extractInnertubePlayerCaptionTranscriptEntries(videoId) {
    const normalizedVideoId = String(videoId || getVideoIdFromUrl(location.href) || "");
    if (!normalizedVideoId) {
      return [];
    }

    const pageText = getInlineScriptsText();
    let html = "";
    let ytcfg = extractYtcfgFromText(pageText);
    let apiKey = ytcfg?.INNERTUBE_API_KEY || extractInnertubeApiKey(pageText);

    if (!apiKey) {
      html = await fetchCurrentPageHtml(normalizedVideoId);
      ytcfg = extractYtcfgFromText(`${pageText}
${html}`);
      apiKey = ytcfg?.INNERTUBE_API_KEY || extractInnertubeApiKey(`${pageText}
${html}`);
    }

    if (!apiKey) {
      globalThis.YGS.warn("Innertube player API key not found");
      return [];
    }

    const url = `https://www.youtube.com/youtubei/v1/player?key=${encodeURIComponent(apiKey)}`;
    const body = {
      context: buildInnertubeContext(ytcfg),
      videoId: normalizedVideoId,
      contentCheckOk: true,
      racyCheckOk: true
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        globalThis.YGS.warn("Innertube player transcript request failed", response.status);
        return [];
      }

      const data = await response.json();
      const tracks = getCaptionTracks(data);
      const selectedTrack = chooseCaptionTrack(tracks);
      if (!selectedTrack?.baseUrl) {
        globalThis.YGS.log("Innertube player response did not include caption tracks");
        return [];
      }

      return fetchTranscriptEntries(selectedTrack.baseUrl);
    } catch (error) {
      globalThis.YGS.warn("Innertube player transcript fetch/parse failed", error);
      return [];
    }
  }

  async function findPlayerResponse(videoId) {
    const pageText = getInlineScriptsText();
    const fromCurrentDocument = extractPlayerResponseFromText(pageText, videoId);
    if (fromCurrentDocument) {
      return fromCurrentDocument;
    }

    const html = await fetchCurrentPageHtml(videoId);
    return extractPlayerResponseFromText(html, videoId);
  }

  async function fetchCurrentPageHtml(videoId) {
    try {
      const response = await fetch(makeWatchUrl(videoId), { credentials: "include" });
      if (!response.ok) {
        globalThis.YGS.warn("Failed to fetch current YouTube HTML", response.status);
        return "";
      }
      return response.text();
    } catch (error) {
      globalThis.YGS.warn("Failed to fetch current YouTube HTML", error);
      return "";
    }
  }

  function makeWatchUrl(videoId) {
    const normalizedVideoId = String(videoId || "").trim();
    if (!normalizedVideoId) {
      return location.href;
    }

    const url = new URL("https://www.youtube.com/watch");
    url.searchParams.set("v", normalizedVideoId);
    return url.toString();
  }

  function getInlineScriptsText() {
    return Array.from(document.querySelectorAll("script"))
      .map((script) => script.textContent || "")
      .join("\n");
  }

  function extractPlayerResponseFromText(text, videoId) {
    if (!text || typeof text !== "string") {
      return null;
    }

    const markers = [
      "var ytInitialPlayerResponse",
      "ytInitialPlayerResponse =",
      "window[\"ytInitialPlayerResponse\"]",
      "ytInitialPlayerResponse"
    ];

    let compatibleFallback = null;

    for (const marker of markers) {
      let searchFrom = 0;
      while (searchFrom < text.length) {
        const markerIndex = text.indexOf(marker, searchFrom);
        if (markerIndex === -1) {
          break;
        }

        const jsonText = extractBalancedJsonObject(text, markerIndex);
        if (jsonText) {
          try {
            const parsed = JSON.parse(jsonText);
            if (getCaptionTracks(parsed).length > 0) {
              if (playerResponseMatchesVideo(parsed, videoId)) {
                return parsed;
              }

              if (!compatibleFallback) {
                compatibleFallback = parsed;
              }
            }
          } catch (_) {
            // Try the next marker occurrence.
          }
        }

        searchFrom = markerIndex + marker.length;
      }
    }

    return compatibleFallback && !videoId ? compatibleFallback : null;
  }

  function playerResponseMatchesVideo(playerResponse, videoId) {
    const expectedVideoId = String(videoId || "").trim();
    if (!expectedVideoId) {
      return true;
    }

    const responseVideoId = String(playerResponse?.videoDetails?.videoId || "").trim();
    return !responseVideoId || responseVideoId === expectedVideoId;
  }

  function extractInitialDataFromText(text) {
    return extractJsonObjectAfterMarkers(text, [
      "var ytInitialData",
      "ytInitialData =",
      "window[\"ytInitialData\"]",
      "ytInitialData"
    ]);
  }

  function extractJsonObjectAfterMarkers(text, markers) {
    if (!text || typeof text !== "string") {
      return null;
    }

    for (const marker of markers) {
      let searchFrom = 0;
      while (searchFrom < text.length) {
        const markerIndex = text.indexOf(marker, searchFrom);
        if (markerIndex === -1) {
          break;
        }

        const jsonText = extractBalancedJsonObject(text, markerIndex);
        if (jsonText) {
          try {
            return JSON.parse(jsonText);
          } catch (_) {
            // Try the next marker occurrence.
          }
        }

        searchFrom = markerIndex + marker.length;
      }
    }

    return null;
  }

  function extractBalancedJsonObject(text, startIndex) {
    const objectStart = text.indexOf("{", startIndex);
    if (objectStart === -1) {
      return "";
    }

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = objectStart; index < text.length; index += 1) {
      const char = text[index];

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === "\"") {
          inString = false;
        }
        continue;
      }

      if (char === "\"") {
        inString = true;
      } else if (char === "{") {
        depth += 1;
      } else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          return text.slice(objectStart, index + 1);
        }
      }
    }

    return "";
  }

  function extractYtcfgFromText(text) {
    if (!text || typeof text !== "string") {
      return null;
    }

    let searchFrom = 0;
    let mergedConfig = null;

    while (searchFrom < text.length) {
      const markerIndex = text.indexOf("ytcfg.set", searchFrom);
      if (markerIndex === -1) {
        break;
      }

      const jsonText = extractBalancedJsonObject(text, markerIndex);
      if (jsonText) {
        try {
          const parsed = JSON.parse(jsonText);
          if (parsed && typeof parsed === "object") {
            mergedConfig = {
              ...(mergedConfig || {}),
              ...parsed
            };
          }
        } catch (_) {
          // Try next ytcfg.set call.
        }
      }

      searchFrom = markerIndex + "ytcfg.set".length;
    }

    const apiKeyMatch = text.match(/"INNERTUBE_API_KEY"\s*:\s*"([^"]+)"/);
    const clientVersionMatch = text.match(/"INNERTUBE_CLIENT_VERSION"\s*:\s*"([^"]+)"/);
    if (apiKeyMatch || clientVersionMatch) {
      mergedConfig = {
        ...(mergedConfig || {}),
        INNERTUBE_API_KEY: mergedConfig?.INNERTUBE_API_KEY || (apiKeyMatch ? apiKeyMatch[1] : ""),
        INNERTUBE_CLIENT_VERSION: mergedConfig?.INNERTUBE_CLIENT_VERSION || (clientVersionMatch ? clientVersionMatch[1] : "")
      };
    }

    return mergedConfig;
  }

  function getCaptionTracks(playerResponse) {
    return playerResponse
      ?.captions
      ?.playerCaptionsTracklistRenderer
      ?.captionTracks || [];
  }

  function chooseCaptionTrack(tracks) {
    if (!Array.isArray(tracks) || tracks.length === 0) {
      return null;
    }

    const normalizedTracks = tracks.filter((track) => track && track.baseUrl);
    if (normalizedTracks.length === 0) {
      return null;
    }

    for (const language of globalThis.YGS.TRANSCRIPT_LANGUAGE_PRIORITY) {
      const exact = normalizedTracks.find((track) => normalizeLanguageCode(track.languageCode) === language);
      if (exact) {
        return exact;
      }

      const prefix = normalizedTracks.find((track) => normalizeLanguageCode(track.languageCode).startsWith(`${language}-`));
      if (prefix) {
        return prefix;
      }
    }

    return normalizedTracks[0];
  }

  function normalizeLanguageCode(languageCode) {
    return String(languageCode || "").trim().toLowerCase().replace("_", "-");
  }

  async function fetchTranscriptEntries(baseUrl) {
    const jsonUrl = withQueryParam(baseUrl, "fmt", "json3");

    try {
      const jsonResponse = await fetch(jsonUrl, { credentials: "include" });
      if (jsonResponse.ok) {
        const jsonText = await jsonResponse.text();
        if (jsonText.trim()) {
          const data = JSON.parse(jsonText);
          const entries = parseJson3Transcript(data);
          if (entries.length > 0) {
            return entries;
          }
        } else {
          globalThis.YGS.log("json3 transcript response was empty; trying XML fallback");
        }
      } else {
        globalThis.YGS.warn("json3 transcript request failed", jsonResponse.status);
      }
    } catch (error) {
      globalThis.YGS.warn("json3 transcript fetch/parse failed", error);
    }

    try {
      const xmlResponse = await fetch(baseUrl, { credentials: "include" });
      if (!xmlResponse.ok) {
        globalThis.YGS.warn("XML transcript request failed", xmlResponse.status);
        return [];
      }
      const xmlText = await xmlResponse.text();
      return parseXmlTranscript(xmlText);
    } catch (error) {
      globalThis.YGS.warn("XML transcript fetch/parse failed", error);
      return [];
    }
  }

  function withQueryParam(urlValue, key, value) {
    try {
      const url = new URL(urlValue);
      url.searchParams.set(key, value);
      return url.toString();
    } catch (_) {
      const separator = urlValue.includes("?") ? "&" : "?";
      return `${urlValue}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }
  }

  function parseJson3Transcript(data) {
    const events = Array.isArray(data?.events) ? data.events : [];
    const entries = [];

    for (const event of events) {
      const segments = Array.isArray(event.segs) ? event.segs : [];
      const text = segments
        .map((segment) => segment?.utf8 || "")
        .join("")
        .replace(/\s+/g, " ")
        .trim();

      if (!text) {
        continue;
      }

      entries.push({
        start: Number(event.tStartMs || 0) / 1000,
        duration: Number(event.dDurationMs || 0) / 1000,
        text
      });
    }

    return normalizeTranscriptEntries(entries);
  }

  function parseXmlTranscript(xmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, "text/xml");
    const entries = [];

    for (const node of Array.from(doc.querySelectorAll("text"))) {
      const text = normalizeWhitespace(node.textContent || "");
      if (!text) {
        continue;
      }

      entries.push({
        start: Number(node.getAttribute("start") || 0),
        duration: Number(node.getAttribute("dur") || 0),
        text
      });
    }

    if (entries.length > 0) {
      return normalizeTranscriptEntries(entries);
    }

    for (const node of Array.from(doc.querySelectorAll("p[t]"))) {
      const text = normalizeWhitespace(node.textContent || "");
      if (!text) {
        continue;
      }

      entries.push({
        start: Number(node.getAttribute("t") || 0) / 1000,
        duration: Number(node.getAttribute("d") || 0) / 1000,
        text
      });
    }

    return normalizeTranscriptEntries(entries);
  }

  async function extractInnertubeTranscriptEntries(videoId) {
    const pageText = getInlineScriptsText();
    const html = await fetchCurrentPageHtml(videoId);
    const combinedText = `${html}
${pageText}`;
    const initialData = extractInitialDataFromText(html) || extractInitialDataFromText(pageText);
    const ytcfg = extractYtcfgFromText(combinedText);

    const endpoint = findGetTranscriptEndpoint(initialData);
    const apiKey = ytcfg?.INNERTUBE_API_KEY || extractInnertubeApiKey(combinedText);
    if (!endpoint?.params || !apiKey) {
      globalThis.YGS.log("Innertube transcript endpoint or API key not found");
      return [];
    }

    const body = {
      context: buildInnertubeContext(ytcfg),
      params: endpoint.params
    };

    const url = `https://www.youtube.com/youtubei/v1/get_transcript?key=${encodeURIComponent(apiKey)}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        globalThis.YGS.log("Innertube transcript request failed", response.status);
        return [];
      }

      const data = await response.json();
      return parseInnertubeTranscriptEntries(data);
    } catch (error) {
      globalThis.YGS.warn("Innertube transcript fetch/parse failed", error);
      return [];
    }
  }

  function extractInnertubeApiKey(text) {
    const match = String(text || "").match(/"INNERTUBE_API_KEY"\s*:\s*"([^"]+)"/);
    return match ? match[1] : "";
  }

  function buildInnertubeContext(ytcfg) {
    if (ytcfg?.INNERTUBE_CONTEXT && typeof ytcfg.INNERTUBE_CONTEXT === "object") {
      return ytcfg.INNERTUBE_CONTEXT;
    }

    return {
      client: {
        clientName: "WEB",
        clientVersion: ytcfg?.INNERTUBE_CLIENT_VERSION || "2.20240101.00.00",
        hl: ytcfg?.HL || "ko",
        gl: ytcfg?.GL || "KR"
      }
    };
  }

  function findGetTranscriptEndpoint(root) {
    const wrappers = findObjectsContainingKey(root, "getTranscriptEndpoint", 50);
    for (const wrapper of wrappers) {
      const endpoint = wrapper?.getTranscriptEndpoint;
      if (endpoint && typeof endpoint.params === "string" && endpoint.params.trim()) {
        return endpoint;
      }
    }

    return null;
  }

  function findObjectsContainingKey(root, key, maxResults) {
    const results = [];
    const seen = new WeakSet();

    function walk(value, depth) {
      if (results.length >= maxResults || depth > 80 || !value || typeof value !== "object") {
        return;
      }

      if (shouldSkipObjectWalk(value)) {
        return;
      }

      if (seen.has(value)) {
        return;
      }
      seen.add(value);

      if (Object.prototype.hasOwnProperty.call(value, key)) {
        results.push(value);
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          walk(item, depth + 1);
        }
        return;
      }

      for (const child of Object.values(value)) {
        walk(child, depth + 1);
      }
    }

    walk(root, 0);
    return results;
  }

  function shouldSkipObjectWalk(value) {
    return (typeof Node !== "undefined" && value instanceof Node)
      || (typeof Window !== "undefined" && value instanceof Window)
      || (typeof Document !== "undefined" && value instanceof Document);
  }

  function parseInnertubeTranscriptEntries(data) {
    const wrappers = findObjectsContainingKey(data, "transcriptSegmentRenderer", 10000);
    const entries = [];

    for (const wrapper of wrappers) {
      const renderer = wrapper?.transcriptSegmentRenderer;
      if (!renderer || typeof renderer !== "object") {
        continue;
      }

      const text = normalizeWhitespace(
        getTextFromTextRenderer(renderer.snippet)
        || getTextFromTextRenderer(renderer.title)
        || getTextFromTextRenderer(renderer.line)
      );

      if (!text) {
        continue;
      }

      const startMs = parseFiniteNumber(renderer.startMs ?? renderer.startTimeMs);
      const endMs = parseFiniteNumber(renderer.endMs);
      const durationMs = parseFiniteNumber(renderer.durationMs);
      const fallbackStart = parseTimestampToSeconds(getTextFromTextRenderer(renderer.startTimeText));
      const start = Number.isFinite(startMs) ? startMs / 1000 : fallbackStart;
      const duration = Number.isFinite(endMs) && Number.isFinite(startMs)
        ? Math.max(0, (endMs - startMs) / 1000)
        : (Number.isFinite(durationMs) ? durationMs / 1000 : 0);

      entries.push({
        start: Number.isFinite(start) ? start : 0,
        duration,
        text
      });
    }

    return normalizeTranscriptEntries(entries);
  }

  function getTextFromTextRenderer(value) {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value.simpleText === "string") {
      return value.simpleText;
    }

    if (Array.isArray(value.runs)) {
      return value.runs.map((run) => getTextFromTextRenderer(run)).join("");
    }

    if (typeof value.text === "string") {
      return value.text;
    }

    return "";
  }

  async function openTranscriptPanelAndExtract(options = {}) {
    if (isStaleTranscriptJob(options.videoId, options.routeEpoch)) {
      return [];
    }

    const existing = await collectTranscriptPanelEntriesFromDom(options);
    if (existing.length > 0) {
      return existing;
    }

    let button = findShowTranscriptButton() || await waitForShowTranscriptButton(700, options);
    if (isStaleTranscriptJob(options.videoId, options.routeEpoch)) {
      return [];
    }

    if (!button) {
      const expanded = await waitForAndExpandDescriptionForTranscriptButton(3000, options);
      if (expanded) {
        button = await waitForShowTranscriptButton(1800, options);
      }
    }

    if (isStaleTranscriptJob(options.videoId, options.routeEpoch)) {
      return [];
    }

    if (!button) {
      globalThis.YGS.warn("Show transcript button not found for DOM fallback after description expansion");
      return [];
    }

    try {
      clickElementLikeUser(button);
      globalThis.YGS.log("Clicked YouTube Show transcript button for DOM fallback");
    } catch (error) {
      globalThis.YGS.warn("Failed to click Show transcript button", error);
      return [];
    }

    return waitForTranscriptPanelEntries(6000, options);
  }

  async function waitForAndExpandDescriptionForTranscriptButton(timeoutMs, options = {}) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      if (isStaleTranscriptJob(options.videoId, options.routeEpoch)) {
        return false;
      }

      const transcriptButton = findShowTranscriptButton();
      if (transcriptButton) {
        return true;
      }

      const expanded = await expandDescriptionForTranscriptButton();
      if (expanded) {
        return true;
      }

      await sleep(120);
    }

    return false;
  }

  async function expandDescriptionForTranscriptButton() {
    const button = findDescriptionExpandButton();
    if (!button) {
      return false;
    }

    try {
      clickElementLikeUser(button);
      globalThis.YGS.log("Clicked YouTube description expand button before transcript fallback");
      await sleep(150);
      return true;
    } catch (error) {
      globalThis.YGS.warn("Failed to expand YouTube description before transcript fallback", error);
      return false;
    }
  }

  async function waitForShowTranscriptButton(timeoutMs, options = {}) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      if (isStaleTranscriptJob(options.videoId, options.routeEpoch)) {
        return null;
      }

      const button = findShowTranscriptButton();
      if (button) {
        return button;
      }
      await sleep(100);
    }

    return null;
  }

  function findDescriptionExpandButton() {
    const containers = getDescriptionContainers();
    const selectors = [
      "#description-inline-expander #expand",
      "ytd-text-inline-expander #expand",
      "tp-yt-paper-button#expand",
      "button[aria-label*='더보기']",
      "button[aria-label*='Show more']",
      "button[aria-label*='more']",
      "[role='button']",
      "button",
      "tp-yt-paper-button"
    ];

    const labels = [
      "더보기",
      "더 보기",
      "자세히",
      "Show more",
      "More"
    ];

    for (const container of containers) {
      for (const selector of selectors) {
        for (const element of Array.from(container.querySelectorAll(selector))) {
          if (!isElementVisible(element)) {
            continue;
          }

          const text = normalizeWhitespace(
            element.getAttribute("aria-label")
            || element.innerText
            || element.textContent
            || ""
          );

          if (!text) {
            continue;
          }

          const hasLabel = labels.some((label) => text.includes(label));
          const isYouTubeDescriptionExpand = element.id === "expand"
            || element.closest("#description-inline-expander")
            || element.closest("ytd-text-inline-expander");

          if (hasLabel && isYouTubeDescriptionExpand) {
            return element;
          }
        }
      }
    }

    return null;
  }

  function getDescriptionContainers() {
    const selectors = [
      "ytd-watch-metadata",
      "#description-inline-expander",
      "ytd-text-inline-expander",
      "#description",
      "#bottom-row",
      "#above-the-fold"
    ];

    const containers = [];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && !containers.includes(element)) {
        containers.push(element);
      }
    }

    return containers;
  }

  async function waitForTranscriptPanelEntries(timeoutMs, options = {}) {
    const startedAt = Date.now();
    let lastCandidateCount = 0;

    while (Date.now() - startedAt < timeoutMs) {
      if (isStaleTranscriptJob(options.videoId, options.routeEpoch)) {
        return [];
      }

      const entries = await collectTranscriptPanelEntriesFromDom(options);
      if (entries.length > 0) {
        globalThis.YGS.log("Transcript panel DOM extraction found entries", {
          count: entries.length
        });
        return entries;
      }
      lastCandidateCount = countTranscriptDomCandidates();
      await sleep(120);
    }

    globalThis.YGS.warn("Transcript panel DOM polling timed out without parsed entries", {
      candidateCount: lastCandidateCount,
      diagnostics: getTranscriptDomDiagnostics()
    });
    return [];
  }

  async function collectTranscriptPanelEntriesFromDom(options = {}) {
    if (isStaleTranscriptJob(options.videoId, options.routeEpoch)) {
      return [];
    }

    const fromComponentData = extractTranscriptEntriesFromTranscriptComponentData();
    if (fromComponentData.length > 0) {
      globalThis.YGS.log("Transcript component data extraction found entries", {
        count: fromComponentData.length
      });
      return fromComponentData;
    }

    const immediate = extractTranscriptEntriesFromDom();
    if (immediate.length === 0) {
      return [];
    }

    const scroller = findTranscriptScrollContainer();
    if (!scroller) {
      return immediate;
    }

    const originalTop = scroller.scrollTop;
    const collected = new Map();

    const addEntries = () => {
      const beforeCount = collected.size;
      for (const entry of extractTranscriptEntriesFromDom()) {
        const key = `${Math.round(Number(entry.start || 0) * 1000)}:${entry.text}`;
        if (!collected.has(key)) {
          collected.set(key, entry);
        }
      }
      return collected.size - beforeCount;
    };

    const originalScrollBehavior = scroller.style.scrollBehavior;
    scroller.style.scrollBehavior = "auto";

    try {
      const initialUpdate = waitForTranscriptDomUpdate(scroller, 90);
      scroller.scrollTop = 0;
      await initialUpdate;
      if (isStaleTranscriptJob(options.videoId, options.routeEpoch)) {
        return [];
      }
      addEntries();

      const maxIterations = Math.min(
        120,
        Math.max(24, Math.ceil(scroller.scrollHeight / Math.max(300, scroller.clientHeight || 300)) + 6)
      );

      let noNewEntriesCount = 0;
      for (let index = 0; index < maxIterations; index += 1) {
        if (isStaleTranscriptJob(options.videoId, options.routeEpoch)) {
          return [];
        }

        const before = scroller.scrollTop;
        const update = waitForTranscriptDomUpdate(scroller, 90);
        const step = Math.max(900, Math.floor((scroller.clientHeight || 600) * 1.65));
        scroller.scrollTop = Math.min(scroller.scrollTop + step, scroller.scrollHeight);
        await update;
        if (isStaleTranscriptJob(options.videoId, options.routeEpoch)) {
          return [];
        }
        const addedCount = addEntries();
        if (addedCount === 0) {
          noNewEntriesCount += 1;
        } else {
          noNewEntriesCount = 0;
        }

        const nearBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4;
        const noProgress = scroller.scrollTop === before;
        if (nearBottom || noProgress || noNewEntriesCount >= 3) {
          break;
        }
      }

      return normalizeTranscriptEntries(Array.from(collected.values()));
    } finally {
      scroller.scrollTop = originalTop;
      scroller.style.scrollBehavior = originalScrollBehavior;
    }
  }

  function waitForTranscriptDomUpdate(root, timeoutMs = 90) {
    if (!root || typeof MutationObserver === "undefined") {
      return sleep(timeoutMs);
    }

    return new Promise((resolve) => {
      let settled = false;
      let observer = null;
      const finish = () => {
        if (settled) {
          return;
        }
        settled = true;
        observer?.disconnect();
        resolve();
      };

      observer = new MutationObserver(finish);
      observer.observe(root, {
        childList: true,
        subtree: true,
        characterData: true
      });
      setTimeout(finish, timeoutMs);
    });
  }

  function extractTranscriptEntriesFromTranscriptComponentData() {
    const dataRoots = collectTranscriptComponentDataRoots();
    const collected = new Map();

    for (const dataRoot of dataRoots) {
      const entries = parseInnertubeTranscriptEntries(dataRoot);
      for (const entry of entries) {
        const key = `${Math.round(Number(entry.start || 0) * 1000)}:${entry.text}`;
        if (!collected.has(key)) {
          collected.set(key, entry);
        }
      }
    }

    return normalizeTranscriptEntries(Array.from(collected.values()));
  }

  function collectTranscriptComponentDataRoots() {
    const elements = collectTranscriptComponentElements();
    const propertyNames = [
      "data",
      "__data",
      "__dataPending",
      "__dataOld",
      "item",
      "items",
      "model",
      "segments",
      "transcript",
      "renderer"
    ];
    const roots = [];
    const seen = new WeakSet();

    const addRoot = (value) => {
      if (!value || typeof value !== "object" || shouldSkipObjectWalk(value) || seen.has(value)) {
        return;
      }

      seen.add(value);
      roots.push(value);
    };

    for (const element of elements) {
      for (const name of propertyNames) {
        addRoot(element[name]);
      }

      for (const name of Object.getOwnPropertyNames(element).slice(0, 80)) {
        const normalizedName = String(name || "").toLowerCase();
        if (!normalizedName.includes("data") && !normalizedName.includes("transcript")) {
          continue;
        }

        try {
          addRoot(element[name]);
        } catch (_) {
          // Some host properties may throw when read.
        }
      }
    }

    return roots;
  }

  function collectTranscriptComponentElements() {
    const selectors = [
      "transcript-segment-view-model",
      "ytd-transcript-segment-list-renderer",
      "ytd-transcript-renderer",
      "ytd-transcript-segment-renderer",
      "ytd-engagement-panel-section-list-renderer[target-id='engagement-panel-searchable-transcript']",
      "[id*='transcript' i]",
      "[class*='transcript' i]"
    ];
    const elements = [];

    for (const selector of selectors) {
      try {
        for (const element of Array.from(document.querySelectorAll(selector))) {
          if (!elements.includes(element)) {
            elements.push(element);
          }
        }
      } catch (_) {
        // Ignore selector support differences.
      }
    }

    return elements.slice(0, 80);
  }

  function extractTranscriptEntriesFromDom() {
    const ytwEntries = extractYtwTranscriptEntriesFromDom();
    if (ytwEntries.length > 0) {
      return ytwEntries;
    }

    const segments = collectTranscriptCandidateElements();

    const entries = [];

    for (const segment of Array.from(segments)) {
      const entry = parseTranscriptSegmentElement(segment);
      if (entry) {
        entries.push(entry);
      }
    }

    return normalizeTranscriptEntries(entries);
  }

  function extractYtwTranscriptEntriesFromDom() {
    const segments = Array.from(document.querySelectorAll(
      "transcript-segment-view-model, .ytwTranscriptSegmentViewModelHost"
    ));
    const entries = [];

    for (const segment of segments) {
      const timestampElement = segment.querySelector?.(
        ".ytwTranscriptSegmentViewModelTimestamp[aria-hidden='true'], .ytwTranscriptSegmentViewModelTimestamp"
      );
      const textElement = segment.querySelector?.(
        "[role='text'].ytAttributedStringHost, [role='text']"
      );
      const timestampText = normalizeWhitespace(getElementReadableText(timestampElement));
      const transcriptText = cleanTranscriptSegmentText(getElementReadableText(textElement), timestampText);

      if (!timestampText || !containsTimestampText(timestampText) || !transcriptText) {
        continue;
      }

      entries.push({
        start: parseTimestampToSeconds(timestampText),
        duration: 0,
        text: transcriptText
      });
    }

    return normalizeTranscriptEntries(entries);
  }

  function collectTranscriptCandidateElements() {
    const roots = getTranscriptPanelRoots();
    const scopedSelectors = [
      "transcript-segment-view-model",
      "ytd-transcript-segment-renderer",
      "ytd-transcript-segment-list-renderer ytd-transcript-segment-renderer",
      "yt-formatted-string.segment-text",
      "#segment-text",
      ".segment-text",
      "[id*='segment']",
      "[class*='segment']",
      "[role='button']",
      "button",
      "[aria-label]",
      "[role='listitem']",
      "yt-list-item-view-model",
      "yt-formatted-string"
    ];
    const globalTranscriptSelectors = [
      "transcript-segment-view-model",
      ".ytwTranscriptSegmentViewModelHost",
      "ytd-transcript-segment-renderer",
      "ytd-transcript-segment-list-renderer ytd-transcript-segment-renderer",
      "ytd-transcript-renderer ytd-transcript-segment-renderer",
      "ytd-transcript-renderer #segment-text",
      "ytd-transcript-renderer .segment-text",
      "ytd-transcript-segment-list-renderer #segment-text",
      "ytd-transcript-segment-list-renderer .segment-text",
      "ytd-engagement-panel-section-list-renderer[target-id='engagement-panel-searchable-transcript'] #segment-text",
      "ytd-engagement-panel-section-list-renderer[target-id='engagement-panel-searchable-transcript'] .segment-text",
      "[id*='transcript' i] [role='button']",
      "[id*='transcript' i] [role='listitem']",
      "[id*='transcript' i] yt-list-item-view-model",
      "[id*='transcript' i] yt-formatted-string",
      "[class*='transcript' i] [role='button']",
      "[class*='transcript' i] [role='listitem']",
      "[class*='transcript' i] yt-list-item-view-model",
      "[class*='transcript' i] yt-formatted-string"
    ];
    const segments = new Set();

    for (const scope of roots) {
      if (elementLooksLikeTranscriptSegment(scope)) {
        segments.add(scope);
      }

      for (const selector of scopedSelectors) {
        for (const element of Array.from(scope.querySelectorAll?.(selector) || [])) {
          const segment = resolveTranscriptSegmentElement(element);
          if (segment && elementLooksLikeTranscriptSegment(segment)) {
            segments.add(segment);
          }
        }
      }
    }

    if (segments.size === 0) {
      for (const selector of globalTranscriptSelectors) {
        for (const element of Array.from(document.querySelectorAll(selector))) {
          const segment = resolveTranscriptSegmentElement(element);
          if (segment && elementLooksLikeTranscriptSegment(segment)) {
            segments.add(segment);
          }
        }
      }
    }

    return segments;
  }

  function countTranscriptDomCandidates() {
    return collectTranscriptCandidateElements().size;
  }

  function getTranscriptPanelRoots() {
    const selectors = [
      "ytd-transcript-segment-list-renderer",
      "ytd-transcript-renderer",
      "ytd-engagement-panel-section-list-renderer[target-id='engagement-panel-searchable-transcript']",
      "ytd-engagement-panel-section-list-renderer:has(ytd-transcript-segment-list-renderer)",
      "ytd-engagement-panel-section-list-renderer:has(ytd-transcript-renderer)",
      "ytd-engagement-panel-section-list-renderer:has([id*='transcript' i])",
      "ytd-engagement-panel-section-list-renderer:has([class*='transcript' i])",
      "ytd-engagement-panel-section-list-renderer",
      "[id*='transcript' i]",
      "[class*='transcript' i]",
      "#segments-container"
    ];
    const roots = [];

    for (const selector of selectors) {
      try {
        for (const element of Array.from(document.querySelectorAll(selector))) {
          if (!roots.includes(element)) {
            roots.push(element);
          }
        }
      } catch (_) {
        // Some Chrome versions may not support every selector form.
      }
    }

    return roots;
  }

  function resolveTranscriptSegmentElement(element) {
    if (!element) {
      return null;
    }

    const transcriptSegment = element.closest?.(
      "ytd-transcript-segment-renderer, [id*='transcript-segment'], [class*='transcript-segment']"
    );
    if (transcriptSegment && !isTranscriptSegmentContainer(transcriptSegment)) {
      return transcriptSegment;
    }

    if (!isTranscriptSegmentContainer(element)) {
      return element;
    }

    return null;
  }

  function elementLooksLikeTranscriptSegment(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    if (isTranscriptSegmentContainer(element)) {
      return false;
    }

    const text = getTranscriptSegmentRawText(element);
    return text.length > 0 && text.length < 2500 && containsTimestampText(text);
  }

  function isTranscriptSegmentContainer(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    return element.matches(
      "ytd-transcript-segment-list-renderer, ytd-transcript-renderer, #segments-container, .ytSectionListRendererContents, ytd-engagement-panel-section-list-renderer"
    );
  }

  function getTranscriptDomDiagnostics() {
    const selectors = [
      "transcript-segment-view-model",
      ".ytwTranscriptSegmentViewModelHost",
      ".ytSectionListRendererContents",
      "ytd-transcript-segment-renderer",
      "ytd-transcript-segment-list-renderer",
      "ytd-transcript-renderer",
      "ytd-engagement-panel-section-list-renderer",
      "[target-id='engagement-panel-searchable-transcript']",
      "#segments-container",
      "[id*='transcript' i]",
      "[class*='transcript' i]",
      "[role='listitem']",
      "yt-list-item-view-model"
    ];
    const counts = {};

    for (const selector of selectors) {
      try {
        counts[selector] = document.querySelectorAll(selector).length;
      } catch (_) {
        counts[selector] = "selector-error";
      }
    }

    return {
      counts,
      timestampSamples: getTimestampElementSamples()
    };
  }

  function getTimestampElementSamples() {
    const samples = [];
    const elements = Array.from(document.querySelectorAll(
      "transcript-segment-view-model, .ytwTranscriptSegmentViewModelHost, ytd-engagement-panel-section-list-renderer, [id*='transcript' i], [class*='transcript' i], [role='listitem'], yt-list-item-view-model, button, [role='button']"
    ));

    for (const element of elements) {
      if (samples.length >= 5) {
        break;
      }

      const text = getElementReadableText(element);
      if (!containsTimestampText(text)) {
        continue;
      }

      samples.push({
        tag: element.tagName.toLowerCase(),
        id: element.id || "",
        className: String(element.className || "").slice(0, 80),
        text: text.slice(0, 160)
      });
    }

    return samples;
  }

  function parseTranscriptSegmentElement(segment) {
    const timestampElement = segment.querySelector?.(
      ".segment-timestamp, #segment-timestamp, [class*='segment-timestamp'], [id*='timestamp'], [class*='timestamp']"
    );
    const textElement = segment.querySelector?.(
      ".segment-text, #segment-text, [class*='segment-text'], [id*='content'], [class*='content'], yt-formatted-string"
    );

    const timestampText = normalizeWhitespace(getElementReadableText(timestampElement));
    let transcriptText = cleanTranscriptSegmentText(getElementReadableText(textElement), timestampText);

    if (timestampText && transcriptText) {
      if (transcriptText === timestampText) {
        transcriptText = "";
      }

      if (!transcriptText) {
        transcriptText = cleanTranscriptSegmentText(
          removeTimestampFromText(getTranscriptSegmentRawText(segment), timestampText),
          timestampText
        );
      }

      if (!transcriptText) {
        return null;
      }

      return {
        start: parseTimestampToSeconds(timestampText),
        duration: 0,
        text: transcriptText
      };
    }

    const rawTexts = getTranscriptSegmentTextCandidates(segment);
    for (const rawText of rawTexts) {
      const parsed = parseTimestampedTranscriptText(rawText);
      if (parsed) {
        return parsed;
      }
    }

    return null;
  }

  function getTranscriptSegmentTextCandidates(element) {
    return uniqueStrings([
      getElementReadableText(element),
      element?.innerText || "",
      element?.textContent || ""
    ]);
  }

  function getTranscriptSegmentRawText(element) {
    return getTranscriptSegmentTextCandidates(element).join(" ");
  }

  function getElementReadableText(element) {
    if (!element) {
      return "";
    }

    return uniqueStrings([
      element.getAttribute?.("aria-label") || "",
      element.getAttribute?.("title") || "",
      element.innerText || "",
      element.textContent || ""
    ]).join(" ");
  }

  function parseTimestampedTranscriptText(value) {
    const lines = normalizeTextLines(value);
    if (lines.length === 0) {
      return null;
    }

    for (const line of lines) {
      const lineMatch = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+)$/);
      if (lineMatch) {
        const text = cleanTranscriptSegmentText(lineMatch[2], lineMatch[1]);
        if (!text || isTimestampText(text)) {
          continue;
        }

        return {
          start: parseTimestampToSeconds(lineMatch[1]),
          duration: 0,
          text
        };
      }
    }

    const timestampIndex = lines.findIndex((line) => isTimestampText(line));
    if (timestampIndex === -1) {
      return null;
    }

    const text = cleanTranscriptSegmentText(lines
      .filter((_, index) => index !== timestampIndex)
      .filter((line) => !isTimestampText(line))
      .join(" ")
      .trim(), lines[timestampIndex]);

    if (!text) {
      return null;
    }

    return {
      start: parseTimestampToSeconds(lines[timestampIndex]),
      duration: 0,
      text
    };
  }

  function removeTimestampFromText(value, timestampText) {
    return normalizeWhitespace(String(value || "").replace(timestampText, ""));
  }

  function cleanTranscriptSegmentText(value, timestampText) {
    let cleaned = normalizeWhitespace(value);
    if (!cleaned) {
      return "";
    }

    cleaned = removeLeadingTimestampText(cleaned, timestampText);

    const timestampPattern = /\s+\d{1,2}:\d{2}(?::\d{2})?\s*/g;
    let match = timestampPattern.exec(cleaned);
    while (match) {
      const before = normalizeWhitespace(cleaned.slice(0, match.index));
      const after = normalizeWhitespace(cleaned.slice(match.index + match[0].length));

      if (before && after && textLooksDuplicatedAroundTimestamp(before, after)) {
        return before;
      }

      match = timestampPattern.exec(cleaned);
    }

    return cleaned;
  }

  function removeLeadingTimestampText(value, timestampText) {
    let cleaned = normalizeWhitespace(value);
    const normalizedTimestamp = normalizeWhitespace(timestampText);
    if (normalizedTimestamp && cleaned.startsWith(normalizedTimestamp)) {
      cleaned = normalizeWhitespace(cleaned.slice(normalizedTimestamp.length));
    }

    return normalizeWhitespace(cleaned.replace(/^\d{1,2}:\d{2}(?::\d{2})?\s*/, ""));
  }

  function textLooksDuplicatedAroundTimestamp(before, after) {
    const left = compactDuplicateComparisonText(before);
    const right = compactDuplicateComparisonText(after);
    if (!left || !right) {
      return false;
    }

    if (left === right || left.includes(right) || right.includes(left)) {
      return true;
    }

    const prefixLength = Math.min(24, left.length, right.length);
    return prefixLength >= 10 && left.slice(0, prefixLength) === right.slice(0, prefixLength);
  }

  function compactDuplicateComparisonText(value) {
    return normalizeWhitespace(value)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "");
  }

  function stripRedundantKoreanTimestampPrefix(value, startSeconds) {
    let cleaned = normalizeWhitespace(value);
    if (!cleaned) {
      return "";
    }

    const roundedStart = Math.max(0, Math.floor(Number(startSeconds) || 0));
    const minutes = Math.floor(roundedStart / 60);
    const seconds = roundedStart % 60;
    const candidates = [];

    if (minutes > 0) {
      candidates.push(`${minutes}분 ${seconds}초`);
      candidates.push(`${minutes}분${seconds}초`);
      if (seconds === 0) {
        candidates.push(`${minutes}분`);
      }
    } else {
      candidates.push(`${seconds}초`);
    }

    for (const candidate of candidates) {
      if (!candidate || !cleaned.startsWith(candidate)) {
        continue;
      }

      const nextCharacter = cleaned.slice(candidate.length, candidate.length + 1);
      if (!nextCharacter || /[\s.,:;!?()[\]{}"'`~\-–—]/.test(nextCharacter)) {
        cleaned = normalizeWhitespace(cleaned.slice(candidate.length));
        break;
      }
    }

    return cleaned;
  }

  function containsTimestampText(value) {
    return /\b\d{1,2}:\d{2}(?::\d{2})?\b/.test(String(value || ""));
  }

  function findTranscriptScrollContainer() {
    const selectors = [
      ".ytSectionListRendererContents",
      "yt-item-section-renderer:has(transcript-segment-view-model)",
      "ytd-transcript-segment-list-renderer #segments-container",
      "#segments-container",
      "ytd-transcript-segment-list-renderer",
      "ytd-engagement-panel-section-list-renderer[target-id='engagement-panel-searchable-transcript']"
    ];
    const candidates = [];

    for (const selector of selectors) {
      for (const element of Array.from(document.querySelectorAll(selector))) {
        if (isScrollableElement(element)) {
          candidates.push(element);
        }
      }
    }

    const firstSegment = document.querySelector(
      "transcript-segment-view-model, .ytwTranscriptSegmentViewModelHost, ytd-transcript-segment-renderer, [id*='transcript' i] [role='button'], [class*='transcript' i] [role='button']"
    );
    let current = firstSegment?.parentElement || null;
    while (current && current !== document.body) {
      if (isScrollableElement(current)) {
        candidates.push(current);
      }
      current = current.parentElement;
    }

    candidates.sort((left, right) => {
      const leftScore = (left.clientHeight || 0) * 10 + (left.scrollHeight || 0);
      const rightScore = (right.clientHeight || 0) * 10 + (right.scrollHeight || 0);
      return rightScore - leftScore;
    });

    return candidates[0] || null;
  }

  function isScrollableElement(element) {
    if (!element) {
      return false;
    }

    return element.scrollHeight > element.clientHeight + 8;
  }

  function findShowTranscriptButton() {
    const exactTexts = [
      "스크립트 표시",
      "스크립트 보기",
      "Show transcript",
      "Show Transcript",
      "Open transcript",
      "Open Transcript"
    ];

    const candidates = Array.from(document.querySelectorAll(
      "button, tp-yt-paper-button, yt-button-shape button, yt-button-view-model, a[role='button'], [role='button']"
    ));

    for (const element of candidates) {
      if (!isElementVisible(element)) {
        continue;
      }

      const text = normalizeWhitespace(
        element.getAttribute("aria-label")
        || element.innerText
        || element.textContent
        || ""
      );

      if (!text) {
        continue;
      }

      if (exactTexts.some((label) => text.includes(label))) {
        return element;
      }
    }

    return null;
  }

  function isElementVisible(element) {
    if (!element) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    const style = globalThis.getComputedStyle(element);
    return rect.width > 0
      && rect.height > 0
      && style.visibility !== "hidden"
      && style.display !== "none";
  }

  function normalizeTranscriptEntries(entries) {
    if (!Array.isArray(entries) || entries.length === 0) {
      return [];
    }

    const normalized = [];
    const seen = new Set();

    for (const entry of entries) {
      const start = Number(entry?.start || 0);
      const safeStart = Number.isFinite(start) && start >= 0 ? start : 0;
      const text = stripRedundantKoreanTimestampPrefix(entry?.text || "", safeStart);
      if (!text) {
        continue;
      }

      const duration = Number(entry?.duration || 0);
      const safeDuration = Number.isFinite(duration) && duration >= 0 ? duration : 0;
      const key = `${Math.round(safeStart * 1000)}:${text}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      normalized.push({
        start: safeStart,
        duration: safeDuration,
        text
      });
    }

    normalized.sort((left, right) => left.start - right.start);
    return normalized;
  }

  function normalizeWhitespace(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function normalizeTextLines(value) {
    return String(value || "")
      .split(/\r?\n/)
      .map((line) => normalizeWhitespace(line))
      .filter(Boolean);
  }

  function uniqueStrings(values) {
    return Array.from(new Set(
      values
        .map((value) => normalizeWhitespace(value))
        .filter(Boolean)
    ));
  }

  function isTimestampText(value) {
    return /^\d{1,2}:\d{2}(?::\d{2})?$/.test(normalizeWhitespace(value));
  }

  function parseTimestampToSeconds(value) {
    const parts = normalizeWhitespace(value)
      .split(":")
      .map((part) => Number(part));

    if (parts.length === 2 && parts.every(Number.isFinite)) {
      return parts[0] * 60 + parts[1];
    }

    if (parts.length === 3 && parts.every(Number.isFinite)) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    return 0;
  }

  function parseFiniteNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function clickElementLikeUser(element) {
    if (!(element instanceof HTMLElement)) {
      return;
    }

    try {
      element.scrollIntoView?.({ block: "center", inline: "center" });
    } catch (_) {
      // Ignore scroll failures.
    }

    try {
      element.focus?.({ preventScroll: true });
    } catch (_) {
      // Ignore focus failures.
    }

    const rect = element.getBoundingClientRect();
    const clientX = rect.left + rect.width / 2;
    const clientY = rect.top + rect.height / 2;

    for (const type of ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]) {
      const isDown = type === "pointerdown" || type === "mousedown";
      const event = type.startsWith("pointer")
        ? new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          composed: true,
          view: globalThis,
          clientX,
          clientY,
          screenX: clientX,
          screenY: clientY,
          button: 0,
          buttons: isDown ? 1 : 0,
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true
        })
        : new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          composed: true,
          view: globalThis,
          clientX,
          clientY,
          screenX: clientX,
          screenY: clientY,
          button: 0,
          buttons: isDown ? 1 : 0,
          detail: 1
        });

      element.dispatchEvent(event);
    }

    try {
      element.click?.();
    } catch (_) {
      // Some Polymer controls ignore direct click.
    }
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function watchRouteChanges() {
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        routeEpoch += 1;
        transcriptPrefetchPromises.clear();
        clearTimeout(prefetchTimer);
        clearTimeout(transcriptUiWarmupTimer);
        updateTranscriptReadyButton(getVideoIdFromUrl(location.href));
        clearTimeout(routeTimer);
        routeTimer = setTimeout(insertYoutubeButton, 1000);
      }
    }, 1000);

    const observer = new MutationObserver(() => {
      if (isWatchPage() && !document.getElementById(ROOT_ID)) {
        clearTimeout(routeTimer);
        routeTimer = setTimeout(insertYoutubeButton, 500);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  globalThis.YGS.insertYoutubeButton = insertYoutubeButton;

  insertYoutubeButton();
  watchRouteChanges();
})();
