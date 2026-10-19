# ChatGPT Temporary New-Chat DOM Capture

Date: 2026-05-23 KST

Surface: Temporary Chat new-chat composer

Locale: ko-KR

Status: historical evidence, not current UI authority

Capture type:

- Exact visible-control outerHTML captured through Chrome page DOM evaluation.
- Each HTML block is preserved as captured for its named control.
- Dynamic IDs, class names, sprite URLs, labels, and versioned test IDs are historical.

Purpose:

- Preserve exact composer, older full model-picker, and attachment-menu evidence that previously lived in the quick selector guide.
- Keep this new-chat evidence separate from GPTs/custom GPT controls.

## Composer Controls

### Prompt Textbox

```html
<div contenteditable="true" translate="no" class="ProseMirror" id="prompt-textarea" data-virtualkeyboard="true" role="textbox" aria-multiline="true" aria-label="ChatGPT와 채팅"><p data-placeholder="무엇이든 물어보세요" class="placeholder"><br class="ProseMirror-trailingBreak"></p></div>
```

### Attachment Button

```html
<button type="button" class="composer-btn" data-testid="composer-plus-btn" aria-label="파일 추가 및 기타" id="composer-plus-btn" aria-haspopup="menu" aria-expanded="false" data-state="closed"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-hidden="true" class="icon"><use href="/cdn/assets/sprites-core-2cb00440.svg#6be74c" fill="currentColor"></use></svg></button>
```

### Instant Selected Model Pill

```html
<button type="button" class="__composer-pill __composer-pill--neutral group/pill" data-tone="neutral" id="radix-_r_s_" aria-haspopup="menu" aria-expanded="false" data-state="closed"><span class="max-w-40 truncate [[data-collapse-labels]_&amp;]:sr-only">Instant</span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" aria-hidden="true" class="icon-sm -me-0.5 h-3.5 w-3.5 text-token-text-tertiary" inert=""><use href="/cdn/assets/sprites-core-2cb00440.svg#ba3792" fill="currentColor"></use></svg></button>
```

### Pro Extended Selected Model Pill

```html
<button type="button" class="__composer-pill __composer-pill--neutral group/pill" data-tone="neutral" id="radix-_r_1s_" aria-haspopup="menu" aria-expanded="false" data-state="closed"><span class="max-w-40 truncate [[data-collapse-labels]_&amp;]:sr-only">Pro 확장 모드</span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" aria-hidden="true" class="icon-sm -me-0.5 h-3.5 w-3.5 text-token-text-tertiary" inert=""><use href="/cdn/assets/sprites-core-2cb00440.svg#ba3792" fill="currentColor"></use></svg></button>
```

### Dictation Button

```html
<button aria-label="받아쓰기 시작" type="button" class="composer-btn h-9 min-h-9 w-9 min-w-9" aria-describedby="_r_18_" interestfor="_r_18_" style="anchor-name: --anchor-_r_18_;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-label="" class="icon" font-size="inherit"><use href="/cdn/assets/sprites-core-2cb00440.svg#29f921" fill="currentColor"></use></svg></button>
```

### Voice Button In Empty Composer

```html
<button aria-describedby="_r_19_" interestfor="_r_19_" type="button" aria-label="Voice 시작" class="composer-submit-button-color text-submit-btn-text keyboard-focused:focus-ring relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:opacity-70 disabled:text-[#f4f4f4] disabled:opacity-30" style="anchor-name: --anchor-_r_19_; view-transition-name: var(--vt-composer-speech-button);"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-hidden="true" class="h-5 w-5"><use href="/cdn/assets/sprites-core-2cb00440.svg#f8aa74" fill="currentColor"></use></svg></button>
```

### Send Button With Draft Text

```html
<button aria-describedby="_r_8d_" interestfor="_r_8d_" id="composer-submit-button" aria-label="프롬프트 보내기" data-testid="send-button" class="composer-submit-btn composer-submit-button-color h-9 w-9" style="anchor-name: --anchor-_r_8d_;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-hidden="true" class="icon"><use href="/cdn/assets/sprites-core-2cb00440.svg#01bab7" fill="currentColor"></use></svg></button>
```

### Active Temporary Chat Toggle

```html
<button class="text-token-text-primary contrast-high:not-dark:keyboard-focused:focus-ring no-draggable hover:bg-token-surface-hover keyboard-focused:bg-token-surface-hover touch:h-10 touch:w-10 flex h-9 w-9 items-center justify-center rounded-lg outline-none disabled:opacity-50 rounded-full!" aria-label="임시 채팅 끄기"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-hidden="true" class="icon"><use href="/cdn/assets/sprites-core-2cb00440.svg#6eabdf" fill="currentColor"></use></svg></button>
```

## Older Full Model Picker

The following exact rows came from an older full model-picker opened in the same Temporary Chat surface. They are not the later `Intelligence` menu and are not current GPT-5.6 requirements.

### Instant Row

```html
<div role="menuitemradio" tabindex="0" class="group __menu-item hover:bg-(--menu-item-highlighted)! focus:bg-(--menu-item-highlighted)! data-highlighted:bg-(--menu-item-highlighted)! data-[state=active]:bg-(--menu-item-highlighted)!" aria-checked="true" data-testid="model-switcher-gpt-5-5" data-orientation="vertical" data-radix-collection-item=""><span class="flex min-w-0 items-center gap-1">Instant</span></div>
```

The same row was also captured unselected:

```html
<div role="menuitemradio" tabindex="0" class="group __menu-item hover:bg-(--menu-item-highlighted)! focus:bg-(--menu-item-highlighted)! data-highlighted:bg-(--menu-item-highlighted)! data-[state=active]:bg-(--menu-item-highlighted)!" aria-checked="false" data-testid="model-switcher-gpt-5-5" data-orientation="vertical" data-radix-collection-item=""><span class="flex min-w-0 items-center gap-1">Instant</span></div>
```

### Thinking Extended Row

```html
<div role="menuitemradio" tabindex="0" class="group __menu-item group/model-picker-thinking-effort-menu-item pe-12! hover:bg-(--menu-item-highlighted)! focus:bg-(--menu-item-highlighted)! data-highlighted:bg-(--menu-item-highlighted)! data-[state=active]:bg-(--menu-item-highlighted)! group-hover/model-picker-thinking-effort-row:[&amp;:not(:disabled):not([data-disabled])]:bg-(--menu-item-highlighted)! group-focus-within/model-picker-thinking-effort-row:[&amp;:not(:disabled):not([data-disabled])]:bg-(--menu-item-highlighted)! group-data-[effort-menu-open]/model-picker-thinking-effort-row:[&amp;:not(:disabled):not([data-disabled])]:bg-(--menu-item-highlighted)! group-has-[[data-model-picker-thinking-effort-action]:hover]/model-picker-thinking-effort-row:[&amp;:not(:disabled):not([data-disabled])]:bg-(--menu-item-highlighted)! group-has-[[data-model-picker-thinking-effort-action]:focus-visible]/model-picker-thinking-effort-row:[&amp;:not(:disabled):not([data-disabled])]:bg-(--menu-item-highlighted)!" aria-checked="false" data-model-picker-thinking-effort-menu-item="true" data-testid="model-switcher-gpt-5-5-thinking" data-orientation="vertical" data-radix-collection-item=""><span class="flex min-w-0 items-center gap-1">Thinking<span class="text-token-text-tertiary items-center inline-flex" data-model-picker-thinking-effort-label-extra="true">• 확장</span></span></div>
```

### Pro Extended Row

```html
<div role="menuitemradio" tabindex="0" class="group __menu-item group/model-picker-thinking-effort-menu-item pe-12! hover:bg-(--menu-item-highlighted)! focus:bg-(--menu-item-highlighted)! data-highlighted:bg-(--menu-item-highlighted)! data-[state=active]:bg-(--menu-item-highlighted)! group-hover/model-picker-thinking-effort-row:[&amp;:not(:disabled):not([data-disabled])]:bg-(--menu-item-highlighted)! group-focus-within/model-picker-thinking-effort-row:[&amp;:not(:disabled):not([data-disabled])]:bg-(--menu-item-highlighted)! group-data-[effort-menu-open]/model-picker-thinking-effort-row:[&amp;:not(:disabled):not([data-disabled])]:bg-(--menu-item-highlighted)! group-has-[[data-model-picker-thinking-effort-action]:hover]/model-picker-thinking-effort-row:[&amp;:not(:disabled):not([data-disabled])]:bg-(--menu-item-highlighted)! group-has-[[data-model-picker-thinking-effort-action]:focus-visible]/model-picker-thinking-effort-row:[&amp;:not(:disabled):not([data-disabled])]:bg-(--menu-item-highlighted)!" aria-checked="false" data-model-picker-thinking-effort-menu-item="true" data-testid="model-switcher-gpt-5-5-pro" data-orientation="vertical" data-radix-collection-item=""><span class="flex min-w-0 items-center gap-1">Pro<span class="text-token-text-tertiary items-center inline-flex" data-model-picker-thinking-effort-label-extra="true">• 확장</span></span></div>
```

The same row was also captured selected:

```html
<div role="menuitemradio" tabindex="0" class="group __menu-item group/model-picker-thinking-effort-menu-item pe-12! hover:bg-(--menu-item-highlighted)! focus:bg-(--menu-item-highlighted)! data-highlighted:bg-(--menu-item-highlighted)! data-[state=active]:bg-(--menu-item-highlighted)! group-hover/model-picker-thinking-effort-row:[&amp;:not(:disabled):not([data-disabled])]:bg-(--menu-item-highlighted)! group-focus-within/model-picker-thinking-effort-row:[&amp;:not(:disabled):not([data-disabled])]:bg-(--menu-item-highlighted)! group-data-[effort-menu-open]/model-picker-thinking-effort-row:[&amp;:not(:disabled):not([data-disabled])]:bg-(--menu-item-highlighted)! group-has-[[data-model-picker-thinking-effort-action]:hover]/model-picker-thinking-effort-row:[&amp;:not(:disabled):not([data-disabled])]:bg-(--menu-item-highlighted)! group-has-[[data-model-picker-thinking-effort-action]:focus-visible]/model-picker-thinking-effort-row:[&amp;:not(:disabled):not([data-disabled])]:bg-(--menu-item-highlighted)!" aria-checked="true" data-model-picker-thinking-effort-menu-item="true" data-testid="model-switcher-gpt-5-5-pro" data-orientation="vertical" data-radix-collection-item=""><span class="flex min-w-0 items-center gap-1">Pro<span class="text-token-text-tertiary items-center inline-flex" data-model-picker-thinking-effort-label-extra="true">• 확장</span></span></div>
```

### Configure Row

```html
<div role="menuitem" tabindex="0" class="group __menu-item" data-testid="model-configure-modal" data-orientation="vertical" data-radix-collection-item=""><div class="flex min-w-0 grow items-center gap-2.5"><div class="truncate">구성…</div></div></div>
```

Historical trailing-control selectors:

```text
[data-model-picker-thinking-effort-action="true"]
button[aria-label="연산량"]
model-switcher-gpt-5-5-thinking-thinking-effort
model-switcher-gpt-5-5-pro-thinking-effort
```

## Attachment Menu

### Hidden File Input

```html
<input class="sr-only select-none" tabindex="-1" aria-hidden="true" id="upload-files" multiple="" type="file" style="border: 0px; clip: rect(0px, 0px, 0px, 0px); clip-path: inset(50%); height: 1px; margin: 0px -1px -1px 0px; overflow: hidden; padding: 0px; position: absolute; width: 1px; white-space: nowrap;">
```

### Hidden Photo Input

```html
<input class="sr-only select-none" tabindex="-1" aria-hidden="true" id="upload-photos" data-testid="upload-photos-input" accept="image/*" multiple="" type="file">
```

### Add Photos And Files Row

```html
<div role="menuitem" tabindex="0" class="group __menu-item" data-orientation="vertical" data-radix-collection-item=""><div class="flex min-w-0 items-center gap-1.5"><div class="flex items-center justify-center [opacity:var(--menu-item-icon-opacity,1)] icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-hidden="true" class="icon"><use href="/cdn/assets/sprites-core-2cb00440.svg#712359" fill="currentColor"></use></svg></div><div class="flex min-w-0 grow items-center gap-2.5"><div class="truncate">사진 및 파일 추가</div></div></div><div class="trailing highlight text-token-text-tertiary"><div class="box-trim-text-0.25 inline-flex whitespace-pre *:inline-flex *:font-sans *:not-last:after:px-0.5 *:not-last:after:content-['+'] touch:hidden"><kbd aria-label="Ctrl"><span class="min-w-[1em]">Ctrl</span></kbd><kbd><span class="min-w-[1em]">U</span></kbd></div></div></div>
```

### Recent Files Row

```html
<div role="menuitem" id="radix-_r_82_" aria-haspopup="menu" aria-expanded="false" aria-controls="radix-_r_81_" data-state="closed" tabindex="0" data-has-submenu="" class="group __menu-item" data-orientation="vertical" data-radix-collection-item=""><div class="flex min-w-0 items-center gap-1.5"><div class="flex items-center justify-center [opacity:var(--menu-item-icon-opacity,1)] icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-hidden="true" class="icon"><use href="/cdn/assets/sprites-core-2cb00440.svg#a35fbc" fill="currentColor"></use></svg></div><span class="line-clamp-1 text-ellipsis">최근 파일</span></div><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" aria-hidden="true" data-rtl-flip="" class="icon-sm -me-0.25"><use href="/cdn/assets/sprites-core-2cb00440.svg#d3876b" fill="currentColor"></use></svg></div>
```

### Image Creation Toggle

```html
<div role="menuitemradio" aria-checked="false" tabindex="0" class="group __menu-item" data-state="unchecked" data-orientation="vertical" data-radix-collection-item=""><div class="flex min-w-0 items-center gap-1.5"><div class="flex items-center justify-center [opacity:var(--menu-item-icon-opacity,1)] icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="icon" aria-label=""><use href="/cdn/assets/sprites-core-2cb00440.svg#266724" fill="currentColor"></use></svg></div><div class="flex min-w-0 grow items-center gap-2.5"><div class="truncate">이미지 만들기</div></div></div><div class="trailing" data-trailing-style="radio-check"><div class="icon-sm group-radix-state-checked:hidden"></div></div></div>
```

### Web Search Toggle

```html
<div role="menuitemradio" aria-checked="false" tabindex="0" class="group __menu-item" data-state="unchecked" data-orientation="vertical" data-radix-collection-item=""><div class="flex min-w-0 items-center gap-1.5"><div class="flex items-center justify-center [opacity:var(--menu-item-icon-opacity,1)] icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="icon" aria-label=""><use href="/cdn/assets/sprites-core-2cb00440.svg#6b0d8c" fill="currentColor"></use></svg></div><div class="flex min-w-0 grow items-center gap-2.5"><div class="truncate">웹 검색</div></div></div><div class="trailing" data-trailing-style="radio-check"><div class="icon-sm group-radix-state-checked:hidden"></div></div></div>
```

### More Row

```html
<div role="menuitem" id="radix-_r_88_" aria-haspopup="menu" aria-expanded="false" aria-controls="radix-_r_87_" data-state="closed" tabindex="0" data-has-submenu="" class="group __menu-item" data-orientation="vertical" data-radix-collection-item=""><div class="flex min-w-0 items-center gap-1.5"><div class="flex items-center justify-center [opacity:var(--menu-item-icon-opacity,1)] icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-hidden="true" class="icon"><use href="/cdn/assets/sprites-core-2cb00440.svg#f6d0e2" fill="currentColor"></use></svg></div><div class="flex min-w-0 grow items-center gap-2.5"><div class="truncate">더 보기</div></div></div><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" aria-hidden="true" data-rtl-flip="" class="icon-sm -me-0.25"><use href="/cdn/assets/sprites-core-2cb00440.svg#d3876b" fill="currentColor"></use></svg></div>
```

### Projects Row

```html
<div role="menuitem" id="radix-_r_8b_" aria-haspopup="menu" aria-expanded="false" aria-controls="radix-_r_8a_" data-state="closed" tabindex="0" data-has-submenu="" class="group __menu-item" data-orientation="vertical" data-radix-collection-item=""><div class="flex min-w-0 items-center gap-1.5"><div class="flex items-center justify-center [opacity:var(--menu-item-icon-opacity,1)] icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-hidden="true" class="icon"><use href="/cdn/assets/sprites-core-2cb00440.svg#61ee0c" fill="currentColor"></use></svg></div><div class="flex min-w-0 grow items-center gap-2.5"><div class="truncate">프로젝트</div></div></div><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" aria-hidden="true" data-rtl-flip="" class="icon-sm -me-0.25"><use href="/cdn/assets/sprites-core-2cb00440.svg#d3876b" fill="currentColor"></use></svg></div>
```

## Dated Behavior Notes

- `Ctrl+Shift+M` opened the older full model picker in this captured state.
- `Ctrl+U` was displayed on the upload row and successfully opened the file chooser.
- The visible attachment-menu path was preferred over generic hidden file inputs.
- During generation the send-control area exposed a stop state; after completion the stop state disappeared and a response-copy action appeared.

These observations are historical. Revalidate every shortcut, role, and selected state against the live surface.
