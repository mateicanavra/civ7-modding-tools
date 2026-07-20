import { describe, expect, it } from "bun:test";
import foundationOpsPublic from "@mapgen/domain/foundation/ops";

const {
  computeCrust,
  computeMantleForcing,
  computeMantlePotential,
  computeMesh,
  computePlateGraph,
  computePlateMotion,
} = foundationOpsPublic.ops;
function allFinite(values: Float32Array): boolean {
  for (let i = 0; i < values.length; i++) {
    const v = values[i] ?? 0;
    if (!Number.isFinite(v)) return false;
  }
  return true;
}

function truncateMantleForcing(mantleForcing: any, cellCount: number) {
  return {
    ...mantleForcing,
    cellCount,
    stress: mantleForcing.stress.slice(0, cellCount),
    forcingU: mantleForcing.forcingU.slice(0, cellCount),
    forcingV: mantleForcing.forcingV.slice(0, cellCount),
    forcingMag: mantleForcing.forcingMag.slice(0, cellCount),
    upwellingClass: mantleForcing.upwellingClass.slice(0, cellCount),
    divergence: mantleForcing.divergence.slice(0, cellCount),
  };
}

describe("foundation plate motion (D03r)", () => {
  it("is deterministic for identical inputs", () => {
    const syntheticDimensions = { width: 44, height: 28 } as const;
    const { width, height } = syntheticDimensions;
    const meshConfig = computeMesh.normalize({
      strategy: "default",
      config: { plateCount: 10, cellsPerPlate: 4, relaxationSteps: 2 },
    });

    const mesh = computeMesh.run({ width, height, rngSeed: 11 }, meshConfig).mesh;
    const mantlePotential = computeMantlePotential.run(
      { mesh, rngSeed: 14 },
      computeMantlePotential.defaultConfig
    ).mantlePotential;
    const mantleForcing = computeMantleForcing.run(
      { mesh, mantlePotential },
      computeMantleForcing.defaultConfig
    ).mantleForcing;
    const crust = computeCrust.run(
      { mesh, mantleForcing, rngSeed: 12 },
      computeCrust.defaultConfig
    ).crust;
    const plateGraph = computePlateGraph.run(
      { mesh, crust, rngSeed: 13 },
      computePlateGraph.defaultConfig
    ).plateGraph;

    const motionA = computePlateMotion.run(
      { mesh, plateGraph, mantleForcing },
      computePlateMotion.defaultConfig
    ).plateMotion;
    const motionB = computePlateMotion.run(
      { mesh, plateGraph, mantleForcing },
      computePlateMotion.defaultConfig
    ).plateMotion;

    expect(Array.from(motionA.plateVelocityX)).toEqual(Array.from(motionB.plateVelocityX));
    expect(Array.from(motionA.plateVelocityY)).toEqual(Array.from(motionB.plateVelocityY));
    expect(Array.from(motionA.plateOmega)).toEqual(Array.from(motionB.plateOmega));
    expect(Array.from(motionA.cellFitError)).toEqual(Array.from(motionB.cellFitError));
  });

  it("does not cap plateFitP90 at residualNorm (P90 can exceed normalization scale)", () => {
    const syntheticDimensions = { width: 44, height: 28 } as const;
    const { width, height } = syntheticDimensions;
    const meshConfig = computeMesh.normalize({
      strategy: "default",
      config: { plateCount: 10, cellsPerPlate: 4, relaxationSteps: 2 },
    });

    const mesh = computeMesh.run({ width, height, rngSeed: 111 }, meshConfig).mesh;
    const mantlePotential = computeMantlePotential.run(
      { mesh, rngSeed: 114 },
      computeMantlePotential.defaultConfig
    ).mantlePotential;
    const mantleForcingBase = computeMantleForcing.run(
      { mesh, mantlePotential },
      computeMantleForcing.defaultConfig
    ).mantleForcing;
    const crust = computeCrust.run(
      { mesh, mantleForcing: mantleForcingBase, rngSeed: 112 },
      computeCrust.defaultConfig
    ).crust;
    const plateGraph = computePlateGraph.run(
      { mesh, crust, rngSeed: 113 },
      computePlateGraph.defaultConfig
    ).plateGraph;

    // Construct a forcing field with mean speed ~= 1, but with sign flips that a rigid plate motion
    // cannot perfectly fit for all plates.
    const forcingU = new Float32Array(mesh.cellCount);
    const forcingV = new Float32Array(mesh.cellCount);
    const forcingMag = new Float32Array(mesh.cellCount);
    for (let i = 0; i < mesh.cellCount; i++) {
      const u = i % 2 === 0 ? 1 : -1;
      forcingU[i] = u;
      forcingV[i] = 0;
      forcingMag[i] = 1;
    }
    const mantleForcing = {
      ...mantleForcingBase,
      forcingU,
      forcingV,
      forcingMag,
      stress: new Float32Array(mesh.cellCount),
      divergence: new Float32Array(mesh.cellCount),
      upwellingClass: new Int8Array(mesh.cellCount),
    };

    const residualNormScale = 0.1;
    const motionConfig = computePlateMotion.normalize({
      strategy: "default",
      config: {
        ...computePlateMotion.defaultConfig.config,
        residualNormScale,
        p90NormScale: 1,
        histogramBins: 32,
      },
    });
    const motion = computePlateMotion.run(
      { mesh, plateGraph, mantleForcing },
      motionConfig
    ).plateMotion;

    const residualNorm = 1 * residualNormScale;
    let maxP90 = 0;
    for (let i = 0; i < motion.plateFitP90.length; i++) {
      const v = motion.plateFitP90[i] ?? 0;
      if (v > maxP90) maxP90 = v;
    }
    expect(maxP90).toBeGreaterThan(residualNorm);
  });

  it("responds to mantle forcing changes", () => {
    const syntheticDimensions = { width: 44, height: 28 } as const;
    const { width, height } = syntheticDimensions;
    const meshConfig = computeMesh.normalize({
      strategy: "default",
      config: { plateCount: 10, cellsPerPlate: 4, relaxationSteps: 2 },
    });

    const mesh = computeMesh.run({ width, height, rngSeed: 21 }, meshConfig).mesh;
    const mantlePotentialA = computeMantlePotential.run(
      { mesh, rngSeed: 24 },
      computeMantlePotential.defaultConfig
    ).mantlePotential;
    const mantlePotentialB = computeMantlePotential.run(
      { mesh, rngSeed: 25 },
      computeMantlePotential.defaultConfig
    ).mantlePotential;

    const mantleForcingA = computeMantleForcing.run(
      { mesh, mantlePotential: mantlePotentialA },
      computeMantleForcing.defaultConfig
    ).mantleForcing;
    const mantleForcingBRaw = computeMantleForcing.run(
      { mesh, mantlePotential: mantlePotentialB },
      computeMantleForcing.defaultConfig
    ).mantleForcing;
    const forcingU = Float32Array.from(mantleForcingBRaw.forcingU);
    const forcingV = Float32Array.from(mantleForcingBRaw.forcingV);
    if (forcingU.length > 0) forcingU[0] = (forcingU[0] ?? 0) + 0.25;
    if (forcingV.length > 0) forcingV[0] = (forcingV[0] ?? 0) - 0.15;
    const mantleForcingB = {
      ...mantleForcingBRaw,
      forcingU,
      forcingV,
    };
    const crust = computeCrust.run(
      { mesh, mantleForcing: mantleForcingA, rngSeed: 22 },
      computeCrust.defaultConfig
    ).crust;
    const plateGraph = computePlateGraph.run(
      { mesh, crust, rngSeed: 23 },
      computePlateGraph.defaultConfig
    ).plateGraph;

    const motionA = computePlateMotion.run(
      { mesh, plateGraph, mantleForcing: mantleForcingA },
      computePlateMotion.defaultConfig
    ).plateMotion;
    const motionB = computePlateMotion.run(
      { mesh, plateGraph, mantleForcing: mantleForcingB },
      computePlateMotion.defaultConfig
    ).plateMotion;

    expect(Array.from(motionA.cellFitError)).not.toEqual(Array.from(motionB.cellFitError));
  });

  it("rejects plate graph and mantle forcing dimensions from a different mesh", () => {
    const syntheticDimensions = { width: 36, height: 24 } as const;
    const { width, height } = syntheticDimensions;
    const meshConfig = computeMesh.normalize({
      strategy: "default",
      config: { plateCount: 8, cellsPerPlate: 3, relaxationSteps: 2 },
    });

    const mesh = computeMesh.run({ width, height, rngSeed: 41 }, meshConfig).mesh;
    const mantlePotential = computeMantlePotential.run(
      { mesh, rngSeed: 44 },
      computeMantlePotential.defaultConfig
    ).mantlePotential;
    const mantleForcing = computeMantleForcing.run(
      { mesh, mantlePotential },
      computeMantleForcing.defaultConfig
    ).mantleForcing;
    const crust = computeCrust.run(
      { mesh, mantleForcing, rngSeed: 42 },
      computeCrust.defaultConfig
    ).crust;
    const plateGraph = computePlateGraph.run(
      { mesh, crust, rngSeed: 43 },
      computePlateGraph.defaultConfig
    ).plateGraph;

    expect(() =>
      computePlateMotion.run(
        {
          mesh,
          plateGraph: {
            ...plateGraph,
            cellToPlate: plateGraph.cellToPlate.slice(0, mesh.cellCount - 1),
          },
          mantleForcing,
        },
        computePlateMotion.defaultConfig
      )
    ).toThrow(/plateGraph\.cellToPlate/);

    expect(() =>
      computePlateMotion.run(
        {
          mesh,
          plateGraph,
          mantleForcing: truncateMantleForcing(mantleForcing, mesh.cellCount - 1),
        },
        computePlateMotion.defaultConfig
      )
    ).toThrow(/mantleForcing\.cellCount/);
  });

  it("emits finite motion + diagnostics", () => {
    const syntheticDimensions = { width: 32, height: 20 } as const;
    const { width, height } = syntheticDimensions;
    const meshConfig = computeMesh.normalize({
      strategy: "default",
      config: { plateCount: 8, cellsPerPlate: 3, relaxationSteps: 2 },
    });

    const mesh = computeMesh.run({ width, height, rngSeed: 31 }, meshConfig).mesh;
    const mantlePotential = computeMantlePotential.run(
      { mesh, rngSeed: 34 },
      computeMantlePotential.defaultConfig
    ).mantlePotential;
    const mantleForcing = computeMantleForcing.run(
      { mesh, mantlePotential },
      computeMantleForcing.defaultConfig
    ).mantleForcing;
    const crust = computeCrust.run(
      { mesh, mantleForcing, rngSeed: 32 },
      computeCrust.defaultConfig
    ).crust;
    const plateGraph = computePlateGraph.run(
      { mesh, crust, rngSeed: 33 },
      computePlateGraph.defaultConfig
    ).plateGraph;

    const motion = computePlateMotion.run(
      { mesh, plateGraph, mantleForcing },
      computePlateMotion.defaultConfig
    ).plateMotion;

    expect(motion.cellCount).toBe(mesh.cellCount);
    expect(motion.plateCount).toBe(plateGraph.plates.length);
    expect(allFinite(motion.plateVelocityX)).toBe(true);
    expect(allFinite(motion.plateVelocityY)).toBe(true);
    expect(allFinite(motion.plateOmega)).toBe(true);
    expect(allFinite(motion.plateFitRms)).toBe(true);
    expect(allFinite(motion.plateFitP90)).toBe(true);

    for (let i = 0; i < motion.cellFitError.length; i++) {
      const v = motion.cellFitError[i] ?? 0;
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(255);
    }
  });
});
