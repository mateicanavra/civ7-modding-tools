# TOPOLOGY: M3 Earth-System-First Stage + Step Topology

This document locks the canonical M3 stage/step layout.

It must feel like an earth system while staying fully consistent with MapGen semantics:
- stages are config compilation boundaries
- steps orchestrate (read artifacts, call ops, publish artifacts, emit viz)
- ops are atomic algorithms (compute/score/plan) and never call ops
- rules are op-local policy inputs and are never imported by steps

The causal spine is **Score -> Plan -> Stamp**:
1. publish a single shared score store (`artifact:ecology.scoreLayers`)
2. plan in ordered truth stages with explicit conflict/occupancy state
3. stamp/materialize in the single projection stage (`map-ecology`)

## Stage order (recipe-owned)

1. `ecology-pedology` (truth)
2. `ecology-biomes` (truth)
3. `ecology-features-score` (truth; publishes `artifact:ecology.scoreLayers` + `artifact:ecology.occupancy.base`)
4. `ecology-ice` (truth; plans `FEATURE_ICE`)
5. `ecology-reefs` (truth; plans reef-family features)
6. `ecology-wetlands` (truth; plans wet-family features)
7. `ecology-vegetation` (truth; plans vegetation-family features)
8. `map-ecology` (projection; stamps the final plan)

Notes:
- Ordering is recipe-only (see `docs/system/libs/mapgen/reference/RECIPE-SCHEMA.md`).
- Cross-family conflict resolution is enforced by the explicit occupancy snapshot chain in `CONTRACTS.md`.
- There are **no viz-only steps** (viz is emitted by the steps doing the work).

## Stage by stage breakdown

### `ecology-pedology` (truth)

| Step | Required artifacts | Provides | Notes |
| --- | --- | --- | --- |
| `pedology` | `artifact:morphology.topography`, `artifact:climateField` | `artifact:ecology.soils` | Calls `ops.classifyPedology`; emits soil/fertility viz. |
| `resource-basins` | `artifact:ecology.soils`, `artifact:morphology.topography`, `artifact:climateField` | `artifact:ecology.resourceBasins` | Uses score/plan ops as needed; remains deterministic. |

### `ecology-biomes` (truth)

| Step | Required artifacts | Provides | Notes |
| --- | --- | --- | --- |
| `biomes` | `artifact:climateField`, `artifact:hydrology.cryosphere`, `artifact:morphology.topography`, `artifact:hydrology.hydrography` | `artifact:ecology.biomeClassification` | Calls a single `ops.classifyBiomes` op. **Biome edge refinement is integrated into this op** (no separate `biome-edge-refine` step/op). |

### `ecology-features-score` (truth)

| Step | Required artifacts | Provides | Notes |
| --- | --- | --- | --- |
| `score-layers` | `artifact:ecology.biomeClassification`, `artifact:ecology.soils`, `artifact:morphology.topography`, hydrology + climate artifacts as needed | `artifact:ecology.scoreLayers`, `artifact:ecology.occupancy.base` | Runs one score op per feature key. Scores are **independent** per feature (no cross-feature heuristics). This is also the right home for deterministic masks that define "reserved / unavailable" tiles for planners. |

### `ecology-ice` (truth)

| Step | Required artifacts | Provides | Notes |
| --- | --- | --- | --- |
| `plan-ice` | `artifact:ecology.scoreLayers`, `artifact:ecology.occupancy.base`, `artifact:morphology.topography`, `artifact:ecology.biomeClassification` | `artifact:ecology.featureIntents.ice`, `artifact:ecology.occupancy.ice` | Calls `ops.planIce`. Deterministic thresholding + seeded tie-breaks only. Publishes the next occupancy snapshot. |

### `ecology-reefs` (truth)

| Step | Required artifacts | Provides | Notes |
| --- | --- | --- | --- |
| `plan-reefs` | `artifact:ecology.scoreLayers`, `artifact:ecology.occupancy.ice`, `artifact:morphology.topography`, `artifact:ecology.biomeClassification` | `artifact:ecology.featureIntents.reefs`, `artifact:ecology.occupancy.reefs` | Calls `ops.planReefs`. Deterministic spacing/constraints; seeded tie-breaks only for exact ties. |

### `ecology-wetlands` (truth)

| Step | Required artifacts | Provides | Notes |
| --- | --- | --- | --- |
| `plan-wetlands` | `artifact:ecology.scoreLayers`, `artifact:ecology.occupancy.reefs`, `artifact:morphology.topography`, hydrology artifacts as needed | `artifact:ecology.featureIntents.wetlands`, `artifact:ecology.occupancy.wetlands` | Calls `ops.planWetlands`. The planner is the joint resolver that consumes wet-family layers and codifies selection/constraints. **No disabled strategies; no probabilistic gating.** |

### `ecology-vegetation` (truth)

| Step | Required artifacts | Provides | Notes |
| --- | --- | --- | --- |
| `plan-vegetation` | `artifact:ecology.scoreLayers`, `artifact:ecology.occupancy.wetlands`, `artifact:morphology.topography`, hydrology artifacts as needed | `artifact:ecology.featureIntents.vegetation`, `artifact:ecology.occupancy.vegetation` | Calls `ops.planVegetation`. The planner is the joint resolver that consumes vegetation layers and codifies selection/constraints. Deterministic selection + seeded tie-breaks only. |

### `map-ecology` (projection)

| Step | Required artifacts | Provides | Tags | Notes |
| --- | --- | --- | --- | --- |
| `plot-biomes` | `artifact:ecology.biomeClassification`, `artifact:morphology.topography` | _none_ | `field:biomeId`, `effect:engine.biomesApplied` | Writes engine-facing biome fields deterministically from the truth classification. |
| `features-apply` | `artifact:ecology.featureIntents.*` | _none_ | `field:featureType`, `effect:engine.featuresApplied` | Pure stamping/materialization. **Must not** probabilistically gate. If stamping would drop placements, that is a planner bug and fails gates. |
| `plot-effects` | truth artifacts as needed (biomes, climate/topography/hydrology) | _none_ | `effect:engine.plotEffectsApplied` | Engine-facing effects are allowed here, but the implementation must be deterministic (no `rollPercent`, no chance knobs). If the current op is chance-based, M3 replaces it with deterministic thresholding driven by explicit score surfaces (still no output fudging). |

## Artifact + tag summary (M3 surfaces)

Truth artifacts:
- `artifact:ecology.scoreLayers` (new): per-tile `Float32Array` scores for every feature key (see `CONTRACTS.md` for schema).
- `artifact:ecology.occupancy.*` (new): immutable occupancy snapshots used to enforce cross-family conflict rules (see `CONTRACTS.md`).
- `artifact:ecology.featureIntents.<family>` (existing ids): deterministic placements produced by planners.

Projection tags:
- `field:biomeId`, `effect:engine.biomesApplied`
- `field:featureType`, `effect:engine.featuresApplied`
- `effect:engine.plotEffectsApplied`

## Recipe wiring changes (M3 cutover)

M3 replaces the single truth ecology stage entry in:
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`

with the explicit ordered truth stages listed above, followed by the existing `mapEcology` projection stage.

This is a topology change (behavior-changing milestone), so ids and ordering are treated as intentional cutover surfaces and are gated by the M3 issue suite.
