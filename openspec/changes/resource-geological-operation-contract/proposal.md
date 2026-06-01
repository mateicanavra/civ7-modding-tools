## Why

Aquatic, cultivated, and terrestrial resources now have symbolic group planning
operations. The geological/mineral/gemstone/industrial group is the next
high-impact set because it contains the currently visible ruby path plus many
resources that are easy to over-broaden if they are treated as generic hills,
forest, wetland, or desert resources.

This slice gives every geological resource its own warning-only symbolic row
without changing placement behavior.

## Target Authority Refs

- `openspec/changes/resource-stage-architecture`: resource stage operation
  sequence and `plan-resource-groups` boundary.
- `openspec/changes/resource-earthlike-expectations-artifact`: typed
  `artifact:resources.earthlikeExpectations` source rows.
- `openspec/changes/resource-aquatic-operation-contract`,
  `openspec/changes/resource-cultivated-operation-contract`, and
  `openspec/changes/resource-terrestrial-operation-contract`: reviewed
  symbolic group-planning precedent.

## What Changes

- Add `resources/plan-geological-resources`.
- Account for all 20 geological/mineral/gemstone/industrial resources
  separately.
- Preserve blocked active-zero rows for distant-lands gold, distant-lands
  silver, lapis lazuli, and nickel.
- Preserve strict geological proxy lanes for hydrothermal/orogenic resources,
  evaporites, carbonates, cratons, sedimentary fuels, granite/placer tin,
  hydrocarbon seeps, and metamorphic ruby sources.
- Keep runtime ids unverified and output proof warning-only.

## Explicit Non-Goals

- No placement behavior change.
- No adapter materialization or runtime numeric id verification.
- No hard closure gates or game restart proof.
- No implementation for downstream resource group rollups, scoring, or final
  stats/runtime proof.
- No external Graphite submission/PR delivery claim.

## Verification Gates

- `bun run --cwd mods/mod-swooper-maps test -- test/resources/resource-geological-op-contract.test.ts test/resources/resource-terrestrial-op-contract.test.ts test/resources/resource-cultivated-op-contract.test.ts test/resources/resource-aquatic-op-contract.test.ts test/resources/resource-earthlike-expectations-artifact.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate resource-geological-operation-contract --strict`
- `bun run openspec:validate`
- `git diff --check`
