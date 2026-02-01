<toc>
  <item id="purpose" title="Purpose"/>
  <item id="policies" title="Policies (draft)"/>
  <item id="questions" title="Open questions"/>
</toc>

# Scratch: Policies + conventions (MapGen DX-first)

This scratch pad is for extracting **DX-critical policies** from:
- the target spec (`docs/projects/engine-refactor-v1/resources/spec/**`)
- the current implementation (`packages/mapgen-core/**`, `mods/mod-swooper-maps/**`)
- and “buried canon” in workflow docs.

Promote any stabilized conclusions into `../SPIKE.md`.

## 1) “One true” happy path (today)

- Core authoring entrypoint: `packages/mapgen-core/src/authoring/recipe.ts` (`createRecipe(...).run(...)` / `.runAsync(...)`)
- Standard content package (example): `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- Execution model:
  - Config compilation/normalization: `packages/mapgen-core/src/compiler/recipe-compile.ts` (`compileRecipeConfig`)
  - Plan compilation (structural recipe → nodes): `packages/mapgen-core/src/engine/execution-plan.ts` (`compileExecutionPlan`)
  - Execution: `packages/mapgen-core/src/engine/PipelineExecutor.ts` (`executePlan`)

## 2) Pipeline ordering + enablement

Target spec stance:
- Ordering source of truth is recipe-only (no stage manifest): `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-001-ordering-source-of-truth-is-recipe-only-no-stage-order-stagemanifest.md`
- Enablement is recipe-authored and compiled (no runtime `shouldRun`/silent skips): `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-002-enablement-is-recipe-authored-and-compiled-no-shouldrun-no-silent-skips.md`

Current implementation mapping:
- Structural recipe schema (`RecipeV2Schema`) supports `enabled?: boolean` at the step level:
  - `packages/mapgen-core/src/engine/execution-plan.ts`
- Disabled steps are filtered out during plan compilation:
  - `packages/mapgen-core/src/engine/execution-plan.ts` (`const enabled = step.enabled ?? true; if (!enabled) return;`)

## 3) Run-global settings: target naming vs current naming

Target spec uses:
- `RunRequest = { recipe, settings }` and a `RunSettingsSchema`:
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md`
  - `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-003-pipeline-boundary-is-runrequest-recipe-settings-compiled-to-executionplan.md`

Current implementation uses:
- `RunRequest = { recipe, env }`:
  - `packages/mapgen-core/src/engine/execution-plan.ts`
- `Env` contains many “settings-like” items:
  - `packages/mapgen-core/src/core/env.ts` (`seed`, `dimensions`, `latitudeBounds`, `metadata`, `trace`)

Spike note:
- This looks like a terminology divergence (“env” vs “settings”), not necessarily a conceptual divergence.
- Docs/examples should explicitly name and explain this mapping until/unless the code is renamed.

## 4) Config compilation contract (schemas, defaults, knobs)

Locked DX intent:
- Step config is validated and defaulted from schemas; no ad-hoc mutation:
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md`
  - `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-035-config-normalization-and-derived-defaults.md`

Current implementation:
- Stage surface schema validation + defaults: `packages/mapgen-core/src/compiler/recipe-compile.ts` (`normalizeStrict(stage.surfaceSchema, ...)`)
- Step schema validation + defaults + normalize passes:
  - `packages/mapgen-core/src/compiler/recipe-compile.ts` (`prefillOpDefaults`, `normalizeStrict`, `step.normalize`, `normalizeOpsTopLevel`)
- Stage authoring guarantees a stable “knobs + public/internal surface” split:
  - `packages/mapgen-core/src/authoring/stage.ts` (`createStage`)
  - Stage `public` config requires a stage-level `compile(...)` mapping into per-step configs.
- Schema posture is strict-by-default:
  - `additionalProperties` is forced to `false` by `applySchemaConventions(...)`: `packages/mapgen-core/src/authoring/schema.ts`.
  - Unknown keys are reported explicitly by `normalizeStrict(...)`: `packages/mapgen-core/src/compiler/normalize.ts`.
- “Knobs apply last” contract is used in standard recipe stages:
  - Example: Foundation stage `compile` uses only `config.advanced ?? {}` but accepts `knobsSchema`:
    - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`
  - Author-facing summary: `docs/system/libs/mapgen/realism-knobs-and-presets.md`

## 5) Tags, artifacts, buffers, effects

Target spec stance:
- Dependency tags are explicit, typed by kind (`artifact:*`, `buffer:*`, `effect:*`):
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md`
  - `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-006-tag-registry-is-canonical-registered-tags-only-fail-fast-collisions-effect-first-class.md`

Current implementation:
- Tag kind inference exists (from id prefix) and is used when building the registry:
  - `packages/mapgen-core/src/authoring/recipe.ts` (`inferTagKind`, `collectTagDefinitions`, `TagRegistry.registerTags(...)`)
- Artifacts are defined (with schemas) and published under `artifact:*` IDs (mod-owned):
  - Example: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts`
- Artifact contract posture is strict and “write-once”:
  - `defineArtifact` enforces `artifact:` prefix and camelCase names: `packages/mapgen-core/src/authoring/artifact/contract.ts`
  - `implementArtifacts(...).publish(...)` is write-once; publishes store references (no deep freeze/snapshot) and rely on conventions:
    - treat published artifacts as immutable after publish
    - buffer artifacts are a temporary exception (publish once, then mutate buffers): `packages/mapgen-core/src/authoring/artifact/runtime.ts`
- Artifact declarations have a “single source of truth”:
  - Steps must declare artifact dependencies via `artifacts.requires/provides` and must not mix `artifact:*` directly in `requires/provides`:
    - `packages/mapgen-core/src/authoring/step/contract.ts` (`defineStep`)
- Runtime gating is fail-fast:
  - Unknown dependency tags are hard errors when steps are registered (`StepRegistry.register`) and also validated at execution time:
    - `packages/mapgen-core/src/engine/StepRegistry.ts`
    - `packages/mapgen-core/src/engine/tags.ts`
- Conceptual clarification (buffers vs artifacts vs fields) is documented:
  - `docs/system/libs/mapgen/architecture.md` (“Pipeline state kinds”)

## 6) Domain modeling boundaries (ops vs rules vs strategies)

Target spec stance:
- Ops are contract-first and are the only step-callable entrypoint; rules are internal and must not export types:
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`

Current implementation:
- Domain modules are mod-owned and follow the “ops module” pattern:
  - `mods/mod-swooper-maps/src/domain/*`

## 7) Observability + tracing

Target spec stance:
- Observability is required at baseline (structured errors; plan fingerprint/runId); tracing is optional:
  - `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-012-observability-baseline-is-required-runid-plan-fingerprint-structured-errors-rich-tracing-is-optional-and-toggleable.md`

Current implementation:
- Trace config lives in `Env.trace`:
  - `packages/mapgen-core/src/core/env.ts`
- Recipes create trace sessions from plans by default:
  - `packages/mapgen-core/src/authoring/recipe.ts` (`createTraceSessionFromPlan`, `createConsoleTraceSink`)

## 8) “Where should this live?” (doc alignment hints)

Working set docs that already match the target mental model well:
- `docs/system/libs/mapgen/architecture.md`
- `docs/system/libs/mapgen/hydrology-api.md`
- `docs/system/libs/mapgen/realism-knobs-and-presets.md`

Import policy (DX-critical; must be explicit in canonical docs/examples):
- Prefer published entrypoints:
  - SDK: `@swooper/mapgen-core` and its subpath exports (`@swooper/mapgen-core/authoring`, `@swooper/mapgen-core/engine`, `@swooper/mapgen-core/trace`).
- Treat `@mapgen/*` as **internal-only**:
  - In `packages/mapgen-core`, `@mapgen/*` is a TS path alias for the package’s own `src/*` (`packages/mapgen-core/tsconfig.paths.json`).
  - In `mods/mod-swooper-maps`, `@mapgen/domain/*` is a TS path alias for the mod’s own `src/domain/*` (`mods/mod-swooper-maps/tsconfig.json`).
  - Do not use `@mapgen/*` in docs intended for external readers unless you also explain *which workspace/package defines that alias*.

Docs that need explicit reconciliation (high risk of drift):
- `docs/projects/mapgen-studio/resources/seams/SEAM-RECIPES-ARTIFACTS.md` (references deleted `packages/browser-recipes`)
- Any Studio-facing docs that describe recipe import surfaces or protocol types (must match current `apps/mapgen-studio/src/recipes/catalog.ts`)
