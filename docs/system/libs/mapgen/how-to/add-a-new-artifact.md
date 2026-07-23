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
- Dependency id policy: [`docs/system/libs/mapgen/policies/DEPENDENCY-IDS-AND-REGISTRIES.md`](/system/libs/mapgen/policies/DEPENDENCY-IDS-AND-REGISTRIES.md)

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
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

type Routing = Readonly<{
  cellCount: number;
  flowDir: Int32Array;
  flowAccum: Float32Array;
}>;

/** Publishes drainage receivers and accumulation for erosion and Hydrology consumers. */
export const artifact = defineArtifact({
  name: "routing",
  id: "artifact:morphology.routing",
  schema: Type.Object(
    {
      cellCount: Type.Integer({ minimum: 1 }),
      flowDir: TypedArraySchemas.i32({ cardinality: null }),
      flowAccum: TypedArraySchemas.f32({ cardinality: null }),
    },
    {
      additionalProperties: false,
      description: "Immutable Morphology drainage routing fields.",
    }
  ),
  refine: (input): readonly ArtifactValidationIssue[] => {
    const routing = input as Routing;
    const issues: ArtifactValidationIssue[] = [];
    appendArtifactTypedArrayIssues(
      issues,
      "routing.flowDir",
      routing.flowDir,
      Int32Array,
      routing.cellCount
    );
    appendArtifactTypedArrayIssues(
      issues,
      "routing.flowAccum",
      routing.flowAccum,
      Float32Array,
      routing.cellCount
    );
    return issues;
  },
});
```

`defineArtifact` always projects TypeBox structural issues first. Add `refine`
only for cardinality, relational, or domain laws the schema cannot express. A
schema-complete artifact omits it.

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
import { artifacts as morphologyArtifacts } from "../artifacts/index.js";

export const RoutingStepConfig = defineStep({
  // ...id, tags, ops, and schema...
  artifacts: {
    provides: [morphologyArtifacts.routing],
  },
});
```

Downstream steps put the same value in `artifacts.requires`. Artifact
dependencies already participate in dependency satisfaction; do not duplicate
artifact ids as hand-authored tags.

### 4) Publish through the derived runtime

The SDK derives validated publication and read capabilities from the declared
artifact authorities.

```ts
export const RoutingStep = createStep(RoutingStepConfig, {
  run: (context, config, ops, deps) => {
    const routing = ops.computeRouting({ /* admitted inputs */ }, config.computeRouting);
    deps.artifacts.routing.publish(context, routing);
  },
});
```

Consumers read through `deps.artifacts.<name>.read(context)`. Authored code
never reaches into MapContext storage.

## Verification

- Run the artifact kind authorities:
  - `bun habitat check --rule require_artifact_file_shape`
  - `bun habitat check --rule require_artifact_catalog_index_shape`
  - `bun habitat check --rule require_artifact_index_aggregate_shape`
- Run the owning Nx project typecheck and tests.
- For behavior-sensitive artifacts, execute the producer and confirm
  publication, downstream reads, and diagnostics against real values.

## Footguns

- **Incomplete admission**: add a refinement when grid lengths, index ranges, or
  cross-field relations matter.
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
- Step producer binding: `packages/mapgen-core/src/authoring/step/create.ts`
- Example artifact owner: `mods/mod-swooper-maps/src/domain/foundation/modules/lithosphere/artifacts/plate-graph.artifact.ts`
- Example catalog: `mods/mod-swooper-maps/src/domain/foundation/modules/lithosphere/artifacts/index.ts`
