id: LOCAL-TBD-PR-M1-018
title: Physics invariants: mantle forcing + plate motion coupling residual bounds
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-007, LOCAL-TBD-PR-M1-008, LOCAL-TBD-PR-M1-004]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Add D09r physics invariants that prove mantle forcing is sane and plate motion is actually coupled to it (residual bounds), failing fast when coupling degenerates into arbitrary kinematics.

## Deliverables
- Implement invariant checks (using the shared harness from `LOCAL-TBD-PR-M1-004`) for:
  - mantle potential + forcing: finite/bounded, non-degenerate, wrap-correct
  - plate motion coupling: residual bounds / correlation metrics that catch “decoupled motion”
- Classify each invariant as:
  - **Hard gate:** fails the run/suite immediately (Tier-1), or
  - **Diagnostic-only:** emits metrics for tuning but does not gate initially.

## Acceptance Criteria
- The invariants run in the determinism suite (`LOCAL-TBD-PR-M1-017`) and fail loudly on violation.
- Mantle forcing invariants catch common invalid states:
  - NaNs/infs,
  - all-zero or constant fields (degenerate driver),
  - values outside declared bounds.
- Coupling invariants catch “fake coupling”:
  - if plate motion stops responding to forcing (or is overridden elsewhere), residual metrics fail (hard gate or diagnostic with explicit threshold).

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Add/extend suite-level tests that run the invariants against at least one canonical seed case:
  - best home: the determinism suite test file introduced in `LOCAL-TBD-PR-M1-017`.

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-007`
  - `LOCAL-TBD-PR-M1-008`
  - `LOCAL-TBD-PR-M1-004`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (add/own `artifact:foundation.mantlePotential`, `artifact:foundation.mantleForcing`, `artifact:foundation.plateMotion`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts` and `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts` (current Foundation end-to-end wiring; invariants must attach to the artifacts produced by the new ops)
- `mods/mod-swooper-maps/src/domain/foundation/ops/` (where mantle forcing + plate motion solver ops will live; invariants should reference their contract surfaces)
- `mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts` (existing Foundation “history” regression patterns; extend for coupling residuals)
- `mods/mod-swooper-maps/test/pipeline/` (home for suite-level invariants if they span multiple domains)

### References
- docs/projects/pipeline-realism/resources/decisions/d09r-validation-and-observability.md
- docs/projects/pipeline-realism/resources/decisions/d02r-mantle-forcing-potential-derived.md
- docs/projects/pipeline-realism/resources/decisions/d03r-plate-motion-derived-from-mantle.md

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Current State (Observed)

The repo has examples of “physics anchored” invariants in Morphology (pattern to emulate):
- `mods/mod-swooper-maps/test/morphology/m11-mountains-physics-anchored.test.ts`

For M1, these invariants must be:
- not viewer-dependent,
- not qualitative,
- and tied directly to artifacts produced by `LOCAL-TBD-PR-M1-007` and `LOCAL-TBD-PR-M1-008`.

### Proposed Change Surface

Implementation should live alongside the shared validation harness:
- `mods/mod-swooper-maps/test/support/` (recommended) or shared core if it becomes reusable.

Metrics/invariants should consume artifacts:
- `artifact:foundation.mantlePotential`
- `artifact:foundation.mantleForcing`
- `artifact:foundation.plateMotion`

### Pitfalls / Rakes

- Using visualization-only metrics (“looks smooth”) without quantifiable thresholds.
- Choosing thresholds that are not scale-aware (must be consistent with `docs/projects/pipeline-realism/resources/spec/units-and-scaling.md`).
- Making coupling checks too weak (plate motion can drift arbitrarily while still passing “finite/bounded”).

### Wow Scenarios

- **Coupling is non-negotiable:** a regression that accidentally reintroduces “random plate velocities” fails instantly with a coupling residual assertion, before it can contaminate segments/events/provenance.
