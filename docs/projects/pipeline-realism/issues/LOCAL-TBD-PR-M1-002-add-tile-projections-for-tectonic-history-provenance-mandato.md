id: LOCAL-TBD-PR-M1-002
title: Add tile projections for tectonic history + provenance (mandatory drivers)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-001]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Project mesh-space history/provenance into tile-space drivers so Morphology can consume mandatory causal signals deterministically (without reading mesh artifacts).

## Deliverables
- Emit the new tile-space projection artifacts (defined in `LOCAL-TBD-PR-M1-001`):
  - `artifact:foundation.tectonicHistoryTiles`
  - `artifact:foundation.tectonicProvenanceTiles`
- Define projection invariants (must be implemented, not implied):
  - projections are pure functions of `{ width, height, tileToCellIndex, mesh-space truth artifacts }`
  - projections must not re-derive a different mapping or neighbor graph (use `artifact:foundation.tileToCellIndex` as the SSOT cross-walk)
  - wrap semantics are inherited from the mapping construction (no ad-hoc wrap logic in per-artifact projection loops)
- Wire into the standard recipe Foundation projection step so downstream domains can require the artifacts:
  - extend `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts` to publish the new artifacts (and optionally emit viz grids for inspection).

## Acceptance Criteria
- The artifacts exist and are publishable as declared “provides” by the Foundation projection step.
- For each projected tile tensor, shape is exactly `width * height`, and all values are deterministic for a fixed `{ seed, env, config }`.
- Projection correctness relies on a single mapping:
  - changing `tileToCellIndex` changes the projections in the expected places,
  - and no additional “nearest cell” logic exists elsewhere (one mapping, one policy).

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Add/extend a tile-projection unit test in the existing projection test area:
  - `mods/mod-swooper-maps/test/foundation/tile-projection-materials.test.ts` (extend pattern) to include at least one history/provenance channel.
- Add/extend a pipeline artifact “provides” contract test:
  - `mods/mod-swooper-maps/test/pipeline/artifacts.test.ts` (extend “fails provides when…” pattern for one new projection artifact).

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-001`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts` (canonical mesh→tile mapping + sampling loop; `tileToCellIndex` SSOT)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts` and `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts` (publish + declare projection artifacts)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (declare the new `foundationArtifacts.*Tiles` ids + schemas)
- `mods/mod-swooper-maps/test/foundation/tile-projection-materials.test.ts` (determinism/wrap/tie-breaker projection tests)
- `mods/mod-swooper-maps/test/pipeline/artifacts.test.ts` (assert “provides means published” for new projection artifacts)

### References
- docs/projects/pipeline-realism/resources/spec/sections/history-and-provenance.md
- docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md
- docs/system/libs/mapgen/reference/domains/FOUNDATION.md
- docs/system/libs/mapgen/pipeline-visualization-deckgl.md

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Current State (Observed)

Today’s mesh→tile projection is centralized in a single place:
- `artifact:foundation.tileToCellIndex` is produced as part of the Foundation projection outputs.
- The projection op `compute-plates-tensors` constructs `tileToCellIndex` and uses it to sample mesh truth into tile tensors.

Ground truth anchors:
- Projection op (mapping + sampling loop): `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts`
- Projection step wiring: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts`
- Determinism + wrap/tie-breakers test: `mods/mod-swooper-maps/test/foundation/tile-projection-materials.test.ts`

### Proposed Change Surface

Expected implementation locations:
- Extend the Foundation projection op to also project history/provenance tile drivers:
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/*` (extend), or introduce a sibling op if the contract would otherwise become unreasonably large.
- Publish via the standard recipe Foundation projection step:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts`
- Add visualization emissions for the new tile drivers (debug visibility is fine; stable `dataTypeKey` is required):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts` (via `context.viz?.dumpGrid(...)`)

### Pitfalls / Rakes

- Accidentally creating a second “tile↔mesh mapping” implementation for history/provenance, leading to silent inconsistencies across tile tensors.
- Encoding provenance/history in tile space in a way that becomes a new truth source. These are projections and must remain derivable from mesh truth + mapping.

### Wow Scenarios

- **Morphology dual-read becomes meaningful:** a run can render belts from new provenance/history tile drivers and compare against legacy drivers tile-by-tile, with the only difference being the driver source (not different sampling policies).
