import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";

import placementDomain from "../../src/domain/placement/ops.js";
import { materializeStartAssignment } from "../../src/recipes/standard/stages/placement/steps/assign-starts/materialize.js";
import { validateStartAssignmentArtifact } from "../../src/recipes/standard/stages/placement/steps/assign-starts/validate.js";
import { runOpValidated } from "../support/compiler-helpers.js";

const { planStarts } = placementDomain.ops;

type StartInput = {
  baseStarts: {
    playersLandmass1: number;
    playersLandmass2: number;
  };
  alivePlayerIds?: number[];
  seatBiases?: Array<{ seatIndex: number; river: number; lake: number; adjacentToCoast: number }>;
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
  plannedResourcePlotIndices?: number[];
};

function idx(width: number, x: number, y: number): number {
  return y * width + x;
}

function makeInput(
  width: number,
  height: number,
  playersLandmass1 = 1,
  playersLandmass2 = 0
): StartInput {
  const size = width * height;
  const distanceToCoast = new Uint16Array(size);
  distanceToCoast.fill(0);
  const landmassIdByTile = new Int32Array(size);
  landmassIdByTile.fill(-1);
  return {
    baseStarts: {
      playersLandmass1,
      playersLandmass2,
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
      spacingFloorTiles: 2,
      desiredSpacingTiles: 4,
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
    input.plannedResourcePlotIndices = [supportedPlot];

    const result = plan(input, {
      resourceSupportRadiusTiles: 2,
      resourceSupportWeight: 3,
    });

    expect(result.scoreByTile[supportedPlot]).toBeGreaterThan(result.scoreByTile[unsupportedPlot]);
  });

  it("retains the full component vector on every candidate and seat", () => {
    const input = makeInput(12, 8);
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
    ];
    for (const candidate of result.candidates) {
      for (const key of componentKeys) {
        const value = (candidate.components as Record<string, number>)[key];
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
    const input = makeInput(16, 10, 2, 0);
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 80 }, (_value, i) => [1 + (i % 10), 1 + Math.floor(i / 10)] as const)
    );

    const result = plan(input, { spacingFloorTiles: 3, desiredSpacingTiles: 5 });

    expect(result.status).toBe("full");
    expect(result.seats.length).toBe(2);
    for (const seat of result.seats) {
      expect(seat.rung).toBe("regional");
      expect(seat.status).toBe("full");
      expect(seat.plotIndex).toBeGreaterThanOrEqual(0);
      expect(seat.achievedSpacing).toBeGreaterThanOrEqual(3);
    }
  });

  it("region-reassigns seats whose configured region has zero candidates, recording the reassignment", () => {
    const input = makeInput(16, 10, 1, 1);
    // All land sits in the west region; the east region does not exist on this
    // map, so its seat is reassigned (map-shape reconciliation, not a quality
    // fallback) — recorded as a region relaxation + per-seat flag.
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 80 }, (_value, i) => [1 + (i % 10), 1 + Math.floor(i / 10)] as const)
    );

    const result = plan(input, { spacingFloorTiles: 2, desiredSpacingTiles: 4 });

    const westSeat = result.seats[0]!;
    const eastSeat = result.seats[1]!;
    expect(westSeat.rung).toBe("regional");
    expect(westSeat.status).toBe("full");
    expect(eastSeat.rung).toBe("regional");
    expect(eastSeat.regionSlot).toBe(1);
    expect(eastSeat.status).toBe("degraded");
    expect(eastSeat.imputedFlags).toContain("region-reassigned");
    expect(result.status).toBe("degraded");
    expect(
      result.fairnessReport.relaxations.some(
        (entry) =>
          entry.seatIndex === 1 && entry.kind === "region" && entry.from === 2 && entry.to === 1
      )
    ).toBe(true);
  });

  it("falls back to the open-pool rung when a region has candidates but no spaced capacity left", () => {
    const input = makeInput(20, 10, 0, 2);
    // East region: one compact 3x4 block — admits candidates but cannot hold
    // two seats at a 6-tile floor. West region: a distant block. The second
    // east seat must cross regions on the open-pool rung (a real quality
    // ladder degradation, unlike the zero-candidate reassignment above).
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

    const result = plan(input, {
      minContiguousLandTiles: 12,
      spacingFloorTiles: 6,
      desiredSpacingTiles: 6,
    });

    const first = result.seats[0]!;
    const second = result.seats[1]!;
    expect(first.rung).toBe("regional");
    expect(first.imputedFlags).not.toContain("region-reassigned");
    expect(second.rung).toBe("open-pool");
    expect(second.status).toBe("degraded");
    expect(result.status).toBe("degraded");
    expect(
      result.fairnessReport.relaxations.some(
        (entry) => entry.seatIndex === second.seatIndex && entry.kind === "region"
      )
    ).toBe(true);
  });

  it("uses the scored quality-relaxed rung before relaxing spacing below the floor", () => {
    const input = makeInput(12, 8, 2, 0);
    // A 5-tile strip: below every tier admission gate (marginal needs 6
    // contiguous at marginalLandRatio 0.5) but still settleable land.
    addLandmass(input, 0, 1, [
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
      [5, 1],
    ]);

    const result = plan(input, { spacingFloorTiles: 2, desiredSpacingTiles: 3 });

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
    const input = makeInput(8, 6, 3, 0);
    // Three settleable tiles in a tight cluster: floor 2 cannot hold 3 seats.
    addLandmass(input, 0, 1, [
      [2, 2],
      [3, 2],
      [2, 3],
    ]);

    const result = plan(input, { spacingFloorTiles: 2, desiredSpacingTiles: 3 });

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
    const input = makeInput(8, 6, 3, 0);
    // Two settleable tiles for three seats: one seat must remain unseated.
    addLandmass(input, 0, 1, [
      [2, 2],
      [5, 4],
    ]);

    const result = plan(input, { spacingFloorTiles: 1, desiredSpacingTiles: 2 });

    const unseated = result.seats.filter((seat) => seat.plotIndex < 0);
    expect(unseated.length).toBe(1);
    expect(unseated[0]!.status).toBe("degraded");
    expect(unseated[0]!.imputedFlags).toContain("unseated");
    expect(result.status).toBe("degraded");
  });

  it("is deterministic: identical inputs produce identical seats and fairness report", () => {
    const build = () => {
      const input = makeInput(16, 10, 2, 2);
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
    const a = plan(build(), { spacingFloorTiles: 2, desiredSpacingTiles: 4 });
    const b = plan(build(), { spacingFloorTiles: 2, desiredSpacingTiles: 4 });
    expect(JSON.parse(JSON.stringify(a.seats))).toEqual(JSON.parse(JSON.stringify(b.seats)));
    expect(JSON.parse(JSON.stringify(a.fairnessReport))).toEqual(
      JSON.parse(JSON.stringify(b.fairnessReport))
    );
  });

  it("publishes a fairness report whose verdict matches the worst-pair gap", () => {
    const input = makeInput(16, 10, 2, 2);
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

    const result = plan(input, { spacingFloorTiles: 2, desiredSpacingTiles: 4 });

    expect(result.fairnessReport.parity.length).toBe(result.seats.length);
    const gap = result.fairnessReport.worstPairGap;
    expect(gap).not.toBeNull();
    expect(result.fairnessReport.balanced).toBe((gap as number) <= result.fairnessReport.tolerance);
    const seatedScores = result.seats
      .filter((seat) => seat.plotIndex >= 0)
      .map((seat) => seat.score);
    expect(Math.max(...seatedScores) - Math.min(...seatedScores)).toBeCloseTo(gap as number, 10);
  });

  it("maps seats through the alive-majors read surface and flags slot-index fallbacks", () => {
    const input = makeInput(16, 10, 2, 0);
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 80 }, (_value, i) => [1 + (i % 10), 1 + Math.floor(i / 10)] as const)
    );
    input.alivePlayerIds = [7];

    const result = plan(input, { spacingFloorTiles: 2, desiredSpacingTiles: 4 });

    expect(result.seats[0]!.playerId).toBe(7);
    expect(result.seats[0]!.playerIdSource).toBe("alive-majors");
    expect(result.seats[1]!.playerId).toBe(1);
    expect(result.seats[1]!.playerIdSource).toBe("slot-index");
  });

  it("applies official per-seat start biases through the offline scoring hook", () => {
    const input = makeInput(14, 9, 1, 0);
    // Inland block plus a coastal strip; mark only the strip coastal.
    const tiles: Array<readonly [number, number]> = [];
    for (let y = 1; y < 8; y++) for (let x = 1; x < 9; x++) tiles.push([x, y] as const);
    addLandmass(input, 0, 1, tiles);
    input.coastalLand.fill(0);
    for (let y = 1; y < 8; y++) input.coastalLand[idx(input.width, 1, y)] = 1;

    const neutral = plan(input, { spacingFloorTiles: 0, desiredSpacingTiles: 0 });
    input.seatBiases = [{ seatIndex: 0, river: 0, lake: 0, adjacentToCoast: 200 }];
    const biased = plan(input, {
      spacingFloorTiles: 0,
      desiredSpacingTiles: 0,
      startBiasWeight: 4,
    });

    const coastal = (plotIndex: number) => input.coastalLand[plotIndex] === 1;
    expect(coastal(biased.seats[0]!.plotIndex)).toBe(true);
    // The published score stays seat-independent; bias only steers ranking.
    expect(neutral.scoreByTile.length).toBe(biased.scoreByTile.length);
  });

  it("surfaces imputed inputs in coverage rows and seat flags instead of silently defaulting", () => {
    const input = makeInput(12, 8, 1, 0);
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 48 }, (_value, i) => [1 + (i % 8), 1 + Math.floor(i / 8)] as const)
    );
    (input as Record<string, unknown>).fertility = undefined;
    (input as Record<string, unknown>).aridityIndex = undefined;

    const result = plan(input);

    const fertilityRow = result.inputCoverage.find((row) => row.input === "fertility");
    expect(fertilityRow?.status).toBe("imputed");
    expect(result.seats[0]!.imputedFlags).toContain("fertility-imputed");
    expect(result.seats[0]!.imputedFlags).toContain("climate-imputed");
  });
});

describe("start materializer (thin shell)", () => {
  function contextFor(width: number, height: number) {
    const adapter = createMockAdapter({ width, height });
    const context = createExtendedMapContext({ width, height }, adapter, {
      seed: 1,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    });
    return { adapter, context };
  }

  it("stamps every seated intent via setStartPosition with the op's playerId and validates", () => {
    const input = makeInput(16, 10, 2, 0);
    addLandmass(
      input,
      0,
      1,
      Array.from({ length: 80 }, (_value, i) => [1 + (i % 10), 1 + Math.floor(i / 10)] as const)
    );
    input.alivePlayerIds = [4, 9];
    const planned = plan(input, { spacingFloorTiles: 2, desiredSpacingTiles: 4 });
    const { adapter, context } = contextFor(input.width, input.height);

    const assignment = materializeStartAssignment({ context, plan: planned });

    expect(assignment.assigned).toBe(2);
    expect(adapter.calls.setStartPosition.map((call) => call.playerId).sort()).toEqual([4, 9]);
    expect(
      adapter.calls.setStartPosition.map((call) => call.plotIndex).sort((a, b) => a - b)
    ).toEqual([...assignment.positions].sort((a, b) => a - b));
    expect(validateStartAssignmentArtifact(assignment)).toEqual([]);
    const spacing = hexDistanceOddQPeriodicX(
      assignment.positions[0]!,
      assignment.positions[1]!,
      input.width
    );
    expect(spacing).toBeGreaterThanOrEqual(2);
  });

  it("hard-fails ONLY when literally zero settleable land candidates exist", () => {
    const input = makeInput(8, 6, 1, 0);
    const planned = plan(input); // all-water map
    const { context } = contextFor(input.width, input.height);

    expect(() => materializeStartAssignment({ context, plan: planned })).toThrow(
      /No settleable land candidates/
    );
  });

  it("materializes degraded plans as data (no assign-or-throw)", () => {
    const input = makeInput(8, 6, 3, 0);
    addLandmass(input, 0, 1, [
      [2, 2],
      [5, 4],
    ]);
    const planned = plan(input, { spacingFloorTiles: 1, desiredSpacingTiles: 2 });
    const { adapter, context } = contextFor(input.width, input.height);

    const assignment = materializeStartAssignment({ context, plan: planned });

    expect(assignment.assigned).toBe(2);
    expect(assignment.unseatedCount).toBe(1);
    expect(assignment.status).toBe("degraded");
    expect(adapter.calls.setStartPosition.length).toBe(2);
    expect(validateStartAssignmentArtifact(assignment)).toEqual([]);
  });
});
