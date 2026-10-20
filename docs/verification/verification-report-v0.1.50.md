# Verification Report v0.1.50

## Scope

v0.1.50 temporarily disables ChatGPT model-selection Plan B heuristics so live testing can prove whether the exact Plan A selectors are sufficient.

## Static Checks

- `src/content/chatgpt.js` passed `node --check` with the bundled Node runtime.
- `src/shared/constants.js` passed `node --check` with the bundled Node runtime.
- Manifest JSON was parsed successfully.
- Manifest version is `0.1.50`.
- Permissions remain exactly `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, and Gemini.
- No `tabs` permission was added.
- No `<all_urls>` host permission was added.

## Manual Test Notes

Manual browser verification is required after reloading the unpacked extension in Chrome. With `GPT 모델 선택` enabled, a successful test should not show any Plan B disabled warning and should still log model selector found, model option found, and model selected/attempted.
