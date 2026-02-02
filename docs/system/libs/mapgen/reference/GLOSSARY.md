<toc>
  <item id="purpose" title="Purpose"/>
  <item id="terms" title="Terms"/>
  <item id="drift" title="Drift vocabulary (target vs current)"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Glossary

## Purpose

Canonical MapGen vocabulary used across docs (policies, reference, tutorials).

## Terms

- **`planFingerprint`**: Stable identity of an execution plan (hash of recipe id/schema, env/run settings, and step configs; excludes trace config).
- **`runId`**: Stable identity for a run used by trace/dumps.
  - Current implementation: `runId === planFingerprint` (`deriveRunId(plan)` delegates to `computePlanFingerprint(plan)`).
- **Recipe (authoring)**: A typed module that declares stages and steps (the “blueprint”).
- **Recipe config (authoring input)**: User-provided data that parameterizes the recipe; validated and defaulted during config compilation.
- **Compiled recipe config**: The shape-preserving, schema-valid config bundle produced by `compileRecipeConfig(...)`.
- **RecipeV2 (runtime)**: A structural representation of steps (id + enabled + config) that is used to compile an execution plan.
- **Run request / run boundary**: The input boundary that is compiled into an execution plan and then executed.
- **Execution plan**: A list/graph of execution nodes derived from the recipe, registry, and run settings/env.
- **Step**: A single execution unit with a stable id, `requires/provides`, a phase, and an implementation.
- **Phase**: The step’s `GenerationPhase` (used for ordering/grouping and observability).
- **Stage (authoring)**: An authoring-time grouping used to organize steps and compile stage-specific config into step configs.
- **Op**: A strategy envelope used *within* a step (declared via `contract.ops`) to make algorithms configurable without turning the step schema into an untyped bag of options.
- **TagRegistry**: Registry that validates dependency tags and their kinds; used to enforce wiring correctness.
- **StepRegistry**: Registry of step implementations and their dependency tags.
- **Dependency tag**: A string id describing a required/provided dependency (e.g., `artifact:*`, `field:*`, `effect:*`).
- **Artifact**: Write-once published values; consumers treat them as immutable.
- **Field / buffer**: A performance exception; published once and mutated in-place (do not republish). (Docs may say “buffer”; current dependency tags often say `field:*`.)
- **Overlay**: A visualization/UI layer (e.g. a deck.gl layer entry), not an engine primitive.
- **Truth vs projection**: Canonical domain primitives vs derived engine-facing/debug surfaces.

## Drift vocabulary (target vs current)

There are two high-impact drift pairs; docs must not invent a third term:

- Target **RunSettings** vs current code **Env**.
- Spec `buffer:*` naming vs current runtime `field:*` naming (mutable engine-facing surfaces).

## Ground truth anchors

- RecipeV2 and RunRequest schemas: `packages/mapgen-core/src/engine/execution-plan.ts`
- `createRecipe(...)` authoring surface: `packages/mapgen-core/src/authoring/recipe.ts`
- TagRegistry and StepRegistry: `packages/mapgen-core/src/engine/tags.ts`, `packages/mapgen-core/src/engine/StepRegistry.ts`
- Policies: `docs/system/libs/mapgen/policies/POLICIES.md`
