id: LOCAL-TBD-PR-M1-014
title: Morphology dual-read: accept history/provenance tiles + emit comparison diagnostics
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-002]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Update Morphology stage(s) to accept new tile drivers alongside legacy drivers initially.

## Deliverables
- Update Morphology stage(s) to accept new tile drivers alongside legacy drivers initially.
- Emit comparison diagnostics to validate coupling before full cutover.

## Acceptance Criteria
- Deliverables are implemented and wired into the pipeline where applicable.
- Outputs follow the maximal SPEC contracts (no optional artifacts).
- Any transitional bridge has an explicit deletion target (or this issue performs the deletion).

## Testing / Verification
- Add/extend the canonical validation suite for this change (D09r posture).
- Verify determinism: same seed + config -> identical artifacts (stable fingerprints).

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-002`
- Related:
  - (none)

### References
- docs/projects/pipeline-realism/resources/decisions/d07r-morphology-consumption-contract.md
- docs/projects/pipeline-realism/resources/research/stack-integration-morphology-hydrology-wind-current.md

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)
