# Verification Report v0.1.80

## Scope

This verification covers the Chrome Web Store rejection response for transcript-fetch reproducibility.

## Change Summary

- Empty transcript/caption extraction from the YouTube button flow no longer opens ChatGPT or Gemini with a failure prompt.
- The YouTube button temporarily shows `Transcript unavailable` when all supported transcript/caption extraction paths fail.
- Manifest, README, privacy copy, GitHub Pages privacy HTML, and Chrome Web Store listing draft now describe accessible YouTube transcripts/captions instead of implying every YouTube video can be summarized.
- Extension version was bumped to `0.1.80`.

## Static Checks

- `node --check` passed for all JavaScript files under `src/`.
- Manifest parse check passed.
- Manifest version is `0.1.80`.
- Shared constants version is `0.1.80`.
- Permissions remain exactly `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, ChatGPT old domain, and Gemini.
- No `tabs` permission is present.
- No `<all_urls>` host permission is present.

## Behavioral Note

For Chrome Web Store review, use a YouTube video with accessible captions/transcript. If the reviewer uses a video without accessible transcript/caption data, the extension should now present a non-submitting unavailable state instead of sending a prompt whose only result is a transcript-fetch failure.
