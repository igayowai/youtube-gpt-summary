globalThis.YGS = globalThis.YGS || {};

(() => {
  if (globalThis.YGS.__geminiContentScriptStarted) {
    return;
  }
  globalThis.YGS.__geminiContentScriptStarted = true;

  const INPUT_WAIT_MS = 20000;
  const POLL_MS = 300;

  const inputAdapters = [
    {
      name: "textarea",
      canHandle(element) {
        return element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement;
      },
      inject(element, text) {
        element.focus();

        const prototype = element instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
        const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");

        if (descriptor?.set) {
          descriptor.set.call(element, text);
        } else {
          element.value = text;
        }

        dispatchInputEvents(element, text);
      },
      read(element) {
        return element.value || "";
      }
    },
    {
      name: "contenteditable",
      canHandle(element) {
        return element instanceof HTMLElement && element.isContentEditable;
      },
      inject(element, text) {
        insertTextIntoContentEditable(element, text);
        dispatchInputEvents(element, text);
      },
      read(element) {
        return element.innerText || element.textContent || "";
      }
    }
  ];

  async function main() {
    await waitForDocumentReady();
    await delay(500);

    const requestId = parseRequestIdFromLocation();
    if (!requestId) {
      return;
    }

    const pending = await getPendingPrompt(requestId);
    if (!pending) {
      globalThis.YGS.log("No pending Gemini prompt found for request", requestId);
      return;
    }

    const temporaryConfirmed = await confirmGeminiTemporaryChatIfPossible();
    if (!temporaryConfirmed) {
      globalThis.YGS.warn("Gemini Temporary Chat not confirmed; prompt injection withheld");
      return;
    }

    const input = await waitForComposerInput(INPUT_WAIT_MS);
    if (!input) {
      globalThis.YGS.warn("Gemini composer input not found; pending prompt left available for manual paste");
      return;
    }

    let currentInput = findComposerInput() || input;
    const injected = injectPrompt(currentInput, pending.prompt);
    if (!injected) {
      globalThis.YGS.warn("Gemini prompt injection failed; pending prompt left available for manual paste");
      return;
    }

    globalThis.YGS.log("Prompt injected into Gemini composer");

    const modelSelectionConfirmed = await selectGeminiModelIfRequested(
      pending.geminiModel,
      pending.geminiThinkingLevel,
      currentInput
    );

    currentInput = findComposerInput() || currentInput;
    if (!composerContainsPrompt(currentInput, pending.prompt)) {
      globalThis.YGS.warn("Gemini composer prompt changed after model selection; reinjecting prompt");
      const reinjected = injectPrompt(currentInput, pending.prompt);
      if (!reinjected) {
        globalThis.YGS.warn("Gemini prompt reinjection failed after model selection; pending prompt left available for manual paste");
        return;
      }
      globalThis.YGS.log("Prompt reinjected into Gemini composer after model selection");
    }

    await clearPendingPrompt(requestId);
    removeRequestIdHash();

    if (pending.autoSubmit !== true) {
      globalThis.YGS.log("autoSubmit is false; Gemini prompt left in composer");
      return;
    }

    if (
      modelSelectionConfirmed === false
      && (
        isSpecificGeminiModelRequested(pending.geminiModel)
        || isSpecificGeminiThinkingLevelRequested(pending.geminiThinkingLevel)
      )
    ) {
      globalThis.YGS.warn("Gemini auto-submit withheld because requested model or thinking level selection was not confirmed", {
        geminiModel: pending.geminiModel,
        geminiThinkingLevel: pending.geminiThinkingLevel
      });
      return;
    }

    const submitted = await submitPrompt(currentInput);
    if (submitted) {
      globalThis.YGS.log("Gemini prompt submitted");
    } else {
      globalThis.YGS.warn("Gemini auto-submit failed; prompt should remain in composer");
    }
  }

  function parseRequestIdFromLocation() {
    const hash = location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    return params.get("ygsRequestId") || "";
  }

  async function confirmGeminiTemporaryChatIfPossible() {
    const initialReason = getGeminiTemporaryChatActiveReason();
    if (initialReason) {
      globalThis.YGS.log("Gemini Temporary Chat confirmed", initialReason);
      return true;
    }

    const button = await waitForGeminiTemporaryChatButton(9000);
    if (button) {
      const confirmedByClick = await clickGeminiTemporaryChatWithRetry(button);
      if (confirmedByClick) {
        return true;
      }

      globalThis.YGS.warn("Gemini Temporary Chat confirmation diagnostics", getGeminiTemporaryChatDiagnostics());
      return false;
    }

    const finalReason = await waitForGeminiTemporaryChatActive(3000);
    if (finalReason) {
      globalThis.YGS.log("Gemini Temporary Chat confirmed after click", finalReason);
      return true;
    }

    globalThis.YGS.warn("Gemini Temporary Chat confirmation diagnostics", getGeminiTemporaryChatDiagnostics());
    return false;
  }

  async function clickGeminiTemporaryChatWithRetry(initialButton) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const activeReason = getGeminiTemporaryChatActiveReason();
      if (activeReason) {
        return true;
      }

      const button = attempt === 1
        ? initialButton
        : await waitForGeminiTemporaryChatButton(3000);

      if (!button) {
        return false;
      }

      try {
        globalThis.YGS.log("Clicking Gemini Temporary Chat button", getElementLabel(button));
        clickGeminiTemporaryChatControl(button);
        await delay(attempt === 1 ? 250 : 500);
      } catch (error) {
        globalThis.YGS.warn("Gemini Temporary Chat button click failed", error);
      }

      const confirmedReason = await waitForGeminiTemporaryChatActive(attempt === 1 ? 2500 : 4500);
      if (confirmedReason) {
        globalThis.YGS.log("Gemini Temporary Chat confirmed after click", confirmedReason);
        return true;
      }
    }

    return false;
  }

  function clickGeminiTemporaryChatControl(container) {
    const clickTarget = findExactGeminiTemporaryChatButton()
      || findBestClickableTemporaryChatTarget(container)
      || container;
    if (clickTarget !== container) {
      globalThis.YGS.log("Clicking Gemini Temporary Chat inner control", getElementLabel(clickTarget));
    }

    clickElementLikeUser(clickTarget);

    if (clickTarget === container) {
      clickElementAt(container, 0.25, 0.5);
      clickElementAt(container, 0.75, 0.5);
    }
  }

  function findBestClickableTemporaryChatTarget(container) {
    const candidates = Array.from(container.querySelectorAll("button, [role='button'], [role='switch'], input[type='checkbox'], mat-slide-toggle, mat-slide-toggle *"))
      .filter((element) => element instanceof HTMLElement)
      .filter(isVisible)
      .filter((element) => !isDisabled(element))
      .map((element) => ({
        element,
        score: getTemporaryChatInnerControlScore(element)
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score);

    return candidates[0]?.element || null;
  }

  function getTemporaryChatInnerControlScore(element) {
    const label = normalizeForComparison(getElementLabel(element));
    let score = 1;

    if (element.getAttribute("role") === "switch") {
      score += 10;
    }

    if (element instanceof HTMLInputElement && element.type === "checkbox") {
      score += 9;
    }

    if (label.includes("temporary") || label.includes("임시")) {
      score += 6;
    }

    if (label.includes("chat") || label.includes("채팅") || label.includes("대화")) {
      score += 4;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width <= 96 && rect.height <= 64) {
      score += 3;
    }

    return score;
  }

  async function waitForGeminiTemporaryChatActive(timeoutMs) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const reason = getGeminiTemporaryChatActiveReason();
      if (reason) {
        return reason;
      }

      await delay(POLL_MS);
    }

    return "";
  }

  async function waitForGeminiTemporaryChatButton(timeoutMs) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const button = findGeminiTemporaryChatButton();
      if (button) {
        return button;
      }

      await delay(POLL_MS);
    }

    return null;
  }

  function findGeminiTemporaryChatButton() {
    const exactButton = findExactGeminiTemporaryChatButton();
    if (exactButton) {
      return exactButton;
    }

    const candidates = Array.from(document.querySelectorAll("button, [role='button'], a[role='button'], [aria-label], [title]"))
      .filter((element) => element instanceof HTMLElement)
      .filter(isVisible)
      .filter((element) => !isDisabled(element))
      .map((element) => ({
        element,
        score: getGeminiTemporaryChatButtonScore(element)
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score);

    return candidates[0]?.element || null;
  }

  function findExactGeminiTemporaryChatButton() {
    const selectors = [
      "button[data-test-id='temp-chat-button']",
      "[data-test-id='temp-chat-button']",
      "[data-test-id='temp-chat-button-container'] button",
      "temp-chat-button button",
      "button[aria-label='임시 채팅']",
      "button[aria-label='Temporary Chat']",
      "button[mattooltip='임시 채팅']",
      "button[mattooltip='Temporary Chat']"
    ];

    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element instanceof HTMLElement && isVisible(element) && !isDisabled(element)) {
          return element;
        }
      } catch (_) {
        // Ignore selector failures.
      }
    }

    return null;
  }

  function getGeminiTemporaryChatButtonScore(element) {
    const label = normalizeForComparison(getElementLabel(element));
    let score = 0;

    if (label.includes("temporary chat") || label.includes("임시 채팅")) {
      score += 10;
    }

    if (label.includes("temporary") && label.includes("chat")) {
      score += 8;
    }

    if (label.includes("임시") && (label.includes("채팅") || label.includes("대화"))) {
      score += 8;
    }

    if (label.includes("new chat") || label.includes("새 채팅")) {
      score += 1;
    }

    const rect = element.getBoundingClientRect();
    if (rect.top < globalThis.innerHeight * 0.5) {
      score += 1;
    }

    return score;
  }

  function getGeminiTemporaryChatActiveReason() {
    const bodyText = normalizeForComparison(document.body?.innerText || "");
    const activeMarkers = [
      "ask in a temporary chat",
      "temporary chats don't appear",
      "temporary chats don’t appear",
      "won't appear in recent chats",
      "won’t appear in recent chats",
      "aren't used to train",
      "aren’t used to train",
      "gemini apps activity",
      "temporary chat is not shown",
      "temporary chat won't appear",
      "temporary chat won’t appear",
      "ask in temporary chat",
      "임시 채팅으로 질문",
      "임시 채팅에서 질문",
      "임시 채팅에서 질문해 보세요",
      "임시 채팅은 최근 채팅",
      "gemini 앱 활동에 표시되지",
      "표시되지 않으며",
      "사용되지 않습니다",
      "72시간 동안 저장",
      "최근 채팅에 표시되지",
      "학습에 사용되지"
    ];

    if (activeMarkers.some((marker) => bodyText.includes(marker))) {
      return "temporary-chat page copy";
    }

    const input = findComposerInput();
    const inputLabel = normalizeForComparison(input ? getElementLabel(input) : "");
    if (inputLabel.includes("temporary chat") || inputLabel.includes("임시 채팅")) {
      return "temporary-chat input label";
    }

    const composerText = normalizeForComparison(input ? getNearbyText(input) : "");
    if (
      composerText.includes("temporary chat")
      || composerText.includes("임시 채팅")
      || composerText.includes("임시채팅")
    ) {
      return "temporary-chat composer copy";
    }

    return "";
  }

  function getGeminiTemporaryChatDiagnostics() {
    const buttons = [
      ...Array.from(document.querySelectorAll("[data-test-id='temp-chat-button'], [data-test-id='temp-chat-button-container'], temp-chat-button button")),
      ...Array.from(document.querySelectorAll("button[aria-label], button[mattooltip]"))
        .filter((element) => {
          const label = normalizeForComparison(getElementLabel(element));
          return label.includes("임시") || label.includes("temporary");
        })
    ]
      .filter((element) => element instanceof HTMLElement)
      .filter(isVisible)
      .map((element) => ({
        label: normalizeForComparison(getElementLabel(element)).slice(0, 120),
        ariaPressed: element.getAttribute("aria-pressed") || "",
        ariaChecked: element.getAttribute("aria-checked") || "",
        dataState: element.getAttribute("data-state") || "",
        testId: element.getAttribute("data-test-id") || ""
      }))
      .slice(0, 8);

    const bodyText = normalizeForComparison(document.body?.innerText || "");
    return {
      url: location.href,
      temporaryButtons: buttons,
      bodySnippet: bodyText.slice(0, 300)
    };
  }

  async function selectGeminiModelIfRequested(modelValue, thinkingLevelValue, input) {
    const model = getRequestedGeminiModel(modelValue);
    const thinkingLevel = getRequestedGeminiThinkingLevel(thinkingLevelValue);
    const modelRequested = Boolean(model && model.value !== "none");
    const thinkingLevelRequested = Boolean(thinkingLevel && thinkingLevel.value !== "none");

    if (!modelRequested && !thinkingLevelRequested) {
      return true;
    }

    if (modelRequested) {
      globalThis.YGS.log("Gemini model selection requested", model.label);
    }

    if (thinkingLevelRequested) {
      globalThis.YGS.log("Gemini thinking level selection requested", thinkingLevel.label);
    }

    const selector = await waitForGeminiModelSelector(input, 6000);
    if (!selector) {
      globalThis.YGS.warn("Gemini model selector not found; continuing with current model and thinking level", {
        geminiModel: model?.label || "none",
        geminiThinkingLevel: thinkingLevel?.label || "none"
      });
      return false;
    }

    const selectorLabel = getElementLabel(selector);
    globalThis.YGS.log("Gemini model selector found", selectorLabel);

    const modelAlreadySelected = !modelRequested || isGeminiModelSelectedBySelector(selector, model);
    const thinkingLevelAlreadySelected = !thinkingLevelRequested
      || isGeminiThinkingLevelSelectedBySelectorLabel(selectorLabel, thinkingLevel);

    if (modelAlreadySelected && thinkingLevelAlreadySelected) {
      globalThis.YGS.log("Gemini model already selected", model.label);
      return true;
    }

    try {
      const opened = await openGeminiModelMenu(selector);
      if (!opened) {
        globalThis.YGS.warn("Gemini model menu did not open after selector click", {
          selector: getGeminiElementDiagnostics(selector),
          menuRoots: getGeminiModelMenuRootDiagnostics()
        });
      }
    } catch (error) {
      globalThis.YGS.warn("Gemini model selector click failed; continuing with current model", error);
      return false;
    }

    if (modelRequested && !modelAlreadySelected) {
      const option = await waitForGeminiModelOption(model, selector, 5000);
      if (!option) {
        globalThis.YGS.warn("Gemini model option not found; continuing with current model", {
          requestedModel: model.label,
          menuCandidates: getVisibleGeminiModelMenuCandidates(selector)
        });
        return false;
      }

      globalThis.YGS.log("Gemini model option found", getGeminiElementDiagnostics(option));

      try {
        const clickTarget = findGeminiModelOptionClickTarget(option, model) || option;
        globalThis.YGS.log("Gemini model option click target", getGeminiElementDiagnostics(clickTarget));
        activateGeminiModelOption(clickTarget);
        await delay(500);
      } catch (error) {
        globalThis.YGS.warn("Gemini model option click failed; continuing with current model", error);
        return false;
      }

      if (await waitForGeminiModelSelected(model, input, 5000)) {
        globalThis.YGS.log("Gemini model selected", model.label);
      } else {
        globalThis.YGS.warn("Gemini model selection attempted but not confirmed", {
          requestedModel: model.label,
          selectorLabel: normalizeForComparison(getElementLabel(findGeminiModelSelector(input) || selector)).slice(0, 120),
          requestedOption: getGeminiElementDiagnostics(findExactGeminiModelOption(model))
        });
        return false;
      }
    }

    if (thinkingLevelRequested && !thinkingLevelAlreadySelected) {
      if (!(await selectGeminiThinkingLevel(thinkingLevel, input))) {
        return false;
      }
    }

    return true;
  }

  function isSpecificGeminiModelRequested(value) {
    const model = getRequestedGeminiModel(value);
    return Boolean(model && model.value !== "none");
  }

  function isSpecificGeminiThinkingLevelRequested(value) {
    const level = getRequestedGeminiThinkingLevel(value);
    return Boolean(level && level.value !== "none");
  }

  function activateGeminiModelOption(element) {
    clickElementLikeUser(element);
    dispatchKeyboardActivation(element);

    const nestedButton = element.matches?.("button, [role='button'], [role='menuitem']")
      ? null
      : element.querySelector?.("button, [role='button'], [role='menuitem']");
    if (nestedButton instanceof HTMLElement && isVisible(nestedButton) && !isDisabled(nestedButton)) {
      clickElementLikeUser(nestedButton);
      dispatchKeyboardActivation(nestedButton);
    }
  }

  async function openGeminiModelMenu(selector) {
    const attempts = [
      () => clickElementLikeUser(selector, { nativeClick: false }),
      () => {
        clickElementAt(selector, 0.75, 0.5);
        dispatchKeyboardActivation(selector);
      },
      () => {
        clickElementAt(selector, 0.25, 0.5);
        dispatchKeyboardActivation(selector);
      }
    ];

    for (const attempt of attempts) {
      if (getVisibleGeminiModelMenuRoots().length > 0) {
        return true;
      }

      attempt();
      if (await waitForGeminiModelMenuRoot(900)) {
        return true;
      }
    }

    return getVisibleGeminiModelMenuRoots().length > 0;
  }

  async function waitForGeminiModelMenuRoot(timeoutMs) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const roots = getVisibleGeminiModelMenuRoots();
      if (roots.length > 0) {
        return roots[0];
      }

      await delay(100);
    }

    return null;
  }

  function getRequestedGeminiModel(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized === "fast") {
      return globalThis.YGS.GEMINI_MODELS.find((model) => model.value === "flash-lite");
    }
    if (normalized === "thinking") {
      return globalThis.YGS.GEMINI_MODELS.find((model) => model.value === "flash");
    }
    return globalThis.YGS.GEMINI_MODELS.find((model) => model.value === normalized)
      || globalThis.YGS.GEMINI_MODELS.find((model) => model.value === "none");
  }

  function getRequestedGeminiThinkingLevel(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return globalThis.YGS.GEMINI_THINKING_LEVELS.find((level) => level.value === normalized)
      || globalThis.YGS.GEMINI_THINKING_LEVELS.find((level) => level.value === "none");
  }

  async function waitForGeminiModelSelector(input, timeoutMs) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const selector = findGeminiModelSelector(input);
      if (selector) {
        return selector;
      }

      await delay(POLL_MS);
    }

    return null;
  }

  function findGeminiModelSelector(input) {
    const exactSelector = findExactGeminiModelSelector(input);
    if (exactSelector) {
      return exactSelector;
    }

    const candidates = Array.from(document.querySelectorAll("button, [role='button']"))
      .filter((element) => element instanceof HTMLElement)
      .filter(isVisible)
      .filter((element) => !isDisabled(element))
      .map((element) => ({
        element,
        score: getGeminiModelSelectorScore(element, input)
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score);

    return candidates[0]?.element || null;
  }

  function findExactGeminiModelSelector(input) {
    const selectors = [
      "button[data-test-id='bard-mode-menu-button'].input-area-switch",
      "button[data-test-id='bard-mode-menu-button'][aria-haspopup='true']",
      "[data-test-id='bard-mode-switcher'] [data-test-id='bard-mode-menu-button'] button",
      "[data-test-id='bard-mode-menu-button'] button"
    ];

    for (const selector of selectors) {
      try {
        for (const element of Array.from(document.querySelectorAll(selector))) {
          if (!(element instanceof HTMLElement) || !isVisible(element) || isDisabled(element)) {
            continue;
          }

          if (element.classList.contains("input-area-switch") || !input || areElementsNear(element, input)) {
            return element;
          }
        }
      } catch (_) {
        // Ignore selector failures.
      }
    }

    return null;
  }

  function getGeminiModelSelectorScore(element, input) {
    const label = normalizeForComparison(getElementLabel(element));
    const hasExactModelSelectorShape = isExactGeminiModelSelectorElement(element);
    const hasModelLabel = isAnyGeminiModelLabel(label)
      || label.includes("flash-lite")
      || label.includes("flash")
      || label.includes("pro")
      || label.includes("model")
      || label.includes("모델")
      || label.includes("mode")
      || label.includes("모드");

    if (isBlockedGeminiModelSelectorCandidate(element, label) || (!hasExactModelSelectorShape && !hasModelLabel)) {
      return 0;
    }

    let score = 0;

    if (hasExactModelSelectorShape) {
      score += 20;
    }

    if (hasModelLabel) {
      score += 8;
    }

    if (label.includes("model") || label.includes("모델")) {
      score += 3;
    }

    if (input && areElementsNear(element, input)) {
      score += 8;
      const elementRect = element.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();
      const elementCenterX = (elementRect.left + elementRect.right) / 2;
      if (elementCenterX > inputRect.left + inputRect.width * 0.55) {
        score += 4;
      }
    }

    const rect = element.getBoundingClientRect();
    if (rect.bottom > globalThis.innerHeight * 0.4) {
      score += 2;
    }

    if (label.includes("profile") || label.includes("account") || label.includes("프로필") || label.includes("계정")) {
      score -= 12;
    }

    return score;
  }

  function isExactGeminiModelSelectorElement(element) {
    return element.matches?.("button[data-test-id='bard-mode-menu-button'], [data-test-id='bard-mode-menu-button'] button")
      || Boolean(element.closest?.("[data-test-id='bard-mode-switcher'], [data-test-id='bard-mode-menu-button']"));
  }

  function isBlockedGeminiModelSelectorCandidate(element, label) {
    return label.includes("핀 목록")
      || label.includes("pinned")
      || label.includes("pin list")
      || label.includes("ctrl+p")
      || label.includes("mathjaxify")
      || label.includes("sidebar")
      || element.closest?.("[class*='mathjax' i], [id*='mathjax' i], [class*='sidebar' i], [id*='sidebar' i]");
  }

  async function waitForGeminiModelOption(model, selector, timeoutMs) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const option = findGeminiModelOption(model, selector);
      if (option) {
        return option;
      }

      await delay(POLL_MS);
    }

    return null;
  }

  async function waitForGeminiModelSelected(model, input, timeoutMs) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const selector = findGeminiModelSelector(input);
      if (selector && isGeminiModelSelectedBySelector(selector, model)) {
        return true;
      }

      if (findSelectedGeminiModelOption(model)) {
        return true;
      }

      await delay(POLL_MS);
    }

    return false;
  }

  async function selectGeminiThinkingLevel(level, input) {
    let selector = findGeminiModelSelector(input);
    if (!selector) {
      selector = await waitForGeminiModelSelector(input, 3000);
    }

    if (!selector) {
      globalThis.YGS.warn("Gemini selector not found before thinking level selection", level.label);
      return false;
    }

    if (getVisibleGeminiModelMenuRoots().length === 0) {
      const opened = await openGeminiModelMenu(selector);
      if (!opened) {
        globalThis.YGS.warn("Gemini model menu did not open before thinking level selection", {
          selector: getGeminiElementDiagnostics(selector),
          menuRoots: getGeminiModelMenuRootDiagnostics()
        });
        return false;
      }
    }

    const thinkingRow = await waitForGeminiThinkingLevelRow(3000);
    if (!thinkingRow) {
      globalThis.YGS.warn("Gemini thinking level row not found", {
        requestedThinkingLevel: level.label,
        menuCandidates: getVisibleGeminiModelMenuCandidates(selector)
      });
      return false;
    }

    if (!isGeminiThinkingLevelExpanded(thinkingRow)) {
      clickElementLikeUser(thinkingRow);
      await delay(250);
    }

    const option = await waitForGeminiThinkingLevelOption(level, 3000);
    if (!option) {
      globalThis.YGS.warn("Gemini thinking level option not found", {
        requestedThinkingLevel: level.label,
        menuCandidates: getVisibleGeminiModelMenuCandidates(selector)
      });
      return false;
    }

    try {
      const clickTarget = findGeminiThinkingLevelOptionClickTarget(option) || option;
      globalThis.YGS.log("Gemini thinking level option click target", getGeminiElementDiagnostics(clickTarget));
      activateGeminiModelOption(clickTarget);
      await delay(500);
    } catch (error) {
      globalThis.YGS.warn("Gemini thinking level option click failed; continuing with current thinking level", error);
      return false;
    }

    if (await waitForGeminiThinkingLevelSelected(level, input, 5000)) {
      globalThis.YGS.log("Gemini thinking level selected", level.label);
      return true;
    }

    globalThis.YGS.warn("Gemini thinking level selection attempted but not confirmed", {
      requestedThinkingLevel: level.label,
      selectorLabel: normalizeForComparison(getElementLabel(findGeminiModelSelector(input) || selector)).slice(0, 120)
    });
    return false;
  }

  async function waitForGeminiThinkingLevelRow(timeoutMs) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const row = findGeminiThinkingLevelRow();
      if (row) {
        return row;
      }

      await delay(100);
    }

    return null;
  }

  function findGeminiThinkingLevelRow() {
    const candidates = getVisibleGeminiMenuItems();
    return candidates.find((element) => element.getAttribute("value") === "thinking_level")
      || candidates.find((element) => {
        const label = normalizeForComparison(getGeminiMenuItemLabel(element));
        return label === "사고 수준" || label === "thinking level";
      })
      || null;
  }

  function isGeminiThinkingLevelExpanded(row) {
    return row?.getAttribute("aria-expanded") === "true"
      || row?.classList?.contains("expanded")
      || Boolean(row?.querySelector?.(".expand-content gem-menu-item, .expand-content [role='menuitem']"));
  }

  async function waitForGeminiThinkingLevelOption(level, timeoutMs) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const option = findGeminiThinkingLevelOption(level);
      if (option) {
        return option;
      }

      await delay(100);
    }

    return null;
  }

  function findGeminiThinkingLevelOption(level) {
    return getVisibleGeminiMenuItems().find((element) => {
      if (element.getAttribute("value") === "thinking_level") {
        return false;
      }

      return isGeminiModelLabelMatch(getGeminiMenuItemLabel(element), level.matchers);
    }) || null;
  }

  function findGeminiThinkingLevelOptionClickTarget(option) {
    if (!(option instanceof HTMLElement)) {
      return null;
    }

    const candidates = [
      option,
      ...Array.from(option.querySelectorAll("[role='menuitem'], gem-menu-item-content, div, span"))
    ]
      .filter((element) => element instanceof HTMLElement)
      .filter(isVisible)
      .filter((element) => !isDisabled(element))
      .map((element) => ({
        element,
        score: getGeminiThinkingLevelClickTargetScore(element, option)
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score);

    return candidates[0]?.element || option;
  }

  function getGeminiThinkingLevelClickTargetScore(element, option) {
    let score = element === option ? 8 : 0;

    if (element.matches("[role='menuitem'], gem-menu-item")) {
      score += 8;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width >= 120 && rect.height >= 32 && rect.height <= 120) {
      score += 4;
    }

    return score;
  }

  async function waitForGeminiThinkingLevelSelected(level, input, timeoutMs) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const selector = findGeminiModelSelector(input);
      const label = selector ? getElementLabel(selector) : "";
      if (selector && isGeminiThinkingLevelSelectedBySelectorLabel(label, level)) {
        return true;
      }

      const row = findGeminiThinkingLevelRow();
      if (row && isGeminiModelLabelMatch(getGeminiThinkingLevelRowValue(row), level.selectedMatchers)) {
        return true;
      }

      const option = findGeminiThinkingLevelOption(level);
      if (option && isGeminiModelOptionSelected(option)) {
        return true;
      }

      await delay(POLL_MS);
    }

    return false;
  }

  function isGeminiThinkingLevelSelectedBySelectorLabel(label, level) {
    const normalized = normalizeForComparison(label);
    if (!level || level.value === "none") {
      return true;
    }

    if (level.value === "extended") {
      return normalized.includes("extended");
    }

    if (level.value === "standard") {
      return (
        isAnyGeminiModelLabel(normalized)
        || normalized.includes("flash-lite")
        || normalized.includes("flash")
        || normalized.includes("pro")
      ) && !normalized.includes("extended");
    }

    return false;
  }

  function getGeminiThinkingLevelRowValue(row) {
    return row?.querySelector?.(".sublabel")?.textContent?.trim()
      || row?.querySelector?.(".label-container .sublabel")?.textContent?.trim()
      || "";
  }

  function getVisibleGeminiMenuItems() {
    const menuRoots = getVisibleGeminiModelMenuRoots();
    const scope = menuRoots.length > 0 ? menuRoots : [document];
    return uniqueElements(scope.flatMap((root) => Array.from(root.querySelectorAll(
      "gem-menu-item, [role='menuitem'], [role='option'], button[data-mode-id]"
    ))))
      .filter((element) => element instanceof HTMLElement)
      .filter(isVisible)
      .filter((element) => !isDisabled(element));
  }

  function getGeminiMenuItemLabel(element) {
    return element?.querySelector?.(".label")?.textContent?.trim()
      || element?.querySelector?.(".label-container .label")?.textContent?.trim()
      || getElementLabel(element);
  }

  function findSelectedGeminiModelOption(model) {
    const exactOption = findExactGeminiModelOption(model);
    if (exactOption && isGeminiModelOptionSelected(exactOption)) {
      return exactOption;
    }

    return Array.from(document.querySelectorAll("button, [role='button'], [role='option'], [role='menuitem'], li, div"))
      .filter((element) => element instanceof HTMLElement)
      .filter(isVisible)
      .find((element) => {
        const label = getElementLabel(element);
        if (!isGeminiModelLabelMatch(label, model.matchers)) {
          return false;
        }

        return isGeminiModelOptionSelected(element);
      }) || null;
  }

  function isGeminiModelSelectedBySelector(selector, model) {
    if (!(selector instanceof HTMLElement) || !model || model.value === "none") {
      return false;
    }

    const displayLabel = getGeminiSelectorDisplayLabel(selector);
    return isGeminiModelLabelMatch(displayLabel, model.selectedMatchers)
      || isGeminiModelLabelMatch(getElementLabel(selector), model.selectedMatchers);
  }

  function getGeminiSelectorDisplayLabel(selector) {
    const labelContainer = selector.querySelector?.("[data-test-id='logo-pill-label-container']")
      || selector.querySelector?.(".logo-pill-label-container");
    const primary = labelContainer?.querySelector?.(".picker-primary-text")?.textContent?.trim() || "";
    const secondary = labelContainer?.querySelector?.(".picker-secondary-text")?.textContent?.trim() || "";
    const visibleLabel = [primary, secondary].filter(Boolean).join(" ").trim();
    return visibleLabel || getElementLabel(selector);
  }

  function findGeminiModelOptionClickTarget(option, model) {
    if (!(option instanceof HTMLElement)) {
      return null;
    }

    const candidates = [
      findExactGeminiModelOption(model),
      option,
      ...getGeminiModelOptionAncestorCandidates(option),
      ...Array.from(option.querySelectorAll("button, [role='button'], [role='option'], [role='menuitem'], div, span"))
    ]
      .filter((element) => element instanceof HTMLElement)
      .filter(isVisible)
      .filter((element) => !isDisabled(element))
      .filter((element) => !isGeminiDefaultModelStarButton(element))
      .map((element) => ({
        element,
        score: getGeminiModelOptionClickTargetScore(element, option, model)
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score);

    return candidates[0]?.element || option;
  }

  function getGeminiModelOptionAncestorCandidates(option) {
    const candidates = [];
    let current = option;

    for (let depth = 0; current && current !== document.body && depth < 10; depth += 1) {
      if (isGeminiModelOptionRowCandidate(current, option)) {
        candidates.push(current);
      }

      current = current.parentElement;
    }

    return candidates;
  }

  function isGeminiModelOptionRowCandidate(element, option) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    if (isGeminiDefaultModelStarButton(element)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0 || rect.width > globalThis.innerWidth * 0.95 || rect.height > 220) {
      return false;
    }

    const optionRect = option?.getBoundingClientRect?.();
    if (optionRect && optionRect.width > 0 && optionRect.height > 0) {
      const elementCenterY = (rect.top + rect.bottom) / 2;
      const optionCenterY = (optionRect.top + optionRect.bottom) / 2;
      if (Math.abs(elementCenterY - optionCenterY) > 120) {
        return false;
      }
    }

    const label = normalizeForComparison(getElementLabel(element));
    return label
      && element.matches(
        "button, [role='button'], [role='option'], [role='menuitem'], [role='menuitemradio'], [role='radio'], mat-option, mat-list-option, li, div, .title-and-check, .under-input, [class*='mode' i], [class*='model' i]"
      );
  }

  function getGeminiModelOptionClickTargetScore(element, option, model) {
    const label = normalizeForComparison(getElementLabel(element));
    let score = 0;

    if (element === option) {
      score += 3;
    }

    if (element.classList.contains("title-and-check") || element.classList.contains("under-input")) {
      score += 9;
    }

    if (element.matches("mat-option, mat-list-option, [role='option'], [role='menuitem'], [role='menuitemradio'], [role='radio']")) {
      score += 8;
    }

    if (isGeminiModelLabelMatch(label, model.matchers)) {
      score += 8;
    }

    if (["button", "option", "menuitem"].includes(element.getAttribute("role") || "")) {
      score += 4;
    }

    const tagName = element.tagName.toLowerCase();
    if (tagName === "button" || tagName === "li") {
      score += 3;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width >= 160 && rect.height >= 36 && rect.height <= 180) {
      score += 5;
    } else if (rect.width >= 48 && rect.height >= 20) {
      score += 1;
    }

    if (isGeminiDefaultModelStarButton(element)) {
      score -= 100;
    }

    return score;
  }

  function isGeminiDefaultModelStarButton(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    const label = normalizeForComparison(getElementLabel(element));
    return element.classList.contains("gv-default-star-btn")
      || label.includes("기본 모델로 설정")
      || label.includes("default model");
  }

  function hasGeminiModelSelectedCheck(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    const markers = Array.from(element.querySelectorAll(
      ".mode-check, mat-icon[fonticon='check_circle'], mat-icon[fonticon='check'], [data-mat-icon-name='check_circle'], [data-mat-icon-name='check'], .mat-icon"
    ));

    return markers.some((marker) => {
      if (!(marker instanceof HTMLElement) || !isVisible(marker)) {
        return false;
      }

      const label = normalizeForComparison(getElementLabel(marker));
      return marker.classList.contains("mode-check")
        || marker.getAttribute("fonticon") === "check_circle"
        || marker.getAttribute("fonticon") === "check"
        || marker.getAttribute("data-mat-icon-name") === "check_circle"
        || marker.getAttribute("data-mat-icon-name") === "check"
        || label.includes("check_circle")
        || label.includes("check");
    });
  }

  function findGeminiModelOption(model, selector) {
    const exactOption = findExactGeminiModelOption(model);
    if (exactOption) {
      return exactOption;
    }

    const menuRoots = getVisibleGeminiModelMenuRoots();
    if (menuRoots.length === 0) {
      return null;
    }

    const candidates = uniqueElements(menuRoots.flatMap((root) => Array.from(root.querySelectorAll(
      "button, [role='button'], [role='option'], [role='menuitem'], li, div"
    ))))
      .filter((element) => element instanceof HTMLElement)
      .filter(isVisible)
      .filter((element) => !isDisabled(element))
      .filter((element) => element !== selector)
      .map((element) => ({
        element,
        score: getGeminiModelOptionScore(element, model, selector)
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score);

    return candidates[0]?.element || null;
  }

  function getVisibleGeminiModelMenuRoots() {
    const selectors = [
      "div[popover='manual'].cdk-overlay-popover",
      "[popover='manual']",
      "gem-popover",
      ".cdk-overlay-pane .gds-mode-switch-menu",
      ".cdk-overlay-pane .mat-mdc-menu-panel",
      ".cdk-overlay-pane [role='menu']",
      ".gds-mode-switch-menu",
      ".mat-mdc-menu-panel[role='menu']",
      "[role='menu']"
    ];
    const roots = [];

    for (const selector of selectors) {
      try {
        for (const element of Array.from(document.querySelectorAll(selector))) {
          if (
            element instanceof HTMLElement
            && isVisible(element)
            && !roots.includes(element)
            && isGeminiModelMenuRoot(element)
          ) {
            roots.push(element);
          }
        }
      } catch (_) {
        // Ignore selector failures.
      }
    }

    return roots;
  }

  function isGeminiModelMenuRoot(element) {
    const label = normalizeForComparison(getElementLabel(element));
    return element.classList.contains("gds-mode-switch-menu")
      || label.includes("gemini 3")
      || label.includes("bard-mode-option")
      || label.includes("3.1 flash-lite")
      || label.includes("3.5 flash")
      || label.includes("3.1 pro")
      || label.includes("사고 수준")
      || label.includes("thinking_level")
      || label.includes("standard")
      || label.includes("extended")
      || label.includes("fast model")
      || label.includes("thinking model");
  }

  function findExactGeminiModelOption(model) {
    for (const selector of getExactGeminiModelOptionSelectors(model)) {
      try {
        const element = document.querySelector(selector);
        if (element instanceof HTMLElement && isVisible(element) && !isDisabled(element)) {
          return element;
        }
      } catch (_) {
        // Ignore selector failures.
      }
    }

    return null;
  }

  function getExactGeminiModelOptionSelectors(model) {
    const selectorsByValue = {
      fast: [
        "button[data-test-id='bard-mode-option-빠른모델']",
        "button[data-test-id='bard-mode-option-fast']",
        "button[data-mode-id][data-test-id*='bard-mode-option'][data-test-id*='fast']"
      ],
      thinking: [
        "button[data-test-id='bard-mode-option-사고모델']",
        "button[data-test-id='bard-mode-option-thinking']",
        "button[data-mode-id][data-test-id*='bard-mode-option'][data-test-id*='thinking']"
      ],
      pro: [
        "button[data-test-id='bard-mode-option-pro']",
        "button[data-mode-id][data-test-id*='bard-mode-option'][data-test-id*='pro']"
      ]
    };

    return selectorsByValue[model?.value] || [];
  }

  function isGeminiModelOptionSelected(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    return element.getAttribute("aria-current") === "true"
      || element.getAttribute("aria-selected") === "true"
      || element.getAttribute("aria-checked") === "true"
      || element.getAttribute("data-selected") === "true"
      || element.classList.contains("is-selected")
      || element.classList.contains("selected")
      || element.classList.contains("active")
      || element.matches("[data-active='true']")
      || hasGeminiModelSelectedCheck(element);
  }

  function getGeminiModelOptionScore(element, model, selector) {
    const label = normalizeForComparison(getElementLabel(element));
    let score = 0;

    if (isGeminiModelLabelMatch(label, model.matchers)) {
      score += 10;
    }

    const matchedModelCount = getMatchedGeminiModelCount(label);
    if (matchedModelCount > 1) {
      score -= matchedModelCount * 2;
    }

    if (label.includes("gemini 3")) {
      score -= 4;
    }

    if (selector && areElementsNear(element, selector)) {
      score += 4;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width > 80 && rect.height > 24) {
      score += 1;
    }

    if (label.includes("profile") || label.includes("account") || label.includes("프로필") || label.includes("계정")) {
      score -= 12;
    }

    return score;
  }

  function getGeminiElementDiagnostics(element) {
    if (!(element instanceof HTMLElement)) {
      return null;
    }

    return {
      label: normalizeForComparison(getElementLabel(element)).slice(0, 180),
      tag: element.tagName.toLowerCase(),
      role: element.getAttribute("role") || "",
      testId: element.getAttribute("data-test-id") || "",
      modeId: element.getAttribute("data-mode-id") || "",
      ariaDisabled: element.getAttribute("aria-disabled") || "",
      className: String(element.className || "").slice(0, 140)
    };
  }

  function getVisibleGeminiModelMenuCandidates(selector) {
    const menuRoots = getVisibleGeminiModelMenuRoots();
    const elements = menuRoots.length > 0
      ? uniqueElements(menuRoots.flatMap((root) => Array.from(root.querySelectorAll(
        "button, [role='button'], [role='option'], [role='menuitem'], li, div"
      ))))
      : [];

    return elements
      .filter((element) => element instanceof HTMLElement)
      .filter(isVisible)
      .map((element) => ({
        ...getGeminiElementDiagnostics(element),
        nearSelector: selector ? areElementsNear(element, selector) : false
      }))
      .filter((candidate) => candidate.label)
      .slice(0, 20);
  }

  function getGeminiModelMenuRootDiagnostics() {
    return Array.from(document.querySelectorAll(".cdk-overlay-pane, .mat-mdc-menu-panel, .gds-mode-switch-menu, [role='menu']"))
      .filter((element) => element instanceof HTMLElement)
      .map((element) => ({
        ...getGeminiElementDiagnostics(element),
        visible: isVisible(element),
        isMenuRoot: isGeminiModelMenuRoot(element)
      }))
      .slice(0, 12);
  }

  function isAnyGeminiModelLabel(label) {
    return globalThis.YGS.GEMINI_MODELS
      .filter((model) => model.value !== "none")
      .some((model) => isGeminiModelLabelMatch(label, model.selectedMatchers));
  }

  function getMatchedGeminiModelCount(label) {
    return globalThis.YGS.GEMINI_MODELS
      .filter((model) => model.value !== "none")
      .filter((model) => isGeminiModelLabelMatch(label, model.matchers))
      .length;
  }

  function isGeminiModelLabelMatch(value, matchers) {
    const label = normalizeForComparison(value);
    return Array.isArray(matchers)
      && matchers.some((matcher) => {
        const normalizedMatcher = normalizeForComparison(matcher);
        if (normalizedMatcher.startsWith("exact:")) {
          return label === normalizedMatcher.slice("exact:".length);
        }

        return label.includes(normalizedMatcher);
      });
  }

  function removeRequestIdHash() {
    try {
      if (!location.hash.includes("ygsRequestId=")) {
        return;
      }

      const url = new URL(location.href);
      url.hash = "";
      history.replaceState(history.state, document.title, url.toString());
    } catch (error) {
      globalThis.YGS.warn("Failed to remove Gemini request id hash", error);
    }
  }

  async function getPendingPrompt(requestId) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: globalThis.YGS.MESSAGE_TYPES.GET_PENDING_PROMPT,
        requestId
      });

      return response?.payload || null;
    } catch (error) {
      globalThis.YGS.warn("Failed to get pending Gemini prompt", error);
      return null;
    }
  }

  async function clearPendingPrompt(requestId) {
    try {
      await chrome.runtime.sendMessage({
        type: globalThis.YGS.MESSAGE_TYPES.CLEAR_PENDING_PROMPT,
        requestId
      });
    } catch (error) {
      globalThis.YGS.warn("Failed to clear pending Gemini prompt", error);
    }
  }

  async function waitForDocumentReady() {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      return;
    }

    await new Promise((resolve) => {
      document.addEventListener("DOMContentLoaded", resolve, { once: true });
    });
  }

  async function waitForComposerInput(timeoutMs) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const input = findComposerInput();
      if (input) {
        return input;
      }

      await delay(POLL_MS);
    }

    return null;
  }

  function findComposerInput() {
    const selectors = [
      "rich-textarea [contenteditable='true']",
      "div.ql-editor[contenteditable='true']",
      "div.ProseMirror[contenteditable='true']",
      "[contenteditable='true'][role='textbox']",
      "[role='textbox'][contenteditable='true']",
      "[contenteditable='true']",
      "textarea",
      "input[type='text']"
    ];

    const candidates = [];

    for (const selector of selectors) {
      try {
        for (const element of document.querySelectorAll(selector)) {
          if (element instanceof HTMLElement && isUsableInputElement(element)) {
            candidates.push(element);
          }
        }
      } catch (_) {
        // Ignore selector failures.
      }
    }

    return uniqueElements(candidates)
      .map((element) => ({
        element,
        score: getInputScore(element)
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)[0]?.element || null;
  }

  function getInputScore(element) {
    const label = normalizeForComparison([
      element.getAttribute("aria-label") || "",
      element.getAttribute("placeholder") || "",
      element.getAttribute("data-placeholder") || "",
      element.textContent || ""
    ].join(" "));

    let score = 1;
    if (label.includes("prompt") || label.includes("message") || label.includes("질문") || label.includes("메시지")) {
      score += 5;
    }
    if (element.closest("rich-textarea, prompt-input, bard-prompt-input, .input-area, form")) {
      score += 4;
    }

    const rect = element.getBoundingClientRect();
    if (rect.bottom > globalThis.innerHeight * 0.45) {
      score += 2;
    }

    return score;
  }

  function isUsableInputElement(element) {
    if (!isVisible(element)) {
      return false;
    }

    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      return !element.disabled && !element.readOnly;
    }

    return element.isContentEditable;
  }

  function injectPrompt(element, prompt) {
    const adapter = inputAdapters.find((candidate) => candidate.canHandle(element));
    if (!adapter) {
      globalThis.YGS.warn("No input adapter matched Gemini composer input");
      return false;
    }

    try {
      adapter.inject(element, prompt);

      const actualText = normalizeForComparison(adapter.read(element));
      const expectedPrefix = normalizeForComparison(prompt).slice(0, 80);

      if (expectedPrefix && !actualText.includes(expectedPrefix)) {
        globalThis.YGS.warn("Gemini composer did not visibly contain expected prompt prefix", adapter.name);
      }

      return true;
    } catch (error) {
      globalThis.YGS.warn(`Gemini prompt injection failed in ${adapter.name} adapter`, error);
      return false;
    }
  }

  function composerContainsPrompt(element, prompt) {
    const adapter = inputAdapters.find((candidate) => candidate.canHandle(element));
    if (!adapter) {
      return false;
    }

    const actualText = normalizeForComparison(adapter.read(element));
    const expectedPrefix = normalizeForComparison(prompt).slice(0, 80);
    return !expectedPrefix || actualText.includes(expectedPrefix);
  }

  function insertTextIntoContentEditable(element, text) {
    element.focus();

    const selection = globalThis.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);

    selection.removeAllRanges();
    selection.addRange(range);

    const inserted = document.execCommand("insertText", false, text);
    if (!inserted || normalizeForComparison(element.innerText || element.textContent || "").length === 0) {
      element.textContent = text;
    }
  }

  function dispatchInputEvents(element, text) {
    try {
      element.dispatchEvent(new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        inputType: "insertText",
        data: text
      }));
    } catch (_) {
      // Some pages may reject synthetic beforeinput details.
    }

    try {
      element.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        inputType: "insertText",
        data: text
      }));
    } catch (_) {
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }

    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  async function submitPrompt(input) {
    const button = await waitForSubmitButton(input, 6000);
    if (!button) {
      return false;
    }

    try {
      clickElementLikeUser(button);
      return true;
    } catch (error) {
      globalThis.YGS.warn("Gemini submit button click failed", error);
      return false;
    }
  }

  async function waitForSubmitButton(input, timeoutMs) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const button = findSubmitButton(input);
      if (button) {
        return button;
      }

      await delay(POLL_MS);
    }

    return null;
  }

  function findSubmitButton(input) {
    const candidates = Array.from(document.querySelectorAll("button, [role='button']"))
      .filter((element) => element instanceof HTMLElement)
      .filter(isVisible)
      .filter((element) => !isDisabled(element))
      .map((element) => ({
        element,
        score: getSubmitButtonScore(element, input)
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score);

    return candidates[0]?.element || null;
  }

  function getSubmitButtonScore(element, input) {
    const label = normalizeForComparison(getElementLabel(element));
    let score = 0;

    if (
      label.includes("send")
      || label.includes("submit")
      || label.includes("전송")
      || label.includes("보내기")
      || label.includes("제출")
    ) {
      score += 8;
    }

    if (label.includes("voice") || label.includes("microphone") || label.includes("mic") || label.includes("upload")) {
      score -= 8;
    }

    if (element.querySelector("mat-icon, svg")) {
      score += 1;
    }

    if (input && areElementsNear(element, input)) {
      score += 5;
      const elementRect = element.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();
      const elementCenterX = (elementRect.left + elementRect.right) / 2;
      const rightSideThreshold = inputRect.left + inputRect.width * 0.72;
      const leftSideThreshold = inputRect.left + inputRect.width * 0.35;

      if (elementCenterX > rightSideThreshold) {
        score += 7;
      } else if (elementCenterX < leftSideThreshold) {
        score -= 5;
      }
    }

    if (
      label.includes("tool")
      || label.includes("tools")
      || label.includes("도구")
      || label.includes("attach")
      || label.includes("upload")
      || label.includes("model")
      || label.includes("모델")
    ) {
      score -= 8;
    }

    return score;
  }

  function areElementsNear(left, right) {
    const leftRect = left.getBoundingClientRect();
    const rightRect = right.getBoundingClientRect();
    const verticalDistance = Math.abs((leftRect.top + leftRect.bottom) / 2 - (rightRect.top + rightRect.bottom) / 2);
    const horizontalDistance = Math.abs((leftRect.left + leftRect.right) / 2 - (rightRect.left + rightRect.right) / 2);
    return verticalDistance < 180 && horizontalDistance < 900;
  }

  function clickElementLikeUser(element, options = {}) {
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

    clickElementAt(element, 0.5, 0.5);

    if (options.nativeClick !== false) {
      try {
        element.click?.();
      } catch (_) {
        // Some framework-managed elements may reject direct click.
      }
    }
  }

  function dispatchKeyboardActivation(element) {
    try {
      element.focus?.({ preventScroll: true });
    } catch (_) {
      // Ignore focus failures.
    }

    for (const key of ["Enter", " "]) {
      const code = key === " " ? "Space" : "Enter";
      for (const type of ["keydown", "keyup"]) {
        try {
          element.dispatchEvent(new KeyboardEvent(type, {
            bubbles: true,
            cancelable: true,
            composed: true,
            view: globalThis,
            key,
            code,
            keyCode: key === " " ? 32 : 13,
            which: key === " " ? 32 : 13
          }));
        } catch (_) {
          // Ignore keyboard dispatch failures.
        }
      }
    }
  }

  function clickElementAt(element, xRatio, yRatio) {
    const rect = element.getBoundingClientRect();
    const clientX = rect.left + rect.width * xRatio;
    const clientY = rect.top + rect.height * yRatio;

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
  }

  function isDisabled(element) {
    return Boolean(
      element.disabled
      || element.getAttribute("aria-disabled") === "true"
      || element.hasAttribute("disabled")
    );
  }

  function isVisible(element) {
    const rect = element.getBoundingClientRect();
    const style = globalThis.getComputedStyle(element);
    return rect.width > 0
      && rect.height > 0
      && style.visibility !== "hidden"
      && style.display !== "none";
  }

  function getElementLabel(element) {
    return [
      element.getAttribute("aria-label") || "",
      element.getAttribute("title") || "",
      element.getAttribute("data-tooltip") || "",
      element.getAttribute("data-testid") || "",
      element.innerText || "",
      element.textContent || ""
    ].join(" ");
  }

  function getNearbyText(element) {
    const parts = [];
    let current = element;

    for (let depth = 0; current && depth < 4; depth += 1) {
      if (current instanceof HTMLElement) {
        parts.push(current.innerText || current.textContent || "");
        parts.push(getElementLabel(current));
      }

      current = current.parentElement;
    }

    return parts.join(" ");
  }

  function normalizeForComparison(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function uniqueElements(elements) {
    return Array.from(new Set(elements.filter(Boolean)));
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  main().catch((error) => {
    globalThis.YGS.warn("Gemini content script failed", error);
  });
})();
