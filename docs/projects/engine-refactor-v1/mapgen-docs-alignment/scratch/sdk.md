<toc>
  <item id="local-plan" title="Local plan"/>
  <item id="entrypoints" title="Entrypoints + public surfaces"/>
  <item id="authoring" title="Authoring primitives (stages/steps/ops)"/>
  <item id="schemas" title="Schema + validation posture"/>
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
- Stage authoring + surface schemas: `packages/mapgen-core/src/authoring/stage.ts` (`createStage`)
- Step contracts: `packages/mapgen-core/src/authoring/step/contract.ts` (`defineStep`)
- Step modules: `packages/mapgen-core/src/authoring/step/create.ts` (`createStep`)
- Config compilation pipeline: `packages/mapgen-core/src/compiler/recipe-compile.ts` (`compileRecipeConfig`)
- Artifact contracts + runtime: `packages/mapgen-core/src/authoring/artifact/contract.ts`, `packages/mapgen-core/src/authoring/artifact/runtime.ts` (`defineArtifact`, `implementArtifacts`)

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

## Authoring primitives (stages/steps/ops)

This is the “DX-first authoring layer” new contributors should be taught:

- **Stage authoring**: `packages/mapgen-core/src/authoring/stage.ts` (`createStage`)
  - Provides a strict stage-level config boundary via a `surfaceSchema` (always includes `knobs`).
  - Supports a “public config → internal step configs” mapping:
    - If a stage defines `public`, it must also define `compile(...)` to map from public config to per-step configs.
    - If a stage does not define `public`, the surface schema is auto-derived as `{ knobs?, <stepId>?, ... }` and is passed through as raw step configs.
- **Step contracts**: `packages/mapgen-core/src/authoring/step/contract.ts` (`defineStep`)
  - Step IDs must be kebab-case.
  - `artifacts.requires/provides` is the only place artifact IDs may be declared; mixing `artifact:*` directly in `requires/provides` is an error.
  - When `artifacts.*` is present, `defineStep` merges those artifact IDs into `requires/provides` for runtime gating.
  - Step ops are declared via `contract.ops` and become top-level config keys (envelope schemas); `defineStep` prevents declaring the same keys in the base schema.
- **Step modules**: `packages/mapgen-core/src/authoring/step/create.ts` (`createStep`)
  - Step implementations receive `(context, config, ops, deps)`; `deps.artifacts.*` provides typed artifact readers/writers.
  - `deps.fields` and `deps.effects` exist at the type level but are currently wired as `{}` in `createRecipe` (artifact deps are the first-class typed surface today).
- **Ops compilation vs runtime**: `packages/mapgen-core/src/authoring/bindings.ts`
  - Compile ops exist so config compilation can bind op-level `normalize(...)` and default-strategy envelopes.
  - Runtime ops are created via `runtimeOp(op)` and bound into step execution via `bindRuntimeOps(...)`.

## Schema + validation posture

- Schemas are treated as strict boundaries by default:
  - `additionalProperties` is enforced false via `applySchemaConventions(...)`: `packages/mapgen-core/src/authoring/schema.ts`.
  - `normalizeStrict(...)` reports “Unknown key” errors and schema validation errors: `packages/mapgen-core/src/compiler/normalize.ts`.
- Stage config compilation is fail-fast per stage/step and accumulates errors into `RecipeCompileError`:
  - Unknown step ids returned by stage compilation are treated as hard errors.
  - Step `normalize(...)` is required to be shape-preserving (validated back against the schema).

### Concrete end-to-end example (MapGen Studio worker)

The Studio worker shows the most complete “DX-first” usage path in the repo today:
- Config overrides merge + validation: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts` (`mergeDeterministic`, `normalizeStrict(..., "/config")`)
- Plan compile + runId derivation: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts` (`recipeEntry.recipe.compile`, `deriveRunId(plan)`)
- Run execution: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts` (`recipeEntry.recipe.runAsync(...)`)
