# 개발 기록 (YouTube GPT Summary v0.1.110)

사용자용 안내는 [README](../README.md). 이 문서는 버전별 변경, 내부 동작, 디버깅 기록이다. Claude Code용 프로젝트 규칙은 [CLAUDE.md](../CLAUDE.md).

GitHub: <https://github.com/igayowai/youtube-gpt-summary>. GitHub Pages serves the repository root of `main`, so the root `privacy.html` is the Chrome Web Store privacy policy URL (<https://igayowai.github.io/youtube-gpt-summary/privacy.html>). Keep it identical to `docs/privacy.html` and do not move or delete it. `.nojekyll` keeps Pages from running Jekyll over the docs.

v0.1.110 (2026-10-19): in a shown ChatGPT tab the composer re-render after injection came back EMPTY with the send button disabled, so the prompt was lost. If the live editor is a replacement and empty (or empty before any click), the prompt is injected again (at most twice) before sending.

v0.1.109 (2026-10-19): a ChatGPT/Gemini tab that is opened and never shown (the user switches away at once) has a 0x0 viewport, so every element measured zero size and the visibility check rejected the editor and the send button. Visibility now falls back to style and layout presence in that case.

v0.1.108 (2026-10-19): root cause of the ChatGPT auto-submit failure. After injection ChatGPT re-renders the composer; the editor the extension held was detached and a new editor holding the same text replaced it. The send-button search started from the detached editor and found nothing for 45 s (`send-button-missing`, empty button list). The send search and the submission check now follow the live composer.

v0.1.107 (2026-10-19): in the v0.1.106 live check the extension gave up about 8-20 s after injection without any retry log, while a page click right after sent in 0.6 s. ChatGPT send now waits for the send button across the whole 45 s window, records a step trace (button found or missing, each click outcome, composer buttons) and prints it as one text line. All `[YGS]` log objects are now printed as JSON text so automation tools can read them without DevTools.

v0.1.106 (2026-10-19): the v0.1.105 live check reported the failure correctly, but three clicks in the first ~10 s were still ignored while the same click a minute later sent at once. Send retries now continue for up to 45 s while the prompt stays in the editor, and each ignored click logs page state (visibility, focus, open menus, button disabled) for diagnosis.

v0.1.105 (2026-10-19) fixes a false ChatGPT auto-submit success found in the live v0.1.104 check: the send click right after injection was ignored but logged as `Prompt submitted`. The extension now confirms the send (stop button, emptied editor, `/c/` URL), retries the click up to 3 times only while the prompt is still in the editor, and reports failure otherwise.

v0.1.104 (2026-10-19) follows the 2026-10-19 UI changes. ChatGPT: the extension no longer changes the model (the Latest row is gone); it only sets the reasoning effort and fails closed if the checked model changes. New composer, trigger and send selectors. Gemini: adds `4 Argon`, updates Flash-Lite/Flash names, and replaces Standard/Extended with `최저가`/`보통`/`최고가` (saved Standard maps to 최저가, Extended to 최고가). YouTube: the fast transcript path now uses `youtubei/v1/get_panel`. [Observations](ui-dom-captures/live-ui-2026-10-19.md).

v0.1.103 (2026-09-25) fixes `simple panel not ready` after ChatGPT removed the old panel test IDs, toggle aria-expanded and slider anchor. New semantic view/slider anchors coexist with the earlier selectors. Latest-only and final effort verification remain required. [Current capture and verification](ui-dom-captures/chatgpt/new-chat/model-picker-2026-09-25.md). No ZIP; installed-extension execution awaits Reload.

Current root patch v0.1.102, 2026-09-19: GPT summaries always select and verify Latest, including old pending requests. Options exposes reasoning effort only (No selection, Instant, Medium, High, Extra High, Pro); the model dropdown was removed. Retired model preferences and legacy effort fields remain untouched on disk. Model and effort must both be confirmed before prompt injection/submission. No ZIP created. Local regression tests pass; this patch's loaded-extension validation awaits Reload. See the [Latest-only checkpoint](verification/chatgpt-latest-only-2026-09-19.md).

Earlier 2026-09-10 phase: internal refactoring removed the overwritten default prompt and shared settings normalization/Options rendering without changing effective prompt text. Subsequent GPT slider and settings patches are documented separately in [local verification](verification/README.md). Gemini UI testing remains deferred. See the [phase 1 report](verification/refactoring-phase1-2026-09-10.md).

The version notes below describe historical releases preceding v0.1.102.

v0.1.101 updates ChatGPT reasoning automation for the English ChatGPT UI. The displayed reasoning labels now match `Instant`, `Medium`, `High`, `Extra High`, `Pro Basic`, and `Pro Extended`; Korean matchers remain as compatibility fallbacks. English `High` is guarded from matching the `Extra High` row, and English menu diagnostics include the `Intelligence` label.

v0.1.100 moves Gemini Temporary Chat activation to the observed successful keyboard-first path. The fallback chain now tries keyboard before pointer/native, uses only Enter for the keyboard activation, trims each fallback window to 0.7s, and caps button stabilization at 250ms.

v0.1.99 makes Gemini Temporary Chat activation latency-first. The content script now tries the fast native button click before synthetic pointer fallback, cuts per-method confirmation windows to 0.9s, reduces post-click delay to 80ms, and limits button-stability waiting to a short 150ms signature check.

v0.1.98 speeds up Gemini Temporary Chat activation after live logs showed the recent hardening path waiting through pointer, native, and keyboard fallback windows even though the toggle had likely already changed state. Temporary Chat confirmation now accepts the active `close` icon as an immediate success signal, shortens fallback confirmation windows, and reduces first-click stabilization from a 3.5s page-age gate to a 1.2s gate.

v0.1.97 pins Gemini Temporary Chat activation to the fast native `button[aria-label='임시 채팅']` path after live Chrome stress testing showed 50/50 activation and 50/50 reset success. Slower wrapper/container/icon targets are now tracked as a blacklist and excluded from runtime fallback selection.

v0.1.96 makes Gemini Temporary Chat activation wait for the visible button to stabilize before clicking. This avoids clicking while Gemini has rendered the button but has not finished attaching its interaction handlers. The click path now logs page age, tries pointer and native clicks with longer confirmation windows, and adds a keyboard activation fallback.

v0.1.95 fixes ChatGPT `매우 높음` row detection. Because `매우 높음` contains the word `높음`, the older `높음` prefix matcher could make the row look like multiple reasoning options and discard it. The matcher now prevents `매우 높음` from being treated as plain `높음`.

v0.1.94 updates the ChatGPT extra-high reasoning label to the current Korean UI text `매우 높음`. The stored value remains `extra-high`.

v0.1.93 fixes the Gemini Temporary Chat click sequence for toggle-style behavior. The Gemini content script no longer sends both a synthetic pointer click and a native `.click()` in the same activation attempt, because that can behave like a double-click on the Temporary Chat toggle. It now tries one pointer-style click, waits for confirmation, then falls back to one native click only if needed.

v0.1.92 fixes Gemini Temporary Chat activation for the current `temp-chat-button` DOM. The Gemini content script now prioritizes the nested native `button[aria-label='임시 채팅']` inside `data-test-id='temp-chat-button'` / `temp-chat-button-container`, instead of clicking the empty-label custom wrapper first. The related reduced DOM capture is indexed under `docs/ui-dom-captures/`.

v0.1.91 replaces the old ChatGPT `Instant / Thinking / Pro` model-selection flow with the current ChatGPT `추론` menu. Options expose `즉시`, `중간`, `높음`, `매우 높음`, `Pro 기본`, and `Pro 확장`; legacy saved `thinking` maps to `높음`, and legacy saved `pro` maps to `Pro 확장`. The ChatGPT content script now targets the Radix `composer-intelligence` menu, including `role="menuitemradio"` rows, and opens the Pro variant submenu when `Pro 기본` or `Pro 확장` must be selected. The separate `GPT-5.5` model-version submenu is intentionally ignored. ChatGPT UI DOM captures are maintained in this project's docs/ui-dom-captures/chatgpt/; capture-management rules live in `AGENTS.md`.

v0.1.90 rolls ChatGPT model selection back to the original `Instant / Thinking / Pro` settings after ChatGPT reverted the temporary model UI. Interim saved `medium` or `high` settings are normalized to `Thinking`, and the ChatGPT selector opening path uses the original model-menu click behavior again.

v0.1.86 speeds up YouTube DOM transcript fallback when aggressive prefetch is enabled. The content script now starts a transcript UI warmup shortly after watch-page load, clicks the description `더보기` expander sooner, opens `스크립트 보기` as soon as it appears, and reduces fallback polling delays.

v0.1.85 hardens Gemini model-selector detection so unrelated extension/sidebar buttons such as `핀 목록 (Ctrl+P)` cannot be treated as the Gemini model picker. Fallback selector scoring now requires a real Gemini model/menu label or the exact `bard-mode-menu-button` structure.

v0.1.84 updates the Gemini Flash model label and matcher from `3 Flash` to `3.5 Flash`. The stored setting value remains `flash` because Gemini's selected pill still displays `Flash` / `Flash Extended`.

v0.1.83 updates Gemini automation for the new Gemini model menu. Options now separate `Gemini 모델 선택` (`3.1 Flash-Lite`, `3.5 Flash`, `3.1 Pro`) from `Gemini 사고 수준` (`Standard`, `Extended`), and Gemini auto-submit is withheld if either requested choice cannot be confirmed.

v0.1.82 updates the Options page model-selection hints. ChatGPT model settings now warn that `Instant` is not recommended, and Gemini model settings now warn that `빠른 모드` is not recommended.

v0.1.81 keeps the v0.1.80 Chrome Web Store rejection response and also aligns the in-extension Options page copy and disclaimer with the accessible transcript/caption behavior. The Options page now says that transcript/caption extraction is not guaranteed for every YouTube video and that ChatGPT/Gemini are not opened when transcript/caption extraction fails. The default output language is now Korean for new or unset settings.

v0.1.80 responds to the Chrome Web Store review note about transcript-fetch reproducibility. If a YouTube video does not expose an accessible transcript/caption through the extension's supported extraction paths, the YouTube button now shows `Transcript unavailable` and does not open ChatGPT or Gemini with a failure prompt. Store-facing descriptions were also narrowed to accessible YouTube transcripts/captions instead of implying that every YouTube video can be summarized.

v0.1.79 fixes mojibake Korean fallback strings in the ChatGPT content script. Korean UI labels for model selection, temporary chat confirmation, and send-button fallback matching are now stored as readable UTF-8 text.

v0.1.77 makes the YouTube GPT/Gemini summary controls a fixed floating button group at the bottom-right of the viewport. The controls are now appended directly to `document.body`, so they stay visible while scrolling and are less affected by YouTube layout changes.

v0.1.76 updates the default summary prompt. It keeps the forensic internal analysis process, but the final output is limited to two short sections: `키포인트 요약` and `최종 결론`.

v0.1.75 makes Gemini model-menu opening explicit and retryable. After clicking the mode selector, the script now waits for a visible model menu root, retries the selector at alternate click positions if needed, and logs menu-root diagnostics when the popup does not open.

v0.1.74 scopes Gemini model option fallback search to the visible Angular/Material model menu. This prevents injected prompt text in the composer from being mistaken for a Pro model option while waiting for the menu popup to appear.

v0.1.73 recognizes Gemini's current menu selected state directly from exact option rows. `aria-current="true"` and `is-selected` are now accepted for selected model confirmation, and Korean exact selectors for 빠른 모델 and 사고 모델 were added.

v0.1.72 adds richer Gemini model-selection diagnostics and fuller synthetic event payloads. Model option logs now include tag, role, `data-test-id`, `data-mode-id`, and class details, while pointer/mouse/keyboard events include composed/view/button/keyCode fields for Angular/Material handlers.

v0.1.71 strengthens Gemini model option activation by always logging the click target, sending pointer/mouse/native click events, and adding Enter/Space keyboard activation for the selected menu item.

v0.1.70 changes Gemini automation order for speed: after Temporary Chat is confirmed, the prompt is injected first, then the requested model is selected. If the model switch clears or changes the composer, the prompt is reinjected before auto-submit.

v0.1.69 adds exact Gemini model option selectors for the current menu, including `button[data-test-id='bard-mode-option-pro']`. Exact model buttons are now preferred before generic text/row heuristics.

v0.1.68 further hardens Gemini model option clicking. It excludes the user-installed "default model" star button, considers broader Angular/Material ancestor rows around matched model text, prefers full-size menu rows, and combines pointer events with a native `.click()` fallback.

v0.1.67 improves Gemini model menu automation for the current Angular/Material menu structure. It climbs from matched model text to the clickable `.title-and-check` / `.under-input` row and treats the visible `mode-check` / `check_circle` icon as selected-state confirmation.

v0.1.66 hardens Gemini model selection before auto-submit. A requested Gemini model is now treated as selected only after the selector or selected menu state confirms it; if confirmation fails, the prompt is left in the composer and auto-submit is withheld instead of submitting with the previous/default model.

v0.1.65 speeds up the final YouTube transcript DOM fallback. It adds a direct parser for the newer `transcript-segment-view-model` transcript rows, includes those rows in scroll-container detection, and replaces fixed scroll sleeps with short MutationObserver waits while collecting visible transcript segments.

v0.1.64 cancels stale YouTube transcript prefetch work when a watch-page SPA route changes. Slow aggressive DOM/scroll fallback from a previous video now exits early instead of continuing to manipulate the current tab, and the new video's prefetch can start under a fresh route epoch.

v0.1.63 moves the ambiguous `모델`/`model` guard ahead of the ChatGPT composer-pill acceptance path. This blocks generic `__composer-pill` controls labeled only `모델` before they can be treated as a valid model selector.

v0.1.62 blocks ambiguous ChatGPT header controls whose entire label is only `모델`/`model` from being treated as a model selector. This prevents the automation from opening the wrong menu and submitting with the current model when the real composer pill is not selected.

v0.1.61 treats ChatGPT's `temporary-chat=true` URL parameter as a direct Temporary Chat confirmation. When the extension opens ChatGPT through its Temporary Chat URL, auto-submit no longer waits on fragile page-copy or toggle detection before submitting.

v0.1.60 recognizes ChatGPT's current composer model pill even when it is rendered as a neutral `__composer-pill`, such as `Pro 확장 모드`. This makes the composer pill outrank the generic header/model controls and should prevent the selector from drifting toward sidebar/profile UI.

v0.1.59 hardens ChatGPT model-selector detection after a live case where an ambiguous `모델` candidate was found near the sidebar/profile area. The ChatGPT content script now prioritizes structurally exact model controls such as the composer `__composer-pill` and `model-switcher-dropdown-button`, and no longer accepts generic `model/mode` text alone as proof of a usable selector.

v0.1.58 changes the default for aggressive transcript prefetch to enabled. New installs or users without a saved `aggressiveTranscriptPrefetch` setting will start preloading YouTube transcripts as soon as a watch page is ready, while existing saved user settings remain respected.

v0.1.57 speeds up Gemini Temporary Chat activation after the v0.1.56 retry path was confirmed to work. The fixed post-click wait was reduced so successful Temporary Chat transitions can proceed almost immediately, while the retry path remains available if Gemini ignores the first click.

Chrome Web Store unlisted submission assets were prepared for v0.1.57. The package description now mentions both ChatGPT and Gemini, `PRIVACY.md` includes Gemini model settings and a Limited Use statement, `docs/privacy.html` provides a GitHub Pages-ready privacy policy page, and `store-submission/` contains Korean listing, privacy disclosure, permission justification, and release checklist drafts.

v0.1.56 makes Gemini Temporary Chat activation more tolerant of slow or ignored first clicks. The Gemini content script now waits longer for the Temporary Chat button, retries the click once if the Temporary Chat page copy is not detected, and logs compact diagnostics if confirmation still fails. Prompt injection remains blocked unless Temporary Chat is confirmed.

v0.1.55 opens ChatGPT and Gemini result tabs immediately to the right of the source YouTube tab. The background worker stores the sender tab placement with each request, refreshes the live tab position when queued ChatGPT jobs start, and falls back to normal tab placement if adjacent placement is unavailable.

v0.1.54 re-enables ChatGPT model-selection and send-button fallbacks after the exact Plan A selectors were live-tested successfully. Plan A remains the priority path, while heuristic model selection, send-button lookup, and Enter fallback are restored as safety nets.

v0.1.53 restores fast selected-model detection for ChatGPT reasoning-state labels. If the model selector visibly shows a Thinking-only state such as `확장`, `표준`, `라이트 모드`, or `헤비 모드`, the script can treat `Thinking` as already selected without opening the menu; requests for `Pro` or `Instant` still open the menu and use exact row selectors.

v0.1.52 fixes the Plan A model-state issue for ChatGPT. Composer pills labeled only with reasoning state, such as `확장`, are now treated as ambiguous and no longer count as proof that the requested model is already selected; the script opens the menu and uses exact row selectors to choose the requested model. The exact composer pill selector was also broadened to allow the live `__composer-pill` model entry point.

v0.1.51 extends the temporary Plan A-only live test to ChatGPT submission. If the exact send button selectors fail, send-button heuristics and the Enter-key fallback are disabled and the script logs explicit warnings. This makes model-selection and send-button Plan A testing unambiguous.

v0.1.50 temporarily disables ChatGPT model-selection Plan B fallbacks for live Plan A testing. If the exact model selector or exact menu row selectors fail, the content script now logs an explicit Plan B disabled warning instead of silently using heuristic model selection. Input and send-button fallbacks remain enabled.

v0.1.49 adds exact ChatGPT model row selectors from the live dropdown menu. The script now targets `data-testid='model-switcher-gpt-5-5'`, `model-switcher-gpt-5-5-thinking`, and `model-switcher-gpt-5-5-pro` menuitemradio rows before falling back to text heuristics, and explicitly skips the adjacent thinking-effort action buttons.

v0.1.48 restores the ChatGPT temporary-chat model entry point used in the automation window. The content script now treats `button.__composer-pill[data-tone='accent'][aria-haspopup='menu']` with a model icon as a valid model/model-mode selector, even when its visible label is a reasoning label such as `확장`. Plain reasoning-only pills remain excluded.

v0.1.47 adds an exact Plan A for ChatGPT model menu rows. After opening the live model switcher, the content script now scopes menu-item lookup to the dropdown root referenced by the switcher's `aria-controls` before falling back to document-wide heuristics.

v0.1.46 adds the exact ChatGPT model-switcher button selector from the live UI: `button[data-testid='model-switcher-dropdown-button']` / `button[aria-label='모델 선택기']`. This restores a safe Plan A for opening the real GPT model selector while keeping reasoning-intensity composer pills excluded.

v0.1.45 corrects the ChatGPT selector hardening from v0.1.44. The current composer pill can represent reasoning intensity rather than the model selector, so it is no longer treated as an exact ChatGPT model selector. Reasoning-only labels such as `라이트 모드`, `표준`, `확장`, and `헤비 모드` are excluded from ChatGPT model-selector candidates.

v0.1.44 hardens part of the ChatGPT UI automation path with exact selectors from the live ChatGPT composer DOM. ChatGPT prompt injection now prefers `form[data-type='unified-composer']` and `#prompt-textarea.ProseMirror`, and auto-submit now prioritizes `#composer-submit-button` / `button[data-testid='send-button']` before falling back to older heuristics.

v0.1.43 adds the MIT License file and documents the project license in the README.

v0.1.42 replaces the deep summary prompt with the concise Korean forensic audit report prompt. The deep mode now uses a timestamp-strict, evidence-first report structure with key points, background, detailed analysis, conclusion bullets, and optional enumerated item lists.

v0.1.41 uses Gemini's exact Temporary Chat button selectors from the live DOM, including `button[data-test-id='temp-chat-button']`, before falling back to heuristic button detection.

v0.1.40 fixes a Gemini content script regression from v0.1.39 by adding the missing nearby composer text helper used during Temporary Chat confirmation.

v0.1.39 tightens Gemini Temporary Chat safety. If Gemini Temporary Chat is not confirmed, prompt injection is now withheld entirely instead of leaving the prompt in a normal Gemini composer. The Temporary Chat click path also tries inner switch/button controls before falling back to container coordinates.

v0.1.38 adds Gemini model selection. Options now has a separate `Gemini 모델 선택` dropdown with `선택 없음`, `빠른 모델`, `사고 모델`, and `Pro`. The Gemini content script applies that setting only on the Gemini path, after Temporary Chat confirmation and before prompt injection. ChatGPT model selection remains ChatGPT-only.

v0.1.37 improves Gemini live UI handling. It recognizes the Korean Gemini Temporary Chat privacy copy shown after the Temporary Chat button is clicked and biases Gemini auto-submit toward the right-side send button instead of nearby tools/model controls.

v0.1.36 adds a Gemini MVP path. YouTube watch pages now show `Summarize with GPT` and `Summarize with Gemini` side by side. Gemini uses the same transcript/prompt builder and clipboard fallback, opens `gemini.google.com`, attempts to enter Gemini Temporary Chat before injection, and follows the existing `autoSubmit` setting when Temporary Chat is confirmed. ChatGPT model selection remains ChatGPT-only.

v0.1.35 reduces the active-queue start delay from 3.5 seconds to 2 seconds. Idle queues still start immediately from v0.1.34.

v0.1.34 starts ChatGPT queue processing immediately when no active ChatGPT job is running. The queue delay is kept only when another ChatGPT job is already active, so a ready single-video click opens ChatGPT without the old fixed 3.5 second wait.

v0.1.33 replaces `PRIVACY.md` with a clean publication-oriented privacy policy and disclaimer covering processed data, local/session storage, ChatGPT/OpenAI sharing, Temporary Chat limits, auto-submit behavior, clipboard fallback, permission justifications, commercial-use boundaries, and store publication consistency notes.

v0.1.32 moves the Options page `Save Settings` action above the contact and disclaimer area so the settings workflow ends before static product/legal text.

v0.1.31 adds a collapsed `면책 조항` disclosure below the Options page contact line. It clarifies independent affiliation, AI-output accuracy limits, professional-advice limits, third-party content rights, commercial-workflow boundaries, third-party service dependency, and no developer-operated server data collection.

v0.1.30 cleans transcript rows where YouTube's DOM exposes a Korean spoken timestamp prefix such as `15초`, `1분 1초`, or `22분` immediately after the extension's own `[MM:SS]` timestamp. The cleanup only removes prefixes that exactly match the row's timestamp.

v0.1.29 fixes a YouTube transcript DOM parsing duplication where one segment could become `text 0:00text` because YouTube exposed both readable text and timestamped accessibility text in the same row.

v0.1.28 turns the YouTube `Summarize with GPT` button light green when the current video's transcript has been successfully prefetched and cached.

v0.1.27 adds a ChatGPT job queue. YouTube clicks enqueue prepared prompts first, then the background worker opens and processes ChatGPT jobs one at a time after a short idle delay, so multiple YouTube tabs can be queued without immediately opening competing ChatGPT tabs.

v0.1.26 makes aggressive prefetch wait longer for YouTube's description and Show transcript controls before giving up, fixing early watch-page attempts where the click-time fallback succeeds but prefetch misses the button.

v0.1.25 adds an optional aggressive transcript prefetch setting. When enabled, the YouTube watch page can open/use the native transcript panel fallback before the user clicks `Summarize`, so the click can use the current-tab transcript cache and move to ChatGPT faster.

v0.1.24 narrows ChatGPT model-selector and send-button automation to the composer area so sidebar/project controls are not clicked during prompt injection or auto-submit.

v0.1.23 removes the developer prompt source disclosure UI from Options so built-in prompt source text is no longer exposed in the settings page.

v0.1.22 replaces the built-in default prompt with the Forensic Video Auditor Korean audit-report prompt and refreshes shared constants text encoding.

v0.1.21 updates the Options copy for `GPT 모델 선택`, clarifying that `선택 없음` is the default and should be used if model selection causes errors.

v0.1.20 improves ChatGPT model menu activation. When the `Thinking` row is found, the script now resolves the larger clickable menu row, clicks the row center target, and waits longer for the selected model label to update.

v0.1.19 adds storage availability guards. If an old content script survives an extension reload and `chrome.storage.local` is temporarily unavailable, the YouTube button flow falls back to default settings instead of failing completely.

v0.1.18 refines ChatGPT model matching for the current UI. Thinking intensity labels such as `라이트 모드`, `표준`, `확장`, and `헤비 모드` are used only to detect the selected model/control, not as clickable model targets.

v0.1.17 strengthens ChatGPT model selector interaction. It treats the currently selected model label as the model selector, dispatches pointer/mouse events more like a real click, and adds a keyboard fallback for Instant, Thinking, and Pro.

v0.1.16 strengthens the optional ChatGPT model selector again. Failure diagnostics are now logged as plain strings instead of collapsed console objects, and a coordinate fallback can click the visible Instant/Thinking/Pro menu row when text-based menu detection fails.

v0.1.15 strengthens ChatGPT model menu selection. It adds clearer diagnostics and a text-node fallback so visible menu items such as `Thinking` can be clicked even when ChatGPT does not expose stable menu roles.

v0.1.14 adds diagnostics for the optional ChatGPT model selector so live retest logs show whether the selected model setting reached YouTube and which ChatGPT selector/menu candidates were found.

v0.1.13 adds an optional ChatGPT model selector setting. The default is `선택 없음`, which leaves ChatGPT's current default model unchanged. Users can optionally request Instant, Thinking, or Pro before the prompt is inserted.

v0.1.12 adds a faster transcript-panel fallback route. After YouTube's native transcript panel opens, the extension first tries to read full transcript entries from YouTube's transcript component data before falling back to visible DOM scrolling.

v0.1.11 improves DOM fallback collection speed by reducing broad DOM scans, choosing a larger transcript scroll container, and disabling smooth scroll while collecting transcript rows.

v0.1.10 repairs transcript DOM parsing quality when YouTube exposes duplicated readable text values. It prevents all timestamps from collapsing to `[00:00]`, removes duplicated transcript text, and filters timestamp-only rows.

v0.1.9 adds a read-only Options menu for viewing the developer's built-in prompt sources. Basic and deep prompt sources can be expanded independently; deep is blank for now because its prompt is intentionally `null`.

v0.1.8 adds an output language dropdown. The UI language remains fixed as-is, while normal ChatGPT prompts include `Respond in {language}.`; the empty-transcript STOP prompt remains unchanged.

v0.1.7 replaces the default prompt preview with three prompt mode choices: basic summary, deep summary, and custom prompt. Basic summary remains the default.

v0.1.6 adds an advanced settings area. Temporary Chat remains enabled by default, and users can turn it off to send prompts to regular ChatGPT chat instead. Auto-submit is now grouped under advanced settings.

v0.1.5 is a narrow YouTube transcript DOM fallback repair based on v0.1.4 live retest logs. It keeps the same MVP scope and permissions, preserves the working ChatGPT Temporary Chat injection/auto-submit flow, and improves parsing when YouTube's native transcript panel opens after fast prefetch fails.

YouTube GPT Summary는 사용자의 브라우저에서 접근 가능한 YouTube transcript/caption을 추출해 ChatGPT 또는 Gemini 웹 UI에 prompt를 전달하는 Chrome Extension Manifest V3 도구입니다.

이 프로젝트는 Claude, 직접 GPT/Gemini API, API key, 자체 서버를 사용하지 않습니다. YouTube가 접근 가능한 transcript/caption을 제공하는 경우에만 사용자의 브라우저에서 가져와 prompt를 만들고, 선택한 웹앱 입력창에 넣는 방식입니다.

## v0.1 핵심 동작

1. YouTube watch 페이지에서 `Summarize with GPT` 또는 `Summarize with Gemini` 버튼을 누릅니다.
2. 확장프로그램이 현재 영상의 제목, URL, videoId를 읽습니다.
3. YouTube caption metadata와 Innertube player caption path를 먼저 사용하고, 가능한 경우 영상 페이지 로드 직후 transcript를 미리 cache합니다. 실패하면 Innertube transcript metadata와 YouTube native transcript panel DOM fallback으로 transcript를 추출합니다.
4. transcript는 timestamp 형식으로 유지합니다.
5. custom prompt가 있으면 custom prompt를 사용합니다.
6. custom prompt가 없으면 내장 기본 요약 프롬프트를 사용합니다.
7. transcript/caption이 없거나 모든 추출 경로가 실패하면 AI 탭을 열지 않고 버튼에 `Transcript unavailable`을 잠시 표시합니다.
8. transcript가 있을 때만 final prompt를 클립보드에 복사하려고 시도합니다.
9. GPT 버튼은 ChatGPT 임시채팅 URL을 새 탭으로 열고, Gemini 버튼은 Gemini 웹앱을 새 탭으로 열어 임시채팅 진입을 시도합니다.
10. 선택한 웹앱 입력창을 찾아 prompt를 자동 주입합니다.
11. `autoSubmit`이 켜져 있고 임시채팅이 확인되면 자동 제출을 시도합니다.
12. 임시채팅 여부가 불확실하면 자동 제출하지 않고 입력창에 prompt만 남깁니다.

## 중요한 정책

### transcript가 있는 경우

전체 transcript를 그대로 보냅니다.

하지 않는 것:

- transcript 자르기
- transcript chunking
- 긴 영상 사전 요약
- token 계산
- 부분 요약

### transcript가 없는 경우

기본 프롬프트와 custom prompt를 모두 무시하고 AI 탭을 열지 않습니다. 버튼에는 `Transcript unavailable`을 잠시 표시합니다.

내부 prompt builder에는 안전 fallback으로 STOP prompt가 남아 있지만, YouTube 버튼 흐름에서는 transcript가 없을 때 이 prompt를 ChatGPT/Gemini로 보내지 않습니다.

```text
접근 가능한 스크립트/자막 없음
```

이 경우 title, URL, custom prompt, default prompt는 AI 서비스로 전송하지 않습니다.

### transcript 언어 우선순위

v0.1에서는 언어 선택 UI를 넣지 않습니다.

우선순위:

1. 한국어 `ko`
2. 영어 `en`
3. 첫 번째 caption track

참고: v0.1.1에서는 caption track 추출이 실패할 때 현재 YouTube 페이지의 transcript endpoint metadata와 native transcript panel DOM도 fallback으로 시도합니다. 이 fallback은 transcript를 임의로 자르거나 요약하지 않기 위한 보강이며, transcript가 실제로 없거나 모든 추출 경로가 실패하면 기존처럼 STOP prompt만 사용합니다.

v0.1.2에서는 YouTube 설명란 안의 `스크립트 표시` 버튼이 접힌 설명란 뒤에 숨어 있는 경우를 보강했습니다. DOM fallback 단계에서 먼저 설명란의 `더보기` / `Show more` 버튼을 좁은 description 영역 안에서 클릭한 뒤, `스크립트 표시` 버튼을 찾아 transcript panel을 여는 순서로 시도합니다.


v0.1.3에서는 한국어 ChatGPT 임시채팅 안내 문구를 더 넓게 인식하도록 수정했고, 임시채팅이 확인된 경우 자동 전송이 성공하도록 Send 버튼 탐지를 보강했습니다.

v0.1.4에서는 MVP 속도 패치를 추가했습니다. YouTube watch 페이지가 준비되거나 SPA로 영상이 바뀌면 확장프로그램이 조용한 fast path로 transcript prefetch를 시작하고, 성공한 결과를 현재 YouTube 탭의 메모리 cache에 짧게 보관합니다. 사용자가 버튼을 누르면 이 cache를 먼저 사용하므로, 가능한 경우 ChatGPT 탭이 더 빨리 열립니다. prefetch 단계는 YouTube 설명란 `더보기`, `스크립트 표시`, transcript panel 스크롤 같은 화면 변경 fallback을 실행하지 않습니다. 그 느린 DOM fallback은 사용자가 버튼을 눌렀고 fast path/cache가 모두 실패했을 때만 마지막 수단으로 실행됩니다.

## 로컬 설치 및 테스트

### 1. Chrome 확장프로그램 페이지 열기

Chrome 주소창에 입력합니다.

```text
chrome://extensions
```

### 2. Developer mode 켜기

오른쪽 위의 `Developer mode`를 켭니다.

### 3. Load unpacked 클릭

`Load unpacked`를 누르고 이 폴더를 선택합니다.

중요: `manifest.json`이 들어 있는 최상위 폴더를 선택해야 합니다.

```text
youtube_summary_GPT/
```

`src/` 폴더만 선택하면 안 됩니다.

### 4. 설정 페이지 확인

확장프로그램 카드에서 `Details` 또는 `Options`를 열어 설정을 확인합니다.

확인할 것:

- custom prompt textarea가 비어 있으면 내부적으로 `null`로 저장됩니다.
- `autoSubmit` 기본값은 켜짐입니다.
- custom prompt를 입력하면 그 prompt가 사용됩니다.
- custom prompt를 비워 저장하면 내장 기본 prompt로 돌아갑니다.

### 5. ChatGPT 로그인 확인

Chrome에서 ChatGPT에 로그인되어 있어야 합니다.

```text
https://chatgpt.com/
```

로그아웃 상태이면 prompt 자동 주입이 실패하거나 로그인 화면에 머물 수 있습니다.

### 6. YouTube 영상에서 테스트

자막이 있는 YouTube 영상 페이지로 이동합니다.

```text
https://www.youtube.com/watch?v=...
```

`Summarize with GPT` 버튼을 누릅니다.

확인할 것:

- ChatGPT 탭이 열리는지
- prompt가 클립보드에 복사되는지
- ChatGPT 입력창에 prompt가 들어가는지
- 임시채팅이 확인되면 자동 제출되는지
- 임시채팅이 확인되지 않으면 입력만 되고 자동 제출은 보류되는지

## 코드 수정 후 다시 테스트하는 법

코드를 수정한 뒤에는 Chrome에서 다음을 수행합니다.

1. `chrome://extensions`로 이동
2. 이 확장프로그램 카드의 `Reload` 클릭
3. 열려 있던 YouTube 페이지 새로고침
4. 열려 있던 ChatGPT 페이지 새로고침 또는 새 탭으로 다시 열기
5. 다시 테스트

content script는 이미 열린 페이지에 이전 코드가 남아 있을 수 있으므로 페이지 새로고침이 중요합니다.

## 파일 구조

```text
youtube-gpt-summary-extension/
  manifest.json
  src/
    background/
      service_worker.js
    shared/
      constants.js
      logger.js
      promptBuilder.js
      storage.js
      transcriptFormat.js
    content/
      youtube.js
      chatgpt.js
      gemini.js
    options/
      options.html
      options.css
      options.js
  assets/
    icon16.png
    icon48.png
    icon128.png
  docs/
    ui-dom-captures/
  verification/
    README.md
    runtime.test.cjs
    options.test.cjs
    known-issues.test.cjs
    helpers/
      runtime.cjs
  dist/
  CLAUDE.md
  README.md
  PRIVACY.md
```

## 개발 메모

### `globalThis.YGS`

shared 파일은 `window.YGS` 대신 `globalThis.YGS`를 사용합니다. content script, options page, Manifest V3 service worker에서 같은 스타일로 로드하기 위해서입니다.

별도 빌드나 production dependency 없이 `manifest.json`의 순서대로 스크립트를 로드함. `constants.js`는 공통 설정과 프롬프트, `promptBuilder.js`는 최종 프롬프트 생성, `storage.js`는 설정과 대기 프롬프트 저장을 담당함. 각 서비스의 DOM 선택·클릭·임시채팅 판정은 해당 content script에 유지함.

설정 읽기와 저장은 같은 정규화 함수를 사용함. Options의 목록 렌더링과 설정 반영도 공통 함수를 사용하되 HTML, CSS, 저장 키와 기본값은 유지함. 구조·동작 검증은 [verification/README.md](verification/README.md)에 정리함.

### requestId 기반 pending prompt

단일 pending prompt가 아니라 requestId별 pending prompt를 사용합니다.

흐름:

```text
YouTube 클릭
→ requestId 생성
→ ChatGPT는 background 큐에 등록 / Gemini는 바로 열기 요청
→ chrome.storage.session에 requestId별 prompt 저장
→ 대상 서비스 URL hash에 requestId 추가
→ 해당 content script가 자기 requestId만 요청
→ 주입 성공으로 판단한 후 해당 requestId 삭제
→ ChatGPT는 큐 완료를 background에 통지
```

### Temporary Chat 안전장치

URL에 `temporary-chat=true`를 붙여 ChatGPT를 열지만, URL 파라미터만으로 임시채팅이 공식 보장된다고 보지 않습니다.

현재 ChatGPT 자동 제출 조건은 다음과 같음.

```text
autoSubmit === true
그리고
useTemporaryChat === false 또는 런타임 임시채팅 판정이 성공함
```

임시채팅을 요청했으나 판정이 실패하면 prompt를 입력창에 남기고 자동 제출을 보류함. Gemini는 임시채팅 판정이 성공해야 주입을 시작하며, 요청한 모델·사고 수준 선택이 확인되지 않으면 자동 제출을 보류함.

주의: 현재 ChatGPT 판정은 URL 파라미터만으로도 성공하며 Gemini에는 일반 문구를 받아들이는 경로가 있음. 실제 임시채팅 활성화를 보장하는 검증이 아니며, 이 한계는 1차 리팩터링에서 수정하지 않음. [구조 점검 보고서 F2](verification/structure-audit-2026-09-10.md)에 재현 근거를 기록함.

## 알려진 한계

- YouTube transcript metadata 구조가 바뀌면 fast prefetch가 실패할 수 있으며, 이 경우 버튼 클릭 후 느린 DOM fallback으로 넘어갈 수 있습니다.
- ChatGPT UI selector가 바뀌면 자동 주입 또는 자동 제출이 실패할 수 있습니다.
- 매우 긴 transcript는 Chrome session storage, clipboard, ChatGPT 입력창에서 실패할 수 있습니다.
- v0.1은 Shorts 지원을 보장하지 않습니다.
- 요약 응답 언어는 Options에서 선택 가능함. 원본 자막 언어는 별도 선택 UI 없이 한국어·영어 우선순위로 선택함.
- v0.1은 fallback toast, alert, status UI를 만들지 않습니다.

## 디버깅

사용자에게 별도 실패 UI를 보여주지 않는 대신 DevTools Console에 `[YGS]` 로그를 남깁니다.

v0.1.107부터 `[YGS]` 로그의 객체는 JSON 글자로 찍혀서, DevTools를 펼치지 않아도 Claude in Chrome 같은 자동화 도구가 그대로 읽을 수 있습니다. ChatGPT 자동 전송은 성공·실패 때 단계 기록 한 줄(`ChatGPT submission ...`)을 남깁니다.

확인 위치:

- YouTube 페이지 DevTools Console
- ChatGPT 페이지 DevTools Console
- `chrome://extensions`에서 service worker inspect console

문제가 생기면 다음 정보를 확인하면 좋습니다.

- 버튼이 표시되는지
- transcript extraction 로그가 있는지
- ChatGPT 탭 URL에 `#ygsRequestId=...`가 있는지
- ChatGPT 입력창을 찾았는지
- Temporary Chat not confirmed 로그가 있는지
- send button not found 또는 auto-submit failed 로그가 있는지

## License

MIT License. See [LICENSE](../LICENSE).

This license covers the extension source code only. It does not grant rights to YouTube videos, transcripts, captions, thumbnails, channel content, ChatGPT/Gemini outputs, brands, trademarks, or other third-party content or services.
