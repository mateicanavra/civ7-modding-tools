<toc>
  <item id="purpose" title="Purpose"/>
  <item id="prereqs" title="Prereqs"/>
  <item id="checklist" title="Checklist"/>
  <item id="verification" title="Verification"/>
  <item id="footguns" title="Footguns"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# How-to: add a new artifact

## Purpose

Add an artifact: a published, dependency-gated data product with one canonical
authority for identity, schema, and complete admission.

Routes to:
- Artifact reference: [`docs/system/libs/mapgen/reference/ARTIFACTS.md`](/system/libs/mapgen/reference/ARTIFACTS.md)
- Artifact mutation policy: [`docs/system/libs/mapgen/policies/ARTIFACT-MUTATION.md`](/system/libs/mapgen/policies/ARTIFACT-MUTATION.md)
- Dependency policy: [`docs/system/libs/mapgen/policies/DEPENDENCIES.md`](/system/libs/mapgen/policies/DEPENDENCIES.md)

## Prereqs

- Define the artifact as an immutable snapshot. A later value is a separately
  named vintage, not a mutation of the published artifact.
- Choose a stable id such as `"artifact:morphology.routing"`.
- Identify the owning artifact directory and the single step that publishes it.

## Checklist

### 1) Define one artifact

Create `artifacts/<name>.artifact.ts`. Author the complete payload schema and
any relational refinement directly on the single exported artifact authority.

```ts
import {
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/** Publishes geomorphic receivers and accumulation for Morphology terrain shaping. */
export const artifact = defineArtifact({
  name: "routing",
  id: "artifact:morphology.routing",
  schema: Type.Object(
    {
      flowDir: TypedArraySchemas.i32({ cardinality: "map-grid" }),
      flowAccum: TypedArraySchemas.f32({ cardinality: "map-grid" }),
      outlets: Type.Array(
        Type.Object(
          { x: Type.Integer(), y: Type.Integer() },
          { additionalProperties: false }
        )
      ),
    },
    {
      additionalProperties: false,
      description: "Immutable Morphology drainage routing fields.",
    }
  ),
  refine: (value, { issues }) => {
    issues.addGridCoordinates("outlets", value.outlets);
    return undefined;
  },
});
```

`defineArtifact` compiles exact typed-array admission from the inline schema and
always runs TypeBox structure, typed-array constructor/cardinality, and optional
semantic refinement in that order. `"map-grid"` binds the buffer to the
mandatory validation context's admitted dimensions; it is distinct from the
default input-relative `["width", "height"]` product and from
`"constructor-only"`.

Add `refine` only for relational or domain laws the schema metadata cannot
express. The value and facilities are inferred without annotations: the value
is deeply readonly, while facilities provide frozen `dimensions`, derived
`cellCount`, and the Core-owned `issues` sink. Append messages and return
exactly `undefined`; do not allocate or return an issue array.

The runtime module surface is closed to `artifact` plus erased TypeScript
types. Put only a genuinely shared schema primitive or cohesive subentity under
the owning domain model; a model atom never duplicates the complete artifact
container or owns artifact admission. Inline authoring keeps schema, identity,
and refinement visibly bound to one weighted artifact definition.

### 2) Register the artifact once

In the adjacent `artifacts/index.ts`, import each sibling authority by a
semantic key and export one direct catalog.

```ts
import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as routing } from "./routing.artifact.js";

/** Morphology artifact authorities keyed for contracts and consumers. */
export const artifacts = defineArtifactCatalog({ routing });
```

Do not add module, validator, contract, or handle projections. The artifact
already carries its schema and complete admission function.

### 3) Declare the same authority in step contracts

Producer and consumer contracts select the same catalog value.

```ts
import morphology from "@mapgen/domain/morphology";
import { artifacts as morphologyRoutingArtifacts } from "@mapgen/domain/morphology/modules/routing/artifacts/index.js";

export const config = defineStep({
  // ...id, dependencies, ops, and schema...
  requires: [],
  provides: [morphologyRoutingArtifacts.routing],
  ops: {
    routing: morphology.routing.ops.computeFlowRouting,
  },
});
```

Downstream steps put the same value directly in `requires`. Artifact authorities
already participate in selected-plan validation and runtime publication proof; do not replace them with raw
`artifact:*` ids.

### 4) Publish through the occurrence capability

At each step invocation, the SDK derives validated publication and read capabilities directly
from the declared artifact authorities.

```ts
export const RoutingStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const routing = ops.routing({ /* admitted inputs */ }, stepConfig.routing);
    deps.artifacts.routing.publish(routing);
  },
});
```

The domain root import above is a declaration contract. Recipe runtime
composition separately imports `@mapgen/domain/morphology/router`; artifact and
step modules must not pull executable routers into their contract surface.

Consumers read through `deps.artifacts.<name>.read()`. These capabilities are bound to the exact
active step occurrence; authored code never supplies context, constructs provider runtimes, or
reaches into MapContext storage.

## Verification

- Run the artifact kind authorities:
  - `bun habitat check --rule require_artifact_file_shape`
  - `bun habitat check --rule require_artifact_catalog_index_shape`
  - `bun habitat check --rule require_artifact_index_aggregate_shape`
- Run the owning Nx project typecheck and tests.
- For behavior-sensitive artifacts, execute the producer and confirm
  publication, downstream reads, and diagnostics against real values.

## Footguns

- **Incomplete admission**: declare typed-array cardinality in the schema, then
  add a refinement only when index ranges or cross-field relations still matter.
- **Second authority**: do not export a schema, validator, alias, or parallel map
  beside `artifact`.
- **Shared-schema smuggling**: a model atom is a smaller primitive or cohesive
  subentity, not a complete artifact payload or validator moved out of sight.
- **Duplicate provider authority**: artifacts belong in the step config's
  `provides` declaration, not a second list passed to `createStep`.
- **Publishing twice or mutating after publication**: each vintage has one
  producer and one immutable value.

## Ground truth anchors

- Artifact authority: `packages/mapgen-core/src/authoring/artifact/contract.ts`
- Artifact catalog: `packages/mapgen-core/src/authoring/artifact/catalog.ts`
- Artifact runtime: `packages/mapgen-core/src/authoring/artifact/runtime.ts`
- Step occurrence binding: `packages/mapgen-core/src/authoring/step/dependencies.ts`
- Example artifact owner: `mods/mod-swooper-maps/src/domain/foundation/modules/lithosphere/artifacts/plate-graph.artifact.ts`
- Example catalog: `mods/mod-swooper-maps/src/domain/foundation/modules/lithosphere/artifacts/index.ts`
