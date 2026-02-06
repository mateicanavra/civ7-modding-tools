import { describe, expect, it } from "bun:test";

import { BOUNDARY_TYPE } from "../../src/domain/foundation/constants.js";
import computeTectonicHistory from "../../src/domain/foundation/ops/compute-tectonic-history/index.js";

function makeTwoCellMesh(): any {
  return {
    cellCount: 2,
    wrapWidth: 10,
    siteX: new Float32Array([0, 1]),
    siteY: new Float32Array([0, 0]),
    neighborsOffsets: new Int32Array([0, 1, 2]),
    neighbors: new Int32Array([1, 0]),
    areas: new Float32Array([1, 1]),
    bbox: { xl: 0, xr: 1, yt: 0, yb: 1 },
  } as const;
}

function makeCrust(cellCount: number) {
  return {
    maturity: new Float32Array(cellCount),
    thickness: new Float32Array(cellCount).fill(0.25),
    thermalAge: new Uint8Array(cellCount),
    damage: new Uint8Array(cellCount),
    type: new Uint8Array(cellCount),
    age: new Uint8Array(cellCount),
    buoyancy: new Float32Array(cellCount).fill(0.2),
    baseElevation: new Float32Array(cellCount).fill(0.2),
    strength: new Float32Array(cellCount).fill(0.4),
  } as const;
}

function makePlateGraph() {
  return {
    cellToPlate: new Int16Array([0, 1]),
    plates: [
      { id: 0, role: "tectonic", kind: "major", seedX: 0, seedY: 0, velocityX: 0, velocityY: 0, rotation: 0 },
      { id: 1, role: "tectonic", kind: "major", seedX: 1, seedY: 0, velocityX: -1, velocityY: 0, rotation: 0 },
    ],
  } as const;
}

function makeMantleForcing(cellCount: number) {
  return {
    version: 1,
    cellCount,
    stress: new Float32Array(cellCount),
    forcingU: new Float32Array(cellCount),
    forcingV: new Float32Array(cellCount),
    forcingMag: new Float32Array(cellCount),
    upwellingClass: new Int8Array(cellCount),
    divergence: new Float32Array(cellCount),
  } as const;
}

function makeSegments(params: {
  regime: number;
  polarity: number;
  compression?: number;
  extension?: number;
  shear?: number;
  volcanism?: number;
  fracture?: number;
}) {
  return {
    segmentCount: 1,
    aCell: new Int32Array([0]),
    bCell: new Int32Array([1]),
    plateA: new Int16Array([0]),
    plateB: new Int16Array([1]),
    regime: new Uint8Array([params.regime]),
    polarity: new Int8Array([params.polarity]),
    compression: new Uint8Array([params.compression ?? 0]),
    extension: new Uint8Array([params.extension ?? 0]),
    shear: new Uint8Array([params.shear ?? 0]),
    volcanism: new Uint8Array([params.volcanism ?? 0]),
    fracture: new Uint8Array([params.fracture ?? 0]),
    driftU: new Int8Array([0]),
    driftV: new Int8Array([0]),
  } as const;
}

describe("m11 tectonic events", () => {
  it("subduction events deterministically update boundary provenance", () => {
    const mesh = makeTwoCellMesh();
    const crust = makeCrust(mesh.cellCount);
    const mantleForcing = makeMantleForcing(mesh.cellCount);
    const plateGraph = makePlateGraph();
    const segments = makeSegments({
      regime: BOUNDARY_TYPE.convergent,
      polarity: -1,
      compression: 210,
      volcanism: 180,
      fracture: 80,
    });

    const a = computeTectonicHistory.run(
      { mesh, crust, mantleForcing, plateGraph, segments },
      computeTectonicHistory.defaultConfig
    );
    const b = computeTectonicHistory.run(
      { mesh, crust, mantleForcing, plateGraph, segments },
      computeTectonicHistory.defaultConfig
    );

    expect(Array.from(a.tectonicHistory.upliftTotal)).toEqual(Array.from(b.tectonicHistory.upliftTotal));

    const polarity = Array.from(a.tectonicProvenance.provenance.lastBoundaryPolarity);
    expect(polarity.some((value) => value === -1)).toBe(true);
    const intensity = Array.from(a.tectonicProvenance.provenance.lastBoundaryIntensity);
    expect(Math.max(...intensity)).toBeGreaterThan(0);
  });

  it("rift events reset origin era when activated by weights", () => {
    const mesh = makeTwoCellMesh();
    const crust = makeCrust(mesh.cellCount);
    const mantleForcing = makeMantleForcing(mesh.cellCount);
    const plateGraph = makePlateGraph();
    const segments = makeSegments({
      regime: BOUNDARY_TYPE.divergent,
      polarity: 0,
      extension: 255,
      volcanism: 40,
      fracture: 40,
    });

    const history = computeTectonicHistory.run(
      { mesh, crust, mantleForcing, plateGraph, segments },
      {
        ...computeTectonicHistory.defaultConfig,
        config: {
          ...computeTectonicHistory.defaultConfig.config,
          eraWeights: [0, 1, 0],
          driftStepsByEra: [0, 0, 0],
          beltInfluenceDistance: 8,
          beltDecay: 0.55,
          activityThreshold: 1,
        },
      }
    );

    const originEra = Array.from(history.tectonicProvenance.provenance.originEra);
    expect(originEra.some((value) => value === 1)).toBe(true);
    const crustAge = Array.from(history.tectonicProvenance.provenance.crustAge);
    expect(Math.min(...crustAge)).toBeLessThan(255);
  });
});
