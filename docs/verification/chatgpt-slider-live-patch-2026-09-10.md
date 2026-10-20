# GPT Slider Patch And Live Verification

- Date: 2026-09-10 KST, live submission approximately 04:00.
- Scope: existing new-chat reasoning setting. No new model setting, Gemini patch, version bump or ZIP. Version remains 0.1.101.
- Source: `src/content/chatgpt.js`; regressions: `chatgpt-slider.test.cjs`.
- Rollback baseline: `%TEMP%/ygs-chatgpt-pre-slider-20260910-patch1.js`, preserving previously dirty source. Do not revert unrelated changes.

## Implementation

- Validate the owned active slider, 0..4 bounds and label/value agreement. Move the enclosing performance menu item with one arrow-key step at a time.
- Preserve checked model family and verify the final composer label before injection.
- Support Instant, Medium, High and Extra High. Do not silently map legacy Pro Basic/Extended to the new single Pro position.
- Retain the older row-menu path. Failed selection withholds injection/submission. Menu diagnostics exclude unrelated sidebar controls.
- Exact HTML remains canonical in the collab skill's `new-chat/model-picker-2026-09-10/` folder, linked from the project capture index. No duplicate HTML or personal page content saved here.

## Verification

`node --test --test-reporter=tap verification/*.test.cjs`: 31 tests, 21 pass, 10 existing TODO failures, zero unexpected failures. Includes runtime syntax, manifest/version consistency and five new slider tests. VM tests alone do not prove browser event handling.

Actual Chrome run:

- User reloaded the unpacked extension. Reconnected after the old browser connection disappeared; no extension-management policy bypass used.
- Opened public test video `https://www.youtube.com/watch?v=ITFtxbK-n-A`, paused playback, clicked GPT once after Transcript ready.
- Direct transcript attempts failed; existing transcript-panel DOM fallback succeeded and cached transcript was used.
- No manual reasoning selection or page-script injection during the run.
- Sanitized YGS log sequence: requested Extra High; selector high; slider step confirmed; reasoning selected via slider Extra High; prompt injected; Temporary Chat confirmed via URL parameter; prompt submitted.
- Independent UI readback: composer displayed 매우 높음 and report headings appeared. The prior High-to-Extra-High failure was not reproduced.
- Completion readback: final-conclusion heading appeared, Stop response button disappeared, and composer still displayed 매우 높음. Result tab retained for the user. `git diff --check` passed (line-ending notices only).
- Buffered console entries share capture timestamps; they do not establish selection latency.

## Limits

- One real submission path, not all-model extension stress coverage or response-quality audit.
- URL-only Temporary Chat confirmation remains known F2; this patch does not independently establish that privacy guard.
- Legacy Pro variants intentionally fail closed on the new slider. English locale, GPTs, Gemini and other existing TODO defects remain outside this verification.
