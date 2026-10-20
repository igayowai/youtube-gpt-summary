# Verification Report v0.1.42

Date: 2026-05-09 KST

## Scope

v0.1.42 replaces the deep summary prompt with the concise Korean forensic audit report prompt.

## Static Checks

- `node --check src/shared/constants.js`: passed.
- Shared constants VM load smoke check: passed.
- `manifest.json` parse/version/permission check: passed.

## Manifest / Permission Check

- Version: `0.1.42`.
- Permissions: `storage`, `clipboardWrite`.
- Host permissions: YouTube, ChatGPT, Gemini.
- No `<all_urls>` host permission.
- No `tabs` permission.

## Notes

- `DEEP_SUMMARY_PROMPT` is no longer `null`.
- Manual live retest should confirm that selecting `심화 요약` sends the new prompt body.
