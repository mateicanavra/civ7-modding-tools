import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7ControllerBridgeResponseSchema,
  createCiv7ControllerBridgeIngress,
  invokeCiv7ControllerBridgeRequest,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcPlayableStatusResult,
} from "../src/index";

const notificationId = { owner: 0, id: 113, type: 20 };
const unitId = { owner: 0, id: 458_752, type: 26 };
const target = { x: 22, y: 31 };
const cityId = { owner: 0, id: 65_536, type: 1 };
const productionArgs = { ConstructibleType: 713_967_338, X: 22, Y: 31 };
const workerLocation = 2543;
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

describe("Civ7 controller bridge ingress", () => {
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

  test("invokes allowlisted notifications.dismiss.request through the in-process router with explicit approval", async () => {
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
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved notification dismissal",
      },
      controllerProof: controllerMutationProof(),
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
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved notification dismissal",
      },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "notifications.dismiss.request",
      input: { notificationId },
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved notification dismissal",
      },
      controllerProof: controllerMutationProof(),
      correlationId: "controller-notification-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("\"approval\"");
    expect(serialized).not.toContain("controller approved notification dismissal");
    expect(serialized).not.toContain("NotificationModel.manager.dismiss");
    expect(serialized).not.toContain("Game.Notifications.dismiss");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted turn.complete.request through the in-process router with explicit approval", async () => {
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
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved turn completion",
      },
      controllerProof: controllerMutationProof(),
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
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved turn completion",
      },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "turn.complete.request",
      input: {},
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved turn completion",
      },
      controllerProof: controllerMutationProof(),
      correlationId: "controller-turn-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("\"approval\"");
    expect(serialized).not.toContain("controller approved turn completion");
    expect(serialized).not.toContain("GameContext.sendTurnComplete");
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted unit.target.action.request through the in-process router with explicit approval", async () => {
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
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved unit target action",
      },
      controllerProof: controllerMutationProof(),
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
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved unit target action",
      },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "unit.target.action.request",
      input: { unitId, ...target },
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved unit target action",
      },
      controllerProof: controllerMutationProof(),
      correlationId: "controller-unit-target-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("\"approval\"");
    expect(serialized).not.toContain("controller approved unit target action");
    expect(serialized).not.toContain("Game.UnitOperations.sendRequest");
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted city.production.choice.request through the in-process router with explicit approval", async () => {
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
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved production choice",
      },
      controllerProof: controllerMutationProof(),
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
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved production choice",
      },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "city.production.choice.request",
      input: { cityId, args: productionArgs },
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved production choice",
      },
      controllerProof: controllerMutationProof(),
      correlationId: "controller-production-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("\"approval\"");
    expect(serialized).not.toContain("controller approved production choice");
    expect(serialized).not.toContain("Game.CityOperations.sendRequest");
    expect(serialized).not.toContain("Game.CityOperations.canStart");
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted city.population.place.request through the in-process router with explicit approval", async () => {
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
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved population placement",
      },
      controllerProof: controllerMutationProof(),
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
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved population placement",
      },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "city.population.place.request",
      input: {
        mode: "assign-worker",
        playerId: 0,
        location: workerLocation,
      },
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved population placement",
      },
      controllerProof: controllerMutationProof(),
      correlationId: "controller-population-1",
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("\"approval\"");
    expect(serialized).not.toContain("controller approved population placement");
    expect(serialized).not.toContain("Game.PlayerOperations.sendRequest");
    expect(serialized).not.toContain("Game.CityCommands.sendRequest");
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted narrative.choice.request through the in-process router with explicit approval", async () => {
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
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved narrative choice",
      },
      controllerProof: controllerMutationProof(),
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
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved narrative choice",
      },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "narrative.choice.request",
      input: narrativeInput,
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved narrative choice",
      },
      controllerProof: controllerMutationProof(),
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
    expect(serialized).not.toContain("\"approval\"");
    expect(serialized).not.toContain("controller approved narrative choice");
    expect(serialized).not.toContain("Game.PlayerOperations.sendRequest");
    expect(serialized).not.toContain("Game.turn");
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted diplomacy.response.request through the in-process router with explicit approval", async () => {
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
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved diplomacy response",
      },
      controllerProof: controllerMutationProof(),
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
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved diplomacy response",
      },
    }]);
    expect(fake.contextRequests).toEqual([{
      procedureKey: "diplomacy.response.request",
      input: diplomacyInput,
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved diplomacy response",
      },
      controllerProof: controllerMutationProof(),
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
    expect(serialized).not.toContain("\"approval\"");
    expect(serialized).not.toContain("\"verified\"");
    expect(serialized).not.toContain("controller approved diplomacy response");
    expect(serialized).not.toContain("Game.PlayerOperations.sendRequest");
    expect(serialized).not.toContain("DiplomacyManager");
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted progression technology choice through the in-process router with explicit approval", async () => {
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
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved technology choice",
      },
      controllerProof: controllerMutationProof(),
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
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved technology choice",
      },
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
    expect(serialized).not.toContain("\"approval\"");
    expect(serialized).not.toContain("controller approved technology choice");
    expect(serialized).not.toContain("SET_TECH_TREE_NODE");
    expect(serialized).not.toContain("Game.PlayerOperations.sendRequest");
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
  });

  test("invokes allowlisted progression culture choice through the in-process router with explicit approval", async () => {
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
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved culture choice",
      },
      controllerProof: controllerMutationProof(),
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
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "controller approved culture choice",
      },
    }]);

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("\"rawCommand\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");
    expect(serialized).not.toContain("\"approval\"");
    expect(serialized).not.toContain("controller approved culture choice");
    expect(serialized).not.toContain("SET_CULTURE_TREE_NODE");
    expect(serialized).not.toContain("Game.PlayerOperations.sendRequest");
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Tuner");
    expect(serialized).not.toContain("App UI");
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
      { procedureKey: "readiness.current", input: {}, approval: { approved: true } },
      { procedureKey: "attention.current", input: {}, host: "127.0.0.1" },
      { procedureKey: "attention.current", input: {}, session: { state: "Tuner" } },
      { procedureKey: "attention.current", input: {}, rawCommand: "Game.turn" },
      { procedureKey: "attention.current", input: { rawCommand: "Game.turn" } },
      { procedureKey: "attention.current", input: {}, approval: { approved: true } },
      { procedureKey: "notifications.dismiss.request", input: { notificationId } },
      {
        procedureKey: "notifications.dismiss.request",
        input: { notificationId },
        approval: controllerApproval(),
        controllerProof: controllerMutationProof(),
        host: "127.0.0.1",
      },
      {
        procedureKey: "notifications.dismiss.request",
        input: { notificationId, rawCommand: "Game.Notifications.dismiss(...)" },
        approval: controllerApproval(),
        controllerProof: controllerMutationProof(),
      },
      {
        procedureKey: "notifications.dismiss.request",
        input: { notificationId },
        approval: {
          source: "controller-runtime",
          approved: true,
          reason: "controller approved dismissal",
          command: "Game.Notifications.dismiss(...)",
        },
        controllerProof: controllerMutationProof(),
      },
      {
        procedureKey: "notifications.dismiss.request",
        input: { notificationId },
        approval: { approved: true, reason: "controller approved dismissal" },
        controllerProof: controllerMutationProof(),
      },
      {
        procedureKey: "notifications.dismiss.request",
        input: { notificationId },
        approval: controllerApproval(),
      },
      {
        procedureKey: "notifications.dismiss.request",
        input: { notificationId },
        approval: controllerApproval(),
        controllerProof: {
          ...controllerMutationProof(),
          lifecycle: { source: "controller-runtime", status: "loading" },
        },
      },
      {
        procedureKey: "notifications.dismiss.request",
        input: { notificationId },
        approval: controllerApproval(),
        controllerProof: {
          ...controllerMutationProof(),
          localPlayer: { source: "input.playerId", playerId: 0 },
        },
      },
      {
        procedureKey: "notifications.dismiss.request",
        input: { notificationId },
        approval: controllerApproval(),
        controllerProof: {
          ...controllerMutationProof(),
          hotseat: { source: "controller-runtime", status: "unknown" },
        },
      },
      { procedureKey: "turn.complete.request", input: {} },
      {
        procedureKey: "turn.complete.request",
        input: {},
        approval: controllerApproval(),
      },
      {
        procedureKey: "turn.complete.request",
        input: { rawCommand: "GameContext.sendTurnComplete()" },
        approval: controllerApproval(),
        controllerProof: controllerMutationProof(),
      },
      {
        procedureKey: "turn.complete.request",
        input: {},
        approval: controllerApproval(),
        controllerProof: controllerMutationProof(),
        session: { state: "App UI" },
      },
      {
        procedureKey: "turn.complete.request",
        input: {},
        approval: {
          source: "controller-runtime",
          approved: true,
          reason: "controller approved turn completion",
          command: "GameContext.sendTurnComplete()",
        },
        controllerProof: controllerMutationProof(),
      },
      { procedureKey: "unit.target.action.request", input: { unitId, ...target } },
      {
        procedureKey: "unit.target.action.request",
        input: { unitId, ...target },
        approval: controllerApproval(),
      },
      {
        procedureKey: "unit.target.action.request",
        input: { unitId, ...target, rawCommand: "Game.UnitOperations.sendRequest(...)" },
        approval: controllerApproval(),
        controllerProof: controllerMutationProof(),
      },
      {
        procedureKey: "unit.target.action.request",
        input: { unitId, ...target },
        approval: controllerApproval(),
        controllerProof: controllerMutationProof(),
        state: { name: "App UI" },
      },
      {
        procedureKey: "unit.target.action.request",
        input: { unitId, ...target },
        approval: {
          source: "controller-runtime",
          approved: true,
          reason: "controller approved unit target action",
          command: "Game.UnitOperations.sendRequest(...)",
        },
        controllerProof: controllerMutationProof(),
      },
      {
        procedureKey: "city.production.choice.request",
        input: { cityId, args: productionArgs },
      },
      {
        procedureKey: "city.production.choice.request",
        input: { cityId, args: productionArgs },
        approval: controllerApproval(),
      },
      {
        procedureKey: "city.production.choice.request",
        input: {
          cityId,
          args: productionArgs,
          rawCommand: "Game.CityOperations.sendRequest(...)",
        },
        approval: controllerApproval(),
        controllerProof: controllerMutationProof(),
      },
      {
        procedureKey: "city.production.choice.request",
        input: { cityId, args: productionArgs },
        approval: controllerApproval(),
        controllerProof: controllerMutationProof(),
        session: { state: "App UI" },
      },
      {
        procedureKey: "city.production.choice.request",
        input: { cityId, args: productionArgs },
        approval: {
          source: "controller-runtime",
          approved: true,
          reason: "controller approved production choice",
          command: "Game.CityOperations.sendRequest(...)",
        },
        controllerProof: controllerMutationProof(),
      },
      {
        procedureKey: "city.population.place.request",
        input: {
          mode: "assign-worker",
          playerId: 0,
          location: workerLocation,
        },
      },
      {
        procedureKey: "city.population.place.request",
        input: {
          mode: "assign-worker",
          playerId: 0,
          location: workerLocation,
        },
        approval: controllerApproval(),
      },
      {
        procedureKey: "city.population.place.request",
        input: {
          mode: "assign-worker",
          playerId: 0,
          location: workerLocation,
          rawCommand: "Game.PlayerOperations.sendRequest(...)",
        },
        approval: controllerApproval(),
        controllerProof: controllerMutationProof(),
      },
      {
        procedureKey: "city.population.place.request",
        input: {
          mode: "expand-city",
          cityId,
          destination: target,
        },
        approval: controllerApproval(),
        controllerProof: controllerMutationProof(),
        state: { name: "App UI" },
      },
      {
        procedureKey: "city.population.place.request",
        input: {
          mode: "assign-worker",
          playerId: 0,
          location: workerLocation,
        },
        approval: {
          source: "controller-runtime",
          approved: true,
          reason: "controller approved population placement",
          command: "Game.PlayerOperations.sendRequest(...)",
        },
        controllerProof: controllerMutationProof(),
      },
      { procedureKey: "narrative.choice.request", input: narrativeInput },
      {
        procedureKey: "narrative.choice.request",
        input: narrativeInput,
        approval: controllerApproval(),
      },
      {
        procedureKey: "narrative.choice.request",
        input: {
          ...narrativeInput,
          rawCommand: "Game.PlayerOperations.sendRequest(...)",
        },
        approval: controllerApproval(),
        controllerProof: controllerMutationProof(),
      },
      {
        procedureKey: "narrative.choice.request",
        input: narrativeInput,
        approval: controllerApproval(),
        controllerProof: controllerMutationProof(),
        session: { state: "App UI" },
      },
      {
        procedureKey: "narrative.choice.request",
        input: narrativeInput,
        approval: {
          source: "controller-runtime",
          approved: true,
          reason: "controller approved narrative choice",
          command: "Game.PlayerOperations.sendRequest(...)",
        },
        controllerProof: controllerMutationProof(),
      },
      { procedureKey: "diplomacy.response.request", input: diplomacyInput },
      {
        procedureKey: "diplomacy.response.request",
        input: diplomacyInput,
        approval: controllerApproval(),
      },
      {
        procedureKey: "diplomacy.response.request",
        input: {
          ...diplomacyInput,
          rawCommand: "Game.PlayerOperations.sendRequest(...)",
        },
        approval: controllerApproval(),
        controllerProof: controllerMutationProof(),
      },
      {
        procedureKey: "diplomacy.response.request",
        input: {
          ...diplomacyInput,
          activateNotification: false,
        },
        approval: controllerApproval(),
        controllerProof: controllerMutationProof(),
      },
      {
        procedureKey: "diplomacy.response.request",
        input: diplomacyInput,
        approval: controllerApproval(),
        controllerProof: controllerMutationProof(),
        session: { state: "App UI" },
      },
      {
        procedureKey: "diplomacy.response.request",
        input: diplomacyInput,
        approval: {
          source: "controller-runtime",
          approved: true,
          reason: "controller approved diplomacy response",
          command: "Game.PlayerOperations.sendRequest(...)",
        },
        controllerProof: controllerMutationProof(),
      },
      {
        procedureKey: "progression.technology.choice.request",
        input: progressionTechnologyInput,
      },
      {
        procedureKey: "progression.technology.choice.request",
        input: progressionTechnologyInput,
        approval: controllerApproval(),
      },
      {
        procedureKey: "progression.technology.choice.request",
        input: {
          ...progressionTechnologyInput,
          rawCommand: "Game.PlayerOperations.sendRequest(...)",
        },
        approval: controllerApproval(),
        controllerProof: controllerMutationProof(),
      },
      {
        procedureKey: "progression.technology.choice.request",
        input: progressionTechnologyInput,
        approval: controllerApproval(),
        controllerProof: controllerMutationProof(),
        session: { state: "App UI" },
      },
      {
        procedureKey: "progression.technology.choice.request",
        input: progressionTechnologyInput,
        approval: {
          source: "controller-runtime",
          approved: true,
          reason: "controller approved technology choice",
          command: "Game.PlayerOperations.sendRequest(...)",
        },
        controllerProof: controllerMutationProof(),
      },
      {
        procedureKey: "progression.culture.choice.request",
        input: progressionCultureInput,
      },
      {
        procedureKey: "progression.culture.choice.request",
        input: {
          ...progressionCultureInput,
          rawCommand: "Game.PlayerOperations.sendRequest(...)",
        },
        approval: controllerApproval(),
        controllerProof: controllerMutationProof(),
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

  test("keeps mutation approval middleware authoritative after envelope validation", async () => {
    const fake = fakeNotificationDismissContext();

    const response = await invokeCiv7ControllerBridgeRequest({
      procedureKey: "notifications.dismiss.request",
      input: { notificationId },
      approval: {
        source: "controller-runtime",
        approved: true,
        reason: "   ",
      },
      controllerProof: controllerMutationProof(),
      correlationId: "controller-notification-approval-1",
    }, {
      createContext: () => fake.context,
    });

    expect(Value.Check(Civ7ControllerBridgeResponseSchema, response)).toBe(true);
    expect(response).toEqual({
      ok: false,
      correlationId: "controller-notification-approval-1",
      error: {
        code: "MUTATION_APPROVAL_REQUIRED",
        message: "Explicit mutation approval is required.",
        reason: "procedure-failed",
      },
    });
    expect(fake.calls).toEqual({
      status: [],
      dismissal: [],
    });
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
): {
  calls: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
  contextRequests: unknown[];
  context: Civ7ControlOrpcContext;
} {
  const calls: Array<Civ7ControlOrpcContext["endpointDefaults"]> = [];
  return {
    calls,
    contextRequests: [],
    context: {
      endpointDefaults: { timeoutMs: 1_000 },
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

function fakeAttentionContext(unitId: { owner: number; id: number; type: number }): {
  calls: {
    notifications: Array<Record<string, unknown> | undefined>;
    readyUnit: Array<{ input: unknown; options: unknown }>;
  };
  contextRequests: unknown[];
  context: Civ7ControlOrpcContext;
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
      approval: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: Civ7ControlOrpcContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    dismissal: Array<{
      input: unknown;
      options: unknown;
      approval: unknown;
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
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        requestCiv7NotificationDismissal: async (input, options, approval) => {
          calls.dismissal.push({ input, options, approval });
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
      approval: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: Civ7ControlOrpcContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    turnCompletion: Array<{
      options: unknown;
      approval: unknown;
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
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        requestCiv7TurnComplete: async (options, approval) => {
          calls.turnCompletion.push({ options, approval });
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
      approval: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: Civ7ControlOrpcContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    targetAction: Array<{
      input: unknown;
      options: unknown;
      approval: unknown;
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
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        requestCiv7UnitTargetAction: async (input, options, approval) => {
          calls.targetAction.push({ input, options, approval });
          return unitTargetActionResult();
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
      approval: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: Civ7ControlOrpcContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    production: Array<{
      input: unknown;
      options: unknown;
      approval: unknown;
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
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        requestCiv7ProductionChoice: async (input, options, approval) => {
          calls.production.push({ input, options, approval });
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
      approval: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: Civ7ControlOrpcContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    population: Array<{
      method: "requestCiv7AssignWorkerPlacement" | "requestCiv7ExpandCityPlacement";
      input: unknown;
      options: unknown;
      approval: unknown;
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
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        requestCiv7AssignWorkerPlacement: async (input, options, approval) => {
          calls.population.push({
            method: "requestCiv7AssignWorkerPlacement",
            input,
            options,
            approval,
          });
          return populationPlacementResult("assign-worker");
        },
        requestCiv7ExpandCityPlacement: async (input, options, approval) => {
          calls.population.push({
            method: "requestCiv7ExpandCityPlacement",
            input,
            options,
            approval,
          });
          return populationPlacementResult("expand-city");
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
      approval: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: Civ7ControlOrpcContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    narrative: Array<{
      input: unknown;
      options: unknown;
      approval: unknown;
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
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        requestCiv7NarrativeChoice: async (input, options, approval) => {
          calls.narrative.push({ input, options, approval });
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
      approval: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: Civ7ControlOrpcContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    diplomacy: Array<{
      input: unknown;
      options: unknown;
      approval: unknown;
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
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        requestCiv7DiplomacyResponse: async (input, options, approval) => {
          calls.diplomacy.push({ input, options, approval });
          return diplomacyResponseResult();
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
      approval: unknown;
    }>;
    culture: Array<{
      input: unknown;
      options: unknown;
      approval: unknown;
    }>;
  };
  contextRequests: unknown[];
  context: Civ7ControlOrpcContext;
} {
  const calls: {
    status: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    views: Array<Civ7ControlOrpcContext["endpointDefaults"]>;
    technology: Array<{
      input: unknown;
      options: unknown;
      approval: unknown;
    }>;
    culture: Array<{
      input: unknown;
      options: unknown;
      approval: unknown;
    }>;
  } = {
    status: [],
    views: [],
    technology: [],
    culture: [],
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
      directControl: {
        getCiv7PlayableStatus: async (options) => {
          calls.status.push(options);
          return playableStatusResult();
        },
        getCiv7PlayNotificationView: async (options) => {
          calls.views.push(options);
          return views.shift() ?? progressionCleanNotificationView();
        },
        requestCiv7TechnologyChoiceCloseout: async (input, options, approval) => {
          calls.technology.push({ input, options, approval });
          return progressionCloseoutResult("technology");
        },
        requestCiv7CultureChoiceCloseout: async (input, options, approval) => {
          calls.culture.push({ input, options, approval });
          return progressionCloseoutResult("culture");
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function controllerApproval(): Record<string, unknown> {
  return {
    source: "controller-runtime",
    approved: true,
    reason: "controller approved dismissal",
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
        ui: {
          inGame: { ok: true, value: true },
          inShell: { ok: true, value: false },
          inLoading: { ok: true, value: false },
          canBeginGame: { ok: true, value: false },
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
