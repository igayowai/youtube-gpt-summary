# Structure Audit And Refactoring Scope

Date: 2026-09-10 KST
Baseline: working tree v0.1.101, branch `master`
Status: inspection complete; runtime changes not applied; implementation scope awaiting approval.

## Scope And Boundaries

- Reviewed the MV3 manifest, all 10 runtime JavaScript files, Options entry point, project rules, README, handoff notes, and capture index. Approximately 8,000 JavaScript lines, with approximately 6,500 in the three provider content scripts.
- Existing uncommitted and untracked work was preserved. HEAD alone is not a valid rollback baseline for the current working tree.
- Executed local Node syntax and in-memory behavior checks. No real browser profile, cookies, prompts, storage, clipboard, or external service was accessed by these checks.
- This is a structural and targeted behavior audit, not proof that every live third-party UI flow works. No ZIP, version bump, permission change, or collab-skill modification was made.

## Current Architecture

| Boundary | Responsibility | Assessment |
| --- | --- | --- |
| `manifest.json` | Entry points, ordered classic scripts, permissions | Existing no-build MV3 structure is sufficient; no framework or bundler needed. |
| `src/background/service_worker.js` | Message dispatch, ChatGPT queue, provider tab creation, pending-prompt access | Queue read/modify/write and lifecycle handling need targeted correction. |
| `src/shared/constants.js` | Defaults, prompt templates, model lists, protocol names, limits | Overwritten prompt definition remains; configuration and prompt text are mixed. |
| `src/shared/storage.js` | Settings normalization, request URLs, session payloads and index | Repeated settings normalization; non-atomic index mutations. |
| `src/shared/promptBuilder.js`, `transcriptFormat.js`, `logger.js` | Prompt composition, transcript display, diagnostics | Small responsibilities; preserve these boundaries. |
| `src/content/youtube.js` | UI, route lifecycle, prefetch/cache, network extractors, DOM extraction/parsing | Largest mixed-responsibility file; extract pure parsing only after characterization tests exist. |
| `src/content/chatgpt.js`, `gemini.js` | Composer, provider-specific menus, temporary-chat detection, submission | Similar low-level operations, but different safety gates and event sequences. Do not merge into one generic provider implementation. |
| `src/options/` | Local settings UI | Four identical option-rendering flows and repeated settings-to-form assignments. |
| `docs/ui-dom-captures/` | Local Gemini/YouTube evidence and shared ChatGPT references | Keep canonical ChatGPT captures in collab; dated captures do not establish current live selectors. |
| `verification/`, `dist/` | Audit history and requested release artifacts | Existing `_check_lib.js` / `_temp_check.js` are diagnostics, not a repeatable regression suite. Archives are separate historical artifacts. |

Data flow: YouTube extraction -> prompt builder -> background message -> ChatGPT queue or direct Gemini open -> session payload -> request-id URL -> provider content script -> injection/submission -> pending cleanup. Only ChatGPT reports queue completion. Settings are in local storage; pending prompts and the ChatGPT queue are in session storage.

## Findings

### F1 - P1: Concurrent ChatGPT enqueue loses a request

Location: `src/background/service_worker.js:67`, also queue consumption at `:130`.

Each enqueue independently reads, modifies, and writes the same queue. `queueProcessing` protects concurrent processor calls, not enqueue calls or enqueue versus dequeue. Two asynchronous messages can read the same old queue and overwrite each other's additions.

Reproduction: load the actual worker in a Node VM with a clone-on-read, promise-based Chrome storage mock; enqueue fixture requests A and B concurrently. Expected `[A, B]`; observed `[B]`. Both calls return success. This is a real lost-update execution in the local model, not a browser timing benchmark.

Correction belongs in a separately tested queue mutation boundary. Avoid holding any mutation lock across a provider tab's entire workflow.

### F2 - P1: Temporary-chat confirmation accepts insufficient evidence

Locations: `src/content/chatgpt.js:1375`, `src/content/gemini.js:528`.

- ChatGPT accepts `?temporary-chat=true` before inspecting any UI state. A VM with only that URL parameter and no DOM evidence returns `temporary-chat url parameter`. If the service does not activate the requested mode, the extension can still permit submission. This also contradicts the README's statement that the URL alone is not confirmation.
- Gemini searches the entire body for broad phrases, including `gemini apps activity` and generic Korean phrases. A mock page containing only `This setting is listed in Gemini Apps Activity.` and no temporary control returns `temporary-chat page copy`.

These checks demonstrate false-positive predicates, not a confirmed real-account privacy incident. Changing them affects injection/submission behavior and needs a dedicated phase with positive and negative DOM fixtures. Preserve the fast close-icon evidence while narrowing weaker fallback evidence.

### F3 - P2: Waiting queue has no scheduled recovery after active work stops responding

Location: `src/background/service_worker.js:116`, failure catch at `src/content/chatgpt.js:1800`.

With A active and B enqueued, the one scheduled 2,000 ms processing attempt returns while A is still active. It schedules no subsequent check. If A's tab closes or the content script fails before completion notification, B can remain queued even after the five-minute stale threshold passes. The threshold is checked only when another event invokes processing.

Reproduction: store active fixture A, enqueue B, consume the scheduled attempt, and invoke the actual processor. Observed one waiting item, no opened tab, and zero rescheduled timers. A later external trigger can recover the queue; autonomous recovery is not currently established. Browser service-worker suspension/restart was not tested.

### F4 - P2: Pending-prompt index races and exceeds its configured limit

Locations: `src/shared/storage.js:237`, `:179`, `:280`.

- Concurrent saves of A and B leave both payload keys but only `[B]` in the index. Pruning relies on that index, so the orphan A payload is not covered by later indexed pruning; direct reads can still expire it.
- Sequential saves with a configured maximum of three reach four indexed items. Pruning runs before insertion and trims only when the existing count exceeds three.

Reproduction uses the actual storage functions and the same memory-only mock. Future fixes must preserve existing storage keys and TTLs and cover save/save and save/clear interleavings, expiration, and the maximum count. Do not migrate or clear the user's real session data as part of refactoring.

### F5 - P2: Gemini activation method logs do not describe all dispatched events

Location: `src/content/gemini.js:238`, especially `:255`.

When the fast native button is both the supplied container and the resolved target, `clickGeminiTemporaryChatControl` performs the selected method and then calls `clickElementAt` unconditionally.

Observed event counts using the actual private functions with a visible native-button mock:

| Logged method | Observed events |
| --- | --- |
| `keyboard` | Enter keydown/keyup, followed by one synthetic pointer/mouse click sequence |
| `pointer` | Two synthetic click sequences |
| `native` | One native click, followed by one synthetic click sequence |

This can cause duplicate toggle activation if both clicks are handled. More importantly, the previously successful fast path was not a pure keyboard-only path. Do not delete its pointer sequence as an apparently redundant refactor: real Gemini behavior must be measured separately, and method names/capture notes must match what is actually tested.

### F6 - P2: Injection mismatch is logged but still counted as success

Locations: `src/content/chatgpt.js:296`, `src/content/gemini.js:1746`.

Both injection functions warn when the composer lacks the expected prefix but still return true. ChatGPT then clears its pending prompt; Gemini can also clear after a reinjection reports this same false success. This is statically confirmed control flow; a rejecting live framework editor was not reproduced. A later corrective phase should test rejected and partial insertions before changing success criteria.

## Behavior-Preserving Cleanup Candidates

1. `constants.js:17` assigns an obsolete default prompt immediately overwritten at `:86`. Remove the first assignment while preserving the effective prompt byte-for-byte.
2. `storage.js:15` and `:33` independently normalize the same settings. Share one normalizer while preserving default handling, false booleans, and legacy model aliases. Do not change session storage behavior in this cleanup.
3. `options.js:113` onward repeats the same option renderer four times; loading, saving, and fallback also repeat settings-to-form assignment. Keep the current controls and DOM unchanged and share these local operations.
4. Six same-name ChatGPT/Gemini helper functions have identical bodies (49 duplicated lines, ignoring CRLF). This does not prove all six should become shared functions: `waitForComposerInput`, for example, closes over provider-specific selection and polling. Input adapters are also similar. Require characterization tests before sharing them; do not unify click, visibility, deduplication, model, or privacy helpers merely because their names match.
5. README's file tree omits `gemini.js`, and its historical limitations section still says there is no language selection UI. Separate present architecture from historical behavior; retain historical verification reports as history rather than rewriting their past results.

## Verification Performed

| Check | Result |
| --- | --- |
| Node runtime | v24.16.0 |
| `node --check`, all 10 `src/**/*.js` files | PASS |
| Manifest/shared version | PASS: both 0.1.101 |
| Manifest file references | PASS: all 17 listed references exist (including repeated shared-script references) |
| Settings defaults, eight ChatGPT legacy aliases, two Gemini aliases, false booleans, custom-prompt normalization | PASS in memory-only baseline checks |
| Empty transcript, output language, timestamp formatting, request URL encoding, pending save/read/clear and expiration | PASS in memory-only baseline checks |
| Total positive baseline assertions above | 22/22 PASS |
| Queue and pending index concurrency | FAIL: F1/F4 reproduced |
| Pending maximum | FAIL: four items with limit three |
| Queue recovery scheduling | FAIL: no future check after active-item return |
| Temporary confirmation negative fixtures | FAIL: F2 reproduced |
| Gemini activation event tracing | F5 reproduced; no claim of live toggle state |
| Existing `git diff --check` | PASS; LF-to-CRLF warnings only |
| Real YouTube/ChatGPT/Gemini integration and browser restart | NOT RUN |

The Node checks read source into isolated VM contexts and used dummy requests only. Private provider functions were exposed in memory with their automatic `main()` invocation disabled; production files were not edited. The one-off checks are not yet a committed regression suite.

## Proposed First Refactoring Phase

User problem / task goal: accumulated patches make the project difficult to maintain without accidentally changing behavior.

Main validation target: reduce duplication while proving that effective prompts, normalized settings, and the Options UI behavior stay unchanged.

Minimum maintainer-visible change set:

1. Add a dependency-free local regression entry point using the installed Node runtime and memory-only Chrome mocks. Include characterization checks and explicitly labeled known failures; do not label the whole runtime healthy while F1-F6 remain unresolved.
2. Remove the overwritten prompt assignment, unify settings normalization, and simplify Options rendering and form assignment. Keep existing stored keys, defaults, aliases, permissions, and public `YGS` interfaces.
3. Update the present-tense architecture/setup documentation and verification notes. Do not rewrite historical capture evidence or prior reports.

Non-goals / must not include now: changing Gemini click sequences or timings, changing either temporary-chat gate, queue/pending lifecycle corrections, broad provider-file splitting, UI redesign, new production dependencies, new browser permissions, automatic packaging, or collab-skill restructuring.

Completion criteria: identical effective prompt and settings results against the pre-edit working-tree baseline; local regression and syntax checks pass; manifest/Options loading references resolve; known behavior defects remain explicitly tracked; manual Options reload/save checks are clearly distinguished from mocked checks.

Rollback / recovery: preserve exact pre-edit copies of each modified dirty/untracked file in a separately identified local backup before implementation. Revert only this phase's edits, never reset the entire working tree to HEAD. No real Chrome storage migration, deletion, or reset is included. The audit report itself is independently removable and has no runtime effect.

Assumptions / unknowns: current live third-party UI was not inspected; no new outerHTML authority is assumed. Prior successful Gemini behavior may rely on the combined event sequence in F5.

Deferred: focused fixes for F1-F6, with queue/storage concurrency tested separately from live UI activation/privacy changes; pure transcript-parser extraction after fixtures exist. These items are not implicitly approved by approving the cleanup phase.

Skill routing: `mvp-scope` used to bound this first phase. No new tool/runtime/permission or storage architecture is proposed in it; existing-tool replacement and scope-expansion gates are not needed for this bounded cleanup. Reevaluate routing before a later storage/lifecycle or privacy-behavior change.

User approval needed before runtime implementation: YES, under the workspace writable implementation gate. This report is the proposed scope, not an approval record.
