# AI Summary for YouTube Privacy Policy and Disclaimer

Last updated: 2026-10-21 KST

This document describes how the AI Summary for YouTube Chrome extension handles data, what third-party services may receive user-directed content, and what limitations apply to summaries generated through ChatGPT, Gemini or Claude.

## 1. Service Overview

AI Summary for YouTube is a browser extension that helps users extract accessible YouTube transcript or caption text when available and send it to ChatGPT, Gemini or Claude with a selected prompt for summarization or audit-style analysis.

AI Summary for YouTube is an independent tool. It is not affiliated with, sponsored by, endorsed by, or officially approved by YouTube, Google, OpenAI, ChatGPT, Gemini, Anthropic, or Claude. YouTube, Google, OpenAI, ChatGPT, Gemini, Anthropic, Claude, and related names or trademarks are the property of their respective owners.

## 2. Data Processed by the Extension

The extension may process the following data in the user's browser to provide its user-facing summary workflow:

- YouTube video title
- YouTube video URL
- YouTube video ID
- YouTube transcript or caption text when accessible and available
- User-entered custom prompt
- Prompt mode setting
- Output language setting
- ChatGPT reasoning effort setting
- Gemini model selection setting
- Gemini thinking level setting
- Claude model and effort settings
- Claude incognito setting
- Temporary Chat setting
- Auto-submit setting
- Aggressive transcript prefetch setting
- Temporary queue data used to send prepared prompts to ChatGPT, Gemini or Claude

The extension uses this data only to prepare and send a prompt to ChatGPT, Gemini or Claude when the user uses the summarization workflow and accessible transcript/caption text is available.

## 3. Local Storage

The extension stores user settings in Chrome extension storage so the settings remain available between browser sessions.

Stored settings may include:

- `customPrompt`
- `promptMode`
- `outputLanguage`
- `chatgptReasoningEffort`
- `geminiModel`
- `geminiThinkingLevel`
- `claudeModel`
- `claudeEffort`
- `aggressiveTranscriptPrefetch`
- `useTemporaryChat`
- `useClaudeIncognito`
- `autoSubmit`

If the custom prompt is empty or contains only whitespace, it may be stored internally as `null`.

A `chatgptModel` value saved by an earlier version may remain in extension storage. Current versions only read it to carry over the earlier reasoning-effort choice and do not change the ChatGPT model.

## 4. Temporary In-Browser Data

The extension may temporarily keep transcript data in the current YouTube tab's content-script memory to speed up the user's later click on the summarize button. This cache is local to the current browser tab and is not a permanent video history.

The extension may also use `chrome.storage.session` for temporary prompt-transfer data. Queue or pending-prompt data may include the final prompt, source metadata, request ID, selected ChatGPT reasoning effort, Gemini model and Gemini thinking level settings, Claude model, Claude effort and Claude incognito settings, and related temporary workflow state. This data is used to process ChatGPT, Gemini or Claude prompt-transfer jobs and is not intended as permanent storage.

The extension does not permanently store:

- Video-by-video summary history
- Transcript history
- ChatGPT, Gemini or Claude response content
- ChatGPT, Gemini or Claude conversation history
- User account information
- Payment information
- Advertising identifiers

## 5. Data Sharing and Third-Party Services

The developer does not operate a server for this extension.

The extension does not send user data to a developer-operated server. The extension does not sell user data. The extension does not share user data with advertising networks, data brokers, credit scoring services, or retargeting services.

When the user activates the summarize workflow and accessible transcript/caption text is available, the generated prompt may include the YouTube video title, URL, transcript, selected prompt text, and selected output-language instruction. That prompt may be inserted into ChatGPT, Gemini or Claude and submitted to ChatGPT/OpenAI, Gemini/Google or Claude/Anthropic according to the user's settings and actions. If accessible transcript/caption text cannot be extracted, the extension does not open ChatGPT, Gemini or Claude for that summarize request.

Data sent to ChatGPT or OpenAI may be subject to OpenAI's terms, privacy policy, data handling rules, account settings, and Temporary Chat behavior.

Data sent to Gemini or Google may be subject to Google's terms, privacy policy, data handling rules, account settings, and Gemini Temporary Chat behavior.

Data sent to Claude or Anthropic may be subject to Anthropic's terms, privacy policy, data handling rules, account settings, and Claude incognito chat behavior.

The extension does not send transcript or prompt data to Claude or any separate analysis server.

The extension's use of user data is limited to providing or improving the extension's single user-facing purpose: preparing and sending a YouTube transcript/caption-based prompt to ChatGPT, Gemini or Claude at the user's request when accessible transcript/caption text is available. The extension does not use user data for advertising, creditworthiness, data brokerage, resale, or unrelated purposes.

## 6. Temporary Chat and Auto-Submit

The extension attempts to use ChatGPT Temporary Chat when the user has enabled the Temporary Chat setting.

Temporary Chat behavior, availability, URL behavior, user interface structure, data retention policy, and service operation are controlled by OpenAI and may change. The developer does not guarantee that Temporary Chat will always be available, will always be detected, or will always process data in a particular way.

For Gemini, the extension attempts to use Gemini Temporary Chat before inserting or submitting the prompt. Gemini Temporary Chat behavior, availability, user interface structure, data retention policy, and service operation are controlled by Google and may change. The developer does not guarantee that Gemini Temporary Chat will always be available, will always be detected, or will always process data in a particular way.

For Claude, the extension opens claude.ai in incognito mode by default (a separate setting can turn this off) and confirms incognito mode before inserting the prompt. Incognito chats are not saved to the user's Claude chat history, but Anthropic may still retain them for a period under its own policy. Claude incognito behavior, availability, user interface structure, data retention policy, and service operation are controlled by Anthropic and may change. Choosing a Claude model or effort in the extension settings also changes the selection shown in the user's claude.ai account.

If the `autoSubmit` setting is enabled, clicking a summarize button may cause the generated prompt to be automatically inserted into the ChatGPT, Gemini or Claude composer and automatically submitted. If Gemini Temporary Chat cannot be confirmed, the extension should withhold Gemini auto-submit and leave the prompt in the composer when possible. If Claude incognito mode is enabled but cannot be confirmed, the extension does not insert the prompt into Claude and leaves it on the clipboard. If a requested Claude model or effort cannot be confirmed, Claude auto-submit is withheld.

## 7. Clipboard Use

The extension may copy the generated final prompt to the clipboard as a fallback. This is intended to help the user paste the prompt manually if automatic ChatGPT injection fails or if browser focus restrictions prevent direct insertion.

## 8. Permissions and Host Access

The extension requests only the permissions needed for its stated workflow.

### `storage`

Used to store user settings and temporary queue state.

### `clipboardWrite`

Used to copy the generated prompt to the clipboard as a fallback.

### `https://www.youtube.com/*`

Used to insert the summarize button on YouTube watch pages and extract accessible transcript/caption text when available.

### `https://chatgpt.com/*` and `https://chat.openai.com/*`

Used to insert the generated prompt into ChatGPT and, if enabled, submit it.

### `https://gemini.google.com/*`

Used to insert the generated prompt into Gemini Temporary Chat and, if enabled and Temporary Chat is confirmed, submit it.

### `https://claude.ai/*`

Used to insert the generated prompt into Claude (incognito mode by default), select the requested model and effort when set, and, if enabled, submit it.

## 9. Disclaimer

AI Summary for YouTube is not affiliated with, sponsored by, endorsed by, or officially approved by YouTube, Google, OpenAI, ChatGPT, Gemini, Anthropic, or Claude.

This extension helps users send accessible YouTube transcript/caption text to ChatGPT, Gemini or Claude for summarization or audit-style analysis when such text is available. It does not guarantee that every YouTube video has an accessible transcript or caption. AI-generated summaries may be inaccurate, incomplete, outdated, or misleading. Users should verify important information directly from the original video, official materials, or other reliable sources.

This extension does not provide legal, medical, financial, investment, tax, accounting, or other professional advice. Generated summaries or analyses should not be used as a substitute for professional judgment, professional review, or professional advice.

This extension may be used for personal, educational, research, work, or business workflows. This permission applies only to use of the extension itself. It does not grant ownership, license, redistribution rights, commercial-use rights, or any other rights to YouTube videos, transcripts, captions, thumbnails, channel content, comments, brand elements, or other third-party content.

Users are solely responsible for ensuring that their use of transcripts, prompts, AI-generated summaries, and resulting materials complies with applicable laws, copyright rules, platform terms, third-party rights, and their organization's policies.

The developer does not guarantee that any transcript, summary, AI-generated output, or resulting material is legally safe for publication, redistribution, monetization, workplace use, or commercial use.

The extension does not operate its own AI model and does not guarantee the availability, accuracy, behavior, speed, output quality, policy stability, or uninterrupted operation of ChatGPT, OpenAI, Gemini, Google, Claude, Anthropic, YouTube, or any other third-party service.

## 10. Chrome Web Store Publication Notes

Before publishing, the Chrome Web Store listing, privacy disclosures, permission justifications, screenshots, and store description should remain consistent with this document.

The store description should clearly state that the extension sends YouTube transcript/caption-based prompts to ChatGPT, Gemini or Claude only when accessible transcript/caption text is available and the user uses the corresponding summarize feature.

The permission justification should accurately explain YouTube page access, ChatGPT page access, Gemini page access, Claude page access, `storage`, and `clipboardWrite`.

The extension name, icon, screenshots, and description should not imply official affiliation, endorsement, sponsorship, or approval by YouTube, Google, OpenAI, ChatGPT, Gemini, Anthropic, or Claude.

## 11. References

- Chrome Web Store Privacy Policies: https://developer.chrome.com/docs/webstore/program-policies/privacy
- Chrome Web Store Program Policies: https://developer.chrome.com/docs/webstore/program-policies/policies
- Chrome Web Store User Data FAQ: https://developer.chrome.com/docs/webstore/program-policies/user-data-faq
- YouTube Terms of Service: https://www.youtube.com/static?template=terms
- OpenAI Temporary Chat FAQ: https://help.openai.com/en/articles/8914046-temporary-chat-faq
- OpenAI Brand Guidelines: https://openai.com/brand/
- Gemini Apps Help: https://support.google.com/gemini/answer/13275745
- Claude Help Center, Use incognito chats: https://support.claude.com/en/articles/12260368-use-incognito-chats
- Anthropic Privacy Policy: https://www.anthropic.com/legal/privacy
