# Chrome Web Store 대시보드 입력값 v0.1.114 (한국어)

기존 항목(ID `biacophadljoljbbnllfgebdehdghehf`, 2026-05 v0.1.81 미등록 게시)에 새 패키지를 올려 덮어쓴다. 이름은 패키지의 manifest에서 "AI Summary for YouTube"로 바뀐다. 공개 범위는 전체 공개(2026-10-21 사용자 결정). 소개글은 [chrome-web-store-listing-ko.md](chrome-web-store-listing-ko.md)의 Short/Detailed Description을 쓴다.

## 패키지

- 업로드: `dist/youtube-gpt-summary-v0.1.114.zip`

## 스토어 등록정보

- 카테고리: 생산성(Productivity)
- 언어: 한국어
- 아이콘: 패키지의 `assets/icon128.png` (재생 삼각형 + AI, 보라→파랑. 원본 `icon.svg`). YouTube 로고 색·모양을 쓰지 않는다.
- 스크린샷: 1280×800, 개인 정보(계정 이메일, 북마크, 다른 탭)가 보이지 않게.

## 개인정보 보호

### 전용 목적 설명

AI Summary for YouTube는 사용자가 YouTube 영상 페이지에서 요약 버튼(GPT, Gemini, Claude)을 누르면 해당 영상에서 접근 가능한 자막/스크립트와 영상 제목, URL을 추출해 사용자가 선택한 프롬프트와 함께 ChatGPT, Gemini 또는 Claude 입력창에 넣도록 돕는 확장 프로그램입니다. 가능한 경우 임시 채팅(Claude는 시크릿 대화)을 사용하고, 설정에 따라 추론 강도·모델·사고 수준·노력 수준 선택과 자동 제출을 시도합니다. 접근 가능한 자막/스크립트가 없으면 요청을 보내지 않습니다. 개발자 서버로 데이터를 보내지 않으며, YouTube 자막 기반 요약을 돕는 단일 목적만 수행합니다.

### storage 사용 근거

사용자의 확장 프로그램 설정(사용자 프롬프트, 요약 방식, 출력 언어, ChatGPT 추론 강도, Gemini 모델·사고 수준, Claude 모델·노력 수준, 임시 채팅·Claude 시크릿 사용 여부, 자동 제출, 빠른 사전 추출)을 브라우저에 저장하고, YouTube 탭에서 ChatGPT·Gemini·Claude 탭으로 프롬프트를 넘기기 위한 임시 요청 상태를 저장하는 데 사용합니다.

### clipboardWrite 사용 근거

자막/스크립트로 만든 최종 프롬프트를 클립보드에 복사하는 대비 기능에 사용합니다. 웹 화면 변경이나 브라우저 포커스 제한으로 자동 입력이 실패하면 사용자가 직접 붙여넣을 수 있게 하기 위한 것입니다.

### 호스트 권한 사용 근거

https://www.youtube.com/* 권한은 YouTube 영상 페이지에 요약 버튼을 표시하고, 접근 가능한 자막/스크립트, 영상 제목, URL을 추출하기 위해 필요합니다.
https://chatgpt.com/* 및 https://chat.openai.com/* 권한은 생성된 프롬프트를 ChatGPT 입력창에 넣고, 설정에 따라 임시 채팅 확인, 추론 강도 선택, 자동 제출을 시도하기 위해 필요합니다.
https://gemini.google.com/* 권한은 생성된 프롬프트를 Gemini 입력창에 넣고, 설정에 따라 임시 채팅 확인, 모델·사고 수준 선택, 자동 제출을 시도하기 위해 필요합니다.
https://claude.ai/* 권한은 생성된 프롬프트를 Claude 입력창에 넣고, 설정에 따라 시크릿 대화 확인, 모델·노력 수준 선택, 자동 제출을 시도하기 위해 필요합니다.

### 원격 코드 사용 여부

아니요, 원격 코드를 사용하고 있지 않습니다.

### 사용자 데이터 사용

선택: 웹사이트 콘텐츠. 나머지(개인 식별 정보, 건강, 금융·결제, 인증 정보, 개인 커뮤니케이션, 위치, 웹 기록, 사용자 활동)는 선택하지 않는다.

Limited Use 확인 세 항목 모두 체크.

### 개인정보처리방침 URL

```text
https://igayowai.github.io/youtube-gpt-summary/privacy.html
```

## 배포

- 공개 상태: 공개(Public)
- 지역: 모든 지역
