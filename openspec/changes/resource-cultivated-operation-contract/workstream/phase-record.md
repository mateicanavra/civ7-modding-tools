# Phase Record: Resource Cultivated Operation Contract

## Objective

Add the second resource-group operation contract for
cultivated/plantation/medicinal resources while preserving per-resource
coverage, blocked-row visibility, proxy visibility, and the unverified
runtime-id boundary.

## Repo State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-resource-distribution-workstream`
- Branch: `codex/resource-cultivated-operation-contract`
- Parent slice: `codex/resource-aquatic-operation-contract`
- Parent aquatic local commit:
  `ad23eb663b53c4134e962d00781685b1998c4484`
- Studio/API pair for this worktree: `http://127.0.0.1:5174/`

## Follow-Up Repair

- Watcher found stale aquatic closure metadata after the aquatic branch had
  already been committed cleanly and this cultivated branch had been opened.
- This slice repairs the aquatic task/phase record as a follow-up instead of
  rewriting the already-clean downstack branch while cultivated work is active.
- Local commit closure is distinct from external Graphite submission/PR
  delivery, which remains unclaimed until submitted.

## Agent Review

- Hypatia: repo-local cultivated resource/proxy inventory. Outcome: confirmed
  18-resource group, single blocked row `RESOURCE_CLOVES`, and key proxy tests
  for coastal dyes, highland tea/coffee/quinine, oasis dates, and wetland rice.
- Beauvoir: contract architecture review requested; pending.
  Findings accepted:
  - P1 tests/OpenSpec must exist before closure. Repaired in this slice with
    focused test file and OpenSpec change.
  - P1 single cultivated op is acceptable only as symbolic group planning, not
    one ecology. Repaired through warning-only contract language and
    per-resource rows.
  - P2 lane/subgroup should be explicit. Repaired with row-level `laneId` and
    design lane map.
- Newton: final scoped P1/P2 review. Outcome: no P1/P2 findings. Residual
  risk noted that `RESOURCE_CLOVES` blocked behavior depends on the trusted
  expectation row status, acceptable for this slice boundary.

## FireTuner Runtime-Proof Boundary

- The downstream resource-runtime-proof boundary remains in place.
- This contract slice does not claim runtime proof and does not restart the
  game.
- Final runtime proof still must integrate/restack on top of
  `codex/firetuner-socket-studio-restart` at `bb39b3cf7` or successor and use
  the FireTuner socket/API restart path.

## Verification So Far

- `bun run --cwd mods/mod-swooper-maps test -- test/resources/resource-cultivated-op-contract.test.ts test/resources/resource-aquatic-op-contract.test.ts test/resources/resource-earthlike-expectations-artifact.test.ts`
  - Passed: 19 tests, 727 assertions.
- `bun run --cwd mods/mod-swooper-maps check`
  - Passed.
- `bun run openspec -- validate resource-cultivated-operation-contract --strict`
  - Passed.
- `bun run openspec:validate`
  - Passed: 24 items.
- `git diff --check`
  - Passed.

## Closure State

- Locally committed clean at
  `3494d91ded3ca38471ad560daca184546994e7d6` on
  `codex/resource-cultivated-operation-contract`.
- External Graphite submission/PR delivery is not claimed by this local closure
  record.
- This closure-state repair is recorded in follow-up slice
  `codex/resource-terrestrial-operation-contract` because the cultivated commit
  had already been created and the workstream had moved onto the terrestrial
  branch when the watcher found the stale OpenSpec task/phase state.
