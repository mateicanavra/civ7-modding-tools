id: LOCAL-TBD-PR-M1-025
+title: Delete dual-engine shadow compute paths after suite is green
+state: planned
+priority: 2
+estimate: 8
+project: pipeline-realism
+milestone: M1-foundation-maximal-cutover
+assignees: [codex]
+labels: [pipeline-realism]
+parent: null
+children: []
+blocked_by: [LOCAL-TBD-PR-M1-017, LOCAL-TBD-PR-M1-020]
+blocked: []
+related_to: []
+---
+
+<!-- SECTION SCOPE [SYNC] -->
+## TL;DR
+- Remove any metrics-only shadow compute paths used during transition once gates pass.
+
+## Deliverables
+- Remove any metrics-only shadow compute paths used during transition once gates pass.
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
  - `LOCAL-TBD-PR-M1-017`
  - `LOCAL-TBD-PR-M1-020`
- Related:
  - (none)
+
+### References
+- docs/projects/pipeline-realism/resources/spec/migration-slices/slice-01-prepare-new-artifacts-and-viz.md
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