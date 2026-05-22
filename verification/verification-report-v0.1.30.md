# Verification Report v0.1.30

Date: 2026-05-08 KST

## Scope

v0.1.30 adds a narrow transcript cleanup for YouTube DOM fallback rows where the visible transcript text begins with a Korean timestamp phrase that duplicates the extension's own formatted timestamp.

## Expected Behavior

- `[00:15] 15초 반갑습니다` becomes `[00:15] 반갑습니다`.
- `[01:01] 1분 1초 제가...` becomes `[01:01] 제가...`.
- `[22:00] 22분 빼이는데...` becomes `[22:00] 빼이는데...`.
- Non-matching normal transcript text is preserved.

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

- Manifest version: `0.1.30`
- Permissions: `storage`, `clipboardWrite`
- No `tabs` permission.
- No `<all_urls>` host permission.

## Manual Retest Checklist

1. Reload the unpacked extension in Chrome Developer Mode.
2. Reload the YouTube watch page.
3. If aggressive prefetch is enabled, wait until the `Summarize with GPT` button turns light green.
4. Click `Summarize with GPT`.
5. Confirm the ChatGPT prompt transcript no longer contains Korean timestamp words immediately after `[MM:SS]`.
6. Confirm the ChatGPT queue/model selection/temporary chat/auto-submit behavior remains unchanged.
