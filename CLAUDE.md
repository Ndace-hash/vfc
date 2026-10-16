# Conventions

## Style Guide

Use the Apple HIG best practices when designing interfaces.

### Brand colors

The club colors are green and white. The green is taken from the logo ([public/valiant.png](public/valiant.png)).

| Token | Hex | Use |
| --- | --- | --- |
| Brand green | `#00A553` | Primary color: buttons, links, active nav, toggles, focus rings, and anything else that calls for action or attention |
| Brand green (text-safe) | `#008542` | Green text or small labels on white, and white text on green when it is under 18pt (`#00A553` only reaches 3.2:1 against white) |
| White | `#FFFFFF` | Base surface: page background, cards, sheets, and modals that content sits on |

- White is the base everything sits on; green is the accent that draws the eye to actions. Keep green reserved for things that are interactive or need attention, so it keeps its meaning.
- Use neutral grays only for secondary text, dividers, and disabled states, not as a competing accent.
- When an object needs to stand apart from the white background, use a mild shadow (e.g. `0 1px 3px rgb(0 0 0 / 0.08)`) or a hairline border rather than a heavier color.
- Destructive actions still use red, per the HIG; do not use green for them.
