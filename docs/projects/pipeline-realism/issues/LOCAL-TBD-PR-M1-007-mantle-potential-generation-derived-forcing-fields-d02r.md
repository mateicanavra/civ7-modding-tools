id: LOCAL-TBD-PR-M1-007
title: Mantle potential generation + derived forcing fields (D02r)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-006]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Generate `artifact:foundation.mantlePotential` and derive `artifact:foundation.mantleForcing` deterministically with bounded budgets (D02r), as the first-class driver of plate motion and events.

## Deliverables
- Implement mantle potential generation (truth):
  - new op(s) in the Foundation domain that produce `artifact:foundation.mantlePotential` as mesh-space truth.
  - generation must be deterministic (seed + inputs only) and bounded (fixed iteration budgets).
- Implement derived mantle forcing fields (truth):
  - produce `artifact:foundation.mantleForcing` from potential using the normative derivations in D02r.
  - forcing outputs must be sufficient for plate motion derivation (D03r) without introducing “hidden kinematics.”
- Wire minimal visualization emissions for author inspection:
  - `dataTypeKey: foundation.mantle.potential` (scalar)
  - `dataTypeKey: foundation.mantle.forcing` (vector + magnitude variants)

## Acceptance Criteria
- `artifact:foundation.mantlePotential` and `artifact:foundation.mantleForcing` are published as mesh-space truth artifacts.
- Determinism:
  - running the op twice with identical inputs produces byte-identical TypedArray payloads.
- Boundedness:
  - the algorithm uses fixed budgets (explicit constants), and does not run unbounded relaxation/solver loops.
- Wrap correctness:
  - X-wrap semantics are correct for any neighbor sampling / gradient estimation (no seams at wrap boundaries).

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Add a Foundation unit test suite for mantle forcing:
  - determinism: same inputs => identical output buffers
  - basic shape: non-uniform potential over the mesh (not constant / not pure noise)
  - wrap seam guard: sampling across wrap edges does not introduce discontinuities
  Suggested location: `mods/mod-swooper-maps/test/foundation/` (new file).

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-006`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/src/domain/foundation/ops/` (new mantle ops should live alongside existing mesh-first ops)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-mantle-potential/` (new; mesh-space `artifact:foundation.mantlePotential`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-mantle-forcing/` (new; derived `artifact:foundation.mantleForcing`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts` (wire mantle steps into the canonical Foundation stage ordering)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (declare the mantle artifact ids + schemas)

### References
- docs/projects/pipeline-realism/resources/decisions/d02r-mantle-forcing-potential-derived.md
- docs/projects/pipeline-realism/resources/spec/sections/mantle-forcing.md
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

There is no mantle forcing truth artifact in the current Foundation implementation; plate kinematics and tectonics are derived without a mantle driver.

Current Foundation domain ops live under:
- `mods/mod-swooper-maps/src/domain/foundation/ops/*`

### Proposed Change Surface

Expected new op placements (project-local; keep naming consistent with existing ops):
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-mantle-potential/*`
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-mantle-forcing/*`

Expected step wiring (eventually):
- Foundation stage step list: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`

### Pitfalls / Rakes

- “Filtered noise dressed up as mantle”: if the potential is effectively random fields with smoothing, plate motion will be arbitrary and invariants won’t be meaningful.
- “Implicit kinematics”: if the forcing derivation bakes in plate-like motion assumptions, D03r becomes fake coupling.
- “Unbounded relaxation”: even a “few more iterations for stability” turns into nondeterministic performance and hidden budgets.

### Wow Scenarios

- **Hotspot-driven plate drift:** mantle potential basins and peaks produce coherent forcing corridors that downstream plate motion can align with, and Studio can visualize as a causal driver (not a post-hoc diagnostic).
