globalThis.YGS = globalThis.YGS || {};

(async () => {
  const customPrompt = document.getElementById("customPrompt");
  const promptModeInputs = Array.from(document.querySelectorAll("input[name='promptMode']"));
  const outputLanguage = document.getElementById("outputLanguage");
  const chatgptModel = document.getElementById("chatgptModel");
  const geminiModel = document.getElementById("geminiModel");
  const geminiThinkingLevel = document.getElementById("geminiThinkingLevel");
  const aggressiveTranscriptPrefetch = document.getElementById("aggressiveTranscriptPrefetch");
  const useTemporaryChat = document.getElementById("useTemporaryChat");
  const autoSubmit = document.getElementById("autoSubmit");
  const saveButton = document.getElementById("saveButton");
  const status = document.getElementById("status");

  promptModeInputs.forEach((input) => {
    input.addEventListener("change", updatePromptModeCardStates);
  });

  renderOutputLanguageOptions();
  renderChatGptModelOptions();
  renderGeminiModelOptions();
  renderGeminiThinkingLevelOptions();
  await loadSettings();

  saveButton.addEventListener("click", async () => {
    status.textContent = "";

    try {
      const saved = await globalThis.YGS.saveSettings({
        customPrompt: customPrompt.value,
        promptMode: getSelectedPromptMode(),
        outputLanguage: outputLanguage.value,
        chatgptModel: chatgptModel.value,
        geminiModel: geminiModel.value,
        geminiThinkingLevel: geminiThinkingLevel.value,
        aggressiveTranscriptPrefetch: aggressiveTranscriptPrefetch.checked,
        useTemporaryChat: useTemporaryChat.checked,
        autoSubmit: autoSubmit.checked
      });

      customPrompt.value = saved.customPrompt ?? "";
      setSelectedPromptMode(saved.promptMode);
      outputLanguage.value = saved.outputLanguage;
      chatgptModel.value = saved.chatgptModel;
      geminiModel.value = saved.geminiModel;
      geminiThinkingLevel.value = saved.geminiThinkingLevel;
      aggressiveTranscriptPrefetch.checked = saved.aggressiveTranscriptPrefetch;
      useTemporaryChat.checked = saved.useTemporaryChat;
      autoSubmit.checked = saved.autoSubmit;
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
      customPrompt.value = settings.customPrompt ?? "";
      setSelectedPromptMode(settings.promptMode);
      outputLanguage.value = settings.outputLanguage;
      chatgptModel.value = settings.chatgptModel;
      geminiModel.value = settings.geminiModel;
      geminiThinkingLevel.value = settings.geminiThinkingLevel;
      aggressiveTranscriptPrefetch.checked = settings.aggressiveTranscriptPrefetch;
      useTemporaryChat.checked = settings.useTemporaryChat;
      autoSubmit.checked = settings.autoSubmit;
    } catch (error) {
      globalThis.YGS.warn("Failed to load settings", error);
      customPrompt.value = "";
      setSelectedPromptMode(globalThis.YGS.DEFAULT_SETTINGS.promptMode);
      outputLanguage.value = globalThis.YGS.DEFAULT_SETTINGS.outputLanguage;
      chatgptModel.value = globalThis.YGS.DEFAULT_SETTINGS.chatgptModel;
      geminiModel.value = globalThis.YGS.DEFAULT_SETTINGS.geminiModel;
      geminiThinkingLevel.value = globalThis.YGS.DEFAULT_SETTINGS.geminiThinkingLevel;
      aggressiveTranscriptPrefetch.checked = globalThis.YGS.DEFAULT_SETTINGS.aggressiveTranscriptPrefetch;
      useTemporaryChat.checked = globalThis.YGS.DEFAULT_SETTINGS.useTemporaryChat;
      autoSubmit.checked = globalThis.YGS.DEFAULT_SETTINGS.autoSubmit;
    }
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

  function renderOutputLanguageOptions() {
    outputLanguage.replaceChildren(
      ...globalThis.YGS.OUTPUT_LANGUAGES.map((language) => {
        const option = document.createElement("option");
        option.value = language.value;
        option.textContent = language.label;
        return option;
      })
    );
  }

  function renderChatGptModelOptions() {
    chatgptModel.replaceChildren(
      ...globalThis.YGS.CHATGPT_MODELS.map((model) => {
        const option = document.createElement("option");
        option.value = model.value;
        option.textContent = model.label;
        return option;
      })
    );
  }

  function renderGeminiModelOptions() {
    geminiModel.replaceChildren(
      ...globalThis.YGS.GEMINI_MODELS.map((model) => {
        const option = document.createElement("option");
        option.value = model.value;
        option.textContent = model.label;
        return option;
      })
    );
  }

  function renderGeminiThinkingLevelOptions() {
    geminiThinkingLevel.replaceChildren(
      ...globalThis.YGS.GEMINI_THINKING_LEVELS.map((level) => {
        const option = document.createElement("option");
        option.value = level.value;
        option.textContent = level.label;
        return option;
      })
    );
  }
})();
