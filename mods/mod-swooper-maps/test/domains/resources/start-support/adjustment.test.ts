import { describe, expect, it } from "bun:test";

import resources from "@mapgen/domain/resources/ops";
import { getHexRadiusIndicesOddQ, hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import { artifactModules as placementArtifactModules } from "../../../../src/recipes/standard/stages/placement/artifacts/index.js";

const syntheticDimensions = { width: 24, height: 14 } as const;
const { width, height } = syntheticDimensions;
const size = width * height;

type AdjustInput = Parameters<typeof resources.ops.adjustResourceSupport.run>[0];
type PlanIntent = AdjustInput["plan"]["intents"][number];
type PlanPerType = AdjustInput["plan"]["perType"][number];

type AdjustResult = ReturnType<typeof resources.ops.adjustResourceSupport.run>;

function plotAt(x: number, y: number): number {
  return y * width + x;
}

function intentAt(args: {
  x: number;
  y: number;
  resourceType: PlanIntent["resourceType"];
  order: number;
  inHabitat?: boolean;
}): PlanIntent {
  const plotIndex = plotAt(args.x, args.y);
  return {
    plotIndex,
    x: args.x,
    y: args.y,
    resourceType: args.resourceType,
    family: "geological",
    laneId: "probe",
    laneKind: "land",
    phase: "rotation",
    order: args.order,
    regionSlot: args.x < width / 2 ? 1 : 2,
    landmassId: 0,
    inHabitat: args.inHabitat ?? true,
  };
}

function perTypeRow(args: {
  resourceType: PlanPerType["resourceType"];
  plannedCount: number;
  minCount: number;
  maxCount: number;
  spacingFloorTiles?: number;
}): PlanPerType {
  return {
    resourceType: args.resourceType,
    family: "geological",
    laneId: "probe",
    laneKind: "land",
    weight: 10,
    effectiveWeight: 1,
    authoredTargetCount: args.plannedCount,
    effectiveTargetCount: args.plannedCount,
    minCount: args.minCount,
    maxCount: args.maxCount,
    spacingFloorTiles: args.spacingFloorTiles ?? 4,
    habitatTileCount: size,
    legalTileCount: size,
    eligibleTileCount: size,
    plannedCount: args.plannedCount,
    rotationCount: args.plannedCount,
    rangeFloorCount: 0,
    regionMinimumCount: 0,
    shortfalls: [],
  };
}

function buildInput(args: {
  intents: AdjustInput["plan"]["intents"];
  perType: AdjustInput["plan"]["perType"];
  starts: AdjustInput["starts"];
  regionMinimums?: AdjustInput["plan"]["regionMinimums"];
  affinityRules?: AdjustInput["plan"]["settings"]["affinityRules"];
  habitatMaskByType?: Partial<Record<PlanIntent["resourceType"], Uint8Array>>;
  legalMaskByType?: Partial<Record<PlanIntent["resourceType"], Uint8Array>>;
}): AdjustInput {
  const allOnes = new Uint8Array(size).fill(1);
  const intensity = new Float32Array(size).fill(1);
  const regionSlotByTile = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    regionSlotByTile[i] = i % width < width / 2 ? 1 : 2;
  }
  return {
    seed: 1337,
    plan: {
      width: width,
      height: height,
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
      habitatMask: args.habitatMaskByType?.[row.resourceType] ?? allOnes,
      legalMask: args.legalMaskByType?.[row.resourceType] ?? allOnes,
      intensity,
    })),
    starts: args.starts,
    landmassIdByTile: new Int32Array(size),
    landmassTileCounts: [size],
    regionSlotByTile,
  };
}

function run(
  input: ReturnType<typeof buildInput>,
  configure?: (config: (typeof resources.ops.adjustResourceSupport.defaultConfig)["config"]) => void
): AdjustResult {
  const selection = structuredClone(resources.ops.adjustResourceSupport.defaultConfig);
  configure?.(selection.config);
  const result = runAdmittedOperationForTest(resources.ops.adjustResourceSupport, input, selection);
  expect(
    placementArtifactModules.resourcePlanAdjusted.validate(result, {
      dimensions: syntheticDimensions,
    })
  ).toEqual([]);
  return result;
}

function supportCount(intents: AdjustResult["intents"], seatPlot: number, radius: number): number {
  const zone = new Set(getHexRadiusIndicesOddQ(seatPlot, width, height, radius));
  return intents.filter((intent) => zone.has(intent.plotIndex)).length;
}

/** Two seats: one inside a NW site cluster, one in the empty SE corner. */
function clusterScenario(args?: { maxCountA?: number }) {
  const intents = [
    intentAt({ x: 1, y: 1, resourceType: "RESOURCE_A", order: 0 }),
    intentAt({ x: 5, y: 1, resourceType: "RESOURCE_A", order: 1 }),
    intentAt({ x: 1, y: 5, resourceType: "RESOURCE_A", order: 2 }),
    intentAt({ x: 5, y: 5, resourceType: "RESOURCE_A", order: 3 }),
    intentAt({ x: 9, y: 1, resourceType: "RESOURCE_A", order: 4 }),
    intentAt({ x: 9, y: 5, resourceType: "RESOURCE_A", order: 5 }),
  ];
  return buildInput({
    intents,
    perType: [
      perTypeRow({
        resourceType: "RESOURCE_A",
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
        if (moved?.support?.action !== "move") throw new Error("Missing move provenance.");
        expect(moved.support.fromPlotIndex).toBe(adjustment.fromPlotIndex);
      }
    }
    expect(
      result.intents.filter((intent) => intent.support).every((intent) => intent.inHabitat)
    ).toBe(true);
    expect(result.shortfalls).toEqual([]);
  });

  it("records a shortfall instead of moving or adding outside habitat admission", () => {
    const input = clusterScenario();
    input.eligibility[0]!.habitatMask.fill(0);

    const result = run(input);
    expect(result.adjustments).toEqual([]);
    expect(result.intents).toEqual(input.plan.intents);
    expect(result.shortfalls.some((row) => row.reason === "no-admitted-adjustment")).toBe(true);
  });

  it("serves the equal-support seat with less admitted capacity before seat-index order", () => {
    const source = intentAt({ x: 12, y: 7, resourceType: "RESOURCE_A", order: 0 });
    const legalA = new Uint8Array(size);
    for (const plotIndex of [plotAt(1, 1), plotAt(5, 1), plotAt(1, 5), plotAt(18, 9)]) {
      legalA[plotIndex] = 1;
    }
    const input = buildInput({
      intents: [source],
      perType: [
        perTypeRow({ resourceType: "RESOURCE_A", plannedCount: 1, minCount: 1, maxCount: 1 }),
      ],
      starts: [
        { seatIndex: 0, playerId: 0, plotIndex: plotAt(3, 3) },
        { seatIndex: 1, playerId: 1, plotIndex: plotAt(20, 11) },
      ],
      legalMaskByType: { RESOURCE_A: legalA },
    });

    const result = run(input, (config) => {
      config.supportFloor = 1;
      config.equityTolerance = 1;
    });

    expect(result.adjustments).toHaveLength(1);
    expect(result.adjustments[0]).toMatchObject({
      action: "move",
      reason: "support-floor",
      seatIndex: 1,
      fromPlotIndex: source.plotIndex,
    });
    expect(result.perStart.map((seat) => seat.supportAfter)).toEqual([0, 1]);
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
          hexDistanceOddQPeriodicX(aPlots[i]!, aPlots[j]!, width),
          `pair ${aPlots[i]}/${aPlots[j]}`
        ).toBeGreaterThanOrEqual(4);
      }
    }

    // Cross-type adjacency clearance (force-pass convention).
    for (let i = 0; i < plots.length; i++) {
      for (let j = i + 1; j < plots.length; j++) {
        expect(hexDistanceOddQPeriodicX(plots[i]!, plots[j]!, width)).toBeGreaterThanOrEqual(2);
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

  it("crosses a tied-extrema gap plateau by reducing the complete disparity vector", () => {
    const intents = [
      intentAt({ x: 1, y: 0, resourceType: "RESOURCE_A", order: 0 }),
      intentAt({ x: 7, y: 0, resourceType: "RESOURCE_A", order: 1 }),
      intentAt({ x: 13, y: 8, resourceType: "RESOURCE_A", order: 2 }),
      intentAt({ x: 15, y: 8, resourceType: "RESOURCE_A", order: 3 }),
      intentAt({ x: 12, y: 10, resourceType: "RESOURCE_A", order: 4 }),
      intentAt({ x: 19, y: 8, resourceType: "RESOURCE_A", order: 5 }),
      intentAt({ x: 21, y: 8, resourceType: "RESOURCE_A", order: 6 }),
      intentAt({ x: 18, y: 10, resourceType: "RESOURCE_A", order: 7 }),
    ];
    const input = buildInput({
      intents,
      perType: [
        perTypeRow({
          resourceType: "RESOURCE_A",
          plannedCount: intents.length,
          minCount: intents.length,
          maxCount: intents.length,
          spacingFloorTiles: 2,
        }),
      ],
      starts: [
        { seatIndex: 0, playerId: 0, plotIndex: plotAt(2, 2) },
        { seatIndex: 1, playerId: 1, plotIndex: plotAt(8, 2) },
        { seatIndex: 2, playerId: 2, plotIndex: plotAt(14, 10) },
        { seatIndex: 3, playerId: 3, plotIndex: plotAt(20, 10) },
      ],
    });

    expect(input.starts.map((seat) => supportCount(input.plan.intents, seat.plotIndex, 2))).toEqual(
      [1, 1, 3, 3]
    );
    const result = run(input, (config) => {
      config.supportFloor = 1;
      config.supportRadiusTiles = 2;
      config.equityTolerance = 0;
    });

    expect(result.perStart.map((seat) => seat.supportAfter)).toEqual([2, 2, 2, 2]);
    expect(result.moveCount).toBe(2);
    expect(result.addCount).toBe(0);
    expect(result.shortfalls).toEqual([]);
  });

  it("scans every tied-minimum seat instead of binding equity to the first seat", () => {
    const intents = [
      intentAt({ x: 1, y: 0, resourceType: "RESOURCE_A", order: 0 }),
      intentAt({ x: 9, y: 0, resourceType: "RESOURCE_A", order: 1 }),
      intentAt({ x: 19, y: 8, resourceType: "RESOURCE_A", order: 2 }),
      intentAt({ x: 21, y: 8, resourceType: "RESOURCE_A", order: 3 }),
      intentAt({ x: 18, y: 10, resourceType: "RESOURCE_A", order: 4 }),
    ];
    const legal = new Uint8Array(size);
    for (const intent of intents) legal[intent.plotIndex] = 1;
    legal[plotAt(11, 0)] = 1;
    const input = buildInput({
      intents,
      perType: [
        perTypeRow({
          resourceType: "RESOURCE_A",
          plannedCount: intents.length,
          minCount: intents.length,
          maxCount: intents.length,
          spacingFloorTiles: 2,
        }),
      ],
      starts: [
        { seatIndex: 0, playerId: 0, plotIndex: plotAt(2, 2) },
        { seatIndex: 1, playerId: 1, plotIndex: plotAt(10, 2) },
        { seatIndex: 2, playerId: 2, plotIndex: plotAt(20, 10) },
      ],
      legalMaskByType: { RESOURCE_A: legal },
    });

    expect(input.starts.map((seat) => supportCount(input.plan.intents, seat.plotIndex, 2))).toEqual(
      [1, 1, 3]
    );
    const result = run(input, (config) => {
      config.supportFloor = 1;
      config.supportRadiusTiles = 2;
      config.equityTolerance = 0;
    });

    expect(result.perStart.map((seat) => seat.supportAfter)).toEqual([1, 2, 2]);
    expect(result.adjustments[0]).toMatchObject({
      action: "move",
      reason: "support-equity",
      seatIndex: 1,
      toPlotIndex: plotAt(11, 0),
    });
  });

  it("refuses equal-objective swaps that could cycle without improving equity", () => {
    const intents = [
      intentAt({ x: 1, y: 0, resourceType: "RESOURCE_A", order: 0 }),
      intentAt({ x: 19, y: 8, resourceType: "RESOURCE_A", order: 1 }),
      intentAt({ x: 21, y: 8, resourceType: "RESOURCE_A", order: 2 }),
    ];
    const legal = new Uint8Array(size);
    for (const intent of intents) legal[intent.plotIndex] = 1;
    legal[plotAt(3, 0)] = 1;
    const input = buildInput({
      intents,
      perType: [
        perTypeRow({
          resourceType: "RESOURCE_A",
          plannedCount: intents.length,
          minCount: intents.length,
          maxCount: intents.length,
          spacingFloorTiles: 2,
        }),
      ],
      starts: [
        { seatIndex: 0, playerId: 0, plotIndex: plotAt(2, 2) },
        { seatIndex: 1, playerId: 1, plotIndex: plotAt(20, 10) },
      ],
      legalMaskByType: { RESOURCE_A: legal },
    });

    expect(input.starts.map((seat) => supportCount(input.plan.intents, seat.plotIndex, 2))).toEqual(
      [1, 2]
    );
    const result = run(input, (config) => {
      config.supportFloor = 1;
      config.supportRadiusTiles = 2;
      config.equityTolerance = 0;
    });

    expect(result.adjustments).toEqual([]);
    expect(result.perStart.map((seat) => seat.supportAfter)).toEqual([1, 2]);
    expect(result.shortfalls).toContainEqual({
      seatIndex: 0,
      reason: "equity-unresolvable",
      missing: 1,
    });
  });

  it("moves from a secondary donor when the first richest seat has no admissible source", () => {
    const aIntents = [
      intentAt({ x: 1, y: 1, resourceType: "RESOURCE_A", order: 0 }),
      intentAt({ x: 5, y: 1, resourceType: "RESOURCE_A", order: 1 }),
      intentAt({ x: 1, y: 5, resourceType: "RESOURCE_A", order: 2 }),
    ];
    const bIntents = [
      intentAt({ x: 10, y: 1, resourceType: "RESOURCE_B", order: 3 }),
      intentAt({ x: 14, y: 1, resourceType: "RESOURCE_B", order: 4 }),
      intentAt({ x: 10, y: 5, resourceType: "RESOURCE_B", order: 5 }),
    ];
    const cIntent = intentAt({ x: 20, y: 8, resourceType: "RESOURCE_C", order: 6 });
    const legalA = new Uint8Array(size);
    for (const intent of aIntents) legalA[intent.plotIndex] = 1;
    const input = buildInput({
      intents: [...aIntents, ...bIntents, cIntent],
      perType: [
        perTypeRow({ resourceType: "RESOURCE_A", plannedCount: 3, minCount: 3, maxCount: 3 }),
        perTypeRow({ resourceType: "RESOURCE_B", plannedCount: 3, minCount: 3, maxCount: 3 }),
        perTypeRow({ resourceType: "RESOURCE_C", plannedCount: 1, minCount: 1, maxCount: 1 }),
      ],
      starts: [
        { seatIndex: 0, playerId: 0, plotIndex: plotAt(3, 3) },
        { seatIndex: 1, playerId: 1, plotIndex: plotAt(12, 3) },
        { seatIndex: 2, playerId: 2, plotIndex: plotAt(20, 11) },
      ],
      legalMaskByType: { RESOURCE_A: legalA },
    });

    expect(input.starts.map((seat) => supportCount(input.plan.intents, seat.plotIndex, 4))).toEqual(
      [3, 3, 1]
    );
    const result = run(input, (config) => {
      config.supportFloor = 1;
      config.equityTolerance = 1;
    });

    expect(result.equity).toEqual({ gapBefore: 2, gapAfter: 1 });
    expect(result.shortfalls).toEqual([]);
    expect(result.adjustments).toHaveLength(1);
    expect(result.adjustments[0]).toMatchObject({
      action: "move",
      reason: "support-equity",
      resourceType: "RESOURCE_B",
      seatIndex: 2,
    });
    expect(
      result.intents
        .filter((intent) => intent.resourceType === "RESOURCE_A")
        .map((intent) => intent.plotIndex)
    ).toEqual(aIntents.map((intent) => intent.plotIndex));

    for (const resourceType of ["RESOURCE_A", "RESOURCE_B", "RESOURCE_C"] as const) {
      const before = input.plan.intents.filter(
        (intent) => intent.resourceType === resourceType
      ).length;
      const after = result.intents.filter((intent) => intent.resourceType === resourceType).length;
      expect(after).toBe(before);
    }
    const plots = result.intents.map((intent) => intent.plotIndex);
    expect(new Set(plots).size).toBe(plots.length);
    for (let left = 0; left < plots.length; left += 1) {
      for (let right = left + 1; right < plots.length; right += 1) {
        expect(hexDistanceOddQPeriodicX(plots[left]!, plots[right]!, width)).toBeGreaterThanOrEqual(
          2
        );
      }
    }
    for (const intent of result.intents.filter((candidate) => candidate.support)) {
      const eligibility = input.eligibility.find((row) => row.resourceType === intent.resourceType);
      expect(eligibility?.habitatMask[intent.plotIndex]).toBe(1);
      expect(eligibility?.legalMask[intent.plotIndex]).toBe(1);
    }
  });

  it("moves each source at most once across repeated three-seat equity eligibility", () => {
    const intents = [
      intentAt({ x: 2, y: 2, resourceType: "RESOURCE_A", order: 0 }),
      intentAt({ x: 6, y: 2, resourceType: "RESOURCE_A", order: 1 }),
    ];
    const input = buildInput({
      intents,
      perType: [
        perTypeRow({
          resourceType: "RESOURCE_A",
          plannedCount: intents.length,
          minCount: intents.length,
          maxCount: intents.length,
        }),
      ],
      starts: [
        { seatIndex: 0, playerId: 0, plotIndex: plotAt(4, 2) },
        { seatIndex: 1, playerId: 1, plotIndex: plotAt(12, 11) },
        { seatIndex: 2, playerId: 2, plotIndex: plotAt(20, 2) },
      ],
    });
    const result = run(input, (config) => {
      config.supportFloor = 0;
      config.equityTolerance = 0;
    });

    const movedSources = result.adjustments.flatMap((row) =>
      row.action === "move" ? [row.fromPlotIndex] : []
    );
    expect(result.moveCount).toBeGreaterThan(0);
    expect(new Set(movedSources).size).toBe(movedSources.length);
    expect(result.adjustments.length).toBe(
      result.intents.filter((intent) => intent.support !== undefined).length
    );
  });

  it("records typed shortfalls instead of forcing when no movable source or headroom exists", () => {
    // All sites sit inside the rich seat's radius (so a move would strip its
    // own support guard) and region minimums pin type A to the west; no
    // maxCount headroom for adds.
    const intents = [
      intentAt({ x: 2, y: 2, resourceType: "RESOURCE_A", order: 0 }),
      intentAt({ x: 6, y: 2, resourceType: "RESOURCE_A", order: 1 }),
    ];
    const input = buildInput({
      intents,
      perType: [
        perTypeRow({
          resourceType: "RESOURCE_A",
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
          "no-admitted-adjustment",
          "equity-unresolvable",
          "floor-budget-exhausted",
          "equity-budget-exhausted",
        ].includes(row.reason)
      )
    ).toBe(true);
  });

  it("adds within maxCount headroom when moves are blocked, with support phase provenance", () => {
    const intents = [
      intentAt({ x: 2, y: 2, resourceType: "RESOURCE_A", order: 0 }),
      intentAt({ x: 6, y: 2, resourceType: "RESOURCE_A", order: 1 }),
    ];
    const input = buildInput({
      intents,
      perType: [
        perTypeRow({
          resourceType: "RESOURCE_A",
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
    const legalA = new Uint8Array(size).fill(1);
    const poorSeatPlot = plotAt(20, 11);
    for (const idx of getHexRadiusIndicesOddQ(poorSeatPlot, width, height, 4)) {
      legalA[idx] = 0;
    }
    legalA[plotAt(18, 9)] = 1;
    legalA[plotAt(22, 13)] = 1;

    const intents = [
      intentAt({ x: 1, y: 1, resourceType: "RESOURCE_A", order: 0 }),
      intentAt({ x: 5, y: 1, resourceType: "RESOURCE_A", order: 1 }),
      intentAt({ x: 1, y: 5, resourceType: "RESOURCE_A", order: 2 }),
      intentAt({ x: 5, y: 5, resourceType: "RESOURCE_A", order: 3 }),
      intentAt({ x: 9, y: 1, resourceType: "RESOURCE_B", order: 4 }),
      intentAt({ x: 20, y: 8, resourceType: "RESOURCE_B", order: 5 }),
    ];
    const input = buildInput({
      intents,
      perType: [
        perTypeRow({
          resourceType: "RESOURCE_A",
          plannedCount: 4,
          minCount: 1,
          maxCount: 4,
        }),
        perTypeRow({
          resourceType: "RESOURCE_B",
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
        expect(hexDistanceOddQPeriodicX(a, b, width)).toBeGreaterThan(2);
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

  it("passes the plan through unchanged when disabled or strength is zero", () => {
    const input = clusterScenario();
    for (const configure of [
      (config: (typeof resources.ops.adjustResourceSupport.defaultConfig)["config"]) => {
        config.enabled = false;
      },
      (config: (typeof resources.ops.adjustResourceSupport.defaultConfig)["config"]) => {
        config.strength = 0;
      },
    ]) {
      const result = run(input, configure);
      expect(result.moveCount).toBe(0);
      expect(result.addCount).toBe(0);
      expect(result.adjustments).toEqual([]);
      expect(result.intents).toEqual(input.plan.intents);
      const disabled = result.shortfalls.filter((row) => row.reason === "adjustment-disabled");
      expect(disabled.length).toBeGreaterThan(0);
      expect(disabled[0]?.seatIndex).toBe(1);
    }
  });
});
