# Owner's Frame — StudioShell decomposition (Pass 3)

> **My consolidation hub** (workstream owner: Claude Opus 4.8). Everything I gather converges here before execution. Compatible with — not a replacement for — the handoff [`FRAME.md`](./FRAME.md). Where the kickoff brief (`KICKOFF-PROMPT.md`) and `FRAME.md` differ, the **brief governs**: parity is a *floor I may improve on with tests*, not a freeze.
>
> Workspace: branch `agent-S-studio-shell-decomposition` (off `main`), worktree `…/worktrees/wt-agent-S-studio-shell-decomposition`. All artifacts + the OpenSpec change set live here.
>
> **Hard gate:** no refactoring edits to `StudioShell.tsx` until the Phase-7 OpenSpec change set validates `--strict`.

---

## 0. Artifact index & phase tracker

| Phase | Artifact | Status |
|---|---|---|
| 1 Ground | this frame §1–§6 | ✅ done (first-hand full read 2026-06-28 @ `5aa6ccf7c`) |
| 2 Skill pack | `SKILL-PACK.md` | ⏳ next |
| 3 Owner frame | this file | ✅ live (append as I learn) |
| 4 Product model | `PRODUCT-MODEL.md` | ⏳ |
| 5 Behavior+test | `BEHAVIOR-TEST-PLAN.md` | ⏳ |
| 6 Investigation | **`INVESTIGATION-FINDINGS.md`** (authoritative; deepens §4–§5) | ✅ done — independent 3-agent re-derivation confirmed + refined my read |
| 7 Design (GATE) | `openspec/changes/<id>/` | ⏳ |
| 8 Implementation | stacked Graphite branches | ⏳ |

---

## 1. Scope in my own words (Phase 1 close)

**What is already done (exterior — do not reopen / re-extract):**
- **Pass 1** (feature/leaf extraction): all visual leaves are components (`CanvasStage`, `LeftDock`/`RightDock`, `AppHeader`/`AppFooter`, `RecipePanel`, `ExplorePanel`, `GameConsole`, `StageViewTabs`, `PipelineStage`, the 3 `PresetDialogs`, `ErrorBanner`). Feature logic lives under `features/*`. Philosophy: *extract without redesign*, preserve invariants (browser-first determinism, retention UX, layer-list UX, config-override merge semantics).
- **Pass 2** (runtime simplification, #1748): the daemon owns operation lifecycle; the **client is event-driven**. Contract: `studio.events.watch` push (`hello`/`operation`/`live-game`) via `useStudioEvents`; `studio.operations.current` adoption on reconnect via `operationAdoption.ts` / `readAndAdoptStudioOperationsCurrent`; mutations return `*Accepted` then events update state. No client polling, no localStorage operation recovery.
- **Stores** (`authoringStore`/`viewStore`/`runStore`): the state owners. `viewStore` is already the single owner of view state (the arch-doc's "delete App mirror" improvement is **already done** — see §6).
- **Query layer**: `useSetupDataQueries`, `useRecipeDagQuery` already TanStack-Query-backed (arch §2's "migrate last" appears landed).
- **Design system**: chrome themed by single `.dark` class + tokens (`bg-background`, `bg-popover`, …); `lightMode` survives only as one prop forwarded to the deck `<canvas>` (documented at `StudioShell.tsx:153-159`). Arch §5 largely landed.

**In scope (Pass 3 — this work):** the client React **orchestration glue** that survives inside `StudioShell.tsx` (220–2897): ~21 `useEffect`, ~43 `useCallback`, ~31 `useMemo`, 5 `useState`, 6 `useRef`, plus 2 module-level pure helpers. Lift it into **controller hooks + pure helpers** so the host collapses to **layout + error-boundary + shortcuts host** (architecture/10 §4). Plus *authorized, separately-flagged, tested* behavior improvements.

**Target end-state (architecture/10 §4):** `StudioShell` = a few-hundred-line host that calls controller hooks and assembles JSX (`header/leftPanel/rightPanel/footer/presetDialogs` + the canvas/pipeline `<main>` + docks + tabs + error banner).

**Exterior within the file:** nothing structural left to extract — every JSX leaf is already a component; the `header/leftPanel/…` blocks are **prop-assembly**, not hidden inline components (confirms `FRAME.md` insight #5 / the "hidden components" falsifier did **not** fire on my read).

---

## 2. Substrate the hooks read from (fixed context)

Hooks already wired in the host (these stay; clusters consume them):
`useToast` (221) · authoring/view/run store selectors · `useRecipeDagQuery` (295) · `usePresets` (399) · `useBrowserRunner` (491) · `useSetupDataQueries` (589) · `useVizState` (595) · `readAndAdoptStudioOperationsCurrent` effect (1656) · `useStudioEvents` (1675) · `useRunInGameTerminalToast` (1686).

---

## 3. Cluster re-derivation (first-hand; confirms FRAME hypothesis)

Line anchors @ `5aa6ccf7c`. This **confirms** the FRAME's 10-cluster inventory; my labels A–N add finer seams. Counts are independent approximations (won't sum).

| # | Cluster → candidate hook | Anchors | Owns |
|---|---|---|---|
| **P0** | pure helpers (module) | 163–204 | `SAVE_DEPLOY_TERMINAL_EVENT_TIMEOUT_MS`, `isSaveDeployTerminal`, `saveDeployResultFromTerminalStatus` — trivial zeroth move |
| **A** | (store wiring) | 229–288, 339, 407, 512–515, 820–823 | Zustand selectors — distribute into owning hooks |
| **B** | `useViewportLayout` | 246–250, 798–816, 2571–2579 | deckApiRef, viewportSize+ResizeObserver, headerHeight, panelTop/Bottom |
| **C** | `usePipelineDag` | 295–319 | recipeDag query, expansion-prune effect (301), stage toggle |
| **D** | `usePresetLifecycle`/`usePresetCommands` | 321–481, 994–1014, 1099–1413, 1530–1540 | preset/import/dialog state, 3 preset effects, save/saveAs/delete/export/import/confirm, derived preset memos, displayedPresetOptions |
| **E** | `useSaveDeployController` | 163–204, 501–583, 1016–1097 | saveDeployOperation, waiter map, 2 effects, `waitForSaveDeployTerminalEvent`, `saveRepoBackedConfigWithState` |
| **F** | `useBrowserRun` | 289–291, 486–494, 875–992, 1415–1433 | autoRun state/refs, vizIngestRef, browserRunner, startBrowserRun, 3 auto-run effects, reroll, triggerRun, status, isDirty |
| **G** | `useLiveRuntimeController` (~450, biggest) | 517–792, 1489–1528, 1806–2044 | failure/key/abort/mounted refs, liveRuntime/liveSetup/suggestions state, mount effect, snapshot+setup readers, applyLiveGameState, relation memos, syncStudioFromLiveGame, autoplay, explore, diagnostics, busy labels |
| **H** | `useRunInGameController` | 341–343, 504–507, 516, 1444–1487, 1652–1804 | runInGameOperation+refs, run-store, adoption effect, useStudioEvents+terminalToast wiring, materializationMode/fingerprint/relation memos, handleRunInGame |
| **I** | `useSetupControls` | 1542–1650 | setupControlOptions, savedSetupConfigModified, handleSavedSetupConfigChange |
| **J** | `useLayerSelection` (~350) | 595–625, 2046–2389, 2581–2593 | useVizState, 2 autofit effects, selection + selected* memos, options memos, era memos, 3 viz effects (manualEra clamp/overlay prune/overlay-variant-pref), selectLayerFor + all handle*Change, backgroundGridEnabled |
| **K** | `useStageNavigation` | 820–873 | recipeOptions/stages/steps memos, 3 sync effects (stage default→step default→viz step sync) |
| **L** | `useKeyboardShortcuts` | 2391–2569 | shortcutsRef latest-value mirror + global keydown effect |
| **N** | (JSX assembly) | 2595–2897 | header/leftPanel/rightPanel/footer/presetDialogs blocks, liveStatusAnnouncement, return |

---

> **Phase 6 update:** §4–§5 below are my first-hand read; the independent investigation **confirmed** them and added precise design constraints (3 atomic-order effect groups; render-phase ref rule; synchronous busy-flag rule; hook init order; layer/viz split). The authoritative deepened version is **[`INVESTIGATION-FINDINGS.md`](./INVESTIGATION-FINDINGS.md)** — read that for design.

## 4. Effect inventory in CALL ORDER (the parity contract — re-verify in Phase 6)

React fires effects in call order. 21 effects, source order:

1. `301` pipeline-expansion prune — dep `recipeDag.dag` (C)
2. `410` default-config seeding on preset/recipe change — refs lastPresetKeyRef/lastRecipeIdRef/lastAppliedPresetRef (D) ⚠pair with #3
3. `435` preset apply — ref lastAppliedPresetRef (D) ⚠pair with #2 (mutually-exclusive guards on `parsePresetKey().kind`, but share the ref)
4. `478` loadWarning toast (D)
5. `540` live-runtime mount/unmount + abort cleanup (G)
6. `548` save-deploy terminal-waiter resolution — ref saveDeployOperationRef (E) ⚠
7. `558` save-deploy waiter cleanup on unmount (E)
8. `608` viz autofit on space change — ref lastAutoFitSpaceRef (J)
9. `617` viz autofit on first manifest — ref hasEverSeenVizManifestRef (J)
10. `798` viewport ResizeObserver (B)
11. `857` selectedStage default (K) ⚠chain
12. `862` selectedStep default (K) ⚠chain (depends on `steps`, recomputed from #11's stage)
13. `867` viz selectedStep sync (K/J) ⚠chain
14. `929` auto-run disable cleanup — refs autoRunPendingRef/autoRunTimerRef (F)
15. `939` auto-run debounce — refs autoRunPendingRef/autoRunTimerRef (F) ⚠trio
16. `973` auto-run pending-after-busy — ref autoRunPendingRef (F) ⚠trio
17. `1656` operations.current adoption — refs runInGameOperationRef/saveDeployOperationCurrentRef (H)
18. `2164` manualEra clamp into viewStore (J)
19. `2188` overlay pruning (J) ⚠pair
20. `2198` overlay-variant-preference derive→store (J) ⚠pair
21. `2453` keyboard keydown listener — ref shortcutsRef (L)

**Order-dependent groups to prove pairwise (Phase 6, day-one):** {#2,#3} preset, {#11,#12,#13} stage→step→viz cascade, {#14,#15,#16} auto-run, {#19,#20} overlay. Cross-cluster: #18/#19/#20 all in J; #13 bridges K→J (`viz.setSelectedStepId`). **Extraction must preserve hook call order = effect fire order, or prove independence.**

**Latest-value ref pattern (deliberate — formalize, don't delete):** `runInGameOperationRef`/`saveDeployOperationCurrentRef` reassigned every render (506–507); `shortcutsRef.current = {…}` every render (2421–2451). Feed event-stream + keydown closures. Candidate: a `useLatestRef` helper.

---

## 5. Shared-derived-value DAG (the real risk — threading, not the moves)

Values consumed across clusters → hooks are a DAG, not islands. Owner → consumers:

- `recipeArtifacts` (352, from catalog by recipe) → D, K, H, J, leftPanel reset. **Foundational.**
- `resolvePreset`/`presetActions` (from `usePresets`, 394) → D, H (materialization, handleRunInGame), G (syncFromLive).
- `selection` (2061, from viz) → J (all selected*/handle*Change/overlay), rightPanel.
- busy booleans `browserRunning` (496) / `runInGameRunning` (593) / `saveDeployRunning` (592) → E, F, G, H, JSX disable props. **Most cross-cutting; a coordination concern — likely surfaced by the host or a small `useStudioBusy`.**
- `runInGameMaterializationMode` (1444) → H (fingerprint, handleRunInGame).
- `provedRunInGameSource` (364) → D (livePresets), G (relation/sync).
- `pipelineConfig`/`recipeSettings`/`worldSettings`/`setupConfig` (authoring store) → nearly everywhere.
- `lastRunSnapshot` (407) → F (auto-run/isDirty).
- `viz` object (595) → J, F (startBrowserRun clears stream), B (autofit via deckApiRef), JSX.

**Design question for Phase 7:** assign a single OWNER per shared value; thread via return→param; never re-derive at a different time (the subtle-bug source).

---

## 6. Parity hazards, do-not-break registry, and sanctioned improvements

**Do-not-break (arch/10 §7 + my read):** browserRunner runToken/generation gating · run-in-game fingerprint/relation equality + materialization-mode decision · serialized run queue + dual mutex (server) · live-runtime poll/event request-key staleness + adaptive backoff (`liveSnapshotFailureCountRef`, `activeLive*RequestKeyRef`, abort controllers) · `assertNoRawControlFields` (server) · localStorage schema contract · save-deploy terminal-waiter timeout semantics · canvas stays MOUNTED (not unmounted) under pipeline view.

**Sanctioned improvement candidates (each → its own flagged, tested improve-slice; confirm easy-to-see + testable in Phase 5):**
1. **Dead write-only state** — `const [, setLiveRuntimeSnapshot] = useState(...)` (529): value never read (destructured away), only the setter is called (677/702). Remove the state entirely. *Low risk, testable.*
2. **Formalize latest-value refs** — extract `useLatestRef` for the 506–507 / 2421 reassign-every-render pattern (FRAME #6). Behavior-preserving cleanup.
3. **"8 effects derived-state/handlers in disguise → remove"** (arch §4) — candidates: manualEra clamp (#18), overlay-variant-preference (#20), stage/step defaults (#11/#12). Converting effect→derived changes *timing* → **RISKY**; treat as improve-slices only with a pinned test, else leave as preserve.
4. View-mirror deletion (arch §3) — **already done**; do not re-litigate.

**Open questions for Phase 6/verification:**
- Exact pairwise independence of the ⚠ effect groups (esp. preset {#2,#3} ref sharing; stage→step→viz cascade). → in flight (investigation workflow).
- Where do the busy booleans want to live (host vs a tiny shared hook)? Avoid a second source of truth.
- Confirm no `any` regressions; arch §6 strict flags (`noUncheckedIndexedAccess` etc.) status.

**Test harness (CORRECTED 2026-06-28 — earlier note was wrong):** runner = **vitest** (root `vitest.config.ts`, project `mapgen-studio`; run `vitest run --config ../../vitest.config.ts --project mapgen-studio`). ~30 tests under `apps/mapgen-studio/test/` (mirrors `src/`). **Environment is `node` — there is NO jsdom/happy-dom and `@testing-library/react` is NOT a dependency.** The existing tests are **pure-function** tests (e.g. `test/config/useConfigCollapse.test.ts` tests `computeActiveChain`/`pointerPrefixes`, NOT `renderHook`) and **`renderToStaticMarkup`** SSR-string assertions (`test/ui/AppHeader.test.tsx`). `renderHook` is NOT available today.
- **Primary strategy:** pure / pure-state-machine extraction (extract effect logic → deterministic functions, drive with fake timers) — pins every Tier-A ordering + busy-gate-race hazard with zero new deps. Plus gated **source-text** assertions for render-phase-vs-effect timing invariants React can't expose in node.
- **DECISION (user, 2026-06-28): add scoped jsdom + `@testing-library/react`** as the FIRST Phase-8 slice, scoped via `environmentMatchGlobs: [['test/controllers/**','jsdom']]` so existing node tests are untouched. This enables true `renderHook` proof for the ~18 lifecycle-bound contracts (`markPresetApplied` `===` identity, 548→558 waiter order, adoption→waiter, effect 410→435 order, mount/unmount).
- Parity-critical logic is *already* pure in `features/*` (`shouldCommitLiveRuntimeSnapshot`, `buildRunInGameFingerprint`, `relationForRunInGameOperation`, `studioSetupDriftsFromSavedConfig`, `parsePresetKey`, `studioBusyGateMessage`, …) + already-pinned by 15 existing tests — extraction must keep CALLING them in order, which the pure/hook gating tests assert. ⇒ **improve-slices are viable.**

---

## 6b. OpenSpec format cheat-sheet (for Phase 7 — verified against repo examples)

Repo OpenSpec: `@fission-ai/openspec@^1.3.1`, `schema: spec-driven`. Validate: `bun run openspec -- validate <id> --strict` (or `openspec validate --all --strict`). Repo-local guide skill: `.agents/skills/civ7-open-spec-workstream`.

Change set `openspec/changes/<id>/`:
- **proposal.md** — `## Why` · `## What Changes` · `## What Does Not Change` · `## Affected Owners` · `## Verification Gates` · `## Stop Conditions`. (config.yaml rules: cite target authority refs — for me architecture/10 §4 + the analysis docs; name Requires/Enables; owners/forbidden-owners/write-set; consumer impact.)
- **specs/`<capability>`/spec.md** — `## ADDED Requirements` (also MODIFIED/REMOVED) → `### Requirement: <name>` (SHALL/MUST, behavior/process only — NO impl detail) → `#### Scenario: <name>` with `- **WHEN** … / **THEN** … / **AND** …`. **Every requirement needs ≥1 Scenario.** My capability id: likely `mapgen-studio-shell` (new).
- **design.md** — explicit target-shape decisions (no maybe/optional/fallback language), name owners, **review lanes** required before impl.
- **tasks.md** — numbered `- [ ]` sections (Opening / Implementation / Verification), implementation steps not design questions; end with repo gates + `openspec validate --strict`.
- optional `.openspec.yaml`, `workstream/phase-record.md`.

Existing capabilities in `openspec/specs/`: `change-management`, `mapgen-normalization-workstreams`. My change is a Studio CLIENT refactor — a **new** capability (`mapgen-studio-shell`), behavior/parity requirements per slice.

## 9. Target structure & hook interfaces (staged for Phase 7 — from INVESTIGATION-FINDINGS §7.8)

> Names chosen to **reduce the space of illegal states**: `controllers/` signals orchestration (distinct from the small utility hooks in `hooks/`); one file per hook; coordination state owned high. Tests mirror under `test/controllers/`.

```
apps/mapgen-studio/src/app/
  StudioShell.tsx              # HOST only: layout + error-boundary + shortcuts host + the coordination wiring (target ~200-300 lines)
  controllers/
    useStudioOperations.ts     # COORD (init 1st): runInGameOperation+saveDeployOperation+localError state;
                               #   derives busy booleans + error + status SYNCHRONOUSLY (§7.3/§7.4)
    useViewportLayout.ts       # viewport/ResizeObserver, deckApiRef (single owner), panel geometry,
                               #   recipeDag query+prune, deck-autofit pair (§7.7), backgroundGrid
    useBrowserRun.ts           # browserRunner wiring, startBrowserRun/reroll/triggerRun, auto-run trio (atomic), isDirty/status
    useVizSelection.ts         # useVizState + FULL stage/step/dataType/space/mode/variant/era/overlay cascade
                               #   (absorbs old Layer+Era+StageStep — §7.1/§7.2); navigateTo(stage,step)
    usePresetLifecycle.ts      # catalog/local presets, resolvePreset/presetActions, preset-apply effects,
                               #   lastAppliedPresetRef OWNER + markPresetApplied() + applyAuthoringSnapshot() (§7.5)
    useSaveDeploy.ts           # saveRepoBackedConfigWithState, waiter map/effects (calls markPresetApplied)
    useRunInGame.ts            # fingerprint/relation/materialization, handleRunInGame, syncStudioFromLiveGame
                               #   (calls applyAuthoringSnapshot), copyDiagnostics
    useLiveRuntime.ts          # snapshot/setup staleness+abort+mounted, applyLiveGameState, relation memos
    useSetupControls.ts        # setupControlOptions, drift→Custom, autoplay/explore live actions
    useKeyboardShortcuts.ts    # shortcutsRef (via useLatestRef) + global keydown
  hooks/
    useLatestRef.ts            # NEW — formalizes the render-phase latest-value ref pattern (invariant a)
    useStudioEvents.ts · useSetupDataQueries.ts · useToast.ts · useRunInGameTerminalToast.ts   # existing
features/mapConfigSave/status.ts   # P0: move isSaveDeployTerminal + saveDeployResultFromTerminalStatus here (co-locate w/ status logic)
```

**Interface sketch (params ← / returns →; full TS signatures finalized in design.md):**
- `useStudioOperations()` → `{ runInGameOperation, setRunInGameOperation, saveDeployOperation, setSaveDeployOperation, localError, setLocalError, clearLocalErrorIfCurrent, busy: {browserRunning?, runInGameRunning, saveDeployRunning}, error, status }`. (browserRunning comes from useBrowserRun → threaded back into the composite, OR `error`/`status` derived in host from both — finalize in design: keep ALL synchronous.)
- `useViewportLayout({ stageView, vizRead: {activeBounds, manifest, effectiveLayerSpaceId, effectiveLayerMeta}, showGrid, recipe })` → `{ containerRef, viewportSize, deckApiRef, deckApiReadyTick, handleDeckApiReady, panelTop, panelBottom, handleHeaderHeightChange, backgroundGridEnabled, recipeDag, pipelineExpanded*, handlePipelineStageToggle }`.
- `useBrowserRun({ recipeSettings, worldSettings, pipelineConfig, overridesDisabled, busy:{runInGameRunning,saveDeployRunning}, lastRunSnapshot, setLastRunSnapshot, viz, setLocalError, toast })` → `{ browserRunning, startBrowserRun, triggerRun, reroll, autoRunEnabled, setAutoRunEnabled, isDirty, status, handleVizEvent }`.
- `useVizSelection({ recipeArtifacts, recipe, overlaySuggestions, deckApiRef, viewportSize, deckApiReadyTick, browserRunning })` → `{ viz, selection, dataTypeOptions, *Options, era*, overlay*, selectLayerFor, navigateTo, handle*Change, stages, steps, selectedStageId, selectedStepId, riverLakeInspectorSummary, handleRiverLakeInspectorLayerSelect, overlayDataTypeKey }`. (overlayDataTypeKey + useVizState internal — resolves the circular dep internally.)
- `usePresetLifecycle({ recipeSettings, repoBackedOverrides, provedRunInGameSource, store setters, toast })` → `{ presetOptions, resolvePreset, presetActions, builtInPresets, recipeArtifacts, isLocalPresetSelected, handle{Save*,Delete,Import,Export}*, openSaveDialog, markPresetApplied, applyAuthoringSnapshot, presetError, saveDialogState, pendingImport }`.
- `useSaveDeploy({ busy, pipelineConfig, recipeSettings, resolvePreset, presetActions, rememberRepoBackedConfig, markPresetApplied, builtInPresets, setSaveDeployOperation, saveDeployOperation, store setters, toast })` → `{ saveRepoBackedConfigWithState, handleSaveDialogConfirm, handleSaveToCurrent, waitForSaveDeployTerminalEvent }`.
- `useRunInGame({ authoring state, resolvePreset, busy, runInGameOperation, setRunInGameOperation, setSaveDeployOperation, liveRuntime+suggestions, applyAuthoringSnapshot, markPresetApplied, run-store setters, toast })` → `{ runInGameRunning, handleRunInGame, syncStudioFromLiveGame, copyRunInGameDiagnostics, runInGameCurrentRelation, liveGameStudioRelation, provedRunInGameSource, runInGameMaterializationMode }`.
- `useLiveRuntime({ orpcClient, setLiveRuntime? })` → `{ liveRuntime, setLiveRuntime, liveRuntimeSuggestions, liveSetup, applyLiveGameState }`.
- `useSetupControls({ liveSetup, liveRuntime, setLiveRuntime, savedSetupConfigs, setupCatalog, setupConfig, setSetupConfig, setRecipeSettings, busy, toast })` → `{ setupControlOptions, savedSetupConfigModified, handleSavedSetupConfigChange, handleToggleAutoplay, handleExplore, autoplayActionRunning, exploreActionRunning }`.
- `useKeyboardShortcuts(ctx)` → registers global keydown (no return).

**Open design decisions for Phase 7 (resolve explicitly, no "maybe"):** (1) does `useStudioOperations` also hold `browserRunning` (i.e. own browserRunner) or receive it — keep error/status/busy all synchronous either way; (2) exact home of `provedRunInGameSource`/`livePresets`/`displayedPresetOptions`/`materializationMode` host-vs-hook (§7.6 says host); (3) whether `useVizSelection` is one hook or one hook + extracted pure `selectFromModel`/era/overlay helpers (prefer pure helpers for testability).

## 7. Reusable precedent (Pass 2 review machinery)

Pass 2's review loop = 6 lanes (architecture-boundary · direct-control · product/runtime-parity · typescript/schema · dev-platform · adversarial-orphan) + always-on proof gates (frozen lockfile → baseline build/check → `openspec validate --strict` → `habitat classify` → `git diff --check`/`gt status` → one logical change per branch). I will adapt these lanes to my parity-focused review (behavior / architecture-boundary / maintainability) and reuse the proof-gate spine.
