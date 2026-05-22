# Verification Report v0.1.53

## Scope

v0.1.53 restores fast selected-model detection for ChatGPT Thinking-only reasoning-state labels while keeping exact menu row selectors for model changes.

## Static Checks

- `src/content/chatgpt.js` passed `node --check` with the bundled Node runtime.
- `src/shared/constants.js` passed `node --check` with the bundled Node runtime.
- Manifest JSON was parsed successfully.
- Manifest version is `0.1.53`.
- Permissions remain exactly `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, and Gemini.
- No `tabs` permission was added.
- No `<all_urls>` host permission was added.

## Manual Test Notes

Manual browser verification is required after reloading the unpacked extension in Chrome. With `GPT 모델 선택 = Thinking` and the visible selector showing `확장`, the script should log `ChatGPT model already selected Thinking`. With `GPT 모델 선택 = Pro` from that same state, it should open the menu and click the Pro row.
