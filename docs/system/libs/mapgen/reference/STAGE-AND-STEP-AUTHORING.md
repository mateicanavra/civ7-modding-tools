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
- `requires` / `provides` tags (validated)
- optional `artifacts` requires/provides (preferred over mixing artifact tags into requires/provides)
- optional `engine` method keys (an exact occurrence-scoped adapter capability set)
- `schema` (TypeBox schema; closed by default)
- optional `ops` decl (op contracts used by the step, with schema-enveloped strategies)

Representative example (dependency tags + artifact requirements; excerpt; see full file in anchors):

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

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";

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
  requires: [MAP_PROJECTION_EFFECT_TAGS.map.elevationBuilt],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.riversPlotted],
  artifacts: {
    requires: [
      hydrologyHydrographyArtifacts.hydrography,
      hydrologyHydrographyArtifacts.lakePlan,
      hydrologyHydrographyArtifacts.riverNetwork,
      morphologyShelfArtifacts.shelf,
      morphologyLandformsArtifacts.topography,
    ],
    provides: [hydrologyHydrographyArtifacts.projectedNavigableRivers],
  },
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

`createStep` derives the provider runtime map from the artifacts already admitted by the step
contract. Requirements and provisions select the same canonical artifact objects; implementations
cannot declare a second provider or validator surface. Steps with no provided artifacts, an empty
provides tuple, or requires-only artifact dependencies have no provider runtime map.

The same contract binds `deps.engine` to only the declared adapter methods. Calls are
context-first (`deps.engine.method(context, ...)`) and valid only during that exact step
occurrence; `MapContext` never exposes the raw adapter.

Representative example (createStep boundary; excerpt; see full file in anchors):

```ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";
import { selectNavigableRiverTerrain } from "./rules/select-navigable-river-terrain.js";

/** Projects admitted river evidence into Civ7 and captures engine readback. */
export const PlotRiversStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const hydrography = deps.artifacts.hydrography.read(context);
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
- Explicit `step.contract.artifacts.requires/provides` entries create artifact
  edges.
- Step `requires/provides` tags remain metadata; they are not converted into
  artifact edges.
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
