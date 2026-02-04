id: LOCAL-TBD-PR-M1-019
title: Physics invariants: events must change crust/provenance + belts must be wide/continuous
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-011, LOCAL-TBD-PR-M1-013, LOCAL-TBD-PR-M1-004]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Add D09r invariants that prevent “fake tectonics”: if events/forces exist, they must cause material + provenance change, and belt outputs must be wide/continuous (not wall lines).

## Deliverables
- Implement invariant checks (using the shared harness from `LOCAL-TBD-PR-M1-004`) that enforce:
  - **Material change:** event corridors imply measurable updates to crust state variables (not just “forces emitted”).
  - **Provenance change:** event corridors imply measurable updates to provenance/lineage scalars.
  - **Belt plausibility:** belts are wide and continuous relative to driver corridors (no single-tile walls).
- Classify each invariant as hard gate vs diagnostic (Tier-1 failures should block merging).

## Acceptance Criteria
- The invariants run as part of the canonical suite (`LOCAL-TBD-PR-M1-017`) and fail loudly when:
  - event mechanics emit corridor signals but crust/provenance remain unchanged (“force-only tectonics”).
- Belt width/continuity is measurable and enforced:
  - a belt mask distribution check prevents long 1-tile-wide walls across the map,
  - continuity checks ensure belts follow corridors rather than speckle noise.

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Add/extend an integration suite entry that:
  - runs a canonical seed case with active events,
  - asserts that provenance and crust fingerprints change when events are active,
  - and asserts belt continuity/width metrics.

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-011`
  - `LOCAL-TBD-PR-M1-013`
  - `LOCAL-TBD-PR-M1-004`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts` (event→history signal surfaces; invariants should target these fields)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/contract.ts` (crust state variables that must measurably change when events fire)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (artifact ids for crust/provenance/history; invariants fingerprint these ids)
- `mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts` (existing event/history regression patterns)
- `mods/mod-swooper-maps/test/morphology/m11-mountains-physics-anchored.test.ts` (existing “noise-only cannot create belts” + correlation posture)

### References
- docs/projects/pipeline-realism/resources/decisions/d09r-validation-and-observability.md
- docs/projects/pipeline-realism/resources/decisions/d06r-event-mechanics-and-force-emission.md
- docs/projects/pipeline-realism/resources/decisions/d07r-morphology-consumption-contract.md

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

There are existing “anti-noise” invariants in Morphology tests that can serve as patterns:
- `mods/mod-swooper-maps/test/morphology/m11-mountains-physics-anchored.test.ts` (noise-only cannot create belts)

The missing piece for M1 is enforcing causality between:
- event corridors (`LOCAL-TBD-PR-M1-011`),
- provenance (`LOCAL-TBD-PR-M1-013`),
- and the belts produced from the new drivers (`LOCAL-TBD-PR-M1-015`).

### Proposed Change Surface

Invariants should consume:
- crust truth artifact fields (`artifact:foundation.crust`)
- provenance truth artifact (`artifact:foundation.tectonicProvenance`)
- morphology belt outputs (either explicit belt mask artifacts or derived from Morphology outputs)

### Pitfalls / Rakes

- “We validate belts but not causality”: belts look fine but are not tied to event/provenance.
- Checks that are too brittle to tuning (false positives) or too weak to catch regressions (false negatives).

### Wow Scenarios

- **Fake tectonics is impossible:** if someone “simplifies” event mechanics into force-only fields, CI fails because provenance/crust remain unchanged.

### Implementation Decisions

- Invariants are implemented in `mods/mod-swooper-maps/test/support/foundation-invariants.ts` and run via the determinism suite `M1_FOUNDATION_GATES`.
- Event/provenance causality gates use tile-space history/provenance:
  - `EVENT_SIGNAL_THRESHOLD = 20` (u8 event intensity threshold).
  - Require ≥ `60%` of event-corridor tiles to stamp `lastBoundaryEra` when corridors are active (≥ 12 tiles).
  - Require ≥ `75%` of `originEra` resets and ≥ `85%` of `lastBoundaryEra` stamps to align with same-era event signals.
- Belt continuity gate uses `deriveBeltDriversFromHistory` from history/provenance tiles:
  - `beltMask` must contain ≥ 20 cells when event corridors are active.
  - Mean belt component size ≥ 8, max component size ≥ 12.
  - Mean belt neighbor count ≥ 1.6 (guards against single-tile walls).
