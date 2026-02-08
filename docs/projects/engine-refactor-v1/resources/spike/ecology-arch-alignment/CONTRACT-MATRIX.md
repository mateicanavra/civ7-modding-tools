# CONTRACT MATRIX: Ecology (Current-State + Feasibility Notes)

Purpose:
- provide a single “at a glance” mapping of **steps ↔ ops ↔ artifacts/buffers ↔ tags/effects ↔ viz keys ↔ determinism touchpoints**
- highlight feasibility-stage “hard seams” that Phase 3 must explicitly address

This is **reference** content (not sequencing, not implementation tasks).

## Stage: `ecology` (Truth)

Stage module:
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts`

### Step: `pedology`

- Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts`
- Phase: `ecology`
- Artifacts:
  - requires:
    - `morphologyArtifacts.topography` (`artifact:morphology.topography`)
    - `hydrologyClimateBaselineArtifacts.climateField` (`artifact:hydrology.climateField`)
  - provides:
    - `ecologyArtifacts.pedology` (`artifact:ecology.soils`)
- Ops (declared):
  - `classify` → `ecology/pedology/classify` (`kind: compute`)
- Determinism:
  - no explicit step seed
- Viz keys:
  - `ecology.pedology.soilType`
  - `ecology.pedology.fertility`

### Step: `resource-basins`

- Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts`
- Phase: `ecology`
- Artifacts:
  - requires:
    - `ecologyArtifacts.pedology` (`artifact:ecology.soils`)
    - `morphologyArtifacts.topography` (`artifact:morphology.topography`)
    - `hydrologyClimateBaselineArtifacts.climateField` (`artifact:hydrology.climateField`)
  - provides:
    - `ecologyArtifacts.resourceBasins` (`artifact:ecology.resourceBasins`)
- Ops (declared):
  - `plan` → `ecology/resources/plan-basins` (`kind: plan`)
  - `score` → `ecology/resources/score-balance` (`kind: score`)
- Determinism:
  - no explicit step seed
- Viz keys:
  - `ecology.resourceBasins.resourceBasinId`

### Step: `biomes`

- Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts`
- Phase: `ecology`
- Artifacts:
  - requires:
    - `hydrologyClimateBaselineArtifacts.climateField` (`artifact:hydrology.climateField`)
    - `hydrologyClimateRefineArtifacts.cryosphere` (`artifact:hydrology.cryosphere`)
    - `morphologyArtifacts.topography` (`artifact:morphology.topography`)
    - `hydrologyHydrographyArtifacts.hydrography` (`artifact:hydrology.hydrography`)
  - provides:
    - `ecologyArtifacts.biomeClassification` (`artifact:ecology.biomeClassification`)
- Ops (declared):
  - `classify` → `ecology/biomes/classify` (`kind: compute`)
- Determinism:
  - no explicit step seed (op may include noise; if seeded, it must be explicit in inputs)
- Viz keys:
  - `ecology.biome.vegetationDensity`
  - `ecology.biome.effectiveMoisture`
  - `ecology.biome.surfaceTemperature`
  - `ecology.biome.aridityIndex`
  - `ecology.biome.freezeIndex`
  - `ecology.biome.groundIce01`
  - `ecology.biome.permafrost01`
  - `ecology.biome.meltPotential01`
  - `ecology.biome.treeLine01`

### Step: `biome-edge-refine`

- Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts`
- Phase: `ecology`
- Artifacts:
  - requires:
    - `ecologyArtifacts.biomeClassification` (`artifact:ecology.biomeClassification`)
    - `morphologyArtifacts.topography` (`artifact:morphology.topography`)
  - provides: none
  - mutability posture:
    - `artifact:ecology.biomeClassification.biomeIndex` is refined **in-place** after publish
- Ops (declared):
  - `refine` → `ecology/biomes/refine-edge` (`kind: compute`)
- Determinism:
  - no explicit step seed
- Viz keys:
  - `ecology.biome.biomeIndex`

### Step: `features-plan`

- Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts`
- Phase: `ecology`
- Artifacts:
  - requires:
    - `ecologyArtifacts.biomeClassification` (`artifact:ecology.biomeClassification`)
    - `ecologyArtifacts.pedology` (`artifact:ecology.soils`)
    - `hydrologyHydrographyArtifacts.hydrography` (`artifact:hydrology.hydrography`)
    - `morphologyArtifacts.topography` (`artifact:morphology.topography`)
  - provides:
    - `ecologyArtifacts.featureIntents` (`artifact:ecology.featureIntents`)
- Ops (declared; injected):
  - `vegetation` → `ecology/features/plan-vegetation` (`kind: plan`)
  - `wetlands` → `ecology/features/plan-wetlands` (`kind: plan`)
  - `reefs` → `ecology/features/plan-reefs` (`kind: plan`)
  - `ice` → `ecology/features/plan-ice` (`kind: plan`)
- Extra planners (currently used, but **not** declared/injected; this is drift):
  - `ecology/features/vegetated-placement` (`kind: plan`) via direct import of `@mapgen/domain/ecology/ops`
  - `ecology/features/wet-placement` (`kind: plan`) via direct import of `@mapgen/domain/ecology/ops`
- Determinism:
  - `deriveStepSeed(..., "ecology:planFeatureIntents")`
- Viz keys:
  - `ecology.featureIntents.featureType`
- Feasibility note:
  - This step is the main contract seam for Phase 3 (compiler-owned envelope normalization + atomic per-feature op split + config compatibility).

## Stage: `map-ecology` (Gameplay / Projection + Materialization)

Stage module:
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`

Relevant tags registry:
- `mods/mod-swooper-maps/src/recipes/standard/tags.ts`

### Step: `plot-biomes`

- Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts`
- Phase: `gameplay`
- Provides (tags/effects):
  - `field:biomeId`
  - `effect:engine.biomesApplied` (via `ENGINE_EFFECT_TAGS.biomesApplied`)
- Artifacts:
  - requires:
    - `ecologyArtifacts.biomeClassification` (`artifact:ecology.biomeClassification`)
    - `morphologyArtifacts.topography` (`artifact:morphology.topography`)
- Ops:
  - none (step-owned adapter/materialization logic)
- Viz keys:
  - `map.ecology.biomeId`
  - `map.ecology.temperature`

### Step: `features-apply`

- Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts`
- Phase: `gameplay`
- Provides (tags/effects):
  - `field:featureType`
  - `effect:engine.featuresApplied` (via `ENGINE_EFFECT_TAGS.featuresApplied`)
- Artifacts:
  - requires:
    - `ecologyArtifacts.featureIntents` (`artifact:ecology.featureIntents`)
- Ops (declared; injected):
  - `apply` → `ecology/features/apply` (`kind: plan`)
- Viz keys:
  - `map.ecology.featureType`
  - (debug overlays) `debug.heightfield.terrain`, `debug.heightfield.landMask`

### Step: `plot-effects`

- Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts`
- Phase: `gameplay`
- Provides (tags/effects):
  - currently none (feasibility-stage recommendation: introduce an explicit effect tag)
- Artifacts:
  - requires:
    - `morphologyArtifacts.topography` (`artifact:morphology.topography`)
    - `ecologyArtifacts.biomeClassification` (`artifact:ecology.biomeClassification`)
- Ops (declared; injected):
  - `plotEffects` → `ecology/plot-effects/placement` (`kind: plan`)
- Determinism:
  - input seed derived in `plot-effects/inputs.ts` via `deriveStepSeed(..., "ecology:planPlotEffects")`
- Viz keys:
  - `map.ecology.plotEffects.plotEffect`
- Feasibility note:
  - adapter-write boundary without effect tagging; decide + lock.

