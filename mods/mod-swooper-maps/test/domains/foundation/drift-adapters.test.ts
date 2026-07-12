import { describe, expect, it } from "bun:test";

import foundationOpsPublic from "@mapgen/domain/foundation/ops";

const { computeTracerAdvection } = foundationOpsPublic.ops;

function compassMesh() {
  return {
    cellCount: 5,
    wrapWidth: 100,
    siteX: new Float32Array([0, 0, 1, 0, -1]),
    siteY: new Float32Array([0, 1, 0, -1, 0]),
    neighborsOffsets: new Int32Array([0, 4, 4, 4, 4, 4]),
    neighbors: new Int32Array([1, 2, 3, 4]),
    areas: new Float32Array([1, 1, 1, 1, 1]),
    bbox: { xl: -1, xr: 1, yt: -1, yb: 1 },
  } as const;
}

function eraWithBoundaryDrift(driftU = 0, driftV = 0) {
  const size = 5;
  return {
    boundaryType: new Uint8Array(size),
    boundaryPolarity: new Int8Array(size),
    boundaryIntensity: new Uint8Array(size),
    upliftPotential: new Uint8Array(size),
    collisionPotential: new Uint8Array(size),
    subductionPotential: new Uint8Array(size),
    riftPotential: new Uint8Array(size),
    shearStress: new Uint8Array(size),
    volcanism: new Uint8Array(size),
    fracture: new Uint8Array(size),
    riftOriginPlate: new Int16Array(size),
    volcanismOriginPlate: new Int16Array(size),
    volcanismEventType: new Uint8Array(size),
    boundaryDriftU: new Int8Array([driftU, 0, 0, 0, 0]),
    boundaryDriftV: new Int8Array([driftV, 0, 0, 0, 0]),
  };
}

function mantleForcing(forcingU = 0, forcingV = 0) {
  return {
    version: 1,
    cellCount: 5,
    stress: new Float32Array(5),
    forcingU: new Float32Array([forcingU, 0, 0, 0, 0]),
    forcingV: new Float32Array([forcingV, 0, 0, 0, 0]),
    forcingMag: new Float32Array(5),
    upwellingClass: new Int8Array(5),
    divergence: new Float32Array(5),
  } as const;
}

describe("foundation drift adapter migration", () => {
  it("tracer advection applies boundary drift with source-cell sign inversion and stable axes", () => {
    const traces = computeTracerAdvection.run(
      {
        mesh: compassMesh(),
        mantleForcing: mantleForcing(),
        eras: Array.from({ length: 5 }, () => eraWithBoundaryDrift(127, 0)),
        eraCount: 5,
      },
      computeTracerAdvection.defaultConfig
    ).tracerIndex;

    expect(traces[1]![0]).toBe(4);
  });

  it("tracer advection falls back to quantized mantle drift with the same source-cell sign", () => {
    const traces = computeTracerAdvection.run(
      {
        mesh: compassMesh(),
        mantleForcing: mantleForcing(0, 1),
        eras: Array.from({ length: 5 }, () => eraWithBoundaryDrift()),
        eraCount: 5,
      },
      computeTracerAdvection.defaultConfig
    ).tracerIndex;

    expect(traces[1]![0]).toBe(3);
  });
});
