# Verification Report v0.1.79

## Scope

This verification covers a whole-project UTF-8/mojibake scan and the ChatGPT Korean fallback-string cleanup.

## Static Checks

- UTF-8 fatal decode scan passed for 156 text files.
- Mojibake/replacement-character scan found 0 remaining suspicious entries.
- `node --check` passed for all 10 JavaScript files under `src/`.
- Manifest parse check passed.

## Manifest Safety Check

- Manifest version is `0.1.79`.
- Permissions remain `storage` and `clipboardWrite`.
- Host permissions remain scoped to YouTube, ChatGPT, and Gemini.
- No `tabs` permission is present.
- No `<all_urls>` host permission is present.

## Behavioral Note

`src/content/chatgpt.js` had mojibake Korean fallback strings left over in model selector, temporary-chat confirmation, and send-button fallback matching. These were replaced with readable UTF-8 Korean strings such as `모델 선택기`, `임시 채팅`, `보내기`, `전송`, `프롬프트`, `확장`, and `헤비 모드`.
