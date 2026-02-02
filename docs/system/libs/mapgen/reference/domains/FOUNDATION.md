<toc>
  <section title="Overview" />
  <section title="Target Architecture (Truth vs Projection)" />
  <section title="Contract" />
  <section title="Artifacts" />
  <section title="Operations" />
  <section title="Knobs & Normalization" />
  <section title="Current Mapping (Standard Recipe)" />
  <section title="Open Questions" />
</toc>

# Foundation

> **Status:** Canonical (domain reference)
>
> **This doc is:** the contract surface and “what exists before what” meaning of the MapGen **FOUNDATION** domain (inputs, outputs, truth vs projections, and invariants).
>
> **This doc is not:** an implementation tutorial, a tuning guide, or a promise that today’s algorithms are final.

## Overview

FOUNDATION produces the **simulation substrate** consumed by downstream shaping domains. In MapGen’s causal spine it is the first domain and is responsible for the initial “board geometry + lithosphere drivers” that Morphology and later domains interpret.

**Ground truth anchors**
- `docs/system/libs/mapgen/architecture.md` (section “Causal spine”, “Foundation” summary)

## Target Architecture (Truth vs Projection)

FOUNDATION is **mesh-first**: the canonical domain model is authored and computed in **mesh space** and only *projected* into tile space for consumers that cannot read mesh artifacts.

**Invariants**
- **Truth outputs are mesh-space artifacts**. They must be sufficient for downstream domains to reproduce any projections deterministically.
- **Tile-space products are projections**. They may be treated as authoritative *for tile consumers*, but must not feed back into mesh-space truth.
- **Projections must carry an explicit mapping** from tile index → mesh cell index so consumers can cross-walk tile and mesh signals without re-deriving nearest-cell behavior.

**Ground truth anchors**
- `docs/system/libs/mapgen/architecture.md` (section “Modeling posture: mesh-first (not tile-first)”)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/contract.ts` (`ComputePlatesTensorsContract`, output field description for `tileToCellIndex`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts` (`projectPlatesFromModel`, `tileToCellIndex` construction)

## Contract

### Requires

FOUNDATION does not require upstream domain artifacts. It requires only:
- **map dimensions** (`width`, `height`) and wrap semantics for normalization and mesh construction
- **a deterministic seed source** (steps derive per-op `rngSeed` and pass it as pure data to ops)

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mesh.ts` (`ctxRandom`, `ctxRandomLabel`, `context.dimensions`)
- `mods/mod-swooper-maps/src/domain/foundation/lib/normalize.ts` (`requireEnvDimensions`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-mesh/contract.ts` (`ComputeMeshContract.input`)

### Provides (artifacts + tags)

FOUNDATION provides the following artifact dependency tags (all `artifact:*`).

**Truth artifacts (mesh space)**
- `artifact:foundation.mesh`
- `artifact:foundation.crust`
- `artifact:foundation.plateGraph`
- `artifact:foundation.tectonicSegments`
- `artifact:foundation.tectonicHistory`
- `artifact:foundation.tectonics`

**Projection artifacts (tile space or derived from tile projections)**
- `artifact:foundation.tileToCellIndex`
- `artifact:foundation.crustTiles`
- `artifact:foundation.plates`
- `artifact:foundation.plateTopology`

**Ground truth anchors**
- `packages/mapgen-core/src/core/types.ts` (`FOUNDATION_MESH_ARTIFACT_TAG`, `FOUNDATION_CRUST_ARTIFACT_TAG`, `FOUNDATION_PLATE_GRAPH_ARTIFACT_TAG`, `FOUNDATION_TECTONICS_ARTIFACT_TAG`, `FOUNDATION_TILE_TO_CELL_INDEX_ARTIFACT_TAG`, `FOUNDATION_CRUST_TILES_ARTIFACT_TAG`, `FOUNDATION_PLATES_ARTIFACT_TAG`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (`FOUNDATION_TECTONIC_SEGMENTS_ARTIFACT_TAG`, `FOUNDATION_TECTONIC_HISTORY_ARTIFACT_TAG`, `FOUNDATION_PLATE_TOPOLOGY_ARTIFACT_TAG`, `foundationArtifacts`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mesh.contract.ts` (`MeshStepContract.artifacts.provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crust.contract.ts` (`CrustStepContract.artifacts.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateGraph.contract.ts` (`PlateGraphStepContract.artifacts.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts` (`TectonicsStepContract.artifacts.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts` (`ProjectionStepContract.artifacts.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.contract.ts` (`PlateTopologyStepContract.artifacts.requires/provides`)

### Value domains (enums / ranges)

Boundary regimes are represented by `BOUNDARY_TYPE` numeric codes:
- `0` = `none`
- `1` = `convergent`
- `2` = `divergent`
- `3` = `transform`

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/constants.ts` (`BOUNDARY_TYPE`)

## Artifacts

This section describes **what is authoritative**, **what space it lives in**, and **how downstream consumers should interpret it**.

### `artifact:foundation.mesh` (truth; mesh space)

Canonical region mesh used by subsequent mesh-space operations.

Shape highlights:
- `cellCount`: number of mesh cells
- `wrapWidth`: periodic X wrap span in “hex space” units
- `siteX`, `siteY`: per-cell site coordinates (Float32Array, length = `cellCount`)
- `neighborsOffsets`, `neighbors`: CSR neighbor adjacency for each cell
- `areas`: per-cell area (Float32Array, length = `cellCount`)
- `bbox`: mesh-space bounding box

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-mesh/contract.ts` (`FoundationMeshSchema`, `ComputeMeshContract`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-mesh/index.ts` (`computeMesh`, call to `buildDelaunayMesh`)
- `packages/mapgen-core/src/lib/mesh/delaunay.ts` (`buildDelaunayMesh`, `DelaunayMesh`)

### `artifact:foundation.crust` (truth; mesh space)

Per-mesh-cell lithosphere driver tensors.

Shape highlights (all per mesh cell):
- `type` (u8): `0=oceanic`, `1=continental`
- `age` (u8): `0=new`, `255=ancient`
- `buoyancy` (f32): `0..1` proxy
- `baseElevation` (f32): `0..1` isostatic base elevation proxy
- `strength` (f32): `0..1` lithospheric strength proxy

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/contract.ts` (`FoundationCrustSchema`, `ComputeCrustContract`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts` (`computeCrust`)

### `artifact:foundation.plateGraph` (truth; mesh space)

Tectonic plate partition and kinematic metadata.

Shape highlights:
- `cellToPlate` (i16): plate id per mesh cell
- `plates[]`: per-plate metadata (`role`, `kind`, `seedX/Y`, `velocityX/Y`, `rotation`)

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts` (`FoundationPlateGraphSchema`, `FoundationPlateSchema`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts` (`computePlateGraph`, polar caps/microplates handling)

### `artifact:foundation.tectonicSegments` (truth; mesh space)

Boundary segment list between plate pairs. This is a segment-centric representation (arrays of length `segmentCount`).

Key fields:
- topology: `aCell`, `bCell`, `plateA`, `plateB`
- regime + polarity: `regime` (BOUNDARY_TYPE), `polarity` (i8; -1 / +1 only meaningful for convergent segments)
- intensities: `compression`, `extension`, `shear`, `volcanism`, `fracture` (u8; `0..255`)
- drift direction: `driftU`, `driftV` (i8; `-127..127`) used by history drift

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/contract.ts` (`FoundationTectonicSegmentsSchema`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/index.ts` (`computeTectonicSegments`, `boundaryRegimeFromIntensities`)

### `artifact:foundation.tectonicHistory` (truth; mesh space)

Multi-era tectonic driver snapshots plus cumulative rollups.

Notes:
- The op contract allows `eraCount` up to 8, but current validation expects exactly **3 eras**.

Key fields:
- `eras[]` (oldest→newest): per-era fields (`boundaryType`, `upliftPotential`, `riftPotential`, `shearStress`, `volcanism`, `fracture`)
- rollups: `upliftTotal`, `fractureTotal`, `volcanismTotal`, `upliftRecentFraction`, `lastActiveEra`

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts` (`FoundationTectonicHistorySchema`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts` (`computeTectonicHistory`, `buildEraFields`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts` (`validateTectonicHistoryArtifact`, `eraCount !== 3` guard)

### `artifact:foundation.tectonics` (truth; mesh space)

The “current drivers” tensor set used by downstream shaping. Includes a cumulative uplift channel intended to be the stable “total orogeny opportunity” signal.

Key fields (all u8 per mesh cell; `0..255`):
- `boundaryType` (BOUNDARY_TYPE)
- `upliftPotential`, `riftPotential`, `shearStress`, `volcanism`, `fracture`
- `cumulativeUplift`

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts` (`FoundationTectonicsSchema`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts` (`projectPlatesFromModel`, `baseUplift = tectonics.cumulativeUplift ?? tectonics.upliftPotential`)

### `artifact:foundation.tileToCellIndex` (projection; tile space → mesh cell index)

Per-tile nearest mesh cell index. This is the canonical cross-walk used to sample mesh-space truth into tile-space projections.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/contract.ts` (output `tileToCellIndex` description)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts` (`tileToCellIndex`)

### `artifact:foundation.crustTiles` (projection; tile space)

Per-tile crust drivers sampled via `tileToCellIndex`.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/contract.ts` (`CrustTilesSchema`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts` (crust sampling loop)

### `artifact:foundation.plates` (projection; tile space)

Per-tile plate/tensor fields used by tile-based consumers (notably today’s Morphology stage).

Key fields (per tile):
- `id` (i16): plate id
- `boundaryCloseness` (u8): tile-distance proximity to a plate boundary (derived via tile plate-id adjacency)
- `boundaryType` (u8): sampled from mesh-space tectonics via `tileToCellIndex`
- `tectonicStress` (u8): derived `max(upliftPotential, riftPotential, shearStress)`
- `upliftPotential`, `riftPotential`, `shieldStability`, `volcanism` (u8)
- `movementU`, `movementV`, `rotation` (i8; `-127..127`) scaled from plate kinematics

**Ground truth anchors**
- `packages/mapgen-core/src/core/types.ts` (`FoundationPlateFields`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/contract.ts` (`PlatesTilesSchema`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts` (`projectPlatesFromModel`, `boundaryCloseness`, `tectonicStress`, motion scaling)

### `artifact:foundation.plateTopology` (derived; currently tile-derived)

Plate adjacency + centroid/area derived from the tile-space `foundation.plates.id` field.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.ts` (`buildPlateTopology`, `validateTopologySymmetry`)
- `packages/mapgen-core/src/lib/plates/topology.ts` (`buildPlateTopology`) (see `@swooper/mapgen-core/lib/plates` re-export)

## Operations

FOUNDATION ops are the domain’s compute units. The standard recipe wires them into steps (next section).

### Mesh and partition ops (truth)
- `foundation/compute-mesh` → `{ mesh }`
- `foundation/compute-crust` → `{ crust }`
- `foundation/compute-plate-graph` → `{ plateGraph }`
- `foundation/compute-tectonic-segments` → `{ segments }`
- `foundation/compute-tectonic-history` → `{ tectonicHistory, tectonics }`

### Projection op (non-truth)
- `foundation/compute-plates-tensors` → `{ tileToCellIndex, crustTiles, plates }`

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/index.ts` (`defineDomain({ id: "foundation", ops })`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/contracts.ts` (`contracts`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/*/contract.ts` (`defineOp` contracts listed above)
- `mods/mod-swooper-maps/src/domain/foundation/ops/*/index.ts` (implementations listed above)

## Knobs & Normalization

### Stage-level knobs (semantic presets)

The standard recipe exposes two knobs that apply *after* defaulted step config, as deterministic transforms:
- `plateCount`: scales plate count used by mesh + plate graph
- `plateActivity`: scales kinematics and boundary influence used by the projection step

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/shared/knobs.ts` (`FoundationPlateCountKnobSchema`, `FoundationPlateActivityKnobSchema`)
- `mods/mod-swooper-maps/src/domain/foundation/shared/knob-multipliers.ts` (`FOUNDATION_PLATE_COUNT_MULTIPLIER`, `FOUNDATION_PLATE_ACTIVITY_KINEMATICS_MULTIPLIER`, `FOUNDATION_PLATE_ACTIVITY_BOUNDARY_INFLUENCE_DISTANCE_DELTA`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts` (`knobsSchema`, “Knobs apply last” docstrings)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mesh.ts` (`normalize` applying `FOUNDATION_PLATE_COUNT_MULTIPLIER`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateGraph.ts` (`normalize` applying `FOUNDATION_PLATE_COUNT_MULTIPLIER`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts` (`normalize` applying plate activity multipliers/deltas)

### Op normalization (dimension-aware scaling)

Some op strategies normalize authored config using runtime dimensions:
- `foundation/compute-mesh` scales `plateCount` and derives `cellCount`
- `foundation/compute-plate-graph` scales `plateCount`

Both use an area-based scaling function:
- `area = width * height`
- `scale = (area / referenceArea) ^ plateScalePower`
- `scaledPlateCount = round(authoredPlateCount * scale)` with a minimum of 2

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-mesh/index.ts` (`normalize` in default strategy)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts` (`normalize` in default strategy)
- `mods/mod-swooper-maps/src/domain/foundation/lib/normalize.ts` (`requireEnvDimensions`)

## Current Mapping (Standard Recipe)

### Stage composition

In the standard recipe, the `foundation` stage runs these steps (in order):
1. `mesh`
2. `crust`
3. `plate-graph`
4. `tectonics`
5. `projection`
6. `plate-topology`

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts` (`createStage`, `steps: [mesh, crust, ...]`)
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` (`STANDARD_STAGES`, `stages` ordering)

### Downstream consumption (today)

Downstream domains in the standard recipe primarily consume **tile projections**:
- Morphology reads `artifact:foundation.plates` and `artifact:foundation.crustTiles`

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.ts` (`deps.artifacts.foundationPlates.read`, `deps.artifacts.foundationCrustTiles.read`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/ruggedCoasts.ts` (`deps.artifacts.foundationPlates.read`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/volcanoes.ts` (`deps.artifacts.foundationPlates.read`)

### Drift notes (target vs current)

This is the minimal drift worth calling out in a domain reference:
- **Plate topology is tile-derived today** (`foundation.plateTopology` is built from tile `plates.id`), even though plate adjacency is conceptually mesh-native.
- **Tectonic history is not consumed cross-domain today**, even though it exists as a truth artifact.
- **History era count is effectively fixed at 3** by current validation, despite the op contract allowing a wider range.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.ts` (`buildPlateTopology(plateIds, width, height, plateCount)`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts` (`validateTectonicHistoryArtifact`, `eraCount !== 3`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts` (publishes history; no downstream reads in standard recipe)

## Open Questions

Marking these explicitly avoids “silent drift” in canonical docs.

1. Should `artifact:foundation.plateTopology` be a **mesh-space truth** product derived from `foundation.plateGraph + foundation.mesh` (rather than tile-derived from `foundation.plates.id`)?
2. Is `artifact:foundation.plates` intended to remain a **Foundation-owned** projection, or should it be moved to an adapter/projection layer outside the Foundation domain?
3. Is the effective invariant “tectonic history uses exactly 3 eras” a deliberate contract, or should validation be relaxed to match `FoundationTectonicHistorySchema` (`eraCount <= 8`)?
4. Which downstream domain(s) should consume `artifact:foundation.tectonicHistory` (if any), and what is the minimal cross-domain contract for “age of orogeny” vs “recent activity”?
