# Verification Report v0.1.49

## Scope

v0.1.49 adds exact ChatGPT model row selectors from the live dropdown menu and skips adjacent thinking-effort action controls.

## Static Checks

- `src/content/chatgpt.js` passed `node --check` with the bundled Node runtime.
- `src/shared/constants.js` passed `node --check` with the bundled Node runtime.
- Manifest JSON was parsed successfully.
- Manifest version is `0.1.49`.
- Permissions remain exactly `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, and Gemini.
- No `tabs` permission was added.
- No `<all_urls>` host permission was added.

## Manual Test Notes

Manual browser verification is still required after reloading the unpacked extension in Chrome. Test `GPT 모델 선택 = Thinking` and confirm the click target is the `model-switcher-gpt-5-5-thinking` row, not the `...thinking-effort` action button.
