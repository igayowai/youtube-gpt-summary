globalThis.YGS = globalThis.YGS || {};

globalThis.YGS.normalizeCustomPrompt = function normalizeCustomPrompt(value) {
  const trimmed = String(value ?? "").trim();
  return trimmed.length === 0 ? null : trimmed;
};

globalThis.YGS.isEmptyTranscript = function isEmptyTranscript(transcript) {
  return String(transcript ?? "").trim().length === 0;
};

globalThis.YGS.buildFinalPrompt = function buildFinalPrompt({
  title,
  url,
  transcript,
  customPrompt,
  promptMode,
  outputLanguage
}) {
  if (globalThis.YGS.isEmptyTranscript(transcript)) {
    return {
      mode: "emptyTranscriptStop",
      prompt: globalThis.YGS.EMPTY_TRANSCRIPT_STOP_PROMPT
    };
  }

  const instruction = selectPromptInstruction(promptMode, customPrompt);
  const responseLanguageLine = buildResponseLanguageLine(outputLanguage);

  const prompt = `
${instruction}

${responseLanguageLine}

[영상 정보]
제목: ${String(title ?? "").trim()}
URL: ${String(url ?? "").trim()}

[Transcript]
${String(transcript ?? "").trim()}
`.trim();

  return {
    mode: "normal",
    prompt
  };
};

function selectPromptInstruction(promptMode, customPrompt) {
  switch (promptMode) {
    case globalThis.YGS.PROMPT_MODES.DEEP:
      return globalThis.YGS.DEEP_SUMMARY_PROMPT ?? globalThis.YGS.DEFAULT_SUMMARY_PROMPT;

    case globalThis.YGS.PROMPT_MODES.CUSTOM:
      return customPrompt ?? globalThis.YGS.DEFAULT_SUMMARY_PROMPT;

    case globalThis.YGS.PROMPT_MODES.DEFAULT:
    default:
      return globalThis.YGS.DEFAULT_SUMMARY_PROMPT;
  }
}

function buildResponseLanguageLine(outputLanguage) {
  const language = normalizeOutputLanguageForPrompt(outputLanguage);
  return `Respond in ${language}.`;
}

function normalizeOutputLanguageForPrompt(outputLanguage) {
  const language = String(outputLanguage || "").trim();
  const values = globalThis.YGS.OUTPUT_LANGUAGES.map((entry) => entry.value);
  return values.includes(language)
    ? language
    : globalThis.YGS.DEFAULT_SETTINGS.outputLanguage;
}
