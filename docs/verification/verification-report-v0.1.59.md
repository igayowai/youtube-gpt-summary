# Verification Report v0.1.59

## Scope

This verification covers the ChatGPT model-selector hardening for the live case where the selector lookup found an ambiguous `모델` candidate near sidebar/profile UI instead of the composer model picker.

## Static Checks

- `node --check` passed for all JavaScript files under `src/`.
- Manifest parse check passed.

## Manifest Safety Check

- Manifest version is `0.1.59`.
- Permissions remain `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, and Gemini.
- No `tabs` permission is present.
- No `<all_urls>` host permission is present.

## Behavioral Note

ChatGPT model selection now prefers structurally exact controls such as the composer `__composer-pill` and `model-switcher-dropdown-button`. Generic `model`/`mode` label text alone is no longer enough to treat a visible element as the model selector.
