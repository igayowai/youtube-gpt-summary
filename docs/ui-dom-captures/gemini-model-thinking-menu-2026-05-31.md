# Gemini Model And Thinking Menu Capture

Date: 2026-05-31 KST

Purpose: Preserve the Gemini UI DOM clues used for model and thinking-level selection.

Scope:
- Gemini model setting: `선택 없음`, `3.1 Flash-Lite`, `3.5 Flash`, `3.1 Pro`
- Gemini thinking-level setting: `선택 없음`, `Standard`, `Extended`

## Selected Pill Labels

Observed selected pill display combinations:

- `3.1 Flash-Lite` + `Standard`: `Flash-Lite`
- `3.1 Flash-Lite` + `Extended`: `Flash-Lite Extended`
- `3.5 Flash` + `Standard`: `Flash`
- `3.5 Flash` + `Extended`: `Flash Extended`
- `3.1 Pro` + `Standard`: `Pro`
- `3.1 Pro` + `Extended`: `Pro Extended`

## Input-Area Selector Button

Reduced capture:

```html
<button
  mat-button
  gemmenutrigger
  cdkoverlayorigin
  aria-label="모드 선택 도구 열기"
  data-test-id="bard-mode-menu-button"
  class="mdc-button mat-mdc-button-base input-area-switch mat-mdc-button mat-unthemed"
  tabindex="0"
  aria-disabled="false"
  aria-haspopup="true"
  aria-expanded="false">
  <span class="mdc-button__label">
    <div data-test-id="logo-pill-label-container" class="logo-pill-label-container input-area-switch-label">
      <span class="gds-body-m picker-primary-text">Flash</span>
      <mat-icon fonticon="keyboard_arrow_down" class="dropdown-icon"></mat-icon>
    </div>
  </span>
</button>
```

Implementation note:
- Prioritize `[data-test-id='bard-mode-menu-button']`.
- Reject unrelated controls such as pin/sidebar buttons even when they are visually near the composer.

## Header Selector Variant

Reduced capture:

```html
<bard-mode-switcher data-test-id="bard-mode-switcher" class="sparkle-in-header mode-picker-in-header">
  <gem-button
    cdkoverlayorigin
    type="textSecondary"
    aria-label="모드 선택 도구 열기"
    data-test-id="bard-mode-menu-button">
    <button class="mdc-button mat-mdc-button-base">
      <span class="mdc-button__label">
        <div data-test-id="logo-pill-label-container" class="logo-pill-label-container thinking-level-enabled lm-redesign-enabled">
          <span class="gds-body-l picker-primary-text">Gemini</span>
          <span class="gds-body-l picker-secondary-text">Pro</span>
          <mat-icon data-mat-icon-name="keyboard_arrow_down"></mat-icon>
        </div>
      </span>
    </button>
  </gem-button>
</bard-mode-switcher>
```

## Model Menu Rows

The menu is made of `gem-menu-item` rows. Captured row diagnostics showed labels and mode ids like:

```text
3.1 Flash-Lite | 가장 빠른 답변 제공 |  | 8c46e95b1a07cecc | false |  | ng-star-inserted
3.5 Flash | 무엇이든 도움을 받으세요 |  | 56fdd199312815e2 | false |  | ng-star-inserted
3.1 Pro | 고급 수학 및 코딩 |  | e6fa609c3fa255c0 | true |  | selected ng-star-inserted
사고 수준 | Standard | thinking_level |  | false |  | ng-star-inserted
```

Reduced shape:

```html
<gem-menu-item
  role="menuitem"
  data-test-id="bard-mode-option-e6fa609c3fa255c0"
  data-mode-id="e6fa609c3fa255c0"
  data-active="true"
  class="selected">
  <gem-menu-item-content class="selected checkmark-only active">
    <div class="leading-container">
      <mat-icon data-mat-icon-name="check"></mat-icon>
    </div>
    <div class="label-container">
      <span class="label">3.1 Pro</span>
      <div class="sublabel">고급 수학 및 코딩</div>
    </div>
  </gem-menu-item-content>
</gem-menu-item>
```

## Thinking-Level Row And Expanded Options

Collapsed row diagnostics:

```text
사고 수준 | Standard | thinking_level |  | false |  | ng-star-inserted
```

Expanded diagnostics:

```text
사고 수준 | Standard | thinking_level |  | true | true | ng-star-inserted
Standard | 대부분의 질문에 적합 |  |  | false |  | selected ng-star-inserted
Extended | 복잡한 문제 해결 |  |  | false |  | ng-star-inserted
```

Reduced expanded shape:

```html
<gem-menu-item role="menuitem" value="thinking_level" aria-expanded="true" class="expandable expanded">
  <gem-menu-item-content class="active">
    <div class="label-container">
      <span class="label">사고 수준</span>
      <div class="sublabel">Standard</div>
    </div>
  </gem-menu-item-content>
  <div class="expand-content">
    <gem-menu-item role="menuitem" class="selected">
      <span class="label">Standard</span>
      <div class="sublabel">대부분의 질문에 적합</div>
    </gem-menu-item>
    <gem-menu-item role="menuitem">
      <span class="label">Extended</span>
      <div class="sublabel">복잡한 문제 해결</div>
    </gem-menu-item>
  </div>
</gem-menu-item>
```

## Current Code Touchpoints

- `src/shared/constants.js`: `GEMINI_MODELS`, `GEMINI_THINKING_LEVELS`
- `src/content/gemini.js`: `selectGeminiModelIfRequested`, model menu root detection, thinking-level expansion and option selection
