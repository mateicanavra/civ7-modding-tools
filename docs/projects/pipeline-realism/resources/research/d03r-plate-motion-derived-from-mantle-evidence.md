# Evidence Memo: D03r Plate Motion Derived From Mantle Forcing

Date: 2026-02-03

## Summary

Foundation plate motion is now derived from mantle forcing and published via `artifact:foundation.plateMotion`, with no RNG-assigned plate velocities in the plate graph. D02r establishes a mandatory mesh-space mantle forcing velocity field (`artifact:foundation.mantleForcing.forcingU/V`). D03r follows directly: plate motion is defined as a deterministic, piecewise-rigid fit of mantle forcing onto the plate partition so downstream boundary regimes operate on mantle-derived relative motion.

## Current Contract and Code Reality (Why D03 Exists)

Contract baseline: `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`
- Plate motion is represented by `artifact:foundation.plateMotion` (truth, mesh space), projected to tiles as `foundation.plates.movementU/V` and `foundation.plates.rotation`.

Implementation anchor (mantle-derived kinematics):
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-motion/index.ts` derives `plateVelocityX/Y` and `plateOmega` from `mantleForcing`.

Downstream expectation (already a rigid-body model):
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/index.ts` computes velocities at boundary points as:
- translation `(velocityX, velocityY)` plus rigid rotation `omega * perp(r)` about a plate reference point

Implication: the downstream model already assumes "plate = rigid body"; D03 only defines where the rigid motion parameters come from.

## Upstream Forcing Posture (Why Mantle Must Own Kinematics)

Decision posture:
- `docs/projects/pipeline-realism/resources/decisions/d02r-mantle-forcing-potential-derived.md` defines mantle forcing potential as canonical truth and treats stress/velocity as deterministic derivatives.

SPEC anchor:
- `docs/projects/pipeline-realism/resources/spec/sections/mantle-forcing.md` defines `artifact:foundation.mantleForcing` with:
- `forcingU/V` (mesh-space velocity components)
- `forcingMag`, `stress`, `divergence`, `upwellingClass`

Implication: a mantle-derived velocity field exists as truth. Any RNG-assigned plate velocities break forcing provenance.

## Proposal Evidence (Plate Motion From Mantle Convection)

The existing proposal packet identifies the gap explicitly:
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/foundation-domain.md`
- "Velocity assignment: Random (non-physics)"
- "Real plate motions derive from mantle convection"

This evidence is consistent with the D-like posture: a global vector field (mantle-derived) drives plate kinematics and boundary classification.

## Fit Model Evidence (Rigid Approximation Is Sufficient and Auditable)

Rigid-body fitting is the minimal model that:
- matches the current boundary computation (`velocityAtPoint`)
- yields stable per-plate parameters `(vX, vY, omega, center)`
- provides a measurable residual error (misfit) that becomes a validation gate

Least-squares scalar angular velocity (2D) exists in closed form:
- Given plate center `c`, translation `v`, point offset `r = p - c`, forcing velocity `f`:
- minimize `sum_i w_i || (v + omega * perp(r_i)) - f_i ||^2`
- solution: `omega = (sum_i w_i * cross(r_i, (f_i - v))) / (sum_i w_i * |r_i|^2)`

The residual distribution (`||f - v_rigid||`) is a truth diagnostic: it distinguishes "mantle forcing coherent at plate scale" from "forcing is noisy" without relying on render outputs.

## Cost Envelope (Fixed, Deterministic)

Let `C = mesh cellCount`, `E = mesh edgeCount`, `P = plateCount`.

- Compute: `O(C + E + P)` using fixed passes over cells (accumulation, center, fit, residual).
- Memory: `O(P)` accumulators plus `O(C)` residual buckets.

This fits the current Foundation posture where the expensive work already lives in mesh-space ops and projections are downstream.

## Resulting Decision Signal

Plate kinematics are derived from `mantleForcing` and expressed as per-plate rigid motion with fit residual diagnostics as truth outputs. This removes RNG kinematics, restores forcing provenance, and yields pre-render invariants for realism regressions.
