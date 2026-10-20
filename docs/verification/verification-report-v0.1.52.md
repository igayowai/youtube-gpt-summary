# Verification Report v0.1.52

## Scope

v0.1.52 fixes ChatGPT Plan A model-state handling for composer pills that display only reasoning state labels.

## Static Checks

- `src/content/chatgpt.js` passed `node --check` with the bundled Node runtime.
- `src/shared/constants.js` passed `node --check` with the bundled Node runtime.
- Manifest JSON was parsed successfully.
- Manifest version is `0.1.52`.
- Permissions remain exactly `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, and Gemini.
- No `tabs` permission was added.
- No `<all_urls>` host permission was added.

## Manual Test Notes

Manual browser verification is required after reloading the unpacked extension in Chrome. Set `GPT 모델 선택 = Pro` while the visible composer pill says `확장`, then confirm the script opens the model menu and clicks the `model-switcher-gpt-5-5-pro` row.
