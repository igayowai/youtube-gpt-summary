# ChatGPT Reasoning Menu Capture

Date: 2026-06-01 KST

Surface: normal or Temporary Chat new-chat composer

Status: historical evidence, not current UI authority

Capture type:

- Reduced selector sketch reconstructed from visible UI evidence.
- Exact outerHTML was not supplied for this capture.
- The English screenshot-derived follow-up is in [chatgpt-english-ui-2026-06-14.md](chatgpt-english-ui-2026-06-14.md).

Purpose:

- Preserve the dated Korean reasoning-menu structure.
- Keep the reasoning menu separate from the nearby model-version submenu.
- Provide historical selector evidence for regression diagnosis.

## Composer Pill

Observed reduced shape:

```html
<button
  aria-expanded="false"
  aria-haspopup="menu"
  data-state="closed"
  type="button"
  class="__composer-pill __composer-pill--neutral group/pill"
  data-tone="neutral">
  <span class="flex max-w-40 min-w-0 items-center gap-1">
    <span class="text-token-text-tertiary min-w-0 truncate">높음</span>
  </span>
</button>
```

Historical selector hints:

- Prefer `button.__composer-pill[aria-haspopup='menu']`.
- Both `data-tone="accent"` and `data-tone="neutral"` were observed.
- Re-read the live selected label after any interaction.

## Main Reasoning Menu

Observed reduced shape:

```html
<div role="menu" data-state="open" data-radix-menu-content>
  <div data-testid="composer-intelligence-picker-content">
    <div class="__menu-label">추론</div>
    <div role="group">
      <div role="menuitemradio" aria-checked="false" data-state="unchecked">
        <span class="truncate">즉시</span>
      </div>
      <div role="menuitemradio" aria-checked="false" data-state="unchecked">
        <span class="truncate">중간</span>
      </div>
      <div role="menuitemradio" aria-checked="false" data-state="unchecked">
        <span class="truncate">높음</span>
      </div>
      <div role="menuitemradio" aria-checked="false" data-state="unchecked">
        <span class="truncate">매우 높음</span>
      </div>
    </div>
  </div>
</div>
```

Observed guardrails:

- Rows used `role="menuitemradio"` and could be `div` elements.
- `매우 높음` contains `높음`; exact or ordered matching is required.
- Click only a live role-bearing row or its verified actionable ancestor.

## Historical Pro Variant Submenu

Observed labels:

- `Pro 기본`
- `Pro 확장`

Reduced row shape:

```html
<div role="menuitemradio" aria-checked="true" data-state="checked">
  <span class="truncate">Pro 확장</span>
  <div data-composer-intelligence-pro-effort-action="true"></div>
</div>
```

Reduced submenu shape:

```html
<div role="menu" data-state="open">
  <div role="menuitemradio" aria-checked="false" data-state="unchecked">
    <span class="truncate">Pro 기본</span>
  </div>
  <div role="menuitemradio" aria-checked="true" data-state="checked">
    <span class="truncate">Pro 확장</span>
  </div>
</div>
```

These labels and the trailing-control shape are historical. Do not require them on a current Pro-only surface without live confirmation.

## Historical Model-Version Submenu

The same dated menu exposed a separate `GPT-5.5` submenu with values such as `5.5`, `5.4`, `5.3`, `5.2`, `4.5`, and `o3`.

```html
<div role="menuitem" aria-haspopup="menu" data-state="open" data-has-submenu>
  <span class="truncate">GPT-5.5</span>
</div>
```

Treat this only as a guardrail: model-version submenu rows are not reasoning choices.
