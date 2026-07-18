<toc>
  <item id="purpose" title="Purpose"/>
  <item id="module" title="Artifact module"/>
  <item id="contract" title="Contract (write-once, read-only)"/>
  <item id="buffers" title="Buffers exception"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Artifacts

## Purpose

Define artifact contracts, their complete admission validators, publish/read behavior,
mutability, and the buffer exception.

## Artifact module

An artifact module pairs exactly one contract with the complete validator that admits
values for that contract. Catalogs are declared once with `defineArtifactCatalog(...)`;
the `artifacts` handle map is derived from the same frozen module map instead of repeating
contracts and validators in parallel registries. Catalog keys are local lookup names and
need not equal the contract's runtime `name`, while duplicate artifact ids or names are
always refused.

## Contract (write-once, read-only)

- Producers publish artifacts once.
- Consumers read as immutable; if they need mutation, they must copy first.
- Republishing is an error.

Representative artifact owner (`topography.artifact.ts`; excerpt):

```ts
import {
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Closed structural schema for the topography published by morphology. */
export const Schema = Type.Object(
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
});

/** Admits topography values through the contract's closed structural schema. */
export function validate(value: unknown): readonly { message: string }[] {
  return validateArtifactSchema(Schema, value);
}
```

The adjacent catalog is the single selection surface for provider modules and
consumer handles:

```ts
import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as topography from "./topography.artifact.js";

const catalog = defineArtifactCatalog({ topography });

/** Complete topography artifact modules selected by producer contracts. */
export const artifactModules = catalog.modules;

/** Read-only topography contract handles derived from the module catalog. */
export const artifacts = catalog.artifacts;
```

Step contracts declare consumer requirements from `artifacts` and provider authority
from `artifactModules`. `createStep` receives behavior only:

```ts
const TopographyStepContract = defineStep({
  // ...id, phase, tags, ops, and schema...
  artifacts: {
    provides: [artifactModules.topography],
  },
});

createStep(TopographyStepContract, {
  run: (context, config, ops, deps) => {
    const topography = computeTopography(context, config, ops);
    deps.artifacts.topography.publish(context, topography);
  },
});
```

`defineStep` snapshots the selected provider modules, and `createStep` derives the frozen
artifact-name-keyed runtime from that contract authority. The module validator is the sole
admission authority for publication, satisfaction checks, and validated reads.
`implementArtifactModules(...)` remains lower-level runtime support; it is not the step
authoring surface.

## Buffers exception

Buffers are a current performance exception:

- published once,
- then mutated in-place across steps,
- and must not be republished.

Docs must keep this exception narrow and explicitly labeled as such.

## Ground truth anchors

- Artifact runtime (write-once enforcement, read-only reads): `packages/mapgen-core/src/authoring/artifact/runtime.ts`
- Artifact module and catalog derivation: `packages/mapgen-core/src/authoring/artifact/module.ts`
- Artifact types and DeepReadonly: `packages/mapgen-core/src/authoring/artifact/contract.ts`
- Buffer exception and ArtifactStore notes: `packages/mapgen-core/src/core/types.ts`
- Policy: artifact mutation: `docs/system/libs/mapgen/policies/ARTIFACT-MUTATION.md`
- Example artifact owner: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/topography.artifact.ts`
- Example artifact catalog: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts/index.ts`
