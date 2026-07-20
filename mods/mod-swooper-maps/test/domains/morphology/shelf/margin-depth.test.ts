import { describe, expect, it } from "bun:test";

import morphologyDomain from "@mapgen/domain/morphology/ops";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";

const { computeSculptContinentalMargin, computeShelfMask } = morphologyDomain.ops;

function sculptSyntheticMargin(posture: "active" | "passive") {
  const syntheticDimensions = { width: 20, height: 5 } as const;
  const { width, height } = syntheticDimensions;
  const size = width * height;
  const elevation = new Int16Array(size).fill(100);
  const crustType = new Uint8Array(size);
  const crustAge = new Uint8Array(size);
  const crustBuoyancy = new Float32Array(size);
  const boundaryCloseness = new Uint8Array(size).fill(posture === "active" ? 255 : 0);
  const boundaryType = new Uint8Array(size).fill(1);

  for (let y = 0; y < height; y++) {
    for (let x = 8; x <= 11; x++) crustType[y * width + x] = 1;
  }

  return runAdmittedOperationForTest(
    computeSculptContinentalMargin,
    {
      width,
      height,
      oceanicHeight: -1,
      continentalHeight: 1,
      elevationScale: 100,
      elevation,
      crustType,
      crustAge,
      crustBuoyancy,
      boundaryCloseness,
      boundaryType,
    },
    {
      strategy: "default",
      config: {
        breakCrustFraction: 0.45,
        apronTopCrustFraction: 0.62,
        apronBlendStrength: 0.8,
        baseApronLengthTiles: 8,
        activeApronFactor: 0.5,
        riftApronFactor: 0.6,
        passiveApronFactor: 1.5,
        ageApronGain: 0.6,
        buoyancyApronGain: 0.4,
        activeClosenessThreshold: 0.35,
      },
    }
  );
}

describe("morphology continental-margin postures", () => {
  it("sculpts active margins narrower and steeper than otherwise-comparable passive margins", () => {
    const active = sculptSyntheticMargin("active");
    const passive = sculptSyntheticMargin("passive");
    const syntheticWidth = 20;
    const middleRow = 2;
    const breakEdge = middleRow * syntheticWidth + 12;
    const firstSlopeTile = breakEdge + 1;
    const secondSlopeTile = breakEdge + 2;

    expect(active.marginHopDistance[firstSlopeTile]).toBe(1);
    expect(passive.marginHopDistance[firstSlopeTile]).toBe(1);
    expect(active.apronLengthScale[breakEdge]).toBeCloseTo(4, 6);
    expect(passive.apronLengthScale[breakEdge]).toBeCloseTo(12, 6);
    expect(active.apronLengthScale[breakEdge]).toBeLessThan(passive.apronLengthScale[breakEdge]!);
    expect(active.elevation[firstSlopeTile]).toBeLessThan(passive.elevation[firstSlopeTile]!);
    expect(active.elevation[secondSlopeTile]).toBeLessThan(passive.elevation[secondSlopeTile]!);
  });

  it("reads a shallower shelf break from an active-margin profile than a passive one", () => {
    const syntheticDimensions = { width: 8, height: 5 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const landMask = new Uint8Array(size);
    const bathymetry = new Int16Array(size);
    const distanceToCoast = new Uint16Array(size);
    const boundaryCloseness = new Uint8Array(size);
    const boundaryType = new Uint8Array(size).fill(2);

    for (let x = 0; x < width; x++) landMask[x] = 1;
    for (let y = 1; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const activeMargin = x < width / 2;
        distanceToCoast[index] = y;
        bathymetry[index] = activeMargin ? [-2, -4, -20, -20][y - 1]! : [-4, -12, -50, -50][y - 1]!;
        if (activeMargin) {
          boundaryType[index] = 1;
          boundaryCloseness[index] = 255;
        }
      }
    }

    const result = runAdmittedOperationForTest(
      computeShelfMask,
      {
        width,
        height,
        landMask,
        bathymetry,
        distanceToCoast,
        boundaryCloseness,
        boundaryType,
      },
      {
        strategy: "default",
        config: {
          breakGradient: 8,
          breakGradientScale: 1,
          activeClosenessThreshold: 0.45,
        },
      }
    );

    const activeBreakTile = 2 * width + 1;
    const passiveBreakTile = 2 * width + 6;
    expect(result.activeMarginMask[activeBreakTile]).toBe(1);
    expect(result.activeMarginMask[passiveBreakTile]).toBe(0);
    expect(result.depthGateMask[activeBreakTile]).toBe(0);
    expect(result.depthGateMask[passiveBreakTile]).toBe(0);
    expect(result.shelfBreakDepthByTile[activeBreakTile]).toBe(-20);
    expect(result.shelfBreakDepthByTile[passiveBreakTile]).toBe(-50);
    expect(result.shelfBreakDepthByTile[activeBreakTile]).toBeGreaterThan(
      result.shelfBreakDepthByTile[passiveBreakTile]!
    );
  });
});
