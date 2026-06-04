import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { describe, expect, it } from "bun:test";

import placementDomain from "../../src/domain/placement/ops.js";
import { assignStartPositions } from "../../src/recipes/standard/stages/placement/steps/assign-starts/materialize.js";
import { runOpValidated } from "../support/compiler-helpers.js";

const { planStarts } = placementDomain.ops;

type StartInput = {
  baseStarts: {
    playersLandmass1: number;
    playersLandmass2: number;
    startSectorRows: number;
    startSectorCols: number;
    startSectors: unknown[];
  };
  width: number;
  height: number;
  landMask: Uint8Array;
  slotByTile: Uint8Array;
  landmassIdByTile: Int32Array;
  landmassTileCounts: number[];
  coastalLand: Uint8Array;
  distanceToCoast: Uint16Array;
  shelfMask: Uint8Array;
  elevation: Int16Array;
  fertility: Float32Array;
  effectiveMoisture: Float32Array;
  surfaceTemperature: Float32Array;
  aridityIndex: Float32Array;
  riverClass: Uint8Array;
  lakeMask: Uint8Array;
  placedResourcePlotIndices?: number[];
};

function idx(width: number, x: number, y: number): number {
  return y * width + x;
}

function makeInput(width: number, height: number, playersLandmass1 = 1): StartInput {
  const size = width * height;
  const distanceToCoast = new Uint16Array(size);
  distanceToCoast.fill(0);
  const landmassIdByTile = new Int32Array(size);
  landmassIdByTile.fill(-1);
  return {
    baseStarts: {
      playersLandmass1,
      playersLandmass2: 0,
      startSectorRows: 0,
      startSectorCols: 0,
      startSectors: [],
    },
    width,
    height,
    landMask: new Uint8Array(size),
    slotByTile: new Uint8Array(size),
    landmassIdByTile,
    landmassTileCounts: [],
    coastalLand: new Uint8Array(size),
    distanceToCoast,
    shelfMask: new Uint8Array(size),
    elevation: new Int16Array(size),
    fertility: new Float32Array(size).fill(0.55),
    effectiveMoisture: new Float32Array(size).fill(0.55),
    surfaceTemperature: new Float32Array(size).fill(16),
    aridityIndex: new Float32Array(size).fill(0.35),
    riverClass: new Uint8Array(size),
    lakeMask: new Uint8Array(size),
  };
}

function addLandmass(
  input: StartInput,
  landmassId: number,
  slot: 1 | 2,
  tiles: ReadonlyArray<readonly [number, number]>
): void {
  input.landmassTileCounts[landmassId] = tiles.length;
  for (const [x, y] of tiles) {
    const plotIndex = idx(input.width, x, y);
    input.landMask[plotIndex] = 1;
    input.slotByTile[plotIndex] = slot;
    input.landmassIdByTile[plotIndex] = landmassId;
    input.coastalLand[plotIndex] = 1;
  }
}

function plan(input: StartInput, config: Record<string, unknown> = {}) {
  return runOpValidated(planStarts, input, {
    strategy: "default",
    config: {
      minContiguousLandTiles: 12,
      minExpansionLandTiles: 6,
      minIslandClusterLandTiles: 8,
      maxIslandStartCoastDistance: 1,
      minStartSpacingTiles: 4,
      ...config,
    },
  });
}

describe("start viability planning", () => {
  it("rejects single-tile islands when larger expansion land exists", () => {
    const input = makeInput(10, 8);
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 24 }, (_value, i) => [1 + (i % 6), 1 + Math.floor(i / 6)] as const)
    );
    const islandPlot = idx(input.width, 8, 6);
    addLandmass(input, 1, 1, [[8, 6]]);

    const result = plan(input);

    expect(result.candidates.some((candidate) => candidate.plotIndex === islandPlot)).toBe(false);
    expect(result.tierByTile[islandPlot]).toBe(1);
    expect(
      result.rejectionCounts.find((entry) => entry.reason === "single-tile-island")?.count
    ).toBe(1);
    expect(result.tierCounts.primary).toBeGreaterThan(0);
  });

  it("allows intentional archipelago starts when nearby small islands form an expansion cluster", () => {
    const input = makeInput(12, 8);
    addLandmass(input, 0, 1, [[3, 3], [3, 4]]);
    addLandmass(input, 1, 1, [[5, 3], [5, 4]]);
    addLandmass(input, 2, 1, [[7, 3], [7, 4]]);
    addLandmass(input, 3, 1, [[6, 5], [6, 6]]);

    const result = plan(input, {
      minContiguousLandTiles: 20,
      minExpansionLandTiles: 10,
      minIslandClusterLandTiles: 8,
      islandClusterRadiusTiles: 5,
    });

    expect(result.tierCounts.primary).toBe(0);
    expect(result.tierCounts.islandCluster).toBeGreaterThan(0);
    expect(result.candidates.every((candidate) => candidate.tier === "islandCluster")).toBe(true);
  });

  it("orders continent and subcontinent starts ahead of island-cluster fallback starts", () => {
    const input = makeInput(14, 8);
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 30 }, (_value, i) => [1 + (i % 6), 1 + Math.floor(i / 6)] as const)
    );
    addLandmass(input, 1, 1, [[10, 3], [10, 4]]);
    addLandmass(input, 2, 1, [[12, 3], [12, 4]]);
    addLandmass(input, 3, 1, [[11, 5], [11, 6]]);

    const result = plan(input, {
      minIslandClusterLandTiles: 6,
      islandClusterRadiusTiles: 4,
    });

    expect(result.tierCounts.primary).toBeGreaterThan(0);
    expect(result.tierCounts.islandCluster).toBeGreaterThan(0);
    expect(result.candidates[0]?.tier).toBe("primary");
  });

  it("uses nearby placed resources as a start score tie-breaker", () => {
    const input = makeInput(12, 8);
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 48 }, (_value, i) => [1 + (i % 8), 1 + Math.floor(i / 8)] as const)
    );
    const supportedPlot = idx(input.width, 2, 2);
    const unsupportedPlot = idx(input.width, 8, 6);
    input.placedResourcePlotIndices = [supportedPlot];

    const result = plan(input, {
      resourceSupportRadiusTiles: 2,
      resourceSupportWeight: 3,
    });

    expect(result.scoreByTile[supportedPlot]).toBeGreaterThan(result.scoreByTile[unsupportedPlot]);
  });

  it("assigns spaced starts from viable candidates before considering isolated raw land", () => {
    const input = makeInput(12, 8, 2);
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 30 }, (_value, i) => [1 + (i % 6), 1 + Math.floor(i / 6)] as const)
    );
    const islandPlot = idx(input.width, 10, 6);
    addLandmass(input, 1, 1, [[10, 6]]);
    const starts = plan(input, { minStartSpacingTiles: 5 });
    const adapter = createMockAdapter({ width: input.width, height: input.height });
    const context = createExtendedMapContext(
      { width: input.width, height: input.height },
      adapter,
      {
        seed: 1,
        dimensions: { width: input.width, height: input.height },
        latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      }
    );

    const assignment = assignStartPositions({
      context,
      starts,
      slotByTile: input.slotByTile,
    });

    expect(assignment.assigned).toBe(2);
    expect(assignment.desperationAssigned).toBe(0);
    expect(assignment.positions).not.toContain(islandPlot);
    expect(adapter.calls.setStartPosition.map((call) => call.plotIndex)).not.toContain(islandPlot);
  });
});
