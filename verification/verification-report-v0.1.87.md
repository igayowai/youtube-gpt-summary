# Verification Report v0.1.87

This verification covers the ChatGPT model-selection update for the new ChatGPT `지능` dropdown UI.

## Static Checks

- [PASS] Manifest version is `0.1.87`.
- [PASS] Shared version is `0.1.87`.
- [PASS] ChatGPT Options choices are now `선택 없음`, `즉시`, `중간`, `높음`, and `Pro`.
- [PASS] Legacy `chatgptModel: "thinking"` normalizes to `high`.
- [PASS] ChatGPT menu matching supports `exact:` and `prefix:` matchers so selected pills and visible menu rows such as `높음 15~60초` can be matched.
- [PASS] ChatGPT menu roots now prioritize `data-testid="composer-intelligence-picker-content"`, and option lookup prioritizes `role="menuitemradio"` rows with `data-oai-menu-item`.
- [PASS] Stale exact `model-switcher-gpt-5-5` selectors now require visible option-label matching before they can be clicked.

## Manual Retest

Reload the unpacked extension, set `GPT 모델 선택` to each of `즉시`, `중간`, `높음`, and `Pro`, then run `Summarize with GPT`. Confirm the ChatGPT console logs `ChatGPT model selector found`, `ChatGPT model option found`, and either `ChatGPT model selected` or `ChatGPT model selection attempted` for the requested label.
