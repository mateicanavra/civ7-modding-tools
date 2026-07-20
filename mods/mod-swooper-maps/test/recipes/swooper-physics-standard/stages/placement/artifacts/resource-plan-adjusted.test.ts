import { describe, expect, it } from "bun:test";

import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { artifactModules as placementArtifactModules } from "../../../../../../src/recipes/standard/stages/placement/artifacts/index.js";

type ResourcePlanAdjusted = Static<
  (typeof placementArtifactModules)["resourcePlanAdjusted"]["artifact"]["schema"]
>;

const SYNTHETIC_DIMENSIONS = { width: 5, height: 4 } as const;
const SYNTHETIC_SEAM_DIMENSIONS = { width: 2, height: 2 } as const;
const SYNTHETIC_TRANSPOSED_DIMENSIONS = {
  width: SYNTHETIC_DIMENSIONS.height,
  height: SYNTHETIC_DIMENSIONS.width,
} as const;

function requiredAt<T>(values: readonly T[], index: number, label: string): T {
  const value = values[index];
  if (value === undefined) throw new Error(`Missing ${label} at index ${index}.`);
  return value;
}

function coherentAdjustedResourcePlan(): ResourcePlanAdjusted {
  return {
    ...SYNTHETIC_DIMENSIONS,
    seed: 1337,
    plannedCount: 3,
    moveCount: 1,
    addCount: 1,
    intents: [
      {
        plotIndex: 6,
        x: 1,
        y: 1,
        resourceType: "RESOURCE_A",
        family: "geological",
        laneId: "test",
        laneKind: "land",
        phase: "rotation",
        order: 0,
        regionSlot: 1,
        landmassId: 0,
        inHabitat: true,
        support: {
          action: "move",
          reason: "support-floor",
          seatIndex: 0,
          fromPlotIndex: 0,
        },
      },
      {
        plotIndex: 10,
        x: 0,
        y: 2,
        resourceType: "RESOURCE_B",
        family: "terrestrial",
        laneId: "test",
        laneKind: "land",
        phase: "rotation",
        order: 1,
        regionSlot: 1,
        landmassId: 0,
        inHabitat: true,
      },
      {
        plotIndex: 18,
        x: 3,
        y: 3,
        resourceType: "RESOURCE_C",
        family: "cultivated",
        laneId: "test",
        laneKind: "land",
        phase: "support",
        order: 2,
        regionSlot: 2,
        landmassId: 0,
        inHabitat: true,
        support: { action: "add", reason: "support-floor", seatIndex: 1 },
      },
    ],
    adjustments: [
      {
        action: "move",
        reason: "support-floor",
        resourceType: "RESOURCE_A",
        fromPlotIndex: 0,
        toPlotIndex: 6,
        seatIndex: 0,
      },
      {
        action: "add",
        reason: "support-floor",
        resourceType: "RESOURCE_C",
        toPlotIndex: 18,
        seatIndex: 1,
      },
    ],
    shortfalls: [],
    perStart: [
      { seatIndex: 0, playerId: 7, plotIndex: 5, supportBefore: 2, supportAfter: 2 },
      { seatIndex: 1, playerId: 9, plotIndex: 14, supportBefore: 1, supportAfter: 2 },
    ],
    equity: { gapBefore: 1, gapAfter: 0 },
    settings: {
      enabled: true,
      supportFloor: 2,
      supportRadiusTiles: 1,
      equityTolerance: 0,
      strength: 1,
    },
  };
}

function inactiveResourcePlan(): ResourcePlanAdjusted {
  return {
    ...SYNTHETIC_DIMENSIONS,
    seed: 1337,
    plannedCount: 1,
    moveCount: 0,
    addCount: 0,
    intents: [
      {
        plotIndex: 0,
        x: 0,
        y: 0,
        resourceType: "RESOURCE_A",
        family: "geological",
        laneId: "test",
        laneKind: "land",
        phase: "rotation",
        order: 0,
        regionSlot: 1,
        landmassId: 0,
        inHabitat: true,
      },
    ],
    adjustments: [],
    shortfalls: [{ seatIndex: 0, reason: "adjustment-disabled", missing: 1 }],
    perStart: [{ seatIndex: 0, playerId: 7, plotIndex: 14, supportBefore: 0, supportAfter: 0 }],
    equity: { gapBefore: null, gapAfter: null },
    settings: {
      enabled: false,
      supportFloor: 1,
      supportRadiusTiles: 1,
      equityTolerance: 0,
      strength: 1,
    },
  };
}

describe("placement adjusted resource-plan artifact", () => {
  it("reconciles coherent resource moves, additions, provenance, and support evidence", () => {
    expect(
      placementArtifactModules.resourcePlanAdjusted.validate(coherentAdjustedResourcePlan(), {
        dimensions: SYNTHETIC_DIMENSIONS,
      })
    ).toEqual([]);
  });

  it("rejects tampered support counts and equity gap arithmetic", () => {
    const support = coherentAdjustedResourcePlan();
    support.perStart[1]!.supportAfter = 1;
    expect(
      placementArtifactModules.resourcePlanAdjusted
        .validate(support, { dimensions: SYNTHETIC_DIMENSIONS })
        .some((entry) => entry.message.includes("supportAfter"))
    ).toBe(true);

    const gap = coherentAdjustedResourcePlan();
    gap.equity.gapBefore = 0;
    expect(
      placementArtifactModules.resourcePlanAdjusted
        .validate(gap, { dimensions: SYNTHETIC_DIMENSIONS })
        .some((entry) => entry.message.includes("gapBefore"))
    ).toBe(true);

    const singleSeat = inactiveResourcePlan();
    singleSeat.equity.gapAfter = 0;
    expect(
      placementArtifactModules.resourcePlanAdjusted
        .validate(singleSeat, { dimensions: SYNTHETIC_DIMENSIONS })
        .some((entry) => entry.message.includes("gapAfter"))
    ).toBe(true);
  });

  it("requires exact terminal floor-shortfall evidence", () => {
    expect(
      placementArtifactModules.resourcePlanAdjusted.validate(inactiveResourcePlan(), {
        dimensions: SYNTHETIC_DIMENSIONS,
      })
    ).toEqual([]);

    for (const mutate of [
      (value: ResourcePlanAdjusted) => {
        value.shortfalls = [];
      },
      (value: ResourcePlanAdjusted) => {
        requiredAt(value.shortfalls, 0, "floor shortfall").missing = 2;
      },
      (value: ResourcePlanAdjusted) => {
        requiredAt(value.shortfalls, 0, "floor shortfall").seatIndex = 8;
      },
      (value: ResourcePlanAdjusted) => {
        value.shortfalls.push({ seatIndex: 0, reason: "adjustment-disabled", missing: 1 });
      },
    ]) {
      const value = inactiveResourcePlan();
      mutate(value);
      expect(
        placementArtifactModules.resourcePlanAdjusted.validate(value, {
          dimensions: SYNTHETIC_DIMENSIONS,
        }).length
      ).toBeGreaterThan(0);
    }
  });

  it("requires exact active equity-shortfall evidence", () => {
    const value = inactiveResourcePlan();
    value.settings.enabled = true;
    value.settings.supportFloor = 0;
    value.intents.push({
      ...requiredAt(value.intents, 0, "resource intent"),
      plotIndex: 10,
      x: 0,
      y: 2,
      order: 1,
    });
    value.plannedCount = 2;
    value.perStart.push({
      seatIndex: 1,
      playerId: 9,
      plotIndex: 5,
      supportBefore: 2,
      supportAfter: 2,
    });
    requiredAt(value.perStart, 0, "start support").supportBefore = 1;
    requiredAt(value.perStart, 0, "start support").supportAfter = 1;
    value.equity = { gapBefore: 1, gapAfter: 1 };
    value.shortfalls = [{ seatIndex: 0, reason: "equity-unresolvable", missing: 1 }];

    expect(
      placementArtifactModules.resourcePlanAdjusted.validate(value, {
        dimensions: SYNTHETIC_DIMENSIONS,
      })
    ).toEqual([]);

    requiredAt(value.shortfalls, 0, "equity shortfall").missing = 2;
    expect(
      placementArtifactModules.resourcePlanAdjusted
        .validate(value, { dimensions: SYNTHETIC_DIMENSIONS })
        .some((entry) => entry.message.includes("equity shortfall"))
    ).toBe(true);
  });

  it("rejects inactive adjustment evidence and adjustment/provenance disagreement", () => {
    const inactive = coherentAdjustedResourcePlan();
    inactive.settings.enabled = false;
    expect(
      placementArtifactModules.resourcePlanAdjusted
        .validate(inactive, { dimensions: SYNTHETIC_DIMENSIONS })
        .some((entry) => entry.message.includes("inactive resource evidence"))
    ).toBe(true);

    const mismatched = coherentAdjustedResourcePlan();
    requiredAt(mismatched.adjustments, 0, "adjustment").reason = "support-equity";
    expect(
      placementArtifactModules.resourcePlanAdjusted
        .validate(mismatched, { dimensions: SYNTHETIC_DIMENSIONS })
        .some((entry) => entry.message.includes("adjustment/provenance"))
    ).toBe(true);

    const unknownSeat = coherentAdjustedResourcePlan();
    const movedIntent = requiredAt(unknownSeat.intents, 0, "resource intent");
    if (!movedIntent.support) throw new Error("Missing move provenance.");
    movedIntent.support.seatIndex = 8;
    requiredAt(unknownSeat.adjustments, 0, "adjustment").seatIndex = 8;
    expect(
      placementArtifactModules.resourcePlanAdjusted
        .validate(unknownSeat, { dimensions: SYNTHETIC_DIMENSIONS })
        .some((entry) => entry.message.includes("adjustment names unknown seat"))
    ).toBe(true);

    const stationaryMove = coherentAdjustedResourcePlan();
    const stationaryIntent = requiredAt(stationaryMove.intents, 0, "resource intent");
    if (stationaryIntent.support?.action !== "move") throw new Error("Missing move provenance.");
    stationaryIntent.support.fromPlotIndex = stationaryIntent.plotIndex;
    const stationaryAdjustment = requiredAt(stationaryMove.adjustments, 0, "adjustment");
    if (stationaryAdjustment.action !== "move") throw new Error("Missing move adjustment.");
    stationaryAdjustment.fromPlotIndex = stationaryIntent.plotIndex;
    expect(
      placementArtifactModules.resourcePlanAdjusted
        .validate(stationaryMove, { dimensions: SYNTHETIC_DIMENSIONS })
        .some((entry) => entry.message.includes("must be different plots"))
    ).toBe(true);
  });

  it("refuses impossible move and add provenance states at the schema boundary", () => {
    const moveWithoutSource = coherentAdjustedResourcePlan();
    const movedIntent = requiredAt(moveWithoutSource.intents, 0, "resource intent");
    if (movedIntent.support?.action !== "move") throw new Error("Missing move provenance.");
    Reflect.deleteProperty(movedIntent.support, "fromPlotIndex");
    expect(
      placementArtifactModules.resourcePlanAdjusted.validate(moveWithoutSource, {
        dimensions: SYNTHETIC_DIMENSIONS,
      }).length
    ).toBeGreaterThan(0);

    const moveRowWithoutSource = coherentAdjustedResourcePlan();
    const moveRow = requiredAt(moveRowWithoutSource.adjustments, 0, "adjustment");
    if (moveRow.action !== "move") throw new Error("Missing move adjustment.");
    Reflect.deleteProperty(moveRow, "fromPlotIndex");
    expect(
      placementArtifactModules.resourcePlanAdjusted.validate(moveRowWithoutSource, {
        dimensions: SYNTHETIC_DIMENSIONS,
      }).length
    ).toBeGreaterThan(0);

    const addWithSource = coherentAdjustedResourcePlan();
    const addedIntent = requiredAt(addWithSource.intents, 2, "resource intent");
    if (addedIntent.support?.action !== "add") throw new Error("Missing add provenance.");
    Reflect.set(addedIntent.support, "fromPlotIndex", 17);
    expect(
      placementArtifactModules.resourcePlanAdjusted.validate(addWithSource, {
        dimensions: SYNTHETIC_DIMENSIONS,
      }).length
    ).toBeGreaterThan(0);

    const addRowWithSource = coherentAdjustedResourcePlan();
    const addRow = requiredAt(addRowWithSource.adjustments, 1, "adjustment");
    if (addRow.action !== "add") throw new Error("Missing add adjustment.");
    Reflect.set(addRow, "fromPlotIndex", 17);
    expect(
      placementArtifactModules.resourcePlanAdjusted.validate(addRowWithSource, {
        dimensions: SYNTHETIC_DIMENSIONS,
      }).length
    ).toBeGreaterThan(0);
  });

  it("refuses output settings outside the admitted strategy ranges", () => {
    const invalidFloor = coherentAdjustedResourcePlan();
    invalidFloor.settings.supportFloor = 7;
    expect(
      placementArtifactModules.resourcePlanAdjusted.validate(invalidFloor).length
    ).toBeGreaterThan(0);

    const invalidRadius = coherentAdjustedResourcePlan();
    invalidRadius.settings.supportRadiusTiles = 0;
    expect(
      placementArtifactModules.resourcePlanAdjusted.validate(invalidRadius).length
    ).toBeGreaterThan(0);

    const invalidTolerance = coherentAdjustedResourcePlan();
    invalidTolerance.settings.equityTolerance = 9;
    expect(
      placementArtifactModules.resourcePlanAdjusted.validate(invalidTolerance).length
    ).toBeGreaterThan(0);
  });

  it("uses producer radius membership at the wrapped even-width seam", () => {
    const seam: ResourcePlanAdjusted = {
      ...SYNTHETIC_SEAM_DIMENSIONS,
      seed: 1337,
      plannedCount: 1,
      moveCount: 0,
      addCount: 0,
      intents: [
        {
          plotIndex: 3,
          x: 1,
          y: 1,
          resourceType: "RESOURCE_A",
          family: "geological",
          laneId: "test",
          laneKind: "land",
          phase: "rotation",
          order: 0,
          regionSlot: 1,
          landmassId: 0,
          inHabitat: true,
        },
      ],
      adjustments: [],
      shortfalls: [],
      perStart: [{ seatIndex: 0, playerId: 7, plotIndex: 0, supportBefore: 1, supportAfter: 1 }],
      equity: { gapBefore: null, gapAfter: null },
      settings: {
        enabled: true,
        supportFloor: 1,
        supportRadiusTiles: 1,
        equityTolerance: 0,
        strength: 1,
      },
    };

    expect(
      placementArtifactModules.resourcePlanAdjusted.validate(seam, {
        dimensions: SYNTHETIC_SEAM_DIMENSIONS,
      })
    ).toEqual([]);
  });

  it("rejects coordinate, reconstructed-plan, and execution-dimension drift", () => {
    const coordinate = coherentAdjustedResourcePlan();
    requiredAt(coordinate.intents, 0, "resource intent").x = 2;
    expect(
      placementArtifactModules.resourcePlanAdjusted
        .validate(coordinate, { dimensions: SYNTHETIC_DIMENSIONS })
        .some((entry) => entry.message.includes("encodes"))
    ).toBe(true);

    const duplicateSource = coherentAdjustedResourcePlan();
    const provenance = requiredAt(duplicateSource.intents, 0, "resource intent").support;
    if (provenance?.action !== "move") throw new Error("Missing move provenance.");
    provenance.fromPlotIndex = 10;
    const adjustment = requiredAt(duplicateSource.adjustments, 0, "adjustment");
    if (adjustment.action !== "move") throw new Error("Missing move adjustment.");
    adjustment.fromPlotIndex = 10;
    expect(
      placementArtifactModules.resourcePlanAdjusted
        .validate(duplicateSource, { dimensions: SYNTHETIC_DIMENSIONS })
        .some((entry) => entry.message.includes("pre-adjustment"))
    ).toBe(true);

    expect(
      placementArtifactModules.resourcePlanAdjusted
        .validate(coherentAdjustedResourcePlan(), {
          dimensions: SYNTHETIC_TRANSPOSED_DIMENSIONS,
        })
        .some((entry) => entry.message.includes("execution dimensions"))
    ).toBe(true);
  });
});
