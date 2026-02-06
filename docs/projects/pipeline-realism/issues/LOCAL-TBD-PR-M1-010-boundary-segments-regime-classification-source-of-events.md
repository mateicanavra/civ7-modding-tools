id: LOCAL-TBD-PR-M1-010
title: Boundary segments + regime classification (source of events)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-008, LOCAL-TBD-PR-M1-009]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Produce an authoritative boundary-segment decomposition and regime classification used as the SSOT input for event mechanics (D06r) and history/provenance evolution.

## Deliverables
- Emit a boundary segments truth surface suitable for events + belts:
  - boundary segments between plate pairs with regime classification and polarity where applicable,
  - intensity measures required by downstream event engine and history rollups.
- Ensure regime classification is derived from the new authoritative drivers:
  - plate motion (`LOCAL-TBD-PR-M1-008`) and crust resistance (`LOCAL-TBD-PR-M1-009`) must influence segment classification.
- Define “event corridor” semantics at the segments level:
  - which segments qualify as subduction/collision/rift/transform candidates,
  - what per-segment scalars downstream should interpret as “force opportunity” vs “material change”.

## Acceptance Criteria
- A single segment decomposition is used by:
  - the history/era system (`LOCAL-TBD-PR-M1-012`) and
  - the event engine (`LOCAL-TBD-PR-M1-011`).
  No duplicate boundary inference exists in those subsystems.
- Segment classification is deterministic and stable:
  - identical inputs => identical segment arrays,
  - wrap correctness holds at mesh wrap boundaries.
- Polarity rules are explicit and stable (especially for oceanic-under-continental cases).

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Extend the existing “segments + history” tests to cover new classification expectations:
  - `mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts`
    - polarity stability tests (oceanic-under-continental pairing),
    - determinism tests for segment arrays,
    - rotation/shear sensitivity tests.

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-008`
  - `LOCAL-TBD-PR-M1-009`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/index.ts` and `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/contract.ts` (segment decomposition + regime classification)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts` and `.contract.ts` (wires segments/history/tectonics outputs; emits per-era variants)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (`artifact:foundation.tectonicSegments` schema; keep truth vs projection posture clear)
- `mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts` (existing rotation/polarity sensitivity tests; update to mantle-derived motion)
- `mods/mod-swooper-maps/test/foundation/m11-projection-boundary-band.test.ts` (boundary band projection behavior; helpful for downstream Morphology gates)

### References
- docs/projects/pipeline-realism/resources/spec/sections/events-and-forces.md
- docs/projects/pipeline-realism/resources/decisions/d06r-event-mechanics-and-force-emission.md
- docs/system/libs/mapgen/reference/domains/FOUNDATION.md

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

The current Foundation already has a segment decomposition and regime classification:
- artifact: `artifact:foundation.tectonicSegments` (see `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`)
- op: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/index.ts`
- contract: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/contract.ts`

There are tests for polarity and rotation sensitivity already:
- `mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts`

### Proposed Change Surface

Expected implementation touchpoints:
- segments op: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/*`
- inputs that change classification:
  - derived plate motion (`LOCAL-TBD-PR-M1-008`)
  - crust/lithosphere resistance (`LOCAL-TBD-PR-M1-006`, `LOCAL-TBD-PR-M1-009`)

### Pitfalls / Rakes

- Keeping the legacy segments artifact but changing its semantics silently (downstream assumes old ranges/meaning).
- Event engine re-derives its own boundary inference (breaks “single SSOT” and makes validation ambiguous).

### Wow Scenarios

- **Event corridors are legible:** a human can look at the segment regime layer and understand where subduction/collision chains will appear before morphology runs, and later see provenance/belt continuity follow those corridors.

### Implementation Decisions

- Segment intensities now scale with lithosphere resistance: compression is boosted by higher `crust.strength`, extension/shear are boosted by weaker crust, keeping average intensity near baseline while making resistance influence regime classification.
