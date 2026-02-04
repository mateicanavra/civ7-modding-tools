id: LOCAL-TBD-PR-M1-023
title: Delete legacy plate motion + legacy tectonics truth publication
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M1-017, LOCAL-TBD-PR-M1-018, LOCAL-TBD-PR-M1-012]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Remove RNG-driven “legacy plate motion” (velocity hacks) and any legacy authoritative tectonics semantics, so motion is derived from mantle forcing and published only via maximal-truth artifacts.

## Deliverables
- Delete RNG-driven plate velocities/rotation:
  - remove (or fully replace) the random velocity generation in the plate model so plate motion is derived from mantle forcing (`LOCAL-TBD-PR-M1-008`) rather than seeded kinematics.
- Remove legacy motion publication surfaces (or redefine them as derived-only):
  - remove `movementU`, `movementV`, `rotation` from `artifact:foundation.plates` (tile-space plates tensors), or explicitly re-source them from the new plate motion truth (no hidden RNG fallback).
  - ensure any remaining “motion-like” outputs are published via explicit maximal artifacts (e.g. planned `artifact:foundation.plateMotion`) and visualized via stable keys:
    - `foundation.plates.motion` (mesh + tile projection) as the semantically stable viz surface.
- Clean up all downstream consumers and tests that assume legacy motion:
  - segments/events/history must not depend on the deleted motion hack surfaces.
  - update/remove tests that explicitly assert behavior for `velocityX/velocityY/rotation` and tile `movementU/V` (replace with D03r/D09r coupling assertions).

## Acceptance Criteria
- No RNG-seeded plate motion remains:
  - `compute-plate-graph` no longer assigns `velocityX/velocityY/rotation` from random angles/speeds.
- No legacy motion publication remains as authoritative truth:
  - `artifact:foundation.plates` no longer publishes tile motion tensors that are unrelated to mantle forcing.
- Consumers are motion-source-correct:
  - any code that needs motion reads it from the mantle-derived plate motion artifact(s) (not from legacy plate graph fields).
- CI catches reintroduction:
  - add at least one contract guard that fails if legacy motion fields are reintroduced (schema-level guard or grep-based guard).

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Update/replace legacy-motion-dependent tests with mantle-derived coupling posture:
  - `mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts`
  - `mods/mod-swooper-maps/test/foundation/m11-polar-plates-policy.test.ts`
  - `mods/mod-swooper-maps/test/foundation/tile-projection-materials.test.ts`
- Add a contract guard so “legacy motion cannot return”:
  - recommended home: `mods/mod-swooper-maps/test/foundation/contract-guard.test.ts`.

## Dependencies / Notes
- Blocked by:
  - `LOCAL-TBD-PR-M1-017`
  - `LOCAL-TBD-PR-M1-018`
  - `LOCAL-TBD-PR-M1-012`
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts` (current RNG-driven `velocityX/velocityY/rotation` assignment; delete/replace)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts` (plate schema currently includes velocity/rotation fields)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/index.ts` (uses `velocityAtPoint(...)` based on plate velocity/rotation; must be rewired)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts` (projects per-plate velocity/rotation into tile `movementU/V/rotation`; must be removed or re-sourced)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (currently publishes tile motion in `artifact:foundation.plates`; planned new motion artifacts should live here)
- `mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts` (asserts rotation-aware shear; must be replaced with mantle-derived coupling invariants)

### References
- docs/projects/pipeline-realism/resources/spec/migration-slices/slice-02-cutover-foundation-maximal.md
- docs/projects/pipeline-realism/resources/decisions/d03r-plate-motion-derived-from-mantle.md
- docs/projects/pipeline-realism/resources/decisions/d09r-validation-and-observability.md

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

- Plate motion today is kinematic and RNG-seeded:
  - plate velocities/rotation are assigned in the plate graph generator (`PlateGraphAngle` / `PlateGraphSpeed` / `PlateGraphRotation` RNG paths).
  - those values are then projected into tile-space `movementU/V/rotation` fields.
  Anchors:
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts`
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts`

### Proposed Change Surface

- Replace the motion source:
  - mantle forcing (`LOCAL-TBD-PR-M1-007`) → plate motion (`LOCAL-TBD-PR-M1-008`) becomes the only SSOT.
- Remove/retire the old publication surfaces:
  - delete legacy motion fields from `artifact:foundation.plates` (or re-source them explicitly from the new motion truth).
- Update dependent ops/tests:
  - segment decomposition and any downstream consumers must be updated to read from the mantle-derived motion artifact.

### Pitfalls / Rakes

- Leaving a hidden “fallback” velocity path (e.g. zero motion or RNG motion when mantle-derived motion is missing).
- Removing motion fields without updating tests, allowing CI to go green by simply deleting coverage.
- Publishing new motion artifacts without clear viz keys (`dataTypeKey`) and without D09r coupling invariants.

### Wow Scenarios

- **No kinematics cheats:** any attempt to reintroduce random plate velocities fails determinism + coupling invariants immediately, and the only way forward is physics-derived motion.
