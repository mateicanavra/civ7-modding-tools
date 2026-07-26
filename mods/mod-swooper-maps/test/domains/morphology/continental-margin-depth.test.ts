import { describe, expect, it } from "bun:test";

import morphology from "@mapgen/domain/morphology/router";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";

const {
  computeCoastalAdjacency,
  computeDistanceToCoast,
  computeSculptContinentalMargin,
} = morphology.coasts.ops;
const { computeShelfMask } = morphology.shelf.ops;

function countMask(mask: Uint8Array): number {
  let count = 0;
  for (const value of mask) if (value === 1) count++;
  return count;
}

function runSyntheticMargin(posture: "active" | "passive") {
  const dimensions = { width: 20, height: 5 } as const;
  const { width, height } = dimensions;
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

  const sculpted = runAdmittedOperationForTest(
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
      strategy: "crust-break-profile",
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
  const landMask = Uint8Array.from(crustType);
  const { coastalWater } = runAdmittedOperationForTest(
    computeCoastalAdjacency,
    { width, height, landMask },
    { strategy: "wrapped-hex-adjacency", config: {} }
  );
  const { distanceToCoast } = runAdmittedOperationForTest(
    computeDistanceToCoast,
    { width, height, coastal: coastalWater },
    { strategy: "multi-source-hex-bfs", config: {} }
  );
  const shelf = runAdmittedOperationForTest(
    computeShelfMask,
    {
      width,
      height,
      landMask,
      bathymetry: sculpted.elevation,
      distanceToCoast,
      boundaryCloseness,
      boundaryType,
    },
    {
      strategy: "physical-break-connectivity",
      config: {
        breakGradient: 8,
        breakGradientScale: 1,
        activeClosenessThreshold: 0.45,
      },
    }
  );

  return { dimensions, sculpted, shelf };
}

describe("morphology continental-margin posture", () => {
  it("carries active and passive sculpting through to different shelf extents", () => {
    const active = runSyntheticMargin("active");
    const passive = runSyntheticMargin("passive");
    const middleRow = 2;
    const breakEdge = middleRow * active.dimensions.width + 12;
    const firstSlopeTile = breakEdge + 1;

    expect(active.sculpted.apronLengthScale[breakEdge]).toBeCloseTo(4, 6);
    expect(passive.sculpted.apronLengthScale[breakEdge]).toBeCloseTo(12, 6);
    expect(active.sculpted.elevation[firstSlopeTile]).toBeLessThan(
      passive.sculpted.elevation[firstSlopeTile]!
    );
    expect(countMask(active.shelf.activeMarginMask)).toBeGreaterThan(0);
    expect(countMask(passive.shelf.activeMarginMask)).toBe(0);
    expect(countMask(active.shelf.shelfMask)).toBeLessThan(countMask(passive.shelf.shelfMask));
  });
});
