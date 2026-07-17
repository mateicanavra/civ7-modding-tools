# MapGen Mod (Swooper Maps) — Agent Router

Scope: `mods/mod-swooper-maps/**`

## What This Directory Is

- The Swooper Maps / MapGen mod package.
- `src/` holds the TypeScript game‑facing entry files.
- `mod/` is generated build output for Civ VII; treat it as read‑only.

## Tooling Rules

- Run `nx run mod-swooper-maps:build`, `nx run mod-swooper-maps:check`, and
  `nx run mod-swooper-maps:test`. Nx owns upstream build ordering; do not build
  workspace dependencies manually.
- Prefer regenerating `mod/` through the Nx build target over editing build
  artifacts.
- Placement domain follows the op-per-concern pattern (plan wonders, floodplains, starts); placement step orchestrates multiple ops rather than a single monolith.

## Ecology domain

- Ecology ops live under `src/domain/ecology/ops`; step schemas should import op configs/defaults directly (no re-authored wrappers).
- The biomes step publishes `artifact:ecology.biomeClassification` (biome symbols, vegetation density, moisture/temp). Downstream feature logic expects this artifact plus `field:biomeId`.
- Pedology + resource basin planning now run before biomes: `artifact:ecology.soils` feeds `artifact:ecology.resourceBasins` and feature planning publishes split intents (`artifact:ecology.featureIntents.vegetation`, `artifact:ecology.featureIntents.wetlands`, `artifact:ecology.featureIntents.reefs`, `artifact:ecology.featureIntents.ice`) before the apply step writes features to the engine.

## Canonical Docs

- MapGen / Swooper Maps normalization baseline: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`; downstream implementation slices: `openspec/changes/README.md`.
- Mod architecture & presets: `docs/system/mods/swooper-maps/`
- MapGen engine architecture/config: `docs/system/libs/mapgen/MAPGEN.md`
- Benchmark subsystem: `docs/system/libs/mapgen/benchmarks/BENCHMARKS.md`; Standard recipe study bank: `src/recipes/standard/metrics/studies/STUDIES.md`
- Testing overview: `docs/system/TESTING.md`
- Test corpus guide: `test/README.md`
