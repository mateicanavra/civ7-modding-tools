# Disposition Table

Status: closed synthesis artifact

Decision answered:

```text
classify each foundation `lib/**` file as domain model policy/data,
operation-local implementation, artifact contract, core mechanics, or deletion.
```

## Decision Summary

The current `foundation/lib/**` tree is not an owner in the closed domain
blueprint. All live rows now split into exact domain policy, artifact-contract,
operation-local policy, core mechanics, or deletion destinations. The two
previously open domino classes are resolved and no prework blocker remains.

Item-level outcome:

- `Decision fully closed at the prework layer; execution Slices 1-6 are
  supervisor-accepted; final owner Habitat/test gates and source-owner scans
  are green as recorded in execution.md`

## Row Dispositions

| Path or symbol | Liveness | Owner | Explicit non-owner | Disposition | Evidence strength | Governing authority |
| --- | --- | --- | --- | --- | --- | --- |
| `lib/crust/buoyancy.ts` | live | Domain model policy | `packages/mapgen-core`; operation-local rules | Promote as `foundation/model/policy/crust-buoyancy.ts`. | verified | `decision-book/owner-boundaries.md`; `decision-book/move-classes.md` |
| `lib/normalize.ts` | live | Domain model policy | generic op helper bucket; `packages/mapgen-core` | Promote as `foundation/model/policy/reference-area.ts`, preserving env-dimension validation plus reference-area derivation as one tested policy. | verified | `decision-book/owner-boundaries.md`; `mods/mod-swooper-maps/test/foundation/reference-area-policy.test.ts` |
| `lib/require.ts` / all `require*` exports | live | Contract-owned artifact validation surface | shared `foundation/lib`; broad validation bucket; operation-local copied guards as final owner | Route guard semantics to artifact modules: `mesh.artifact.ts`, `crust.artifact.ts`, `mantle-potential.artifact.ts`, `mantle-forcing.artifact.ts`, `plate-graph.artifact.ts`, `plate-motion.artifact.ts`, `current-tectonics.artifact.ts`, `tectonic-history.artifact.ts`, and `tectonic-provenance.artifact.ts`. Concrete file/export shape is governed by the active artifact scope pattern. | verified | `require-guards.domino.md`; `evidence/require-guards-agent-a.md`; `evidence/require-guards-agent-c.md`; `decision-book/move-classes.md`; `../../../../../scopes/domain/scopes/artifacts/patterns/artifact-shape.md` |
| `lib/tectonics/constants.ts` / `EVENT_TYPE` | live | Domain model policy | operation rules; artifact contracts | Promote as `foundation/model/policy/tectonic-event-types.ts`. | verified | `decision-book/owner-boundaries.md` |
| `lib/tectonics/constants.ts` / reset threshold constants | live | Operation-local policy/rules | domain-wide policy bucket | Move to `foundation/ops/compute-tectonic-provenance/rules/reset-threshold-policy.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/constants.ts` / `ADVECTION_STEPS_PER_ERA` | live | Operation-local policy/rules | domain-wide policy bucket | Move to `foundation/ops/compute-tracer-advection/rules/constants.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/constants.ts` / `ERA_COUNT_MIN`, `ERA_COUNT_MAX` | not imported from this file | Operation-local contract/rules already owns live copy | domain-wide policy bucket | Not preserved from `lib`; live owner is `foundation/ops/compute-era-plate-membership/rules/constants.ts`. Stale export was deleted during constants split after import proof. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/constants.ts` / `OROGENY_ERA_GAIN_MIN`, `OROGENY_ERA_GAIN_MAX` | not imported from this file | no current foundation-lib owner | domain-wide policy bucket by accident | Delete from `lib`; no current owner claims this duplicate export. Any future reintroduction requires a separate decision and is not part of this packet. | corroborated | `decision-book/move-classes.md` |
| `lib/tectonics/internal-contract.ts` / event schemas | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/tectonic-events.artifact.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/internal-contract.ts` / era-field schemas | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/tectonic-era-fields.artifact.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/internal-contract.ts` / `PlateIdByEraSchema` | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/plate-id-by-era.artifact.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/internal-contract.ts` / `TracerIndexByEraSchema` | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/tracer-index-by-era.artifact.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/schemas.ts` / history schema/type | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/tectonic-history.artifact.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/schemas.ts` / current tectonics schema/type | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/current-tectonics.artifact.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/schemas.ts` / provenance schema/type | live | Artifact contract | operation rules; domain model policy | Split to `foundation/artifacts/tectonic-provenance.artifact.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/shared.ts` / `NeighborhoodMesh` | live | Core mesh mechanics | foundation model policy; artifact contracts; operation-local type bucket | Replace with `CsrPointMesh2D` exported from `packages/mapgen-core/src/lib/mesh/neighborhood-mesh.ts`. | verified | `tectonics-shared-core.domino.md`; `evidence/tectonics-shared-core-agent-b.md`; `evidence/tectonics-shared-core-agent-c.md`; `packages/mapgen-core/src/AGENTS.md` |
| `lib/tectonics/shared.ts` / `clampByte` | live | Core scalar math | foundation model policy; artifact contracts; existing `clampU8` as exact replacement | Extract as `quantizeU8(value)` in `packages/mapgen-core/src/lib/math/quantize.ts`, exported by `lib/math/index.ts`. | verified | `tectonics-shared-core.domino.md`; `evidence/tectonics-shared-core-agent-b.md`; `evidence/tectonics-shared-core-agent-c.md`; `packages/mapgen-core/src/AGENTS.md` |
| `lib/tectonics/shared.ts` / `clamp01` | live | Existing core scalar math | foundation shared wrapper; new core API | Delete wrapper and replace exact semantics with `clampFinite(value, 0, 1, 0)` from `@swooper/mapgen-core/lib/math`. | verified | `tectonics-shared-core.domino.md`; `evidence/tectonics-shared-core-agent-b.md`; `packages/mapgen-core/src/AGENTS.md` |
| `lib/tectonics/shared.ts` / `clampInt8` | live | Core scalar math | foundation model policy; artifact contracts; existing `clampInt` or `quantizeI8Signed` as exact replacement | Extract as `quantizeI8Symmetric(value)` in `packages/mapgen-core/src/lib/math/quantize.ts`, exported by `lib/math/index.ts`. | verified | `tectonics-shared-core.domino.md`; `evidence/tectonics-shared-core-agent-b.md`; `evidence/tectonics-shared-core-agent-c.md`; `packages/mapgen-core/src/AGENTS.md` |
| `lib/tectonics/shared.ts` / `normalizeToInt8` | live | Core vector/grid mechanics | foundation event/tracing helper; artifact-specific `{ u, v }` API; new package subpath | Extract as `quantizeUnitVec2I8(vec, epsilon = 1e-9)` in `packages/mapgen-core/src/lib/grid/vector-field.ts`, returning core `x/y`; callers adapt to artifact `u/v`. | verified | `tectonics-shared-core.domino.md`; `evidence/tectonics-shared-core-agent-b.md`; `evidence/tectonics-shared-core-agent-c.md`; `packages/mapgen-core/src/AGENTS.md` |
| `lib/tectonics/shared.ts` / `computeMeanEdgeLen` | live | Core mesh mechanics | duplicated operation-local copies; foundation shared helper | Extract as `meanMeshEdgeLength(mesh, maxEdges = 100_000)` in `packages/mapgen-core/src/lib/mesh/neighborhood-mesh.ts`. | verified | `tectonics-shared-core.domino.md`; `evidence/tectonics-shared-core-agent-a.md`; `evidence/tectonics-shared-core-agent-c.md`; `packages/mapgen-core/src/AGENTS.md` |
| `lib/tectonics/shared.ts` / `findNearestCell` | live | Core mesh mechanics | duplicated operation-local copies; foundation shared helper | Extract as `findNearestMeshCell(mesh, x, y)` in `packages/mapgen-core/src/lib/mesh/neighborhood-mesh.ts`. | verified | `tectonics-shared-core.domino.md`; `evidence/tectonics-shared-core-agent-a.md`; `evidence/tectonics-shared-core-agent-c.md`; `packages/mapgen-core/src/AGENTS.md` |
| `lib/tectonics/shared.ts` / `chooseDriftNeighbor` | live | Core mesh mechanics | drift-named foundation helper; hex-grid direction helper as exact replacement | Extract as `selectMeshNeighborByVectorProjection(params)` in `packages/mapgen-core/src/lib/mesh/neighborhood-mesh.ts`; callers pass dequantized vector components. | verified | `tectonics-shared-core.domino.md`; `evidence/tectonics-shared-core-agent-a.md`; `evidence/tectonics-shared-core-agent-c.md`; `packages/mapgen-core/src/AGENTS.md` |
| `lib/tectonics/shared.ts` / `deriveResetThreshold` | live | Operation-local policy/rules | core mechanics | Move to `foundation/ops/compute-tectonic-provenance/rules/reset-threshold-policy.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/index.ts` | dead barrel | deletion | public domain surface | Deleted after import proof and typecheck. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/events.ts` | dead duplicate | deletion | shared implementation bucket | Deleted; active owners are `foundation/ops/compute-segment-events/rules/index.ts` and `foundation/ops/compute-hotspot-events/rules/index.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/fields.ts` | dead duplicate | deletion | shared implementation bucket | Deleted; active owner is `foundation/ops/compute-era-tectonic-fields/rules/index.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/membership.ts` | dead duplicate | deletion | shared implementation bucket | Deleted; active owner is `foundation/ops/compute-era-plate-membership/rules/compute-plate-id-by-era.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/provenance.ts` | dead duplicate | deletion | shared implementation bucket | Deleted; active owner is `foundation/ops/compute-tectonic-provenance/rules/index.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/rollups.ts` | dead duplicate | deletion | shared implementation bucket | Deleted; active owners are `foundation/ops/compute-tectonic-history-rollups/rules/index.ts` and `foundation/ops/compute-tectonics-current/rules/index.ts`. | verified | `decision-book/move-classes.md` |
| `lib/tectonics/tracing.ts` | dead duplicate | deletion | shared implementation bucket | Deleted; active owner is `foundation/ops/compute-tracer-advection/rules/index.ts`. | verified | `decision-book/move-classes.md` |

## Write-Back Targets

| Result | Owning reference | Update needed |
| --- | --- | --- |
| Packet closed at prework layer | `../../inventory.md` | Move this packet to completed decisions and point next work at the packet-linked execution workstream. |
| Operation guard decomposition resolved | `require-guards.domino.md` | Use contract-owned artifact validation rows to build `execution.md`; do not introduce assertion exports unless the execution proof shows they are still necessary. |
| Core mechanics extraction proof resolved | `tectonics-shared-core.domino.md` | Use exact core API rows to build `execution.md`. |
| Deletion execution closed | `execution.md` Slice 3, Slice 5, and Slice 6 | Deleted under source import proof plus typecheck/test proof; no `foundation/lib/**` owner path remains. |
