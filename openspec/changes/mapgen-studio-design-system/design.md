## Context

Foundation slice (P1) of the MapGen Studio redesign. Controlling frame:
`docs/projects/mapgen-studio-redesign/FRAME.md`. Confirmed design direction and
token values: `apps/mapgen-studio/.interface-design/system.md` (decisions) over
`apps/mapgen-studio/system.md` (as-built extraction).

## Key decisions

- **Tailwind v4, CSS-first.** React 19.2 + Vite 7 already; the v3 config is largely
  dead. v4's `@theme` + `@tailwindcss/vite` removes the PostCSS/autoprefixer/
  config surface. Existing arbitrary hex utilities (`bg-[#141418]`, `text-[11px]`)
  are valid in v4 and render unchanged — this is what makes a non-breaking
  foundation possible.
- **Additive, non-breaking.** This slice adds the token + shadcn + `.dark` layer
  alongside the existing hex styling. Components are NOT re-skinned here; the old
  `lightMode`/`createTheme` path is retired later as components migrate onto
  tokens (P3/P4). Coexistence is deliberate and bounded.
- **Substrate elevation is the primary craft lever.** The live app reads flat
  (page/panel/nested ~4% apart, no floating shadows). The token system encodes a
  felt elevation tier scale + border progression so structure is perceived without
  anything shouting (squint test is the gate). This is where a neutral slate
  becomes intentional.
- **Accent = elevated cool-steel slate, not chroma.** One restrained accent
  (`--primary 216 18% 42%`); the contour focus signature is a luminance step
  (`--ring 212 28% 60%`), not a saturated glow. Teal was considered and set aside
  because the deck.gl map is the only thing that should carry color.
- **`.dark` class theming.** Single switch on `<html>`, no prop drilling, no-flash
  bootstrap. Replaces the OS-`prefers-color-scheme` + JIT-invisible `createTheme()`
  mechanism.

## Risks / mitigations

- *v4 migration regresses rendering* → existing hex utilities are v4-valid; verify
  by build + live screenshot diff before stacking. Legacy `--color-*` vars
  re-pointed at new tokens so focus/scrollbar/select keep working.
- *Two theming systems coexist* → bounded and intentional; `.dark` is
  authoritative now, `lightMode` removed as components migrate.
- *Monorepo build coupling* → all changed config is app-local to `apps/mapgen-studio`.

## Verification

`tsc --noEmit` + `vite build` + worker-bundle check; live screenshot in dark and
light. Behavior parity: no component logic touched.
