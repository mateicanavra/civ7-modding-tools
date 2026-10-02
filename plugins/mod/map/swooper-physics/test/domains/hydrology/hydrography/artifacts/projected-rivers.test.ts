import { describe, expect, it } from "bun:test";

import { artifacts as hydrographyArtifacts } from "../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const TEST_DIMENSIONS = TEST_MAP_SIZE.dimensions;
const TEST_CARDINALITY = TEST_DIMENSIONS.width * TEST_DIMENSIONS.height;

describe("Hydrology projected-rivers artifact", () => {
  it("refuses complete retired quota-based river intent instead of admitting another physical model", () => {
    const retired = {
      model: "legacy-sink-budget",
      ...TEST_DIMENSIONS,
      riverMask: new Uint8Array(TEST_CARDINALITY),
      nativeMinorRiverMask: new Uint8Array(TEST_CARDINALITY),
      plannedMinorRiverMask: new Uint8Array(TEST_CARDINALITY),
      plannedMajorRiverMask: new Uint8Array(TEST_CARDINALITY),
      selectedTileCount: 0,
      eligibleTileCount: 0,
      plannedMinorRiverTileCount: 0,
      plannedMajorRiverTileCount: 0,
      candidateEndpointCount: 0,
      selectedChainCount: 0,
      selectedChainLengths: new Uint16Array(0),
      longestSelectedChainLength: 0,
      meanSelectedChainLength: 0,
      targetTileCount: 0,
      targetMajorTileFraction: 0,
      selectedEndpointDischargeFloor: 0,
      nonProjectableMajorTileCount: 0,
      unselectedEligibleMajorTileCount: 0,
      selectedEligibleMajorTileFraction: 0,
      majorDurableTileCount: 0,
      majorPerennialTileCount: 0,
      majorClosedBasinTileCount: 0,
      majorOceanMouthTileCount: 0,
      projectionSignalStatus: "arid-low-signal",
      projectionSignalReason: "Retired empty quota-based evidence.",
    };
    expect(
      hydrographyArtifacts.projectedRivers.validate(retired, { dimensions: TEST_DIMENSIONS }).length
    ).toBeGreaterThan(0);
  });
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
      wetTransitionWrites: [],
      wetTransitionDispositions: [],
    };
    const validate = (value: unknown) => hydrographyArtifacts.projectedRivers.validate(value, { dimensions: TEST_DIMENSIONS });
    expect(validate(valid)).toEqual([]);
    expect(validate({ ...valid, model: "legacy-sink-budget" }).length).toBeGreaterThan(0);
    expect(validate({ ...valid, selectedChainLengths: Uint16Array.of(2) }).length).toBeGreaterThan(0);
    expect(validate({ ...valid, writes: valid.writes.slice(0, 1) }).length).toBeGreaterThan(0);
    expect(validate({ ...valid, writes: [valid.writes[0], valid.writes[0]] }).length).toBeGreaterThan(0);
    expect(validate({ ...valid, nativeMinorRiverMask: new Uint8Array(TEST_CARDINALITY) }).length).toBeGreaterThan(0);
    expect(validate({ ...valid, targetTileCount: 2 }).length).toBeGreaterThan(0);
    const wet = { bodyId: 7, role: "outlet", sourceCell: 3, receiverCell: 2, direction: "WEST", riverClass: "NAVIGABLE" };
    const disposition = { bodyId: 7, transportKind: "internal", wetCell: 3, adjacentCell: 2, outwardDischarge: 1, disposition: "authored" };
    const withWet = { ...valid, wetTransitionWrites: [wet], wetTransitionDispositions: [disposition] };
    expect(validate(withWet)).toEqual([]);
    const secondWetSource = TEST_DIMENSIONS.width + 2;
    expect(validate({ ...withWet, wetTransitionWrites: [wet, { ...wet, sourceCell: secondWetSource, direction: "SOUTHWEST" }],
      wetTransitionDispositions: [disposition, { ...disposition, wetCell: secondWetSource }] })).toEqual([]);
    for (const wrongDirection of [
      { ...withWet, writes: [{ ...valid.writes[0], direction: "WEST" }, valid.writes[1]] },
      { ...withWet, wetTransitionWrites: [{ ...wet, direction: "EAST" }] },
    ]) expect(validate(wrongDirection).some((issue) => issue.message.includes("recorded adjacent receiver"))).toBe(true);
    for (const nonadjacent of [
      { ...withWet, writes: [{ ...valid.writes[0], receiverCell: 4 }, valid.writes[1]] },
      { ...withWet, wetTransitionWrites: [{ ...wet, sourceCell: 4 }], wetTransitionDispositions: [{ ...disposition, wetCell: 4 }] },
      { ...withWet, wetTransitionDispositions: [disposition, { ...disposition, wetCell: 7, outwardDischarge: -1, disposition: "inward-or-zero" }] },
    ]) expect(validate(nonadjacent).some((issue) => issue.message.includes("actual adjacent map-grid edges"))).toBe(true);
    for (const invalid of [
      [wet, wet],
      [{ ...wet, sourceCell: 2 }],
      [{ ...wet, receiverCell: 1 }],
      [{ ...wet, sourceCell: TEST_CARDINALITY }],
      [{ ...wet, receiverCell: TEST_CARDINALITY }],
      [{ ...wet, receiverCell: 3 }],
      [{ ...wet, bodyId: 0 }],
      [{ ...wet, riverClass: "MINOR" }],
      [{ ...wet, role: "inlet" }],
    ]) expect(validate({ ...withWet, wetTransitionWrites: invalid }).length).toBeGreaterThan(0);
    for (const invalid of [
      [], [disposition, disposition], [{ ...disposition, outwardDischarge: 0 }],
      [{ ...disposition, disposition: "inward-or-zero" }],
      [{ ...disposition, disposition: "receiver-not-dry-nav" }],
      [{ ...disposition, disposition: "same-source-secondary" }],
      [{ ...disposition, wetCell: 2 }], [{ ...disposition, outwardDischarge: Number.NaN }],
    ]) expect(validate({ ...withWet, wetTransitionDispositions: invalid }).length).toBeGreaterThan(0);
  });
});
