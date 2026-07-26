<toc>
  <item id="purpose" title="Purpose"/>
  <item id="authority" title="Artifact authority"/>
  <item id="contract" title="Contract (write-once, read-only)"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Artifacts

## Purpose

Define artifact contracts, their complete admission validators, and publish/read behavior.

## Artifact authority

One `Artifact` owns a data product's identity, schema, and complete admission validator.
`defineArtifact(...)` always supplies structural schema admission and accepts an optional private
`refine` callback for cardinality, relational, or domain laws. Catalogs directly collect these
authorities with `defineArtifactCatalog(...)`; there is no parallel contract, validator, or module
registry. Catalog keys are local lookup names and need not equal an artifact's runtime `name`,
while duplicate artifact ids or names are always refused.

Artifacts live with the direct domain module that produces them. Each module's
`artifacts/index.ts` is its single catalog; aggregate domains do not recreate a
second domain-wide artifact registry. Consumers select the producing module's
public catalog, preserving the product's semantic owner.

## Contract (write-once, read-only)

- Producers publish artifacts once.
- Consumers read as immutable; if they need mutation, they must copy first.
- Republishing is an error.
- Publication and reads retain the admitted value reference. Core does not deep-freeze or snapshot
  artifact payload memory; immutability is enforced by pipeline ownership rather than hostile
  JavaScript memory protection. Typed-array mutators are not yet excluded from every consumer type
  signature.
- Artifact storage is private to MapGen Core. `MapContext` exposes no raw store or query facade.
- Authored steps read and publish only through their declared `deps.artifacts` capabilities.
- Metrics, diagnostics, and other post-run observers use `readValidatedArtifact` or
  `observeValidatedArtifact` with the exact artifact whose validator owns admission.

The artifact owner owns its complete payload schema. Smaller reusable pieces,
such as one `PlateSchema` subentity, may come from exact model-atom files, but a
complete artifact container never moves into atoms or gets borrowed wholesale
by an operation contract (`plate-graph.artifact.ts`; excerpt):

```ts
import {
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";
import { PlateSchema } from "../model/atoms/plate.schema.js";

type PlateGraph = Readonly<{
  cellCount: number;
  plateIdByCell: Int16Array;
}>;

export const artifact = defineArtifact({
  name: "foundationPlateGraph",
  id: "artifact:foundation.plateGraph",
  schema: Type.Object({
    cellCount: Type.Integer({ minimum: 1 }),
    plates: Type.Array(PlateSchema),
    plateIdByCell: TypedArraySchemas.i16({ cardinality: "constructor-only" }),
  }),
  refine: (value): readonly ArtifactValidationIssue[] => {
    const graph = value as PlateGraph;
    const issues: ArtifactValidationIssue[] = [];
    appendArtifactTypedArrayIssues(
      issues,
      "plateIdByCell",
      graph.plateIdByCell,
      Int16Array,
      graph.cellCount
    );
    return issues;
  },
});
```

`defineArtifact` is the only artifact-authority constructor. It binds structural admission to the
supplied schema and runs `refine` only after structure succeeds. Artifact owners do not call
TypeBox validation directly or redeclare the issue contract. The local callback stays `unknown`
because typed-array constructors and cardinality live in Core's runtime metadata layer rather than
TypeBox's structural type; owners use Core's typed-array helpers for those checks.

Typed-array cardinality modes and their operation-only compilation semantics
belong to the [operation contract authority](/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md#operation-input-admission).
An artifact's local `refine` remains responsible for proving the exact
constructor and every relational length law, as `plateIdByCell` does above.

The only runtime export of an artifact source module is `artifact`; its complete
payload schema and refinement are authored directly on that definition. Runtime imports are
limited to MapGen contract/lib APIs, static Civ7 types and policy, and exact
nearest-owner model atoms for smaller composed parts. Adapter, engine, recipe,
operation contracts or implementations, Node/browser, and other artifact-owner
dependencies are outside the kind.

An atom file owns only a smaller composable schema primitive or cohesive
subentity plus its derived type. It never imports artifact APIs or carries
artifact identity, a complete payload schema, validation issue/context types,
refinement, or publication admission. Place it at the lowest common semantic
owner: the direct module by default, or the aggregate domain for proven
cross-module use.

The adjacent catalog is the single selection surface for producers and consumers:

```ts
import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as plateGraph } from "./plate-graph.artifact.js";

/** Canonical lithosphere artifact authorities keyed for authored consumers. */
export const artifacts = defineArtifactCatalog({ plateGraph });
```

Step contracts use the same artifact object for requirements and provisions. `createStep` receives
behavior only:

```ts
export const config = defineStep({
  // ...id, tags, ops, and schema...
  artifacts: {
    provides: [artifacts.plateGraph],
  },
});

createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const plateGraph = buildPlateGraph(context, stepConfig, ops);
    deps.artifacts.plateGraph.publish(context, plateGraph);
  },
});
```

`defineStep` snapshots the selected artifacts, and `createStep` derives the frozen
artifact-name-keyed runtime from that contract authority. Each artifact's validator is the sole
admission authority for publication, satisfaction checks, and validated reads. Runtime
construction and satisfaction callbacks remain private to recipe composition; neither is an
authored step capability.

## Ground truth anchors

- Artifact runtime (write-once enforcement, zero-copy ownership contract): `packages/mapgen-core/src/authoring/artifact/runtime.ts`
- Artifact definition and value types: `packages/mapgen-core/src/authoring/artifact/contract.ts`
- Artifact catalog: `packages/mapgen-core/src/authoring/artifact/catalog.ts`
- Artifact-store ownership: `packages/mapgen-core/src/core/map-context.ts`
- Policy: artifact mutation: `docs/system/libs/mapgen/policies/ARTIFACT-MUTATION.md`
- Example artifact owner: `mods/mod-swooper-maps/src/domain/foundation/modules/lithosphere/artifacts/plate-graph.artifact.ts`
- Example module artifact catalog: `mods/mod-swooper-maps/src/domain/foundation/modules/lithosphere/artifacts/index.ts`
