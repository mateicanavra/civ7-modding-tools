import { describe, expect, it } from "bun:test";

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

describe("m11 tectonic segments (polarity bootstrap)", () => {
  it("bootstraps convergent polarity for oceanic-oceanic segments using strength differential", () => {
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

    // Same mean resistance (0.55) in both cases, so the only difference is polarity bonus.
    const crustBootstrap = {
      maturity: new Float32Array([0, 0]),
      thickness: new Float32Array([0.25, 0.25]),
      thermalAge: new Uint8Array([0, 0]),
      damage: new Uint8Array([0, 0]),
      type: new Uint8Array([0, 0]),
      age: new Uint8Array([0, 0]),
      buoyancy: new Float32Array([0.2, 0.2]),
      baseElevation: new Float32Array([0.2, 0.2]),
      strength: new Float32Array([0.2, 0.9]),
    } as const;

    const crustNoBootstrap = {
      ...crustBootstrap,
      strength: new Float32Array([0.55, 0.55]),
    } as const;

    const segA = computeTectonicSegments.run(
      { mesh, crust: crustBootstrap as any, plateGraph: plateGraph as any, plateMotion: plateMotion as any },
      scaledConfig
    ).segments;
    const segB = computeTectonicSegments.run(
      { mesh, crust: crustNoBootstrap as any, plateGraph: plateGraph as any, plateMotion: plateMotion as any },
      scaledConfig
    ).segments;

    expect(segA.segmentCount).toBe(1);
    expect(segB.segmentCount).toBe(1);

    // Convergent regime and non-zero polarity.
    expect(segA.regime[0]).toBeGreaterThan(0);
    expect(segA.polarity[0]).toBe(-1);

    // The convergent volcanism bonus is +40 when polarity is known.
    expect(segA.volcanism[0] - segB.volcanism[0]).toBe(40);
  });
});
