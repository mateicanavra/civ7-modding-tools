# Restore the spacing substrate (cascade-layer repair) + theme bootstrap key

## Why

Pass-3 grounding (2026-06-11, live DOM inspection on :5173) found that **every
Tailwind padding/margin utility in the app computes to 0px**. `index.html`
ships an inline, unlayered reset — `* { margin: 0; padding: 0; box-sizing:
border-box }` — and Tailwind v4 emits all utilities inside `@layer utilities`.
Unlayered author styles take cascade priority over all layered styles
regardless of specificity, so the reset silently wins everywhere: `p-2.5`
stage cards, `px-3 py-2` list rows, button/input padding, the Pass-2 scroll
fade margins — all dead. The pre-v4 build emitted unlayered utilities
(specificity won; the reset was harmless); the P1 Tailwind v4 migration
inverted the cascade without a visible diff. This is the root of the user's
"padding and margins on everything are really bad."

Deleting the rule in the running page restores the intended texture app-wide
(verified: stage-list rows 12px inline padding, stage cards 10px, padded
header/footer/inputs).

Same file, second defect: the pre-paint theme script reads
`localStorage["mapgen-studio:theme"]`, but the app persists the preference
under `theme-preference` (`useTheme.ts`). The bootstrap reads a key nobody
writes, so a light-theme user gets a dark pre-paint flash on every load.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-3-design-fixes.md` (Pass-3 frame; issues 1–2)
- `apps/mapgen-studio/.interface-design/system.md` (§Pass-3 amendment: no unlayered author CSS)

## What Changes

- **`index.html` drops the unlayered `*` reset.** Tailwind preflight (in
  `@layer base`, via `@import "tailwindcss"` in `index.css`) already provides
  the margin/padding/box-sizing reset at the correct layer priority. The
  `body` pre-paint flash guard (font, background, color) stays.
- **The pre-paint theme script reads `theme-preference`** — the key the app
  actually writes — preserving the dark default when the key is absent.
- No component changes in this slice. Surfaces whose Pass-1/2 styling was
  tuned against the broken (zero-padding) render are re-tuned in the slices
  that own them (config surface, consoles, explore toolbar).

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/index.html` only
- Visual blast radius is app-wide (all intended padding/margins appear);
  behavior parity untouched.
