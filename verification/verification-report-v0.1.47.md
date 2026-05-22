# Verification Report v0.1.47

## Scope

v0.1.47 adds exact scoping for ChatGPT model menu row selection using the model switcher's `aria-controls` dropdown root.

## Static Checks

- `src/content/chatgpt.js` passed `node --check` with the bundled Node runtime.
- `src/shared/constants.js` passed `node --check` with the bundled Node runtime.
- Manifest JSON was parsed successfully.
- Manifest version is `0.1.47`.
- Permissions remain exactly `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, and Gemini.
- No `tabs` permission was added.
- No `<all_urls>` host permission was added.

## Manual Test Notes

Manual browser verification is still required after reloading the unpacked extension in Chrome. Test `GPT 모델 선택 = Thinking` from a different current model and confirm the menu opens from the header model switcher and selects the `Thinking` row.
