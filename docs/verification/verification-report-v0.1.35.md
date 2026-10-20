# Verification Report v0.1.35

Date: 2026-05-09 KST

## Scope

v0.1.35 reduces the ChatGPT queue start delay used while another ChatGPT job is active.

## Expected Behavior

- Idle queue processing still starts immediately.
- When another ChatGPT job is active, queued follow-up jobs use a 2 second start delay instead of 3.5 seconds.
- Multi-tab jobs still process sequentially.

## Static Checks

- `node --check src/shared/constants.js`

## Manifest / Permission Check

- Manifest version: `0.1.35`
- Permissions: `storage`, `clipboardWrite`
- No `tabs` permission.
- No `<all_urls>` host permission.
