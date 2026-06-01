## Why

After terrain relief, pedology/humidity, and engine eligibility are correct,
Swooper Earthlike still needs product-visible density targets for forests,
taiga, reefs, cold reefs, and atolls. Current balance gates can pass on
presence or broad vegetation families while visible rolls still feel sparse or
miss key ecology classes.

## Target Authority Refs

- `openspec/changes/earthlike-balance-diagnostic-gates`: balance proof must
  include vegetation-family density, reef-family density, and atolls.
- `openspec/changes/earthlike-engine-feature-eligibility`: feature density
  tuning must count only engine-valid accepted surfaces.
- `openspec/changes/earthlike-pedology-humidity-balance`: ecology density
  tuning depends on stable climate, soil, plains, and biome inputs.

## What Changes

- Add explicit Earthlike density floors and upper bounds for key vegetation and
  reef families.
- Tune family scoring/admission after engine-valid and upstream ecology inputs
  are verified.
- Require per-family multi-seed evidence for forest, taiga, rainforest,
  savanna/steppe, reefs, cold reefs, and atolls.
- Add runtime balance telemetry that reports planned, accepted, rejected, and
  projected counts per feature family.

## Write Set

- Ecology feature family scoring and admission config/code.
- Reef-family scoring and admission config/code.
- Balance stats and runtime telemetry for per-family density.
- Focused ecology density tests and world-balance tests.

## Forbidden Non-Goals

- No density tuning before terrain, pedology/humidity, and engine eligibility
  facts are measured.
- No quota-only fill that ignores climate, terrain, biome, or engine validity.
- No treating a single seed as sufficient balance proof.

## Verification Gates

- Multi-seed ecology density tests.
- World-balance stats tests with per-family density floors.
- Runtime FireTuner evidence with per-family telemetry.
- `bun run openspec -- validate earthlike-ecology-feature-density --strict`
- `bun run openspec:validate`
- `git diff --check`
