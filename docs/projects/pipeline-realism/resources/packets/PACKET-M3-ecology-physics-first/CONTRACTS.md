# Contracts: Artifacts, Schemas, Score Layers, and Planning IO

Read first: `VISION.md`.

This document is where M3 becomes **decision complete**.

## Artifact Inventory (M3)

Existing ecology truth artifacts (must remain stable):
- `artifact:ecology.soils`
- `artifact:ecology.resourceBasins`
- `artifact:ecology.biomeClassification`
- `artifact:ecology.featureIntents.vegetation`
- `artifact:ecology.featureIntents.wetlands`
- `artifact:ecology.featureIntents.reefs`
- `artifact:ecology.featureIntents.ice`

New M3 truth artifacts:
- `artifact:ecology.scoreLayers`
  - authoritative per-feature per-tile scores.

Optional new artifacts (only if required by the conflict model):
- `artifact:ecology.featureOccupancy` (or equivalent)
  - explicit conflict/occupancy state consumed by planners.

## Score Layers Contract (artifact:ecology.scoreLayers)

### Shape

A single object containing:
- `width`, `height`
- `layers`: a fixed set of per-feature score typed arrays

Rules:
- layers are computed independently.
- values must be comparable within a layer; cross-layer comparison happens only in planning.
- sentinel values are explicit.

### Typed array types

Default:
- use `Float32Array` for score layers in [0..1].

We can move to quantized types later only with explicit migration + proof.

## Feature Inventory (M3 scope)

The current feature key universe is defined in:
- `mods/mod-swooper-maps/src/domain/ecology/types.ts`

As of this packet, the feature keys are:

### Vegetation
- `FEATURE_FOREST`
- `FEATURE_RAINFOREST`
- `FEATURE_TAIGA`
- `FEATURE_SAVANNA_WOODLAND`
- `FEATURE_SAGEBRUSH_STEPPE`

### Wetlands / Wet features
- `FEATURE_MARSH`
- `FEATURE_TUNDRA_BOG`
- `FEATURE_MANGROVE`
- `FEATURE_OASIS`
- `FEATURE_WATERING_HOLE`

### Reefs / Aquatic
- `FEATURE_REEF`
- `FEATURE_COLD_REEF`
- `FEATURE_ATOLL`
- `FEATURE_LOTUS`

### Ice
- `FEATURE_ICE`

## Layer IDs (decision-complete list)

Each feature has a score layer id:

- `ecology.score.FEATURE_FOREST`
- `ecology.score.FEATURE_RAINFOREST`
- `ecology.score.FEATURE_TAIGA`
- `ecology.score.FEATURE_SAVANNA_WOODLAND`
- `ecology.score.FEATURE_SAGEBRUSH_STEPPE`

- `ecology.score.FEATURE_MARSH`
- `ecology.score.FEATURE_TUNDRA_BOG`
- `ecology.score.FEATURE_MANGROVE`
- `ecology.score.FEATURE_OASIS`
- `ecology.score.FEATURE_WATERING_HOLE`

- `ecology.score.FEATURE_REEF`
- `ecology.score.FEATURE_COLD_REEF`
- `ecology.score.FEATURE_ATOLL`
- `ecology.score.FEATURE_LOTUS`

- `ecology.score.FEATURE_ICE`

Notes:
- These ids are for the scoreLayers internal schema and viz keys.
- They are stable within M3. If we rename, we must provide an explicit migration table.

## Planning IO Contract (per feature)

Each per-feature plan op consumes:
- relevant score layer (`Float32Array`, [0..1])
- optional additional layers (read-only) for cross-feature constraints
- required truth artifacts (biomes, soils, hydrography, climate, topography)
- conflict state (occupancy) as defined for M3

And outputs:
- placements/intents for that feature (tile coordinates)
- optional debug fields for viz (not required by core correctness)

## Deterministic Tie-Break Policy

- Planners must be deterministic.
- Tie breaks (equal scores) must use:
  - deterministic stable ordering first, then
  - seeded tie-break only if needed.

No random gating.

## “Must Not Exist” List (enforced by gates)

- chance percentages in planners
- multipliers/bonuses that gate whether a feature exists
- probabilistic edges/jitter that changes outcomes
- disabled strategies / shouldRun / silent skips
