# Phase Record: Resource Diversity Stats Gate

## Objective

Add local world-balance stats gates proving shipped map identities no longer
place only a minority of adapter numeric resource ids when enough resource
placements exist.

## Repo State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-resource-distribution-workstream`
- Branch: `codex/resource-diversity-stats-gate`
- Parent slice: `codex/resource-placement-diversity`
- Source Studio/API pair observed for this source slice:
  `http://127.0.0.1:5174/`

## Agent Review

- Averroes: final scoped review. Outcome: no P1/P2 findings. Residual P3:
  numeric catalog size is hard-coded at 55, matching the current adapter catalog
  and OpenSpec design.

## Follow-Up Repair

- The watcher found stale placement-diversity closure metadata after that branch
  had already been committed cleanly and this stats-gate branch had been
  opened.
- This slice repairs the placement-diversity task/phase record as a follow-up
  instead of rewriting the already-clean downstack branch while stats-gate work
  is active.
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

- Manual stats probe over shipped identities at seed `1018`, `106x66`:
  - `swooper-earthlike`: 243 placed, 55 unique ids, per-id spread 4-5.
  - `realism-earthlike`: 243 placed, 55 unique ids, per-id spread 4-5.
  - `shattered-ring`: 123 placed, 55 unique ids, per-id spread 2-3.
  - `sundered-archipelago`: 53 placed, 53 unique ids, per-id spread 1-1.
  - `desert-mountains`: 314 placed, 55 unique ids, per-id spread 5-6.
- `bun test mods/mod-swooper-maps/test/pipeline/world-balance-stats.test.ts`
  - Passed: 2 tests, 1768 assertions.
- `bun run --cwd mods/mod-swooper-maps check`
  - Passed.
- `bun run openspec -- validate resource-diversity-stats-gate --strict`
  - Passed.
- `bun run openspec:validate`
  - Passed: 29 items.
- `git diff --check`
  - Passed.

## Closure State

- Committed locally via Graphite at `3cecdf6b49a1`, and the worktree was clean
  before `codex/resource-runtime-proof` opened above it. External Graphite
  submission/PR delivery, symbolic `RESOURCE_*` runtime-id proof, and FireTuner
  runtime proof remain unclaimed until separately evidenced.
