## Why

Local mock-adapter balance tests can count planned/applied features that the real
Civ7 engine rejects. Official feature validity depends on terrain and engine
biome classes, but vegetation and reef planners currently score mostly from
internal climate/biome signals. This explains missing forests, taiga, low reefs,
and absent atolls in-game while tests pass.

## Target Authority Refs

- `openspec/changes/earthlike-balance-diagnostic-gates`: balance proof must use
  product-visible metrics and runtime evidence.
- `.civ7/outputs/resources/Base/modules/base-standard/data/terrain.xml`:
  official feature valid terrain/biome evidence.
- `docs/system/mods/swooper-maps/architecture.md`: Ecology owns feature intent
  truth; `map-ecology` only projects/materializes it.

## What Changes

- Add engine-valid symbolic terrain/biome eligibility to feature planning/tests.
- Track feature apply rejections by feature key, not only aggregate count.
- Repair vegetation and reef-family planning so planned features land on
  terrain/biome surfaces the real engine can accept.
- Add strict mock/runtime-like tests for forest, taiga, reefs, cold reefs, and
  atolls.

## Write Set

- `packages/civ7-adapter/src/mock-adapter.ts` if strict mock support is needed.
- `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-*`
- `mods/mod-swooper-maps/src/domain/ecology/ops/reef-score-*`
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features/**`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/**`
- Focused ecology and world-balance tests.

## Forbidden Non-Goals

- No quota fallback placement.
- No weakening real engine validity checks to make tests pass.
- No treating mock adapter acceptance as product-visible proof.

## Verification Gates

- Focused feature eligibility and reef/vegetation tests.
- `bun --cwd mods/mod-swooper-maps test test/pipeline/world-balance-stats.test.ts`
- `bun run openspec -- validate earthlike-engine-feature-eligibility --strict`
- `bun run openspec:validate`
- `git diff --check`
