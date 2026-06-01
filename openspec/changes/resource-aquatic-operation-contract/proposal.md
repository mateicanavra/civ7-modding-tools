## Why

The resource stage architecture requires group planning ops that consume
`artifact:resources.earthlikeExpectations` before resource distribution can
claim per-resource coverage. The aquatic/coastal/navigable-river group is the
first bounded group slice because it contains the clearest runtime-id hazard:
marine and river-adjacent resources must stay symbolic until Civ7 runtime
resource ids are verified.

## Target Authority Refs

- `openspec/changes/resource-stage-architecture`: resource stage operation
  sequence, including `plan-resource-groups` and symbolic/runtime proof
  boundaries.
- `openspec/changes/resource-earthlike-expectations-artifact`: typed
  `artifact:resources.earthlikeExpectations` source rows.
- `openspec/changes/resource-earthlike-expectations`: aquatic group
  expectations for fish, pearls, whales, crabs, cowrie, and turtles, including
  crabs navigable-river proxy preservation.

## What Changes

- Add a `resources` domain op surface.
- Add `resources/plan-aquatic-resources` as the first group-level resource
  planning op.
- Preserve every aquatic resource as a symbolic `RESOURCE_*` row with
  expectation range, proof status, runtime-id status, proxy requirements, and
  eligibility signal fields.
- Report missing expectation rows and proxy gaps explicitly instead of dropping
  resources.
- Add focused tests proving all six aquatic resources are accounted for without
  numeric resource ids.

## Explicit Non-Goals

- No placement behavior change.
- No adapter materialization or `GameInfo.Resources` numeric id verification.
- No resource stage recipe order change.
- No hard count closure gate; this slice remains warning-only until runtime
  telemetry calibrates expectations.
- No implementation for the cultivated, terrestrial, or geological groups.

## Verification Gates

- `bun run --cwd mods/mod-swooper-maps test -- test/resources/resource-aquatic-op-contract.test.ts test/resources/resource-earthlike-expectations-artifact.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate resource-aquatic-operation-contract --strict`
- `bun run openspec:validate`
- `git diff --check`
