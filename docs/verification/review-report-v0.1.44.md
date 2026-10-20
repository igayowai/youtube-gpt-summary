# Review Report v0.1.44

## Findings

No blocking static issues found.

## Notes

- ChatGPT composer input detection now prefers the current `form[data-type='unified-composer']` and `#prompt-textarea.ProseMirror` structure.
- ChatGPT auto-submit now prefers the exact send button identifiers `#composer-submit-button` and `button[data-testid='send-button']`, reducing the chance of clicking nearby voice, microphone, sidebar, or project controls.

## Residual Risk

ChatGPT can still change its DOM. The older heuristic fallback remains in place, but live retesting is needed whenever ChatGPT updates the composer structure.
