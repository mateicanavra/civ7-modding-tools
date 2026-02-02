<toc>
  <item id="purpose" title="Purpose"/>
  <item id="step-contract" title="Step contract (defineStep)"/>
  <item id="step-module" title="Step module (createStep)"/>
  <item id="stage-contract" title="Stage contract (config compilation boundary)"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Stage and step authoring

## Purpose

Define the canonical authoring-time contracts for stages and steps.

## Step contract (defineStep)

A step contract defines:

- `id` (kebab-case, stable)
- `phase` (generation phase)
- `requires` / `provides` tags (validated)
- optional `artifacts` requires/provides (preferred over mixing artifact tags into requires/provides)
- `schema` (TypeBox schema; closed by default)
- optional `ops` decl (op contracts used by the step, with schema-enveloped strategies)

Representative example (dependency tags + artifact requirements; excerpt; see full file in anchors):

```ts
import { defineStep, Type } from "@swooper/mapgen-core/authoring";
import { M4_EFFECT_TAGS, M10_EFFECT_TAGS } from "../../../tags.js";
import { hydrologyHydrographyArtifacts } from "../../hydrology-hydrography/artifacts.js";

export default defineStep({
  id: "plot-rivers",
  phase: "gameplay",
  requires: [M10_EFFECT_TAGS.map.elevationBuilt],
  provides: [M4_EFFECT_TAGS.engine.riversModeled],
  artifacts: { requires: [hydrologyHydrographyArtifacts.hydrography], provides: [] },
  schema: Type.Object({}),
});
```

## Step module (createStep)

A step module pairs a step contract with an implementation:

- optional `normalize(config, ctx)` hook (must be shape-preserving)
- `run(context, config, ops, deps)` implementation
- optional artifact helpers surface (depending on artifacts contract)

Representative example (createStep boundary; excerpt; see full file in anchors):

```ts
import { NAVIGABLE_RIVER_TERRAIN } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import PlotRiversStepContract from "./plotRivers.contract.js";

export default createStep(PlotRiversStepContract, {
  normalize: (config, ctx) => {
    // shape-preserving; may use ctx.knobs deterministically
    return config;
  },
  run: (context, config, _ops, deps) => {
    const hydrography = deps.artifacts.hydrography.read(context);
    // ... optional trace/viz from hydrography ...
    context.adapter.modelRivers(config.minLength, config.maxLength, NAVIGABLE_RIVER_TERRAIN);
  },
});
```

## Stage contract (config compilation boundary)

Stages exist to compile stage-level configuration into per-step config:

- `stage.surfaceSchema` validates the stage config surface.
- `stage.toInternal({ env, stageConfig })` returns:
  - `knobs` (derived tuning)
  - `rawSteps` (per-step raw config objects)

The output is then strictly validated and normalized step-by-step by config compilation.

## Ground truth anchors

- Step contract definition and invariants: `packages/mapgen-core/src/authoring/step/contract.ts`
- Step module creation: `packages/mapgen-core/src/authoring/step/create.ts`
- Config compilation uses StageContractAny/StepModuleAny: `packages/mapgen-core/src/compiler/recipe-compile.ts`
- Policy: schemas and validation: `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`
- Example step contract (tags + artifacts): `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/plotRivers.contract.ts`
- Example step module (createStep boundary): `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/plotRivers.ts`
