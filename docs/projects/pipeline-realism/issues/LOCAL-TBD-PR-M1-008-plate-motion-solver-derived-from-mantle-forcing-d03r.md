id: LOCAL-TBD-PR-M1-008
title: Plate motion solver derived from mantle forcing (D03r)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-007]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Derive `artifact:foundation.plateMotion` as a strict, bounded function of `artifact:foundation.mantleForcing` (D03r), preventing “hidden kinematics” from entering via authoring or ad-hoc heuristics.

## Deliverables
- Implement plate motion derivation from mantle forcing (D03r):
  - new op(s) that consume `artifact:foundation.mantleForcing` and output `artifact:foundation.plateMotion` (mesh truth).
  - explicit, fixed solver budgets (iteration counts, smoothing steps); no adaptive loops.
- Define/emit plate motion in the form required by downstream consumers:
  - boundary/segment mechanics must be able to use motion to classify regimes (convergence/divergence/transform),
  - and plate partition logic must not silently overwrite motion outputs.
- Emit minimal viz layers for inspection (wired via `LOCAL-TBD-PR-M1-003` taxonomy):
  - `dataTypeKey: foundation.plateMotion.motion` (vector field, `world.xy` space).

## Acceptance Criteria
- `artifact:foundation.plateMotion` is published as a mesh-space truth artifact and is consumed (directly or indirectly) by:
  - segment regime classification (`LOCAL-TBD-PR-M1-010`), and
  - event mechanics (`LOCAL-TBD-PR-M1-011`).
- Determinism:
  - identical inputs produce identical motion buffers (byte-identical typed arrays).
- Coupling sanity:
  - changing mantle forcing changes plate motion in a measurable way (non-trivial response),
  - and “authoring” cannot directly set motion outputs (enforced by `LOCAL-TBD-PR-M1-005` schema posture).

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Add a plate motion unit test suite:
  - determinism: same inputs => identical output
  - sensitivity: two distinct mantle forcing inputs produce different motion fingerprints
  - bounds: motion magnitudes remain within declared numeric bounds (no NaNs/infs)
  Suggested location: `mods/mod-swooper-maps/test/foundation/` (new file).

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-007`
- Related:
  - (none)

### References
- docs/projects/pipeline-realism/resources/decisions/d03r-plate-motion-derived-from-mantle.md
- docs/projects/pipeline-realism/resources/spec/sections/plate-motion.md
- docs/projects/pipeline-realism/resources/spec/budgets.md

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

Today’s Foundation plate kinematics live inside the plate graph and are not derived from a mantle forcing truth artifact:
- plate graph op: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts`
- segments use plate velocities/rotations: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/index.ts`

### Proposed Change Surface

Expected new op placements:
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-motion/*`

Expected consumers to update (to make the motion authoritative):
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/*`
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/*` (if history drift uses motion)

### Pitfalls / Rakes

- “Plate motion as a rebranded random field”: if motion is not causally derived from forcing, the whole causal spine becomes non-explainable.
- “Dual kinematics”: plateGraph continues to assign velocities that override the derived motion artifact, leaving two competing sources of truth.
- “Budget creep”: tuning iterations becomes open-ended, making determinism/perf un-auditable.

### Wow Scenarios

- **Mantle-to-plates coupling:** a mantle forcing corridor produces coherent plate motion aligned to the corridor, and later physics invariants can validate coupling residuals rather than “looks right in viz.”
