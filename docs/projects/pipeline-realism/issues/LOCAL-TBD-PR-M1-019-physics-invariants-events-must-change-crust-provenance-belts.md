id: LOCAL-TBD-PR-M1-019
+title: Physics invariants: events must change crust/provenance + belts must be wide/continuous
+state: planned
+priority: 2
+estimate: 8
+project: pipeline-realism
+milestone: M1-foundation-maximal-cutover
+assignees: [codex]
+labels: [pipeline-realism]
+parent: null
+children: []
+blocked_by: [LOCAL-TBD-PR-M1-011, LOCAL-TBD-PR-M1-013, LOCAL-TBD-PR-M1-004]
+blocked: []
+related_to: []
+---
+
+<!-- SECTION SCOPE [SYNC] -->
+## TL;DR
+- Add invariants that prevent “fake tectonics”: material/provenance must change when events occur.
+
+## Deliverables
+- Add invariants that prevent “fake tectonics”: material/provenance must change when events occur.
- Ensure belts are not lines; enforce corridor width/continuity distributions.
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
  - `LOCAL-TBD-PR-M1-011`
  - `LOCAL-TBD-PR-M1-013`
  - `LOCAL-TBD-PR-M1-004`
- Related:
  - (none)
+
+### References
+- docs/projects/pipeline-realism/resources/decisions/d09r-validation-and-observability.md
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