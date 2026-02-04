id: LOCAL-TBD-PR-M1-003
title: Wire visualization dataTypeKeys + minimal layer taxonomy for causal spine
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-001, LOCAL-TBD-PR-M1-002]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Add/confirm `dataTypeKey` values for new artifacts and ensure they are stable and version-aware.

## Deliverables
- Add/confirm `dataTypeKey` values for new artifacts and ensure they are stable and version-aware.
- Provide debug + refined layer taxonomy per visualization spec.

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
  - `LOCAL-TBD-PR-M1-002`
- Related:
  - (none)

### References
- docs/projects/pipeline-realism/resources/spec/sections/visualization-and-tuning.md
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
