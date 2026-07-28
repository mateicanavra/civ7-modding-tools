import { describe, expect, it } from "bun:test";
import placementDomain from "../../../../../../src/domain/placement/router.js";
import type { Static } from "@swooper/mapgen-core/authoring";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import { TEST_GAME_SEED } from "../../../../../setup.js";

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
  | "shelfMask"
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
    const input = makeInput(SYNTHETIC_START_DIMENSIONS.grid12x8);
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

    const result = plan(input, (config) => {
      config.minContiguousLandTiles = 20;
      config.minExpansionLandTiles = 10;
      config.minIslandClusterLandTiles = 8;
      config.islandClusterRadiusTiles = 5;
    });

    expect(result.tierCounts.primary).toBe(0);
    expect(result.tierCounts.islandCluster).toBeGreaterThan(0);
    expect(result.candidates.every((candidate) => candidate.tier === "islandCluster")).toBe(true);
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
    // A 5-tile strip: below every tier admission gate (marginal needs 6
    // contiguous at marginalLandRatio 0.5) but still settleable land.
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
    // Three settleable tiles in a tight cluster: floor 2 cannot hold 3 seats.
    addLandmass(input, 0, 1, [
      [2, 2],
      [3, 2],
      [2, 3],
    ]);

    const result = plan(input, (config) => {
      config.spacingFloorTiles = 2;
      config.desiredSpacingTiles = 3;
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
    // Two settleable tiles for three seats: one seat must remain unseated.
    addLandmass(input, 0, 1, [
      [2, 2],
      [5, 4],
    ]);

    const result = plan(input, (config) => {
      config.spacingFloorTiles = 1;
      config.desiredSpacingTiles = 2;
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
