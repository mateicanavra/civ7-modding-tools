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

- **`planFingerprint`**: Stable identity of an execution plan (hash of recipe id/schema, map setup, and each node's id, stage id, `requires`, `provides`, and config; observation policy is excluded by construction).
- **`runId`**: Unique identity for one execution attempt, shared by its trace, metrics, and visualization evidence.
  - Repeated executions of the same plan receive distinct run ids while retaining the same `planFingerprint`.
- **Recipe (authoring)**: A typed module that declares stages and steps (the “blueprint”).
- **Recipe config (authoring input)**: User-provided data that parameterizes the recipe; validated and defaulted during config compilation.
- **Compiled recipe config**: The shape-preserving, schema-valid config bundle produced by `compileRecipeConfig(...)`.
- **RecipeV2 (runtime)**: A structural representation of steps (id + enabled + config) that is used to compile an execution plan.
- **Run request / run boundary**: The input boundary that is compiled into an execution plan and then executed.
- **Map setup**: Immutable physical initial conditions for one run: seed, dimensions, and latitude bounds.
- **Map context**: One run-scoped carrier for setup, adapter, deterministic random state, artifacts, and the executor's current trace scope.
- **Execution plan**: A list/graph of execution nodes derived from the recipe, registry, and `MapSetup`.
- **Step**: A single execution unit with a stable id, `requires/provides`, and an implementation.
- **Stage (authoring)**: The recipe-owned grouping that assigns each composed step its exact `stageId`, organizes authoring, and compiles stage-specific config into step configs.
- **Op**: A strategy envelope used *within* a step (declared via `contract.ops`) to make algorithms configurable without turning the step schema into an untyped bag of options.
- **TagRegistry**: Registry that validates dependency tags and their kinds; used to enforce wiring correctness.
- **StepRegistry**: Registry of step implementations and their dependency tags.
- **Dependency tag**: A string id describing a required/provided dependency. The closed kinds are `artifact:*` data and `effect:*` execution guarantees.
- **Artifact**: Write-once published values; consumers treat them as immutable.
- **Overlay**: A visualization/UI layer (e.g. a deck.gl layer entry), not an engine primitive.
- **Truth vs projection**: Canonical domain primitives vs derived engine-facing/debug surfaces.

## Drift vocabulary (target vs current)

Legacy specs may call `MapSetup` either `RunSettings` or `Env`; current code and docs use
`MapSetup` / `setup` exclusively.

## Ground truth anchors

- RecipeV2 and RunRequest schemas: `packages/mapgen-core/src/engine/execution-plan.ts`
- `createRecipe(...)` authoring surface: `packages/mapgen-core/src/authoring/recipe.ts`
- TagRegistry and StepRegistry: `packages/mapgen-core/src/engine/tags.ts`, `packages/mapgen-core/src/engine/StepRegistry.ts`
- Policies: `docs/system/libs/mapgen/policies/POLICIES.md`
