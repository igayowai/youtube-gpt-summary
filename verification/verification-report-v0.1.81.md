# Verification Report v0.1.81

## Scope

This verification covers the v0.1.81 package split from v0.1.80 after updating the in-extension Options page copy and disclaimer.

## Change Summary

- Kept the v0.1.80 Chrome Web Store rejection response behavior: if accessible transcript/caption extraction fails, ChatGPT/Gemini are not opened with a failure prompt.
- Updated Options page lead text, aggressive prefetch hint, and disclaimer to use accessible transcript/caption wording.
- Options disclaimer now states that transcript/caption availability and extraction success are not guaranteed for every YouTube video.
- Default output language is now `Korean` for new or unset settings.
- Extension version was bumped to `0.1.81`.

## Static Checks

- `node --check` passed for all JavaScript files under `src/`.
- Manifest parse check passed.
- Manifest version is `0.1.81`.
- Shared constants version is `0.1.81`.
- Default settings output language is `Korean`.
- Permissions remain exactly `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, ChatGPT old domain, and Gemini.
- No `tabs` permission is present.
- No `<all_urls>` host permission is present.

## Package Check

- Web Store package path: `dist/youtube-gpt-summary-v0.1.81-webstore.zip`.
- Package contains exactly one `manifest.json`.
- Package does not include `dist/`, `verification/`, `store-submission/`, or `plan/`.
