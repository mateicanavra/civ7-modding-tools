## Why

Earthlike visual rolls show broad flat dry-feeling land with little vegetation
and few or no plains. Local stats show `BIOME_PLAINS` is nearly absent, while
pedology does not receive slope, sediment, or bedrock signals despite declaring
them. Hydrology, wind, currents, humidity, aridity, pedology, and biome binding
therefore need to be investigated and repaired as an upstream class, not tuned
only through feature thresholds.

## Target Authority Refs

- `openspec/changes/earthlike-balance-diagnostic-gates`: hydrology changes must
  re-measure pedology, biome classification, and feature-family outputs.
- `mods/mod-swooper-maps/AGENTS.md`: `ecology-pedology` and `ecology-biomes`
  own truth before feature planning.
- `docs/system/mods/swooper-maps/architecture.md`: Hydrology climate products
  feed Ecology truth; projection stages do not own climate or soil semantics.

## What Changes

- Add diagnostics for climate indices, soil buckets, fertility, plains/biome
  distribution, and vegetation-density distribution.
- Repair pedology inputs so declared slope/sediment/bedrock signals are either
  provided or removed from authored semantics.
- Repair plains/biome classification and bindings so Earthlike produces visible
  temperate dry/plains outcomes.
- Verify hydrology wind/current/humidity changes do not erase ecology diversity.

## Write Set

- Hydrology climate diagnostics/tests.
- Ecology pedology and biome classification code/config/tests.
- World-balance stats support for pedology/climate/biome distributions.

## Forbidden Non-Goals

- No feature threshold tuning as a substitute for broken climate/soil inputs.
- No silent biome binding changes without tests.
- No generated-output hand edits.

## Verification Gates

- Focused hydrology/pedology/biome tests.
- World-balance stats tests with pedology/climate metrics.
- `bun run openspec -- validate earthlike-pedology-humidity-balance --strict`
- `bun run openspec:validate`
- `git diff --check`
