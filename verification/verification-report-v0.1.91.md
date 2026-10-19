# Verification Report v0.1.91

Date: 2026-06-01 KST

Scope:
- Replace the old ChatGPT `Instant / Thinking / Pro` model-selection flow with the current ChatGPT `추론` menu.
- Add separate `Pro 기본` and `Pro 확장` options for the new Pro variant submenu.

Checks:
- [PASS] `manifest.json` version is `0.1.91`.
- [PASS] `src/shared/constants.js` version is `0.1.91`.
- [PASS] ChatGPT choices are now `선택 없음`, `즉시`, `중간`, `높음`, `Extra High`, `Pro 기본`, and `Pro 확장`.
- [PASS] Legacy saved `thinking` normalizes to `high`; legacy saved `pro` normalizes to `pro-extended`.
- [PASS] Active ChatGPT selection no longer depends on the old `model-switcher-gpt-*` row selectors.
- [PASS] ChatGPT reasoning menu search includes the current Radix `role="menuitemradio"` row structure.
- [PASS] The Pro-row trailing control is treated as a submenu trigger, not as the main row click target.
- [PASS] The separate `GPT-5.5` model-version submenu is intentionally not selected by the extension.
- [PASS] Valuable UI DOM captures and reduced outerHTML notes are archived under `docs/ui-dom-captures/`.
- [PASS] The project-local capture-management rule is recorded in `AGENTS.md`.
- [PASS] `AGENTS.md` is the authoritative project-local rules file; `README.md` links to it instead of duplicating project rules.
- [PASS] `docs/ui-dom-captures/README.md` is an index for capture files; detailed capture-management rules live in `AGENTS.md`.

Static validation:
- `node --check` passed for all JavaScript files under `src/`.
- `manifest.json` and `src/shared/constants.js` both report version `0.1.91`.
- Markdown links in onboarding and capture documents resolve.
- Project rules that define capture storage and package boundaries are owned only by `AGENTS.md`.

Package validation:
- `dist/youtube-gpt-summary-v0.1.91.zip` contains 17 extension package entries.
- The packaged `manifest.json` version is `0.1.91`.
- The ZIP contains exactly `manifest.json`, `LICENSE`, `assets/...`, and `src/...`.
- The ZIP preserves `assets/...` and `src/...` paths required by `manifest.json`.
- All manifest file references resolve inside the ZIP.
- ZIP entries match the current runtime files by SHA-256.
- The ZIP excludes repository support assets: `AGENTS.md`, `README.md`, `PRIVACY.md`, `docs/`, `verification/`, `store-submission/`, `plan/`, and `dist/`.

Manual validation:
- Reload the unpacked extension, select each `GPT 추론 선택` option, and run `Summarize with GPT`.
- Expected ChatGPT console logs should mention `ChatGPT reasoning selector found`, `ChatGPT reasoning option found`, and either `ChatGPT reasoning selected` or `ChatGPT reasoning selection attempted`.
