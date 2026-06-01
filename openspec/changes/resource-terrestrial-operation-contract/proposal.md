## Why

Aquatic and cultivated resources now have symbolic group planning operations.
The terrestrial/animal/forest/wild group is the next bounded set: it covers
open-grazing animals, forest products, wild habitat resources, and proxy-heavy
rows such as truffles and llamas. This slice gives every resource its own
warning-only symbolic planning row without moving placement behavior.

## Target Authority Refs

- `openspec/changes/resource-stage-architecture`: resource stage operation
  sequence and `plan-resource-groups` boundary.
- `openspec/changes/resource-earthlike-expectations-artifact`: typed
  `artifact:resources.earthlikeExpectations` source rows.
- `openspec/changes/resource-aquatic-operation-contract` and
  `openspec/changes/resource-cultivated-operation-contract`: reviewed
  symbolic group-planning precedent.

## What Changes

- Add `resources/plan-terrestrial-resources`.
- Account for all 11 terrestrial/animal/forest/wild resources separately.
- Preserve row-level lanes for arid rangeland, open grazing, highland pastoral,
  savanna megafauna, cold/boreal furs, woodland host, tropical forest product,
  diverse wild habitat, and tropical highland pastoral resources.
- Preserve explicit proxy requirements for truffles and llamas, plus hardwood's
  caveat against broadening to temperate forests without proof.

## Explicit Non-Goals

- No placement behavior change.
- No adapter materialization or runtime numeric id verification.
- No hard closure gates or game restart proof.
- No implementation for geological/mineral/gemstone/industrial resources.
- No external Graphite submission/PR delivery claim.

## Verification Gates

- `bun run --cwd mods/mod-swooper-maps test -- test/resources/resource-terrestrial-op-contract.test.ts test/resources/resource-cultivated-op-contract.test.ts test/resources/resource-aquatic-op-contract.test.ts test/resources/resource-earthlike-expectations-artifact.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate resource-terrestrial-operation-contract --strict`
- `bun run openspec:validate`
- `git diff --check`
