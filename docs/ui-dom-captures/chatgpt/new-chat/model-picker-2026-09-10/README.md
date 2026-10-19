# ChatGPT Model Picker And Effort Display: 2026-09-10

- Service: ChatGPT in the user's signed-in Chrome.
- Surface: normal new-chat / Temporary Chat, not GPTs.
- Date/time: 2026-09-10, approximately 02:38-02:46 KST.
- Capture type: exact live outerHTML; comparison table below is a summary, not synthetic DOM.
- Status: session-specific observations. Reconfirm live UI before reuse.
- Scope: all three visible model choices and all five effort positions; no prompt submission.
- Initial and final state: Latest (최신) selected, High, empty composer, Temporary Chat active.
- Canonical shared evidence for codex-gpt-collaboration and youtube_summary_GPT. No duplicate outerHTML in the consumer project.
- No profile/sidebar content, chat identifiers, prompts, transcripts, cookies, tokens, or storage reads included.

## Display Matrix

The table normalizes line breaks between the version prefix and effort label into a space. Exact DOM is preserved in the linked captures.

| Slider value | Latest (최신) | GPT-5.6 Sol | GPT-5.5 |
| --- | --- | --- | --- |
| 0 | Instant | 5.6 Instant | 5.5 Instant |
| 1 | 중간 | 5.6 중간 | 5.5 중간 |
| 2 | High | 5.6 High | 5.5 High |
| 3 | 매우 높음 | 5.6 매우 높음 | 5.5 매우 높음 |
| 4 | 6 Pro | 5.6 Pro | 5.5 Pro |

Each model used slider values 0..4 and the same five announced efforts in this session. The highest value announced only Pro; the latest-model composer included the extra visible 6 prefix. Do not infer a backend model identifier from that display alone.

- With Latest selected, values 0..3 displayed effort only.
- With an explicitly selected older model, all five values displayed version plus effort.
- Pro at Latest is a verified exception to the claim that Latest always hides the model version.
- The actual model-selection rows were `최신`, `GPT-5.6 Sol`, and `GPT-5.5`. The English label for Latest was not exercised.
- Opening the visible `모델 선택` row switches from the performance slider to the model-radio view.
- Each model's selected radio was verified with `aria-checked="true"` in the open model view.
- Switching model while at High or Pro retained the effort in the tested transitions.
- The `기본으로 재설정` control was observed in explicit older-model mode. A successful activation at `5.6 중간` produced `중간` with Latest selected: the model reset, while effort remained at value 1. Other reset positions were not separately tested.

## Test Method And Activation Evidence

- Used the exact owned empty test tab. No message typing, send action, extension settings edit, or runtime change.
- GPT-5.6 Sol and GPT-5.5 sweeps each followed 2 -> 1 -> 0 -> 1 -> 2 -> 3 -> 4.
- Latest sweep followed 4 -> 3 -> 2 -> 1 -> 0 -> 1 -> 2.
- At each observation: read menu label, accessibility announcement and slider value; close menu; read the actual composer pill; capture both exact HTML states; reopen the pill.
- Total: 15 distinct model/effort combinations, 21 readback observations including revisits.
- Two locator-click attempts on GPT-5.5 (from 5.6 Pro and 5.6 High) left the selected model unchanged. Enter on the settled GPT-5.5 row successfully selected it.
- The reset control's initial locator click and Enter attempts also left the UI unchanged. A fresh DOM-node click then reset the model successfully.
- These misses do not prove a model is unavailable or a product defect. Timing, animation, focus, or interaction-path differences were not isolated.
- Browser actions are not proof that synthetic extension events will produce the same result. Every future runtime selection needs a post-action readback.
- A page-level React recoverable error was present in developer logs. It was not isolated as the cause of selection misses; no full stack or unrelated diagnostics are stored here.

## Keyboard Opening Follow-up: 2026-09-10

- Capture type: observed UI behavior, not outerHTML or a synthetic DOM sketch. Surface: the same normal/Temporary Chat model-picker family, not GPTs.
- On a later test tab showing Latest / 매우 높음, browser keyboard input Ctrl+Shift+M opened the performance/model menu. Escape closed it. No model/effort changes or prompt submission occurred during this check.
- This updates the historical shortcut observation in [2026-05-23 Temporary Chat evidence](../chatgpt-temporary-chat-dom-2026-05-23.md). Browser key input does not establish that page handlers accept extension-generated KeyboardEvents.
- Consumer follow-up: youtube_summary_GPT added a pointer-first, single Ctrl+Shift+M fallback per unconfirmed menu-opening operation. It still requires a verified picker button, matching owned menu and final model/effort readback. Local regressions pass; synthetic-event live verification awaits extension Reload. [Consumer checkpoint](C:/Users/USER/Documents/Claude/youtube_summary_GPT/verification/chatgpt-settings-split-2026-09-10.md).
- The 42 exact outerHTML fragments below are unchanged.

## Exact HTML Files

Consumer follow-up, 2026-09-10 04:00 KST: youtube_summary_GPT used these anchors in its content script and verified one actual YouTube summary request. Synthetic extension events changed High to Extra High; the closed pill displayed 매우 높음 and prompt submission succeeded without manual selection. This is one new-chat runtime path, not runtime coverage of all 15 combinations, GPTs, or legacy Pro variants. Consumer report: `C:/Users/USER/Documents/Claude/youtube_summary_GPT/verification/chatgpt-slider-live-patch-2026-09-10.md`. Exact fragments below remain unchanged.

42 exact fragments are grouped by meaning:

- [Latest: 5 menu states and 5 closed pills](latest.md)
- [GPT-5.6 Sol: 5 menu states and 5 closed pills](gpt-5.6-sol.md)
- [GPT-5.5: 5 menu states and 5 closed pills](gpt-5.5.md)
- [Model radios, reset, unsuccessful attempts, and restoration: 12 fragments](navigation.md)

Open-menu HTML includes inactive/inert panel markup. The currently active panel and selected state matter; not every row present in outerHTML is a visible action target. IDs, hashed CSS classes, sprite filenames, and geometry are incidental evidence.

## Limits And Consumer Implications

- This is UI selection/display verification, not an actual inference-backend or response-quality test.
- English locale, GPTs, account/plan variants, persistence across reloads, and Gemini were not tested.
- Older Pro Basic/Pro Extended settings cannot be equated with these visible Pro positions from this evidence alone.
- Model family and effort are distinct UI dimensions. Matching a whole composer label as if it were effort alone loses the explicit-version state.
- The extension currently exposes reasoning selection; this capture does not authorize adding a new model setting or changing defaults.
- The prior [latest-model slider capture](../chatgpt-reasoning-slider-2026-09-10.md) remains historical evidence from the earlier reproduction.
