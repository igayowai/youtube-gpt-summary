# ChatGPT English UI Integration Note

Shared historical capture:

[ChatGPT English reasoning and Temporary Chat UI, 2026-06-14](C:/Users/USER/Documents/Claude/youtube_summary_GPT/docs/ui-dom-captures/chatgpt/new-chat/chatgpt-english-ui-2026-06-14.md)

This project consumes that dated evidence for English reasoning-label compatibility and Temporary Chat detection.

Project-specific behavior:

- `src/shared/constants.js` keeps English and Korean matchers for the extension's stored reasoning choices.
- `src/content/chatgpt.js` scopes model-menu candidates, guards selected rows, and prevents `High` from matching the `Extra High` row.
- Temporary Chat detection in `src/content/chatgpt.js` accepts English `temporary` and Korean `임시` labels, then requires an active toggle, URL state, or matching privacy copy before auto-submit.
- The 2026-06-14 screenshot showed `Turn on temporary chat`, but supplied no exact tooltip outerHTML.

The screenshot labels are historical compatibility evidence, not current display requirements.
