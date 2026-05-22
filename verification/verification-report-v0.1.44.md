# Verification Report v0.1.44

## Scope

v0.1.44 hardens ChatGPT prompt input and send-button detection with exact selectors from the live ChatGPT composer DOM while preserving the older heuristic lookup as fallback behavior.

## Static Checks

- `src/content/chatgpt.js` passed `node --check` with the bundled Node runtime.
- Manifest JSON was parsed successfully.
- Manifest version is `0.1.44`.
- Permissions remain exactly `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, and Gemini.
- No `tabs` permission was added.
- No `<all_urls>` host permission was added.

## Manual Test Notes

Manual browser verification is still required after reloading the unpacked extension in Chrome. Test `Summarize with GPT` with model selection enabled and confirm the ChatGPT log reaches prompt injection and submission without opening sidebar or project menus.
