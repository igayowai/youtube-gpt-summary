globalThis.YGS = globalThis.YGS || {};

globalThis.YGS.formatTimestamp = function formatTimestamp(seconds) {
  const total = Math.floor(Number(seconds) || 0);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
};

globalThis.YGS.formatTranscriptEntries = function formatTranscriptEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return "";
  }

  return entries
    .map((entry) => {
      const time = globalThis.YGS.formatTimestamp(entry.start);
      const text = String(entry.text ?? "").replace(/\s+/g, " ").trim();
      return text.length > 0 ? `[${time}] ${text}` : "";
    })
    .filter((line) => line.trim().length > 0)
    .join("\n");
};
