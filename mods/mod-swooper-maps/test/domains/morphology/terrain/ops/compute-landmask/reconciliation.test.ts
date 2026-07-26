import { describe, expect, it } from "bun:test";

import morphology from "@mapgen/domain/morphology/router";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

const { computeLandmask } = morphology.terrain.ops;

describe("compute-landmask topography reconciliation", () => {
  it("keeps land class, elevation, and bathymetry coherent without mutating admitted inputs", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const cellCount = width * height;
    const seaLevel = 0;
    const elevation = new Int16Array(cellCount);
    const crustType = new Uint8Array(cellCount);
    const crustBaseElevation = new Float32Array(cellCount);
    for (let index = 0; index < cellCount; index++) {
      const continental = index < cellCount / 2;
      elevation[index] = continental ? -3 : 5;
      crustType[index] = continental ? 1 : 0;
      crustBaseElevation[index] = continental ? 1 : 0;
    }
    const originalElevation = Int16Array.from(elevation);
    const result = computeLandmask.run(
      {
        width,
        height,
        elevation,
        seaLevel,
        boundaryCloseness: new Uint8Array(cellCount),
        boundaryType: new Uint8Array(cellCount),
        upliftPotential: new Uint8Array(cellCount),
        riftPotential: new Uint8Array(cellCount),
        tectonicStress: new Uint8Array(cellCount),
        crustType,
        crustMaturity: new Float32Array(cellCount),
        crustThickness: new Float32Array(cellCount),
        crustDamage: new Uint8Array(cellCount),
        crustBaseElevation,
        crustStrength: new Float32Array(cellCount),
        crustAge: new Uint8Array(cellCount),
        provenanceOriginEra: new Uint8Array(cellCount),
        provenanceDriftDistance: new Uint8Array(cellCount),
        riftPotentialByEra: [new Uint8Array(cellCount)],
        fractureTotal: new Uint8Array(cellCount),
        upliftTotal: new Uint8Array(cellCount),
        volcanismTotal: new Uint8Array(cellCount),
        upliftRecentFraction: new Uint8Array(cellCount),
        lastActiveEra: new Uint8Array(cellCount).fill(255),
        movementU: new Int8Array(cellCount),
        movementV: new Int8Array(cellCount),
      },
      computeLandmask.defaultConfig
    );

    const incoherentCells: string[] = [];
    let liftedLandCount = 0;
    let loweredWaterCount = 0;
    for (let index = 0; index < cellCount; index++) {
      if (result.landMask[index] === 1) {
        if ((result.elevation[index] ?? 0) <= seaLevel || result.bathymetry[index] !== 0) {
          incoherentCells.push(`land:${index}`);
        }
        if ((originalElevation[index] ?? 0) <= seaLevel) liftedLandCount++;
        continue;
      }

      const expectedDepth = Math.min(0, (result.elevation[index] ?? 0) - seaLevel);
      if ((result.elevation[index] ?? 0) > seaLevel || result.bathymetry[index] !== expectedDepth) {
        incoherentCells.push(`water:${index}`);
      }
      if ((originalElevation[index] ?? 0) > seaLevel) loweredWaterCount++;
    }
    expect(incoherentCells).toEqual([]);
    expect(liftedLandCount).toBeGreaterThan(0);
    expect(loweredWaterCount).toBeGreaterThan(0);

    expect(result.elevation).not.toBe(elevation);
    expect(elevation).toEqual(originalElevation);
  });
});
