import { describe, expect, it } from "bun:test";

import computeTectonicHistory from "../../src/domain/foundation/ops/compute-tectonic-history/index.js";
import computeTectonicSegments from "../../src/domain/foundation/ops/compute-tectonic-segments/index.js";

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

function makePlateMotion(
  plateGraph: {
    plates: { seedX: number; seedY: number }[];
  },
  cellCount: number,
  motionByPlate: Array<{ velocityX?: number; velocityY?: number; omega?: number }> = []
) {
  const plateCount = plateGraph.plates.length;
  const plateCenterX = new Float32Array(plateCount);
  const plateCenterY = new Float32Array(plateCount);
  const plateVelocityX = new Float32Array(plateCount);
  const plateVelocityY = new Float32Array(plateCount);
  const plateOmega = new Float32Array(plateCount);
  for (let i = 0; i < plateCount; i++) {
    const plate = plateGraph.plates[i]!;
    const motion = motionByPlate[i] ?? {};
    plateCenterX[i] = plate.seedX ?? 0;
    plateCenterY[i] = plate.seedY ?? 0;
    plateVelocityX[i] = motion.velocityX ?? 0;
    plateVelocityY[i] = motion.velocityY ?? 0;
    plateOmega[i] = motion.omega ?? 0;
  }
  return {
    version: 1,
    cellCount,
    plateCount,
    plateCenterX,
    plateCenterY,
    plateVelocityX,
    plateVelocityY,
    plateOmega,
    plateFitRms: new Float32Array(plateCount),
    plateFitP90: new Float32Array(plateCount),
    plateQuality: new Uint8Array(plateCount),
    cellFitError: new Uint8Array(cellCount),
  } as const;
}

function makeMantleForcing(cellCount: number) {
  // Non-zero forcing ensures compute-plate-motion (used by compute-tectonic-history per-era) produces
  // a meaningful plate velocity field in minimal synthetic tests.
  const stress = new Float32Array(cellCount);
  const forcingU = new Float32Array(cellCount);
  const forcingV = new Float32Array(cellCount);
  if (cellCount >= 2) forcingU[1] = -1;

  const forcingMag = new Float32Array(cellCount);
  for (let i = 0; i < cellCount; i++) forcingMag[i] = Math.hypot(forcingU[i] ?? 0, forcingV[i] ?? 0);

  return {
    version: 1,
    cellCount,
    stress,
    forcingU,
    forcingV,
    forcingMag,
    upwellingClass: new Int8Array(cellCount),
    divergence: new Float32Array(cellCount),
  } as const;
}

describe("m11 tectonics (segments + history)", () => {
  it("segment decomposition is rotation-aware (shear changes when rotation changes)", () => {
    const mesh = makeTwoCellMesh();
    const crust = {
      maturity: new Float32Array([0, 0]),
      thickness: new Float32Array([0.25, 0.25]),
      thermalAge: new Uint8Array([0, 0]),
      damage: new Uint8Array([0, 0]),
      type: new Uint8Array([0, 0]),
      age: new Uint8Array([0, 0]),
      buoyancy: new Float32Array([0.2, 0.2]),
      baseElevation: new Float32Array([0.2, 0.2]),
      strength: new Float32Array([0.2, 0.2]),
    } as const;

    const basePlateGraph = {
      cellToPlate: new Int16Array([0, 1]),
      plates: [
        { id: 0, role: "tectonic", kind: "major", seedX: 0, seedY: 0 },
        { id: 1, role: "tectonic", kind: "major", seedX: 1, seedY: 0 },
      ],
    } as const;

    const basePlateMotion = makePlateMotion(basePlateGraph, mesh.cellCount);
    const noRot = computeTectonicSegments.run(
      { mesh, crust: crust as any, plateGraph: basePlateGraph as any, plateMotion: basePlateMotion as any },
      computeTectonicSegments.defaultConfig
    ).segments;

    const withRotPlateMotion = makePlateMotion(basePlateGraph, mesh.cellCount, [{}, { omega: 1.0 }]);
    const withRot = computeTectonicSegments.run(
      { mesh, crust: crust as any, plateGraph: basePlateGraph as any, plateMotion: withRotPlateMotion as any },
      computeTectonicSegments.defaultConfig
    ).segments;

    expect(noRot.segmentCount).toBe(1);
    expect(withRot.segmentCount).toBe(1);
    expect(noRot.shear[0]).toBe(0);
    expect(withRot.shear[0]).toBeGreaterThan(0);
  });

  it("convergent polarity is stable for oceanic-under-continental pairing", () => {
    const mesh = makeTwoCellMesh();
    const crust = {
      maturity: new Float32Array([0, 0.9]),
      thickness: new Float32Array([0.2, 0.8]),
      thermalAge: new Uint8Array([0, 0]),
      damage: new Uint8Array([0, 0]),
      type: new Uint8Array([0, 1]),
      age: new Uint8Array([0, 0]),
      buoyancy: new Float32Array([0.2, 0.9]),
      baseElevation: new Float32Array([0.2, 0.9]),
      strength: new Float32Array([0.2, 0.9]),
    } as const;

    const plateGraph = {
      cellToPlate: new Int16Array([0, 1]),
      plates: [
        { id: 0, role: "tectonic", kind: "major", seedX: 0, seedY: 0 },
        { id: 1, role: "tectonic", kind: "major", seedX: 1, seedY: 0 },
      ],
    } as const;

    const plateMotion = makePlateMotion(plateGraph, mesh.cellCount, [{}, { velocityX: -1.0 }]);
    const segments = computeTectonicSegments.run(
      { mesh, crust: crust as any, plateGraph: plateGraph as any, plateMotion: plateMotion as any },
      computeTectonicSegments.defaultConfig
    ).segments;

    expect(segments.segmentCount).toBe(1);
    expect(segments.regime[0]).toBeGreaterThan(0);
    expect(segments.polarity[0]).toBe(-1);
  });

  it("segment arrays are deterministic for identical inputs", () => {
    const mesh = makeTwoCellMesh();
    const crust = {
      maturity: new Float32Array([0.2, 0.2]),
      thickness: new Float32Array([0.25, 0.25]),
      thermalAge: new Uint8Array([0, 0]),
      damage: new Uint8Array([0, 0]),
      type: new Uint8Array([0, 0]),
      age: new Uint8Array([0, 0]),
      buoyancy: new Float32Array([0.2, 0.2]),
      baseElevation: new Float32Array([0.2, 0.2]),
      strength: new Float32Array([0.4, 0.4]),
    } as const;

    const plateGraph = {
      cellToPlate: new Int16Array([0, 1]),
      plates: [
        { id: 0, role: "tectonic", kind: "major", seedX: 0, seedY: 0 },
        { id: 1, role: "tectonic", kind: "major", seedX: 1, seedY: 0 },
      ],
    } as const;

    const plateMotion = makePlateMotion(plateGraph, mesh.cellCount, [{}, { velocityX: -1.0 }]);
    const a = computeTectonicSegments.run(
      { mesh, crust: crust as any, plateGraph: plateGraph as any, plateMotion: plateMotion as any },
      computeTectonicSegments.defaultConfig
    ).segments;
    const b = computeTectonicSegments.run(
      { mesh, crust: crust as any, plateGraph: plateGraph as any, plateMotion: plateMotion as any },
      computeTectonicSegments.defaultConfig
    ).segments;

    expect(Array.from(a.regime)).toEqual(Array.from(b.regime));
    expect(Array.from(a.polarity)).toEqual(Array.from(b.polarity));
    expect(Array.from(a.compression)).toEqual(Array.from(b.compression));
    expect(Array.from(a.extension)).toEqual(Array.from(b.extension));
    expect(Array.from(a.shear)).toEqual(Array.from(b.shear));
  });

  it("crust resistance scales compression vs extension intensities", () => {
    const mesh = makeTwoCellMesh();
    const plateGraph = {
      cellToPlate: new Int16Array([0, 1]),
      plates: [
        { id: 0, role: "tectonic", kind: "major", seedX: 0, seedY: 0 },
        { id: 1, role: "tectonic", kind: "major", seedX: 1, seedY: 0 },
      ],
    } as const;

    const plateMotion = makePlateMotion(plateGraph, mesh.cellCount, [{}, { velocityX: -1.0 }]);
    const scaledConfig = {
      ...computeTectonicSegments.defaultConfig,
      config: { ...computeTectonicSegments.defaultConfig.config, intensityScale: 120 },
    };

    const crustStrong = {
      maturity: new Float32Array([0.2, 0.2]),
      thickness: new Float32Array([0.5, 0.5]),
      thermalAge: new Uint8Array([0, 0]),
      damage: new Uint8Array([0, 0]),
      type: new Uint8Array([0, 0]),
      age: new Uint8Array([0, 0]),
      buoyancy: new Float32Array([0.3, 0.3]),
      baseElevation: new Float32Array([0.3, 0.3]),
      strength: new Float32Array([0.9, 0.9]),
    } as const;

    const crustWeak = {
      maturity: new Float32Array([0.1, 0.1]),
      thickness: new Float32Array([0.2, 0.2]),
      thermalAge: new Uint8Array([0, 0]),
      damage: new Uint8Array([0, 0]),
      type: new Uint8Array([0, 0]),
      age: new Uint8Array([0, 0]),
      buoyancy: new Float32Array([0.2, 0.2]),
      baseElevation: new Float32Array([0.2, 0.2]),
      strength: new Float32Array([0.1, 0.1]),
    } as const;

    const strongSeg = computeTectonicSegments.run(
      { mesh, crust: crustStrong as any, plateGraph: plateGraph as any, plateMotion: plateMotion as any },
      scaledConfig
    ).segments;
    const weakSeg = computeTectonicSegments.run(
      { mesh, crust: crustWeak as any, plateGraph: plateGraph as any, plateMotion: plateMotion as any },
      scaledConfig
    ).segments;

    expect(strongSeg.compression[0]).toBeGreaterThan(weakSeg.compression[0]);
    expect(weakSeg.extension[0]).toBeLessThanOrEqual(strongSeg.extension[0]);
  });

  it("3-era history is deterministic and populates lastActiveEra", () => {
    const mesh = makeTwoCellMesh();
    const crust = {
      maturity: new Float32Array([0, 0.9]),
      thickness: new Float32Array([0.2, 0.8]),
      thermalAge: new Uint8Array([0, 0]),
      damage: new Uint8Array([0, 0]),
      type: new Uint8Array([0, 1]),
      age: new Uint8Array([0, 0]),
      buoyancy: new Float32Array([0.2, 0.9]),
      baseElevation: new Float32Array([0.2, 0.9]),
      strength: new Float32Array([0.2, 0.9]),
    } as const;

    const plateGraph = {
      cellToPlate: new Int16Array([0, 1]),
      plates: [
        { id: 0, role: "tectonic", kind: "major", seedX: 0, seedY: 0 },
        { id: 1, role: "tectonic", kind: "major", seedX: 1, seedY: 0 },
      ],
    } as const;

    const plateMotion = makePlateMotion(plateGraph, mesh.cellCount, [{}, { velocityX: -1.0 }]);
    const segments = computeTectonicSegments.run(
      { mesh, crust: crust as any, plateGraph: plateGraph as any, plateMotion: plateMotion as any },
      computeTectonicSegments.defaultConfig
    ).segments;

    const mantleForcing = makeMantleForcing(mesh.cellCount);
    const a = computeTectonicHistory.run(
      { mesh, crust, mantleForcing, plateGraph, plateMotion },
      computeTectonicHistory.defaultConfig
    );
    const b = computeTectonicHistory.run(
      { mesh, crust, mantleForcing, plateGraph, plateMotion },
      computeTectonicHistory.defaultConfig
    );

    expect(a.tectonicHistory.eraCount).toBe(5);
    expect(a.tectonicHistory.eras.length).toBe(5);
    expect(Array.from(a.tectonicHistory.upliftTotal)).toEqual(Array.from(b.tectonicHistory.upliftTotal));
    expect(Array.from(a.tectonicHistory.lastActiveEra)).toEqual(Array.from(b.tectonicHistory.lastActiveEra));

    // Both cells are within belt influence for this tiny mesh and should be active in the newest era.
    expect(a.tectonicHistory.lastActiveEra[0]).toBe(4);
    expect(a.tectonicHistory.lastActiveEra[1]).toBe(4);
  });

  it("rejects eraCount below the 5-era contract minimum", () => {
    const mesh = makeTwoCellMesh();
    const crust = {
      maturity: new Float32Array([0, 0.9]),
      thickness: new Float32Array([0.2, 0.8]),
      thermalAge: new Uint8Array([0, 0]),
      damage: new Uint8Array([0, 0]),
      type: new Uint8Array([0, 1]),
      age: new Uint8Array([0, 0]),
      buoyancy: new Float32Array([0.2, 0.9]),
      baseElevation: new Float32Array([0.2, 0.9]),
      strength: new Float32Array([0.2, 0.9]),
    } as const;
    const plateGraph = {
      cellToPlate: new Int16Array([0, 1]),
      plates: [
        { id: 0, role: "tectonic", kind: "major", seedX: 0, seedY: 0 },
        { id: 1, role: "tectonic", kind: "major", seedX: 1, seedY: 0 },
      ],
    } as const;
    const plateMotion = makePlateMotion(plateGraph, mesh.cellCount, [{}, { velocityX: -1.0 }]);
    const segments = computeTectonicSegments.run(
      { mesh, crust: crust as any, plateGraph: plateGraph as any, plateMotion: plateMotion as any },
      computeTectonicSegments.defaultConfig
    ).segments;
    const mantleForcing = makeMantleForcing(mesh.cellCount);
    const invalidConfig = {
      strategy: "default" as const,
      config: {
        ...computeTectonicHistory.defaultConfig.config,
        eraWeights: [0.4, 0.3, 0.2, 0.1],
        driftStepsByEra: [2, 2, 2, 2],
      },
    };

    expect(() =>
      computeTectonicHistory.run({ mesh, crust, mantleForcing, plateGraph, plateMotion }, invalidConfig)
    ).toThrow("[Foundation] compute-tectonic-history expects eraCount within 5..8.");
  });
});
