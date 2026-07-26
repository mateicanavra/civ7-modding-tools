# MapGen Mod (Swooper Maps) — Agent Router

Scope: `mods/mod-swooper-maps/**`

## What This Directory Is

- The Swooper Maps / MapGen mod package.
- `src/` owns the Swooper domain model, recipes, map configuration, and thin
  game-facing entry files.
- All six domain roots remain mod-owned; reusable SDK mechanics belong in the
  smallest named substrate package rather than moving a domain into Core.
- Domain rules own semantic algorithms, not local copies of Core primitives.
  Search `@swooper/mapgen-core/lib/*` before adding a helper; name and document
  an intentional divergence so its distinct behavior is visible at the callsite.
- `mod/` is generated build output for Civ VII; treat it as read‑only.

## Tooling Rules

- Run `nx run mod-swooper-maps:build`, `nx run mod-swooper-maps:check`, and
  `nx run mod-swooper-maps:test`. Nx owns upstream build ordering; do not build
  workspace dependencies manually.
- Prefer regenerating `mod/` through the Nx build target over editing build
  artifacts.
- Placement composes `wonders`, `regions`, and `starts` modules in causal
  order. Wonders owns pure natural-wonder site planning; the placement recipe
  admits active Civ7 map-size metadata and passes normalized demand into that
  planner. Regions partitions the playable surface around admitted landmass
  structure; starts then consumes wonder and region evidence during start
  planning. Placement recipe steps consume those module ops through the root
  contract or executable router rather than a flat operation registry.

## Ecology domain

- Ecology composes the `pedology`, `biomes`, `features`, and `plot-effects`
  modules in causal order. Contracts consume the root domain, runtime recipe
  composition consumes `@mapgen/domain/ecology/router`, and steps import
  artifacts from the exact producing module catalog.
- The biomes module publishes `artifact:ecology.biomeClassification` as
  immutable domain evidence. Biome projection output remains invocation-local
  projection evidence rather than engine readback or a second domain artifact
  authority.
- Pedology runs before biomes and shared feature scoring:
  `artifact:ecology.soils` feeds biome classification and the split
  feature-intent planners before the apply step writes features to the engine.

## Hydrology domain

- Hydrology composes the `ocean`, `climate`, `cryosphere`, and `hydrography`
  modules. Contracts consume the root domain, runtime recipe composition
  consumes `@mapgen/domain/hydrology/router`, and steps import artifacts or
  model policy from the exact owning module.
- Ocean state remains invocation-local until a causal downstream consumer
  earns a durable product. Climate publishes atmospheric fields, cryosphere
  publishes frozen-water state, and hydrography publishes drainage, river, and
  lake intent.
- Civ7-constrained river materialization belongs to the `hydrology/rivers` projection
  step. It consumes Hydrology evidence without becoming a Hydrology operation
  or redefining the physical river model.

## Canonical Docs

- MapGen / Swooper Maps normalization baseline: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`; downstream implementation slices: `openspec/changes/README.md`.
- Mod architecture & presets: `docs/system/mods/swooper-maps/`
- MapGen engine architecture/config: `docs/system/libs/mapgen/MAPGEN.md`
- Benchmark subsystem: `docs/system/libs/mapgen/benchmarks/BENCHMARKS.md`; Standard recipe study bank: `src/recipes/standard/metrics/studies/STUDIES.md`
- Testing overview: `docs/system/TESTING.md`
- Test corpus guide: `test/README.md`
