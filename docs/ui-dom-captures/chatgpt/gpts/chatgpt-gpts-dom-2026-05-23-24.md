# ChatGPT GPTs DOM Capture

Dates: 2026-05-23 to 2026-05-24 KST

Surface: GPTs/custom GPT conversation

Locale: ko-KR

Status: historical evidence, not current UI authority

Capture type:

- Exact visible-control outerHTML for the GPTs Pro row and selected composer pill.
- Sanitized outerHTML excerpt for the GPTs long-text composer card; unrelated descendants are elided with `...`.
- Selector and visible-row diagnostics for the GPT header model menu.
- Account details, GPT names, conversation text, and project-specific implementation notes are omitted.

Purpose:

- Preserve the distinct GPTs header model-selection route.
- Preserve a GPTs-only composer-card behavior without mixing it into new-chat selector assumptions.

## Header Model Menu Route

Observed route:

1. Open the GPT title/header menu under `header#page-header`.
2. Open the exact `모델` / `Model` submenu row.
3. Inspect live `[role="menuitemradio"][data-testid^="model-switcher-"]` rows.
4. Re-read the composer selected-state display after selection.

Historical top-menu text:

```text
모델
새 채팅
정보
사이드바에서 숨기기
링크 복사
피드백 보내기
GPT 검토하기
GPT 신고
공유하기
```

Historical model-row diagnostics:

```json
[
  { "testid": "model-switcher-gpt-5-5", "ariaChecked": "false", "text": "Instant\n모든 채팅" },
  { "testid": "model-switcher-gpt-5-5-thinking", "ariaChecked": "false", "text": "Thinking\n복잡한 질문" },
  { "testid": "model-switcher-gpt-5-5-pro", "ariaChecked": "false", "text": "Pro\n리서치급 인텔리전스" }
]
```

Versioned test IDs are historical hints only.

### GPTs Pro Row

```html
<div role="menuitemradio" tabindex="0" class="group __menu-item" data-testid="model-switcher-gpt-5-5-pro" aria-checked="false" data-orientation="vertical" data-radix-collection-item=""><div class="min-w-0"><span class="flex items-center gap-1">Pro</span><div class="not-group-data-disabled:text-token-text-tertiary leading-dense mb-0.5 text-xs whitespace-normal group-data-sheet-item:mt-0.5 group-data-sheet-item:mb-0 dark:group-hover:text-token-text-secondary dark:group-focus-visible:text-token-text-secondary dark:group-data-[highlighted]:text-token-text-secondary dark:group-data-[state=open]:text-token-text-secondary">리서치급 인텔리전스</div></div><div class="trailing" data-trailing-style="default"><span class="icon"></span></div></div>
```

### GPTs Selected Composer Pill

```html
<button type="button" class="__composer-pill group/pill" data-tone="accent"><span>Pro 확장 모드</span></button>
```

This selected label is historical. A current Pro-only surface may show exactly `Pro`, and a stale submenu snapshot may not match the composer. Live selected-state evidence wins.

## Long-Text Composer Card

Observed after a long prompt was inserted into a GPTs composer:

- `#prompt-textarea` could appear empty while the prompt was stored in an attachment-like card.
- The card was a composer-scoped `[role="group"][aria-label]` element.
- A text-display control restored the full text to `#prompt-textarea`.
- This state represented draft text, not a local uploaded file.

Sanitized outerHTML excerpt:

```html
<div class="relative flex group/file-tile text-token-text-primary relative inline-flex w-(--file-tile-width) min-w-(--file-tile-width) justify-between text-sm [--file-tile-image-size:3.625rem] [--file-tile-action-size:16px] [--file-tile-width:15rem] md:[--file-tile-width:20rem]" role="group" aria-label="Review turn long-tex..">...<div class="truncate font-semibold box-trim-text-0.25 ps-1.5 pt-px">Review turn long-tex..</div><button type="button" aria-label="텍스트 필드에 표시" name="expand-file-tile" class="tap-padding-auto group focus-visible:outline-token-text-primary interactive-label-tertiary text-token-text-tertiary entity-underline pointer-events-auto m-0.5 inline-flex items-center gap-0.5 rounded-md ps-0.5 text-xs focus-visible:no-underline focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-solid"><span>텍스트 필드에 표시</span>...</button>...</div>
```

Historical selector strategy:

```js
const composer = document.querySelector("#prompt-textarea");
const scope = composer?.closest("form") ||
  composer?.closest('[data-testid*="composer" i]') ||
  composer?.parentElement;

[...scope.querySelectorAll('[role="group"][aria-label]')]
  .filter((tile) => [...tile.querySelectorAll("button")].some((button) =>
    /텍스트\s*필드에\s*표시|show\s+in\s+text\s+field|display\s+in\s+text\s+field/i.test(
      `${button.getAttribute("aria-label") || ""} ${button.textContent || ""}`
    )
  ));
```

Require exactly one expected card and recover the full composer text before exact marker verification.

## Cross-Surface Attachment Button Note

The GPTs attachment button observed on 2026-05-23 matched the exact button markup stored in [the new-chat capture](../new-chat/chatgpt-temporary-chat-dom-2026-05-23.md#attachment-button). The duplicate HTML is intentionally not repeated here. That dated match does not authorize applying new-chat selectors to a current GPTs surface without live confirmation.
