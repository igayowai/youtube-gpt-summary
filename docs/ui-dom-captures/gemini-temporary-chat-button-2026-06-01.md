# Gemini Temporary Chat Button Capture

Date: 2026-06-01 KST

Purpose: Preserve the Gemini Temporary Chat DOM clues used to fix activation before prompt injection.

Visible UI state:
- Gemini app home/chat screen before Temporary Chat activation.
- Temporary Chat button visible in the left/top button group.
- Gemini active Temporary Chat state after the same toggle has been clicked.
- Extension log showed Temporary Chat candidates but confirmation failed until the user clicked the button manually.

Capture type:
- Reduced selector sketch from user-supplied exact outerHTML.
- Private body snippets, recent chat titles, prompts, account data, cookies, and tokens are omitted.

## Relevant Diagnostics

Sanitized diagnostic shape:

```text
temporaryButtons:
- data-test-id="temp-chat-button-container", label=""
- data-test-id="temp-chat-button", label=""
- button aria-label="임시 채팅"
- button aria-label="임시 채팅"
url: https://gemini.google.com/app#ygsRequestId=...
```

Implementation note:
- Empty-label `data-test-id="temp-chat-button"` is a custom `gem-icon-button` wrapper, not the safest click target.
- Prefer the nested native `button[aria-label="임시 채팅"]`.
- Treat the control as a toggle. Do not send both a synthetic click and native `.click()` in one activation attempt; wait for confirmation before trying another click method.
- In active Temporary Chat state, the same native `button[aria-label="임시 채팅"]` remains the reset/deactivation target and its icon changes from `gemini_chat_temp` to `close`.
- The button can be visible before Gemini has fully settled its interaction handlers. Wait for the button geometry/signature to remain stable before the first activation attempt.
- As of v0.1.100, keyboard activation is the fastest confirmed path for this Angular/Material control. Focus the nested native button and dispatch Enter before pointer/native click fallbacks. This is equivalent to the accessibility path of tab-focusing the button and pressing Enter, not a separate hidden Gemini API.

## Reduced OuterHTML

```html
<div data-test-id="temp-chat-button-container" class="buttons-container ng-star-inserted">
  <temp-chat-button>
    <gem-icon-button
      tabindex="-1"
      arialabel="임시 채팅"
      gemtooltipposition="right"
      data-test-id="temp-chat-button"
      class="mat-mdc-tooltip-trigger temp-chat-button redesign gem-button">
      <button
        maticonbutton
        class="mdc-icon-button mat-mdc-icon-button mat-mdc-button-base"
        aria-label="임시 채팅"
        jslog="274589;track:generic_click,impression">
        <span class="mat-mdc-button-persistent-ripple mdc-icon-button__ripple"></span>
        <gem-icon>
          <mat-icon
            role="img"
            class="mat-icon notranslate lm-icon-l lumi-symbols"
            aria-hidden="true"
            data-mat-icon-type="font"
            data-mat-icon-name="gemini_chat_temp"
            data-mat-icon-namespace="lumi-symbols"
            fonticon="gemini_chat_temp"></mat-icon>
        </gem-icon>
        <span class="mat-focus-indicator"></span>
        <span class="mat-mdc-button-touch-target"></span>
        <span class="mat-ripple mat-mdc-button-ripple"></span>
      </button>
    </gem-icon-button>
  </temp-chat-button>
</div>
```

## Active State Reset Sketch

Capture date: 2026-06-02 KST

Target behavior:
- Click the same Temporary Chat toggle to disable/reset active Temporary Chat before the next same-tab test cycle.

Reduced selector sketch from user-supplied outerHTML and live Chrome verification:

```html
<gem-icon>
  <mat-icon
    role="img"
    class="mat-icon notranslate lm-icon-l lumi-symbols"
    aria-hidden="true"
    data-mat-icon-type="font"
    data-mat-icon-name="close"
    data-mat-icon-namespace="lumi-symbols"
    fonticon="close"></mat-icon>
</gem-icon>
```

Live verification:
- inactive icon: `mat-icon[data-mat-icon-name="gemini_chat_temp"]`
- active icon: `mat-icon[data-mat-icon-name="close"]`
- reset target: `button[aria-label="임시 채팅"]`
- fast target: nested native `button[aria-label="임시 채팅"]`
- slow blacklisted targets: `[data-test-id="temp-chat-button"]`, `[data-test-id="temp-chat-button-container"]`, and icon-only `mat-icon` candidates.

## Activation Method Notes

Capture date: 2026-06-02 KST

Observed behavior:
- DOM/native click and synthetic pointer paths can activate the toggle, but live extension logs showed they often failed confirmation within the short window and forced later fallback attempts.
- The keyboard path confirmed quickly in live use after the button was focused.
- `keyboard` in the code means dispatching Enter to the focused `button[aria-label="임시 채팅"]`. It is effectively the same user-facing control path as keyboard accessibility activation.

Implementation preference:
- Use keyboard activation first.
- Confirm success from the active `close` icon.
- Keep pointer/native only as fallback paths.
- Keep wrapper/container/icon-only click targets blacklisted because they are slower and less direct.

## Current Code Touchpoints

- `src/content/gemini.js`: `waitForStableGeminiTemporaryChatButton`, `findExactGeminiTemporaryChatButton`, `findInnerGeminiTemporaryChatButton`, `clickGeminiTemporaryChatControl`
