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
`refine` callback for relational or domain laws. Typed-array constructor and cardinality admission
is compiled from the schema at definition time. Catalogs directly collect these
authorities with `defineArtifactCatalog(...)`; there is no parallel contract, validator, or module
registry. A catalog key must equal its artifact's `name`, so contracts and step dependencies retain
one property identity. The `artifact:` id remains the globally unique semantic identity; duplicate
ids or names are always refused.

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
  JavaScript memory protection. The consumer type is a deep readonly authoring projection that
  removes direct typed-array mutators and mutable backing-storage capabilities. TypeScript
  structural widening or an explicit cast can bypass that constraint, and a producer-retained raw
  alias remains a runtime trust caveat. Take an explicit copy before producing mutable output;
  arbitrary callable members are not artifact data.
- Artifact storage is private to MapGen Core. `MapContext` exposes no raw store or query facade.
- Authored steps read and publish only through their declared `deps.artifacts` capabilities.
- Metrics, diagnostics, and other post-run observers use `readArtifact` or `observeArtifact` with
  the exact artifact authority that selected the value at publication.

The artifact owner owns its complete payload schema. Smaller reusable pieces,
such as one `PlateSchema` subentity, may come from exact model-atom files, but a
complete artifact container never moves into atoms or gets reused wholesale
by an operation contract (`plate-graph.artifact.ts`; excerpt):

```ts
import {
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";
import { PlateSchema } from "../model/atoms/plate.schema.js";

export const artifact = defineArtifact({
  name: "plateGraph",
  id: "artifact:foundation.plateGraph",
  schema: Type.Object({
    plates: Type.Array(PlateSchema),
    plateIdByCell: TypedArraySchemas.i16({ cardinality: "map-grid" }),
  }),
  refine: (value, { cellCount, issues }) => {
    if (value.plates.length > cellCount) {
      issues.add("Plate count cannot exceed the admitted map cell count.");
    }
    return undefined;
  },
});
```

`defineArtifact` is the only artifact-authority constructor. It binds structural admission to the
supplied schema and validates in three strict phases: TypeBox structure, exact typed-array
constructor/cardinality metadata, then optional semantic refinement. A failed phase returns its
issues without running later phases.

The refinement value is inferred from the inline schema as deeply readonly. Its frozen facilities
contain admitted `dimensions`, Core-derived `cellCount`, and a closeable issue sink. Refinements
append messages with `issues.add(...)` (or use `issues.addGridCoordinates(...)` for generic
duplicate/bounds checks) and return exactly `undefined`; they do not import validation framework
types, allocate issue arrays, or return promises.

Typed-array metadata remains enumerable and portable. Artifact schemas use `"map-grid"` when a
buffer length is the validation context's admitted `width * height`; path products remain relative
to fields in the artifact value, and `"constructor-only"` deliberately declares no length
relation. The default `["width", "height"]` remains an input-relative path product rather than an
alias for `"map-grid"`.

Artifact validation context is mandatory. Production publication supplies it from the admitted map
setup; direct validator tests pass
`{ dimensions: { width, height } }` explicitly. Missing dimensions never disable cardinality
checks.

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
  // ...id, dependencies, ops, and schema...
  requires: [],
  provides: [artifacts.plateGraph],
});

createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const plateGraph = buildPlateGraph(context, stepConfig, ops);
    deps.artifacts.plateGraph.publish(plateGraph);
  },
});
```

`requires` and `provides` are the sole authored dependency lists. Put the exact
`Artifact` authority directly in the appropriate list; effect/completion guarantees
remain typed string constants in the same list. Raw `artifact:*` strings are invalid
because they discard the schema, validator, and semantic owner that make the
dependency exact.

`defineStep` snapshots the selected artifacts, while `createStep` binds behavior only. At each
step invocation, Core derives exact occurrence-bound `read()` and `publish(value)` capabilities
directly from those contract authorities. There is no provider runtime registry, map, or cache.
The compiled `MapGenStep` retains one ordered string-id ledger for each direction, while Core keeps
the exact artifact authorities needed to type and bind `deps.artifacts`. The DAG projects artifact
references as causal edges and string completion dependencies as metadata; it does not infer one
kind from the other or build a second dependency graph.
Each artifact's validator remains the sole admission authority at publication. Artifact dependency
gates and terminal observers subsequently ask only whether that exact authority is present in the
write-once store; they do not create a second admission transition or treat validation as mutation
detection. Storage remains private to recipe execution and is not an authored step capability.

## Ground truth anchors

- Artifact runtime (write-once enforcement, zero-copy ownership contract): `packages/mapgen-core/src/authoring/artifact/runtime.ts`
- Terminal artifact observation: `packages/mapgen-core/src/authoring/artifact/observation.ts`
- Artifact definition and value types: `packages/mapgen-core/src/authoring/artifact/contract.ts`
- Schema-owned typed-array admission compiler: `packages/mapgen-core/src/authoring/schema/typed-array-admission.ts`
- Artifact catalog: `packages/mapgen-core/src/authoring/artifact/catalog.ts`
- Artifact-store ownership: `packages/mapgen-core/src/core/map-context.ts`
- Policy: artifact mutation: `docs/system/libs/mapgen/policies/ARTIFACT-MUTATION.md`
- Example artifact owner: `mods/mod-swooper-maps/src/domain/foundation/modules/lithosphere/artifacts/plate-graph.artifact.ts`
- Example module artifact catalog: `mods/mod-swooper-maps/src/domain/foundation/modules/lithosphere/artifacts/index.ts`
