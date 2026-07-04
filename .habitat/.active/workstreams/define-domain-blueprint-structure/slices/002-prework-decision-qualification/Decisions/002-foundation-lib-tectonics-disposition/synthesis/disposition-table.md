# Disposition Table

Status: open synthesis artifact

Decision answered:

```text
classify each foundation `lib/**` file as domain model policy/data,
operation-local implementation, artifact contract, core mechanics, or deletion.
```

## Decision Summary

The current `foundation/lib/**` tree is not an owner in the closed domain
blueprint. Most live rows split into exact policy, artifact-contract,
operation-rule support, and deletion candidates. Two row classes remain open as
first-class domino files: operation guard decomposition and core mechanics
extraction proof.

Item-level outcome:

- `Decision not yet fully closed; all rows except the two open domino classes
  have usable dispositions`

## Row Dispositions

| Path or symbol | Liveness | Owner | Explicit non-owner | Disposition | Evidence strength | Governing authority |
| --- | --- | --- | --- | --- | --- | --- |
| `lib/crust/buoyancy.ts` | live | Domain model policy | `packages/mapgen-core`; operation-local rules | Promote as `foundation/model/policy/crust-buoyancy.ts`. | verified | `decision-book/owner-boundaries.md`; `decision-book/move-classes.md` |
| `lib/normalize.ts` | live | Domain model policy | generic op helper bucket; `packages/mapgen-core` | Promote as `foundation/model/policy/reference-area.ts`, preserving env-dimension validation plus reference-area derivation as one tested policy. | verified | `decision-book/owner-boundaries.md`; `mods/mod-swooper-maps/test/foundation/reference-area-policy.test.ts` |
| `lib/require.ts` | live | Operation-local guard support | artifact contract; shared `foundation/lib` | Unresolved prework domino: `require-guards.domino.md`. No whole-file move. | open domino | `decision-book/content-classes.md`; `decision-book/move-classes.md` |
| `lib/tectonics/constants.ts` / `EVENT_TYPE` | live | Domain model policy | operation rules; artifact contracts | Promote as `foundation/model/policy/tectonic-event-types.ts`. | verified | `decision-book/owner-boundaries.md` |
| `lib/tectonics/constants.ts` / reset threshold constants | live | Operation-local policy/rules | domain-wide policy bucket | Move to `foundation/ops/compute-tectonic-provenance/rules/reset-threshold-policy.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/constants.ts` / `ADVECTION_STEPS_PER_ERA` | live | Operation-local policy/rules | domain-wide policy bucket | Move to `foundation/ops/compute-tracer-advection/rules/constants.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/constants.ts` / `ERA_COUNT_MIN`, `ERA_COUNT_MAX` | not imported from this file | Operation-local contract/rules already owns live copy | domain-wide policy bucket | Do not preserve from `lib`; live owner is `foundation/ops/compute-era-plate-membership/rules/constants.ts`. Delete stale export during constants split after import proof. | corroborated | `decision-book/move-classes.md` |
| `lib/tectonics/constants.ts` / `OROGENY_ERA_GAIN_MIN`, `OROGENY_ERA_GAIN_MAX` | not imported from this file | no current foundation-lib owner | domain-wide policy bucket by accident | Delete from `lib`; no current owner claims this duplicate export. Any future reintroduction requires a separate decision and is not part of this packet. | corroborated | `decision-book/move-classes.md` |
| `lib/tectonics/internal-contract.ts` / event schemas | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/contract/tectonic-events.contract.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/internal-contract.ts` / era-field schemas | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/contract/tectonic-era-fields.contract.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/internal-contract.ts` / `PlateIdByEraSchema` | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/contract/plate-id-by-era.contract.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/internal-contract.ts` / `TracerIndexByEraSchema` | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/contract/tracer-index-by-era.contract.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/schemas.ts` / history schema/type | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/contract/tectonic-history.contract.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/schemas.ts` / current tectonics schema/type | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/contract/current-tectonics.contract.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/schemas.ts` / provenance schema/type | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/contract/tectonic-provenance.contract.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/shared.ts` / byte, int8, and normalized-vector helpers | live | Core mechanics candidate | foundation model policy; artifact contracts | Unresolved prework domino: `tectonics-shared-core.domino.md`. Candidate destinations are `packages/mapgen-core/src/lib/math/clamp.ts`, `packages/mapgen-core/src/lib/math/int8.ts`, and `packages/mapgen-core/src/lib/math/int8-vector.ts`. | open domino | `decision-book/owner-boundaries.md`; `packages/mapgen-core/src/AGENTS.md` |
| `lib/tectonics/shared.ts` / `NeighborhoodMesh`, `computeMeanEdgeLen`, `findNearestCell`, `chooseDriftNeighbor` | live | Core mechanics candidate | foundation model policy; artifact contracts | Unresolved prework domino: `tectonics-shared-core.domino.md`. Candidate destination is `packages/mapgen-core/src/lib/mesh/neighborhood-mesh.ts`. | open domino | `decision-book/owner-boundaries.md`; `packages/mapgen-core/src/AGENTS.md` |
| `lib/tectonics/shared.ts` / `deriveResetThreshold` | live | Operation-local policy/rules | core mechanics | Move to `foundation/ops/compute-tectonic-provenance/rules/reset-threshold-policy.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/index.ts` | dead barrel | deletion | public domain surface | Delete after import proof and typecheck. | corroborated | `decision-book/move-classes.md` |
| `lib/tectonics/events.ts` | dead duplicate | deletion | shared implementation bucket | Delete; active owners are `foundation/ops/compute-segment-events/rules/index.ts` and `foundation/ops/compute-hotspot-events/rules/index.ts`. | corroborated | `decision-book/move-classes.md` |
| `lib/tectonics/fields.ts` | dead duplicate | deletion | shared implementation bucket | Delete; active owner is `foundation/ops/compute-era-tectonic-fields/rules/index.ts`. | corroborated | `decision-book/move-classes.md` |
| `lib/tectonics/membership.ts` | dead duplicate | deletion | shared implementation bucket | Delete; active owner is `foundation/ops/compute-era-plate-membership/rules/compute-plate-id-by-era.ts`. | corroborated | `decision-book/move-classes.md` |
| `lib/tectonics/provenance.ts` | dead duplicate | deletion | shared implementation bucket | Delete; active owner is `foundation/ops/compute-tectonic-provenance/rules/index.ts`. | corroborated | `decision-book/move-classes.md` |
| `lib/tectonics/rollups.ts` | dead duplicate | deletion | shared implementation bucket | Delete; active owners are `foundation/ops/compute-tectonic-history-rollups/rules/index.ts` and `foundation/ops/compute-tectonics-current/rules/index.ts`. | corroborated | `decision-book/move-classes.md` |
| `lib/tectonics/tracing.ts` | dead duplicate | deletion | shared implementation bucket | Delete; active owner is `foundation/ops/compute-tracer-advection/rules/index.ts`. | corroborated | `decision-book/move-classes.md` |

## Write-Back Targets

| Result | Owning reference | Update needed |
| --- | --- | --- |
| Packet remains active | `../../inventory.md` | Inventory points back to this packet until both open dominoes close. |
| Open operation guard decomposition | `require-guards.domino.md` | Resolve per-export destinations before moving or deleting `require.ts`. |
| Open core mechanics extraction proof | `tectonics-shared-core.domino.md` | Resolve destination API before moving helper symbols. |
| Deletion candidates qualified but not executed | Future source-moving slice | Delete only with source import proof plus typecheck/test proof. |
