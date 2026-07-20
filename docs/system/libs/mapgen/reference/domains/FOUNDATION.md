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
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/rules/project-plates.ts` (`projectPlatesFromModel`, `tileToCellIndex` construction)

## Contract

### Requires

FOUNDATION does not require upstream domain artifacts. It requires only:
- **map dimensions** (`width`, `height`) and wrap semantics for normalization and mesh construction
- **a deterministic seed source** (steps derive per-op `rngSeed` and pass it as pure data to ops)

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-mantle/steps/mesh/step.ts` (`ctxRandom`, `ctxRandomLabel`, `context.dimensions`)
- `mods/mod-swooper-maps/src/domain/foundation/model/policy/reference-area.ts` (`requireEnvDimensions`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-mesh/contract.ts` (`ComputeMeshContract.input`)

### Provides (artifacts + tags)

FOUNDATION provides the following artifact dependency tags (all `artifact:*`).

**Truth artifacts (mesh space)**
- `artifact:foundation.mesh`
- `artifact:foundation.mantlePotential`
- `artifact:foundation.mantleForcing`
- `artifact:foundation.crust`
- `artifact:foundation.plateMotion`
- `artifact:foundation.plateGraph`
- `artifact:foundation.tectonicSegments`
- `artifact:foundation.tectonicHistory`
- `artifact:foundation.tectonicProvenance`
- `artifact:foundation.tectonics`

**Projection artifacts (map-facing; tile space or derived from tile projections)**
- `artifact:map.foundationTileToCellIndex`
- `artifact:map.foundationCrustTiles`
- `artifact:map.foundationTectonicHistoryTiles`
- `artifact:map.foundationTectonicProvenanceTiles`
- `artifact:map.foundationPlates`
- `artifact:foundation.plateTopology`

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/artifacts/index.ts` (the Foundation domain artifact catalog)
- `mods/mod-swooper-maps/src/recipes/standard/artifacts/index.ts` (the Standard recipe projection artifact catalog)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-mantle/steps/mesh/config.ts` (`MeshStepContract.artifacts.provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-lithosphere/steps/crust/config.ts` (`CrustStepContract.artifacts.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-lithosphere/steps/plate-graph/config.ts` (`PlateGraphStepContract.artifacts.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/steps/tectonics/config.ts` (`TectonicsStepContract.artifacts.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-projection/steps/projection/config.ts` (`ProjectionStepContract.artifacts.requires/provides`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-projection/steps/plate-topology/config.ts` (`PlateTopologyStepContract.artifacts.requires/provides`)

### Value domains (enums / ranges)

Boundary regimes are represented by `BOUNDARY_TYPE` numeric codes:
- `0` = `none`
- `1` = `convergent`
- `2` = `divergent`
- `3` = `transform`

**Ground truth anchors**
- `packages/mapgen-core/src/lib/plates/boundary-type.ts` (`BOUNDARY_TYPE`)

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

### `artifact:foundation.mantlePotential` (truth; mesh space)

Canonical mantle forcing potential field. This is the first “physics” truth surface and the source for all downstream forcing and kinematics.

Shape highlights:
- `cellCount`: number of mesh cells
- `potential`: per-cell potential (normalized `-1..1`)
- `sourceType`, `sourceCell`, `sourceAmplitude`, `sourceRadius`: low-order mantle sources

**Ground truth anchors**
- `docs/projects/pipeline-realism/resources/spec/sections/mantle-forcing.md` (schema + derivation rules)
- `mods/mod-swooper-maps/src/domain/foundation/artifacts/mantle-potential.artifact.ts` (`Schema`)

### `artifact:foundation.mantleForcing` (truth; mesh space)

Derived mantle stress + forcing vector field. This is the canonical driver for plate motion, regime classification, and event emission.

Shape highlights:
- `stress`: per-cell stress proxy (`0..1`)
- `forcingU`, `forcingV`: per-cell forcing velocity components
- `forcingMag`: per-cell forcing magnitude (`0..1`)
- `upwellingClass`: per-cell `+1/-1/0` classification
- `divergence`: per-cell divergence (`-1..1`)

**Ground truth anchors**
- `docs/projects/pipeline-realism/resources/spec/sections/mantle-forcing.md` (schema + derivation rules)
- `mods/mod-swooper-maps/src/domain/foundation/artifacts/mantle-forcing.artifact.ts` (`Schema`)

### `artifact:foundation.crust` (truth; mesh space)

Per-mesh-cell lithosphere truth state plus derived drivers.

Truth state (all per mesh cell):
- `maturity` (f32): `0=basaltic lid`, `1=cratonic`
- `thickness` (f32): `0..1` crust thickness proxy
- `thermalAge` (u8): `0..255` thermal age
- `damage` (u8): `0..255` mechanical weakening

Derived drivers (all per mesh cell):
- `type` (u8): `0=oceanic`, `1=continental` (derived from `maturity`)
- `age` (u8): `0=new`, `255=ancient` (aliases `thermalAge`)
- `buoyancy` (f32): `0..1` proxy
- `baseElevation` (f32): `0..1` isostatic base elevation proxy
- `strength` (f32): `0..1` lithospheric strength proxy

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/contract.ts` (`FoundationCrustSchema`, `ComputeCrustContract`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts` (`computeCrust`)

### `artifact:foundation.plateMotion` (truth; mesh space)

Mantle-derived rigid plate kinematics (translation + rotation) with fit residual diagnostics.

Shape highlights:
- `plateCenterX`, `plateCenterY`: rotation center per plate (mesh space, unwrapped)
- `plateVelocityX`, `plateVelocityY`: translation per plate
- `plateOmega`: angular velocity per plate
- `plateFitRms`, `plateFitP90`, `plateQuality`: fit diagnostics per plate
- `cellFitError`: per-cell residual (`0..255`)

Mapping notes:
- `plateMotion` is derived from mantle forcing; plate graph remains kinematics-free metadata.

**Ground truth anchors**
- `docs/projects/pipeline-realism/resources/spec/sections/plate-motion.md` (schema + derivation rules)
- `mods/mod-swooper-maps/src/domain/foundation/artifacts/plate-motion.artifact.ts` (`Schema`)

### `artifact:foundation.plateGraph` (truth; mesh space)

Tectonic plate partition and seed metadata.

Shape highlights:
- `cellToPlate` (i16): plate id per mesh cell
- `plates[]`: per-plate metadata (`role`, `kind`, `seedX/Y`)

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
- The active era contract supports 5..8 eras; shipped configs currently use 5-era histories.

Key fields:
- `eras[]` (oldest→newest): per-era fields (`boundaryType`, `upliftPotential`, `riftPotential`, `shearStress`, `volcanism`, `fracture`)
- rollups: `upliftTotal`, `fractureTotal`, `volcanismTotal`, `upliftRecentFraction`, `lastActiveEra`

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history-rollups/contract.ts` (`FoundationTectonicHistorySchema`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history-rollups/index.ts` (`computeTectonicHistoryRollups`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/steps/tectonics/step.ts` (`historyResult` publication)

### `artifact:foundation.tectonicProvenance` (truth; mesh space)

Per-cell tracer history and provenance scalars across eras. This is the Lagrangian companion to `tectonicHistory`.

Shape highlights:
- `tracerIndex[era][cell]`: source cell index history
- `provenance.originEra`, `originPlateId`, `lastBoundaryEra/Type/Polarity/Intensity`, `crustAge`

**Ground truth anchors**
- `docs/projects/pipeline-realism/resources/spec/sections/history-and-provenance.md` (schema + invariants)
- `mods/mod-swooper-maps/src/domain/foundation/artifacts/tectonic-provenance.artifact.ts` (`Schema`)

### `artifact:foundation.tectonics` (truth; mesh space)

The “current drivers” tensor set used by downstream shaping. Includes a cumulative uplift channel intended to be the stable “total orogeny opportunity” signal.

Key fields (all u8 per mesh cell; `0..255`):
- `boundaryType` (BOUNDARY_TYPE)
- `upliftPotential`, `riftPotential`, `shearStress`, `volcanism`, `fracture`
- `cumulativeUplift`

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonics-current/contract.ts` (`FoundationTectonicsSchema`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonics-current/index.ts` (`computeTectonicsCurrent`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/rules/project-plates.ts` (`projectPlatesFromModel`, `baseUplift = tectonics.cumulativeUplift ?? tectonics.upliftPotential`)

### `artifact:map.foundationTileToCellIndex` (projection; tile space → mesh cell index)

Per-tile nearest mesh cell index. This is the canonical cross-walk used to sample mesh-space truth into tile-space projections.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/contract.ts` (output `tileToCellIndex` description)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/rules/project-plates.ts` (`tileToCellIndex`)

### `artifact:map.foundationCrustTiles` (projection; tile space)

Per-tile crust drivers sampled via `tileToCellIndex`.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/contract.ts` (`CrustTilesSchema`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/rules/project-plates.ts` (crust sampling loop)

### `artifact:map.foundationTectonicHistoryTiles` (projection; tile space)

Tile-space projection of per-era tectonic history fields and rollups. This is the primary Morphology-era driver surface.

Shape highlights:
- `perEra[]`: per-era boundary/regime + force tensors (tile space)
- `rollups`: uplift/volcanism/fracture totals + `lastActiveEra`

**Ground truth anchors**
- `docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md` (tile contract)
- `docs/projects/pipeline-realism/resources/spec/sections/history-and-provenance.md` (mesh truth → projection posture)
- `mods/mod-swooper-maps/src/recipes/standard/artifacts/foundation-tectonic-history-tiles.artifact.ts` (`Schema`)

### `artifact:map.foundationTectonicProvenanceTiles` (projection; tile space)

Tile-space projection of provenance/tracer scalars (origin era/plate, drift distance, last boundary signals).

Shape highlights:
- `originEra`, `originPlateId`: dominant material origin
- `driftDistance`: provenance travel proxy
- `lastBoundaryEra`, `lastBoundaryType`: most recent boundary activity

**Ground truth anchors**
- `docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md` (tile contract)
- `docs/projects/pipeline-realism/resources/spec/sections/history-and-provenance.md` (mesh truth → projection posture)
- `mods/mod-swooper-maps/src/recipes/standard/artifacts/foundation-tectonic-provenance-tiles.artifact.ts` (`Schema`)

### `artifact:map.foundationPlates` (projection; tile space)

Per-tile plate/tensor fields used by tile-based consumers (notably today’s Morphology stage).

Key fields (per tile):
- `id` (i16): plate id
- `boundaryCloseness` (u8): tile-distance proximity to a plate boundary (derived via tile plate-id adjacency)
- `boundaryType` (u8): sampled from mesh-space tectonics via `tileToCellIndex`
- `tectonicStress` (u8): derived `max(upliftPotential, riftPotential, shearStress)`
- `upliftPotential`, `riftPotential`, `shieldStability`, `volcanism` (u8)
- `movementU`, `movementV`, `rotation` (i8; `-127..127`) scaled from plate kinematics

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/artifacts/foundation-plates.artifact.ts` (`Schema`, artifact identity, and cardinality validator)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/contract.ts` (`PlatesTilesSchema`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/rules/project-plates.ts` (`projectPlatesFromModel`, `boundaryCloseness`, `tectonicStress`, motion scaling)

### `artifact:foundation.plateTopology` (derived; currently tile-derived)

Plate adjacency + centroid/area derived from the tile-space `foundation.plates.id` field.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-projection/steps/plate-topology/step.ts` (`buildPlateTopology`, `validateTopologySymmetry`)
- `packages/mapgen-core/src/lib/plates/topology.ts` (`buildPlateTopology`) (see `@swooper/mapgen-core/lib/plates` re-export)

## Operations

FOUNDATION ops are the domain’s compute units. The standard recipe wires them into steps (next section).

### Mesh and partition ops (truth)
- `foundation/compute-mesh` → `{ mesh }`
- `foundation/compute-crust` → `{ crust }`
- `foundation/compute-crust-evolution` → `{ crust }`
- `foundation/compute-mantle-potential` → `{ mantlePotential, sourceCount, sourceType, sourceCell, sourceAmplitude, sourceRadius }`
- `foundation/compute-mantle-forcing` → `{ mantleForcing, stress, forcingU, forcingV, forcingMag, upwellingClass }`
- `foundation/compute-plate-graph` → `{ plateGraph }`
- `foundation/compute-plate-motion` → `{ plateMotion }`
- `foundation/compute-tectonic-segments` → `{ segments }`

### Tectonic modeling ops (history + diagnostics)
- `foundation/compute-era-plate-membership` → `{ eraCount, plateIdByEra, eraWeights }`
- `foundation/compute-segment-events` → `{ events }`
- `foundation/compute-hotspot-events` → `{ events }`
- `foundation/compute-era-tectonic-fields` → `{ eraFields }`
- `foundation/compute-tectonic-history-rollups` → `{ tectonicHistory }`
- `foundation/compute-tectonics-current` → `{ tectonics }`
- `foundation/compute-tracer-advection` → `{ tracerIndex }`
- `foundation/compute-tectonic-provenance` → `{ tectonicProvenance }`

### Projection op (non-truth)
- `foundation/compute-plates-tensors` → `{ tileToCellIndex, crustTiles, plates }`

Legacy `foundation/compute-tectonic-history` used to act as a monolithic history + tectonics op. It has been removed so the `tectonics` step bonds only to the focused ops above; do not reintroduce an aggregate compatibility op.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/index.ts` (`defineDomain({ id: "foundation", ops })`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/contracts.ts` (`contracts`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/*/contract.ts` (`defineOp` contracts listed above)
- `mods/mod-swooper-maps/src/domain/foundation/ops/*/index.ts` (implementations listed above)

## Knobs & Normalization

### Stage-level knob (semantic scalar)

The standard recipe exposes one Foundation stage knob:

- `plateActivity`: a scalar in `[0..1]` owned by `foundation-tectonics`. The
  `tectonics` step converts it to `orogenyActivityGain`, which scales convergent
  uplift and subduction-volcanism emission after boundary-regime classification.
  `foundation-projection` has no knobs and materializes the resulting truth
  without reapplying activity scaling.

Plate count is authored in the public `meshResolution` and `platePartition`
operation config surfaces owned by `foundation-mantle` and
`foundation-lithosphere`; it is not a shared stage knob.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/index.ts` (`FoundationPlateActivityKnobSchema`, `knobsSchema` ownership)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/steps/tectonics/step.ts` (`normalize` applying `plateActivity` to `computeEraTectonicFields.orogenyActivityGain`)
- `mods/mod-swooper-maps/src/domain/foundation/model/policy/plate-activity.ts` (`resolvePlateActivityOrogenyMultiplier`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-projection/index.ts` (empty knob schema; projection-only ownership)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-public-config.ts` (`meshResolution` and `platePartition` public config ownership)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-mesh/index.ts` (`normalize` deriving `cellCount`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts` (`normalize` validating selected-map-size plate count)

### Op normalization (map-size validation)

Some op strategies normalize authored config using runtime dimensions:
- `foundation/compute-mesh` validates map dimensions and derives `cellCount`
- `foundation/compute-plate-graph` validates map dimensions before graph partitioning

Reference Area is not an authored config field. Foundation derives it exactly
from validated runtime map dimensions:
- `referenceArea = width * height`
- invalid, non-integer, zero, or unsafe dimensions fail at the Foundation boundary
- no synthetic fallback area is used

**Ground truth anchors**
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-mesh/index.ts` (`normalize` in default strategy)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts` (`normalize` in default strategy)
- `mods/mod-swooper-maps/src/domain/foundation/model/policy/reference-area.ts` (`requireEnvDimensions`, `deriveFoundationReferenceArea`)

## Current Mapping (Standard Recipe)

### Stage composition

In the standard recipe, FOUNDATION is authored as a **family of five sibling
recipe stages** (not one monolithic stage). Each stage is a composable node with
its own public config and fixed step surface; `foundation-tectonics` is the only
Foundation stage that currently exposes a stage-level knob. They share the
Foundation domain artifact catalog, the Standard recipe projection-artifact
catalog, and Foundation visualization helpers. The steps run in the same global order
as before — splitting the stage boundaries does not reorder steps, so generated
maps remain byte-identical (the RNG phase label stays `foundation`).

| # | Stage | Steps (in order) | Responsibility |
|---|-------|------------------|----------------|
| 1 | `foundation-mantle` | `mesh`, `mantle-potential`, `mantle-forcing` | Tectonic mesh + mantle-convection forcing field |
| 2 | `foundation-lithosphere` | `crust`, `plate-graph` | The static plate structure: initial crust + plate partition (what the plates *are*) |
| 3 | `foundation-tectonics` | `plate-motion`, `tectonics` | Plate kinematics + boundary regimes and activity-scaled multi-era tectonic truth (what the plates *do*) |
| 4 | `foundation-orogeny` | `crust-evolution` | Crust maturation over the tectonic history |
| 5 | `foundation-projection` | `projection`, `plate-topology` | Faithfully resample mesh-space truth onto the tile grid + derive tile plate adjacency |

`plateCount` is authored separately in the `foundation-mantle` mesh-resolution
config and the `foundation-lithosphere` plate-partition config; neither stage has
a knob. `plateActivity` belongs to `foundation-tectonics`, where the `tectonics`
step applies it to mesh-space era-field emission before publishing tectonic
truth. `foundation-projection` has no authored config or knobs and only
materializes that truth into tile-space artifacts. The `plate-motion` step lives
with `tectonics` (not `lithosphere`) so the shared `plateMotion` op config has
exactly one home: the kinematics it computes are re-used by the tectonics
per-era recompute.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-mantle/index.ts` (`createStage`, mantle steps, empty `knobsSchema`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-lithosphere/index.ts` (`createStage`, crust + plate-graph steps, empty `knobsSchema`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/index.ts` (`createStage`, `plateActivity` knob, plate-motion + tectonics steps)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/steps/tectonics/step.ts` (`normalize` applying the activity gain before tectonic truth publication)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-orogeny/index.ts` (`createStage`, crust-evolution)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-projection/index.ts` (`createStage`, projection + plate-topology, empty authored config and knob schemas)
- `mods/mod-swooper-maps/src/domain/foundation/artifacts/index.ts`, `mods/mod-swooper-maps/src/recipes/standard/artifacts/index.ts`, and `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/viz.ts` (shared artifact catalogs and visualization helpers)
- `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts` (`standardStageContractManifest` canonical stage and step order)

### Downstream consumption (today)

Downstream domains in the standard recipe primarily consume **tile projections**:
- Morphology reads `artifact:map.foundationPlates` and `artifact:map.foundationCrustTiles`

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmass-plates/step.ts` (`deps.artifacts.foundationPlates.read`, `deps.artifacts.foundationCrustTiles.read`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/rugged-coasts/step.ts` (`deps.artifacts.foundationPlates.read`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes/step.ts` (`deps.artifacts.foundationPlates.read`)

### Drift notes (target vs current)

This is the minimal drift worth calling out in a domain reference:
- **Plate topology is tile-derived today** (`foundation.plateTopology` is built from tile `plates.id`), even though plate adjacency is conceptually mesh-native.
- **Tectonic history is not consumed cross-domain today**, even though it exists as a truth artifact.

**Ground truth anchors**
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-projection/steps/plate-topology/step.ts` (`buildPlateTopology(plateIds, width, height, plateCount)`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/steps/tectonics/step.ts` (publishes history; no downstream reads in standard recipe)

## Open Questions

Marking these explicitly avoids “silent drift” in canonical docs.

1. Should `artifact:foundation.plateTopology` be a **mesh-space truth** product derived from `foundation.plateGraph + foundation.mesh` (rather than tile-derived from plate tensors)?
2. Which downstream domain(s) should consume `artifact:foundation.tectonicHistory` (if any), and what is the minimal cross-domain contract for “age of orogeny” vs “recent activity”?

## Ground truth anchors

This section is a navigation aid: concrete file paths that back the contract claims in this domain reference.
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-mesh/contract.ts` (`FoundationMeshSchema`, `ComputeMeshContract`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-mesh/index.ts` (`computeMesh`, call to `buildDelaunayMesh`)
- `packages/mapgen-core/src/lib/mesh/delaunay.ts` (`buildDelaunayMesh`, `DelaunayMesh`)

This page contains many inline “Ground truth anchors” callouts. This section collects the canonical entrypoints:

- Domain entrypoint + op ids: `mods/mod-swooper-maps/src/domain/foundation/index.ts`
- Standard recipe stage definitions (five sibling stages): `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-mantle/index.ts`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-lithosphere/index.ts`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/index.ts`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-orogeny/index.ts`, and `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-projection/index.ts`; canonical stage/step ordering: `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts`
- Foundation artifact module catalog (contracts paired with complete admission validators and artifact evidence): `mods/mod-swooper-maps/src/domain/foundation/artifacts/index.ts` (`artifactModules`, `artifacts`)

- Mesh construction (truth root):
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-mesh/contract.ts` (`ComputeMeshContract`, `FoundationMeshSchema`)
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-mesh/index.ts` (`computeMesh`)
  - `packages/mapgen-core/src/lib/mesh/delaunay.ts` (`buildDelaunayMesh`, `DelaunayMesh`)

- Plates + tectonics (truth + projection):
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts` (`ComputePlateGraphContract`, `FoundationPlateGraphSchema`)
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/contract.ts` (`ComputeTectonicSegmentsContract`, `FoundationTectonicSegmentsSchema`)
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-plate-membership/contract.ts` (`ComputeEraPlateMembershipContract`)
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-segment-events/contract.ts` (`ComputeSegmentEventsContract`)
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-hotspot-events/contract.ts` (`ComputeHotspotEventsContract`)
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-tectonic-fields/contract.ts` (`ComputeEraTectonicFieldsContract`)
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history-rollups/contract.ts` (`ComputeTectonicHistoryRollupsContract`, `FoundationTectonicHistorySchema`)
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonics-current/contract.ts` (`ComputeTectonicsCurrentContract`, `FoundationTectonicsSchema`)
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tracer-advection/contract.ts` (`ComputeTracerAdvectionContract`)
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-provenance/contract.ts` (`ComputeTectonicProvenanceContract`)
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/contract.ts` (`ComputePlatesTensorsContract`, `tileToCellIndex`)
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/rules/project-plates.ts` (`projectPlatesFromModel`, `tileToCellIndex`)

- Policy (truth vs projection posture): `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
