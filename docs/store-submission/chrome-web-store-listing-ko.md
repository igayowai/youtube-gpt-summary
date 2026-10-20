# Chrome Web Store Listing Draft - Korean

## Distribution

- Visibility: Unlisted
- Category: Productivity
- Language: Korean
- Region: All regions

## Store Name

YouTube GPT Summary

## Short Description

접근 가능한 YouTube 자막/스크립트를 ChatGPT 또는 Gemini 임시채팅으로 보내 요약을 돕는 도구.

## Detailed Description

YouTube GPT Summary는 YouTube 영상 페이지에서 접근 가능한 자막 또는 스크립트가 제공되는 경우 이를 추출하고, 사용자가 선택한 프롬프트와 함께 ChatGPT 또는 Gemini로 보내 요약과 분석 작업을 돕는 Chrome 확장 프로그램입니다.

주요 기능:

- YouTube 영상 페이지에 `Summarize with GPT` 버튼과 `Summarize with Gemini` 버튼을 표시합니다.
- 접근 가능한 영상 transcript/caption을 추출해 제목, URL, transcript, 프롬프트를 하나의 요청으로 구성합니다.
- ChatGPT 경로에서는 가능한 경우 Temporary Chat으로 열고, 사용자가 설정한 모델 선택을 시도합니다.
- Gemini 경로에서는 가능한 경우 Gemini Temporary Chat으로 열고, 사용자가 설정한 모델 선택을 시도합니다.
- `autoSubmit` 설정이 켜져 있으면 프롬프트 입력 후 자동 제출을 시도합니다.
- transcript/caption을 가져온 경우 자동 입력이 실패할 때를 대비해 생성된 프롬프트를 클립보드에 복사할 수 있습니다.
- 영상에 접근 가능한 transcript/caption이 없거나 YouTube UI/데이터 구조 변경으로 추출할 수 없는 경우에는 ChatGPT 또는 Gemini 탭을 열지 않고 버튼에 `Transcript unavailable`을 잠시 표시합니다.
- 개발자 서버를 사용하지 않으며, 광고, 구독, 인앱 결제가 없습니다.

주의:

- 이 확장 프로그램은 YouTube, Google, OpenAI, ChatGPT, Gemini와 제휴, 후원, 보증 또는 공식 승인 관계가 없는 독립 도구입니다.
- 이 확장 프로그램은 모든 YouTube 영상에서 transcript/caption 제공을 보장하지 않습니다. 영상에 자막/스크립트가 없거나 접근할 수 없는 경우 요약 요청을 만들지 않습니다.
- ChatGPT, Gemini, YouTube의 UI와 정책은 각 서비스 제공자에 의해 변경될 수 있으며, 이 경우 일부 자동화 기능이 실패할 수 있습니다.
- AI가 생성한 요약은 부정확하거나 불완전할 수 있습니다. 중요한 정보는 원본 영상 또는 신뢰할 수 있는 자료를 통해 직접 확인해야 합니다.
- 이 확장 프로그램은 법률, 의료, 금융, 투자, 세무, 회계 또는 기타 전문 조언을 제공하지 않습니다.
- 이 확장 프로그램의 사용 허용은 YouTube 영상, transcript, 자막, 썸네일, 채널 콘텐츠, 댓글, 브랜드 요소 또는 기타 제3자 콘텐츠에 대한 권리를 부여하지 않습니다.

## Privacy Practices Draft

### Single purpose

접근 가능한 YouTube 영상 transcript/caption을 사용자가 선택한 프롬프트와 함께 ChatGPT 또는 Gemini로 보내 요약 또는 분석 작업을 돕습니다.

### Data handled

- Website content: YouTube video title, URL, video ID, and accessible transcript/caption text when available.
- User-provided content/settings: custom prompt, prompt mode, output language, ChatGPT reasoning effort setting, Gemini model setting, Gemini thinking level setting, Temporary Chat setting, auto-submit setting, prefetch setting.
- Temporary workflow data: request ID, generated final prompt, queue or pending-prompt state used to transfer prompts between YouTube, ChatGPT, and Gemini tabs.

### Data sharing disclosure

- No developer-operated server receives user data.
- No user data is sold.
- No user data is shared with advertising networks, data brokers, credit scoring services, or retargeting services.
- When the user clicks a summarize button, the generated transcript-based prompt may be inserted into and submitted to ChatGPT/OpenAI or Gemini/Google according to the user's settings and actions.

### Limited Use certification wording

The extension's use of user data is limited to providing or improving its single user-facing purpose: preparing and sending a YouTube transcript-based prompt to ChatGPT or Gemini at the user's request. User data is not used for advertising, creditworthiness, data brokerage, resale, or unrelated purposes.

## Permission Justifications

### `storage`

Stores extension settings such as prompt mode, custom prompt, language, model selections, auto-submit, Temporary Chat, prefetch settings, and temporary prompt-transfer state.

### `clipboardWrite`

Copies the generated final prompt to the clipboard as a fallback when browser focus or web UI changes prevent automatic insertion.

### `https://www.youtube.com/*`

Adds summarize buttons to YouTube watch pages and extracts accessible transcript/caption text when available for the user-requested summary workflow.

### `https://chatgpt.com/*` and `https://chat.openai.com/*`

Opens ChatGPT, attempts Temporary Chat when enabled, inserts the generated prompt, selects the configured ChatGPT model when possible, and optionally submits the prompt.

### `https://gemini.google.com/*`

Opens Gemini, attempts Gemini Temporary Chat, inserts the generated prompt, selects the configured Gemini model when possible, and optionally submits the prompt after Temporary Chat is confirmed.

## Screenshot Checklist

- YouTube watch page showing `Summarize with GPT` and `Summarize with Gemini`.
- Options page showing prompt mode, language, GPT model, Gemini model, and advanced settings.
- ChatGPT Temporary Chat page with a prompt inserted.
- Gemini Temporary Chat page with a prompt inserted.

Before upload, remove or blur visible account email, personal profile details, unrelated bookmarks, private tabs, and sensitive video/channel information.
