# Verification Report v0.1.31

Date: 2026-05-08 KST

## Scope

v0.1.31 adds a collapsed disclaimer disclosure to the Options page below the contact line.

## Expected Behavior

- The Options page shows the existing contact/freeware line.
- A collapsed `면책 조항` disclosure appears directly below it.
- Clicking the disclosure expands Korean disclaimer text.
- The disclaimer text explains affiliation limits, AI summary accuracy limits, professional-advice limits, third-party content rights, commercial-workflow boundaries, third-party service dependency, and no developer-operated server data collection.
- Saving settings remains unchanged.

## Static Checks

- `node --check src/background/service_worker.js`
- `node --check src/content/chatgpt.js`
- `node --check src/content/youtube.js`
- `node --check src/options/options.js`
- `node --check src/shared/constants.js`
- `node --check src/shared/logger.js`
- `node --check src/shared/promptBuilder.js`
- `node --check src/shared/storage.js`
- `node --check src/shared/transcriptFormat.js`

## Manifest / Permission Check

- Manifest version: `0.1.31`
- Permissions: `storage`, `clipboardWrite`
- No `tabs` permission.
- No `<all_urls>` host permission.

## Manual Retest Checklist

1. Reload the unpacked extension in Chrome Developer Mode.
2. Open the extension Options page.
3. Confirm `면책 조항` is collapsed by default below the contact line.
4. Expand and collapse the disclosure.
5. Save settings once to confirm existing settings behavior is unchanged.
