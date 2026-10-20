# Verification Report v0.1.77

## Scope

This verification covers the YouTube floating summary button placement update.

## Static Checks

- `node --check` passed for all JavaScript files under `src/`.
- Manifest parse check passed.

## Manifest Safety Check

- Manifest version is `0.1.77`.
- Permissions remain `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, and Gemini.
- No `tabs` permission is present.
- No `<all_urls>` host permission is present.

## Behavioral Note

The YouTube GPT/Gemini summary controls are now appended directly to `document.body` and styled as a fixed floating button group at the bottom-right of the viewport. They should remain visible while scrolling and be less affected by YouTube DOM layout changes.
