id: LOCAL-TBD-PR-M1-006
+title: Basaltic lid init + lithosphere strength (mantle-coupled)
+state: planned
+priority: 2
+estimate: 8
+project: pipeline-realism
+milestone: M1-foundation-maximal-cutover
+assignees: [codex]
+labels: [pipeline-realism]
+parent: null
+children: []
+blocked_by: [LOCAL-TBD-PR-M1-001, LOCAL-TBD-PR-M1-005]
+blocked: []
+related_to: []
+---
+
+<!-- SECTION SCOPE [SYNC] -->
+## TL;DR
+- Initialize t=0 as global basaltic/oceanic crust everywhere.
+
+## Deliverables
+- Initialize t=0 as global basaltic/oceanic crust everywhere.
- Produce mantle-coupled lithosphere strength fields required by partition/events.
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
  - `LOCAL-TBD-PR-M1-001`
  - `LOCAL-TBD-PR-M1-005`
- Related:
  - (none)
+
+### References
+- docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md
- docs/projects/pipeline-realism/resources/decisions/d05r-crust-state-canonical-variables.md
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