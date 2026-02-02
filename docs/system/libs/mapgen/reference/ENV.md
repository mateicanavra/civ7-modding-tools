<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract"/>
  <item id="schema" title="Schema (current code)"/>
  <item id="legacy" title="Legacy naming (RunSettings)"/>
  <item id="examples" title="Examples"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Env (run boundary)

## Purpose

Define the **run boundary**: what is fixed per run, how it is validated, and how it flows into plan compilation and execution.

## Contract

Canonical run request shape:

```ts
type RunRequest = { recipe: RecipeV2; env: Env };
```

`env` is treated as **runtime-provided** input (seed, dimensions, etc.). It is not an authoring surface.

## Schema (current code)

`Env` is strict (no additional properties) and currently includes:

- `seed: number`
- `dimensions: { width: number; height: number }`
- `latitudeBounds: { topLatitude: number; bottomLatitude: number }`
- `metadata?: Record<string, unknown>`
- `trace?: { enabled?: boolean; steps?: Record<string, \"off\"|\"basic\"|\"verbose\"> }`

## Legacy naming (RunSettings)

Some older specs and discussions used `RunSettings` / `settings` for the same idea.

In canonical docs and examples:
- prefer **`Env`** / `env`,
- and treat `RunSettings` only as a legacy term when mapping older material.

## Examples

Minimal `Env`:

```json
{
  "seed": 12345,
  "dimensions": { "width": 80, "height": 52 },
  "latitudeBounds": { "topLatitude": 70, "bottomLatitude": -70 }
}
```

## Ground truth anchors

- Env schema: `packages/mapgen-core/src/core/env.ts`
- Run request schema uses `env`: `packages/mapgen-core/src/engine/execution-plan.ts`
- Plan fingerprinting strips trace config: `packages/mapgen-core/src/engine/observability.ts`
