# Tectonics Shared Core

Status: resolved prework domino

Parent packet: `Foundation Lib / Tectonics Disposition Decision Packet`

Investigation plan: `tectonics-shared-core-investigation.md`

## Decision To Close

Resolve whether the generic-looking helpers in
`mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/shared.ts` belong in
`packages/mapgen-core`, remain operation-local foundation implementation, or
split across both.

Core is a candidate owner under test: byte/int8/clamp/vector helpers and
mesh-neighborhood helpers may be core mechanics, but each symbol still needs
owner proof. The remaining decision is per-symbol ownership first, then the
accepted destination API only for symbols that enter core.

## Frame

In:
the helpers in `shared.ts`, their importers, existing `packages/mapgen-core`
math/mesh surfaces, and tests or call sites that define expected behavior.

Foreground:
whether these helpers are reusable engine mechanics with stable semantics, or
foundation-specific conveniences that should be decomposed locally.

Exterior:
moving the whole `shared.ts` file, broadening mapgen-core with foundation
vocabulary, and extracting helpers without caller proof.

Would force a reframe:
evidence that the helpers encode foundation-specific artifact semantics,
operation sequencing, or domain policy rather than general math/mesh mechanics.

## Information Needed

- Complete symbol list from `shared.ts`, including `clampByte`, `clamp01`,
  `clampInt8`, `normalizeToInt8`, `NeighborhoodMesh`, `computeMeanEdgeLen`,
  `findNearestCell`, `chooseDriftNeighbor`, and the already-classified
  non-core `deriveResetThreshold`.
- Complete importer list per symbol.
- Existing `packages/mapgen-core/src/lib/math/**` and `packages/mapgen-core/src/lib/mesh/**`
  APIs, naming, export style, and test conventions.
- Candidate destination paths already identified:
  `packages/mapgen-core/src/lib/math/clamp.ts`,
  `packages/mapgen-core/src/lib/math/int8.ts`,
  `packages/mapgen-core/src/lib/math/int8-vector.ts`, and
  `packages/mapgen-core/src/lib/mesh/neighborhood-mesh.ts`.
- Whether equivalent helpers already exist in core.
- Whether each helper is pure and foundation-vocabulary-free.
- Whether current callers need a stable core API or only operation-local helpers.

## Closure Test

This domino closes when each exported symbol has one exact row:

- core destination path, operation-local destination path, or delete/inline
  decision;
- accepted public API name if it enters `packages/mapgen-core`;
- non-owner statement for rejected candidate owners;
- required tests or proof for the eventual execution slice.

If a core API is accepted, this domino must identify the package export surface
and the caller migration proof required before source movement.

## Resolved Decision

The investigation found complete symbol and importer coverage. The core package
already exposes the relevant `./lib/math`, `./lib/grid`, and `./lib/mesh`
subpaths, so no package-surface blocker remains when the accepted APIs land in
those existing surfaces.

| Symbol | Destination/action | Non-owner | Verification |
| --- | --- | --- | --- |
| `NeighborhoodMesh` | Replace with `CsrPointMesh2D` exported from `packages/mapgen-core/src/lib/mesh/neighborhood-mesh.ts`. `DelaunayMesh` should be assignable to it. | `foundation/lib`; operation-local type bucket; artifact contract. | Type assignability coverage; `nx run mapgen-core:build`; `nx run mod-swooper-maps:check`. |
| `clampByte` | Extract as `quantizeU8(value)` in `packages/mapgen-core/src/lib/math/quantize.ts`, re-exported by `lib/math/index.ts`. | Local byte helper; foundation policy; existing `clampU8` because semantics differ. | Core tests for `NaN`, infinities, rounding, and saturation; `nx run mapgen-core:test`; affected mod check. |
| `clamp01` | Delete wrapper and replace exact behavior with `clampFinite(value, 0, 1, 0)` from `@swooper/mapgen-core/lib/math`. | New API; local wrapper; plain `clamp01` replacement because non-finite semantics differ. | Semantic comparison; import scan for local `clamp01`; `nx run mod-swooper-maps:check`. |
| `clampInt8` | Extract as `quantizeI8Symmetric(value)` in `packages/mapgen-core/src/lib/math/quantize.ts`, re-exported by `lib/math/index.ts`. | Local int8 helper; existing `clampInt`; existing `quantizeI8Signed` as exact owner because non-finite semantics differ. | Core tests for `NaN`, infinities, rounding, and `[-127, 127]`; `nx run mapgen-core:test`; affected mod check. |
| `normalizeToInt8` | Extract as `quantizeUnitVec2I8(vec, epsilon = 1e-9)` in `packages/mapgen-core/src/lib/grid/vector-field.ts`, returning core `x/y`; callers adapt to artifact `u/v`. | Foundation event/tracing helper; artifact-specific `{ u, v }` API; new `./lib/vector` subpath. | Core vector tests for zero, tiny, non-finite, cardinal, diagonal, and bounds; affected operation tests/check. |
| `computeMeanEdgeLen` | Extract as `meanMeshEdgeLength(mesh, maxEdges = 100_000)` in `packages/mapgen-core/src/lib/mesh/neighborhood-mesh.ts`. | Duplicated operation-local copies; foundation shared helper. | Core mesh tests for empty fallback, duplicate avoidance, invalid/zero skip, periodic wrap, and max cap; `nx run mapgen-core:test`; mod check. |
| `findNearestCell` | Extract as `findNearestMeshCell(mesh, x, y)` in `packages/mapgen-core/src/lib/mesh/neighborhood-mesh.ts`. | Duplicated membership helper; foundation shared helper. | Core mesh tests for empty `-1`, periodic distance, and strict first tie; `nx run mapgen-core:test`; mod check. |
| `chooseDriftNeighbor` | Extract as `selectMeshNeighborByVectorProjection(params)` in `packages/mapgen-core/src/lib/mesh/neighborhood-mesh.ts`; callers dequantize signed-byte vectors before calling. | Drift-named foundation helper; hex-grid direction helper as exact replacement. | Core mesh tests for no-neighbor, zero-vector, periodic displacement, first tie, and projection behavior; affected operation tests/check. |
| `deriveResetThreshold` | Move to `foundation/ops/compute-tectonic-provenance/rules/reset-threshold-policy.ts`. | `packages/mapgen-core`; domain-wide policy; shared bucket. | Operation policy tests; import scan for `deriveResetThreshold`; `nx run mod-swooper-maps:test`; `nx run mod-swooper-maps:check`. |

## Evidence

- `evidence/tectonics-shared-core-agent-b.md` records semantic comparison
  against existing `mapgen-core` helpers.
- Agent C ownership adjudication found no owner-law or package-surface blocker:
  every symbol has an exact accepted owner and action.

## Closure

No blocker remains. The later execution slice should create the named core APIs,
replace existing wrappers/imports, delete duplicated operation-local copies where
superseded, keep `deriveResetThreshold` operation-local, and prove the movement
with the tests and import scans named above.
