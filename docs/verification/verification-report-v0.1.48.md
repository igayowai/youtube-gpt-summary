# Verification Report v0.1.48

## Scope

v0.1.48 restores the ChatGPT temporary-chat model selector entry point for the composer accent pill shown in the automation window.

## Static Checks

- `src/content/chatgpt.js` passed `node --check` with the bundled Node runtime.
- `src/shared/constants.js` passed `node --check` with the bundled Node runtime.
- Manifest JSON was parsed successfully.
- Manifest version is `0.1.48`.
- Permissions remain exactly `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, and Gemini.
- No `tabs` permission was added.
- No `<all_urls>` host permission was added.

## Manual Test Notes

Manual browser verification is still required after reloading the unpacked extension in Chrome. Test from a temporary ChatGPT window where the only visible selector is the composer accent pill labeled `확장`, then confirm it opens the Instant/Thinking/Pro menu.
