## Why

The previous closure proof established that FireTuner can trigger a fresh
Swooper map-generation run and that the recipe completes. It did not establish
that Swooper Earthlike is product-balanced. Visible map rolls still show missing
or marginal forests, taiga, reefs, atolls, mountains, broad dry flat land, and
continents that read as smooth central elevation bulges sloping to the coasts.

The current metrics are too narrow: they prove nonzero or broad feature presence
for some families, but they do not measure terrain relief, plains/pedology,
humidity/aridity, climate drivers, per-family density floors, or repeated
runtime product outcomes. This change creates the diagnostic gate surface needed
before additional tuning changes can be specified and implemented.

## Target Authority Refs

- `openspec/specs/mapgen-normalization-workstreams/spec.md`: world-balance
  proof must cover feature families and map identity.
- `mods/mod-swooper-maps/AGENTS.md`: pedology, biomes, and feature planning own
  Ecology truth before `map-ecology` projection.
- `docs/system/mods/swooper-maps/architecture.md`: hydrology, ecology,
  morphology, and map projection have separate proof boundaries.

## What Changes

- Add product-visible Earthlike balance metrics for mountains, hills, terrain
  relief, continental elevation profiles, plains/soil/pedology,
  humidity/aridity, vegetation families, reef-family features, and atolls.
- Add gates that fail when a feature or terrain class is merely nonzero but not
  visible enough to matter.
- Add config-drift checks so Swooper Earthlike map config, standard Earthlike
  preset, and Studio default posture cannot silently diverge.
- Define mechanical runtime evidence required for balance closure.

## Requires

- No behavior tuning in this slice.
- Existing FireTuner bridge remains available for runtime restart proof.

## Enables Parallel Work

- `earthlike-config-authority`
- `earthlike-engine-feature-eligibility`
- `earthlike-terrain-relief-balance`
- `earthlike-pedology-humidity-balance`
- `earthlike-ecology-feature-density`

## Forbidden Non-Goals

- No quota-based fallback placement.
- No generated-output hand edits.
- No claims that FireTuner restart proof equals balance proof.
- No implementation tuning before the relevant downstream OpenSpec change
  exists.

## Verification Gates

- `bun run openspec -- validate earthlike-balance-diagnostic-gates --strict`
- `bun run openspec:validate`
- Focused config and world-balance tests added by the implementation.
- `bun run --cwd mods/mod-swooper-maps check`
- `git diff --check`
