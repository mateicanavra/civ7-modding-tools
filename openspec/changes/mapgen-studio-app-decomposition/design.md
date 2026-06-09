## Context

`App.tsx` (3,032 LoC) holds two unrelated things in one file:

1. **A non-React corpus** (L127–668, ~535 LoC): `fetch` wrappers for the `/api/*`
   endpoints, deterministic config builders (`buildConfigSkeleton`,
   `buildDefaultConfig`, `applyPresetConfig`), the prototype-safe deterministic
   merge (`mergeDeterministic`, `setAtPath`), preset adapters
   (`mergeBuiltInPresets`, `toRepoBackedPreset`), Civ7 setup option helpers,
   localStorage key constants + the source-snapshot reader, and small predicates
   (`delay`, `isAbortLikeError`, `clampNumber`, `isPlainObject`).

2. **The `AppContent` authoring closure** (L676–3022): 42 `useState`, 24 `useEffect`,
   34 `useMemo`, 37 `useCallback`, plus the inlined provider shell, deck-canvas
   stage JSX, and error-banner JSX.

The audit (refactor #1) flags the corpus extraction as **trivial risk, ~18% of the
file, zero behavior change**. That is the safe, high-leverage core of this slice.

## Goals / Non-Goals

- **Goal:** MOVE the non-React corpus into named feature modules; MOVE the provider
  shell and the two purely-presentational chrome pieces (`CanvasStage`, `ErrorBanner`)
  plus the layout frame (`StudioShell`) into `app/` components. Re-import into `App.tsx`.
- **Goal:** Preserve every hard-core behavior verbatim — the moved code is identical.
- **Non-Goal (deferred to the post-stores slice):** the container/presentational
  split that makes `RecipePanel`/`ExplorePanel`/`AppFooter` read from stores and
  drops their 30–38-prop interfaces. That split depends on the Zustand/TanStack
  Query client-data layer, which is NOT in this stack yet. Doing it here would be a
  **logic rewrite**, not a move, and would risk the live-loop and run-in-game parity
  the FRAME marks as hard core. Per the FRAME falsifier, we stop short of it.

## Decisions

### Decision: Extract the non-React corpus into existing feature folders, not a new junk drawer

Each helper goes to the feature that owns its concern, matching the existing layout
(`features/<area>/{api,model,status,...}.ts`):

| Module | Moved symbols |
| --- | --- |
| `features/mapConfigSave/api.ts` | `toConfigId`, `saveRepoBackedConfig`, `fetchMapConfigSaveDeployStatus`, `MAP_CONFIG_SAVE_LAST_REQUEST_KEY` |
| `features/runInGame/api.ts` | `runCurrentConfigInGame`, `fetchRunInGameStatus` |
| `features/runInGame/sourceSnapshotStorage.ts` | `readStoredRunInGameSourceSnapshot`, `RUN_IN_GAME_LAST_*` keys |
| `features/runInGame/liveSource.ts` | `liveSourceMatchesStudio`, `LastRunSnapshot` |
| `features/civ7Setup/api.ts` | `fetchCiv7SetupConfig`, `fetchCiv7SavedSetupConfigs`, `fetchCiv7SetupCatalog`, `requestCiv7Autoplay`, `Civ7SetupCatalog(Option)` types |
| `features/civ7Setup/setupOptions.ts` | `findSetupParameterLike`, `ensureSelectOption`, `mergeSelectOptions`, `setupCatalogOptions` |
| `features/configOverrides/configBuilders.ts` | `isPlainObject`, `isNumericPathSegment`, `FORBIDDEN_MERGE_KEYS`, `mergeDeterministic`, `setAtPath`, `buildConfigSkeleton`, `buildDefaultConfig`, `applyPresetConfig`, `formatPresetErrors`, `PresetApplyResult`, `AppliedPresetSnapshot` |
| `features/presets/repoBacked.ts` | `mergeBuiltInPresets`, `toRepoBackedPreset` |
| `features/presets/dialogState.ts` | `PresetErrorState` |
| `features/civ7Setup/livePreset.ts` | `LIVE_GAME_PRESET_ID`, `LIVE_GAME_PRESET_KEY` |
| `shared/async.ts` | `delay`, `isAbortLikeError` |
| `shared/number.ts` | `clampNumber` |

Rationale: zero new top-level dirs, no logic change, and the persistence-key
constants live next to the code that reads/writes them — but the key STRINGS are
unchanged, so the localStorage contract holds.

### Decision: The provider shell + chrome become `app/` components; the closure stays intact

- `app/StudioProviders.tsx` — the current `App` export body (`TooltipProvider` +
  `AppContent` + `Toaster` + the `useThemePreference` call). `App.tsx` re-exports it.
- `app/CanvasStage.tsx` — the `canvas` JSX (backdrop, theme tint, optional grid,
  `<DeckCanvas>`, empty-state). It receives exactly the values the inline JSX read:
  `isLightMode`, `backgroundGridEnabled`, deck props, `viewportSize`, manifest flag.
- `app/ErrorBanner.tsx` — the error banner JSX.
- `app/StudioShell.tsx` — the outer layout frame (`containerRef` div, panel-top
  positioning, slot placement of canvas/header/panels/footer/dialogs/error).

`AppContent` keeps all hooks/derivations/handlers. The only edits to the closure are:
(a) import sites for the moved helpers, and (b) the trailing JSX delegating to the
new presentational components with the same inputs. This keeps the diff a **move**,
auditable as such.

### Decision: Defer the eight disguised effects and the prop-drilling cleanup

The audit lists 8 derived-state effects to delete and the 30–38-prop panel
interfaces to collapse. Both are **logic rewrites** and both depend on the
not-yet-landed stores. Removing the disguised effects changes render timing and
must be validated against the live loop with a parity harness — out of scope for a
move-only slice. They are explicitly deferred to the post-stores decomposition
slice and recorded here so the next slice picks them up.

## Risks / Trade-offs

- **Risk:** an extracted helper silently captured a module-level binding. Mitigation:
  every moved symbol is self-contained (verified by reference-count grep); the type
  checker proves no dangling reference after the move.
- **Trade-off:** `App.tsx` shrinks by the corpus + chrome but the `AppContent`
  closure remains large until the stores land. Accepted: this slice is the
  prerequisite domino, not the finish line.

## Migration Plan

1. Create the feature modules; move symbols verbatim; export.
2. Replace the inline definitions in `App.tsx` with imports.
3. Extract `StudioProviders`, `CanvasStage`, `ErrorBanner`, `StudioShell`.
4. `bun run check` + `bun run build` + live preview console-error check.

## Open Questions

None blocking. The container/store split is sequenced to the client-data-layer slice.
