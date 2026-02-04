id: LOCAL-TBD-PR-M1-009
+title: Crust priors + resistance partition -> plateGraph (D01)
+state: planned
+priority: 2
+estimate: 8
+project: pipeline-realism
+milestone: M1-foundation-maximal-cutover
+assignees: [codex]
+labels: [pipeline-realism]
+parent: null
+children: []
+blocked_by: [LOCAL-TBD-PR-M1-006, LOCAL-TBD-PR-M1-005]
+blocked: []
+related_to: []
+---
+
+<!-- SECTION SCOPE [SYNC] -->
+## TL;DR
+- Compute crust-first resistance priors coupled to mantle/lithosphere state.
+
+## Deliverables
+- Compute crust-first resistance priors coupled to mantle/lithosphere state.
- Partition into plates and emit `artifact:foundation.plateGraph` (and any required auxiliary truth).
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
  - `LOCAL-TBD-PR-M1-006`
  - `LOCAL-TBD-PR-M1-005`
- Related:
  - (none)
+
+### References
+- docs/projects/pipeline-realism/resources/decisions/d01-ordering-crust-vs-plates.md
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