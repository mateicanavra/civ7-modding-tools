## Why

The design-system slice (`mapgen-studio-design-system`) established the single
`.dark` class strategy and the token system, and later slices reskinned the chrome
onto tokens. But the theming repair mandated by
`apps/mapgen-studio/.interface-design/system.md` was left half-finished: the legacy
runtime theme machinery still existed alongside the token system, threaded through
the component tree purely for call-site compatibility.

1. **`createTheme()` + the `lightMode`/`isLightMode` prop drilling survived.**
   `StudioShell` built a `Theme` object with `createTheme(isLightMode)` —
   runtime `bg-[${hex}]` string interpolation that Tailwind's JIT cannot see (a
   real bug, not just dead style) — and threaded `theme`/`lightMode`/`isLightMode`
   through `AppHeader`/`RecipePanel`/`ExplorePanel`/`AppFooter`/`AppBrand`/
   `ViewControls`/`PresetDialogs`/`SchemaConfigForm`. Those consumers had already
   migrated their bodies to tokens, so the props were inert.

2. **The rjsf config-form chrome still used `getFormTheme(lightMode)` + raw hex.**
   `features/configOverrides/rjsfTemplates.tsx` resolved a per-light/dark bundle of
   raw-hex classes on a HIGH-TRAFFIC live surface (re-rendered on every config
   edit). The dead `fields/*` field components carried the same
   `getInputStyles(lightMode)` raw-hex helper.

3. **`AppFooter` used ad-hoc `text-[11px]`/`text-[10px]`** instead of the named
   `text-data`/`text-label` scale the system defines.

4. **Dead exports lingered.** `fetchCiv7SavedSetupConfigs` /
   `fetchCiv7SetupCatalog` had no callers after the oRPC-native query migration.

This is a PRESENTATION-ONLY finish: control values, run-in-game, live-poll, and the
localStorage schema are untouched. The one runtime light/dark boolean that is NOT a
chrome theming concern — the deck.gl background-grid color, drawn into a `<canvas>`
as literal RGBA that cannot read a CSS class — is preserved and forwarded only to
`DeckCanvas`.

## Target Authority Refs

- `apps/mapgen-studio/.interface-design/system.md` (theming-repair mandate: single
  `.dark` class, NO `createTheme`, NO `lightMode` prop, NO raw-hex palette)
- `docs/projects/mapgen-studio-redesign/FRAME.md` (§3 hard core — design system is
  the single UI source of truth; behavior parity)
- `docs/projects/mapgen-studio-redesign/architecture/10-target-architecture.md`
  (§7 do-not-break registry — presentation changes must not move logic/parity)
- `apps/mapgen-studio/src/index.css` (the `:root`/`.dark` tokens + named type scale)

## What Changes

- **Delete `createTheme()` and the `Theme` token-bundle type.** Remove the
  `light`/`dark` raw-hex palettes and the `createTheme(isLightMode)` generator from
  `ui/hooks/useTheme.ts`, drop the `createTheme` re-export, and remove the now-unused
  `Theme` interface from `ui/types`. `useThemePreference` (and its `isLightMode`
  boolean) stays — it is the source of the canvas render input.
- **Stop threading `theme`/`lightMode`/`isLightMode` through the chrome.** Remove
  those props from `StudioShell`'s JSX and from `AppHeader`, `RecipePanel`,
  `ExplorePanel`, `AppFooter`, `AppBrand`, `ViewControls`, `PresetDialogs`, and
  `SchemaConfigForm` (props + `BrowserConfigFormContext`). Each consumer already
  styles via tokens; the removed props were inert.
- **Re-point the rjsf config-form chrome at tokens.** Replace
  `getFormTheme(lightMode)` in `rjsfTemplates.tsx` with a single token-class bundle
  (`bg-card`/`bg-muted`/`text-foreground`/`text-muted-foreground`/`border-border`/
  `border-border-subtle`/`hover:bg-accent`), delete `getFormTheme`/`FormTheme`, and
  convert the ad-hoc `text-[11px]`/`text-[12px]`/`text-rose-400` to
  `text-data`/`text-xs`/`text-destructive`. Fix the one raw-hex fallback message in
  `SchemaConfigForm` (`text-[#a1a1aa]` → `text-muted-foreground`).
- **Remove the dead `lightMode`/raw-hex field set.** Delete the unused
  `String/Number/Boolean/Select/Array` field components and their
  `getInputStyles(lightMode)` helper (`fields/styles.ts`), plus the parallel legacy
  `ui/components/ui/*` primitives they were the only consumers of (the live UI uses
  the shadcn `src/components/ui/*`). Keep `FieldRow` (still used by the rjsf
  templates) and trim the barrels.
- **`AppFooter` named type scale.** Replace `text-[11px]`/`text-[10px]` with
  `text-data`/`text-label`.
- **Drop dead exports.** Remove `fetchCiv7SavedSetupConfigs` /
  `fetchCiv7SetupCatalog` from `features/civ7Setup/api.ts` (no callers since the
  query migration); keep the `Civ7SetupCatalog` / `Civ7SetupCatalogOption` TYPES
  (consumed by the query view + `setupOptions`).

## Requires

- `mapgen-studio-rigor` (the prior slice — this stacks on its
  `design/rigor` tip; the `readErrorData` accessor and the oRPC-native query
  reads that orphaned the removed fetchers come from there / `data-model`).

## Affected Owners

- `apps/mapgen-studio/src/ui/hooks/useTheme.ts`, `ui/hooks/index.ts`,
  `ui/types/index.ts`
- `apps/mapgen-studio/src/app/StudioShell.tsx`
- `apps/mapgen-studio/src/ui/components/{AppHeader,AppBrand,ViewControls,RecipePanel,ExplorePanel,AppFooter}.tsx`
- `apps/mapgen-studio/src/ui/components/index.ts`,
  `ui/components/fields/index.ts`
- `apps/mapgen-studio/src/features/configOverrides/{rjsfTemplates,SchemaConfigForm}.tsx`
- `apps/mapgen-studio/src/features/presets/PresetDialogs.tsx`
- `apps/mapgen-studio/src/features/civ7Setup/api.ts`
- (deleted) `ui/components/ui/*`, `ui/components/fields/{String,Number,Boolean,Select,Array}Field.tsx`, `fields/styles.ts`

## Forbidden Owners

- No change to map-gen, Deck.gl math, recipe semantics, run-in-game, live-poll, or
  the localStorage schema (§7 hard core). The deck.gl grid-color `lightMode` render
  input is preserved.
- No new `createTheme` / `lightMode` prop / `getFormTheme(lightMode)` / raw-hex
  color utility in any touched chrome.
- No `mods/**` changes.

## Stop Conditions

- Any control value, run-in-game / live-poll behavior, or localStorage schema would
  change — STOP (this is presentation-only).
- A removed prop turns out to drive real styling (not inert) on its consumer.

## Consumer Impact

None observable beyond the intended visual consistency. Dark mode is byte-identical
(same tokens resolve). Light mode now resolves correctly through the `.dark`-absent
token branch instead of the old JIT-invisible interpolated hex. Same controls, same
behavior, same persistence.

## Verification Gates

- `bun run check` (tsc) clean.
- `bun run build` (vite + worker-bundle check) clean.
- `bun run test` — all 138 green.
- Runtime: dev server; screenshot in BOTH dark and light (toggle `.dark`); no
  console errors; the config form, header, footer, and dialogs render correctly in
  both.
- `bun run openspec -- validate mapgen-studio-theming-finish --strict`.
