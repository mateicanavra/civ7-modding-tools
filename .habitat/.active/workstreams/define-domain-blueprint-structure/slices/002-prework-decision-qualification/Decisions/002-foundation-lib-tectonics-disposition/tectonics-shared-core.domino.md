# Tectonics Shared Core

Status: unresolved prework domino

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

## Current Read

This is the hairier of the two because extraction changes package authority,
not just foundation file placement. It is still likely resolvable from local
evidence: the main work is proving whether the helpers are vocabulary-free,
already duplicated, and reusable enough to deserve a core API.
