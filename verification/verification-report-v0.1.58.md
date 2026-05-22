# Verification Report v0.1.58

## Scope

This verification covers the default setting change that enables aggressive transcript prefetch for new or unset settings.

## Static Checks

- `node --check src/shared/constants.js` passed.
- Manifest parse check passed.

## Manifest Safety Check

- Manifest version is `0.1.58`.
- Permissions remain `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, and Gemini.
- No `tabs` permission is present.
- No `<all_urls>` host permission is present.

## Behavioral Note

Existing users with a saved `aggressiveTranscriptPrefetch` value keep their saved setting. New installs, reset settings, or missing values default to enabled.
