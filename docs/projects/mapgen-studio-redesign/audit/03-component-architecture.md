# 03 — Component Architecture Audit: `apps/mapgen-studio`

**Audit lane:** Component architecture / React structure
**Primary target:** `src/App.tsx` (3,010 LoC god-component)
**Date:** 2026-06-08
**Lens applied:** `dev:vercel-composition-patterns`, `dev:vercel-react-best-practices`, `dev:frontend-design`

> **Current-status note (2026-06-16):** this audit predates the Studio runtime
> Effect refactor stack that landed on `origin/main` through PR `#1748`. Its
> polling, watchdog, browser-recovery, and TanStack status-query recommendations
> are historical decomposition evidence, not current runtime authority. Current
> runtime ownership is daemon/EventHub/Effect-owned; see
> `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md` and the
> `mapgen-studio-game-door-invariant` D12 proof ledgers before using this audit
> for runtime behavior.

> **Behavior-parity constraint (non-negotiable):** map-gen pipeline, Deck.gl rendering, recipe semantics, and the live-game runtime loop must be preserved bit-for-bit. Sections flag every piece of **load-bearing live-control state** so decomposition does not break the live loop.

---

## 0. Executive snapshot (1 screen)

### Proposed top-level component tree

```
<App>                                   (theme + providers only — App.tsx:3003)
  <ToastProvider>
  <QueryClientProvider>                 (NEW — TanStack Query)
    <StudioShell>                       (NEW container: layout + keyboard shortcuts + error banner)
      <CanvasStage>                     (NEW: deck canvas + backdrop + grid + empty-state)
        <DeckCanvas/>                   (unchanged — features/viz/DeckCanvas)
      <AppHeader/>                      (presentational; reads worldStore + setupStore)
      <LeftDock>                        (NEW container)
        <RecipeConfigPanel>            (NEW container; owns preset/save/config orchestration)
          <RecipePanel/>               (presentational — unchanged shell)
      <RightDock>                       (NEW container)
        <ExploreController>            (NEW container; owns viz selection derivation)
          <ExplorePanel/>              (presentational — unchanged shell)
      <AppFooter>                       (container-lite; reads runStore + liveStore)
      <PresetDialogs/>                  (presentational — already extracted)
      <ErrorBanner/>                    (NEW trivial presentational)
```

### State → store / query / local split

| Bucket | Today (App.tsx) | Target |
|---|---|---|
| **Authoring config** (worldSettings, recipeSettings, setupConfig, pipelineConfig, overridesDisabled, repoBackedPresetOverrides) | 6 `useState` + 1 persistence effect | **Zustand `authoringStore`** (persist middleware replaces the manual save effect at L868–877) |
| **Viz/view selection** (selectedStage/Step, overlay*, era*, showGrid/Edges, panel collapse flags) | ~14 `useState` + ~10 derivation `useMemo` + 8 sync effects | **Zustand `viewStore`** for raw UI selection; selection **derivation stays in an `ExploreController` hook** (`useExploreSelection`). `vizStore` (existing external store) unchanged. |
| **Run-in-game / save-deploy / browser run** | `runInGameOperation`, `saveDeployOperation`, `runInGameSnapshot`, `lastRunInGameSource`, `lastSaveDeployConfig`, `lastRunSnapshot`, polling effects | **TanStack Query** for the server-polled operations (`run-in-game/status`, `map-configs/status`); **`runStore` (Zustand)** for client snapshots/fingerprints that survive reload |
| **Live runtime** (status, snapshot, suggestions, liveSetup, savedConfigs, setupCatalog) | `liveRuntime`, `liveRuntimeSuggestions`, `liveSetup`, `savedSetupConfigs`, `setupCatalog` + the 130-line polling effect (L966–1114) + the catalog effect (L1116–1175) | **TanStack Query** with `refetchInterval` for status/snapshot/setup/catalog; keep the **manual abort + request-key gating logic** as the queryFn body (it is load-bearing — see §6 risk) |
| **Theme** | `useThemePreference` (already a hook) | Keep as hook; optionally fold into a tiny `uiStore`. Lowest priority. |
| **Local/ephemeral** | `viewportSize`, `headerHeight`, `deckApiReadyTick`, dialog open state, `importInputRef`, all `*Ref` latches | **Stays local** in the owning container. |

### Single biggest decomposition risk

**The 149-line live-runtime polling effect (`App.tsx:966–1114`) is the live-control heart and is deceptively stateful.** It interleaves four concerns (status poll, setup fetch, snapshot read, suggestion build) behind a single `cancelled` closure, two failure-count refs (`liveStatusFailureCountRef`, `liveSnapshotFailureCountRef`), an active-request-key ref, and an abort controller, all feeding `nextLiveRuntimePollDelayMs` for adaptive backoff. Naively porting it to a `useQuery({refetchInterval})` will **drop the request-key staleness gating (`shouldCommitLiveRuntimeSnapshot`) and the cross-failure backoff coupling**, producing snapshot tearing (stale snapshot committed over a newer one) and a hot-poll loop against a disconnected Civ7. This effect must be migrated last, behind a parity harness, with `shouldCommitLiveRuntimeSnapshot` / `nextLiveRuntimePollDelayMs` kept as-is inside the queryFn.

---

## 1. State inventory of `App.tsx`

`AppContent` (L676–3001) holds **42 `useState`, 19 `useRef`, 24 `useEffect`, 34 `useMemo`, 37 `useCallback`.** Grouped by concern:

### 1A. Recipe / authoring config (the durable authoring model)

| State | Decl | What | Read by | Mutated by |
|---|---|---|---|---|
| `worldSettings` | L708 | mapSize/playerCount/resources | header, footer, run builders, fingerprint, persistence | `AppHeader.onGlobalSettingsChange` (L2790), `syncStudioFromLiveGame` (L2184), saved-config seed flow |
| `recipeSettings` | L714 | recipe/preset/seed | nearly everything (recipe drives `recipeArtifacts`) | RecipePanel (L2819), footer seed, reroll (L1717), preset save/import/delete handlers, live sync |
| `setupConfig` | L719 | Civ7 setup (leader/civ/difficulty/speed/gameOptions) | header setup controls, run-in-game, fingerprint | header (L2793), `handleSavedSetupConfigChange` (L1872), live sync (L2186) |
| `pipelineConfig` | L788 | full pipeline overrides object (lazy default-built) | RecipePanel, run builders, fingerprint, run-in-game, save | RecipePanel `onConfigChange` (L2803), preset-apply effect (L853), every save handler, live sync (L2185) |
| `overridesDisabled` | L793 | toggles config overrides on run | RecipePanel switch, `startBrowserRun`, autorun guards | RecipePanel (L2839), recipe-change effect (L809), live sync |
| `repoBackedPresetOverridesByRecipe` | L733 | in-memory repo preset overrides keyed by recipe | `builtInPresets` memo (L746) | `rememberRepoBackedConfig` (L1364) |
| `lastRunSnapshot` | L794 | last browser-run inputs (for `isDirty`) | `isDirty` (L1731), autorun equality guards | `startBrowserRun` (L1276), recipe-change effect resets to null |

**Persistence:** single effect L868–877 serializes the first 6 to `localStorage` via `saveStudioAuthoringState`. Initial hydration via `initialAuthoringStateRef` (L680–684) read once.

### 1B. Viz / view controls (selection + display)

| State | Decl | What | Read/Mutated |
|---|---|---|---|
| `showGrid` | L692 | background grid toggle | header toggle; `backgroundGridEnabled` memo (L2720) |
| `showEdges` | L693 | edge overlay toggle | passed to `useVizState` (L933); ExplorePanel toggle |
| `overlaySelectionId` | L694 | selected overlay suggestion | ExplorePanel; `overlaySelection` derived (L742); reset effect (L2363) |
| `overlayOpacity` | L695 | overlay alpha | useVizState; ExplorePanel slider |
| `overlayVariantKeyPreference` | L696 | era-pinned overlay variant | useVizState; **set by effect** L2373–2407 (derived-state-in-disguise) |
| `eraMode` | L697 | "auto"/"fixed" | era controls; many handlers |
| `manualEra` | L698 | fixed era value | era handlers; clamp effect (L2341) |
| `selectedStageId` | L1197 | explore stage | ExplorePanel; sync effect (L1232) |
| `selectedStepId` | L1198 | explore step | ExplorePanel; sync effects (L1237, L1242) push into `viz` |
| `recipeSectionCollapsed`, `configSectionCollapsed` | L699–700 | left panel collapse | RecipePanel; `toggleLeftPanel` |
| `exploreStageExpanded/StepExpanded/LayersExpanded` | L701–703 | right panel collapse | ExplorePanel; `toggleRightPanel` |
| `viewportSize` | L690 | canvas size | DeckCanvas, fit effect | ResizeObserver effect (L1177) |
| `headerHeight` | L2714 | measured header height | panel top offset | `onHeaderHeightChange` |
| `deckApiReadyTick` | L687 | forces re-fit when deck API mounts | fit effect (L952) | `handleDeckApiReady` |

Plus the **entire derived-selection pyramid** (`selection`, `selectedDataType`, `selectedSpace`, `selectedRenderMode`, `selectedVariants`, `selectedVariant`, `eraVariants`, `eraRange`, `autoEra`, `fixedEraUiValue`, `overlayCandidates`, `overlayOptions`, `spaceOptions`, `renderModeOptions`, `variantOptions`, `dataTypeOptions`) — L2244–2361 — all `useMemo` chained off `viz.dataTypeModel` + `viz.selectedLayerKey`. This is the bulk of `ExploreController`.

> **Live-control note:** `viz.*` selection lives in the existing `vizStore` external store (`features/viz/vizStore.ts`), already decoupled. The App-level mirror state (`selectedStageId`/`selectedStepId`) is a **second source of truth** that is sync'd into `vizStore` by effects L1237–1248 — a known smell (see §2).

### 1C. Browser run (map-gen worker)

| State | Decl | Notes |
|---|---|---|
| `browserRunner` (`useBrowserRunner`) | L884 | owns worker lifecycle, `state.running/error/lastStep`. **Load-bearing for map-gen.** Already a clean hook. |
| `autoRunEnabled` | L704 | footer toggle |
| `autoRunTimerRef`, `autoRunPendingRef` | L705–706 | debounce latches for 3 autorun effects (L1296, L1306, L1340) |
| `localError` | L890 | merged with runner error into `error` (L962) |

### 1D. Run-in-game + save/deploy (server operations)

| State | Decl | What | Mutated |
|---|---|---|---|
| `runInGameOperation` | L739 | server op status (polled) | `handleRunInGame` (L2069), `refreshRunInGameStatus` (L1910), polling effect (L1986–2008), restore effect (L1941) |
| `runInGameSnapshot` | L892 | client fingerprint snapshot | handleRunInGame, restore effect |
| `lastRunInGameSource` | L736 | full source snapshot (proved live source) | handleRunInGame; live presets/relation memos; live sync |
| `lastSaveDeployConfig` | L893 | last saved config for materialization-mode calc | save handlers; `runInGameMaterializationMode` memo |
| `saveDeployOperation` | L891 | save/deploy server op | `saveRepoBackedConfigWithState` (L1397), polling effect (L1974) |
| `lastRunInGameToastRef` | L894 | terminal-toast dedupe latch | toast effect L1986 |

`localStorage` keys L430–433 persist last request IDs + snapshots; restore effects L1941–1972.

### 1E. Live runtime (the live-control loop)

| State | Decl | What |
|---|---|---|
| `liveRuntime` | L899 | status/snapshotStatus/binding/turn/seed/autoplay — **footer live indicator + sync gating** |
| `liveRuntimeSnapshot` (write-only, `[, setLiveRuntimeSnapshot]`) | L905 | snapshot state — **set but never read** (see §2 dead read) |
| `liveRuntimeSuggestions` | L906 | suggestion records consumed by `syncStudioFromLiveGame` (L2120) |
| `liveSetup` | L907 | live Civ7 setup snapshot → drives `setupControlOptions` (L1818) |
| `savedSetupConfigs` | L913 | `/saved-configs` result → setup dropdown |
| `setupCatalog` | L920 | `/setup-catalog` result → setup dropdown |
| `autoplayActionRunning` | L926 | autoplay button in-flight latch |
| Refs: `liveStatusFailureCountRef`, `liveSnapshotFailureCountRef`, `activeLiveSnapshotRequestKeyRef`, `liveSnapshotAbortRef` | L895–898 | **load-bearing** backoff + staleness gating |

### 1F. Presets / dialogs

| State | Decl |
|---|---|
| `presetError`, `saveDialogState`, `pendingImport` | L722–728 |
| `importInputRef` | L729 |
| `lastAppliedPresetRef`, `lastPresetKeyRef`, `lastRecipeIdRef` | L730–732 (preset-apply dedupe latches) |
| `usePresets(...)` | L782 (already a hook; owns local/scratch presets) |

### 1G. Theme / shortcuts / misc

- `useThemePreference` (lifted to `App`, passed via `AppContentProps` L670) — already a hook.
- `shortcutsRef` (L2539) — mutable mirror of stage/step/datatype + handlers, read by the global `keydown` effect (L2596–2712). A deliberate ref-as-event-handler-latch (`advanced-event-handler-refs`), but the mirror is large and brittle.

---

## 2. Effect audit (24 `useEffect`)

| # | Line | Purpose | Verdict |
|---|---|---|---|
| 1 | L796–818 | Reset config when recipe/preset changes to "none" | **Should be an event handler.** Triggered by recipe/preset change; uses `lastPresetKeyRef`/`lastRecipeIdRef` to detect "did it actually change" — classic effect-emulating-an-event. Move into `onSettingsChange`. |
| 2 | L820–861 | Apply preset config on preset change | **Should be event handler / derived.** Uses `lastAppliedPresetRef` dedupe to avoid re-applying. This is reacting to a controlled select change; belongs in the preset-select handler. |
| 3 | L863–866 | Toast `loadWarning` | Borderline; acceptable as effect (external warning surfacing) but could be event from `usePresets`. |
| 4 | L868–877 | Persist authoring state to localStorage | **Replace with Zustand `persist` middleware.** Pure write-through derived from store. |
| 5 | L943–950 | Auto-fit deck to bounds on space change | Legit effect (imperative deck API). Keep. Uses `lastAutoFitSpaceRef` latch — fine. |
| 6 | L952–960 | First-manifest auto-fit | Legit imperative effect. Keep. |
| 7 | L966–1114 | **Live runtime poll loop** (status+setup+snapshot+suggestions) | **Migrate to TanStack Query last** (see §6). Load-bearing. Mixed concerns; should be ≥3 queries. |
| 8 | L1116–1175 | Load saved-configs + catalog, retry + focus-refetch | **TanStack Query** (`Promise.all` → two queries with `refetchOnWindowFocus`). The hand-rolled focus listener + retry timer is exactly what Query provides. |
| 9 | L1177–1195 | ResizeObserver → viewportSize | Legit. Keep (local). |
| 10 | L1232–1235 | Clamp `selectedStageId` to available stages | **Derived-state-in-disguise.** Should be computed during render (`rerender-derived-state-no-effect`). |
| 11 | L1237–1240 | Clamp `selectedStepId` to available steps | **Derived-state-in-disguise.** Same. |
| 12 | L1242–1248 | Push `selectedStepId` into `viz` store | **Sync of duplicated state** — symptom of two sources of truth (App mirror vs vizStore). Eliminate by making vizStore the single owner. `eslint-disable exhaustive-deps` present = smell. |
| 13 | L1296–1304 | Clear autorun timer when disabled | Could fold into the autorun effect. Minor. |
| 14 | L1306–1338 | Autorun: schedule run on config change | Legit (debounced side-effect). Keep but consolidate the 3 autorun effects (#13–15) into one `useAutoRun` hook. |
| 15 | L1340–1350 | Autorun: flush pending after run finishes | Part of the autorun trio. Consolidate. |
| 16 | L1941–1960 | Restore run-in-game status from localStorage on mount | One-shot init. Keep, or fold into Query `initialData`. |
| 17 | L1962–1972 | Restore save-deploy status from localStorage | One-shot init. Same. |
| 18 | L1974–1984 | Poll save-deploy status while running | **TanStack Query** `refetchInterval` (document.hidden-aware). |
| 19 | L1986–2008 | Poll run-in-game status while running + terminal toast | **Split:** polling → Query; terminal toast → event/`onSuccess`. Toast-in-effect via `lastRunInGameToastRef` dedupe is a derived-event smell. |
| 20 | L2341–2344 | Clamp `manualEra` to range | **Derived-state-in-disguise** (clamp during render or in handler). |
| 21 | L2363–2371 | Reset `overlaySelectionId` when candidates change | **Derived-state-in-disguise** (invalid selection → render-time fallback). |
| 22 | L2373–2407 | Compute `overlayVariantKeyPreference` from era/selection | **Derived-state-in-disguise.** This is a pure function of (eraMode, manualEra, overlaySelection, selection) written as `setState` in an effect with `prev ===` guards. Should be a `useMemo`. |
| 23 | L2596–2712 | Global keyboard shortcuts | Legit (window listener). Keep. The `shortcutsRef` mirror is the cost of an empty-deps listener; acceptable but extractable to `useGlobalShortcuts`. |
| 24 | (header) L2714 area effects | header height plumbing | Local. Keep. |

**Effect-overuse tally:** **8 effects are derived-state-in-disguise or should be event handlers** (#1, #2, #10, #11, #12, #20, #21, #22) — eliminating them removes ~120 lines and several `*Ref` latches. **6 effects are server polling** that TanStack Query collapses (#7 partial, #8, #18, #19 partial, #16, #17).

**Dead read:** `liveRuntimeSnapshot` state (L905) is written (L1004, L1027) but the value is never consumed (`[, setLiveRuntimeSnapshot]` discards the getter). It only feeds `liveRuntime.snapshotStatus` indirectly. Candidate for removal — confirm against live loop before deleting.

**Key-prop misuse:** none found (no list-rendering with index keys in App.tsx; lists live inside panels).

---

## 3. Prop-drilling map

App.tsx is **flat** (one level: App → Header/Footer/RecipePanel/ExplorePanel), so literal depth is 1. But the *prop count* is the pathology — the god-component hand-threads dozens of props because there is no intermediate container or store:

| Component | Prop count | Threaded clusters that should be store reads |
|---|---|---|
| **ExplorePanel** (L2847–2894) | **~38 props** | The entire viz-selection model (stages/steps/dataType/space/renderMode/variant + 7 `on*Change` + overlay + era + 3 expand toggles). Every one is App state or App-derived. → `ExploreController` + `viewStore`. |
| **RecipePanel** (L2799–2844) | **~30 props** | config + schema + 6 preset action callbacks + 5 run/save status booleans + 4 collapse props. → `RecipeConfigPanel` container + `authoringStore`. |
| **AppFooter** (L2897–2929) | **~30 props** (interface L19–81) | run/run-in-game/save/live/autoplay status + 8 callbacks. The `liveRuntime` object (L57–66) and `runInGameStatus`/`saveDeployStatus` are pure store reads. → footer reads `runStore`/`liveStore` directly. |
| **AppHeader** (L2782–2796) | ~11 props | worldSettings + setupConfig + setupOptions + theme. → `authoringStore` + `setupStore`. |

**Props that thread > 2 levels:** Strictly, none today (depth is 1). But `lightMode`/`theme` is threaded into **every** component and then **re-threaded** into every child inside the panels (`fields/`, `ui/`) — effectively 3–4 levels deep. → **Theme belongs in context** (`react19-no-forwardref` + `use(ThemeContext)`), eliminating the most pervasive prop. The `viz` object's selection is also effectively threaded App → ExplorePanel-derivation → DeckCanvas via 15 memos.

---

## 4. Decomposition target

### 4.1 Target component tree (containers vs presentational)

```
App.tsx                         theme hook + providers ONLY (~30 LoC)
└─ providers/StudioProviders    ToastProvider + QueryClientProvider + ThemeProvider(context)
   └─ StudioShell               layout grid, panelTop math, error banner, global shortcuts host
      ├─ CanvasStage            backdrop/grid/empty-state + <DeckCanvas>; reads viewStore.showGrid, vizStore
      ├─ AppHeader              (presentational) reads authoringStore + setupStore via selectors
      ├─ LeftDock
      │  └─ RecipeConfigPanel   CONTAINER: preset/save/import/export orchestration + dirty calc
      │     └─ RecipePanel      (presentational, unchanged shell)
      ├─ RightDock
      │  └─ ExploreController   CONTAINER: viz-selection derivation (useExploreSelection)
      │     └─ ExplorePanel     (presentational, unchanged shell)
      ├─ AppFooter              CONTAINER-LITE: reads runStore + liveStore; run/live/autoplay actions
      ├─ PresetDialogs          (presentational, already extracted)
      └─ ErrorBanner            (presentational, NEW trivial)
```

### 4.2 New files / hooks to create

**Stores (Zustand — net-new dependency):**

| File | Owns | Replaces |
|---|---|---|
| `src/state/authoringStore.ts` | worldSettings, recipeSettings, setupConfig, pipelineConfig, overridesDisabled, repoBackedPresetOverrides + actions (setRecipe, applyPreset, resetConfig, rememberRepoBacked) | App L708–793 + persistence effect L868–877 (use `persist` middleware keyed `mapgen-studio.authoring-state.v1` — **must preserve existing schema/migration in `studioState/persistence.ts`**) |
| `src/state/viewStore.ts` | showGrid/showEdges, overlaySelectionId/Opacity, eraMode/manualEra, panel collapse/expand flags, selectedStageId/StepId | App L692–703, L1197–1198, L2714 |
| `src/state/runStore.ts` | runInGameOperation, runInGameSnapshot, lastRunInGameSource, lastSaveDeployConfig, lastRunSnapshot + localStorage bridge | App L736–739, L892–894 + restore effects |
| `src/state/liveStore.ts` (optional) | liveRuntime status surface consumed by footer/sync | App L899–926; **wraps** Query data, does not replace the poll gating |

> `vizStore.ts` (existing external store) stays as-is and becomes the **single** owner of selectedStep/Layer (delete the App mirror + sync effect #12).

**Query hooks (TanStack Query — net-new dependency):**

| File | Query |
|---|---|
| `src/features/liveRuntime/useLiveRuntimeQuery.ts` | status + snapshot poll; queryFn keeps `shouldCommitLiveRuntimeSnapshot` + `nextLiveRuntimePollDelayMs` + abort/request-key gating verbatim |
| `src/features/civ7Setup/useSetupCatalogQuery.ts` | saved-configs + catalog (`refetchOnWindowFocus`) |
| `src/features/runInGame/useRunInGameStatusQuery.ts` | run-in-game status poll (`refetchInterval`, hidden-aware) |
| `src/features/mapConfigSave/useSaveDeployStatusQuery.ts` | save/deploy status poll |

**Container hooks (keep derivation colocated, not in a store):**

| File | Owns |
|---|---|
| `src/features/viz/useExploreSelection.ts` | the L2244–2407 derivation pyramid + the 8 `handle*Change` callbacks + `selectLayerFor` |
| `src/features/browserRunner/useAutoRun.ts` | autorun trio (effects #13–15) + timer refs |
| `src/shared/shortcuts/useGlobalShortcuts.ts` | the keydown effect + `shortcutsRef` mirror |
| `src/features/presets/usePresetActions.ts` | the 8 save/import/export/delete handlers (L1352–1707) + repo-backed save orchestration |

**Pure helpers to relocate out of App.tsx** (currently top-of-file, L127–662): `saveRepoBackedConfig`, `fetch*`, `requestCiv7Autoplay`, `mergeDeterministic`, `setAtPath`, `buildConfigSkeleton`, `buildDefaultConfig`, `applyPresetConfig`, `liveSourceMatchesStudio`, etc. → move to `features/*/api.ts` and `features/configOverrides/*`. These ~535 lines are not React at all.

### 4.3 What stays local

`viewportSize`, `headerHeight`, `deckApiReadyTick`/`deckApiRef`, dialog open state, `importInputRef`, all dedupe `*Ref` latches that survive after their effects move into hooks.

---

## 5. Composition smells

1. **Boolean-prop explosion (footer & panels).** `AppFooter` takes `isRunning`, `isRunInGameRunning`, `isSaveDeployRunning`, `isAutoplayActionRunning`, `isDirty`, plus `runInGameCurrentRelation`/`liveGameStudioRelation` string-enums. RecipePanel: `isRunning`, `isRunDisabled`, `isSaveDeployRunning`, `isSaveDisabled`, `isDirty`, `canDeletePreset`, `overridesDisabled`, 4 collapse booleans. These are all **deriveable from store state** — the panels should subscribe to a derived `operationControlsDisabled` selector rather than receive 5 booleans (`architecture-avoid-boolean-props`).

2. **Configuration-over-composition in the panels.** Both panels are documented "fully controlled — all options passed via props" (RecipePanel.tsx:5, ExplorePanel.tsx:5). ExplorePanel receives 6 parallel `{options, selected, onChange}` triples — a textbook case for **compound components** (`<Explore.StageSelect/>`, `<Explore.LayerSelect/>`) sharing context, instead of 38 flat props.

3. **Duplicated select-triple UI.** Stage/Step/DataType/Space/RenderMode/Variant are six structurally identical `Select + label + nav` blocks. Consolidate into one `<LayerDimensionSelect>` driven by a list (`patterns-explicit-variants`), removing copy-paste in ExplorePanel.

4. **Render-prop absence is fine; children-over-config is the win.** The big panels would shrink dramatically if `RecipeConfigPanel`/`ExploreController` composed children rather than App spreading 30+ props (`patterns-children-over-render-props`).

5. **Two sources of truth for step selection.** App `selectedStepId` (L1198) + `vizStore.selectedStepId`, reconciled by sync effects. Collapse to one owner (`state-lift-state` → push to the lower store, vizStore).

6. **`lightMode`/`theme` threaded everywhere.** Should be `ThemeContext` consumed with React 19 `use()` (`react19-no-forwardref`), removing the single most-repeated prop in the tree.

7. **Save-handler triplication.** `handleSaveDialogConfirm` (L1432), `handleSaveToCurrent` (L1487), and the scratch branch each re-implement the same `saveRepoBackedConfigWithState → rememberRepoBackedConfig → setRecipeSettings → toast(success/failure)` sequence with copy-pasted error-message ternaries (L1464–1475, L1517–1528, L1579–1590). Extract one `persistConfigToRepo()` helper.

---

## 6. Top 10 highest-leverage refactors (ranked by robustness × risk-reduction)

> Ordered so that **low-risk extractions land first** and de-risk the high-value but dangerous live-loop migration last.

| # | Refactor | Anchor(s) | Why it's high-leverage | Risk |
|---|---|---|---|---|
| 1 | **Extract pure helpers + fetch wrappers out of App.tsx** into `features/*/api.ts` | App.tsx L127–662 (535 LoC of non-React) | Cuts App by ~18% with **zero behavior change**; makes the rest reviewable | Trivial |
| 2 | **Kill the 8 derived-state effects** (#1,2,10,11,20,21,22 + #12 sync) | L796–818, L820–861, L1232–1235, L1237–1248, L2341–2344, L2363–2371, L2373–2407 | Removes ~120 LoC + 5 `*Ref` latches; eliminates a class of stale-render bugs (`rerender-derived-state-no-effect`) | Low–Med (preset-apply effect #2 has real ordering; verify with snapshot) |
| 3 | **Make `vizStore` the single owner of step/layer selection**; delete App mirror + sync effect | L1198, L1242–1248 (`eslint-disable exhaustive-deps`) | Removes the most dangerous duplicated-state coupling in the viz path | Medium (touches viz selection — keep DeckCanvas inputs identical) |
| 4 | **Extract `useExploreSelection` hook** (derivation pyramid + handlers) | L2244–2537 | Moves ~290 LoC into `ExploreController`; ExplorePanel becomes truly presentational; enables compound-component cleanup | Low (pure derivation, no side-effects) |
| 5 | **Introduce `authoringStore` (Zustand + persist)**; replace 6 useState + persistence effect | L708–793, L868–877; preserve `studioState/persistence.ts` schema | Single source of truth for the authoring model; removes prop-threading to Header/RecipePanel | Medium (localStorage schema parity is load-bearing for refresh recovery) |
| 6 | **Consolidate save/preset handlers into `usePresetActions`** + one `persistConfigToRepo()` | L1352–1707 (handlers), L1432–1591 (triplicated save) | Removes ~150 LoC of copy-paste; one place to reason about preset↔config↔recipe invariants | Medium (touches the materialization-mode decision that gates durable vs disposable run-in-game) |
| 7 | **Migrate run-in-game + save/deploy polling to TanStack Query** | L1974–2008 (poll), L1887–1939 (refresh), L1941–1972 (restore) | Deletes 4 effects + 2 refresh callbacks; `refetchInterval` + `initialData` from localStorage; terminal toast → `onSuccess` | Medium (request-id correlation + terminal-toast dedupe must be preserved) |
| 8 | **Migrate setup-catalog/saved-configs to Query** with `refetchOnWindowFocus` | L1116–1175 | Deletes the hand-rolled focus listener + retry timer; feeds `setupControlOptions` unchanged | Low–Med |
| 9 | **ThemeContext via React 19 `use()`**; drop `lightMode`/`theme` props | every component; L2782–2929 | Removes the single most-threaded prop across the whole tree | Low |
| 10 | **Migrate live-runtime poll to Query — LAST, behind parity harness** | **L966–1114** (149-line effect) + refs L895–898 | The live-control heart; collapsing it is the biggest structural win but the highest blast radius | **HIGH** — must keep `shouldCommitLiveRuntimeSnapshot`, `nextLiveRuntimePollDelayMs`, abort + request-key gating **verbatim** inside the queryFn; snapshot tearing + hot-poll regressions are the failure modes |

---

## 7. Load-bearing live-control state (do-not-break registry)

Anything below directly feeds the live game loop or its parity checks; treat as behavior-frozen:

- **`browserRunner` worker lifecycle** (`useBrowserRunner`, L884) — map-gen execution. The `runToken`/`generation` gating (useBrowserRunner.ts:61–63, 128–131) prevents stale-worker event application; preserve exactly.
- **Live poll gating refs** (L895–898) + `shouldCommitLiveRuntimeSnapshot` (L991) + `nextLiveRuntimePollDelayMs` (L972) — adaptive backoff + snapshot anti-tearing.
- **Run-in-game fingerprint/relation** (`runInGameCurrentFingerprint` L1755, `runInGameCurrentRelation` L1766, `liveGameStudioRelation` L1775, `studioMatchesProvedLiveSource` L1796) — drive whether "Sync from Live Game" and "Run in Game" are offered; their equality semantics (`configsEqual`, `liveSourceMatchesStudio`) must not change.
- **`runInGameMaterializationMode`** (L1740) — durable vs disposable decides server-side map materialization; gated on preset `sourcePath` + config equality. Refactor #6 touches this — verify with a fixture.
- **localStorage request-id bridge** (keys L430–433; restore L1941–1972; writes L2090–2092) — survives dev-server reloads; the persistence schema is a contract.
- **`vizStore` RAF-batched commit** (vizStore.ts:65–96) — selection-during-streaming defaults; DeckCanvas input stability depends on stable snapshot identity (vizStore.ts:37–45).

---

## 8. Notes on existing structure (what's already good)

- `vizStore.ts` is already a correct external store with stable snapshots — the **template** for the new Zustand stores.
- `useBrowserRunner`, `useVizState`, `usePresets`, `useThemePreference` are clean, testable hooks. The pattern exists; App.tsx just didn't follow it for the other 5 concerns.
- Feature folders (`features/*/model.ts`, `status.ts`, `clientState.ts`) already isolate pure logic well — the React layer is the only thing that ballooned.
- **Dead code:** `useGeneration` and `useViewState` (`ui/hooks/`) are exported but **unused** by App (it uses `useBrowserRunner`/`useVizState` directly). Candidates for deletion during the refactor.

---

### Appendix — metrics

- `App.tsx`: 3,010 LoC; `AppContent`: L676–3001.
- Hooks in `AppContent`: 42 `useState`, 19 `useRef`, 24 `useEffect`, 34 `useMemo`, 37 `useCallback`.
- Non-React helper code at top of file: L127–662 (~535 LoC).
- Largest single effect: live poll L966–1114 (149 LoC).
- Largest prop surfaces: ExplorePanel ~38, RecipePanel ~30, AppFooter ~30.
- State libs currently installed: **none** (Zustand + TanStack Query are net-new). React 19.2.
