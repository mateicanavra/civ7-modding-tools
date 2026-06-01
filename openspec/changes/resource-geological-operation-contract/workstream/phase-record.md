# Phase Record: Resource Geological Operation Contract

## Objective

Add the fourth resource-group operation contract for
geological/mineral/gemstone/industrial resources while preserving per-resource
coverage, strict geological proxy visibility, warning-only proof, and the
unverified runtime-id boundary.

## Repo State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-resource-distribution-workstream`
- Branch: `codex/resource-geological-operation-contract`
- Parent slice: `codex/resource-terrestrial-operation-contract`
- Studio/API pair for this worktree: `http://127.0.0.1:5174/`

## Agent Review

- Heisenberg: geological resource/proxy review. Findings accepted:
  - Keep this as one symbolic group op; no repo-local falsifier requiring a
    split now.
  - Preserve the exact 20-resource group and the four blocked active-zero rows.
  - Guard against proxy broadening for silver, coal, oil, limestone, tin, and
    rubies.
  Repairs: tests cover strict source-family signal fields, no generic
  forest/wetland or tropical broadening, active-zero blocked rows, missing
  rows, config selector rejection, proxy gaps, and suppression behavior.
- Heisenberg: final diff review. Findings accepted:
  - Tighten companion masks that were acting as standalone geological source
    eligibility.
  - Disposition the watcher note so the terrestrial repair is not recorded as
    unresolved after this slice.
  Repairs: standalone alluvial jade, orogenic marble, hill-only
  iron/limestone, wet-alluvial niter, and broad carbonate ruby eligibility were
  removed; the note records the current-slice repair disposition.

## Follow-Up Repair

- The watcher found stale terrestrial closure metadata after the terrestrial
  branch had already been committed cleanly and this geological branch had been
  opened.
- This slice repairs the terrestrial task/phase record as a follow-up instead
  of rewriting the already-clean downstack branch while geological work is
  active.
- Local commit closure is distinct from external Graphite submission/PR
  delivery, which remains unclaimed until submitted.

## FireTuner Runtime-Proof Boundary

- The downstream resource-runtime-proof boundary remains in place.
- This contract slice does not claim runtime proof and does not restart the
  game.
- Final runtime proof must use the acknowledged FireTuner socket/API restart
  boundary recorded in the note after restacking/integration checks.

## Verification So Far

- `bun run --cwd mods/mod-swooper-maps test -- test/resources/resource-geological-op-contract.test.ts`
  - Passed: 8 tests, 135 assertions.
- `bun run --cwd mods/mod-swooper-maps test -- test/resources/resource-geological-op-contract.test.ts test/resources/resource-terrestrial-op-contract.test.ts test/resources/resource-cultivated-op-contract.test.ts test/resources/resource-aquatic-op-contract.test.ts test/resources/resource-earthlike-expectations-artifact.test.ts`
  - Passed before final review repairs: 36 tests, 932 assertions.
  - Passed after final review repairs: 36 tests, 938 assertions.
- `bun run --cwd mods/mod-swooper-maps check`
  - Passed.
- `bun run openspec -- validate resource-geological-operation-contract --strict`
  - Passed.
- `bun run openspec:validate`
  - Passed: 26 items.
- `git diff --check`
  - Passed.

## Closure State

- Committed locally via Graphite at `9c64100ac` and worktree was clean before
  `codex/resource-group-plan-rollup` opened above it. External Graphite
  submission/PR delivery remains unclaimed until submitted.
