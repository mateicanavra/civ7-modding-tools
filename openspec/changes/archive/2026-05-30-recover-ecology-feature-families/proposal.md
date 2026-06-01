## Why

Fresh recipe probes and in-game screenshots show an inverse ecology-feature
failure: rainforest appears, but taiga, sagebrush steppe, and often savanna
woodland disappear. Existing world-balance tests pass because they only prove
aggregate vegetation and upper budgets, not distinct habitat outcomes.

The failure is categorical. Taiga and sagebrush score ops multiply by a
shared biomass proxy that has already been suppressed by the same cold or dry
stress those features are meant to represent. The vegetation planner then uses
one threshold and one winner policy for all vegetation ecotypes, so rainforest
dominates the family while cold/dry vegetation never reaches intent.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  Ecology truth belongs in owner-local ops and policies; map stages project.
- `mods/mod-swooper-maps/AGENTS.md`: Ecology feature planning publishes split
  intents before `map-ecology` writes engine state.
- `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`: feature-family
  habitat physics belong to Ecology ops/contracts.
- User direction: rules are policies; keep feature-specific policies near the
  strategies they modulate and do not create generic routers or shared buckets.

## What Changes

- Repair vegetation-family scoring so cold and dry ecotypes are not erased by
  duplicated stress penalties.
- Give vegetation-family planning per-feature admission policy/config where
  one threshold cannot represent rainforest, forest, taiga, savanna, and
  sagebrush together.
- Keep habitat physics and policy code with the owning vegetation feature ops
  and planner, not `score-shared`, `features-plan-shared`, or a generic bucket.
- Update shipped map configs/presets to use valid current strategies and
  identity-specific values.
- Extend stats/tests so each required vegetation family is measured as a
  product outcome, not hidden inside aggregate vegetation.

## Dependencies

- Builds on archived `normalize-ecology-topology`,
  `bound-ecology-feature-intent-planners`, and
  `align-map-terrain-materialization-order`.

## Forbidden Non-Goals

- No fallback "place any vegetation" behavior.
- No generic feature router, shared policy bucket, alias, shim, or compatibility
  lane.
- No moving feature-specific habitat physics into MapGen core or broad config.
- No special-casing Swooper Earthlike as the only map product.
- No proof from screenshots alone.

## Verification Gates

- focused vegetation score/planner policy tests;
- shipped-map world-balance tests across configs/seeds;
- config/preset schema and identity tests;
- `bun run --cwd mods/mod-swooper-maps check`;
- `bun run openspec -- validate recover-ecology-feature-families --strict`;
- `bun run openspec:validate`;
- `bun run build`;
- deploy and Civ7/FireTuner runtime proof when combined with the stack;
- `git diff --check`.
