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

function makeCrust(cellCount: number, types: readonly [number, number] = [0, 0]) {
  return {
    maturity: new Float32Array(cellCount),
    thickness: new Float32Array(cellCount).fill(0.25),
    thermalAge: new Uint8Array(cellCount),
    damage: new Uint8Array(cellCount),
    type: new Uint8Array(types),
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
      { id: 0, role: "tectonic", kind: "major", seedX: 0, seedY: 0 },
      { id: 1, role: "tectonic", kind: "major", seedX: 1, seedY: 0 },
    ],
  } as const;
}

function makePlateMotion(cellCount: number, plateCount: number) {
  return {
    version: 1,
    cellCount,
    plateCount,
    plateCenterX: new Float32Array(plateCount),
    plateCenterY: new Float32Array(plateCount),
    plateVelocityX: new Float32Array(plateCount),
    plateVelocityY: new Float32Array(plateCount),
    plateOmega: new Float32Array(plateCount),
    plateFitRms: new Float32Array(plateCount),
    plateFitP90: new Float32Array(plateCount),
    plateQuality: new Uint8Array(plateCount),
    cellFitError: new Uint8Array(cellCount),
  } as const;
}

function makeMantleForcing(
  cellCount: number,
  forcing: readonly [number, number] = [0, 0],
  stress: readonly [number, number] = [0, 0]
) {
  const [u0, u1] = forcing;
  const [s0, s1] = stress;
  return {
    version: 1,
    cellCount,
    stress: new Float32Array([s0, s1]),
    forcingU: new Float32Array([u0, u1]),
    forcingV: new Float32Array(cellCount),
    forcingMag: new Float32Array([Math.abs(u0), Math.abs(u1)]),
    upwellingClass: new Int8Array(cellCount),
    divergence: new Float32Array(cellCount),
  } as const;
}

describe("m11 tectonic events", () => {
  it("subduction events deterministically update boundary provenance", () => {
    const mesh = makeTwoCellMesh();
    // Oceanic -> continental polarity is deterministically resolvable under convergent forcing.
    const crust = makeCrust(mesh.cellCount, [0, 1]);
    const mantleForcing = makeMantleForcing(mesh.cellCount, [1, -1], [1, 1]);
    const plateGraph = makePlateGraph();
    const plateMotion = makePlateMotion(mesh.cellCount, plateGraph.plates.length);

    const a = computeTectonicHistory.run(
      { mesh, crust, mantleForcing, plateGraph, plateMotion },
      computeTectonicHistory.defaultConfig
    );
    const b = computeTectonicHistory.run(
      { mesh, crust, mantleForcing, plateGraph, plateMotion },
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
    // Divergent forcing keeps the rift signal in the weighted era.
    const mantleForcing = makeMantleForcing(mesh.cellCount, [-1, 1], [1, 1]);
    const plateGraph = makePlateGraph();
    const plateMotion = makePlateMotion(mesh.cellCount, plateGraph.plates.length);

    const history = computeTectonicHistory.run(
      { mesh, crust, mantleForcing, plateGraph, plateMotion },
      {
        ...computeTectonicHistory.defaultConfig,
        config: {
          ...computeTectonicHistory.defaultConfig.config,
          eraWeights: [0, 1, 0, 0, 0],
          driftStepsByEra: [0, 0, 0, 0, 0],
          beltInfluenceDistance: 8,
          beltDecay: 0.55,
          activityThreshold: 1,
        },
      }
    );

    const originEra = Array.from(history.tectonicProvenance.provenance.originEra);
    expect(originEra.some((value) => value === 1)).toBe(true);
    const lastBoundaryType = Array.from(history.tectonicProvenance.provenance.lastBoundaryType);
    expect(lastBoundaryType.some((value) => value === BOUNDARY_TYPE.divergent)).toBe(true);
    const crustAge = Array.from(history.tectonicProvenance.provenance.crustAge);
    expect(Math.min(...crustAge)).toBeLessThan(255);
  });

  it("provenance tracer indices are deterministic and bounded", () => {
    const mesh = makeTwoCellMesh();
    const crust = makeCrust(mesh.cellCount);
    const mantleForcing = makeMantleForcing(mesh.cellCount);
    const plateGraph = makePlateGraph();
    const plateMotion = makePlateMotion(mesh.cellCount, plateGraph.plates.length);

    const a = computeTectonicHistory.run(
      { mesh, crust, mantleForcing, plateGraph, plateMotion },
      computeTectonicHistory.defaultConfig
    );
    const b = computeTectonicHistory.run(
      { mesh, crust, mantleForcing, plateGraph, plateMotion },
      computeTectonicHistory.defaultConfig
    );

    const tracesA = a.tectonicProvenance.tracerIndex;
    const tracesB = b.tectonicProvenance.tracerIndex;
    expect(tracesA.length).toBe(a.tectonicHistory.eraCount);
    expect(tracesB.length).toBe(tracesA.length);

    for (let e = 0; e < tracesA.length; e++) {
      const traceA = tracesA[e]!;
      const traceB = tracesB[e]!;
      expect(traceA.length).toBe(mesh.cellCount);
      expect(Array.from(traceA)).toEqual(Array.from(traceB));
      for (const value of traceA) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(mesh.cellCount);
      }
    }

    expect(Array.from(tracesA[0]!)).toEqual([0, 1]);
  });
});
