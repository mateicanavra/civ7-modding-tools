## Why

`apps/mapgen-studio/src/app/StudioShell.tsx` is a single ~2,897-line React function component — the studio client's orchestration monolith (~21 `useEffect`, ~43 `useCallback`, ~31 `useMemo`, refs, and stores wired together). It is the studio's single largest comprehension and change-risk surface; every feature touch routes through it.

Two prior structural passes landed: feature/leaf extraction (`APP-TSX-REFACTOR-PLAN`) and the server/daemon runtime simplification that made the client event-driven (`studio-runtime-simplification` D0–D12, #1748). This is the **third and final** structural pass: lift the remaining client orchestration glue out of the host so `StudioShell` returns to its target role — **layout + error-boundary + shortcuts host** (target authority: `docs/projects/mapgen-studio-redesign/architecture/10-target-architecture.md` §4; do-not-break registry §7).

The chief hazard is **silent behavior change**: this component owns load-bearing timing (effect fire order, request-key staleness, accepted-then-background operation semantics, object-identity skip-guards). A decomposition that reorders effects or re-times shared values "while moving code" ships a regression that looks like a clean refactor. This change set front-loads the analysis so execution is a behavior-preserving railgun.

**Target authority + analysis basis (read before implementing):**
- `docs/projects/mapgen-studio-redesign/architecture/10-target-architecture.md` §4 (host role), §7 (parity registry).
- `docs/projects/studio-shell-decomposition/PRODUCT-MODEL.md` — capabilities, flows, essential invariants E1–E28/E18b, global state machine.
- `docs/projects/studio-shell-decomposition/INVESTIGATION-FINDINGS.md` — the effect-order graph, shared-value DAG, the corrected ~10-hook map + cross-hook contracts (§7, adversarially verified).
- `docs/projects/studio-shell-decomposition/BEHAVIOR-TEST-PLAN.md` — the 106 falsification-oriented gating specs that verify each slice.

## What Changes

Decompose the `StudioShell` orchestration glue into **~10 controller hooks + a host coordination layer + module pure-helpers + a `useLatestRef` helper**, one slice per stacked Graphite branch, each independently behavior-proved against `BEHAVIOR-TEST-PLAN.md`:

- **Test infrastructure (Step 0):** add `@testing-library/react` + `@testing-library/dom` + jsdom (via `bun add`, lockfile-safe), scoped to `test/controllers/` via the vitest-4 per-file `// @vitest-environment jsdom` docblock so existing node tests are untouched (enables `renderHook` proof for the lifecycle-bound contracts).
- **Pure-move slices** (trivial relocation, behavior identical): module pure-helpers, `useViewportLayout`, `useKeyboardShortcuts`, `useLiveRuntime`, `useSetupControls`.
- **Atomic-move slices** (behavior-identical, but carry an ordered effect group — NOT a trivial compile-and-move; the ordered-group test must be green): `useBrowserRun` (auto-run trio), `useVizSelection` (stage→step→viz cascade + the era→overlay 4th atomic group), `useDeckAutofit` (the deck-autofit ordered pair, lifted after `useVizSelection`).
- **Atomic-move-with-contract slices** (must honor a named cross-hook contract — object identity, ordered write, or synchronous derivation): `useStudioOperations` (busy-gate synchronicity + single-owner error channel), `usePresetLifecycle` (`markPresetApplied` `===`-identity guard for BOTH the save and live-sync paths + `applyAuthoringSnapshot` ordered write), `useSaveDeploy` and `useRunInGame` (which call those contracts).
- **Improve-slices** (deliberate, separately-flagged, individually-tested behavior changes): remove dead write-only `setLiveRuntimeSnapshot` (IMPROVE-1); formalize the render-phase latest-value ref as `useLatestRef` (IMPROVE-2); guarantee no leaked auto-run timer by ref co-location (BR-13).
- The host (`StudioShell.tsx`) collapses to layout + error-boundary + shortcuts host + the coordination wiring, and retains the live-source-aware preset derivations to break the `usePresetLifecycle ⇄ useRunInGame` cycle.

## What Does Not Change

- **No behavior change inside a pure-move slice.** Parity is the floor; improvements ship only as separate, flagged, tested improve-slices.
- The daemon/server runtime (`studio-runtime-simplification`, done) — not reopened.
- The feature modules and leaf components (`APP-TSX-REFACTOR-PLAN`, done) — not re-extracted.
- The Zustand store layer (`authoring`/`view`/`run`) — remains the state owner.
- The oRPC/TanStack-Query data layer, the design-system, and the event-driven client contract (`useStudioEvents`, `operationAdoption`) — unchanged.
- The hardcoded `recipeId` in `handleRunInGame` (D1) — left as-is (out of scope; flagged for separate product decision).
- The seed range, localStorage schema, and all `features/*` pure logic — preserved byte-for-byte behavior.

## Affected Owners

- `apps/mapgen-studio/src/app/StudioShell.tsx` (the host — shrinks to ~200–300 lines)
- `apps/mapgen-studio/src/app/controllers/*` (NEW — the ~10 controller hooks)
- `apps/mapgen-studio/src/app/hooks/useLatestRef.ts` (NEW)
- `apps/mapgen-studio/src/features/mapConfigSave/status.ts` (receives the two save-deploy pure helpers)
- `apps/mapgen-studio/test/controllers/*` (NEW — gating tests)
- `vitest.config.ts` (scoped jsdom env for `test/controllers/**`)
- Forbidden owners (do NOT modify behavior): `src/features/*` logic, `src/stores/*`, `src/components/ui/*`, the daemon/server, the leaf components.

## Requires / Enables

- **Requires:** the two prior passes landed (feature extraction; runtime simplification #1748) and the event-driven client substrate.
- **Enables:** future per-feature work to touch a single controller hook instead of the monolith; an eventual Storybook track (independent — this pass produces no visual surface).

## Verification Gates

- Per slice: its `BEHAVIOR-TEST-PLAN.md` gating tests green (`vitest run --config vitest.config.ts --project mapgen-studio`).
- `bunx nx run @mateicanavra/civ7-cli:... ` not implicated; run `nx run mapgen-studio:test` + `:build` + typecheck on touched packages.
- `bun run habitat classify <diff>` (structure/lint owned by Habitat, not the behavior tests).
- Claude/Opus review (behavior + architecture-boundary + maintainability lanes) **and** Codex `codex:review` per slice; Codex `codex:adversarial-review` for this design and each improve-slice.
- Manual in-game proof (MAN-1/2/3) for the live-runtime / run-in-game / setup-actions slices, per `.agents/skills/civ7-operational-debugging`.
- `bun run openspec -- validate studio-shell-decomposition --strict`.
- `git diff --check`; `gt status`; one logical change per Graphite branch.

## Stop Conditions

- A cluster cannot be lifted without a behavior change that is NOT a defined, testable improve-slice → escalate (split the move from the change, or redesign that cluster).
- **Two consecutive** clusters can only be extracted by smuggling an unflagged, untested behavior change into a "move" → stop and re-derive the seam map.
- A new substantial presentational component is discovered embedded in the host (contradicts the "controller-hooks-only" premise) → re-scope.
- A gating test cannot be made to falsify its hazard (the behavior is genuinely untestable) → re-classify the slice and surface it, do not ship an unproven move.
