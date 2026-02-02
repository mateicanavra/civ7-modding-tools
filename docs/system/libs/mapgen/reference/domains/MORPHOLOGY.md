<toc>
  <item id="purpose" title="Purpose"/>
  <item id="stages" title="Stages (standard recipe)"/>
  <item id="contract" title="Contract (requires/provides)"/>
  <item id="artifacts" title="Key artifacts"/>
  <item id="ops" title="Ops surface"/>
  <item id="config" title="Config + knobs posture"/>
  <item id="projection" title="Map projection notes (map-morphology)"/>
  <item id="drift" title="Drift notes (current vs target)"/>
  <item id="anchors" title="Ground truth anchors"/>
  <item id="open-questions" title="Open questions"/>
</toc>

# Morphology domain

## Purpose

Morphology turns Foundation’s tectonic substrate into terrain truth products:
- landmask + elevation/bathymetry,
- coastline metrics,
- flow routing buffers and substrate buffers,
- volcano / landmass decompositions,
and related intermediate signals that downstream domains (Hydrology/Ecology) consume.

Morphology also owns the primary “engine-facing” elevation/coastline/etc. projection steps (via the `map-morphology` stage), which are explicitly **projection-only**.

## Stages (standard recipe)

Truth stages:
- `morphology-pre`
- `morphology-mid`
- `morphology-post`

Projection stage:
- `map-morphology`

See: `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`.

## Contract (requires/provides)

At the standard recipe boundary, Morphology:

- Requires:
  - Foundation plate + crust artifacts (to seed landmass/topography truth).
- Provides (truth artifacts):
  - `artifact:morphology.topography`
  - `artifact:morphology.substrate`
  - `artifact:morphology.routing`
  - `artifact:morphology.coastlineMetrics`
  - `artifact:morphology.landmasses`
  - `artifact:morphology.volcanoes`

Mutation posture:
- Several morphology steps publish “buffer handles” once and then mutate them in-place later (see the artifact schemas’ descriptions and the artifact mutation policy).

## Key artifacts

Morphology truth artifacts are defined by the standard recipe stage:
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/artifacts.ts`

Projection artifacts used by later stages:
- `artifact:map.projectionMeta`
- `artifact:map.landmassRegionSlotByTile`

These are authored in the standard recipe (Placement stage), but depend on Morphology truth.

## Ops surface

Morphology domain ops are bound by step contracts. Common ops used in the standard recipe include:
- `computeSubstrate`
- `computeBaseTopography`
- `computeSeaLevel`
- `computeLandmask`
- `computeCoastlineMetrics`
- `computeFlowRouting`
- `computeGeomorphicCycle`
- `planIslandChains`
- `planVolcanoes`
- `computeLandmasses`

## Config + knobs posture

Morphology uses:
- a strict public schema containing an optional `advanced` config baseline (per step) for the truth stages, with knobs applied last as deterministic transforms.
- a separate strict public schema for `map-morphology` projection config.

Knobs (non-exhaustive; standard recipe):
- `seaLevel` (morphology-pre)
- `erosion`, `coastRuggedness` (morphology-mid)
- `volcanism` (morphology-post)
- `orogeny` (map-morphology)

## Map projection notes (map-morphology)

The `map-morphology` stage:
- is `phase: "gameplay"` (projection-only),
- consumes Morphology truth artifacts (e.g., topography, coastline metrics),
- publishes effect tags like `effect:map.*` for dependency gating,
- and must not be treated as Morphology truth.

Invariant: projection steps must not drift land/water classification. When projection steps mutate the engine adapter state, `context.adapter.isWater(x,y)` must remain consistent with the Morphology truth land mask.

## Drift notes (current vs target)

These are drift points that matter to domain consumers and to documentation correctness:

- Elevation units/datum: `artifact:morphology.topography.elevation` is documented as “integer meters”, but some Morphology configuration and quantization paths describe “normalized units” scaled by a constant. This should be unified into one canonical contract.
- Coast distance duplication: some Morphology ops produce a distance-to-coast output, but the standard recipe’s canonical published distance field currently lives under `artifact:morphology.coastlineMetrics.distanceToCoast`.

## Ground truth anchors

- Stage definitions (knobs + step list):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/index.ts`
- Morphology truth artifact definitions: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/artifacts.ts`
- Example step contracts:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/ruggedCoasts.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/routing.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/geomorphology.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/volcanoes.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/landmasses.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotCoasts.contract.ts`
- Projection invariants:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/assertions.ts` (`assertNoWaterDrift`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotCoasts.ts` (calls `assertNoWaterDrift`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotContinents.ts` (calls `assertNoWaterDrift`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.ts` (calls `assertNoWaterDrift`)
- Drift anchors:
  - `mods/mod-swooper-maps/src/domain/morphology/config.ts` (normalized-unit posture in config schemas)
  - `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/rules/index.ts` (elevation scaling constant)
- Policy: artifact mutation posture: `docs/system/libs/mapgen/policies/ARTIFACT-MUTATION.md`
- Policy: truth vs projection: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`

## Open questions

- Which Morphology truth artifacts are intended to be part of a stable cross-package contract surface (re-exported tag constants), vs content-owned only?
