import { describe, expect, it } from "bun:test";

import resources from "@mapgen/domain/resources/ops";
import { getHexRadiusIndicesOddQ, hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";

import { runOpValidated } from "../support/compiler-helpers.js";

const WIDTH = 24;
const HEIGHT = 14;
const SIZE = WIDTH * HEIGHT;

type PlanIntent = {
  plotIndex: number;
  x: number;
  y: number;
  resourceType: string;
  resourceTypeId: number;
  family: "aquatic" | "cultivated" | "terrestrial" | "geological";
  laneId: string;
  laneKind: "land" | "water";
  phase: "rotation" | "range-floor" | "region-minimum";
  order: number;
  regionSlot: number;
  landmassId: number;
  inHabitat: boolean;
};

type AdjustResult = {
  plannedCount: number;
  moveCount: number;
  addCount: number;
  intents: ReadonlyArray<
    PlanIntent & {
      phase: PlanIntent["phase"] | "support";
      support?: {
        action: "move" | "add";
        reason: "support-floor" | "support-equity";
        seatIndex: number;
        fromPlotIndex?: number;
      };
    }
  >;
  adjustments: ReadonlyArray<{
    action: "move" | "add";
    reason: "support-floor" | "support-equity";
    resourceType: string;
    fromPlotIndex?: number;
    toPlotIndex: number;
    seatIndex: number;
  }>;
  shortfalls: ReadonlyArray<{ seatIndex: number; reason: string; missing: number }>;
  perStart: ReadonlyArray<{
    seatIndex: number;
    plotIndex: number;
    supportBefore: number;
    supportAfter: number;
  }>;
  equity: { gapBefore: number | null; gapAfter: number | null; tolerance: number };
};

function plotAt(x: number, y: number): number {
  return y * WIDTH + x;
}

function intentAt(args: {
  x: number;
  y: number;
  resourceType: string;
  resourceTypeId: number;
  order: number;
  inHabitat?: boolean;
}): PlanIntent {
  const plotIndex = plotAt(args.x, args.y);
  return {
    plotIndex,
    x: args.x,
    y: args.y,
    resourceType: args.resourceType,
    resourceTypeId: args.resourceTypeId,
    family: "geological",
    laneId: "probe",
    laneKind: "land",
    phase: "rotation",
    order: args.order,
    regionSlot: args.x < WIDTH / 2 ? 1 : 2,
    landmassId: 0,
    inHabitat: args.inHabitat ?? true,
  };
}

function perTypeRow(args: {
  resourceType: string;
  resourceTypeId: number;
  plannedCount: number;
  minCount: number;
  maxCount: number;
  spacingFloorTiles?: number;
}) {
  return {
    resourceType: args.resourceType,
    resourceTypeId: args.resourceTypeId,
    family: "geological" as const,
    laneId: "probe",
    laneKind: "land" as const,
    weight: 10,
    effectiveWeight: 1,
    authoredTargetCount: args.plannedCount,
    effectiveTargetCount: args.plannedCount,
    minCount: args.minCount,
    maxCount: args.maxCount,
    spacingFloorTiles: args.spacingFloorTiles ?? 4,
    habitatTileCount: SIZE,
    legalTileCount: SIZE,
    eligibleTileCount: SIZE,
    plannedCount: args.plannedCount,
    rotationCount: args.plannedCount,
    rangeFloorCount: 0,
    regionMinimumCount: 0,
    shortfalls: [],
  };
}

function buildInput(args: {
  intents: PlanIntent[];
  perType: ReturnType<typeof perTypeRow>[];
  starts: Array<{ seatIndex: number; playerId: number; plotIndex: number }>;
  regionMinimums?: Array<{
    resourceType: string;
    regionSlot: number;
    required: number;
    fromRotation: number;
    forced: number;
    shortfall: number;
  }>;
  affinityRules?: Array<{
    resourceA: string;
    resourceB: string;
    relation: "affinity" | "exclusion";
    radiusTiles: number;
  }>;
  legalMaskByType?: Record<string, Uint8Array>;
}) {
  const allOnes = new Uint8Array(SIZE).fill(1);
  const intensity = new Float32Array(SIZE).fill(1);
  const regionSlotByTile = new Uint8Array(SIZE);
  for (let i = 0; i < SIZE; i++) {
    regionSlotByTile[i] = i % WIDTH < WIDTH / 2 ? 1 : 2;
  }
  return {
    seed: 1337,
    plan: {
      width: WIDTH,
      height: HEIGHT,
      seed: 1337,
      plannedCount: args.intents.length,
      rotationCount: args.intents.length,
      rangeFloorCount: 0,
      regionMinimumCount: 0,
      siteSpacingTiles: 3,
      equitySkippedSiteCount: 0,
      intents: args.intents,
      perType: args.perType,
      regionMinimums: args.regionMinimums ?? [],
      settings: {
        density: 1,
        sparsity: 0,
        rarityFidelity: 1,
        perTypeSpacingFloorScale: 1,
        equityMaxDensityRatio: 1.8,
        affinityRuleCount: (args.affinityRules ?? []).length,
        affinityRules: args.affinityRules ?? [],
      },
    },
    eligibility: args.perType.map((row) => ({
      resourceType: row.resourceType,
      resourceTypeId: row.resourceTypeId,
      habitatMask: allOnes,
      legalMask: args.legalMaskByType?.[row.resourceType] ?? allOnes,
      intensity,
    })),
    starts: args.starts,
    landmassIdByTile: new Int32Array(SIZE),
    landmassTileCounts: [SIZE],
    regionSlotByTile,
  };
}

function run(
  input: ReturnType<typeof buildInput>,
  config: Record<string, unknown> = {}
): AdjustResult {
  return runOpValidated(resources.ops.adjustResourceSupport, input as never, {
    strategy: "default",
    config,
  }) as unknown as AdjustResult;
}

function supportCount(intents: AdjustResult["intents"], seatPlot: number, radius: number): number {
  const zone = new Set(getHexRadiusIndicesOddQ(seatPlot, WIDTH, HEIGHT, radius));
  return intents.filter((intent) => zone.has(intent.plotIndex)).length;
}

/** Two seats: one inside a NW site cluster, one in the empty SE corner. */
function clusterScenario(args?: { maxCountA?: number }) {
  const intents = [
    intentAt({ x: 1, y: 1, resourceType: "RESOURCE_A", resourceTypeId: 901, order: 0 }),
    intentAt({ x: 5, y: 1, resourceType: "RESOURCE_A", resourceTypeId: 901, order: 1 }),
    intentAt({ x: 1, y: 5, resourceType: "RESOURCE_A", resourceTypeId: 901, order: 2 }),
    intentAt({ x: 5, y: 5, resourceType: "RESOURCE_A", resourceTypeId: 901, order: 3 }),
    intentAt({ x: 9, y: 1, resourceType: "RESOURCE_A", resourceTypeId: 901, order: 4 }),
    intentAt({ x: 9, y: 5, resourceType: "RESOURCE_A", resourceTypeId: 901, order: 5 }),
  ];
  return buildInput({
    intents,
    perType: [
      perTypeRow({
        resourceType: "RESOURCE_A",
        resourceTypeId: 901,
        plannedCount: intents.length,
        minCount: 2,
        maxCount: args?.maxCountA ?? intents.length,
      }),
    ],
    starts: [
      { seatIndex: 0, playerId: 0, plotIndex: plotAt(3, 3) },
      { seatIndex: 1, playerId: 1, plotIndex: plotAt(20, 11) },
    ],
  });
}

describe("adjust-resource-support operation contract", () => {
  it("fills every start to the support floor via count-preserving moves with typed provenance (E3.1)", () => {
    const input = clusterScenario();
    const result = run(input);

    for (const seat of result.perStart) {
      expect(seat.supportAfter, `seat ${seat.seatIndex} support`).toBeGreaterThanOrEqual(2);
      expect(supportCount(result.intents, seat.plotIndex, 4)).toBe(seat.supportAfter);
    }

    // Moves only (maxCount has no headroom): per-type counts are preserved.
    expect(result.addCount).toBe(0);
    expect(result.moveCount).toBeGreaterThan(0);
    expect(result.plannedCount).toBe(input.plan.intents.length);
    expect(result.intents.filter((row) => row.resourceType === "RESOURCE_A").length).toBe(6);

    // Typed provenance per adjusted site.
    for (const adjustment of result.adjustments) {
      expect(adjustment.reason).toMatch(/^support-(floor|equity)$/);
      const moved = result.intents.find((row) => row.plotIndex === adjustment.toPlotIndex);
      expect(moved?.support?.action).toBe(adjustment.action);
      if (adjustment.action === "move") {
        expect(moved?.support?.fromPlotIndex).toBe(adjustment.fromPlotIndex!);
      }
    }
    expect(result.shortfalls).toEqual([]);
  });

  it("preserves S3 invariants: unique plots, per-type spacing floors, cross-type clearance", () => {
    const result = run(clusterScenario());

    const plots = result.intents.map((row) => row.plotIndex);
    expect(new Set(plots).size).toBe(plots.length);

    // Per-type same-type spacing floor (4 here) holds on the adjusted set.
    const aPlots = result.intents
      .filter((row) => row.resourceType === "RESOURCE_A")
      .map((row) => row.plotIndex);
    for (let i = 0; i < aPlots.length; i++) {
      for (let j = i + 1; j < aPlots.length; j++) {
        expect(
          hexDistanceOddQPeriodicX(aPlots[i]!, aPlots[j]!, WIDTH),
          `pair ${aPlots[i]}/${aPlots[j]}`
        ).toBeGreaterThanOrEqual(4);
      }
    }

    // Cross-type adjacency clearance (force-pass convention).
    for (let i = 0; i < plots.length; i++) {
      for (let j = i + 1; j < plots.length; j++) {
        expect(hexDistanceOddQPeriodicX(plots[i]!, plots[j]!, WIDTH)).toBeGreaterThanOrEqual(2);
      }
    }

    // Sites never land on a seat plot.
    expect(plots).not.toContain(plotAt(3, 3));
    expect(plots).not.toContain(plotAt(20, 11));
  });

  it("shrinks the cross-player support gap within the equity tolerance (E3.2)", () => {
    const result = run(clusterScenario());
    expect(result.equity.gapBefore).toBeGreaterThan(2);
    expect(result.equity.gapAfter).toBeLessThanOrEqual(2);
    const counts = result.perStart.map((seat) => seat.supportAfter);
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(2);
  });

  it("records typed shortfalls instead of forcing when no movable source or headroom exists", () => {
    // All sites sit inside the rich seat's radius (so a move would strip its
    // own support guard) and region minimums pin type A to the west; no
    // maxCount headroom for adds.
    const intents = [
      intentAt({ x: 2, y: 2, resourceType: "RESOURCE_A", resourceTypeId: 901, order: 0 }),
      intentAt({ x: 6, y: 2, resourceType: "RESOURCE_A", resourceTypeId: 901, order: 1 }),
    ];
    const input = buildInput({
      intents,
      perType: [
        perTypeRow({
          resourceType: "RESOURCE_A",
          resourceTypeId: 901,
          plannedCount: 2,
          minCount: 2,
          maxCount: 2,
        }),
      ],
      starts: [
        { seatIndex: 0, playerId: 0, plotIndex: plotAt(4, 2) },
        { seatIndex: 1, playerId: 1, plotIndex: plotAt(20, 11) },
      ],
      regionMinimums: [
        {
          resourceType: "RESOURCE_A",
          regionSlot: 1,
          required: 2,
          fromRotation: 2,
          forced: 0,
          shortfall: 0,
        },
      ],
    });
    const result = run(input);

    // The plan is untouched and the deficit is recorded, not forced.
    expect(result.moveCount + result.addCount).toBe(0);
    expect(result.intents.map((row) => row.plotIndex).sort()).toEqual(
      intents.map((row) => row.plotIndex).sort()
    );
    const seatOne = result.shortfalls.filter((row) => row.seatIndex === 1);
    expect(seatOne.length).toBeGreaterThan(0);
    expect(
      seatOne.every((row) =>
        [
          "no-movable-site",
          "no-legal-tile-in-radius",
          "spacing-floor-preserved",
          "equity-unresolvable",
          "adjustment-budget-exhausted",
        ].includes(row.reason)
      )
    ).toBe(true);
  });

  it("adds within maxCount headroom when moves are blocked, with support phase provenance", () => {
    const intents = [
      intentAt({ x: 2, y: 2, resourceType: "RESOURCE_A", resourceTypeId: 901, order: 0 }),
      intentAt({ x: 6, y: 2, resourceType: "RESOURCE_A", resourceTypeId: 901, order: 1 }),
    ];
    const input = buildInput({
      intents,
      perType: [
        perTypeRow({
          resourceType: "RESOURCE_A",
          resourceTypeId: 901,
          plannedCount: 2,
          minCount: 2,
          maxCount: 6,
        }),
      ],
      starts: [
        { seatIndex: 0, playerId: 0, plotIndex: plotAt(4, 2) },
        { seatIndex: 1, playerId: 1, plotIndex: plotAt(20, 11) },
      ],
    });
    const result = run(input);

    expect(result.addCount).toBeGreaterThan(0);
    const aCount = result.intents.filter((row) => row.resourceType === "RESOURCE_A").length;
    expect(aCount).toBeLessThanOrEqual(6);
    const added = result.intents.filter((row) => row.phase === "support");
    expect(added.length).toBe(result.addCount);
    for (const intent of added) {
      expect(intent.support?.action).toBe("add");
    }
    const poor = result.perStart.find((seat) => seat.seatIndex === 1)!;
    expect(poor.supportAfter).toBeGreaterThanOrEqual(2);
  });

  it("respects exclusion rules and per-type policy legality at adjusted destinations", () => {
    // Type B owns the poor seat's neighborhood via an exclusion rule, and
    // type A is policy-illegal in the seat zone except two tiles.
    const legalA = new Uint8Array(SIZE).fill(1);
    const poorSeatPlot = plotAt(20, 11);
    for (const idx of getHexRadiusIndicesOddQ(poorSeatPlot, WIDTH, HEIGHT, 4)) {
      legalA[idx] = 0;
    }
    legalA[plotAt(18, 9)] = 1;
    legalA[plotAt(22, 13)] = 1;

    const intents = [
      intentAt({ x: 1, y: 1, resourceType: "RESOURCE_A", resourceTypeId: 901, order: 0 }),
      intentAt({ x: 5, y: 1, resourceType: "RESOURCE_A", resourceTypeId: 901, order: 1 }),
      intentAt({ x: 1, y: 5, resourceType: "RESOURCE_A", resourceTypeId: 901, order: 2 }),
      intentAt({ x: 5, y: 5, resourceType: "RESOURCE_A", resourceTypeId: 901, order: 3 }),
      intentAt({ x: 9, y: 1, resourceType: "RESOURCE_B", resourceTypeId: 902, order: 4 }),
      intentAt({ x: 20, y: 8, resourceType: "RESOURCE_B", resourceTypeId: 902, order: 5 }),
    ];
    const input = buildInput({
      intents,
      perType: [
        perTypeRow({
          resourceType: "RESOURCE_A",
          resourceTypeId: 901,
          plannedCount: 4,
          minCount: 1,
          maxCount: 4,
        }),
        perTypeRow({
          resourceType: "RESOURCE_B",
          resourceTypeId: 902,
          plannedCount: 2,
          minCount: 1,
          maxCount: 2,
        }),
      ],
      starts: [
        { seatIndex: 0, playerId: 0, plotIndex: plotAt(3, 3) },
        { seatIndex: 1, playerId: 1, plotIndex: poorSeatPlot },
      ],
      affinityRules: [
        { resourceA: "RESOURCE_A", resourceB: "RESOURCE_B", relation: "exclusion", radiusTiles: 2 },
      ],
      legalMaskByType: { RESOURCE_A: legalA },
    });
    const result = run(input);

    const aPlots = result.intents
      .filter((row) => row.resourceType === "RESOURCE_A")
      .map((row) => row.plotIndex);
    const bPlots = result.intents
      .filter((row) => row.resourceType === "RESOURCE_B")
      .map((row) => row.plotIndex);
    // Exclusion holds on the adjusted set.
    for (const a of aPlots) {
      for (const b of bPlots) {
        expect(hexDistanceOddQPeriodicX(a, b, WIDTH)).toBeGreaterThan(2);
      }
    }
    // Legality holds: every adjusted A destination is on a legal tile.
    for (const adjustment of result.adjustments) {
      if (adjustment.resourceType !== "RESOURCE_A") continue;
      expect(legalA[adjustment.toPlotIndex]).toBe(1);
    }
  });

  it("is deterministic for identical inputs", () => {
    const a = run(clusterScenario());
    const b = run(clusterScenario());
    expect(JSON.parse(JSON.stringify(b))).toEqual(JSON.parse(JSON.stringify(a)));
  });

  it("passes the plan through unchanged when disabled, recording deficits as typed shortfalls", () => {
    const input = clusterScenario();
    const result = run(input, { enabled: false });

    expect(result.moveCount).toBe(0);
    expect(result.addCount).toBe(0);
    expect(result.adjustments).toEqual([]);
    expect(result.intents.map((row) => row.plotIndex)).toEqual(
      input.plan.intents.map((row) => row.plotIndex)
    );
    const disabled = result.shortfalls.filter((row) => row.reason === "adjustment-disabled");
    expect(disabled.length).toBeGreaterThan(0);
    expect(disabled[0]!.seatIndex).toBe(1);
  });
});
