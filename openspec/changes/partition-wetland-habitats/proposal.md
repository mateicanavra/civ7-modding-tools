## Why

Marshes and wetland-family features are oversaturated because near-river humid
or fertile land is too broad a habitat proxy. Wetlands need hydromorphic,
lowland, floodplain, intertidal, cold-bog, and arid water-point distinctions.

## Target Authority Refs

- `mods/mod-swooper-maps/AGENTS.md`: Ecology owns
  `artifact:ecology.featureIntents.wetlands`.
- `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`: feature planning is
  Ecology truth.
- Direct user guidance: keep feature-specific physics real and avoid lazy
  generic fixes.

## What Changes

- Partition wetland-family habitat: marsh, tundra bog, mangrove, oasis, and
  watering-hole features must each follow the physical context they represent.
- Keep wetland substrate/scoring/planning in Ecology truth ops.
- Add focused and recipe-level tests that prevent blanket marsh from river
  adjacency alone.

## Dependencies

- Requires `bound-ecology-feature-intent-planners`.

## Forbidden Non-Goals

- No chance thinning, generated-output edits, map special casing, projection
  truth planning, or broad shared config schema buckets.

## Verification Gates

- focused wetland tests;
- recipe-level wetland balance tests;
- `bun run --cwd mods/mod-swooper-maps check`;
- `bun run openspec -- validate partition-wetland-habitats --strict`;
- `bun run openspec:validate`;
- `bun run build`;
- `bun run deploy:mods`;
- `git diff --check`.
