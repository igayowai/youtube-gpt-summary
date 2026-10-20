# Verification Report: YouTube GPT Summary Extension v0.1.9

Timestamp: 2026-05-05 KST

## Scope

This verification covers the developer prompt source disclosure UI in Options.

## Changes Verified

- [PASS] Version markers updated to `0.1.9`.
- [PASS] Added `개발자의 요약 프롬프트 원문 보기` below advanced settings.
- [PASS] The top-level prompt source section can be expanded and collapsed.
- [PASS] Inside it, `기본 요약` and `심화 요약` are displayed side by side on desktop.
- [PASS] `기본 요약` and `심화 요약` each have independent expand/collapse behavior.
- [PASS] Basic prompt source is populated from `DEFAULT_SUMMARY_PROMPT`.
- [PASS] Deep prompt source is populated from `DEEP_SUMMARY_PROMPT`; it is currently blank because the prompt is intentionally `null`.

## Automated Checks

- [PASS] node --check src/background/service_worker.js
- [PASS] node --check src/content/chatgpt.js
- [PASS] node --check src/content/youtube.js
- [PASS] node --check src/options/options.js
- [PASS] node --check src/shared/constants.js
- [PASS] node --check src/shared/logger.js
- [PASS] node --check src/shared/promptBuilder.js
- [PASS] node --check src/shared/storage.js
- [PASS] node --check src/shared/transcriptFormat.js
- [PASS] manifest_version is 3
- [PASS] manifest version is 0.1.9
- [PASS] permissions remain `storage` and `clipboardWrite`
- [PASS] no `<all_urls>` permission
- [PASS] no `tabs` permission
- [PASS] host permissions remain YouTube and ChatGPT only

## Manual Browser Checks Still Needed

1. Reload the unpacked extension.
2. Open Options.
3. Confirm `개발자의 요약 프롬프트 원문 보기` appears below `고급 설정`.
4. Expand it and confirm `기본 요약` and `심화 요약` appear side by side on desktop.
5. Expand/collapse each prompt independently.
6. Confirm `기본 요약` shows the default prompt and `심화 요약` is blank for now.

## Result

Static verification passed. User-side Options UI retest remains needed.
