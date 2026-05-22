# Verification Report v0.1.33

Date: 2026-05-08 KST

## Scope

v0.1.33 replaces `PRIVACY.md` with a clean publication-oriented privacy policy and disclaimer.

## Expected Coverage

- Processed YouTube and settings data
- Local `chrome.storage` settings
- Temporary transcript cache and `chrome.storage.session` queue data
- Data not permanently stored
- No developer-operated server data collection, sale, or advertising/data-broker sharing
- ChatGPT/OpenAI prompt transfer when the user runs the summarize workflow
- Temporary Chat and auto-submit limitations
- Clipboard fallback
- Permission and host access explanations
- Independent affiliation and trademark disclaimer
- AI accuracy and professional-advice disclaimer
- Commercial-workflow allowance for extension use only, without third-party content rights
- Chrome Web Store publication consistency notes

## Manifest / Permission Check

- Manifest version: `0.1.33`
- Permissions: `storage`, `clipboardWrite`
- No `tabs` permission.
- No `<all_urls>` host permission.

## Manual Review Checklist

1. Open `PRIVACY.md`.
2. Confirm the document renders cleanly in Korean/English without mojibake.
3. Confirm Chrome Web Store listing text and permission justifications do not contradict the policy.
4. Confirm Options disclaimer remains consistent with the policy.
