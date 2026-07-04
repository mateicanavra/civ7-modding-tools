# Require Guards Agent C - Artifact And Normalization Authority

Status: complete investigation artifact

Scope: authority disposition only. No TypeScript source, tests, generated artifacts, Grit, structure metadata, or runtime behavior changed.

Supersession note: this scratch evidence used provisional semantically named
helper examples. Final artifact contract file shape authority now lives in the
active scope pattern:
`../../../../../scopes/domain/scopes/artifacts/scopes/contract/patterns/artifact-contract-shape.md`.
Treat the rows below as authority evidence for contract ownership, not as final
export-name authority.

## Evidence Read

- `mods/mod-swooper-maps/src/domain/foundation/lib/require.ts`
- `mods/mod-swooper-maps/src/domain/foundation/ops/**/contract.ts`
- `mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/schemas.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/validation.ts`
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`
- packet `synthesis/disposition-table.md`
- packet `corpus/architecture-authority.md`
- workstream `decision-book/owner-boundaries.md`
- workstream `decision-book/move-classes.md`

Narsil was used first for `requireMesh` symbol references, then `rg` and source inspection corroborated the guard definitions, direct consumers, artifact schemas, and validation helpers.

## Authority Findings

The guards do not normalize. They throw on missing or malformed values; the `| 0` uses are count comparisons/coercions only and do not repair the payload. No guard is unused.

The guarded values are all published foundation artifacts. Current evidence already contains artifact schemas in `src/recipes/standard/stages/foundation/artifacts.ts` and artifact validators in `src/recipes/standard/stages/foundation/validation.ts`. The accepted final owner shape for this packet is not that recipe-stage file; final contracts should be split to `mods/mod-swooper-maps/src/domain/foundation/artifacts/contract/<artifact>.contract.ts`.

The accepted owner is artifact contract with optional contextual assertion. The
contract-owned validation should validate the artifact's own typed-array
constructors and internal coupled lengths, and contextual `assert` may accept
expected counts where operation inputs must be compatible with a mesh or plate
graph. Operation-local code may keep the call-site choice and error scope, but
it should not own reusable artifact-shape validation.

| Guard | Guarded value owner | Artifact-contract candidate | Normalization candidate | Accepted owner | Falsifier status | Authority gap |
| --- | --- | --- | --- | --- | --- | --- |
| `requireMesh` | `artifact:foundation.mesh`; current schema evidence in `compute-mesh/contract.ts` and stage `foundation/artifacts.ts`. | Accept. Future `mods/mod-swooper-maps/src/domain/foundation/artifacts/contract/mesh.contract.ts` using the stable artifact contract shape. Validation should include current constructor checks and also cover full schema shape such as `bbox`. | Reject. No filling or repair; `cellCount \| 0` is validation/coercion for comparison only. | Artifact contract validation; operation call sites invoke optional contextual `assert` only if needed. | Stable artifact id, stage artifact schema, stage validator, and many consumers falsify pure operation-local decomposition. | None; existing artifact-contract move class is sufficient. |
| `requireCrust` | `artifact:foundation.crust` and `artifact:foundation.crustInit`; current schema evidence in `compute-crust/contract.ts` and stage `foundation/artifacts.ts`. | Accept. Future `mods/mod-swooper-maps/src/domain/foundation/artifacts/contract/crust.contract.ts` using the stable artifact contract shape. | Reject. No normalization; the guard only checks constructors and length compatibility with mesh cell count. | Artifact contract validation with optional contextual `expectedCellCount`; operation-local code supplies the mesh-derived expected count if still needed. | Stable artifact ids plus cross-operation consumers falsify pure operation-local decomposition. | None. |
| `requireMantlePotential` | `artifact:foundation.mantlePotential`; current schema evidence in `compute-mantle-potential/contract.ts` and stage `foundation/artifacts.ts`. | Accept. Future `mods/mod-swooper-maps/src/domain/foundation/artifacts/contract/mantle-potential.contract.ts` using the stable artifact contract shape. | Reject. No repair; source-count and cell-count `\| 0` checks only reject malformed payloads. | Artifact contract validation with optional contextual `expectedCellCount`. | Direct domain-op consumer is only mantle-forcing, but published artifact id and existing stage validator falsify operation-local-only ownership; duplicating the artifact validator in one op would be authority drift. | None. |
| `requireMantleForcing` | `artifact:foundation.mantleForcing`; current schema evidence in `compute-mantle-forcing/contract.ts` and stage `foundation/artifacts.ts`. | Accept. Future `mods/mod-swooper-maps/src/domain/foundation/artifacts/contract/mantle-forcing.contract.ts` using the stable artifact contract shape. | Reject. The guard checks shape and length; actual forcing normalization is already operation computation/config behavior. | Artifact contract validation with optional contextual `expectedCellCount`. | Stable artifact id, existing validator, and consumers across crust, plate-motion, hotspot-events, and tracer-advection falsify pure operation-local decomposition. | None. |
| `requirePlateGraph` | `artifact:foundation.plateGraph`; current schema evidence in `compute-plate-graph/contract.ts` and stage `foundation/artifacts.ts`. | Accept. Future `mods/mod-swooper-maps/src/domain/foundation/artifacts/contract/plate-graph.contract.ts` using the stable artifact contract shape. Validation should cover full plate metadata schema, not only current `plates.length > 0`. | Reject. No normalization; `cellToPlate` length and non-empty plate list are validation/precondition checks. | Artifact contract validation with optional contextual `expectedCellCount`. | Stable artifact id, existing validator, and consumers across plate tensors, segments, plate motion, era membership, and provenance falsify pure operation-local decomposition. | None. |
| `requirePlateMotion` | `artifact:foundation.plateMotion`; current schema evidence in `compute-plate-motion/contract.ts` and stage `foundation/artifacts.ts`. | Accept. Future `mods/mod-swooper-maps/src/domain/foundation/artifacts/contract/plate-motion.contract.ts` using the stable artifact contract shape. | Reject. No repair; `cellCount \| 0` and `plateCount \| 0` only reject mismatches. | Artifact contract validation with optional contextual mesh and plate counts; operation-local code supplies counts from mesh and plate graph if still needed. | Stable artifact id, existing validator, and consumers across plate tensors, segments, and era membership falsify pure operation-local decomposition. | None. |
| `requireTectonics` | `artifact:foundation.tectonics`; packet already accepts `lib/tectonics/schemas.ts` current tectonics schema/type as artifact-contract extraction. | Accept. Future `mods/mod-swooper-maps/src/domain/foundation/artifacts/contract/current-tectonics.contract.ts` using the stable artifact contract shape. | Reject. Uint8 constructor and length checks only. | Artifact contract validation with optional contextual `expectedCellCount`. | Accepted packet artifact-contract row plus consumers in plate-tensors and crust-evolution falsify pure operation-local decomposition. | None. |
| `requireTectonicHistory` | `artifact:foundation.tectonicHistory`; packet already accepts history schema/type as artifact-contract extraction. | Accept. Future `mods/mod-swooper-maps/src/domain/foundation/artifacts/contract/tectonic-history.contract.ts` using the stable artifact contract shape. Validation should cover the full contract, including `plateIdByEra`, which the current guard omits. | Reject. Era count `\| 0` is validation only; no array repair or fill. | Artifact contract validation with optional contextual `expectedCellCount`. | Accepted packet artifact-contract row plus consumers in plate-tensors and crust-evolution falsify pure operation-local decomposition. | None. |
| `requireTectonicProvenance` | `artifact:foundation.tectonicProvenance`; packet already accepts provenance schema/type as artifact-contract extraction. | Accept. Future `mods/mod-swooper-maps/src/domain/foundation/artifacts/contract/tectonic-provenance.contract.ts` using the stable artifact contract shape. | Reject. Era/cell count checks and scalar typed-array checks only. | Artifact contract validation with optional contextual `expectedCellCount`; operation-local call remains optional in plate-tensors because the input is optional there. | Direct domain-op use is plate-tensors only, but accepted packet artifact-contract row plus published artifact id and existing stage validator falsify operation-local-only ownership. | None. |

## Closure Impact

No owner-law blocker remains from this lens. The closure action is not deletion
or operation normalization. The steward can close the authority side by
recording artifact-contract replacement for every guard, with concrete file
shape governed by the active artifact contract scope and pattern. Execution
should still preserve operation-local call sites/scopes and verify no stale
`foundation/lib/require.ts` imports remain.
