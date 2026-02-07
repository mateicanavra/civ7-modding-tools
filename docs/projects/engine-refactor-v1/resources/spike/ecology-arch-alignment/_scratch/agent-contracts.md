# agent-contracts.md

## Objective

Inventory the **ecology + map-ecology** contract surface (artifacts, steps, ops) and call out **implementation/contract misalignments** ("contract breaks") for the engine-refactor-v1 spike.

Axis: **Contracts**.

## Source Pointers

- Ecology artifacts + validation:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts` (artifact ids + schemas). (e.g. `ecologyArtifacts.*` @ `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:107-128`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifact-validation.ts` (runtime validators for typed-array payloads; stricter than the `Type.Any()` schemas). (e.g. biome classification validator @ `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifact-validation.ts:51-96`)
- Ecology step contracts + implementations:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/**/contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/**/index.ts`
- Map-ecology step contracts + implementations:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/**/contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/**/index.ts`
- Op contracts:
  - `mods/mod-swooper-maps/src/domain/ecology/ops/contracts.ts` (canonical op registry). (`mods/mod-swooper-maps/src/domain/ecology/ops/contracts.ts:20-39`)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/**/contract.ts` (op id/kind/strategies + schemas)
- Tags/effects:
  - `mods/mod-swooper-maps/src/recipes/standard/tags.ts` (dependency/effect tag catalog). (`mods/mod-swooper-maps/src/recipes/standard/tags.ts:8-36`)
- Heightfield dependency grounding (for map-ecology plot-effects):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.contract.ts` (provides `effect:map.elevationBuilt`). (`mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.contract.ts:6-14`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.ts` (uses `context.buffers.heightfield`). (`mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.ts:23-25`)

## Ecology Artifacts Inventory (Truth + Projection)

Artifact keys/ids are defined in `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:107-128`.

| Artifact key | Artifact id | Role | Schema / Definition | Produced by step(s) | Consumed by step(s) |
|---|---|---|---|---|---|
| `ecologyArtifacts.biomeClassification` | `artifact:ecology.biomeClassification` | Truth (tile classification + derived fields) | Schema: `BiomeClassificationArtifactSchema` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:4-20`). Definition: (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:107-112`) | `ecology/biomes` provides + publishes (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts:10-26`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts:151-162`). Also **mutated in-place** by `ecology/biome-edge-refine` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts:26-46`). | `ecology/biome-edge-refine` requires (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts:6-16`). `ecology/features-plan` requires (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:42-55`). `gameplay/plot-biomes` requires (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts:8-16`). `gameplay/plot-effects` requires (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts:7-17`). |
| `ecologyArtifacts.pedology` | `artifact:ecology.soils` | Truth (tile soil class + fertility) | Schema: `PedologyArtifactSchema` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:24-32`). Definition: (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:113-117`) | `ecology/pedology` provides + publishes (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts:7-24`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/index.ts:55-60`). | `ecology/resource-basins` requires (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts:7-23`). `ecology/features-plan` requires (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:42-55`). |
| `ecologyArtifacts.resourceBasins` | `artifact:ecology.resourceBasins` | Projection-ish (placement-oriented basin plan) | Schema: `ResourceBasinsArtifactSchema` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:36-51`). Definition: (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:118-122`) | `ecology/resource-basins` provides + publishes (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts:7-23`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/index.ts:61`). | No consumer references found in standard stages (only definition + producer references: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:118-122`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts:7-23`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/index.ts:61`). |
| `ecologyArtifacts.featureIntents` | `artifact:ecology.featureIntents` | Projection (engine-facing feature placement intents) | Schema: `FeatureIntentsArtifactSchema` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:55-103`). Definition: (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:123-127`) | `ecology/features-plan` provides + publishes (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:42-71`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:63-68`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:267-268`). | `gameplay/features-apply` requires (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts:6-16`, `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/index.ts:11-19`). |

## Step Contract Inventory (Ecology + Map-Ecology)

Contract fields of interest here:

- `phase`: boundary between truth (`"ecology"`) and projection (`"gameplay"`). (e.g. `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts:10-13`, `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts:8-12`)
- `artifacts.requires/provides`: declared artifact reads/writes.
- `requires/provides`: dependency tags / effect tags (map/engine projection surface). (e.g. `mods/mod-swooper-maps/src/recipes/standard/tags.ts:8-36`)

| Step id | Phase | Artifacts requires | Artifacts provides | Tags requires | Tags provides | Declared ops (contract) |
|---|---|---|---|---|---|---|
| `pedology` | `ecology` | `morphologyArtifacts.topography`, `hydrologyClimateBaselineArtifacts.climateField` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts:7-15`) | `ecologyArtifacts.pedology` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts:12-15`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts:8-12`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts:8-12`) | `classify: ecology.ops.classifyPedology` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts:16-18`) |
| `resource-basins` | `ecology` | `ecologyArtifacts.pedology`, `morphologyArtifacts.topography`, `hydrologyClimateBaselineArtifacts.climateField` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts:7-18`) | `ecologyArtifacts.resourceBasins` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts:18-19`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts:8-12`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts:8-12`) | `plan: ecology.ops.planResourceBasins`, `score: ecology.ops.scoreResourceBasins` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts:20-23`) |
| `biomes` | `ecology` | `hydrologyClimateBaselineArtifacts.climateField`, `hydrologyClimateRefineArtifacts.cryosphere`, `morphologyArtifacts.topography`, `hydrologyHydrographyArtifacts.hydrography` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts:15-23`) | `ecologyArtifacts.biomeClassification` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts:15-23`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts:11-15`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts:11-15`) | `classify: ecology.ops.classifyBiomes` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts:24-26`) |
| `biome-edge-refine` | `ecology` | `ecologyArtifacts.biomeClassification`, `morphologyArtifacts.topography` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts:6-16`) | `[]` (none declared) (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts:9-13`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts:7-11`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts:7-11`) | `refine: ecology.ops.refineBiomeEdges` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts:14-16`) |
| `features-plan` | `ecology` | `ecologyArtifacts.biomeClassification`, `ecologyArtifacts.pedology`, `hydrologyHydrographyArtifacts.hydrography`, `morphologyArtifacts.topography` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:42-55`) | `ecologyArtifacts.featureIntents` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:54-55`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:43-47`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:43-47`) | `vegetation: ecology.ops.planVegetation`, `wetlands: ecology.ops.planWetlands`, `reefs: ecology.ops.planReefs`, `ice: ecology.ops.planIce` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:56-61`) |
| `plot-biomes` | `gameplay` | `ecologyArtifacts.biomeClassification`, `morphologyArtifacts.topography` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts:8-16`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts:13-16`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts:8-12`) | `field:biomeId`, `effect:engine.biomesApplied` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts:11-13`, `mods/mod-swooper-maps/src/recipes/standard/tags.ts:8-25`) | (none) |
| `features-apply` | `gameplay` | `ecologyArtifacts.featureIntents` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts:6-16`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts:11-13`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts:7-10`) | `field:featureType`, `effect:engine.featuresApplied` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts:9-11`, `mods/mod-swooper-maps/src/recipes/standard/tags.ts:8-25`) | `apply: ecology.ops.applyFeatures` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts:14-16`) |
| `plot-effects` | `gameplay` | `morphologyArtifacts.topography`, `ecologyArtifacts.biomeClassification` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts:7-17`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts:10-14`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts:8-12`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts:8-12`) | `plotEffects: ecology.ops.planPlotEffects` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts:15-17`) |

## Op Contract Inventory (Ecology Ops)

Canonical op registry keys are in `mods/mod-swooper-maps/src/domain/ecology/ops/contracts.ts:20-39`.

| Op registry key | Op id (string) | Kind | Strategies | Contract file |
|---|---|---|---|---|
| `classifyBiomes` | `ecology/biomes/classify` | `compute` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/contract.ts:14-64` |
| `classifyPedology` | `ecology/pedology/classify` | `compute` | `default`, `coastal-shelf`, `orogeny-boosted` | `mods/mod-swooper-maps/src/domain/ecology/ops/pedology-classify/contract.ts:3-60` |
| `aggregatePedology` | `ecology/pedology/aggregate` | `compute` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/pedology-aggregate/contract.ts:4-31` |
| `planResourceBasins` | `ecology/resources/plan-basins` | `plan` | `default`, `hydro-fluvial`, `mixed` | `mods/mod-swooper-maps/src/domain/ecology/ops/resource-plan-basins/contract.ts:3-65` |
| `scoreResourceBasins` | `ecology/resources/score-balance` | `score` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/resource-score-balance/contract.ts:4-94` |
| `refineBiomeEdges` | `ecology/biomes/refine-edge` | `compute` | `default`, `morphological`, `gaussian` | `mods/mod-swooper-maps/src/domain/ecology/ops/refine-biome-edges/contract.ts:3-31` |
| `planAquaticFeaturePlacements` | `ecology/features/aquatic-placement` | `plan` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/plan-aquatic-feature-placements/contract.ts:46-76` |
| `planIceFeaturePlacements` | `ecology/features/ice-placement` | `plan` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/plan-ice-feature-placements/contract.ts:28-59` |
| `planPlotEffects` | `ecology/plot-effects/placement` | `plan` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/plan-plot-effects/contract.ts:112-143` |
| `planReefEmbellishments` | `ecology/features/reef-embellishments` | `plan` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/plan-reef-embellishments/contract.ts:20-46` |
| `planVegetatedFeaturePlacements` | `ecology/features/vegetated-placement` | `plan` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/plan-vegetated-feature-placements/contract.ts:75-115` |
| `planVegetationEmbellishments` | `ecology/features/vegetation-embellishments` | `plan` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/plan-vegetation-embellishments/contract.ts:44-78` |
| `planWetFeaturePlacements` | `ecology/features/wet-placement` | `plan` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/plan-wet-feature-placements/contract.ts:63-103` |
| `planVegetation` | `ecology/features/plan-vegetation` | `plan` | `default`, `clustered` | `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-vegetation/contract.ts:4-38` |
| `planWetlands` | `ecology/features/plan-wetlands` | `plan` | `default`, `delta-focused` | `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-wetlands/contract.ts:4-35` |
| `planReefs` | `ecology/features/plan-reefs` | `plan` | `default`, `shipping-lanes` | `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-reefs/contract.ts:4-28` |
| `planIce` | `ecology/features/plan-ice` | `plan` | `default`, `continentality` | `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-ice/contract.ts:4-59` |
| `applyFeatures` | `ecology/features/apply` | `plan` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/features-apply/contract.ts:5-52` |

## Contract Breaks List (Observed)

### Step uses op not declared in its contract `ops`

- `ecology/features-plan`: implementation directly calls **two ops that are not declared** in the step contract `ops` map.
  - Contract declares only `planVegetation`, `planWetlands`, `planReefs`, `planIce`. (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:56-61`)
  - Implementation additionally uses `planVegetatedFeaturePlacements` + `planWetFeaturePlacements` (normalize + run) via `@mapgen/domain/ecology/ops`. (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:69-90`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:109-127`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:154-188`)
  - Both ops exist in the domain op registry. (`mods/mod-swooper-maps/src/domain/ecology/ops/contracts.ts:31-34`)

### Artifact read/write not declared

- `ecology/biome-edge-refine`: **writes** `ecologyArtifacts.biomeClassification` in-place but the contract only declares it as `artifacts.requires` (no `provides`).
  - Contract: only `requires: [ecologyArtifacts.biomeClassification, morphologyArtifacts.topography]`. (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts:11-13`)
  - Implementation mutates `biomeIndex` via `mutable.biomeIndex.set(...)`. (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts:43-46`)

### Adapter/engine call in a truth step

- No `context.adapter` usage found in `phase: "ecology"` steps. (verified by `rg -n "context\\.adapter" mods/mod-swooper-maps/src/recipes/standard/stages/ecology`; no hits)

### Tag/effect mismatches

- `gameplay/plot-biomes`: step depends on and writes `context.fields.temperature`, but there is no corresponding dependency tag, and the step contract does not declare it.
  - Implementation reads `context.fields.temperature` and throws if missing. (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.ts:21-25`)
  - Contract provides only `field:biomeId` + `effect:engine.biomesApplied`. (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts:11-16`)
  - Dependency tags only include `terrainType/elevation/rainfall/biomeId/featureType` (no `temperature`). (`mods/mod-swooper-maps/src/recipes/standard/tags.ts:8-16`)

- `gameplay/plot-effects`: step applies plot effects to the engine adapter but provides no engine effect tag for it (and none exists in `M4_EFFECT_TAGS.engine`).
  - Contract provides no tags/effects. (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts:7-24`)
  - Implementation applies placements via `applyPlotEffectPlacements(...)`. (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/index.ts:61-63`)
  - `applyPlotEffectPlacements` calls `context.adapter.addPlotEffect(...)`. (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/apply.ts:24-38`)
  - Engine effect tags do not include any `plotEffectsApplied`-like tag. (`mods/mod-swooper-maps/src/recipes/standard/tags.ts:18-25`)

- `gameplay/plot-effects` (and `gameplay/features-apply`): step reads `context.buffers.heightfield` but does not require the effect that indicates elevation/heightfield is built.
  - Plot-effects uses `context.buffers.heightfield`. (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/index.ts:12-16`)
  - Features-apply uses `context.buffers.heightfield`. (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/index.ts:50-53`)
  - `map-morphology/build-elevation` is tagged as owner/provider of `effect:map.elevationBuilt` and uses `context.buffers.heightfield`. (`mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.contract.ts:6-14`, `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.ts:23-25`, `mods/mod-swooper-maps/src/recipes/standard/tags.ts:27-36`, `mods/mod-swooper-maps/src/recipes/standard/tags.ts:69-73`)

## Notes (Contract Gaps That Don’t Fit The “Breaks” Buckets)

- Artifact schemas are intentionally permissive (`Type.Any()` for typed arrays), with stricter runtime validators in `artifact-validation.ts` (ex: biome classification expects `Uint8Array/Float32Array`, not `any`). This means the artifact schema contract is not currently strong enough to detect shape drift on its own. (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:4-20`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifact-validation.ts:51-96`)
