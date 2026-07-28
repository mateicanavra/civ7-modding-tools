import { describe, expect, it } from "bun:test";

import foundation from "../../../../../../src/domain/foundation/router.js";

const { computePlateMotion } = foundation.tectonics.ops;

function singlePlateInput(params: {
  siteX: readonly number[];
  siteY: readonly number[];
  forcingU: readonly number[];
  forcingV: readonly number[];
}) {
  const cellCount = params.siteX.length;
  return {
    mesh: {
      cellCount,
      wrapWidth: 100,
      siteX: Float32Array.from(params.siteX),
      siteY: Float32Array.from(params.siteY),
      areas: new Float32Array(cellCount).fill(1),
      neighborsOffsets: new Int32Array(cellCount + 1),
      neighbors: new Int32Array(),
    },
    plateGraph: {
      cellToPlate: new Int16Array(cellCount),
      plates: [{ id: 0, role: "tectonic", kind: "major", seedX: 0, seedY: 0 }] as const,
    },
    mantleForcing: {
      forcingU: Float32Array.from(params.forcingU),
      forcingV: Float32Array.from(params.forcingV),
    },
  } as const;
}

describe("foundation/compute-plate-motion", () => {
  it("recovers rigid translation and rotation from mantle forcing", () => {
    const translation = computePlateMotion.run(
      singlePlateInput({
        siteX: [-1, 1],
        siteY: [0, 0],
        forcingU: [2, 2],
        forcingV: [-1, -1],
      }),
      computePlateMotion.defaultConfig
    ).plateMotion;

    expect(translation.plateVelocityX[0]).toBeCloseTo(2);
    expect(translation.plateVelocityY[0]).toBeCloseTo(-1);
    expect(translation.plateOmega[0]).toBeCloseTo(0);

    const rotation = computePlateMotion.run(
      singlePlateInput({
        siteX: [-1, 1, 0, 0],
        siteY: [0, 0, -1, 1],
        forcingU: [0, 0, 1, -1],
        forcingV: [-1, 1, 0, 0],
      }),
      computePlateMotion.defaultConfig
    ).plateMotion;

    expect(rotation.plateVelocityX[0]).toBeCloseTo(0);
    expect(rotation.plateVelocityY[0]).toBeCloseTo(0);
    expect(rotation.plateOmega[0]).toBeCloseTo(1);
    expect(rotation.plateFitRms[0]).toBeCloseTo(0);
  });

  it("does not cap P90 residuals at the residual normalization scale", () => {
    const residualNormScale = 0.1;
    const selection = computePlateMotion.normalize({
      strategy: "rigid-body-fit",
      config: {
        ...computePlateMotion.defaultConfig.config,
        residualNormScale,
        p90NormScale: 1,
        histogramBins: 32,
      },
    });
    const motion = computePlateMotion.run(
      singlePlateInput({
        siteX: [-1, 1, 0, 0],
        siteY: [0, 0, -1, 1],
        forcingU: [1, -1, 1, -1],
        forcingV: [0, 0, 0, 0],
      }),
      selection
    ).plateMotion;

    expect(motion.plateFitP90[0]).toBeGreaterThan(residualNormScale);
  });
});
