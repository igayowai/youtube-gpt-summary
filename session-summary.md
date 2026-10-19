# Session Summary

Last Updated: 2026-09-25 KST

## Current Fix: GPT Picker v0.1.103

- Reported `simple panel not ready` reproduced structurally in signed-in Chrome: old panel test IDs, toggle aria-expanded and slider anchor removed. Semantic view, active/aria-hidden track, toggle and power-slider anchors added with legacy fallback.
- Current advanced view returns to simple by selecting Latest. All model/effort confirmation guards remain. No Gemini, transcript or Options changes; no ZIP.
- Two new fixture tests cover modern DOM across 15 model/effort cases, advanced start, inactive view and missing/disabled Latest. Existing tests retained.
- Live DOM reads confirm new selectors, Latest checked, slider 3 -> 2 (High) -> 3 (매우 높음), original state restored and menu closed. No prompt sent. Actual patched extension execution awaits Reload; prior extension-page security block must not be bypassed.
- Evidence: docs/ui-dom-captures/chatgpt/new-chat/model-picker-2026-09-25.md.

## Current Checkpoint: Latest-Only GPT

- User approved Latest-only GPT summaries. Follow-up corrected the omitted version bump: root runtime is now 0.1.102; no ZIP created.
- Options model dropdown removed, effort retained. Settings/pending reads and provider boundary force Latest, with final model/effort verification before injection. Retired stored model preference is neither deleted nor overwritten by Options saves.
- Local regression suite: 36 pass, 10 existing failing TODO assertions, zero unexpected failures. Includes old requests, old model row retirement copy, storage preservation and fail-closed selection.
- No transcript, button-color or Gemini changes. Actual loaded-extension verification awaits user Reload under the existing browser security restriction; do not bypass it through another transport.
- Backup and verification details: [Latest-only checkpoint](verification/chatgpt-latest-only-2026-09-19.md). Next: after Reload, refresh relevant ordinary tabs and verify Latest selection plus the retained effort. Actual extension Options remains unverified.

## Previous Checkpoint: Live Revalidation

- User requested tests, not fixes. Runtime remains 0.1.101, no code changes or ZIP. Full local suite: 36 pass, 10 known failing TODO assertions, zero unexpected failures.
- GPT browser 3-model x 5-effort sweep passed, including Ctrl+Shift+M opening. Initial Latest/Pro restored. Extension synthetic shortcut and all-combination automatic submissions remain unverified.
- New GPT-5.5 retirement notice changes full row text. Existing readChatGptModelFamily returns empty for the observed label in a local actual-helper reproduction; requested-row lookup uses the same whole-row matching assumption.
- Gemini browser Temporary Chat on/off and Pro/Extended controls work. Current menu is 3.5 Flash-Lite / 3.8 Flash / 3.1 Pro, with a direct Korean extended toggle, not the older submenu. Existing label matcher mismatches reproduced locally; full extension flow not exercised. Initial Flash-Lite/non-extended/non-temporary state restored.
- YouTube prior test video's transcript panel remained loading; extension prefetch found no entries and timed out. No provider prompts sent. Root cause not isolated; no service-wide failure claim.
- Actual Options remains untested under the prior Browser-policy block. No bypass, live storage reads or settings writes. Test-only tabs closed; unrelated tabs untouched.
- Evidence and remaining coverage: [2026-09-19 report](verification/live-revalidation-2026-09-19.md), linked central GPT capture and local Gemini/YouTube notes. Next: propose bounded provider-menu compatibility fixes and separate transcript diagnosis; no new corrective phase approved.

## Previous Checkpoint: GPT Model / Effort Settings Split

- User approved the settings split with `진행`. Applied to the existing root-loaded extension; version 0.1.101 retained, no ZIP. Gemini content script unchanged by this phase.
- New model select defaults to Latest; observed GPT-5.6 Sol and GPT-5.5 included. Effort select retains No selection default and now has one Pro. Legacy Pro aliases map to Pro; original `chatgptModel` remains intact on disk.
- New keys flow through YouTube, background queue/direct open and pending requests. Runtime verifies model first, effort second and both again before injection/submission. Missing/ambiguous/blocked selections fail closed.
- Verification after timing and shortcut follow-ups: 36 passing tests, 10 existing failing TODO assertions, zero unexpected failures. Syntax, manifest/version and prompt hashes pass. Earlier isolated Chrome Options save/reopen and desktop/mobile screenshots pass; dummy storage only.
- Implementation/verification/recovery details and next action: [settings-split checkpoint](verification/chatgpt-settings-split-2026-09-10.md). Pre-edit copies: `C:/Users/USER/AppData/Local/Temp/ygs-settings-split-20260910-001`.
- Latest live check approximately 18:44-18:46 KST after user Reload: old pending request had expired; one fresh public-video summary succeeded through Latest selection, extra-high slider confirmation, final verification, injection and submission. Completed response and closed composer label verified; post-run menu showed Latest checked and slider 3 within 0..4. No manual selection or settings changes.
- This run used pointer opening; no shortcut-fallback log occurred. Ctrl+Shift+M fallback is implemented and locally tested but extension synthetic shortcut success remains unverified. One successful Latest/extra-high run is not all-model coverage or proof of the earlier root cause.
- No further Reload needed for this docs-only verification turn. Extension management and Options remain Browser-policy blocked, with no alternate transport bypass allowed. Actual Options persistence, older-model runtime transitions and shortcut activation remain coverage gaps; no unrelated F1-F6 repair approved. Next action: report this successful bounded run, without repeated submissions just to force a fallback.

## Previous Checkpoint: GPT Slider Patch

- Approved GPT-only patch applied to `src/content/chatgpt.js`: model-preserving slider steps, final effort readback, fail-closed injection/submission and menu-scoped diagnostics. Legacy Pro Basic/Extended are not silently mapped to Pro.
- Added `verification/chatgpt-slider.test.cjs`. Full suite: 21 pass, 10 existing TODO failures, zero unexpected failures; syntax and manifest/version checks pass.
- User reloaded extension. Actual Chrome run at approximately 04:00 KST succeeded through High -> Extra High (visible 매우 높음), injection and submission. Report headings appeared without manual selection. Details: `verification/chatgpt-slider-live-patch-2026-09-10.md`.
- Canonical collab capture consumer note and project index updated. No duplicated HTML, version bump or ZIP; version remains 0.1.101. Gemini unchanged by this phase.
- Pre-patch dirty-source backup: `C:/Users/USER/AppData/Local/Temp/ygs-chatgpt-pre-slider-20260910-patch1.js`.
- Remaining: legacy Pro semantics, independent Temporary Chat confirmation (known F2), other TODO defects and Gemini UI testing. One live path is not all-model stress coverage. Next phase needs a separately bounded scope.

## Previous Checkpoint: GPT Live Test Before Patch

- User authorized a real signed-in Chrome test after phase 1, GPT first and Gemini later. Test completed 2026-09-10: two YouTube button attempts, one actual summary submission.
- First attempt had stale/unavailable extension APIs; refreshing YouTube restored queue delivery. Refreshed GPT run requested Extra High but failed option selection and submitted with High. Summary output appeared; requested reasoning was not honored.
- Current new-chat UI uses a five-position performance slider. Full one-step sweep verified: Instant (0), 중간 (1), High (2), 매우 높음 (3), Pro (4). Highest composer label: 6 Pro. High restored; no prompts sent during menu checks.
- Exact outerHTML is canonical in the collab skill's new-chat folder: `chatgpt-reasoning-slider-2026-09-10.md`. Project index links there; GPTs and Gemini not inspected.
- Details and sanitized console evidence: `verification/chatgpt-live-test-2026-09-10.md`.
- Follow-up model-picker test: all 3 visible models x 5 effort positions verified without sending prompts. Older models always show a version prefix; Latest hides it at values 0..3 but shows 6 Pro at value 4. Reset at 5.6 중간 returned to Latest 중간. Restored Latest + High.
- Follow-up report: `verification/chatgpt-model-picker-test-2026-09-10.md`; 42 exact shared fragments and the matrix live under the collab new-chat `model-picker-2026-09-10/` folder. Selected-state verification caught several activation misses; do not infer model unavailability from a no-op click.
- At this earlier checkpoint no runtime patch, version bump or ZIP had been applied. The approved follow-up patch is recorded above; legacy pro-basic/pro-extended mapping remains unresolved.

## Previous Checkpoint: Phase 1 Refactoring

- User approved the first phase from `verification/structure-audit-2026-09-10.md`, then prioritized it over the newly reported ChatGPT/Gemini UI changes.
- Removed the overwritten default prompt in `src/shared/constants.js`; shared settings normalization in `src/shared/storage.js`; shared Options select rendering and form assignment in `src/options/options.js`. Runtime version remains `0.1.101`; no ZIP generated.
- Verification: `node --test verification/*.test.cjs`; 16 passing tests and 10 explicit TODO failures reproducing the existing F1-F6 defects. Settings differential check against the pre-edit working tree: 156 inputs, 468 identical comparisons. Default/deep prompt hashes unchanged.
- Existing provider scripts, queue/pending lifecycle, click sequences, timings, manifest, Options HTML/CSS, and collab captures were not changed. Gemini's current keyboard path includes a pointer click; do not assume it was keyboard-only from older notes below.
- Pre-edit copies of the five modified existing files are in `C:/Users/USER/AppData/Local/Temp/ygs-refactor-phase1-20260910-001`. This is a temporary local rollback aid, not a committed baseline; preserve earlier dirty changes when undoing this phase.
- Details: `verification/refactoring-phase1-2026-09-10.md` and `verification/README.md`. The structure audit remains a historical pre-change report.
- Next action: agree on a separate scope for signed-in Chrome UI capture/testing and provider fixes. The user reports BOTH provider UIs changed; previous captures are historical. No browser tests, external prompt sends, or F1-F6 corrective phase have been performed or implicitly approved by this phase.

## 2026-06-14 Update

v0.1.101 updates ChatGPT reasoning automation after the user's ChatGPT interface language changed to English. Display labels now match the live English reasoning menu (`Instant`, `Medium`, `High`, `Extra High`, `Pro Basic`, `Pro Extended`), while Korean matchers remain as compatibility fallbacks. English `High` is explicitly prevented from matching `Extra High`. The English Temporary Chat tooltip `Turn on temporary chat` is already covered by the existing `temporary` matcher. Manifest and shared version are now `0.1.101`.

## 2026-06-02 Update

v0.1.100 changes Gemini Temporary Chat activation to keyboard-first after live logs showed v0.1.99 still reached the third `keyboard` fallback before confirmation. Gemini now tries keyboard activation first, dispatches only Enter instead of Enter plus Space, trims each fallback window to 0.7 seconds, and caps button stabilization at 250ms. This is project-local Gemini DOM knowledge: `keyboard` means focusing the visible `button[aria-label="임시 채팅"]` and using the button's accessibility activation path, which was the fastest confirmed path for the current Angular/Material control. Manifest and shared version are now `0.1.100`.

v0.1.99 makes Gemini Temporary Chat activation latency-first after v0.1.98 was still too slow in live use. Gemini now tries the native button click before pointer fallback, checks confirmation after only 80ms, uses 0.9s fallback windows, polls active state every 80ms during Temporary Chat confirmation, and limits button-stability waiting to a short 150ms signature check. Manifest and shared version are now `0.1.99`.

v0.1.98 reduces Gemini Temporary Chat startup latency. Live logs showed v0.1.97 could wait through pointer, native, and keyboard fallback windows because confirmation only looked for page copy/input text and did not treat the active `close` icon as success. Gemini now confirms Temporary Chat immediately from the active toggle close icon, shortens fallback windows, and reduces first-click stabilization from a 3.5s page-age gate to a 1.2s gate. Manifest and shared version are now `0.1.98`.

v0.1.97 pins Gemini Temporary Chat activation to the fast nested native `button[aria-label="임시 채팅"]` target. Live Chrome testing on a logged-in Gemini tab showed the native button succeeds for 50/50 activation cycles and 50/50 same-tab reset cycles; active state changes the same toggle icon to `close`. Wrapper, container, and icon-only candidates are now treated as slow blacklisted targets and excluded from runtime fallback selection. Manifest and shared version are now `0.1.97`.

## 2026-06-01 Update

v0.1.96 hardens Gemini Temporary Chat activation after another live failure showed two click attempts but no confirmation. The likely failure mode is timing: the Temporary Chat button is visible before Gemini has fully attached/settled its click handlers. Gemini now waits for the button geometry/signature to stay stable for at least 1.2 seconds and for page age to reach 3.5 seconds before the first click. Confirmation windows were lengthened, page age is logged, and keyboard activation was added as a final fallback. Manifest and shared version are now `0.1.96`.

v0.1.95 fixes ChatGPT `매우 높음` reasoning row detection. Live logs showed the selector was found as `Pro 확장`, but the `매우 높음` menu row was not selected even though the row existed. Root cause: `매우 높음` also matched the older `높음` prefix matcher, so the row was classified as containing multiple options and filtered out. The matcher now prevents `매우 높음` from being treated as plain `높음`. Manifest and shared version are now `0.1.95`.

v0.1.94 updates the ChatGPT extra-high reasoning option after the live UI label changed to `매우 높음`. The internal stored value remains `extra-high`; the ChatGPT model list now displays and matches the Korean label `매우 높음`. Manifest and shared version are now `0.1.94`.

v0.1.93 adjusts the Gemini Temporary Chat activation sequence after live logs showed the extension clicking the correct `임시 채팅` button twice but still failing confirmation. The likely issue was toggle-style behavior receiving more than one click event per attempt: `clickElementLikeUser()` dispatched a synthetic click and then called native `.click()`. Gemini Temporary Chat now uses a single pointer-style click, waits for confirmation, and only then falls back to a single native click if needed.

Static validation passed for all JavaScript files under `src/`; manifest and shared version are now `0.1.93`.

v0.1.92 fixes Gemini Temporary Chat activation for the current `temp-chat-button` structure. User logs showed the extension found Temporary Chat candidates but failed confirmation, while manual activation worked. The captured DOM showed an empty-label `data-test-id="temp-chat-button"` custom wrapper around the actual nested `button[aria-label="임시 채팅"]`. The Gemini content script now prioritizes that nested native button and scores it by label, `gemini_chat_temp` icon, and `temp-chat-button` ancestry.

Static validation passed for `src/content/gemini.js` with `node --check`; manifest and shared version are now `0.1.92`. The new Gemini Temporary Chat capture is archived under `docs/ui-dom-captures/`.

v0.1.91 abandons the old ChatGPT `Instant / Thinking / Pro` model-selection structure and moves the ChatGPT setting to the current `추론` menu structure. The Options page now labels this control as `GPT 추론 선택` with `선택 없음`, `즉시`, `중간`, `높음`, `매우 높음`, `Pro 기본`, and `Pro 확장`.

The ChatGPT content script now treats composer `__composer-pill` controls as the new reasoning selector, searches the Radix `composer-intelligence` menu rows including `role="menuitemradio"` entries, avoids clicking the Pro-row trailing variant button as if it were the row itself, and opens the Pro variant submenu when `Pro 기본` or `Pro 확장` is requested. Legacy saved `thinking` values migrate to `높음`, and legacy saved `pro` values migrate to `Pro 확장`. The separate `GPT-5.5` model-version submenu is intentionally ignored for this extension setting.

Static validation passed for `src/content/chatgpt.js`, `src/shared/constants.js`, and `src/shared/storage.js` with `node --check`; manifest and shared version are now `0.1.91`.

Gemini, YouTube, and project-specific UI DOM assets are organized under `docs/ui-dom-captures/`, and the project-local rule is recorded in `AGENTS.md`. Shared ChatGPT captures are maintained once under `C:/Users/USER/Documents/Claude/youtube_summary_GPT/docs/ui-dom-captures/chatgpt`, split into `new-chat/` and `gpts/`; the captures now reside in this project after retirement of the old collaboration skill.

## 2026-05-08 Update

v0.1.58 changes the default aggressive transcript prefetch setting to enabled. New installs, reset settings, or users without a stored `aggressiveTranscriptPrefetch` value now preload transcripts on YouTube watch pages by default; explicitly saved user settings still take precedence.

Static verification passed with the bundled Node runtime. Shared constants passed `node --check`; manifest version is `0.1.58`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.57 speeds up the now-working Gemini Temporary Chat activation flow. The fixed delay after clicking the Temporary Chat button was reduced from 1.4s/1.8s to 0.25s/0.5s, and the confirmation windows were trimmed to 2.5s/4.5s while keeping the retry path and prompt-injection safety gate.

Static verification passed with the bundled Node runtime. `gemini.js` and shared constants passed `node --check`; manifest version is `0.1.57`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

Chrome Web Store unlisted submission assets were also prepared for v0.1.57. The manifest description now mentions ChatGPT and Gemini, `PRIVACY.md` now includes Gemini model settings and a Chrome Web Store Limited Use statement, `docs/privacy.html` is ready to publish through GitHub Pages, `store-submission/chrome-web-store-listing-ko.md` contains Korean listing/privacy/permission copy, and `dist/youtube-gpt-summary-v0.1.57.zip` contains only the extension package files needed for upload.

v0.1.56 hardens Gemini Temporary Chat activation after a live run found the button was clicked but Temporary Chat confirmation timed out. Gemini now waits longer for the Temporary Chat button, retries activation once when the first click is not confirmed, keeps withholding prompt injection unless Temporary Chat is confirmed, and logs Temporary Chat button/body diagnostics if confirmation still fails.

Static verification passed with the bundled Node runtime. `gemini.js` and shared constants passed `node --check`; manifest version is `0.1.56`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.55 improves multi-video tab organization. When YouTube content scripts enqueue a ChatGPT prompt or open Gemini, the background worker records the source YouTube tab id, window id, and index from `sender.tab`. ChatGPT/Gemini tabs are then created immediately to the right of that source tab by using the live source tab index when available, with a default tab-placement retry if adjacent placement fails.

Static verification passed with the bundled Node runtime. `service_worker.js`, `chatgpt.js`, and shared constants passed `node --check`; manifest version is `0.1.55`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.54 re-enables ChatGPT fallback paths after the user live-tested the exact Plan A flow successfully. `CHATGPT_MODEL_PLAN_A_ONLY` and `CHATGPT_SEND_PLAN_A_ONLY` are now `false`, so exact selectors remain first priority and older heuristic model/send/Enter fallback paths are restored as safety nets.

Static verification passed with the bundled Node runtime. `chatgpt.js` and shared constants passed `node --check`; manifest version is `0.1.54`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.53 restores fast selected-model detection for ChatGPT reasoning-state labels. If the visible model selector shows a Thinking-only state such as `확장`, `표준`, `라이트 모드`, or `헤비 모드`, `elementIndicatesSelectedChatGptModel()` can again short-circuit when the requested model is `Thinking`. Requests for `Pro` or `Instant` still open the menu and use exact row selectors.

Static verification passed with the bundled Node runtime. `chatgpt.js` and shared constants passed `node --check`; manifest version is `0.1.53`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.52 fixes ChatGPT Plan A model-state handling. A composer pill labeled only with reasoning state, such as `확장`, no longer lets `elementIndicatesSelectedChatGptModel()` short-circuit model selection. Ambiguous composer model pills now force the script to open the model menu and use exact row selectors for `Instant`, `Thinking`, or `Pro`. The exact composer pill selector was broadened to `button.__composer-pill[aria-haspopup='menu']` when it has the expected model icon.

Static verification passed with the bundled Node runtime. `chatgpt.js` and shared constants passed `node --check`; manifest version is `0.1.52`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.51 extends the temporary Plan A-only test build to ChatGPT submission. `CHATGPT_SEND_PLAN_A_ONLY` is enabled in `chatgpt.js`, so if the exact send button selectors fail, the script logs `ChatGPT send button Plan B disabled for Plan A test` and disables the Enter-key submit fallback with `ChatGPT Enter submit fallback disabled for Plan A test`.

Static verification passed with the bundled Node runtime. `chatgpt.js` and shared constants passed `node --check`; manifest version is `0.1.51`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.50 is a temporary live-test build for ChatGPT model selection. `CHATGPT_MODEL_PLAN_A_ONLY` is enabled in `chatgpt.js`, so model-selector and model-row Plan B heuristics are disabled. If exact selectors fail, the script logs `ChatGPT model selector Plan B disabled for Plan A test` or `ChatGPT model option Plan B disabled for Plan A test`. Composer input and send-button fallbacks remain enabled.

Static verification passed with the bundled Node runtime. `chatgpt.js` and shared constants passed `node --check`; manifest version is `0.1.50`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.49 adds exact ChatGPT model row selectors from the live dropdown menu. The content script now first targets `role='menuitemradio'` rows with `data-testid='model-switcher-gpt-5-5'`, `model-switcher-gpt-5-5-thinking`, and `model-switcher-gpt-5-5-pro`, then falls back to previous label/role heuristics. Adjacent thinking-effort action buttons such as `model-switcher-gpt-5-5-thinking-thinking-effort` are explicitly skipped so model selection clicks the row, not the effort control.

Static verification passed with the bundled Node runtime. `chatgpt.js` and shared constants passed `node --check`; manifest version is `0.1.49`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.48 restores the ChatGPT temporary-chat model entry point used in the automation window. Live DOM showed the useful selector can be `button.__composer-pill[data-tone='accent'][aria-haspopup='menu']` with a model icon and a visible label such as `확장`. The negative reasoning-label filter now allows that accent model pill while continuing to exclude plain reasoning-only pills.

Static verification passed with the bundled Node runtime. `chatgpt.js` and shared constants passed `node --check`; manifest version is `0.1.48`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.47 adds exact scoping for ChatGPT model menu row selection. Once the model switcher opens, `findExactChatGptModelMenuItem()` first reads the switcher's `aria-controls`, locates the controlled menu root, and searches that dropdown for `Instant`, `Thinking`, or `Pro` rows before falling back to the older document-wide text/role heuristics.

Static verification passed with the bundled Node runtime. `chatgpt.js` and shared constants passed `node --check`; manifest version is `0.1.47`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.46 adds the exact ChatGPT model-switcher button selector supplied from the live UI. `findExactChatGptModelButton()` now prioritizes `button[data-testid='model-switcher-dropdown-button']`, `button[aria-label='모델 선택기']`, and equivalent model-switcher labels/styles. This restores an exact Plan A for opening the true ChatGPT model selector while keeping composer reasoning-intensity pills excluded.

Static verification passed with the bundled Node runtime. `chatgpt.js` and shared constants passed `node --check`; manifest version is `0.1.46`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.45 corrects the ChatGPT selector interpretation from v0.1.44 after live UI review showed the composer pill can be a reasoning-intensity selector rather than the model selector. `findExactChatGptModelButton()` is now reserved and returns no exact match until the true model-selector DOM is supplied, while reasoning-only labels such as `라이트 모드`, `표준`, `확장`, and `헤비 모드` are filtered out of model selector candidates. Exact input and send-button selectors from v0.1.44 remain in place.

Static verification passed with the bundled Node runtime. `chatgpt.js` and shared constants passed `node --check`; manifest version is `0.1.45`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.44 hardens ChatGPT live UI automation using exact DOM selectors supplied from the current ChatGPT composer. The ChatGPT content script now first looks for the unified composer form, the ProseMirror prompt textbox, and the exact send button identifiers `#composer-submit-button` / `button[data-testid='send-button']`; older heuristic lookup remains as Plan B.

Static verification passed with the bundled Node runtime. `chatgpt.js` passed `node --check`; manifest version is `0.1.44`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.43 adds project licensing. A root `LICENSE` file now contains the MIT License under `Copyright (c) 2026 YouTube GPT Summary contributors`, and the README now documents that MIT applies to the extension source code only, not YouTube videos, transcripts, captions, thumbnails, channel content, ChatGPT/Gemini outputs, brands, trademarks, or other third-party content/services.

Static verification passed with the bundled Node runtime. Shared constants passed `node --check`; manifest version is `0.1.43`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.42 replaces the deep summary prompt. `DEEP_SUMMARY_PROMPT` now contains the user's concise Korean forensic audit report prompt, including timestamp evidence rules, attribution density rules, report structure, conclusion bullets, and bolding guidance. The manifest and shared constants version were bumped to `0.1.42`.

Static verification passed with the bundled Node runtime. Shared constants passed `node --check` and loaded successfully in a VM smoke check; manifest version is `0.1.42`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.41 uses Gemini's exact live Temporary Chat DOM selectors supplied by the user. The Gemini content script now prioritizes `button[data-test-id='temp-chat-button']`, `[data-test-id='temp-chat-button']`, `[data-test-id='temp-chat-button-container'] button`, and `temp-chat-button button` before falling back to text/role heuristics.

Static verification passed with the bundled Node runtime. `gemini.js` and shared constants passed `node --check`; manifest version is `0.1.41`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.40 fixes a Gemini content script regression introduced during v0.1.39 hardening. `getGeminiTemporaryChatActiveReason()` called `getNearbyText()` before that helper existed, causing a `ReferenceError` and stopping the Gemini flow. The helper now collects text from the composer and nearby ancestors for Temporary Chat copy detection.

Static verification passed with the bundled Node runtime. `gemini.js` and shared constants passed `node --check`; manifest version is `0.1.40`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.39 tightens Gemini Temporary Chat safety after a live retest showed a prompt could be injected into a non-temporary Gemini composer when Temporary Chat activation failed. Gemini now withholds prompt injection entirely unless Temporary Chat is confirmed. The Temporary Chat click helper also tries inner switch/button controls before falling back to container coordinate clicks.

Static verification passed with the bundled Node runtime. `gemini.js` and shared constants passed `node --check`; manifest version is `0.1.39`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.38 adds Gemini model selection. The Options page now stores a separate `geminiModel` setting with `선택 없음`, `빠른 모델`, `사고 모델`, and `Pro`. The YouTube Gemini button includes that setting only in the Gemini payload, while the ChatGPT path continues to use only `chatgptModel`. The Gemini content script selects the requested model after Temporary Chat confirmation and before prompt injection, then proceeds with the existing auto-submit flow.

Static verification passed with the bundled Node runtime. Changed JavaScript files passed `node --check`; manifest version is `0.1.38`; permissions remain exactly `storage` and `clipboardWrite`; host permissions remain scoped to YouTube, ChatGPT, and Gemini; no `<all_urls>` or `tabs` permission was added.

v0.1.37 fixes the first Gemini live retest issue. The user confirmed Gemini Temporary Chat opened and the prompt was injected, but auto-submit was withheld because the Korean Temporary Chat privacy copy was not recognized. Gemini Temporary Chat detection now matches the Korean page copy visible after clicking Temporary Chat, including recent-chat/Gemini Apps Activity/72-hour storage wording. Gemini submit-button scoring now also prefers right-side composer controls and penalizes nearby tools/model/upload controls.

Static verification passed with the bundled Node runtime. `gemini.js` passed `node --check`; manifest version is `0.1.37`; permissions remain exactly `storage` and `clipboardWrite`; no `<all_urls>` or `tabs` permission was added.

v0.1.36 adds a Gemini MVP workflow. YouTube watch pages now render two buttons in the same root: `Summarize with GPT` and `Summarize with Gemini`. Gemini uses the existing transcript extraction/cache and prompt builder, but skips ChatGPT model selection. Gemini opens immediately through a new background message, stores the prepared prompt in the existing pending prompt storage, opens `https://gemini.google.com/app#ygsRequestId=...`, and uses a new Gemini content script to retrieve, inject, and optionally submit the prompt. The Gemini content script attempts to enter/confirm Gemini Temporary Chat first; if Temporary Chat is not confirmed, it withholds auto-submit and leaves the prompt in the composer when possible.

The manifest now includes `https://gemini.google.com/*` host access and a Gemini content script. `PRIVACY.md` and the Options disclaimer were updated to mention Gemini/Google prompt transfer, Gemini Temporary Chat limitations, and third-party service dependency. Static verification passed with the bundled Node runtime; changed JavaScript files passed `node --check`; manifest version is `0.1.36`; permissions remain exactly `storage` and `clipboardWrite`; no `<all_urls>` or `tabs` permission was added.

v0.1.35 reduces `CHATGPT_QUEUE_START_DELAY_MS` from 3500 ms to 2000 ms. Idle queues still start immediately from v0.1.34; the 2 second delay only applies when another ChatGPT queue item is active.

Static verification passed with the bundled Node runtime. Shared constants passed `node --check`; manifest version is `0.1.35`; permissions remain exactly `storage` and `clipboardWrite`; no `<all_urls>` or `tabs` permission was added.

v0.1.34 improves ChatGPT queue responsiveness. When a YouTube click enqueues a prompt and there is no active ChatGPT queue item, the background worker now starts queue processing immediately instead of waiting the fixed 3.5 second queue start delay. The delay remains only when another ChatGPT job is already active, preserving sequential multi-tab processing.

Static verification passed with the bundled Node runtime. `service_worker.js` and shared constants passed `node --check`; manifest version is `0.1.34`; permissions remain exactly `storage` and `clipboardWrite`; no `<all_urls>` or `tabs` permission was added.

v0.1.33 replaces the old `PRIVACY.md` draft with a clean publication-oriented privacy policy and disclaimer. The document now covers processed data, local settings storage, temporary transcript cache, session queue data, data not stored, ChatGPT/OpenAI sharing, Temporary Chat limitations, auto-submit behavior, clipboard fallback, permission justifications, independent-affiliation disclaimer, professional-advice disclaimer, commercial-use boundaries, and Chrome Web Store publication consistency notes.

Static verification passed with the bundled Node runtime. Manifest version is `0.1.33`; permissions remain exactly `storage` and `clipboardWrite`; no `<all_urls>` or `tabs` permission was added.

v0.1.32 moves the Options page `Save Settings` action above the contact and disclaimer area. This keeps the editable settings workflow visually grouped before the static contact and legal disclosure text.

Static verification passed with the bundled Node runtime. Options JavaScript passed `node --check`; manifest version is `0.1.32`; permissions remain exactly `storage` and `clipboardWrite`; no `<all_urls>` or `tabs` permission was added.

v0.1.31 adds a collapsed `면책 조항` disclosure below the Options page contact line. The text states that the extension is independent from YouTube, Google, OpenAI, and ChatGPT; AI summaries may be inaccurate; the extension is not professional advice; commercial workflows may use the extension itself but receive no rights to third-party video/transcript/caption/content; users remain responsible for copyright, platform terms, and legal compliance; third-party service behavior is not guaranteed; and the developer does not collect, sell, or share user data through a developer-operated server.

Static verification passed with the bundled Node runtime. All JavaScript files passed `node --check`; manifest version is `0.1.31`; permissions remain exactly `storage` and `clipboardWrite`; no `<all_urls>` or `tabs` permission was added.

v0.1.30 fixes the remaining YouTube DOM transcript cleanup issue reported after v0.1.29. The previous duplication fix removed `text 0:00text` rows, but some rows still began with Korean timestamp words from YouTube's transcript UI, such as `15초`, `1분 1초`, or `22분`, after the extension's own `[MM:SS]` timestamp. Transcript normalization now removes only Korean timestamp prefixes that exactly match the row's start time, keeping normal spoken text untouched.

Static verification passed with the bundled Node runtime. All JavaScript files passed `node --check`; manifest version is `0.1.30`; permissions remain exactly `storage` and `clipboardWrite`; no `<all_urls>` or `tabs` permission was added.

## 2026-05-05 Update

The user live-tested v0.1.4 and confirmed that ChatGPT still opens, receives the prompt, confirms Temporary Chat, and auto-submits. The failure was isolated to YouTube transcript extraction: fast prefetch failed, DOM fallback opened the transcript UI, but no transcript entries were parsed, resulting in the STOP prompt.

v0.1.5 has been implemented as a narrow YouTube DOM fallback repair. It updates version markers to `0.1.5`, treats empty `json3` transcript responses as a normal XML-fallback case, broadens transcript panel DOM candidate detection, parses timestamp/text from more current YouTube row shapes, and adds clearer `[YGS]` logs for Show transcript click, DOM extraction success, and DOM polling timeout candidate count.

Follow-up log showed DOM extraction succeeding with only `count: 1`, which is probably a partial or false-positive transcript. The v0.1.5 DOM candidate search was tightened again so it only scans transcript-specific panel roots and avoids broad YouTube panel/document timestamp UI.

Next follow-up log showed `candidateCount: 0` after the transcript button was clicked, meaning the root filter became too strict for the user's current YouTube DOM. The repair was adjusted again: transcript panel roots no longer require visible bounding boxes, and if no scoped candidates are found the code performs a transcript-specific global selector fallback only.

Another `candidateCount: 0` report showed the current YouTube DOM still was not being discovered. The repair now adds additional transcript-root and list-item selectors plus a richer timeout diagnostic object with selector counts and timestamp-bearing DOM samples.

The user then confirmed success: the extension quickly read the full transcript, pasted it into ChatGPT Temporary Chat, and auto-submitted. Remaining console noise came from expected fast-path misses before the successful DOM fallback, so those expected misses were downgraded from warning logs to informational logs while preserving warnings for actual fallback/final failures.

After reload, the user confirmed warning cleanup worked for fast-path misses. A remaining clipboard warning showed `navigator.clipboard.writeText` failing because the document was not focused, followed by successful `execCommand` fallback. This expected first-step clipboard failure was downgraded to an informational log; the existing fallback success log remains.

v0.1.6 added options-page advanced settings. `autoSubmit` moved into the bottom advanced settings section. A new `useTemporaryChat` setting defaults to `true`; when disabled, the extension opens regular ChatGPT instead of Temporary Chat. If Temporary Chat remains enabled, auto-submit still waits for Temporary Chat confirmation. If the user explicitly disables Temporary Chat, auto-submit follows the normal `autoSubmit` checkbox in regular chat.

v0.1.7 updated prompt settings. The built-in default prompt preview was removed. The top of the Options page now has three large mutually exclusive prompt mode cards: `기본 요약`, `심화 요약`, and `커스텀 프롬프트`. The custom prompt textarea sits directly below those choices. `promptMode` defaults to `default`; deep mode is reserved but `DEEP_SUMMARY_PROMPT` is intentionally `null` for now and falls back to the developer default prompt; custom mode uses the saved custom prompt, falling back to the developer default prompt if the custom prompt is empty.

v0.1.8 added `outputLanguage`, defaulting to `English`, with a 30-language dropdown in Options. UI language is not configurable. The dropdown displays native language labels, while the stored values remain English language names for stable `Respond in {language}.` prompt text. Normal transcript prompts now include `Respond in {language}.` after the selected instruction. Empty transcript STOP prompt behavior remains unchanged and does not include the language line.

v0.1.9 added a read-only prompt source disclosure UI below advanced settings. `개발자의 요약 프롬프트 원문 보기` expands to show `기본 요약` and `심화 요약` side by side on desktop, each with its own expand/collapse control. Basic shows `DEFAULT_SUMMARY_PROMPT`; deep is blank because `DEEP_SUMMARY_PROMPT` is intentionally `null` for now.

v0.1.10 fixed a transcript DOM parsing quality regression reported by the user: extracted transcript entries had duplicated text, timestamps collapsed to `[00:00]`, and timestamp-only rows were appended. The fix deduplicates readable DOM text sources and filters timestamp-only pseudo-entries while keeping extraction strategy unchanged.

v0.1.11 addressed a DOM fallback performance regression reported by the user, where the transcript panel appeared to be read one row at a time and took too long. The fix removes broad `div`/`span` scans from repeated DOM polling, selects the largest viable transcript scroll container, uses larger scroll steps, shortens wait time, and temporarily disables smooth scroll during collection.

The user then reported that v0.1.11 was only slightly faster and still much too slow. v0.1.12 adds a faster transcript-panel fallback route: after the YouTube transcript panel opens, the extension first tries to read transcript entries from YouTube transcript component data before falling back to the visible DOM scroll collector. The expected success log is `[YGS] Transcript component data extraction found entries`.

The user confirmed v0.1.12 loaded the transcript in one shot. v0.1.13 adds an optional ChatGPT model selector setting. The Options page now has `GPT 모델 선택` with four choices: `선택 없음`, `Instant`, `Thinking`, and `Pro`. `선택 없음` is the default and skips model-selection automation. If a model is selected, the ChatGPT content script tries to click the composer model dropdown and choose that model before injecting the prompt. If model selection fails because the ChatGPT UI changed or the model is unavailable, the extension logs the failure and continues with the current ChatGPT model.

The user tested `Thinking`, but ChatGPT still used their default Pro model. ChatGPT logs showed the model selector was found, but the `Thinking` menu option was not found. v0.1.14 added diagnostics for selected-model payload and ChatGPT model selector/menu candidates. v0.1.15 strengthens the menu item search by waiting longer after opening the selector and falling back to visible text-node matching for menu labels such as `Thinking`.

The user retested and still saw `ChatGPT model option not found`. v0.1.16 changes model-selection failure diagnostics from collapsed console objects to plain strings and adds a coordinate fallback that clicks the expected visible menu row for Instant, Thinking, or Pro after the model selector opens. The fallback validates the target label when available and logs when the coordinate target does not match.

The user observed that the current ChatGPT UI first shows the currently selected model label, e.g. `Pro 확장 모드`, and that clicking it opens the model list. v0.1.17 keeps that selected-model label as the anchor, dispatches pointer/mouse events around the selector more like a real click, and adds a keyboard fallback: Instant uses `Home, Enter`, Thinking uses `Home, ArrowDown, Enter`, and Pro uses `Home, ArrowDown, ArrowDown, Enter`.

The user then clarified current display labels: Instant shows `instant`; Thinking may show `라이트 모드`, `표준`, `확장`, or `헤비 모드`; Pro may show `Pro` or `Pro 확장 모드`. They specifically asked not to adjust thinking intensity. v0.1.18 therefore uses Thinking intensity labels only as selected-model/control detection material and limits actual menu-item clicks to model labels such as `Instant`, `Thinking`, and `Pro`. Coordinate and keyboard fallbacks were removed from the active path to avoid accidentally manipulating thinking intensity.

The user later saw a YouTube-side failure: `Cannot read properties of undefined (reading 'local')` from `getSettings()`. v0.1.19 adds guards around `chrome.storage.local` and `chrome.storage.session`. If storage is unavailable, `getSettings()` logs a warning and returns defaults instead of breaking the YouTube button flow. For normal saved settings such as `Thinking`, the extension and YouTube page still need to be reloaded so the new content script has a valid extension context.

The user then showed live ChatGPT logs where the script found `thinking• 확장` but the model still did not switch. v0.1.20 treats that as a click-target problem: after finding the model option text, it resolves a larger clickable row container, logs the final click target, clicks both the row and the row-center target, and waits up to 2.5 seconds for the visible selected model label to update.

The user confirmed v0.1.20 successfully switched from `Pro 확장 모드` to `Thinking` before prompt injection and auto-submit. v0.1.21 only updates the `GPT 모델 선택` Options hint to: `기본값은 '선택 없음'입니다. '선택 없음'이면 ChatGPT의 현재 기본 모델을 그대로 사용합니다. 오류 발생시 '선택 없음'으로 설정하세요.`

v0.1.22 replaces `DEFAULT_SUMMARY_PROMPT` with the user's Forensic Video Auditor Korean audit-report prompt. During verification, unescaped backticks in the prompt initially caused a JavaScript syntax error, so the shared constants file was rewritten cleanly with escaped literal backticks and restored readable Korean text for model labels, language labels, and the empty-transcript STOP prompt.

Static verification passed with the bundled Node runtime. All JavaScript files passed `node --check`; the manifest remains MV3; permissions remain exactly `storage` and `clipboardWrite`; no `<all_urls>` or `tabs` permission was added.

v0.1.23 removes the Options-page prompt source disclosure UI. The `개발자의 요약 프롬프트 원문 보기` section and its related render code/styles were removed so built-in prompt source text is not exposed in settings. The change does not alter transcript extraction, prompt building behavior, ChatGPT model selection, auto-submit, permissions, or storage schema.

Static verification passed with the bundled Node runtime. All JavaScript files passed `node --check`; targeted search confirmed no remaining prompt-source disclosure identifiers or visible Korean disclosure label in the Options HTML/JS/CSS; manifest version is `0.1.23`; permissions remain exactly `storage` and `clipboardWrite`; no `<all_urls>` or `tabs` permission was added.

The user reported that during ChatGPT injection/submit, an unintended sidebar project menu opened even though logs showed the model was already selected and the prompt was submitted. v0.1.24 narrows ChatGPT model-selector lookup and send-button lookup to the composer area. The direct model-button fallback now requires the candidate to be near the composer input and outside the sidebar. Send-button lookup no longer falls back to scanning the entire document, preventing sidebar/project controls from being clicked as submit candidates.

Static verification passed with the bundled Node runtime. All JavaScript files passed `node --check`; manifest version is `0.1.24`; permissions remain exactly `storage` and `clipboardWrite`; no `<all_urls>` or `tabs` permission was added.

The user asked whether YouTube tabs could extract transcripts as soon as the video page opens, before the `Summarize` button is clicked. v0.1.25 adds an optional `aggressiveTranscriptPrefetch` setting in Advanced Settings as `빠른 사전 추출`. The default is `false` for safety. When enabled, the watch-page prefetch allows DOM fallback too, meaning it may open/use YouTube's native transcript panel before the user clicks `Summarize`. If successful, the transcript is cached in the current YouTube tab and the click uses that cache to move to ChatGPT faster. If disabled, the old quiet fast-only prefetch behavior remains.

Static verification passed with the bundled Node runtime. All JavaScript files passed `node --check`; manifest version is `0.1.25`; permissions remain exactly `storage` and `clipboardWrite`; no `<all_urls>` or `tabs` permission was added.

The user live-tested v0.1.25 and aggressive prefetch started, but it failed before click because YouTube's Show transcript button was not yet available after description expansion. The same video succeeded after the actual `Summarize` click, proving the DOM fallback was correct but the prefetch timing was too early. v0.1.26 makes `openTranscriptPanelAndExtract` wait for the Show transcript button first, then wait/retry for the description expand button for up to 6 seconds, then wait up to 5 seconds for Show transcript after expansion. This keeps the same feature behavior but makes aggressive prefetch less likely to give up before YouTube finishes rendering the description area.

Static verification passed with the bundled Node runtime. All JavaScript files passed `node --check`; manifest version is `0.1.26`; permissions remain exactly `storage` and `clipboardWrite`; no `<all_urls>` or `tabs` permission was added.

The user confirmed v0.1.26 aggressive prefetch worked: it opened the description/transcript controls, extracted entries, cached them, and the later `Summarize` click used the prefetched transcript cache. The user then asked to proceed with a job queue so multiple YouTube tabs can be queued without competing ChatGPT UI automation.

v0.1.27 adds a ChatGPT queue in the background service worker. YouTube button clicks now send `ENQUEUE_CHATGPT_PROMPT` instead of opening ChatGPT immediately. The background stores queued prompt payloads in `chrome.storage.session`, waits a short idle delay, then opens one ChatGPT job at a time. ChatGPT content script sends `CHATGPT_PROMPT_DONE` after injection/submission or other terminal states, and the background then starts the next queued job. The queue keeps the existing ChatGPT UI automation and does not add new permissions.

Static verification passed with the bundled Node runtime. All JavaScript files passed `node --check`; manifest version is `0.1.27`; permissions remain exactly `storage` and `clipboardWrite`; no `<all_urls>` or `tabs` permission was added.

The user asked for the YouTube `Summarize` button to turn light green once pre-extraction completes. v0.1.28 adds a `ygs-transcript-ready` button state. When transcript entries are cached for the current videoId, the button turns light green and receives a `Transcript ready` tooltip/ARIA label. The ready state only applies when the cached videoId matches the current watch URL and is cleared on route changes or cache expiry.

Static verification passed with the bundled Node runtime. All JavaScript files passed `node --check`; manifest version is `0.1.28`; permissions remain exactly `storage` and `clipboardWrite`; no `<all_urls>` or `tabs` permission was added.

The user then showed a prompt where each transcript line contained duplicated text in the form `[00:00] text 0:00text`. This came from YouTube transcript DOM rows exposing both visible text and timestamped accessibility/readable text in the same segment. v0.1.29 adds segment text cleanup that removes leading timestamps and trims an inline repeated `timestamp + same text` suffix only when the text before and after the embedded timestamp look duplicated. This keeps normal timestamped segment parsing while avoiding the observed double-copy prompt.

Static verification passed with the bundled Node runtime. All JavaScript files passed `node --check`; manifest version is `0.1.29`; permissions remain exactly `storage` and `clipboardWrite`; no `<all_urls>` or `tabs` permission was added.

Next step: reload the unpacked extension in Chrome Developer Mode, keep `GPT 모델 선택` set to `Thinking`, save settings, reload the YouTube video, click `Summarize with GPT`, and check ChatGPT `[YGS]` logs for `ChatGPT model option selected by keyboard fallback`, `ChatGPT model option found`, `ChatGPT model option clicked by coordinate fallback`, or a plain-string diagnostic candidate list if it still fails.

## Current Status

The user confirmed that v0.1.3 fixed the ChatGPT auto-submit issue. The remaining concern was MVP speed: v0.1.3 could still wait several seconds because it sometimes opened YouTube's description area, clicked `스크립트 표시`, and scrolled the native transcript panel after the user clicked the summary button. The user and a friend pushed the direction back toward MVP: do not add background GPT tabs, multi-job queues, databases, or broader permissions. Instead, prepare transcript locally as early as possible and use cache on click.

A v0.1.4 MVP speed patch has been implemented, verified statically, reviewed, and packaged. The active plan file is:

`plan/20260503-221731--work-plan--youtube-gpt-summary-extension-v014-speed-patch--v02.md`

## Accepted Facts

- User is not a developer and wants local-testable Chrome Developer Mode packages.
- Chrome Web Store developer registration is complete.
- Project remains Manifest V3, no-bundler, plain JavaScript.
- Gemini, Claude, direct GPT API calls, and own server remain out of scope.
- Transcript must be sent whole, with timestamps, without chunking or truncation.
- Empty transcript must use only the STOP prompt and must not include title or URL.
- Settings defaults remain `customPrompt: null` and `autoSubmit: true`.
- Transcript language order remains confirmed: Korean `ko`, English `en`, then first track.
- v0.1.3 confirmed that ChatGPT Korean Temporary Chat detection and auto-submit can work.
- v0.1.4 should stay MVP: no background ChatGPT tabs, no multi-video queue, no database, no API server.
- Site access permissions should not be broadened; current YouTube and ChatGPT host permissions are enough.
- Prefetch is a timing/cache change inside the YouTube content script, not an all-sites permission expansion.
- Prefetch must not click YouTube `더보기`, click `스크립트 표시`, open transcript panels, or scroll transcript UI before the user clicks.

## Touched Files

- `manifest.json`
- `src/shared/constants.js`
- `src/content/youtube.js`
- `README.md`
- `PRIVACY.md`
- `verification/verification-report-v0.1.4.md`
- `verification/review-report-v0.1.4.md`
- `plan/20260503-192745--work-plan--youtube-gpt-summary-extension-v01--v01.md`
- `plan/20260503-221731--work-plan--youtube-gpt-summary-extension-v014-speed-patch--v02.md`
- `session-summary.md`

## Implementation Applied

- Updated extension version to `0.1.4`.
- Added current-tab `transcriptMemoryCache` keyed by `videoId`.
- Added `transcriptPrefetchPromises` to avoid duplicate fast prefetches for the same video.
- Added quiet prefetch scheduling when the YouTube watch page is ready or SPA navigation reinserts/checks the button.
- Made prefetch call fast extractors only with `allowDomFallback: false`.
- Changed button click flow to use cached transcript first.
- Added a short wait for an in-flight prefetch before falling back to full extraction.
- Preserved full post-click extraction with DOM fallback if cache and fast paths fail.
- Added direct Innertube player caption-track extraction using current `videoId`.
- Added current-video validation for player responses when `videoDetails.videoId` is available.
- Updated README and privacy draft to describe local prefetch/cache behavior and the fact that transcript is not sent to ChatGPT before user click.

## Verification

- All JavaScript files passed `node --check`.
- Manifest parsed successfully as JSON.
- Manifest version is `0.1.4`.
- Manifest remains Manifest V3.
- Permissions remain exactly `storage` and `clipboardWrite`.
- No `<all_urls>` permission was added.
- No `tabs` permission was added.
- Source checks confirm quiet prefetch scheduler, current-tab memory cache, cache-first click path, conditional DOM fallback, and Innertube player fast caption path.
- Prompt builder regression checks passed for custom prompt normalization, timestamp formatting, normal transcript prompt, and empty transcript STOP prompt.

## Risks

- Live YouTube may still fail all fast metadata paths for some videos; those videos will still use the slow DOM fallback after click.
- Runtime speed improvement cannot be fully confirmed in this environment.
- ChatGPT UI can still change, but v0.1.4 intentionally leaves the working v0.1.3 ChatGPT auto-submit path intact.
- The direct Innertube player caption path depends on YouTube web behavior and may need future repair if YouTube changes it.

## Next Step

The user should load the v0.1.4 package in Chrome Developer Mode, reload the target YouTube page, wait one or two seconds after the button appears so quiet prefetch can run, then click `Summarize with GPT`. If it is still slow, the next useful evidence is the YouTube DevTools Console `[YGS]` logs showing whether prefetch succeeded, failed, or used DOM fallback.

## v0.1.59 Update

- Hardened ChatGPT model selector lookup after a live log showed an ambiguous `모델` candidate being selected near the sidebar/profile area.
- ChatGPT model selection now treats exact structural selectors as the reliable path: composer `__composer-pill`, `model-switcher-dropdown-button`, Korean/English model selector aria labels, or the thread model-switcher transition style.
- Generic `model`/`mode` text alone no longer qualifies a button as a model selector, reducing the chance of opening account, sidebar, or unrelated controls.
- Manifest and shared version were bumped to `0.1.59`.

## v0.1.60 Update

- Fixed ChatGPT model-selector priority for the live neutral composer pill case, e.g. `Pro 확장 모드` inside `button.__composer-pill.__composer-pill--neutral`.
- Composer model pills whose label already contains a known ChatGPT model/state now qualify as exact model selector candidates even if geometric composer-proximity checks are unreliable.
- Composer pills now outrank generic `model-switcher-dropdown-button` / `모델 선택기` header controls, reducing drift into sidebar/profile UI.
- Manifest and shared version were bumped to `0.1.60`.

## v0.1.61 Update

- ChatGPT Temporary Chat confirmation now accepts the current URL query parameter `temporary-chat=true` as a direct confirmation signal.
- This avoids withholding auto-submit when ChatGPT was already opened through the extension's Temporary Chat URL but page-copy/toggle detection is delayed or brittle.
- The existing toggle/privacy-copy checks remain as fallbacks if the URL parameter is absent.
- Manifest and shared version were bumped to `0.1.61`.

## v0.1.62 Update

- Blocked ambiguous ChatGPT header controls whose entire label is only `모델` or `model` from qualifying as model selectors.
- This prevents the automation from opening a wrong model/menu control and then failing to find `Instant` / `Thinking` / `Pro` rows.
- The intended path remains the composer model pill, e.g. `Pro 확장 모드`, or a structurally exact non-ambiguous model selector.
- Manifest and shared version were bumped to `0.1.62`.

## v0.1.63 Update

- Moved the ambiguous `모델` / `model` guard ahead of the ChatGPT `__composer-pill` acceptance branch.
- This blocks generic composer-pill controls labeled only `모델` before they can pass through the composer-pill path.
- Manifest and shared version were bumped to `0.1.63`.

## v0.1.90 Update

- Rolled ChatGPT model settings back to the original `Instant / Thinking / Pro` labels.
- Removed the temporary ChatGPT intelligence-menu selector path from active model-selection code.
- Interim saved `chatgptModel` values `medium` and `high` now normalize to `thinking`.
- Restored the older ChatGPT model selector click path after the temporary menu-toggle path stopped opening the reverted UI.
- Manifest and shared version were bumped to `0.1.90`.

## v0.1.89 Update

- Added compatibility for ChatGPT rolling the model menu back to `Instant / Thinking / Pro`.
- The newer `중간` and `높음` ChatGPT settings now also match `Thinking`, preserving saved settings across both UI variants.
- Manifest and shared version were bumped to `0.1.89`.

## v0.1.88 Update

- Fixed ChatGPT `지능` menu opening after live logs showed `ChatGPT model selector found: pro` followed by no visible `즉시`, `중간`, `높음`, or `Pro` menu rows.
- Split selector-menu opening from normal click activation so the composer pill is not toggled open and immediately closed by an extra native `.click()`.
- Added an explicit wait for the ChatGPT intelligence menu root before searching model rows.
- Manifest and shared version were bumped to `0.1.88`.

## v0.1.87 Update

- Updated ChatGPT model selection for the new `지능` dropdown UI where model labels are `즉시`, `중간`, `높음`, and `Pro`.
- Replaced the Options page ChatGPT model choices with the new labels and updated the hint copy so `[즉시]` is the not-recommended fast option.
- Legacy saved `chatgptModel: "thinking"` now normalizes to `high`, preserving the previous strong-reasoning preference under the new UI.
- ChatGPT model menu matching now supports exact/prefix matchers and avoids selecting broad dropdown containers or stale `GPT-5.5` submenu rows when clicking a requested model.
- Manifest and shared version were bumped to `0.1.87`.

## v0.1.86 Update

- Added an aggressive transcript UI warmup on YouTube watch pages.
- When `aggressiveTranscriptPrefetch` is enabled, the YouTube content script now starts warmup shortly after page load, expands the description `더보기` button earlier, and clicks `스크립트 보기` as soon as it appears.
- Reduced DOM fallback waits: transcript prefetch starts sooner, description expansion waits less after click, show-transcript polling is tighter, and transcript-panel polling is faster.
- Added a YouTube-side `clickElementLikeUser` helper so Polymer controls receive pointer/mouse events plus a direct click fallback.
- Manifest and shared version were bumped to `0.1.86`.

Static verification passed with Node `--check` for shared constants and YouTube content script.

## v0.1.85 Update

- Fixed a Gemini model-selector false positive where an unrelated `핀 목록 (Ctrl+P)` sidebar button could be selected as the model picker.
- Gemini model-selector fallback scoring now rejects pin/sidebar/MathJaxify controls and requires either the exact `bard-mode-menu-button` structure or a real model/menu label.
- Manifest and shared version were bumped to `0.1.85`.

Static verification passed with Node `--check` for shared constants and Gemini content script.

## v0.1.84 Update

- Updated Gemini Flash labeling and matching from `3 Flash` to `3.5 Flash`.
- Kept the stored Gemini model value as `flash`, because Gemini still displays the selected pill as `Flash` or `Flash Extended`.
- Manifest and shared version were bumped to `0.1.84`.

Static verification passed with Node `--check` for shared constants and Gemini content script.

## v0.1.83 Update

- Updated Gemini settings for the new Gemini UI.
- `Gemini 모델 선택` now uses the current labels: `3.1 Flash-Lite`, `3.5 Flash`, and `3.1 Pro`.
- Added a separate `Gemini 사고 수준` option with `선택 없음`, `Standard`, and `Extended`.
- Gemini payloads now carry `geminiThinkingLevel` from Options through YouTube, background storage, and the Gemini content script.
- Gemini automation now opens the new `bard-mode-menu-button` / `gem-menu-item` menu, selects the requested model row, then expands `사고 수준` and selects `Standard` or `Extended` when requested.
- Auto-submit is withheld if either the requested Gemini model or requested Gemini thinking level cannot be confirmed.
- Manifest and shared version were bumped to `0.1.83`.

Static verification passed with Node `--check` for shared constants, storage, options, YouTube content, Gemini content, and the background service worker.

## v0.1.82 Update

- Updated Options page model-selection hints.
- ChatGPT model hint now says `[Instant]` is not recommended.
- Gemini model hint now says `[빠른 모드]` is not recommended.
- Manifest and shared version were bumped to `0.1.82`.

## v0.1.81 Update

- Aligned the in-extension Options page lead text, aggressive prefetch hint, and disclaimer with the accessible transcript/caption behavior.
- The Options disclaimer now states that transcript/caption availability and extraction success are not guaranteed for every YouTube video.
- The Options disclaimer also states that ChatGPT/Gemini are not opened when transcript/caption extraction fails.
- Changed the default output language from `English` to `Korean` for new or unset settings.
- Manifest and shared version were bumped to `0.1.81`.

## v0.1.80 Update

- Responded to the Chrome Web Store rejection note that transcript fetching was not reproducible during review.
- If no accessible transcript/caption can be extracted for a YouTube video, the YouTube button now shows `Transcript unavailable` and does not open ChatGPT or Gemini with a failure prompt.
- Manifest, shared version, README, privacy copy, docs privacy page, and store submission copy were updated to describe accessible transcripts/captions instead of implying every YouTube video can be summarized.
- Manifest and shared version were bumped to `0.1.80`.

## v0.1.79 Update

- Cleaned remaining mojibake Korean fallback strings in the ChatGPT content script.
- Whole-project UTF-8/mojibake scan and all JavaScript syntax checks passed.
- Manifest and shared version were bumped to `0.1.79`.

## v0.1.78 Update

- Reduced Gemini model-selector toggle flicker by opening the model menu with a lighter single synthetic click.
- The stronger native-click fallback is still used for model option activation, but not for the selector toggle that opens the menu.
- Manifest and shared version were bumped to `0.1.78`.

## v0.1.77 Update

- Changed the YouTube GPT/Gemini summary controls into a fixed floating button group at the bottom-right of the viewport.
- The YouTube content script now appends the controls directly to `document.body` instead of inserting them into YouTube's changing page layout containers.
- Added responsive styling so the floating controls fit narrow viewports.
- Manifest and shared version were bumped to `0.1.77`.

## v0.1.76 Update

- Updated the default summary prompt to keep the forensic internal analysis process while limiting final output to `키포인트 요약` and `최종 결론`.
- The default prompt now asks for 3-5 concise timestamped key-point bullets and a 1-2 sentence/bullet final conclusion.
- Manifest and shared version were bumped to `0.1.76`.

## v0.1.75 Update

- Gemini model-menu opening is now explicit and retryable after clicking the mode selector.
- The script waits for a visible model menu root, then retries alternate selector click positions if the popup does not appear.
- Model menu candidate diagnostics are now scoped to visible menu roots, and menu-root diagnostics are logged when the popup cannot be opened.
- Manifest and shared version were bumped to `0.1.75`.

## v0.1.74 Update

- Scoped Gemini model option fallback search to visible Angular/Material model menu roots instead of the whole document.
- This prevents injected prompt text in the composer from matching the broad `pro` model heuristic while the popup has not appeared yet.
- Manifest and shared version were bumped to `0.1.74`.

## v0.1.73 Update

- Gemini selected-state confirmation now accepts `aria-current="true"` and `is-selected` on exact model option rows.
- Added Korean exact selectors for Gemini `bard-mode-option-빠른모델` and `bard-mode-option-사고모델`.
- Manifest and shared version were bumped to `0.1.73`.

## v0.1.72 Update

- Added richer Gemini model-selection diagnostics for found options, click targets, and unconfirmed requested options.
- Gemini synthetic pointer/mouse events now include `composed`, `view`, `button`, `buttons`, screen coordinates, and pointer metadata.
- Gemini keyboard activation events now include `composed`, `view`, `keyCode`, and `which`.
- Manifest and shared version were bumped to `0.1.72`.

## v0.1.71 Update

- Strengthened Gemini model option activation by always logging the chosen click target.
- Gemini model option activation now combines pointer/mouse/native click events with Enter/Space keyboard activation for the selected menu item.
- Wait time for Gemini model selection confirmation was increased to 5 seconds.
- Manifest and shared version were bumped to `0.1.71`.

## v0.1.70 Update

- Reordered Gemini automation so the prompt is injected immediately after Temporary Chat and composer detection, before requested model selection.
- Added a Gemini composer post-model-switch check; if the model switch clears or changes the prompt, the script reinjects the prompt before auto-submit.
- Manifest and shared version were bumped to `0.1.70`.

## v0.1.69 Update

- Added exact Gemini model option selectors, including `button[data-test-id='bard-mode-option-pro']`, before generic Gemini model text heuristics.
- Exact Gemini model buttons are also preferred as click targets and selected-state roots.
- Manifest and shared version were bumped to `0.1.69`.

## v0.1.68 Update

- Further hardened Gemini model option clicking by excluding the user-installed default-model star button.
- Broadened Gemini click-target ancestor selection around matched model text to include Angular/Material rows such as `mat-option`, menuitem/radio roles, and full-size row-like ancestors.
- `clickElementLikeUser` now scrolls/focuses the target and sends a native `.click()` after pointer/mouse events as a framework fallback.
- Manifest and shared version were bumped to `0.1.68`.

## v0.1.67 Update

- Updated Gemini model option clicking to climb from matched text/badge nodes to the clickable `.title-and-check` / `.under-input` model row.
- Added selected-state detection for Gemini's visible `.mode-check` / `check_circle` icon in the model menu.
- Manifest and shared version were bumped to `0.1.67`.

## v0.1.66 Update

- Hardened Gemini model selection so a requested model is confirmed via the selector label or selected menu state before auto-submit.
- Added a Gemini model option click-target helper to prefer visible option/button/menuitem controls inside the matched option row.
- If a specific Gemini model was requested but selection cannot be confirmed, the prompt remains in the composer and auto-submit is withheld to avoid submitting with the previous/default model.
- Manifest and shared version were bumped to `0.1.66`.

## v0.1.65 Update

- Added a direct YouTube transcript DOM parser for the newer `transcript-segment-view-model` / `ytwTranscriptSegmentViewModel...` rows.
- Included the newer transcript row and section-list containers in DOM diagnostics and transcript scroll-container detection.
- Replaced the fallback scroll loop's fixed sleeps with short MutationObserver waits and larger scroll steps, with an early stop after repeated no-new-entry passes.
- Manifest and shared version were bumped to `0.1.65`.

## v0.1.64 Update

- Added a YouTube watch-page `routeEpoch` so stale transcript prefetch work can be abandoned when the SPA route changes to a different video.
- Route changes now clear pending prefetch promise tracking and cancel the scheduled prefetch timer before scheduling the new watch-page insertion/prefetch path.
- Aggressive DOM fallback now checks for stale video/epoch state before opening the transcript panel, while polling, and during transcript-panel scrolling.
- Stale prefetch results are discarded instead of cached to the current tab's transcript memory.
- Manifest and shared version were bumped to `0.1.64`.
