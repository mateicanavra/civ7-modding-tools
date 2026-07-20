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

Add an artifact: a published, dependency-gated data product with one stable
contract, one complete admission validator, and one catalog registration.

Routes to:
- Artifact reference: [`docs/system/libs/mapgen/reference/ARTIFACTS.md`](/system/libs/mapgen/reference/ARTIFACTS.md)
- Artifact mutation policy: [`docs/system/libs/mapgen/policies/ARTIFACT-MUTATION.md`](/system/libs/mapgen/policies/ARTIFACT-MUTATION.md)
- Dependency id policy: [`docs/system/libs/mapgen/policies/DEPENDENCY-IDS-AND-REGISTRIES.md`](/system/libs/mapgen/policies/DEPENDENCY-IDS-AND-REGISTRIES.md)

## Prereqs

- Define the artifact as an immutable snapshot. If a later step changes the value,
  it consumes this snapshot, copies it, and publishes a separately named vintage.
- Choose a stable artifact id such as `"artifact:morphology.routing"`.
- Identify the artifact owner directory and the single step that publishes it.

## Checklist

### 1) Define one artifact module

Create `artifacts/<name>.artifact.ts`. The file owns the schema, contract, and
complete structural and semantic admission validator.

```ts
import {
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Closed structural schema for the routing fields published by the morphology step. */
export const Schema = Type.Object(
  {
    flowDir: TypedArraySchemas.i32({
      description: "Steepest-descent receiver index per tile, or -1 for a sink or edge.",
    }),
    flowAccum: TypedArraySchemas.f32({ description: "Drainage area proxy per tile." }),
  },
  { additionalProperties: false, description: "Morphology routing flow fields." }
);

/** Contract for the immutable routing fields produced by the morphology pipeline. */
export const artifact = defineArtifact({
  name: "routing",
  id: "artifact:morphology.routing",
  schema: Schema,
});

/** Admits routing values through the contract's closed structural schema. */
export function validate(value: unknown): readonly { message: string }[] {
  return validateArtifactSchema(Schema, value);
}
```

Add domain invariants to `validate(...)` after schema validation when the schema
alone cannot express complete admission.

### 2) Register the module once

In the adjacent `artifacts/index.ts`, namespace-import every sibling artifact
module and register it with the contract-only catalog helper. Export only the
derived producer modules and consumer handles.

```ts
import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as routing from "./routing.artifact.js";

const catalog = defineArtifactCatalog({
  routing,
});

/** Complete routing artifact modules selected by producer contracts. */
export const artifactModules = catalog.modules;

/** Read-only routing contract handles derived from the module catalog. */
export const artifacts = catalog.artifacts;
```

Do not add parallel `artifactContracts` or `validators` maps. The catalog is the
single registration authority.

### 3) Declare the artifact in step contracts

Consumer contracts select derived `artifacts` handles. Producer contracts select the
complete module so the contract and validator cannot drift into separate declarations.

```ts
import { artifactModules as morphologyArtifactModules } from "../artifacts/index.js";

/** Admits the routing artifact as the canonical output of the routing step. */
export const RoutingStepContract = defineStep({
  // ...id, phase, tags, ops, and schema...
  artifacts: {
    provides: [morphologyArtifactModules.routing],
  },
});
```

Add the derived handle from `artifacts` to downstream `artifacts.requires` declarations. Artifact
dependencies already participate in dependency satisfaction; do not duplicate
artifact ids as hand-authored tags.

### 4) Publish through the derived producer runtime

The producing step supplies behavior only. The SDK derives its validated publication
runtime from the modules already admitted by the step contract.

```ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { RoutingStepContract } from "./config.js";

/** Computes and publishes the routing artifact through the admitted step dependency. */
export const RoutingStep = createStep(RoutingStepContract, {
  run: (context, config, ops, deps) => {
    const routing = ops.computeRouting({ /* operation inputs */ }, config.computeRouting);
    deps.artifacts.routing.publish(context, routing);
  },
});
```

Consumers read through `deps.artifacts.<name>.read(context)` rather than reaching
into `context.artifacts` directly.

## Verification

- Run the artifact owner and catalog authority:
  - `bun habitat check --rule require_artifact_file_shape`
  - `bun habitat check --rule require_artifact_index_aggregate_shape`
- Run the owning project checks:
  - `nx run mapgen-core:typecheck`
  - `nx run mod-swooper-maps:typecheck`
  - `nx run mod-swooper-maps:test`
- For behavior-sensitive artifacts, run a traced execution and confirm publication,
  downstream reads, and validator diagnostics against real values.

## Footguns

- **Incomplete validation**: a schema-only validator is insufficient when admission
  also requires domain invariants such as grid lengths, index ranges, or relational checks.
- **Parallel registries**: do not recreate contract and validator maps beside the catalog.
- **Duplicate provider authority**: never pass modules to `createStep`; provider modules
  belong only in the contract's `artifacts.provides` declaration.
- **Publishing twice or mutating after publication**: each artifact vintage has one producer;
  later changes require a copied value and a new vintage contract.
- **Artifact vs field confusion**: fields are adapter-level engine outputs; artifacts are
  pipeline data products.

## Ground truth anchors

- Artifact module and catalog: `packages/mapgen-core/src/authoring/artifact/module.ts`
- Artifact runtime and admission: `packages/mapgen-core/src/authoring/artifact/runtime.ts`
- Step producer binding: `packages/mapgen-core/src/authoring/step/create.ts`
- Example artifact owner: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/routing.artifact.ts`
- Example catalog: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/index.ts`
- Example producer: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-routing/steps/routing/step.ts`
