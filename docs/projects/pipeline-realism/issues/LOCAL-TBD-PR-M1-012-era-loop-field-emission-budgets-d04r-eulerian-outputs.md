id: LOCAL-TBD-PR-M1-012
title: Era loop + field emission budgets (D04r Eulerian outputs)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-011]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Run a fixed-budget era loop (target/max eras per SPEC) emitting required era fields.

## Deliverables
- Run a fixed-budget era loop (target/max eras per SPEC) emitting required era fields.
- Publish `tectonicHistory` and rollups with deterministic iteration counts.

## Acceptance Criteria
- Deliverables are implemented and wired into the pipeline where applicable.
- Outputs follow the maximal SPEC contracts (no optional artifacts).
- Any transitional bridge has an explicit deletion target (or this issue performs the deletion).

## Testing / Verification
- Add/extend the canonical validation suite for this change (D09r posture).
- Verify determinism: same seed + config -> identical artifacts (stable fingerprints).

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-011`
- Related:
  - (none)

### References
- docs/projects/pipeline-realism/resources/decisions/d04r-history-dual-eulerian-plus-lagrangian.md

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)
