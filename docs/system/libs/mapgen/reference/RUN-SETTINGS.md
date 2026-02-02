<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract (target + current mapping)"/>
  <item id="schema" title="Current schema (Env)"/>
  <item id="examples" title="Examples"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Run settings (target) / env (current)

## Purpose

Define the run boundary settings: what is fixed per run, how it is validated, and how it flows into compilation and execution.

## Contract (target + current mapping)

### Target posture (engine-refactor-v1)

Target naming is:

```ts
type RunRequest = { recipe: Recipe; settings: RunSettings };
```

### Current reality (code)

Current naming in `@swooper/mapgen-core` is:

```ts
type RunRequest = { recipe: RecipeV2; env: Env };
```

Docs should prefer **RunSettings** as the concept, but must include the mapping to **Env** until the code converges.

## Current schema (Env)

Env is strict (no additionalProperties) and currently includes:

- `seed: number`
- `dimensions: { width: number; height: number }`
- `latitudeBounds: { topLatitude: number; bottomLatitude: number }`
- `metadata?: Record<string, unknown>`
- `trace?: { enabled?: boolean; steps?: Record<string, \"off\"|\"basic\"|\"verbose\"> }`

## Examples

Minimal Env:

```json
{
  "seed": 12345,
  "dimensions": { "width": 80, "height": 52 },
  "latitudeBounds": { "topLatitude": 70, "bottomLatitude": -70 }
}
```

## Ground truth anchors

- Env schema: `packages/mapgen-core/src/core/env.ts`
- RunRequest schema uses `env` today: `packages/mapgen-core/src/engine/execution-plan.ts`
- Target posture: pipeline boundary is `RunRequest = { recipe, settings }` compiled to `ExecutionPlan`: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-003-pipeline-boundary-is-runrequest-recipe-settings-compiled-to-executionplan.md`

