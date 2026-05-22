# Verification Report v0.1.62

## Scope

This verification covers the ChatGPT model-selector guard that blocks ambiguous header controls whose entire label is only `모델` or `model`.

## Static Checks

- `node --check` passed for all JavaScript files under `src/`.
- Manifest parse check passed.

## Manifest Safety Check

- Manifest version is `0.1.62`.
- Permissions remain `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, and Gemini.
- No `tabs` permission is present.
- No `<all_urls>` host permission is present.

## Behavioral Note

The automation should no longer open a generic `모델` control that does not expose the live model rows. It should prefer the composer pill such as `Pro 확장 모드`; if that pill is not detected, it should fail the model-selection step cleanly and continue with the current model rather than opening the wrong menu.
