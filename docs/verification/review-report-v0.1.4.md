# Review Report: YouTube GPT Summary Extension v0.1.4

Timestamp: 2026-05-03 22:19:48 KST

## Review Summary

The v0.1.4 patch is a narrow MVP speed improvement. It preserves the working v0.1.3 ChatGPT injection and auto-submit behavior and focuses on reducing perceived delay before ChatGPT opens. The patch adds quiet fast-path transcript prefetch on YouTube watch pages, a current-tab memory cache keyed by `videoId`, cache-first handling when the user clicks `Summarize with GPT`, and an additional Innertube player caption extraction path. It keeps the slow YouTube transcript-panel opening and scrolling fallback only behind a user click.

## Scope Control

Passed. The patch does not add:
- a direct OpenAI API call,
- Gemini or Claude fallback,
- a server,
- transcript chunking or truncation,
- multi-video job queues,
- background ChatGPT tab pre-opening,
- broader host permissions,
- `<all_urls>`,
- `tabs` permission,
- visible failure UI.

This matches the user's decision to return to MVP and avoid feature creep.

## Correctness Review

The cache-first click flow is correct for the intended behavior. It uses cached entries only when they are keyed by the current `videoId`, have entries, and remain within the TTL. It waits briefly for an in-flight prefetch so a near-complete prefetch can be reused, but it does not block indefinitely. If no cache is available, it calls the full extractor with DOM fallback enabled, preserving v0.1.3 correctness for videos where fast metadata extraction fails.

The prefetch flow is correctly bounded. It runs only on YouTube watch pages, waits briefly after page readiness, prevents duplicate prefetches for the same `videoId`, and calls the extractor with DOM fallback disabled. This avoids changing YouTube UI before the user clicks.

The fast path is stronger than v0.1.3 because it now includes a direct Innertube player caption response request using the current `videoId`. The parser also avoids accepting stale inline player responses from a prior SPA video when `videoDetails.videoId` is present and mismatched.

## Privacy and Permissions Review

Passed with documentation update. The manifest still requests only `storage` and `clipboardWrite`, with host permissions limited to YouTube and ChatGPT domains. The privacy draft now explains local prefetch/cache behavior and states that transcript is not sent to ChatGPT before the user clicks. The patch uses current-tab memory cache rather than persistent local storage for transcript cache, which is appropriate for MVP and avoids creating a video-history surface.

## Maintainability Review

The patch is cohesive and mostly contained in `src/content/youtube.js`. Naming is explicit: `scheduleTranscriptPrefetch`, `beginTranscriptPrefetch`, `getTranscriptEntriesForClick`, `cacheTranscriptEntries`, and `extractInnertubePlayerCaptionTranscriptEntries` make the flow easy to inspect. The code keeps one extraction function with an `allowDomFallback` option rather than duplicating separate prefetch and click extractors.

The main maintenance risk is that YouTube's internal Innertube and caption metadata shapes can change. The code mitigates this by preserving multiple paths and retaining DOM fallback. Future work should be guided by live `[YGS]` logs rather than speculative selector additions.

## Performance Review

The patch should improve perceived speed when prefetch succeeds. It moves fast extraction earlier and avoids repeated transcript-panel scrolling on button click for videos whose caption metadata can be fetched quietly. It also makes repeated clicks on the same video faster through memory cache.

The patch does not guarantee speed improvement for every video. If the fast paths still fail for a particular video, the user will still see the post-click DOM fallback delay. That is an acceptable MVP tradeoff because removing fallback would hurt correctness, and expanding to queues or pre-opened ChatGPT tabs would overbuild the current product.

## Risks

- Live YouTube may still withhold caption tracks from the fast paths for some videos.
- The direct Innertube player path is internal web behavior and may change.
- Prefetch may run before enough page data is available, though the direct player path can still work from `videoId` and API key.
- ChatGPT UI can change again, but v0.1.4 intentionally avoids modifying the v0.1.3 ChatGPT content script.

## Review Result

Approved for user-side retest. The patch follows the approved MVP speed direction, keeps the extension narrow, and passes static verification. The next evidence needed is the user's browser behavior: whether v0.1.4 uses the prefetch cache and avoids the slow transcript panel path on the tested video.
