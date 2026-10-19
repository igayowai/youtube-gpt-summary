# ChatGPT Settings Split: Implementation Checkpoint

Updated: 2026-09-10 KST. Owner/session: current youtube_summary_GPT task, settings-split-20260910. Coordination: no conflicting session observed. Workspace and resume target: `C:/Users/USER/Documents/Claude/youtube_summary_GPT`.

Status: after user Reload, one real Latest/extra-high summary completed successfully (18:44-18:46 KST). Pointer opening succeeded, so the synthetic shortcut fallback remains live-unverified. Version remains 0.1.101. No ZIP, permission/dependency addition, Gemini content-script change or authentication-state access.

## Scope And Changes

- Approval: user said `진행` after the [settings split proposal](chatgpt-settings-split-proposal-2026-09-10.md). BUILD_MINIMAL within the existing settings-to-summary flow.
- Options: separate GPT model and effort selects. Models: Latest (default), GPT-5.6 Sol, GPT-5.5. Efforts: No selection (default), Instant, Medium, High, Extra High, Pro. No automatic model-list discovery.
- Storage: new `chatgptModelFamily` and `chatgptReasoningEffort`. Old `chatgptModel` is a read-only compatibility source only when the new effort key is absent. Old Pro variants map to Pro. Original legacy field and unrelated storage keys remain unchanged; reads do not migrate storage.
- New preferences pass through YouTube -> background queue/direct open -> pending request -> ChatGPT. Older pending requests normalize at read time without rewriting their original payload.
- Runtime: actively select and verify model, then effort, then reopen and verify both. No selection preserves initial effort while still enforcing the requested model. Missing/disabled/ambiguous models or unconfirmed selection stop injection and submission.
- Model selection uses one pointer activation, checked-radio readback, then one Enter fallback only if unconfirmed. Menu dismissal triggers readback after reopening, not a blind repeat click. Logs distinguish pointer/keyboard activation.
- Shared exact outerHTML remains canonical in the [collab new-chat model-picker captures](C:/Users/USER/Documents/Claude/youtube_summary_GPT/docs/ui-dom-captures/chatgpt/new-chat/model-picker-2026-09-10/README.md). No new shared capture was taken or duplicated. GPTs assumptions are not used.

## Verification

- `node --test --test-reporter=spec verification/*.test.cjs`: 40 tests, 30 pass, 10 existing failing TODO assertions, zero unexpected failures. TODOs remain the pre-existing F1-F6 groups; successful exit is not proof of full extension correctness.
- Runtime checks include all `src/*.js` syntax, matching manifest/constants version, manifest/Options references, unchanged permissions and effective prompt hashes.
- `chatgpt-preferences.test.cjs`: actual private runtime helpers with a reduced DOM fixture, all 3 models x 5 effort targets, all No selection initial values, model-first ordering, pointer miss/Enter fallback, menu dismissal, unavailable/disabled/duplicate/blocked controls, blocked slider and final model drift.
- Storage/Options tests cover new-key precedence (including none/null), legacy preservation, save/reopen, old pending compatibility and all 3 models x 6 settings x 2 request routes (36 queue/direct cases).
- `node verification/options-browser-smoke.cjs <installed-playwright-module-path> chrome`: PASS. Actual local Options HTML/JS/CSS rendered in isolated headless Chrome with dummy in-memory storage and HTTP(S) blocked. Save/reload persisted the selected model and effort; legacy field preserved; no page errors.
- Screenshots visually checked at 1280px and 390px: separate controls/labels fit without overlap. Artifacts: `output/playwright/options-settings-split-1280.png` and `output/playwright/options-settings-split-390.png`.
- Playwright's default bundled browser was absent; used the already installed Chrome channel with an isolated temporary profile. No browser download or access to the user's signed-in profile.
- `git diff --check`: PASS. Reviewed source differences against this phase's pre-edit copies, preserving earlier dirty work.

## Remaining / Exact Next Action

### Live Follow-up At Approximately 18:09-18:11 KST

- User confirmed Reload. Opened the same public test video in signed-in Chrome, paused playback, verified Transcript ready and clicked Summarize with GPT once. The new settings payload log and queued request were observed.
- ChatGPT logged selection requested, then model/effort not confirmed; injection/submission withheld. One reload of that same unsent pending request reproduced failure. No summary submitted in this follow-up.
- Settled visible menu showed Latest selected, effort 3 / 매우 높음, bounds 0..4, active simple panel and inactive/inert advanced panel. This does not establish which initial readiness condition failed.
- Code review found immediate slider reads at initial/final confirmation and possible toggling away from an active panel with zero animation geometry. Follow-up waits for active-panel geometry and valid slider state (up to 1.2s, exits immediately on readiness), and adds stage-specific startup failure logs. A delayed-render fixture reproduced the missing waits; follow-up full suite: 41 tests, 31 pass, 10 existing failing TODO assertions, no unexpected failures. Runtime syntax and diff checks pass. Live root cause/remediation not yet confirmed.
- Options navigation itself was explicitly blocked by Browser URL security policy. User subsequently opened Options, but no alternate route was used to read/control the blocked page. No real extension preferences were changed or restored in this follow-up.
- User noted Ctrl+Shift+M. Historical shared evidence exists at `chatgpt/new-chat/chatgpt-temporary-chat-dom-2026-05-23.md:173`. Current Chrome test also opened the performance/model menu with this shortcut, then Escape closed it without changing selections. Current extension source and searched tracked history have no such shortcut handler. Browser keypress success does not prove synthetic extension KeyboardEvent success; shortcut fallback is not implemented.
- Kept the unsent GPT test tab and paused YouTube test tab for continuation. After the next user Reload, refresh those ordinary tabs directly and inspect stage-specific logs. Do not send a duplicate while the original remains active; if pending state expires, run one fresh summary request. No model/effort matrix runtime success or settings save/reopen success claimed.

### User-Requested Shortcut Follow-up

- Added Ctrl+Shift+M to `openChatGptPicker`: retain pointer activation first; if no owned menu appears within 1.8s, recheck for a late opening, focus the verified picker button and dispatch one keydown/keyup pair. Confirm the same owned menu within another 1.8s. Already-open menus are not toggled; missing buttons do not trigger a blind shortcut.
- The shortcut is bounded to once per menu-opening operation, not once per entire request. Model/effort selection and final readback remain mandatory; a blocked shortcut or unrelated menu cannot authorize injection/submission.
- Added five regression tests: pointer/already-open behavior, exact shortcut after pointer miss, late pointer opening, blocked/foreign menu rejection, and final model/effort confirmation after shortcut activation.
- `node --test --test-reporter=spec verification/*.test.cjs`: 46 tests, 36 pass, 10 existing failing TODO assertions, zero unexpected failures. No live extension shortcut success claimed. The earlier browser keyboard observation is not proof that ChatGPT accepts synthetic KeyboardEvents from the extension.
- Shared capture README records the browser behavior separately from this consumer implementation; the 42 exact HTML fragments are unchanged.

### Successful Live Follow-up At Approximately 18:44-18:46 KST

- User confirmed Reload. Refreshed the previous GPT test tab; the new log reported no pending prompt. Refreshed the existing public YouTube video, waited for Transcript ready and clicked Summarize with GPT once. No duplicate request was sent.
- Found and claimed the extension-created tab through Chrome's user-tab discovery. Agent-owned tab listing alone did not show this newly created tab; this was not a queue failure.
- Sanitized log sequence: `ChatGPT selection requested` -> `ChatGPT model selected 최신` -> `ChatGPT reasoning selected via slider extra-high` -> `ChatGPT model and effort confirmed` -> `Prompt injected into ChatGPT composer` -> `Temporary Chat confirmed temporary-chat url parameter` -> `Prompt submitted`.
- The response reached its final conclusion; the Stop response control disappeared and Copy response appeared. After completion, opened the visible 매우 높음 picker: Latest radio was checked, slider value was 3 with bounds 0..4. Escape closed the menu without changing selections. No manual model/effort adjustment or extension-settings edit.
- No `ChatGPT picker shortcut fallback` log occurred. The loaded code succeeded through pointer opening; this run does not verify synthetic Ctrl+Shift+M acceptance, older-model transitions, or all settings combinations. Existing URL-only Temporary Chat confirmation (known F2) is unchanged.
- One passing run after the readiness patch does not isolate the earlier failure's root cause. No repeated submissions or injected UI interference were used to force the fallback. No runtime edits in this verification turn.

### Remaining Coverage

The requested bounded live revalidation is complete. Actual Options save/reopen remains Browser-policy blocked; no alternate transport bypass was attempted. Synthetic shortcut fallback and older-model runtime transitions remain unverified. The earlier live High -> Extra High run belongs to the [earlier slider patch](chatgpt-slider-live-patch-2026-09-10.md). Gemini, GPTs, F1-F6 repairs, version bump and ZIP remain outside this phase.

## Recovery

Pre-edit source/test copies: `C:/Users/USER/AppData/Local/Temp/ygs-settings-split-20260910-001`. Ten flat files preserve this phase's starting dirty state: constants.js, storage.js, chatgpt.js, youtube.js, service_worker.js, options.html, options.js, runtime.test.cjs, options.test.cjs, chatgpt-slider.test.cjs. Match each to its same-named source/test path; do not reset the worktree or overwrite newer unrelated edits.

The test-only memory-storage helper additionally now omits absent keys in array reads, matching Chrome behavior. New verification files and screenshots are non-runtime artifacts. To roll back this phase, compare/restore only its changes from the copies, reload the extension and refresh content tabs. Do not uninstall/reset extension storage: old code still reads its preserved `chatgptModel`, and ignores the additive new keys. No credential/config file transfer is needed.
