globalThis.YGS = globalThis.YGS || {};

(() => {
  if (globalThis.YGS.__chatgptContentScriptStarted) {
    return;
  }
  globalThis.YGS.__chatgptContentScriptStarted = true;

  const INPUT_WAIT_MS = 20000;
  const POLL_MS = 300;
  const CHATGPT_MODEL_PLAN_A_ONLY = false;
  const CHATGPT_SEND_PLAN_A_ONLY = false;

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
      globalThis.YGS.log("No pending prompt found for request", requestId);
      await notifyChatGptQueueDone(requestId, "no-pending-prompt");
      return;
    }

    const input = await waitForComposerInput(INPUT_WAIT_MS);
    if (!input) {
      globalThis.YGS.warn("ChatGPT composer input not found; pending prompt left available for retry");
      await notifyChatGptQueueDone(requestId, "composer-not-found");
      return;
    }

    const selectionConfirmed = await selectChatGptPreferences(pending.chatgptModelFamily, pending.chatgptReasoningEffort, input);
    if (!selectionConfirmed) {
      globalThis.YGS.warn("ChatGPT model/effort not confirmed; prompt injection and submission withheld");
      await notifyChatGptQueueDone(requestId, "selection-not-confirmed");
      return;
    }

    const injected = injectPrompt(input, pending.prompt);
    if (!injected) {
      globalThis.YGS.warn("Prompt injection failed; pending prompt left available for retry");
      await notifyChatGptQueueDone(requestId, "prompt-injection-failed");
      return;
    }

    await clearPendingPrompt(requestId);
    removeRequestIdHash();
    globalThis.YGS.log("Prompt injected into ChatGPT composer");

    if (pending.autoSubmit !== true) {
      globalThis.YGS.log("autoSubmit is false; prompt left in composer");
      await notifyChatGptQueueDone(requestId, "prompt-left-in-composer");
      return;
    }

    if (pending.useTemporaryChat === false) {
      globalThis.YGS.log("Temporary Chat disabled by setting; submitting in regular chat");
      const submitted = await submitPrompt(input);
      if (submitted) {
        globalThis.YGS.log("Prompt submitted");
      } else {
        globalThis.YGS.warn("Auto-submit failed; prompt should remain in composer");
      }
      await notifyChatGptQueueDone(requestId, submitted ? "submitted" : "submit-failed");
      return;
    }

    const temporaryConfirmed = await confirmTemporaryChatIfPossible();
    if (!temporaryConfirmed) {
      globalThis.YGS.warn("Temporary Chat not confirmed; auto-submit withheld");
      await notifyChatGptQueueDone(requestId, "temporary-chat-not-confirmed");
      return;
    }

    const submitted = await submitPrompt(input);
    if (submitted) {
      globalThis.YGS.log("Prompt submitted");
    } else {
      globalThis.YGS.warn("Auto-submit failed; prompt should remain in composer");
    }
    await notifyChatGptQueueDone(requestId, submitted ? "submitted" : "submit-failed");
  }

  function parseRequestIdFromLocation() {
    const hash = location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    return params.get("ygsRequestId") || "";
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
      globalThis.YGS.warn("Failed to remove request id hash", error);
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
      globalThis.YGS.warn("Failed to get pending prompt", error);
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
      globalThis.YGS.warn("Failed to clear pending prompt", error);
    }
  }

  async function notifyChatGptQueueDone(requestId, status) {
    try {
      await chrome.runtime.sendMessage({
        type: globalThis.YGS.MESSAGE_TYPES.CHATGPT_PROMPT_DONE,
        payload: {
          requestId,
          status,
          completedAt: Date.now()
        }
      });
    } catch (error) {
      globalThis.YGS.warn("Failed to notify ChatGPT queue completion", error);
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
    const exactInput = findExactComposerInput();
    if (exactInput) {
      return exactInput;
    }

    const selectors = [
      "#prompt-textarea",
      "textarea",
      "div.ProseMirror[contenteditable='true']",
      "[contenteditable='true'][role='textbox']",
      "[contenteditable='true']"
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

    return uniqueElements(candidates)[0] || null;
  }

  function findExactComposerInput() {
    const selectors = [
      "form[data-type='unified-composer'] #prompt-textarea.ProseMirror[contenteditable='true']",
      "form[data-type='unified-composer'] [contenteditable='true'][role='textbox'][aria-label*='ChatGPT']",
      "form[data-type='unified-composer'] textarea[name='prompt-textarea']",
      "#prompt-textarea.ProseMirror[contenteditable='true']",
      // 2026-10-19 composer: no form data-type or #prompt-textarea id.
      "form [data-composer-input] div.ProseMirror[contenteditable='true'][role='textbox']",
      "form div.ProseMirror[contenteditable='true'][role='textbox'][data-composer-markdown]"
    ];

    for (const selector of selectors) {
      try {
        for (const element of document.querySelectorAll(selector)) {
          if (element instanceof HTMLElement && isUsableInputElement(element)) {
            return element;
          }
        }
      } catch (_) {
        // Ignore selector failures.
      }
    }

    return null;
  }

  function isUsableInputElement(element) {
    if (!isVisible(element)) {
      return false;
    }

    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      return !element.disabled && !element.readOnly;
    }

    if (element.isContentEditable) {
      return true;
    }

    const editableChild = element.querySelector?.("[contenteditable='true']");
    return Boolean(editableChild && isVisible(editableChild));
  }

  function injectPrompt(element, prompt) {
    const target = resolveEditableTarget(element);
    const adapter = inputAdapters.find((candidate) => candidate.canHandle(target));

    if (!adapter) {
      globalThis.YGS.warn("No input adapter matched composer input");
      return false;
    }

    try {
      adapter.inject(target, prompt);

      const actualText = normalizeForComparison(adapter.read(target));
      const expectedPrefix = normalizeForComparison(prompt).slice(0, 80);

      if (expectedPrefix && !actualText.includes(expectedPrefix)) {
        globalThis.YGS.warn("Composer did not visibly contain expected prompt prefix", adapter.name);
      }

      return true;
    } catch (error) {
      globalThis.YGS.warn(`Prompt injection failed in ${adapter.name} adapter`, error);
      return false;
    }
  }

  function resolveEditableTarget(element) {
    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement || element.isContentEditable) {
      return element;
    }

    const editableChild = element.querySelector?.("[contenteditable='true']");
    return editableChild || element;
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
      // Some browsers may reject synthetic beforeinput details.
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

  function readChatGptModelFamily(menu) {
    const panel = menu?.querySelector("[data-testid='composer-model-picker-slider-advanced-view']")
      || menu?.querySelector("[data-model-picker-view]");
    const selected = Array.from(panel?.querySelectorAll("[role='menuitemradio'][aria-checked='true']") || []);
    if (selected.length !== 1) return "";
    const label = normalizeForComparison(selected[0].textContent);
    return globalThis.YGS.CHATGPT_MODEL_FAMILIES.find((item) => item.matchers.includes(label))?.value || "";
  }

  async function openChatGptPicker(input) {
    const button = await waitForChatGptModelButton(input, 5000);
    if (!button) return null;
    if (!findChatGptReasoningMenu(button)) clickElementWithPointerEvents(button, false);
    let menu = await waitForChatGptReasoningState(() => findChatGptReasoningMenu(button), 1800);
    // Recheck at the timeout boundary so a late pointer result is not toggled closed.
    menu = menu || findChatGptReasoningMenu(button);
    if (!menu) {
      globalThis.YGS.log("ChatGPT picker shortcut fallback", "Ctrl+Shift+M");
      button.focus();
      for (const type of ["keydown", "keyup"]) {
        button.dispatchEvent(new KeyboardEvent(type, {
          bubbles: true, cancelable: true, composed: true,
          key: "M", code: "KeyM", keyCode: 77, which: 77,
          ctrlKey: true, shiftKey: true, altKey: false, metaKey: false, repeat: false
        }));
      }
      menu = await waitForChatGptReasoningState(() => findChatGptReasoningMenu(button), 1800);
      if (menu) globalThis.YGS.log("ChatGPT picker opened via shortcut");
      else globalThis.YGS.warn("ChatGPT picker shortcut did not confirm the owned menu");
    }
    return menu ? { button, menu } : null;
  }

  async function setChatGptPickerView(button, advanced) {
    const name = advanced ? "advanced" : "simple";
    const selector = `[data-testid='composer-model-picker-slider-${name}-view'][data-active='true']`;
    const activePanel = () => {
      const menu = findChatGptReasoningMenu(button);
      return menu?.querySelector(selector)
        || menu?.querySelector(`[data-model-picker-view='${name}'] > [data-active='true'][aria-hidden='false']`);
    };
    const read = () => {
      const panel = activePanel();
      return panel && !panel.closest("[inert]") && isVisible(panel) ? panel : null;
    };
    // An active panel can still have zero geometry during its opening animation.
    // Wait for the active view rather than toggling away from it.
    if (activePanel()) return await waitForChatGptReasoningState(read, 1200);
    const menu = findChatGptReasoningMenu(button);
    // The advanced view returns to the slider by selecting a model row.
    // Re-select only the already checked row so the user's current model never changes.
    const currentView = menu?.querySelector("[data-model-picker-view]");
    const rows = !advanced && currentView?.getAttribute("data-model-picker-view") === "advanced"
      ? Array.from(currentView.querySelectorAll("[role='menuitemradio'][aria-checked='true']")) : [];
    const toggle = !advanced && currentView
      ? (rows.length === 1 ? rows[0] : null)
      : menu?.querySelector("[role='menuitem'][data-model-picker-view-toggle='true']")
        || menu?.querySelector("[role='menuitem'][aria-expanded]");
    if (!toggle || toggle.closest("[inert]") || !isVisible(toggle) || toggle.getAttribute("aria-disabled") === "true") return null;
    clickElementWithPointerEvents(toggle, false);
    return await waitForChatGptReasoningState(read, 1200);
  }

  async function selectChatGptPreferences(_familyValue, effortValue, input) {
    // 2026-10-19 user decision: never change the ChatGPT model. The model list changes
    // often (Latest row removed, GPT-6 added); only the reasoning effort is automated.
    // Older pending requests may still carry a model family; it is ignored on purpose.
    const effort = globalThis.YGS.CHATGPT_REASONING_EFFORTS.find((item) => item.value === effortValue);
    if (!effort) return false;
    if (effort.value === "none") {
      globalThis.YGS.log("ChatGPT effort selection skipped; current model and effort kept");
      return true;
    }
    globalThis.YGS.log("ChatGPT selection requested", { model: "unchanged", effort: effort.label });
    try {
      let picker = await openChatGptPicker(input);
      if (!picker) {
        globalThis.YGS.warn("ChatGPT selection stopped: owned picker did not open");
        return false;
      }
      if (!await setChatGptPickerView(picker.button, false)) {
        globalThis.YGS.warn("ChatGPT selection stopped: simple panel not ready");
        return false;
      }
      const initial = await waitForChatGptReasoningState(() => readChatGptSliderState(picker.button), 1200);
      if (!initial) {
        globalThis.YGS.warn("ChatGPT selection stopped: initial slider state not confirmed", getChatGptModelMenuDiagnostics(picker.button));
        return false;
      }
      const values = ["instant", "medium", "high", "extra-high", "pro"];
      const model = initial.model;
      if (!await selectChatGptSliderEffort({ value: effort.value, label: effort.label }, input, picker.button)) return false;

      picker = await openChatGptPicker(input);
      if (!picker || !await setChatGptPickerView(picker.button, false)) return false;
      const final = await waitForChatGptReasoningState(() => readChatGptSliderState(picker.button), 1200);
      const confirmed = Boolean(final) && values[final.value] === effort.value && final.model === model;
      closeOpenMenusIfPossible();
      if (!confirmed) {
        globalThis.YGS.warn("ChatGPT final effort/model readback mismatch", {
          expectedEffort: effort.value, actualEffort: final ? values[final.value] : null, modelBefore: model, modelAfter: final?.model || null
        });
        return false;
      }
      const closed = await waitForChatGptReasoningState(() => {
        const pill = findChatGptModelButton(input);
        return !findChatGptReasoningMenu(picker.button) && pill
          && parseChatGptEffortLabel(pill.innerText || pill.textContent) === effort.value;
      });
      if (closed) globalThis.YGS.log("ChatGPT effort confirmed; model unchanged", { model, effort: effort.value });
      return Boolean(closed);
    } catch (error) {
      globalThis.YGS.warn("ChatGPT selection failed", error);
      return false;
    } finally {
      closeOpenMenusIfPossible();
    }
  }

  async function selectChatGptModelIfRequested(modelValue, input) {
    const option = getChatGptModelOption(modelValue);
    if (!option || option.value === "none") {
      globalThis.YGS.log("ChatGPT reasoning selection skipped");
      return true;
    }

    globalThis.YGS.log("ChatGPT reasoning selection requested", option.label);

    const button = await waitForChatGptModelButton(input, 5000);
    if (!button) {
      globalThis.YGS.warn(
        `ChatGPT reasoning selector not found: ${option.label}`
      );
      return false;
    }

    globalThis.YGS.log(`ChatGPT reasoning selector found: ${getElementLabel(button)}`);

    if (elementIndicatesSelectedChatGptModel(button, option)) {
      globalThis.YGS.log("ChatGPT reasoning already selected", option.label);
      return true;
    }

    try {
      if (button.getAttribute("aria-expanded") !== "true") {
        clickElementWithPointerEvents(button, false);
      }
      const menu = await waitForChatGptReasoningState(() => findChatGptReasoningMenu(button), 1800);
      if (menu?.querySelector("[data-model-reasoning-effort-slider]")) {
        return await selectChatGptSliderEffort(option, input, button);
      }

      const item = await waitForChatGptModelMenuItem(option, button, 6000);

      if (!item) {
        globalThis.YGS.warn(
          `ChatGPT reasoning option not found: ${option.label}; menuCandidates=${JSON.stringify(getChatGptModelMenuDiagnostics(button))}`
        );
        closeOpenMenusIfPossible();
        return false;
      }

      globalThis.YGS.log(`ChatGPT reasoning option found: ${getElementLabel(item)}`);
      activateChatGptModelMenuItem(item);

      const selectedButton = await waitForSelectedChatGptModel(input, option, 2500);
      if (selectedButton && elementIndicatesSelectedChatGptModel(selectedButton, option)) {
        globalThis.YGS.log("ChatGPT reasoning selected", option.label);
      } else {
        globalThis.YGS.warn("ChatGPT reasoning selection unconfirmed", option.label);
        return false;
      }

      return true;
    } catch (error) {
      globalThis.YGS.warn("ChatGPT reasoning selection failed", error);
      closeOpenMenusIfPossible();
      return false;
    }
  }

  function getChatGptModelOption(value) {
    const normalized = normalizeForComparison(value);
    return globalThis.YGS.CHATGPT_REASONING_EFFORTS.find((model) => model.value === normalized)
      || globalThis.YGS.CHATGPT_REASONING_EFFORTS.find((model) => model.value === "none");
  }

  function parseChatGptEffortLabel(text) {
    const label = normalizeForComparison(text).replace(/^(?:gpt[- ]?)?\d+(?:\.\d+)?(?: sol)?\s*/, "");
    return ({ instant: "instant", "즉시": "instant", medium: "medium", "중간": "medium",
      high: "high", "높음": "high", "extra high": "extra-high", "매우 높음": "extra-high", pro: "pro" })[label] || "";
  }

  function findChatGptReasoningMenu(button) {
    if (!button.id) return null;
    return Array.from(document.querySelectorAll("[role='menu'][data-state='open']"))
      .find((menu) => menu.getAttribute("aria-labelledby") === button.id && isVisible(menu)) || null;
  }

  async function waitForChatGptReasoningState(read, timeoutMs = 800) {
    const deadline = Date.now() + timeoutMs;
    do {
      const state = read();
      if (state) return state;
      await delay(80);
    } while (Date.now() < deadline);
    return null;
  }

  function readChatGptSliderState(button) {
    const menu = findChatGptReasoningMenu(button);
    const panel = menu?.querySelector("[data-testid='composer-model-picker-slider-simple-view'][data-active='true']")
      || menu?.querySelector("[data-model-picker-view='simple'] > [data-active='true'][aria-hidden='false']");
    const slider = panel?.querySelector("[data-model-reasoning-effort-slider] [role='slider']")
      || panel?.querySelector("[data-reasoning-slider='true'] [data-model-picker-power-slider] [role='slider']");
    const control = slider?.closest("[role='menuitem']");
    const labelElement = menu?.querySelector("[role='menuitem'][data-model-picker-view-toggle='true']")
      || menu?.querySelector("[role='menuitem'][aria-expanded]");
    const label = labelElement?.innerText || labelElement?.textContent || "";
    const model = menu?.querySelector("[role='menuitemradio'][aria-checked='true']")?.textContent?.trim();
    const raw = slider?.getAttribute("aria-valuenow");
    const value = raw == null || raw.trim() === "" ? NaN : Number(raw);
    const values = ["instant", "medium", "high", "extra-high", "pro"];
    // Numeric positions are accepted only with the captured bounds AND matching live text.
    if (!control || control.closest("[inert]") || !isVisible(control) || !model
      || control.getAttribute("aria-disabled") === "true" || slider.getAttribute("aria-disabled") === "true"
      || slider.getAttribute("aria-valuemin") !== "0" || slider.getAttribute("aria-valuemax") !== "4"
      || !Number.isInteger(value) || !values[value] || parseChatGptEffortLabel(label) !== values[value]) return null;
    return { control, value, model, label: normalizeForComparison(label) };
  }

  async function selectChatGptSliderEffort(option, input, button) {
    const target = ["instant", "medium", "high", "extra-high", "pro"].indexOf(option.value);
    try {
      if (target < 0) {
        globalThis.YGS.warn("ChatGPT slider effort is invalid", option.label);
        return false;
      }
      let state = await waitForChatGptReasoningState(() => readChatGptSliderState(button));
      if (!state) return false;
      const model = state.model;
      for (let step = 0; state.value !== target && step < 4; step += 1) {
        const next = state.value + Math.sign(target - state.value);
        const key = next > state.value ? "ArrowRight" : "ArrowLeft";
        const keyCode = key === "ArrowRight" ? 39 : 37;
        state.control.focus();
        for (const type of ["keydown", "keyup"]) {
          state.control.dispatchEvent(new KeyboardEvent(type, {
            bubbles: true, cancelable: true, composed: true, key, code: key, keyCode, which: keyCode
          }));
        }
        state = await waitForChatGptReasoningState(() => {
          const current = readChatGptSliderState(button);
          return current?.value === next && current.model === model ? current : null;
        });
        if (!state) {
          globalThis.YGS.warn("ChatGPT slider step not confirmed", { key, expectedValue: next });
          return false;
        }
        globalThis.YGS.log("ChatGPT slider step confirmed", { value: state.value, label: state.label, model });
      }
      if (state.value !== target) return false;
      closeOpenMenusIfPossible();
      const confirmed = await waitForChatGptReasoningState(() => {
        const selected = findChatGptModelButton(input);
        return !findChatGptReasoningMenu(button) && selected
          && parseChatGptEffortLabel(selected.innerText || selected.textContent) === option.value;
      });
      if (confirmed) globalThis.YGS.log("ChatGPT reasoning selected via slider", option.label);
      return Boolean(confirmed);
    } finally {
      closeOpenMenusIfPossible();
    }
  }

  async function waitForChatGptModelButton(input, timeoutMs) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const button = findChatGptModelButton(input);
      if (button) {
        return button;
      }

      await delay(POLL_MS);
    }

    return null;
  }

  function findChatGptModelButton(input) {
    const exactButton = findExactChatGptModelButton(input);
    if (exactButton) {
      return exactButton;
    }

    if (CHATGPT_MODEL_PLAN_A_ONLY) {
      globalThis.YGS.warn("ChatGPT model selector Plan B disabled for Plan A test");
      return null;
    }

    const roots = getComposerScopedSearchRoots(input);

    for (const root of roots) {
      const candidates = Array.from(root.querySelectorAll("button, [role='button']"))
        .filter((element) => element instanceof HTMLElement)
        .filter(isVisible)
        .filter((element) => looksLikeChatGptModelSelector(element))
        .map((element) => ({
          element,
          score: getChatGptModelSelectorScore(element)
        }))
        .filter((entry) => entry.score > 0)
        .sort((left, right) => right.score - left.score);

      if (candidates[0]) {
        return candidates[0].element;
      }
    }

    return findDirectChatGptModelButton(input);
  }

  function findExactChatGptModelButton(input) {
    const selectors = [
      // 2026-10-19 composer trigger: semantic reasoning target, no __composer-pill class.
      "button[data-composer-navigation-target='reasoning'][aria-haspopup='menu']",
      "button[data-codex-intelligence-trigger='true'][aria-haspopup='menu']",
      "form[data-type='unified-composer'] button.__composer-pill[data-tone='accent'][aria-haspopup='menu']",
      "form[data-type='unified-composer'] button.__composer-pill[data-tone='neutral'][aria-haspopup='menu']",
      "form[data-type='unified-composer'] button.__composer-pill[aria-haspopup='menu']",
      "button.__composer-pill[data-tone='accent'][aria-haspopup='menu']",
      "button.__composer-pill[data-tone='neutral'][aria-haspopup='menu']",
      "button.__composer-pill[aria-haspopup='menu']"
    ];
    const candidates = [];

    for (const selector of selectors) {
      try {
        for (const element of document.querySelectorAll(selector)) {
          if (
            element instanceof HTMLElement
            && isVisible(element)
            && !hasNegativeModelSelectorLabel(getElementLabel(element), element)
            && looksLikeExactChatGptModelButton(element, input)
          ) {
            candidates.push({
              element,
              score: getExactChatGptModelButtonScore(element, input)
            });
          }
        }
      } catch (_) {
        // Ignore selector failures.
      }
    }

    return candidates
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)[0]?.element || null;
  }

  function findDirectChatGptModelButton(input) {
    const selectors = [
      "button[aria-haspopup='menu']",
      "button[aria-expanded]",
      "button[data-testid*='model' i]",
      "button[aria-label*='model' i]",
      "button[aria-label*='모델']",
      "button"
    ];
    const candidates = [];

    for (const selector of selectors) {
      for (const element of Array.from(document.querySelectorAll(selector))) {
        if (!(element instanceof HTMLElement) || !isVisible(element)) {
          continue;
        }

        const label = getElementLabel(element);
        if (!label || hasNegativeModelSelectorLabel(label, element)) {
          continue;
        }

        const rect = element.getBoundingClientRect();
        if (!isNearComposerInput(element, input)) {
          continue;
        }

        const looksLikeCurrentModel = labelLooksLikeAnyChatGptModelSelector(label);
        const nearComposerY = rect.top > globalThis.innerHeight * 0.35
          && rect.top < globalThis.innerHeight * 0.85;

        if (!looksLikeCurrentModel || !nearComposerY) {
          continue;
        }

        candidates.push({
          element,
          score: getChatGptModelSelectorScore(element) + (nearComposerY ? 60 : 0)
        });
      }
    }

    return candidates
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)[0]?.element || null;
  }

  function looksLikeChatGptModelSelector(element) {
    const label = getElementLabel(element);
    if (!label || hasNegativeModelSelectorLabel(label, element)) {
      return false;
    }

    return looksLikeExactChatGptModelButton(element, null)
      || labelLooksLikeAnyChatGptModelSelector(label);
  }
  function getChatGptModelSelectorScore(element) {
    const label = getElementLabel(element);
    let score = 0;

    for (const model of globalThis.YGS.CHATGPT_REASONING_EFFORTS) {
      if (model.value !== "none" && getModelSelectorMatchers(model).some((matcher) => labelMatchesChatGptModelMatcher(label, matcher))) {
        score += 80;
      }
    }

    if (looksLikeExactChatGptModelButton(element, null)) {
      score += 90;
    }

    if (element.closest("form, [data-testid*='composer' i], [class*='composer' i]")) {
      score += 40;
    }

    return score;
  }

  function looksLikeExactChatGptModelButton(element, input) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    if (isAmbiguousHeaderModelButton(element)) {
      return false;
    }

    if (isSemanticChatGptReasoningTrigger(element)) {
      return input ? isNearComposerInput(element, input) || Boolean(element.closest("form")) : true;
    }

    if (element.matches("button.__composer-pill[aria-haspopup='menu']")) {
      const label = getElementLabel(element);
      return labelLooksLikeAnyChatGptModelSelector(label) || isComposerModelButton(element, input);
    }

    return false;
  }

  function isSemanticChatGptReasoningTrigger(element) {
    return element.matches("button[data-composer-navigation-target='reasoning'][aria-haspopup='menu'], button[data-codex-intelligence-trigger='true'][aria-haspopup='menu']");
  }

  function isAmbiguousHeaderModelButton(element) {
    const compactLabel = normalizeForComparison(getElementLabel(element)).replace(/\s+/g, "");
    return compactLabel === "모델" || compactLabel === "model";
  }

  function isComposerModelButton(element, input) {
    if (element.closest("form[data-type='unified-composer'], [data-composer-surface='true']")) {
      return true;
    }

    return input ? isNearComposerInput(element, input) : false;
  }

  function getExactChatGptModelButtonScore(element, input) {
    let score = 0;

    if (isSemanticChatGptReasoningTrigger(element)) {
      score += 300;
    } else if (element.matches("button.__composer-pill[data-tone='accent'][aria-haspopup='menu']")) {
      score += 180;
    } else if (element.matches("button.__composer-pill[data-tone='neutral'][aria-haspopup='menu']")) {
      score += 175;
    } else if (element.matches("button.__composer-pill[aria-haspopup='menu']")) {
      score += 170;
    }

    if (
      element.matches("button.__composer-pill[aria-haspopup='menu']")
      && labelLooksLikeAnyChatGptModelSelector(getElementLabel(element))
    ) {
      score += 120;
    }

    if (element.closest("form[data-type='unified-composer'], [data-composer-surface='true']")) {
      score += 80;
    }

    if (input && isNearComposerInput(element, input)) {
      score += 40;
    }

    return score;
  }
  async function waitForChatGptModelMenuItem(option, button, timeoutMs) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const item = findChatGptModelMenuItem(option, button);
      if (item) {
        return item;
      }

      await delay(POLL_MS);
    }

    return null;
  }

  function findChatGptModelMenuItem(option, button) {
    const exactItem = findExactChatGptModelMenuItem(option, button);
    if (exactItem) {
      return exactItem;
    }

    if (CHATGPT_MODEL_PLAN_A_ONLY) {
      globalThis.YGS.warn("ChatGPT model option Plan B disabled for Plan A test", option.label);
      return null;
    }

    const buttonRect = button.getBoundingClientRect();
    const selectors = [
      "[role='menuitem']",
      "[role='option']",
      "[role='menuitemradio']",
      "[data-radix-collection-item]",
      "button",
      "[role='button']",
      "div"
    ];
    const candidates = [];

    for (const selector of selectors) {
      for (const element of Array.from(document.querySelectorAll(selector))) {
        if (!(element instanceof HTMLElement) || element === button || !isVisible(element)) {
          continue;
        }

        const label = getElementLabel(element);
        if (
          !label
          || label.length > 160
          || labelContainsMultipleChatGptModelOptions(label)
          || !elementMatchesChatGptModelOption(element, option)
        ) {
          continue;
        }

        const rect = element.getBoundingClientRect();
        const nearSelector = Math.abs(rect.left - buttonRect.left) < 420
          && Math.abs(rect.top - buttonRect.top) < 520;
        const inLikelyMenu = Boolean(element.closest("[role='menu'], [role='listbox'], [data-radix-popper-content-wrapper]"));

        if (!nearSelector && !inLikelyMenu) {
          continue;
        }

        const clickable = resolveChatGptModelMenuClickTarget(element, option);

        candidates.push({
          element: clickable,
          score: (inLikelyMenu ? 40 : 0) + (nearSelector ? 30 : 0) + getModelOptionScore(label, option)
        });
      }
    }

    const best = candidates
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)[0];

    return best?.element || findChatGptModelMenuItemByTextNode(option, button);
  }

  function findExactChatGptModelMenuItem(option, button) {
    const roots = getExactChatGptModelMenuRoots(button);
    const exactTestIdItem = findExactChatGptModelMenuItemByTestId(option, roots);
    if (exactTestIdItem) {
      return exactTestIdItem;
    }

    const selectors = [
      "[role='menuitem']",
      "[role='option']",
      "[role='menuitemradio']",
      "[data-radix-collection-item]",
      "button",
      "[role='button']",
      "div"
    ];

    for (const root of roots) {
      const candidates = [];

      for (const selector of selectors) {
        try {
          for (const element of root.querySelectorAll(selector)) {
            if (!(element instanceof HTMLElement) || !isVisible(element)) {
              continue;
            }

            if (isChatGptProVariantTriggerControl(element)) {
              continue;
            }

            const label = getElementLabel(element);
            if (
              !label
              || label.length > 220
              || labelContainsMultipleChatGptModelOptions(label)
              || !elementMatchesChatGptModelOption(element, option)
            ) {
              continue;
            }

            const clickable = resolveChatGptModelMenuClickTarget(element, option);
            candidates.push({
              element: clickable,
              score: getModelOptionScore(label, option)
                + (element.matches("[role='menuitem'], [role='option'], [data-radix-collection-item]") ? 80 : 0)
                + (label.includes(option.value) ? 40 : 0)
            });
          }
        } catch (_) {
          // Ignore selector failures.
        }
      }

      const best = candidates
        .filter((entry) => entry.score > 0)
        .sort((left, right) => right.score - left.score)[0];

      if (best) {
        return best.element;
      }
    }

    return null;
  }

  function findExactChatGptModelMenuItemByTestId(option, roots) {
    const selectors = getExactChatGptModelMenuItemSelectors(option);

    for (const root of roots) {
      for (const selector of selectors) {
        try {
          for (const element of root.querySelectorAll(selector)) {
            if (
              element instanceof HTMLElement
              && isVisible(element)
              && !isChatGptProVariantTriggerControl(element)
              && elementMatchesChatGptModelOption(element, option)
              && !labelContainsMultipleChatGptModelOptions(getElementLabel(element))
            ) {
              return element;
            }
          }
        } catch (_) {
          // Ignore selector failures.
        }
      }
    }

    return null;
  }

  function getExactChatGptModelMenuItemSelectors(option) {
    void option;
    return [];
  }

  function isChatGptProVariantTriggerControl(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    return element.matches("[data-composer-intelligence-pro-effort-action='true']")
      || Boolean(element.closest("[data-composer-intelligence-pro-effort-action='true']"))
      || normalizeForComparison(element.getAttribute("data-testid") || "") === "composer-intelligence-pro-thinking-effort-trigger"
      || normalizeForComparison(element.getAttribute("aria-label") || "") === "연산량"
      || normalizeForComparison(element.getAttribute("aria-label") || "").includes("강도")
      || normalizeForComparison(element.getAttribute("aria-label") || "").includes("effort");
  }

  function getExactChatGptModelMenuRoots(button) {
    const roots = [];
    const controlledId = button?.getAttribute?.("aria-controls");

    if (controlledId) {
      try {
        const controlled = document.getElementById(controlledId);
        if (controlled instanceof HTMLElement && isVisible(controlled)) {
          roots.push(controlled);
        }
      } catch (_) {
        // Ignore lookup failures.
      }
    }

    for (const selector of [
      "[role='menu']",
      "[role='listbox']",
      "[data-radix-popper-content-wrapper]",
      "[data-side][data-align]"
    ]) {
      try {
        for (const element of document.querySelectorAll(selector)) {
          if (element instanceof HTMLElement && isVisible(element)) {
            roots.push(element);
          }
        }
      } catch (_) {
        // Ignore selector failures.
      }
    }

    return uniqueElements(roots);
  }

  function findChatGptModelMenuItemByTextNode(option, button) {
    const buttonRect = button.getBoundingClientRect();
    const candidates = [];

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const text = normalizeForComparison(node.nodeValue || "");
          return getModelOptionMatchers(option).some((matcher) => labelMatchesChatGptModelMatcher(text, matcher))
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );

    let node = walker.nextNode();
    while (node) {
      const parent = node.parentElement;
      if (parent && isVisible(parent)) {
        const clickable = resolveChatGptModelMenuClickTarget(parent, option);
        const rect = clickable.getBoundingClientRect();
        const nearSelector = Math.abs(rect.left - buttonRect.left) < 520
          && Math.abs(rect.top - buttonRect.top) < 680;
        const inLikelyMenu = Boolean(clickable.closest("[role='menu'], [role='listbox'], [data-radix-popper-content-wrapper]"));
        const label = getElementLabel(clickable);

        const labelIsReasonable = label.length <= 420;
        const allowedByPosition = nearSelector || inLikelyMenu || label === option.value;

        if (
          allowedByPosition
          && labelIsReasonable
          && !labelContainsMultipleChatGptModelOptions(label)
          && elementMatchesChatGptModelOption(clickable, option)
        ) {
          const area = Math.max(1, rect.width * rect.height);
          candidates.push({
            element: clickable,
            score: (inLikelyMenu ? 80 : 0)
              + (nearSelector ? 60 : 0)
              + getModelOptionScore(label, option)
              - Math.min(40, area / 20000)
          });
        }
      }

      node = walker.nextNode();
    }

    const best = candidates
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)[0];

    return best?.element || null;
  }

  async function waitForSelectedChatGptModel(input, option, timeoutMs) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const selectedButton = findChatGptModelButton(input);
      if (selectedButton && elementIndicatesSelectedChatGptModel(selectedButton, option)) {
        return selectedButton;
      }

      await delay(POLL_MS);
    }

    return findChatGptModelButton(input);
  }

  function activateChatGptModelMenuItem(item) {
    const target = resolveChatGptModelMenuClickTarget(item);
    const label = getElementLabel(target);
    globalThis.YGS.log(`ChatGPT reasoning option click target: ${label}`);

    clickElementLikeUser(target);
    clickElementCenterTargetLikeUser(target);
  }

  function resolveChatGptModelMenuClickTarget(element, option) {
    const direct = element.closest?.("button, [role='menuitem'], [role='menuitemradio'], [role='option'], [role='button'], [data-radix-collection-item]");
    if (direct instanceof HTMLElement && isVisible(direct)) {
      return direct;
    }

    let current = element;
    let best = element;
    let bestScore = 0;

    for (let depth = 0; current instanceof HTMLElement && current !== document.body && depth < 8; depth += 1) {
      if (isVisible(current)) {
        const rect = current.getBoundingClientRect();
        const label = getElementLabel(current);
        const labelMatches = option ? elementMatchesChatGptModelOption(current, option) : Boolean(label);
        const rowSized = rect.width >= 120 && rect.height >= 28 && rect.height <= 96;
        const roleLike = current.matches("[role='menuitem'], [role='menuitemradio'], [role='option'], [role='button'], [data-radix-collection-item], button");
        const score = (labelMatches ? 60 : 0)
          + (rowSized ? 40 : 0)
          + (roleLike ? 40 : 0)
          + Math.min(30, rect.width / 10);

        if (score > bestScore && label.length <= 260) {
          best = current;
          bestScore = score;
        }
      }

      current = current.parentElement;
    }

    return best;
  }

  function clickElementLikeUser(element) {
    clickElementWithPointerEvents(element, true);
  }

  function clickElementWithPointerEvents(element, includeNativeClick) {
    const rect = element.getBoundingClientRect();
    const x = Math.max(1, Math.floor(rect.left + rect.width / 2));
    const y = Math.max(1, Math.floor(rect.top + rect.height / 2));

    element.focus?.();

    for (const type of ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]) {
      const EventConstructor = type.startsWith("pointer") && typeof PointerEvent !== "undefined"
        ? PointerEvent
        : MouseEvent;
      element.dispatchEvent(new EventConstructor(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        clientX: x,
        clientY: y,
        button: 0,
        buttons: type.endsWith("down") ? 1 : 0,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true
      }));
    }

    if (includeNativeClick) {
      element.click?.();
    }
  }

  function clickElementCenterTargetLikeUser(element) {
    const rect = element.getBoundingClientRect();
    const x = Math.max(1, Math.floor(rect.left + rect.width / 2));
    const y = Math.max(1, Math.floor(rect.top + rect.height / 2));
    const centerTarget = document.elementFromPoint(x, y);
    if (!(centerTarget instanceof HTMLElement)) {
      return;
    }

    const target = centerTarget.closest("button, [role='menuitem'], [role='menuitemradio'], [role='option'], [role='button'], [data-radix-collection-item]")
      || centerTarget;
    clickElementLikeUser(target);
  }


  function getChatGptModelSelectorDiagnostics() {
    return Array.from(document.querySelectorAll("button, [role='button']"))
      .filter((element) => element instanceof HTMLElement && isVisible(element))
      .map((element) => getElementLabel(element))
      .filter((label) => label && (
        label.includes("즉시")
        || label.includes("중간")
        || label.includes("높음")
        || label.includes("매우 높음")
        || label.includes("instant")
        || label.includes("medium")
        || label.includes("high")
        || label.includes("pro")
        || label.includes("추론")
        || label.includes("intelligence")
        || label.includes("기본")
        || label.includes("확장")
        || label.includes("basic")
        || label.includes("extended")
      ))
      .slice(0, 12);
  }

  function getChatGptModelMenuDiagnostics(button) {
    const buttonRect = button.getBoundingClientRect();
    const menu = findChatGptReasoningMenu(button);
    if (!menu) return [];
    return Array.from(menu.querySelectorAll("[role='menuitem'], [role='menuitemradio'], [role='option']"))
      .filter((element) => element instanceof HTMLElement && isVisible(element))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          label: getElementLabel(element),
          nearSelector: Math.abs(rect.left - buttonRect.left) < 480
            && Math.abs(rect.top - buttonRect.top) < 620
        };
      })
      .filter((entry) => entry.label && entry.label.length <= 180 && (
        entry.label.includes("즉시")
        || entry.label.includes("중간")
        || entry.label.includes("높음")
        || entry.label.includes("매우 높음")
        || entry.label.includes("instant")
        || entry.label.includes("medium")
        || entry.label.includes("high")
        || entry.label.includes("pro")
        || entry.label.includes("추론")
        || entry.label.includes("intelligence")
        || entry.label.includes("기본")
        || entry.label.includes("확장")
        || entry.label.includes("basic")
        || entry.label.includes("extended")
      ))
      .slice(0, 12);
  }

  function elementMatchesChatGptModelOption(element, option) {
    const label = getElementLabel(element);
    return getModelOptionMatchers(option).some((matcher) => labelMatchesChatGptModelMatcher(label, matcher));
  }

  function elementIndicatesSelectedChatGptModel(element, option) {
    const effort = parseChatGptEffortLabel(element.innerText || element.textContent);
    if (effort) return effort === option.value;
    const label = getElementLabel(element);
    if (!label) {
      return false;
    }

    if ((option.value === "medium" || option.value === "high" || option.value === "extra-high") && label.includes("pro")) {
      return false;
    }

    return getModelSelectedMatchers(option).some((matcher) => labelMatchesChatGptModelMatcher(label, matcher));
  }

  function labelLooksLikeAnyChatGptModelSelector(label) {
    return globalThis.YGS.CHATGPT_REASONING_EFFORTS
      .filter((model) => model.value !== "none")
      .some((model) => getModelSelectorMatchers(model).some((matcher) => labelMatchesChatGptModelMatcher(label, matcher)));
  }

  function getModelOptionMatchers(option) {
    return Array.isArray(option.matchers) ? option.matchers : [];
  }

  function getModelSelectedMatchers(option) {
    return Array.isArray(option.selectedMatchers) ? option.selectedMatchers : getModelOptionMatchers(option);
  }

  function getModelSelectorMatchers(option) {
    return Array.from(new Set([
      ...getModelOptionMatchers(option),
      ...getModelSelectedMatchers(option)
    ]));
  }

  function getModelOptionScore(label, option) {
    let score = 0;
    for (const matcher of getModelOptionMatchers(option)) {
      score += getChatGptModelMatcherScore(label, matcher);
    }
    return score;
  }

  function labelMatchesChatGptModelMatcher(label, matcher) {
    return getChatGptModelMatcherScore(label, matcher) > 0;
  }

  function getChatGptModelMatcherScore(label, matcher) {
    const normalizedLabel = normalizeForComparison(label);
    const normalizedMatcher = normalizeForComparison(matcher);
    if (!normalizedLabel || !normalizedMatcher) {
      return 0;
    }

    if (normalizedMatcher.startsWith("exact:")) {
      return normalizedLabel === normalizedMatcher.slice("exact:".length) ? 120 : 0;
    }

    if (normalizedMatcher.startsWith("prefix:")) {
      return labelHasChatGptModelPrefix(normalizedLabel, normalizedMatcher.slice("prefix:".length)) ? 90 : 0;
    }

    if (normalizedLabel === normalizedMatcher) {
      return 100;
    }

    if (normalizedLabel.startsWith(normalizedMatcher)) {
      return 80;
    }

    return normalizedLabel.includes(normalizedMatcher) ? 60 : 0;
  }

  function labelHasChatGptModelPrefix(label, prefix) {
    if (!label || !prefix) {
      return false;
    }

    if (prefix === "높음" && labelHasChatGptModelPrefix(label, "매우 높음")) {
      return false;
    }

    if (prefix === "high" && labelHasChatGptModelPrefix(label, "extra high")) {
      return false;
    }

    if (/^[a-z0-9 .+_-]+$/.test(prefix)) {
      const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|\\s)${escapedPrefix}(?=\\s|$|[+~–-]|\\d)`).test(label);
    }

    return label.startsWith(prefix) || label.includes(` ${prefix}`);
  }

  function labelContainsMultipleChatGptModelOptions(label) {
    const matches = globalThis.YGS.CHATGPT_REASONING_EFFORTS
      .filter((model) => model.value !== "none")
      .filter((model) => getModelOptionMatchers(model).some((matcher) => {
        const normalizedMatcher = normalizeForComparison(matcher);
        return !normalizedMatcher.startsWith("exact:")
          && labelMatchesChatGptModelMatcher(label, matcher);
      }));

    return matches.length > 1;
  }

  function hasNegativeModelSelectorLabel(label, element) {
    if (isReasoningOnlyChatGptLabel(label, element)) {
      return true;
    }

    return [
      "search mode",
      "send",
      "submit",
      "microphone",
      "voice",
      "dictation",
      "upload",
      "attach",
      "attachment",
      "file",
      "add",
      "plus",
      "tools",
      "project",
      "gpt 검색",
      "gpt 탐색",
      "새 프로젝트",
      "보내",
      "전송",
      "마이크",
      "음성",
      "첨부",
      "파일",
      "추가",
      "도구",
      "프로젝트"
    ].some((marker) => label.includes(marker));
  }

  function isReasoningOnlyChatGptLabel(label, element) {
    if (element instanceof HTMLElement && looksLikeComposerModelPill(element)) {
      return false;
    }

    const compact = normalizeForComparison(label).replace(/\s+/g, "");

    if (!compact) {
      return false;
    }

    return [
      "라이트모드",
      "라이트 모드",
      "표준",
      "확장",
      "헤비모드",
      "헤비 모드",
      "lightmode",
      "standard",
      "extended",
      "heavymode",
      "연산량",
      "강도"
    ].includes(compact);
  }

  function looksLikeComposerModelPill(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    return element.matches("button.__composer-pill[aria-haspopup='menu']")
      && Boolean(element.querySelector(".__composer-pill-icon, svg use[href]"));
  }

  function closeOpenMenusIfPossible() {
    try {
      document.dispatchEvent(new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Escape",
        code: "Escape",
        which: 27,
        keyCode: 27
      }));
    } catch (_) {
      // Best-effort cleanup only.
    }
  }

  async function confirmTemporaryChatIfPossible() {
    const initialReason = getTemporaryChatActiveReason();
    if (initialReason) {
      globalThis.YGS.log("Temporary Chat confirmed", initialReason);
      return true;
    }

    const toggle = findTemporaryChatToggle();
    if (toggle && isClearlyOffToggle(toggle)) {
      try {
        toggle.click();
        await delay(1000);
      } catch (error) {
        globalThis.YGS.warn("Temporary Chat toggle click failed", error);
      }
    }

    const finalReason = getTemporaryChatActiveReason();
    if (finalReason) {
      globalThis.YGS.log("Temporary Chat confirmed after toggle check", finalReason);
      return true;
    }

    return false;
  }

  function detectTemporaryChatActive() {
    return Boolean(getTemporaryChatActiveReason());
  }

  function getTemporaryChatActiveReason() {
    if (isTemporaryChatUrlRequested()) {
      return "temporary-chat url parameter";
    }

    const activeToggle = findTemporaryChatToggle((element) => {
      const ariaPressed = element.getAttribute("aria-pressed");
      const ariaChecked = element.getAttribute("aria-checked");
      const dataState = element.getAttribute("data-state");
      return ariaPressed === "true" || ariaChecked === "true" || dataState === "checked";
    });

    if (activeToggle) {
      return "active temporary-chat toggle";
    }

    const bodyText = normalizeForComparison(document.body?.innerText || "");
    const englishTemporaryLabel = bodyText.includes("temporary chat");
    const koreanTemporaryLabel = bodyText.includes("임시 채팅");

    const englishPrivacyMarkers = [
      "won't appear in your history",
      "wont appear in your history",
      "will not appear in your history",
      "not appear in your history",
      "not appear in chat history",
      "won't be used to improve",
      "will not be used to improve",
      "won't be used to train",
      "will not be used to train",
      "not used for training",
      "model training"
    ];

    const koreanPrivacyMarkers = [
      "기록에 표시되지",
      "기록에 나타나지",
      "채팅 기록에 표시되지",
      "채팅 기록에 나타나지",
      "훈련에 사용되지",
      "모델 훈련에 사용되지",
      "당사 모델 훈련",
      "학습에 사용되지",
      "모델 개선",
      "메모리에 접근"
    ];

    if (englishTemporaryLabel && englishPrivacyMarkers.some((marker) => bodyText.includes(marker))) {
      return "temporary-chat privacy copy";
    }

    if (koreanTemporaryLabel && koreanPrivacyMarkers.some((marker) => bodyText.includes(marker))) {
      return "korean temporary-chat privacy copy";
    }

    return "";
  }

  function isTemporaryChatUrlRequested() {
    try {
      const params = new URLSearchParams(location.search);
      return params.get("temporary-chat") === "true";
    } catch (_) {
      return location.search.includes("temporary-chat=true");
    }
  }

  function findTemporaryChatToggle(predicate) {
    const elements = Array.from(document.querySelectorAll("button, [role='button'], [role='switch'], [aria-label], [title]"));

    return elements.find((element) => {
      if (!(element instanceof HTMLElement) || !isVisible(element)) {
        return false;
      }

      const label = normalizeForComparison([
        element.getAttribute("aria-label") || "",
        element.getAttribute("title") || "",
        element.textContent || ""
      ].join(" "));

      const looksTemporary = label.includes("temporary") || label.includes("임시");
      if (!looksTemporary) {
        return false;
      }

      return predicate ? predicate(element) : true;
    }) || null;
  }

  function isClearlyOffToggle(element) {
    const ariaPressed = element.getAttribute("aria-pressed");
    const ariaChecked = element.getAttribute("aria-checked");
    const dataState = element.getAttribute("data-state");
    return ariaPressed === "false" || ariaChecked === "false" || dataState === "unchecked";
  }

  async function submitPrompt(input) {
    const button = await waitForSendButton(input, 5000);
    if (button) {
      try {
        button.click();
        return true;
      } catch (error) {
        globalThis.YGS.warn("Send button click failed", error);
      }
    }

    if (CHATGPT_SEND_PLAN_A_ONLY) {
      globalThis.YGS.warn("ChatGPT Enter submit fallback disabled for Plan A test");
      return false;
    }

    return dispatchEnterFallback(input);
  }

  async function waitForSendButton(input, timeoutMs) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const button = findSendButton(input);
      if (button) {
        return button;
      }

      await delay(POLL_MS);
    }

    return null;
  }

  function findSendButton(input) {
    const roots = getComposerScopedSearchRoots(input);
    const exactButton = findExactSendButton(roots);
    if (exactButton) {
      return exactButton;
    }

    if (CHATGPT_SEND_PLAN_A_ONLY) {
      globalThis.YGS.warn("ChatGPT send button Plan B disabled for Plan A test");
      return null;
    }

    const selectors = [
      "button[data-testid='send-button']",
      "button[data-testid='composer-submit-button']",
      "button[aria-label*='Send' i]",
      "button[aria-label*='Submit' i]",
      "button[aria-label*='prompt' i]",
      "button[aria-label*='보내기']",
      "button[aria-label*='보내']",
      "button[aria-label*='전송']",
      "button[aria-label*='프롬프트']",
      "button[title*='Send' i]",
      "button[title*='Submit' i]",
      "button[type='submit']"
    ];

    const candidates = [];

    for (const root of roots) {
      for (const selector of selectors) {
        try {
          for (const element of root.querySelectorAll(selector)) {
            if (element instanceof HTMLButtonElement) {
              candidates.push(element);
            }
          }
        } catch (_) {
          // Ignore selector failures.
        }
      }

      for (const button of root.querySelectorAll("button")) {
        if (!(button instanceof HTMLButtonElement)) {
          continue;
        }

        const label = getButtonLabel(button);
        if (
          label.includes("send")
          || label.includes("submit")
          || label.includes("prompt")
          || label.includes("보내")
          || label.includes("전송")
          || label.includes("프롬프트")
        ) {
          candidates.push(button);
        }
      }
    }

    const scored = uniqueElements(candidates)
      .filter(isEnabledButton)
      .filter((button) => !hasNegativeSubmitLabel(button))
      .map((button) => ({
        button,
        score: getSendButtonScore(button)
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored[0]) {
      return scored[0].button;
    }

    return findFallbackComposerSubmitButton(roots);
  }

  function findExactSendButton(roots) {
    const selectors = [
      "button#composer-submit-button",
      "button[data-testid='send-button']",
      "button.composer-submit-btn.composer-submit-button-color#composer-submit-button",
      "form[data-type='unified-composer'] button#composer-submit-button",
      "form[data-type='unified-composer'] button[data-testid='send-button']",
      // 2026-10-19 composer: plain form submit button with a localized label only.
      "button[type='submit'][aria-label='보내기']",
      "button[type='submit'][aria-label='Send prompt']",
      "button[type='submit'][aria-label='Send']"
    ];

    for (const root of roots.length ? roots : [document]) {
      for (const selector of selectors) {
        try {
          for (const element of root.querySelectorAll(selector)) {
            if (
              element instanceof HTMLButtonElement
              && isEnabledButton(element)
              && !hasNegativeSubmitLabel(element)
            ) {
              return element;
            }
          }
        } catch (_) {
          // Ignore selector failures.
        }
      }
    }

    return null;
  }

  function getComposerScopedSearchRoots(input) {
    const target = resolveEditableTarget(input);
    const roots = [];

    if (target instanceof HTMLElement) {
      const unifiedComposer = target.closest("form[data-type='unified-composer']");
      const form = target.closest("form");
      const composer = target.closest("[data-testid*='composer' i], [class*='composer' i]");
      if (unifiedComposer) {
        roots.push(unifiedComposer);
      }
      if (form) {
        roots.push(form);
      }
      if (composer) {
        roots.push(composer);
      }
    }

    return uniqueElements(roots);
  }

  function isNearComposerInput(element, input) {
    const target = resolveEditableTarget(input);
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    const elementRect = element.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const sameVerticalBand = elementRect.bottom >= targetRect.top - 140
      && elementRect.top <= targetRect.bottom + 140;
    const notInSidebar = elementRect.left > globalThis.innerWidth * 0.25;
    const reasonableHeight = elementRect.height >= 18 && elementRect.height <= 96;

    return sameVerticalBand && notInSidebar && reasonableHeight;
  }

  function getButtonLabel(button) {
    return getElementLabel(button);
  }

  function getElementLabel(element) {
    return normalizeForComparison([
      element.getAttribute("data-testid") || "",
      element.getAttribute("aria-label") || "",
      element.getAttribute("title") || "",
      element.textContent || ""
    ].join(" "));
  }

  function getSendButtonScore(button) {
    const label = getButtonLabel(button);
    let score = 0;

    if (label.includes("send-button") || label.includes("composer-submit-button")) {
      score += 100;
    }

    if (
      label.includes("send")
      || label.includes("submit")
      || label.includes("보내")
      || label.includes("전송")
    ) {
      score += 80;
    }

    if (label.includes("prompt") || label.includes("프롬프트")) {
      score += 25;
    }

    if (button.getAttribute("type") === "submit") {
      score += 40;
    }

    return score;
  }

  function hasNegativeSubmitLabel(button) {
    const label = getButtonLabel(button);
    return [
      "microphone",
      "voice",
      "dictation",
      "upload",
      "attach",
      "attachment",
      "file",
      "add",
      "plus",
      "tools",
      "model",
      "마이크",
      "음성",
      "녹음",
      "첨부",
      "파일",
      "추가",
      "도구",
      "모델",
      "확장"
    ].some((marker) => label.includes(marker));
  }

  function findFallbackComposerSubmitButton(roots) {
    for (const root of roots) {
      if (root === document) {
        continue;
      }

      const buttons = Array.from(root.querySelectorAll("button"))
        .filter((button) => button instanceof HTMLButtonElement)
        .filter(isEnabledButton)
        .filter((button) => !hasNegativeSubmitLabel(button));

      const submitLike = buttons.find((button) => button.getAttribute("type") === "submit");
      if (submitLike) {
        return submitLike;
      }
    }

    return null;
  }

  function isEnabledButton(button) {
    if (!isVisible(button)) {
      return false;
    }

    if (button.disabled) {
      return false;
    }

    if (button.getAttribute("aria-disabled") === "true") {
      return false;
    }

    return true;
  }

  function dispatchEnterFallback(input) {
    try {
      const target = resolveEditableTarget(input);
      target.focus();

      for (const type of ["keydown", "keypress", "keyup"]) {
        target.dispatchEvent(new KeyboardEvent(type, {
          bubbles: true,
          cancelable: true,
          key: "Enter",
          code: "Enter",
          which: 13,
          keyCode: 13
        }));
      }

      return true;
    } catch (error) {
      globalThis.YGS.warn("Enter fallback failed", error);
      return false;
    }
  }

  function isVisible(element) {
    const rect = element.getBoundingClientRect();
    const style = globalThis.getComputedStyle(element);

    return rect.width > 0
      && rect.height > 0
      && style.visibility !== "hidden"
      && style.display !== "none";
  }

  function uniqueElements(elements) {
    return Array.from(new Set(elements));
  }

  function normalizeForComparison(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  main().catch((error) => {
    globalThis.YGS.warn("ChatGPT content script failed", error);
  });
})();
