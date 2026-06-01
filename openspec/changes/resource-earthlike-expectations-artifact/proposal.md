## Why

The `resource-earthlike-expectations` slice defined the per-resource
expectation contract but deliberately stopped before source implementation.
Future resource operations need a typed artifact to consume before they can
claim per-resource coverage. This slice publishes that artifact without moving
placement behavior, verifying runtime numeric ids, or promoting inferred ranges
to hard count gates.

## Target Authority Refs

- `openspec/changes/resource-earthlike-expectations`: 55-resource partition,
  per-resource expectation row contract, blocked-row handling, and telemetry
  gate policy.
- `openspec/changes/resource-corpus-contract`: official corpus symbols,
  static row slots, and unverified runtime numeric id boundary.
- `openspec/changes/resource-stage-architecture`: accepted artifact name
  `artifact:resources.earthlikeExpectations`.

## What Changes

- Add `mods/mod-swooper-maps/src/domain/resources/earthlike-expectations/**`.
- Publish `EARTHLIKE_RESOURCE_EXPECTATIONS_ARTIFACT` in official corpus order.
- Register `resourceArtifacts.earthlikeExpectations` with id
  `artifact:resources.earthlikeExpectations`.
- Add a strict TypeBox schema that rejects runtime-id overclaims, feature rows,
  malformed statuses, missing range fields, and blocked rows with nonzero
  active ranges.
- Add focused resource tests for coverage, corpus refs, blocked rows, crabs
  navigable-river preservation, schema rejection, and placement-runtime
  boundary.

## Explicit Non-Goals

- No `resources` stage shell or recipe order change.
- No movement of `placement/plan-resources` or `place-resources`.
- No runtime `GameInfo.Resources` numeric id verification.
- No adapter numeric diagnostics joined to resource symbols.
- No stats closure gates or placement tuning.

## Verification Gates

- `bun run --cwd mods/mod-swooper-maps test -- test/resources/resource-corpus-contract.test.ts test/resources/resource-corpus-artifact.test.ts test/resources/resource-earthlike-expectations-artifact.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate resource-earthlike-expectations-artifact --strict`
- `bun run openspec:validate`
- `git diff --check`
