# Gemini 사고 수준 menu, 2026-10-20

- Service: gemini.google.com/app, Korean UI, logged-in account, Chrome 155. Mode picker opened by hand; nothing was sent.
- Kind: reduced sketch from live DOM (attributes copied, class/style/jslog/svg removed).
- Change since [2026-10-19](../live-ui-2026-10-19.md): the 사고 수준 rows now read **낮음 / 보통 / 높음** (descriptions unchanged: 빠르고 효율적 / 균형 잡힌 깊이 / 매우 철저함). On 2026-10-19 they read 최저가 / 보통 / 최고가.
- Target behavior: choose the thinking level from settings (install default 높음) and confirm it on the pill before auto-submit.

## Observed

| Element | Observed |
|---|---|
| Mode pill | `button` with `aria-label="모드 선택 도구 열기, 현재 Argon 높음 모드 사용 중"`; `[data-test-id=logo-pill-label-container]` holds `.picker-primary-text` = `Argon` and `.picker-secondary-text` = `높음`. With 낮음 selected the pill shows only `Argon` (aria-label `현재 Argon 모드 사용 중`). |
| Model rows | `gem-menu-item[role=menuitem][data-test-id^=bard-mode-option-]`: 3.5 Flash-Lite, 3.8 Flash, 3.1 Pro, 4 Argon, each with a description line. |
| 사고 수준 row | `gem-menu-item[role=menuitem]`, text `사고 수준` only (no current-value sublabel); opens a side submenu. |
| Level rows | `gem-menu-item[role=menuitem][data-active=false]`; `<span> 낮음 </span><div>빠르고 효율적</div>`. The checked row has `gem-icon[aria-label="선택됨"]` with a `check` mat-icon; `data-active` stays `false`. |

## Never-shown tab (0x0 viewport)

A Gemini tab opened by the extension but never shown (viewport 0x0) first renders a different pill: `[data-test-id=logo-pill-label-container]` with classes `lm-redesign-enabled thinking-level-enabled`, `.picker-primary-text` = `Gemini`, `.picker-secondary-text` = `Argon`, button `aria-label="모드 선택 도구 열기, 현재 Gemini Argon 모드 사용 중"` and no `data-test-id` on the button. The level is not shown. In this layout the 사고 수준 rows open inline under the 사고 수준 row (`gem-menu-item[value=thinking_level].expandable`, `aria-expanded` false/true, rows inside `.expand-content`). Each click toggles it (2026-10-21: one click opens, a second closes). After a level is chosen the pill re-renders as the normal `bard-mode-menu-button` pill (`Argon 높음`). v0.1.113 reads the model from the second part and confirms the level only on the re-rendered pill.

## Ignore

- Composer tools, the 채팅/작업 chips, 앱 설치.

## Code

`GEMINI_THINKING_LEVELS` in `src/shared/constants.js` matches 낮음/높음 first and keeps 최저가/최고가 as fallbacks. Tests: `docs/verification/gemini-selector.test.cjs` (2026-10-20 cases).
