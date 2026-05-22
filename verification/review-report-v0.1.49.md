# Review Report v0.1.49

## Findings

No blocking static issues found.

## Notes

- Model row selection now prefers exact `data-testid` values for Instant, Thinking, and Pro.
- The adjacent `연산량` thinking-effort buttons are explicitly skipped during model row lookup.
- Existing dropdown root scoping and fallback heuristics remain available.

## Residual Risk

The exact row selectors include the current `gpt-5-5` test id pattern. If ChatGPT changes the test ids with a future model family label, the fallback heuristics should still run, but another live DOM update may be needed.
