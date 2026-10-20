# Verification Report v0.1.95

Date: 2026-06-02 KST

Scope:
- Fix ChatGPT `매우 높음` reasoning row detection after live logs showed the row existed but was not selected.

Checks:
- [PASS] `manifest.json` version is `0.1.95`.
- [PASS] `src/shared/constants.js` version is `0.1.95`.
- [PASS] `매우 높음` remains the label for stored value `extra-high`.
- [PASS] `매우 높음` still matches the `extra-high` option.
- [PASS] Legacy English matchers are not used for the `extra-high` option.
- [PASS] The plain `높음` prefix matcher no longer matches `매우 높음`.
- [PASS] This prevents `매우 높음` from being discarded as a multi-option row.
- [PASS] The ChatGPT reasoning-menu capture documents the overlap between `높음` and `매우 높음`.

Static validation:
- `node --check` passed for all JavaScript files under `src/`.
- `manifest.json` and `src/shared/constants.js` both report version `0.1.95`.
- Manifest file references resolve.

Package validation:
- No new ZIP package was requested or generated for v0.1.95.
