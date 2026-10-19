# ChatGPT New-Chat Model Picker: 2026-09-19

- Service/surface: signed-in Chrome, normal new-chat with Temporary Chat active, not GPTs.
- Date: 2026-09-19 KST.
- Target: model identification and five-position effort selection; no prompt sends.
- Capture type: exact outerHTML for the row below; remaining sections summarize observed UI behavior.
- Initial/final state: Latest / Pro, closed pill `6 Pro`. Restored after testing.

## Exact GPT-5.5 Radio OuterHTML

Captured with the advanced model view open, GPT-5.6 Sol selected and GPT-5.5 unchecked:

```html
<div role="menuitemradio" aria-checked="false" tabindex="0" class="group __menu-item" data-state="unchecked" data-orientation="vertical" data-radix-collection-item=""><div class="min-w-0"><div class="flex min-w-0 grow items-center gap-2.5"><div class="truncate">GPT-5.5</div></div><div class="not-group-data-disabled:text-token-text-tertiary leading-dense mb-0.5 text-xs whitespace-normal group-data-sheet-item:mt-0.5 group-data-sheet-item:mb-0 dark:group-hover:text-token-text-secondary dark:group-focus-visible:text-token-text-secondary dark:group-data-[highlighted]:text-token-text-secondary dark:group-data-[state=open]:text-token-text-secondary">10월 14일 지원 종료</div></div><div class="trailing flex min-w-4 shrink-0 items-center justify-center self-stretch" data-trailing-style="radio-check"><div class="icon-sm group-radix-state-checked:hidden"></div></div></div>
```

The accessible name separates the notice with a space; raw `textContent` is `GPT-5.510월 14일 지원 종료`. The notice is observed display text, not independently verified product policy. Do not equate whole-row text with the model's primary label.

## Browser Verification

- Ctrl+Shift+M opened the menu. This does not prove extension-generated KeyboardEvents work.
- Latest: 4 -> 3 -> 2 -> 1 -> 0; Sol: 0 -> 1 -> 2 -> 3 -> 4; GPT-5.5: 4 -> 3 -> 2 -> 1 -> 0. Each model's checked radio and slider value were read at every step.
- All three announced: 0 Instant, 1 중간, 2 High, 3 매우 높음, 4 Pro; bounds 0..4. Total 15 model/effort states observed, not 15 extension submissions.
- Slider's inner `role="slider"` element is `aria-hidden="true"` and tabindex -1. Semantic slider lookup timed out while DOM showed it present. The visible enclosing `menuitem` named `성능` accepted ArrowLeft/ArrowRight. Read the DOM value; do not interpret semantic lookup timeout as missing slider.
- Simple/advanced panels retain their prior test IDs and active/inert distinction. Inactive model rows remain in DOM; use the active view for interaction.
- Consumer actual helper reproduction detected GPT-5.5 without the notice but returned no family with the captured whole-row text. [Consumer report](C:/Users/USER/Documents/Claude/youtube_summary_GPT/verification/live-revalidation-2026-09-19.md).

No GPTs, English-only UI, backend model identity, model quality, or sustained stability claims.
