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
- Project mesh-space `tectonicHistory` and `tectonicProvenance` into tile-space drivers required by Morphology.

## Deliverables
- Project mesh-space `tectonicHistory` and `tectonicProvenance` into tile-space drivers required by Morphology.
- Define projection invariants and exact output artifact IDs.

## Acceptance Criteria
- Deliverables are implemented and wired into the pipeline where applicable.
- Outputs follow the maximal SPEC contracts (no optional artifacts).
- Any transitional bridge has an explicit deletion target (or this issue performs the deletion).

## Testing / Verification
- Add/extend the canonical validation suite for this change (D09r posture).
- Verify determinism: same seed + config -> identical artifacts (stable fingerprints).

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-001`
- Related:
  - (none)

### References
- docs/projects/pipeline-realism/resources/spec/sections/history-and-provenance.md
- docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)
