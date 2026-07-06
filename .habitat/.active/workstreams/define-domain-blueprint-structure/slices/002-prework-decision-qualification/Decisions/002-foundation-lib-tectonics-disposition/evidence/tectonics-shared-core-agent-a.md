# Tectonics Shared Core Agent A Evidence

Status: complete investigation artifact

Scope: symbol semantics and consumer matrix for
`mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/shared.ts`.

Narsil was used first for symbol usage and import evidence. `rg` and source
inspection corroborated all current TypeScript importers.

| Symbol | Signature | Current semantics | Consumers | Tests/evidence | Notes |
| --- | --- | --- | --- | --- | --- |
| `NeighborhoodMesh` | Minimal readonly CSR point-neighbor mesh type. | `cellCount`, `wrapWidth`, `siteX`, `siteY`, `neighborsOffsets`, and `neighbors`; no behavior. | Legacy `lib/tectonics/membership.ts`, legacy `lib/tectonics/fields.ts`, live `compute-era-tectonic-fields/rules/index.ts`. | Indirect foundation tests. | Shape is generic and matches a subset of core `DelaunayMesh`. |
| `clampByte` | `(value: number) => number` | `+Infinity -> 255`; `NaN` and `-Infinity -> 0`; finite values round then clamp `0..255`. | Legacy rollups/provenance/events/fields; live hotspot events, era fields, history rollups, provenance, plate tensors, tectonic segments. | Indirect operation and pipeline tests. | Existing core `clampU8` is not equivalent. |
| `clamp01` | `(value: number) => number` | Non-finite values map to `0`; finite values clamp `0..1`. | Legacy events and live hotspot events. | Indirect hotspot event tests. | Existing configured core finite clamp can match behavior. |
| `clampInt8` | `(value: number) => number` | `+Infinity -> 127`; `-Infinity -> -127`; `NaN -> 0`; finite values round then clamp `-127..127`. | Legacy fields; live era fields and plate tensors. | Indirect foundation tests. | Existing core scalar/grid helpers are not exact as-is. |
| `normalizeToInt8` | `(x, y) => { u, v }` | Normalize vector; non-finite or length `<= 1e-9` returns zero; components scale to signed-byte range. | Legacy events/tracing; live hotspot events, tracer advection, tectonic segments. | Indirect event and segment tests. | Current return keys are artifact-facing, not core-facing. |
| `computeMeanEdgeLen` | `(mesh, maxEdges = 100_000) => number` | Samples undirected CSR edges once; uses periodic X; skips invalid, zero, and non-finite edges; caps samples; fallback `1`. | Legacy membership/fields; live era fields. | Indirect foundation tests. | Duplicated local implementation exists in era plate membership. |
| `findNearestCell` | `(mesh, x, y) => number` | Linear periodic-X nearest search; strict first tie; fallback `-1` for empty mesh. | Legacy membership. | Indirect era membership chain tests. | Duplicated local implementation exists in era plate membership. |
| `chooseDriftNeighbor` | `({ cellId, driftU, driftV, mesh }) => number` | Reads CSR neighbors; signed-byte vector decode; zero/no-neighbor fallback to `cellId`; max dot projection with periodic X; strict first tie. | Legacy tracing/fields; live tracer advection and era fields. | Indirect event tests. | Name is drift-specific, but mechanic is generic neighbor selection by vector projection. |
| `deriveResetThreshold` | `(maxValue, fracOfMax, minThreshold) => number` | Byte clamps max/min, clamps finite fraction, rounds derived threshold, bounds floor by actual max. | Legacy provenance; live provenance rules. | Indirect provenance/invariant tests. | Operation provenance reset policy, not core mechanics. |

Coverage: all nine requested symbols and all thirteen TypeScript direct
importers were accounted for. No direct helper unit tests were found; behavior
is currently pinned indirectly by operation and pipeline tests.
