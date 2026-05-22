# Approved Work Plan: YouTube Transcript to ChatGPT Temporary Chat Extension v0.1

Plan Type: work-plan  
Workstream: Manifest V3 no-bundler Chrome extension implementation  
Version: v01  
Status: Superseded by v0.1.4 MVP speed patch plan  
Created: 2026-05-03 19:27:45 KST  
Last Updated: 2026-05-03 22:17:31 KST
Supersedes or Related Plan: User-approved onboarding document and modified direction from this conversation  
Current Completion State: Superseded after user accepted the MVP speed-patch direction for v0.1.4  
Completed So Far: The user approved the direction, the full Manifest V3 no-bundler project was generated, the first live test revealed an empty-transcript false negative, a v0.1.1 repair improved non-DOM transcript extraction and native transcript-panel reading, a v0.1.2 repair added the missing YouTube description-expansion sequence, and user-provided live evidence then confirmed that a full timestamped transcript prompt was generated and injected into ChatGPT. A remaining issue was that auto-submit did not fire after injection.  
Remaining Work: User-side retest in Chrome Developer Mode with the v0.1.3 package to confirm that Korean Temporary Chat copy is recognized and the send button is clicked automatically when autoSubmit is true.  
Current Blockers: No local static blocker remains. Runtime success still depends on live ChatGPT behavior in the user browser, especially the Korean Temporary Chat confirmation copy and the current composer submit button markup.  
Next Step: User should replace the loaded unpacked extension with the repaired v0.1.3 folder, reload the extension plus the YouTube page, then retest the same captioned video and confirm whether ChatGPT submits automatically after injection.

## Scoreboard

Current Score: 50  
Score Source: provisional  
Last Updated: 2026-05-03 22:17:31 KST
Score Rationale: The user reported that the v0.1.2 transcript extraction path is now producing a full timestamped prompt and described the result as excellent, but also reported that automatic submission did not happen. The likely cause is that the safety gate correctly withheld submission when Temporary Chat was not confirmed, but the Korean ChatGPT copy in the user's screenshot says `채팅 기록에 나타나지 않으며 당사 모델 훈련에 사용되지 않습니다`, which v0.1.2 did not recognize because it only looked for narrower Korean phrases such as `기록에 표시되지` and `모델 개선`. The score is capped at 50 because it remains provisional and live auto-submit retesting is still pending.
What Improved: The transcript extraction and prompt injection behavior has user-side evidence of success. A narrow v0.1.3 repair now broadens Korean and English Temporary Chat confirmation markers to include the user's observed Korean copy, logs the reason for Temporary Chat confirmation, and improves send-button discovery with composer-scoped selectors for `Send`, `Submit`, `prompt`, `보내`, `전송`, and `프롬프트` labels while avoiding microphone, attachment, model, tools, and other non-submit controls.
What Remains Unsatisfactory: The auto-submit path still needs live retesting in the user's ChatGPT session. ChatGPT may continue to change Korean copy, button labels, data-testid values, or composer structure, so the code must remain defensive and rely on prompt-left-in-composer fallback if a future UI change prevents submission.
Actions To Raise Or Maintain The Score: Load the v0.1.3 package, reload the extension and relevant YouTube/ChatGPT tabs, retest the same video, and confirm whether the prompt is submitted automatically. If it still does not submit, capture the ChatGPT DevTools console lines containing `[YGS]`, especially whether Temporary Chat was confirmed or auto-submit was withheld.

### Score History

- 2026-05-03 19:27:45 KST: Provisional score set to 50 because the user approved the direction, but implementation and live testing evidence were not yet available.
- 2026-05-03 19:35:14 KST: Provisional score remained 50 after implementation, static verification, review, and packaging. It was not raised above 50 because live browser testing was still pending.
- 2026-05-03 20:11:29 KST: Provisional score adjusted to 48 after the user reported a real live false-negative where a visible transcript produced the empty-transcript STOP prompt. The repair is completed, but the score remains below 50 until the v0.1.1 retest confirms the issue is fixed.
- 2026-05-03 20:34:49 KST: Provisional score adjusted to 49 after the user identified the missing live UI sequence: expand the YouTube description with `더보기` before the `스크립트 표시` button appears. The v0.1.2 repair addresses that exact sequence, but the score stays below 50 until live retesting confirms success.
- 2026-05-03 21:03:28 KST: Provisional score adjusted to 50 after the user confirmed that v0.1.2 now generated and injected a full timestamped transcript prompt, while reporting that auto-submit did not fire. The v0.1.3 repair addresses the likely Korean Temporary Chat confirmation phrase mismatch and strengthens send-button discovery, but the score remains capped at 50 until live auto-submit retesting succeeds.

## Objective

Build a complete local-testable Chrome Extension Manifest V3 v0.1 project that sends a YouTube video's available transcript to ChatGPT through the ChatGPT web application rather than through a direct API call. The extension should let a non-developer user load it with Chrome Developer Mode, open a normal YouTube watch page, press a single button, and have the generated prompt copied to the clipboard and injected into a newly opened ChatGPT page.

The project must stay deliberately small. The target is not a polished commercial product, not a full transcript management system, not an API integration, and not a multi-model summarizer. The target is a useful v0.1 that proves the end-to-end route: YouTube page to transcript extraction, prompt construction, clipboard fallback, ChatGPT tab opening, ChatGPT input injection, and conditional automatic submission.

## Confirmed Product Decisions

The extension must not use Gemini, Claude, a direct GPT API call, or any server owned by the extension. The extension must not add transcript chunking, transcript truncation, first-pass summarization, history storage, account systems, advertising, payments, subscriptions, or complex prompt presets. It must not summarize from a title or URL when the transcript is missing. It must not display fallback toast, alert, or banner UI when clipboard, injection, or automatic submission fails.

The default user setting must be `customPrompt: null` and `autoSubmit: true`. When the custom prompt textarea is empty or only whitespace, the saved value must be JavaScript `null`, not an empty string and not the string `"null"`. When `customPrompt` is null and a non-empty transcript exists, the extension must use the built-in Korean default summary prompt. When `customPrompt` is a non-empty string and a non-empty transcript exists, the extension must use that custom prompt and not the built-in default. When the transcript is empty or extraction fails, both the custom prompt and default prompt must be ignored and only the STOP prompt should be sent.

The transcript language priority for v0.1 is now confirmed as Korean `ko`, then English `en`, then the first available caption track. There should be no language selection UI in v0.1. This should be recorded as an intentional implementation choice and left as a future TODO for a later version if the user wants language selection.

## Revised Reliability Decisions To Implement

Use `globalThis.YGS` for the shared namespace in all plain JavaScript files. This keeps the shared helper files usable in content scripts, options pages, and the Manifest V3 service worker. Avoid relying on `window` in shared files that may be loaded by the service worker.

Use request-id-based pending prompt storage rather than a single `pendingPrompt` value. A YouTube click should create a unique request id, store the payload under a request-specific key in `chrome.storage.session`, and open ChatGPT with that request id in the URL hash. The ChatGPT content script should request only its own payload and clear that payload after successful injection. This avoids the common failure where two ChatGPT tabs race and the wrong tab consumes the wrong prompt.

Use `chrome.storage.local` for durable user settings and `chrome.storage.session` for pending prompt payloads. Session storage is the correct shape for temporary in-memory prompt state because the prompt should not be persisted across browser restarts, extension reloads, or updates. The code should keep a short index of pending request ids and prune expired or excess items to avoid unbounded session memory use.

Do not add the `tabs` permission solely to open a new ChatGPT tab. The background service worker can call `chrome.tabs.create` for this use case without the broad `tabs` permission. If later work needs to inspect tab URL, title, favicon, or other sensitive tab properties, that should be a separate decision.

Treat Temporary Chat as preferred but not guaranteed by URL alone. Open `https://chatgpt.com/?temporary-chat=true` with the request id in the hash, and include a fallback domain if necessary. In the ChatGPT content script, attempt to detect or enable Temporary Chat through visible UI markers. Automatic submission should occur only when `autoSubmit` is true and Temporary Chat appears confirmed. If Temporary Chat is not confirmed, the prompt should still be injected and left in the input for the user to manually submit. This preserves the user's privacy goal by avoiding automatic submission into a normal chat history when the temporary mode is uncertain.

Design ChatGPT input injection as a small adapter system rather than a single selector. The code should support textarea-style inputs, contenteditable inputs, and ProseMirror-like composer nodes. It should focus the input, insert the prompt, dispatch input events, wait briefly for the send button to become enabled, click the send button when appropriate, and fall back to Enter events only if clicking fails. If all submission attempts fail, the prompt should remain in the input without user-visible error UI.

## File and Module Plan

The root project should contain `manifest.json`, `README.md`, `PRIVACY.md`, placeholder icons, source files under `src/`, this `plan/` directory, and a compact `session-summary.md` run ledger. The extension source should remain no-bundler plain JavaScript. No TypeScript compiler, Vite setup, package manager, or build step should be introduced.

The shared source files should include constants, logging, settings storage, pending prompt storage, prompt building, and transcript formatting. Content scripts should load shared files in manifest order before loading page-specific scripts. The background service worker should load the shared files through `importScripts()` at top level and register message listeners synchronously.

The YouTube content script should detect watch pages, insert a single `Summarize with GPT` button, prevent duplicate buttons, respond to YouTube single-page-application URL changes, extract the video id, title, and URL, attempt transcript extraction, format timestamps, build the final prompt, copy the prompt to clipboard silently, and ask the background service worker to store the payload and open ChatGPT. It should never throw an unhandled exception that prevents the STOP prompt path when transcript extraction fails.

The ChatGPT content script should parse the request id from the URL hash, ask the background service worker for that pending prompt, wait for a composer input, inject the prompt through the best available adapter, clear the pending prompt after successful injection, and then submit only when `autoSubmit` is true and Temporary Chat is confirmed. It should use console logs for developer diagnosis and no visible failure UI.

The options page should provide a textarea for the custom prompt, a checkbox for auto-submit, a save button, and a built-in default prompt preview. It should load settings, show null custom prompt as an empty textarea, normalize whitespace-only input to null on save, and persist auto-submit as a boolean. A small saved status message in the options page is acceptable because it is not a fallback failure UI on YouTube or ChatGPT.

## Transcript Extraction Strategy

The YouTube extraction strategy should be defensive and small. First inspect inline script text from the current page for `ytInitialPlayerResponse`. If that fails, fetch the current watch HTML and inspect it in the same way. From the resulting player response, find `captions.playerCaptionsTracklistRenderer.captionTracks`, choose the track by the confirmed language order, fetch the caption track URL, and parse transcript entries. Prefer `fmt=json3` when available because it is easier to parse into timestamped events. Fall back to XML parsing if JSON parsing fails.

The transcript text should use timestamp lines such as `[00:00] text` and `[01:04:12] text` for videos longer than an hour. It should not chunk, truncate, summarize, re-order, or otherwise compress the transcript. Blank transcript entries should be filtered out during formatting. If every extraction path fails, return an empty transcript string so the prompt builder can choose the STOP prompt.

## Prompt Rules

The prompt builder must implement the following exact behavioral split. If the transcript is empty after trimming, return the STOP prompt only. The STOP prompt should instruct ChatGPT not to summarize, analyze, infer, or use title/URL and to output only `스크립트 추출 불가`. In this branch, do not include title, URL, video id, custom prompt, or default prompt.

If the transcript is non-empty, choose `customPrompt` if it is non-null; otherwise choose the built-in default prompt. Then append video information and the full timestamped transcript. The prompt builder should return both the prompt string and the mode, with mode values such as `normal` and `emptyTranscriptStop`, so the pending payload can carry diagnostic metadata.

## Validation Plan

The non-browser validation should check manifest JSON validity, source file presence, content script loading order, JavaScript syntax where possible, and core prompt behavior through a lightweight Node or static test. It should confirm that the manifest uses Manifest V3, includes only the needed permissions, includes the expected host permissions, and does not include the `tabs` permission. It should confirm that the project has all files needed for Chrome Developer Mode loading.

Browser runtime validation remains a manual step for the user. The README should explain how to open `chrome://extensions`, enable Developer Mode, choose Load unpacked, select the folder containing `manifest.json`, open ChatGPT while logged in, open a YouTube watch page, press the button, and observe whether ChatGPT receives the prompt. The README should explain that if Temporary Chat cannot be confirmed, the prompt may be injected but not automatically submitted, and the user can manually press Send.

## Risks and Mitigations

The main risk is that YouTube's transcript metadata structure changes or that the selected video lacks caption tracks. The mitigation is to keep extraction defensive and to route failures to the STOP prompt rather than hallucination-prone title or URL summarization.

The second main risk is that ChatGPT's composer DOM changes. The mitigation is to support multiple input adapters and keep the adapter code compact and easy to revise after user testing. The extension should leave the prompt in the box if automatic submission fails.

The third main risk is prompt size. v0.1 intentionally sends the full transcript and does not chunk or truncate. The mitigation is not to silently alter user content, but to catch storage, clipboard, and injection failures. The clipboard fallback should be attempted before opening ChatGPT. If storage fails because a prompt is too large, the background should still try to open ChatGPT so the user can paste manually.

The fourth main risk is accidental normal-chat auto-submit. The mitigation is to withhold automatic submission unless Temporary Chat appears confirmed. This is a deliberate modification to the original onboarding document because it better matches the user's privacy purpose for Temporary Chat.

## Definition of Done

The work is complete when the project folder and zip are created, the manifest and source files are present, the code follows the no-bundler plain JavaScript approach, the revised reliability decisions are implemented, the default settings and prompt rules are represented in code, the transcript language order is implemented, the README and privacy draft are present, placeholder icons exist, syntax and structural verification pass, and a read-only review finds no material issue that blocks local Chrome testing.

The final chat response should provide links to the project folder and zip artifact, summarize what was created, name the important manual browser tests, and clearly state that live YouTube and ChatGPT UI behavior still needs user-side testing in Chrome Developer Mode.


## Progress Update - Implementation

Updated: 2026-05-03 19:32:00 KST

The planned source tree has been generated under the repository root. The implementation includes the manifest, shared namespace helpers, storage helpers, prompt builder, transcript formatter, YouTube content script, ChatGPT content script, background service worker, options page, placeholder icons, README, and privacy draft. No bundler, external dependency, Gemini/Claude path, direct GPT API path, server path, chunking path, or fallback UI path was added.


## Progress Update - Narrow Implementation Adjustment

Updated: 2026-05-03 19:33:18 KST

The ChatGPT contenteditable injection path was adjusted so it selects and replaces existing composer contents instead of appending to the end of any pre-existing text. This remains inside the approved adapter-based injection scope and does not change the product direction.


## Progress Update - Verification

Updated: 2026-05-03 19:33:49 KST

Static and structural verification completed successfully. The manifest is valid JSON, uses Manifest V3, omits the `tabs` permission, keeps permissions to `storage` and `clipboardWrite`, and contains the expected host permissions. All required source files and placeholder icons exist. Node syntax checks passed for every JavaScript file. Lightweight prompt-builder behavior tests passed for default prompt selection, custom prompt selection, empty transcript STOP prompt behavior, metadata leakage prevention in the empty branch, and custom prompt normalization. Icon dimensions were confirmed for 16, 48, and 128 pixels.


## Progress Update - Read-Only Review

Updated: 2026-05-03 19:34:45 KST

A read-only review completed with no material blocker for local Chrome Developer Mode testing. The review report is saved at `verification/review-report.md`. Remaining risks are limited to live YouTube and ChatGPT UI behavior, long prompt limits, and Temporary Chat detection fidelity, all of which require browser-side testing.


## Progress Update - Packaging and Handoff

Updated: 2026-05-03 19:35:14 KST

The project zip was prepared at `/mnt/data/youtube-gpt-summary-extension.zip`. The implementation is complete for local Chrome Developer Mode testing. No static verification or read-only review blocker remains. The next meaningful validation step is live browser testing by the user.


## Progress Update - v0.1.1 Transcript Extraction Repair

Updated: 2026-05-03 20:11:29 KST

The user reported that a YouTube video with a visible Korean transcript still produced the empty-transcript STOP prompt in ChatGPT. The issue was treated as an approved narrow repair under the existing live-testing follow-up scope. The YouTube content script was updated without changing the product direction: it still sends the whole transcript when found and still sends only the STOP prompt when extraction genuinely fails.

The repair keeps the original caption-track extraction path, improves XML parsing so both classic `<text>` captions and SRV3-style `<p t="..." d="...">` caption payloads can be parsed, adds an Innertube `get_transcript` fallback when page metadata exposes transcript parameters, and adds a DOM fallback that can read YouTube's native transcript panel if it is already open or if a visible Show Transcript button can be clicked. This is intentionally limited to transcript extraction; it does not add chunking, truncation, API summarization, Gemini, Claude, a server, or visible fallback UI.

Static JavaScript syntax verification passed after the repair. The repaired package should be treated as v0.1.1 for local retesting. The next action is for the user to load the repaired unpacked folder, reload the extension and the YouTube page, then retry the same video that previously produced `스크립트 추출 불가`.


## Progress Update - v0.1.2 Description Expansion Transcript Repair

Updated: 2026-05-03 20:34:49 KST

The user clarified that the screenshot evidence has an important UI order: on the tested YouTube watch page, the description area must first be expanded with `더보기`, and only after that does the `스크립트 표시` button become available. The previous v0.1.1 native transcript-panel fallback could read an already open transcript panel and could click a visible Show Transcript button, but it did not explicitly perform the description expansion step before searching again for that button.

A narrow v0.1.2 repair was applied under the existing approved live-testing repair scope. The YouTube content script now attempts the transcript DOM fallback in this order: read any already visible transcript panel entries; search for a visible `스크립트 표시` / `Show transcript` button; if no such button exists, narrowly search inside the watch metadata and description containers for description expansion controls such as `더보기`, `더 보기`, `자세히`, or `Show more`; click the description expansion control; wait for the Show Transcript button to appear; click it; and then read native transcript panel entries.

The repair intentionally keeps the product scope unchanged. It does not add chunking, truncation, direct API calls, Gemini, Claude, a server, visible fallback UI, or any title/URL-based summary when transcript extraction fails. The STOP prompt remains the only output when all approved transcript extraction paths fail.

Static JavaScript syntax verification passed after the v0.1.2 repair. The next action is for the user to load the v0.1.2 unpacked folder, reload the extension and the YouTube page, and retry the same video.


## Progress Update - v0.1.3 Temporary Chat Confirmation and Submit Repair

Updated: 2026-05-03 21:03:28 KST

The user reported that the v0.1.2 result is now strong enough to generate and inject a full prompt containing the YouTube title, URL, and timestamped transcript, but that automatic submission did not happen. This is a narrow live-runtime issue in the ChatGPT content script, not a transcript extraction issue. It remains inside the approved repair loop because the existing plan explicitly covers ChatGPT injection behavior and bounded fixes after live testing.

The likely cause is the Temporary Chat safety gate. The extension intentionally avoids automatic submission unless it can confirm that the ChatGPT page is in Temporary Chat mode. The user's screenshot shows Korean Temporary Chat copy saying that the chat will not appear in the user's chat history and will not be used for model training. The v0.1.2 detector looked for narrower Korean phrases, including `기록에 표시되지`, `메모리에 접근`, and `모델 개선`, so it could miss the visible Korean phrase `기록에 나타나지 않으며 당사 모델 훈련에 사용되지 않습니다`. When that confirmation failed, the content script left the prompt in the composer and withheld auto-submit as designed.

A narrow v0.1.3 repair was applied. The ChatGPT content script now recognizes a broader set of Korean Temporary Chat confirmation markers, including `기록에 나타나지`, `채팅 기록에 나타나지`, `훈련에 사용되지`, `모델 훈련에 사용되지`, and `당사 모델 훈련`, while still requiring the page to contain the `임시 채팅` label so the check is not reduced to a loose keyword match. The English marker list was also broadened for common wording around history and model training. The repair logs the reason when Temporary Chat is confirmed so future DevTools evidence can distinguish a confirmation failure from a submit-button failure.

The send-button lookup was also strengthened without changing the product scope. The content script now searches composer-scoped roots before the whole document, checks for current submit-related labels such as `Submit`, `prompt`, `보내`, `전송`, and `프롬프트`, scores likely send buttons, and filters out labels associated with microphone, voice, attachment, file upload, plus/add controls, tools, model selectors, and extensions. The existing behavior remains: if automatic submission still fails, the prompt remains in the composer and the clipboard fallback is already available.

Static JavaScript syntax verification passed after the v0.1.3 repair. The next action is for the user to load the v0.1.3 unpacked folder, reload the extension and the YouTube page, and retry the same video. If automatic submission still does not happen, the next useful evidence is the ChatGPT DevTools console output containing `[YGS]` lines that say whether Temporary Chat was confirmed or auto-submit was withheld.


## Supersession Note

At 2026-05-03 22:17:31 KST, this v01 plan was superseded by `plan/20260503-221731--work-plan--youtube-gpt-summary-extension-v014-speed-patch--v02.md`. The successor plan keeps the accepted v0.1.3 behavior, especially transcript extraction repair and ChatGPT auto-submit repair, but narrows the next change to an MVP speed patch: quiet fast-path transcript prefetch, current-tab memory cache, cache-first button handling, and DOM transcript-panel fallback only after a user click when fast/cache paths fail.
