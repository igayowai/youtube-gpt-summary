# Verification Report v0.1.65

## Scope

This verification covers YouTube transcript DOM fallback speed improvements for the newer `transcript-segment-view-model` transcript panel structure.

## Static Checks

- `node --check` passed for all JavaScript files under `src/`.
- Manifest parse check passed.

## Manifest Safety Check

- Manifest version is `0.1.65`.
- Permissions remain `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, and Gemini.
- No `tabs` permission is present.
- No `<all_urls>` host permission is present.

## Behavioral Note

When the fast caption-track and Innertube transcript routes fail, the DOM fallback should now parse visible `transcript-segment-view-model` rows directly. During panel scrolling, it waits briefly for actual DOM changes instead of using only fixed sleeps, scrolls in larger steps, deduplicates timestamp/text pairs, and exits after repeated passes without new transcript entries.
