<toc>
  <item id="purpose" title="Purpose"/>
  <item id="what-youll-learn" title="What you’ll learn"/>
  <item id="prereqs" title="Prereqs"/>
  <item id="walkthrough" title="Walkthrough"/>
  <item id="verification" title="Verification"/>
  <item id="next" title="Next steps"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Tutorial: run the standard recipe in Studio

## Purpose

Run the current canonical **standard recipe** end-to-end inside **MapGen Studio** and learn the “happy path” for:
- selecting a recipe/runtime,
- compiling config → plan,
- running the plan in a worker,
- and inspecting trace/viz outputs.

This tutorial intentionally avoids re-teaching contracts; it routes to reference/policies when needed.

## What you’ll learn

- Where Studio gets its bundled runtime recipes.
- How “compile” and “run” are separated.
- How to use Studio’s worker run boundary as the canonical dev posture.

## Prereqs

- You can run the repo locally (`bun install` has completed).
- You have a working browser with WebGL.

## Walkthrough

### 1) Start Studio

From the repo root:

- `bun run dev:mapgen-studio`

### 2) Select the Standard recipe runtime

In the Studio UI:
- Choose recipe: `mod-swooper-maps/standard` (label: “Swooper Maps / Standard”).

### 3) Choose run settings and start a run

- Set seed and map dimensions (or accept defaults).
- Click the run action (the run executes inside a Web Worker).

### 4) Observe pipeline stages and step progress

- Verify the UI reflects stage/step identities derived from the recipe’s UI meta.
- Open step detail views (if present) to correlate:
  - full step id (namespace + recipe + step)
  - phase/stage grouping

### 5) Inspect trace/viz outputs

- Use Studio’s trace/viz views to confirm:
  - step start/finish ordering aligns with the canonical standard recipe doc
  - viz layers appear for steps that emit `context.viz?.dumpGrid(...)`

When you need deeper grounding:
- Standard recipe reference: `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- Visualization reference: `docs/system/libs/mapgen/reference/VISUALIZATION.md`
- Canonical deck.gl viz doc: `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

## Verification

- Studio can compile and run `mod-swooper-maps/standard` without crashing.
- The run shows step-level progress (at minimum: started/finished).
- When trace/viz is enabled, you can see:
  - step start/finish events
  - at least one viz layer for stages that emit layers

## Next steps

- Learn how to debug with trace + viz outside Studio: `docs/system/libs/mapgen/how-to/debug-with-trace-and-viz.md`
- Learn the reference contract model for stages/steps: `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`
- Inspect the artifact/projection model: `docs/system/libs/mapgen/tutorials/inspect-artifacts-and-projections.md`

## Ground truth anchors

- Studio runtime recipe selection boundary: `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts`
- Studio bundled recipe catalog (config schema + UI meta): `apps/mapgen-studio/src/recipes/catalog.ts`
- Studio worker client (worker creation): `apps/mapgen-studio/src/features/browserRunner/workerClient.ts`
- Studio worker entrypoint (plan compile + run): `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`
- Standard recipe module: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
