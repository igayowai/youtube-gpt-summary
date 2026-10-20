globalThis.YGS = globalThis.YGS || {};

(async () => {
  const customPrompt = document.getElementById("customPrompt");
  const promptModeInputs = Array.from(document.querySelectorAll("input[name='promptMode']"));
  const outputLanguage = document.getElementById("outputLanguage");
  const chatgptReasoningEffort = document.getElementById("chatgptReasoningEffort");
  const geminiModel = document.getElementById("geminiModel");
  const geminiThinkingLevel = document.getElementById("geminiThinkingLevel");
  const claudeModel = document.getElementById("claudeModel");
  const claudeEffort = document.getElementById("claudeEffort");
  const useClaudeIncognito = document.getElementById("useClaudeIncognito");
  const aggressiveTranscriptPrefetch = document.getElementById("aggressiveTranscriptPrefetch");
  const useTemporaryChat = document.getElementById("useTemporaryChat");
  const autoSubmit = document.getElementById("autoSubmit");
  const saveButton = document.getElementById("saveButton");
  const status = document.getElementById("status");

  promptModeInputs.forEach((input) => {
    input.addEventListener("change", updatePromptModeCardStates);
  });

  renderSelectOptions(outputLanguage, globalThis.YGS.OUTPUT_LANGUAGES);
  renderSelectOptions(chatgptReasoningEffort, globalThis.YGS.CHATGPT_REASONING_EFFORTS);
  renderSelectOptions(geminiModel, globalThis.YGS.GEMINI_MODELS);
  renderSelectOptions(geminiThinkingLevel, globalThis.YGS.GEMINI_THINKING_LEVELS);
  renderSelectOptions(claudeModel, globalThis.YGS.CLAUDE_MODELS);
  renderSelectOptions(claudeEffort, globalThis.YGS.CLAUDE_EFFORTS);
  await loadSettings();

  saveButton.addEventListener("click", async () => {
    status.textContent = "";

    try {
      const saved = await globalThis.YGS.saveSettings({
        customPrompt: customPrompt.value,
        promptMode: getSelectedPromptMode(),
        outputLanguage: outputLanguage.value,
        chatgptReasoningEffort: chatgptReasoningEffort.value,
        geminiModel: geminiModel.value,
        geminiThinkingLevel: geminiThinkingLevel.value,
        claudeModel: claudeModel.value,
        claudeEffort: claudeEffort.value,
        aggressiveTranscriptPrefetch: aggressiveTranscriptPrefetch.checked,
        useTemporaryChat: useTemporaryChat.checked,
        useClaudeIncognito: useClaudeIncognito.checked,
        autoSubmit: autoSubmit.checked
      });

      applySettingsToForm(saved);
      status.textContent = "Saved.";
      setTimeout(() => {
        status.textContent = "";
      }, 1500);
    } catch (error) {
      globalThis.YGS.warn("Failed to save settings", error);
      status.textContent = "Save failed. Check extension errors.";
    }
  });

  async function loadSettings() {
    try {
      const settings = await globalThis.YGS.getSettings();
      applySettingsToForm(settings);
    } catch (error) {
      globalThis.YGS.warn("Failed to load settings", error);
      applySettingsToForm({ ...globalThis.YGS.DEFAULT_SETTINGS, customPrompt: null });
    }
  }

  function applySettingsToForm(settings) {
    customPrompt.value = settings.customPrompt ?? "";
    setSelectedPromptMode(settings.promptMode);
    outputLanguage.value = settings.outputLanguage;
    chatgptReasoningEffort.value = settings.chatgptReasoningEffort;
    geminiModel.value = settings.geminiModel;
    geminiThinkingLevel.value = settings.geminiThinkingLevel;
    claudeModel.value = settings.claudeModel;
    claudeEffort.value = settings.claudeEffort;
    useClaudeIncognito.checked = settings.useClaudeIncognito;
    aggressiveTranscriptPrefetch.checked = settings.aggressiveTranscriptPrefetch;
    useTemporaryChat.checked = settings.useTemporaryChat;
    autoSubmit.checked = settings.autoSubmit;
  }

  function getSelectedPromptMode() {
    return promptModeInputs.find((input) => input.checked)?.value
      || globalThis.YGS.DEFAULT_SETTINGS.promptMode;
  }

  function setSelectedPromptMode(promptMode) {
    const normalized = String(promptMode || globalThis.YGS.DEFAULT_SETTINGS.promptMode);
    const selected = promptModeInputs.find((input) => input.value === normalized)
      || promptModeInputs.find((input) => input.value === globalThis.YGS.DEFAULT_SETTINGS.promptMode);

    if (selected) {
      selected.checked = true;
    }

    updatePromptModeCardStates();
  }

  function updatePromptModeCardStates() {
    for (const input of promptModeInputs) {
      const card = input.closest(".prompt-mode-card");
      if (card) {
        card.classList.toggle("is-selected", input.checked);
      }
    }
  }

  function renderSelectOptions(select, choices) {
    select.replaceChildren(
      ...choices.map(({ value, label }) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        return option;
      })
    );
  }
})();
