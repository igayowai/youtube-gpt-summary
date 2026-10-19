# Verification Report v0.1.94

Date: 2026-06-02 KST

Scope:
- Update the ChatGPT extra-high reasoning label after the visible UI text changed to `매우 높음`.

Checks:
- [PASS] `manifest.json` version is `0.1.94`.
- [PASS] `src/shared/constants.js` version is `0.1.94`.
- [PASS] The `extra-high` stored value is preserved for settings compatibility.
- [PASS] The Options label for `extra-high` is now `매우 높음`.
- [PASS] ChatGPT matching accepts `매우 높음`.
- [PASS] Legacy English matchers were removed after the UI changed to `매우 높음`.
- [PASS] The ChatGPT reasoning-menu capture notes the 2026-06-02 label change.

Static validation:
- `node --check` passed for all JavaScript files under `src/`.
- `manifest.json` and `src/shared/constants.js` both report version `0.1.94`.
- Manifest file references resolve.

Package validation:
- No new ZIP package was requested or generated for v0.1.94.
