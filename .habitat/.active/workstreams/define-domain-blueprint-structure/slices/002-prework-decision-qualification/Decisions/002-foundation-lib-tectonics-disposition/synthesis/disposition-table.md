# Disposition Table

Status: closed synthesis artifact

Decision answered:

```text
classify each foundation `lib/**` file as domain model policy/data,
operation-local implementation, artifact contract, core mechanics, or deletion.
```

## Decision Summary

The current `foundation/lib/**` tree is not an owner in the closed domain
blueprint. Live rows split into exact policy, artifact-contract, operation-rule
support, and core-candidate destinations; unimported tectonics implementation
rows are deletion candidates because active operation-local rule owners already
exist. The packet answers the disposition question but does not authorize
immediate source movement: mixed rows require a narrow reference update or
implementation-slice proof before execution.

Item-level outcome:

- `Reference update required before execution`

## Row Dispositions

| Path or symbol | Liveness | Owner | Explicit non-owner | Disposition | Evidence strength | Governing authority |
| --- | --- | --- | --- | --- | --- | --- |
| `lib/crust/buoyancy.ts` | live | Domain model policy | `packages/mapgen-core`; operation-local rules | Promote as `foundation/model/policy/crust-buoyancy.ts`. | verified | `decision-book/owner-boundaries.md`; `decision-book/move-classes.md` |
| `lib/normalize.ts` | live | Domain model policy | generic op helper bucket; `packages/mapgen-core` | Promote as `foundation/model/policy/reference-area.ts`, preserving env-dimension validation plus reference-area derivation as one tested policy. | verified | `decision-book/owner-boundaries.md`; `mods/mod-swooper-maps/test/foundation/reference-area-policy.test.ts` |
| `lib/require.ts` | live | Operation-local guard support | artifact contract; shared `foundation/lib` | Reference update required. Either decompose exported guards into consuming operations as `foundation/ops/<operation-id>/rules/input-guards.ts`, or first create a named artifact-validation owner law. No whole-file move. | corroborated | `decision-book/content-classes.md`; `decision-book/move-classes.md` |
| `lib/tectonics/constants.ts` / `EVENT_TYPE` | live | Domain model policy | operation rules; artifact contracts | Promote as `foundation/model/policy/tectonic-event-types.ts`. | verified | `decision-book/owner-boundaries.md` |
| `lib/tectonics/constants.ts` / reset threshold constants | live | Operation-local policy/rules | domain-wide policy bucket | Move to `foundation/ops/compute-tectonic-provenance/rules/reset-threshold-policy.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/constants.ts` / `ADVECTION_STEPS_PER_ERA` | live | Operation-local policy/rules | domain-wide policy bucket | Move to `foundation/ops/compute-tracer-advection/rules/constants.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/constants.ts` / `ERA_COUNT_MIN`, `ERA_COUNT_MAX` | not imported from this file | Operation-local contract/rules already owns live copy | domain-wide policy bucket | Do not preserve from `lib`; live owner is `foundation/ops/compute-era-plate-membership/rules/constants.ts`. Delete stale export during constants split after import proof. | corroborated | `decision-book/move-classes.md` |
| `lib/tectonics/constants.ts` / `OROGENY_ERA_GAIN_MIN`, `OROGENY_ERA_GAIN_MAX` | not imported from this file | no current foundation-lib owner | domain-wide policy bucket by accident | Delete from `lib` unless a later recipe-stage or foundation-policy decision explicitly claims the duplicated recipe calculation. | corroborated | `decision-book/move-classes.md` |
| `lib/tectonics/internal-contract.ts` / event schemas | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/contract/tectonic-events.contract.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/internal-contract.ts` / era-field schemas | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/contract/tectonic-era-fields.contract.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/internal-contract.ts` / `PlateIdByEraSchema` | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/contract/plate-id-by-era.contract.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/internal-contract.ts` / `TracerIndexByEraSchema` | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/contract/tracer-index-by-era.contract.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/schemas.ts` / history schema/type | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/contract/tectonic-history.contract.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/schemas.ts` / current tectonics schema/type | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/contract/current-tectonics.contract.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/schemas.ts` / provenance schema/type | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/contract/tectonic-provenance.contract.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/shared.ts` / byte, int8, and normalized-vector helpers | live | Core mechanics candidate | foundation model policy; artifact contracts | Core extraction candidate to `packages/mapgen-core/src/lib/math/clamp.ts`, `packages/mapgen-core/src/lib/math/int8.ts`, and `packages/mapgen-core/src/lib/math/int8-vector.ts`; execution requires exact core API proof because current consumers are foundation-only. | unresolved until execution proof | `decision-book/owner-boundaries.md`; `packages/mapgen-core/src/AGENTS.md` |
| `lib/tectonics/shared.ts` / `NeighborhoodMesh`, `computeMeanEdgeLen`, `findNearestCell`, `chooseDriftNeighbor` | live | Core mechanics candidate | foundation model policy; artifact contracts | Core extraction candidate to `packages/mapgen-core/src/lib/mesh/neighborhood-mesh.ts`; execution requires proof the API is domain-free and belongs in core. | unresolved until execution proof | `decision-book/owner-boundaries.md`; `packages/mapgen-core/src/AGENTS.md` |
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
| Packet closed and queue advanced | `../inventory.md` | Move item 1 to completed decisions with proof pointer; set current next move to `Domain Model Config Law`. |
| Mixed constants and shared-helper rows require follow-up law before movement | Future source-moving slice | Open exact implementation rows for constants and shared helpers; do not move whole files. |
| Deletion candidates qualified but not executed | Future source-moving slice | Delete only with source import proof plus typecheck/test proof. |
