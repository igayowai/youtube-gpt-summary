# Local Verification

Run from the project root with Node.js (tested with v24.16.0). No package installation, browser login, or development server is required.

```powershell
node --test verification/*.test.cjs
```

The explicit `*.test.cjs` pattern excludes historical diagnostic scripts such as `_temp_check.js`, which can launch a real browser. Do not replace it with a blanket execution of every JavaScript file in this folder.

## Interpreting Results

- `runtime.test.cjs`: runtime syntax, manifest/Options references, prompt hashes, settings/defaults/legacy aliases, prompt composition, URL encoding, and single-request session behavior.
- `options.test.cjs`: actual Options scripts loaded in HTML order against a small in-memory DOM model. Covers rendering, settings load/save, radio selection, failed reads/writes, and status timer behavior.
- `chatgpt-preferences.test.cjs`: model-first selection and final model/effort verification with a reduced current-menu fixture; includes unavailable/blocked choices, dismissal and Enter fallback. Not a signed-in browser test.
- `options-browser-smoke.cjs`: optional isolated browser check using an already available Playwright module (`node verification/options-browser-smoke.cjs <module-path> chrome`). Dummy storage, network blocked; saves screenshots under `output/playwright/`. Does not load/reload the real extension or inspect the user's profile.
- `known-issues.test.cjs`: desired-behavior assertions for the [structure audit F1-F6](structure-audit-2026-09-10.md), explicitly marked `TODO`, plus a passing characterization of Gemini's combined keyboard/pointer sequence.
- `helpers/runtime.cjs`: isolated Node VM, dummy Chrome storage/tabs/timers, and test-only private function access. Does not read real Chrome storage, authentication, clipboard, or network state. No extension source is rewritten by the tests.

After phase 1: **16 passing tests, 10 failing TODO tests, zero unexpected failures**. TODO assertions are executed, not skipped. Node exits successfully for expected TODO failures; that exit code is NOT evidence that the entire extension works correctly. They represent six known defect groups, not ten newly introduced bugs. When fixing a group, remove its TODO marker and preserve or update the meaningful behavioral assertion.

To run only the ordinary runtime and Options regressions:

```powershell
node --test verification/runtime.test.cjs verification/options.test.cjs
```

Prompt hashes record the effective pre-refactor default/deep prompt text, not the obsolete overwritten assignment. Change them only when an intentional prompt edit has been reviewed; do not refresh expected hashes merely to silence an unexpected failure.

## Limits And Manual Checks

These tests do not establish current ChatGPT/Gemini selector compatibility, actual browser event handling, visual layout, service-worker suspension/restart behavior, or successful external submission. Fake timers are not a browser lifecycle simulator. The small DOM model is not a full browser.

For a manual Options smoke check, reload the unpacked extension at the project root, open its Options page, note the original settings, and check the dropdowns and prompt-mode selection. Save only a deliberate reversible setting change, reopen Options to confirm it persisted, then restore the original value. This is a real local settings write; it is not performed by the tests above. Phase 1 did not run this manual check.

No package is built by these tests. ZIP packaging remains a separate requested action under `dist/`, with the runtime-only boundary defined by [`../CLAUDE.md`](../../CLAUDE.md).

## Latest Evidence

- [2026-09-19 live revalidation](live-revalidation-2026-09-19.md): local suite 36 pass / 10 known TODO failures; browser GPT 15-state sweep passed, but captured GPT-5.5 notice breaks runtime full-row recognition. Gemini menu changes observed. Source video transcript loading blocked end-to-end sends. No runtime fixes applied.
- [GPT model/effort split implementation](chatgpt-settings-split-2026-09-10.md): current suite has **36 pass, 10 existing failing TODO assertions, zero unexpected failures**, including five shortcut fallback regression tests. After user Reload, one real Latest/extra-high summary completed with final visible selection confirmed. Pointer opening succeeded; synthetic shortcut live coverage remains absent. Isolated Options browser smoke passes, but actual Options access remains Browser-policy blocked.
- [Earlier GPT slider patch and live verification](chatgpt-slider-live-patch-2026-09-10.md): that phase had 21 pass and 10 existing TODO failures. Its private-slider legacy-Pro rejection test is still valid; the new settings normalizer intentionally maps old Pro variants before they reach the slider.
- [Pre-change structure audit](structure-audit-2026-09-10.md)
- [Phase 1 refactoring verification and rollback baseline](refactoring-phase1-2026-09-10.md)

Older `verification-report-v*.md` files describe their own dated checks and releases; do not interpret them as current live UI verification.
