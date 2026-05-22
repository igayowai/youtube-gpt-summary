# Verification Report v0.1.36

Date: 2026-05-09 KST

## Scope

v0.1.36 adds a Gemini MVP web-UI workflow alongside the existing ChatGPT workflow.

## Expected Behavior

- YouTube watch pages show `Summarize with GPT` and `Summarize with Gemini` side by side.
- Both buttons share transcript extraction, transcript cache, prompt building, output-language instruction, and clipboard fallback.
- `Summarize with GPT` continues to use the ChatGPT queue, Temporary Chat, ChatGPT model selection, and auto-submit behavior.
- `Summarize with Gemini` opens Gemini immediately, skips model selection, attempts Gemini Temporary Chat, injects the prompt, and auto-submits only when `autoSubmit` is enabled and Temporary Chat is confirmed.
- If Gemini composer or submit detection fails, the prompt remains available via clipboard/manual paste where possible.
- `PRIVACY.md` and Options disclaimer mention Gemini/Google prompt transfer and Temporary Chat limitations.

## Static Checks

- `node --check src/background/service_worker.js`
- `node --check src/content/youtube.js`
- `node --check src/content/gemini.js`
- `node --check src/content/chatgpt.js`
- `node --check src/options/options.js`
- `node --check src/shared/constants.js`
- `node --check src/shared/storage.js`
- `node --check src/shared/promptBuilder.js`
- `node --check src/shared/transcriptFormat.js`
- `node --check src/shared/logger.js`

## Manifest / Permission Check

- Manifest version: `0.1.36`
- Permissions: `storage`, `clipboardWrite`
- Host permissions: YouTube, ChatGPT, Gemini
- No `tabs` permission.
- No `<all_urls>` host permission.

## Manual Retest Checklist

1. Reload the unpacked extension in Chrome Developer Mode.
2. Reload a YouTube watch page.
3. Confirm the GPT and Gemini buttons appear side by side.
4. Enable aggressive prefetch and confirm ready state still appears after transcript cache succeeds.
5. Click `Summarize with GPT` and confirm the existing ChatGPT path still works.
6. Click `Summarize with Gemini` and confirm Gemini opens immediately.
7. Confirm Gemini Temporary Chat is detected or clicked before prompt injection.
8. Confirm `autoSubmit=true` submits only when Gemini Temporary Chat is confirmed.
9. Confirm `autoSubmit=false` leaves the Gemini prompt in the composer.
