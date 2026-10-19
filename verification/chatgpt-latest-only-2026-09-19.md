# Latest-Only GPT Checkpoint

User approved this bounded phase. Follow-up corrected the omitted version bump to 0.1.102 in manifest.json and src/shared/constants.js; no ZIP. Earlier 0.1.101 evidence remains historical, not a claim of live 0.1.102 validation.

## Changes

- Removed the Options model dropdown; retained all reasoning choices and other settings.
- Settings and pending-request normalization always return `chatgptModelFamily: latest`.
- Provider selection independently forces Latest, including direct calls with old model values. Existing final checked-model/slider confirmation remains mandatory before injection/submission.
- Options saves omit the retired family field, preserving its original disk value for rollback. Legacy effort fields remain intact. No browser settings migration was performed.
- Kept old model recognition metadata for reading existing UI state, not as selectable summary preferences.
- Reused existing shared new-chat captures. No new outerHTML or duplicated capture assets. The GPT-5.5 retirement label need not be parsed to switch away from it to Latest.

## Verification

- `node --test --test-reporter=spec verification/*.test.cjs`: 36 pass, 10 pre-existing failing TODO assertions, zero unexpected failures. Includes runtime syntax, manifest references/version, prompt hashes, saved-field preservation, queued/direct old requests, all five efforts, Latest unavailable/ambiguous/blocked and final drift failures.
- Isolated headless Chrome Options smoke passed: actual local HTML/JS/CSS with dummy storage, HTTP(S) blocked, model control absent, effort save/reopen and old stored family preserved, 1280px/390px bounds pass, zero page errors. Screenshots: `output/playwright/options-latest-only-1280.png` and `options-latest-only-390.png`. This is not a real installed-extension storage test.
- Loaded-extension Options and post-patch live submission are not verified.
- Existing security blocks on extension management/extension URLs must not be bypassed using another transport. User extension Reload is required before ordinary tab refresh/live verification.

## Recovery And Scope

- Pre-edit source, tests and primary docs copied to `C:/Users/USER/AppData/Local/Temp/ygs-latest-only-20260919-001`.
- Restore only the files changed by this phase from that snapshot if rollback is needed, preserving later unrelated edits; then reload extension and refresh relevant tabs. Do not reset the dirty repository.
- After Reload, GPT summaries should select Latest and the configured effort; if confirmation fails, sending remains withheld. Diagnose the selection log or restore this phase, rather than bypassing confirmation.
- Transcript loading, button readiness colors, Gemini compatibility and the known TODO defects are outside this phase.
