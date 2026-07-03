# Agent Briefs And Scratch Pads

Status: closed coordination artifact

## Steward Brief

Own synthesis, authority interpretation, packet edits, write-back, validation,
and commit. Treat source paths as evidence, not authority. Do not perform source
movement or deletion in this packet.

Scratch pad:

- Direct file list contains fourteen `foundation/lib/**` files.
- Live rows: `crust/buoyancy.ts`, `normalize.ts`, `require.ts`,
  `tectonics/constants.ts`, `tectonics/internal-contract.ts`,
  `tectonics/schemas.ts`, `tectonics/shared.ts`.
- Unimported rows:
  `tectonics/index.ts`, `events.ts`, `fields.ts`, `membership.ts`,
  `provenance.ts`, `rollups.ts`, `tracing.ts`.
- Unimported implementation files have active operation-local counterparts.
- No current row has enough evidence for `packages/mapgen-core` ownership in
  this prework lane.

## Source Mapper Lane

Task: map exports, direct importers, likely role, candidate owner, and evidence
limits for each current `foundation/lib/**` file.

Scratch pad:

- `crust/buoyancy.ts` is live through `compute-crust` and
  `compute-crust-evolution`.
- `normalize.ts` is live through `compute-mesh` and `compute-plate-graph`.
- `require.ts` is live through many foundation operation and rules files.
- `tectonics/constants.ts`, `internal-contract.ts`, `schemas.ts`, and
  `shared.ts` are live through tectonics operation contracts/rules.
- `tectonics/index.ts` and the implementation modules `events.ts`,
  `fields.ts`, `membership.ts`, `provenance.ts`, `rollups.ts`, and
  `tracing.ts` have no direct source importers.

## Authority Mapper Lane

Task: identify governing authority, non-owners, and authority gaps.

Scratch pad:

- Domain model policy owns named cross-operation semantic concerns.
- Artifact contracts own pipeline truth product contracts.
- Operation-local rules own implementation for one operation.
- `packages/mapgen-core/src/lib/**` owns pure math/grid/algorithmic mechanics
  only when domain semantics are absent.
- `domain/lib` is not a target owner in the closed blueprint.
- The scope law names destination classes, but some live foundation-wide helper
  surfaces need narrower named reference updates before execution.

## Unused-Code Auditor Lane

Task: determine which rows can be deletion candidates and what proof limits
apply.

Scratch pad:

- `rg` found no importers for `tectonics/index.ts`, `events.ts`, `fields.ts`,
  `membership.ts`, `provenance.ts`, `rollups.ts`, or `tracing.ts`.
- Active operation-local replacements exist for the exported implementation
  symbols in those files.
- Deletion remains a later execution action. The packet only records
  qualification and the proof that must accompany deletion.
