# Review Report v0.1.46

## Findings

No blocking static issues found.

## Notes

- The exact ChatGPT model selector now uses the live `data-testid='model-switcher-dropdown-button'` and Korean `aria-label='모델 선택기'` signals.
- Reasoning-intensity labels remain excluded from model selector candidates.
- Exact composer input and send-button detection from earlier versions remain unchanged.

## Residual Risk

The menu item rows inside the model selector still rely on the existing text/role heuristics. If menu-item selection fails, capture the opened model menu row outerHTML for another exact-selector pass.
