# Review Report v0.1.36

Date: 2026-05-09 KST

## Findings

No blocking issues found in the v0.1.36 Gemini MVP patch.

## Review Notes

- Gemini is intentionally implemented as a separate immediate-open path, not part of the ChatGPT queue.
- ChatGPT model selection remains ChatGPT-only because Gemini payloads do not include `chatgptModel`.
- Gemini Temporary Chat is attempted before prompt injection; auto-submit is withheld if Temporary Chat cannot be confirmed.
- The manifest adds only the required `https://gemini.google.com/*` host permission and does not add broad host access or `tabs`.
- Privacy and disclaimer text now disclose Gemini/Google prompt transfer and third-party service limitations.

## Residual Risk

Gemini's web UI may expose different composer, submit, or Temporary Chat controls depending on account type, language, rollout state, or Google UI changes. Live browser retesting is required to confirm selector behavior on the user's account.
