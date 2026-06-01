## Why

The resource distribution workstream now has a symbolic aquatic group planning
op. The next resource group with shared input families is
cultivated/plantation/medicinal. This slice gives those resources a
per-resource operation contract without moving placement behavior or claiming
runtime numeric ids.

## Target Authority Refs

- `openspec/changes/resource-stage-architecture`: resource stage operation
  sequence and `plan-resource-groups` contract boundary.
- `openspec/changes/resource-earthlike-expectations-artifact`: typed
  `artifact:resources.earthlikeExpectations` source rows.
- `openspec/changes/resource-aquatic-operation-contract`: reviewed precedent
  for symbolic group planning rows, strategy-owned resource sets, and
  warning-only runtime-id boundaries.

## What Changes

- Add `resources/plan-cultivated-resources`.
- Account for all 18 cultivated/plantation/medicinal resources separately.
- Preserve blocked `RESOURCE_CLOVES` as visible active-zero.
- Preserve edge proxies such as `RESOURCE_DYES` coastal/marine lane,
  highland/relief for tea/coffee/quinine, oasis dates, and wetland rice.
- Repair stale aquatic closure metadata in this follow-up slice because the
  aquatic branch had already been committed before the watcher found it.

## Explicit Non-Goals

- No placement behavior change.
- No adapter materialization or runtime numeric id verification.
- No hard closure gates or game restart proof.
- No implementation for terrestrial animal/forest/wild or geological groups.
- No external Graphite submission/PR delivery claim.

## Verification Gates

- `bun run --cwd mods/mod-swooper-maps test -- test/resources/resource-cultivated-op-contract.test.ts test/resources/resource-aquatic-op-contract.test.ts test/resources/resource-earthlike-expectations-artifact.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate resource-cultivated-operation-contract --strict`
- `bun run openspec:validate`
- `git diff --check`
