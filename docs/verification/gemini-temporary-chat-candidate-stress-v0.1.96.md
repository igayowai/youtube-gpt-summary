# Gemini Temporary Chat Candidate Stress Report v0.1.96

Date: 2026-06-02 KST

Scope:
- Real user Chrome tab claimed through the Chrome plugin.
- URL: `https://gemini.google.com/app`
- Login state: logged in; recent Gemini history visible; no login gate.
- Prompt injection and submission were not tested.
- Test loop: ensure inactive -> activate candidate -> confirm `close` icon -> reset with `button[aria-label="임시 채팅"]` -> confirm `gemini_chat_temp` icon.

## Result Summary

| Candidate | Iterations | Activation | Reset | Notes |
| --- | ---: | ---: | ---: | --- |
| `button[aria-label="임시 채팅"]` | 50 | 50/50 | 50/50 | Best target. Same button resets active Temporary Chat. |
| `[data-test-id="temp-chat-button"]` | 1 probe | 1/1 | 1/1 | Succeeds, but Playwright wrapper click took about 7.0s. Not preferred. |
| `[data-test-id="temp-chat-button-container"]` | 1 probe | 1/1 | 1/1 | Succeeds, but Playwright container click took about 7.4s. Not preferred. |
| scoped `mat-icon[data-mat-icon-name="gemini_chat_temp"]` | 1 probe | 1/1 | 1/1 | Succeeds with force click, but took about 7.0s. Not preferred. |

## Native Button Samples

First, second, third, and fiftieth cycles all matched the same state transition:

```text
inactive icon: gemini_chat_temp
activation target: button[aria-label="임시 채팅"]
active icon after activation: close
reset target: button[aria-label="임시 채팅"]
inactive icon after reset: gemini_chat_temp
```

Observed sample timings:
- cycle 1: activation 435ms, reset 420ms
- cycle 2: activation 421ms, reset 424ms
- cycle 3: activation 425ms, reset 425ms
- cycle 50: activation 422ms, reset 423ms

Final state after the 50-cycle native button run:

```text
active=false
icon=gemini_chat_temp
inactive=true
```

## Candidate Interpretation

- The reliable automation target is the nested native button: `button[aria-label="임시 채팅"]`.
- The active-state close icon is not a separate button. It is the same Temporary Chat toggle rendered with `data-mat-icon-name="close"`.
- Wrapper/container/icon candidates can work manually or via forced clicks, but are slower and less representative for extension code than the native button.
- Same-tab repeated testing is practical because reset is the same native button.

## Test Limitations

- Wrapper/container/icon repeated 20/50-cycle runs were not continued after tool timeouts because each Playwright wrapper click took about 7 seconds.
- Page-internal synthetic event construction could not be evaluated directly through the Chrome plugin evaluate sandbox because DOM/Event constructors were restricted there; this does not imply the extension content script path is blocked.
