## 1. Phase Opening

- [ ] 1.1 Confirm the worktree is on `agent-S-studio-shell-decomposition` off `main`, the analysis corpus is committed, and `StudioShell.tsx` is unmodified at the base commit.
- [ ] 1.2 Re-read `BEHAVIOR-TEST-PLAN.md` §5 (sequencing) and `INVESTIGATION-FINDINGS.md` §7 (contracts) before the first slice.
- [ ] 1.3 Each slice below is its own stacked Graphite branch (`gt create`); one logical change per branch; pure-move and improve-slices never mixed.

## 2. Implementation slices (in dependency order; each: implement → author gating tests → green → review → close)

- [ ] 2.0 **Step 0 — jsdom + RTL test infra.** Add `@testing-library/react` + `jsdom` (or `happy-dom`) dev deps; set `vitest.config.ts` `mapgen-studio` project `environmentMatchGlobs: [['test/controllers/**','jsdom']]`. Smoke: a trivial `renderHook` under `test/controllers/` passes AND the existing `mapgen-studio` suite stays green in `node`.
- [ ] 2.1 **H0 — module pure-helpers (pure move).** Move `isSaveDeployTerminal` + `saveDeployResultFromTerminalStatus` to `features/mapConfigSave/status.ts`; confirm the auto-run/cascade/selection decision logic that later slices will call is exported pure from `features/*`/`app/*`. Gating: §3.0 (PL-1/12/13, PL-9, RIG-2/4, LS-1/2/3, EO-2, SC-3, BG-2, PL-8, RIG-1/3 — incl. the 4 already-pinned).
- [ ] 2.2 **H0b — `useLatestRef` (improve, IMPROVE-2).** Add `app/hooks/useLatestRef.ts` (render-phase write). Gating: IMPROVE-2 (two-render `renderHook` + source-text: no `useEffect`).
- [ ] 2.3 **`useViewportLayout` (pure move + atomic autofit pair).** Lift viewport/ResizeObserver, `deckApiRef` (single owner), panel geometry, DAG query+prune, deck-autofit pair (608/617 + their refs), backgroundGrid. Gating: §3.2 (VL-1..5, LS-7). Init before `useVizSelection`.
- [ ] 2.4 **`useStudioOperations` (atomic move with contract — busy-gate + error channel).** Own `runInGameOperation`/`saveDeployOperation`/`localError` state; derive `runInGameRunning`/`saveDeployRunning`/`error`/`status` synchronously, stable-from-first-render; host completes the composite with `browserRunning`. Gating: §3.3 (BG-1/3/4, BR-12, ADD-2, ADD-3). Init FIRST.
- [ ] 2.5 **`useKeyboardShortcuts` (pure move).** Lift `shortcutsRef` (via `useLatestRef`) + the global keydown effect; export `shouldIgnoreGlobalShortcutsInEditableTarget` if needed for KB-3. Gating: §3.4 (KB-1..4).
- [ ] 2.6 **`useBrowserRun` (atomic move — auto-run trio Tier-A; BR-13 improve folded as its own commit).** Lift browser-runner wiring, `startBrowserRun`/`reroll`/`triggerRun`, the auto-run trio (929/939/973) + its refs, `isDirty`/`status`, `vizIngestRef` (render scope). Read busy flags THREADED from `useStudioOperations`. Prefer extracting the trio as a pure state machine (fake timers). Gating: §3.5 (BR-1..13).
- [ ] 2.7 **`useVizSelection` (atomic move — cascade + 4th atomic group; HIGH risk).** Lift `useVizState` + the full stage/step/dataType/space/mode/variant/era/overlay cascade; sole owner of stage/step/viz writes; `overlayDataTypeKey` render-phase before `useVizState`; keep 867's `exhaustive-deps` suppression; era-clamp(2164)→overlay-pref(2198) co-resident ordered. Gating: §3.6 (SS-1..6, LS-1..7, EO-1..6).
- [ ] 2.8 **`usePresetLifecycle` (atomic move with contract — markPresetApplied + applyAuthoringSnapshot).** Lift catalog/local presets, `resolvePreset`, apply-effects (410→435 Tier-A), `lastAppliedPresetRef` sole ownership; expose `markPresetApplied` (synchronous, identity-preserving) + `applyAuthoringSnapshot` (5-setter ordered write). Gating: §3.7 (PL-2..15, ADD-1).
- [ ] 2.9 **`useSaveDeploy` (atomic move with contract — calls markPresetApplied; waiter E21).** Lift `saveRepoBackedConfigWithState`, the waiter map + effects (548 before 558), `waitForSaveDeployTerminalEvent` (prefer standalone factory); call `markPresetApplied` before `setRecipeSettings`. Init before the adoption effect fires. Gating: §3.8 (SD-1..11, PL-7, PL-11).
- [ ] 2.10 **`useLiveRuntime` (pure move — mount-lifecycle refs; + IMPROVE-1).** Lift snapshot/setup staleness machine, abort/mounted refs, `applyLiveGameState`, relation; accept `orpcClient` as param/context. Remove dead `setLiveRuntimeSnapshot` (IMPROVE-1, separate commit). Init before `useRunInGame`. Gating: §3.9 (LR-2..9, SC-7/8) + IMPROVE-1.
- [ ] 2.11 **`useRunInGame` (atomic move with contract — calls applyAuthoringSnapshot + markPresetApplied).** Lift fingerprint/relation/materialization, `handleRunInGame`, `syncStudioFromLiveGame` (delegates the 5-setter write to `applyAuthoringSnapshot`), `copyRunInGameDiagnostics`. Receive host-computed `provedRunInGameSource`/`runInGameMaterializationMode`. Init after `useLiveRuntime`+`useSaveDeploy`. Do NOT touch the hardcoded `recipeId` (D1). Gating: §3.10 (RIG-2/4/5/6/7) + MAN-1.
- [ ] 2.12 **`useSetupControls` (pure move — setup options + drift + live-game actions).** Lift `setupControlOptions`, `savedSetupConfigModified`, `handleSavedSetupConfigChange`, `handleToggleAutoplay`, `handleExplore` (receive `setLiveRuntime`). Gating: §3.11 (SC-4/5/6) + MAN-3.
- [ ] 2.13 **Host collapse.** Confirm `StudioShell.tsx` is reduced to layout + error-boundary + shortcuts host + coordination wiring (host-owned live-source preset derivations + composite busy/error/status); no residual domain orchestration.

## 3. Review (per slice — close before stacking the next)

- [ ] 3.1 Behavior lane: gating tests green; contract test green for atomic-with-contract slices; Claude/Opus + `codex:review`.
- [ ] 3.2 Architecture-boundary lane: clean seam; refs travel with effects; only declared values cross boundaries; init-order invariants hold.
- [ ] 3.3 Maintainability lane (`dev:review-code-quality`): complexity reduced not relocated; no preserved-bad-practice; no wrapper sprawl.
- [ ] 3.4 `codex:adversarial-review` on this design (once) and on each improve-slice.

## 4. Verification & Closure

- [ ] 4.1 `vitest run --config vitest.config.ts --project mapgen-studio` — full suite green (node + jsdom-scoped controller tests).
- [ ] 4.2 `nx run mapgen-studio:build` + typecheck on touched packages green; `check:worker-bundle` still green.
- [ ] 4.3 `bun run habitat classify <diff>` + Habitat/Nx/Biome gates.
- [ ] 4.4 Manual in-game proof MAN-1/2/3 (run-in-game / live-runtime / setup actions) per `.agents/skills/civ7-operational-debugging`; record SHA + per-flow markers.
- [ ] 4.5 `bun run openspec -- validate studio-shell-decomposition --strict`.
- [ ] 4.6 `git diff --check`; `gt status`; `gt log --no-interactive`; worktree clean or precise handoff packet.
- [ ] 4.7 Confirm coverage ledger: all 106 gating specs accounted for (green / already-pinned / manual-proved); no unflagged behavior change shipped in a pure-move slice.
