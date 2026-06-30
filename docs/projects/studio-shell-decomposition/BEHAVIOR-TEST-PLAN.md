# Behavior Test Plan — StudioShell → controller-hook decomposition (Phase 8 gating contract)

> **What this is.** The single converged, falsification-oriented test plan that gates the Phase-8 behavior-preserving extraction of `app/StudioShell.tsx` (~2,897 lines) into controller hooks. **This plan — not the diff — is what each Phase-8 slice is verified against.** A slice is "done" when its gating tests are green and its atomic-group / contract constraints are honored; a green diff that fails a gating test is a regression, not a refactor.
>
> **Provenance.** A 4-lane investigator fan-out (`brViz` · `presetSave` · `gameLive` · `layerKbd`) drafted **103 falsification specs** against an older **11-hook** map. This document is the workstream owner's synthesis (Claude Opus 4.8, 2026-06-28): every draft spec is **re-mapped onto the corrected §7.8 hook map** in [`INVESTIGATION-FINDINGS.md`](./INVESTIGATION-FINDINGS.md) §7 (the adversarial-pass corrections supersede the draft's slice names), cross-checked against the invariant/flow registry in [`PRODUCT-MODEL.md`](./PRODUCT-MODEL.md) §4–§6, and augmented with the three §7-mandated tests the draft predates.
>
> **Testing-design posture — falsification-first; test behavior, NOT structure.**
> - Every gating test states an **oracle** (the pass/fail predicate) and a **falsification case** (the concrete way an extraction silently breaks the behavior). A test that cannot be falsified by a plausible extraction mistake is not pinning anything.
> - **Structure is Habitat's job, not this plan's.** We do not assert "this hook exists" or "this file has N lines." We assert that the *behavior* (effect order, busy-gate timing, object identity, write order) survives. The few **source-text assertions** here exist only because React's effect-fire-order and render-phase-vs-effect-phase timing **cannot be observed** in this harness (see §2) — they are the practical oracle for compile-time timing invariants, gated to skip if the target file is absent during phased extraction.
> - **Test-kind ladder (prefer the highest rung that can falsify the behavior):**
>   1. **pure state-machine extraction** — extract an effect cluster as a deterministic function (inputs → calls/state) and drive it with `vitest` fake timers. No React renderer. *Strongly preferred* — it is the only kind that runs in this node-environment harness with zero new deps and makes Tier-A cascades directly falsifiable.
>   2. **`renderHook`** (`@testing-library/react`) — only when a behavior genuinely needs React's commit/effect/unmount lifecycle and cannot be modeled purely. **Carries a harness-setup cost** (see §2): this project currently has neither the dependency nor a jsdom environment.
>   3. **component** — `renderToStaticMarkup` (the existing pattern) for chrome/prop-wiring assertions; jsdom-mounted only as a last resort.
>   4. **manual-in-game** — reserved for behaviors that require a live Civ7 + daemon (MAN-1/2/3).

---

## 0b. Design-gate-review reconciliation (2026-06-28 — applied after the adversarial design review)

The Phase-7 design-review surfaced a blocker + gaps; the change set was fixed and re-validated `--strict`. Deltas this plan now reflects (authoritative over the older table wording below where they conflict):
- **`useDeckAutofit` is a SEPARATE slice** (the autofit effects 608/617 depend on viz VALUES produced by `useVizSelection`, so they cannot live in `useViewportLayout` which is called first). The autofit specs **VL-3, VL-4, VL-5, LS-7 move from §3.2 to a new §3.2a (`useDeckAutofit`)**, lifted AFTER `useVizSelection`, receiving `deckApiRef`/`viewportSize`/`deckApiReadyTick` + the viz read-projection. `useViewportLayout` keeps VL-1/VL-2.
- **+VL-6 (E27 — DAG fetch-gate):** new gating test under `useViewportLayout`. Oracle: the recipe-DAG query is `enabled === (stageView==='pipeline')`, fetches once per recipe, no focus/interval refetch. Falsifier: extraction flips it to eager `enabled:true` (copy-paste from sibling queries). Kind: pure (query-options assertion) + source-text.
- **+ADD-1b (live-sync identity):** sibling of ADD-1 for the `applyAuthoringSnapshot` path. Oracle: after sync-from-live, the apply-effect's `applyPresetConfig` spy stays 0 because host `livePresets[0].config` is referentially `lastRunInGameSource.pipelineConfig`. Falsifier: host rebuild/normalize of live-preset config breaks `===` → just-synced config reverts. Kind: renderHook (jsdom) + pure-driver.
- **PL-7/PL-11 oracles extended:** assert `rememberRepoBackedConfig` runs BEFORE the key-flip `setRecipeSettings` (the apply-effect resolver must see the new repo-backed entry).
- **renderHook is now PRIMARY (not fallback) for ADD-2/ADD-3/BG-4** (jsdom landed in Step 0): a same-commit renderHook read of the busy boolean + its gated consumer is the gating oracle; the source-text "no `useState`+`useEffect` republish" check is the supplement.
- **Ledger:** 106 → **108** gating specs (+VL-6, +ADD-1b).

## 1. Corrected slice set (the target this plan gates)

Per [`INVESTIGATION-FINDINGS.md` §7.8](./INVESTIGATION-FINDINGS.md), the **draft's 11-hook map is superseded**. The verified target is **~10 controller hooks + a host coordination layer + module pure-helpers + a `useLatestRef` helper**:

| # | Slice | Role | Carries a §7 contract? |
|---|---|---|---|
| H0 | **module pure-helpers** | already-extractable pure logic (`applyPresetConfig`, `buildDefaultConfig`, era snap, fingerprint, staleness guards, `studioBusyGateMessage`, selection derivation, auto-run/cascade state machines) | no (pure moves) |
| H0b | **`useLatestRef`** helper | formalize render-phase ref writes (invariant a) | **IMPROVE-2** |
| 1 | **`useStudioOperations`** (host coord, **init FIRST**) | owns `runInGameOperation`+`saveDeployOperation`+`localError` state; derives the three busy booleans + `error`/`status` **synchronously, stable-from-first-render** (§7.3, §7.4) | **busy-gate + error-channel** |
| 2 | **`useViewportLayout`** | viewport/ResizeObserver, `deckApiRef`, panel geometry, DAG query+prune, **deck-autofit pair** (§7.7), backgroundGrid | atomic deck-autofit pair |
| 3 | **`useBrowserRun`** | browser run + **auto-run trio** (reads *threaded* busy flags) | atomic auto-run trio |
| 4 | **`useVizSelection`** | `useVizState` + the full stage/step/dataType/space/mode/variant/era/overlay selection cascade (absorbs old `useStageStepNav`+`useLayerSelection`+`useEraOverlayControl`, §7.1/§7.2) | atomic stage→step→viz cascade + 4th atomic era→overlay group |
| 5 | **`usePresetLifecycle`** | catalog/local presets, `resolvePreset`, apply-effects (410→435), **`lastAppliedPresetRef` sole owner**, `markPresetApplied`, `applyAuthoringSnapshot` (§7.5) | **markPresetApplied identity + applyAuthoringSnapshot** |
| 6 | **`useSaveDeploy`** | save/deploy + terminal waiter; calls `markPresetApplied` | calls markPresetApplied contract |
| 7 | **`useRunInGame`** | run-in-game logic; calls `applyAuthoringSnapshot`/`markPresetApplied` | calls both contracts |
| 8 | **`useLiveRuntime`** | snapshot/setup staleness machine, abort, relation | atomic mount-lifecycle refs |
| 9 | **`useSetupControls`** | setup options + drift + live-game actions (autoplay/explore) | no |
| 10 | **`useKeyboardShortcuts`** | global keydown (reads everything via `shortcutsRef.current`) | latest-value ref pattern |

**Host** = layout + error-boundary + shortcuts host + the coordination wiring; it also owns the **live-source-aware preset derivations** (`provedRunInGameSource`, `livePresets`, `displayedPresetOptions`, `runInGameMaterializationMode`) per §7.6, breaking the `usePresetLifecycle ⇄ useRunInGame` cycle.

### Re-mapping of draft slice names → corrected slices (authoritative)

| Draft slice (older 11-hook) | Re-mapped corrected slice | Why (§ ref) |
|---|---|---|
| `useStageStepNav` (SS-*) | **`useVizSelection`** | cycle through `useVizState`; viz step/layer co-written by nav (§7.2) |
| `useLayerSelection` (LS-*) | **`useVizSelection`** | forward edge `overlayDataTypeKey`→`useVizState` (§7.2) |
| `useEraOverlayControl` (EO-*) | **`useVizSelection`** | back-edge `overlayVariantKeyPreference`→`useVizState`; same fixpoint (§7.2). EO-1 era→overlay is the **4th atomic effect group** (§7.1) |
| "cross-cutting busy gate" (BG-*), BR-12, `localError`/`status` | **`useStudioOperations`** (host coord) | owns op state + synchronous busy booleans + error channel; init FIRST (§7.3/§7.4) |
| `lastAppliedPresetRef` writers (PL-5/6/7/11, SD-11) | **`usePresetLifecycle` `markPresetApplied()`** single-owner; `useSaveDeploy`/`useRunInGame` *call* it (§7.5) | param-passing a mutable ref violates invariant (b); ref has ONE owner + reader |
| 5-setter ordered write (RIG-5) | **`applyAuthoringSnapshot()`** in preset/authoring layer; `useRunInGame` calls it (§7.5) | parity-critical order moves into the owner |
| live-source preset derivations | **host** (`provedRunInGameSource`, `livePresets`, …) (§7.6) | breaks preset⇄runInGame cycle |
| deck-autofit (VL-3/4/5, LS-7) | **`useViewportLayout`** (§7.7) | co-locate with `deckApiRef`+`viewportSize` producer |

---

## 2. Test-kind strategy (harness facts + already-pinned reference set)

### Harness facts (verified against the worktree source)
- **Runner:** `vitest run --config ../../vitest.config.ts --project mapgen-studio`.
- **Environment is `node`** (root `vitest.config.ts` sets `environment: "node"`; the `mapgen-studio` project does not override it). **There is no jsdom / happy-dom, and `@testing-library/react` is not a dependency.** This is the single most consequential harness fact: it makes **pure state-machine tests the default** and makes any `renderHook`/jsdom test a **harness-setup line item** (add `@testing-library/react` + a jsdom/happy-dom environment to the `mapgen-studio` project) that must be flagged, not assumed.
- **Existing test patterns to model on (cited per-spec below):**
  - *Pure hook-logic* → `test/config/useConfigCollapse.test.ts` (a hook's pure derivation tested directly as a function).
  - *Component (static)* → `test/ui/AppHeader.test.tsx` — uses **`renderToStaticMarkup` from `react-dom/server`** (no DTL). This is the only "component" pattern that runs today.
  - *Pure viz/derivation* → `test/viz/dataTypeModel.test.ts`, `test/viz/eraSelection.test.ts`, `test/viz/inspectorSelection.test.ts`, `test/viz/overlaySuggestions.test.ts`.
  - *Source-text / adoption pure* → `test/studioEvents/operationAdoption.test.ts` (the established `readFileSync` source-scan + pure-selector pattern; also the home of `studioBusyGateMessage` priority + adoption selectors).
  - *Status/timeout* → `test/mapConfigSave/status.test.ts`; *fingerprint/relation* → `test/runInGame/clientState.test.ts`, `test/runInGame/status.test.ts`; *staleness guards* → `test/liveRuntime/model.test.ts`; *setup drift* → `test/civ7Setup/setupConfig.test.ts`; *import* → `test/presets/importFlow.test.ts`; *migration* → `test/config/pipelineConfigMigration.test.ts`.
- **Source-text assertions are gated**: read with `readFileSync`; **skip (not fail) if the target file does not yet exist**, so phased extraction never produces false reds. They are fragile to renames — acceptable, because they are the only oracle for "ref write is in render scope, not in a `useEffect`" and "effect A is defined before effect B" (timing invariants React does not expose to a node test).

### The 15 ALREADY-PINNED behaviors (reference only — do NOT re-author)

These behaviors are already covered by existing tests. The refactor's obligation is to **keep calling that pure logic, in the same order, with the same timing** — which the hook/state-machine gating tests below assert. Do not write new tests for these; cite them as the floor.

| Spec id | Behavior (invariant) | Existing test |
|---|---|---|
| PL-8 | E12 — import rejects foreign recipeId | `test/presets/importFlow.test.ts` |
| RIG-1 | E14 — fingerprint/relation equality | `test/runInGame/clientState.test.ts` |
| RIG-3 | E16 — process-restart gate (stale suppresses) | `test/runInGame/status.test.ts` |
| RIG-8 | E19 — adoption never reverts terminal→in-flight | `test/studioEvents/operationAdoption.test.ts` |
| RIG-9 | E20 — daemon-identity TOCTOU guard | `test/studioEvents/operationAdoption.test.ts` |
| RIG-10 | E20 — adoption reads latest local op via lazy getter | `test/studioEvents/operationAdoption.test.ts` |
| LR-1 | E18 — `shouldCommitLiveRuntimeSnapshot` staleness | `test/liveRuntime/model.test.ts` |
| LR-5 | E18 — `shouldCommitLiveRuntimeSetup` staleness | `test/liveRuntime/model.test.ts` |
| LR-8 | E18b — live events drive bounded reads, no cadence | `test/studioEvents/operationAdoption.test.ts` |
| LR-9 | E25 — suggestions are `applyPath='visible-studio-control'` only | `test/liveRuntime/model.test.ts` |
| SC-1 | E22 — saved-config selection replaces (never merges) | `test/civ7Setup/setupConfig.test.ts` |
| SC-2 | E22 — drift detection cases | `test/civ7Setup/setupConfig.test.ts` |
| SC-7 | E22 — live setup projected/normalized before write | `test/civ7Setup/setupConfig.test.ts` |
| SC-8 | snapshotId stable across key order (canonical hash) | `test/liveRuntime/model.test.ts` |
| BG-2 | E23 — `studioBusyGateMessage` priority order | `test/studioEvents/operationAdoption.test.ts:339` |

> These 15 are the parity floor. Their pure logic (`applyPresetConfig`, `relationForRunInGameOperation`, `runInGameRequiresProcessRestart`, `selectOperationForAdoption`, `shouldCommit*`, `studioSetupConfigsEqual`, `studioBusyGateMessage`, `buildLiveRuntimeStatusState`) lives in `features/*` or `app/*` modules **already** — the extraction must not inline or re-derive any of it inside a hook. Several **new** gating tests below (e.g. BG-1, BR-12, RIG-2) assert exactly that "still calls the pinned pure logic, synchronously, in render scope" property.

---

## 2b. The three §7-mandated tests the draft predates (ADDED)

The draft was written against the 11-hook map and therefore could not author these three contract proofs. They are **mandatory gating tests** — without them, the corrected §7 contracts are unverified. Spec ids are assigned in the synthesis (`ADD-*`).

| id | Slice | Subject | Test kind | Oracle (1 line) | Falsification (1 line) | § |
|---|---|---|---|---|---|---|
| **ADD-1** | `usePresetLifecycle` ↔ `useSaveDeploy` | **`markPresetApplied` object-identity guard survived extraction** | hook (renderHook) or pure-driver | PASS: after save-to-current, the preset-apply effect (435) fires once on the post-save render but `applyPresetConfig` spy call-count stays **0** (the `===` skip-guard at 452 short-circuits because `markPresetApplied({key, config:sanitized})` stored the SAME object `resolvePreset` returns). FAIL: `applyPresetConfig` is called ≥1 after the save → identity broken (a clone/re-merge slipped in). | `useSaveDeploy` calls `markPresetApplied` but the stored `config` is a structural copy (or written after `setRecipeSettings`), so `lastApplied.config !== resolved.config` and effect 435 re-applies — reverting the just-saved config to the freshly-resolved preset config. | §7.5 |
| **ADD-2** | `useStudioOperations` (host coord) | **error channel is single-owner + `error`/`status` derived synchronously in render scope; footer `status` == aria-live `status`** | hook + source-text | PASS: a write from ANY of the 5 writers (`useVizState.onError`, `useBrowserRun` 877/883, `useRunInGame` 1705/1709, adoption 1668, `useStudioEvents` 1682) surfaces via the host-owned `setLocalError`; `error = localError ?? browserRunner.state.error` and `status` (1433) are plain render-scope derivations; the `status` value passed to the footer is **referentially the same** value passed to the aria-live mirror (one source, one render). FAIL: `error`/`status` republished via `useState`+`useEffect` (one-render desync) OR footer and aria-live read two independently-derived `status` values. | A hook re-publishes `status` through state, so the visible footer and the assistive-tech announcement disagree for one render (a11y desync); or `localError` is owned inside `useBrowserRun`, creating the `useVizState`↔`useBrowserRun` circular init via `onError`. | §7.3 |
| **ADD-3** | `useStudioOperations` (host coord) | **busy-gate has no one-render race: a second operation cannot start in the first render after another begins** | pure state-machine + source-text | PASS: the three busy booleans are computed in render scope and are **stable-from-first-render (default `false`, true on the very render the operation's status becomes `running`)**; a driver that flips `saveDeployOperation.status='running'` and, in the SAME render, calls the run-in-game gate sees `saveDeployRunning===true` and is blocked. FAIL: any boolean is `false` for one render after its operation starts (republished via `useState`+`useEffect`) → a second op slips through. | `useStudioOperations` exposes `runInGameRunning` via a `useState` mirror updated in `useEffect`; for one render it is `false` though the op has started → the auto-run flush effect (973) or a concurrent save passes the gate. | §7.4 |

> ADD-1, ADD-2 (hook half), ADD-3 (driver half) ideally run as `renderHook` tests; in the node-only harness their **falsification-equivalent** is: ADD-1 = pure-driver replay of `markPresetApplied`→effect-435-guard with an `applyPresetConfig` spy; ADD-2/ADD-3 = the source-text half (no `useState`+`useEffect` republish of `localError`/`status`/busy booleans; single derivation site) **plus** a pure driver of the synchronous derivation. The source-text halves of ADD-2/ADD-3 overlap BG-1/BR-12 and are co-authored with them.

---

## 3. Per-slice plan (recommended Phase-8 sequence)

Each subsection: the controller-hook it gates, its **gating tests** (spec id · subject · disposition · kind · oracle · falsification · already-pinned), and the atomic-group / contract constraint it must honor. Oracles/falsifications are compacted from the draft and the §7 additions; full text per spec is in the lane drafts.

### 3.0 — H0: module pure-helpers  (pure moves; stand up the harness first)

Gates: the pure logic every hook must keep *calling* rather than inlining. These are the lowest-risk slices and most are already-pinned or trivially testable as functions.

| id | subject | disp | kind | oracle | falsification | pinned |
|---|---|---|---|---|---|---|
| PL-1 | E10 `applyPresetConfig` atomicity | preserve | pure | returns `{value:null, errors:[…]}` on any normalizeStrict error (no mutation); `{value:<normalized>, errors:[]}` on success | partial preset applied despite a failing rule | no |
| PL-12 | `applyPresetConfig` full skeleton→migrate→merge→normalize pipeline | preserve | pure | partial-but-valid preset → non-null value, errors `[]`; a 2nd `normalizeStrict` on the result is also clean | skeleton-merge skipped → missing-field errors | no |
| PL-13 | `buildDefaultConfig` validity for standard recipe | preserve | pure | `normalizeStrict(buildDefaultConfig(...))` → `[]` | schema/defaultConfig divergence yields a silently-invalid reset config | no |
| PL-9 | E12 import runs migration BEFORE normalize | preserve | pure | retired-key file → `ok:true` after migrate; not `invalid-config` | normalize on un-migrated config → spurious reject | no |
| RIG-2 | E15 materializationMode determinism (durable iff builtin+sourcePath+config-match) | preserve | pure | pure fn `(preset, resolvedConfig, lastSaveDeployConfig, pipelineConfig)→'durable'|'disposable'` maps all 3 scenarios | mode read from effect-assigned ref → previous-render mode → corrupts game-file routing (security-adjacent) | no |
| RIG-4 | E14/E15 fingerprint includes materializationMode | preserve | pure | `buildRunInGameFingerprint` differs across mode flip | mode excluded → durable launch appears 'current' after disposable op | no |
| LS-1 | E8 `deriveSelection(dataTypeModel, selectedLayerKey)` is one shared object | preserve | pure | same inputs → same `selection`; JSX and all 5 callbacks read the identical ref | a callback re-reads `viz.selectedLayerKey` → pre-render key disagreement | no |
| LS-2 | E8 default prefers first tile-space grid layer | preserve | pure | model `[world.xy points, tile.hexOddR grid]` → selection spaceId `tile.hexOddR`, mode `grid` | picks `dataTypes[0]` (world.xy) | no |
| LS-3 | `selectLayerFor` space/mode/variant fallbacks + era-snap | preserve | pure | calls `viz.setSelectedLayerKey` with resolved variant key; no call if dataType absent | dropped space fallback → never calls setter (canvas stuck) | no |
| EO-2 | era clamp stays within `[min,max]` | preserve | pure | `clampNumber(5,1,3)===3` | clamp dropped → manualEra escapes range | no |
| SC-3 | `studioSetupConfigsEqual` key-order-independent | preserve | pure | equal regardless of key order; differs on any value | `JSON.stringify` w/o normalization → spurious perpetual 'Custom' | no |
| BG-2 | E23 `studioBusyGateMessage` priority order | preserve | pure | browser ≻ run-in-game ≻ save-deploy | wrong priority blocker reported | **yes** |
| PL-8 | E12 `resolveImportedPreset` rejects foreign recipeId | preserve | pure | `{ok:false, kind:'unknown-recipe'}`; never reaches migrate/normalize | catalog-check after migrate → throws first | **yes** |
| RIG-1 | E14 `relationForRunInGameOperation` | preserve | pure | current/stale/unknown per fingerprint+requestId | broken equality → launches stale config as 'current' | **yes** |
| RIG-3 | E16 `runInGameRequiresProcessRestart` | preserve | pure | stale relation suppresses restart even if reloadBoundary matches | restart fires for stale config → destroys running session | **yes** |

**Constraint:** these are pure moves — no atomic-group obligation. Build/confirm them first; they are the harness floor every later hook calls into.

### 3.1 — H0b: `useLatestRef` helper  →  IMPROVE-2 (see §4)

### 3.2 — `useViewportLayout`  (init BEFORE `useVizSelection`; §7.7)

Gates: viewport/ResizeObserver, `deckApiRef` (single-owner ref, threaded by reference), panel geometry, DAG query+prune, **deck-autofit pair (atomic, §7.7)**, backgroundGrid.

| id | subject | disp | kind | oracle | falsification | pinned |
|---|---|---|---|---|---|---|
| VL-1 | ResizeObserver updates `viewportSize` (effect 798) | preserve | hook (renderHook+jsdom) | resize → `viewportSize` equals observed rect; observer disconnected on unmount | wrong/own ref observed → size never updates → first-manifest autofit breaks | no |
| VL-2 | DAG expansion prune (effect 301) | preserve | pure | phantom ids removed → `setPipelineExpandedStageIds` once; all-valid → 0 calls (identity preserved) | identity check dropped → setter every dag update (render loop) | no |
| VL-3 | autofit on space change fires once per spaceId (effect 608) | preserve | pure (state machine) | `fitToBounds` 1× per distinct spaceId; same spaceId again → 0 | `lastAutoFitSpaceRef` identity broken → fires every render | no |
| VL-4 | first-manifest autofit once/session (effect 617) | preserve | pure (state machine) | `fitToBounds` exactly once across manifest updates | `hasEverSeenVizManifestRef` moved to `useState` → fires twice | no |
| VL-5 | autofit pair source order 608→617 (Tier-B) | preserve | pure (state machine) + source-text | both fire same commit → 617 wins (the second call uses first-manifest bounds) | reversed order → space-change fit wins → wrong initial camera | no |
| LS-7 | autofit refs travel together; 608 before 617 | preserve | source-text | both effects in source order in `useViewportLayout`; `lastAutoFitSpaceRef`+`hasEverSeenVizManifestRef` declared in the same scope | refs split across hooks → leaked/reversed autofit | no |

**Atomic constraint:** deck-autofit 608+617 + `lastAutoFitSpaceRef`/`hasEverSeenVizManifestRef` are one Tier-B ordered group co-resident here (§7.7). `deckApiRef` is a single owner; `useVizSelection` receives only the viz **read-projection** (`activeBounds`/`manifest`/`effectiveLayer.spaceId`) as params, never the deck ref by value-copy.

### 3.3 — `useStudioOperations`  (host coordination — **INIT FIRST**; §7.3/§7.4)

Gates: `runInGameOperation`+`saveDeployOperation`+`localError` **state declarations**; the three busy booleans + `error`/`status` derived **synchronously, stable-from-first-render**. Domain hooks receive value+setter and own the LOGIC, not the declaration.

| id | subject | disp | kind | oracle | falsification | pinned |
|---|---|---|---|---|---|---|
| BG-1 | busy booleans derived synchronously, no `useState`+`useEffect` republish | preserve | source-text + pure | each boolean a plain `const` from op status; no `setBrowserRunning`-in-effect pattern; default `false` render 1 | a boolean republished via state → one-render-lag race | no |
| BG-3 | `operationControlsDisabled` = OR of all three; single prop to GameConsole | preserve | source-text | the three-way OR computed once; not re-derived with fewer flags downstream | omitting `browserRunning` → live controls fire concurrent oRPC during a browser run | no |
| BG-4 | `viz.allowPendingSelection` fed synchronously from `browserRunning` | preserve | source-text | `useVizState({ allowPendingSelection: browserRunning })` reads the synchronous `const`; `false` render 1 | lagged copy → pending selections mis-gated for one frame | no |
| BR-12 | busy booleans not republished (invariant c) | preserve | source-text | no `useState`+`useEffect([browserRunning])→set…` pattern in any extracted hook | one-render lag → auto-run flush (973) fires spurious run | no |
| **ADD-2** | error channel single-owner; `error`/`status` synchronous; footer==aria-live | preserve | hook + source-text | (see §2b) all 5 writers surface via host `setLocalError`; footer `status` === aria-live `status` (one source) | republish → a11y desync; or `localError` owned in a domain hook → circular init | **§7.3** |
| **ADD-3** | busy-gate no one-render race | preserve | pure state-machine + source-text | (see §2b) flipping `…running` and gating in the SAME render blocks the second op | boolean false for one render after start → second op slips through | **§7.4** |

**Contract constraint ("atomic move with contract", not a trivial move):** `useStudioOperations` resolves the init-order paradox (§7.4) — `useBrowserRun`'s auto-run trio (973) reads `runInGameRunning`/`saveDeployRunning`, which are produced by hooks that init AFTER it; `useVizState` (595) reads `browserRunning`. By hoisting op state + synchronous busy/error derivation to a coordination layer initialized **first**, the booleans are stable-from-first-render and threaded (never re-published) into `useBrowserRun`'s auto-run effect and `useVizSelection`'s `allowPendingSelection`. The error channel (§7.3, 5-writer `localError`) is owned here (or a `useStudioError` initialized before `useVizState`), with `setLocalError`+`clearLocalErrorIfCurrent` threaded to all writers.

### 3.4 — `useKeyboardShortcuts`  (low risk; reads everything via `shortcutsRef.current`)

| id | subject | disp | kind | oracle | falsification | pinned |
|---|---|---|---|---|---|---|
| KB-1 | `shortcutsRef.current = {...}` reassigned in render scope, before the keydown effect | preserve | source-text | bulk assignment OUTSIDE any `useEffect`, BEFORE the `addEventListener` effect | moved into effect → keydown reads prior-render `triggerRun`/`reroll` | no |
| KB-2 | keydown reads `shortcutsRef.current` at invocation; deps `[]` | preserve | source-text | `const ctx = shortcutsRef.current` first; no free `stages`/`triggerRun` closure capture; `useEffect(…, [])` | direct closure capture → stale list/run callback | no |
| KB-3 | modifier shortcuts fire in editable targets; bare keys suppressed | preserve | pure | `shouldIgnoreGlobalShortcutsInEditableTarget` true only when editable AND no meta/ctrl/alt | `isEditable` alone → Cmd+Enter suppressed in inputs | no |
| KB-4 | stage/step nav clamps at list boundaries; `event.repeat` honored | preserve | pure | Cmd+Down on last stage → no `handleStageChange`; same for first | guard dropped → boundary re-fires Tier-A cascade | no |

**Constraint:** keyboard is Tier-C (effect 2453 reads everything via `shortcutsRef.current`, reassigned in render). Depends on `useLatestRef` (IMPROVE-2) for the render-phase ref write. KB-3's `shouldIgnoreGlobalShortcutsInEditableTarget` should be a **named export** (improve, see §4 note) so the pure test imports it; until then the source-text fallback applies.

### 3.5 — `useBrowserRun`  (auto-run trio is atomic, Tier-A; reads THREADED busy flags)

| id | subject | disp | kind | oracle | falsification | pinned |
|---|---|---|---|---|---|---|
| BR-1 | auto-run E1: disabling autoRun clears pending + cancels timer (929) | preserve | pure (fake timers) | `startBrowserRun` never called after disable, even if dirty when enabled | scheduled timer fires after disable → silent duplicate run | no |
| BR-2 | auto-run E2: config-change-while-running sets pending; exactly one run on completion (939/973) | preserve | pure (fake timers) | call count == 1 after completion; pending false | 0 (dropped) or 2 (duplicate) | no |
| BR-3 | auto-run E3: suppressed while runInGame/saveDeploy running (E24) | preserve | pure (fake timers) | no timer/run while busy; one sequence after flags clear | busy flag one render late → run during in-flight op (E24 race) | no |
| BR-4 | auto-run E4: suppressed while overridesDisabled (E24) | preserve | pure (fake timers) | 0 calls while disabled; one after re-enable | missing guard on 973 flush arm → queued-while-disabled run fires | no |
| BR-5 | debounce resets on each config change (300ms) | preserve | pure (fake timers) | 250ms → new change → 300ms → exactly 1 run | cleanup cancels but never restarts → 0 or 2 | no |
| BR-13 | no leaked timer after disable mid-debounce (refs co-located) | **improve** | pure (fake timers) | autoRun off at 150ms → +300ms → 0 calls | 929 and 939 in different hooks; one holds the timer ref → leak | no |
| BR-6 | reroll passes seed directly (bypasses store-read race) | preserve | pure | seed arg to `start` equals `randomCiv7StudioSeed()` return, not store seed | reads `recipeSettings.seed` from closure → runs prior seed | no |
| BR-7 | reroll/triggerRun blocked by runInGame/saveDeploy + toast (E23) | preserve | pure | toast once (info); `startBrowserRun` 0 | busy flag late → call slips through | no |
| BR-8 | `startBrowserRun` passes `configOverrides:undefined` when overridesDisabled | preserve | pure | undefined when disabled; migrated config when enabled | falsy-but-not-false passes config | no |
| BR-9 | `startBrowserRun` aborts invalid seed + toast, no `start` (flow 4.7) | preserve | pure | `start` count 0 for `''`/`abc`/`-1`/`0x8000_0000`; sets localError | guard moved to caller → Cmd+Enter path bypasses | no |
| BR-10 | `isDirty` true on any of world/recipe/pipeline divergence | preserve | pure | true if any of 3 equality checks fails vs snapshot; false if all match | only compares pipelineConfig → mis-reports | no |
| BR-11 | `vizIngestRef.current = viz.ingest` is render-scope (invariant a) | preserve | source-text | assignment NOT inside a `useEffect` | moved into effect → early VizEvents dropped to stale no-op ingest | no |

**Atomic constraint (Tier-A, highest risk):** effects 929+939+973 + `autoRunPendingRef`/`autoRunTimerRef` + `startBrowserRun` are ONE hook, source order preserved (§1 Tier-A). Busy flags are **threaded from `useStudioOperations`**, never re-published here (BG-1/BR-12/ADD-3). `vizIngestRef` (BR-11) and `browserRunning` derivation (BR-12) stay in render scope. **Strongly prefer** extracting the trio as a pure state machine `(autoRunEnabled, browserRunning, runInGameRunning, saveDeployRunning, overridesDisabled, pendingRef, timerRef, configDirty) → {scheduleTimer, cancelTimer, setPending, fireRun}` driven by fake timers — it makes BR-1…BR-5/BR-13 falsifiable with zero React.

### 3.6 — `useVizSelection`  (HIGH risk; absorbs Stage/Step + Layer + Era/Overlay; §7.1/§7.2)

Gates the whole selection/exploration fixpoint: `useVizState` + the dataType→space→mode→variant→era→overlay→layerKey cascade + the `(selectedStageId, selectedStepId, viz step/layer)` navigation triple (single owner; exposes `navigateTo(stageId, stepId)`). Derivation logic stays in `features/viz/*` pure helpers (already pinned for snap/model) so the hook is testable by contract.

| id | subject | disp | kind | oracle | falsification | pinned |
|---|---|---|---|---|---|---|
| SS-1 | stage→step cascade: step resets to first when stage changes (857→862→867) | preserve | pure (state machine) | after stage change, `selectedStepId==steps[0]` (if old step foreign); `viz.setSelectedStepId` once | stage effect also calls `viz.setSelectedStepId` → double call + stale flash | no |
| SS-2 | viz-sync arm clears layer on step change (867); guarded no-op when equal | preserve | pure | `setSelectedLayerKey(null)` once per real step change; not when viz step already equals | guard dropped → clobbers user layer every render | no |
| SS-3 | step retained when present in new stage (862) | preserve | pure | no `setSelectedStepId` when current step exists in new stage | `some(...)` guard dropped → resets to steps[0] always | no |
| SS-4 | effect 867 exhaustive-deps suppression preserved (deps=[selectedStepId]) | preserve | hook (renderHook) | effect fires only on `selectedStepId`, not on unrelated viz renders | linter adds viz refs → echo loop / redundant clears | no |
| SS-5 | stages memo: 1-indexed StageOption | preserve | pure | `stages[0].index==1`; label fallback `stageLabel ?? formatStageName` | 0-based index → Cmd+Up/Down skips first stage | no |
| SS-6 | steps memo derived only from selected stage | preserve | pure | `steps.length==selectedStage.steps.length`; `[]` when no stage | forgets `selectedStageId` dep → stale steps | no |
| LS-1 | `selection` shared single object (E8) | preserve | pure | (see §3.0) | (see §3.0) | no |
| LS-2 | default prefers tile-grid layer (E8) | preserve | pure | (see §3.0) | (see §3.0) | no |
| LS-3 | `selectLayerFor` fallbacks + era snap | preserve | pure | (see §3.0) | (see §3.0) | no |
| LS-4 | `handleDataTypeChange` applies era in fixed, bypasses in auto | preserve | pure | fixed → `{era:manualEra}`, era-snapped key; auto → no era option | always omits era → era-1 shown while slider at era-3 | no |
| LS-5 | `handleVariantChange` updates manualEra; resets eraMode only for non-era variant in fixed | preserve | pure | era variant → set manualEra, keep mode; non-era in fixed → setEraMode('auto') | resets mode on era pick → flips to auto immediately | no |
| LS-6 | `overlayDataTypeKey` derived BEFORE `useVizState` (render-phase) | preserve | source-text | render-scope derivation `overlaySelection?.overlayDataTypeKey ?? null` precedes `useVizState(...)` | moved into `useState`/`useEffect` → useVizState gets null for one render (flicker) | no |
| EO-1 | era-clamp (2164) before overlay-variant-pref (2198) — 4th ATOMIC group | preserve | source-text | era-clamp effect block precedes overlay-pref effect block in source | reversed → `findVariantKeyForEra(unclamped manualEra)` writes invalid overlay key (persists) | no |
| EO-3 | overlay prune (2188) clears stale `overlaySelectionId` | preserve | pure | candidates empty/absent → `setOverlaySelectionId('')`; present → no call | prune dropped → stale overlay key to useVizState | no |
| EO-4 | overlay-variant-pref (2198) era-snapped in fixed; null in auto; change-guarded | preserve | pure | fixed manualEra=2 over era:1/era:3 → era:1 key (nearest-lower); else null | missing space-fallback → null when spaces differ | no |
| EO-5 | `handleEraModeChange` seeds manualEra from `autoEra ?? manualEra ?? min` | preserve | pure | auto→fixed with autoEra=3 → manualEra 3, `selectLayerFor({era:3})` | omits seeding → starts fixed on stale era | no |
| EO-6 | `handleEraValueChange` clamps + activates fixed | preserve | pure | era=7 on `{1,5}` → manualEra 5, `selectLayerFor({era:5})`; no-op if no selection/range | no clamp → slider drives manualEra out of range | no |

**Atomic constraints:** (1) stage→step→viz cascade 857+862+867 is Tier-A, one hook, source order; **keep effect 867's `exhaustive-deps` suppression** (deps `[selectedStepId]` only). (2) The **4th atomic group** (§7.1): era-clamp 2164 + overlay-variant-pref 2198 + `setManualEra`/`setOverlayVariantKeyPreference` co-resident, source order (2164 before 2198) — its output **persists** (not self-healing), so reversal is a real bug. (3) The `overlayDataTypeKey`→`useVizState`(598) forward edge AND `overlayVariantKeyPreference`→`useVizState`(599) back edge form a genuine cycle — `overlayDataTypeKey` MUST be render-phase before `useVizState` (LS-6); do not split this hook. (4) `useVizSelection` is the **sole writer** of `setSelectedStageId/StepId` and the mutable `viz` object; only the viz read-projection is threaded out.

### 3.7 — `usePresetLifecycle`  (MEDIUM; **markPresetApplied + applyAuthoringSnapshot contracts**; §7.5)

Gates: catalog/local presets, `resolvePreset`, apply-effects (410→435 Tier-A), `lastAppliedPresetRef` **sole owner**, `markPresetApplied`, `applyAuthoringSnapshot`.

| id | subject | disp | kind | oracle | falsification | pinned |
|---|---|---|---|---|---|---|
| PL-2 | apply effect (435): config replaced only on success; PresetErrorDialog on failure; ref advanced | preserve | hook (renderHook) | bad key → presetError set, config unchanged; good key → setPipelineConfig once, ref `={key,config}` | mutates on error / ref not advanced | no |
| PL-3 | 410 must fire BEFORE 435 (Tier-A reseed/apply) | preserve | hook (renderHook) | →'none': config==buildDefaultConfig, ref null; 'none'→key: config==applyPresetConfig | split across hooks → apply-before-reset → non-none preset with defaults-only | no |
| PL-4 | idempotence guard in 435 (same key+config → no re-apply) | preserve | hook (renderHook) | `applyPresetConfig` 0× when ref already matches incoming key+config | ref captured at closure time → stale → re-apply every render | no |
| PL-5 | ref written synchronously within successful apply, before next effect reads | preserve | hook (renderHook) | `applyPresetConfig` exactly once across initial apply + store re-render | ref written after async boundary → 2nd render re-applies | no |
| PL-6 | 410 clears ref to null on 'none' | preserve | hook (renderHook) | after none-reset ref null; re-apply same key calls applyPresetConfig again | missing null assign → apply→none→apply-same silently skips | no |
| PL-10 | cross-recipe import → `pendingImport`, requires confirm | preserve | hook (renderHook) | cross-recipe file: no `importPresetValue`, pendingImport set; confirm→apply; cancel→never | inlines recipe-check → applies foreign config w/o confirm | no |
| PL-15 | `handleDeletePreset` resets to 'none' only when `deleted:true` and kind local | preserve | hook (renderHook) | local+deleted → preset 'none'; non-local or not-deleted → no reset | unconditional reset after deleteLocal | no |
| PL-9 | E12 migration BEFORE normalize (import path) | preserve | pure | (see §3.0) | (see §3.0) | no |
| PL-1 / PL-12 / PL-13 | `applyPresetConfig` / `buildDefaultConfig` validity | preserve | pure | (see §3.0) | (see §3.0) | no |
| **ADD-1** | `markPresetApplied` object-identity guard | preserve | hook + pure-driver | (see §2b) save-to-current → effect 435 fires but `applyPresetConfig` count 0 (`===` guard holds) | clone/late-write breaks `===` → re-apply reverts config | **§7.5** |

**Contract constraints ("atomic move with contract"):**
- **`lastAppliedPresetRef` is sole-owned here** (only reader). Exposes a **synchronous** `markPresetApplied({key, config})` (writes ref in-call, never in an effect, preserving exact object identity — relies on `rememberRepoBackedConfig`→`toRepoBackedPreset` storing the SAME `sanitized` object, `repoBacked.ts:44`). `useSaveDeploy`/`useRunInGame` call it immediately BEFORE their `setRecipeSettings`/`setPipelineConfig` batch. Param-passing the mutable ref is forbidden (violates invariant b).
- **`applyAuthoringSnapshot(snapshot)`** owns the 5-setter ordered write (§7.5; see RIG-5 in §3.9) — it already calls `markPresetApplied`; `useRunInGame` calls this one action.
- Apply-effects 410→435 are Tier-A: one hook, source order. Live-source-aware derivations stay in the **host** (§7.6), not here.

### 3.8 — `useSaveDeploy`  (MEDIUM; calls `markPresetApplied`; waiter contract E21)

| id | subject | disp | kind | oracle | falsification | pinned |
|---|---|---|---|---|---|---|
| SD-1 | waiter returns immediately when already terminal (reads ref, not state) | preserve | pure (factory) | terminal ref + matching requestId → resolves in one microtask; waiters map size 0 | checks React state → batching delay → falls through to waiter (hangs) | no |
| SD-2 | waiter registers + resolves on terminal SSE (effect 548) | preserve | hook (renderHook) | pending promise resolves with terminal status; map size 0 | ref assign split from 548 → one-render lag → mismatched status | no |
| SD-3 | waiter rejects after 5-min timeout; cleaned up | preserve | pure (fake timers) | +5min+1ms → rejects 'did not report a terminal status in time'; map size 0 | wrong constant / reject not called → silent hang | no |
| SD-4 | unmount rejects all pending waiters 'wait cancelled' (effect 558) | preserve | hook (renderHook) | unmount → all promises reject; map empty | cleanup folded into 548 (dep-change only) → orphaned on unmount | no |
| SD-5 | 548 fires BEFORE 558 in same commit (Tier-B order) | preserve | hook (renderHook) | terminal+unmount same act() → resolves (not 'wait cancelled') | 558 defined before 548 → cleanup wins → spurious cancel | no |
| SD-10 | `saveDeployOperationRef.current` sync assign at top of 548 (invariant a) | preserve | hook + source-text | ref==operation at the waiter-check point | assign moved to separate effect → stale ref read in sync branch | no |
| SD-6 | `saveRepoBackedConfigWithState` busy-gate blocks save | preserve | hook (renderHook) | busy → `{ok:false, error}`, no RPC; priority browser≻run≻save | reads busy via effect (lag) → save starts during a run | no |
| SD-7 | awaits waiter only if RPC status not already terminal | preserve | hook (renderHook) | complete status → no wait; running → awaits waiter | always awaits → 5-min hang on terminal RPC | no |
| SD-8 | sets initial 'queued' op BEFORE first await | preserve | hook (renderHook) | `setSaveDeployOperation('queued')` synchronously before RPC resolves | moved after await → second save passes gate | no |
| SD-9 | adopted terminal save-deploy resolves pending waiter (17→6 cross-commit) | preserve | integration (renderHook, both hooks) | adoption `setSaveDeployOperation('complete')` → 548 next commit resolves waiter; no timeout | render-order inversion → 548 before commit → hang | no |
| SD-11 | `handleSaveDialogConfirm` updates ref+config only on ok||saved | preserve | hook (renderHook) | full failure → ref/config unchanged, error toast, dialog closes | `&&` instead of `||` blocks partial-save path | no |
| PL-7 | `handleSaveDialogConfirm` writes `markPresetApplied` before `setRecipeSettings` | preserve | hook (renderHook) | post-save: pipelineConfig==sanitized; effect 435 fires but skips (idempotent) | ref written after setRecipeSettings → 435 re-applies → reverts to defaults | no |
| PL-11 | `handleSaveToCurrent` write order (no stale ref) | preserve | hook (renderHook) | local preset: preset `builtin:<id>`, config==sanitized on post-resolve render | ref deferred → 435 re-applies different config | no |

**Contract constraint:** the waiter (`waitForSaveDeployTerminalEvent`) is cleanest as a **standalone factory** taking `saveDeployOperationRef`+`saveDeployWaitersRef` (makes SD-1/SD-3 pure). `lastAppliedPresetRef` is NOT owned here — PL-7/PL-11/SD-11 call `markPresetApplied` (§7.5), they do not write the ref directly. Waiter mirror (548) and unmount cleanup (558) are a Tier-B ordered pair (548 first). Busy flags threaded from `useStudioOperations`. Init **before** the adoption effect fires (§5).

### 3.9 — `useLiveRuntime`  (MEDIUM; init BEFORE `useRunInGame`; atomic mount-lifecycle refs)

| id | subject | disp | kind | oracle | falsification | pinned |
|---|---|---|---|---|---|---|
| LR-2 | snapshot abort: prior in-flight aborted on new request (E18) | preserve | hook (renderHook + mock orpcClient) | request-2 while -1 pending → -1's AbortController signaled; `shouldCommit({aborted:true})===false` | forgets `abort()` → both commit; older overwrites newer | no |
| LR-3 | mounted-ref guard: no setState after unmount (E18) | preserve | hook (renderHook + unmount) | unmount mid-fetch → no setLiveRuntime/setLiveSetup/etc. calls | mounted ref not carried into hook → post-unmount writes | no |
| LR-6 | `applyLiveGameState` null-request path: abort + no fetch | preserve | pure | status!=='ok' → `abort()` + key null, no `readLiveRuntimeSnapshot`; valid → fires read | null-guard removed → error events fetch (fail storm) | no |
| LR-7 | snapshotStatus 'loading' only on snapshotId change / non-ok prior | preserve | pure | same snapshotId twice → stays 'ok'; new id → 'loading' | always 'loading' → flicker every autoplay tick | no |
| LR-4 | `liveSnapshotFailureCountRef` display-only (E18b) | preserve | source-text + pure | failureCount increments; NO setTimeout/setInterval/retry from it | adds `setTimeout(read, count*1000)` → retry fan-out DoS | no |
| LR-1 / LR-5 | staleness guards `shouldCommit*` | preserve | pure | (already-pinned, §2) | — | **yes** |
| LR-8 | events drive bounded reads, no cadence | preserve | source-text | (already-pinned, §2) no timer patterns in bodies | adds `setInterval` fallback → polling | **yes** |
| LR-9 | suggestions `visible-studio-control` only | preserve | pure | (already-pinned, §2) | — | **yes** |
| SC-7 | live setup normalized/projected before write (E22) | preserve | pure | (already-pinned, §2) `normalizeStudioSetupConfig(studioSetupConfigFromLiveSnapshot(...))` | raw tuner options propagate to RPC | **yes** |
| SC-8 | snapshotId stable across key order | preserve | pure | (already-pinned, §2) | — | **yes** |

**Atomic constraint:** the live-runtime abort/mounted refs (`liveSnapshotAbortRef`, `activeLive*RequestKeyRef`, `liveRuntimeMountedRef`, `liveSnapshotFailureCountRef`) travel WITH the mount lifecycle (effect 540) + `readLiveRuntimeSnapshot`/`refreshLiveSetupFromEvent`/`applyLiveGameState` into this one hook (invariant b). The extracted hook **must accept `orpcClient` as a param/context** (LR-2/LR-3 testability). Init **before** `useRunInGame` (adoption effect 1656 needs both setters; §5). The dead write-only `setLiveRuntimeSnapshot` (529) is removed here as IMPROVE-1 (§4).

### 3.10 — `useRunInGame`  (MEDIUM; calls `applyAuthoringSnapshot`+`markPresetApplied`)

| id | subject | disp | kind | oracle | falsification | pinned |
|---|---|---|---|---|---|---|
| RIG-5 | `syncStudioFromLiveGame` 5-setter write ORDER (highest hazard) | preserve | pure (spy call-order) | order: setWorldSettings→setPipelineConfig→setSetupConfig→setOverridesDisabled→**setRecipeSettings (last)**; only seed+setupConfig visible-control paths | setRecipeSettings before setPipelineConfig → effect 435 overwrites proved config | no |
| RIG-6 | sync busy-gate + silent when status≠ok | preserve | pure | busy → no setter + toast; status idle → no setter, no toast | `operationControlsDisabled` derived one render late → write during browser run | no |
| RIG-7 | non-proved path applies seed+setup suggestions only | preserve | pure | proved null + seed suggestion → only setRecipeSettings(seed); no world/pipeline/overrides | adds pipelineConfig to non-proved path → overwrites edits | no |
| RIG-2 / RIG-4 | materializationMode determinism + in fingerprint | preserve | pure | (see §3.0) | (see §3.0) | no |
| RIG-1 / RIG-3 | fingerprint/relation + process-restart gate | preserve | pure | (already-pinned, §2) | — | **yes** |
| RIG-8 / RIG-9 / RIG-10 | adoption: never-revert-terminal + TOCTOU + lazy getter | preserve | pure | (already-pinned, §2) | — | **yes** |
| MAN-1 | full proof path (Scripting.log, requestId, proof waiter) | preserve | manual-in-game | Studio shows complete, ring green, relation current, binding bound | wrong requestId in source snapshot → zombie at waiting-for-proof | no |

**Contract constraints:** `syncStudioFromLiveGame`'s 5-setter write is extracted as `applyAuthoringSnapshot` **owned by `usePresetLifecycle`** (§7.5) — `useRunInGame` calls that one action (RIG-5 verifies the order survived in the owner). It also calls `markPresetApplied` before its setRecipeSettings/setPipelineConfig batches. Receives `resolvePreset` + the host-computed `provedRunInGameSource`/`runInGameMaterializationMode` (§7.6, breaks the cycle). Init **after** `useLiveRuntime` and `useSaveDeploy` (needs their setters for adoption; §5). Busy flags threaded from `useStudioOperations`. **D1 (hardcoded `recipeId`) is NOT touched** — out of scope (see §6).

### 3.11 — `useSetupControls`  (LOW; setup options + drift + live-game actions)

| id | subject | disp | kind | oracle | falsification | pinned |
|---|---|---|---|---|---|---|
| SC-4 | post-sync drift via value equality flips to 'Custom' | preserve | pure | savedSetupConfigModified false after select; true after sync writes different setup | object-identity comparison → 'Custom' on every sync | no |
| SC-5 | `handleToggleAutoplay` busy-gate + re-entrant guard | preserve | pure (spy) | busy or `autoplayActionRunning` → early return + toast, no RPC; flag set before await, cleared in finally | guard removed → double-click races autoplay state | no |
| SC-6 | `handleExplore` busy-gate + `exploreActionRunning` guard | preserve | pure (spy) | busy or in-flight → early return + toast, no RPC; try/finally wraps | guard removed → concurrent explore RPCs | no |
| SC-1 / SC-2 / SC-3 | saved-config replace + drift cases + normalized equality | preserve | pure | (SC-1/2 already-pinned; SC-3 new — §3.0) | — | SC-1/SC-2 **yes** |
| MAN-3 | autoplay/explore live actions work without window switch | preserve | manual-in-game | autoplay advances turns; explore lifts fog; grantedPlots>0 | stale `autoplayActive` read → spams redundant start | no |

**Constraint:** no atomic-group obligation. Autoplay/explore are live-game *actions* co-located here (§4.2 refinement #2), receiving `setLiveRuntime`; they read busy flags threaded from `useStudioOperations` (SC-5/SC-6) and the LIVE `liveRuntime.autoplayActive` (not a stale prop — MAN-3). MAN-2 (live snapshot + sync-back) spans `useLiveRuntime`+`useRunInGame` and is the manual proof for those slices.

---

## 4. Improve-slices (deliberate behavior changes — SEPARATE, flagged, tested)

Each improve is its own slice, kept strictly apart from pure-move slices so a behavior change is never smuggled inside a "behavior-preserving" extraction. There are exactly **3 improve specs** in the corpus (IMPROVE-1, IMPROVE-2, BR-13) plus one "improve-but-tagged-preserve" (PL-14) and three improve *candidates the draft deliberately downgraded* (recorded for traceability).

| id | Target behavior change | Why easy-to-see | Test that pins it | Kind |
|---|---|---|---|---|
| **IMPROVE-1** (D3) | Remove the dead write-only `const [, setLiveRuntimeSnapshot] = useState<LiveRuntimeSnapshotState\|null>(null)` (~529). Snapshot tile readback is consumed locally in `readLiveRuntimeSnapshot` without storing to React state. | Zero readers (provably unreachable, PRODUCT-MODEL §8 D3); absence is verifiable by source text; leaving it misleads future refactors into thinking the snapshot is UI-wired. | Source-text: refactored `useLiveRuntime` contains NO `setLiveRuntimeSnapshot` and NO `useState<LiveRuntimeSnapshotState`. **Falsifier:** a future re-add is caught, prompting a review of the intended consumer. | pure (source-text) |
| **IMPROVE-2** | Formalize render-phase ref writes (invariant a) into `useLatestRef<T>(value): MutableRefObject<T>` (`app/hooks/useLatestRef.ts`): `const ref = useRef(value); ref.current = value; return ref;` — write in render scope, never in an effect. Host uses it for `shortcutsRef` and other render-phase ref-write sites. | The lowest-risk formalization in the refactor: no side effects, correctness provable with a two-render hook test. Without it, the latest-value pattern is enforced only by review and easily broken by later extractions. | `useLatestRef(42)` → `ref.current===42`; rerender 43 → `ref.current===43` **before effects run**. Source contains no `useEffect`. **Falsifier:** an effect-based write returns a one-render-stale `.current` (the §2a hazard). | hook (renderHook) + source-text |
| **BR-13** | Auto-run: guarantee no leaked 300ms timer after autoRun disabled mid-debounce — by **co-locating** the disable-arm (929) and debounce-arm (939) + `autoRunTimerRef` in ONE hook (so the disable-arm can clear the timer). | The leak is only possible if the two arms land in different hooks; co-location is the structural guarantee, and the pure timer test makes the no-leak property directly observable. | pure + fake timers: autoRun off at 150ms → +300ms → **0** `startBrowserRun` calls. **Falsifier:** arms split, one holds the ref → timer fires after disable. | pure (fake timers) |
| PL-14 | (improve-tagged-**preserve**) Pin that the import path accepts any config valid AFTER migration (migration-before-normalize on the import path, E11/E13). | The import path already migrates before normalize (`importFlow.ts`); this test makes a future migration addition un-skippable. Tagged preserve because no API change is needed. | pure: retired-key file → `ok:true` with migrated config. **Falsifier:** normalize-before-migrate → spurious reject. | pure |

### Improve candidates the draft DELIBERATELY downgraded to preserve (do NOT promote in Phase 8)
- **BR-10 (isDirty)** — already a `useMemo` over pure comparators; "improve to pure derived value" needs a non-trivial API change. Kept preserve.
- **SS-4 (effect-867 deps)** — the exhaustive-deps suppression is intentional/correct; "fixing" it requires changing `useVizState`'s API contract. Out of scope. Kept preserve.
- **RIG-2 (materializationMode)** — extraction to a pure fn IS a Phase-8 refactoring goal, but the test pins behavior regardless of structure; tagging improve would over-specify the signature (Phase-7 design scope). Kept preserve. (Security-adjacent: extract before Phase 8 begins.)
- **VL-5 / waiter-as-factory (SD-1/SD-3)** — flagged in lane notes as latent improve candidates; the tests pin the behavioral contract whether the code is a callback or a factory, so no separate improve slice is minted.

> **Note (KB-3):** `shouldIgnoreGlobalShortcutsInEditableTarget` is currently inlined in the keydown closure. Exposing it as a **named export** is a tiny testability improve folded into the `useKeyboardShortcuts` pure-move slice (KB-3 then imports it; otherwise the source-text fallback applies). It is not a behavior change, so it does not get its own improve slice — but call it out in the slice PR.

---

## 5. Slice sequencing & dependency order (Phase-8 order)

The order respects the §5 hook-init constraints and the §7 contracts. **Pure-moves** are trivial extractions verified by pure/source-text tests. **"Atomic move with contract"** slices carry a §7 contract (object identity, ordered write, synchronous derivation) and are NOT trivial — they require the contract test to be green, not just the move to compile.

| Step | Slice | Move class | Init-order rule honored | Gating to be green |
|---|---|---|---|---|
| 0 | **jsdom + RTL test infra** (DECIDED — option A) | infra | — | adds `@testing-library/react` + `jsdom` (or `happy-dom`); `vitest.config.ts` `mapgen-studio` project gets `environmentMatchGlobs: [['test/controllers/**','jsdom']]` so existing node tests are UNTOUCHED. Smoke: one trivial `renderHook` under `test/controllers/` passes; existing `mapgen-studio` suite stays green. Enables the ~18 lifecycle tests + ADD-1/2/3 hook halves + SD-9. |
| 1 | **H0 pure-helpers** | pure-move | (none — modules) | §3.0 (incl. 4 already-pinned) |
| 2 | **H0b `useLatestRef`** | improve | — | IMPROVE-2 |
| 3 | **`useViewportLayout`** | pure-move (+ atomic autofit pair) | **before `useVizSelection`** consumers; `deckApiRef` single-owner | §3.2 (VL-1..5, LS-7) |
| 4 | **`useStudioOperations`** | **atomic move with contract** (busy-gate + error channel) | **INIT FIRST**; busy booleans stable-from-first-render | §3.3 (BG-1/3/4, BR-12, ADD-2, ADD-3) |
| 5 | **`useKeyboardShortcuts`** | pure-move | Tier-C; uses `useLatestRef` | §3.4 (KB-1..4) |
| 6 | **`useBrowserRun`** | **atomic move** (auto-run trio Tier-A) | reads THREADED busy flags (from step 4); `vizIngestRef` render-scope | §3.5 (BR-1..13) |
| 7 | **`useVizSelection`** | **atomic move** (Tier-A cascade + 4th atomic group) | `overlayDataTypeKey` render-phase BEFORE `useVizState`; sole writer of stage/step/viz | §3.6 (SS/LS/EO) |
| 8 | **`usePresetLifecycle`** | **atomic move with contract** (markPresetApplied identity + applyAuthoringSnapshot) | 410→435 Tier-A; `lastAppliedPresetRef` sole owner | §3.7 (PL-2..15, ADD-1) |
| 9 | **`useSaveDeploy`** | **atomic move with contract** (calls markPresetApplied; waiter E21) | **before adoption effect fires**; 548 before 558 | §3.8 (SD-1..11, PL-7, PL-11) |
| 10 | **`useLiveRuntime`** | atomic move (mount-lifecycle refs) + **IMPROVE-1** | **before `useRunInGame`** (adoption needs both setters) | §3.9 (LR-2..9, SC-7/8) + IMPROVE-1 |
| 11 | **`useRunInGame`** | **atomic move with contract** (calls applyAuthoringSnapshot + markPresetApplied) | **after `useLiveRuntime`+`useSaveDeploy`**; host computes `provedRunInGameSource`/`materializationMode` (§7.6) | §3.10 (RIG-2/4/5/6/7) |
| 12 | **`useSetupControls`** | pure-move | live-game actions read live `liveRuntime` + threaded busy | §3.11 (SC-4/5/6) |

**The hard init-order invariants (must all hold simultaneously in the host render):**
1. `useStudioOperations` **first** (owns op state + busy/error; everything downstream threads its values).
2. `useViewportLayout` **before** `useVizSelection` (autofit reads `deckApiRef`/`viewportSize`; §7.7).
3. `overlayDataTypeKey` computed **before** `useVizState` (circular-dep; §3/§4.1/LS-6).
4. `useLiveRuntime` **before** `useRunInGame` (adoption effect 1656 needs `setRunInGameOperation`+`setSaveDeployOperation`).
5. `useSaveDeploy` initialized **before** the adoption effect fires.
6. Busy booleans stable from the **very first render** (default `false`) — the auto-run flush effect (973) reads `runInGameRunning`/`saveDeployRunning`; an `undefined` first render could fire a spurious `startBrowserRun`.

**Atomic-move-with-contract slices** (the four that are NOT trivial moves): `useStudioOperations` (busy-gate synchronicity + error channel single-owner), `usePresetLifecycle` (`markPresetApplied` `===` identity + `applyAuthoringSnapshot` ordered write), `useSaveDeploy` / `useRunInGame` (both call those contracts and must write `markPresetApplied`/`applyAuthoringSnapshot` in the prescribed order). Each is "done" only when its contract test (ADD-1/ADD-2/ADD-3/RIG-5) is green.

---

## 6. Coverage ledger

**Draft corpus:** 103 specs (brViz 24, presetSave 26, gameLive 30, layerKbd 23). **Added in synthesis:** 3 (ADD-1, ADD-2, ADD-3). **Total gating specs in this plan: 106.**

### By disposition
| Disposition | Count | Spec ids |
|---|---|---|
| **preserve** | 102 | all except the 4 improve specs below |
| **improve** | 4 | IMPROVE-1, IMPROVE-2, BR-13, PL-14 (PL-14 improve-tagged but behavior-preserving) |
| **(of total)** | 106 | 103 draft + 3 added (all 3 added are preserve) |

### By already-pinned (reference floor — not re-authored)
| | Count | Spec ids |
|---|---|---|
| **already-pinned** | 15 | PL-8, RIG-1, RIG-3, RIG-8, RIG-9, RIG-10, LR-1, LR-5, LR-8, LR-9, SC-1, SC-2, SC-7, SC-8, BG-2 |
| **new gating tests to author** | 88 | 103 draft − 15 pinned = 88, + 3 added = **91 new** |

### By test kind (new tests to author)
| Kind | Approx count | Notes |
|---|---|---|
| **pure / pure-state-machine** | ~58 | the default; zero new deps; includes all auto-run, cascade, era/overlay, materialization, sync-order, waiter-factory, busy-derivation drivers |
| **source-text (gated)** | ~12 | render-phase-vs-effect + effect-order timing invariants React can't expose in node (BR-11, BG-1/3/4, BR-12, KB-1/2, LS-6, EO-1, LS-7, LR-4, IMPROVE-1, ADD-2/3 halves) |
| **hook (renderHook)** | ~18 | **carry harness-setup cost** — need `@testing-library/react` + jsdom/happy-dom on the `mapgen-studio` project (SS-4, VL-1, PL-2..15, SD-2/4/5/6/7/8/10/11, PL-7/11, LR-2/3, IMPROVE-2, ADD-1 hook half) |
| **integration (renderHook, 2 hooks)** | 1 | SD-9 (17→6 cross-commit) |
| **component (renderToStaticMarkup)** | 0 | chrome wiring (BG-3) handled as source-text; no new static-markup test needed |
| **manual-in-game** | 3 | MAN-1, MAN-2, MAN-3 |

### Manual-in-game (Phase-8 live proof; per civ7-operational-debugging / live↔headless parity memory)
| id | Subject | Live proof | Slice(s) |
|---|---|---|---|
| MAN-1 | Run-in-Game full proof path (Scripting.log, requestId embed, proof waiter resolve) | Studio "complete", green ring, relation=current, binding=bound-studio-run; falsifier: wrong requestId → zombie at waiting-for-proof | `useRunInGame` |
| MAN-2 | Live snapshot commits correct tile data + sync-back updates seed/setup | snapshotStatus 'ok'; edit seed → amber ring; Apply → restores + green; falsifier: lost `activeLiveSnapshotRequestKeyRef` → first snapshot commits over second | `useLiveRuntime` + `useRunInGame` |
| MAN-3 | Autoplay/Explore live actions from Studio | autoplay advances turns; explore lifts fog (grantedPlots>0); falsifier: stale `autoplayActive` → redundant start spam | `useSetupControls` |

> Per the civ7 live↔headless output-parity memory, MAN-1/2/3 verify OUTPUT/engine behavior (proof lines, tile commits, granted plots), not just `[mapgen-complete]`. They are the only proof for the live Scripting.log + engine-response behaviors that no node harness can reach.

### Specs DROPPED or DOWNGRADED (with reasoning)
| id | Action | Reasoning |
|---|---|---|
| BR-10 | downgraded improve→**preserve** | already a `useMemo` over pure comparators; "improve" needs a non-trivial API change (lane note 3). |
| SS-4 | downgraded improve→**preserve** | effect-867 exhaustive-deps suppression is intentional/correct; "fixing" needs a `useVizState` API change — out of scope (lane note 4). |
| RIG-2 | downgraded improve→**preserve** | pure-fn extraction is a Phase-8 goal but the test pins behavior regardless of structure; tagging improve would over-specify the signature (Phase-7 scope). Still: extract before Phase 8 (security-adjacent). |
| E11-on-write (persistence) | **out of lane scope** (not dropped from project) | covered/extended in `test/studioState/persistence.test.ts` (persistence lane), not the decomposition lanes — avoid cross-lane overlap. |
| E1 runToken/generation (worker-side) | **out of host scope** | drop logic lives inside `useBrowserRunner` (existing hook), covered by `standardLayerVisibility.test.ts`/`errorFormat.test.ts`; host-side specs gate only host behaviors. |
| E7 layer-retention | **owned by viz lane consumer, not browser-run producer** | `capturePinnedSelection`/`shouldRetainLayer` (`retention.ts`) is pure and separately exercisable; the consumer test belongs to `useVizSelection`, not `useBrowserRun` (lane note 5). Not separately specced — covered by the existing retention tests + SS-2 layer-clear behavior. |
| Q2 (live-setup fetch un-debounced) | **left un-specced (incidental)** | intentional per current impl; only becomes a spec if a Phase-8 decision adds debouncing (gameLive lane note). |

### Owner-verification flags (raised by this synthesis)
1. **Harness gap — RESOLVED (user decision, option A).** Add `@testing-library/react` + jsdom/happy-dom as **Phase-8 Step 0**, scoped via `environmentMatchGlobs: [['test/controllers/**','jsdom']]` so the existing node tests (renderToStaticMarkup, worker-bundle) are untouched. This delivers true `renderHook` proof for the ~18 lifecycle tests + SD-9 + the hook halves of ADD-1/2/3. The pure/source-text floor still carries every Tier-A ordering and busy-gate-race hazard (so even if a controller test is hard to renderHook, the pure driver remains the primary falsifier); the renderHook layer hardens the preset/save lifecycle contracts (PL-*/SD-*).
2. **ADD-1 is the ONLY proof of the `===` identity contract.** It depends on `rememberRepoBackedConfig`→`toRepoBackedPreset` storing the SAME `sanitized` object (`repoBacked.ts:44`, no clone). If any extraction introduces a structural clone there, the guard at 452 silently breaks and ADD-1 must catch it — confirm `repoBacked.ts:44` is unchanged.
3. **D1 (hardcoded `recipeId` in `handleRunInGame`, :1727)** is left untouched (out of scope). Flag for owner: confirm intentional (recipe-invariant game script) vs latent multi-recipe bug — but NOT as part of this decomposition.
4. **PL-9/PL-14 need a retired pipeline-config key** in the migration corpus (`pipelineConfigMigration.test.ts`). If none exists, a synthetic migration must be injected — the harness has no current pattern for that (presetSave lane note 3).
5. **Phase-7 must finalize the autoplay/explore owner** (§4 refinement #2: `useSetupControls` vs a dedicated `useLiveGameActions`). This plan places SC-5/SC-6 in `useSetupControls`; if Phase 7 splits it out, re-home SC-5/SC-6 (the tests are unchanged — they spy on the handlers).

---

*Synthesized 2026-06-28 by the workstream owner (Claude Opus 4.8) from a 4-lane investigator fan-out (103 specs) re-mapped onto the corrected `INVESTIGATION-FINDINGS.md` §7.8 hook map, augmented with the three §7-mandated contract tests (ADD-1/2/3). This plan is the Phase-8 verification contract: each slice is verified against its gating tests here, not against its diff.*
