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

Operation-local code still owns call-site choice: the operation supplies
`scope`, optionality, and expected counts. It should call the artifact-contract
assertion helper rather than preserving `foundation/lib/require.ts` or copying
the guard predicates into each operation.

| Guard | Destination/action | Operation call-site note | Verification |
| --- | --- | --- | --- |
| `requireMesh` | Replace with `assertFoundationMeshArtifact` from `foundation/artifacts/contract/mesh.contract.ts`. | All mesh-consuming operations pass `input.mesh` and scope. | Artifact-contract tests plus affected operation tests; `rg -n "requireMesh|foundation/lib/require" mods/mod-swooper-maps/src/domain/foundation mods/mod-swooper-maps/test`; `nx run mod-swooper-maps:test`; `nx run mod-swooper-maps:check`. |
| `requireCrust` | Replace with `assertFoundationCrustArtifact` from `foundation/artifacts/contract/crust.contract.ts`. | Call sites supply expected mesh cell count; `compute-crust-evolution` preserves `crustInit` input semantics. | Artifact-contract tests plus affected operation tests; import scan for `requireCrust`; mod test/check. |
| `requireMantlePotential` | Replace with `assertFoundationMantlePotentialArtifact` from `foundation/artifacts/contract/mantle-potential.contract.ts`. | `compute-mantle-forcing` supplies expected mesh cell count. | Artifact-contract tests plus affected operation tests; import scan for `requireMantlePotential`; mod test/check. |
| `requireMantleForcing` | Replace with `assertFoundationMantleForcingArtifact` from `foundation/artifacts/contract/mantle-forcing.contract.ts`. | Consumers supply expected mesh cell count. | Artifact-contract tests plus affected operation tests; import scan for `requireMantleForcing`; mod test/check. |
| `requirePlateGraph` | Replace with `assertFoundationPlateGraphArtifact` from `foundation/artifacts/contract/plate-graph.contract.ts`. | Consumers supply expected mesh cell count. | Artifact-contract tests plus affected operation tests; import scan for `requirePlateGraph`; mod test/check. |
| `requirePlateMotion` | Replace with `assertFoundationPlateMotionArtifact` from `foundation/artifacts/contract/plate-motion.contract.ts`. | Consumers supply expected mesh cell count and expected plate count from the accepted plate graph. | Artifact-contract tests plus affected operation tests; import scan for `requirePlateMotion`; mod test/check. |
| `requireTectonics` | Replace with `assertFoundationTectonicsArtifact` from `foundation/artifacts/contract/current-tectonics.contract.ts`. | Consumers supply expected mesh cell count. | Artifact-contract tests plus affected operation tests; import scan for `requireTectonics`; mod test/check. |
| `requireTectonicHistory` | Replace with `assertFoundationTectonicHistoryArtifact` from `foundation/artifacts/contract/tectonic-history.contract.ts`. | Consumers supply expected mesh cell count; the future contract helper should validate the full artifact contract, including fields omitted by the current guard if the artifact contract owns them. | Artifact-contract tests plus affected operation tests; import scan for `requireTectonicHistory`; mod test/check. |
| `requireTectonicProvenance` | Replace with `assertFoundationTectonicProvenanceArtifact` from `foundation/artifacts/contract/tectonic-provenance.contract.ts`. | `compute-plates-tensors` keeps the input optional and calls the assertion only inside the truthy branch. | Artifact-contract tests plus affected operation tests; import scan for `requireTectonicProvenance`; mod test/check. |

## Evidence

- `evidence/require-guards-agent-b.md` records the operation-topology fallback:
  direct call sites and pass-through wrappers are all accounted for.
- `evidence/require-guards-agent-c.md` records the decisive authority finding:
  every guard validates a published foundation artifact and fits the existing
  artifact-contract move class.

## Closure

No owner-law blocker remains. `foundation/lib/require.ts` can be removed in a
later execution slice after the artifact-contract helpers exist, all call sites
use those helpers, pass-through wrappers are deleted, import scans are clean,
and the mod test/check proof passes.
