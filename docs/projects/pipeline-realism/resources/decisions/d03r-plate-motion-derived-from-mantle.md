# Decision Packet: Plate Motion Derived From Mantle Forcing (D03r)

## Question

Do we define plate motion as a mantle-derived, mesh-space kinematics field and treat `foundation.plateGraph` plate velocities/rotation as deterministic projections of that mantle forcing (not RNG-assigned)?

## Decision

Plate motion is a piecewise-rigid fit of the mesh-space mantle forcing velocity field (`artifact:foundation.mantleForcing.forcingU/V`) onto the plate partition (`artifact:foundation.plateGraph.cellToPlate`), producing per-plate translation + angular velocity that downstream tectonics uses as the sole kinematics input.

## Context (pointers only)

- Current contract baseline:
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (`foundation.plateGraph` provides per-plate `velocityX/Y` + `rotation`; `foundation.plates` projects `movementU/V` + `rotation` to tiles)
- Upstream forcing posture:
- `docs/projects/pipeline-realism/resources/decisions/d02r-mantle-forcing-potential-derived.md` (mantle forcing is canonical truth; stress/velocity are deterministic derivatives)
- `docs/projects/pipeline-realism/resources/spec/sections/mantle-forcing.md` (`artifact:foundation.mantleForcing` defines `forcingU/V` as truth)
- Current implementation anchors (today's non-physics kinematics):
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts` (RNG-assigned `velocityX/Y` and `rotation`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/index.ts` (`velocityAtPoint` treats plates as 2D rigid bodies: translation + rotation about a reference point)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts` (tile projection scales `velocityX/Y` to `movementU/V` and `rotation` to `rotation`)

## Plate Motion Representation (Canonical)

Plate motion is represented as a 2D rigid-body field per plate:
- Translation: `(vX, vY)` in mesh space
- Angular velocity: `omega` (scalar), producing local rigid velocity `v_rot = omega * perp(r)` where `r` is position relative to the plate's rotation center
- Rotation center: `(cX, cY)` in mesh space, defined as the plate's area-weighted centroid in wrapped mesh coordinates

This representation is canonical because it matches the current downstream usage model (`velocityAtPoint`) and is sufficient to compute boundary-relative kinematics deterministically.

## Artifacts (Truth and Contract Placement)

This decision defines a new truth artifact and a contract mapping:

- Truth artifact (mesh space):
- `artifact:foundation.plateKinematics` (new): per-plate `(cX, cY, vX, vY, omega)` plus fit residual diagnostics (per-plate and per-cell)
- Contract placement:
- `artifact:foundation.plateGraph.plates[].velocityX/Y` and `.rotation` are defined as deterministic copies of `(vX, vY, omega)` from `plateKinematics`
- `artifact:foundation.plateGraph.plates[].seedX/Y` remains the partition seed reference

## Non-Negotiable Invariants

- Determinism: identical seed + config yields identical plate kinematics; all tie-breakers are deterministic.
- Forcing provenance: plate kinematics are derived from `mantleForcing` only; no RNG-derived plate velocities or rotations remain in the target.
- Bounded compute: plate motion derivation is `O(cellCount + edgeCount)` and uses a fixed number of passes over mesh cells.
- Fit quality observability: per-plate fit error statistics exist as truth outputs and gate validation.

## Acceptance Criteria

- `docs/projects/pipeline-realism/resources/research/d03r-plate-motion-derived-from-mantle-evidence.md` exists and anchors the decision to current code + proposal evidence.
- `docs/projects/pipeline-realism/resources/spec/sections/plate-motion.md` defines truth schemas, pseudocode, invariants, fixed budgets, and a wow scenario.
- The SPEC mapping section in `plate-motion.md` explicitly maps the new truth artifact to current `FOUNDATION.md` contract fields (`plateGraph` and `plates`).
