<toc>
  <item id="purpose" title="Purpose"/>
  <item id="split" title="Why compilation is split"/>
  <item id="config" title="Config compilation"/>
  <item id="plan" title="Plan compilation"/>
  <item id="benefits" title="Benefits"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Pipeline compilation (explanation)

## Purpose

Explain why MapGen splits compilation into:

1) config compilation (strict schema + normalization), and
2) plan compilation (recipe → execution nodes),
before runtime execution.

Contract reference:
- [`docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`](/system/libs/mapgen/reference/CONFIG-COMPILATION.md)
- [`docs/system/libs/mapgen/reference/PLAN-COMPILATION.md`](/system/libs/mapgen/reference/PLAN-COMPILATION.md)

## Why compilation is split

MapGen needs to support:
- strict, user-facing config errors (early, actionable),
- deterministic replay (same inputs, same plan fingerprint),
- and stable run boundaries (Studio worker) that don’t couple to internal types.

If compilation is interleaved with execution, drift and errors become harder to reason about.

## Config compilation

Config compilation transforms a user surface config into:
- per-step config objects that are schema-valid,
- with op defaults filled,
- and with deterministic normalization applied.

This is where most “author mistakes” should be caught.

## Plan compilation

Plan compilation converts a recipe’s ordered steps into:
- an execution plan with node list (`stepId` + compiled config),
- a stable plan fingerprint for trace/viz identity.

## Benefits

- Faster failure: schema errors before any expensive compute.
- Better observability: stable run/plan identity and step scopes.
- Better DX: the worker boundary can accept “unknown config” safely and still run.

## Ground truth anchors

- Config compilation: `packages/mapgen-core/src/compiler/recipe-compile.ts`
- Plan compilation: `packages/mapgen-core/src/engine/execution-plan.ts`
- Executor consumes execution plan nodes: `packages/mapgen-core/src/engine/PipelineExecutor.ts`
