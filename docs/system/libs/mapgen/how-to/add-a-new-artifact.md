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
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  type Static,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  defineArtifactValidator,
  Type,
  TypedArraySchemas,
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

function validateLocal(
  value: unknown,
  context: ArtifactValidationContext | undefined
): readonly ArtifactValidationIssue[] {
  const routing = value as Static<typeof Schema>;
  const expectedLength = artifactCellCount(context);
  const issues: ArtifactValidationIssue[] = [];
  appendArtifactTypedArrayIssues(issues, "flowDir", routing.flowDir, Int32Array, expectedLength);
  appendArtifactTypedArrayIssues(
    issues,
    "flowAccum",
    routing.flowAccum,
    Float32Array,
    expectedLength
  );
  return issues;
}

/** Admits routing structure, exact typed arrays, and map-grid cardinality. */
export const validate = defineArtifactValidator(artifact, validateLocal);
```

When the schema alone cannot express complete admission, pass one private local
validator as the constructor's second argument. Core always projects structural
issues first and invokes local validation only for structurally admitted values;
the local callback owns only cardinality, relational, or domain laws.
Typed-array schemas use runtime metadata beyond TypeBox's structural model, so
the callback remains `unknown` and should use Core's typed-array admission
helpers rather than asserting constructors by hand.

Keep the runtime module surface closed to `Schema`, `artifact`, and `validate`.
Supporting schemas and validation helpers stay private. Import runtime values
only from MapGen contract/lib APIs, static Civ7 types and policy, public domain
contract/schema/policy/data surfaces; artifact modules do not depend on
adapters, engines, recipes, private operation implementations, Node/browser
APIs, or other artifact owner modules.

Keep an artifact-private schema inline. When multiple domain concepts or
artifact vintages genuinely share a schema primitive, place that plain schema
and its derived type under the owning domain's `model/schemas` surface. Model
schema files do not own artifact validation, issue/context types, artifact
construction, or complete artifact payload admission; each artifact owner
binds its own validation setup.

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
  // ...id, tags, ops, and schema...
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
