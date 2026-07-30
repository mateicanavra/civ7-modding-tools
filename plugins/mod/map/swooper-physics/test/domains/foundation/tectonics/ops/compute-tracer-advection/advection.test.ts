import { describe, expect, it } from "bun:test";

import foundation from "../../../../../../src/domain/foundation/router.js";

const { computeTracerAdvection } = foundation.tectonics.ops;
const ERA_COUNT = 5;

function compassMesh() {
  return {
    cellCount: 5,
    wrapWidth: 100,
    siteX: new Float32Array([0, 0, 1, 0, -1]),
    siteY: new Float32Array([0, 1, 0, -1, 0]),
    neighborsOffsets: new Int32Array([0, 4, 4, 4, 4, 4]),
    neighbors: new Int32Array([1, 2, 3, 4]),
  } as const;
}

function eraWithBoundaryDrift(driftU = 0, driftV = 0) {
  return {
    boundaryDriftU: new Int8Array([driftU, 0, 0, 0, 0]),
    boundaryDriftV: new Int8Array([driftV, 0, 0, 0, 0]),
  };
}

function mantleForcing(forcingU = 0, forcingV = 0) {
  return {
    forcingU: new Float32Array([forcingU, 0, 0, 0, 0]),
    forcingV: new Float32Array([forcingV, 0, 0, 0, 0]),
  };
}

describe("foundation/compute-tracer-advection", () => {
  it("uses inverse boundary drift for source-cell lineage before mantle drift", () => {
    const traces = computeTracerAdvection.run(
      {
        mesh: compassMesh(),
        mantleForcing: mantleForcing(0, 1),
        eras: Array.from({ length: ERA_COUNT }, () => eraWithBoundaryDrift(127, 0)),
        eraCount: ERA_COUNT,
      },
      computeTracerAdvection.defaultConfig
    ).tracerIndex;

    expect(Array.from(traces[0] ?? [])).toEqual([0, 1, 2, 3, 4]);
    expect(traces[1]?.[0]).toBe(4);
  });

  it("falls back to inverse mantle drift when an era has no boundary drift", () => {
    const traces = computeTracerAdvection.run(
      {
        mesh: compassMesh(),
        mantleForcing: mantleForcing(0, 1),
        eras: Array.from({ length: ERA_COUNT }, () => eraWithBoundaryDrift()),
        eraCount: ERA_COUNT,
      },
      computeTracerAdvection.defaultConfig
    ).tracerIndex;

    expect(traces[1]?.[0]).toBe(3);
  });
});
