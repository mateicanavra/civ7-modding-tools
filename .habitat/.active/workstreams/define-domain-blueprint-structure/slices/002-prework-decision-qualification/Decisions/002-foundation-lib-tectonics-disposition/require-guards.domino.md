# Operation Guard Decomposition

Status: resolved prework domino

Parent packet: `Foundation Lib / Tectonics Disposition Decision Packet`

Investigation plan: `require-guards-investigation.md`

## Decision To Close

Resolve the exact destination topology for every export in
`mods/mod-swooper-maps/src/domain/foundation/lib/require.ts`.

The forbidden owner is already decided: this is not a shared `foundation/lib`
surface and it must not become a broad shared validation bucket. The remaining
decision is the per-export decomposition: which guards become operation-local
`rules/input-guards.ts` files, which guards should be duplicated as tiny local
checks, and whether any guard is replaced by an existing artifact contract,
operation contract, or operation-normalization helper.

## Frame

In:
`require.ts` exports, direct importers, and the operation/rules files that use
those guards while computing foundation artifacts.

Foreground:
the owner topology and import shape that lets `foundation/lib` disappear
without inventing a new shared validation bucket.

Exterior:
runtime behavior changes, source movement, and new shared validation law unless
the investigation proves that operation-local decomposition is wrong.

Would force a reframe:
evidence that two or more operations need the same guard as a stable public
artifact-validation contract, not just as repeated implementation convenience.

## Information Needed

- Complete export list from `require.ts`.
- Complete importer list per export.
- For each importer, the operation id and nearest legal local owner file.
- Whether the guarded input is already described by an artifact contract,
  operation contract, or operation-local precondition.
- Whether any guard is used across operations in a way that would make local
  duplication worse than a named owner-law addition.

## Closure Test

This domino closes when every `require.ts` export has one exact row:

- local destination path;
- duplicate/localize/delete/replace decision;
- import-migration note;
- governing authority reference;
- verification required for the eventual execution slice.

If a shared validation owner is required, this domino must name the owner-law
document to update and the exact exported surface it would authorize.

## Resolved Decision

The investigation found complete importer coverage for all nine exports. The
guards are not normalization and are not unused. They validate published
foundation artifact shapes, sometimes with operation-supplied context such as
expected cell count or plate count.

Accepted owner: artifact contracts, not operation-local guard copies.

The contract module owns the artifact rules. Its stable export surface should
be generic per file:

- `Schema` for the TypeBox schema when the file contains exactly one artifact;
- a semantically named type only when the name helps call sites or generated
  declarations;
- `artifact` for the `defineArtifact(...)` value;
- `validate(value)` for publish-time artifact validation;
- optional `assert(value, context)` only when execution proves an operation
  still needs a contextual precondition that publish-time validation cannot
  know, such as compatibility with an already-accepted mesh cell count or
  plate count.

Do not introduce semantically unique function exports such as
`assertFoundationPlateMotionArtifact` or `validateFoundationPlateMotionArtifact`
in these per-artifact files. If callers need a named import, import the module
as a namespace, for example:

```ts
import * as plateMotionContract from "../../artifacts/contract/plate-motion.contract.js";

plateMotionContract.validate(value);
plateMotionContract.assert?.(value, {
  expectedCellCount,
  expectedPlateCount,
  scope,
});
```

Operation-local code still owns call-site choice, optionality, and the source
of contextual counts. It should either rely on artifact publish validation and
delete the old guard call, or call the contract-owned generic `assert` when a
real operation-boundary compatibility check remains. It should not preserve
`foundation/lib/require.ts` or copy guard predicates into each operation.

| Guard | Destination/action | Operation call-site note | Verification |
| --- | --- | --- | --- |
| `requireMesh` | Route to `foundation/artifacts/contract/mesh.contract.ts`, which owns `artifact`, `validate`, and optional `assert`. | Prefer deleting the operation input guard if recipe publish validation already proves the mesh. Add `assert` only for direct op callers that still need fail-fast presence/shape checks. | Artifact-contract tests plus affected operation tests; `rg -n "requireMesh|foundation/lib/require" mods/mod-swooper-maps/src/domain/foundation mods/mod-swooper-maps/test`; `nx run mod-swooper-maps:test`; `nx run mod-swooper-maps:check`. |
| `requireCrust` | Route to `foundation/artifacts/contract/crust.contract.ts`, which owns `artifact`, `validate`, and optional `assert`. | `validate` owns artifact shape. If execution keeps operation-boundary compatibility checks, call `assert` with expected mesh cell count; `compute-crust-evolution` preserves `crustInit` input semantics. | Artifact-contract tests plus affected operation tests; import scan for `requireCrust`; mod test/check. |
| `requireMantlePotential` | Route to `foundation/artifacts/contract/mantle-potential.contract.ts`, which owns `artifact`, `validate`, and optional `assert`. | `compute-mantle-forcing` can rely on publish validation in recipe flow; use `assert` only if direct op-input compatibility with mesh cell count remains required. | Artifact-contract tests plus affected operation tests; import scan for `requireMantlePotential`; mod test/check. |
| `requireMantleForcing` | Route to `foundation/artifacts/contract/mantle-forcing.contract.ts`, which owns `artifact`, `validate`, and optional `assert`. | `validate` owns internal artifact shape; use `assert` only if operation-boundary compatibility with mesh cell count remains required. | Artifact-contract tests plus affected operation tests; import scan for `requireMantleForcing`; mod test/check. |
| `requirePlateGraph` | Route to `foundation/artifacts/contract/plate-graph.contract.ts`, which owns `artifact`, `validate`, and optional `assert`. | `validate` owns graph shape. Use `assert` only if an operation still needs contextual compatibility with mesh cell count. | Artifact-contract tests plus affected operation tests; import scan for `requirePlateGraph`; mod test/check. |
| `requirePlateMotion` | Route to `foundation/artifacts/contract/plate-motion.contract.ts`, which owns `artifact`, `validate`, and optional `assert`. | Publish-time `validate` owns internal plate-motion shape. Use `assert` only if an operation still needs contextual compatibility with mesh cell count and plate count from the accepted plate graph. | Artifact-contract tests plus affected operation tests; import scan for `requirePlateMotion`; mod test/check. |
| `requireTectonics` | Route to `foundation/artifacts/contract/current-tectonics.contract.ts`, which owns `artifact`, `validate`, and optional `assert`. | Prefer publish validation; use `assert` only if operation-boundary compatibility with mesh cell count remains required. | Artifact-contract tests plus affected operation tests; import scan for `requireTectonics`; mod test/check. |
| `requireTectonicHistory` | Route to `foundation/artifacts/contract/tectonic-history.contract.ts`, which owns `artifact`, `validate`, and optional `assert`. | `validate` should cover the full artifact contract, including fields omitted by the current guard if the artifact owns them. Use `assert` only for contextual mesh compatibility if still required. | Artifact-contract tests plus affected operation tests; import scan for `requireTectonicHistory`; mod test/check. |
| `requireTectonicProvenance` | Route to `foundation/artifacts/contract/tectonic-provenance.contract.ts`, which owns `artifact`, `validate`, and optional `assert`. | `compute-plates-tensors` keeps the input optional. In recipe flow it can rely on publish validation; call `assert` inside the truthy branch only if contextual mesh compatibility remains required. | Artifact-contract tests plus affected operation tests; import scan for `requireTectonicProvenance`; mod test/check. |

## Destination Contract Example

This example shows the intended destination shape for now. It uses
`plate-motion.contract.ts` because that is the concrete row that raised the
question. The same shape applies to any single-artifact contract file.

```ts
import {
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object(
  {
    version: Type.Integer({ minimum: 1 }),
    cellCount: Type.Integer({ minimum: 1 }),
    plateCount: Type.Integer({ minimum: 1 }),
    plateCenterX: TypedArraySchemas.f32({ shape: null }),
    plateCenterY: TypedArraySchemas.f32({ shape: null }),
    plateVelocityX: TypedArraySchemas.f32({ shape: null }),
    plateVelocityY: TypedArraySchemas.f32({ shape: null }),
    plateOmega: TypedArraySchemas.f32({ shape: null }),
    plateFitRms: TypedArraySchemas.f32({ shape: null }),
    plateFitP90: TypedArraySchemas.f32({ shape: null }),
    plateQuality: TypedArraySchemas.u8({ shape: null }),
    cellFitError: TypedArraySchemas.u8({ shape: null }),
  },
  { additionalProperties: false }
);

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "foundationPlateMotion",
  id: "artifact:foundation.plateMotion",
  schema: Schema,
});

export function validate(value: unknown): void {
  if (!value || typeof value !== "object") {
    throw new Error("[FoundationArtifact] Missing foundation plateMotion artifact payload.");
  }
  const motion = value as Partial<Artifact>;
  const cellCount = typeof motion.cellCount === "number" ? motion.cellCount | 0 : 0;
  const plateCount = typeof motion.plateCount === "number" ? motion.plateCount | 0 : 0;
  if (cellCount <= 0) throw new Error("[FoundationArtifact] Invalid plateMotion.cellCount.");
  if (plateCount <= 0) throw new Error("[FoundationArtifact] Invalid plateMotion.plateCount.");

  for (const [key, tensor] of [
    ["plateCenterX", motion.plateCenterX],
    ["plateCenterY", motion.plateCenterY],
    ["plateVelocityX", motion.plateVelocityX],
    ["plateVelocityY", motion.plateVelocityY],
    ["plateOmega", motion.plateOmega],
    ["plateFitRms", motion.plateFitRms],
    ["plateFitP90", motion.plateFitP90],
  ] as const) {
    if (!(tensor instanceof Float32Array) || tensor.length !== plateCount) {
      throw new Error(`[FoundationArtifact] Invalid plateMotion.${key}.`);
    }
  }
  if (!(motion.plateQuality instanceof Uint8Array) || motion.plateQuality.length !== plateCount) {
    throw new Error("[FoundationArtifact] Invalid plateMotion.plateQuality.");
  }
  if (!(motion.cellFitError instanceof Uint8Array) || motion.cellFitError.length !== cellCount) {
    throw new Error("[FoundationArtifact] Invalid plateMotion.cellFitError.");
  }
}

export function assert(
  value: Artifact | undefined,
  context: { expectedCellCount?: number; expectedPlateCount?: number; scope: string }
): Artifact {
  if (!value) throw new Error(`[Foundation] PlateMotion not provided for ${context.scope}.`);
  validate(value);
  if (
    context.expectedCellCount !== undefined &&
    (value.cellCount | 0) !== context.expectedCellCount
  ) {
    throw new Error(`[Foundation] Invalid plateMotion.cellCount for ${context.scope}.`);
  }
  if (
    context.expectedPlateCount !== undefined &&
    (value.plateCount | 0) !== context.expectedPlateCount
  ) {
    throw new Error(`[Foundation] Invalid plateMotion.plateCount for ${context.scope}.`);
  }
  return value;
}
```

Execution should prefer deleting operation input guard calls when artifact
publish validation and recipe artifact dependencies already prove the value.
The optional `assert` export exists only for the narrower case where a domain
operation remains directly callable with plain inputs and still needs
contextual compatibility checks outside publish-time validation.

## Evidence

- `evidence/require-guards-agent-b.md` records the operation-topology fallback:
  direct call sites and pass-through wrappers are all accounted for.
- `evidence/require-guards-agent-c.md` records the decisive authority finding:
  every guard validates a published foundation artifact and fits the existing
  artifact-contract move class.

## Closure

No owner-law blocker remains. `foundation/lib/require.ts` can be removed in a
later execution slice after the artifact contract modules own validation, any
necessary generic `assert` exports are justified or omitted, pass-through
wrappers are deleted, import scans are clean, and the mod test/check proof
passes.
