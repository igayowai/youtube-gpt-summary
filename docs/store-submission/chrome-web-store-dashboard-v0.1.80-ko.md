# Chrome Web Store Dashboard Copy v0.1.80 - Korean

## 전용 목적 설명

YouTube GPT Summary는 사용자가 YouTube 영상 페이지에서 요약 버튼을 누르면 해당 영상에서 접근 가능한 transcript/caption과 영상 제목, URL을 추출해 사용자가 선택한 프롬프트와 함께 ChatGPT 또는 Gemini 입력창에 넣도록 돕는 확장 프로그램입니다. 사용자는 ChatGPT 또는 Gemini 중 사용할 서비스를 선택할 수 있으며, 확장 프로그램은 가능한 경우 임시채팅을 사용하고 설정에 따라 모델 선택과 자동 제출을 시도합니다. 접근 가능한 transcript/caption이 없거나 추출할 수 없는 경우에는 ChatGPT 또는 Gemini로 요청을 보내지 않습니다. 개발자 서버로 데이터를 전송하지 않으며, YouTube transcript/caption 기반 요약 및 분석 작업을 보조하는 단일 목적만 수행합니다.

## 사용자 데이터 사용

선택 항목:

- 웹사이트 콘텐츠

선택하지 않는 항목:

- 개인 식별 정보
- 건강 정보
- 금융 및 결제 정보
- 인증 정보
- 개인적인 커뮤니케이션
- 위치
- 웹 기록
- 사용자 활동

## Limited Use 확인

다음 세 항목을 모두 체크합니다.

- 승인된 사용 사례를 제외하고 사용자 데이터를 제3자에 판매 또는 전송하지 않음
- 항목의 전용 목적과 관련 없는 목적으로 사용자 데이터를 사용하거나 전송하지 않음
- 신용도 판단 또는 대출을 위해 사용자 데이터를 사용하거나 전송하지 않음

## 개인정보처리방침 URL

```text
https://igayowai.github.io/youtube-gpt-summary/privacy.html
```

## storage 사용 근거

storage 권한은 사용자의 확장 프로그램 설정을 브라우저에 저장하기 위해 필요합니다. 저장되는 설정에는 사용자 프롬프트, 프롬프트 모드, 출력 언어, ChatGPT 모델 선택, Gemini 모델 선택, 임시채팅 사용 여부, 자동 제출 여부, 빠른 사전 추출 설정이 포함됩니다. 또한 ChatGPT/Gemini 탭으로 프롬프트를 전달하기 위한 임시 요청 상태를 저장하는 데 사용됩니다.

## clipboardWrite 사용 근거

clipboardWrite 권한은 transcript/caption을 바탕으로 생성된 최종 프롬프트를 클립보드에 복사하기 위한 fallback 기능에 사용됩니다. ChatGPT 또는 Gemini 웹 UI 변경, 브라우저 포커스 제한, 자동 입력 실패가 발생할 경우 사용자가 프롬프트를 직접 붙여넣을 수 있도록 하기 위한 기능입니다.

## 호스트 권한 사용 근거

https://www.youtube.com/* 권한은 YouTube 영상 페이지에 요약 버튼을 표시하고, 접근 가능한 transcript/caption, 영상 제목, URL을 추출하기 위해 필요합니다.
https://chatgpt.com/* 및 https://chat.openai.com/* 권한은 생성된 프롬프트를 ChatGPT 입력창에 넣고, 설정에 따라 임시채팅 확인, 모델 선택, 자동 제출을 시도하기 위해 필요합니다.
https://gemini.google.com/* 권한은 생성된 프롬프트를 Gemini 입력창에 넣고, 설정에 따라 임시채팅 확인, 모델 선택, 자동 제출을 시도하기 위해 필요합니다.

## 원격 코드 사용 여부

선택 항목:

- 아니요, 원격 코드 권한을 사용하고 있지 않습니다.

근거 입력란은 비워둡니다.

