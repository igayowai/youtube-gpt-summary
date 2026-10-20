# ChatGPT Reasoning Menu Integration Note

Shared historical capture:

[ChatGPT reasoning menu, 2026-06-01](chatgpt/new-chat/chatgpt-reasoning-menu-2026-06-01.md)

[Earlier exact Temporary Chat composer and menu outerHTML, 2026-05-23](chatgpt/new-chat/chatgpt-temporary-chat-dom-2026-05-23.md)

This project consumes that dated evidence for new-chat reasoning selection. The separate GPTs UI is not currently automated by this extension.

Project-specific behavior:

- User-facing values live in `src/shared/constants.js` under `globalThis.YGS.CHATGPT_MODELS`.
- Stored legacy values are normalized in `src/shared/storage.js`; `thinking`, `pro`, underscore spellings, and compact spellings remain migration inputs.
- Selection logic lives in `src/content/chatgpt.js`, primarily `selectChatGptModelIfRequested`, `findChatGptModelMenuItem`, and `findChatGptProVariantSubmenuTrigger`.
- The extension supports `instant`, `medium`, `high`, `extra-high`, `pro-basic`, and `pro-extended` as its own persisted setting values.
- Match `Extra High` / `매우 높음` before `High` / `높음` so the contained word does not select the wrong row.
- Do not treat the historical model-version submenu as an extension reasoning option.

These are extension implementation notes, not shared ChatGPT UI facts. Live DOM wins over the historical capture.
