# Verification Report: YouTube GPT Summary Extension v0.1.7

Timestamp: 2026-05-05 KST

## Scope

This verification covers the prompt mode settings UI and prompt selection behavior. The default remains the developer's basic summary prompt.

## Changes Verified

- [PASS] Version markers updated to `0.1.7`.
- [PASS] Removed the built-in default prompt preview from the Options page.
- [PASS] Added three large mutually exclusive prompt mode cards: basic summary, deep summary, and custom prompt.
- [PASS] Prompt mode defaults to `default`.
- [PASS] Custom prompt textarea moved directly below the three prompt mode choices.
- [PASS] Added `promptMode` to settings load/save.
- [PASS] Deep summary prompt is intentionally `null` for now.
- [PASS] Prompt builder selects default or custom according to `promptMode`; deep mode safely falls back to the default prompt until a deep prompt is written.
- [PASS] Empty transcript STOP prompt behavior remains unchanged.
- [PASS] Selected card styling does not rely on CSS `:has()`, keeping Chrome compatibility broader.

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
- [PASS] prompt mode regression: default uses default, deep falls back to default while null, and custom uses the custom instruction.
- [PASS] manifest_version is 3
- [PASS] manifest version is 0.1.7
- [PASS] permissions remain `storage` and `clipboardWrite`
- [PASS] no `<all_urls>` permission
- [PASS] no `tabs` permission
- [PASS] host permissions remain YouTube and ChatGPT only

## Manual Browser Checks Still Needed

1. Reload the unpacked extension.
2. Open Options and confirm the prompt preview section is gone.
3. Confirm the three large prompt mode cards appear at the top.
4. Confirm `기본 요약` is selected by default.
5. Save each mode and confirm it persists after reopening Options.
6. Confirm custom prompt is used only when `커스텀 프롬프트` is selected.
7. Confirm deep summary currently sends the default prompt until the deep prompt is authored.

## Result

Static verification passed. User-side Options UI retest remains needed.
