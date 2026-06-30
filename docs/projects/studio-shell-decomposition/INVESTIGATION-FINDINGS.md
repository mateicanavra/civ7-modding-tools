# Investigation Findings — StudioShell parity corpus (Phase 6)

> Source: independent 3-agent re-derivation (effect-order graph @ high-effort Opus, shared-value DAG, cluster map) cross-checked against my own first-hand full read. This is the **corpus** that drives the Phase 7 design and the per-slice parity proofs. Anchors @ `5aa6ccf7c`.
>
> **Headline verdict:** the component is **mostly order-safe to extract**. The risk is concentrated in a few effect groups and a handful of synchronous-timing rules. With the invariants below honored, every extraction is behavior-preserving.

---

## 1. Effect-execution-order graph — the parity crux

React fires effects in source/call order each commit. Extraction must preserve **hook call order = effect fire order**, or prove pairwise independence. Three tiers:

### Tier A — MUST be lifted atomically, preserving relative source order (one hook each)
| Group | Effects (lines) | Shared state | If reordered → |
|---|---|---|---|
| **Preset config-sync** | 2+3 (410, 435) | `lastAppliedPresetRef`, `pipelineConfig`, `lastPresetKeyRef`/`lastRecipeIdRef` bookkeeping (effect 2 advances unconditionally) | preset-apply reset to defaults, or reseed clobbered by apply; bookkeeping drifts → next commit reseeds/drops → extra/missing browser auto-run |
| **Stage→Step→Viz cascade** | 11+12+13 (857, 862, 867) | `selectedStageId` → derived `steps` → `selectedStepId` → `viz` | extra renders + transient stale stage/step/layer; redundant `viz.setSelectedLayerKey(null)`. Keep effect 13's `exhaustive-deps` suppression (depends on `selectedStepId` only) |
| **Auto-run trio** (highest risk) | 14+15+16 (929, 939, 973) | `autoRunPendingRef`, `autoRunTimerRef`, `startBrowserRun` | **duplicate or dropped browser run**; leaked 300ms timer firing after auto-run disabled |

### Tier B — order-observable; keep relative order *within* their hook
| Group | Effects | Consequence if reordered |
|---|---|---|
| Deck autofit | 8+9 (608, 617) | different initial camera framing on first map load (last `fitToBounds` wins) |
| Overlay prune → variant-pref; era → overlay | 19+20 (2188, 2198); 18→20 (2164→2198) | one-frame stale overlay variant (wrong era) before fixpoint — transient, not persistent |
| Save-deploy waiter | 6+7 (548, 558) | at unmount/terminal-status race: a completed op's promise rejected ("wait cancelled") → spurious error toast |

### Tier C — order-safe pure moves (no other effect reads what they write in-commit)
Effects **1** (pipeline-prune, 301), **4** (loadWarning toast, 478), **5** (live-runtime mount lifecycle, 540), **7** (waiter unmount cleanup — pairs only at unmount race), **10** (viewport ResizeObserver, 798), **21** (keyboard, 2453 — reads everything via `shortcutsRef.current` reassigned in render).

### Cross-commit coupling to respect
- **17→6** (cross-cluster): adoption effect (1656) `setSaveDeployOperation` → next commit effect 6 mirrors ref + resolves waiter. If re-timed, an *adopted* terminal status may fail to resolve a pending `waitForSaveDeployTerminalEvent` → hung await until timeout.

---

## 2. Critical refactor invariants (non-negotiable)

- **(a) Render-phase ref reassignments must stay in render scope — never moved into effects.** `runInGameOperationRef`/`saveDeployOperationCurrentRef` (506–507), `vizIngestRef` (604), `shortcutsRef.current` (2421) are reassigned every render *before* effects run; effects 17 (via getters) and 21 read them. Moving any into a `useEffect` makes those readers observe stale values. → Formalize as a `useLatestRef(value)` helper that writes during render.
- **(b) Each cluster's refs travel WITH its effects into the same hook.** A ref shared across two extracted hooks reintroduces the exact ordering hazard. (`lastAppliedPresetRef`, `autoRunPendingRef`/`autoRunTimerRef`, `saveDeployWaitersRef`/`saveDeployOperationRef`, `lastAutoFitSpaceRef`/`hasEverSeenVizManifestRef`, the live-runtime abort/mounted refs.)
- **(c) Busy booleans must be derived SYNCHRONOUSLY and exposed stable-from-first-render (default `false`).** `browserRunning` (496), `runInGameRunning` (593), `saveDeployRunning` (592) are inline derivations from operation state. If a hook republishes them via `useState`+`useEffect`, there's a **one-render lag** in the busy gate → a second operation can race through, and `viz.allowPendingSelection` (601, fed by `browserRunning`) goes stale for one render. Keep them inline-derived from the operation status each hook owns; thread the value, do not re-publish.

---

## 3. Shared-derived-value DAG — threading risks

Owner → consumers; the rule is **own once, thread the value; never re-derive at a different time.**

| Value (line) | Producer | Threading risk |
|---|---|---|
| `browserRunning`/`runInGameRunning`/`saveDeployRunning` (496/593/592) | inline from op status | see invariant (c) — synchronous only |
| `recipeArtifacts` (352) | catalog by recipe | consumed by effects 410+435 same render; if published one render late, pipelineConfig reset but preset not re-applied in the intermediate render |
| `runInGameMaterializationMode` (1444) | memo on `resolvePreset` | **security-adjacent** (durable vs disposable game-file path); must stay a `useMemo` dep, not captured via ref/effect, so call-time == render-time value |
| `selection` (2061) | memo on `viz.selectedLayerKey` | root of 4-deep memo chain + read in 6 callbacks; re-deriving independently per callback risks JSX/callback disagreement. Own once |
| `provedRunInGameSource` (364) | memo | consumed by `livePresets`, `liveGameStudioRelation`, `studioMatchesProvedLiveSource` — all must see the same value same render |
| `vizIngestRef.current = viz.ingest` (604) | sync ref assign after `useVizState` | must stay synchronous; async ref-forwarding would drop early browser-runner VizEvents |
| `overlayDataTypeKey` (350) | from `overlaySelection` | **feeds `useVizState` input (598)** — must be computed BEFORE `useVizState` regardless of how layer-selection is split (circular-dep ordering constraint) |

---

## 4. Target cluster map (independent re-derivation, refined)

11 controller hooks + module pure-helpers + thin host. `dependsOn` = values received as params/from stores; `provides` = returns. Risk = extraction risk.

| Hook | Lines | Risk | Provides (key) | Depends on (key) |
|---|---|---|---|---|
| `useViewportLayout` | 246–250, 295–319, 798–816, 2571–2593 | low | viewportSize, deckApiRef, deckApiReadyTick, panelTop/Bottom, handleHeaderHeightChange, backgroundGridEnabled, stageView, recipeDag + pipeline-expansion | recipeSettings.recipe, stageView, viz.effectiveLayer/manifest, showGrid |
| `useStageStepNav` | 820–873, 2268–2281 | low | stages, steps, recipeOptions, selectedStage/StepId, handleStageChange/StepChange | recipeArtifacts.uiMeta.stages, viz.{selectedStepId,setSelectedStepId,setSelectedLayerKey} |
| `useBrowserRun` | 289–292, 486–499, 875–992, 1415–1442 | low | browserRunning, localError, startBrowserRun, triggerRun, reroll, autoRunEnabled, isDirty, status, handleVizEvent | recipeSettings, worldSettings, pipelineConfig, overridesDisabled, runInGameRunning, saveDeployRunning, lastRunSnapshot, viz, toast |
| `useKeyboardShortcuts` | 2391–2569 | low | (keydown side-effects only) | stages, steps, dataTypeOptions, selected*, handleStageChange, setSelectedStepId, handleDataTypeChange, triggerRun, reroll, view collapse state+setters |
| `useSetupControls` (+ live-game actions) | 589–592, 1542–1650, 1932–2018 | low | setupControlOptions, savedSetupConfigModified, handleSavedSetupConfigChange, handleToggleAutoplay, handleExplore, autoplay/exploreActionRunning | liveSetup, liveRuntime.autoplayActive, setLiveRuntime, savedSetupConfigs, setupCatalog, setupConfig, busy flags, toast |
| `useLiveRuntime` | 517–528, 540–547, 629–792 | medium | liveRuntime, liveRuntimeSuggestions, liveSetup, applyLiveGameState | orpcClient, fetchCiv7SetupConfig, liveRuntime model fns |
| `usePresetLifecycle` | 321–336, 356–481, 1293–1413 | medium | presetOptions, resolvePreset, presetActions, builtInPresets, livePresets, recipeArtifacts, isLocalPresetSelected, rememberRepoBackedConfig, lastAppliedPresetRef, openSaveDialog, handle{Export,Import,Delete,SaveAsNew}, presetError/saveDialogState/pendingImport | recipeSettings, repoBackedPresetOverridesByRecipe, lastRunInGameSource, provedRunInGameSource, store setters, toast |
| `useSaveDeploy` | 163–204, 501–583, 994–1004, 1016–1156 | medium | saveDeployOperation, saveDeployRunning, setSaveDeployOperation, saveRepoBackedConfigWithState, handleSaveDialogConfirm/SaveToCurrent | busy flags, pipelineConfig, recipeSettings, resolvePreset, presetActions, rememberRepoBackedConfig, lastAppliedPresetRef, builtInPresets, setters, toast |
| `useRunInGame` | 339–343, 364–393, 504–516, 1444–1528, 1652–1804, 2020–2031 | medium | runInGameOperation, runInGameRunning, setRunInGameOperation, markRunInGameToastHandled, handleRunInGame, syncStudioFromLiveGame, copyRunInGameDiagnostics, runInGameCurrentRelation, liveGameStudioRelation, provedRunInGameSource | liveRuntime+suggestions, authoring stores, resolvePreset, busy flags, setSaveDeployOperation, all authoring setters, toast, orpcClient |
| `useLayerSelection` | 345–355, 595–625, 2046–2143, 2237–2266 | **high** | overlayDataTypeKey (pre-`useVizState`), dataTypeOptions, selection, selected*, *Options, selectLayerFor, riverLakeInspectorSummary, handleRiverLakeInspectorLayerSelect | viz, recipeSettings.recipe, recipeArtifacts.uiMeta.stages, deckApiRef, deckApiReadyTick, viewportSize, setSelectedStep/StageId |
| `useEraOverlayControl` | 2144–2235, 2357–2389 | **high** | eraEnabled/Mode/Range/DisplayValue, overlayCandidates/Options, handleEra*Change | selection, manualEra (viewStore), eraMode, overlaySelection |

### Refinements vs. the 10-cluster hypothesis (confirmed disagreements)
1. **Split Layer/Viz into `useLayerSelection` + `useEraOverlayControl`** — they share `selection` as a dep but own no shared state; merged = ~300-line untestable hook. The **circular dep** (`overlayDataTypeKey` derived from `overlaySelection` but feeds `useVizState` at 598) means `overlayDataTypeKey` must be computed *before* `useVizState` regardless of the split. Risk HIGH either way.
2. **Autoplay/Explore are live-game *actions*** (1932–2018), surfaced in GameConsole; they write `liveRuntime` via `setLiveRuntime`. Co-locate with Setup Controls (or a `useLiveGameActions`) — receiving `setLiveRuntime`. Decide owner in Phase 7.
3. **Save/Deploy ↔ Preset bidirectional entanglement** — `handleSaveDialogConfirm`/`handleSaveToCurrent` call `rememberRepoBackedConfig`, mutate `lastAppliedPresetRef`, `setPipelineConfig`/`setRecipeSettings`. Clean boundary: Preset hook **passes those items as params** into Save/Deploy. Save-dialog state lives in Save/Deploy (opened by save actions).
4. **`syncStudioFromLiveGame` (1806–1930) write order is the single highest parity hazard**: it writes all 5 authoring setters in order `setWorldSettings → setPipelineConfig → setSetupConfig → setOverridesDisabled → setRecipeSettings`; `setRecipeSettings` last triggers the preset-apply effect (435) which reads `pipelineConfig`. **Preserve this exact order**; reordering silently overwrites the just-applied config.
5. Viewport/Layout owning `recipeDag` + pipeline-prune is a low-stakes cut (stageView is the gate; panel geometry is the output).

---

## 5. Extraction-order constraint (hook init order in the host)

- `useLiveRuntime` initializes **before** `useRunInGame` (the adoption effect at 1656 needs `setRunInGameOperation` + `setSaveDeployOperation`).
- `useSaveDeploy` initializes **before** the adoption effect fires.
- All operation hooks live in the **same render cycle**; each must expose its **busy flag stable from the very first render (default `false`)** — the auto-run flush effect (973) reads `runInGameRunning`/`saveDeployRunning`; an `undefined` first render could fire a spurious `startBrowserRun`.
- `overlayDataTypeKey` must be available before `useVizState` (circular-dep, §3/§4.1).

---

## 6. Implications for design + slice sequencing (input to Phase 7)

- **Pure-move-friendly first slices (low risk, stand up the harness):** P0 pure helpers (163–204) → `useViewportLayout` → `useKeyboardShortcuts` → `useStageStepNav` → `useBrowserRun`. These are Tier-A/Tier-C-clean or own their refs locally.
- **Atomic effect groups become single hooks** (Tier A): preset config-sync inside `usePresetLifecycle`; stage→step→viz inside `useStageStepNav`; auto-run trio inside `useBrowserRun`.
- **Medium hooks** (`useLiveRuntime`, `usePresetLifecycle`, `useSaveDeploy`, `useRunInGame`) sequence respecting §5 init order; thread busy flags + shared values, never re-publish.
- **High-risk last** (`useLayerSelection`, `useEraOverlayControl`) — most entangled via `selection` + the `overlayDataTypeKey`→`useVizState` circular dep; extract once the harness + lower-risk hooks are proven.
- **Improve-slice candidates** (separate, flagged, tested): dead write-only `setLiveRuntimeSnapshot` (529); `useLatestRef` formalization (invariant a). ~~effect→derived for 2198~~ **RETRACTED** — see §7.1. The only safe effect→derived candidate left is the `manualEra` clamp (2164) and even that is now in an atomic group; treat effect→derived as out-of-scope unless a pinned test proves the timing is preserved.

---

## 7. Adversarial verification — confirmed corrections (supersede §1/§4/§6 where noted)

> A 4-skeptic adversarial pass (each tasked to REFUTE a load-bearing claim) returned **refuted-with-findings on all four** — but feasibility holds: the decomposition is sound **with** the constraints below. These are decisions for Phase 7, not open questions. Each is line-anchored and was verified against source.

### 7.1 A FOURTH atomic effect group (supersedes §1 Tier-B "overlay transient")
**era-clamp (2164, writes `manualEra`) MUST precede overlay-variant-pref (2198, reads `manualEra` in its BODY at 2231, writes `overlayVariantKeyPreference`).** The output feeds `useVizState` (599) and **persists** — it is NOT a self-healing one-frame artifact (it only re-resolves if the slider moves again). → Add to the atomic-required set; both effects + `setManualEra`/`setOverlayVariantKeyPreference` co-resident, source order preserved. **Retract** the "2198 → derived memo" nomination — promoting 2198 while 2164 stays an effect breaks the ordered `manualEra` read.

### 7.2 MERGE Layer + Era/Overlay (+ the viz side of Stage/Step) → one `useVizSelection` hook (REVERSES §4 refinement #1)
`useLayerSelection` ⇄ `useEraOverlayControl` is a **genuine cycle through `useVizState`**, not two hooks sharing only a dep: `overlayDataTypeKey` (out → `useVizState` input 598) **and** `overlayVariantKeyPreference` (back-in → `useVizState` input 599, written by effect 2198). The earlier "split" only fixed the forward edge. → They are one fixpoint; **do not split**. One `useVizSelection` hook owns `useVizState` + the full selection cascade (dataType→space→mode→variant→era→overlay→layerKey) + effects 608/617 (autofit — see 7.6)/2164/2188/2198. Keep derivation logic in pure helpers (already in `features/viz/*`) so the hook stays testable by contract (manifest + action → resolved layerKey + option lists).
Also: **viz step/layer is co-written by Stage/Step nav** (effect 13 at 867; `handleRiverLakeInspectorLayerSelect` writes both viz AND `setSelectedStageId/StepId`). → Give the `(selectedStageId, selectedStepId, viz step/layer)` navigation triple a **single owner**: `useVizSelection` owns the selection/exploration domain end-to-end (absorbs stage/step nav), exposing `navigateTo(stageId, stepId)`; no other hook touches `setSelectedStageId/StepId` or the mutable `viz` object directly — only its READ projection (`activeBounds`/`manifest`/`effectiveLayer`) is threaded out.

### 7.3 The error channel is HOST-OWNED (new — omitted from §3 DAG)
`localError`/`setLocalError`/`clearLocalErrorIfCurrent` is a **5-writer** value (`useVizState.onError` 602, `useBrowserRun` 877/883, `useRunInGame` 1705/1709, adoption effect 1668, `useStudioEvents` 1682-1683). It **cannot** live in `useBrowserRun` (creates a `useVizState`↔`useBrowserRun` circular init via `onError: setLocalError`). → **Host owns `localError`** (or a `useStudioError` initialized before `useVizState`); threads `setLocalError`+`clearLocalErrorIfCurrent` to all writers. `error = localError ?? browserRunner.state.error` (627) and `status` (1433) are re-derived **synchronously in host render scope** (never republished) — `status` feeds both the footer and the aria-live mirror; a one-render lag desyncs a11y from the visible UI.

### 7.4 Coordination layer: operation state + busy flags hoisted (resolves the init-order paradox)
`useBrowserRun` owns the auto-run trio (973) which reads `runInGameRunning`/`saveDeployRunning`, but those are produced by hooks that init AFTER it; `useVizState` (595) reads `browserRunning` (601). → A host-level **`useStudioOperations`** coordination layer, **initialized first**, owns `runInGameOperation` + `saveDeployOperation` (+ `localError` from 7.3) as `useState`, and derives the three busy booleans + `error`/`status` **synchronously, stable-from-first-render (default false)**. Domain hooks (`useRunInGame`/`useSaveDeploy`) receive the current value + setter and own the LOGIC (handlers, effects, fingerprint) but not the state declaration. Busy booleans are threaded (never re-published) into `useBrowserRun`'s auto-run effect and `useVizSelection`'s `allowPendingSelection`.

### 7.5 `lastAppliedPresetRef` single-owner + `markPresetApplied` contract; `applyAuthoringSnapshot` (supersedes §4.3, §4.4)
`lastAppliedPresetRef` is written by THREE hooks (preset effects; `useSaveDeploy` 1128/1191/1263; `useRunInGame` syncFromLive 1898) — violates invariant (b); param-passing a mutable ref does NOT satisfy it. The skip-guard (452) is **`===` object identity** (`lastApplied.config === resolved.config`) and only holds because `rememberRepoBackedConfig`→`toRepoBackedPreset` stores the SAME `sanitized` object (no clone, `repoBacked.ts:44`) that `resolvePreset` returns. →
- **`usePresetLifecycle` is the SOLE owner** of `lastAppliedPresetRef` (the only reader). It exposes a **synchronous** `markPresetApplied({key, config})` callback (writes the ref in-call, never in an effect, preserving exact object identity). `useSaveDeploy`/`useRunInGame` call it immediately **before** their `setRecipeSettings`/`setPipelineConfig` batch.
- The 5-setter ordered authoring write in `syncStudioFromLiveGame` (1902-1910, the single highest parity hazard) is extracted as one **`applyAuthoringSnapshot(snapshot)`** action owned by the authoring/preset layer (it already calls `markPresetApplied`); `useRunInGame` calls that one action — collapsing ~6 of its ~20 inputs and moving the parity-critical ordering into the owner.
- **Mandatory pinned test:** save-to-current → assert the preset-apply effect does NOT re-run `applyPresetConfig` (spy on call count). This is the only proof the `===` guard survived extraction.

### 7.6 Keep live-source-aware preset derivations in the HOST (resolves usePresetLifecycle ⇄ useRunInGame cycle)
`provedRunInGameSource` (364, from `runInGameOperation`+`lastRunInGameSource`, a `useRunInGame` concern) feeds `livePresets`/`displayedPresetOptions` (`usePresetLifecycle`); `useRunInGame` needs `resolvePreset` (`usePresetLifecycle`). → `usePresetLifecycle` owns ONLY catalog/local presets + `resolvePreset`/`presetActions` + apply-effects (pure on `recipeArtifacts`+store). The **host** computes `provedRunInGameSource`, `livePresets`, `displayedPresetOptions`, `runInGameMaterializationMode` and threads them — breaking the cycle explicitly.

### 7.7 Deck-autofit is its OWN hook, after useVizSelection (CORRECTED post-design-review — supersedes §1 Tier-B 8/9)
Autofit effects 608/617 read `deckApiRef`/`viewportSize`/`deckApiReadyTick` (owned by `useViewportLayout`) **AND** `viz.activeBounds`/`manifest`/`effectiveLayer.spaceId` (produced by `useVizSelection`). The autofit effect dep arrays need those viz VALUES to re-fire (a ref won't re-trigger the once-per-spaceId / first-manifest fit) — so they CANNOT live in `useViewportLayout` (called before `useVizSelection`). → Extract a separate **`useDeckAutofit`** hook called AFTER `useVizSelection`: it receives `deckApiRef`/`viewportSize`/`deckApiReadyTick` from `useViewportLayout` and the viz read-projection BY VALUE from `useVizSelection`, and owns effects 608/617 + `lastAutoFitSpaceRef`/`hasEverSeenVizManifestRef` + the Fit-button handler. `useViewportLayout` is called FIRST and has NO viz dependency. **Correction to §4 hook map:** `useVizSelection`/`useLayerSelection` do NOT depend on `deckApiRef`/`viewportSize`/`deckApiReadyTick` (those belong to the autofit effects only). `backgroundGridEnabled` (a viz-derived memo) becomes a host memo after `useVizSelection`.

### 7.8 Revised hook map (~10 hooks + host coordination)
1. **`useStudioOperations`** (coordination, init FIRST) — `runInGameOperation`+`saveDeployOperation`+`localError` state; synchronous busy booleans + `error`/`status`. 2. **`useViewportLayout`** — viewport/ResizeObserver, `deckApiRef`, panel geometry, pipeline-dag query+prune (NO autofit, NO backgroundGrid — see 7.7; init first, no viz dep). 2b. **`useDeckAutofit`** — autofit effects 608/617 + their refs + Fit handler, called AFTER `useVizSelection` (7.7). `backgroundGridEnabled` = host memo after `useVizSelection`. 3. **`useBrowserRun`** — browser run + auto-run trio (reads threaded busy flags). 4. **`useVizSelection`** — `useVizState` + full stage/step/dataType/space/mode/variant/era/overlay selection cascade (absorbs old Layer+Era+StageStep, 7.1/7.2). 5. **`usePresetLifecycle`** — catalog/local presets, `resolvePreset`, apply-effects, `lastAppliedPresetRef` owner, `markPresetApplied`, `applyAuthoringSnapshot` (7.5). 6. **`useSaveDeploy`** — save/deploy + waiter. 7. **`useRunInGame`** — run-in-game logic (calls `applyAuthoringSnapshot`/`markPresetApplied`). 8. **`useLiveRuntime`** — snapshot/setup staleness, relation. 9. **`useSetupControls`** — setup options + drift + live-game actions (autoplay/explore). 10. **`useKeyboardShortcuts`**. Plus the module pure-helpers and the `useLatestRef` helper. Host = layout + error-boundary + shortcuts host + the coordination wiring (architecture/10 §4).
