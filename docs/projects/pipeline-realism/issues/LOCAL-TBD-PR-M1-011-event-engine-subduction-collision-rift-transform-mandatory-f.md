id: LOCAL-TBD-PR-M1-011
title: Event engine: subduction/collision/rift/transform + mandatory force emission (D06r)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-010, LOCAL-TBD-PR-M1-006]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Implement event mechanics that update crust state and provenance (no “force-only” tectonics).

## Deliverables
- Implement event mechanics that update crust state and provenance (no “force-only” tectonics).
- Emit per-era force fields/corridors consumed by Morphology.

## Acceptance Criteria
- Deliverables are implemented and wired into the pipeline where applicable.
- Outputs follow the maximal SPEC contracts (no optional artifacts).
- Any transitional bridge has an explicit deletion target (or this issue performs the deletion).

## Testing / Verification
- Add/extend the canonical validation suite for this change (D09r posture).
- Verify determinism: same seed + config -> identical artifacts (stable fingerprints).

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-010`
  - `LOCAL-TBD-PR-M1-006`
- Related:
  - (none)

### References
- docs/projects/pipeline-realism/resources/decisions/d06r-event-mechanics-and-force-emission.md

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)
