# Verification Report v0.1.89

This verification covers compatibility with ChatGPT rolling the model menu back from `즉시 / 중간 / 높음 / Pro` to `Instant / Thinking / Pro`.

## Static Checks

- [PASS] Manifest version is `0.1.89`.
- [PASS] Shared version is `0.1.89`.
- [PASS] `중간` now matches the older `Thinking` row.
- [PASS] `높음` now matches the older `Thinking` row.
- [PASS] Existing new-UI matchers for `중간` and `높음` remain intact.

## Manual Retest

Reload the unpacked extension, set `GPT 모델 선택` to `높음`, and run `Summarize with GPT` when ChatGPT shows the older `Instant / Thinking / Pro` menu. The expected result is that the automation selects `Thinking` and continues prompt injection/submission.
