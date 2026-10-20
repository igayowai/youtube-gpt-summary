# Review Report v0.1.48

## Findings

No blocking static issues found.

## Notes

- The composer accent pill is now allowed as a model/model-mode selector when it has `data-tone='accent'`, `aria-haspopup='menu'`, and an icon.
- Plain reasoning-only labels remain excluded unless they appear on that accent model pill shape.
- Header model-switcher and exact menu-root scoping remain available as additional Plan A paths.

## Residual Risk

The accent pill may represent a combined model/mode menu whose row behavior can change. If row clicking fails, capture the opened menu row outerHTML.
