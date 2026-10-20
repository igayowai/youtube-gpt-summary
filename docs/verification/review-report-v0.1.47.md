# Review Report v0.1.47

## Findings

No blocking static issues found.

## Notes

- ChatGPT menu row lookup now scopes to the dropdown root controlled by the model switcher before falling back to broad heuristics.
- This reduces risk from matching sidebar, composer reasoning, or unrelated menu text.
- Exact input, model-switcher button, and send-button selectors remain in place.

## Residual Risk

If ChatGPT changes the menu row markup or text labels, row matching may still fall back to heuristics. Capture a row outerHTML sample if model row clicking fails in live testing.
