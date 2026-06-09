## Why

The canonical token-driven primitive library now exists at
`apps/mapgen-studio/src/components/ui/`, but the shell/chrome still renders
through the legacy `src/ui/components/ui/*` primitives and a wall of hardcoded
hex palettes gated on a `lightMode`/`isLightMode` boolean (`bg-[#141418]/95`,
`border-[#2a2a32]`, `text-[#8a8a96]`, `bg-[#1a1a1f]`, …). The design system is
invisible: the substrate-elevation tiers, the single slate accent, the contour
focus ring, and the `.dark`-class theming never reach the surface the user
actually sees.

This slice makes the design system VISIBLE across the shell. It reskins the
chrome (header, brand, view controls, left dock / RecipePanel, right dock /
ExplorePanel, footer / status strip, the app root and error strip) onto the
design tokens, adopts the new primitives at their call sites, converts native
`title=` tooltips to the shadcn `Tooltip`, and migrates the legacy
`AlertDialog`/`ToastProvider` usages to the shadcn `Dialog` and sonner `toast`.

## What Changes

- Replace ad-hoc hex / `lightMode`-ternary classes in the shell with design
  tokens so depth is FELT: page = `bg-background`, floating chrome docks =
  `bg-popover`, nested sunken surfaces = `surface-sunken`,
  inputs = `input-background`; borders via `border`/`border-subtle` per the
  ladder; secondary text via `text-muted-foreground`. The light theme now comes
  from `:root` and the dark theme from `.dark`, so the per-class `lightMode`
  branching collapses to a single token class.
- Commit to the ONE slate accent: chrome identity states (active/dirty/focus
  rings, auto-run, live-stale emphasis) move from ad-hoc orange to the
  `primary`/`ring` tokens. Semantic *data* indicators (status dots:
  running/error/ready, live-ok/error) stay on their semantic hues — they are the
  matter the instrument reports, not instrument identity.
- Adopt the new `src/components/ui` primitives (Button, Input, Select, Switch,
  Tooltip, Dialog) at the shell + preset-dialog + rjsf-widget call sites.
- Convert native `title=` attributes in the shell to the shadcn `Tooltip`,
  wrapped by a single `TooltipProvider` at the shell root.
- Migrate the legacy `AlertDialog` (RecipePanel reset, PresetDialogs) to the
  shadcn `Dialog`, and migrate `ToastProvider`/`useToast` to the sonner
  `Toaster` + `toast`.

This change is PRESENTATION ONLY. It moves styling onto tokens and swaps
primitive mechanisms; it changes no map generation, deck.gl, recipe, run-in-game,
live-runtime poll, localStorage, or browserRunner logic.

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/src/ui/components/AppHeader.tsx`,
  `AppBrand.tsx`, `ViewControls.tsx`, `RecipePanel.tsx`, `ExplorePanel.tsx`,
  `AppFooter.tsx`; `apps/mapgen-studio/src/App.tsx` (root bg, Toaster, error
  strip); `apps/mapgen-studio/src/features/presets/PresetDialogs.tsx`;
  `apps/mapgen-studio/src/features/configOverrides/rjsfWidgets.tsx`.
- No change to map generation, deck.gl, recipe semantics, run-in-game, the
  live-runtime poll staleness/backoff gating, the localStorage schema, or
  browserRunner gating.
