# Phase Record

## Phase

- Project: resource distribution recovery
- Phase: root-cause diagnostics
- Owner: Codex workstream owner
- Branch/Graphite stack: `codex/resource-distribution-root-cause` above
  `codex/resource-distribution-planning`
- Started: 2026-05-31
- Status: committed

## Objective

Make the existing resource collapse observable without changing resource
strategy behavior. The slice proves whether local/runtime placement evidence can
group exact resource intent outcomes by adapter numeric id and by typed rejection
reason.

## Scope

- Write set:
  - `openspec/changes/resource-distribution-root-cause/**`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/place-resources/materialize.ts`
  - `mods/mod-swooper-maps/test/support/world-balance-stats.ts`
  - `mods/mod-swooper-maps/test/pipeline/world-balance-stats.test.ts`
  - `mods/mod-swooper-maps/test/placement/resource-placement-diagnostics.test.ts`
- Protected files: generated outputs, `.civ7/outputs/resources/**`, lockfiles,
  resource strategy modules, stage topology, shipped config tuning.
- Consumer impact: diagnostics only. Placement behavior and resource strategy
  output are intentionally unchanged.

## Agent Evidence

- Franklin: current dirty implementation has the right minimal telemetry shape:
  `summary.byResource[]` and `summary.byReason[]` on the existing
  `resourcePlacementOutcomes` artifact. Main typing risk was widened `string`
  reasons; repaired by typing reasons as adapter rejection/mismatch unions.
- Hume: root-cause slice must not implement the resource stage or strategy
  tuning. It should add OpenSpec, diagnostics, stats exposure, tests, review, and
  validation only.
- Hubble: local files can support a static resource ordinal hypothesis but not
  runtime `GameInfo.Resources` truth. Diagnostics must label ids as adapter
  numeric ids until a runtime verification slice proves names.
- Final review:
  - Franklin: no P1/P2 blockers; requested clearer mismatch fail-hard wording.
  - Hume: no behavior-scope blockers; accepted P2 to update task/phase state
    after gates.
  - Hubble: no P1/P2 runtime-id boundary blockers.

## Runtime ID Boundary

- Official XML stores resource identity as text keys; runtime placement APIs use
  numeric ids.
- The adapter currently exposes numeric candidates `0..54` without runtime
  lookup.
- This slice does not verify whether numeric id `44` is rubies or whether any
  other numeric id maps to a specific official resource at runtime.
- Later `resource-corpus-contract` and runtime proof slices must add
  `GameInfo.Resources` verification before symbolic resource claims become
  closure evidence.

## Verification

- Passed:
  - `bun run --cwd mods/mod-swooper-maps test -- test/placement/resource-placement-diagnostics.test.ts`
  - `bun run --cwd mods/mod-swooper-maps test -- test/pipeline/world-balance-stats.test.ts`
  - `bun run --cwd mods/mod-swooper-maps check`
  - `bun run openspec -- validate resource-distribution-root-cause --strict`
  - `bun run openspec:validate`
  - `git diff --check`
- Notes:
  - `bun install --frozen-lockfile` was needed in this isolated worktree.
  - `packages/civ7-adapter`, `packages/mapgen-viz`, `packages/mapgen-core`, and
    `packages/sdk` were built so workspace package exports resolved for tests
    and type checks.

## Next Action

Proceed to the resource-stage architecture and corpus-contract slices.
