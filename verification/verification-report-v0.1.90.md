# Verification Report v0.1.90

Date: 2026-05-23 KST

Scope:
- Roll back ChatGPT model settings from the temporary updated UI naming to the original `Instant / Thinking / Pro` flow.
- Keep migration for interim saved values so existing `medium` / `high` settings do not break user settings.

Checks:
- [PASS] `manifest.json` version is `0.1.90`.
- [PASS] `src/shared/constants.js` version is `0.1.90`.
- [PASS] ChatGPT model choices are back to `선택 없음`, `Instant`, `Thinking`, and `Pro`.
- [PASS] Options page ChatGPT hint again refers to `[Instant]` as the not-recommended fast model.
- [PASS] Interim saved `medium` and `high` ChatGPT model values normalize to `thinking`.
- [PASS] Temporary ChatGPT intelligence-menu-specific selectors were removed from the active ChatGPT content script.
- [PASS] ChatGPT model menu opening uses the original `clickElementLikeUser(button)` path before searching menu rows.

Static validation:
- Node syntax checks passed for all JavaScript files under `src`.
