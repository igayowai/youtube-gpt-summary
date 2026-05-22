# Verification Report v0.1.37

Date: 2026-05-09 KST

## Scope

v0.1.37 improves Gemini Temporary Chat confirmation and Gemini send-button targeting after the first live retest.

## Expected Behavior

- Gemini Temporary Chat Korean privacy copy is recognized after the Temporary Chat button is clicked.
- Gemini auto-submit is no longer withheld when that copy is visible.
- Gemini submit targeting prefers the right-side composer send control.
- Nearby tools, upload, and model controls are deprioritized as submit candidates.

## Static Checks

- `node --check src/content/gemini.js`

## Manifest / Permission Check

- Manifest version: `0.1.37`
- Permissions: `storage`, `clipboardWrite`
- Host permissions include Gemini.
- No `tabs` permission.
- No `<all_urls>` host permission.
