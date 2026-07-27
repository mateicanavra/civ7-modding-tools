import { describe, expect, it, spyOn } from "bun:test";

import { createMockAdapter, type ResourcePlacementOutcome } from "@civ7/adapter";
import { artifacts as resourceSupportArtifacts } from "@mapgen/domain/resources/modules/support/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import type { ArtifactValueOf } from "@swooper/mapgen-core/authoring";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";

import { PlaceResourcesStep } from "../../../../../../src/recipes/standard/stages/placement/steps/place-resources/step.js";
import { TEST_MAP_LATITUDE_BOUNDS, TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

type ResourcePlanAdjusted = ArtifactValueOf<typeof resourceSupportArtifacts.resourcePlanAdjusted>;
type PlanIntent = ResourcePlanAdjusted["intents"][number];
type MockAdapterOptions = NonNullable<Parameters<typeof createMockAdapter>[0]>;
type PlacedResourceOutcome = Extract<ResourcePlacementOutcome, { status: "placed" }>;

function intent(
  plotIndex: number,
  resourceType: PlanIntent["resourceType"],
  phase: PlanIntent["phase"] = "rotation"
): PlanIntent {
  const { width } = TEST_MAP_SIZE.dimensions;
  const y = Math.floor(plotIndex / width);
  return {
    plotIndex,
    x: plotIndex - y * width,
    y,
    resourceType,
    family: "geological",
    laneId: "materialization-test",
    laneKind: "land",
    phase,
    order: plotIndex,
    regionSlot: 1,
    landmassId: 0,
    inHabitat: true,
  };
}

function plan(intents: PlanIntent[]): ResourcePlanAdjusted {
  return {
    ...TEST_MAP_SIZE.dimensions,
    seed: TEST_MAP_SEED,
    plannedCount: intents.length,
    moveCount: 0,
    addCount: 0,
    intents,
    adjustments: [],
    shortfalls: [],
    perStart: [],
    equity: { gapBefore: null, gapAfter: null },
    settings: {
      enabled: true,
      supportFloor: 2,
      supportRadiusTiles: 4,
      equityTolerance: 2,
      strength: 1,
    },
  };
}

function createResourceContext(
  canHaveResource: NonNullable<MockAdapterOptions["canHaveResource"]> = () => true
) {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const adapter = createMockAdapter({
    width,
    height,
    mapInfo: TEST_MAP_SIZE.mapInfo,
    mapSizeId: TEST_MAP_SIZE.id,
    rng: createLabelRng(TEST_MAP_SEED),
    canHaveResource,
  });
  const context = createMapContext({
    setup: admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: TEST_MAP_LATITUDE_BOUNDS,
    }),
    adapter,
  });
  return { adapter, context };
}

function executeResourceStep(
  context: ReturnType<typeof createMapContext>,
  adjustedPlan: ResourcePlanAdjusted
): Exclude<ReturnType<typeof PlaceResourcesStep.run>, Promise<unknown>> {
  return withMapContextExecutionForTest(context, (stepContext) => {
    publishTestArtifact(stepContext, resourceSupportArtifacts.resourcePlanAdjusted, adjustedPlan);
    const result = PlaceResourcesStep.run(
      stepContext,
      {},
      {},
      buildStepTestDependencies(PlaceResourcesStep, stepContext)
    );
    if (result instanceof Promise) {
      throw new Error("Resource placement materialization must remain synchronous.");
    }
    return result;
  });
}

describe("resource placement materialization", () => {
  it("stamps the adjusted plan verbatim and measures typed per-resource shortfalls", () => {
    const { context } = createResourceContext((_x, _y, resourceType) => resourceType !== 9);
    const evidence = executeResourceStep(
      context,
      plan([
        intent(0, "RESOURCE_GOLD"),
        intent(1, "RESOURCE_JADE"),
        intent(5, "RESOURCE_JADE", "range-floor"),
        intent(6, "RESOURCE_GOLD"),
      ])
    );

    expect(evidence.summary).toMatchObject({
      plannedCount: 4,
      placedCount: 2,
      rejectedCount: 2,
      byReason: [{ reason: "cannot-have-resource", count: 2 }],
      shortfalls: [{ resourceType: 9, reason: "cannot-have-resource", count: 2 }],
      byPhase: { rotation: 2, rangeFloor: 0, regionMinimum: 0, support: 0 },
    });
    expect(evidence.outcomes.map((row) => [row.plotIndex, row.resourceType, row.status])).toEqual([
      [0, 4, "placed"],
      [1, 9, "rejected"],
      [5, 9, "rejected"],
      [6, 4, "placed"],
    ]);
  });

  it("never relocates an engine-rejected intent", () => {
    const { context } = createResourceContext(() => false);
    const evidence = executeResourceStep(
      context,
      plan([intent(2, "RESOURCE_GOLD"), intent(3, "RESOURCE_GOLD")])
    );

    expect(evidence.summary).toMatchObject({
      placedCount: 0,
      rejectedCount: 2,
    });
    expect(evidence.outcomes.map((outcome) => outcome.plotIndex)).toEqual([2, 3]);
  });

  it("fails the placement product boundary on wrong-type engine readback", () => {
    const { adapter, context } = createResourceContext();
    adapter.placeResourceIntent = (placementIntent) => {
      const y = Math.floor(placementIntent.plotIndex / adapter.width);
      return {
        status: "mismatch",
        plotIndex: placementIntent.plotIndex,
        x: placementIntent.plotIndex - y * adapter.width,
        y,
        resourceType: placementIntent.resourceType,
        observedResourceType: placementIntent.resourceType + 1,
        reason: "wrong-resource-type",
      };
    };
    const log = spyOn(console, "log").mockImplementation(() => {});
    try {
      expect(() => executeResourceStep(context, plan([intent(2, "RESOURCE_GOLD")]))).toThrow(
        /mismatch|wrong-type/
      );
      expect(adapter.calls.emitRuntimeWarning).toEqual([]);
      expect(log).not.toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });

  it("refuses adapter identity drift before terminal placement evidence escapes", () => {
    const log = spyOn(console, "log").mockImplementation(() => {});
    try {
      const driftCases: readonly ((outcome: PlacedResourceOutcome) => PlacedResourceOutcome)[] = [
        (outcome) => ({ ...outcome, plotIndex: outcome.plotIndex + 1 }),
        (outcome) => ({ ...outcome, x: outcome.x + 1 }),
        (outcome) => ({ ...outcome, y: outcome.y + 1 }),
        (outcome) => ({ ...outcome, resourceType: outcome.resourceType + 1 }),
      ];
      for (const drift of driftCases) {
        const { adapter, context } = createResourceContext();
        adapter.placeResourceIntent = (placementIntent) => {
          const y = Math.floor(placementIntent.plotIndex / adapter.width);
          return drift({
            status: "placed",
            plotIndex: placementIntent.plotIndex,
            x: placementIntent.plotIndex - y * adapter.width,
            y,
            resourceType: placementIntent.resourceType,
            observedResourceType: placementIntent.resourceType,
          });
        };
        expect(() => executeResourceStep(context, plan([intent(2, "RESOURCE_GOLD")]))).toThrow(
          /identity/
        );
        expect(adapter.calls.emitRuntimeWarning).toEqual([]);
      }
      expect(log).not.toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });

  it("fails when a contract-violating adapter labels wrong-type readback as placed", () => {
    const { adapter, context } = createResourceContext();
    adapter.placeResourceIntent = (placementIntent) => {
      const y = Math.floor(placementIntent.plotIndex / adapter.width);
      return {
        status: "placed",
        plotIndex: placementIntent.plotIndex,
        x: placementIntent.plotIndex - y * adapter.width,
        y,
        resourceType: placementIntent.resourceType,
        observedResourceType: placementIntent.resourceType + 1,
      };
    };
    const log = spyOn(console, "log").mockImplementation(() => {});
    try {
      expect(() => executeResourceStep(context, plan([intent(2, "RESOURCE_GOLD")]))).toThrow(
        /wrong-type readback/
      );
      expect(adapter.calls.emitRuntimeWarning).toEqual([]);
      expect(log).not.toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });
});
