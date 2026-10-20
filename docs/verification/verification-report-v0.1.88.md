# Verification Report v0.1.88

This verification covers the ChatGPT `지능` menu opening fix after a live run found the selector pill but did not expose model rows.

## Static Checks

- [PASS] Manifest version is `0.1.88`.
- [PASS] Shared version is `0.1.88`.
- [PASS] ChatGPT model selector opening now uses a menu-toggle click path without an immediate extra native `.click()`.
- [PASS] The script waits for an open ChatGPT intelligence menu root before searching requested model rows.
- [PASS] Text-node fallback now uses the same `exact:` / `prefix:` matcher logic as normal menu-row matching.

## Manual Retest

Reload the unpacked extension, set `GPT 모델 선택` to `높음`, and run `Summarize with GPT` while the visible ChatGPT selector is `Pro`. The expected log sequence is `ChatGPT model selector found: pro`, then `ChatGPT model option found: 높음 ...`, followed by `ChatGPT model selected 높음` or `ChatGPT model selection attempted 높음`.
