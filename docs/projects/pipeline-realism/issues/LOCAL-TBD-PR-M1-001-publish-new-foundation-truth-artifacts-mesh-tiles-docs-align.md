id: LOCAL-TBD-PR-M1-001
title: Publish new Foundation truth artifacts (mesh + tiles) + docs alignment
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: []
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Register/emit the new maximal Foundation truth artifacts as first-class outputs.

## Deliverables
- Register/emit the new maximal Foundation truth artifacts as first-class outputs.
- Ensure artifact IDs, spaces (mesh/tile), and semantics match `artifact-catalog.md`.

## Acceptance Criteria
- Deliverables are implemented and wired into the pipeline where applicable.
- Outputs follow the maximal SPEC contracts (no optional artifacts).
- Any transitional bridge has an explicit deletion target (or this issue performs the deletion).

## Testing / Verification
- Add/extend the canonical validation suite for this change (D09r posture).
- Verify determinism: same seed + config -> identical artifacts (stable fingerprints).

## Dependencies / Notes
- Blocked by: none
- Related:
  - (none)

### References
- docs/projects/pipeline-realism/resources/spec/artifact-catalog.md
- docs/system/libs/mapgen/reference/ARTIFACTS.md

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)
