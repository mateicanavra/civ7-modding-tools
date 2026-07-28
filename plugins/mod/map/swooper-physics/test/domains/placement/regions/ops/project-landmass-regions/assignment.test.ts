import { describe, expect, it } from "bun:test";
import placementDomain from "../../../../../../src/domain/placement/router.js";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

const { projectLandmassRegions } = placementDomain.regions.ops;

describe("placement/project-landmass-regions", () => {
  it("assigns sparse domain landmass identities without treating them as array offsets", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const landMask = new Uint8Array(size);
    const landmassIdByTile = new Int32Array(size).fill(-1);
    const westTile = width + 2;
    const eastTile = width + Math.floor(width * 0.75);
    landMask[westTile] = 1;
    landMask[eastTile] = 1;
    landmassIdByTile[westTile] = 7;
    landmassIdByTile[eastTile] = 19;

    const result = runAdmittedOperationForTest(
      projectLandmassRegions,
      {
        width,
        height,
        landMask,
        landmassIdByTile,
        landmasses: [
          { id: 7, west: 2, east: 2 },
          { id: 19, west: Math.floor(width * 0.75), east: Math.floor(width * 0.75) },
        ],
      },
      structuredClone(projectLandmassRegions.defaultConfig)
    );

    expect(result.slotByTile[westTile]).not.toBe(0);
    expect(result.slotByTile[eastTile]).not.toBe(0);
    expect(result.slotByTile[westTile]).not.toBe(result.slotByTile[eastTile]);
  });
});
