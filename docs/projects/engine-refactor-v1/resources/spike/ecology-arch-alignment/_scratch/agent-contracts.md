# agent-contracts.md

## Objective

Inventory the **ecology + map-ecology** contract surface (artifacts, steps, ops) and list **contract breaks** where implementation escapes the declared contracts.

Axis: **Contracts**.

## Where To Start (Pointers)

- Ecology artifacts + validation:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts` (artifact ids + schemas). (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:4-128`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifact-validation.ts` (runtime validators; stricter than the `Type.Any()` placeholders). (e.g. `validateBiomeClassificationArtifact` @ `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifact-validation.ts:93-117`)
- Step contracts:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/**/contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/**/contract.ts`
- Step implementations:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/**/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/**/index.ts`
- Ops registry + contracts:
  - `mods/mod-swooper-maps/src/domain/ecology/ops/contracts.ts` (canonical op registry). (`mods/mod-swooper-maps/src/domain/ecology/ops/contracts.ts:20-39`)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/**/contract.ts` (op id/kind/strategies + schemas)
- Dependency/effect tags:
  - `mods/mod-swooper-maps/src/recipes/standard/tags.ts` (tag catalog). (`mods/mod-swooper-maps/src/recipes/standard/tags.ts:8-36`)
- Heightfield dependency grounding (map-ecology plot effects reads `context.buffers.heightfield`):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.contract.ts` (provides `effect:map.elevationBuilt`). (`mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.contract.ts:6-14`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.ts` (uses `context.buffers.heightfield`). (`mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.ts:23-25`)

## Ecology Artifacts Inventory (Truth + Projection)

Artifact keys/ids are defined in `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:107-128`.

| Artifact key | Artifact id | Schema / Definition file | Produced by step(s) | Consumed by step(s) |
|---|---|---|---|---|
| `ecologyArtifacts.biomeClassification` | `artifact:ecology.biomeClassification` | Schema: `BiomeClassificationArtifactSchema` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:4-20`). Definition: (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:107-112`) | Declared + published by `ecology/biomes` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts:15-26`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts:151-159`). Also **mutated in-place** by `ecology/biome-edge-refine` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts:43-46`). | `ecology/biome-edge-refine` requires (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts:11-13`). `ecology/features-plan` requires (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:48-55`). `gameplay/plot-biomes` requires (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts:13-16`). `gameplay/plot-effects` requires (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts:12-17`). |
| `ecologyArtifacts.pedology` | `artifact:ecology.soils` | Schema: `PedologyArtifactSchema` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:24-32`). Definition: (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:113-117`) | Declared + published by `ecology/pedology` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts:12-18`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/index.ts:55-59`). | `ecology/resource-basins` requires (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts:12-19`). `ecology/features-plan` requires (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:48-55`). |
| `ecologyArtifacts.resourceBasins` | `artifact:ecology.resourceBasins` | Schema: `ResourceBasinsArtifactSchema` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:36-51`). Definition: (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:118-122`) | Declared + published by `ecology/resource-basins` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts:12-23`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/index.ts:61`). | No consumers found under standard `stages/**` (the only `deps.artifacts.resourceBasins` publish is in the producer step). (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/index.ts:61`) |
| `ecologyArtifacts.featureIntents` | `artifact:ecology.featureIntents` | Schema: `FeatureIntentsArtifactSchema` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:55-103`). Definition: (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:123-127`) | Declared + published by `ecology/features-plan` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:47-71`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:267-268`). | `gameplay/features-apply` requires + reads (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts:11-17`, `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/index.ts:13-19`). |

## Step Contract Inventory (Ecology + Map-Ecology)

`requires` / `provides` on steps are dependency/effect tags from `mods/mod-swooper-maps/src/recipes/standard/tags.ts:8-36`.

| Step id | Phase | Contract (source of truth) | Artifacts requires | Artifacts provides | Tags requires | Tags provides | Ops declared |
|---|---|---|---|---|---|---|---|
| `pedology` | `ecology` | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts:7-25` | `morphologyArtifacts.topography`, `hydrologyClimateBaselineArtifacts.climateField` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts:12-15`) | `ecologyArtifacts.pedology` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts:12-15`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts:8-12`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts:8-12`) | `classify: ecology.ops.classifyPedology` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts:16-18`) |
| `resource-basins` | `ecology` | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts:7-30` | `ecologyArtifacts.pedology`, `morphologyArtifacts.topography`, `hydrologyClimateBaselineArtifacts.climateField` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts:12-19`) | `ecologyArtifacts.resourceBasins` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts:18-19`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts:8-12`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts:8-12`) | `plan: ecology.ops.planResourceBasins`, `score: ecology.ops.scoreResourceBasins` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts:20-23`) |
| `biomes` | `ecology` | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts:10-35` | `hydrologyClimateBaselineArtifacts.climateField`, `hydrologyClimateRefineArtifacts.cryosphere`, `morphologyArtifacts.topography`, `hydrologyHydrographyArtifacts.hydrography` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts:15-23`) | `ecologyArtifacts.biomeClassification` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts:22-23`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts:11-15`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts:11-15`) | `classify: ecology.ops.classifyBiomes` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts:24-26`) |
| `biome-edge-refine` | `ecology` | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts:6-23` | `ecologyArtifacts.biomeClassification`, `morphologyArtifacts.topography` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts:11-13`) | (none declared) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts:7-11`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts:7-11`) | `refine: ecology.ops.refineBiomeEdges` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts:14-16`) |
| `features-plan` | `ecology` | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:42-71` | `ecologyArtifacts.biomeClassification`, `ecologyArtifacts.pedology`, `hydrologyHydrographyArtifacts.hydrography`, `morphologyArtifacts.topography` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:47-55`) | `ecologyArtifacts.featureIntents` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:54-55`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:43-47`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:43-47`) | `vegetation: ecology.ops.planVegetation`, `wetlands: ecology.ops.planWetlands`, `reefs: ecology.ops.planReefs`, `ice: ecology.ops.planIce` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:56-61`) |
| `plot-biomes` | `gameplay` | `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts:8-25` | `ecologyArtifacts.biomeClassification`, `morphologyArtifacts.topography` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts:13-16`) | (none) (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts:13-16`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts:8-12`) | `field:biomeId`, `effect:engine.biomesApplied` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts:11-13`, `mods/mod-swooper-maps/src/recipes/standard/tags.ts:8-25`) | (none) |
| `features-apply` | `gameplay` | `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts:6-23` | `ecologyArtifacts.featureIntents` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts:11-13`) | (none declared) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts:7-10`) | `field:featureType`, `effect:engine.featuresApplied` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts:9-11`, `mods/mod-swooper-maps/src/recipes/standard/tags.ts:8-25`) | `apply: ecology.ops.applyFeatures` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts:14-16`) |
| `plot-effects` | `gameplay` | `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts:7-24` | `morphologyArtifacts.topography`, `ecologyArtifacts.biomeClassification` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts:12-14`) | (none declared) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts:8-12`) | `[]` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts:8-12`) | `plotEffects: ecology.ops.planPlotEffects` (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts:15-17`) |

## Op Contract Inventory (Ecology Ops)

Registry key list comes from `mods/mod-swooper-maps/src/domain/ecology/ops/contracts.ts:20-39`.

| Op registry key | Op id (string) | Kind | Strategies | Contract pointer |
|---|---|---|---|---|
| `classifyBiomes` | `ecology/biomes/classify` | `compute` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/contract.ts:14-64` |
| `classifyPedology` | `ecology/pedology/classify` | `compute` | `default`, `coastal-shelf`, `orogeny-boosted` | `mods/mod-swooper-maps/src/domain/ecology/ops/pedology-classify/contract.ts:3-60` |
| `aggregatePedology` | `ecology/pedology/aggregate` | `compute` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/pedology-aggregate/contract.ts:3-31` |
| `planResourceBasins` | `ecology/resources/plan-basins` | `plan` | `default`, `hydro-fluvial`, `mixed` | `mods/mod-swooper-maps/src/domain/ecology/ops/resource-plan-basins/contract.ts:3-65` |
| `scoreResourceBasins` | `ecology/resources/score-balance` | `score` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/resource-score-balance/contract.ts:3-94` |
| `refineBiomeEdges` | `ecology/biomes/refine-edge` | `compute` | `default`, `morphological`, `gaussian` | `mods/mod-swooper-maps/src/domain/ecology/ops/refine-biome-edges/contract.ts:3-31` |
| `planAquaticFeaturePlacements` | `ecology/features/aquatic-placement` | `plan` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/plan-aquatic-feature-placements/contract.ts:45-76` |
| `planIceFeaturePlacements` | `ecology/features/ice-placement` | `plan` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/plan-ice-feature-placements/contract.ts:27-59` |
| `planPlotEffects` | `ecology/plot-effects/placement` | `plan` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/plan-plot-effects/contract.ts:111-143` |
| `planReefEmbellishments` | `ecology/features/reef-embellishments` | `plan` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/plan-reef-embellishments/contract.ts:19-46` |
| `planVegetatedFeaturePlacements` | `ecology/features/vegetated-placement` | `plan` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/plan-vegetated-feature-placements/contract.ts:74-115` |
| `planVegetationEmbellishments` | `ecology/features/vegetation-embellishments` | `plan` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/plan-vegetation-embellishments/contract.ts:43-78` |
| `planWetFeaturePlacements` | `ecology/features/wet-placement` | `plan` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/plan-wet-feature-placements/contract.ts:63-103` |
| `planVegetation` | `ecology/features/plan-vegetation` | `plan` | `default`, `clustered` | `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-vegetation/contract.ts:4-38` |
| `planWetlands` | `ecology/features/plan-wetlands` | `plan` | `default`, `delta-focused` | `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-wetlands/contract.ts:4-35` |
| `planReefs` | `ecology/features/plan-reefs` | `plan` | `default`, `shipping-lanes` | `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-reefs/contract.ts:4-28` |
| `planIce` | `ecology/features/plan-ice` | `plan` | `default`, `continentality` | `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-ice/contract.ts:4-59` |
| `applyFeatures` | `ecology/features/apply` | `plan` | `default` | `mods/mod-swooper-maps/src/domain/ecology/ops/features-apply/contract.ts:4-52` |

## Contract Breaks List

### 1) Step uses an op not declared in its contract `ops`

- `ecology/features-plan`: implementation directly calls two ops that are not declared in the step contract `ops` map.
  - Contract declares only `vegetation/wetlands/reefs/ice`. (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts:56-61`)
  - Implementation additionally uses `planVegetatedFeaturePlacements` + `planWetFeaturePlacements` via `@mapgen/domain/ecology/ops` (`normalize` and `.run`). (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:69-90`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:109-127`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts:154-188`)
  - These ops exist in the op registry but are absent from the step contract ops map. (`mods/mod-swooper-maps/src/domain/ecology/ops/contracts.ts:31-34`)

### 2) Artifact read/write not declared

- `ecology/biome-edge-refine`: writes `ecologyArtifacts.biomeClassification` in-place but contract only declares it as `artifacts.requires` (no `artifacts.provides`).
  - Contract: `artifacts.requires: [ecologyArtifacts.biomeClassification, morphologyArtifacts.topography]`. (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts:11-13`)
  - Implementation: `mutable.biomeIndex.set(refined.biomeIndex)` (in-place mutation). (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts:43-46`)

### 3) Adapter/engine call in a truth step

- No `context.adapter` usage found under `phase: "ecology"` step implementations. (verified by `rg -n "context\.adapter" mods/mod-swooper-maps/src/recipes/standard/stages/ecology`; no hits)

### 4) Tag/effect mismatches

- `gameplay/plot-biomes`: depends on and writes `context.fields.temperature`, but no dependency tag exists for it, and the step contract does not declare it.
  - Implementation: reads `context.fields.temperature` and throws if missing. (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.ts:21-25`)
  - Contract provides only `field:biomeId` + `effect:engine.biomesApplied`. (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts:11-16`)
  - Tag registry has no `field:temperature` equivalent. (`mods/mod-swooper-maps/src/recipes/standard/tags.ts:8-16`)

- `gameplay/plot-effects`: mutates the engine adapter but provides no effect tag for “plot effects applied”, and no such engine effect tag exists.
  - Contract provides no tags/effects. (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts:7-24`)
  - Implementation applies placements: `applyPlotEffectPlacements(context, result.placements)`. (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/index.ts:61-63`)
  - Adapter call: `context.adapter.addPlotEffect(...)`. (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/apply.ts:24-38`)
  - Engine effect tags enumerated do not include plot effects. (`mods/mod-swooper-maps/src/recipes/standard/tags.ts:18-25`)

- `gameplay/plot-effects` (and `gameplay/features-apply`): reads `context.buffers.heightfield` but does not require the effect tag that implies heightfield was built.
  - Plot-effects reads heightfield: (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/index.ts:12-16`)
  - Features-apply reads heightfield: (`mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/index.ts:50-53`)
  - `map-morphology/build-elevation` provides `effect:map.elevationBuilt` and uses heightfield. (`mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.contract.ts:6-14`, `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.ts:23-25`)
  - Tag registry defines `effect:map.elevationBuilt`. (`mods/mod-swooper-maps/src/recipes/standard/tags.ts:27-36`, `mods/mod-swooper-maps/src/recipes/standard/tags.ts:69-73`)

## Notes / Extra Contract Gaps

- Artifact schemas are permissive (`Type.Any()` for typed arrays) while runtime validators require typed arrays.
  - Example (biome classification): schema uses `Type.Any()` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts:4-20`), but runtime checks `instanceof Uint8Array/Float32Array`. (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifact-validation.ts:38-55`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifact-validation.ts:93-117`)
