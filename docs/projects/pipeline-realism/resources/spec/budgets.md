# Budgets (Maximal, Fixed)

This document centralizes the fixed computation and memory budgets for the maximal Foundation evolutionary physics SPEC.

Normative references:
- `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md`
- `docs/projects/pipeline-realism/resources/spec/sections/mantle-forcing.md`
- `docs/projects/pipeline-realism/resources/spec/sections/plate-motion.md`
- `docs/projects/pipeline-realism/resources/spec/sections/history-and-provenance.md`
- `docs/projects/pipeline-realism/resources/spec/sections/events-and-forces.md`
- `docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md`

## Global Budgets

| Budget | Value | Where defined | Rationale |
| --- | --- | --- | --- |
| Strategy profiles | 1 (maximal only) | `foundation-evolutionary-physics-SPEC.md` | No “fast mode” escape hatch. |
| `eraCount` target | 5 | `history-and-provenance.md` | Enough temporal depth to separate early vs recent. |
| `eraCount` max | 8 | `history-and-provenance.md` | Hard max; bounded memory/time. |
| tracer advection steps / era | 6 | `history-and-provenance.md` | Fixed cost; preserves visible transport. |
| mantle potential smoothing steps | 1–2 | `mantle-forcing.md` | Enforce long wavelength without adding randomness. |
| plate-motion rigid fit passes | 1 | `plate-motion.md` | Plate-like kinematics without solver loops. |

## Mantle Forcing Budgets (D02r)

Mantle forcing must remain low-order (no microstructure-first).

| Budget | Default | Notes |
| --- | --- | --- |
| upwelling sources (`plumeCount`) | 6 | Fixed order-of-magnitude; tuned by config. |
| downwelling sources (`downwellingCount`) | 6 | Ditto. |
| kernel type | Gaussian RBF | Deterministic, mesh-distance kernel. |

## Plate Motion Budgets (D03r)

| Budget | Default | Notes |
| --- | --- | --- |
| additional velocity smoothing | 0–1 | Must be fixed-count; prefer 0 if mantle field is already coherent. |
| per-plate rigid kinematics fit | 1 pass | No iterative “solve until convergence.” |

## Events + Belts Budgets (D06r/D07r)

These budgets prevent “wall mountains” and prevent event explosion.

| Budget | Default | Notes |
| --- | --- | --- |
| events cardinality | O(segmentCount + plumeCount) | Never O(tileCount). |
| belt corridor minimum length | 6 tiles | Shorter corridors discarded. |
| belt stitching gap fill | ≤ 2 tiles | Deterministic shortest-path stitch. |
| belt diffusion sigma | age-driven | `morphology-contract.md` defines the rule; no free knobs. |

