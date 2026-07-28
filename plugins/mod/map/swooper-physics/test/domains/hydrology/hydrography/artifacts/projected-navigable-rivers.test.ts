import { describe, expect, it } from "bun:test";

import { artifacts as hydrographyArtifacts } from "../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const TEST_DIMENSIONS = TEST_MAP_SIZE.dimensions;
const TEST_CARDINALITY = TEST_DIMENSIONS.width * TEST_DIMENSIONS.height;

function projectedNavigableRiverPayload(selectedChainLengths: Uint16Array) {
  return {
    ...TEST_DIMENSIONS,
    riverMask: new Uint8Array(TEST_CARDINALITY),
    plannedMinorRiverMask: new Uint8Array(TEST_CARDINALITY),
    plannedMajorRiverMask: new Uint8Array(TEST_CARDINALITY),
    selectedTileCount: 2,
    eligibleTileCount: 2,
    plannedMinorRiverTileCount: 0,
    plannedMajorRiverTileCount: 2,
    candidateEndpointCount: 1,
    selectedChainCount: 1,
    selectedChainLengths,
    longestSelectedChainLength: 2,
    meanSelectedChainLength: 2,
    targetTileCount: 2,
    targetMajorTileFraction: 1,
    selectedEndpointDischargeFloor: 1,
    nonProjectableMajorTileCount: 0,
    unselectedEligibleMajorTileCount: 0,
    selectedEligibleMajorTileFraction: 1,
    majorDurableTileCount: 2,
    majorPerennialTileCount: 2,
    majorClosedBasinTileCount: 0,
    majorOceanMouthTileCount: 2,
    projectionSignalStatus: "normal-signal" as const,
    projectionSignalReason: "Representative navigable-river projection.",
  };
}

describe("Hydrology projected-navigable-rivers artifact", () => {
  it("couples chain-length cardinality to chain count rather than map size", () => {
    const valid = projectedNavigableRiverPayload(new Uint16Array([2]));
    expect(
      hydrographyArtifacts.projectedNavigableRivers.validate(valid, {
        dimensions: TEST_DIMENSIONS,
      })
    ).toEqual([]);

    const invalid = projectedNavigableRiverPayload(new Uint16Array([2, 1]));
    expect(
      hydrographyArtifacts.projectedNavigableRivers
        .validate(invalid, { dimensions: TEST_DIMENSIONS })
        .some((issue) => issue.message.includes("selectedChainLengths"))
    ).toBe(true);
  });
});
