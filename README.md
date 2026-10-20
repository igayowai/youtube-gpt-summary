# YouTube GPT Summary

유튜브 영상의 자막(스크립트)을 ChatGPT나 Gemini에 넘겨서 버튼 한 번으로 요약을 받는 크롬 확장 프로그램입니다.

<p align="center"><img src="docs/images/buttons.png" alt="Summarize with GPT, Summarize with Gemini 버튼" width="640"></p>

- 영상 페이지 오른쪽 아래에 이 두 버튼이 생깁니다.
- 누르면 새 탭에서 ChatGPT(또는 Gemini) 임시 채팅이 열리고, 자막 전체와 요약 프롬프트가 자동으로 입력·전송됩니다.
- 무료, 광고 없음, 별도 서버 없음. 자막은 브라우저 안에서 처리되어 사용자가 고른 ChatGPT/Gemini로만 갑니다.

> 크롬 웹스토어에는 올라가 있지 않아서, ZIP을 받아 직접 설치하는 방식입니다(아래 3분 설치).

## 설치

1. [최신 릴리스](https://github.com/igayowai/youtube-gpt-summary/releases/latest)에서 `youtube-gpt-summary-v….zip`을 받습니다.
2. 압축을 풉니다. **이 폴더는 지우지 말고 계속 둘 곳에 두세요.** 크롬이 이 폴더에서 확장을 읽습니다.
3. 크롬 주소창에 `chrome://extensions`를 입력합니다.
4. 오른쪽 위 **개발자 모드**를 켭니다.
5. **압축해제된 확장 프로그램을 로드합니다**를 누르고, 2번에서 푼 폴더(`manifest.json`이 들어 있는 폴더)를 고릅니다.
6. 이미 열려 있던 유튜브 탭은 한 번 새로고침합니다.

ChatGPT 또는 Gemini에 미리 로그인돼 있어야 합니다.

## 사용법

1. 유튜브 영상 페이지를 엽니다.
2. 오른쪽 아래 **Summarize with GPT** 또는 **Summarize with Gemini**를 누릅니다. 버튼이 초록색이면 자막을 미리 받아 둔 상태라 바로 열립니다(검정·파랑이면 아직 받는 중).

   <img src="docs/images/where-on-page.png" alt="유튜브 영상 화면 오른쪽 아래의 버튼 위치" width="600">

3. 새 탭에서 요약이 시작됩니다. 자동 전송이 안 됐으면 입력창에 들어간 내용을 그대로 보내면 됩니다(프롬프트는 클립보드에도 복사됩니다).

자막이 없는 영상은 탭을 열지 않고 버튼에 `Transcript unavailable`이 잠깐 뜹니다.

## 설정

`chrome://extensions`에서 이 확장의 **세부정보 → 확장 프로그램 옵션**으로 엽니다.

| 항목 | 내용 |
| --- | --- |
| 요약 방식 | 기본 요약 / 심화 요약(주장·근거·결론을 타임스탬프와 함께) / 직접 쓴 프롬프트 |
| 출력 언어 | 요약을 받을 언어(기본: 한국어) |
| GPT 추론 강도 | ChatGPT 모델은 그대로 두고 추론 강도만 맞춤. '선택 없음'이면 건드리지 않음 |
| Gemini 모델 / 사고 수준 | '선택 없음'이면 Gemini 기본값 그대로. 오류가 나면 '선택 없음'으로 |
| 빠른 사전 추출 | 영상에 들어가자마자 자막을 미리 받아 둬서 버튼 반응이 빨라짐 |
| ChatGPT 임시 채팅 | 기본 켜짐. 끄면 일반 채팅으로 보냄 |
| 자동 제출 | 기본 켜짐. 끄면 입력만 하고 전송은 직접 |

## 업데이트

새 ZIP을 받아 **같은 폴더에 덮어쓴 뒤** `chrome://extensions`에서 이 확장의 새로고침(↻) 버튼을 누르고, 열린 유튜브·ChatGPT·Gemini 탭을 새로고침합니다. 같은 폴더를 쓰면 설정이 그대로 남습니다.

## 알아둘 점

- ChatGPT·Gemini·유튜브 화면이 바뀌면 자동 입력이나 모델 선택이 잠시 안 될 수 있습니다. 그럴 땐 새 버전을 기다리거나, 입력창 내용을 직접 보내면 됩니다.
- 모든 영상에 자막이 있지는 않습니다.
- AI 요약은 틀릴 수 있습니다. 중요한 내용은 원본 영상으로 확인하세요.
- YouTube, Google, OpenAI와 관계없는 개인 도구입니다.

## 개인정보

개발자 서버로 아무것도 보내지 않습니다. 자세한 내용은 [개인정보처리방침](https://igayowai.github.io/youtube-gpt-summary/privacy.html)을 보세요.

문의: 408200jj@gmail.com · 개발 기록과 버전별 변경은 [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

---

## English

A Chrome extension that sends a YouTube video's transcript to ChatGPT or Gemini and gets a summary in one click. It adds **Summarize with GPT** / **Summarize with Gemini** buttons to the bottom-right of video pages; the prompt is filled in and sent in a temporary chat. Free, no ads, no developer server.

Install: download the ZIP from [Releases](https://github.com/igayowai/youtube-gpt-summary/releases/latest), unzip it to a folder you keep, open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**, and select that folder. Options are under the extension's **Details → Extension options**. [Privacy policy](https://igayowai.github.io/youtube-gpt-summary/privacy.html).

License: [LICENSE](LICENSE)
