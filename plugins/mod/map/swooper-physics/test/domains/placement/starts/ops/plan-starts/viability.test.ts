import { describe, expect, it } from "bun:test";
import placementDomain from "../../../../../../src/domain/placement/router.js";
import type { Static } from "@swooper/mapgen-core/authoring";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import { TEST_GAME_SEED } from "../../../../../setup.js";
import { getHexRadiusIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import standard1337 from "../../../../../recipes/swooper-physics-standard/fixtures/starts/standard-1337.json";
import huge1234 from "../../../../../recipes/swooper-physics-standard/fixtures/starts/huge-1234.json";
import earthlike from "../../../../../../src/maps/configs/swooper-earthlike.config.json";

const { planStarts } = placementDomain.starts.ops;

type PlanStartsInput = Static<(typeof planStarts)["input"]>;

type StartInputField =
  | "width"
  | "height"
  | "landMask"
  | "slotByTile"
  | "landmassIdByTile"
  | "landmassTileCounts"
  | "coastalLand"
  | "distanceToCoast"
  | "firstAgeTransitMask"
  | "elevation"
  | "fertility"
  | "effectiveMoisture"
  | "surfaceTemperature"
  | "aridityIndex"
  | "riverClass"
  | "lakeMask";
type StartInput = PlanStartsInput & Required<Pick<PlanStartsInput, StartInputField>>;

const SYNTHETIC_START_DIMENSIONS = {
  grid8x6: { width: 8, height: 6 },
  grid10x8: { width: 10, height: 8 },
  grid12x8: { width: 12, height: 8 },
  grid14x8: { width: 14, height: 8 },
  grid14x9: { width: 14, height: 9 },
  grid16x10: { width: 16, height: 10 },
  grid20x10: { width: 20, height: 10 },
  grid24x10: { width: 24, height: 10 },
} as const;

function idx(width: number, x: number, y: number): number {
  return y * width + x;
}

function makeInput(
  dimensions: Readonly<{ width: number; height: number }>,
  playerCount = 1
): StartInput {
  const { width, height } = dimensions;
  const size = width * height;
  const distanceToCoast = new Uint16Array(size);
  distanceToCoast.fill(0);
  const landmassIdByTile = new Int32Array(size);
  landmassIdByTile.fill(-1);
  return {
    playerIds: Array.from({ length: playerCount }, (_value, playerId) => playerId),
    gameSeed: TEST_GAME_SEED,
    width,
    height,
    landMask: new Uint8Array(size),
    slotByTile: new Uint8Array(size),
    landmassIdByTile,
    landmassTileCounts: [],
    coastalLand: new Uint8Array(size),
    distanceToCoast,
    firstAgeTransitMask: new Uint8Array(size),
    elevation: new Int16Array(size),
    fertility: new Float32Array(size).fill(0.55),
    effectiveMoisture: new Float32Array(size).fill(0.55),
    surfaceTemperature: new Float32Array(size).fill(16),
    aridityIndex: new Float32Array(size).fill(0.35),
    riverClass: new Uint8Array(size),
    lakeMask: new Uint8Array(size),
    plannedResourcePlotIndices: [],
    resourceSupportRequirements: { supportFloor: 0, supportRadiusTiles: 4, equityTolerance: 8 },
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
    input.firstAgeTransitMask[plotIndex] = 1;
    input.slotByTile[plotIndex] = slot;
    input.landmassIdByTile[plotIndex] = landmassId;
    input.coastalLand[plotIndex] = 1;
  }
}

function addShallowTransit(input: StartInput, tiles: ReadonlyArray<readonly [number, number]>): void {
  for (const [x, y] of tiles) input.firstAgeTransitMask[idx(input.width, x, y)] = 1;
}

function plan(
  input: PlanStartsInput,
  configure?: (config: (typeof planStarts.defaultConfig)["config"]) => void
) {
  const selection = structuredClone(planStarts.defaultConfig);
  selection.config.minContiguousLandTiles = 12;
  selection.config.minExpansionLandTiles = 6;
  selection.config.minIslandClusterLandTiles = 8;
  selection.config.maxIslandStartCoastDistance = 1;
  selection.config.spacingFloorTiles = 2;
  selection.config.desiredSpacingTiles = 4;
  configure?.(selection.config);
  return runAdmittedOperationForTest(planStarts, input, selection);
}

function makePlayerDemandInput(playerIds: readonly number[]): StartInput {
  const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid16x10, playerIds.length);
  addLandmass(
    input,
    0,
    1,
    Array.from({ length: 80 }, (_value, i) => [1 + (i % 10), 1 + Math.floor(i / 10)] as const)
  );
  input.playerIds = [...playerIds];
  return input;
}

function earthlikePlan(
  input: PlanStartsInput,
  configure?: (config: (typeof planStarts.defaultConfig)["config"]) => void
) {
  return plan(input, (config) => {
    Object.assign(config, earthlike.config.placement["assign-starts"].starts.config);
    configure?.(config);
  });
}

describe("reachable first-age expansion admission", () => {
  it("rejects an ocean-bounded three-cell human island and seats the entire ten-player mainland roster", () => {
    const input = makeInput({ width: 106, height: 66 }, 10);
    input.gameSeed = -1526277133;
    const island = [[96, 15], [97, 15], [96, 16]] as const;
    addLandmass(input, 0, 1, island);
    addShallowTransit(input, [[95, 15], [98, 15], [96, 14], [97, 14], [95, 14],
      [95, 16], [97, 16], [98, 16], [96, 17]]);
    addLandmass(input, 1, 2, Array.from({ length: 2500 }, (_value, i) =>
      [10 + (i % 50), 5 + Math.floor(i / 50)] as const));
    input.resourceSupport = new Uint8Array(input.width * input.height);
    for (const [x, y] of island) {
      input.resourceSupport[idx(input.width, x, y)] = 255;
      input.fertility[idx(input.width, x, y)] = 1;
    }
    input.plannedResourcePlotIndices = island.map(([x, y]) => idx(input.width, x, y));
    const before = structuredClone(input);
    const result = earthlikePlan(input, (config) => {
      config.resourceSupportWeight = 4;
      config.fairnessTolerance = 0;
    });

    expect(earthlike.config.placement["assign-starts"].starts.config.minExpansionLandTiles).toBe(14);
    expect(result.playersLandmass1).toBe(0);
    expect(result.playersLandmass2).toBe(10);
    expect(result.seats.every((seat) => seat.plotIndex >= 0 && seat.realizedRegionSlot === 2)).toBe(true);
    expect(result.rejectionCounts).toContainEqual({ reason: "no-reachable-expansion", count: 3 });
    for (const [x, y] of island) {
      const plot = idx(input.width, x, y);
      expect(result.tierByTile[plot]).toBe(1);
      expect(result.scoreByTile[plot]).toBe(0);
    }
    expect(input).toEqual(before);
  });

  it("does not pool a reachable 4/3/2/2/2/1 island chain into a useful land envelope", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid24x10, 2);
    input.gameSeed = -1152948677;
    const islands = [
      [[1, 2], [1, 3], [2, 2], [2, 3]],
      [[4, 2], [4, 3], [4, 4]],
      [[6, 2], [6, 3]],
      [[8, 2], [8, 3]],
      [[10, 2], [10, 3]],
      [[12, 2]],
    ] as const;
    islands.forEach((tiles, id) => addLandmass(input, id, 1, tiles));
    addShallowTransit(input, [[3, 2], [5, 2], [7, 2], [9, 2], [11, 2]]);

    // The old four-tile budget and the topology repair are independent changes.
    const permissive = earthlikePlan(input, (config) => { config.minExpansionLandTiles = 4; });
    expect(permissive.seats.every((seat) => seat.plotIndex >= 0)).toBe(true);
    const result = earthlikePlan(input);
    expect(result.settleableTileCount).toBe(0);
    expect(result.candidateCount).toBe(0);
    expect(result.seats.every((seat) => seat.plotIndex === -1)).toBe(true);
    expect(result.rejectionCounts).toContainEqual({ reason: "no-reachable-expansion", count: 13 });
  });

  it("admits a small island across genuine shallow transit to a useful independent destination", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid20x10);
    addLandmass(input, 0, 1, [[2, 4], [2, 5], [3, 4]]);
    addLandmass(input, 1, 2, Array.from({ length: 20 }, (_value, i) =>
      [8 + (i % 4), 2 + Math.floor(i / 4)] as const));
    addShallowTransit(input, [[4, 4], [5, 4], [6, 4], [7, 4]]);

    const result = earthlikePlan(input);
    const smallIsland = result.candidates.filter((candidate) => candidate.landmassTiles === 3);
    expect(smallIsland).toHaveLength(3);
    expect(smallIsland.every((candidate) => candidate.tier === "islandCluster")).toBe(true);
    // The destination is useful despite being below the old24 quality threshold.
    expect(result.candidates.some((candidate) => candidate.landmassTiles === 20)).toBe(true);
    input.firstAgeTransitMask[idx(input.width, 6, 4)] = 0;
    const broken = earthlikePlan(input);
    expect(broken.candidates.some((candidate) => candidate.landmassTiles === 3)).toBe(false);
    expect(broken.rejectionCounts).toContainEqual({ reason: "no-reachable-expansion", count: 3 });
  });

  it("preserves useful independent islands below the contiguous quality threshold", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid16x10);
    addLandmass(input, 0, 1, Array.from({ length: 20 }, (_value, i) =>
      [3 + (i % 4), 2 + Math.floor(i / 4)] as const));
    const result = earthlikePlan(input);
    expect(result.candidateCount).toBe(20);
    expect(result.seats[0]!.plotIndex).toBeGreaterThanOrEqual(0);
    expect(result.rejectionCounts.some((row) => row.reason === "no-reachable-expansion")).toBe(false);
  });

  it("measures nearby cluster support only on reachable usable land", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid24x10);
    addLandmass(input, 0, 1, Array.from({ length: 20 }, (_value, i) =>
      [2 + (i % 4), 2 + Math.floor(i / 4)] as const));
    addLandmass(input, 1, 2, Array.from({ length: 20 }, (_value, i) =>
      [9 + (i % 4), 2 + Math.floor(i / 4)] as const));
    const center = idx(input.width, 5, 4);
    const nearby = getHexRadiusIndicesOddQ(center, input.width, input.height, 5);
    expect(nearby.some((cell) => input.landmassIdByTile[cell] === 1)).toBe(true);
    const candidate = earthlikePlan(input).candidates.find((tile) => tile.plotIndex === center)!;
    expect(candidate.nearbyClusterLandTiles).toBe(
      nearby.filter((cell) => input.landmassIdByTile[cell] === 0).length
    );
  });

  it("admits a sparse edge that reaches a useful envelope on its own landmass", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid24x10);
    addLandmass(input, 0, 1, [
      ...Array.from({ length: 7 }, (_value, i) => [2 + i, 4] as const),
      ...Array.from({ length: 20 }, (_value, i) => [9 + (i % 4), 2 + Math.floor(i / 4)] as const),
    ]);
    const edge = earthlikePlan(input).candidates.find((tile) => tile.plotIndex === idx(input.width, 2, 4));
    expect(edge).toBeDefined();
    expect(edge!.expansionLandTiles).toBeLessThan(14);
  });

  it("finds useful land over the wrapped X seam using the SDK odd-row topology", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid20x10);
    addLandmass(input, 0, 1, [[18, 4], [18, 5]]);
    addLandmass(input, 1, 2, Array.from({ length: 20 }, (_value, i) =>
      [1 + (i % 4), 2 + Math.floor(i / 4)] as const));
    addShallowTransit(input, [[19, 4], [0, 4]]);
    const result = earthlikePlan(input);
    expect(result.candidates.filter((candidate) => candidate.landmassTiles === 2)).toHaveLength(2);
    input.firstAgeTransitMask[idx(input.width, 0, 4)] = 0;
    expect(earthlikePlan(input).candidates.some((candidate) => candidate.landmassTiles === 2)).toBe(false);
  });

  it("rejects nominally large land whose usable expansion budget is mostly impassable or occupied", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid16x10);
    const tiles = Array.from({ length: 20 }, (_value, i) =>
      [3 + (i % 4), 2 + Math.floor(i / 4)] as const);
    addLandmass(input, 0, 1, tiles);
    input.mountainMask = new Uint8Array(input.width * input.height);
    input.volcanoMask = new Uint8Array(input.width * input.height);
    tiles.slice(3, 13).forEach(([x, y]) => { input.mountainMask![idx(input.width, x, y)] = 1; });
    tiles.slice(13, 16).forEach(([x, y]) => { input.volcanoMask![idx(input.width, x, y)] = 1; });
    input.naturalWonderPlotIndices = tiles.slice(16).map(([x, y]) => idx(input.width, x, y));
    const result = earthlikePlan(input);
    expect(result.settleableTileCount).toBe(0);
    expect(result.seats[0]!.plotIndex).toBe(-1);
    expect(result.rejectionCounts).toContainEqual({ reason: "no-reachable-expansion", count: 3 });
  });

  for (const barrier of ["mountainMask", "volcanoMask"] as const) {
    it(`does not let a known ${barrier} bridge isolated usable fragments`, () => {
      const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid20x10);
      addLandmass(input, 0, 1, [[2, 4], [2, 5], [3, 4]]);
      addLandmass(input, 1, 2, Array.from({ length: 20 }, (_value, i) =>
        [8 + (i % 4), 2 + Math.floor(i / 4)] as const));
      addShallowTransit(input, [[4, 4], [5, 4], [6, 4], [7, 4]]);
      addLandmass(input, 2, 1, [[6, 4]]);
      input[barrier] = new Uint8Array(input.width * input.height);
      input[barrier]![idx(input.width, 6, 4)] = 1;
      const result = earthlikePlan(input);
      expect(result.candidates.some((candidate) => candidate.landmassTiles === 3)).toBe(false);
    });
  }

  it("does not count geometrically nearby usable cells across an impassable split as one envelope", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid16x10);
    const left = Array.from({ length: 8 }, (_value, i) => [2 + (i % 2), 2 + Math.floor(i / 2)] as const);
    const right = Array.from({ length: 8 }, (_value, i) => [5 + (i % 2), 2 + Math.floor(i / 2)] as const);
    const wall = Array.from({ length: 4 }, (_value, i) => [4, 2 + i] as const);
    addLandmass(input, 0, 1, [...left, ...wall, ...right]);
    input.mountainMask = new Uint8Array(input.width * input.height);
    for (const [x, y] of wall) input.mountainMask[idx(input.width, x, y)] = 1;
    const result = earthlikePlan(input);
    expect(result.settleableTileCount).toBe(0);
    expect(result.rejectionCounts).toContainEqual({ reason: "no-reachable-expansion", count: 16 });
  });

  it("cannot reopen geography through quality/spacing fallback or fairness", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid24x10, 3);
    const useful = Array.from({ length: 14 }, (_value, i) =>
      [1 + (i % 4), 1 + Math.floor(i / 4)] as const);
    addLandmass(input, 0, 1, useful);
    addLandmass(input, 1, 2, [[16, 4], [17, 4], [16, 5]]);
    input.fertility.fill(1);
    for (const [x, y] of useful) input.fertility[idx(input.width, x, y)] = 0.1;
    const result = earthlikePlan(input, (config) => {
      config.minContiguousLandTiles = 400;
      config.minIslandClusterLandTiles = 160;
      config.spacingFloorTiles = 12;
      config.desiredSpacingTiles = 12;
      config.fairnessTolerance = 0;
    });
    expect(result.seats.every((seat) => seat.plotIndex >= 0 && seat.realizedRegionSlot === 1)).toBe(true);
    expect(result.seats.some((seat) => seat.rung === "quality-relaxed")).toBe(true);
    expect(result.seats.some((seat) => seat.rung === "spacing-relaxed")).toBe(true);
    expect(result.rejectionCounts).toContainEqual({ reason: "no-reachable-expansion", count: 3 });
  });
});

describe("start viability planning", () => {
  it("rejects single-tile islands when larger expansion land exists", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid10x8);
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
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid20x10);
    addLandmass(input, 0, 1, [
      [3, 3],
      [3, 4],
    ]);
    addLandmass(input, 1, 1, [
      [5, 3],
      [5, 4],
    ]);
    addLandmass(input, 2, 1, [
      [7, 3],
      [7, 4],
    ]);
    addLandmass(input, 3, 1, [
      [6, 5],
      [6, 6],
    ]);
    addLandmass(
      input,
      4,
      2,
      Array.from({ length: 24 }, (_value, i) => [10 + (i % 4), 1 + Math.floor(i / 4)] as const)
    );
    addShallowTransit(input, [[4, 3], [6, 3], [7, 5], [8, 3], [9, 3]]);

    const result = plan(input, (config) => {
      config.minContiguousLandTiles = 20;
      config.minExpansionLandTiles = 10;
      config.minIslandClusterLandTiles = 8;
      config.islandClusterRadiusTiles = 5;
    });

    expect(result.tierCounts.primary).toBeGreaterThan(0);
    expect(result.tierCounts.islandCluster).toBeGreaterThan(0);
    expect(
      result.candidates.filter((candidate) => candidate.landmassTiles < 20)
        .every((candidate) => candidate.tier === "islandCluster")
    ).toBe(true);
  });

  it("orders continent and subcontinent starts ahead of island-cluster fallback starts", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid14x8);
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 30 }, (_value, i) => [1 + (i % 6), 1 + Math.floor(i / 6)] as const)
    );
    addLandmass(input, 1, 1, [
      [10, 3],
      [10, 4],
    ]);
    addLandmass(input, 2, 1, [
      [12, 3],
      [12, 4],
    ]);
    addLandmass(input, 3, 1, [
      [11, 5],
      [11, 6],
    ]);
    addShallowTransit(input, [[7, 3], [8, 3], [9, 3], [11, 3], [12, 5]]);

    const result = plan(input, (config) => {
      config.minIslandClusterLandTiles = 6;
      config.islandClusterRadiusTiles = 4;
    });

    expect(result.tierCounts.primary).toBeGreaterThan(0);
    expect(result.tierCounts.islandCluster).toBeGreaterThan(0);
    expect(result.candidates[0]?.tier).toBe("primary");
  });

  it("uses nearby placed resources as a start score tie-breaker", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid12x8);
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 48 }, (_value, i) => [1 + (i % 8), 1 + Math.floor(i / 8)] as const)
    );
    const supportedPlot = idx(input.width, 2, 2);
    const unsupportedPlot = idx(input.width, 8, 6);
    input.plannedResourcePlotIndices = [supportedPlot];

    const result = plan(input, (config) => {
      config.resourceSupportRadiusTiles = 2;
      config.resourceSupportWeight = 3;
    });

    expect(result.scoreByTile[supportedPlot]).toBeGreaterThan(result.scoreByTile[unsupportedPlot]);
  });

  it("excludes every final natural-wonder footprint plot from start candidacy", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid12x8);
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 48 }, (_value, i) => [1 + (i % 8), 1 + Math.floor(i / 8)] as const)
    );
    const baseline = plan(input);
    const occupiedPlot = baseline.candidates[0]?.plotIndex;
    if (occupiedPlot === undefined)
      throw new Error("Expected at least one admitted start candidate.");

    input.naturalWonderPlotIndices = [occupiedPlot];
    const result = plan(input);

    expect(result.candidates.some((candidate) => candidate.plotIndex === occupiedPlot)).toBe(false);
    expect(result.rejectionCounts.find((entry) => entry.reason === "natural-wonder")?.count).toBe(
      1
    );
  });

  it("retains the full component vector on every candidate and seat", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid12x8);
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 48 }, (_value, i) => [1 + (i % 8), 1 + Math.floor(i / 8)] as const)
    );
    const result = plan(input);
    const componentKeys = [
      "freshwater",
      "fertility",
      "expansion",
      "climate",
      "resource",
      "roughness",
    ] as const satisfies readonly (keyof (typeof result.candidates)[number]["components"])[];
    for (const candidate of result.candidates) {
      for (const key of componentKeys) {
        const value = candidate.components[key];
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
    expect(result.seats.length).toBe(1);
    expect(Object.keys(result.seats[0]!.components).sort()).toEqual([...componentKeys].sort());
  });
});

describe("start selection ladder (op-owned, S4)", () => {
  it("seats regional players with full status at or above the spacing floor", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid16x10, 2);
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 80 }, (_value, i) => [1 + (i % 10), 1 + Math.floor(i / 10)] as const)
    );

    const result = plan(input, (config) => {
      config.spacingFloorTiles = 3;
      config.desiredSpacingTiles = 5;
    });

    expect(result.status).toBe("full");
    expect(result.seats.length).toBe(2);
    for (const seat of result.seats) {
      expect(seat.rung).toBe("regional");
      expect(seat.status).toBe("full");
      expect(seat.plotIndex).toBeGreaterThanOrEqual(0);
      expect(seat.achievedSpacing).toBeGreaterThanOrEqual(3);
    }
  });

  it("allocates zero players to a homeland with no candidates (capacity allocation pre-empts reassignment)", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid16x10, 2);
    // All land sits in the west homeland; the east homeland has no land at all.
    // D2 apportions players by capacity, so east receives 0 players up front —
    // both civs seat cleanly in the west with no zero-candidate reassignment.
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 80 }, (_value, i) => [1 + (i % 10), 1 + Math.floor(i / 10)] as const)
    );

    const result = plan(input, (config) => {
      config.spacingFloorTiles = 2;
      config.desiredSpacingTiles = 4;
    });

    expect(result.seats.length).toBe(2);
    for (const seat of result.seats) {
      expect(seat.regionSlot).toBe(1);
      expect(seat.rung).toBe("regional");
      expect(seat.status).toBe("full");
      expect(seat.imputedFlags).not.toContain("region-reassigned");
    }
    expect(result.status).toBe("full");
    // Allocation pre-empts the zero-candidate reassignment → no region relaxation.
    expect(result.fairnessReport.relaxations.some((entry) => entry.kind === "region")).toBe(false);
    // The op reports the ACTUAL allocation (both players west).
    expect(result.playersLandmass1).toBe(2);
    expect(result.playersLandmass2).toBe(0);
  });

  it("preserves the requested homeland when zero-capacity overflow selects from the other region", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid10x8, 13);
    addLandmass(
      input,
      0,
      2,
      Array.from({ length: 12 }, (_value, i) => [4 + (i % 3), 2 + Math.floor(i / 3)] as const)
    );

    const result = plan(input, (config) => {
      config.spacingFloorTiles = 0;
      config.desiredSpacingTiles = 0;
    });
    const reassigned = result.seats.find((seat) => seat.imputedFlags.includes("region-reassigned"));
    if (!reassigned) throw new Error("Expected one region-reassigned seat.");

    expect(reassigned).toMatchObject({
      regionSlot: 1,
      realizedRegionSlot: 2,
      status: "degraded",
    });
    expect(result.fairnessReport.relaxations).toContainEqual({
      seatIndex: reassigned.seatIndex,
      kind: "region",
      from: 1,
      to: 2,
    });
  });

  it("apportions each homeland a spaceable share by feasibility instead of overloading one (D2)", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid20x10, 2);
    // East homeland: a compact 3x4 block (12 tiles). West homeland: a larger
    // distant block (36 tiles). The legacy fixed 0/2 split forced both seats
    // into the cramped east block (an open-pool degradation); D2 apportions by
    // feasibility so each homeland gets one spaceable, regional seat.
    addLandmass(
      input,
      0,
      2,
      Array.from({ length: 12 }, (_value, i) => [1 + (i % 3), 1 + Math.floor(i / 3)] as const)
    );
    addLandmass(
      input,
      1,
      1,
      Array.from({ length: 36 }, (_value, i) => [10 + (i % 6), 1 + Math.floor(i / 6)] as const)
    );

    const result = plan(input, (config) => {
      config.minContiguousLandTiles = 12;
      config.spacingFloorTiles = 6;
      config.desiredSpacingTiles = 6;
    });

    expect(result.seats.length).toBe(2);
    expect(result.seats.filter((seat) => seat.regionSlot === 1).length).toBe(1);
    expect(result.seats.filter((seat) => seat.regionSlot === 2).length).toBe(1);
    for (const seat of result.seats) {
      expect(seat.rung).toBe("regional");
      expect(seat.status).toBe("full");
    }
    expect(result.status).toBe("full");
  });

  it("degrades over-subscribed seats when a homeland cannot space its forced allocation (degrade-as-data)", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid16x10, 3);
    // One small 12-tile west homeland, 3 players, 6-tile floor: feasibility caps
    // the homeland near 1 well-spaced start, but every player must still seat
    // (never dropped) — the surplus seats degrade through the ladder.
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 12 }, (_value, i) => [1 + (i % 3), 1 + Math.floor(i / 3)] as const)
    );

    const result = plan(input, (config) => {
      config.minContiguousLandTiles = 12;
      config.spacingFloorTiles = 6;
      config.desiredSpacingTiles = 6;
    });

    expect(result.seats.length).toBe(3);
    // Degrade-as-data: every player is seated, none dropped.
    expect(result.seats.every((seat) => seat.plotIndex >= 0)).toBe(true);
    // 12 tiles cannot hold 3 starts 6 apart → at least one seat degrades.
    expect(result.seats.some((seat) => seat.status === "degraded")).toBe(true);
    expect(result.status).toBe("degraded");
  });

  it("uses the scored quality-relaxed rung before relaxing spacing below the floor", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid12x8, 2);
    // A useful independent strip below the quality tiers. Geography stays
    // admitted, while the quality-relaxed rung remains observable.
    addLandmass(input, 0, 1, [
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
      [5, 1],
    ]);

    const result = plan(input, (config) => {
      config.spacingFloorTiles = 2;
      config.desiredSpacingTiles = 3;
      config.minExpansionLandTiles = 5;
      config.minContiguousLandTiles = 20;
      config.minIslandClusterLandTiles = 20;
    });

    expect(result.candidateCount).toBe(0);
    expect(result.settleableTileCount).toBe(5);
    for (const seat of result.seats) {
      expect(seat.plotIndex).toBeGreaterThanOrEqual(0);
      expect(seat.rung).toBe("quality-relaxed");
      expect(seat.status).toBe("degraded");
      expect(seat.tier).toBe("none");
      expect(seat.score).toBeGreaterThan(0);
      expect(seat.achievedSpacing).toBeGreaterThanOrEqual(2);
    }
  });

  it("spacing-relaxed last resort stays scored, goes below the floor only when forced, and never throws", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid8x6, 3);
    // An individually useful compact island: floor 2 cannot hold 3 seats.
    addLandmass(input, 0, 1, [
      [2, 2],
      [3, 2],
      [2, 3],
    ]);

    const result = plan(input, (config) => {
      config.spacingFloorTiles = 2;
      config.desiredSpacingTiles = 3;
      config.minExpansionLandTiles = 3;
    });

    expect(result.seats.length).toBe(3);
    expect(result.seats.every((seat) => seat.plotIndex >= 0)).toBe(true);
    const belowFloor = result.seats.filter((seat) =>
      seat.imputedFlags.includes("spacing-below-floor")
    );
    expect(belowFloor.length).toBeGreaterThan(0);
    // The seat that broke the floor came from the spacing-relaxed last
    // resort; crowded neighbors are flagged too (their pair is below floor).
    expect(result.seats.some((seat) => seat.rung === "spacing-relaxed")).toBe(true);
    for (const seat of belowFloor) {
      expect(seat.status).toBe("degraded");
      expect(seat.score).toBeGreaterThan(0);
    }
  });

  it("records unseated players as degraded data instead of throwing on an exhausted map", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid8x6, 3);
    // Two adjacent useful tiles for three seats: one seat must remain unseated.
    addLandmass(input, 0, 1, [
      [2, 2],
      [3, 2],
    ]);

    const result = plan(input, (config) => {
      config.spacingFloorTiles = 1;
      config.desiredSpacingTiles = 2;
      config.minExpansionLandTiles = 2;
    });

    const unseated = result.seats.filter((seat) => seat.plotIndex < 0);
    expect(unseated.length).toBe(1);
    expect(unseated[0]!.status).toBe("degraded");
    expect(unseated[0]!.realizedRegionSlot).toBe(0);
    expect(unseated[0]!.imputedFlags).toContain("unseated");
    expect(result.status).toBe("degraded");
  });

  it("is deterministic: identical inputs produce identical seats and fairness report", () => {
    const build = () => {
      const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid16x10, 4);
      addLandmass(
        input,
        0,
        1,
        Array.from({ length: 40 }, (_value, i) => [1 + (i % 5), 1 + Math.floor(i / 5)] as const)
      );
      addLandmass(
        input,
        1,
        2,
        Array.from({ length: 40 }, (_value, i) => [9 + (i % 5), 1 + Math.floor(i / 5)] as const)
      );
      return input;
    };
    const configure = (config: (typeof planStarts.defaultConfig)["config"]) => {
      config.spacingFloorTiles = 2;
      config.desiredSpacingTiles = 4;
    };
    const a = plan(build(), configure);
    const b = plan(build(), configure);
    expect(JSON.parse(JSON.stringify(a.seats))).toEqual(JSON.parse(JSON.stringify(b.seats)));
    expect(JSON.parse(JSON.stringify(a.fairnessReport))).toEqual(
      JSON.parse(JSON.stringify(b.fairnessReport))
    );
  });

  it("publishes a fairness report whose verdict matches the worst-pair gap", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid16x10, 4);
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 40 }, (_value, i) => [1 + (i % 5), 1 + Math.floor(i / 5)] as const)
    );
    addLandmass(
      input,
      1,
      2,
      Array.from({ length: 40 }, (_value, i) => [9 + (i % 5), 1 + Math.floor(i / 5)] as const)
    );

    const result = plan(input, (config) => {
      config.spacingFloorTiles = 2;
      config.desiredSpacingTiles = 4;
    });

    expect(result.fairnessReport.parity.length).toBe(result.seats.length);
    const gap = result.fairnessReport.worstPairGap;
    expect(gap).not.toBeNull();
    expect(result.fairnessReport.balanced).toBe((gap as number) <= result.fairnessReport.tolerance);
    const seatedScores = result.seats
      .filter((seat) => seat.plotIndex >= 0)
      .map((seat) => seat.score);
    expect(Math.max(...seatedScores) - Math.min(...seatedScores)).toBeCloseTo(gap as number, 10);
  });

  it("improves weak seats without lowering strong seats to manufacture parity", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid24x10, 2);
    const west = Array.from(
      { length: 48 },
      (_value, i) => [1 + (i % 6), 1 + Math.floor(i / 6)] as const
    );
    const east = Array.from(
      { length: 48 },
      (_value, i) => [15 + (i % 6), 1 + Math.floor(i / 6)] as const
    );
    addLandmass(input, 0, 1, west);
    addLandmass(input, 1, 2, east);
    for (const [x, y] of west) input.fertility[idx(input.width, x, y)] = 0.1;
    for (const [x, y] of east) {
      input.fertility[idx(input.width, x, y)] = x < 18 ? 1 : 0.2;
    }

    const result = plan(input, (config) => {
      config.spacingFloorTiles = 1;
      config.desiredSpacingTiles = 1;
      config.largeLandmassWeight = 0;
      config.fertilityWeight = 4;
      config.resourceSupportWeight = 0;
      config.freshwaterWeight = 0;
      config.climateWeight = 0;
      config.coastalPreferenceWeight = 0;
      config.riverPreferenceWeight = 0;
      config.roughnessPenaltyWeight = 0;
      config.climateExtremePenaltyWeight = 0;
      config.rankingBlend = 1;
      config.fairnessTolerance = 0.35;
    });

    expect(result.fairnessReport.swaps.length).toBeGreaterThan(0);
    expect(result.fairnessReport.swaps.every((swap) => swap.toScore > swap.fromScore)).toBe(true);
    expect(result.fairnessReport.relaxations).toContainEqual({
      seatIndex: 0,
      kind: "region",
      from: 1,
      to: 2,
    });
    expect(result.seats.find(({ seatIndex }) => seatIndex === 0)).toMatchObject({
      regionSlot: 1,
      realizedRegionSlot: 2,
      rung: "open-pool",
      status: "degraded",
    });
    expect(result.fairnessReport.balanced).toBe(true);
  });

  it("preserves the exact admitted player order through seat planning", () => {
    const playerIds = [7, 2, 11, 5];
    const result = plan(makePlayerDemandInput(playerIds));

    expect(result.playersLandmass1 + result.playersLandmass2).toBe(playerIds.length);
    expect(result.seats.map((seat) => seat.playerId)).toEqual(playerIds);
  });

  it("preserves admitted players as explicit degradation when no settleable land exists", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid8x6);
    input.playerIds = [7];
    const result = plan(input);

    expect(result.playersLandmass1 + result.playersLandmass2).toBe(1);
    expect(result.seats).toHaveLength(1);
    expect(result.seats[0]).toMatchObject({
      playerId: 7,
      plotIndex: -1,
      status: "degraded",
    });
  });

  it("uses the game seed only to resolve otherwise-equal player-seat choices", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid14x9);
    const tiles: Array<readonly [number, number]> = [];
    for (let y = 1; y < 8; y++) for (let x = 1; x < 9; x++) tiles.push([x, y] as const);
    addLandmass(input, 0, 1, tiles);

    const configure = (config: (typeof planStarts.defaultConfig)["config"]) => {
      config.spacingFloorTiles = 0;
      config.desiredSpacingTiles = 0;
      config.rankingBlend = 1;
      config.largeLandmassWeight = 0;
      config.fertilityWeight = 0;
      config.resourceSupportWeight = 0;
      config.freshwaterWeight = 0;
      config.climateWeight = 0;
      config.coastalPreferenceWeight = 0;
      config.riverPreferenceWeight = 0;
      config.roughnessPenaltyWeight = 0;
      config.climateExtremePenaltyWeight = 0;
    };
    const first = plan(input, configure);
    const repeated = plan(input, configure);
    input.gameSeed = TEST_GAME_SEED + 1;
    const alternate = plan(input, configure);

    expect(repeated.seats[0]!.plotIndex).toBe(first.seats[0]!.plotIndex);
    expect(alternate.seats[0]!.plotIndex).not.toBe(first.seats[0]!.plotIndex);
  });

  it("surfaces imputed inputs in coverage rows and seat flags instead of silently defaulting", () => {
    const completeInput = makeInput(SYNTHETIC_START_DIMENSIONS.grid12x8);
    addLandmass(
      completeInput,
      0,
      1,
      Array.from({ length: 48 }, (_value, i) => [1 + (i % 8), 1 + Math.floor(i / 8)] as const)
    );
    const input: PlanStartsInput = completeInput;
    input.fertility = undefined;
    input.aridityIndex = undefined;

    const result = plan(input);

    const fertilityRow = result.inputCoverage.find((row) => row.input === "fertility");
    expect(fertilityRow?.status).toBe("imputed");
    expect(result.seats[0]!.imputedFlags).toContain("fertility-imputed");
    expect(result.seats[0]!.imputedFlags).toContain("climate-imputed");
  });
});

describe("resource-backed start admission", () => {
  const supportCounts = (input: PlanStartsInput, seats: readonly { plotIndex: number }[]) => {
    const sites = new Set(input.plannedResourcePlotIndices);
    return seats.map((seat) =>
      seat.plotIndex < 0
        ? 0
        : getHexRadiusIndicesOddQ(
            seat.plotIndex,
            input.width,
            input.height,
            input.resourceSupportRequirements.supportRadiusTiles
          ).filter((plot) => sites.has(plot)).length
    );
  };

  for (const [name, fixture] of [
    ["Standard/1337", standard1337],
    ["Huge/1234", huge1234],
  ] as const) {
    it(`seats the retained ${name} witness from distinct planned sites without resource repair`, () => {
      const { shelfMask: _legacyShelfMask, ...raw } = fixture.input;
      const input = {
        ...raw,
        landMask: Uint8Array.from(raw.landMask),
        slotByTile: Uint8Array.from(raw.slotByTile),
        landmassIdByTile: Int32Array.from(raw.landmassIdByTile),
        coastalLand: Uint8Array.from(raw.coastalLand),
        distanceToCoast: Uint16Array.from(raw.distanceToCoast),
        // These historical resource witnesses retained only dry geography,
        // not resolved coastal-water intent; they prove the dry-land route.
        firstAgeTransitMask: Uint8Array.from(raw.landMask),
        elevation: Int16Array.from(raw.elevation),
        fertility: Float32Array.from(raw.fertility),
        effectiveMoisture: Float32Array.from(raw.effectiveMoisture),
        surfaceTemperature: Float32Array.from(raw.surfaceTemperature),
        aridityIndex: Float32Array.from(raw.aridityIndex),
        riverClass: Uint8Array.from(raw.riverClass),
        lakeMask: Uint8Array.from(raw.lakeMask),
        mountainMask: Uint8Array.from(raw.mountainMask),
        volcanoMask: Uint8Array.from(raw.volcanoMask),
      };
      const before = structuredClone(input);
      const selection = {
        strategy: "viability-fairness" as const,
        config: fixture.selection.config,
      };
      const result = runAdmittedOperationForTest(planStarts, input, selection);
      const counts = supportCounts(input, result.seats);

      expect(result.seats.map((seat) => seat.playerId)).toEqual(input.playerIds);
      expect(result.seats.every((seat) => seat.plotIndex >= 0)).toBe(true);
      expect(Math.min(...counts)).toBeGreaterThanOrEqual(2);
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(2);
      expect(result.seats.every((seat) => seat.achievedSpacing >= 6)).toBe(true);
      expect(result.seats.map((seat) => seat.plotIndex)).not.toContain(
        fixture.formerlyUnsupportedSeat
      );
      expect(input).toEqual(before);
      expect(runAdmittedOperationForTest(planStarts, input, selection)).toEqual(result);
    });
  }

  for (const [name, westFertility, eastFertility, regionalBalanced, preferredCount] of [
    ["prefers fairness over an extra regional seat across resource bands", 0.1, 1, false, 1],
    ["prefers regional seats when both resource bands are balanced", 0.55, 0.6, true, 2],
  ] as const) {
    it(name, () => {
      const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid24x10, 2);
      const lowWest = [
        [2, 2],
        [2, 3],
      ] as const;
      const lowEast = [
        [14, 2],
        [14, 3],
        [14, 6],
        [14, 7],
      ] as const;
      const highWest = [
        [6, 2],
        [6, 3],
      ] as const;
      const highEast = [
        [18, 2],
        [18, 3],
      ] as const;
      addLandmass(input, 0, 1, lowWest);
      addLandmass(input, 1, 2, lowEast);
      addLandmass(input, 2, 1, highWest);
      addLandmass(input, 3, 2, highEast);
      for (const [x, y] of lowWest) input.fertility[idx(input.width, x, y)] = 0.1;
      for (const [x, y] of lowEast) input.fertility[idx(input.width, x, y)] = 1;
      for (const [x, y] of highWest) input.fertility[idx(input.width, x, y)] = westFertility;
      for (const [x, y] of highEast) input.fertility[idx(input.width, x, y)] = eastFertility;
      const lowSites = [idx(input.width, 2, 2), idx(input.width, 14, 2), idx(input.width, 14, 6)];
      const highSites = [...highWest, ...highEast].map(([x, y]) => idx(input.width, x, y));
      input.plannedResourcePlotIndices = [...lowSites, ...highSites];
      input.resourceSupportRequirements = {
        supportFloor: 1,
        supportRadiusTiles: 1,
        equityTolerance: 0,
      };
      const configure = (config: (typeof planStarts.defaultConfig)["config"]) => {
        config.minContiguousLandTiles = 2;
        config.minExpansionLandTiles = 2;
        config.spacingFloorTiles = 2;
        config.desiredSpacingTiles = 2;
        config.largeLandmassWeight = 0;
        config.fertilityWeight = 4;
        config.resourceSupportWeight = 0;
        config.freshwaterWeight = 0;
        config.climateWeight = 0;
        config.coastalPreferenceWeight = 0;
        config.riverPreferenceWeight = 0;
        config.roughnessPenaltyWeight = 0;
        config.climateExtremePenaltyWeight = 0;
        config.rankingBlend = 1;
      };
      const fairBand = plan({ ...input, plannedResourcePlotIndices: lowSites }, configure);
      const regionalBand = plan({ ...input, plannedResourcePlotIndices: highSites }, configure);
      const result = plan(input, configure);

      expect(supportCounts(input, fairBand.seats)).toEqual([1, 1]);
      expect(supportCounts(input, regionalBand.seats)).toEqual([2, 2]);
      for (const band of [fairBand, regionalBand, result]) {
        expect(band.seats.map((seat) => seat.playerId)).toEqual([...input.playerIds]);
        expect(
          band.seats.every((seat) => seat.plotIndex >= 0 && seat.achievedSpacing >= 2)
        ).toBe(true);
      }
      expect(fairBand.fairnessReport.balanced).toBe(true);
      expect(fairBand.seats.map((seat) => seat.rung)).toEqual(["open-pool", "regional"]);
      expect(fairBand.fairnessReport.relaxations).toContainEqual({
        seatIndex: 0,
        kind: "region",
        from: 1,
        to: 2,
      });
      expect(fairBand.seats[0]).toMatchObject({
        regionSlot: 1,
        realizedRegionSlot: 2,
        rung: "open-pool",
        status: "degraded",
      });
      expect(regionalBand.fairnessReport.balanced).toBe(regionalBalanced);
      expect(regionalBand.seats.every((seat) => seat.rung === "regional")).toBe(true);
      expect(Math.min(...fairBand.seats.map((seat) => seat.score))).toBeGreaterThan(
        Math.min(...regionalBand.seats.map((seat) => seat.score))
      );
      const preferredBand = preferredCount === 1 ? fairBand : regionalBand;
      expect(result.seats.map((seat) => seat.plotIndex)).toEqual(
        preferredBand.seats.map((seat) => seat.plotIndex)
      );
      expect(result.seats.map((seat) => seat.rung)).toEqual(
        preferredBand.seats.map((seat) => seat.rung)
      );
      expect(result.fairnessReport.balanced).toBe(true);
      expect(supportCounts(input, result.seats)).toEqual([preferredCount, preferredCount]);
    });
  }

  for (const [name, balancedRegionalBand, preferredCount] of [
    ["compares regional seats against stable requests across resource bands", true, 1],
    ["records a band-local homeland shortfall against the stable request", false, 2],
  ] as const) {
    it(name, () => {
      const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid24x10, 2);
      const regionalWest = [
        [2, 2],
        [2, 3],
      ] as const;
      const regionalEast = [
        [18, 2],
        [18, 3],
      ] as const;
      const westOnly = [
        [6, 2],
        [6, 3],
        [10, 2],
        [10, 3],
      ] as const;
      addLandmass(input, 0, 1, regionalWest);
      addLandmass(input, 1, 2, regionalEast);
      addLandmass(input, 2, 1, westOnly.slice(0, 2));
      addLandmass(input, 3, 1, westOnly.slice(2));
      for (const [x, y] of regionalWest) {
        input.fertility[idx(input.width, x, y)] = balancedRegionalBand ? 0.4 : 0.1;
      }
      for (const [x, y] of regionalEast) {
        input.fertility[idx(input.width, x, y)] = balancedRegionalBand ? 0.4 : 1;
      }
      for (const [x, y] of westOnly) input.fertility[idx(input.width, x, y)] = 0.8;
      input.plannedResourcePlotIndices = [
        idx(input.width, 2, 2),
        idx(input.width, 18, 2),
        ...westOnly.map(([x, y]) => idx(input.width, x, y)),
      ];
      input.resourceSupportRequirements = {
        supportFloor: 1,
        supportRadiusTiles: 1,
        equityTolerance: 0,
      };
      const configure = (config: (typeof planStarts.defaultConfig)["config"]) => {
        config.minContiguousLandTiles = 2;
        config.minExpansionLandTiles = 2;
        config.spacingFloorTiles = 2;
        config.desiredSpacingTiles = 2;
        config.largeLandmassWeight = 0;
        config.fertilityWeight = 4;
        config.resourceSupportWeight = 0;
        config.freshwaterWeight = 0;
        config.climateWeight = 0;
        config.coastalPreferenceWeight = 0;
        config.riverPreferenceWeight = 0;
        config.roughnessPenaltyWeight = 0;
        config.climateExtremePenaltyWeight = 0;
        config.rankingBlend = 1;
      };
      const before = structuredClone(input);
      const result = plan(input, configure);
      const candidateSupport = supportCounts(input, result.candidates);
      const westOnlyCandidates = result.candidates.filter(
        (_tile, index) => candidateSupport[index] === 2
      );

      expect(result.candidates.some((tile) => tile.regionSlot === 1)).toBe(true);
      expect(result.candidates.some((tile) => tile.regionSlot === 2)).toBe(true);
      expect(westOnlyCandidates).toHaveLength(4);
      expect(westOnlyCandidates.every((tile) => tile.regionSlot === 1)).toBe(true);
      expect([result.playersLandmass1, result.playersLandmass2]).toEqual([1, 1]);
      expect(result.seats.map((seat) => seat.regionSlot)).toEqual([1, 2]);
      expect(result.seats.map((seat) => seat.playerId)).toEqual([...input.playerIds]);
      expect(result.seats.every((seat) => seat.achievedSpacing >= 2)).toBe(true);
      expect(result.fairnessReport.balanced).toBe(true);
      expect(supportCounts(input, result.seats)).toEqual([preferredCount, preferredCount]);
      if (balancedRegionalBand) {
        expect(result.seats.map((seat) => seat.realizedRegionSlot)).toEqual([1, 2]);
        expect(
          result.seats.every((seat) => seat.rung === "regional" && seat.status === "full")
        ).toBe(true);
        expect(Math.min(...westOnlyCandidates.map((tile) => tile.score))).toBeGreaterThan(
          Math.max(...result.seats.map((seat) => seat.score))
        );
        expect(result.fairnessReport.relaxations.filter((row) => row.kind === "region")).toEqual(
          []
        );
      } else {
        expect(result.seats.map((seat) => seat.realizedRegionSlot)).toEqual([1, 1]);
        expect(result.seats[1]).toMatchObject({
          regionSlot: 2,
          realizedRegionSlot: 1,
          rung: "regional",
          status: "degraded",
        });
        expect(result.seats[1]!.imputedFlags).toContain("region-reassigned");
        expect(result.fairnessReport.relaxations).toContainEqual({
          seatIndex: 1,
          kind: "region",
          from: 2,
          to: 1,
        });
      }
      expect(input).toEqual(before);
      expect(plan(input, configure)).toEqual(result);
    });
  }

  it("counts overlapping seat radii jointly and deduplicates actual resource plots", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid20x10, 2);
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 120 }, (_value, i) => [1 + (i % 15), 1 + Math.floor(i / 15)] as const)
    );
    input.plannedResourcePlotIndices = [idx(input.width, 8, 5), idx(input.width, 10, 5)];
    input.resourceSupportRequirements = {
      supportFloor: 2,
      supportRadiusTiles: 4,
      equityTolerance: 0,
    };

    const result = plan(input);
    expect(result.seats.every((seat) => seat.plotIndex >= 0)).toBe(true);
    expect(supportCounts(input, result.seats)).toEqual([2, 2]);
    input.plannedResourcePlotIndices.push(...input.plannedResourcePlotIndices);
    expect(plan(input)).toEqual(result);
  });

  it("does not assign an unsupported island a quota from unfiltered regional capacity", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid20x10, 2);
    addLandmass(input, 0, 1, [
      [1, 3],
      [2, 3],
      [2, 4],
    ]);
    addLandmass(
      input,
      1,
      2,
      Array.from({ length: 48 }, (_value, i) => [10 + (i % 6), 1 + Math.floor(i / 6)] as const)
    );
    input.plannedResourcePlotIndices = [idx(input.width, 12, 3), idx(input.width, 14, 5)];
    input.resourceSupportRequirements = {
      supportFloor: 2,
      supportRadiusTiles: 4,
      equityTolerance: 0,
    };

    const result = plan(input);
    expect(result.playersLandmass1).toBe(0);
    expect(result.playersLandmass2).toBe(2);
    expect(result.seats.every((seat) => seat.realizedRegionSlot === 2)).toBe(true);
    expect(supportCounts(input, result.seats)).toEqual([2, 2]);
  });

  it("does not count repeated type alternatives at one plot as support-floor capacity", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid12x8, 2);
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 48 }, (_value, i) => [1 + (i % 8), 1 + Math.floor(i / 8)] as const)
    );
    input.plannedResourcePlotIndices = Array(3).fill(idx(input.width, 4, 3));
    input.resourceSupportRequirements = {
      supportFloor: 2,
      supportRadiusTiles: 4,
      equityTolerance: 2,
    };

    const result = plan(input);
    expect(result.seats.map((seat) => seat.playerId)).toEqual([...input.playerIds]);
    expect(result.seats.every((seat) => seat.plotIndex === -1)).toBe(true);
    expect(
      result.seats.every((seat) => seat.imputedFlags.includes("resource-support-unresolved"))
    ).toBe(true);
    expect(result.status).toBe("degraded");
    expect(
      result.rejectionCounts.find((row) => row.reason === "resource-support-floor")?.count
    ).toBe(48);
  });

  it("does not alias out-of-grid integer indices into distinct planned resource sites", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid12x8, 2);
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 48 }, (_value, i) => [1 + (i % 8), 1 + Math.floor(i / 8)] as const)
    );
    input.plannedResourcePlotIndices = [0];
    input.resourceSupportRequirements = {
      supportFloor: 2,
      supportRadiusTiles: 4,
      equityTolerance: 2,
    };
    const oneResource = plan(input);
    input.plannedResourcePlotIndices.push(4294967296);

    const result = plan(input);
    expect(result).toEqual(oneResource);
    expect(result.seats.every((seat) => seat.plotIndex === -1)).toBe(true);
    expect(
      result.rejectionCounts.find((entry) => entry.reason === "resource-support-floor")?.count
    ).toBe(48);
  });

  it("records an unseated player when individually supported sites have no complete equity band", () => {
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid24x10, 2);
    addLandmass(input, 0, 1, [[2, 4], [2, 3]]);
    addLandmass(input, 1, 2, [[16, 4], [15, 4]]);
    input.plannedResourcePlotIndices = [
      idx(input.width, 3, 4),
      idx(input.width, 2, 5),
      idx(input.width, 15, 4),
      idx(input.width, 16, 3),
      idx(input.width, 17, 4),
      idx(input.width, 16, 5),
    ];
    input.resourceSupportRequirements = {
      supportFloor: 2,
      supportRadiusTiles: 1,
      equityTolerance: 0,
    };

    const result = plan(input, (config) => {
      config.minExpansionLandTiles = 2;
    });
    expect(result.seats.map((seat) => seat.playerId)).toEqual([...input.playerIds]);
    expect(result.seats.filter((seat) => seat.plotIndex >= 0)).toHaveLength(1);
    expect(
      result.seats.filter((seat) => seat.imputedFlags.includes("resource-support-unresolved"))
    ).toHaveLength(1);
    expect(result.status).toBe("degraded");
  });
});
