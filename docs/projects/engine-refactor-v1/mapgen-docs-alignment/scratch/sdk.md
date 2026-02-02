<toc>
  <item id="local-plan" title="Local plan"/>
  <item id="entrypoints" title="Entrypoints + public surfaces"/>
  <item id="notes" title="Notes + drift"/>
  <item id="open-questions" title="Open questions"/>
</toc>

# Scratch: MapGen core SDK

## Questions
- What is the intended “one true” entrypoint for generating a map in code?
- Which APIs are public vs internal?
- Where are DI boundaries, and what is the expected pattern?

## Docs found

## Code touchpoints
- Public package surface: `packages/mapgen-core/src/index.ts`
- Public subpath exports: `packages/mapgen-core/package.json` (`exports: ./engine`, `./authoring`, `./compiler/*`, `./trace`)
- “DX-first” runtime entrypoint (authoring): `packages/mapgen-core/src/authoring/recipe.ts` (`createRecipe(...).run(...)`)
- Canonical runtime context: `packages/mapgen-core/src/core/types.ts` (`ExtendedMapContext`, `createExtendedMapContext`)
- Canonical execution surface: `packages/mapgen-core/src/engine/execution-plan.ts` + `packages/mapgen-core/src/engine/PipelineExecutor.ts`
- Standard recipe implementation: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`

## Notes
- **Observed “happy path” (today)**:
  - Build an `Env` (`seed`, `dimensions`, `latitudeBounds`, optional `trace`): `packages/mapgen-core/src/core/env.ts`.
  - Build an adapter: `@civ7/adapter` (Civ7 runtime) or `@civ7/adapter/mock` (Studio worker): `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`.
  - Create `ExtendedMapContext`: `packages/mapgen-core/src/core/types.ts` (`createExtendedMapContext`) and/or `@swooper/mapgen-core` root export (`createExtendedMapContext`).
  - Select and run a recipe module:
    - Standard recipe module: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
    - Browser test recipe module: `mods/mod-swooper-maps/src/recipes/browser-test/recipe.ts`
- **DI boundary**: engine interaction is via `context.adapter`, sourced from `@civ7/adapter` (or mock adapter in Studio).
- **Two compilation layers exist** (DX-critical to explain in docs):
  - **Config compilation** (authoring): `packages/mapgen-core/src/compiler/recipe-compile.ts` (`compileRecipeConfig`) validates/defaults the stage + step config surface.
  - **Plan compilation** (engine): `packages/mapgen-core/src/engine/execution-plan.ts` (`compileExecutionPlan`) turns an instantiated recipe into an `ExecutionPlan` with `requires`/`provides`.

### Concrete end-to-end example (MapGen Studio worker)

The Studio worker shows the most complete “DX-first” usage path in the repo today:
- Config overrides merge + validation: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts` (`mergeDeterministic`, `normalizeStrict(..., "/config")`)
- Plan compile + runId derivation: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts` (`recipeEntry.recipe.compile`, `deriveRunId(plan)`)
- Run execution: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts` (`recipeEntry.recipe.runAsync(...)`)
