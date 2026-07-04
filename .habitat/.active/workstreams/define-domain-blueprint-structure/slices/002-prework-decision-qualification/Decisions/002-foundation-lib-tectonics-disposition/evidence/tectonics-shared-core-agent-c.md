# Tectonics Shared Core Agent C Evidence

Status: complete investigation artifact

Scope: final ownership adjudication for
`mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/shared.ts`.

Agent C consumed the Agent A usage matrix and Agent B core-comparison evidence.
No TypeScript source, tests, generated artifacts, package exports, Grit, or
runtime behavior were changed.

| Symbol | Accepted owner | Destination/action | State-space outcome | Authority gap |
| --- | --- | --- | --- | --- |
| `NeighborhoodMesh` | `packages/mapgen-core` mesh mechanics. | Add/export `CsrPointMesh2D` from `packages/mapgen-core/src/lib/mesh/neighborhood-mesh.ts`; replace local type. | New core type justified. | None. |
| `clampByte` | `packages/mapgen-core` scalar math. | Add `quantizeU8(value)` in `packages/mapgen-core/src/lib/math/quantize.ts`; export through `lib/math/index.ts`; delete wrapper. | New core API justified. | None. |
| `clamp01` | Existing `packages/mapgen-core` math. | Delete wrapper and replace exact behavior with `clampFinite(value, 0, 1, 0)` from `@swooper/mapgen-core/lib/math`. | Replace with existing owner. | None. |
| `clampInt8` | `packages/mapgen-core` scalar math. | Add `quantizeI8Symmetric(value)` in `packages/mapgen-core/src/lib/math/quantize.ts`; export through `lib/math/index.ts`; delete wrapper. | New core API justified. | None. |
| `normalizeToInt8` | `packages/mapgen-core` vector/grid mechanics. | Add `quantizeUnitVec2I8(vec, epsilon = 1e-9)` to `packages/mapgen-core/src/lib/grid/vector-field.ts`; return core `x/y`; callers adapt to artifact `u/v`. | New core API justified. | None. |
| `computeMeanEdgeLen` | `packages/mapgen-core` mesh mechanics. | Add `meanMeshEdgeLength(mesh, maxEdges = 100_000)` in `packages/mapgen-core/src/lib/mesh/neighborhood-mesh.ts`; delete local duplicates. | New core API justified. | None. |
| `findNearestCell` | `packages/mapgen-core` mesh mechanics. | Add `findNearestMeshCell(mesh, x, y)` in `packages/mapgen-core/src/lib/mesh/neighborhood-mesh.ts`; delete local duplicates. | New core API justified. | None. |
| `chooseDriftNeighbor` | `packages/mapgen-core` mesh mechanics. | Add `selectMeshNeighborByVectorProjection(params)` in `packages/mapgen-core/src/lib/mesh/neighborhood-mesh.ts`; callers pass dequantized vector components. | New core API justified. | None. |
| `deriveResetThreshold` | Operation-local foundation provenance policy. | Move to `foundation/ops/compute-tectonic-provenance/rules/reset-threshold-policy.ts`. | Keep operation policy. | None. |

Closure impact: `tectonics-shared-core.domino.md` can close. The remaining work
is implementation and verification in a later execution slice.
