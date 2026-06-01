# Phase Record: Resource Placement Diversity

## Objective

Repair the transitional runtime-facing resource planner so selected placements
spread across the adapter-owned candidate resource catalog instead of repeatedly
using only a few adjacent numeric ids under common environmental signatures.

## Repo State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-resource-distribution-workstream`
- Branch: `codex/resource-placement-diversity`
- Parent slice: `codex/resource-group-plan-rollup`
- Source Studio/API pair observed for this source slice:
  `http://127.0.0.1:5174/`

## Agent Review

- Chandrasekhar: final scoped review. Outcome: no P1/P2 findings.
  - P3 wording issue accepted: tie-break wording now says forward circular
    distance to match implementation.
  - P3 note issue accepted: rollup watcher-note evidence now describes the
    rollup branch state as historical before placement-diversity opened above
    it.

## Follow-Up Repair

- The watcher found stale rollup closure metadata after the rollup branch had
  already been committed cleanly and this placement-diversity branch had been
  opened.
- This slice repairs the rollup task/phase record as a follow-up instead of
  rewriting the already-clean downstack branch while placement-diversity work is
  active.
- Local commit closure is distinct from external Graphite submission/PR
  delivery, which remains unclaimed until submitted.

## FireTuner Runtime-Proof Boundary

- Runtime-proof closure is owned by
  `openspec/changes/resource-runtime-proof/workstream/phase-record.md`.
- This slice does not claim runtime proof and does not restart the game.
- Final runtime proof must use the FireTuner socket/API restart boundary
  recorded in `openspec/changes/resource-runtime-proof/workstream/phase-record.md`
  after restacking/integration checks.

## Verification So Far

- `bun test mods/mod-swooper-maps/test/placement/plan-ops.test.ts`
  - Passed: 12 tests, 42 assertions.
- `bun run --cwd mods/mod-swooper-maps test -- test/resources/resource-group-rollup-op-contract.test.ts test/resources/resource-geological-op-contract.test.ts test/resources/resource-terrestrial-op-contract.test.ts test/resources/resource-cultivated-op-contract.test.ts test/resources/resource-aquatic-op-contract.test.ts test/resources/resource-earthlike-expectations-artifact.test.ts`
  - Passed: 42 tests, 1139 assertions.
- `bun run --cwd mods/mod-swooper-maps check`
  - Passed.
- `bun run openspec -- validate resource-placement-diversity --strict`
  - Passed.
- `bun run openspec:validate`
  - Passed: 28 items.
- `git diff --check`
  - Passed.

## Closure State

- Committed locally via Graphite at `bc6c328c1edb` and worktree was clean
  before `codex/resource-diversity-stats-gate` opened above it. External
  Graphite submission/PR delivery remains unclaimed until submitted.
