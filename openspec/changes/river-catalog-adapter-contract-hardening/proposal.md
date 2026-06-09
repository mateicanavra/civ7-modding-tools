## Why

The high-level river ownership split is sound, but contract holes can recreate
the same confusion: mock adapter metadata can hide live divergence, generated
catalog comments can overstate source truth, `modelRivers()` can look like a
supported authoring primitive, and river-class values can drift.

## Target Authority Refs

- `openspec/changes/river-lake-adversarial-workstream-design/workstream/adversarial-agent-synthesis.md`
- `packages/civ7-map-policy/**`
- `packages/civ7-adapter/**`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`

## What Changes

- Align mock adapter defaults with the live-observed terrain-without-metadata
  case.
- Rename generated catalog language from source truth to source evidence where
  appropriate.
- Mark `EngineAdapter.modelRivers()` as engine-generator compatibility only and
  keep standard MapGen stages guarded from using it.
- Validate or explicitly codify river-class value semantics.

## Requires

- Current map-policy river metadata source.
- Existing adapter/mock tests and map-stamping guard.

## Enables Parallel Work

- Runtime and Studio proof can rely on mock fixtures that do not mask metadata
  divergence.
- Catalog/type users get stable river metadata semantics.

## Affected Owners

- `packages/civ7-map-policy/**`
- `packages/civ7-types/**`
- `packages/civ7-adapter/**`
- `packages/mapgen-core/**` only if adapter interface docs live there
- MapGen guard tests and docs

## Forbidden Owners

- No official-resource hand edits.
- No adapter re-export of map-policy-owned constants.
- No Civ runtime API leak into pure MapGen core.

## Stop Conditions

- Mock adapter reports metadata rivers merely because terrain is navigable.
- Generated catalogs call official/live evidence "source of truth" for repo
  policy.
- A standard stage can call `modelRivers()` without failing tests.

## Verification Gates

- Mock/live divergence fixture tests.
- Generated catalog wording/parity tests.
- River-class validation tests.
- Import/adapter boundary guards.
- OpenSpec strict validation.
