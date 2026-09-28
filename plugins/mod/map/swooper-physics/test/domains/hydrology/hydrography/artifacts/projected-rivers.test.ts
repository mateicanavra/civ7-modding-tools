import { describe, expect, it } from "bun:test";

import { artifacts as hydrographyArtifacts } from "../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const TEST_DIMENSIONS = TEST_MAP_SIZE.dimensions;
const TEST_CARDINALITY = TEST_DIMENSIONS.width * TEST_DIMENSIONS.height;

function projectedNavigableRiverPayload(selectedChainLengths: Uint16Array) {
  return {
    model: "legacy-sink-budget" as const,
    ...TEST_DIMENSIONS,
    riverMask: new Uint8Array(TEST_CARDINALITY),
    nativeMinorRiverMask: new Uint8Array(TEST_CARDINALITY),
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

describe("Hydrology projected-rivers artifact", () => {
  it("admits only complete uniquely written certified source masks without legacy quotas", () => {
    const minor = new Uint8Array(TEST_CARDINALITY);
    const major = new Uint8Array(TEST_CARDINALITY);
    minor[1] = 1;
    major[2] = 1;
    const valid = {
      model: "certified-sill-spill" as const, ...TEST_DIMENSIONS,
      nativeMinorRiverMask: minor, plannedMinorRiverMask: minor,
      riverMask: major, plannedMajorRiverMask: major,
      plannedMinorRiverTileCount: 1, plannedMajorRiverTileCount: 1, authoredSourceCount: 2,
      writes: [
        { sourceCell: 1, receiverCell: 2, direction: "EAST" as const, riverClass: "MINOR" as const },
        { sourceCell: 2, receiverCell: 3, direction: "EAST" as const, riverClass: "NAVIGABLE" as const },
      ],
    };
    const validate = (value: unknown) => hydrographyArtifacts.projectedRivers.validate(value, { dimensions: TEST_DIMENSIONS });
    expect(validate(valid)).toEqual([]);
    expect(validate({ ...valid, writes: valid.writes.slice(0, 1) }).length).toBeGreaterThan(0);
    expect(validate({ ...valid, writes: [valid.writes[0], valid.writes[0]] }).length).toBeGreaterThan(0);
    expect(validate({ ...valid, nativeMinorRiverMask: new Uint8Array(TEST_CARDINALITY) }).length).toBeGreaterThan(0);
    expect(validate({ ...valid, targetTileCount: 2 }).length).toBeGreaterThan(0);
  });
  it("couples chain-length cardinality to chain count rather than map size", () => {
    const valid = projectedNavigableRiverPayload(new Uint16Array([2]));
    expect(
      hydrographyArtifacts.projectedRivers.validate(valid, {
        dimensions: TEST_DIMENSIONS,
      })
    ).toEqual([]);

    const invalid = projectedNavigableRiverPayload(new Uint16Array([2, 1]));
    expect(
      hydrographyArtifacts.projectedRivers
        .validate(invalid, { dimensions: TEST_DIMENSIONS })
        .some((issue) => issue.message.includes("selectedChainLengths"))
    ).toBe(true);
  });
});
