# Verification Report: YouTube GPT Summary Extension v0.1.18

Timestamp: 2026-05-07 KST

## Scope

This verification covers refinement of ChatGPT model matching after the user clarified current ChatGPT display labels.

## Changes Verified

- [PASS] Version markers updated to `0.1.18`.
- [PASS] Instant selected label is recognized as `instant`.
- [PASS] Thinking selected labels include `라이트 모드`, `표준`, `확장`, and `헤비 모드`.
- [PASS] Pro selected labels include `Pro` and `Pro 확장 모드`.
- [PASS] Thinking intensity labels are used only for selected-model/control detection.
- [PASS] Menu item clicks remain limited to model labels such as `Instant`, `Thinking`, and `Pro`.
- [PASS] Coordinate and keyboard fallbacks were removed from the active model-selection path.
- [PASS] Permissions remain unchanged.

## Automated Checks

- [PASS] node --check src/content/chatgpt.js
- [PASS] node --check src/shared/constants.js
- [PASS] manifest version is 0.1.18
- [PASS] permissions remain `storage` and `clipboardWrite`
- [PASS] no `<all_urls>` permission
- [PASS] no `tabs` permission

## Manual Browser Checks Still Needed

1. Reload the unpacked extension.
2. Keep `GPT 모델 선택` set to `Thinking`.
3. Run a YouTube summary from a current Pro default state.
4. Confirm the model selector is found using the current selected-model label.
5. Confirm whether a visible `Thinking` model menu item is found and clicked.

## Result

Static verification passed. Live ChatGPT UI retest remains required.
