# Chrome Web Store Submission Report v0.1.57

## Package

- ZIP: `dist/youtube-gpt-summary-v0.1.57.zip`
- Size: 60,293 bytes
- Visibility target: Unlisted
- Category target: Productivity
- Listing language target: Korean

## Included Files

- `manifest.json`
- `assets/`
- `src/`
- `LICENSE`
- `PRIVACY.md`
- `README.md`

The package intentionally excludes development and submission-support folders such as `plan/`, `verification/`, `store-submission/`, `docs/`, and `dist/`.

## Static Verification

- `node --check` passed for background, YouTube, ChatGPT, Gemini, Options, and shared JavaScript files.
- Manifest parse check passed.
- Manifest version remains `0.1.57`.
- Manifest permissions remain `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, ChatGPT legacy host, and Gemini.
- No `tabs` permission is present.
- No `<all_urls>` host permission is present.

## Store Support Files

- `store-submission/chrome-web-store-listing-ko.md` contains Korean store listing, privacy practice, Limited Use, permission justification, and screenshot checklist copy.
- `store-submission/release-checklist-v0.1.57.md` contains the dashboard upload checklist.
- `docs/privacy.html` is prepared for GitHub Pages publication as the public privacy policy URL.

## Remaining Manual Steps

- Publish `docs/privacy.html` through GitHub Pages and copy its public URL into the Chrome Web Store privacy policy field.
- Capture or sanitize screenshots before upload.
- Upload `dist/youtube-gpt-summary-v0.1.57.zip` to the Chrome Web Store Developer Dashboard.
- Set visibility to `Unlisted`.
