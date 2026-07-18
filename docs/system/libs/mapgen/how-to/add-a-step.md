<toc>
  <item id="purpose" title="Purpose"/>
  <item id="prereqs" title="Prereqs"/>
  <item id="checklist" title="Checklist"/>
  <item id="verification" title="Verification"/>
  <item id="footguns" title="Footguns"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# How-to: add a step

## Purpose

Add a new **step** to a recipe stage (target posture: step contracts + dependency tags + artifacts; no hidden coupling).

This how-to is **recipe-level** (steps are authored/registered in a recipe). It routes to:

- Step authoring contract reference: [`docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`](/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md)
- Tag registry reference: [`docs/system/libs/mapgen/reference/TAGS.md`](/system/libs/mapgen/reference/TAGS.md)
- Artifact reference: [`docs/system/libs/mapgen/reference/ARTIFACTS.md`](/system/libs/mapgen/reference/ARTIFACTS.md)
- Import policy: [`docs/system/libs/mapgen/policies/IMPORTS.md`](/system/libs/mapgen/policies/IMPORTS.md)

## Prereqs

- You know which **domain** you’re extending (Foundation/Morphology/Hydrology/Ecology/Gameplay) and which **stage** owns the new step.
- You have a step id and phase that fit the stage’s naming/ordering conventions.

## Checklist

### 1) Decide the contract surface (before writing code)

- Pick a stable step id (string) and phase (`"foundation" | "morphology" | "hydrology" | "ecology" | "gameplay" | ...`).
- Identify required dependency tags (what must exist before your step can run).
- Identify provided dependency tags (what your step guarantees after it runs).
- Identify artifacts read/write needs (buffer vs snapshot; publish-once rule).

### 2) Define the step contract (`defineStep`)

- Create `steps/<step-id>/config.ts`; the directory name must equal the contract id.
- Use `defineStep({ id, phase, requires, provides, artifacts, ops, schema })`.
- Wire **artifact requirements** (and any required ops) explicitly into the contract.

Representative example (artifact + ops wiring; excerpt; see full file in anchors):

```ts
import { Type, defineStep } from "@swooper/mapgen-core/authoring";

/** Contract and compiled configuration boundary for geomorphic evolution. */
export const GeomorphologyStepContract = defineStep({
  id: "geomorphology",
  phase: "morphology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      morphologyArtifacts.topography,
      morphologyArtifacts.routing,
      morphologyArtifacts.substrate,
    ],
  },
  ops: {
    geomorphology: morphology.ops.computeGeomorphicCycle,
  },
  schema: Type.Object({}),
});
```

Notes:

- `morphologyArtifacts.*` is the stage-owned artifact contract module for this stage.
- `morphology.ops.*` is the domain op contract surface consumed by the step.

Representative example (dependency tags; excerpt; see full file in anchors):

```ts
import hydrology from "@mapgen/domain/hydrology";
import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../tag-contracts.js";
import { artifacts as hydrologyHydrographyArtifacts } from "../../../hydrology-hydrography/artifacts/index.js";
import { artifactModules as mapRiversArtifactModules } from "../../artifacts/index.js";

/** Contract and compiled configuration boundary for Civ7 river projection. */
export const PlotRiversStepContract = defineStep({
  id: "plot-rivers",
  phase: "gameplay",
  requires: [MAP_PROJECTION_EFFECT_TAGS.map.elevationBuilt],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.riversPlotted],
  artifacts: {
    requires: [hydrologyHydrographyArtifacts.hydrography],
    provides: [mapRiversArtifactModules.projectedNavigableRivers],
  },
  ops: {
    selectNavigableRiverTerrain: hydrology.ops.selectNavigableRiverTerrain,
  },
  schema: Type.Object({}),
});
```

### 3) Implement the step (`createStep`)

- Create `steps/<step-id>/step.ts` and call `createStep(YourStepContract, { normalize?, run })`.
- Keep step code “boring”: read inputs from `deps`/artifacts, mutate only permitted buffers, publish only allowed artifacts, emit trace/viz only via `context.trace` / `context.viz`.
- Prefer `context.trace.event(() => ({ ... }))` for verbose-only structured dumps.

Representative example (excerpt; see full file in anchors):

```ts
import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { GeomorphologyStepContract } from "./config.js";

/** Applies the domain geomorphology operation to the stage's admitted evidence. */
export const GeomorphologyStep = createStep(GeomorphologyStepContract, {
  normalize: (config, ctx) => {
    return config;
  },
  run: (context, config, ops, deps) => {
    const routing = deps.artifacts.routing.read(context);
    const heightfield = context.buffers.heightfield;

    const deltas = ops.geomorphology(
      {
        width: context.dimensions.width,
        height: context.dimensions.height,
        elevation: heightfield.elevation,
        landMask: heightfield.landMask,
        flowDir: routing.flowDir,
        flowAccum: routing.flowAccum,
        erodibilityK: deps.artifacts.substrate.read(context).erodibilityK,
        sedimentDepth: deps.artifacts.substrate.read(context).sedimentDepth,
      },
      config.geomorphology
    );

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.geomorphology.elevationDelta",
      spaceId: "tile.hexOddR",
      dims: context.dimensions,
      format: "f32",
      values: deltas.elevationDelta,
      meta: defineVizMeta("morphology.geomorphology.elevationDelta", { label: "Elevation Delta" }),
    });

    context.trace.event(() => ({ kind: "morphology.geomorphology.summary" }));
  },
});
```

### 4) Register the step in its stage

- Import the named step contract into `recipes/standard/contract-manifest.ts` and add it to its
  owning stage's ordered contract list.
- Import the named step directly into the stage root; do not add a `steps/index.ts` barrel.
- Pass the stage's named step registry through `orderStandardStageSteps(...)`; do not maintain a
  second unmanaged runtime order.
- Place the contract in manifest order after its requirements are satisfied and before any steps
  that require its provides.

Representative example (contract-manifest registration):

```ts
import { GeomorphologyStepContract } from "./stages/morphology-erosion/steps/geomorphology/config.js";

export const standardStageContractManifest = [
  // ...
  stage("morphology-erosion", [GeomorphologyStepContract]),
  // ...
] as const;
```

Representative example (stage wiring; excerpt; see full file in anchors):

```ts
import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { GeomorphologyStep } from "./steps/geomorphology/step.js";

export default createStage({
  id: "morphology-erosion",
  // ...
  steps: orderStandardStageSteps("morphology-erosion", {
    geomorphology: GeomorphologyStep,
  }),
} as const);
```

### 5) Update dependency tags if needed

If your step introduces a new required/provided dependency tag:

- Define it and register it in the tag registry (see: [`docs/system/libs/mapgen/how-to/add-a-new-tag.md`](/system/libs/mapgen/how-to/add-a-new-tag.md)).

## Verification

- Run the package tests:
  - `nx run mapgen-core:test`
  - `nx run mod-swooper-maps:test`
- Enable verbose tracing for your step id and confirm the trace shows:
  - `step.start` and `step.finish` for your step id
  - expected `step.event` payloads (if you emit them)
- If your step emits viz layers via `context.viz?.dumpGrid(...)`, confirm a run produces a layer entry in the viz manifest:
  - Use the local dump harness patterns referenced in the anchors below.

## Footguns

- **Forgetting to register the step**: writing a contract and implementation does nothing unless the stage/recipe composes it.
- **Missing dependency tags**: the executor will fail early with `MissingDependencyError`; fix by adding tags/provides or adjusting ordering.
- **Republishing buffer artifacts**: buffer artifacts are “publish once, mutate via `ctx.buffers`”; don’t republish in later steps.
- **Import drift**: prefer published entrypoints (see import policy); avoid workspace-only MapGen aliases in docs/examples unless explicitly internal.

## Ground truth anchors

- Step contract API: `packages/mapgen-core/src/authoring/step/contract.ts`
- Step implementation wrapper: `packages/mapgen-core/src/authoring/step/create.ts`
- Example step config: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/steps/geomorphology/config.ts`
- Example step implementation: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/steps/geomorphology/step.ts`
- Example step config (dependency tags): `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plot-rivers/config.ts`
- Example stage wiring: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/index.ts`
- Pipeline executor dependency gating: `packages/mapgen-core/src/engine/PipelineExecutor.ts`
