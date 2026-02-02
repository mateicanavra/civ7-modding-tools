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
- **Routing** (flow direction + accumulation)
- **Coastline metrics** (coastal adjacency + distance-to-coast snapshot)
- **Volcano intent** (planned volcano points / mask)
- **Landmasses** (connected-component decomposition of the land mask)

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/morphology/index.ts` (`defineDomain({ id: "morphology", ops })`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/artifacts.ts` (`morphologyArtifacts`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/routing.contract.ts` (`RoutingStepContract.artifacts.provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/ruggedCoasts.contract.ts` (`RuggedCoastsStepContract.artifacts.provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/volcanoes.contract.ts` (`VolcanoesStepContract.artifacts.provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/landmasses.contract.ts` (`LandmassesStepContract.artifacts.provides`)

## Target Architecture (Truth vs Projection)

### Truth posture

MORPHOLOGY is **tile-first**: its canonical “truth” products are tile-indexed fields that live in **generation buffers**, and are optionally *published once* as artifacts for wiring and validation.

**Invariants**
- **Morphology truth is tile-space.** Mesh-space truth lives upstream in Foundation; Morphology consumes tile-space projections of those drivers.
- **Buffers are mutable; buffer artifacts are publish-once handles.** A step may mutate buffers in-place after publishing the artifact handle, but must not republish the artifact.

**Ground truth anchors**
- `packages/mapgen-core/src/core/types.ts` (`MapBuffers` note: “Buffers are mutable… Buffer artifacts are mutable after a single publish; do not republish them.”)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/artifacts.ts` (`MorphologyTopographyArtifactSchema` description: “Publish-once buffer handle; steps may mutate in-place via ctx.buffers.heightfield.”)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.ts` (mutating `context.buffers.heightfield` then publishing `deps.artifacts.topography`)

### Projections

“Map projection” steps (in `map-morphology`) apply Morphology truth into the engine adapter’s terrain/feature fields and are guarded by **no-water-drift** invariants: the engine surface must remain consistent with Morphology’s land/water truth.

**Invariants**
- **Projections must not drift land/water classification.** After calling engine-facing helpers (`expandCoasts`, `stampContinents`, `buildElevation`), the adapter’s `isWater(x,y)` must still match Morphology `topography.landMask`.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/assertions.ts` (`assertNoWaterDrift`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotCoasts.ts` (`context.adapter.expandCoasts`, `assertNoWaterDrift`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotContinents.ts` (`context.adapter.stampContinents`, `assertNoWaterDrift`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.ts` (`context.adapter.buildElevation`, `assertNoWaterDrift`)

## Contract

For the common “ops module” wiring pattern (op contracts, op envelope schemas, binding, and compile/runtime registries), see:
- `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`

### Requires

At the **domain op** level, Morphology ops are pure functions that require:
- `width`, `height`
- domain-specific tile tensors (e.g. `boundaryCloseness`, `crustType`, `elevation`)
- optional deterministic `rngSeed` passed as data (no ambient randomness inside ops)

At the **standard recipe wiring** level, Morphology requires the following upstream Foundation artifacts:
- `artifact:foundation.plates` (tile-space tectonic driver tensors)
- `artifact:foundation.crustTiles` (tile-space crust driver tensors sampled from mesh truth)

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/morphology/ops/*/contract.ts` (`defineOp({ input: ... })` for each op)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.contract.ts` (`LandmassPlatesStepContract.artifacts.requires`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (`foundationArtifacts.plates`, `foundationArtifacts.crustTiles`)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/contract.ts` (input `crustBaseElevation` described as “projected from mesh crust truth”)

### Provides (artifacts + tags)

#### Artifacts

Morphology provides the following artifact dependency tags (all `artifact:*`):
- `artifact:morphology.topography`
- `artifact:morphology.substrate`
- `artifact:morphology.coastlineMetrics`
- `artifact:morphology.routing`
- `artifact:morphology.volcanoes`
- `artifact:morphology.landmasses`

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/artifacts.ts` (`morphologyArtifacts`)

#### Tags

Morphology’s **simulation** steps do not provide effect tags directly in the standard recipe (their `requires`/`provides` tag lists are empty). Morphology’s **map projection** steps provide gameplay effect tags in the `map-morphology` stage.

**Map-morphology effect tags**
- `effect:map.coastsPlotted`
- `effect:map.continentsPlotted`
- `effect:map.mountainsPlotted`
- `effect:map.volcanoesPlotted`
- `effect:map.elevationBuilt`

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.contract.ts` (`LandmassPlatesStepContract.requires/provides` are empty)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/routing.contract.ts` (`RoutingStepContract.requires/provides` are empty)
- `mods/mod-swooper-maps/src/recipes/standard/tags.ts` (`M10_EFFECT_TAGS.map.*`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotCoasts.contract.ts` (`PlotCoastsStepContract.provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotContinents.contract.ts` (`PlotContinentsStepContract.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains.contract.ts` (`PlotMountainsStepContract.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotVolcanoes.contract.ts` (`PlotVolcanoesStepContract.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.contract.ts` (`BuildElevationStepContract.requires/provides`)

### Value domains (enums / ranges)

Boundary regimes are represented by `BOUNDARY_TYPE` numeric codes:
- `0` = `none`
- `1` = `convergent`
- `2` = `divergent`
- `3` = `transform`

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/constants.ts` (`BOUNDARY_TYPE`)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-coastline-metrics/contract.ts` (input `boundaryType` description: “1=conv,2=div,3=trans”)

## Artifacts

This section describes **what is authoritative**, **what space it lives in**, and **how downstream consumers should interpret it**.

### `artifact:morphology.topography` (truth handle; tile space; mutable buffer)

Canonical Morphology topography handle. In the standard recipe it points at (and is expected to remain consistent with) `ctx.buffers.heightfield`.

Fields:
- `elevation` (i16): staged elevation field
- `seaLevel` (number): sea level threshold in the same units as `elevation`
- `landMask` (u8): `1=land`, `0=water`; required to be consistent with `elevation > seaLevel`
- `bathymetry` (i16): `0` on land; `<=0` in water; derived from `elevation` and `seaLevel`

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/artifacts.ts` (`MorphologyTopographyArtifactSchema`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.ts` (publishing `{ elevation, seaLevel, landMask, bathymetry }`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/geomorphology.ts` (updating `heightfield.landMask` + `bathymetry` from `seaLevel`)

### `artifact:morphology.substrate` (truth handle; tile space; mutable buffer)

Canonical Morphology substrate handle. Used by Morphology itself (geomorphology); downstream consumption is not yet part of the standard recipe’s dependency surface.

Fields:
- `erodibilityK` (f32): resistance proxy (higher = easier incision)
- `sedimentDepth` (f32): deposit thickness proxy (higher = deeper deposits)

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/artifacts.ts` (`MorphologySubstrateArtifactSchema`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.ts` (publishing substrate from `ops.substrate`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/geomorphology.ts` (mutating `substrate.sedimentDepth` in-place)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/geomorphology.contract.ts` (requires `morphologyArtifacts.substrate`)

### `artifact:morphology.routing` (truth handle; tile space; mutable buffer)

Flow routing buffers derived from current topography.

Fields:
- `flowDir` (i32): receiver tile index (`-1` for sinks/edges)
- `flowAccum` (f32): drainage area proxy
- `basinId` (i32, optional in artifact schema): basin identifier (`-1` for unassigned)

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/artifacts.ts` (`MorphologyRoutingArtifactSchema`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/routing.ts` (publishing routing buffers)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-flow-routing/strategies/default.ts` (always returning an `Int32Array` `basinId` filled with `-1`)

### `artifact:morphology.coastlineMetrics` (derived snapshot; tile space; immutable-at-F2)

Derived coastline adjacency + distance-to-coast metrics.

Fields:
- `coastalLand` (u8): `1` where a land tile is adjacent to water
- `coastalWater` (u8): `1` where a water tile is adjacent to land
- `distanceToCoast` (u16): minimum tile-graph distance to any coast tile

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/artifacts.ts` (`MorphologyCoastlineMetricsArtifactSchema`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/ruggedCoasts.ts` (`computeDistanceToCoast`, publishing `coastlineMetrics`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotCoasts.ts` (projection uses `coastlineMetrics` “pre-expandCoasts”)

### `artifact:morphology.volcanoes` (truth-only intent; tile space; immutable-at-F2)

Planned volcano placements, represented as both:
- a dense `volcanoMask` (for map overlays / fast membership tests)
- a sparse list of volcano entries (`tileIndex`, `kind`, `strength01`)

This artifact is an **intent snapshot**: it is not a promise that a particular engine terrain/feature application strategy is stable.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/artifacts.ts` (`MorphologyVolcanoesArtifactSchema`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/volcanoes.contract.ts` (docstring: “truth-only intent”)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/volcanoes.ts` (publishing `{ volcanoMask, volcanoes }`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotVolcanoes.ts` (projection into engine terrain + feature)

### `artifact:morphology.landmasses` (derived snapshot; tile space; immutable-at-F2)

Connected-component decomposition of the land mask.

Fields:
- `landmasses[]`: per-component metadata (area proxy `tileCount`, `bbox`, `coastlineLength`)
- `landmassIdByTile` (i32): `-1` for water, otherwise `0..landmasses.length-1`

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/artifacts.ts` (`MorphologyLandmassesArtifactSchema`)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmasses/contract.ts` (`ComputeLandmassesContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/landmasses.ts` (publishing `landmasses`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/plot-landmass-regions/contract.ts` (requires `morphologyArtifacts.landmasses`)

## Operations

Morphology ops are the domain’s compute units. The standard recipe wires them into steps (next section).

### Base fields (compute)

#### `morphology/compute-substrate` → `{ erodibilityK, sedimentDepth }`

Computes substrate buffers from tile-space tectonic potentials and crust typing/age.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-substrate/contract.ts` (`ComputeSubstrateContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.ts` (calling `ops.substrate` with `foundationPlates` + `foundationCrustTiles`)

#### `morphology/compute-base-topography` → `{ elevation }`

Converts crust isostasy baseline + tectonic potentials into an initial quantized elevation field.

**Notable invariant (quantization scale)**
- The default strategy quantizes a float “normalized units” elevation sample by multiplying by `DEFAULT_ELEVATION_SCALE = 100` before clamping to i16.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/contract.ts` (`ComputeBaseTopographyContract`)
- `mods/mod-swooper-maps/src/domain/morphology/config.ts` (`ReliefConfigSchema` fields `continentalHeight`/`oceanicHeight` described as “normalized units”)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/rules/index.ts` (`quantizeElevation`, `DEFAULT_ELEVATION_SCALE`)

#### `morphology/compute-sea-level` → `{ seaLevel }`

Selects the sea level threshold based on hypsometry targets and optional deterministic variance.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-sea-level/contract.ts` (`ComputeSeaLevelContract`)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-sea-level/rules/index.ts` (`resolveTargetPercent`, `resolveSeaLevel`)

#### `morphology/compute-landmask` → `{ landMask, distanceToCoast }`

Derives a land mask from `elevation` and `seaLevel`, with an optional ocean-separation shaping policy.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/contract.ts` (`ComputeLandmaskContract`)
- `mods/mod-swooper-maps/src/domain/morphology/config.ts` (`OceanSeparationConfigSchema`)

### Derived metrics and dynamics (compute)

#### `morphology/compute-coastline-metrics` → `{ coastalLand, coastalWater, coastMask, landMask }`

Derives coastline adjacency masks and proposes updated masks for coastal carving.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-coastline-metrics/contract.ts` (`ComputeCoastlineMetricsContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/ruggedCoasts.ts` (applying `coastMask` and `landMask` to staged buffers)

#### `morphology/compute-flow-routing` → `{ flowDir, flowAccum, basinId }`

Computes flow routing and accumulation buffers from elevation and land mask.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-flow-routing/contract.ts` (`ComputeFlowRoutingContract`)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-flow-routing/strategies/default.ts` (`selectFlowReceiver`, `computeFlowAccumulation`, `basinId.fill(-1)`)

#### `morphology/compute-geomorphic-cycle` → `{ elevationDelta, sedimentDelta }`

Computes elevation and sediment deltas for a geomorphic relaxation pass.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-geomorphic-cycle/contract.ts` (`ComputeGeomorphicCycleContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/geomorphology.ts` (applying deltas to `heightfield.elevation` and `substrate.sedimentDepth`)

#### `morphology/compute-landmasses` → `{ landmasses, landmassIdByTile }`

Decomposes the final land mask into connected landmasses.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmasses/contract.ts` (`ComputeLandmassesContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/landmasses.ts` (calling `ops.landmasses`)

### Planning ops (plan)

#### `morphology/plan-island-chains` → `{ edits[] }`

Plans island-chain terrain edits (coast/peak) driven by boundary + volcanism signals.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/morphology/ops/plan-island-chains/contract.ts` (`PlanIslandChainsContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/islands.ts` (applying `edits` to staged buffers)

#### `morphology/plan-volcanoes` → `{ volcanoes[] }`

Plans volcano placements driven by boundary and hotspot signals.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/morphology/ops/plan-volcanoes/contract.ts` (`PlanVolcanoesContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/volcanoes.ts` (building `volcanoMask` and `volcanoes[]` from the plan)

#### `morphology/plan-ridges-and-foothills` → `{ mountainMask, hillMask, ... }`

Plans ridge and foothill masks for mountainous terrain accents (used by `map-morphology` projection).

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/morphology/ops/plan-ridges-and-foothills/contract.ts` (`PlanRidgesAndFoothillsContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains.contract.ts` (`PlotMountainsStepContract.ops.mountains`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains.ts` (calling `ops.mountains` and applying terrain)

## Knobs & Normalization

### Stage-level knobs (semantic presets)

The standard recipe exposes five Morphology knobs that apply *after* defaulted step config, as deterministic transforms:
- `seaLevel` (morphology-pre): adds a delta to hypsometry target water percent
- `coastRuggedness` (morphology-mid): scales bay/fjord carving weights
- `erosion` (morphology-mid): scales geomorphology rates (fluvial/diffusion/deposition)
- `volcanism` (morphology-post): scales volcano planning weights/density
- `orogeny` (map-morphology): scales mountain planning thresholds/intensity

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/morphology/shared/knobs.ts` (`MorphologySeaLevelKnobSchema`, `MorphologyCoastRuggednessKnobSchema`, `MorphologyErosionKnobSchema`, `MorphologyVolcanismKnobSchema`, `MorphologyOrogenyKnobSchema`)
- `mods/mod-swooper-maps/src/domain/morphology/shared/knob-multipliers.ts` (all `MORPHOLOGY_*` multipliers/deltas)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.ts` (`normalize` applying `MORPHOLOGY_SEA_LEVEL_TARGET_WATER_PERCENT_DELTA`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/ruggedCoasts.ts` (`normalize` applying `MORPHOLOGY_COAST_RUGGEDNESS_MULTIPLIER`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/geomorphology.ts` (`normalize` applying `MORPHOLOGY_EROSION_RATE_MULTIPLIER`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/volcanoes.ts` (`normalize` applying volcanism multipliers)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains.ts` (`normalize` applying orogeny multipliers/deltas)

## Current Mapping (Standard Recipe)

### Stage order

In the standard recipe, Morphology runs in three simulation stages and one projection stage:
- `morphology-pre` → `morphology-mid` → `morphology-post` → `map-morphology`

Hydrology and Ecology consume Morphology artifacts after `morphology-post` completes.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` (`stages` ordering: `morphologyPre`, `morphologyMid`, `morphologyPost`, `mapMorphology`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/steps/climateBaseline.contract.ts` (requires `morphologyArtifacts.topography`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts` (requires `morphologyArtifacts.topography`)

### `morphology-pre` (`landmass-plates`)

Seeds the canonical Morphology buffers and publishes the initial buffer-handles.

**Requires**
- `artifact:foundation.plates`
- `artifact:foundation.crustTiles`

**Provides**
- `artifact:morphology.topography` (publish-once handle)
- `artifact:morphology.substrate` (publish-once handle)

**Ops invoked**
- `morphology/compute-substrate`
- `morphology/compute-base-topography`
- `morphology/compute-sea-level`
- `morphology/compute-landmask`

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.contract.ts` (`LandmassPlatesStepContract.artifacts`, `LandmassPlatesStepContract.ops`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.ts` (mutating `ctx.buffers.heightfield` and publishing `topography`/`substrate`)

### `morphology-mid` (`rugged-coasts` → `routing` → `geomorphology`)

Refines coastlines, derives routing, and applies a geomorphic relaxation pass.

**Requires / Provides**
- `rugged-coasts`: requires `foundation.plates` + `morphology.topography`; provides `morphology.coastlineMetrics`
- `routing`: requires `morphology.topography`; provides `morphology.routing`
- `geomorphology`: requires `morphology.topography` + `morphology.routing` + `morphology.substrate`; (no new artifacts)

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/ruggedCoasts.contract.ts` (`RuggedCoastsStepContract.artifacts`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/routing.contract.ts` (`RoutingStepContract.artifacts`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/geomorphology.contract.ts` (`GeomorphologyStepContract.artifacts`)

### `morphology-post` (`islands` → `volcanoes` → `landmasses`)

Applies landform accents (islands), publishes volcano intent, and publishes the landmass decomposition snapshot.

**Requires / Provides**
- `islands`: requires `foundation.plates` + `morphology.topography`; (no new artifacts)
- `volcanoes`: requires `foundation.plates` + `morphology.topography`; provides `morphology.volcanoes`
- `landmasses`: requires `morphology.topography`; provides `morphology.landmasses`

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/index.ts` (`steps: [islands, volcanoes, landmasses]`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/islands.contract.ts` (`IslandsStepContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/volcanoes.contract.ts` (`VolcanoesStepContract`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/landmasses.contract.ts` (`LandmassesStepContract`)

### `map-morphology` (projections + effect tags)

Applies Morphology truth into the engine adapter (terrain/features), and emits effect tags for downstream recipe steps.

**Effect tag flow**
- `plot-coasts` → provides `effect:map.coastsPlotted`
- `plot-continents` → requires `coastsPlotted`; provides `continentsPlotted`
- `plot-mountains` → requires `continentsPlotted`; provides `mountainsPlotted`
- `plot-volcanoes` → requires `continentsPlotted`; provides `volcanoesPlotted`
- `build-elevation` → requires `mountainsPlotted` + `volcanoesPlotted`; provides `elevationBuilt`

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/index.ts` (`steps` ordering)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotCoasts.contract.ts` (`PlotCoastsStepContract.provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotContinents.contract.ts` (`PlotContinentsStepContract.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains.contract.ts` (`PlotMountainsStepContract.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotVolcanoes.contract.ts` (`PlotVolcanoesStepContract.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.contract.ts` (`BuildElevationStepContract.requires/provides`)

### Drift notes (only where it affects the contract surface)

- **Elevation units are inconsistently described.** Relief config and base-topography quantization operate in “normalized units” scaled by `DEFAULT_ELEVATION_SCALE = 100`, while the `morphology.topography` artifact schema describes “integer meters”. Decide and make consistent.
- **Duplicate/unused distance-to-coast outputs.** `morphology/compute-landmask` outputs `distanceToCoast` but the standard recipe does not publish it; instead `morphology.coastlineMetrics.distanceToCoast` is computed separately in the `rugged-coasts` step.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/morphology/config.ts` (`ReliefConfigSchema` “normalized units”)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/rules/index.ts` (`DEFAULT_ELEVATION_SCALE`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/artifacts.ts` (`MorphologyTopographyArtifactSchema` description)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/contract.ts` (`ComputeLandmaskContract.output.distanceToCoast`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/ruggedCoasts.ts` (`computeDistanceToCoast`, publish under `coastlineMetrics`)

## Open Questions

0. `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md` is referenced as the canonical ops-module contract, but is not currently present in this repo snapshot. Should it be added (and should domain docs link to it as the single source of truth for op envelope semantics)?
1. What is the canonical unit/datum for `morphology.topography.elevation` before (and after) engine `buildElevation`? Should the artifact schema say “normalized units * 100” rather than “meters”, or should base-topography/hypsometry be reparameterized into meters?
2. Should `distanceToCoast` be a single canonical product? Options:
   - publish the `compute-landmask` distance field as part of `morphology.topography` (or a dedicated artifact), and remove the bespoke BFS in `rugged-coasts`; or
   - remove `distanceToCoast` from the `compute-landmask` op output contract if it’s intentionally internal/unused.
3. Do we want Morphology truth artifacts to remain mutable across `map-morphology` projections, or should `map-morphology` read snapshots and treat the engine elevation/terrain as purely downstream projections?
4. Is `artifact:morphology.volcanoes` intended to be the only canonical volcanic intent surface, or should it also include a stable “volcanism driver” snapshot for downstream consumers?

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.contract.ts` (`LandmassPlatesStepContract.requires/provides` are empty)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/routing.contract.ts` (`RoutingStepContract.requires/provides` are empty)
- `mods/mod-swooper-maps/src/recipes/standard/tags.ts` (`M10_EFFECT_TAGS.map.*`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotCoasts.contract.ts` (`PlotCoastsStepContract.provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotContinents.contract.ts` (`PlotContinentsStepContract.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains.contract.ts` (`PlotMountainsStepContract.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotVolcanoes.contract.ts` (`PlotVolcanoesStepContract.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.contract.ts` (`BuildElevationStepContract.requires/provides`)

- Domain id + ops bundle: `mods/mod-swooper-maps/src/domain/morphology/index.ts`
- Standard recipe Morphology stages: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/index.ts`, `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/index.ts`, `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/index.ts`
- Engine-facing projections: `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/index.ts`
