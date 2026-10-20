# Review Report: YouTube GPT Summary Extension v0.1.7

Timestamp: 2026-05-05 KST

## Review Summary

v0.1.7 updates the Options page around prompt selection. It replaces the developer-facing prompt preview with a clearer user-facing choice between basic summary, deep summary, and custom prompt.

## Scope Control

Passed. The change does not affect permissions, transcript extraction, ChatGPT tab handoff, Temporary Chat defaults, auto-submit defaults, servers, APIs, queues, or transcript chunking.

## Correctness Review

The new `promptMode` setting defaults to `default`, preserving existing behavior for users who do not change settings. `deep` is intentionally reserved with a `null` prompt for now and safely falls back to the developer default prompt until the user authors the deep summary prompt. `custom` uses the saved custom prompt when present. If the custom prompt is empty, the existing safe fallback to the developer default prompt remains.

The three prompt mode controls are implemented as radio inputs styled as large cards. This matches the requested one-of-three behavior while keeping the interaction accessible and avoiding ambiguous multi-checkbox state.

## Review Result

Approved for user-side retest. The implementation is narrow, backwards-compatible by default, and keeps MVP boundaries intact.
