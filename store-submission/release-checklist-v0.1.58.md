# Release Checklist v0.1.58

## Before Upload

- Confirm `manifest.json` version is `0.1.58`.
- Confirm permissions are only `storage` and `clipboardWrite`.
- Confirm host permissions are scoped to YouTube, ChatGPT, and Gemini.
- Confirm no `<all_urls>` and no `tabs` permission are present.
- Confirm `PRIVACY.md` and GitHub Pages privacy URL are publicly accessible.
- Confirm store listing text says the extension is independent and not affiliated with YouTube, Google, OpenAI, ChatGPT, or Gemini.
- Confirm screenshots do not expose personal data.

## Chrome Web Store Dashboard

- Upload package: `dist/youtube-gpt-summary-v0.1.58-webstore.zip`.
- Visibility: `Unlisted`.
- Category: `Productivity`.
- Language: `Korean`.
- Privacy policy URL: GitHub Pages URL for `docs/privacy.html`.
- Monetization: Free, no ads, no subscription, no in-app purchase.

## Manual Smoke Test

- `Summarize with GPT` opens next to the source YouTube tab.
- ChatGPT Temporary Chat is confirmed before prompt submission.
- Configured ChatGPT model selection works.
- `Summarize with Gemini` opens next to the source YouTube tab.
- Gemini Temporary Chat is confirmed before prompt submission.
- Configured Gemini model selection works.
