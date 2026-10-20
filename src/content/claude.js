globalThis.YGS = globalThis.YGS || {};

(() => {
  if (globalThis.YGS.__claudeContentScriptStarted) {
    return;
  }
  globalThis.YGS.__claudeContentScriptStarted = true;

  const INPUT_WAIT_MS = 20000;
  const MENU_WAIT_MS = 4000;
  const SUBMIT_CONFIRM_MS = 12000;
  const POLL_MS = 250;

  // Every claude.ai element this script touches is described here and nowhere else.
  // Candidates are tried in order: data-testid, then data-cds/aria labels, then roles.
  // Evidence: docs/ui-dom-captures/claude/new-chat/2026-10-20.md. When the UI changes,
  // update this table and the capture together; the code below should not need edits.
  const ANCHORS = {
    composer: [
      "[data-testid='chat-input'][contenteditable='true']",
      "[data-cds='Editor'][contenteditable='true']",
      "[contenteditable='true'][role='textbox'][aria-label*='Claude']",
      "[contenteditable='true'][role='textbox']"
    ],
    sendButton: [
      "button[data-testid='chat-input-send']",
      "button[aria-label='메시지 보내기']",
      "button[aria-label='Send message']",
      "button[aria-label='Send Message']"
    ],
    modelSelector: [
      "button[data-testid='model-selector-dropdown']",
      "button[data-cds='ModelSelector']",
      "button[aria-haspopup='menu'][aria-label^='모델']",
      "button[aria-haspopup='menu'][aria-label^='Model']"
    ],
    incognitoActive: [
      "[data-testid='incognito-frame']",
      "button[aria-label='시크릿 모드 종료']",
      "button[aria-label*='Exit incognito' i]"
    ],
    openMenu: [
      "[role='menu'][data-open]",
      "[role='menu']"
    ],
    menuRadio: [
      "[role='menuitemradio']"
    ],
    // Compact layout (seen when the tab viewport is 0x0, 2026-10-20): 노력 and 더 많은 모델
    // are inline groups of the main menu instead of submenus.
    menuGroup: [
      "[role='group']"
    ],
    submenuTrigger: [
      "[role='menuitem'][aria-haspopup='menu']"
    ]
  };

  // Text labels that identify a row rather than an element.
  const LABELS = {
    effortRow: ["exact:노력", "exact:effort"],
    modelSelectorPrefix: /^(모델|model)\s*:\s*/i
  };

  const MODEL_LIST = () => globalThis.YGS.CLAUDE_MODELS || [];
  const EFFORT_LIST = () => globalThis.YGS.CLAUDE_EFFORTS || [];

  async function main() {
    await waitForDocumentReady();
    await delay(500);

    const requestId = parseRequestIdFromLocation();
    if (!requestId) {
      return;
    }

    const pending = await getPendingPrompt(requestId);
    if (!pending) {
      globalThis.YGS.log("No pending Claude prompt found for request", requestId);
      return;
    }

    if (pending.useClaudeIncognito !== false) {
      const incognito = await waitForAnchor("incognitoActive", INPUT_WAIT_MS);
      if (!incognito) {
        reportMissing("incognitoActive", "Claude incognito not confirmed; prompt injection withheld (prompt is on the clipboard)");
        return;
      }
    }

    const composer = await waitForAnchor("composer", INPUT_WAIT_MS);
    if (!composer) {
      reportMissing("composer", "Claude composer not found; prompt left on the clipboard for manual paste");
      return;
    }

    const selection = await selectModelAndEffortIfRequested(pending.claudeModel, pending.claudeEffort);

    const input = findAnchor("composer") || composer;
    if (!injectPrompt(input, pending.prompt)) {
      globalThis.YGS.warn("Claude prompt injection not confirmed; prompt left on the clipboard for manual paste");
      return;
    }
    globalThis.YGS.log("Prompt injected into Claude composer");

    await clearPendingPrompt(requestId);
    removeRequestIdHash();

    if (pending.autoSubmit !== true) {
      globalThis.YGS.log("autoSubmit is false; Claude prompt left in composer");
      return;
    }

    if (!selection.confirmed) {
      globalThis.YGS.warn("Claude auto-submit withheld because requested model or effort was not confirmed", selection);
      return;
    }

    const result = await submitPrompt(input);
    globalThis.YGS.log(`Claude submission ${result.confirmed ? "confirmed" : "unconfirmed"}`, result);
  }

  // ---- anchors -------------------------------------------------------------

  function findAnchor(name, root = document) {
    for (const selector of ANCHORS[name]) {
      const match = Array.from(root.querySelectorAll(selector)).find(isVisible);
      if (match) {
        return match;
      }
    }
    return null;
  }

  function findAllAnchors(name, root = document) {
    for (const selector of ANCHORS[name]) {
      const matches = Array.from(root.querySelectorAll(selector)).filter(isVisible);
      if (matches.length > 0) {
        return matches;
      }
    }
    return [];
  }

  async function waitForAnchor(name, timeoutMs, root = document) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      const match = findAnchor(name, root);
      if (match) {
        return match;
      }
      await delay(POLL_MS);
    }
    return null;
  }

  // One line that says what was looked for, so a UI change is diagnosable from the console.
  function reportMissing(name, message) {
    globalThis.YGS.warn(message, { anchor: name, tried: ANCHORS[name] });
  }

  // ---- model and effort ----------------------------------------------------

  async function selectModelAndEffortIfRequested(modelValue, effortValue) {
    const model = findListItem(MODEL_LIST(), modelValue);
    const effort = findListItem(EFFORT_LIST(), effortValue);
    const result = { confirmed: true, model: modelValue || "none", effort: effortValue || "none" };
    if (!model && !effort) {
      return result;
    }

    const selector = await waitForAnchor("modelSelector", INPUT_WAIT_MS);
    if (!selector) {
      reportMissing("modelSelector", "Claude model selector not found");
      return { ...result, confirmed: false, step: "selector" };
    }

    if (model && !selectorShowsModel(selector, model)) {
      const ok = await chooseFromMenu(selector, null, model);
      if (!ok || !(await waitFor(() => selectorShowsModel(findAnchor("modelSelector") || selector, model)))) {
        globalThis.YGS.warn("Claude model selection not confirmed", { model: model.value, shown: readSelectorLabel(findAnchor("modelSelector")) });
        await closeMenus();
        return { ...result, confirmed: false, step: "model" };
      }
      globalThis.YGS.log("Claude model selected", model.value);
    }

    if (effort && !selectorShowsEffort(findAnchor("modelSelector") || selector, effort)) {
      const current = findAnchor("modelSelector") || selector;
      const ok = await chooseFromMenu(current, LABELS.effortRow, effort);
      if (!ok || !(await waitFor(() => selectorShowsEffort(findAnchor("modelSelector") || current, effort)))) {
        globalThis.YGS.warn("Claude effort selection not confirmed", { effort: effort.value, shown: readSelectorLabel(findAnchor("modelSelector")) });
        await closeMenus();
        return { ...result, confirmed: false, step: "effort" };
      }
      globalThis.YGS.log("Claude effort selected", effort.value);
    }

    await closeMenus();
    return result;
  }

  // Opens the model menu, narrows to a section (inline group or submenu whose label matches
  // sectionMatchers), and clicks the radio row matching item. Returns false (after logging)
  // when any step is missing.
  async function chooseFromMenu(selector, sectionMatchers, item) {
    const menu = await openMenu(selector);
    if (!menu) {
      reportMissing("openMenu", "Claude model menu did not open");
      return false;
    }

    let scope = menu;
    const inlineGroup = sectionMatchers
      ? findAllAnchors("menuGroup", menu).find((group) => rowMatches(group, sectionMatchers))
      : null;
    if (inlineGroup) {
      scope = inlineGroup;
    } else if (sectionMatchers) {
      const trigger = findAllAnchors("submenuTrigger", menu).find((row) => rowMatches(row, sectionMatchers));
      if (!trigger) {
        globalThis.YGS.warn("Claude effort section not found in model menu", {
          tried: [...ANCHORS.menuGroup, ...ANCHORS.submenuTrigger],
          label: sectionMatchers
        });
        return false;
      }
      hoverElement(trigger);
      clickElementLikeUser(trigger);
      scope = await waitFor(() => findAllAnchors("openMenu").find((candidate) => candidate !== menu), MENU_WAIT_MS);
      if (!scope) {
        reportMissing("openMenu", "Claude effort submenu did not open");
        return false;
      }
    }

    const radios = findAllAnchors("menuRadio", scope);
    const row = pickRow(radios, item.matchers);
    if (!row) {
      globalThis.YGS.warn("Claude menu option not found", {
        wanted: item.value,
        tried: ANCHORS.menuRadio,
        rows: radios.map((radio) => readRowName(radio)).slice(0, 12)
      });
      return false;
    }

    if (row.getAttribute("aria-checked") !== "true") {
      clickElementLikeUser(row);
    }
    await delay(300);
    return true;
  }

  async function openMenu(selector) {
    const existing = findAnchor("openMenu");
    if (existing) {
      return existing;
    }
    clickElementLikeUser(selector);
    const menu = await waitFor(() => findAnchor("openMenu"), MENU_WAIT_MS);
    if (menu) {
      return menu;
    }
    // Some menu triggers ignore synthetic pointer sequences but accept a keyboard open.
    dispatchKey(selector, "Enter");
    return waitFor(() => findAnchor("openMenu"), MENU_WAIT_MS);
  }

  // base-ui closes on Escape sent to the menu element itself (2026-10-20).
  async function closeMenus() {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const menus = findAllAnchors("openMenu");
      if (menus.length === 0) {
        return;
      }
      dispatchKey(menus[menus.length - 1], "Escape");
      await delay(250);
    }
  }

  function pickRow(rows, matchers) {
    return rows.find((row) => rowMatches(row, matchers)) || null;
  }

  function rowMatches(row, matchers) {
    return matchesLabel(readRowName(row), matchers);
  }

  // A menu row is "name\ndescription" or "name badge"; the first line is the name.
  function readRowName(row) {
    const text = String(row?.innerText || row?.textContent || "");
    const firstLine = text.split(/\n/).map((line) => line.trim()).find(Boolean) || "";
    return firstLine.replace(/\s+/g, " ");
  }

  // "exact:x" compares the first word, "prefix:x" the start of the name. Case-insensitive.
  function matchesLabel(name, matchers) {
    const normalized = String(name || "").trim().toLowerCase();
    const firstWord = normalized.split(" ")[0] || "";
    return (matchers || []).some((matcher) => {
      const [kind, value] = matcher.includes(":") ? matcher.split(/:(.*)/s) : ["prefix", matcher];
      const wanted = value.toLowerCase();
      return kind === "exact" ? firstWord === wanted : normalized.startsWith(wanted);
    });
  }

  // The selector's aria-label reads "모델: Opus 5.5 높음" (model name, then effort word).
  function readSelectorLabel(selector) {
    if (!selector) {
      return "";
    }
    const label = selector.getAttribute("aria-label") || selector.innerText || selector.textContent || "";
    return String(label).replace(LABELS.modelSelectorPrefix, "").replace(/\s+/g, " ").trim();
  }

  function selectorShowsModel(selector, model) {
    return matchesLabel(readSelectorLabel(selector), model.matchers);
  }

  function selectorShowsEffort(selector, effort) {
    const words = readSelectorLabel(selector).split(" ");
    const lastWord = words[words.length - 1] || "";
    return matchesLabel(lastWord, effort.matchers);
  }

  function findListItem(list, value) {
    const item = list.find((candidate) => candidate.value === value);
    return item && item.matchers.length > 0 ? item : null;
  }

  // ---- prompt --------------------------------------------------------------

  function injectPrompt(element, prompt) {
    try {
      element.focus();
      const selection = globalThis.getSelection();
      selection.selectAllChildren(element);
      document.execCommand("insertText", false, prompt);
    } catch (error) {
      globalThis.YGS.warn("Claude insertText failed", error);
    }
    return composerContainsPrompt(element, prompt);
  }

  function composerContainsPrompt(element, prompt) {
    const actual = normalizeForComparison(element.innerText || element.textContent || "");
    const expectedPrefix = normalizeForComparison(prompt).slice(0, 80);
    return Boolean(expectedPrefix) && actual.includes(expectedPrefix);
  }

  async function submitPrompt(input) {
    const startPath = location.pathname;
    const button = await waitFor(() => {
      const candidate = findAnchor("sendButton");
      return candidate && !isDisabled(candidate) ? candidate : null;
    }, 6000);
    if (!button) {
      reportMissing("sendButton", "Claude send button not found or disabled");
      return { confirmed: false, step: "send-button" };
    }

    clickElementLikeUser(button);
    const sent = await waitFor(() => {
      const composer = findAnchor("composer") || input;
      const emptied = normalizeForComparison(composer?.innerText || "").length === 0;
      return location.pathname !== startPath || emptied ? { path: location.pathname !== startPath, emptied } : null;
    }, SUBMIT_CONFIRM_MS);
    return sent ? { confirmed: true, ...sent } : { confirmed: false, step: "after-click" };
  }

  // ---- page plumbing ------------------------------------------------------

  function parseRequestIdFromLocation() {
    const params = new URLSearchParams(location.hash.replace(/^#/, ""));
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
      globalThis.YGS.warn("Failed to remove Claude request id hash", error);
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
      globalThis.YGS.warn("Failed to get pending Claude prompt", error);
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
      globalThis.YGS.warn("Failed to clear pending Claude prompt", error);
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

  async function waitFor(check, timeoutMs = MENU_WAIT_MS) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      const value = check();
      if (value) {
        return value;
      }
      await delay(POLL_MS);
    }
    return null;
  }

  function hoverElement(element) {
    const rect = element.getBoundingClientRect();
    const init = { bubbles: true, cancelable: true, composed: true, view: globalThis, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2, pointerType: "mouse", isPrimary: true, pointerId: 1 };
    for (const type of ["pointerover", "pointerenter", "pointermove"]) {
      element.dispatchEvent(new PointerEvent(type, init));
    }
    for (const type of ["mouseover", "mouseenter", "mousemove"]) {
      element.dispatchEvent(new MouseEvent(type, init));
    }
  }

  function clickElementLikeUser(element) {
    try {
      element.scrollIntoView?.({ block: "nearest", inline: "nearest" });
      element.focus?.({ preventScroll: true });
    } catch (_) {
      // Ignore scroll and focus failures.
    }

    const rect = element.getBoundingClientRect();
    const clientX = rect.left + rect.width / 2;
    const clientY = rect.top + rect.height / 2;
    for (const type of ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]) {
      const isDown = type.endsWith("down");
      const init = {
        bubbles: true,
        cancelable: true,
        composed: true,
        view: globalThis,
        clientX,
        clientY,
        button: 0,
        buttons: isDown ? 1 : 0,
        detail: 1
      };
      element.dispatchEvent(type.startsWith("pointer")
        ? new PointerEvent(type, { ...init, pointerId: 1, pointerType: "mouse", isPrimary: true })
        : new MouseEvent(type, init));
    }
  }

  function dispatchKey(element, key) {
    const code = key === "Enter" ? "Enter" : key;
    const keyCode = key === "Enter" ? 13 : key === "Escape" ? 27 : 0;
    for (const type of ["keydown", "keyup"]) {
      element.dispatchEvent(new KeyboardEvent(type, { bubbles: true, cancelable: true, composed: true, key, code, keyCode, which: keyCode }));
    }
  }

  function isDisabled(element) {
    return Boolean(element.disabled || element.getAttribute("aria-disabled") === "true" || element.hasAttribute("disabled"));
  }

  // A tab that has never been shown reports 0x0 for everything, so only style decides.
  function isVisible(element) {
    const style = globalThis.getComputedStyle(element);
    return style.visibility !== "hidden" && style.display !== "none";
  }

  function normalizeForComparison(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  main().catch((error) => {
    globalThis.YGS.warn("Claude content script failed", error);
  });
})();
