# CONTRACTS: Ecology (Artifacts, Steps, Ops, Tags)

## Objective

Inventory ecology artifacts, step contracts (ecology + map-ecology), and ecology op contracts, and surface contract drift/breaks.

## Where To Start (Pointers)

- Artifacts:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifact-validation.ts`
- Step contracts:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/**/contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/**`
- Op contracts:
  - `mods/mod-swooper-maps/src/domain/ecology/ops/contracts.ts`
  - `mods/mod-swooper-maps/src/domain/ecology/ops/**/contract.ts`
- Tags/effects registry:
  - `mods/mod-swooper-maps/src/recipes/standard/tags.ts`

## Findings (Grounded)

### 1) Ecology artifacts inventory (truth stage)

Defined in `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts`:

- `artifact:ecology.biomeClassification`
  - name: `biomeClassification`
  - schema: `BiomeClassificationArtifactSchema` (TypeBox object, many `Type.Any()` placeholders)
  - runtime validation (typed arrays, dims): `validateBiomeClassificationArtifact` in `.../artifact-validation.ts`
  - produced by step: `biomes` (`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts` publishes)
  - mutated by step: `biome-edge-refine` mutates `biomeIndex` in place (`.../biome-edge-refine/index.ts`)
  - consumed by steps:
    - `biome-edge-refine` (reads)
    - `features-plan` (reads)
    - `plot-biomes` (map-ecology) (reads)
    - `plot-effects` (map-ecology) (reads)

- `artifact:ecology.soils`
  - name: `pedology`
  - schema: `PedologyArtifactSchema` (TypeBox object w/ `Type.Any()` placeholders)
  - runtime validation: `validatePedologyArtifact` ensures `soilType: Uint8Array`, `fertility: Float32Array`
  - produced by step: `pedology` (publishes)
  - consumed by steps:
    - `resource-basins` (reads)
    - `features-plan` (reads)

- `artifact:ecology.resourceBasins`
  - name: `resourceBasins`
  - schema: `ResourceBasinsArtifactSchema` (basins array of objects)
  - runtime validation: `validateResourceBasinsArtifact` (structure only)
  - produced by step: `resource-basins` (publishes)
  - downstream consumers: none found in ecology/map-ecology steps (likely consumed later by placement or external tooling)

- `artifact:ecology.featureIntents`
  - name: `featureIntents`
  - schema: `FeatureIntentsArtifactSchema` (arrays of placements)
  - runtime validation: `validateFeatureIntentsArtifact` (structure only)
  - produced by step: `features-plan` (publishes)
  - consumed by step: `features-apply` (map-ecology) (reads)

### 2) Step contract inventory

#### Ecology truth stage (`phase: "ecology"`)

- `pedology`
  - contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts`
  - artifacts requires: `artifact:morphology.topography`, `artifact:climateField`
  - artifacts provides: `artifact:ecology.soils`
  - ops: `classify: ecology.ops.classifyPedology`

- `resource-basins`
  - contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts`
  - artifacts requires: `artifact:ecology.soils`, `artifact:morphology.topography`, `artifact:climateField`
  - artifacts provides: `artifact:ecology.resourceBasins`
  - ops: `plan: ecology.ops.planResourceBasins`, `score: ecology.ops.scoreResourceBasins`

- `biomes`
  - contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts`
  - artifacts requires: `artifact:climateField`, `artifact:hydrology.cryosphere`, `artifact:morphology.topography`, `artifact:hydrology.hydrography`
  - artifacts provides: `artifact:ecology.biomeClassification`
  - ops: `classify: ecology.ops.classifyBiomes`

- `biome-edge-refine`
  - contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts`
  - artifacts requires: `artifact:ecology.biomeClassification`, `artifact:morphology.topography`
  - artifacts provides: (none)
  - ops: `refine: ecology.ops.refineBiomeEdges`

- `features-plan`
  - contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts`
  - artifacts requires: `artifact:ecology.biomeClassification`, `artifact:ecology.soils`, `artifact:hydrology.hydrography`, `artifact:morphology.topography`
  - artifacts provides: `artifact:ecology.featureIntents`
  - ops declared:
    - `vegetation: ecology.ops.planVegetation`
    - `wetlands: ecology.ops.planWetlands`
    - `reefs: ecology.ops.planReefs`
    - `ice: ecology.ops.planIce`
  - NOTE: implementation optionally calls placement ops that are NOT declared in this contract (see drift section).

#### Map-ecology projection stage (`phase: "gameplay"`)

- `plot-biomes`
  - contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts`
  - artifacts requires: `artifact:ecology.biomeClassification`, `artifact:morphology.topography`
  - provides tags/effects:
    - `field:biomeId` (M3_DEPENDENCY_TAGS)
    - `effect:engine.biomesApplied` (ENGINE_EFFECT_TAGS)

- `features-apply`
  - contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts`
  - artifacts requires: `artifact:ecology.featureIntents`
  - ops: `apply: ecology.ops.applyFeatures`
  - provides tags/effects:
    - `field:featureType`
    - `effect:engine.featuresApplied`

- `plot-effects`
  - contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts`
  - artifacts requires: `artifact:morphology.topography`, `artifact:ecology.biomeClassification`
  - ops: `plotEffects: ecology.ops.planPlotEffects`
  - provides: none (even though it applies adapter writes in implementation)

### 3) Op contract inventory (Ecology domain)

Ops are declared in `mods/mod-swooper-maps/src/domain/ecology/ops/contracts.ts` and implemented under `mods/mod-swooper-maps/src/domain/ecology/ops/*`.

Representative op ids (from their `defineOp` contracts):
- `ecology/pedology/classify` (`kind: compute`)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/pedology-classify/contract.ts`
- `ecology/pedology/aggregate` (`kind: compute`)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/pedology-aggregate/contract.ts`
- `ecology/resources/plan-basins` (`kind: plan`)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/resource-plan-basins/contract.ts`
- `ecology/resources/score-balance` (`kind: compute`)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/resource-score-balance/contract.ts`
- `ecology/biomes/classify` (`kind: compute`)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/contract.ts`
- `ecology/biomes/refine-edge` (`kind: compute`)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/refine-biome-edges/contract.ts`
- `ecology/features/plan-vegetation` (`kind: plan`)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-vegetation/contract.ts`
- `ecology/features/vegetated-placement` (`kind: plan`)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-vegetated-feature-placements/contract.ts`
- `ecology/features/apply` (`kind: compute`)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/features-apply/contract.ts`
- `ecology/plot-effects/placement` (`kind: plan`)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-plot-effects/contract.ts`

All ops are strategy-backed (at least `default`), per the op contract pattern.

## Drift / Issues Noted

### A) Features plan step calls ops not declared in its contract

- Step contract declares only `vegetation`, `wetlands`, `reefs`, `ice` ops.
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts`

- Step implementation optionally uses additional placement ops via a direct domain import:
  - `import ecologyOps from "@mapgen/domain/ecology/ops";`
  - Calls `ecologyOps.ops.planVegetatedFeaturePlacements.normalize/run` and `ecologyOps.ops.planWetFeaturePlacements.normalize/run`.
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`

This is a contract drift risk because the compiler’s op binding/normalization system only knows about ops declared in `contract.ops`.

### B) Artifact mutability coupling: biome-edge-refine mutates a published artifact

- `biome-edge-refine` reads `artifact:ecology.biomeClassification` and mutates `biomeIndex` in-place (`mutable.biomeIndex.set(...)`).
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts`

This is not necessarily wrong, but it is an implicit artifact contract: consumers after this step see refined results.

### C) Projection step with side-effects but no effect tag

- `plot-effects` calls `context.adapter.addPlotEffect(...)` via `applyPlotEffectPlacements`.
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/apply.ts`

But the step contract `provides: []` and does not publish an effect guarantee.

## Open Questions

- Should `features-plan` fully declare the optional placement ops in its step contract (preferred for compile-time enforcement), or should those calls be removed/reshaped?
- Should `biome-edge-refine` republish a refined artifact (immutable) or explicitly mark `biomeClassification` as a publish-once mutable handle?
- Should `plot-effects` provide a stable effect tag if downstream steps should be allowed to gate on “plot effects applied”?

## Suggested Refactor Shapes (Conceptual Only)

- Move optional placement ops behind the step contract `ops` surface so compiler-owned defaulting/validation/normalization applies.
- Decide and document ecology artifact mutability posture; avoid implicit in-place mutation unless it is an intentional “buffer handle” contract.
- If plot effects become a stable guarantee, add an effect tag; otherwise explicitly document it as best-effort/no-gate.
