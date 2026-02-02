<toc>
  <item id="local-plan" title="Local plan"/>
  <item id="runtime-model" title="Runtime model (stages/steps/ops)"/>
  <item id="compilation" title="Compilation layers"/>
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
