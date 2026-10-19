# ChatGPT Model Picker, 2026-09-25

Service: ChatGPT, signed-in Chrome, Temporary Chat new-chat surface.
Target: select Latest, read and adjust effort; fix `simple panel not ready`.
No prompts entered or submitted. User tab left open with initial Latest / effort 3 restored, menu closed.

## Observed Changes

- Old `composer-model-picker-slider-simple-view` and advanced test IDs absent.
- Menu still owns its trigger through `aria-labelledby`.
- Root `data-model-picker-view` is `simple` or `advanced`.
- Direct view tracks use `data-active`, `aria-hidden`, and inactive `inert`.
- Model toggle uses `role=menuitem`, `data-model-picker-view-toggle=true`, aria-label `모델 선택`; no aria-expanded.
- Slider keyboard control uses `data-reasoning-slider=true`, aria-label `파워` and ArrowLeft/ArrowRight shortcuts. Descendant wrapper uses `data-model-picker-power-slider`, not the old effort-slider attribute.
- Model radios remain mounted in inactive view. Read checked state there, but never activate an inert row. Latest exact label is `최신`; ignore unrelated menus and old GPT-5.5 retirement copy.
- Selecting Latest in advanced view returns to simple view. Read state after settling; immediate post-click reads can still show the old view.

## Reduced Selector Sketch (Not Exact outerHTML)

```html
<div role="menu" aria-labelledby="trigger-id" data-state="open">
  <div data-model-picker-view="simple">
    <div data-active="true" aria-hidden="false">
      <div role="menuitem" data-model-picker-view-toggle="true" aria-label="모델 선택">매우 높음</div>
      <div role="menuitem" data-reasoning-slider="true" aria-label="파워" aria-keyshortcuts="ArrowLeft ArrowRight">
        <div data-model-picker-power-slider=""><span role="slider" aria-valuemin="0" aria-valuemax="4" aria-valuenow="3"></span></div>
      </div>
    </div>
    <div data-active="false" aria-hidden="true" inert>
      <div role="menuitemradio" aria-checked="true" data-model-selected="true">최신</div>
    </div>
  </div>
</div>
```

## Exact Slider outerHTML

```html
<span role="slider" aria-valuemin="0" aria-valuemax="4" aria-orientation="horizontal" data-orientation="horizontal" tabindex="-1" aria-hidden="true" class="ThumbInput-uGPr52" data-radix-collection-item="" aria-valuenow="3" style=""></span>
```

## Verification And Limits

- v0.1.103 uses current semantic anchors plus earlier selector fallback; owned-menu, active-view, inert/disabled, numeric bounds, matching effort label, checked Latest and final readback guards retained.
- Live read-only selector check found the active track, slider 3 and checked Latest. Browser keyboard ArrowLeft produced 2 / High; ArrowRight restored 3 / 매우 높음. Advanced Latest activation returned to simple. This verifies browser UI behavior, not extension-generated event delivery.
- Local preference suite: 13/13 pass, including two new modern-DOM regression tests. All 15 combinations of initial model and requested effort target Latest in the fixture.
- No loaded-extension Reload or end-to-end submission performed. No claim of Gemini, GPTs or all-language live validation.
- Recovery: revert only the v0.1.103 selector changes and version metadata if needed, retaining unrelated dirty work. v0.1.102 remains incompatible with this observed UI; keep sending withheld while diagnosing rather than bypassing confirmation.
