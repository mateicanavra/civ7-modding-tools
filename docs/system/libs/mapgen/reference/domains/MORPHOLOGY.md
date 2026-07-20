<toc>
  <section title="Overview" />
  <section title="Target Architecture (Truth vs Projection)" />
  <section title="Contract" />
  <section title="Artifacts" />
  <section title="Operations" />
  <section title="Knobs & Normalization" />
  <section title="Current Mapping (Standard Recipe)" />
  <section title="Open Questions" />
  <section title="Ground truth anchors" />
</toc>

# Morphology

> **Status:** Canonical (domain reference)
>
> **This doc is:** the contract surface and “what exists before what” meaning of the MapGen **MORPHOLOGY** domain (inputs, outputs, truth vs projections, and invariants).
>
> **This doc is not:** an implementation tutorial, a tuning guide, or a promise that today’s algorithms are final.

## Overview

MORPHOLOGY converts Foundation’s tectonic driver fields into **tile-space terrain shape signals** and **stable, domain-owned artifacts** that downstream domains consume:

- **Topography** (elevation + sea level + land mask + bathymetry)
- **Substrate** (erodibility + sediment depth)
- **Geomorphic routing proxy** (flow direction + accumulation used by terrain-shaping consumers)
- **Coastline metrics** (pre-island carved-coast adjacency + distance snapshot)
- **Continental shelf** (post-island coastline metrics + shelf mask and diagnostics)
- **Volcano intent** (planned volcano points / mask)
- **Landmasses** (connected-component decomposition of the land mask)

**Ground truth anchors**

- `mods/mod-swooper-maps/src/domain/morphology/index.ts` (`defineDomain({ id: "morphology", ops })`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/index.ts` (`artifacts`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-routing/steps/routing/config.ts` (`RoutingStepContract.artifacts.provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/rugged-coasts/config.ts` (`RuggedCoastsStepContract.artifacts.provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-shelf/steps/compute-shelf/config.ts` (`ComputeShelfStepContract.artifacts.provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes/config.ts` (`VolcanoesStepContract.artifacts.provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/landmasses/config.ts` (`LandmassesStepContract.artifacts.provides`)

## Target Architecture (Truth vs Projection)

### Truth posture

MORPHOLOGY is **tile-first**: its canonical truth products are tile-indexed
artifact evidence consumed through declared step contracts.

**Invariants**

- **Morphology truth is tile-space.** Mesh-space truth lives upstream in Foundation; Morphology consumes tile-space projections of those drivers.
- **Artifacts carry the cross-stage evidence vintage.** Topography, substrate,
  routing, coastline, and shelf state cross stage boundaries through explicit
  artifact contracts rather than ambient runtime state.

**Ground truth anchors**

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/topography.artifact.ts` (`Schema`, `artifact`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/substrate.artifact.ts` (`Schema`, `artifact`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/config.ts` (`LandmassPlatesStepContract.artifacts`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/step.ts` (publishing the initial topography and substrate evidence)

### Projections

“Map projection” steps apply Morphology truth and downstream water intent into the engine adapter’s terrain/feature fields and are guarded by **no-water-drift** invariants: the engine surface must remain consistent with the projected land/water surface at that lifecycle point.

**Invariants**

- **Projections must not drift land/water classification.** After calling engine-facing helpers (`stampContinents`, `buildElevation`, or any engine-side terrain fixups), the adapter's `isWater(x,y)` must still match the expected projected land mask. Before lake projection this is Morphology `topography.landMask`; after lake projection it includes Hydrology lake intent as expected water.

**Ground truth anchors**

- `mods/mod-swooper-maps/src/recipes/standard/projection-policies/noWaterDrift.ts` (`assertNoWaterDrift`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plot-coasts/step.ts` (seeds source coast from post-island `shelf.coastalWater || shelf.shelfMask`, applies the Civ7 coast-ring policy, then guards with `assertWaterDriftWithinPolicy`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plot-continents/step.ts` (`context.adapter.stampContinents`, `assertNoWaterDrift`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-elevation/steps/build-elevation/step.ts` (`context.adapter.buildElevation`, `assertNoWaterDrift`)

## Contract

For the common “ops module” wiring pattern (op contracts, op envelope schemas, binding, and compile/runtime registries), see:

- [`docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`](/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md)

### Requires

At the **domain op** level, Morphology ops are pure functions that require:

- `width`, `height`
- domain-specific tile tensors (e.g. `boundaryCloseness`, `crustType`, `elevation`)
- optional deterministic `rngSeed` passed as data (no ambient randomness inside ops)

At the **standard recipe wiring** level, Morphology requires the following upstream Foundation artifacts:

- `artifact:map.foundationPlates` (tile-space tectonic driver tensors)
- `artifact:map.foundationCrustTiles` (tile-space crust driver tensors sampled from mesh truth)

**Ground truth anchors**

- `mods/mod-swooper-maps/src/domain/morphology/ops/*/contract.ts` (`defineOp({ input: ... })` for each op)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/config.ts` (`LandmassPlatesStepContract.artifacts.requires`)
- `mods/mod-swooper-maps/src/recipes/standard/artifacts/index.ts` (`artifacts.foundationPlates`, `artifacts.foundationCrustTiles`)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/contract.ts` (input `crustBaseElevation` described as “projected from mesh crust truth”)

### Provides (artifacts + tags)

#### Artifacts

Morphology provides the following artifact dependency tags (all `artifact:*`):

- `artifact:morphology.topography`
- `artifact:morphology.substrate`
- `artifact:morphology.coastlineMetrics`
- `artifact:morphology.shelf`
- `artifact:morphology.routing` (geomorphic proxy; not canonical Hydrology drainage routing)
- `artifact:morphology.volcanoes`
- `artifact:morphology.landmasses`

**Ground truth anchors**

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/index.ts` (`artifacts`)

#### Tags

Morphology’s **simulation** steps do not provide effect tags directly in the standard recipe (their `requires`/`provides` tag lists are empty). Morphology’s **map projection** steps provide gameplay effect tags in the `map-morphology` stage.

**Map-morphology effect tags**

- `effect:map.coastsPlotted`
- `effect:map.continentsPlotted`
- `effect:map.mountainsPlotted`
- `effect:map.volcanoesPlotted`
- `effect:map.elevationBuilt`

## Ground truth anchors

This section is a navigation aid: concrete file paths that back the contract claims in this domain reference.

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/config.ts` (`LandmassPlatesStepContract.requires/provides` are empty)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-routing/steps/routing/config.ts` (`RoutingStepContract.requires/provides` are empty)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-shelf/steps/compute-shelf/config.ts` (`ComputeShelfStepContract.requires/provides` are empty)
- `mods/mod-swooper-maps/src/recipes/standard/tags.ts` (`MAP_PROJECTION_EFFECT_TAGS.map.*`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plot-coasts/config.ts` (`PlotCoastsStepContract` requires `artifact:morphology.shelf` and provides `coastsPlotted`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plot-continents/config.ts` (`PlotContinentsStepContract.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plot-mountains/config.ts` (`PlotMountainsStepContract.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plot-volcanoes/config.ts` (`PlotVolcanoesStepContract.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-elevation/steps/build-elevation/config.ts` (`BuildElevationStepContract.requires/provides`)

### Value domains (enums / ranges)

Boundary regimes are represented by `BOUNDARY_TYPE` numeric codes:

- `0` = `none`
- `1` = `convergent`
- `2` = `divergent`
- `3` = `transform`

**Ground truth anchors**

- `packages/mapgen-core/src/lib/plates/boundary-type.ts` (`BOUNDARY_TYPE`)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-coastline-metrics/contract.ts` (input `boundaryType` description: “1=conv,2=div,3=trans”)

## Artifacts

This section describes **what is authoritative**, **what space it lives in**, and **how downstream consumers should interpret it**.

### `artifact:morphology.topography` (truth evidence; tile space)

Canonical tile-space topography evidence consumed by later Morphology,
Hydrology, Ecology, and projection steps.

Fields:

- `elevation` (i16): signed elevation evidence per tile
- `seaLevel` (number): sea level threshold in the same units as `elevation`
- `landMask` (u8): `1=land`, `0=water`; required to be consistent with `elevation > seaLevel`
- `bathymetry` (i16): `0` on land; `<=0` in water; derived from `elevation` and `seaLevel`

**Ground truth anchors**

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/topography.artifact.ts` (`Schema`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/step.ts` (publishing the initial `{ elevation, seaLevel, landMask, bathymetry }` vintage)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/steps/geomorphology/step.ts` (advancing the post-erosion topography vintage)

### `artifact:morphology.substrate` (truth evidence; tile space)

Canonical Morphology substrate evidence used by geomorphology. Downstream
cross-domain consumption is not yet part of the standard recipe dependency
surface.

Fields:

- `erodibilityK` (f32): resistance proxy (higher = easier incision)
- `sedimentDepth` (f32): deposit thickness proxy (higher = deeper deposits)

**Ground truth anchors**

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/substrate.artifact.ts` (`Schema`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/step.ts` (publishing substrate from `ops.substrate`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/steps/geomorphology/step.ts` (advancing post-erosion sediment evidence)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/steps/geomorphology/config.ts` (requires `morphologyArtifacts.substrate`)

### `artifact:morphology.routing` (geomorphic proxy evidence; tile space)

Flow-routing evidence derived from current topography for Morphology terrain
shaping consumers such as erosion and rough-land planning. Hydrology owns the
canonical drainage route graph used for discharge, rivers, and lakes.

Fields:

- `flowDir` (i32): receiver tile index (`-1` for sinks/edges)
- `flowAccum` (f32): drainage area proxy
- `basinId` (i32, optional in artifact schema): basin identifier (`-1` for unassigned)

**Ground truth anchors**

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/routing.artifact.ts` (`Schema`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-routing/steps/routing/step.ts` (publishing routing evidence)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-flow-routing/strategies/default.ts` (always returning an `Int32Array` `basinId` filled with `-1`)

### `artifact:morphology.coastlineMetrics` (pre-island evidence; tile space)

Carved-coast adjacency + distance-to-coast metrics published by
`morphology-coasts` before island injection. Mountain planning consumes this
vintage. It contains no shelf evidence; post-island coastline and shelf truth
live in `artifact:morphology.shelf`.

Fields:

- `coastalLand` (u8): `1` where a land tile is adjacent to water
- `coastalWater` (u8): `1` where a water tile is adjacent to land
- `distanceToCoast` (u16): minimum tile-graph distance to any coast tile

**Ground truth anchors**

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/coastline-metrics.artifact.ts` (`Schema`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/rugged-coasts/step.ts` (`computeDistanceToCoast`, publishing `coastlineMetrics`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/mountains/config.ts` (`MountainsStepContract.artifacts.requires`)

### `artifact:morphology.shelf` (post-island evidence; tile space)

Continental-shelf truth and the post-island coastline vintage published by
`morphology-shelf`. This is the coast evidence consumed by Hydrology and by
engine-facing coast projection.

Fields:

- `shelfMask` (u8): `1` for shoreline-connected water on the gentle pre-break apron; eligible for `TERRAIN_COAST` projection
- `coastalLand` (u8): `1` where post-island land is adjacent to water
- `coastalWater` (u8): `1` where post-island water is adjacent to land
- `distanceToCoast` (u16): post-island minimum tile-graph distance to a coast tile
- `activeMarginMask` (u8): diagnostic active-margin mask; it does not determine shelf membership
- `depthGateMask` (u8): water admitted by the local-gradient gate
- `nearshoreCandidateMask` (u8): shoreline-adjacent water that seeds shelf connectivity
- `shelfBreakDepthByTile` (i16): diagnostic bathymetry where the local-gradient gate reads a shelf break
- `shallowCutoff` (number): retired depth-quantile compatibility field; the current classifier emits `0`

**Ground truth anchors**

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/shelf.artifact.ts` (`Schema`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-shelf/steps/compute-shelf/config.ts` (`ComputeShelfStepContract.artifacts`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-shelf/steps/compute-shelf/step.ts` (recomputing post-island coastline metrics and publishing `shelf`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plot-coasts/config.ts` (`PlotCoastsStepContract.artifacts.requires`)

### `artifact:morphology.volcanoes` (truth-only intent; tile space; immutable-at-F2)

Planned volcano placements, represented as both:

- a dense `volcanoMask` (for map overlays / fast membership tests)
- a sparse list of volcano entries (`tileIndex`, `kind`, `strength01`)

This artifact is an **intent snapshot**: it is not a promise that a particular engine terrain/feature application strategy is stable.

**Ground truth anchors**

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/volcanoes.artifact.ts` (`Schema`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes/config.ts` (docstring: “truth-only intent”)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes/step.ts` (publishing `{ volcanoMask, volcanoes }`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plot-volcanoes/step.ts` (projection into engine terrain + feature)

### `artifact:morphology.landmasses` (derived snapshot; tile space; immutable-at-F2)

Connected-component decomposition of the land mask.

Fields:

- `landmasses[]`: per-component metadata (area proxy `tileCount`, `bbox`, `coastlineLength`)
- `landmassIdByTile` (i32): `-1` for water, otherwise `0..landmasses.length-1`

**Ground truth anchors**

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/landmasses.artifact.ts` (`Schema`)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmasses/contract.ts` (`ComputeLandmassesContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/landmasses/step.ts` (publishing `landmasses`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/plot-landmass-regions/config.ts` (requires `morphologyArtifacts.landmasses`)

## Operations

Morphology ops are the domain’s compute units. The standard recipe wires them into steps (next section).

### Base fields (compute)

#### `morphology/compute-substrate` → `{ erodibilityK, sedimentDepth }`

Computes substrate evidence from tile-space tectonic potentials and crust typing/age.

**Ground truth anchors**

- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-substrate/contract.ts` (`ComputeSubstrateContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/step.ts` (calling `ops.substrate` with `foundationPlates` + `foundationCrustTiles`)

#### `morphology/compute-base-topography` → `{ elevation }`

Converts crust isostasy baseline + tectonic potentials into an initial quantized elevation field.

**Notable invariant (quantization scale)**

- The default strategy quantizes a float “normalized units” elevation sample by multiplying by `DEFAULT_ELEVATION_SCALE = 100` before clamping to i16.

**Ground truth anchors**

- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/contract.ts` (`ComputeBaseTopographyContract`)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/contract.ts` (`ReliefConfigSchema` fields `continentalHeight`/`oceanicHeight` described as “normalized units”)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/rules/index.ts` (`quantizeElevation`, `DEFAULT_ELEVATION_SCALE`)

#### `morphology/compute-sea-level` → `{ seaLevel }`

Selects the sea level threshold based on hypsometry targets and optional deterministic variance.

**Ground truth anchors**

- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-sea-level/contract.ts` (`ComputeSeaLevelContract`)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-sea-level/rules/index.ts` (`resolveTargetPercent`, `resolveSeaLevel`)

#### `morphology/compute-landmask` → `{ landMask, distanceToCoast }`

Derives a land mask from `elevation` and `seaLevel`, using continent-potential shaping grounded in Foundation crust truth and provenance stability.

**Ground truth anchors**

- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/contract.ts` (`ComputeLandmaskContract`)

### Derived metrics and dynamics (compute)

#### `morphology/compute-coastline-metrics` → `{ coastalLand, coastalWater, coastMask, landMask }`

Derives coastline adjacency masks and proposes updated masks for coastal carving.

**Ground truth anchors**

- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-coastline-metrics/contract.ts` (`ComputeCoastlineMetricsContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/rugged-coasts/step.ts` (reconciling the carved coast into topography evidence)

#### `morphology/compute-shelf-mask` → `{ shelfMask, activeMarginMask, depthGateMask, nearshoreCandidateMask, shelfBreakDepthByTile, shallowCutoff }`

Classifies the post-island continental shelf as shoreline-connected water on the
gentle side of the local bathymetric-gradient break. Boundary proximity is used
only for the active-margin diagnostic; it does not determine shelf membership.

**Ground truth anchors**

- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-shelf-mask/contract.ts` (`ComputeShelfMaskContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-shelf/steps/compute-shelf/step.ts` (invoking `ops.shelfMask` after post-island adjacency and distance recomputation)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plot-coasts/step.ts` (projecting `shelf.shelfMask` into `TERRAIN_COAST`)

#### `morphology/compute-flow-routing` → `{ flowDir, flowAccum, basinId }`

Computes Morphology's geomorphic routing proxy from elevation and land mask.
This op is not the canonical water-routing algorithm; Hydrology computes
depression-conditioned drainage routing from Morphology topography.

**Ground truth anchors**

- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-flow-routing/contract.ts` (`ComputeFlowRoutingContract`)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-flow-routing/strategies/default.ts` (`selectFlowReceiver`, `computeFlowAccumulation`, `basinId.fill(-1)`)

#### `morphology/compute-geomorphic-cycle` → `{ elevationDelta, sedimentDelta }`

Computes elevation and sediment deltas for a geomorphic relaxation pass.

**Ground truth anchors**

- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-geomorphic-cycle/contract.ts` (`ComputeGeomorphicCycleContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/steps/geomorphology/step.ts` (copying carved topography and base substrate, then publishing eroded topography and final substrate)

#### `morphology/compute-landmasses` → `{ landmasses, landmassIdByTile }`

Decomposes the final land mask into connected landmasses.

**Ground truth anchors**

- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmasses/contract.ts` (`ComputeLandmassesContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/landmasses/step.ts` (calling `ops.landmasses`)

### Planning ops (plan)

#### `morphology/plan-island-chains` → `{ edits[] }`

Plans island-chain terrain edits (coast/peak) driven by boundary + volcanism signals.

**Ground truth anchors**

- `mods/mod-swooper-maps/src/domain/morphology/ops/plan-island-chains/contract.ts` (`PlanIslandChainsContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/islands/step.ts` (applying island edits to the post-erosion topography vintage)

#### `morphology/plan-volcanoes` → `{ volcanoes[] }`

Plans volcano placements driven by boundary and hotspot signals.

**Ground truth anchors**

- `mods/mod-swooper-maps/src/domain/morphology/ops/plan-volcanoes/contract.ts` (`PlanVolcanoesContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes/step.ts` (building `volcanoMask` and `volcanoes[]` from the plan)

#### `morphology/plan-ridges` → `{ mountainMask, orogenyPotential, fracturePotential }`

Plans mountain ridge intent from belt-driver and topography truth. This op is
kept separate from foothills so the recipe can expose each strategy contract
without preserving the retired combined op as a compatibility lane.

**Ground truth anchors**

- `mods/mod-swooper-maps/src/domain/morphology/ops/plan-ridges/contract.ts` (`PlanRidgesContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/mountains/config.ts` (`MountainsStepContract.ops.ridges`)

#### `morphology/plan-foothills` → `{ hillMask }`

Plans foothill intent from the ridge mask and the same belt-driver/topography
fields. The shared mountain config family remains named because ridge and
foothill classification must use one invariant terrain-classification posture.

**Ground truth anchors**

- `mods/mod-swooper-maps/src/domain/morphology/ops/plan-foothills/contract.ts` (`PlanFoothillsContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/mountains/config.ts` (`MountainsStepContract.ops.foothills`)

## Knobs & Normalization

### Config ownership

Morphology strategy schemas are owned by the op or named op family that consumes
them. Stage roots own their author-facing knob schemas, while named domain policy
modules own the deterministic knob-to-config transforms.

Shared surfaces retained in this domain have explicit invariants:

- `mods/mod-swooper-maps/src/domain/morphology/ops/plan-ridges/contract.ts`,
  `mods/mod-swooper-maps/src/domain/morphology/ops/plan-foothills/contract.ts`,
  and `mods/mod-swooper-maps/src/domain/morphology/ops/plan-rough-lands/contract.ts`
  each own their strategy contract. The `morphology-features` stage compiles one
  `mountainRanges` public config into all three selections, and the mountains
  step's `assertSameMountainFamilySelection` guard rejects divergent configs.
- Individual artifact modules own morphology truth schemas; the shared
  `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/index.ts`
  registry aggregates their `artifacts` definitions because multiple morphology
  stages publish/consume the same tile-space truth evidence and downstream
  projection stages consume that evidence by artifact id.

### Stage-level knobs (semantic presets)

The standard recipe exposes six Morphology knobs that apply _after_ defaulted step config, as deterministic transforms:

- `seaLevel` (morphology-coasts): adds a delta to hypsometry target water percent
- `coastRuggedness` (morphology-coasts): scales bay/fjord carving weights
- `shelfWidth` (morphology-shelf): scales the shelf classifier's local break-gradient threshold
- `erosion` (morphology-erosion): scales geomorphology rates (fluvial/diffusion/deposition)
- `volcanism` (morphology-features): scales volcano planning weights/density
- `orogeny` (morphology-features): scales mountain planning thresholds/intensity

**Ground truth anchors**

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/index.ts`, `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-shelf/index.ts`, `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/index.ts`, and `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/index.ts` (stage-owned knob schemas)
- `mods/mod-swooper-maps/src/domain/morphology/model/policy/coast-knob-policy.ts`, `mods/mod-swooper-maps/src/domain/morphology/model/policy/shelf-knob-policy.ts`, `mods/mod-swooper-maps/src/domain/morphology/model/policy/erosion-knob-policy.ts`, and `mods/mod-swooper-maps/src/domain/morphology/model/policy/landform-knob-policy.ts` (deterministic knob transforms)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/step.ts` (`normalize` applying `MORPHOLOGY_SEA_LEVEL_TARGET_WATER_PERCENT_DELTA`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/rugged-coasts/step.ts` (`normalize` applying `MORPHOLOGY_COAST_RUGGEDNESS_MULTIPLIER`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-shelf/steps/compute-shelf/step.ts` (`normalize` applying `MORPHOLOGY_SHELF_WIDTH_MULTIPLIER`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/steps/geomorphology/step.ts` (`normalize` applying `MORPHOLOGY_EROSION_RATE_MULTIPLIER`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes/step.ts` (`normalize` applying volcanism multipliers)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/mountains/step.ts` (`normalize` applying orogeny multipliers/deltas)

## Current Mapping (Standard Recipe)

### Stage order

In the standard recipe, Morphology truth is authored as five stages. The
Morphology stages run in this order:

- `morphology-coasts` → `morphology-routing` → `morphology-erosion` → `morphology-features` → `morphology-shelf`

`morphology-shelf` completes before the Hydrology and early Ecology truth
stages. Hydrology baseline consumes topography plus the shelf artifact; Ecology
biome classification consumes final topography. The later `map-morphology`
projection consumes topography plus the same shelf artifact.

**Ground truth anchors**

- `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts` (`standardStageContractManifest` canonical stage and step order)
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/steps/climate-baseline/config.ts` (requires `morphologyArtifacts.topography` and `morphologyArtifacts.shelf`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-biomes/steps/biomes/config.ts` (requires `morphologyArtifacts.topography`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plot-coasts/config.ts` (requires `morphologyArtifacts.topography` and `morphologyArtifacts.shelf`)

### `morphology-coasts` (`landmass-plates` → `rugged-coasts`)

Publishes the initial topography and substrate evidence, carves the coast, and
publishes the pre-island coastline snapshot used by mountain planning.
Continental shelf computation is not owned here.

**Requires**

- `artifact:map.foundationPlates`
- `artifact:map.foundationCrustTiles`

**Provides**

- `artifact:morphology.topography` (initial truth vintage)
- `artifact:morphology.substrate` (initial truth vintage)
- `artifact:morphology.coastlineMetrics` (pre-island derived snapshot)

**Ops invoked**

- `morphology/compute-substrate`
- `morphology/compute-base-topography`
- `morphology/compute-sea-level`
- `morphology/compute-landmask`
- `morphology/compute-coastline-metrics`

**Ground truth anchors**

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/index.ts` (`steps: [landmassPlates, ruggedCoasts]`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/config.ts` (`LandmassPlatesStepContract.artifacts`, `LandmassPlatesStepContract.ops`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/step.ts` (publishing initial `topography` and `substrate` evidence)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/rugged-coasts/config.ts` (`RuggedCoastsStepContract.artifacts`, `RuggedCoastsStepContract.ops`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/rugged-coasts/step.ts` (publishing pre-island `coastlineMetrics` without shelf evidence)

### `morphology-routing` (`routing`)

Derives and publishes flow-routing evidence from current topography.

**Requires**

- `artifact:morphology.topography`

**Provides**

- `artifact:morphology.routing` (geomorphic proxy snapshot)

**Ground truth anchors**

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-routing/index.ts` (`steps: [routing]`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-routing/steps/routing/config.ts` (`RoutingStepContract.artifacts`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-routing/steps/routing/step.ts` (publishing routing evidence)

### `morphology-erosion` (`geomorphology`)

Applies geomorphic relaxation and advances the topography/substrate evidence
to the post-erosion vintage consumed downstream.

**Requires**

- `artifact:morphology.topography`
- `artifact:morphology.routing`
- `artifact:morphology.substrate`

**Provides**

- no new artifact identities; advances the existing topography/substrate evidence vintage

**Ground truth anchors**

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/index.ts` (`steps: [geomorphology]`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/steps/geomorphology/config.ts` (`GeomorphologyStepContract.artifacts`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/steps/geomorphology/step.ts` (producing the post-erosion topography/substrate vintage)

### `morphology-features` (`islands` → `mountains` → `volcanoes` → `landmasses`)

Applies landform accents (islands), publishes mountain/foothill intent,
publishes volcano intent, and publishes the landmass decomposition snapshot.

**Requires / Provides**

- `islands`: requires `foundation.plates` + `morphology.topography`; (no new artifacts)
- `mountains`: requires `morphology.beltDrivers` + `morphology.topography`; provides `morphology.mountains`
- `volcanoes`: requires `foundation.plates` + `morphology.topography`; provides `morphology.volcanoes`
- `landmasses`: requires `morphology.topography`; provides `morphology.landmasses`

**Ground truth anchors**

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/index.ts` (`steps: [islands, mountains, volcanoes, landmasses]`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/islands/config.ts` (`IslandsStepContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/mountains/config.ts` (`MountainsStepContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes/config.ts` (`VolcanoesStepContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/landmasses/config.ts` (`LandmassesStepContract`)

### `morphology-shelf` (`compute-shelf`)

Recomputes coastline adjacency and distance from the final post-island landmask,
classifies the continental shelf from the sculpted bathymetric break, and
publishes both as one coherent shelf artifact.

**Requires**

- `artifact:morphology.topography`
- `artifact:morphology.beltDrivers`

**Provides**

- `artifact:morphology.shelf` (post-island coastline + shelf snapshot)

**Ops invoked**

- `morphology/compute-coastal-adjacency`
- `morphology/compute-distance-to-coast`
- `morphology/compute-shelf-mask`

**Ground truth anchors**

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-shelf/index.ts` (`steps: { "compute-shelf": ComputeShelfStep }`, `shelfWidth` knob)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-shelf/steps/compute-shelf/config.ts` (`ComputeShelfStepContract.artifacts`, `ComputeShelfStepContract.ops`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-shelf/steps/compute-shelf/step.ts` (post-island adjacency/distance recomputation and `shelf` publication)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/shelf.artifact.ts` (`Schema`)

### `map-morphology` (projections + effect tags)

Applies Morphology truth into the engine adapter (terrain/features), and emits effect tags for downstream recipe steps.

**Effect tag flow**

- `plot-coasts` → provides `effect:map.coastsPlotted`
- `plot-continents` → requires `coastsPlotted`; provides `continentsPlotted`
- `plot-mountains` → requires `continentsPlotted`; provides `mountainsPlotted`
- `plot-volcanoes` → requires `continentsPlotted`; provides `volcanoesPlotted`
- `build-elevation` → requires `mountainsPlotted` + `volcanoesPlotted`; provides `elevationBuilt`

**Ground truth anchors**

- `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts` (`map-morphology` step order)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/index.ts` (runtime stage composition)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plot-coasts/config.ts` (`PlotCoastsStepContract.artifacts.requires`, `PlotCoastsStepContract.provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plot-continents/config.ts` (`PlotContinentsStepContract.requires/provides`; requires `artifact:map.morphology.coastClassification` so terrain maintenance cannot leave stale coast/ocean classes)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plot-mountains/config.ts` (`PlotMountainsStepContract.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plot-volcanoes/config.ts` (`PlotVolcanoesStepContract.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-elevation/steps/build-elevation/config.ts` (`BuildElevationStepContract.requires/provides`)

**Coast terrain maintenance invariant**

`artifact:map.morphology.coastClassification.waterClass` is the declared
projection surface for topography-water coast/ocean terrain after `plot-coasts`.
It is intentionally a post-policy engine surface, not a synonym for
`artifact:morphology.shelf.shelfMask`. The exact pre-policy source selection is
`artifact:map.morphology.coastClassification.sourceCoastMask`, where a water
tile is selected from the post-island shelf artifact when
`shelf.coastalWater || shelf.shelfMask`; policy-only additions are reported in
`coastRingMask`. Therefore `shelfMask` must be a subset of source coast
selection, source coast selection must be a subset of stamped coast terrain,
and stamped coast terrain may be wider than shelf water because of
post-island coastal-water adjacency and Civ7 coast-ring promotion.
Any later adapter-owned terrain maintenance boundary that may rewrite coast or
ocean terrain must consume that artifact and restore the declared coast/ocean
terrain class before publishing a downstream terrain snapshot or effect relied
on by placement/resource/start planning. This applies at the current
`plot-continents`, `map-rivers/plot-rivers`, and
`placement/prepare-placement-surface` validation boundaries. Land-class terrain
remains owned by the mountain, volcano, natural-wonder, and other land
projection steps.

### Drift notes (only where it affects the contract surface)

- **Elevation units are inconsistently described.** Relief config and base-topography quantization operate in “normalized units” scaled by `DEFAULT_ELEVATION_SCALE = 100`, while the `morphology.topography` artifact schema describes “integer meters”. Decide and make consistent.
- **Duplicate/unused distance-to-coast outputs.** `morphology/compute-landmask` outputs `distanceToCoast` but the standard recipe does not publish it; instead `morphology.coastlineMetrics.distanceToCoast` is computed separately in the `rugged-coasts` step.

**Ground truth anchors**

- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/contract.ts` (`ReliefConfigSchema` “normalized units”)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/rules/index.ts` (`DEFAULT_ELEVATION_SCALE`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/topography.artifact.ts` (`Schema` description)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/contract.ts` (`ComputeLandmaskContract.output.distanceToCoast`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/rugged-coasts/step.ts` (`computeDistanceToCoast`, publish under `coastlineMetrics`)

## Open Questions

0. [`docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`](/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md) is referenced as the canonical ops-module contract, but is not currently present in this repo snapshot. Should it be added (and should domain docs link to it as the single source of truth for op envelope semantics)?
1. What is the canonical unit/datum for `morphology.topography.elevation` before (and after) engine `buildElevation`? Should the artifact schema say “normalized units \* 100” rather than “meters”, or should base-topography/hypsometry be reparameterized into meters?
2. Should `distanceToCoast` be a single canonical product? Options:
   - publish the `compute-landmask` distance field as part of `morphology.topography` (or a dedicated artifact), and remove the bespoke BFS in `rugged-coasts`; or
   - remove `distanceToCoast` from the `compute-landmask` op output contract if it’s intentionally internal/unused.
3. Is `artifact:morphology.volcanoes` intended to be the only canonical volcanic intent surface, or should it also include a stable “volcanism driver” snapshot for downstream consumers?

## Ground truth anchors

This page contains many inline “Ground truth anchors” callouts. This section collects the canonical entrypoints:

- Domain entrypoint + op ids: `mods/mod-swooper-maps/src/domain/morphology/index.ts`
- Standard recipe stages:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-routing/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-shelf/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/index.ts`
- Morphology artifact evidence registry: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/index.ts` (`artifactModules`, `artifacts`); individual schemas live in their corresponding `.artifact.ts` modules

- Wiring + effect tags (current): `mods/mod-swooper-maps/src/recipes/standard/tags.ts` (`MAP_PROJECTION_EFFECT_TAGS.map.*`)

- Example step contracts (truth stages):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/config.ts` (`LandmassPlatesStepContract`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-routing/steps/routing/config.ts` (`RoutingStepContract`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/rugged-coasts/config.ts` (`RuggedCoastsStepContract`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-shelf/steps/compute-shelf/config.ts` (`ComputeShelfStepContract`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes/config.ts` (`VolcanoesStepContract`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/landmasses/config.ts` (`LandmassesStepContract`)

- Example step contracts (projection stage):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plot-coasts/config.ts` (`PlotCoastsStepContract`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plot-continents/config.ts` (`PlotContinentsStepContract`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plot-mountains/config.ts` (`PlotMountainsStepContract`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plot-volcanoes/config.ts` (`PlotVolcanoesStepContract`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-elevation/steps/build-elevation/config.ts` (`BuildElevationStepContract`)

- Policy (truth vs projection posture): `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
