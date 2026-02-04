id: LOCAL-TBD-PR-M1-010
+title: Boundary segments + regime classification (source of events)
+state: planned
+priority: 2
+estimate: 8
+project: pipeline-realism
+milestone: M1-foundation-maximal-cutover
+assignees: [codex]
+labels: [pipeline-realism]
+parent: null
+children: []
+blocked_by: [LOCAL-TBD-PR-M1-008, LOCAL-TBD-PR-M1-009]
+blocked: []
+related_to: []
+---
+
+<!-- SECTION SCOPE [SYNC] -->
+## TL;DR
+- Extract boundary segments and classify regimes (subduction/collision/rift/transform candidates).
+
+## Deliverables
+- Extract boundary segments and classify regimes (subduction/collision/rift/transform candidates).
- Ensure output supports belt continuity invariants and event corridors.
+
+## Acceptance Criteria
+- Deliverables are implemented and wired into the pipeline where applicable.
+- Outputs follow the maximal SPEC contracts (no optional artifacts).
+- Any transitional bridge has an explicit deletion target (or this issue performs the deletion).
+
+## Testing / Verification
+- Add/extend the canonical validation suite for this change (D09r posture).
+- Verify determinism: same seed + config -> identical artifacts (stable fingerprints).
+
+## Dependencies / Notes
+- Blocked by:
  - `LOCAL-TBD-PR-M1-008`
  - `LOCAL-TBD-PR-M1-009`
- Related:
  - (none)
+
+### References
+- docs/projects/pipeline-realism/resources/spec/sections/events-and-forces.md
+
+---
+
+<!-- SECTION IMPLEMENTATION [NOSYNC] -->
+## Implementation Details (Local Only)
+
+### Quick Navigation
+- [TL;DR](#tldr)
+- [Deliverables](#deliverables)
+- [Acceptance Criteria](#acceptance-criteria)
+- [Testing / Verification](#testing--verification)
+- [Dependencies / Notes](#dependencies--notes)
+