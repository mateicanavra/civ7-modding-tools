## Why

Recent deployed map runs completed without script-load failure, but product
quality regressed: lakes covered too much land, cold reefs disappeared, atolls
were missing on some shipped map identities, wetlands/marshes remained visually
odd, and existing tests did not measure the world users expected to play.

The root causes are cross-cutting but not generic:

- Hydrology lake truth treated every land routing sink as lake intent.
- Ecology feature planners needed map-tuned family policies after weak-positive
  admission was closed.
- Cold reefs used literal depth thresholds that did not match the available
  Civ7 bathymetry proxy.
- Shipped configs/presets had not been rebalanced after the normalized
  hydrology/ecology ownership changes.
- Tests asserted local non-degeneracy, not product-visible world budgets.

## What Changes

- Hydrology lake planning admits deterministic terminal basins by accumulated
  drainage and a lakeiness-owned land-water budget.
- Ecology planner policies remain family-local, with explicit config for
  confidence thresholds and reef-family spacing.
- Cold reef scoring uses the deeper available offshore band as the current
  bathymetry proxy rather than an unreachable literal ocean-depth range.
- Shipped map configs and standard presets are updated to valid,
  identity-appropriate strategy/config values.
- World-balance stats tests run the full standard recipe through the runtime and
  assert lake, wetland, reef, atoll, cold-reef, and desert rainforest budgets.
- Hydrology runtime artifact publication checks are owned by the producing
  steps that publish the payloads, not by broad domain buckets, artifact
  registries, scattered strategy guards, or a Hydrology-only artifact framework.

## Sea-Level Disposition

Scout review of current official Civ7 resources found schema/UI artifacts for
sea level but no active official map script setup parameter, engine API, or
Fractal/Continents script usage. Official scripts still stamp terrain and
refresh water state through elevation/terrain/water-cache calls. No dedicated
engine sea-level OpenSpec is created unless future official resources expose an
active generation input/API.

## Non-Goals

- No `modswooper` special-casing.
- No generic shared planner machinery or router bucket for feature policies.
- No probability thinning or fallback behavior.
- No projection-stage truth scoring.
- No hand-edited generated `mod/` artifacts.

## Verification Gates

- Focused hydrology/ecology/config/world-stat tests.
- `bun run --cwd mods/mod-swooper-maps check`.
- `bun run openspec -- validate restore-mapgen-world-balance-proofs --strict`.
- `bun run openspec:validate`.
- `bun run build`.
- `bun run --cwd mods/mod-swooper-maps deploy`.
- Fresh `Scripting.log` evidence after deployed map generation.
- `git diff --check`.
