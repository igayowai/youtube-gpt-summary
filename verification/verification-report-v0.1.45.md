# Verification Report v0.1.45

## Scope

v0.1.45 corrects ChatGPT model-selector hardening so the composer reasoning-intensity pill is not treated as the model selector.

## Static Checks

- `src/content/chatgpt.js` passed `node --check` with the bundled Node runtime.
- `src/shared/constants.js` passed `node --check` with the bundled Node runtime.
- Manifest JSON was parsed successfully.
- Manifest version is `0.1.45`.
- Permissions remain exactly `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, and Gemini.
- No `tabs` permission was added.
- No `<all_urls>` host permission was added.

## Manual Test Notes

Manual browser verification is still required after reloading the unpacked extension in Chrome. Test `Summarize with GPT` with `GPT 모델 선택` enabled and confirm the script no longer opens or changes the reasoning-intensity menu when it is looking for the model selector.
