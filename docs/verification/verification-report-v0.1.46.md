# Verification Report v0.1.46

## Scope

v0.1.46 adds an exact ChatGPT model-switcher selector based on the live ChatGPT UI DOM.

## Static Checks

- `src/content/chatgpt.js` passed `node --check` with the bundled Node runtime.
- `src/shared/constants.js` passed `node --check` with the bundled Node runtime.
- Manifest JSON was parsed successfully.
- Manifest version is `0.1.46`.
- Permissions remain exactly `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, and Gemini.
- No `tabs` permission was added.
- No `<all_urls>` host permission was added.

## Manual Test Notes

Manual browser verification is still required after reloading the unpacked extension in Chrome. Test GPT model selection with `Thinking` and confirm the log reports the model selector as the header model switcher rather than the composer reasoning-intensity pill.
