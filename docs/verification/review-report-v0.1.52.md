# Review Report v0.1.52

## Findings

No blocking static issues found.

## Notes

- Ambiguous composer pills no longer short-circuit model selection.
- The model menu should now be opened whenever the selector only exposes reasoning-state text.
- Exact row selectors remain the source of truth during the current Plan A-only test build.

## Residual Risk

The build still has model and send Plan B disabled for diagnostic clarity. Re-enable those fallbacks after Plan A is validated.
