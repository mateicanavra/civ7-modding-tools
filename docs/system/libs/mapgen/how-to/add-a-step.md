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
- You have a stable step id and know which authored stage owns it.

## Checklist

### 1) Decide the contract surface (before writing code)

- Pick a stable step id. Recipe composition assigns the exact `stageId`; the step must not duplicate a coarse phase label.
- Identify required dependency tags (what must exist before your step can run).
- Identify provided dependency tags (what your step guarantees after it runs).
- Identify the exact immutable domain-module artifacts the step reads and the
  new product vintages it publishes once. Current engine state and completion
  effects are not artifacts.

### 2) Define the step contract (`defineStep`)

- Create the closed `steps/<step-id>/` leaf; the directory name must equal the
  contract id. It contains required `config.ts` and `step.ts`, and may contain
  `viz.ts` only when the step attaches that visualization.
- Export that leaf-owned step contract as `config`. Composition code may alias
  imported configs to avoid collisions; the leaf export itself is never renamed.
- Use `defineStep({ id, description, requires, provides, artifacts, ops })`.
- Wire **artifact requirements** (and any required ops) explicitly into the contract.
- Put the step's causal, reader-facing purpose in the optional first-class
  `description`. Core projects that one authority onto the final composed
  TypeBox schema for Stage and Studio consumers.
- Omit `schema` when the step has no genuine step-local authoring. Operation
  config is composed into the step surface automatically, and Core supplies a
  fresh closed empty object when neither surface contributes fields. Add an
  explicit `schema` only for real additive step-local fields; never use an
  empty shell, restate operation config, or put the step description on the
  root schema.

Representative example (artifact + ops wiring; excerpt; see full file in anchors):

```ts
import morphology from "@mapgen/domain/morphology";
import { artifacts as morphologyErosionArtifacts } from "@mapgen/domain/morphology/modules/erosion/artifacts/index.js";
import { artifacts as morphologyRoutingArtifacts } from "@mapgen/domain/morphology/modules/routing/artifacts/index.js";
import { artifacts as morphologyTerrainArtifacts } from "@mapgen/domain/morphology/modules/terrain/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/** Contract and compiled configuration boundary for geomorphic evolution. */
export const config = defineStep({
  id: "geomorphology",
  description: "Evolves admitted terrain through the configured geomorphic cycle.",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      morphologyTerrainArtifacts.baseTopography,
      morphologyRoutingArtifacts.routing,
      morphologyTerrainArtifacts.baseSubstrate,
    ],
    provides: [morphologyErosionArtifacts.erodedTopography, morphologyErosionArtifacts.substrate],
  },
  ops: {
    geomorphology: morphology.erosion.ops.computeGeomorphicCycle,
  },
});
```

Notes:

- Import operation contracts from the owning domain root, such as
  `import hydrology from "@mapgen/domain/hydrology"`.
- Import artifacts from the exact module catalog that owns them, such as
  `@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js`; domain and
  module contract indexes do not re-export artifact catalogs.
- Import `@mapgen/domain/<domain>/router` only at the recipe runtime root. Step
  contracts consume declaration contracts and never executable routers.
- A step contract selects only the operation contracts and artifact definitions
  that the step can actually execute, read, or publish.
- Artifact definitions and catalogs live with the direct producing domain
  module. Do not add an `artifacts/` catalog to a recipe stage; a stable
  artifact dependency name does not transfer catalog ownership to that stage.

Representative example (dependency tags; excerpt; see full file in anchors):

```ts
import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import { artifacts as hydrologyHydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";

/** Contract and compiled configuration boundary for Civ7 river projection. */
export const config = defineStep({
  id: "plot-rivers",
  requires: [MAP_PROJECTION_EFFECT_TAGS.map.elevationBuilt],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.riversPlotted],
  artifacts: {
    requires: [hydrologyHydrographyArtifacts.hydrography],
    provides: [hydrologyHydrographyArtifacts.projectedNavigableRivers],
  },
  schema: Type.Object({
    endpointDischargePercentileMin: Type.Number({ minimum: 0, maximum: 1 }),
    targetMajorTileFraction: Type.Number({ minimum: 0, maximum: 1 }),
  }),
});
```

`plot-rivers` deliberately has no domain operation for engine-constrained
navigable selection. Its `step.ts` calls the stage-owned
`model/policy/navigable-river-projection.ts` policy using thresholds compiled
from the same owner. Use the same distinction when behavior belongs to one
recipe projection rather than the reusable domain model; do not create a
step-local `rules/` or helper cabinet.

### 3) Implement the step (`createStep`)

- Create `steps/<step-id>/step.ts`, import `{ config }` from the sibling
  `config.ts`, and call `createStep(config, { normalize?, run, viz? })`.
- Keep private execution in `step.ts`. Move reusable logic to the nearest
  qualified stage/domain/SDK owner, and use `viz.ts` only for substantial pure
  visualization projection attached by the step.
- Keep step code “boring”: read admitted inputs, invoke domain operations, publish their completed
  products through declared artifacts, and emit structured debug events only through
  `context.trace`. A step does not finish a domain transition that its operation stopped halfway.
- Return any completed evidence needed by optional `metrics` or `viz` projectors. Recipe algorithms
  never receive a visualization sink.
- Read current engine state only through the step's declared `deps.engine`
  capabilities and keep that observation invocation-local. Metrics facets may
  retain completed scalar or component evidence, but that evidence is not a
  pipeline artifact.
- Prefer `context.trace.event(() => ({ ... }))` for verbose-only structured dumps.

Representative example (excerpt; see full file in anchors):

```ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { defineStandardVizMeta } from "../../../../viz.js";
import { config } from "./config.js";

/** Applies the domain geomorphology operation to the stage's admitted evidence. */
export const GeomorphologyStep = createStep(config, {
  normalize: (stepConfig, ctx) => {
    return stepConfig;
  },
  run: (context, stepConfig, ops, deps) => {
    const topography = deps.artifacts.baseTopography.read();
    const routing = deps.artifacts.routing.read();
    const substrate = deps.artifacts.baseSubstrate.read();

    const result = ops.geomorphology(
      {
        width: context.setup.dimensions.width,
        height: context.setup.dimensions.height,
        elevation: topography.elevation,
        seaLevel: topography.seaLevel,
        landMask: topography.landMask,
        flowDir: routing.flowDir,
        flowAccum: routing.flowAccum,
        erodibilityK: substrate.erodibilityK,
        sedimentDepth: substrate.sedimentDepth,
      },
      stepConfig.geomorphology
    );

    deps.artifacts.erodedTopography.publish(result.topography);
    deps.artifacts.substrate.publish(result.substrate);
    context.trace.event(() => ({ kind: "morphology.geomorphology.summary" }));
    return result;
  },
  viz: ({ result, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "morphology.geomorphology.elevationDelta",
      spaceId: "tile.hexOddQ",
      dims: dimensions,
      field: { format: "f32", values: result.deltas.elevationDelta },
      meta: defineStandardVizMeta(
        "morphology.geomorphology.elevationDelta",
        "field.signed",
        { label: "Elevation Delta" }
      ),
    },
  ],
});
```

### 4) Register the step in its stage

- Import each leaf-owned `config` into `recipes/standard/contract-manifest.ts`
  with a composition-local semantic alias and add it to its owning stage's
  ordered contract list.
- Import the named step directly into the stage root; do not add a `steps/index.ts` barrel.
- Pass the stage's named step registry through `orderStandardStageSteps(...)`; do not maintain a
  second unmanaged runtime order.
- Place the contract in manifest order after its requirements are satisfied and before any steps
  that require its provides.

Representative example (contract-manifest registration):

```ts
import { config as geomorphologyConfig } from "./stages/morphology/erosion/steps/geomorphology/config.js";

export const standardStageContractManifest = [
  // ...
  stage("morphology-erosion", [geomorphologyConfig]),
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
- If your step owns a `viz` projector, confirm a run with a visualization facet sink produces the
  expected layer entry in the viz manifest:
  - Use the local dump harness patterns referenced in the anchors below.

## Footguns

- **Forgetting to register the step**: writing a contract and implementation does nothing unless the stage/recipe composes it.
- **Missing dependency tags**: the executor will fail early with `MissingDependencyError`; fix by adding tags/provides or adjusting ordering.
- **Mutating consumed artifacts**: consumers must copy before mutation and publish a new, explicitly named vintage.
- **Creating a stage artifact catalog**: artifacts are immutable products of
  their direct domain module; recipe stages only select and publish those
  authorities.
- **Import drift**: prefer published entrypoints (see import policy); avoid workspace-only MapGen aliases in docs/examples unless explicitly internal.
- **Promoting recipe projection into a domain op**: engine-constrained or stage-specific rules stay
  with the recipe owner unless they define reusable domain behavior.

## Ground truth anchors

- Step contract API: `packages/mapgen-core/src/authoring/step/contract.ts`
- Step implementation wrapper: `packages/mapgen-core/src/authoring/step/create.ts`
- Example step config: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/erosion/steps/geomorphology/config.ts`
- Example step implementation: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/erosion/steps/geomorphology/step.ts`
- Example step config (dependency tags): `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology/rivers/steps/plot-rivers/config.ts`
- Example stage wiring: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/erosion/index.ts`
- Pipeline executor dependency gating: `packages/mapgen-core/src/engine/PipelineExecutor.ts`
