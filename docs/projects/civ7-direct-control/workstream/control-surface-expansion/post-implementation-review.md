# Post-Implementation Review

Date: 2026-05-31
Reviewer frame: complicated implementation review for `codex/civ7-direct-control-surface`.

## Findings

### P1: `configureCiv7Autoplay()` mutates App UI Autoplay without approval

- Evidence: `packages/civ7-direct-control/src/index.ts:1456` defines `configureCiv7Autoplay(options)` with no `Civ7ActionApproval` parameter, then executes `buildConfigureAutoplayCommand(options)` at `packages/civ7-direct-control/src/index.ts:1464`.
- Evidence: `buildConfigureAutoplayCommand()` emits setters from `autoplaySetterSource()` at `packages/civ7-direct-control/src/index.ts:2512`.
- Evidence: the CLI constructs an approval object at `packages/cli/src/commands/game/autoplay.ts:70`, but the `configure` branch does not pass it at `packages/cli/src/commands/game/autoplay.ts:76`.
- Why it matters: this violates the action-surface contract that mutating wrappers are explicit, approved, and auditable. Configure can change turns, observe player, return player, and pause state.
- Repair: change `configureCiv7Autoplay(options, approval)` to call `assertApproved()`, update CLI to require/pass approval for `configure`, and add tests proving configure rejects missing approval and sends exactly once when approved.

### P1: bounded map/visibility reads can still iterate enormous grids inside Civ

- Evidence: `validateMapBounds()` only caps each dimension to `10_000` at `packages/civ7-direct-control/src/index.ts:2870`; it does not cap `width * height`.
- Evidence: `buildMapGridCommand()` materializes every location from bounds before slicing to `maxPlots` at `packages/civ7-direct-control/src/index.ts:2236`.
- Evidence: `buildVisibilitySummaryCommand()` iterates every plot in bounds before slicing the returned states at `packages/civ7-direct-control/src/index.ts:2366`.
- Why it matters: `--bounds 0,0,10000,10000 --max-plots 512` is advertised as bounded, but the injected Civ script can loop 100M plots and hang the game/runtime before output truncation.
- Repair: enforce an area cap before command generation, cap `locations.length`, and make the generated scripts stop once `maxPlots` is reached while reporting omitted count from the requested area.

### P2: `startCiv7Autoplay()` can start unbounded autoplay

- Evidence: `startCiv7Autoplay()` only validates `turns` when provided at `packages/civ7-direct-control/src/index.ts:1485`.
- Evidence: `buildStartAutoplayCommand()` calls `Autoplay.setActive(true)` regardless of whether a bounded turn count was set at `packages/civ7-direct-control/src/index.ts:2519`.
- Evidence: the CLI `--turns` flag is optional for `game autoplay --action start` at `packages/cli/src/commands/game/autoplay.ts:33`.
- Why it matters: the workstream requires bounded, auditable mutation semantics. Starting Autoplay with prior or default turn state can run longer than intended.
- Repair: require a bounded `turns` value for `startCiv7Autoplay()` unless the approval contract has a separate explicit unbounded mode, and add a regression test for missing turns.

### P2: turn-complete guard defaults to sendable when the native guard is absent

- Evidence: `buildTurnCompletionStatusCommand()` reports `canEndTurn: true` when no `canEndTurn` global exists at `packages/civ7-direct-control/src/index.ts:2535`.
- Evidence: `sendCiv7TurnComplete()` blocks only when `before.canEndTurn` is explicitly false at `packages/civ7-direct-control/src/index.ts:1577`, then sends `GameContext.sendTurnComplete()` at `packages/civ7-direct-control/src/index.ts:1583`.
- Why it matters: this is a mutating player action. Unknown readiness should not silently become permission to end turn, especially for LLM-agent/player-control surfaces.
- Repair: treat a missing native guard as unavailable or unverified, consult blocker status explicitly where possible, and require the wrapper to return a classified error unless a known source-backed readiness predicate passes.

### P2: Studio build gate does not currently verify the touched endpoint code

- Evidence: `bun run --cwd apps/mapgen-studio build` fails before completion with `TS7016` at `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts:3` for missing declarations for `@civ7/adapter/mock`.
- Evidence: the closure packet claims `bun run --cwd apps/mapgen-studio build` completed at `docs/projects/civ7-direct-control/workstream/control-surface-expansion/implementation-closure.md:147`.
- Why it matters: the change touches `apps/mapgen-studio/vite.config.ts`, so the Studio integration claim is not reproducible from the current worktree.
- Repair: either add/restore the missing declaration/export for `@civ7/adapter/mock` and rerun the Studio build, or downgrade the closure claim and record this as an unrelated pre-existing blocker with evidence.

## Residual Risks

- The new generic operation request wrapper reports `verified` from request response presence rather than a domain-specific postcondition. That is probably acceptable for generic `sendRequest` plumbing, but player/LLM-facing helpers should not interpret it as proof of gameplay effect until each operation has a typed postcondition.
- `getCiv7GameInfoRows()` bounds output but still materializes `Array.from(table)` before slicing. Civ tables are expected to be small enough for current use, but large-table or all-table catalog reads should use lookup/filter-first paths or a hard iteration cap.
- Live mutation proof was not rerun during this review. I treated live mutation as safety-sensitive and reviewed only mock-socket mutation coverage plus the local implementation.

## Verification Reviewed

Passed locally:

- `bun run --cwd packages/civ7-direct-control test`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`
- `bun run --cwd packages/cli check`
- `bun run --filter @mateicanavra/civ7-cli test -- game.control.test.ts`
- `bun run --cwd packages/cli test -- test/commands/game.control.test.ts test/commands/game.restart.test.ts`
- `bun run --filter @mateicanavra/civ7-cli build`
- `git diff --check`
- `bun run openspec -- validate direct-control-state-role-model --strict`
- `bun run openspec -- validate direct-control-read-surface --strict`
- `bun run openspec -- validate direct-control-action-surface --strict`
- `bun run openspec -- validate direct-control-capability-catalog --strict`
- `bun run openspec -- validate direct-control-cli-studio-expansion --strict`

Failed locally:

- `bun run --cwd apps/mapgen-studio build` fails with missing `@civ7/adapter/mock` declarations at `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts:3`.

Not run:

- Live Civ mutation proof.
