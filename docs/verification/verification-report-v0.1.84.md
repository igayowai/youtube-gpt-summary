# Verification Report v0.1.84

Date: 2026-05-20 KST

## Scope

- Updated Gemini Flash model display and menu matcher from `3 Flash` to `3.5 Flash`.
- Kept the stored model value as `flash`, because Gemini still shows selected states as `Flash` and `Flash Extended`.

## Static Checks

Passed:

- `node --check src/shared/constants.js`
- `node --check src/content/gemini.js`

## Notes

- No Web Store ZIP was generated.
