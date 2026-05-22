# Verification Report v0.1.82

## Scope

This verification covers the Options page model-selection hint copy update.

## Change Summary

- ChatGPT model-selection hint now says `[Instant]` is not recommended.
- Gemini model-selection hint now says `[빠른 모드]` is not recommended.
- Extension version was bumped to `0.1.82`.

## Static Checks

- `node --check` passed for all JavaScript files under `src/`.
- Manifest parse check passed.
- Manifest version is `0.1.82`.
- Shared constants version is `0.1.82`.
- Permissions remain exactly `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, ChatGPT old domain, and Gemini.
- No `tabs` permission is present.
- No `<all_urls>` host permission is present.

## Package Note

No Web Store ZIP was generated for this local copy-only update.

