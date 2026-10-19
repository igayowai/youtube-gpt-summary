# Live Revalidation: 2026-09-19

Scope: user requested testing of remaining coverage. Existing signed-in Chrome, disposable new-chat tabs, existing local regression suite. No runtime patch, extension reload, extension settings edit, auth-state access, version bump or ZIP.

## Results

| Area | Result | Evidence / limit |
| --- | --- | --- |
| Local suite | 36 pass, 10 existing failing TODO assertions, 0 unexpected failures | `node --test --test-reporter=spec verification/*.test.cjs`; 46 total, exit 0. TODO failures are real known defects, not passes. |
| GPT browser shortcut | Pass | Ctrl+Shift+M opened the performance/model menu. This is browser input, not extension synthetic KeyboardEvent proof. |
| GPT model/effort UI | 15/15 observed states | Latest, GPT-5.6 Sol, GPT-5.5 each traversed values 0..4. Checked model and announced effort read after each step. No messages sent. |
| GPT-5.5 runtime label recognition | FAIL in local reproduction with observed live text | Actual `readChatGptModelFamily` returns `gpt-5.5` for `GPT-5.5`, but empty string for `GPT-5.510월 14일 지원 종료`. Full-row equality also affects requested-row lookup. |
| Gemini Temporary Chat browser interaction | Pass, one on/off cycle | Icon changed `gemini_chat_temp` -> `close` -> `gemini_chat_temp`; temporary-page text appeared. Not synthetic-extension stress coverage. |
| Gemini browser model/extended interaction | Pass | Flash-Lite -> Pro -> Pro Extended -> Pro -> Flash-Lite; each selector label checked. This is UI control, not extension selection. |
| Gemini label matching | Mismatch reproduced locally | `isGeminiModelLabelMatch` returned false for current 3.5 Flash-Lite, 3.8 Flash and Korean extended label against their existing matchers; Pro returned true. Other fallback branches mean this alone is not full end-to-end failure proof. |
| YouTube transcript prefetch | Failed on the prior public test video | No parsed entries; visible transcript tab remained at loading. End-to-end provider requests not sent. |
| Actual installed Options | Not tested | Previously explicit Browser-policy block respected; no alternate transport attempted. Current unit Options tests pass with dummy storage, not actual persistence proof. |
| Synthetic shortcut / repeat stability / restart | Not established | No forced event interception, pending-request injection, repeated submissions or user-browser restart. |

## New UI Compatibility Findings

1. GPT-5.5 now includes a separate retirement notice in the same radio row. `src/content/chatgpt.js:366` normalizes entire row text; line 439 also matches entire row text. The UI remains selectable, but existing extension recognition fails on that text. Reproduction used the existing VM harness and actual private helper, without modifying source or tests.
2. Gemini model menu now displays 3.5 Flash-Lite, 3.8 Flash, 3.1 Pro. Existing constants still list 3.1 Flash-Lite and 3.5 Flash. Extended is a direct toggle row labeled `확장된 사고 모델`, with no `value="thinking_level"`; clicking it produced Pro Extended rather than opening a Standard/Extended submenu. Existing `findGeminiThinkingLevelRow` expects the old row, and `selectGeminiThinkingLevel` expects a submenu. Full extension activation remains untested because the source transcript was unavailable.
3. YouTube test URL: `https://www.youtube.com/watch?v=ITFtxbK-n-A`. Prefetch logged empty json3, a missing-caption-track response, Innertube transcript HTTP 400, then DOM polling timeout. The visible information panel had Timeline/Chapters/Transcript tabs with Transcript selected and a loading indicator. This does not distinguish site/network delay from changed extractor compatibility; it does not prove a service-wide refusal or that all videos fail. No blind retry or duplicate summary request.

## State And Evidence

- GPT initial Latest/Pro restored after the 15-state sweep; final closed pill `6 Pro` verified.
- Gemini initial Flash-Lite, non-extended, non-temporary state restored. Menu dismissed. No prompts submitted to either provider in this run.
- Existing unrelated user tabs were not claimed or modified. Test-created tabs are disposable.
- GPT exact radio fragment: [shared capture](C:/Users/USER/Documents/Claude/youtube_summary_GPT/docs/ui-dom-captures/chatgpt/new-chat/model-picker-2026-09-19.md).
- Gemini and YouTube reduced UI observations: [local captures](../docs/ui-dom-captures/live-ui-2026-09-19.md). No account/sidebar content, tokens, request identifiers or transcripts saved.

Next: propose a narrowly scoped GPT-5.5 primary-label and Gemini current-menu compatibility patch, plus separate YouTube transcript diagnosis. Tests alone do not authorize those code changes. The 2026-09-10 successful summary remains historical, not a successful summary in this run.
