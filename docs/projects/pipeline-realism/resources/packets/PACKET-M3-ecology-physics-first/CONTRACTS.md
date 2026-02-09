# CONTRACTS: Score Layers, Planning, and Occupancy (M3 Ecology)

This is the decision-complete source of truth for the M3 cut-over: it defines
1. how *scoreLayers* are produced and shaped,
2. how we track cross-family conflicts through explicit occupancy snapshots, and
3. the per-stage/per-family planner contracts that consume those artifacts.

It also locks the must-have / must-not-have invariants that enforce the "no
chance / no multipliers / deterministic" posture described in `VISION.md`.

## Score artifact: `artifact:ecology.scoreLayers`
- **Purpose**: every planner consumes a single, shared score store so we never
  bake another feature's heuristic into a scoring op and so conflict resolution
  stays in the planning ops, not the score ops.
- **Schema** (shape, refer to TypeBox in implementation):
  ```ts
  {
    width: number,
    height: number,
    layers: {
      "FEATURE_FOREST": Float32Array,
      "FEATURE_RAINFOREST": Float32Array,
      "FEATURE_TAIGA": Float32Array,
      "FEATURE_SAVANNA_WOODLAND": Float32Array,
      "FEATURE_SAGEBRUSH_STEPPE": Float32Array,
      "FEATURE_MARSH": Float32Array,
      "FEATURE_TUNDRA_BOG": Float32Array,
      "FEATURE_MANGROVE": Float32Array,
      "FEATURE_OASIS": Float32Array,
      "FEATURE_WATERING_HOLE": Float32Array,
      "FEATURE_REEF": Float32Array,
      "FEATURE_COLD_REEF": Float32Array,
      "FEATURE_ATOLL": Float32Array,
      "FEATURE_LOTUS": Float32Array,
      "FEATURE_ICE": Float32Array,
    },
  }
  ```
  Each typed array is `width * height` long and encodes a 0..1 suitability score
  for that feature on every tile.
- **Computation posture**:
  - Score ops run independently and return typed arrays (see existing
    `scoreVegetation*` ops for reference) so there is no cross-feature polling
    inside a scoring op.
  - Each layer is normalized per the op's rules (no probability knobs). Every
    planner consumes these raw layers and makes deterministic decisions.
  - The score stage is responsible for publishing `artifact:ecology.scoreLayers`
    once per map, plus a base occupancy snapshot (see below).

## Occupancy / conflict artifact chain (Option A: immutable snapshots)
- **Rationale**: staying immutably snapshot-based honors the pipeline's artifact
  semantics and keeps per-stage gating explicit. Mutable handles would leak
  ownership and make compile-time verification harder.
- **Artifacts** (one new artifact per stage):
  | artifact id | produced by | describes |
  |-------------|-------------|-----------|
  | `artifact:ecology.occupancy.base` | `ecology-features-score` | tile availability derived from topography + hydrology (initially 0 for free land tiles, special sentinel for water/reserved tiles) |
  | `artifact:ecology.occupancy.ice` | `ecology-ice` | base mask + `FEATURE_ICE` assignments |
  | `artifact:ecology.occupancy.reefs` | `ecology-reefs` | previous occupancy plus reef assignments |
  | `artifact:ecology.occupancy.wetlands` | `ecology-wetlands` | previous occupancy plus wetland assignments |
  | `artifact:ecology.occupancy.vegetation` | `ecology-vegetation` | final occupancy after all families |
- **Schema (shared)**:
  ```ts
  {
    width: number,
    height: number,
    featureIndex: TypedArraySchema.u16({ description: '0 = unoccupied, otherwise 1 + FEATURE_KEY_INDEX' }),
    reserved: TypedArraySchema.u8({ description: '0 = tile can be claimed, 1 = permanently blocked (ocean, cliff, debug)'}),
  }
  ```
  - `featureIndex` is a dense per-tile record of the current occupant, so each
    planner can cheaply skip already claimed tiles.
  - `reserved` lets the score stage encode tiles that must stay untouched (deep water, reserved artwork, etc.).
  - Each stage reads the previous snapshot, copies the typed arrays, applies
    its placements, and publishes the next snapshot; there is never any
    in-place mutation _after_ the artifact is published.

## Stage + step + op contracts
We insert a new truth stage (`ecology-features-score`) before the family
planners. Each of the four planners runs in its own stage so we can gate
execution order, consumption, and occupancy updates.

### `ecology-features-score` stage
- **Step**: `score-layers`
- **Requires**: `artifact:ecology.biomeClassification`, `artifact:ecology.soils`,
  `artifact:hydrology.hydrography`, `artifact:morphology.topography`,
  climate artifacts already published by upstream stages.
- **Provides**: `artifact:ecology.scoreLayers`, `artifact:ecology.occupancy.base`.
- **Ops**:
  - All existing vegetation scoring ops (`scoreVegetationForest`, …) plus new
    scoring ops for wetlands, reefs, and ice layers. Each op returns a
    float32 array that is stored under its feature key.
  - No planner ops run here; the stage solely emits scores and the base occupancy.
- **Decision**:
  - If in the future we need cross-layer visibility during scoring, we can
    extend this step to also emit prepocessed `layersByFamily` sub-objects, but
    the canonical artifact is the single `scoreLayers` map so that planners can
    rely on a single input regardless of how scores are evolved.

### `ecology-ice` stage (step: `plan-ice`)
- **Requires**: `artifact:ecology.scoreLayers`, `artifact:ecology.occupancy.base`,
  `artifact:morphology.topography`, `artifact:ecology.biomeClassification`,
  hydrology/cryosphere inputs as needed.
- **Provides**: `artifact:ecology.featureIntents.ice`, `artifact:ecology.occupancy.ice`.
- **Op**: `ecology.ops.planIce`
  - Input: `scoreLayers.layers.FEATURE_ICE`, occupancy snapshot, land/water/elevation masks, deterministic tie-break context (seed derived from `context.env.seed`).
  - Behavior: deterministic thresholding (no `jitterC`, no density multiplier, no feathered randomness). Tiles with elevation-based ice (alpine) vs sea ice are resolved via deterministic ranges and ordered evaluation. Ties resolve using deterministic ranking (e.g., prefer sea ice over alpine when both apply, then use seeded tie-breaker to pick between equally scored tiles).
  - Writes placements that are appended to occupancy snapshot; stage publishes the updated snapshot.

### `ecology-reefs` stage (step: `plan-reefs`)
- **Requires**: previous occupancy (`artifact:ecology.occupancy.ice`), `scoreLayers.layers.FEATURE_REEF`/`_COLD_REEF`/`_ATOLL`/`_LOTUS`, `artifact:morphology.topography` (for shoreline), temperature layers.
- **Provides**: `artifact:ecology.featureIntents.reefs`, `artifact:ecology.occupancy.reefs`.
- **Op**: `ecology.ops.planReefs`
  - Input: relevant score layers, occupancy snapshot, shoreline mask from topography, surface temperature.
  - Behavior: deterministic spacing rules (e.g., fixed stripe/hop pattern instead of seeded randomness). The op writes placements only onto tiles flagged as available in the occupancy snapshot; once placements are determined, the stage sorts them by `tileIndex` before publishing so viz/diagnostics stay repeatable.

### `ecology-wetlands` stage (step: `plan-wetlands`)
- **Requires**: `artifact:ecology.occupancy.reefs`, `scoreLayers.layers` for wetlands features, `artifact:morphology.topography`, classifiers (moisture, fertility).
- **Provides**: `artifact:ecology.featureIntents.wetlands`, `artifact:ecology.occupancy.wetlands`.
- **Ops**:
  - `ecology.ops.planWetlands` consumes the *five* wet-feature layers (`FEATURE_MARSH`, `FEATURE_TUNDRA_BOG`, `FEATURE_MANGROVE`, `FEATURE_OASIS`, `FEATURE_WATERING_HOLE`) and emits deterministic placements for the family.
  - The op is allowed (and encouraged) to use **rules** heavily for scoring-derived policy inputs (thresholds, adjacency filters, hard constraints), because rules are the right place to codify "this is a decision input" without smuggling cross-feature heuristics into scoring.
  - There is **no** "disabled strategy" or "optional wet features" concept at runtime. If we need knobs, they are threshold/constraint knobs, not on/off gates.
  - The stage sorts the final placements by tile index before publishing to keep viz/diagnostics repeatable.
  - After placements are locked in, the stage snapshots occupancy for the vegetation stage.

### `ecology-vegetation` stage (step: `plan-vegetation`)
- **Requires**: `artifact:ecology.occupancy.wetlands`, `scoreLayers.layers` for the five vegetation features, `artifact:morphology.topography`, classification masks, `artifact:hydrology.hydrography` if adjacency is needed.
- **Provides**: `artifact:ecology.featureIntents.vegetation`, `artifact:ecology.occupancy.vegetation` (final occupancy).
- **Op**: `ecology.ops.planVegetation` (new op)
  - Input: the five vegetation layers plus occupancy snapshot and land mask.
  - Behavior: for each tile, compute the feature with the highest score; skip tiles where occupancy says `featureIndex > 0`. If there is a tie, fall back to a deterministic priority list (e.g., forest → rainforest → taiga → savanna → sagebrush) or a seeded tie-breaker derived from `context.env.seed`. No random gating is allowed; either a tile meets the minimum threshold or it remains empty.
  - Updated occupancy is published as the final snapshot consumed by projection tests / diag dumps.

## Must not exist (explicit bans)
1. **Chance knobs** (`jitterC`, random probability gates, etc.): every planner must make determinate decisions; randomness is only acceptable when breaking ties via a seeded RNG whose only job is to break equal scores.
2. **Multipliers that gate existence** (`densityScale` that can turn a feature on/off, or `featherC` leveraged to probabilistically feather edges): forbidden. The stage either places a feature or it does not; there are no weights that can be toggled to implicitly suppress a placement.
3. **Cross-feature heuristics inside score ops**: scores must remain independent per feature; any cross-feature preference must be encoded inside the appropriate planner, not the scorer.
4. **Silent skips / shouldRun flags / ops executed outside their owning step**: each planner step binds the exact op(s) it calls via the compile-time seam, and strategy selection is explicit in `{ strategy, config }`. There is no runtime "disable" switch that silently makes an op a no-op.
5. **Any call path that relies on projection to resolve conflicts**: conflict resolution is finalized inside the ordered planners using the occupancy snapshots above; projection is purely stamping.

## Summary of decisions
- `artifact:ecology.scoreLayers` is the single score store.
- Occupancy is handled by immutable snapshots (`artifact:ecology.occupancy.*`).
- Planning stages run in the explicit order: ice → reefs → wetlands → vegetation. Each planner consumes the previous occupancy snapshot and publishes the next.
- Per-family planning ops remain the ownership surface: vegetation and wetlands are inherently joint decisions (select among multiple candidate features for the same tile while respecting shared constraints). Future algorithm diversity is handled via op strategies, not by reintroducing step-level logic or cross-op orchestration inside ops.
- Determinism is enforced by banning chance/multipliers and by sorting placements before publishing.
