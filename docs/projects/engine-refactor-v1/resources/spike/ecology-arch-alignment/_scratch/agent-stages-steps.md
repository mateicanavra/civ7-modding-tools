# agent-stages-steps.md

## Objective

Inventory stage compile mappings and step boundaries for `ecology` and `map-ecology`, with special attention to:
- step.normalize correctness (compile-time, shape-preserving),
- where orchestration lives (steps vs ops),
- contract drift patterns (direct op imports bypassing injected ops).

## Where To Start (Pointers)

- Stage definitions:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`
- Step authoring contract:
  - `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`
  - `packages/mapgen-core/src/authoring/step/contract.ts`
  - `packages/mapgen-core/src/authoring/step/create.ts`
- Step modules:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/**`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/**`

## Findings (Grounded)

### 1) Stage compile mappings

#### Ecology stage

- Stage file: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts`
- Public schema keys -> step ids mapping:
  - `pedology` -> `pedology`
  - `resourceBasins` -> `resource-basins`
  - `biomes` -> `biomes`
  - `biomeEdgeRefine` -> `biome-edge-refine`
  - `featuresPlan` -> `features-plan`

This uses `createStage({ id: "ecology", ... compile: ({ env, knobs, config }) => ({ ... }) })` and returns a per-step config object keyed by step ids.

#### Map-ecology stage

- Stage file: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`
- Public schema keys -> step ids mapping:
  - `biomes` -> `plot-biomes`
  - `featuresApply` -> `features-apply`
  - `plotEffects` -> `plot-effects`

### 2) Step.normalize posture

- `features-plan` is the only ecology truth step with a `normalize` hook (as observed):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`
  - It conditionally calls `ecologyOps.ops.planVegetatedFeaturePlacements.normalize` and `ecologyOps.ops.planWetFeaturePlacements.normalize` if those optional sub-configs are present.
  - This is compile-time only by architecture (normalize invoked by compiler in `packages/mapgen-core/src/compiler/recipe-compile.ts`).
  - It appears shape-preserving (returns the same schema shape, only normalizing nested selections).

No other ecology/map-ecology step currently defines a `normalize`.

### 3) Orchestration boundaries (what lives in steps)

- `features-plan` orchestrates multiple ops:
  - vegetation planning
  - wetlands planning
  - reefs planning
  - ice planning
  - plus optional richer placement ops for vegetated/wet features.
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`

- `resource-basins` orchestrates `plan` then `score` ops:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/index.ts`

This is consistent with “steps orchestrate, ops compute/plan.”

### 4) Contract drift: direct import of a domain implementation

`features-plan` imports `@mapgen/domain/ecology/ops` directly:
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`:
  - `import ecologyOps from "@mapgen/domain/ecology/ops";`

This bypasses the injected `ops` argument from `createStep(...)` and could represent drift vs the intended “step contract declares ops, runner injects ops.”

However, note: it uses this import specifically to access `normalize` and `run` on optional placement ops (and uses `ops.*` for the declared ops in the contract).

## Drift / Issues Noted

- **Drift candidate:** Step `features-plan` uses a direct domain import for optional op normalize/run (`ecologyOps.ops.planVegetatedFeaturePlacements...`) rather than binding those ops into the step contract.
  - Impact: less contract enforcement; potential mismatch between config compilation and runtime op injection.
  - Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`

- **Potential contract mismatch:** The `features-plan` step contract (`.../features-plan/contract.ts`) does not declare the two optional placement ops (planVegetatedFeaturePlacements/planWetFeaturePlacements) in `ops`, yet the step may call them.
  - That means the compiler cannot prefill defaults / validate / normalize those op envelopes unless the step manually does so.
  - Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts` (ops list) vs `.../features-plan/index.ts` (calls).

- **Biome edge refinement mutates published artifact in-place:**
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts` reads the artifact then `mutable.biomeIndex.set(...)`.
  - This is a pattern used elsewhere for buffer handles (hydrology/morphology), but here it mutates a truth artifact produced by a prior step.
  - This may be acceptable but needs to be explicitly captured as a truth-artifact mutability contract (or changed to republish a refined artifact).

## Open Questions

- Should `features-plan` be split into multiple steps for observability/gating, or should it remain one step that orchestrates multiple ops?
- Should optional placement ops be fully declared in the step contract so config compilation owns them end-to-end?
- Is in-place mutation of `artifact:ecology.biomeClassification` acceptable as a domain contract, or should the refined output be a separate artifact?

## Suggested Refactor Shapes (Conceptual Only)

- Move all op usages (including optional placement ops) behind the step contract `ops` surface.
- Consider splitting `features-plan` into per-feature steps if we want “each feature is a distinct operation” to also be visible as a distinct step boundary.
- If we keep in-place refinement, document it explicitly in the ecology contract and treat `biomeClassification` as a “publish-once handle” akin to climateField/topography.
