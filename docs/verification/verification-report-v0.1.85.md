# Verification Report v0.1.85

Date: 2026-05-20 KST

## Scope

- Hardened Gemini model-selector detection after a live log showed the `핀 목록 (Ctrl+P)` button being selected instead of the Gemini model picker.
- Rejected pin/sidebar/MathJaxify controls from Gemini model-selector candidates.
- Required fallback candidates to have either the exact Gemini `bard-mode-menu-button` structure or a real Gemini model/menu label.

## Static Checks

Passed:

- `node --check src/shared/constants.js`
- `node --check src/content/gemini.js`

## Notes

- No Web Store ZIP was generated.
