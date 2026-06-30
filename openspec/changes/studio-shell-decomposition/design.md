# Design — StudioShell controller-hook decomposition

> Target-shape decisions for the slice plan. Authority: architecture/10 §4 (host role) + §7 (parity), and the analysis corpus under `docs/projects/studio-shell-decomposition/` (PRODUCT-MODEL, INVESTIGATION-FINDINGS §7 corrected map, BEHAVIOR-TEST-PLAN). All decisions below are committed (no "maybe/optional/fallback" — the spike is over).

## 1. Target file/folder structure

```
apps/mapgen-studio/src/app/
  StudioShell.tsx              # HOST: layout + error-boundary + shortcuts host + coordination wiring (~200-300 lines)
  controllers/
    useStudioOperations.ts     # coordination, init FIRST
    useViewportLayout.ts       # viewport/ResizeObserver, deckApiRef, panel geometry, DAG query+prune — NO viz dependency; init early
    useBrowserRun.ts
    useVizSelection.ts         # useVizState + selection cascade; produces the viz read-projection
    useDeckAutofit.ts          # autofit effects (608/617) + lastAutoFitSpaceRef/hasEverSeenVizManifestRef + Fit handler — called AFTER useVizSelection
    usePresetLifecycle.ts
    useSaveDeploy.ts
    useRunInGame.ts
    useLiveRuntime.ts
    useSetupControls.ts
    useKeyboardShortcuts.ts
  hooks/
    useLatestRef.ts            # NEW (IMPROVE-2)
    useStudioEvents.ts · useSetupDataQueries.ts · useToast.ts · useRunInGameTerminalToast.ts   # existing, unchanged
apps/mapgen-studio/src/features/mapConfigSave/status.ts   # gains isSaveDeployTerminal + saveDeployResultFromTerminalStatus (pure move)
apps/mapgen-studio/test/controllers/*.test.ts(x)          # gating tests (jsdom-scoped)
```

**Naming rationale (reduce illegal states):** `controllers/` names the orchestration role distinctly from the small utility hooks in `hooks/`; one file per hook makes each independently importable + testable; pure decision logic stays in `features/*` (already there) so controllers are thin wiring.

## 2. Host coordination model (resolves the init-order + cross-cutting hazards)

`useStudioOperations` is the **first** hook the host calls. It owns the `useState` declarations for `runInGameOperation`, `saveDeployOperation`, and `localError`, and derives — **synchronously, in render scope** — the three busy booleans (`browserRunning` is threaded in from `useBrowserRun`; `runInGameRunning`/`saveDeployRunning` from the op status it owns), `operationControlsDisabled`, `error`, and `status`. Domain hooks receive the current value + setter and own the LOGIC (handlers, effects, fingerprints); they do NOT own the operation-state declaration. This makes every busy/error/status value a single same-render source threaded downward — never republished via `useState`+`useEffect` (which would open the one-render race the spec forbids).

**Decision (resolves §9 open #1):** `browserRunning` is produced by `useBrowserRun` (it owns the browser-runner) and threaded back into the host's composite; `error = localError ?? browserRunner.state.error` and `status` are derived in the host render after both `useStudioOperations` and `useBrowserRun` have run. All three remain synchronous render-scope `const`s. `useStudioOperations` exposes the op state/setters + `runInGameRunning`/`saveDeployRunning`; the host completes the composite. This keeps `useStudioOperations` independent of `useBrowserRun`'s init order (it does not need `browserRunning` to expose the run-in-game/save-deploy flags the auto-run trio reads).

**Decision (resolves §9 open #2):** the live-source-aware preset derivations (`provedRunInGameSource`, `livePresets`, `displayedPresetOptions`, `runInGameMaterializationMode`) are computed in the **host** from `useRunInGame`'s returned operation + `usePresetLifecycle`'s `resolvePreset`, then threaded into `usePresetLifecycle` (for `livePresets`) — breaking the `usePresetLifecycle ⇄ useRunInGame` cycle. `usePresetLifecycle` owns only catalog/local presets + apply-effects.

**Decision (resolves §9 open #3):** `useVizSelection` is ONE hook that calls `useVizState` and owns the whole cascade; its derivation steps delegate to the existing pure helpers in `features/viz/*` (`era.ts`, `dataTypeModel`, `overlaySuggestions`, `inspectorSelection`) so the hook is thin and testable by contract.

## 3. Cross-hook contracts (the "atomic move with contract" mechanisms)

- **`useLatestRef<T>(value): MutableRefObject<T>`** — `const r = useRef(value); r.current = value; return r;`. Render-phase write only. Used for `shortcutsRef` and the operation/viz latest-value refs.
- **`markPresetApplied({key, config})`** — synchronous callback exposed by `usePresetLifecycle` (sole owner of `lastAppliedPresetRef`). Writes the ref in-call (never in an effect), preserving the EXACT `config` object reference. `useSaveDeploy`/`useRunInGame` call it immediately before their `setRecipeSettings`/`setPipelineConfig` batch. Passing the mutable ref by parameter is forbidden. Two `===`-identity invariants must hold for the apply-effect skip-guard (`lastApplied.config === resolved.config`) to survive extraction: **(a) repo-backed save path** — `rememberRepoBackedConfig` stores `config: args.config` (no clone, `repoBacked.ts`) AND runs BEFORE the `setRecipeSettings` that flips the preset key (so the apply-effect's `resolvePreset(builtin:id)` sees the just-remembered identical object); **(b) live-sync path** — the host `livePresets[0].config` stays referentially `lastRunInGameSource.pipelineConfig` (no clone/re-normalize), so `resolvePreset(LIVE_GAME_PRESET_KEY).config === provedRunInGameSource.pipelineConfig`. Each path has its own gating contract test (ADD-1 save; ADD-1b live-sync).
- **`applyAuthoringSnapshot(snapshot)`** — owned by `usePresetLifecycle` (authoring layer); performs the 5-setter ordered write (`setWorldSettings → setPipelineConfig → setSetupConfig → setOverridesDisabled → setRecipeSettings`) and calls `markPresetApplied` first. `useRunInGame.syncStudioFromLiveGame` calls this one action.
- **Busy-flag threading** — busy booleans are threaded as values into `useBrowserRun`'s auto-run effect and `useVizSelection`'s `allowPendingSelection`. No hook republishes them.
- **Viz read-projection** — only `{activeBounds, manifest, effectiveLayer}` is threaded out of `useVizSelection`; the mutable `viz` object and the `setSelectedStageId/StepId` setters stay inside it.
- **`deckApiRef`** — single owner `useViewportLayout`; threaded BY REFERENCE to `useDeckAutofit`. The autofit effects (608/617) live in **`useDeckAutofit`** (called after `useVizSelection`), which receives `deckApiRef`/`viewportSize`/`deckApiReadyTick` from `useViewportLayout` AND the viz read-projection (`activeBounds`/`manifest`/`effectiveLayer.spaceId`) BY VALUE from `useVizSelection` — because the autofit effects' dependency arrays need those viz VALUES to re-fire (a ref would never re-trigger the once-per-spaceId / first-manifest autofit). `useVizSelection` itself does NOT read `deckApiRef`/`viewportSize`/`deckApiReadyTick` (corrects the stale dep claim in INVESTIGATION-FINDINGS §4).
- **`error`/`status` are HOST-derived** — `useStudioOperations` exposes ONLY the op state/setters + `runInGameRunning`/`saveDeployRunning` + `setLocalError`/`clearLocalErrorIfCurrent`. The host (after both `useStudioOperations` and `useBrowserRun` have run) derives `browserRunning`-composite, `error = localError ?? browserRunner.state.error`, `status`, and `operationControlsDisabled` as synchronous render-scope consts. The error/status derivation MUST NOT be placed inside `useStudioOperations` (that would reintroduce a `browserRunner` ordering dependency).

## 4. Hard init-order invariants (must all hold in the host render)

1. `useStudioOperations` **first** (op state + busy source; host derives error/status after `useBrowserRun`).
2. `useViewportLayout` **before** `useVizSelection` (it owns `deckApiRef`/`viewportSize`, has NO viz dependency). `useDeckAutofit` is called **after** `useVizSelection` (it consumes the viz read-projection by value + `deckApiRef`/`viewportSize`/`deckApiReadyTick`). This resolves the earlier contradiction: the autofit effects depend on viz VALUES, so they cannot live in a hook ordered before `useVizSelection`.
3. `overlayDataTypeKey` computed **before** `useVizState` (circular dep, internal to `useVizSelection`).
4. `useLiveRuntime` **before** `useRunInGame` (adoption effect needs both op setters).
5. `useSaveDeploy` initialized **before** the operation-adoption effect fires.
6. Busy booleans stable from the **first** render (default `false`).

## 5. Slice classification

- **Pure-move (trivial relocation):** module pure-helpers, `useViewportLayout`, `useKeyboardShortcuts`, `useLiveRuntime`, `useSetupControls`.
- **Atomic-move (behavior-identical, but carries an ordered effect group — NOT a trivial compile-and-move):** `useBrowserRun` (auto-run trio Tier-A), `useVizSelection` (stage→step→viz cascade + the era→overlay 4th atomic group), `useDeckAutofit` (the deck-autofit Tier-B ordered pair). Each is done only when its ordered-group gating tests are green.
- **Atomic-move-with-contract:** `useStudioOperations` (synchronous busy/error), `usePresetLifecycle` (`markPresetApplied` identity + `applyAuthoringSnapshot` order), `useSaveDeploy` + `useRunInGame` (call those contracts in the prescribed order).
- **Improve (separate, flagged, tested):** IMPROVE-1 (remove dead `setLiveRuntimeSnapshot`), IMPROVE-2 (`useLatestRef`), BR-13 (no leaked auto-run timer via ref co-location).

## 6. Atomic effect groups (lift co-resident, source order preserved)

1. preset default-seed (410) → preset-apply (435) — in `usePresetLifecycle`.
2. stage (857) → step (862) → viz-sync (867) — in `useVizSelection`; keep 867's `exhaustive-deps` suppression.
3. auto-run trio (929/939/973) — in `useBrowserRun`; prefer extracting as a pure state machine driven by fake timers.
4. era-clamp (2164) → overlay-variant-pref (2198) — in `useVizSelection`; output persists, so reversal is a real bug.

Lower-risk ordered pairs (keep relative order within their hook): deck-autofit (608/617, **`useDeckAutofit`**); overlay-prune→variant-pref + era→overlay (`useVizSelection`); save-deploy waiter mirror→cleanup (548/558, `useSaveDeploy`).

## 7. Review lanes (required before each slice closes)

Adapted from the runtime-simplification review machinery, framed around the real risk:
- **Behavior lane** — the slice's `BEHAVIOR-TEST-PLAN.md` gating tests pass; for atomic-with-contract slices the contract test (ADD-1/2/3, RIG-5) is green; watch effect order, shared-value timing, request-key staleness, accepted-then-background semantics. (Claude/Opus + `codex:review`.)
- **Architecture-boundary lane** — the seam stayed clean; no new coupling; refs travel with their effects; only the declared read-projection / setters cross hook boundaries; init-order invariants hold.
- **Maintainability lane** (`dev:review-code-quality` posture) — the move reduced complexity (host shrank), did not relocate it; no preserved bad practice that could have been improved + tested; no wrapper/branch sprawl.
- **Design-level adversarial** — `codex:adversarial-review` on this design and on each improve-slice (challenge the approach/assumptions, not just defects).
- Structure/lint concerns are **Habitat's** job (`bun run habitat classify`), not these lanes or the behavior tests.

## 8. Out of scope (explicit)

- D1 hardcoded `recipeId` in `handleRunInGame` — left as-is; flagged for a separate product decision (single-recipe catalog makes it invisible today; no testable failure).
- Daemon/server runtime, feature modules, leaf components, stores, oRPC/query layer, design system — unchanged.
- Storybook — independent track; this pass produces no visual surface.
