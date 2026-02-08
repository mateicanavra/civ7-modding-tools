# agent-integration.md

## Objective

Trace the **integration surface** for Ecology in the standard recipe:

- Upstream dependencies: what Ecology requires from Morphology/Hydrology/Foundation (artifacts + any tags/effects), where those are read, and how they flow into ecology ops.
- Downstream consumers: which steps consume ecology artifacts/fields (map-ecology + any other stage/step), and any Studio/viz coupling to ecology `dataTypeKey`s.
- Hidden couplings: direct imports across domains, adapter calls outside map-ecology, and artifact reads/writes that are not declared.

## Where To Start (Pointers)

- Stage ordering (source of truth): `mods/mod-swooper-maps/src/recipes/standard/recipe.ts:28-43`
- Standard recipe reference: `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- Ecology truth stage: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/`
- Map-ecology projection stage: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/`
- Tag registry (fields/effects + owners): `mods/mod-swooper-maps/src/recipes/standard/tags.ts:8-99`
- Studio uses `dataTypeKey` as an opaque ID:
  - `apps/mapgen-studio/src/features/viz/dataTypeModel.ts:136-146`
  - `apps/mapgen-studio/src/features/viz/useVizState.ts:210-218`
  - Overlay suggestions list (no ecology keys today): `apps/mapgen-studio/src/recipes/overlaySuggestions.ts:10-39`

## Findings (Grounded)

### 1) Ecology’s Position in the Pipeline

Relevant stage order slice (standard recipe):

- `hydrology-climate-baseline` -> `hydrology-hydrography` -> `hydrology-climate-refine` -> `ecology` -> `map-ecology` -> `placement`

Source: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts:28-43`.

### 2) Upstream Dependencies (What Ecology Requires)

Ecology steps declare **artifact** dependencies (no dependency tags/effects are required/provided by ecology steps themselves):

- Each ecology step contract has `requires: []` and `provides: []`.
  Example: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts:7-15`.

Ecology’s upstream inputs (direct):

- Morphology topography: `artifact:morphology.topography` (fields: `landMask`, `elevation`)
- Hydrology climate field: `artifact:climateField` (fields: `rainfall`, `humidity`)
- Hydrology hydrography: `artifact:hydrology.hydrography` (field: `riverClass`)
- Hydrology cryosphere: `artifact:hydrology.cryosphere` (fields: `groundIce01`, `permafrost01`, `meltPotential01`)

Ecology’s upstream inputs (indirect Foundation coupling via Morphology):

- `artifact:morphology.topography` is seeded from Foundation crust + tectonic history/provenance in `morphology-coasts/landmass-plates`.
  - Contract requires Foundation artifacts: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts:15-26`.

#### 2.1) Upstream Artifact Provenance + Mutability

**Morphology topography is a publish-once handle that can be mutated in-place.**

- Schema explicitly calls out in-place mutation via `ctx.buffers.heightfield`.
  Source: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts.ts:3-25`.
- Topography initial publish happens in `morphology-coasts/landmass-plates`.
  - Builds topography from `context.buffers.heightfield` and publishes once:
    `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.ts:246-285` and `...:447-449`.
- Key pre-ecology in-place mutations:
  - `morphology-coasts/rugged-coasts` mutates `heightfield.landMask/elevation` (and bathymetry) while only providing `coastlineMetrics`.
    Evidence: requires topography `ruggedCoasts.contract.ts:14-17`, mutates buffers `ruggedCoasts.ts:162-213`.
  - `morphology-erosion/geomorphology` mutates elevation + bathymetry and restores landmask stability.
    Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/steps/geomorphology.ts:44-100`.
  - `morphology-features/islands` mutates landmask/elevation/bathymetry.
    Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/islands.ts:11-49`.

**Hydrology climate field is also a publish-once handle refined later in-place.**

- Artifact documentation: “buffer handle … may be refined later in-place.”
  Source: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/artifacts.ts:4-20`.
- `climate-baseline` writes via `writeClimateField` and publishes `context.buffers.climate` as `artifact:climateField`.
  Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/steps/climateBaseline.ts:1077-1090`.
- `climate-refine` writes refined rainfall/humidity via `writeClimateField`, but does not re-provide the artifact.
  - Contract requires but does not provide `climateField`: `climateRefine.contract.ts:32-44`.
  - In-place write loop: `climateRefine.ts:475-484`.

Implication: Ecology reads post-refine rainfall/humidity by reading the same artifact handle (`deps.artifacts.climateField.read`).

#### 2.2) Where Ecology Reads Upstream Artifacts (Steps) and How They Flow Into Ops

Ecology artifacts (outputs) are defined here:

- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:107-128`
  - `artifact:ecology.biomeClassification`
  - `artifact:ecology.soils` (pedology)
  - `artifact:ecology.resourceBasins`
  - `artifact:ecology.featureIntents`

Per-step upstream integration:

1) `ecology/pedology`

- Contract requires topography + climateField and provides pedology.
  Source: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts:7-18`.
- Implementation reads and passes into `ecology.ops.classifyPedology`:
  - inputs: `topography.landMask`, `topography.elevation`, `climateField.rainfall`, `climateField.humidity`
  - op call: `ops.classify(...)`
  Source: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/index.ts:16-31`.

2) `ecology/resource-basins`

- Contract requires pedology + topography + climateField; provides `resourceBasins`.
  Source: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts:7-23`.
- Implementation flows:
  - `planResourceBasins` gets `topography.landMask`, `pedology.fertility`, `pedology.soilType`, `climate.rainfall`, `climate.humidity`.
  - result then goes through `scoreResourceBasins`.
  Source: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/index.ts:16-36`.

3) `ecology/biomes`

- Contract requires climateField + cryosphere + topography + hydrography; provides biomeClassification.
  Source: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts:10-26`.
- Implementation reads:
  - climateField rainfall/humidity
  - topography landMask/elevation
  - hydrography riverClass
  - cryosphere groundIce/permafrost/meltPotential
  - derives latitude from `context.env.latitudeBounds`
  Then calls `ecology.ops.classifyBiomes`.
  Source: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts:18-40`.
- Cryosphere feeds ecology output:
  - publishes cryosphere fields into the biomeClassification artifact
  - computes `treeLine01` as `1 - permafrost01` (clamped)
  Source: `biomes/index.ts:42-46` and publish `biomes/index.ts:151-159`.

4) `ecology/biome-edge-refine` (hidden write)

- Contract requires biomeClassification + topography.
  Source: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts:6-16`.
- Implementation calls `ecology.ops.refineBiomeEdges` using `classification.biomeIndex` + `topography.landMask`, then mutates the already-published artifact in-place.
  Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts:27-45`.

5) `ecology/features-plan`

- Contract requires biomeClassification + pedology + hydrography + topography; provides featureIntents.
  Source: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:42-70`.
- Implementation reads those artifacts, then:
  - derives seed via `deriveStepSeed(context.env.seed, ...)`.
  - builds `navigableRiverMask` using `hydrography.riverClass[i] === 2`.
    Source: `features-plan/index.ts:94-107`.
  - calls either injected ops (`ops.vegetation/wetlands/reefs/ice`) OR directly invokes domain ops via a direct import (see hidden couplings).
    Source: `features-plan/index.ts:109-209`.
  - publishes `artifact:ecology.featureIntents`.
    Source: `features-plan/index.ts:267`.

### 3) Downstream Consumers (Who Uses Ecology Outputs)

#### 3.1) Map-Ecology Projection Steps (Truth -> Engine)

1) `map-ecology/plot-biomes`

- Consumes `artifact:ecology.biomeClassification` + `artifact:morphology.topography`.
  Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts:8-16`.
- Uses engine adapter:
  - binds biome symbols via `adapter.getBiomeGlobal(...)` (default mapping in helper).
    Source: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-biomes/helpers/engine-bindings.ts:27-49`.
  - applies biomes via `adapter.setBiomeType(...)`.
    Source: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.ts:27-45`.
- Requires engine field buffers:
  - throws if `context.fields.biomeId` or `context.fields.temperature` missing.
    Evidence: `plotBiomes.ts:21-25`.
- Provides tags:
  - `field:biomeId` and `effect:engine.biomesApplied`.
    Evidence: `plotBiomes.contract.ts:8-16`.

2) `map-ecology/features-apply`

- Consumes `artifact:ecology.featureIntents`.
  Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts:6-16`.
- Uses engine adapter:
  - resolves feature engine ids via `adapter.getFeatureTypeIndex(key)` for each `FEATURE_PLACEMENT_KEYS`.
    Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features/feature-keys.ts:15-28`.
  - applies placements using `adapter.canHaveFeature`, `adapter.setFeatureType`, then reifies by reading `adapter.getFeatureType`.
    Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features/apply.ts:23-72`.
  - post-apply: calls `adapter.validateAndFixTerrain()` and `adapter.recalculateAreas()`.
    Evidence: `features-apply/index.ts:50-112`.
- Provides tags:
  - `field:featureType` and `effect:engine.featuresApplied`.
    Evidence: `features-apply/contract.ts:6-13`.

3) `map-ecology/plot-effects`

- Contract requires `morphologyArtifacts.topography` + `ecologyArtifacts.biomeClassification`.
  Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts:7-17`.
- Implementation reads `biomeClassification` and `context.buffers.heightfield` (not topography), and uses `heightfield.elevation/landMask` as op inputs.
  Evidence: `plot-effects/index.ts:11-17` and `plot-effects/inputs.ts:22-34`.
- Applies to engine via:
  - `adapter.getPlotEffectTypeIndex(key)` and `adapter.addPlotEffect(...)`.
    Evidence: `plot-effects/apply.ts:10-37`.
- Provides no effect tag today.
  Evidence: `plot-effects/contract.ts:7-24`.

#### 3.2) Other Downstream Stage Dependencies (Tags/Effects)

Placement doesn’t read ecology truth artifacts directly in the standard recipe, but it *does* require engine effects produced by map-ecology.

- `placement/derive-placement-inputs` requires:
  - `effect:engine.featuresApplied` (from `map-ecology/features-apply`)
  - `effect:engine.riversModeled` (from `map-hydrology/plot-rivers`)
  Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/derive-placement-inputs/contract.ts:10-20`.

Tag IDs and owners are centralized in `mods/mod-swooper-maps/src/recipes/standard/tags.ts:8-99`.

### 4) Studio/viz Consumers of Ecology `dataTypeKey`s

Ecology (truth) and map-ecology (projection) emit the following `dataTypeKey`s:

Ecology truth keys:

- `ecology.pedology.soilType`, `ecology.pedology.fertility`:
  `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/index.ts:33-53`
- `ecology.resourceBasins.resourceBasinId`:
  `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/index.ts:48-59`
- `ecology.biome.vegetationDensity`, `ecology.biome.effectiveMoisture`:
  `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts:48-65`
- `ecology.biome.surfaceTemperature`, `ecology.biome.aridityIndex`, `ecology.biome.freezeIndex`:
  `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts:66-101`
- `ecology.biome.groundIce01`, `ecology.biome.permafrost01`, `ecology.biome.meltPotential01`, `ecology.biome.treeLine01`:
  `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts:102-149`
- `ecology.biome.biomeIndex`:
  `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts:47-62`
- `ecology.featureIntents.featureType`:
  `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:249-265`

Map-ecology keys:

- `map.ecology.biomeId`, `map.ecology.temperature`:
  `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.ts:47-70`
- `map.ecology.featureType`:
  `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/index.ts:36-49`
- `map.ecology.plotEffects.plotEffect`:
  `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/index.ts:29-58`

Studio coupling notes:

- Studio uses `layer.dataTypeKey` as the stable `DataTypeId` key (opaque string), and shows meta label/group when present.
  Evidence: `apps/mapgen-studio/src/features/viz/dataTypeModel.ts:136-146`.
- Overlay selection matches by string equality on `dataTypeKey`.
  Evidence: `apps/mapgen-studio/src/features/viz/useVizState.ts:210-218`.
- Studio overlay suggestions currently enumerate only Foundation/Morphology keys (no ecology keys).
  Evidence: `apps/mapgen-studio/src/recipes/overlaySuggestions.ts:10-39`.

## Hidden Couplings / Surprises

1) Publish-once-but-mutable handle semantics are relied upon across domains.

- Morphology topography mutates after initial publish (before ecology consumes it):
  `morphology/artifacts.ts:3-25`, `ruggedCoasts.ts:162-213`, `geomorphology.ts:44-100`, `islands.ts:11-49`.
- Hydrology climateField is refined in-place by climate-refine after baseline publish:
  `hydrology-climate-baseline/artifacts.ts:4-20`, `climateBaseline.ts:1077-1090`, `climateRefine.ts:475-484`.
- Ecology biomeClassification is refined in-place by `biome-edge-refine`:
  `biome-edge-refine/index.ts:27-45`.

2) Direct cross-domain imports bypass the step contract boundary.

- `ecology/features-plan` imports `@mapgen/domain/ecology/ops` and uses internal `normalize/run` directly.
  Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:69-90` and `...:109-188`.
- `ecology/features-plan` imports a hydrology recipe helper (`computeRiverAdjacencyMaskFromRiverClass`) from another stage.
  Evidence: `features-plan/index.ts:8`.

3) `map-ecology/plot-effects` contract vs implementation mismatch.

- Declares it requires topography, but actually reads `context.buffers.heightfield`.
  Evidence: `plot-effects/contract.ts:7-17` vs `plot-effects/index.ts:11-16`.

4) Field buffer coupling not expressed in tags.

- `plot-biomes` requires `context.fields.temperature` in addition to `context.fields.biomeId`.
  Evidence: `plotBiomes.ts:21-25` (but contract provides only `field:biomeId` and `effect:engine.biomesApplied`).

5) Potential dead/unused truth outputs.

- `artifact:ecology.resourceBasins` is published, but no downstream reads were found in `mods/mod-swooper-maps/src`.
  Evidence: publish `resource-basins/index.ts:61-62`.

## Open Questions

- Should `artifact:ecology.resourceBasins` be consumed by Placement (resources/regions), or is it intentionally “diagnostic-only” for now?
- Should `map-ecology/plot-effects` provide an effect tag if anything downstream should depend on plot-effects being applied?
- Is “in-place refinement” a first-class contract we want for ecology artifacts (mirroring hydrology’s `climateField`), or should we move to immutable snapshots + explicit re-publish?
- Should advanced feature placement strategies be routed through injected contract ops instead of direct domain imports (to keep the contract boundary real)?

## Suggested Refactor Shapes (Conceptual Only)

- Make handle-mutation explicit in contracts (e.g., a `mutates` list or explicit “republish”) to avoid accidental assumptions of immutability.
- Consolidate engine-binding logic for ecology projection (biomes/features/plot effects) behind a single adapter boundary module.
- Keep Studio generic: treat `dataTypeKey` as a stable ID, and centralize any curated overlays/suggestions without hardcoding ecology keys unless needed.
