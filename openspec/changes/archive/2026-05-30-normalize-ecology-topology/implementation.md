## Implementation Record

This change normalizes the standard recipe Ecology topology to the packet-owned
D5 shape:

- `ecology-pedology`
- `ecology-biomes`
- `ecology-features`
- `map-ecology` as projection only

Feature-family wrapper stages were folded into `ecology-features` because their
current handoff is an ordered occupancy cascade, not independent recipe-level
stage identity. The old `stages/ecology/steps` hub was removed: pedology and
resource-basin steps now live under `ecology-pedology`, biome classification
lives under `ecology-biomes`, and feature scoring/planning lives under
`ecology-features`.

The remaining `stages/ecology` files are intentionally shared artifact surfaces,
not strategy-config catalogs. They define Ecology artifact schemas and
validators consumed by multiple truth stages, `map-ecology`, and placement.
Operation/strategy-specific config schemas remain with the owning op contracts
or owning step contracts; this slice does not centralize strategy config into a
domain-root config module.

`map-ecology/plot-effects` no longer scores or plans plot effects. Planning now
runs in `ecology-features/plan-plot-effects`, which publishes
`artifact:ecology.plotEffectPlan`; the map step consumes that artifact and only
projects it into the Civ7 adapter.

Config and preset stage IDs were migrated from the retired wrapper stages into
`ecology-features`. The observable intentional change is topology/config shape:
old wrapper stage IDs are removed from active recipe config and stage ordering.
No product-output drift was intentionally introduced.

## Review Notes

- Stage-promotion review: pedology, biomes, and features retain real stage
  identity; ice/reefs/wetlands/vegetation wrappers do not.
- Projection review: `map-ecology` consumes upstream Ecology artifacts and
  writes engine-facing fields/effects only.
- DX review: shipped configs, presets, Studio preset wrappers, compatibility
  fixture, and reference docs now use the normalized topology.
- Guardrail review: category-level tests scan all Ecology truth step directories
  plus `map-ecology`, and assert retired wrapper directories stay absent.

## Validation

- `bun run --cwd mods/mod-swooper-maps check`
- `bun run --cwd mods/mod-swooper-maps build`
- `bun run --cwd mods/mod-swooper-maps test -- test/ecology/ecology-step-import-guardrails.test.ts test/ecology/biomes-step.test.ts test/ecology/reefs-step.test.ts test/ecology/wetlands-step.test.ts test/ecology/vegetation-step.test.ts test/ecology/vegetation-plan-apply.test.ts test/ecology/plot-effects-owned-snow.test.ts test/ecology/plot-effects-viz-meta.test.ts test/pipeline/foundation-topology-lock.test.ts test/standard-recipe.test.ts test/standard-compile-errors.test.ts`
- `bun run --cwd mods/mod-swooper-maps test -- test/config/maps-schema-valid.test.ts test/config/presets-schema-valid.test.ts test/config/studio-presets-schema-valid.test.ts test/pipeline/map-stamping.contract-guard.test.ts test/pipeline/artifacts.test.ts test/ecology/no-fudging-static-scan.test.ts`
- `bun run --cwd mods/mod-swooper-maps test -- test/ecology/ecology-baseline-fixtures.test.ts test/ecology/earthlike-balance-smoke.test.ts test/standard-run.test.ts test/pipeline/seed-matrix-stats.test.ts`
- `bun run lint:mapgen-recipe-imports`
- `bun run lint:domain-refactor-guardrails`
- `bun run lint:mapgen-docs` (passes with the existing three `@mapgen/*` documentation warnings)
- `bun run openspec -- validate normalize-ecology-topology --strict`
- `bun run openspec:validate`
- `git diff --check`
