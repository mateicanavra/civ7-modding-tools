# Tasks — mapgen-studio-theming-finish

## 1. Delete `createTheme()` and the `Theme` type
- [x] 1.1 `ui/hooks/useTheme.ts` — remove the `light`/`dark` raw-hex palettes and
      the `createTheme(isLightMode)` generator; keep `useThemePreference` (and its
      `isLightMode` boolean, the deck.gl canvas render input).
- [x] 1.2 `ui/hooks/index.ts` — drop the `createTheme` re-export.
- [x] 1.3 `ui/types/index.ts` — remove the now-unused `Theme` interface.

## 2. Stop threading `theme`/`lightMode`/`isLightMode` through the chrome
- [x] 2.1 `app/StudioShell.tsx` — drop the `createTheme` import + `theme` memo;
      remove `theme`/`lightMode`/`isLightMode` props from `AppHeader`,
      `RecipePanel`, `ExplorePanel`, `AppFooter`, and the three `PresetDialogs`.
      Keep `lightMode={isLightMode}` on `CanvasStage` (canvas render input).
- [x] 2.2 `AppHeader` — remove `isLightMode` prop; drop it from the `AppBrand` /
      `ViewControls` calls.
- [x] 2.3 `AppBrand`, `ViewControls` — remove the `isLightMode?` prop.
- [x] 2.4 `RecipePanel` — remove `theme: Theme` + `lightMode` props and the
      `theme`/`lightMode` pass-through to `SchemaConfigForm`.
- [x] 2.5 `ExplorePanel`, `AppFooter` — remove the inert `lightMode` prop.
- [x] 2.6 `PresetDialogs` — remove the unused `lightMode?` prop from all three.
- [x] 2.7 `SchemaConfigForm` — remove `lightMode`/`theme` props, drop them from the
      `BrowserConfigFormContext` builds and the `useMemo` deps.

## 3. Re-point the rjsf config-form chrome at tokens
- [x] 3.1 `rjsfTemplates.tsx` — replace `getFormTheme(lightMode)` with a single
      token-class bundle (`FORM`); delete `getFormTheme` + `FormTheme`; drop
      `lightMode`/`theme` from `BrowserConfigFormContext`.
- [x] 3.2 Convert `text-[11px]`→`text-data`, `text-[12px]`→`text-xs`,
      `text-rose-400`→`text-destructive` in the templates.
- [x] 3.3 `SchemaConfigForm` fallback message — `text-[#a1a1aa]` →
      `text-muted-foreground`.

## 4. Remove the dead `lightMode`/raw-hex field set
- [x] 4.1 Delete `fields/{String,Number,Boolean,Select,Array}Field.tsx` and
      `fields/styles.ts` (`getInputStyles(lightMode)`); keep `FieldRow`.
- [x] 4.2 Delete the parallel legacy `ui/components/ui/*` primitives (only the dead
      fields consumed them; live UI uses `src/components/ui/*` shadcn).
- [x] 4.3 Trim `fields/index.ts` and `ui/components/index.ts` barrels.

## 5. `AppFooter` named type scale
- [x] 5.1 Replace `text-[11px]`→`text-data`, `text-[10px]`→`text-label`.

## 6. Drop dead exports
- [x] 6.1 `features/civ7Setup/api.ts` — remove `fetchCiv7SavedSetupConfigs` /
      `fetchCiv7SetupCatalog` (no callers); keep the `Civ7SetupCatalog` /
      `Civ7SetupCatalogOption` types and prune the now-unused
      `Civ7SavedSetupConfigFile` import.

## 7. Verify
- [x] 7.1 `bun run check` (tsc) clean.
- [x] 7.2 `bun run build` clean.
- [x] 7.3 `bun run test` — 138 green.
- [x] 7.4 Dev server: screenshot DARK + LIGHT; no console errors/warnings. Light
      tokens resolve with `.dark` absent (`--background: 240 20% 97%`, `--card: 0 0%
      100%`); dark byte-identical.
- [x] 7.5 `bun run openspec -- validate mapgen-studio-theming-finish --strict`.
