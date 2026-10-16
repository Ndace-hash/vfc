# Conventions

## Checking changes

- While iterating on UI or styling, check changes against a running dev server (`npm run dev`), not a production build. Start it once and leave it running for the session; it hot-reloads edits in seconds, while a production build takes several minutes.
- Use a spare port (e.g. `npx nuxt dev --port 3917`), since another dev server is often already running.
- Run a full `npm run build` once at the end, before committing, to catch anything the dev server doesn't.

## Style Guide

Use the Apple HIG best practices when designing interfaces.

### Brand colors

The club colors are green and white. The green is taken from the logo ([public/valiant.png](public/valiant.png)).

| Token | Hex | Use |
| --- | --- | --- |
| Primary green | `#008542` (`brand-600`) | Primary color: buttons, links, active nav, toggles, focus rings, and anything else that calls for action or attention. It is 4.7:1 against white, so white labels on it and green text on white are both readable |
| Logo green | `#00A553` (`brand-500`) | The logo's exact green. Only 3.2:1 against white, so never put text on it or use it for text; keep it for the logo and large decorative areas without text |
| White | `#FFFFFF` | Base surface: page background, cards, sheets, and modals that content sits on |

- In code, use `primary` (`bg-primary`, `text-primary`, `UButton color="primary"`) rather than hex values or `brand-*` shades; it is set to `#008542` in [assets/css/tailwind.css](assets/css/tailwind.css).
- On a light green tint (e.g. `bg-primary/10`), use `text-brand-700` for text; `#008542` drops below 4.5:1 on the tint.

- White is the base everything sits on; green is the accent that draws the eye to actions. Keep green reserved for things that are interactive or need attention, so it keeps its meaning.
- Use neutral grays only for secondary text, dividers, and disabled states, not as a competing accent.
- When an object needs to stand apart from the white background, use a mild shadow (e.g. `0 1px 3px rgb(0 0 0 / 0.08)`) or a hairline border rather than a heavier color.
- Destructive actions still use red, per the HIG; do not use green for them.
