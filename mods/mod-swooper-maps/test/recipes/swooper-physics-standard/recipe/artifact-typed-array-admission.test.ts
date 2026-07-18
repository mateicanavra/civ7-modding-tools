import { describe, expect, it } from "bun:test";

import { artifactModules as standardArtifactModules } from "../../../../src/recipes/standard/artifacts/index.js";
import { artifactModules as mapRiversArtifactModules } from "../../../../src/recipes/standard/stages/map-rivers/artifacts/index.js";

const dimensions = { width: 2, height: 2 } as const;

function projectedNavigableRiverPayload(selectedChainLengths: Uint16Array) {
  const tileCount = dimensions.width * dimensions.height;
  return {
    width: dimensions.width,
    height: dimensions.height,
    riverMask: new Uint8Array(tileCount),
    plannedMinorRiverMask: new Uint8Array(tileCount),
    plannedMajorRiverMask: new Uint8Array(tileCount),
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

describe("Standard artifact typed-array admission", () => {
  it("refuses the wrong Foundation tile-to-cell constructor without map dimensions", () => {
    const issues = standardArtifactModules.foundationTileToCellIndex.validate(new Uint32Array([0]));

    expect(issues.some((issue) => issue.message.includes("Int32Array"))).toBe(true);
  });

  it("refuses a grid array whose constructor is correct but map cardinality is not", () => {
    const issues = standardArtifactModules.landmassRegionSlotByTile.validate(
      { slotByTile: new Uint8Array(1) },
      { dimensions }
    );

    expect(
      issues.some((issue) =>
        issue.message.includes(
          "Expected landmassRegionSlotByTile.slotByTile length 4 (received 1)."
        )
      )
    ).toBe(true);
  });

  it("couples selected navigable-river lengths to chain count rather than grid size", () => {
    const valid = projectedNavigableRiverPayload(new Uint16Array([2]));
    expect(
      mapRiversArtifactModules.projectedNavigableRivers.validate(valid, { dimensions })
    ).toEqual([]);

    const invalid = projectedNavigableRiverPayload(new Uint16Array([2, 1]));
    expect(
      mapRiversArtifactModules.projectedNavigableRivers
        .validate(invalid, { dimensions })
        .some((issue) =>
          issue.message.includes("Expected selectedChainLengths length 1 (received 2).")
        )
    ).toBe(true);

    const selectedChainLengthsSchema = mapRiversArtifactModules.projectedNavigableRivers.artifact
      .schema.properties.selectedChainLengths as {
      readonly "x-runtime"?: Readonly<{
        kind?: unknown;
        ctor?: unknown;
        shape?: unknown;
      }>;
    };
    expect(selectedChainLengthsSchema["x-runtime"]?.shape).toBeUndefined();
  });
});
