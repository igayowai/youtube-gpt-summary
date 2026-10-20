# Approved Work Plan: YouTube GPT Summary Extension v0.1.4 MVP Speed Patch

Plan Type: work-plan  
Workstream: Manifest V3 no-bundler Chrome extension MVP speed patch  
Version: v02  
Status: Completed; v0.1.4 packaged for user-side Chrome Developer Mode retest  
Created: 2026-05-03 22:17:31 KST  
Last Updated: 2026-05-03 22:20:53 KST  
Supersedes or Related Plan: Supersedes `plan/20260503-192745--work-plan--youtube-gpt-summary-extension-v01--v01.md`; related to the user-approved onboarding document, v0.1.1 transcript repair, v0.1.2 YouTube description expansion repair, and v0.1.3 ChatGPT auto-submit repair.  
Current Completion State: v0.1.4 implementation, static verification, review, documentation updates, and packaging are complete; user-side Chrome Developer Mode retest is pending.  
Completed So Far: The extension already inserts the YouTube button, extracts transcript through several paths, handles the Korean YouTube description expansion path, builds the final prompt correctly, opens ChatGPT Temporary Chat, injects the prompt, and auto-submits successfully in the user’s v0.1.3 retest.  
Remaining Work: User should load the v0.1.4 unpacked folder, reload the YouTube page, wait briefly for prefetch, press `Summarize with GPT`, and confirm whether the tested video now uses the fast cache path and still auto-submits in ChatGPT Temporary Chat.  
Current Blockers: Live browser behavior cannot be fully verified in this runtime, especially YouTube’s current fast caption metadata availability for the user’s test video and future ChatGPT UI changes.  
Next Step: Provide the v0.1.4 zip and concise retest instructions, then use the user's live result and `[YGS]` console logs for any next narrow repair.

## Scoreboard

Current Score: 50/100  
Score Source: provisional  
Last Updated: 2026-05-03 22:20:53 KST  
Score Rationale: The user explicitly praised the v0.1.2 transcript repair and confirmed that v0.1.3 fixed the automatic submit issue, which is strong satisfaction evidence. The provisional score remains capped at 50 because the current request is a new speed improvement that has not yet been live-tested by the user. The known weakness is that transcript extraction can still feel slow when the extension falls through to opening YouTube’s native transcript panel and scrolling it after the button is clicked.  
What Improved: The v0.1.4 direction intentionally drops larger queue, multi-tab, and background-worker ambitions and refocuses on a narrow MVP speed patch. The plan keeps the product working while moving expensive work earlier and making the button click cache-first.  
What Remains Unsatisfactory: The runtime cannot prove that YouTube’s fast caption metadata or Innertube player path will succeed for every video. Some videos may still require the slow DOM fallback after the user clicks.  
Actions That Should Raise or Maintain the Score: Deliver a package that preserves v0.1.3 working behavior, opens ChatGPT and auto-submits as before, uses prefetched transcript cache when available, avoids wider permissions, does not introduce background GPT tabs or job queues, and keeps all non-MVP behavior out of scope.  
Score History:
- 2026-05-03 22:17:31 KST: 50/100 provisional. The user approved the MVP speed patch after confirming v0.1.3 auto-submit success; score is capped because v0.1.4 is not yet live-tested.
- 2026-05-03 22:20:53 KST: 50/100 provisional. v0.1.4 has been implemented and statically verified, but the score remains capped pending user-side browser evidence for speed and auto-submit preservation.

## Objective

The objective is to produce a v0.1.4 package that makes the extension feel faster at the moment the user presses `Summarize with GPT` without expanding the product scope. The current v0.1.3 package has achieved the MVP’s core functionality: the YouTube button appears, the tested Korean transcript can be extracted through fallback, the final prompt is injected into ChatGPT Temporary Chat, and automatic submission now works. The user’s new concern is that the transcript extraction path looks and feels slow because the extension opens YouTube’s description area, clicks `스크립트 표시`, scrolls the transcript panel repeatedly, and only then opens ChatGPT. The speed patch should reduce that post-click delay by doing safe transcript preparation earlier, while preserving the same local-browser-only, no-server, no-API-server product architecture.

The patch must be deliberately small. It should not add a database, a remote server, direct OpenAI API calls, Gemini, Claude, a multi-video queue, background ChatGPT tabs, or any feature that changes the user’s core MVP. It should also avoid broadening Chrome permissions. The user specifically asked whether site access must become wider, and the accepted answer was that it does not: the extension already runs on YouTube and ChatGPT, and prefetch is a timing change inside the existing YouTube content script rather than an expansion to all websites. Therefore the solution should keep the manifest narrow and should not add `<all_urls>`, `tabs`, or any unnecessary host permissions.

## User-Approved Direction

The approved direction for v0.1.4 is an MVP speed patch centered on prefetch and cache. When a YouTube watch page is ready, or when YouTube’s SPA navigation changes the current video, the content script should quietly attempt to extract the current video transcript through fast, non-UI paths. If that attempt succeeds, the result should be stored in current-tab memory under the current `videoId`. When the user later clicks the button, the click handler should check that cache before running a new extraction. If the cache has a valid transcript, the extension should immediately build the prompt, copy it to the clipboard, open ChatGPT, inject the prompt, and auto-submit under the existing Temporary Chat safety rule.

The prefetch step should not manipulate the YouTube page UI. It should not click `더보기`, should not click `스크립트 표시`, should not open the transcript panel, and should not scroll the transcript list. Those DOM fallback actions are still useful as a last-resort insurance path, but they should remain behind the user click. This preserves a clean browsing experience and avoids surprising page changes before the user has asked for a summary. The fallback order after a click should be cache first, fast extraction second, visible transcript panel third, and auto-opened/auto-scrolled transcript panel last.

The user also chose to avoid the larger design where ChatGPT tabs are opened in the background and multiple jobs are queued. That design is technically possible, but it is too much for the current stage. The v0.1.4 patch should not add a queue, should not run many jobs concurrently, and should not open GPT tabs before the prompt is ready. The intended MVP behavior remains: prepare the transcript locally if possible, then once the user clicks and the final prompt is ready, open ChatGPT and complete the existing injection/submission flow.

## Scope

The implementation scope is limited to the smallest set of files needed for the speed patch and documentation. The expected code change is primarily in `src/content/youtube.js`, with supporting version constants in `src/shared/constants.js` and `manifest.json`. Documentation should be updated in `README.md` and `PRIVACY.md` so that the user and future maintainers understand that v0.1.4 can locally prefetch transcript text before button click but does not send it to ChatGPT until the user clicks. Verification and review reports should be updated under `verification/`, and this plan plus `session-summary.md` must remain the durable record of current state.

No new bundled build system should be introduced. The extension should remain Manifest V3, no-bundler, plain JavaScript. Content scripts should continue loading shared scripts through the manifest `js` array, not through ES module imports. The namespace remains `globalThis.YGS`, not `window.YGS`, because the project has service worker and content script contexts. The extension should preserve request-id based pending prompt storage and the existing ChatGPT injection and auto-submit logic from v0.1.3.

## Design Constraints

The extension must preserve the existing product rules. It must not truncate transcript text, chunk transcript text, summarize transcript text before ChatGPT, or estimate tokens. If transcript entries are available, the full timestamped transcript should be included in the final prompt. If transcript extraction truly fails or produces an empty transcript, the prompt builder should still use the STOP prompt only, without title, URL, default prompt, or custom prompt. The `customPrompt` setting remains `null` by default, and empty or whitespace-only custom prompt values must normalize to JavaScript `null`.

The speed patch must not create any visible fallback UI. The user does not want toast, alert, banner, or status UI for clipboard, injection, submission, or transcript failure. Console logging is allowed and useful because the user can share DevTools logs when debugging. Button text may temporarily indicate that the extension is preparing transcript or opening ChatGPT, because the existing button already changes state while processing; this should stay minimal and not become a new status panel.

The prefetch cache must be temporary and local. A current-tab memory `Map` is sufficient for MVP. It should be keyed by `videoId`, keep only a small number of recent videos, and expire entries after a short period. It should not become a persistent video history. It should not write transcript cache to `chrome.storage.local`. Avoid using `chrome.storage.session` for transcript cache in the content script unless there is a specific need and compatibility is handled, because the current speed patch does not require cross-context transcript sharing. Pending prompt storage for ChatGPT delivery can remain as it already is.

## Implementation Sequence

First, update version markers to `0.1.4` in the manifest and constants. Add narrow constants for the transcript prefetch click wait, memory cache TTL, and memory cache maximum item count. Keep the manifest permissions unchanged: `storage` and `clipboardWrite` only, with host permissions limited to `https://www.youtube.com/*`, `https://chatgpt.com/*`, and `https://chat.openai.com/*`.

Second, add memory state to the YouTube content script. The content script should keep a `transcriptMemoryCache` map and a `transcriptPrefetchPromises` map. The memory cache records entries, creation time, and source. The in-flight map prevents repeated prefetches for the same video. Cache reads should verify the `videoId`, verify that entries exist, and expire stale values. Cache writes should prune older entries so that only a small number of videos are retained.

Third, schedule quiet prefetch when the watch page is ready. The existing `insertYoutubeButton` function is a suitable place to call a small scheduler because it already runs on initial load and SPA navigation. The scheduler should wait briefly so the YouTube page has time to populate metadata, then start `beginTranscriptPrefetch` for the current `videoId`. The prefetch should call the transcript extractor with `allowDomFallback: false`. This is the key behavior boundary: prefetch can fetch metadata and network caption paths, but it cannot click or scroll page UI.

Fourth, modify the button click flow to use cache-first extraction. The click handler should read the current `videoId`, try the memory cache, then briefly wait for an in-flight prefetch for that same `videoId`, and only then run the full extractor with `allowDomFallback: true`. The wait for an in-flight prefetch should be short enough not to recreate the old delay; around one second is acceptable because a near-finished prefetch can make the click instant while a slow or failed prefetch does not block for long. If the full click extractor succeeds, it should populate the memory cache as well so repeated clicks on the same video are fast.

Fifth, strengthen the non-DOM fast extraction path without adding a large new architecture. The current caption track path should avoid accepting stale player responses from an earlier SPA video, so it should compare the `videoId` in `videoDetails` when available. If inline script data is stale or missing, it should fetch the stable watch URL for the current `videoId` rather than relying only on `location.href`. Add a direct Innertube player caption path that posts to YouTube’s web player endpoint using the page’s Innertube API key and current `videoId`, then reads caption tracks from the player response. This remains a browser-side YouTube web metadata path, not a custom server or GPT API. The existing Innertube transcript endpoint path should still be available, but it should prefer HTML fetched for the current `videoId` when looking for transcript endpoints.

Sixth, leave DOM fallback in place but make sure it is only present when the extractor is called with DOM fallback allowed. This means the slow path still exists for difficult videos, including the user’s previously observed `더보기 → 스크립트 표시 → transcript panel` sequence, but it is no longer the path that prefetch tries in the background. If fast prefetch succeeds, the slow path is never needed at click time. If fast prefetch fails, the click behavior remains functionally equivalent to v0.1.3.

Seventh, update README and privacy notes. The README should say that v0.1.4 adds quiet fast-path prefetch and current-tab memory cache, that DOM fallback is now post-click and last-resort, and that the permissions remain narrow. The privacy draft should say that the extension may locally prefetch transcript text on YouTube watch pages to speed up user-click handling, does not send transcript to ChatGPT before the user clicks, and does not store the prefetch as persistent history.

## Validation Plan

Static validation should check every JavaScript file with `node --check`. The manifest should be parsed as JSON and checked for version `0.1.4`, Manifest V3, the expected content scripts, no `<all_urls>`, and no `tabs` permission. The source should be scanned for the new prefetch functions, memory cache, conditional DOM fallback, and direct Innertube player path. The source should also be scanned to confirm that Gemini, Claude, direct GPT API calls, and server behavior were not introduced.

Behavioral validation in this runtime is necessarily limited because live YouTube and ChatGPT UI behavior cannot be executed here. The verification report should clearly distinguish static checks from browser checks. The user-side retest should reload the unpacked extension, reload the YouTube page, wait a second or two after the video page appears, then press `Summarize with GPT`. On a video where the fast path succeeds, console logs should show quiet prefetch success and cache use; ChatGPT should open faster than v0.1.3. On a video where fast path fails, the extension may still fall back to opening the transcript panel after click, which preserves correctness even if speed is not improved for that specific case.

The browser retest should also verify that v0.1.3’s auto-submit fix remains intact. The user should confirm that ChatGPT Temporary Chat is still detected in Korean and that auto-submit still fires. If auto-submit regresses, the speed patch should not be widened; instead, the narrow ChatGPT regression should be repaired separately while preserving the v0.1.4 extraction/cache behavior.

## Risks and Mitigations

The main risk is that YouTube’s fast metadata path may still fail for some videos. The mitigation is not to remove the slow DOM fallback. The fallback is necessary to preserve correctness, but it should be a last resort. Another risk is stale SPA data. YouTube can leave earlier page scripts in the DOM after route changes, so the player response parser should check `videoDetails.videoId` when available and fetch the stable watch URL for the current video if needed.

A second risk is user surprise from prefetch. The mitigation is to keep prefetch local and quiet. It must not submit anything to ChatGPT and must not open ChatGPT. It must not expand YouTube descriptions or open transcript panels before the user clicks. The privacy draft should plainly describe that transcript text may be locally prepared on watch pages for speed, without external transfer until the button click.

A third risk is overengineering. The user explicitly returned the project to MVP scope. The implementation should not add background job queues, multiple simultaneous ChatGPT tabs, a persistent database, a pre-opened GPT tab, or a language selection system. Those may be future ideas, but they are not part of v0.1.4.

A fourth risk is storage or prompt size. The speed patch should not create a transcript cache in `chrome.storage.local`. Current-tab memory cache with a small max size keeps the surface smaller and avoids persistent video history. The final prompt still uses the existing pending prompt delivery mechanism, so very long transcripts can still fail due to clipboard, pending prompt, or ChatGPT composer limits. That existing limitation should remain documented.

## Definition of Done

v0.1.4 is done when a new zip package exists with version `0.1.4`, the extension still loads as a no-bundler MV3 project, the YouTube script schedules quiet fast transcript prefetch on watch page readiness, the button click path checks the cache before extracting, DOM fallback is conditional and only available in click extraction, the ChatGPT auto-submit code from v0.1.3 remains unchanged except for any necessary version compatibility, documentation explains the new prefetch/cache behavior, privacy notes describe local prefetch honestly, verification and review reports are updated, the plan and session summary are refreshed, and the package is ready for the user’s Chrome Developer Mode retest.

The expected user-visible improvement is that after opening a YouTube video and waiting briefly, pressing `Summarize with GPT` should often skip the visible transcript panel opening and scrolling sequence. If the fast prefetch succeeded, ChatGPT should open quickly with the full transcript prompt and should auto-submit as v0.1.3 did. If fast prefetch did not succeed, the old fallback remains available so the result should still work, just with the old delay for that video.


## Implementation and Verification Update

At 2026-05-03 22:20:53 KST, the v0.1.4 speed patch was implemented and statically verified. The package now updates manifest and constants to version `0.1.4`, adds quiet YouTube transcript prefetch on watch-page readiness, adds current-tab memory cache keyed by `videoId`, changes the button-click path to use cache first and briefly wait for an in-flight prefetch, adds a direct Innertube player caption fast path, validates player responses against the current `videoId` when possible, keeps the slow YouTube transcript panel fallback conditional on user-click extraction, and updates README, privacy, verification, review, session summary, and package zip artifacts.

The static verification result was passing. Every JavaScript file passed `node --check`; manifest JSON parsed successfully; the manifest remained Manifest V3 with version `0.1.4`; permissions remained exactly `storage` and `clipboardWrite`; no `<all_urls>` or `tabs` permission was added; prompt-builder regression checks passed; and source checks confirmed the presence of quiet prefetch, current-tab memory cache, cache-first click handling, conditional DOM fallback, and the Innertube player caption fast path. Runtime verification remains pending in the user's browser because live YouTube caption availability and ChatGPT UI behavior cannot be executed in this environment.
