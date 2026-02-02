<toc>
  <item id="local-plan" title="Local plan"/>
  <item id="runtime-model" title="Runtime model (stages/steps/ops)"/>
  <item id="compilation" title="Compilation layers"/>
  <item id="tags" title="Tags + gating model (artifact/field/effect)"/>
  <item id="standard-recipe" title="Standard recipe (truth vs projection)"/>
  <item id="notes" title="Notes + drift"/>
</toc>

# Scratch: MapGen pipeline / recipe model

## Questions
- What’s the canonical pipeline model today (stages/steps/artifacts)?
- Where is the “standard recipe” defined and executed?
- How do config overrides and UI meta artifacts relate to the runtime pipeline?

## Docs found

## Code touchpoints
- Recipe runtime model: `packages/mapgen-core/src/engine/execution-plan.ts` (`RecipeV2`, `RunRequest`, `ExecutionPlan`, `compileExecutionPlan`)
- Pipeline executor: `packages/mapgen-core/src/engine/PipelineExecutor.ts` (sync + async execution, tag gating, tracing)
- Step registry + tag registry: `packages/mapgen-core/src/engine/StepRegistry.ts`, `packages/mapgen-core/src/engine/tags.ts`
- Config compilation/normalization: `packages/mapgen-core/src/compiler/recipe-compile.ts` (surface schema → internal step configs; op defaults; step/op normalize)
- Authoring glue (createRecipe): `packages/mapgen-core/src/authoring/recipe.ts` (`compileConfig` → `instantiate` → `runRequest` → `compileExecutionPlan` → execute)
- Standard recipe stage ordering: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- MapGen Studio runner (end-to-end example): `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts` (config override merge → schema validation → `recipe.compile` → `deriveRunId` → `createExtendedMapContext` → `recipe.runAsync`)

## Notes
- **Two “compile” layers exist today**:
  - **Config compile** (authoring): `compileRecipeConfig(...)` validates/defaults the authored “public” config surface into canonical internal step configs.
  - **Plan compile** (engine): `compileExecutionPlan(runRequest, registry)` filters enabled steps and expands them into `ExecutionPlan.nodes` with requires/provides + config payloads.

## Pipeline in practice (standard recipe)

- Stage ordering source of truth: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` (`const stages = [...] as const`)
  - `foundation`
  - `morphology-pre`, `morphology-mid`, `morphology-post`
  - `hydrology-climate-baseline`, `hydrology-hydrography`, `hydrology-climate-refine`
  - `ecology`
  - gameplay projections: `map-morphology`, `map-hydrology`, `map-ecology`
  - `placement`
- Narrative is **not** currently wired into the standard recipe stage list (domain exists, recipe doesn’t include it yet).

## Tags + gating model (artifact/field/effect)

The runtime gating model is “declared deps + registry validation + satisfaction checks”:

- Step registration is fail-fast against the `TagRegistry`:
  - `packages/mapgen-core/src/engine/StepRegistry.ts` validates `requires/provides` tags exist.
- At execution time, for each step:
  1) `requires` must already be satisfied (or execution aborts with `MissingDependencyError`).
  2) after `run`, all `provides` are added to the satisfied set.
  3) each `provides` tag may have an optional `satisfies(context, state)` predicate; if false, execution aborts (`UnsatisfiedProvidesError`).

Standard content package tag definitions (canonical example):
- `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
  - `artifact:*` tags are satisfied by artifact publish + optional artifact validation.
  - `field:*` tags are satisfied by checking that `context.fields.<field>` is a typed array of expected grid size.
  - `effect:*` tags are satisfied either:
    - “logically” (just being provided), or
    - “verified” by adapter read-back (`context.adapter.verifyEffect(id)`), or
    - custom satisfy logic (e.g. placement checks `artifact:placementOutputs` consistency).

## Standard recipe (truth vs projection)

The standard recipe is explicitly split into:

- **Truth stages** (publish canonical artifacts):
  - `foundation` → `morphology-*` → `hydrology-*` → `ecology`
- **Projection stages** (engine-facing, gameplay phase; publish `effect:*` and `field:*` tags):
  - `map-morphology`, `map-hydrology`, `map-ecology`, plus `plot-landmass-regions` in placement

This split should be taught as a first-class mental model in canonical docs.

## MapGen Studio runner (current end-to-end example)

- Recipe selection and artifacts:
  - UI recipe artifacts catalog: `apps/mapgen-studio/src/recipes/catalog.ts` (imports `mod-swooper-maps/recipes/*-artifacts`)
  - Worker runtime recipe modules: `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts` (imports `mod-swooper-maps/recipes/*`)
- Worker run flow:
  - Merge defaults + overrides (defensive, deterministic): `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts` (`mergeDeterministic`)
  - Validate and default config at `/config`: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts` (`normalizeStrict`)
  - Compile plan and derive a run id: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts` (`recipeEntry.recipe.compile`, `deriveRunId`)
  - Force verbose tracing per step (for viz dumping): `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`
- Execute async with cooperative cancellation: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts` (`runAsync(..., { abortSignal, yieldToEventLoop: true })`)
