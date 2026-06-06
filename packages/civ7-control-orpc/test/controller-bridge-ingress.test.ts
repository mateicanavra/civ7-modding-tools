import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7ControllerBridgeCityPopulationPlacementRequestSchema,
  Civ7ControllerBridgeCityPopulationPlacementSuccessResponseSchema,
  Civ7ControllerBridgeCityProductionChoiceRequestSchema,
  Civ7ControllerBridgeCityProductionChoiceSuccessResponseSchema,
  Civ7ControllerBridgeCityTownFocusChangeRequestSchema,
  Civ7ControllerBridgeCityTownFocusChangeSuccessResponseSchema,
  Civ7ControllerBridgeCityTownFocusReviewRequestSchema,
  Civ7ControllerBridgeCityTownFocusReviewSuccessResponseSchema,
  Civ7ControllerBridgeDiplomacyResponseRequestSchema,
  Civ7ControllerBridgeDiplomacyResponseSuccessResponseSchema,
  Civ7ControllerBridgeFirstMeetResponseRequestSchema,
  Civ7ControllerBridgeFirstMeetResponseSuccessResponseSchema,
  Civ7ControllerBridgeGovernmentCelebrationChoiceRequestSchema,
  Civ7ControllerBridgeGovernmentCelebrationChoiceSuccessResponseSchema,
  Civ7ControllerBridgeGovernmentChoiceRequestSchema,
  Civ7ControllerBridgeGovernmentChoiceSuccessResponseSchema,
  Civ7ControllerBridgeNarrativeChoiceRequestSchema,
  Civ7ControllerBridgeNarrativeChoiceSuccessResponseSchema,
  Civ7ControllerBridgeProgressionCultureChoiceRequestSchema,
  Civ7ControllerBridgeProgressionCultureChoiceSuccessResponseSchema,
  Civ7ControllerBridgeProgressionCultureTargetRequestSchema,
  Civ7ControllerBridgeProgressionCultureTargetSuccessResponseSchema,
  Civ7ControllerBridgeProgressionAttributePurchaseRequestSchema,
  Civ7ControllerBridgeProgressionAttributePurchaseSuccessResponseSchema,
  Civ7ControllerBridgeProgressionAttributeReviewRequestSchema,
  Civ7ControllerBridgeProgressionAttributeReviewSuccessResponseSchema,
  Civ7ControllerBridgeProgressionTechnologyChoiceRequestSchema,
  Civ7ControllerBridgeProgressionTechnologyChoiceSuccessResponseSchema,
  Civ7ControllerBridgeProgressionTechnologyTargetRequestSchema,
  Civ7ControllerBridgeProgressionTechnologyTargetSuccessResponseSchema,
  Civ7ControllerBridgeProgressionTraditionChangeRequestSchema,
  Civ7ControllerBridgeProgressionTraditionChangeSuccessResponseSchema,
  Civ7ControllerBridgeProgressionTraditionReviewRequestSchema,
  Civ7ControllerBridgeProgressionTraditionReviewSuccessResponseSchema,
  Civ7ControllerBridgeResponseSchema,
  Civ7ControllerBridgeStrategyFrontSummaryRequestSchema,
  Civ7ControllerBridgeStrategyFrontSummarySuccessResponseSchema,
  Civ7ControllerBridgeUnitResettleRequestSchema,
  Civ7ControllerBridgeUnitResettleSuccessResponseSchema,
  Civ7ControllerBridgeUnitTargetActionRequestSchema,
  Civ7ControllerBridgeUnitTargetActionSuccessResponseSchema,
  Civ7ControllerBridgeUnitUpgradeRequestSchema,
  Civ7ControllerBridgeUnitUpgradeSuccessResponseSchema,
  Civ7ControllerBridgeWorldCurrentRequestSchema,
  Civ7ControllerBridgeWorldCurrentSuccessResponseSchema,
  Civ7ControllerBridgeWorldGridReadRequestSchema,
  Civ7ControllerBridgeWorldGridReadSuccessResponseSchema,
  Civ7ControllerBridgeWorldPlotReadRequestSchema,
  Civ7ControllerBridgeWorldPlotReadSuccessResponseSchema,
  createCiv7ControllerBridgeIngress,
  invokeCiv7ControllerBridgeRequest,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcPlayableStatusResult,
  type Civ7ControllerBridgeCityPopulationPlacementRequest,
  type Civ7ControllerBridgeCityPopulationPlacementSuccessResponse,
  type Civ7ControllerBridgeCityProductionChoiceRequest,
  type Civ7ControllerBridgeCityProductionChoiceSuccessResponse,
  type Civ7ControllerBridgeCityTownFocusChangeRequest,
  type Civ7ControllerBridgeCityTownFocusChangeSuccessResponse,
  type Civ7ControllerBridgeCityTownFocusReviewRequest,
  type Civ7ControllerBridgeCityTownFocusReviewSuccessResponse,
  type Civ7ControllerBridgeDiplomacyResponseRequest,
  type Civ7ControllerBridgeDiplomacyResponseSuccessResponse,
  type Civ7ControllerBridgeFirstMeetResponseRequest,
  type Civ7ControllerBridgeFirstMeetResponseSuccessResponse,
  type Civ7ControllerBridgeGovernmentCelebrationChoiceRequest,
  type Civ7ControllerBridgeGovernmentCelebrationChoiceSuccessResponse,
  type Civ7ControllerBridgeGovernmentChoiceRequest,
  type Civ7ControllerBridgeGovernmentChoiceSuccessResponse,
  type Civ7ControllerBridgeNarrativeChoiceRequest,
  type Civ7ControllerBridgeNarrativeChoiceSuccessResponse,
  type Civ7ControllerBridgeProgressionCultureChoiceRequest,
  type Civ7ControllerBridgeProgressionCultureChoiceSuccessResponse,
  type Civ7ControllerBridgeProgressionCultureTargetRequest,
  type Civ7ControllerBridgeProgressionCultureTargetSuccessResponse,
  type Civ7ControllerBridgeProgressionAttributePurchaseRequest,
  type Civ7ControllerBridgeProgressionAttributePurchaseSuccessResponse,
  type Civ7ControllerBridgeProgressionAttributeReviewRequest,
  type Civ7ControllerBridgeProgressionAttributeReviewSuccessResponse,
  type Civ7ControllerBridgeProgressionTechnologyChoiceRequest,
  type Civ7ControllerBridgeProgressionTechnologyChoiceSuccessResponse,
  type Civ7ControllerBridgeProgressionTechnologyTargetRequest,
  type Civ7ControllerBridgeProgressionTechnologyTargetSuccessResponse,
  type Civ7ControllerBridgeProgressionTraditionChangeRequest,
  type Civ7ControllerBridgeProgressionTraditionChangeSuccessResponse,
  type Civ7ControllerBridgeProgressionTraditionReviewRequest,
  type Civ7ControllerBridgeProgressionTraditionReviewSuccessResponse,
  type Civ7ControllerBridgeStrategyFrontSummaryRequest,
  type Civ7ControllerBridgeStrategyFrontSummarySuccessResponse,
  type Civ7ControllerBridgeUnitResettleRequest,
  type Civ7ControllerBridgeUnitResettleSuccessResponse,
  type Civ7ControllerBridgeUnitTargetActionRequest,
  type Civ7ControllerBridgeUnitTargetActionSuccessResponse,
  type Civ7ControllerBridgeUnitUpgradeRequest,
  type Civ7ControllerBridgeUnitUpgradeSuccessResponse,
  type Civ7ControllerBridgeWorldCurrentRequest,
  type Civ7ControllerBridgeWorldCurrentSuccessResponse,
  type Civ7ControllerBridgeWorldGridReadRequest,
  type Civ7ControllerBridgeWorldGridReadSuccessResponse,
  type Civ7ControllerBridgeWorldPlotReadRequest,
  type Civ7ControllerBridgeWorldPlotReadSuccessResponse,
} from "../src/index";

type TestControllerContext = Civ7ControlOrpcContext & Readonly<{
  controllerProof?: unknown;
}>;

const notificationId = { owner: 0, id: 113, type: 20 };
const unitId = { owner: 0, id: 458_752, type: 26 };
const target = { x: 22, y: 31 };
const cityId = { owner: 0, id: 65_536, type: 1 };
const productionArgs = { ConstructibleType: 713_967_338, X: 22, Y: 31 };
const workerLocation = 2543;
const townFocusInput = {
  cityId,
  growthType: -284_569_333,
  projectType: -548_685_232,
};
const narrativeTarget = { owner: 0, id: 7_001, type: 12 };
const narrativeInput = {
  playerId: 2,
  targetType: "DISCOVERY_STORY",
  target: narrativeTarget,
  action: 1,
};
const diplomacyInput = {
  playerId: 2,
  actionId: 8_821,
  responseType: -1_713_616_684,
  notificationId,
};
const firstMeetInput = {
  playerId: 2,
  metPlayerId: 2,
  responseType: 673_478_009,
};
const governmentInput = {
  governmentType: 0,
  action: -1_326_475_004,
};
const celebrationInput = {
  goldenAgeType: -340_825_966,
};
const progressionTechnologyInput = {
  playerId: 2,
  node: 18_001,
  notificationId,
};
const progressionCultureInput = {
  playerId: 2,
  node: 27_001,
  notificationId,
};
const progressionTargetInput = {
  node: 18_001,
};
const attributePurchaseInput = {
  node: 20,
};
const traditionChangeInput = {
  traditionType: -331_546_976,
  action: -1_326_475_004,
};

type PublicControllerBridgeSchemaTypeCoverage = Readonly<[
  Civ7ControllerBridgeStrategyFrontSummaryRequest,
  Civ7ControllerBridgeStrategyFrontSummarySuccessResponse,
  Civ7ControllerBridgeWorldCurrentRequest,
  Civ7ControllerBridgeWorldCurrentSuccessResponse,
  Civ7ControllerBridgeWorldPlotReadRequest,
  Civ7ControllerBridgeWorldPlotReadSuccessResponse,
  Civ7ControllerBridgeWorldGridReadRequest,
  Civ7ControllerBridgeWorldGridReadSuccessResponse,
  Civ7ControllerBridgeCityProductionChoiceRequest,
  Civ7ControllerBridgeCityProductionChoiceSuccessResponse,
  Civ7ControllerBridgeCityPopulationPlacementRequest,
  Civ7ControllerBridgeCityPopulationPlacementSuccessResponse,
  Civ7ControllerBridgeCityTownFocusChangeRequest,
  Civ7ControllerBridgeCityTownFocusChangeSuccessResponse,
  Civ7ControllerBridgeCityTownFocusReviewRequest,
  Civ7ControllerBridgeCityTownFocusReviewSuccessResponse,
  Civ7ControllerBridgeNarrativeChoiceRequest,
  Civ7ControllerBridgeNarrativeChoiceSuccessResponse,
  Civ7ControllerBridgeDiplomacyResponseRequest,
  Civ7ControllerBridgeDiplomacyResponseSuccessResponse,
  Civ7ControllerBridgeFirstMeetResponseRequest,
  Civ7ControllerBridgeFirstMeetResponseSuccessResponse,
  Civ7ControllerBridgeGovernmentChoiceRequest,
  Civ7ControllerBridgeGovernmentChoiceSuccessResponse,
  Civ7ControllerBridgeGovernmentCelebrationChoiceRequest,
  Civ7ControllerBridgeGovernmentCelebrationChoiceSuccessResponse,
  Civ7ControllerBridgeUnitTargetActionRequest,
  Civ7ControllerBridgeUnitTargetActionSuccessResponse,
  Civ7ControllerBridgeUnitUpgradeRequest,
  Civ7ControllerBridgeUnitUpgradeSuccessResponse,
  Civ7ControllerBridgeUnitResettleRequest,
  Civ7ControllerBridgeUnitResettleSuccessResponse,
  Civ7ControllerBridgeProgressionTechnologyChoiceRequest,
  Civ7ControllerBridgeProgressionTechnologyChoiceSuccessResponse,
  Civ7ControllerBridgeProgressionCultureChoiceRequest,
  Civ7ControllerBridgeProgressionCultureChoiceSuccessResponse,
  Civ7ControllerBridgeProgressionTechnologyTargetRequest,
  Civ7ControllerBridgeProgressionTechnologyTargetSuccessResponse,
  Civ7ControllerBridgeProgressionCultureTargetRequest,
  Civ7ControllerBridgeProgressionCultureTargetSuccessResponse,
  Civ7ControllerBridgeProgressionAttributePurchaseRequest,
  Civ7ControllerBridgeProgressionAttributePurchaseSuccessResponse,
  Civ7ControllerBridgeProgressionAttributeReviewRequest,
  Civ7ControllerBridgeProgressionAttributeReviewSuccessResponse,
  Civ7ControllerBridgeProgressionTraditionChangeRequest,
  Civ7ControllerBridgeProgressionTraditionChangeSuccessResponse,
  Civ7ControllerBridgeProgressionTraditionReviewRequest,
  Civ7ControllerBridgeProgressionTraditionReviewSuccessResponse,
]>;

const publicControllerBridgeSchemaTypeCoverage = <_T>() => undefined;

describe("Civ7 controller bridge ingress", () => {
  test("exports every allowlisted controller bridge envelope schema from the package root", () => {
    const publicSchemas = [
      Civ7ControllerBridgeStrategyFrontSummaryRequestSchema,
      Civ7ControllerBridgeStrategyFrontSummarySuccessResponseSchema,
      Civ7ControllerBridgeWorldCurrentRequestSchema,
      Civ7ControllerBridgeWorldCurrentSuccessResponseSchema,
      Civ7ControllerBridgeWorldPlotReadRequestSchema,
      Civ7ControllerBridgeWorldPlotReadSuccessResponseSchema,
      Civ7ControllerBridgeWorldGridReadRequestSchema,
      Civ7ControllerBridgeWorldGridReadSuccessResponseSchema,
      Civ7ControllerBridgeCityProductionChoiceRequestSchema,
      Civ7ControllerBridgeCityProductionChoiceSuccessResponseSchema,
      Civ7ControllerBridgeCityPopulationPlacementRequestSchema,
      Civ7ControllerBridgeCityPopulationPlacementSuccessResponseSchema,
      Civ7ControllerBridgeCityTownFocusChangeRequestSchema,
      Civ7ControllerBridgeCityTownFocusChangeSuccessResponseSchema,
      Civ7ControllerBridgeCityTownFocusReviewRequestSchema,
      Civ7ControllerBridgeCityTownFocusReviewSuccessResponseSchema,
      Civ7ControllerBridgeNarrativeChoiceRequestSchema,
      Civ7ControllerBridgeNarrativeChoiceSuccessResponseSchema,
      Civ7ControllerBridgeDiplomacyResponseRequestSchema,
      Civ7ControllerBridgeDiplomacyResponseSuccessResponseSchema,
      Civ7ControllerBridgeFirstMeetResponseRequestSchema,
      Civ7ControllerBridgeFirstMeetResponseSuccessResponseSchema,
      Civ7ControllerBridgeGovernmentChoiceRequestSchema,
      Civ7ControllerBridgeGovernmentChoiceSuccessResponseSchema,
      Civ7ControllerBridgeGovernmentCelebrationChoiceRequestSchema,
      Civ7ControllerBridgeGovernmentCelebrationChoiceSuccessResponseSchema,
      Civ7ControllerBridgeUnitTargetActionRequestSchema,
      Civ7ControllerBridgeUnitTargetActionSuccessResponseSchema,
      Civ7ControllerBridgeUnitUpgradeRequestSchema,
      Civ7ControllerBridgeUnitUpgradeSuccessResponseSchema,
      Civ7ControllerBridgeUnitResettleRequestSchema,
      Civ7ControllerBridgeUnitResettleSuccessResponseSchema,
      Civ7ControllerBridgeProgressionTechnologyChoiceRequestSchema,
      Civ7ControllerBridgeProgressionTechnologyChoiceSuccessResponseSchema,
      Civ7ControllerBridgeProgressionCultureChoiceRequestSchema,
      Civ7ControllerBridgeProgressionCultureChoiceSuccessResponseSchema,
      Civ7ControllerBridgeProgressionTechnologyTargetRequestSchema,
      Civ7ControllerBridgeProgressionTechnologyTargetSuccessResponseSchema,
      Civ7ControllerBridgeProgressionCultureTargetRequestSchema,
      Civ7ControllerBridgeProgressionCultureTargetSuccessResponseSchema,
      Civ7ControllerBridgeProgressionAttributePurchaseRequestSchema,
      Civ7ControllerBridgeProgressionAttributePurchaseSuccessResponseSchema,
      Civ7ControllerBridgeProgressionAttributeReviewRequestSchema,
      Civ7ControllerBridgeProgressionAttributeReviewSuccessResponseSchema,
      Civ7ControllerBridgeProgressionTraditionChangeRequestSchema,
      Civ7ControllerBridgeProgressionTraditionChangeSuccessResponseSchema,
      Civ7ControllerBridgeProgressionTraditionReviewRequestSchema,
      Civ7ControllerBridgeProgressionTraditionReviewSuccessResponseSchema,
    ];

    expect(
      publicControllerBridgeSchemaTypeCoverage<
        PublicControllerBridgeSchemaTypeCoverage
      >(),
    ).toBeUndefined();
    for (const schema of publicSchemas) {
      expect(schema).toEqual(expect.objectContaining({
        additionalProperties: false,
        type: "object",
      }));
    }
  });

  test("invokes allowlisted readiness.current through the in-process router", async () => {
    const fake = fakeContext(playableStatusResult());
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "controller-readiness-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "readiness.current",
      correlationId: "controller-readiness-1",
      output: {
        playable: true,
        readiness: "tuner-ready",
        capability: {
          canObserve: true,
          canMutate: true,
        },
      },
    });
    expect(fake.calls).toEqual([{ timeoutMs: 1_000 }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "readiness.current",
      input: {},
      correlationId: "controller-readiness-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("Game.turn");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted attention.current through the in-process router", async () => {
    const unitId = { owner: 0, id: 458_752, type: 26 };
    const fake = fakeAttentionContext(unitId);
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "attention.current",
      input: { maxNotifications: 4 },
      correlationId: "controller-attention-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "attention.current",
      correlationId: "controller-attention-1",
      output: {
        playable: true,
        readiness: "tuner-ready",
        sourceStatus: {
          playableStatus: "read",
          notifications: "read",
          turnCompletion: "read",
          readyUnit: "read",
          readyCity: "read",
        },
        summary: {
          blockerCount: 1,
          decisionCount: 0,
          readyActorCount: 1,
          nextStepCount: 1,
        },
      },
    });
    expect(fake.calls.notifications).toEqual([
      { timeoutMs: 1_000, maxNotifications: 4 },
    ]);
    expect(fake.calls.readyUnit).toEqual([
      { input: {}, options: { timeoutMs: 1_000 } },
    ]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "attention.current",
      input: { maxNotifications: 4 },
      correlationId: "controller-attention-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("Game.turn");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted world.current through the in-process router", async () => {
    const fake = fakeContext(playableStatusResult());
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return {
          ...fake.context,
          controller: {
            supportedReadProcedures: ["world.current"],
          },
        };
      },
    });

    const response = await ingress.invoke({
      procedureKey: "world.current",
      input: {},
      correlationId: "controller-world-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "world.current",
      correlationId: "controller-world-1",
      output: {
        playable: true,
        readiness: "tuner-ready",
        sourceStatus: {
          playableStatus: "read",
          game: "read",
          map: "read",
          players: "read",
        },
        map: {
          width: 84,
          height: 52,
        },
        players: {
          alivePlayerIds: [0, 1, 2],
          aliveHumanIds: [0],
        },
      },
    });
    expect(fake.calls).toEqual([{ timeoutMs: 1_000 }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "world.current",
      input: {},
      correlationId: "controller-world-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("relationship");
  });

  test("invokes allowlisted world.plot.read through the in-process router", async () => {
    const fake = fakeWorldMapContext();
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "world.plot.read",
      input: {
        location: { x: 3, y: 4 },
        fields: ["terrain", "owner"],
        playerId: 0,
      },
      correlationId: "controller-world-plot-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "world.plot.read",
      correlationId: "controller-world-plot-1",
      output: {
        sourceStatus: {
          plot: "read",
        },
        plot: {
          location: {
            x: 3,
            y: 4,
            index: 3_004,
          },
          hiddenInfoPolicy: "visibility-filtered",
          facts: {
            terrain: { ok: true, value: 7 },
            owner: { ok: true, value: 0 },
          },
        },
      },
    });
    expect(fake.calls.plot).toEqual([{
      input: {
        x: 3,
        y: 4,
        fields: ["terrain", "owner"],
        playerId: 0,
        includeHidden: undefined,
      },
      options: { timeoutMs: 1_000 },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "world.plot.read",
      input: {
        location: { x: 3, y: 4 },
        fields: ["terrain", "owner"],
        playerId: 0,
      },
      correlationId: "controller-world-plot-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("relationship");
  });

  test("invokes allowlisted world.grid.read through the in-process router", async () => {
    const fake = fakeWorldMapContext();
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "world.grid.read",
      input: {
        bounds: { x: 3, y: 4, width: 2, height: 1 },
        fields: ["terrain"],
        maxPlots: 1,
      },
      correlationId: "controller-world-grid-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "world.grid.read",
      correlationId: "controller-world-grid-1",
      output: {
        sourceStatus: {
          grid: "read-with-omissions",
          map: "read",
        },
        bounds: { x: 3, y: 4, width: 2, height: 1 },
        fields: ["terrain"],
        plotCount: 2,
        omitted: 1,
        plots: [
          {
            location: { x: 3, y: 4, index: 3_004 },
            facts: { terrain: { ok: true, value: 7 } },
          },
        ],
      },
    });
    expect(fake.calls.grid).toEqual([{
      input: {
        bounds: { x: 3, y: 4, width: 2, height: 1 },
        fields: ["terrain"],
        playerId: undefined,
        includeHidden: undefined,
        maxPlots: 1,
      },
      options: { timeoutMs: 1_000 },
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("relationship");
  });

  test("rejects raw world plot/grid controller envelopes before dispatch", async () => {
    const fake = fakeWorldMapContext();
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: () => fake.context,
    });

    const plotResponse = await ingress.invoke({
      procedureKey: "world.plot.read",
      input: {
        location: { x: 3, y: 4 },
        rawCommand: "GameplayMap.getTerrainType(3, 4)",
      },
    });
    const gridResponse = await ingress.invoke({
      procedureKey: "world.grid.read",
      input: {
        bounds: { x: 3, y: 4, width: 2, height: 1 },
        fields: ["terrain"],
        state: { id: "65535", name: "App UI" },
      },
    });

    expect(plotResponse).toEqual({
      ok: false,
      error: {
        code: "BRIDGE_BAD_REQUEST",
        message: "Civ7 controller bridge request envelope is invalid.",
        reason: "invalid-envelope",
      },
    });
    expect(gridResponse).toEqual({
      ok: false,
      error: {
        code: "BRIDGE_BAD_REQUEST",
        message: "Civ7 controller bridge request envelope is invalid.",
        reason: "invalid-envelope",
      },
    });
    expect(fake.calls.plot).toEqual([]);
    expect(fake.calls.grid).toEqual([]);
  });

  test("invokes allowlisted notifications.dismiss.request through the in-process router with controller proof", async () => {
    const fake = fakeNotificationDismissContext();
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "notifications.dismiss.request",
      input: { notificationId },
      correlationId: "controller-notification-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "notifications.dismiss.request",
      correlationId: "controller-notification-1",
      output: {
        notificationId,
        sent: true,
        status: "sent-confirmed",
        postcondition: {
          classification: "notification-disappeared",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
      },
    });
    expect(fake.calls.status).toEqual([{ timeoutMs: 1_000 }]);
    expect(fake.calls.dismissal).toEqual([{
      input: { notificationId },
      options: { timeoutMs: 1_000 },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "notifications.dismiss.request",
      input: { notificationId },
      correlationId: "controller-notification-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");

    expect(serialized).not.toContain("NotificationModel.manager.dismiss");
    expect(serialized).not.toContain("Game.Notifications.dismiss");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted turn.complete.request through the in-process router with controller proof", async () => {
    const fake = fakeTurnCompleteContext();
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "turn.complete.request",
      input: {},
      correlationId: "controller-turn-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "turn.complete.request",
      correlationId: "controller-turn-1",
      output: {
        sent: true,
        status: "sent-guarded",
        postcondition: {
          classification: "turn-complete-sent",
          confirmed: true,
          noRepeatAfterUnverified: true,
        },
      },
    });
    expect(fake.calls.status).toEqual([{ timeoutMs: 1_000 }]);
    expect(fake.calls.turnCompletion).toEqual([{
      options: { timeoutMs: 1_000 },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "turn.complete.request",
      input: {},
      correlationId: "controller-turn-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");

    expect(serialized).not.toContain("GameContext.sendTurnComplete");
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted unit.target.action.request through the in-process router with controller proof", async () => {
    const fake = fakeUnitTargetActionContext();
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "unit.target.action.request",
      input: { unitId, ...target },
      correlationId: "controller-unit-target-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "unit.target.action.request",
      correlationId: "controller-unit-target-1",
      output: {
        unitId,
        target,
        sent: true,
        status: "sent-confirmed",
        postcondition: {
          classification: "target-reached",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
      },
    });
    expect(fake.calls.status).toEqual([{ timeoutMs: 1_000 }]);
    expect(fake.calls.targetAction).toEqual([{
      input: { unitId, ...target },
      options: { timeoutMs: 1_000 },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "unit.target.action.request",
      input: { unitId, ...target },
      correlationId: "controller-unit-target-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");

    expect(serialized).not.toContain("Game.UnitOperations.sendRequest");
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted unit.upgrade.request through the in-process router with controller proof", async () => {
    const fake = fakeUnitCommandContext("upgrade");
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "unit.upgrade.request",
      input: { unitId },
      correlationId: "controller-unit-upgrade-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "unit.upgrade.request",
      correlationId: "controller-unit-upgrade-1",
      output: {
        action: {
          kind: "upgrade",
          unitId,
        },
        sent: true,
        status: "sent-confirmed",
        postcondition: {
          classification: "queue-advanced",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
      },
    });
    expect(fake.calls.status).toEqual([{ timeoutMs: 1_000 }]);
    expect(fake.calls.unitCommand).toEqual([{
      input: {
        unitId,
        operationType: "UNITCOMMAND_UPGRADE",
        args: {},
      },
      options: { timeoutMs: 1_000 },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "unit.upgrade.request",
      input: { unitId },
      correlationId: "controller-unit-upgrade-1",
    }]);

    expectSemanticControllerOutputOmitsRawUnitCommand(response);
  });

  test("invokes allowlisted unit.resettle.request through the in-process router with controller proof", async () => {
    const fake = fakeUnitCommandContext("resettle");
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "unit.resettle.request",
      input: {
        unitId,
        destination: target,
      },
      correlationId: "controller-unit-resettle-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "unit.resettle.request",
      correlationId: "controller-unit-resettle-1",
      output: {
        action: {
          kind: "resettle",
          unitId,
          destination: target,
        },
        sent: true,
        status: "sent-confirmed",
        postcondition: {
          classification: "unit-state-changed",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
      },
    });
    expect(fake.calls.unitCommand).toEqual([{
      input: {
        unitId,
        operationType: "UNITCOMMAND_RESETTLE",
        args: {
          X: 22,
          Y: 31,
        },
      },
      options: { timeoutMs: 1_000 },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "unit.resettle.request",
      input: {
        unitId,
        destination: target,
      },
      correlationId: "controller-unit-resettle-1",
    }]);

    expectSemanticControllerOutputOmitsRawUnitCommand(response);
  });

  test("invokes allowlisted city.production.choice.request through the in-process router with controller proof", async () => {
    const fake = fakeProductionChoiceContext();
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "city.production.choice.request",
      input: { cityId, args: productionArgs },
      correlationId: "controller-production-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "city.production.choice.request",
      correlationId: "controller-production-1",
      output: {
        cityId,
        args: productionArgs,
        sent: true,
        status: "sent-confirmed",
        postcondition: {
          classification: "production-choice-cleared",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
      },
    });
    expect(fake.calls.status).toEqual([{ timeoutMs: 1_000 }]);
    expect(fake.calls.production).toEqual([{
      input: { cityId, args: productionArgs },
      options: { timeoutMs: 1_000 },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "city.production.choice.request",
      input: { cityId, args: productionArgs },
      correlationId: "controller-production-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");

    expect(serialized).not.toContain("Game.CityOperations.sendRequest");
    expect(serialized).not.toContain("Game.CityOperations.canStart");
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted city.population.place.request through the in-process router with controller proof", async () => {
    const fake = fakePopulationPlacementContext();
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "city.population.place.request",
      input: {
        mode: "assign-worker",
        playerId: 0,
        location: workerLocation,
      },
      correlationId: "controller-population-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "city.population.place.request",
      correlationId: "controller-population-1",
      output: {
        placement: {
          mode: "assign-worker",
          playerId: 0,
          location: workerLocation,
        },
        sent: true,
        status: "sent-confirmed",
        postcondition: {
          classification: "population-ready-cleared",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
      },
    });
    expect(fake.calls.status).toEqual([{ timeoutMs: 1_000 }]);
    expect(fake.calls.population).toEqual([{
      method: "requestCiv7AssignWorkerPlacement",
      input: { playerId: 0, location: workerLocation },
      options: { timeoutMs: 1_000 },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "city.population.place.request",
      input: {
        mode: "assign-worker",
        playerId: 0,
        location: workerLocation,
      },
      correlationId: "controller-population-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");

    expect(serialized).not.toContain("Game.PlayerOperations.sendRequest");
    expect(serialized).not.toContain("Game.CityCommands.sendRequest");
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted city.townFocus.change.request through the in-process router with controller proof", async () => {
    const fake = fakeTownFocusContext();
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "city.townFocus.change.request",
      input: townFocusInput,
      correlationId: "controller-town-focus-change-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "city.townFocus.change.request",
      correlationId: "controller-town-focus-change-1",
      output: {
        cityId,
        growthType: -284_569_333,
        projectType: -548_685_232,
        city: 65_536,
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "pending-runtime-proof",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
      },
    });
    expect(fake.calls.status).toEqual([{ timeoutMs: 1_000 }]);
    expect(fake.calls.townFocus).toEqual([{
      method: "requestCiv7TownFocusChange",
      input: townFocusInput,
      options: { timeoutMs: 1_000 },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "city.townFocus.change.request",
      input: townFocusInput,
      correlationId: "controller-town-focus-change-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"operation\"");
    expect(serialized).not.toContain("\"verified\"");
    expect(serialized).not.toContain("CHANGE_GROWTH_MODE");
    expect(serialized).not.toContain("Game.CityCommands.sendRequest");
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted city.townFocus.review.request through the in-process router with controller proof", async () => {
    const fake = fakeTownFocusContext();
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "city.townFocus.review.request",
      input: { cityId },
      correlationId: "controller-town-focus-review-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "city.townFocus.review.request",
      correlationId: "controller-town-focus-review-1",
      output: {
        cityId,
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "pending-runtime-proof",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
      },
    });
    expect(fake.calls.townFocus).toEqual([{
      method: "requestCiv7TownFocusReviewCloseout",
      input: { cityId },
      options: { timeoutMs: 1_000 },
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("CONSIDER_TOWN_PROJECT");
    expect(serialized).not.toContain("Game.CityOperations.sendRequest");
  });

  test("invokes allowlisted narrative.choice.request through the in-process router with controller proof", async () => {
    const fake = fakeNarrativeChoiceContext();
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "narrative.choice.request",
      input: narrativeInput,
      correlationId: "controller-narrative-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "narrative.choice.request",
      correlationId: "controller-narrative-1",
      output: {
        playerId: 0,
        targetType: "DISCOVERY_STORY",
        target: narrativeTarget,
        action: 1,
        sent: true,
        status: "sent-confirmed",
        postcondition: {
          classification: "narrative-blocker-cleared",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
      },
    });
    expect(fake.calls.status).toEqual([{ timeoutMs: 1_000 }]);
    expect(fake.calls.narrative).toEqual([{
      input: narrativeInput,
      options: { timeoutMs: 1_000 },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "narrative.choice.request",
      input: narrativeInput,
      correlationId: "controller-narrative-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");

    expect(serialized).not.toContain("Game.PlayerOperations.sendRequest");
    expect(serialized).not.toContain("Game.turn");
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted diplomacy.response.request through the in-process router with controller proof", async () => {
    const fake = fakeDiplomacyResponseContext();
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "diplomacy.response.request",
      input: diplomacyInput,
      correlationId: "controller-diplomacy-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "diplomacy.response.request",
      correlationId: "controller-diplomacy-1",
      output: {
        playerId: 0,
        actionId: 8_821,
        responseType: -1_713_616_684,
        notificationId,
        sent: true,
        status: "sent-confirmed",
        postcondition: {
          classification: "diplomacy-blocker-cleared",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
      },
    });
    expect(fake.calls.status).toEqual([{ timeoutMs: 1_000 }]);
    expect(fake.calls.diplomacy).toEqual([{
      input: diplomacyInput,
      options: { timeoutMs: 1_000 },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "diplomacy.response.request",
      input: diplomacyInput,
      correlationId: "controller-diplomacy-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");
    expect(serialized).not.toContain("\"verified\"");

    expect(serialized).not.toContain("Game.PlayerOperations.sendRequest");
    expect(serialized).not.toContain("DiplomacyManager");
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted diplomacy.firstMeet.response.request through the in-process router with controller proof", async () => {
    const fake = fakeFirstMeetResponseContext();
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "diplomacy.firstMeet.response.request",
      input: firstMeetInput,
      correlationId: "controller-first-meet-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "diplomacy.firstMeet.response.request",
      correlationId: "controller-first-meet-1",
      output: {
        playerId: 0,
        metPlayerId: 2,
        responseType: 673_478_009,
        sent: true,
        status: "sent-confirmed",
        postcondition: {
          classification: "first-meet-cleared",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
      },
    });
    expect(fake.calls.status).toEqual([{ timeoutMs: 1_000 }]);
    expect(fake.calls.views).toEqual([{ timeoutMs: 1_000 }]);
    expect(fake.calls.firstMeet).toEqual([{
      input: {
        playerId: 0,
        metPlayerId: 2,
        responseType: 673_478_009,
      },
      options: { timeoutMs: 1_000 },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "diplomacy.firstMeet.response.request",
      input: firstMeetInput,
      correlationId: "controller-first-meet-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");
    expect(serialized).not.toContain("\"verified\"");
    expect(serialized).not.toContain("RESPOND_DIPLOMATIC_FIRST_MEET");
    expect(serialized).not.toContain("Game.PlayerOperations.sendRequest");
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted government.choice.request through the in-process router with controller proof", async () => {
    const fake = fakeGovernmentChoiceContext();
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "government.choice.request",
      input: governmentInput,
      correlationId: "controller-government-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "government.choice.request",
      correlationId: "controller-government-1",
      output: {
        playerId: 0,
        governmentType: 0,
        action: -1_326_475_004,
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "pending-runtime-proof",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
      },
    });
    expect(fake.calls.status).toEqual([{ timeoutMs: 1_000 }]);
    expect(fake.calls.views).toEqual([{ timeoutMs: 1_000 }]);
    expect(fake.calls.government).toEqual([{
      input: {
        playerId: 0,
        governmentType: 0,
        action: -1_326_475_004,
      },
      options: { timeoutMs: 1_000 },
    }]);
    expect(fake.calls.celebration).toEqual([]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");
    expect(serialized).not.toContain("\"verified\"");
    expect(serialized).not.toContain("Game.PlayerOperations.sendRequest");
  });

  test("invokes allowlisted government.celebration.choice.request through the in-process router with controller proof", async () => {
    const fake = fakeGovernmentChoiceContext();
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "government.celebration.choice.request",
      input: celebrationInput,
      correlationId: "controller-celebration-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "government.celebration.choice.request",
      correlationId: "controller-celebration-1",
      output: {
        playerId: 0,
        goldenAgeType: -340_825_966,
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "pending-runtime-proof",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
      },
    });
    expect(fake.calls.celebration).toEqual([{
      input: {
        playerId: 0,
        goldenAgeType: -340_825_966,
      },
      options: { timeoutMs: 1_000 },
    }]);
    expect(fake.calls.government).toEqual([]);
  });

  test("invokes allowlisted progression technology choice through the in-process router with controller proof", async () => {
    const fake = fakeProgressionChoiceContext();
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "progression.technology.choice.request",
      input: progressionTechnologyInput,
      correlationId: "controller-progression-tech-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "progression.technology.choice.request",
      correlationId: "controller-progression-tech-1",
      output: {
        playerId: 0,
        node: 18_001,
        notificationId,
        sent: true,
        status: "sent-confirmed",
        postcondition: {
          classification: "turn-unblocked",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
      },
    });
    expect(fake.calls.status).toEqual([{ timeoutMs: 1_000 }]);
    expect(fake.calls.views).toEqual([{ timeoutMs: 1_000 }, { timeoutMs: 1_000 }]);
    expect(fake.calls.technology).toEqual([{
      input: {
        playerId: 0,
        node: 18_001,
        notificationId,
      },
      options: { timeoutMs: 1_000 },
    }]);
    expect(fake.calls.culture).toEqual([]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");

    expect(serialized).not.toContain("SET_TECH_TREE_NODE");
    expect(serialized).not.toContain("Game.PlayerOperations.sendRequest");
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted progression culture choice through the in-process router with controller proof", async () => {
    const fake = fakeProgressionChoiceContext("culture");
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "progression.culture.choice.request",
      input: progressionCultureInput,
      correlationId: "controller-progression-culture-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "progression.culture.choice.request",
      correlationId: "controller-progression-culture-1",
      output: {
        playerId: 0,
        node: 27_001,
        notificationId,
        sent: true,
        status: "sent-confirmed",
        postcondition: {
          classification: "turn-unblocked",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
      },
    });
    expect(fake.calls.status).toEqual([{ timeoutMs: 1_000 }]);
    expect(fake.calls.views).toEqual([{ timeoutMs: 1_000 }, { timeoutMs: 1_000 }]);
    expect(fake.calls.technology).toEqual([]);
    expect(fake.calls.culture).toEqual([{
      input: {
        playerId: 0,
        node: 27_001,
        notificationId,
      },
      options: { timeoutMs: 1_000 },
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");

    expect(serialized).not.toContain("SET_CULTURE_TREE_NODE");
    expect(serialized).not.toContain("Game.PlayerOperations.sendRequest");
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted progression technology target through the in-process router with controller proof", async () => {
    const fake = fakeProgressionChoiceContext();
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "progression.technology.target.request",
      input: progressionTargetInput,
      correlationId: "controller-progression-target-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "progression.technology.target.request",
      correlationId: "controller-progression-target-1",
      output: {
        playerId: 0,
        node: 18_001,
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "pending-runtime-proof",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
      },
    });
    expect(fake.calls.technologyTarget).toEqual([{
      input: {
        playerId: 0,
        node: 18_001,
      },
      options: { timeoutMs: 1_000 },
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"operation\"");
    expect(serialized).not.toContain("\"verified\"");
    expect(serialized).not.toContain("SET_TECH_TREE_TARGET_NODE");
    expect(serialized).not.toContain("Game.PlayerOperations.sendRequest");
  });

  test("invokes allowlisted progression attribute purchase through the in-process router with controller proof", async () => {
    const fake = fakeProgressionChoiceContext();
    const ingress = createCiv7ControllerBridgeIngress({
      createContext: (request) => {
        fake.contextRequests.push(request);
        return fake.context;
      },
    });

    const response = await ingress.invoke({
      procedureKey: "progression.attribute.purchase.request",
      input: attributePurchaseInput,
      correlationId: "controller-attribute-purchase-1",
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toMatchObject({
      ok: true,
      procedureKey: "progression.attribute.purchase.request",
      correlationId: "controller-attribute-purchase-1",
      output: {
        playerId: 0,
        node: 20,
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "pending-runtime-proof",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
      },
    });
    expect(fake.calls.attributePurchase).toEqual([{
      input: {
        playerId: 0,
        node: 20,
      },
      options: { timeoutMs: 1_000 },
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"operation\"");
    expect(serialized).not.toContain("\"verified\"");
    expect(serialized).not.toContain("BUY_ATTRIBUTE_TREE_NODE");
    expect(serialized).not.toContain("Game.PlayerOperations.sendRequest");
  });

  test("rejects raw command, session, endpoint, and state envelope fields", async () => {
    const invalidRequests = [
      { procedureKey: "readiness.current", input: {}, host: "127.0.0.1" },
      { procedureKey: "readiness.current", input: {}, port: 4318 },
      { procedureKey: "readiness.current", input: {}, state: { role: "tuner" } },
      { procedureKey: "readiness.current", input: {}, session: { state: "Tuner" } },
      { procedureKey: "readiness.current", input: {}, command: "Game.turn" },
      { procedureKey: "readiness.current", input: {}, rawCommand: "Game.turn" },
      { procedureKey: "readiness.current", input: { rawCommand: "Game.turn" } },
      { procedureKey: "attention.current", input: {}, host: "127.0.0.1" },
      { procedureKey: "attention.current", input: {}, session: { state: "Tuner" } },
      { procedureKey: "attention.current", input: {}, rawCommand: "Game.turn" },
      { procedureKey: "attention.current", input: { rawCommand: "Game.turn" } },
      {
        procedureKey: "notifications.dismiss.request",
        input: { notificationId },
        host: "127.0.0.1",
      },
      {
        procedureKey: "notifications.dismiss.request",
        input: { notificationId, rawCommand: "Game.Notifications.dismiss(...)" },
      },
      {
        procedureKey: "notifications.dismiss.request",
        input: { notificationId },
        controllerProof: {
          ...controllerMutationProof(),
          lifecycle: { source: "controller-runtime", status: "loading" },
        },
      },
      {
        procedureKey: "notifications.dismiss.request",
        input: { notificationId },
        controllerProof: {
          ...controllerMutationProof(),
          localPlayer: { source: "input.playerId", playerId: 0 },
        },
      },
      {
        procedureKey: "notifications.dismiss.request",
        input: { notificationId },
        controllerProof: {
          ...controllerMutationProof(),
          hotseat: { source: "controller-runtime", status: "unknown" },
        },
      },
      {
        procedureKey: "turn.complete.request",
        input: { rawCommand: "GameContext.sendTurnComplete()" },
      },
      {
        procedureKey: "turn.complete.request",
        input: {},
        session: { state: "App UI" },
      },
      {
        procedureKey: "unit.target.action.request",
        input: { unitId, ...target, rawCommand: "Game.UnitOperations.sendRequest(...)" },
      },
      {
        procedureKey: "unit.target.action.request",
        input: { unitId, ...target },
        state: { name: "App UI" },
      },
      {
        procedureKey: "unit.upgrade.request",
        input: {
          unitId,
          rawCommand: "Game.UnitCommands.sendRequest(...)",
        },
      },
      {
        procedureKey: "unit.upgrade.request",
        input: {
          unitId,
          operationType: "UNITCOMMAND_UPGRADE",
        },
      },
      {
        procedureKey: "unit.resettle.request",
        input: {
          unitId,
          destination: target,
          args: { X: 22, Y: 31 },
        },
      },
      {
        procedureKey: "unit.resettle.request",
        input: {
          unitId,
          destination: target,
        },
        session: { state: "App UI" },
      },
      {
        procedureKey: "city.production.choice.request",
        input: {
          cityId,
          args: productionArgs,
          rawCommand: "Game.CityOperations.sendRequest(...)",
        },
      },
      {
        procedureKey: "city.production.choice.request",
        input: { cityId, args: productionArgs },
        session: { state: "App UI" },
      },
      {
        procedureKey: "city.population.place.request",
        input: {
          mode: "assign-worker",
          playerId: 0,
          location: workerLocation,
          rawCommand: "Game.PlayerOperations.sendRequest(...)",
        },
      },
      {
        procedureKey: "city.population.place.request",
        input: {
          mode: "expand-city",
          cityId,
          destination: target,
        },
        state: { name: "App UI" },
      },
      {
        procedureKey: "city.townFocus.change.request",
        input: {
          ...townFocusInput,
          rawCommand: "Game.CityCommands.sendRequest(...)",
        },
      },
      {
        procedureKey: "city.townFocus.change.request",
        input: townFocusInput,
        session: { state: "App UI" },
      },
      {
        procedureKey: "city.townFocus.review.request",
        input: {
          cityId,
          rawCommand: "Game.CityOperations.sendRequest(...)",
        },
      },
      {
        procedureKey: "narrative.choice.request",
        input: {
          ...narrativeInput,
          rawCommand: "Game.PlayerOperations.sendRequest(...)",
        },
      },
      {
        procedureKey: "narrative.choice.request",
        input: narrativeInput,
        session: { state: "App UI" },
      },
      {
        procedureKey: "diplomacy.response.request",
        input: {
          ...diplomacyInput,
          rawCommand: "Game.PlayerOperations.sendRequest(...)",
        },
      },
      {
        procedureKey: "diplomacy.response.request",
        input: {
          ...diplomacyInput,
          activateNotification: false,
        },
      },
      {
        procedureKey: "diplomacy.response.request",
        input: diplomacyInput,
        session: { state: "App UI" },
      },
      {
        procedureKey: "diplomacy.firstMeet.response.request",
        input: {
          ...firstMeetInput,
          rawCommand: "Game.PlayerOperations.sendRequest(...)",
        },
      },
      {
        procedureKey: "diplomacy.firstMeet.response.request",
        input: {
          ...firstMeetInput,
          args: { Player1: 0, Player2: 2, Type: 673_478_009 },
        },
      },
      {
        procedureKey: "diplomacy.firstMeet.response.request",
        input: firstMeetInput,
        session: { state: "App UI" },
      },
      {
        procedureKey: "government.choice.request",
        input: {
          ...governmentInput,
          rawCommand: "Game.PlayerOperations.sendRequest(...)",
        },
      },
      {
        procedureKey: "government.choice.request",
        input: {
          ...governmentInput,
          args: { GovernmentType: 0, Action: -1_326_475_004 },
        },
      },
      {
        procedureKey: "government.choice.request",
        input: governmentInput,
        session: { state: "App UI" },
      },
      {
        procedureKey: "government.celebration.choice.request",
        input: {
          ...celebrationInput,
          command: "Game.PlayerOperations.sendRequest(...)",
        },
      },
      {
        procedureKey: "government.celebration.choice.request",
        input: {
          ...celebrationInput,
          operationType: "CHOOSE_GOLDEN_AGE",
        },
      },
      {
        procedureKey: "progression.technology.choice.request",
        input: {
          ...progressionTechnologyInput,
          rawCommand: "Game.PlayerOperations.sendRequest(...)",
        },
      },
      {
        procedureKey: "progression.technology.choice.request",
        input: progressionTechnologyInput,
        session: { state: "App UI" },
      },
      {
        procedureKey: "progression.culture.choice.request",
        input: {
          ...progressionCultureInput,
          rawCommand: "Game.PlayerOperations.sendRequest(...)",
        },
      },
      {
        procedureKey: "progression.technology.target.request",
        input: {
          ...progressionTargetInput,
          playerId: 2,
        },
      },
      {
        procedureKey: "progression.technology.target.request",
        input: {
          ...progressionTargetInput,
          rawCommand: "Game.PlayerOperations.sendRequest(...)",
        },
      },
      {
        procedureKey: "progression.culture.target.request",
        input: progressionTargetInput,
        session: { state: "App UI" },
      },
      {
        procedureKey: "progression.attribute.purchase.request",
        input: {
          ...attributePurchaseInput,
          command: "Game.PlayerOperations.sendRequest(...)",
        },
      },
      {
        procedureKey: "progression.attribute.review.request",
        input: { rawCommand: "Game.PlayerOperations.sendRequest(...)" },
      },
      {
        procedureKey: "progression.tradition.change.request",
        input: {
          ...traditionChangeInput,
          operation: { type: "CHANGE_TRADITION" },
        },
      },
      {
        procedureKey: "progression.tradition.review.request",
        input: { args: {} },
      },
    ];

    for (const request of invalidRequests) {
      const fake = fakeContext(playableStatusResult());
      const response = await invokeCiv7ControllerBridgeRequest(request, {
        createContext: () => fake.context,
      });

      expect(response).toEqual({
        ok: false,
        error: {
          code: "BRIDGE_BAD_REQUEST",
          message: "Civ7 controller bridge request envelope is invalid.",
          reason: "invalid-envelope",
        },
      });
      expect(fake.calls).toEqual([]);
    }
  });

  test("requires controller-owned mutation proof before dispatch", async () => {
    const fake = fakeContext(playableStatusResult(), false);

    const response = await invokeCiv7ControllerBridgeRequest({
      procedureKey: "notifications.dismiss.request",
      input: { notificationId },
      correlationId: "controller-missing-proof-1",
    }, {
      createContext: () => fake.context,
    });

    expect(response).toEqual({
      ok: false,
      correlationId: "controller-missing-proof-1",
      error: {
        code: "BRIDGE_CONTROLLER_PROOF_REQUIRED",
        message:
          "Civ7 controller bridge mutation proof is required before dispatch.",
        reason: "invalid-envelope",
      },
    });
    expect(fake.calls).toEqual([]);
  });

  test("rejects unsupported controller read procedures before dispatch", async () => {
    const fake = fakeAttentionContext(unitId);
    const response = await invokeCiv7ControllerBridgeRequest({
      procedureKey: "strategy.frontSummary",
      input: {},
      correlationId: "controller-unsupported-read-1",
    }, {
      createContext: () => fake.context,
    });

    expect(response).toEqual({
      ok: false,
      correlationId: "controller-unsupported-read-1",
      error: {
        code: "BRIDGE_PROCEDURE_NOT_SUPPORTED",
        message:
          "Civ7 controller bridge procedure is not supported by this controller context.",
        reason: "procedure-not-supported",
      },
    });
    expect(fake.calls.notifications).toEqual([]);
    expect(fake.calls.readyUnit).toEqual([]);
  });

  test("rejects unsupported controller mutation procedures after proof but before dispatch", async () => {
    const fake = fakeNotificationDismissContext();
    const response = await invokeCiv7ControllerBridgeRequest({
      procedureKey: "turn.complete.request",
      input: {},
      correlationId: "controller-unsupported-mutation-1",
    }, {
      createContext: () => fake.context,
    });

    expect(response).toEqual({
      ok: false,
      correlationId: "controller-unsupported-mutation-1",
      error: {
        code: "BRIDGE_PROCEDURE_NOT_SUPPORTED",
        message:
          "Civ7 controller bridge procedure is not supported by this controller context.",
        reason: "procedure-not-supported",
      },
    });
    expect(fake.calls.status).toEqual([]);
    expect(fake.calls.dismissal).toEqual([]);
  });

  test("rejects procedures outside the bridge allowlist without dispatch", async () => {
    const fake = fakeContext(playableStatusResult());

    const response = await invokeCiv7ControllerBridgeRequest({
      procedureKey: "progression.legacy.choice.request",
      input: { playerId: 0, node: 123 },
    }, {
      createContext: () => fake.context,
    });

    expect(response).toEqual({
      ok: false,
      error: {
        code: "BRIDGE_PROCEDURE_NOT_ALLOWED",
        message: "Civ7 controller bridge procedure is not allowlisted.",
        reason: "procedure-not-allowed",
      },
    });
    expect(fake.calls).toEqual([]);
  });

  test("keeps raw direct-control failure details out of bridge failures", async () => {
    const fake = fakeContext(new Error(
      "Timed out waiting for Civ7 tuner response to CMD:65535:Game.turn",
    ));

    const response = await invokeCiv7ControllerBridgeRequest({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "controller-error-1",
    }, {
      createContext: () => fake.context,
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toEqual({
      ok: false,
      correlationId: "controller-error-1",
      error: {
        code: "READINESS_CURRENT_UNAVAILABLE",
        message: "Current readiness view failed.",
        reason: "procedure-failed",
      },
    });
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Game.turn");
    expect(serialized).not.toContain("rawCommand");
    expect(serialized).not.toContain("command-failed");
  });
});

function fakeContext(
  resultOrError: Civ7ControlOrpcPlayableStatusResult | Error,
  withControllerProof = true,
): {
  calls: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
  contextRequests: unknown[];
  context: TestControllerContext;
} {
  const calls: Array<Civ7ControlOrpcContext["endpointDefaults"]> = [];
  return {
    calls,
    contextRequests: [],
    context: {
      endpointDefaults: { timeoutMs: 1_000 },
      ...(withControllerProof
        ? { controllerProof: controllerMutationProof() }
        : {}),
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.push(options);
          if (resultOrError instanceof Error) throw resultOrError;
          return resultOrError;
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function fakeWorldMapContext(): {
  calls: {
    plot: Array<{ input: unknown; options: unknown }>;
    grid: Array<{ input: unknown; options: unknown }>;
  };
  contextRequests: unknown[];
  context: TestControllerContext;
} {
  const calls: {
    plot: Array<{ input: unknown; options: unknown }>;
    grid: Array<{ input: unknown; options: unknown }>;
  } = {
    plot: [],
    grid: [],
  };
  return {
    calls,
    contextRequests: [],
    context: {
      endpointDefaults: { timeoutMs: 1_000 },
      controllerProof: controllerMutationProof(),
      controller: {
        supportedReadProcedures: ["world.plot.read", "world.grid.read"],
      },
      directControl: {
        getCiv7PlayableStatus: async () => playableStatusResult(),
        getCiv7PlotSnapshot: async (input, options) => {
          calls.plot.push({ input, options });
          return plotSnapshotResult(input.x, input.y, input.fields ?? ["terrain"]);
        },
        getCiv7MapGrid: async (input, options) => {
          calls.grid.push({ input, options });
          const fields = input.fields;
          return {
            host: "127.0.0.1",
            port: 4318,
            state: { id: "65535", name: "App UI" },
            bounds: input.bounds,
            fields: Array.from(fields),
            plotCount: 2,
            omitted: 1,
            hiddenInfoPolicy: "not-player-scoped",
            map: {
              width: { ok: true, value: 84 },
              height: { ok: true, value: 52 },
            },
            plots: [plotSnapshotResult(3, 4, fields)],
          };
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function plotSnapshotResult(
  x: number,
  y: number,
  fields: readonly string[],
) {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    location: {
      x,
      y,
      index: { ok: true, value: x * 1_000 + y },
    },
    revealedState: { ok: true, value: 1 },
    visible: { ok: true, value: true },
    hiddenInfoPolicy: "visibility-filtered",
    facts: Object.fromEntries(fields.map((field) => [
      field,
      { ok: true, value: field === "owner" ? 0 : 7 },
    ])),
  } as const;
}

function fakeAttentionContext(unitId: { owner: number; id: number; type: number }): {
  calls: {
    notifications: Array<Record<string, unknown> | undefined>;
    readyUnit: Array<{ input: unknown; options: unknown }>;
  };
  contextRequests: unknown[];
  context: TestControllerContext;
} {
  const calls: {
    notifications: Array<Record<string, unknown> | undefined>;
    readyUnit: Array<{ input: unknown; options: unknown }>;
  } = {
    notifications: [],
    readyUnit: [],
  };
  return {
    calls,
    contextRequests: [],
    context: {
      endpointDefaults: { timeoutMs: 1_000 },
      controllerProof: controllerMutationProof(),
      controller: {
        supportedReadProcedures: ["attention.current"],
      },
      directControl: {
        getCiv7PlayableStatus: async () => playableStatusResult(),
        getCiv7PlayNotificationView: async (options) => {
          calls.notifications.push(options);
          return cleanNotificationViewResult();
        },
        getCiv7TurnCompletionStatus: async () => turnCompletionStatusResult(),
        getCiv7ReadyUnitView: async (input, options) => {
          calls.readyUnit.push({ input, options });
          return {
            unitId,
            legalOperations: [{ family: "unit-operation", operationType: "MOVE_TO" }],
          };
        },
        getCiv7ReadyCityView: async () => ({
          cityId: null,
          blockingCityId: { ok: true, value: null },
          legalOperations: [],
        }),
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function fakeNotificationDismissContext(): {
  calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    dismissal: Array<{
      input: unknown;
      options: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: TestControllerContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    dismissal: Array<{
      input: unknown;
      options: unknown;
    }>;
  } = {
    status: [],
    dismissal: [],
  };
  return {
    calls,
    contextRequests: [],
    context: {
      endpointDefaults: { timeoutMs: 1_000 },
      controllerProof: controllerMutationProof(),
      controller: {
        supportedMutationProcedures: ["notifications.dismiss.request"],
      },
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        requestCiv7NotificationDismissal: async (input, options) => {
          calls.dismissal.push({ input, options });
          return notificationDismissalResult("notification-disappeared");
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function fakeTurnCompleteContext(): {
  calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    turnCompletion: Array<{
      options: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: TestControllerContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    turnCompletion: Array<{
      options: unknown;
    }>;
  } = {
    status: [],
    turnCompletion: [],
  };
  return {
    calls,
    contextRequests: [],
    context: {
      endpointDefaults: { timeoutMs: 1_000 },
      controllerProof: controllerMutationProof(),
      controller: {
        supportedMutationProcedures: ["turn.complete.request"],
      },
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        requestCiv7TurnComplete: async (options) => {
          calls.turnCompletion.push({ options });
          return turnCompletionRequestResult();
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function fakeUnitTargetActionContext(): {
  calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    targetAction: Array<{
      input: unknown;
      options: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: TestControllerContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    targetAction: Array<{
      input: unknown;
      options: unknown;
    }>;
  } = {
    status: [],
    targetAction: [],
  };
  return {
    calls,
    contextRequests: [],
    context: {
      endpointDefaults: { timeoutMs: 1_000 },
      controllerProof: controllerMutationProof(),
      controller: {
        supportedMutationProcedures: ["unit.target.action.request"],
      },
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        requestCiv7UnitTargetAction: async (input, options) => {
          calls.targetAction.push({ input, options });
          return unitTargetActionResult();
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function fakeUnitCommandContext(kind: "upgrade" | "resettle"): {
  calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    unitCommand: Array<{
      input: unknown;
      options: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: TestControllerContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    unitCommand: Array<{
      input: unknown;
      options: unknown;
    }>;
  } = {
    status: [],
    unitCommand: [],
  };
  return {
    calls,
    contextRequests: [],
    context: {
      endpointDefaults: { timeoutMs: 1_000 },
      controllerProof: controllerMutationProof(),
      controller: {
        supportedMutationProcedures: [
          "unit.upgrade.request",
          "unit.resettle.request",
        ],
      },
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        requestCiv7UnitCommand: async (input, options) => {
          calls.unitCommand.push({ input, options });
          return unitCommandResult(
            kind === "upgrade" ? "queue-advanced" : "unit-state-changed",
            kind,
          );
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function fakeProductionChoiceContext(): {
  calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    production: Array<{
      input: unknown;
      options: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: TestControllerContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    production: Array<{
      input: unknown;
      options: unknown;
    }>;
  } = {
    status: [],
    production: [],
  };
  return {
    calls,
    contextRequests: [],
    context: {
      endpointDefaults: { timeoutMs: 1_000 },
      controllerProof: controllerMutationProof(),
      controller: {
        supportedMutationProcedures: ["city.production.choice.request"],
      },
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        requestCiv7ProductionChoice: async (input, options) => {
          calls.production.push({ input, options });
          return productionChoiceResult();
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function fakePopulationPlacementContext(): {
  calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    population: Array<{
      method: "requestCiv7AssignWorkerPlacement" | "requestCiv7ExpandCityPlacement";
      input: unknown;
      options: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: TestControllerContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    population: Array<{
      method: "requestCiv7AssignWorkerPlacement" | "requestCiv7ExpandCityPlacement";
      input: unknown;
      options: unknown;
    }>;
  } = {
    status: [],
    population: [],
  };
  return {
    calls,
    contextRequests: [],
    context: {
      endpointDefaults: { timeoutMs: 1_000 },
      controllerProof: controllerMutationProof(),
      controller: {
        supportedMutationProcedures: ["city.population.place.request"],
      },
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        requestCiv7AssignWorkerPlacement: async (input, options) => {
          calls.population.push({
            method: "requestCiv7AssignWorkerPlacement",
            input,
            options,
          });
          return populationPlacementResult("assign-worker");
        },
        requestCiv7ExpandCityPlacement: async (input, options) => {
          calls.population.push({
            method: "requestCiv7ExpandCityPlacement",
            input,
            options,
          });
          return populationPlacementResult("expand-city");
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function fakeTownFocusContext(): {
  calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    townFocus: Array<{
      method: "requestCiv7TownFocusChange" | "requestCiv7TownFocusReviewCloseout";
      input: unknown;
      options: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: TestControllerContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    townFocus: Array<{
      method: "requestCiv7TownFocusChange" | "requestCiv7TownFocusReviewCloseout";
      input: unknown;
      options: unknown;
    }>;
  } = {
    status: [],
    townFocus: [],
  };
  return {
    calls,
    contextRequests: [],
    context: {
      endpointDefaults: { timeoutMs: 1_000 },
      controllerProof: controllerMutationProof(),
      controller: {
        supportedMutationProcedures: [
          "city.townFocus.change.request",
          "city.townFocus.review.request",
        ],
      },
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        requestCiv7TownFocusChange: async (input, options) => {
          calls.townFocus.push({
            method: "requestCiv7TownFocusChange",
            input,
            options,
          });
          return townFocusRuntimeResult("town-focus-change");
        },
        requestCiv7TownFocusReviewCloseout: async (input, options) => {
          calls.townFocus.push({
            method: "requestCiv7TownFocusReviewCloseout",
            input,
            options,
          });
          return townFocusRuntimeResult("town-focus-review");
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function fakeNarrativeChoiceContext(): {
  calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    narrative: Array<{
      input: unknown;
      options: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: TestControllerContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    narrative: Array<{
      input: unknown;
      options: unknown;
    }>;
  } = {
    status: [],
    narrative: [],
  };
  return {
    calls,
    contextRequests: [],
    context: {
      endpointDefaults: { timeoutMs: 1_000 },
      controllerProof: controllerMutationProof(),
      controller: {
        supportedMutationProcedures: ["narrative.choice.request"],
      },
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        requestCiv7NarrativeChoice: async (input, options) => {
          calls.narrative.push({ input, options });
          return narrativeChoiceResult();
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function fakeDiplomacyResponseContext(): {
  calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    diplomacy: Array<{
      input: unknown;
      options: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: TestControllerContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    diplomacy: Array<{
      input: unknown;
      options: unknown;
    }>;
  } = {
    status: [],
    diplomacy: [],
  };
  return {
    calls,
    contextRequests: [],
    context: {
      endpointDefaults: { timeoutMs: 1_000 },
      controllerProof: controllerMutationProof(),
      controller: {
        supportedMutationProcedures: ["diplomacy.response.request"],
      },
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        requestCiv7DiplomacyResponse: async (input, options) => {
          calls.diplomacy.push({ input, options });
          return diplomacyResponseResult();
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function fakeFirstMeetResponseContext(): {
  calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    views: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    firstMeet: Array<{
      input: unknown;
      options: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: TestControllerContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    views: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    firstMeet: Array<{
      input: unknown;
      options: unknown;
    }>;
  } = {
    status: [],
    views: [],
    firstMeet: [],
  };
  return {
    calls,
    contextRequests: [],
    context: {
      endpointDefaults: { timeoutMs: 1_000 },
      controllerProof: controllerMutationProof(),
      controller: {
        supportedMutationProcedures: ["diplomacy.firstMeet.response.request"],
      },
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        getCiv7PlayNotificationView: async (options) => {
          calls.views.push(options);
          return cleanNotificationViewResult();
        },
        requestCiv7FirstMeetResponse: async (input, options) => {
          calls.firstMeet.push({ input, options });
          return firstMeetResponseResult("first-meet-cleared");
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function fakeGovernmentChoiceContext(): {
  calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    views: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    government: Array<{
      input: unknown;
      options: unknown;
    }>;
    celebration: Array<{
      input: unknown;
      options: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: TestControllerContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    views: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    government: Array<{
      input: unknown;
      options: unknown;
    }>;
    celebration: Array<{
      input: unknown;
      options: unknown;
    }>;
  } = {
    status: [],
    views: [],
    government: [],
    celebration: [],
  };
  return {
    calls,
    contextRequests: [],
    context: {
      endpointDefaults: { timeoutMs: 1_000 },
      controllerProof: controllerMutationProof(),
      controller: {
        supportedMutationProcedures: [
          "government.choice.request",
          "government.celebration.choice.request",
        ],
      },
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        getCiv7PlayNotificationView: async (options) => {
          calls.views.push(options);
          return cleanNotificationViewResult();
        },
        requestCiv7GovernmentChoice: async (input, options) => {
          calls.government.push({ input, options });
          return governmentChoiceResult("government");
        },
        requestCiv7CelebrationChoice: async (input, options) => {
          calls.celebration.push({ input, options });
          return governmentChoiceResult("celebration");
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function fakeProgressionChoiceContext(kind: "technology" | "culture" = "technology"): {
  calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    views: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    technology: Array<{
      input: unknown;
      options: unknown;
    }>;
    culture: Array<{
      input: unknown;
      options: unknown;
    }>;
    technologyTarget: Array<{
      input: unknown;
      options: unknown;
    }>;
    cultureTarget: Array<{
      input: unknown;
      options: unknown;
    }>;
    attributePurchase: Array<{
      input: unknown;
      options: unknown;
    }>;
    attributeReview: Array<{
      input: unknown;
      options: unknown;
    }>;
    traditionChange: Array<{
      input: unknown;
      options: unknown;
    }>;
    traditionReview: Array<{
      input: unknown;
      options: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: TestControllerContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    views: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    technology: Array<{
      input: unknown;
      options: unknown;
    }>;
    culture: Array<{
      input: unknown;
      options: unknown;
    }>;
    technologyTarget: Array<{
      input: unknown;
      options: unknown;
    }>;
    cultureTarget: Array<{
      input: unknown;
      options: unknown;
    }>;
    attributePurchase: Array<{
      input: unknown;
      options: unknown;
    }>;
    attributeReview: Array<{
      input: unknown;
      options: unknown;
    }>;
    traditionChange: Array<{
      input: unknown;
      options: unknown;
    }>;
    traditionReview: Array<{
      input: unknown;
      options: unknown;
    }>;
  } = {
    status: [],
    views: [],
    technology: [],
    culture: [],
    technologyTarget: [],
    cultureTarget: [],
    attributePurchase: [],
    attributeReview: [],
    traditionChange: [],
    traditionReview: [],
  };
  const views = [
    progressionNotificationView(kind),
    progressionCleanNotificationView(),
  ];
  return {
    calls,
    contextRequests: [],
    context: {
      endpointDefaults: { timeoutMs: 1_000 },
      controllerProof: controllerMutationProof(),
      controller: {
        supportedMutationProcedures: [
          "progression.technology.choice.request",
          "progression.culture.choice.request",
          "progression.technology.target.request",
          "progression.culture.target.request",
          "progression.attribute.purchase.request",
          "progression.attribute.review.request",
          "progression.tradition.change.request",
          "progression.tradition.review.request",
        ],
      },
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        getCiv7PlayNotificationView: async (options) => {
          calls.views.push(options);
          return views.shift() ?? progressionCleanNotificationView();
        },
        requestCiv7TechnologyChoiceCloseout: async (input, options) => {
          calls.technology.push({ input, options });
          return progressionCloseoutResult("technology");
        },
        requestCiv7CultureChoiceCloseout: async (input, options) => {
          calls.culture.push({ input, options });
          return progressionCloseoutResult("culture");
        },
        requestCiv7TechnologyTarget: async (input, options) => {
          calls.technologyTarget.push({ input, options });
          return progressionTargetResult("technology");
        },
        requestCiv7CultureTarget: async (input, options) => {
          calls.cultureTarget.push({ input, options });
          return progressionTargetResult("culture");
        },
        requestCiv7AttributePurchase: async (input, options) => {
          calls.attributePurchase.push({ input, options });
          return progressionPlayerChoiceResult("attribute-purchase");
        },
        requestCiv7AttributeReviewCloseout: async (input, options) => {
          calls.attributeReview.push({ input, options });
          return progressionPlayerChoiceResult("attribute-review");
        },
        requestCiv7TraditionChange: async (input, options) => {
          calls.traditionChange.push({ input, options });
          return progressionPlayerChoiceResult("tradition-change");
        },
        requestCiv7TraditionReviewCloseout: async (input, options) => {
          calls.traditionReview.push({ input, options });
          return progressionPlayerChoiceResult("tradition-review");
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function controllerMutationProof(): Record<string, unknown> {
  return {
    lifecycle: {
      source: "controller-runtime",
      status: "game-controller-ready",
    },
    localPlayer: {
      source: "GameContext.localPlayerID",
      playerId: 0,
    },
    hotseat: {
      source: "controller-runtime",
      status: "single-local-player",
    },
  };
}

function playableStatusResult(): Civ7ControlOrpcPlayableStatusResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    playable: true,
    readiness: "tuner-ready",
    appUi: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      snapshot: {
        game: {
          turn: 77,
          age: 1,
          maxTurns: 500,
          turnDate: { ok: true, value: "Age 1, Turn 77" },
          hash: { ok: true, value: 123_456 },
        },
        ui: {
          inGame: { ok: true, value: true },
          inShell: { ok: true, value: false },
          inLoading: { ok: true, value: false },
          canBeginGame: { ok: true, value: false },
        },
        gameContext: {
          localPlayerID: 0,
          localObserverID: 1,
        },
        players: {
          maxPlayers: 8,
          aliveIds: { ok: true, value: [0, 1, 2] },
          aliveHumanIds: { ok: true, value: [0] },
          numAliveHumans: { ok: true, value: 1 },
        },
        map: {
          width: { ok: true, value: 84 },
          height: { ok: true, value: 52 },
          plotCount: { ok: true, value: 4_368 },
          mapSize: { ok: true, value: 3 },
          randomSeed: { ok: true, value: 987_654 },
        },
        currentState: "App UI",
      },
    },
    tuner: {
      ready: true,
      health: {
        ok: true,
        host: "127.0.0.1",
        port: 4318,
        latencyMs: 1,
      },
    },
    errors: ["raw Tuner detail"],
  };
}

function notificationDismissalResult(classification: string): any {
  const before = notificationSummary();
  const after = notificationSummary({ exists: false });
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    notificationId,
    before,
    after,
    canDismiss: true,
    sent: true,
    result: {
      notificationTrainManager: {
        ok: true,
        attempted: true,
        available: true,
        path: "NotificationModel.manager.dismiss",
      },
    },
    closeoutPath: "NotificationModel.manager.dismiss",
    verificationAttempts: [before, after],
    verified: true,
    postcondition: {
      classification,
      reason: `test ${classification}`,
    },
    notes: ["fixture"],
  };
}

function notificationSummary(overrides: Record<string, unknown> = {}): any {
  return {
    id: notificationId,
    exists: true,
    type: 2_091_697_919,
    typeName: "NOTIFICATION_WONDER_COMPLETED",
    summary: "Wonder Completed",
    message: "Wonder Completed",
    target: { owner: -1, id: -1, type: 0 },
    location: { x: -9999, y: -9999 },
    canUserDismiss: true,
    expired: false,
    dismissed: false,
    blocksTurnAdvancement: { ok: true, value: true },
    endTurnBlockingType: { ok: true, value: 2_091_697_919 },
    isEndTurnBlocking: { ok: true, value: true },
    engineQueueCount: { ok: true, value: 1 },
    engineQueueContains: { ok: true, value: true },
    engineQueueFirstId: { ok: true, value: notificationId },
    isEngineQueueFront: { ok: true, value: true },
    notificationTrainCount: { ok: true, value: 1 },
    notificationTrainContains: { ok: true, value: true },
    notificationTrainFirstId: { ok: true, value: notificationId },
    isNotificationTrainFront: { ok: true, value: true },
    ...overrides,
  };
}

function cleanNotificationViewResult(): any {
  return {
    localPlayerId: 0,
    turn: { ok: true, value: 12 },
    turnDate: { ok: true, value: "3400 BCE" },
    canEndTurn: { ok: true, value: false },
    selectedUnitId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    blockingNotificationId: { ok: true, value: null },
    hud: {
      nextDecision: null,
      decisionQueue: [],
    },
    limits: {
      maxNotifications: 25,
      truncated: false,
    },
  };
}

function progressionNotificationView(kind: "technology" | "culture"): any {
  const typeName = kind === "technology"
    ? "NOTIFICATION_CHOOSE_TECH"
    : "NOTIFICATION_CHOOSE_CULTURE_NODE";
  const details = kind === "technology"
    ? {
        kind: "technology-choice-options",
        currentResearching: { ok: true, value: 10 },
        targetNode: { ok: true, value: 20 },
      }
    : {
        kind: "culture-choice-options",
        currentResearching: { ok: true, value: 30 },
        targetNode: { ok: true, value: 40 },
      };
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    schemaVersion: "civ7-play-notifications.v1",
    localPlayerId: 0,
    turn: { ok: true, value: 12 },
    turnDate: { ok: true, value: "3400 BCE" },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: 1 },
    firstReadyUnitId: { ok: true, value: null },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    blockingNotificationId: { ok: true, value: notificationId },
    notifications: [{
      id: notificationId,
      typeName,
      summary: typeName,
      isEndTurnBlocking: true,
      details,
    }],
  };
}

function progressionCleanNotificationView(): any {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    schemaVersion: "civ7-play-notifications.v1",
    localPlayerId: 0,
    turn: { ok: true, value: 12 },
    turnDate: { ok: true, value: "3400 BCE" },
    canEndTurn: { ok: true, value: true },
    blocker: { ok: true, value: 0 },
    firstReadyUnitId: { ok: true, value: null },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    blockingNotificationId: { ok: true, value: null },
    notifications: [],
  };
}

function turnCompletionStatusResult(): any {
  return {
    turn: { ok: true, value: 12 },
    turnDate: { ok: true, value: "3400 BCE" },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: false },
    firstReadyUnitId: { ok: true, value: null },
    blocker: { ok: true, value: 0 },
  };
}

function turnCompletionRequestResult(): any {
  return {
    sent: true,
    before: turnCompletionStatusResult(),
    after: {
      ...turnCompletionStatusResult(),
      hasSentTurnComplete: { ok: true, value: true },
    },
    command: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      output: ["CMD:65535:GameContext.sendTurnComplete()"],
    },
    verified: true,
  };
}

function unitTargetActionResult(): any {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    unitId,
    target: {
      ...target,
      index: { ok: true, value: 713_967_338 },
    },
    beforeUnit: unitProbe({ x: 20, y: 31 }),
    beforeTargetUnits: { ok: true, value: [] },
    candidates: [
      {
        family: "unit-command",
        operationType: "UNITCOMMAND_ARMY_OVERRUN",
        args: { X: target.x, Y: target.y },
        valid: false,
        result: { error: "not available" },
        targetInReturnedPlots: null,
        rejectedReason: "canStart false",
      },
      {
        family: "unit-operation",
        operationType: "MOVE_TO",
        args: { X: target.x, Y: target.y, Modifiers: 0 },
        valid: true,
        result: { raw: "Game.UnitOperations.canStart(...)" },
        targetInReturnedPlots: true,
      },
    ],
    selected: {
      family: "unit-operation",
      operationType: "MOVE_TO",
      args: { X: target.x, Y: target.y, Modifiers: 0 },
      valid: true,
      result: { raw: "Game.UnitOperations.canStart(...)" },
      targetInReturnedPlots: true,
    },
    sent: true,
    sendResult: {
      rawCommand: "Game.UnitOperations.sendRequest(...)",
    },
    afterUnit: unitProbe(target),
    afterTargetUnits: { ok: true, value: [] },
    verified: true,
    verification: {
      status: "verified",
      classification: "target-reached",
      unitChanged: true,
      targetUnitsChanged: false,
      destinationReached: true,
      requestedLocation: target,
      landedLocation: target,
      source: "bounded-poll",
      attempts: 2,
      observedAfterMs: 500,
      reason: "test target-reached",
    },
    notes: ["fixture"],
  };
}

function unitCommandResult(
  classification:
    | "queue-advanced"
    | "unit-state-changed"
    | "validation-changed"
    | "no-state-change"
    | "not-sent",
  kind: "upgrade" | "resettle" = "upgrade",
): any {
  const sent = classification !== "not-sent";
  const operationType = kind === "upgrade"
    ? "UNITCOMMAND_UPGRADE"
    : "UNITCOMMAND_RESETTLE";
  const args = kind === "upgrade" ? {} : { X: target.x, Y: target.y };
  const beforeValid = classification === "not-sent" ? false : true;
  const afterValid = classification === "validation-changed"
    ? !beforeValid
    : beforeValid;
  return {
    before: unitCommandValidation(operationType, args, beforeValid),
    ...(sent
      ? {
          command: {
            host: "127.0.0.1",
            port: 4318,
            state: { id: "65535", name: "App UI" },
            output: ["CMD:65535:Game.UnitCommands.sendRequest(...)"],
          },
        }
      : {}),
    after: unitCommandValidation(operationType, args, afterValid),
    sent,
    verified: sent && classification !== "no-state-change",
    postcondition: {
      family: "unit-command",
      operationType,
      classification,
      reason: `test ${classification}`,
    },
  };
}

function unitCommandValidation(
  operationType: string,
  args: Readonly<Record<string, number>>,
  valid: boolean,
) {
  return {
    family: "unit-command",
    operationType,
    valid,
    result: {
      Success: valid,
      raw: "Game.UnitCommands.canStart(...)",
    },
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    enumValue: operationType,
    target: { unitId },
    args,
  };
}

function unitProbe(location: { x: number; y: number }) {
  return {
    ok: true as const,
    value: {
      id: unitId,
      owner: unitId.owner,
      type: unitId.type,
      location,
      movementMovesRemaining: 1,
      movementTurnsRemaining: 0,
      attacksRemaining: 1,
    },
  };
}

function expectSemanticControllerOutputOmitsRawUnitCommand(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain("CMD");
  expect(serialized).not.toContain("Game.UnitCommands");
  expect(serialized).not.toContain("Game.UnitOperations");
  expect(serialized).not.toContain("sendRequest");
  expect(serialized).not.toContain("\"host\"");
  expect(serialized).not.toContain("\"port\"");
  expect(serialized).not.toContain("\"state\"");
  expect(serialized).not.toContain("\"session\"");
  expect(serialized).not.toContain("\"rawCommand\"");
  expect(serialized).not.toContain("\"command\"");
  expect(serialized).not.toContain("\"operationType\"");
  expect(serialized).not.toContain("\"sendResult\"");
  expect(serialized).not.toContain("\"result\"");
  expect(serialized).not.toContain("\"verified\"");
  expect(serialized).not.toContain("\"before\"");
  expect(serialized).not.toContain("\"after\"");
}

function productionChoiceResult(): any {
  return {
    before: productionValidationResult(true),
    after: productionValidationResult(true),
    sent: true,
    verified: true,
    productionPostcondition: {
      family: "city-operation",
      operationType: "BUILD",
      classification: "production-choice-cleared",
      before: productionSnapshot("before"),
      after: productionSnapshot("after"),
      productionStateChanged: true,
      blockerStillLive: false,
      reason: "test production-choice-cleared",
    },
    payload: {
      cityId,
      args: productionArgs,
      beforeValidation: { raw: "before-validation" },
      afterValidation: { raw: "after-validation" },
      sent: true,
      sendResult: {
        ok: true,
        value: {
          rawCommand: "Game.CityOperations.sendRequest(...)",
        },
      },
      beforeProductionPostcondition: productionSnapshot("before"),
      afterProductionPostcondition: productionSnapshot("after"),
      notes: ["fixture"],
    },
    command: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      output: ["{}"],
    },
  };
}

function productionValidationResult(valid: boolean) {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    family: "city-operation" as const,
    operationType: "BUILD" as const,
    enumValue: 713_967_338,
    target: { cityId },
    args: productionArgs,
    valid,
    result: {
      raw: "validation-result",
      command: "Game.CityOperations.canStart(...)",
    },
  };
}

function productionSnapshot(label: "before" | "after") {
  return {
    cityId,
    city: { ok: true, value: { label } },
    buildQueue: { ok: true, value: { label } },
    selectedCityId: { ok: true, value: cityId },
    blocker: { ok: true, value: -2_026_570_723 },
    canEndTurn: { ok: true, value: false },
    blockingProductionNotification: {
      ok: true,
      value: {
        matchesCity: label === "before",
      },
    },
  };
}

function populationPlacementResult(mode: "assign-worker" | "expand-city"): any {
  const family = mode === "expand-city" ? "city-command" : "player-operation";
  const operationType = mode === "expand-city" ? "EXPAND" : "ASSIGN_WORKER";
  const placementTarget = mode === "expand-city" ? { cityId } : { playerId: 0 };
  const args = mode === "expand-city"
    ? { X: target.x, Y: target.y }
    : { Location: workerLocation, Amount: 1 };

  return {
    before: populationPlacementValidationResult(
      family,
      operationType,
      placementTarget,
      args,
    ),
    command: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      output: [
        JSON.stringify({
          rawCommand: mode === "expand-city"
            ? "Game.CityCommands.sendRequest(...)"
            : "Game.PlayerOperations.sendRequest(...)",
        }),
      ],
    },
    after: populationPlacementValidationResult(
      family,
      operationType,
      placementTarget,
      args,
    ),
    sent: true,
    verified: true,
    populationPostcondition: {
      family,
      operationType,
      classification: "population-ready-cleared",
      readyCleared: true,
      placementStateChanged: true,
      reason: "test population-ready-cleared",
    },
  };
}

function populationPlacementValidationResult(
  family: "city-command" | "player-operation",
  operationType: "EXPAND" | "ASSIGN_WORKER",
  placementTarget: { cityId: typeof cityId } | { playerId: number },
  args: Record<string, number>,
) {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    family,
    operationType,
    enumValue: operationType,
    target: placementTarget,
    args,
    valid: true,
    result: {
      raw: "validation-result",
      command: family === "city-command"
        ? "Game.CityCommands.canStart(...)"
        : "Game.PlayerOperations.canStart(...)",
    },
  };
}

function townFocusRuntimeResult(
  kind: "town-focus-change" | "town-focus-review",
): any {
  const operationType = kind === "town-focus-change"
    ? "CHANGE_GROWTH_MODE"
    : "CONSIDER_TOWN_PROJECT";
  const args = kind === "town-focus-change"
    ? {
        Type: -284_569_333,
        ProjectType: -548_685_232,
        City: 65_536,
      }
    : {};
  const beforeValidation = townFocusValidationResult(operationType, args);
  const common = {
    cityId,
    operation: {
      before: beforeValidation,
      after: beforeValidation,
      sent: true,
      command: {
        host: "127.0.0.1",
        port: 4318,
        state: { id: "65535", name: "App UI" },
        output: [`CMD:65535:${operationType}`],
      },
    },
    beforeValidation,
    afterValidation: beforeValidation,
    sent: true,
    verified: false,
    postcondition: {
      classification: "pending-runtime-proof",
      reason: `test ${kind} pending runtime proof`,
    },
  };
  if (kind === "town-focus-change") {
    return {
      ...common,
      kind,
      growthType: -284_569_333,
      projectType: -548_685_232,
      city: 65_536,
    };
  }
  return {
    ...common,
    kind,
  };
}

function townFocusValidationResult(
  operationType: "CHANGE_GROWTH_MODE" | "CONSIDER_TOWN_PROJECT",
  args: Record<string, number>,
) {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    family: operationType === "CHANGE_GROWTH_MODE"
      ? "city-command"
      : "city-operation",
    operationType,
    enumValue: operationType,
    target: { cityId },
    args,
    valid: true,
    result: {
      raw: "validation-result",
      command: operationType === "CHANGE_GROWTH_MODE"
        ? "Game.CityCommands.canStart(...)"
        : "Game.CityOperations.canStart(...)",
    },
  };
}

function narrativeChoiceResult(): any {
  return {
    playerId: 0,
    before: {},
    beforeValidation: {
      valid: true,
      result: {
        command: "Game.PlayerOperations.canStart(...)",
      },
    },
    command: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      output: ["CMD:65535:Game.turn"],
    },
    payload: {
      sent: true,
      rawCommand: "Game.PlayerOperations.sendRequest(...)",
    },
    after: {},
    afterValidation: {
      valid: false,
      result: {
        command: "Game.PlayerOperations.canStart(...)",
      },
    },
    sent: true,
    verified: true,
    postcondition: {
      classification: "narrative-blocker-cleared",
      reason: "test narrative-blocker-cleared",
    },
  };
}

function diplomacyResponseResult(): any {
  return {
    playerId: 0,
    before: {},
    beforeValidation: {
      valid: true,
      result: {
        command: "Game.PlayerOperations.canStart(...)",
      },
    },
    command: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      output: ["CMD:65535:Game.PlayerOperations.sendRequest(...)"],
    },
    payload: {
      sent: true,
      rawCommand: "Game.PlayerOperations.sendRequest(...)",
      uiCloseout: "DiplomacyManager.closeResponsePopup(...)",
    },
    after: {},
    afterValidation: {
      valid: false,
      result: {
        command: "Game.PlayerOperations.canStart(...)",
      },
    },
    sent: true,
    verified: true,
    postcondition: {
      classification: "diplomacy-blocker-cleared",
      reason: "test diplomacy-blocker-cleared",
    },
  };
}

function firstMeetResponseResult(classification: string): any {
  return {
    playerId: 0,
    metPlayerId: 2,
    responseType: 673_478_009,
    before: {},
    beforeValidation: {
      valid: true,
      result: {
        command: "Game.PlayerOperations.canStart(...)",
      },
    },
    operation: {
      before: {
        valid: true,
        result: {
          command: "Game.PlayerOperations.canStart(...)",
        },
      },
      command: {
        host: "127.0.0.1",
        port: 4318,
        state: { id: "65535", name: "App UI" },
        output: ["CMD:65535:Game.PlayerOperations.sendRequest(...)"],
      },
      after: {
        valid: false,
        result: {
          command: "Game.PlayerOperations.canStart(...)",
        },
      },
      sent: true,
      verified: true,
    },
    command: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      output: ["CMD:65535:Game.PlayerOperations.sendRequest(...)"],
    },
    payload: {
      sent: true,
      rawCommand: "Game.PlayerOperations.sendRequest(...)",
    },
    after: {},
    afterValidation: {
      valid: false,
      result: {
        command: "Game.PlayerOperations.canStart(...)",
      },
    },
    sent: true,
    verified: true,
    postcondition: {
      classification,
      reason: `test ${classification}`,
    },
  };
}

function governmentChoiceResult(kind: "government" | "celebration"): any {
  const operationType = kind === "government"
    ? "CHANGE_GOVERNMENT"
    : "CHOOSE_GOLDEN_AGE";
  const args = kind === "government"
    ? { GovernmentType: 0, Action: -1_326_475_004 }
    : { GoldenAgeType: -340_825_966 };
  return {
    playerId: 0,
    kind,
    ...(kind === "government"
      ? { governmentType: 0, action: -1_326_475_004 }
      : { goldenAgeType: -340_825_966 }),
    before: {},
    beforeValidation: {
      valid: true,
      operationType,
      args,
      result: {
        command: "Game.PlayerOperations.canStart(...)",
      },
    },
    command: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      output: ["CMD:65535:Game.PlayerOperations.sendRequest(...)"],
    },
    payload: {
      sent: true,
      rawCommand: "Game.PlayerOperations.sendRequest(...)",
    },
    after: {},
    afterValidation: {
      valid: true,
      operationType,
      args,
      result: {
        command: "Game.PlayerOperations.canStart(...)",
      },
    },
    sent: true,
    verified: true,
    postcondition: {
      classification: "pending-runtime-proof",
      reason: "test government choice pending runtime proof",
    },
  };
}

function progressionCloseoutResult(kind: "technology" | "culture"): any {
  const operationType = kind === "technology"
    ? "SET_TECH_TREE_NODE"
    : "SET_CULTURE_TREE_NODE";
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    command: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      output: [`CMD:65535:${operationType}`],
    },
    payload: {
      localPlayerId: 0,
      playerId: 0,
      node: kind === "technology" ? 18_001 : 27_001,
      rawCommand: "Game.PlayerOperations.sendRequest(...)",
      sent: true,
    },
    sent: true,
  };
}

function progressionTargetResult(kind: "technology" | "culture"): any {
  const node = kind === "technology" ? 18_001 : 27_001;
  const operationType = kind === "technology"
    ? "SET_TECH_TREE_TARGET_NODE"
    : "SET_CULTURE_TREE_TARGET_NODE";
  return {
    kind,
    playerId: 0,
    node,
    operation: {
      before: progressionValidation(operationType, node),
      after: progressionValidation(operationType, node),
      sent: true,
      verified: true,
    },
    beforeValidation: progressionValidation(operationType, node),
    afterValidation: progressionValidation(operationType, node),
    sent: true,
    verified: false,
    postcondition: {
      classification: "pending-runtime-proof",
      reason: `${kind} target pending runtime proof`,
    },
  };
}

function progressionPlayerChoiceResult(
  kind:
    | "attribute-purchase"
    | "attribute-review"
    | "tradition-change"
    | "tradition-review",
): any {
  const operationType = kind === "attribute-purchase"
    ? "BUY_ATTRIBUTE_TREE_NODE"
    : kind === "attribute-review"
    ? "CONSIDER_ASSIGN_ATTRIBUTE"
    : kind === "tradition-change"
    ? "CHANGE_TRADITION"
    : "CONSIDER_ASSIGN_TRADITIONS";
  const args = kind === "attribute-purchase"
    ? { ProgressionTreeNodeType: 20 }
    : kind === "tradition-change"
    ? {
        TraditionType: -331_546_976,
        Action: -1_326_475_004,
      }
    : {};
  return {
    kind,
    playerId: 0,
    ...(kind === "attribute-purchase" ? { node: 20 } : {}),
    ...(kind === "tradition-change"
      ? {
          traditionType: -331_546_976,
          action: -1_326_475_004,
        }
      : {}),
    operation: {
      before: progressionValidation(operationType, 20, args),
      after: progressionValidation(operationType, 20, args),
      sent: true,
      verified: true,
    },
    beforeValidation: progressionValidation(operationType, 20, args),
    afterValidation: progressionValidation(operationType, 20, args),
    sent: true,
    verified: false,
    postcondition: {
      classification: "pending-runtime-proof",
      reason: `${kind} pending runtime proof`,
    },
  };
}

function progressionValidation(
  operationType: string,
  node: number,
  args: Readonly<Record<string, number>> = { ProgressionTreeNodeType: node },
): any {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    family: "player-operation",
    operationType,
    enumValue: operationType,
    target: { playerId: 0 },
    args,
    valid: true,
    result: {
      command: `Game.PlayerOperations.canStart(${operationType})`,
      rawCommand: "Game.PlayerOperations.sendRequest(...)",
    },
  };
}
