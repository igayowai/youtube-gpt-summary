# ChatGPT GPTs Model And Effort Menu Capture

Date: 2026-06-14 KST

Surface: GPTs/custom GPT conversation

Status: historical evidence, not current UI authority

Capture type:

- Reduced selector and visible-label sketch derived from user-supplied screenshots.
- Exact outerHTML for these English controls was not supplied.
- Earlier exact historical GPTs evidence is stored in [chatgpt-gpts-dom-2026-05-23-24.md](chatgpt-gpts-dom-2026-05-23-24.md).
- Account details and conversation content are omitted.

Purpose:

- Preserve the distinct GPTs model-selection surface.
- Prevent new-chat `Intelligence` selectors and labels from being applied to GPTs conversations.

## Header Model Menu

Observed visible labels:

```text
Search Mode +
Model
Latest • 5.5
Instant
For everyday chats
Thinking
For complex questions
Pro
Research-grade intelligence
Configure...
```

Historical selector hints:

```js
header#page-header [aria-haspopup="menu"]
[role="menuitem"][aria-haspopup="menu"]
[role="menuitemradio"][data-testid^="model-switcher-"]
```

Guardrails:

- Match the header submenu row by exact visible text `Model`.
- Select model-family rows only from `role="menuitemradio"`.
- Treat versioned `data-testid` values as historical hints, not permanent identities.
- Do not click `Latest • 5.5` or `Configure...`.
- Re-read the live composer selected-state display after model selection.

## Historical Pro Thinking Effort Menu

Observed visible labels:

```text
Pro thinking effort
Standard
Extended
```

Guardrails:

- This was a separate effort menu, not the GPT header model-family menu.
- Require live `Pro` model-family evidence before accepting a separate effort.
- Do not require `Extended` unless the user explicitly requested it and the live UI exposes it.

## Current Exact OuterHTML Still Needed

- GPT title/header menu trigger
- Header `Model` submenu row
- Current model-family rows
- Current composer Pro-effort trigger
- Current effort rows, when the surface exposes them
