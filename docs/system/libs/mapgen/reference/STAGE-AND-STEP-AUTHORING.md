<toc>
  <item id="purpose" title="Purpose"/>
  <item id="step-contract" title="Step contract (defineStep)"/>
  <item id="step-module" title="Step module (createStep)"/>
  <item id="stage-contract" title="Stage contract (config compilation boundary)"/>
  <item id="recipe-dag-projection" title="Recipe DAG projection"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Stage and step authoring

## Purpose

Define the canonical authoring-time contracts for stages and steps.

Artifact definitions and catalogs are not stage authoring surfaces. They live
with the direct producing domain module; step contracts select those exact
immutable product authorities for reads and publication.

## Step contract (defineStep)

A step contract defines:

- `id` (kebab-case, stable)
- optional `description` (the sole semantic description authority for the step)
- `requires` / `provides`, the sole ordered dependency lists. Exact `Artifact`
  authorities and typed completion id constants appear together; raw
  `artifact:*` strings are invalid.
- optional `engine` method keys (an exact occurrence-scoped adapter capability set)
- optional recipe-owned `initialSetup` authority (types immutable
  `context.initialSetup` for that step and must match the recipe's exact
  authority; it is invocation context, not a dependency edge)
- optional `ops` decl (op contracts used by the step, with schema-enveloped strategies)
- optional additive `schema` for genuine step-local authored fields

The step is a closed authoring kind. Its directory contains exactly
`config.ts` and `step.ts`, plus an optional `viz.ts` only when the step
definition attaches that visualization. Private orchestration stays in
`step.ts`. Reusable policy, algorithms, immutable products, diagnostics, and
metrics move to their qualified stage, domain, recipe, or SDK owner rather than
becoming loose step helpers.

Operation config is composed into the step schema automatically. Omit `schema`
when that operation surface is complete; Core creates a fresh closed empty
object when a step has neither operation nor step-local fields. An explicit
schema adds only real step-local authoring and must not be an empty shell or
restate bound operation config. Root-schema `description` is refused: author
the step's purpose once through `description`, which Core projects onto the
final composed schema consumed by Stage and Studio.

Representative example (completion + artifact requirements; excerpt; see full file in anchors):

The `@mapgen/domain/*` alias is the current mod-local domain surface. Contract
authors consume the pure root contract and the exact producing module's
artifact catalog; recipe runtime composition consumes `/router`. Do not
recreate flat `/ops`, domain-root artifact catalogs, or stage-local artifact
catalogs as compatibility surfaces.

```ts
import { artifacts as hydrologyHydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "@mapgen/domain/morphology/modules/shelf/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { STANDARD_COMPLETIONS } from "../../../../../completions.js";

/** Contract and compiled configuration boundary for Civ7 river projection. */
export const config = defineStep({
  id: "plot-rivers",
  engine: [
    "isWater",
    "getTerrainType",
    "setTerrainType",
    "modelRivers",
    "validateAndFixTerrain",
    "storeWaterData",
    "defineNamedRivers",
    "recalculateAreas",
    "readRiverProjection",
  ] as const,
  requires: [
    STANDARD_COMPLETIONS.elevationBuilt,
    STANDARD_COMPLETIONS.rainfallProjected,
    hydrologyHydrographyArtifacts.hydrography,
    hydrologyHydrographyArtifacts.lakePlan,
    hydrologyHydrographyArtifacts.riverNetwork,
    morphologyShelfArtifacts.shelf,
    morphologyLandformsArtifacts.topography,
  ],
  provides: [
    STANDARD_COMPLETIONS.riversPlotted,
    hydrologyHydrographyArtifacts.projectedNavigableRivers,
  ],
  schema: Type.Object({
    endpointDischargePercentileMin: Type.Number({ minimum: 0, maximum: 1 }),
    targetMajorTileFraction: Type.Number({ minimum: 0, maximum: 1 }),
  }),
});
```

Every leaf `config.ts` exports its step contract through the owner-local binding
`config`. Step contracts import the domain root contract when selecting operations and
the exact producing module's catalog when selecting artifacts. A stage-local
catalog is not an alternate owner. Step contracts never import a domain router.
The runtime-only `@mapgen/domain/<domain>/router` surface is composed once by
the recipe root to register executable implementations. Composition code may
alias imported configs when multiple leaves would otherwise collide; it does
not rename the leaf export.

## Step module (createStep)

A step module pairs a step contract with an implementation:

- optional `normalize(config, ctx)` hook (must be shape-preserving)
- `run(context, config, ops, deps)` implementation

`createStep` binds behavior only. `requires` and `provides` select the same canonical artifact
objects used by their owning catalogs, so implementations cannot declare a second provider or validator surface. At each
invocation, Core derives only the exact occurrence-bound `read()` and `publish(value)` capabilities
declared by that step contract; there is no provider runtime registry, map, or cache.

`context.setup` always exposes Core's physical `MapSetup`. A step declaring a
recipe-owned `initialSetup` authority also receives the exact already-admitted
recipe value as `context.initialSetup`. That declaration selects the invocation
context type and preserves exact recipe compatibility; it does not add a
provider, reader, or second admission transition to `deps`.

The same contract binds `deps.engine` to only the declared adapter methods. Calls are
context-first (`deps.engine.method(context, ...)`) and valid only during that exact step
occurrence; `MapContext` never exposes the raw adapter.

Representative example (createStep boundary; excerpt; see full file in anchors):

```ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { selectNavigableRiverTerrain } from "../../model/policy/navigable-river-projection.js";
import { config } from "./config.js";

/** Projects admitted river evidence into Civ7 and captures engine readback. */
export const PlotRiversStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const hydrography = deps.artifacts.hydrography.read();
    const projected = selectNavigableRiverTerrain(
      {
        width: context.setup.dimensions.width,
        height: context.setup.dimensions.height,
        riverClass: hydrography.riverClass,
        discharge: hydrography.discharge,
        flowDir: hydrography.flowDir,
        projectableLandMask: /* finalized projectable terrain mask */,
      },
      stepConfig
    );
    // ... stamp projected.riverMask through deps.engine.setTerrainType(context, ...) ...
    // ... refresh Civ caches, publish immutable intent, and keep current readback local ...
  },
});
```

Do not use the old `TerrainBuilder.modelRivers` delegation pattern as a new
MapGen truth template. Hydrology owns river truth; `map-rivers` projects the
Civ-visible navigable terrain subset and records planned minor/major intent.
Mutable engine readback is observed at the decision or proof boundary that needs it; it is not a
later-consumed artifact. A bounded
adapter-owned `modelRivers(...)` call is allowed only after Hydrology-selected
terrain stamping, as native Civ materialization for metadata/model/cache state.

## Stage contract (config compilation boundary)

Stages exist to compile stage-level configuration into per-step config:

- `stage.surfaceSchema` validates the stage config surface.
- `stage.toInternal({ setup, stageConfig })` returns:
  - `knobs` (derived tuning)
  - `rawSteps` (per-step raw config objects)
- Stage contracts compose step contracts; they do not define artifact catalogs
  or turn mutable engine observations into pipeline products.

The output is then strictly validated and normalized step-by-step by config compilation.

## Recipe DAG projection

`buildRecipeDag(...)` is the read-only authoring projection for visualizing a
recipe's artifact dependency graph. It consumes authored stage contracts and
returns a JSON-safe DTO for tools such as MapGen Studio.

Projection rules:

- Stages are graph nodes.
- Exact `Artifact` references in step `requires` and `provides` create artifact
  edges.
- Typed string completion dependencies in those same lists remain metadata;
  they are not converted into artifact edges.
- Same-stage artifact dependencies are retained as internal edges.
- Recipe order remains the source of truth for stage and step order.

The projection may report diagnostics for missing artifact providers, duplicate
artifact providers, and provided artifacts with no consumers. It must not invent
topology by sorting or repairing the authored recipe.

## Ground truth anchors

- Step contract definition and invariants: `packages/mapgen-core/src/authoring/step/contract.ts`
- Step module creation: `packages/mapgen-core/src/authoring/step/create.ts`
- Artifact runtime implementation: `packages/mapgen-core/src/authoring/artifact/runtime.ts`
- Config compilation uses StageContractAny/StepModuleAny: `packages/mapgen-core/src/compiler/recipe-compile.ts`
- Recipe DAG projection: `packages/mapgen-core/src/authoring/recipe/dag.ts`
- Policy: schemas and validation: `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`
- Example step config (contract + artifacts): `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology/rivers/steps/plot-rivers/config.ts`
- Example step module (createStep boundary): `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology/rivers/steps/plot-rivers/step.ts`
