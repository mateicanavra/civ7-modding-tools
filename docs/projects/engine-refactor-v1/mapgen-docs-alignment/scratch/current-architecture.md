<toc>
  <item id="purpose" title="Purpose"/>
  <item id="system-map" title="Current system map"/>
  <item id="dx-happy-path" title="DX-first happy path (today)"/>
  <item id="doc-touchpoints" title="Doc touchpoints (ground truth examples)"/>
  <item id="risks" title="Risks + ambiguity"/>
</toc>

# Scratch: Current architecture (as-implemented)

## Purpose

Ground-truth the **current** runtime + authoring model from code (not docs), primarily:
- `packages/mapgen-core/**`
- `mods/mod-swooper-maps/**`
- `apps/mapgen-studio/**`

## Current system map

This is “what exists today”, grounded in code.

### Core SDK package surfaces (as shipped)

Primary codebase: `packages/mapgen-core/**`

- `packages/mapgen-core/src/core/**`
  - `EnvSchema` / `Env` in `packages/mapgen-core/src/core/env.ts` (run-global input surface used in `RunRequest.env`).
  - `ExtendedMapContext` and helpers in `packages/mapgen-core/src/core/types.ts` (`createExtendedMapContext`).
- `packages/mapgen-core/src/engine/**`
  - Structural recipe + run request schema: `packages/mapgen-core/src/engine/execution-plan.ts` (`RecipeV2Schema`, `RunRequestSchema` with `{ recipe, env }`).
  - Plan compilation: `compileExecutionPlan(runRequest, registry)`.
  - Tag registry: `packages/mapgen-core/src/engine/tags.ts` (kinds: `artifact` / `field` / `effect`).
  - Executor: `packages/mapgen-core/src/engine/PipelineExecutor.ts` (sync + async).
  - Observability: `packages/mapgen-core/src/engine/observability.ts` (`computePlanFingerprint`, `deriveRunId`).
- `packages/mapgen-core/src/authoring/**`
  - Recipe authoring entrypoint: `packages/mapgen-core/src/authoring/recipe.ts` (`createRecipe(...).compileConfig/compile/run/runAsync`).
  - Config compilation (schema-backed, knobs-last): `packages/mapgen-core/src/compiler/recipe-compile.ts` (`compileRecipeConfig`).

### Standard content package (current “real” content)

Primary codebase: `mods/mod-swooper-maps/**`

- Domain libraries and ops: `mods/mod-swooper-maps/src/domain/**`
- Standard recipe: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` (+ `src/recipes/standard/stages/**`)
- Recipe artifacts “build output” for Studio: `mods/mod-swooper-maps/recipes/*` and `mods/mod-swooper-maps/recipes/*-artifacts`

### Studio consumer path (current “real” dev loop)

Primary codebase: `apps/mapgen-studio/**`

- Worker runner: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`
- Runtime recipe imports: `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts`
- Recipe artifacts catalog (UI): `apps/mapgen-studio/src/recipes/catalog.ts`

## DX-first happy path (today)

This is the most “DX-first” runnable path in the repo today (based on Studio worker):

1) Select a recipe entry (module + artifact metadata).
   - UI catalog: `apps/mapgen-studio/src/recipes/catalog.ts`
   - Worker recipe runtime: `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts`
2) Build `Env` (seed + dims + toggles) and merge config overrides.
   - `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`
3) Validate + default config at `/config` (strict schema boundary).
   - `normalizeStrict(...)` and the per-stage surface schemas (`compileRecipeConfig`).
4) Compile plan.
   - `recipeEntry.recipe.compile(env, config)` (via `createRecipe` in `packages/mapgen-core/src/authoring/recipe.ts`)
5) Derive `runId` (fingerprint-based identity).
   - `deriveRunId(plan)` in `packages/mapgen-core/src/engine/observability.ts`
6) Execute with tracing enabled (for debugging/viz).
   - `recipeEntry.recipe.runAsync(context, env, config, { trace, abortSignal, yieldToEventLoop: true })`

## Doc touchpoints (ground truth examples)

If we wrote a “single source of truth” set of docs tomorrow, these are the best grounding anchors:

- Recipe authoring + run API: `packages/mapgen-core/src/authoring/recipe.ts`
- Config compilation + normalization rules: `packages/mapgen-core/src/compiler/recipe-compile.ts`
- Structural boundary + plan nodes: `packages/mapgen-core/src/engine/execution-plan.ts`
- Observability identities: `packages/mapgen-core/src/engine/observability.ts`
- Standard recipe stage ordering: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- Studio consumer wiring: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`

## Risks + ambiguity

High-impact ambiguities that must be reconciled (docs-first or via code changes):

- `RunRequest.env` vs target `RunRequest.settings` (naming and semantic scope).
- Dependency kind naming: `field:*` vs `buffer:*` across specs and code.
- Where step config validation “lives” mentally: current system validates in config compilation, not inside `compileExecutionPlan` itself.
- Narrative domain is present in docs/spec but appears not wired into the current standard recipe stages.
