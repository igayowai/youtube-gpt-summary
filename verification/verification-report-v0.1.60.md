# Verification Report v0.1.60

## Scope

This verification covers the ChatGPT model-selector priority fix for the live neutral composer pill case, such as `Pro 확장 모드` rendered inside `button.__composer-pill.__composer-pill--neutral`.

## Static Checks

- `node --check` passed for all JavaScript files under `src/`.
- Manifest parse check passed.

## Manifest Safety Check

- Manifest version is `0.1.60`.
- Permissions remain `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, and Gemini.
- No `tabs` permission is present.
- No `<all_urls>` host permission is present.

## Behavioral Note

ChatGPT composer model pills whose label already contains a known model/state now qualify as exact selector candidates even if geometric composer-proximity checks are unreliable. These pills also receive a higher score than generic model selector controls.
