# ChatGPT Live Test: 2026-09-10

- Result: FAIL for requested reasoning selection; partial success for the summary flow.
- Scope: user-authorized real test in signed-in Chrome, GPT only; Gemini deferred.
- Runtime: project-root unpacked extension, version 0.1.101 after phase-1 refactoring.
- Window: approximately 02:25-02:34 KST.
- Method: Chrome browser-client DOM actions and developer console log retrieval, not an isolated browser profile.
- No runtime patch, version bump, ZIP, extension setting edit, or Gemini action in this test.

## Reproduction

1. Clicked the real YouTube `Summarize with GPT` button on a public video with transcript ready.
2. First attempt failed before GPT UI automation: `chrome.storage.local is unavailable`, then `Cannot read properties of undefined (reading 'sendMessage')` in `youtube.js:318`. Its fallback GPT tab logged `No pending prompt found`; no prompt was submitted.
3. This is consistent with a stale extension context in an already-open page, but the exact prior invalidation event was not independently observed.
4. Reloaded that YouTube tab. Transcript DOM fallback succeeded; clicked GPT again.
5. The refreshed run used the prefetched transcript, queued the prompt, and opened a new Temporary Chat.
6. ChatGPT logged request `Extra High`, found selector `high`, failed to find the option, then injected and submitted anyway.
7. The live composer still showed `High`. A summary heading/body became visible, the stop button disappeared, and the composer was empty. Summary transport worked; requested reasoning did not.

Counts: two extension-button attempts, one actual prompt submission. No additional prompts during menu testing.

## Console Evidence

The following are the refreshed ChatGPT run's actual messages. Sidebar/profile candidate details were omitted from the warning; request identifiers and extension identifiers are not retained.

```text
[YGS] ChatGPT reasoning selection requested Extra High
[YGS] ChatGPT reasoning selector found: high
[YGS] ChatGPT reasoning option not found; continuing with current setting: Extra High
[YGS] Prompt injected into ChatGPT composer
[YGS] Temporary Chat confirmed temporary-chat url parameter
[YGS] Prompt submitted
```

The log collector timestamps on claim may represent attachment/buffer delivery rather than original emission. Do not calculate per-step latency from those buffered timestamps.

The earlier YouTube Innertube HTTP 400 messages are separate: extraction succeeded through the visible transcript panel. They were not the refreshed run's GPT selector failure.

## Current UI And Full Sweep

The existing empty fallback tab was reused for menu inspection; the submitted conversation was not edited. Active Temporary Chat was corroborated by the `임시 채팅 끄기` button and checked icon, independently of the URL parameter.

The composer pill opens `composer-intelligence-picker-content`. The simple view exposes a performance menu item with advertised ArrowLeft/ArrowRight shortcuts, rather than one clickable radio row per reasoning level. The nested numeric slider is aria-hidden; the enclosing menu item is the keyboard target.

| Slider value | Announced effort | Observation |
| --- | --- | --- |
| 0 | Instant | First of five |
| 1 | 중간 | Second of five |
| 2 | High | Initial and restored |
| 3 | 매우 높음 | Fourth of five |
| 4 | Pro | Composer displayed `6 Pro` |

Actual one-step sequence: 2 -> 1 -> 0 -> 1 -> 2 -> 3 -> 4 -> 3 -> 2. Each transition was read back from the live menu and exact outerHTML. Final High and empty draft verified.

The advanced `모델 선택` view showed `최신` selected, plus `GPT-5.6 Sol` and `GPT-5.5`. No model radio was changed. This sweep is specific to that selected model family and current mixed Korean/English UI.

Exact outerHTML is stored once in the [central new-chat capture](C:/Users/USER/Documents/Claude/youtube_summary_GPT/docs/ui-dom-captures/chatgpt/new-chat/chatgpt-reasoning-slider-2026-09-10.md). This report intentionally contains no duplicate markup or full transcript.

## Diagnosis And Limits

- Confirmed incompatibility: the current UI represents reasoning with a slider. The existing option-search code expects matching menu rows/text (`src/content/chatgpt.js:662`). Replacing English/Korean labels alone is insufficient.
- Confirmed unsafe fallback in functional terms: `main` ignores the false result from selection (`chatgpt.js:78`); the not-found branch returns false at line 401, but auto-submit proceeds with the current setting.
- Existing menu click code emits a synthetic click plus native click (`chatgpt.js:1035`). This may contribute to a menu opening and closing, but this run did not isolate that event sequence. Do not claim the double click is the sole proven cause.
- Diagnostics scan the full document and can capture unrelated sidebar/profile text (`chatgpt.js:1107`). These details were excluded from saved evidence.
- The direct browser keyboard test is not proof that extension-generated KeyboardEvents work identically. A runtime patch requires a separate live test.
- Pro was observed as one slider step. Legacy `pro-basic` and `pro-extended` equivalence was not established.
- GPTs, alternative model families, English locale, multiple-video queues, restart recovery, and Gemini were not tested.
- One refreshed run is a reproduction, not a reliability benchmark.

## Next Patch Scope, Not Yet Applied

Adapt new-chat reasoning selection to the observed slider, verify the resulting selected state, and stop automatic submission if the requested level is unconfirmed. Recheck the menu-opening event sequence and restrict diagnostics to the composer/open menu. Preserve historical surface routing and do not silently map both legacy Pro variants to Pro without a defined migration decision.

No runtime tests were rerun because this turn changed only diagnostic capture/report/index/checkpoint files. The phase-1 automated-test results remain historical, not proof of current third-party UI compatibility.

