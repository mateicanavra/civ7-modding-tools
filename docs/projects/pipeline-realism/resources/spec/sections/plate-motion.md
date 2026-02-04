# Plate Motion (Mantle-Derived Rigid Kinematics)

## Purpose

Define the maximal Foundation plate-motion model: plate kinematics are deterministic derivatives of mesh-space mantle forcing, expressed as per-plate rigid-body motion with auditable fit residuals and fixed compute cost.

## Contract (Required Inputs)

Required Foundation truth artifacts (mesh space)
- `artifact:foundation.mesh` (cell positions, neighbors, wrap)
- `artifact:foundation.plateGraph` (plate partition via `cellToPlate`, plate ids)
- `artifact:foundation.mantleForcing` (forcing velocity `forcingU/V`, magnitude, divergence)

## Truth Artifacts and Schemas

### `artifact:foundation.plateKinematics` (truth; mesh space)

Canonical plate-motion truth artifact derived from mantle forcing.

Schema (mesh space)
- `cellCount` (u32)
- `plateCount` (u16)
- `plateCenterX` (Float32Array, length = `plateCount`) plate rotation center X in unwrapped mesh hex space
- `plateCenterY` (Float32Array, length = `plateCount`) plate rotation center Y
- `plateVelocityX` (Float32Array, length = `plateCount`) plate translation X component
- `plateVelocityY` (Float32Array, length = `plateCount`) plate translation Y component
- `plateOmega` (Float32Array, length = `plateCount`) plate angular velocity scalar
- `plateFitRms` (Float32Array, length = `plateCount`) RMS fit error of rigid approximation
- `plateFitP90` (Float32Array, length = `plateCount`) 90th percentile fit error
- `plateQuality` (Uint8Array, length = `plateCount`) `0..255` scalar derived from fit stats
- `cellFitError` (Uint8Array, length = `cellCount`) normalized residual `0..255`

### `artifact:foundation.plateGraph` mapping (truth; mesh space)

The plate-graph contract remains the truth home for partition. Plate kinematics are copied from `plateKinematics` into the existing per-plate kinematics fields:
- `plates[].velocityX/Y` = `plateVelocityX/Y[plateId]`
- `plates[].rotation` = `plateOmega[plateId]`

Rotation center uses `plateKinematics.plateCenterX/Y` as the canonical reference point. Current code uses `plateGraph.plates[].seedX/Y` as the rotation center; target posture uses `plateCenterX/Y` for rotation-center semantics.

## Deterministic Algorithm (Rigid Fit From Mantle Forcing)

### Definitions

- Mesh cell position: `p_i = (x_i, y_i)` in mesh hex space.
- Wrap span: `W = mesh.wrapWidth`.
- Plate id per cell: `pid_i = plateGraph.cellToPlate[i]`.
- Mantle forcing velocity per cell: `f_i = (u_i, v_i)` from `mantleForcing.forcingU/V`.
- Per-cell weight: `w_i` (deterministic, boundary-robust).
- Per-plate rigid motion at point `p`: `v_rigid(p) = V + omega * perp(p - C)` where `perp(x, y) = (-y, x)`.

### Weights (Boundary-Robust, No Extra Artifacts)

Define a deterministic down-weighting for boundary-adjacent cells using only the neighbor graph and the plate partition:
- `boundaryDegree_i = count(neighbor j of i where pid_j != pid_i)`
- `w_i = area_i / (1 + boundaryDegree_i)` where `area_i = mesh.areas[i]`

### Unwrapped Plate Centers (Cylindrical Wrap)

Compute each plate's rotation center `C = (cX, cY)` as the area-weighted centroid in wrapped coordinates:

1. Choose a per-plate reference X coordinate `x_ref` as the plate's `seedX` from `plateGraph.plates[pid].seedX`.
2. For every cell `i` in the plate, unwrap X into the reference frame:
- `x_u = x_ref + wrapDeltaPeriodic(x_i - x_ref, W)`
3. Accumulate:
- `sumW = sum(w_i)`
- `sumX = sum(w_i * x_u)`
- `sumY = sum(w_i * y_i)`
4. Set:
- `cX = sumX / sumW`
- `cY = sumY / sumW`

### Translation Velocity (Plate-Scale Mean Flow)

Compute per-plate translation `V = (vX, vY)` as the weighted mean mantle forcing:
- `vX = (sum(w_i * u_i)) / sumW`
- `vY = (sum(w_i * v_i)) / sumW`

### Angular Velocity (Closed-Form Least Squares)

Compute per-plate angular velocity `omega` as the least-squares best fit of the residual flow after removing translation:

- For each cell:
- `r = (x_u - cX, y_i - cY)`
- `d = f_i - V`
- `num += w_i * cross(r, d)` where `cross((rx, ry), (dx, dy)) = rx * dy - ry * dx`
- `den += w_i * (rx*rx + ry*ry)`
- `omega = num / max(den, eps)`

Clamp `omega` to a profile-fixed bound to prevent plate-scale angular runaway:
- `omega = clamp(omega, -omegaMax, +omegaMax)`
- `omegaMax` is a constant derived from mantle forcing bounds: `omegaMax = omegaFactor * meanForcingSpeed / max(plateRadiusMin, plateRadiusMean)`

### Residual Diagnostics (Truth Output)

Compute per-cell residual magnitude:
- `e_i = || f_i - (V + omega * perp(r_i)) ||`

Compute per-plate statistics:
- `plateFitRms = sqrt(sum(w_i * e_i^2) / sumW)`
- `plateFitP90` from a deterministic bucketed histogram of `e_i`
- `plateQuality` derived as:
- `q = clamp01(1 - plateFitP90 / max(p90Norm, eps))`
- `plateQuality = round(255 * q)`

Compute `cellFitError` as `clampByte(255 * e_i / max(residualNorm, eps))`.

### Pseudocode

```ts
type PlateAcc = {
  sumW: number;
  sumX: number;
  sumY: number;
  sumU: number;
  sumV: number;
  numOmega: number;
  denOmega: number;
};

function derivePlateKinematics(params: {
  mesh: { cellCount: number; wrapWidth: number; siteX: Float32Array; siteY: Float32Array; areas: Float32Array; neighborsOffsets: Int32Array; neighbors: Int32Array };
  plateGraph: { cellToPlate: Int16Array; plates: { seedX: number; seedY: number }[] };
  mantleForcing: { forcingU: Float32Array; forcingV: Float32Array };
}): {
  plateCenterX: Float32Array;
  plateCenterY: Float32Array;
  plateVelocityX: Float32Array;
  plateVelocityY: Float32Array;
  plateOmega: Float32Array;
  cellFitError: Uint8Array;
} {
  const C = params.mesh.cellCount | 0;
  const P = params.plateGraph.plates.length | 0;
  const acc: PlateAcc[] = Array.from({ length: P }, () => ({
    sumW: 0,
    sumX: 0,
    sumY: 0,
    sumU: 0,
    sumV: 0,
    numOmega: 0,
    denOmega: 0,
  }));

  // Pass 1: boundaryDegree-derived weights + unwrapped centroid + mean flow
  for (let i = 0; i < C; i++) {
    const pid = params.plateGraph.cellToPlate[i] | 0;
    if (pid < 0 || pid >= P) continue;

    let boundaryDegree = 0;
    const start = params.mesh.neighborsOffsets[i] | 0;
    const end = params.mesh.neighborsOffsets[i + 1] | 0;
    for (let k = start; k < end; k++) {
      const j = params.mesh.neighbors[k] | 0;
      if ((params.plateGraph.cellToPlate[j] | 0) !== pid) boundaryDegree++;
    }

    const w = (params.mesh.areas[i] ?? 1) / (1 + boundaryDegree);
    const xRef = params.plateGraph.plates[pid]!.seedX ?? 0;
    const x = xRef + wrapDeltaPeriodic((params.mesh.siteX[i] ?? 0) - xRef, params.mesh.wrapWidth);
    const y = params.mesh.siteY[i] ?? 0;

    acc[pid]!.sumW += w;
    acc[pid]!.sumX += w * x;
    acc[pid]!.sumY += w * y;
    acc[pid]!.sumU += w * (params.mantleForcing.forcingU[i] ?? 0);
    acc[pid]!.sumV += w * (params.mantleForcing.forcingV[i] ?? 0);
  }

  const plateCenterX = new Float32Array(P);
  const plateCenterY = new Float32Array(P);
  const plateVelocityX = new Float32Array(P);
  const plateVelocityY = new Float32Array(P);
  for (let p = 0; p < P; p++) {
    const a = acc[p]!;
    const invW = 1 / Math.max(1e-9, a.sumW);
    plateCenterX[p] = a.sumX * invW;
    plateCenterY[p] = a.sumY * invW;
    plateVelocityX[p] = a.sumU * invW;
    plateVelocityY[p] = a.sumV * invW;
  }

  // Pass 2: omega fit (closed form)
  for (let i = 0; i < C; i++) {
    const pid = params.plateGraph.cellToPlate[i] | 0;
    if (pid < 0 || pid >= P) continue;

    let boundaryDegree = 0;
    const start = params.mesh.neighborsOffsets[i] | 0;
    const end = params.mesh.neighborsOffsets[i + 1] | 0;
    for (let k = start; k < end; k++) {
      const j = params.mesh.neighbors[k] | 0;
      if ((params.plateGraph.cellToPlate[j] | 0) !== pid) boundaryDegree++;
    }

    const w = (params.mesh.areas[i] ?? 1) / (1 + boundaryDegree);
    const xRef = params.plateGraph.plates[pid]!.seedX ?? 0;
    const x = xRef + wrapDeltaPeriodic((params.mesh.siteX[i] ?? 0) - xRef, params.mesh.wrapWidth);
    const y = params.mesh.siteY[i] ?? 0;

    const cx = plateCenterX[pid] ?? 0;
    const cy = plateCenterY[pid] ?? 0;
    const rx = x - cx;
    const ry = y - cy;

    const du = (params.mantleForcing.forcingU[i] ?? 0) - (plateVelocityX[pid] ?? 0);
    const dv = (params.mantleForcing.forcingV[i] ?? 0) - (plateVelocityY[pid] ?? 0);

    acc[pid]!.numOmega += w * (rx * dv - ry * du);
    acc[pid]!.denOmega += w * (rx * rx + ry * ry);
  }

  const plateOmega = new Float32Array(P);
  for (let p = 0; p < P; p++) {
    const a = acc[p]!;
    plateOmega[p] = a.numOmega / Math.max(1e-9, a.denOmega);
  }

  // Pass 3: residual diagnostics
  const cellFitError = new Uint8Array(C);
  for (let i = 0; i < C; i++) {
    const pid = params.plateGraph.cellToPlate[i] | 0;
    if (pid < 0 || pid >= P) continue;

    const xRef = params.plateGraph.plates[pid]!.seedX ?? 0;
    const x = xRef + wrapDeltaPeriodic((params.mesh.siteX[i] ?? 0) - xRef, params.mesh.wrapWidth);
    const y = params.mesh.siteY[i] ?? 0;

    const cx = plateCenterX[pid] ?? 0;
    const cy = plateCenterY[pid] ?? 0;
    const rx = x - cx;
    const ry = y - cy;

    const vx = (plateVelocityX[pid] ?? 0) + -(ry) * (plateOmega[pid] ?? 0);
    const vy = (plateVelocityY[pid] ?? 0) + +(rx) * (plateOmega[pid] ?? 0);
    const du = (params.mantleForcing.forcingU[i] ?? 0) - vx;
    const dv = (params.mantleForcing.forcingV[i] ?? 0) - vy;

    const err = Math.sqrt(du * du + dv * dv);
    cellFitError[i] = clampByte((255 * err) / residualNorm);
  }

  return { plateCenterX, plateCenterY, plateVelocityX, plateVelocityY, plateOmega, cellFitError };
}
```

## Required Invariants (Pre-Render Validation)

### Determinism

- `plateKinematics` is bitwise stable for identical seed + config.
- Histogram and percentile computations use deterministic bucket edges and tie-breakers.

### Kinematics Energy Bounds

Let `speed_p = ||(vX, vY)||` and `meanSpeed = areaWeightedMean(speed_p)`.

- `meanSpeed` is within `[mantle.meanVelocityMin, mantle.meanVelocityMax]` defined by the mantle forcing profile.
- `max(speed_p)` is within a profile-fixed bound `maxPlateSpeed`.
- `max(|omega_p|)` is within `omegaMax`.

### Fit Quality

- Major plates satisfy: `plateFitP90 <= fitP90MaxMajor`.
- Minor plates satisfy: `plateFitP90 <= fitP90MaxMinor`.
- Global fit satisfies: `areaWeightedMean(plateFitRms) <= fitRmsMax`.

### Forcing Provenance

- The area-weighted mean of plate rigid velocities matches the area-weighted mean of mantle forcing velocities within `meanDeltaMax`:
- `|| mean(v_rigid) - mean(f) || <= meanDeltaMax`

## Fixed Budgets

The plate-motion derivation budget is fixed and gates implementation:

- Mesh passes: exactly 3 full-cell passes (accumulate, omega fit, residual diagnostics)
- Neighbor traversals: exactly 2 neighbor traversals per cell (for boundaryDegree in passes 1 and 2)
- Complexity: `O(cellCount + edgeCount + plateCount)`
- Extra memory:
- `O(plateCount)` accumulators (no per-edge buffers)
- `O(cellCount)` residual byte buffer (`cellFitError`)

## Wow Scenario (Required Demonstration Case)

Scenario: Ridge-and-Ring

Inputs
- Mantle forcing contains one dominant upwelling source band (high positive potential ridge) and an opposing downwelling ring (negative potential annulus), producing a large-scale divergence belt and surrounding convergence belt.

Expected observable outcomes (non-render, validated from truth artifacts)
- Plates that intersect the divergence belt have plate velocities that point away from the ridge (dot product with mantle forcing mean over the belt is positive).
- Tectonic segments along the ridge belt classify predominantly as divergent, and segments along the ring classify predominantly as convergent.
- Plate fit quality remains within bounds: `areaWeightedMean(plateFitRms) <= fitRmsMax`.

This scenario demonstrates that mantle forcing produces coherent, explainable plate-scale motion and boundary regimes without RNG plate kinematics.

## Current Mapping (SPEC to Current Contract/Code)

Contract reference: `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`

- Plate kinematics fields exist today:
- `foundation.plateGraph.plates[].velocityX/Y` and `.rotation`
- projected to tile space as `foundation.plates.movementU/V` and `foundation.plates.rotation`
- Current kinematics source is RNG (to be replaced):
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts`
- Current downstream rigid-body usage already matches the representation:
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/index.ts` (`velocityAtPoint`)

Target wiring posture
- `foundation/compute-plate-graph` owns partition (`cellToPlate`) and emits seed references.
- A new mesh-space op derives `artifact:foundation.plateKinematics` from `(mesh, plateGraph, mantleForcing)` and copies `(vX, vY, omega)` into `plateGraph.plates[]` for compatibility with existing consumers and projections.
