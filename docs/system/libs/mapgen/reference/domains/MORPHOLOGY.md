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
- **Base coastline evidence** (pre-island adjacency and distance snapshot)
- **Continental shelf** (post-island coastline metrics + shelf mask and diagnostics)
- **Volcano intent** (planned volcano points / mask)
- **Landmasses** (connected-component decomposition of the land mask)

The domain contract composes six causal modules: `terrain`, `coasts`,
`routing`, `erosion`, `landforms`, and `shelf`. Each module owns its operation
contracts, executable implementations, policy, and immutable artifact catalog.
The domain root exposes the aggregate declaration contract; recipe execution
uses the executable router.

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/contract.ts` (`defineDomain("morphology", modules)`)
- `plugins/mod/map/swooper-physics/src/domain/morphology/router.ts` (`createDomainRouter`)
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/*/artifacts/index.ts` (module-owned `artifacts` catalogs)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/routing/steps/routing/config.ts` (`config.provides`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/steps/coastline-evidence/config.ts` (`config.provides`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/shelf/steps/compute-shelf/config.ts` (`config.provides`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/volcanoes/config.ts` (`config.provides`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/landmasses/config.ts` (`config.provides`)

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

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/artifacts/topography.artifact.ts` (`artifact.schema`)
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/erosion/artifacts/substrate.artifact.ts` (`artifact.schema`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/steps/landmass-plates/config.ts` (`config.requires/provides`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/steps/landmass-plates/step.ts` (publishing the initial topography and substrate evidence)

### Projections

“Map projection” steps apply Morphology truth and downstream water intent into the engine adapter’s terrain/feature fields and are guarded by **no-water-drift** invariants: the engine surface must remain consistent with the projected land/water surface at that lifecycle point.

**Invariants**

- **Projections must not drift land/water classification.** After calling engine-facing helpers (`stampContinents`, `buildElevation`, or any engine-side terrain fixups), the adapter's `isWater(x,y)` must still match the expected projected land mask. Before lake projection this is Morphology `topography.landMask`; after lake projection it includes Hydrology lake intent as expected water.

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/recipes/standard/water-surface-parity.ts` (`assertNoWaterDrift`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/water-surface-parity.ts` (`restoreProjectedCoastTerrain`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-coasts/step.ts` (seeds source coast from post-island `shelf.coastalWater || shelf.shelfMask`, applies the Civ7 coast-ring policy, then guards with `assertWaterDriftWithinPolicy`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-continents/step.ts` (`deps.engine.stampContinents`, `assertWaterDriftWithinPolicy`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/elevation/steps/build-elevation/step.ts` (`deps.engine.buildElevation`, `assertWaterDriftWithinPolicy`)

## Contract

For the common “ops module” wiring pattern (operation contracts, envelopes,
canonical implementations, and recipe collection), see:

- [`docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`](/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md)

### Requires

At the **domain op** level, Morphology ops are pure functions that require:

- `width`, `height`
- domain-specific tile tensors (e.g. `boundaryCloseness`, `crustType`, `elevation`)
- optional deterministic `rngSeed` passed as data (no ambient randomness inside ops)

At the **standard recipe wiring** level, Morphology requires the following upstream Foundation artifacts:

- `artifact:foundation.crustTiles` (tile-space crust driver tensors sampled from mesh truth)
- `artifact:foundation.tectonicHistoryTiles` (tile-space multi-era tectonic history)
- `artifact:foundation.tectonicProvenanceTiles` (tile-space origin and drift provenance)

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/*/ops/*/contract.ts` (`defineOp({ input: ... })` for each op)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/steps/landmass-plates/config.ts` (`config.requires`)
- `plugins/mod/map/swooper-physics/src/domain/foundation/modules/projection/artifacts/index.ts` (`artifacts.crustTiles`, `artifacts.tectonicHistoryTiles`, `artifacts.tectonicProvenanceTiles`)
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/terrain/ops/compute-base-topography/contract.ts` (input `crustBaseElevation` described as “projected from mesh crust truth”)

### Provides (artifacts + tags)

#### Artifacts

Morphology's module catalogs provide the following complete artifact set (all
`artifact:*`):

- `artifact:morphology.topography.base`
- `artifact:morphology.topography.eroded`
- `artifact:morphology.topography`
- `artifact:morphology.substrate.base`
- `artifact:morphology.substrate`
- `artifact:morphology.beltDrivers`
- `artifact:morphology.baseCoastline`
- `artifact:morphology.shelf`
- `artifact:morphology.routing` (geomorphic proxy; not canonical Hydrology drainage routing)
- `artifact:morphology.mountains`
- `artifact:morphology.volcanoes`
- `artifact:morphology.landmasses`

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/*/artifacts/index.ts` (`artifacts`)

#### Completions

Morphology's **simulation** steps exchange exact artifact authorities without
providing completions. Morphology's **map projection** steps additionally
provide engine-transaction completions as they materialize those artifacts into Civ7.

**Map-morphology completions**

- `completion:map.coasts-plotted`
- `completion:map.continents-plotted`
- `completion:map.mountains-plotted`
- `completion:map.volcanoes-plotted`
- `completion:map.elevation-built`

## Ground truth anchors

This section is a navigation aid: concrete file paths that back the contract claims in this domain reference.

- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/steps/landmass-plates/config.ts` (artifact dependencies; no completions)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/routing/steps/routing/config.ts` (artifact dependencies; no completions)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/shelf/steps/compute-shelf/config.ts` (artifact dependencies; no completions)
- `plugins/mod/map/swooper-physics/src/recipes/standard/completions.ts` (`STANDARD_COMPLETIONS`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-coasts/config.ts` (`config` requires `artifact:morphology.shelf` and provides `coastsPlotted`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-continents/config.ts` (`config.requires/provides`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-mountains/config.ts` (`config.requires/provides`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-volcanoes/config.ts` (`config.requires/provides`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/elevation/steps/build-elevation/config.ts` (`config.requires/provides`)

### Value domains (enums / ranges)

Boundary regimes are represented by `BOUNDARY_TYPE` numeric codes:

- `0` = `none`
- `1` = `convergent`
- `2` = `divergent`
- `3` = `transform`

**Ground truth anchors**

- `packages/mapgen-core/src/lib/plates/boundary-type.ts` (`BOUNDARY_TYPE`)
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/terrain/ops/compute-belt-drivers/contract.ts` (output `boundaryType`)

## Artifacts

This section describes **what is authoritative**, **what space it lives in**, and **how downstream consumers should interpret it**.

### Topography vintages (truth evidence; tile space)

Morphology publishes three immutable topography identities in causal order. A
consumer names the exact vintage it needs; no stage advances one artifact in
place:

- `artifact:morphology.topography.base` is the terrain module's initial relief.
- `artifact:morphology.topography.eroded` is the erosion module's post-geomorphic
  relief.
- `artifact:morphology.topography` is the landforms module's terminal post-island
  relief consumed across domain and projection boundaries.

All three identities use the same closed tile-space payload:

- `elevation` (i16): signed elevation evidence per tile
- `seaLevel` (number): sea level threshold in the same units as `elevation`
- `landMask` (u8): `1=land`, `0=water`; required to be consistent with `elevation > seaLevel`
- `bathymetry` (i16): `0` on land; `<=0` in water; derived from `elevation` and `seaLevel`

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/terrain/artifacts/topography-base.artifact.ts`
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/erosion/artifacts/topography-eroded.artifact.ts`
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/artifacts/topography.artifact.ts`
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/islands/config.ts` (publishing the terminal identity from eroded topography)

### `artifact:morphology.substrate` (truth evidence; tile space)

Morphology publishes `artifact:morphology.substrate.base` from the terrain
module, then publishes the distinct `artifact:morphology.substrate` identity
from erosion after sediment transport. Downstream cross-domain consumption is
not yet part of the standard recipe dependency surface.

Fields:

- `erodibilityK` (f32): resistance proxy (higher = easier incision)
- `sedimentDepth` (f32): deposit thickness proxy (higher = deeper deposits)

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/terrain/artifacts/substrate-base.artifact.ts`
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/erosion/artifacts/substrate.artifact.ts`
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/erosion/steps/geomorphology/config.ts` (requires the base identity and provides the post-erosion identity)

### `artifact:morphology.routing` (geomorphic proxy evidence; tile space)

Flow-routing evidence derived from base topography before erosion for
Morphology erosion and landform consumers such as mountain and rough-land
planning. Hydrology does not consume this artifact; it owns separate,
depression-conditioned routing derived from final Morphology topography for
discharge, rivers, and lakes.

Fields:

- `flowDir` (i32): receiver tile index (`-1` for sinks/edges)
- `flowAccum` (f32): drainage area proxy
- `basinId` (i32): basin identifier (`-1` for unassigned)

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/routing/artifacts/routing.artifact.ts` (`artifact.schema`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/routing/steps/routing/step.ts` (publishing routing evidence)
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/routing/ops/compute-flow-routing/strategies/steepest-descent/index.ts` (always returning an `Int32Array` `basinId` filled with `-1`)

### `artifact:morphology.baseCoastline` (pre-island evidence; tile space)

Adjacency and distance-to-coast evidence derived from base topography before
island topography computation. Island formation and mountain planning consume
this vintage. It contains no shelf evidence; post-island coastline and shelf
truth live in `artifact:morphology.shelf`.

Fields:

- `coastalLand` (u8): `1` where a land tile is adjacent to water
- `coastalWater` (u8): `1` where a water tile is adjacent to land
- `distanceToCoast` (u16): minimum tile-graph distance to any coast tile

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/coasts/artifacts/base-coastline.artifact.ts` (`artifact.schema`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/steps/coastline-evidence/step.ts` (publishing `baseCoastline`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/islands/config.ts` (`config.requires`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/mountains/config.ts` (`config.requires`)

### `artifact:morphology.shelf` (post-island evidence; tile space)

Continental-shelf truth and the post-island coastline vintage published by
`morphology-shelf`. This is the coast evidence consumed by Hydrology and by
engine-facing coast projection.

Fields:

- `shelfMask` (u8): `1` for shoreline-connected water on the gentle pre-break apron; eligible for `TERRAIN_COAST` projection
- `coastalLand` (u8): `1` where post-island land is adjacent to water
- `coastalWater` (u8): `1` where post-island water is adjacent to land
- `distanceToCoast` (u16): post-island minimum tile-graph distance to a coast tile

The classifier also emits invocation-local diagnostic masks and break-depth
evidence for visualization. Those values are not persisted in the shelf
artifact and therefore are not downstream domain authority.

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/shelf/artifacts/shelf.artifact.ts` (`artifact.schema`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/shelf/steps/compute-shelf/config.ts` (`config.requires/provides`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/shelf/steps/compute-shelf/step.ts` (recomputing post-island coastline metrics and publishing `shelf`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-coasts/config.ts` (`config.requires`)

### `artifact:morphology.volcanoes` (complete immutable intent; tile space)

The complete product of `morphology/plan-volcanoes`, represented as both:

- a dense `volcanoMask` (for map overlays / fast membership tests)
- a strictly tile-ordered sparse list of volcano entries (`tileIndex`, tectonic
  setting `kind`, `strength01`)

Artifact admission proves binary mask membership, in-bounds unique ordering,
and exact sparse-list/dense-mask coherence. The product expresses domain
intent; the separate projection step owns Civ7 terrain and feature mutation and
verifies immediate engine readback.

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/artifacts/volcanoes.artifact.ts` (`artifact.schema`)
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/ops/plan-volcanoes/contract.ts` (complete operation output)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/volcanoes/step.ts` (publishing the operation-owned product)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-volcanoes/step.ts` (Civ7 projection and immediate readback)

### `artifact:morphology.landmasses` (derived snapshot; tile space; immutable-at-F2)

Connected-component decomposition of the land mask.

Fields:

- `landmasses[]`: per-component metadata (area proxy `tileCount`, `bbox`, `coastlineLength`)
- `landmassIdByTile` (i32): `-1` for water, otherwise `0..landmasses.length-1`

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/artifacts/landmasses.artifact.ts` (`artifact.schema`)
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/ops/compute-landmasses/contract.ts` (`ComputeLandmassesContract`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/landmasses/step.ts` (publishing `landmasses`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/placement/steps/plot-landmass-regions/config.ts` (requires landforms `landmasses`)

## Operations

Morphology ops are the domain’s compute units. The standard recipe wires them into steps (next section).

### Base fields (compute)

#### `morphology/compute-substrate` → `{ erodibilityK, sedimentDepth }`

Computes substrate evidence from tile-space tectonic potentials and crust typing/age.

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/terrain/ops/compute-substrate/contract.ts` (`ComputeSubstrateContract`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/steps/landmass-plates/step.ts` (calling `ops.substrate` with `plates` + `crustTiles`)

#### `morphology/compute-base-topography` → `{ elevation }`

Converts crust isostasy baseline + tectonic potentials into an initial quantized elevation field.

**Notable invariant (quantization scale)**

- The default strategy quantizes a float “normalized units” elevation sample by multiplying by `DEFAULT_ELEVATION_SCALE = 100` before clamping to i16.

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/terrain/ops/compute-base-topography/contract.ts` (`ComputeBaseTopographyContract`)
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/terrain/ops/compute-base-topography/contract.ts` (`ReliefConfigSchema` fields `continentalHeight`/`oceanicHeight` described as “normalized units”)
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/terrain/ops/compute-base-topography/rules/index.ts` (`quantizeElevation`, `DEFAULT_ELEVATION_SCALE`)

#### `morphology/compute-sea-level` → `{ seaLevel }`

Selects the sea level threshold based on hypsometry targets and optional deterministic variance.

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/terrain/ops/compute-sea-level/contract.ts` (`ComputeSeaLevelContract`)
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/terrain/ops/compute-sea-level/rules/index.ts` (`resolveTargetPercent`, `resolveSeaLevel`)

#### `morphology/compute-landmask` → `{ landMask, elevation, seaLevel, bathymetry }`

Derives a land mask using continent-potential shaping grounded in Foundation
crust truth and provenance stability, then returns the coherent base topography
vintage reconciled against the selected sea-level datum.

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/terrain/ops/compute-landmask/contract.ts` (`ComputeLandmaskContract`)

### Derived metrics and dynamics (compute)

#### `morphology/compute-shelf-mask` → `{ shelfMask, activeMarginMask, depthGateMask, nearshoreCandidateMask, shelfBreakDepthByTile, shallowCutoff }`

Classifies the post-island continental shelf as shoreline-connected water on the
gentle side of the local bathymetric-gradient break. Boundary proximity is used
only for the active-margin diagnostic; it does not determine shelf membership.

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/shelf/ops/compute-shelf-mask/contract.ts` (`ComputeShelfMaskContract`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/shelf/steps/compute-shelf/step.ts` (invoking `ops.shelfMask` after post-island adjacency and distance recomputation)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-coasts/step.ts` (projecting `shelf.shelfMask` into `TERRAIN_COAST`)

#### `morphology/compute-flow-routing` → `{ flowDir, flowAccum, basinId }`

Computes Morphology's geomorphic routing proxy from elevation and land mask.
This op is not the canonical water-routing algorithm; Hydrology computes
depression-conditioned drainage routing from Morphology topography.

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/routing/ops/compute-flow-routing/contract.ts` (`ComputeFlowRoutingContract`)
- `packages/mapgen-core/src/lib/grid/flow-routing.ts` (`selectFlowReceiver` generic hex-grid primitive)
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/routing/ops/compute-flow-routing/strategies/steepest-descent/index.ts` (receiver selection, Morphology accumulation, and `basinId.fill(-1)`)

#### `morphology/compute-geomorphic-cycle` → `{ topography, substrate, deltas }`

Evolves base relief and substrate through the configured geomorphic cycle,
preserves the admitted land-water identity, and returns coherent post-erosion
products plus diagnostic elevation and sediment deltas.

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/erosion/ops/compute-geomorphic-cycle/contract.ts` (`ComputeGeomorphicCycleContract`)
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/erosion/ops/compute-geomorphic-cycle/rules/index.ts` (constructing coherent eroded topography and substrate)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/erosion/steps/geomorphology/step.ts` (publishing the operation-owned products)

#### `morphology/compute-island-topography` → `{ topography, islandClass }`

Computes the complete post-island topography from post-erosion terrain,
pre-island coast distance, and tectonic evidence. The operation applies
connected island-chain and microcontinent formation to coherent elevation,
land-mask, and bathymetry fields, then returns exact per-tile formation classes:
`0` unchanged, `1` island-chain land, and `2` microcontinent land.

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/ops/compute-island-topography/contract.ts` (`ComputeIslandTopographyContract`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/islands/step.ts` (publishing operation-owned topography and projecting formation-class evidence)

#### `morphology/compute-landmasses` → `{ landmasses, landmassIdByTile }`

Decomposes the final land mask into connected landmasses.

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/ops/compute-landmasses/contract.ts` (`ComputeLandmassesContract`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/landmasses/step.ts` (calling `ops.landmasses`)

### Planning ops (plan)

#### `morphology/plan-volcanoes` → `{ volcanoMask, volcanoes[] }`

Plans the complete immutable volcano-intent product from admitted land,
boundary-regime, shield-stability, and volcanism evidence. The planner owns
candidate ranking, periodic-hex spacing, honest boundary-regime
classification, normalized strength, the ordered sparse intent list, and its
exact dense mask. Civ7 terrain and feature mutation remains downstream
projection behavior.

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/ops/plan-volcanoes/contract.ts` (`PlanVolcanoesContract`)
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/artifacts/volcanoes.artifact.ts` (admitting exact sparse-list/dense-mask coherence)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/volcanoes/step.ts` (publishing the operation-owned product)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-volcanoes/step.ts` (projecting intent and verifying immediate Civ7 terrain/feature readback)

#### `morphology/plan-ridges` → `{ mountainMask, orogenyPotential, fracturePotential }`

Plans mountain ridge intent from belt-driver and topography truth. This op is
kept separate from foothills so the recipe can expose each strategy definition
without preserving the retired combined op as a compatibility lane.

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/ops/plan-ridges/contract.ts` (`PlanRidgesContract`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/mountains/config.ts` (`config.ops.ridges`)

#### `morphology/plan-foothills` → `{ hillMask }`

Plans foothill intent from the ridge mask and the same belt-driver/topography
fields. The shared mountain config family remains named because ridge and
foothill classification must use one invariant terrain-classification posture.

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/ops/plan-foothills/contract.ts` (`PlanFoothillsContract`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/mountains/config.ts` (`config.ops.foothills`)

## Knobs & Normalization

### Config ownership

Morphology strategy schemas are owned by the op or named op family that consumes
them. Stage roots own their author-facing knob schemas, while named domain policy
modules own the deterministic knob-to-config transforms.

Shared surfaces retained in this domain have explicit invariants:

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/ops/plan-ridges/contract.ts`,
  `plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/ops/plan-foothills/contract.ts`,
  and `plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/ops/plan-rough-lands/contract.ts`
  each compose their leaf strategy definitions. Their complete operation
  envelopes remain independently authorable. The nullable
  `knobs.mountainRanges` control may deliberately project one coupled physical
  posture across all three; `null` preserves the advanced operation configs.
- Individual artifact authorities own Morphology truth schemas. Each semantic
  module's `artifacts/index.ts` catalogs only that module's products; consumers
  import the exact owning catalog rather than a second domain-wide registry.

### Stage-level knobs (semantic presets)

The standard recipe exposes six Morphology knobs that apply _after_ defaulted step config, as deterministic transforms:

- `seaLevel` (morphology-coasts): adds a delta to hypsometry target water percent
- `shelfWidth` (morphology-shelf): scales the shelf classifier's local break-gradient threshold
- `erosion` (morphology-erosion): scales geomorphology rates (fluvial/diffusion/deposition)
- `volcanism` (morphology-features): scales volcano planning weights/density
- `orogeny` (morphology-features): scales mountain planning thresholds/intensity
- `mountainRanges` (morphology-features): optional coupled mountain-family
  posture; `null` leaves ridge, foothill, and rough-land operation envelopes
  untouched

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/index.ts`, `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/shelf/index.ts`, `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/erosion/index.ts`, and `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/index.ts` (stage-owned knob schemas)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/model/policy/mountain-ranges.ts` (coupled mountain-range projection applied only when its knob is authored)
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/coasts/model/policy/sea-level-knob-policy.ts`, `plugins/mod/map/swooper-physics/src/domain/morphology/modules/shelf/model/policy/shelf-knob-policy.ts`, `plugins/mod/map/swooper-physics/src/domain/morphology/modules/erosion/model/policy/erosion-knob-policy.ts`, and `plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/model/policy/landform-knob-policy.ts` (deterministic knob transforms)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/steps/landmass-plates/step.ts` (`normalize` applying `MORPHOLOGY_SEA_LEVEL_TARGET_WATER_PERCENT_DELTA`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/shelf/steps/compute-shelf/step.ts` (`normalize` applying `MORPHOLOGY_SHELF_WIDTH_MULTIPLIER`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/erosion/steps/geomorphology/step.ts` (`normalize` applying `MORPHOLOGY_EROSION_RATE_MULTIPLIER`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/volcanoes/step.ts` (`normalize` applying volcanism multipliers)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/mountains/step.ts` (`normalize` applying orogeny multipliers/deltas)

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

- `plugins/mod/map/swooper-physics/src/recipes/standard/contract-manifest.ts` (`standardStageContractManifest` canonical stage and step order)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/config.ts` (requires landforms `topography` and shelf `shelf`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/biomes/steps/biomes/config.ts` (requires landforms `topography`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-coasts/config.ts` (requires landforms `topography` and shelf `shelf`)

### `morphology-coasts` (`landmass-plates` → `coastline-evidence`)

Publishes base topography, base substrate, and tectonic belt drivers; then
derives the pre-island coastline snapshot used by mountain planning.
Continental shelf computation is not owned here.

**Requires**

- `artifact:foundation.crustTiles`
- `artifact:foundation.tectonicHistoryTiles`
- `artifact:foundation.tectonicProvenanceTiles`

**Provides**

- `artifact:morphology.topography.base`
- `artifact:morphology.substrate.base`
- `artifact:morphology.beltDrivers`
- `artifact:morphology.baseCoastline` (pre-island derived snapshot)

**Ops invoked**

- `morphology/compute-substrate`
- `morphology/compute-base-topography`
- `morphology/compute-sea-level`
- `morphology/compute-landmask`
- `morphology/compute-coastal-adjacency`
- `morphology/compute-distance-to-coast`

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/index.ts` (`steps: [landmassPlates, coastlineEvidence]`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/steps/landmass-plates/config.ts` (`config.requires/provides`, `config.ops`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/steps/landmass-plates/config.ts` (publishing base topography, base substrate, and belt drivers)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/steps/coastline-evidence/config.ts` (`config.requires/provides`, `config.ops`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/steps/coastline-evidence/step.ts` (publishing pre-island `baseCoastline` without shelf evidence)

### `morphology-routing` (`routing`)

Derives and publishes flow-routing evidence from base topography.

**Requires**

- `artifact:morphology.topography.base`

**Provides**

- `artifact:morphology.routing` (geomorphic proxy snapshot)

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/routing/index.ts` (`steps: [routing]`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/routing/steps/routing/config.ts` (`config.requires/provides`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/routing/steps/routing/step.ts` (publishing routing evidence)

### `morphology-erosion` (`geomorphology`)

Invokes Morphology's complete geomorphic transition over base topography and
substrate, then publishes its distinct post-erosion identities downstream.

**Requires**

- `artifact:morphology.topography.base`
- `artifact:morphology.routing`
- `artifact:morphology.substrate.base`

**Provides**

- `artifact:morphology.topography.eroded`
- `artifact:morphology.substrate`

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/erosion/index.ts` (`steps: [geomorphology]`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/erosion/steps/geomorphology/config.ts` (`config.requires/provides`)
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/erosion/ops/compute-geomorphic-cycle/contract.ts` (owning the complete post-erosion product)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/erosion/steps/geomorphology/step.ts` (publishing the post-erosion topography/substrate vintage)

### `morphology-features` (`islands` → `mountains` → `volcanoes` → `landmasses`)

Computes complete post-island topography, publishes mountain/foothill intent,
publishes volcano intent, and publishes the landmass decomposition snapshot.

**Requires / Provides**

- `islands`: requires `foundation.plates` + `morphology.topography.eroded` + `morphology.baseCoastline`; provides terminal `morphology.topography`
- `mountains`: requires `morphology.beltDrivers` + `morphology.topography`; provides `morphology.mountains`
- `volcanoes`: requires `foundation.plates` + `morphology.topography`; provides `morphology.volcanoes`
- `landmasses`: requires `morphology.topography`; provides `morphology.landmasses`

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/index.ts` (`steps: [islands, mountains, volcanoes, landmasses]`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/islands/config.ts` (`config`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/mountains/config.ts` (`config`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/volcanoes/config.ts` (`config`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/landmasses/config.ts` (`config`)

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

- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/shelf/index.ts` (`steps: { "compute-shelf": ComputeShelfStep }`, `shelfWidth` knob)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/shelf/steps/compute-shelf/config.ts` (`config.requires/provides`, `config.ops`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/shelf/steps/compute-shelf/step.ts` (post-island adjacency/distance recomputation and `shelf` publication)
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/shelf/artifacts/shelf.artifact.ts` (`artifact.schema`)

### `map-morphology` (projections + completions)

Applies Morphology truth into the engine adapter and completes the transactions required by downstream recipe steps.

**Completion flow**

- `plot-coasts` → provides `completion:map.coasts-plotted`
- `plot-continents` → requires `coastsPlotted`; provides `continentsPlotted`
- `plot-mountains` → requires `continentsPlotted`; provides `mountainsPlotted`
- `plot-volcanoes` → requires `continentsPlotted`; provides `volcanoesPlotted`
- `build-elevation` → requires `mountainsPlotted` + `volcanoesPlotted`; provides `elevationBuilt`

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/recipes/standard/contract-manifest.ts` (`map-morphology` step order)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/index.ts` (runtime stage composition)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-coasts/config.ts` (`config.requires/provides`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-continents/step.ts` (re-derives the fixed Civ7 coast projection after terrain maintenance)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-mountains/config.ts` (`config.requires/provides`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-volcanoes/config.ts` (`config.requires/provides`)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/elevation/steps/build-elevation/config.ts` (`config.requires/provides`)

**Coast terrain maintenance invariant**

The immutable Morphology `topography` and post-island `shelf` artifacts are the
source inputs for coast projection. Each adapter-owned terrain-maintenance
boundary derives the same Civ7 coast projection from those inputs and static
`@civ7/map-policy`, then restores the resulting coast/ocean terrain before
publishing downstream evidence or effects. The projection is invocation-local,
not a second persistent artifact vintage.

The source coast selection is `shelf.coastalWater || shelf.shelfMask`; Civ7
policy may additionally promote the guaranteed land-adjacent coast ring.
Therefore `shelfMask` must remain a subset of source coast selection, and source
coast selection a subset of stamped coast terrain. The current restoration
boundaries are `plot-continents`, `plot-rivers`, and
`prepare-placement-surface`. Land-class terrain remains owned by mountain,
volcano, natural-wonder, and other land projection steps.

### Drift notes (only where it affects the contract surface)

- **Elevation units are inconsistently described.** Relief config and base-topography quantization operate in “normalized units” scaled by `DEFAULT_ELEVATION_SCALE = 100`, while the `morphology.topography` artifact schema describes “integer meters”. Decide and make consistent.

**Ground truth anchors**

- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/terrain/ops/compute-base-topography/contract.ts` (`ReliefConfigSchema` “normalized units”)
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/terrain/ops/compute-base-topography/rules/index.ts` (`DEFAULT_ELEVATION_SCALE`)
- `plugins/mod/map/swooper-physics/src/domain/morphology/modules/landforms/artifacts/topography.artifact.ts` (`artifact.schema` description)
- `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/steps/coastline-evidence/step.ts` (`computeDistanceToCoast`, publish under `baseCoastline`)

## Open Questions

1. What is the canonical unit/datum for `morphology.topography.elevation` before (and after) engine `buildElevation`? Should the artifact schema say “normalized units \* 100” rather than “meters”, or should base-topography/hypsometry be reparameterized into meters?
2. Is `artifact:morphology.volcanoes` intended to be the only canonical volcanic intent surface, or should it also include a stable “volcanism driver” snapshot for downstream consumers?

## Ground truth anchors

This page contains many inline “Ground truth anchors” callouts. This section collects the canonical entrypoints:

- Domain declaration: `plugins/mod/map/swooper-physics/src/domain/morphology/contract.ts`
- Domain executable router: `plugins/mod/map/swooper-physics/src/domain/morphology/router.ts`
- Module contract/executable law: [`docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`](/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md)
- Standard recipe stages:
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/index.ts`
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/routing/index.ts`
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/erosion/index.ts`
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/index.ts`
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/shelf/index.ts`
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/index.ts`
- Morphology artifact authority catalogs: `plugins/mod/map/swooper-physics/src/domain/morphology/modules/*/artifacts/index.ts`; each module catalog names only its owned products, and each artifact owns its private schema and complete validator

- Projection completions: `plugins/mod/map/swooper-physics/src/recipes/standard/completions.ts` (`STANDARD_COMPLETIONS`)

- Example step contracts (truth stages):
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/steps/landmass-plates/config.ts` (`config`)
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/routing/steps/routing/config.ts` (`config`)
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/steps/coastline-evidence/config.ts` (`config`)
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/shelf/steps/compute-shelf/config.ts` (`config`)
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/volcanoes/config.ts` (`config`)
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/landmasses/config.ts` (`config`)

- Example step contracts (projection stage):
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-coasts/config.ts` (`config`)
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-continents/config.ts` (`config`)
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-mountains/config.ts` (`config`)
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/projection/steps/plot-volcanoes/config.ts` (`config`)
  - `plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/elevation/steps/build-elevation/config.ts` (`config`)

- Policy (truth vs projection posture): `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
