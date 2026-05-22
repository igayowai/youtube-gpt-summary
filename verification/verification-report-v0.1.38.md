# Verification Report v0.1.38

Date: 2026-05-09 KST

## Scope

v0.1.38 adds a Gemini-only model selection setting and live UI selector automation.

## Static Checks

- `node --check src/content/gemini.js`: passed.
- `node --check src/content/youtube.js`: passed.
- `node --check src/options/options.js`: passed.
- `node --check src/shared/storage.js`: passed.
- `node --check src/background/service_worker.js`: passed.
- `manifest.json` parse check: passed.

## Manifest / Permission Check

- Version: `0.1.38`.
- Permissions: `storage`, `clipboardWrite`.
- Host permissions: YouTube, ChatGPT, Gemini.
- No `<all_urls>` host permission.
- No `tabs` permission.

## Notes

- `chatgptModel` remains ChatGPT-only.
- `geminiModel` is included only in Gemini payloads.
- Gemini model selection runs after Gemini Temporary Chat confirmation and before prompt injection.
- Manual live retest is still required because Gemini DOM selectors are UI-dependent.
