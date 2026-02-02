<toc>
  <item id="purpose" title="Purpose"/>
  <item id="stages" title="Stages (standard recipe)"/>
  <item id="truth-posture" title="Truth posture (mesh-first)"/>
  <item id="contract" title="Contract (requires/provides)"/>
  <item id="artifacts" title="Key artifacts"/>
  <item id="ops" title="Ops surface"/>
  <item id="config" title="Config + knobs posture"/>
  <item id="drift" title="Drift notes (current vs target)"/>
  <item id="anchors" title="Ground truth anchors"/>
  <item id="open-questions" title="Open questions"/>
</toc>

# Foundation domain

## Purpose

Foundation establishes the “physics substrate” for the run:
- a mesh / topology baseline,
- plate graph + tectonic tensors,
- and foundation projections needed by downstream simulation domains.

In the standard recipe, Foundation is the earliest stage and the primary source of “global-scale” structural signals.

## Stages (standard recipe)

Standard recipe stage(s):
- `foundation`

See: `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`.

## Truth posture (mesh-first)

Foundation is **mesh-first**:
- mesh-space artifacts are the canonical truth substrate,
- tile-space tensors exist as projections for downstream consumers that operate in tile space.

Invariant: tile-space projections must carry an explicit mapping from tile index → mesh cell index so downstream consumers never invent their own “nearest cell” logic.

## Contract (requires/provides)

At the standard recipe boundary, Foundation:

- Requires:
  - none (Foundation is the pipeline root).
- Provides:
  - Foundation artifacts (mesh / crust / plate graph / tectonics / plate tensors).

Truth vs projection posture:
- The `foundation` stage is treated as simulation truth production for downstream domains.
- Some “projection-like” work may exist internally (e.g., publishing tile-indexed plate tensors), but it is still part of the pipeline’s truth substrate.

## Key artifacts

Foundation artifacts are defined and published by the standard recipe (content-owned):

- `artifact:foundation.mesh` (mesh + adjacency)
- `artifact:foundation.crust` / `artifact:foundation.crustTiles`
- `artifact:foundation.plateGraph`
- `artifact:foundation.tectonics`
- `artifact:foundation.plates`
- `artifact:foundation.tileToCellIndex`

Additional Foundation artifacts exist in the stage implementation (currently content-owned and not exported as `@swooper/mapgen-core` tags), e.g.:
- `artifact:foundation.tectonicSegments`
- `artifact:foundation.tectonicHistory`
- `artifact:foundation.plateTopology`

## Ops surface

Foundation’s domain ops contracts are defined in the Foundation domain package and bound by step contracts.

Key op contracts (non-exhaustive):
- `computeMesh`
- `computeCrust`
- `computePlateGraph`
- `computeTectonicSegments`
- `computeTectonicHistory`
- `computePlatesTensors`

## Config + knobs posture

Foundation is authored as a stage with:
- a strict public schema containing an optional `advanced` config baseline (per step), and
- author-facing knobs that apply as deterministic transforms over the baseline.

Knobs (standard recipe):
- `plateCount`
- `plateActivity`

## Drift notes (current vs target)

These are the drift points that affect how consumers should reason about Foundation contracts today:

- `artifact:foundation.plateTopology` is currently derived from **tile** `foundation.plates.id` (projection-derived), even though plate adjacency is conceptually mesh-native.
- `artifact:foundation.tectonicHistory.eraCount` is currently validated as exactly `3` in the standard recipe’s artifact validation layer.

## Ground truth anchors

- Stage definition (knobs + step list): `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`
- Step contracts (requires/provides/artifacts/ops):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mesh.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crust.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateGraph.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.contract.ts`
- Artifact definitions and tags:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts`
  - `packages/mapgen-core/src/core/types.ts` (artifact tag constants)
- Tile→mesh cross-walk:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts` (`validateTileToCellIndexArtifact`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts` (publishes tile-space projections)
- Drift anchors:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.ts` (tile-derived topology)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts` (`validateTectonicHistoryArtifact` era count)
- Domain ops contracts + implementations:
  - `mods/mod-swooper-maps/src/domain/foundation/ops/contracts.ts`
  - `mods/mod-swooper-maps/src/domain/foundation/ops/index.ts`

## Open questions

- What is the intended stable public contract surface for the “extra” Foundation artifacts (tectonicSegments / tectonicHistory / plateTopology)? Today they are content-owned tags; do we want them re-exported from `@swooper/mapgen-core` as canonical tags?
