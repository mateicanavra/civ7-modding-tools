import { describe, expect, it } from "bun:test";

import morphologyDomain from "@mapgen/domain/morphology/router";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";

const { computeLandmasses } = morphologyDomain.landforms.ops;

describe("compute-landmasses", () => {
  it("labels wrapped land components while leaving water unassigned", () => {
    const syntheticDimensions = { width: 7, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const landMask = new Uint8Array(width * height);
    const westSeamTile = width;
    const eastSeamTile = width * 2 - 1;
    const isolatedTile = width + 3;
    landMask[westSeamTile] = 1;
    landMask[eastSeamTile] = 1;
    landMask[isolatedTile] = 1;

    const result = runAdmittedOperationForTest(
      computeLandmasses,
      { width, height, landMask },
      { strategy: "wrapped-hex-components", config: {} }
    );

    expect(
      result.landmasses.map((landmass) => landmass.tileCount).sort((left, right) => right - left)
    ).toEqual([2, 1]);
    expect(result.landmassIdByTile[westSeamTile]).toBe(result.landmassIdByTile[eastSeamTile]);
    expect(result.landmassIdByTile[isolatedTile]).not.toBe(result.landmassIdByTile[westSeamTile]);
    expect(result.landmassIdByTile[width + 1]).toBe(-1);
  });
});
