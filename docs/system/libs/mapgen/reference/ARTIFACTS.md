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

Representative artifact owner (`topography.artifact.ts`; excerpt):

```ts
import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  type Static,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/** Closed structural schema for the topography published by morphology. */
const Schema = Type.Object(
  {
    elevation: TypedArraySchemas.i16({ description: "Signed elevation per tile (integer meters)." }),
    seaLevel: Type.Number({ description: "Global sea level threshold in meters (may be fractional)." }),
    landMask: TypedArraySchemas.u8({ description: "Land/water mask per tile (1=land, 0=water)." }),
  },
  { additionalProperties: false }
);

/** Contract for the immutable topography produced by the morphology pipeline. */
export const artifact = defineArtifact({
  name: "topography",
  id: "artifact:morphology.topography",
  schema: Schema,
  refine: validateLocal,
});

/** Admits exact typed arrays and map-grid cardinality after structural validation. */
function validateLocal(
  value: unknown,
  context: ArtifactValidationContext | undefined
): readonly ArtifactValidationIssue[] {
  const topography = value as Static<typeof Schema>;
  const expectedLength = artifactCellCount(context);
  const issues: ArtifactValidationIssue[] = [];
  appendArtifactTypedArrayIssues(
    issues,
    "elevation",
    topography.elevation,
    Int16Array,
    expectedLength
  );
  appendArtifactTypedArrayIssues(
    issues,
    "landMask",
    topography.landMask,
    Uint8Array,
    expectedLength
  );
  return issues;
}
```

`defineArtifact` is the only artifact-authority constructor. It binds structural admission to the
supplied schema and runs `refine` only after structure succeeds. Artifact owners do not call
TypeBox validation directly or redeclare the issue contract. The local callback stays `unknown`
because typed-array constructors and cardinality live in Core's runtime metadata layer rather than
TypeBox's structural type; owners use Core's typed-array helpers for those checks.

The only runtime export of an artifact source module is `artifact`; its schema and refinement
helpers remain private. Named type aliases may be exported when consumers need semantic value
vocabulary. Runtime imports are limited to MapGen contract/lib APIs, static Civ7 types and policy,
and public domain contract/schema/policy/data surfaces. Adapter, engine, recipe, private operation
implementation, Node/browser, and artifact-owner dependencies are outside the kind.

Artifact-private schemas stay inline. A schema primitive shared across domain
concepts or artifact vintages belongs to the owning domain's `model/schemas`
surface as plain domain vocabulary. It never carries artifact validation,
issue/context types, artifact construction, or complete payload admission;
artifact owners bind those concerns locally.

The adjacent catalog is the single selection surface for producers and consumers:

```ts
import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as topography } from "./topography.artifact.js";

/** Canonical morphology artifact authorities keyed for authored consumers. */
export const artifacts = defineArtifactCatalog({ topography });
```

Step contracts use the same artifact object for requirements and provisions. `createStep` receives
behavior only:

```ts
const TopographyStepContract = defineStep({
  // ...id, tags, ops, and schema...
  artifacts: {
    provides: [artifacts.topography],
  },
});

createStep(TopographyStepContract, {
  run: (context, config, ops, deps) => {
    const topography = computeTopography(context, config, ops);
    deps.artifacts.topography.publish(context, topography);
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
- Example artifact owner: `mods/mod-swooper-maps/src/domain/morphology/artifacts/topography.artifact.ts`
- Example artifact catalog: `mods/mod-swooper-maps/src/domain/morphology/artifacts/index.ts`
