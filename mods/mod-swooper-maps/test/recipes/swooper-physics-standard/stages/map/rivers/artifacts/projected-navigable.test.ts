import { describe, expect, it } from "bun:test";

import { artifactModules as mapRiversArtifactModules } from "../../../../../../../src/recipes/standard/stages/map-rivers/artifacts/index.js";

const SYNTHETIC_DIMENSIONS = { width: 2, height: 2 } as const;
const SYNTHETIC_CARDINALITY = SYNTHETIC_DIMENSIONS.width * SYNTHETIC_DIMENSIONS.height;

function projectedNavigableRiverPayload(selectedChainLengths: Uint16Array) {
  return {
    ...SYNTHETIC_DIMENSIONS,
    riverMask: new Uint8Array(SYNTHETIC_CARDINALITY),
    plannedMinorRiverMask: new Uint8Array(SYNTHETIC_CARDINALITY),
    plannedMajorRiverMask: new Uint8Array(SYNTHETIC_CARDINALITY),
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

describe("map-rivers projected-navigable-rivers artifact", () => {
  it("couples chain-length cardinality to chain count rather than map size", () => {
    const valid = projectedNavigableRiverPayload(new Uint16Array([2]));
    expect(
      mapRiversArtifactModules.projectedNavigableRivers.validate(valid, {
        dimensions: SYNTHETIC_DIMENSIONS,
      })
    ).toEqual([]);

    const invalid = projectedNavigableRiverPayload(new Uint16Array([2, 1]));
    expect(
      mapRiversArtifactModules.projectedNavigableRivers
        .validate(invalid, { dimensions: SYNTHETIC_DIMENSIONS })
        .some((issue) => issue.message.includes("selectedChainLengths"))
    ).toBe(true);
  });
});
