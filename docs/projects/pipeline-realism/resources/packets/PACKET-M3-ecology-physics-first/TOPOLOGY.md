# Topology: M3 Ecology Truth Stages + Projection

Read first: `VISION.md` and `ARCHITECTURE.md`.

## Current (baseline)

The standard recipe currently has one truth ecology stage:
- `ecology` (steps: pedology, resource-basins, biomes, biome-edge-refine, features-plan)

Projection ecology:
- `map-ecology` (steps: plot-biomes, features-apply, plot-effects)

Reference: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`.

## Target (M3)

### Truth stages (earth-system-first)

We split truth ecology into separate stages so each boundary has meaning:

1. `ecology-pedology`
- Purpose: soil + ground substrate truth.
- Produces: `artifact:ecology.soils` (and any pedology derivatives required downstream).

2. `ecology-biomes`
- Purpose: biome classification truth.
- Important: biome edge refinement is integrated here (no separate refine stage/op).
- Produces: `artifact:ecology.biomeClassification` (final).

3. `ecology-features-score`
- Purpose: compute independent per-feature per-tile score layers.
- Produces: `artifact:ecology.scoreLayers` (authoritative score store).

4. `ecology-ice`
- Purpose: plan ice feature intents deterministically.
- Consumes: scoreLayers + required truth artifacts.
- Produces: `artifact:ecology.featureIntents.ice`.

5. `ecology-reefs`
- Purpose: plan reef-family feature intents deterministically.
- Produces: `artifact:ecology.featureIntents.reefs`.

6. `ecology-wetlands`
- Purpose: plan wetlands + wet placements deterministically.
- Produces: `artifact:ecology.featureIntents.wetlands`.

7. `ecology-vegetation`
- Purpose: plan vegetation feature intents deterministically.
- Produces: `artifact:ecology.featureIntents.vegetation`.

### Planning order

Truth planning order is:

`ecology-ice` -> `ecology-reefs` -> `ecology-wetlands` -> `ecology-vegetation`

This order is a contract and exists to support conflict-aware deterministic planning.

### Projection stage

Keep `map-ecology` as one stage:
- `plot-biomes`
- `features-apply` (stamping/materialization; minimal deterministic adjustments)
- `plot-effects` (note: plot-effects itself must be made deterministic and no-fudging in M3).

## Required Artifacts (high-level)

Truth artifacts required across these stages (non-exhaustive; finalized in `CONTRACTS.md`):
- `artifact:morphology.topography`
- `artifact:hydrology.climateField`
- `artifact:hydrology.hydrography`
- `artifact:hydrology.cryosphere`

## Open Implementation Choice (locked by end of packet)

Occupancy/conflict modeling:
- (A) immutable occupancy snapshot artifact chain, or
- (B) publish-once mutable handle posture.

This is locked in `CONTRACTS.md` and enforced by M3 gates.
