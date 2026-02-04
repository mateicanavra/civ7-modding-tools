id: LOCAL-TBD-PR-M1-013
title: Provenance/tracer system + lineage scalars (D04r Lagrangian outputs)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-012, LOCAL-TBD-PR-M1-011]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Implement the mandatory provenance artifact (tracer history + lineage scalars) with bounded memory.

## Deliverables
- Implement the mandatory provenance artifact (tracer history + lineage scalars) with bounded memory.
- Ensure provenance is updated by events and projected into tiles for consumers.

## Acceptance Criteria
- Deliverables are implemented and wired into the pipeline where applicable.
- Outputs follow the maximal SPEC contracts (no optional artifacts).
- Any transitional bridge has an explicit deletion target (or this issue performs the deletion).

## Testing / Verification
- Add/extend the canonical validation suite for this change (D09r posture).
- Verify determinism: same seed + config -> identical artifacts (stable fingerprints).

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-012`
  - `LOCAL-TBD-PR-M1-011`
- Related:
  - (none)

### References
- docs/projects/pipeline-realism/resources/spec/sections/history-and-provenance.md

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)
