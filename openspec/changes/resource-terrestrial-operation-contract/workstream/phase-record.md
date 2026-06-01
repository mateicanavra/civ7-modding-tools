# Phase Record: Resource Terrestrial Operation Contract

## Objective

Add the third resource-group operation contract for
terrestrial/animal/forest/wild resources while preserving per-resource coverage,
proxy visibility, warning-only proof, and the unverified runtime-id boundary.

## Repo State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-resource-distribution-workstream`
- Branch: `codex/resource-terrestrial-operation-contract`
- Parent slice: `codex/resource-cultivated-operation-contract`
- Source Studio/API pair observed for this source slice:
  `http://127.0.0.1:5174/`

## Agent Review

- Mill: terrestrial resource/proxy review. Findings accepted:
  - Keep this as one symbolic group op; no split falsifier found.
  - Guard against proxy broadening for `RESOURCE_LLAMAS`,
    `RESOURCE_TRUFFLES`, and `RESOURCE_IVORY`.
  - Add synthetic blocked-row and suppression tests.
  Repairs: llamas now require `tropicalHighlandMask`, truffles require
  `moistWoodlandEdgeMask`, ivory uses `tropicalForestEdgeMask` rather than
  broad tropical forest, and focused tests cover these cases.
- Boyle: final scoped P1/P2 review. Outcome: no P1/P2 findings. Residual risk:
  this remains contract-only; upstream masks and runtime id/placement proof are
  outside this slice.

## Follow-Up Repair

- Watcher found stale cultivated closure metadata after the cultivated branch
  had already been committed cleanly and this terrestrial branch had been
  opened.
- This slice repairs the cultivated task/phase record as a follow-up instead of
  rewriting the already-clean downstack branch while terrestrial work is active.
- Local commit closure is distinct from external Graphite submission/PR
  delivery, which remains unclaimed until submitted.

## FireTuner Runtime-Proof Boundary

- Runtime-proof closure is owned by
  `openspec/changes/resource-runtime-proof/workstream/phase-record.md`.
- This contract slice does not claim runtime proof and does not restart the
  game.
- Final runtime proof must verify the downstack restart branch/commit,
  integrate or restack successor restart work if needed, use the FireTuner
  socket/API restart path rather than stale commands or manual bypasses, and
  record the exact branch/commit plus restart command/path used.

## Verification So Far

- `bun run --cwd mods/mod-swooper-maps test -- test/resources/resource-terrestrial-op-contract.test.ts test/resources/resource-cultivated-op-contract.test.ts test/resources/resource-aquatic-op-contract.test.ts test/resources/resource-earthlike-expectations-artifact.test.ts`
  - Passed: 28 tests, 797 assertions.
- `bun run --cwd mods/mod-swooper-maps check`
  - Passed.
- `bun run openspec -- validate resource-terrestrial-operation-contract --strict`
  - Passed.
- `bun run openspec:validate`
  - Passed: 25 items.
- `git diff --check`
  - Passed.

## Closure State

- Committed locally via Graphite at `e4f99d9ef` and worktree was clean before
  `codex/resource-geological-operation-contract` opened above it. External
  Graphite submission/PR delivery remains unclaimed until submitted.
