# Release Checklist v0.1.81

## Before Upload

- Confirm `manifest.json` version is `0.1.81`.
- Confirm permissions are only `storage` and `clipboardWrite`.
- Confirm host permissions are scoped to YouTube, ChatGPT, and Gemini.
- Confirm no `<all_urls>` and no `tabs` permission are present.
- Confirm the store listing says the extension works with accessible YouTube transcript/caption text when available.
- Confirm the Options page disclaimer matches the same accessible transcript/caption limitation.
- Confirm `PRIVACY.md` and `docs/privacy.html` mention accessible transcript/caption availability.
- Confirm screenshots use a YouTube video with accessible captions/transcript.
- Confirm screenshots do not expose personal data.

## Chrome Web Store Dashboard

- Upload package: `dist/youtube-gpt-summary-v0.1.81-webstore.zip`.
- Visibility: `Unlisted`.
- Category: `Productivity`.
- Language: `Korean`.
- Privacy policy URL: GitHub Pages URL for `docs/privacy.html`.
- Monetization: Free, no ads, no subscription, no in-app purchase.

## Manual Smoke Test

- On a YouTube video with accessible transcript/caption, `Summarize with GPT` opens ChatGPT and sends the prepared prompt.
- On a YouTube video with accessible transcript/caption, `Summarize with Gemini` opens Gemini and sends the prepared prompt.
- On a YouTube video without accessible transcript/caption, clicking either button shows `Transcript unavailable` and does not open ChatGPT or Gemini.
- ChatGPT Temporary Chat is confirmed before prompt submission.
- Gemini Temporary Chat is confirmed before prompt submission.
- Configured model selection still works or, if not confirmed, auto-submit is withheld.

