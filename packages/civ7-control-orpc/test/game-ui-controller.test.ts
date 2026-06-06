import { describe, expect, test } from "vitest";

import {
  createCiv7GameUiControllerContextFactory,
  installCiv7GameUiIntelligenceBridge,
  type Civ7GameUiRuntimeTarget,
} from "../src/game-ui";
import { requestCiv7GameUiTechnologyTarget } from "../src/game-ui-progression";
import { requestCiv7GameUiTownFocusChange } from "../src/game-ui-town-focus";

describe("Civ7 game UI controller bootstrap", () => {
  const notificationId = { owner: 0, id: 113, type: 20 };
  const cityId = { owner: 0, id: 65_536, type: 1 };
  const productionArgs = { ConstructibleType: 713_967_338, X: 22, Y: 31 };
  const populationDestination = { x: 22, y: 31 };
  const townFocusGrowthType = -284_569_333;
  const townFocusProjectType = -548_685_232;
  const attributeNode = 20;
  const traditionType = -331_546_976;
  const traditionAction = -1_326_475_004;
  const diplomacyActionId = 8_821;
  const diplomacyResponseType = -1_713_616_684;
  const firstMeetResponseType = 673_478_009;
  const governmentType = 0;
  const governmentAction = -1_326_475_004;
  const goldenAgeType = -340_825_966;
  const resettleTarget = { x: 22, y: 31 };
  const unitId = { owner: 0, id: 42, type: 1 };
  const unitTarget = { x: 22, y: 31 };

  test("installs the intelligence bridge with a game UI readiness context", async () => {
    const target = gameUiTarget();
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    expect(target.Civ7IntelligenceBridge).toBe(bridge);

    const response = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "game-ui-readiness-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "readiness.current",
      correlationId: "game-ui-readiness-1",
      output: {
        playable: false,
        readiness: "app-ui-game",
        capability: {
          canObserve: true,
          canMutate: false,
        },
        controller: {
          supportedProcedures: [
            {
              procedureKey: "world.current",
              risk: "read-only",
            },
          ],
        },
        sources: {
          gameUi: {
            inGame: true,
            inShell: false,
            inLoading: false,
            canBeginGame: false,
          },
          runtimeControl: {
            ready: null,
          },
        },
      },
    });
    expect(response.ok && response.output.nextSteps).toEqual([{
      kind: "read-world",
      source: "readiness.current",
      label: "Read current world facts before choosing support actions.",
    }]);
  });

  test("reads current world through game UI service dependency", async () => {
    const bridge = installCiv7GameUiIntelligenceBridge({ target: gameUiTarget() });

    const response = await bridge.invoke({
      procedureKey: "world.current",
      input: {},
      correlationId: "game-ui-world-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "world.current",
      correlationId: "game-ui-world-1",
      output: {
        playable: false,
        readiness: "app-ui-game",
        sourceStatus: {
          playableStatus: "read",
          game: "read",
          map: "read",
          players: "read",
        },
        turn: {
          current: 42,
          date: "Ancient Era",
          age: 1,
          maxTurns: 500,
          hash: 123,
        },
        localPlayer: {
          playerId: 0,
          observerId: 0,
        },
        map: {
          width: 74,
          height: 46,
          plotCount: 3404,
          mapSize: 1,
          randomSeed: 99,
        },
        players: {
          maxPlayers: 8,
          alivePlayerIds: [0],
          aliveHumanIds: [0],
          aliveHumanCount: 1,
        },
      },
    });

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"session\"");
    expect(serialized).not.toContain("rawCommand");
    expect(serialized).not.toContain("Game.");
    expect(serialized).not.toContain("enemy");
    expect(serialized).not.toContain("hostile");
    expect(serialized).not.toContain("opponent");
    expect(serialized).not.toContain("threat");
    expect(serialized).not.toContain("war");
    expect(serialized).not.toContain("ally");
    expect(serialized).not.toContain("suzerain");
  });

  test("does not advertise current world without player count APIs", async () => {
    const bridge = installCiv7GameUiIntelligenceBridge({
      target: gameUiTarget({ Players: undefined }),
    });

    const readiness = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
    });

    expect(readiness).toMatchObject({
      ok: true,
      output: {
        capability: {
          canObserve: false,
          canMutate: false,
        },
        controller: {
          supportedProcedures: [],
        },
      },
    });

    const world = await bridge.invoke({
      procedureKey: "world.current",
      input: {},
    });

    expect(world).toEqual({
      ok: false,
      error: {
        code: "BRIDGE_PROCEDURE_NOT_SUPPORTED",
        message:
          "Civ7 controller bridge procedure is not supported by this controller context.",
        reason: "procedure-not-supported",
      },
    });
  });

  test("reports narrow notification mutation and attention read support", async () => {
    const target = gameUiNotificationTarget(notificationId);
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "game-ui-readiness-supported-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "readiness.current",
      correlationId: "game-ui-readiness-supported-1",
      output: {
        playable: false,
        readiness: "app-ui-game",
        capability: {
          canObserve: true,
          canMutate: false,
          reason:
            "The game UI controller can read supported procedure evidence; broad runtime mutation remains unavailable.",
        },
        controller: {
          supportedProcedures: [
            {
              procedureKey: "attention.current",
              risk: "read-only",
            },
            {
              procedureKey: "world.current",
              risk: "read-only",
            },
            {
              procedureKey: "notifications.dismiss.request",
              risk: "mutation",
            },
          ],
        },
      },
    });
    expect(response.ok && response.output.nextSteps).toEqual([{
      kind: "read-attention",
      source: "readiness.current",
      label: "Read current attention before choosing support actions.",
    }]);
  });

  test("executes notification dismissal through game UI runtime", async () => {
    const target = gameUiNotificationTarget(notificationId);
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "notifications.dismiss.request",
      input: { notificationId },
      correlationId: "game-ui-notification-dismiss-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "notifications.dismiss.request",
      correlationId: "game-ui-notification-dismiss-1",
      output: {
        notificationId,
        sent: true,
        status: "sent-confirmed",
        validation: {
          beforeExists: true,
          canDismiss: true,
          afterExists: false,
        },
        postcondition: {
          classification: "notification-disappeared",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
      },
    });
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("NotificationModel.manager.dismiss");
    expect(serialized).not.toContain("Game.Notifications.dismiss");

    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
  });

  test("keeps unsupported mutation ports bounded by the existing bridge projection", async () => {
    const target = gameUiTarget();
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "notifications.dismiss.request",
      input: { notificationId: { owner: 0, id: 113, type: 20 } },
    });

    expect(response).toEqual({
      ok: false,
      error: {
        code: "BRIDGE_PROCEDURE_NOT_SUPPORTED",
        message:
          "Civ7 controller bridge procedure is not supported by this controller context.",
        reason: "procedure-not-supported",
      },
    });
    expect(JSON.stringify(response)).not.toContain("NotificationModel");
    expect(JSON.stringify(response)).not.toContain("Game.Notifications");

  });

  test("keeps unsupported game UI mutations bounded when notification dismissal is available", async () => {
    const target = gameUiNotificationTarget(notificationId);
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "turn.complete.request",
      input: {},
    });

    expect(response).toEqual({
      ok: false,
      error: {
        code: "BRIDGE_PROCEDURE_NOT_SUPPORTED",
        message:
          "Civ7 controller bridge procedure is not supported by this controller context.",
        reason: "procedure-not-supported",
      },
    });

    expect(JSON.stringify(response)).not.toContain("Civ7 game UI controller dependency");
  });

  test("executes turn completion through game UI service dependency", async () => {
    const sendCalls: string[] = [];
    const deselectCalls: string[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      blocksTurnAdvancement: false,
      canEndTurn: true,
      turnCompletion: {
        onSend: () => sendCalls.push("send"),
        onDeselect: () => deselectCalls.push("deselect"),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "turn.complete.request",
      input: {},
      correlationId: "game-ui-turn-complete-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "turn.complete.request",
      correlationId: "game-ui-turn-complete-1",
      output: {
        sent: true,
        status: "sent-guarded",
        before: {
          turn: 42,
          hasSentTurnComplete: false,
          canEndTurn: true,
          blocker: 0,
        },
        after: {
          turn: 42,
          hasSentTurnComplete: true,
          canEndTurn: true,
          blocker: 0,
        },
        postcondition: {
          classification: "turn-complete-sent",
          confirmed: true,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "do-not-repeat",
          source: "turn.complete.request",
        }],
      },
    });
    expect(sendCalls).toEqual(["send"]);
    expect(deselectCalls).toEqual(["deselect"]);
    const serialized = JSON.stringify(response);

    expect(serialized).not.toContain("GameContext.sendTurnComplete");
    expect(serialized).not.toContain("game-ui-turn-completion-requested");
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"command\"");
  });

  test("executes production choice through game UI service dependency", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      notificationTarget: cityId,
      productionChoice: {
        cityId,
        canStart: true,
        clearBlockerOnSend: true,
        onSend: (args) => sendCalls.push(args),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "game-ui-production-readiness-1",
    });
    expect(readiness).toMatchObject({
      ok: true,
      output: {
        capability: {
          canObserve: true,
          canMutate: false,
          reason:
            "The game UI controller can read supported procedure evidence; broad runtime mutation remains unavailable.",
        },
        controller: {
          supportedProcedures: expect.arrayContaining([
            {
              procedureKey: "city.production.choice.request",
              risk: "mutation",
            },
          ]),
        },
      },
    });

    const response = await bridge.invoke({
      procedureKey: "city.production.choice.request",
      input: { cityId, args: productionArgs },
      correlationId: "game-ui-production-choice-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "city.production.choice.request",
      correlationId: "game-ui-production-choice-1",
      output: {
        cityId,
        args: productionArgs,
        sent: true,
        status: "sent-confirmed",
        validation: {
          beforeValid: true,
          afterValid: true,
        },
        postcondition: {
          classification: "production-choice-cleared",
          confirmed: true,
          noRepeatAfterUnverified: false,
          blockerStillLive: false,
        },
        nextSteps: [{
          kind: "refresh-attention",
          source: "city.production.choice.request",
        }],
      },
    });
    expect(sendCalls).toEqual([productionArgs]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("Game.CityOperations");
    expect(serialized).not.toContain("sendRequest");
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");
  });

  test("keeps game UI production validator blocks semantic and not sent", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      notificationTarget: cityId,
      productionChoice: {
        cityId,
        canStart: false,
        onSend: (args) => sendCalls.push(args),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "city.production.choice.request",
      input: { cityId, args: productionArgs },
      correlationId: "game-ui-production-blocked-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: false,
        status: "not-sent",
        validation: {
          beforeValid: false,
          afterValid: false,
        },
        postcondition: {
          classification: "not-sent",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "inspect-production",
          source: "city.production.choice.request",
        }],
      },
    });
    expect(sendCalls).toEqual([]);
  });

  test("keeps failed game UI production blocker reads no-repeat guarded", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      notificationTarget: cityId,
      productionChoice: {
        cityId,
        canStart: true,
        blockerReadFailsAfterSend: true,
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "city.production.choice.request",
      input: { cityId, args: productionArgs },
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "production-state-changed-blocker-still-live",
          confirmed: false,
          noRepeatAfterUnverified: true,
          blockerStillLive: true,
        },
        nextSteps: [{
          kind: "do-not-repeat",
          source: "city.production.choice.request",
        }],
      },
    });
  });

  test("keeps unrelated game UI production blocker evidence guarded", async () => {
    const otherCityId = { owner: 0, id: 65_537, type: 1 };
    const target = gameUiNotificationTarget(notificationId, {
      notificationTarget: otherCityId,
      productionChoice: {
        cityId,
        canStart: true,
        clearBlockerOnSend: true,
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "city.production.choice.request",
      input: { cityId, args: productionArgs },
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "production-state-changed-blocker-still-live",
          confirmed: false,
          noRepeatAfterUnverified: true,
          blockerStillLive: true,
        },
      },
    });
  });

  test("keeps live matching game UI production blockers guarded", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      notificationTarget: cityId,
      productionChoice: {
        cityId,
        canStart: true,
        clearBlockerOnSend: false,
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "city.production.choice.request",
      input: { cityId, args: productionArgs },
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "production-state-changed-blocker-still-live",
          confirmed: false,
          noRepeatAfterUnverified: true,
          blockerStillLive: true,
        },
      },
    });
  });

  test("does not confirm game UI production from selected-city changes alone", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      notificationTarget: cityId,
      selectedCityId: cityId,
      productionChoice: {
        cityId,
        canStart: true,
        changeProductionStateOnSend: false,
        clearSelectedCityOnSend: true,
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "city.production.choice.request",
      input: { cityId, args: productionArgs },
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "no-state-change",
          confirmed: false,
          noRepeatAfterUnverified: true,
          productionStateChanged: false,
          blockerStillLive: true,
        },
      },
    });
  });

  test("executes assign-worker population placement through game UI service dependency", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      populationPlacement: {
        cityId,
        readyBefore: true,
        clearReadyOnSend: true,
        onAssignWorkerSend: (args) => sendCalls.push(args),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "game-ui-population-readiness-1",
    });
    expect(readiness).toMatchObject({
      ok: true,
      output: {
        capability: {
          canObserve: true,
          canMutate: false,
          reason:
            "The game UI controller can read supported procedure evidence; broad runtime mutation remains unavailable.",
        },
        controller: {
          supportedProcedures: expect.arrayContaining([
            {
              procedureKey: "city.population.place.request",
              risk: "mutation",
            },
          ]),
        },
      },
    });

    const response = await bridge.invoke({
      procedureKey: "city.population.place.request",
      input: { mode: "assign-worker", playerId: 0, location: 2543 },
      correlationId: "game-ui-population-assign-worker-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "city.population.place.request",
      correlationId: "game-ui-population-assign-worker-1",
      output: {
        placement: {
          mode: "assign-worker",
          playerId: 0,
          location: 2543,
        },
        sent: true,
        status: "sent-confirmed",
        validation: {
          beforeValid: true,
          afterValid: true,
        },
        postcondition: {
          classification: "population-ready-cleared",
          confidence: "confirmed",
          confirmed: true,
          noRepeatAfterUnverified: false,
          readyCleared: true,
        },
        nextSteps: [{
          kind: "refresh-attention",
          source: "city.population.place.request",
        }],
      },
    });
    expect(sendCalls).toEqual([{ Location: 2543, Amount: 1 }]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("Game.PlayerOperations");
    expect(serialized).not.toContain("sendRequest");
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");
  });

  test("executes expand-city population placement through game UI service dependency", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      populationPlacement: {
        cityId,
        readyBefore: true,
        clearReadyOnSend: true,
        onExpandCitySend: (args) => sendCalls.push(args),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "city.population.place.request",
      input: {
        mode: "expand-city",
        cityId,
        destination: populationDestination,
      },
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        placement: {
          mode: "expand-city",
          cityId,
          destination: populationDestination,
        },
        sent: true,
        status: "sent-confirmed",
        postcondition: {
          classification: "population-ready-cleared",
          confirmed: true,
          noRepeatAfterUnverified: false,
          readyCleared: true,
        },
      },
    });
    expect(sendCalls).toEqual([{ X: populationDestination.x, Y: populationDestination.y }]);
  });

  test("keeps game UI population validator blocks semantic and not sent", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      populationPlacement: {
        cityId,
        canAssignWorker: false,
        readyBefore: true,
        onAssignWorkerSend: (args) => sendCalls.push(args),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "city.population.place.request",
      input: { mode: "assign-worker", playerId: 0, location: 2543 },
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: false,
        status: "not-sent",
        validation: {
          beforeValid: false,
          afterValid: false,
        },
        postcondition: {
          classification: "not-sent",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "inspect-population-placement",
          source: "city.population.place.request",
        }],
      },
    });
    expect(sendCalls).toEqual([]);
  });

  test("blocks game UI assign-worker sends for non-local players", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      populationPlacement: {
        cityId,
        readyBefore: true,
        clearReadyOnSend: true,
        onAssignWorkerSend: (args) => sendCalls.push(args),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "city.population.place.request",
      input: { mode: "assign-worker", playerId: 2, location: 2543 },
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        placement: {
          mode: "assign-worker",
          playerId: 2,
          location: 2543,
        },
        sent: false,
        status: "not-sent",
        validation: {
          beforeValid: false,
          afterValid: false,
        },
        postcondition: {
          classification: "not-sent",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
      },
    });
    expect(sendCalls).toEqual([]);
  });

  test("keeps unchanged game UI population placements no-repeat guarded", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      populationPlacement: {
        cityId,
        readyBefore: true,
        clearReadyOnSend: false,
        changePlacementStateOnSend: false,
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "city.population.place.request",
      input: { mode: "assign-worker", playerId: 0, location: 2543 },
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "no-state-change",
          confidence: "unverified",
          confirmed: false,
          noRepeatAfterUnverified: true,
          readyCleared: false,
          placementStateChanged: false,
        },
        nextSteps: [{
          kind: "do-not-repeat",
          source: "city.population.place.request",
        }],
      },
    });
  });

  test("keeps failed game UI population snapshot reads no-repeat guarded", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      populationPlacement: {
        cityId,
        readyBefore: true,
        clearReadyOnSend: true,
        cityReadFailsAfterSend: true,
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "city.population.place.request",
      input: { mode: "assign-worker", playerId: 0, location: 2543 },
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: true,
        status: "sent-guarded",
        postcondition: {
          classification: "placement-state-changed",
          confidence: "confirmed",
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "do-not-repeat",
          source: "city.population.place.request",
        }],
      },
    });
  });

  test("keeps missing game UI population ready-city evidence no-repeat guarded", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      populationPlacement: {
        cityId,
        readyBefore: false,
        clearReadyOnSend: true,
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "city.population.place.request",
      input: { mode: "assign-worker", playerId: 0, location: 2543 },
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "missing-postcondition",
          confidence: "unverified",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "do-not-repeat",
          source: "city.population.place.request",
        }],
      },
    });
  });

  test("executes town focus change through game UI service dependency", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      townFocus: {
        canChange: true,
        onChangeSend: (args) => sendCalls.push(args),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "game-ui-town-focus-readiness-1",
    });
    expect(readiness).toMatchObject({
      ok: true,
      output: {
        controller: {
          supportedProcedures: expect.arrayContaining([
            {
              procedureKey: "city.townFocus.change.request",
              risk: "mutation",
            },
            {
              procedureKey: "city.townFocus.review.request",
              risk: "mutation",
            },
          ]),
        },
      },
    });

    const response = await bridge.invoke({
      procedureKey: "city.townFocus.change.request",
      input: {
        cityId,
        growthType: townFocusGrowthType,
        projectType: townFocusProjectType,
      },
      correlationId: "game-ui-town-focus-change-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "city.townFocus.change.request",
      correlationId: "game-ui-town-focus-change-1",
      output: {
        cityId,
        growthType: townFocusGrowthType,
        projectType: townFocusProjectType,
        city: cityId.id,
        sent: true,
        status: "sent-unverified",
        validation: {
          beforeValid: true,
          afterValid: true,
        },
        postcondition: {
          classification: "pending-runtime-proof",
          confidence: "pending-runtime-proof",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "do-not-repeat",
          source: "city.townFocus.change.request",
        }],
      },
    });
    expect(sendCalls).toEqual([{
      Type: townFocusGrowthType,
      ProjectType: townFocusProjectType,
      City: cityId.id,
    }]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("Game.CityCommands");
    expect(serialized).not.toContain("CHANGE_GROWTH_MODE");
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");
    expect(serialized).not.toContain("\"verified\"");
  });

  test("executes town project review through game UI service dependency", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      townFocus: {
        canReview: true,
        onReviewSend: (args) => sendCalls.push(args),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "city.townFocus.review.request",
      input: { cityId },
      correlationId: "game-ui-town-focus-review-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "city.townFocus.review.request",
      correlationId: "game-ui-town-focus-review-1",
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
    expect(sendCalls).toEqual([{}]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("Game.CityOperations");
    expect(serialized).not.toContain("CONSIDER_TOWN_PROJECT");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");
  });

  test("keeps game UI town focus validator blocks semantic and not sent", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      townFocus: {
        canChange: false,
        onChangeSend: (args) => sendCalls.push(args),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "city.townFocus.change.request",
      input: {
        cityId,
        growthType: townFocusGrowthType,
        projectType: townFocusProjectType,
      },
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: false,
        status: "not-sent",
        validation: {
          beforeValid: false,
          afterValid: false,
        },
        postcondition: {
          classification: "not-sent",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
      },
    });
    expect(sendCalls).toEqual([]);
  });

  test("blocks game UI town focus sends for non-local city owners", async () => {
    const sendCalls: unknown[] = [];
    const otherCityId = { owner: 2, id: cityId.id, type: cityId.type };
    const target = gameUiNotificationTarget(notificationId, {
      townFocus: {
        canChange: true,
        onChangeSend: (args) => sendCalls.push(args),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "city.townFocus.change.request",
      input: {
        cityId: otherCityId,
        growthType: townFocusGrowthType,
        projectType: townFocusProjectType,
      },
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        cityId: otherCityId,
        sent: false,
        status: "not-sent",
        validation: {
          beforeValid: false,
          afterValid: false,
        },
        postcondition: {
          classification: "not-sent",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
      },
    });
    expect(sendCalls).toEqual([]);
  });

  test("keeps partial game UI town focus targets from reporting sent", async () => {
    const result = await requestCiv7GameUiTownFocusChange(
      {
        cityId,
        growthType: townFocusGrowthType,
        projectType: townFocusProjectType,
      },
      {
        GameContext: { localPlayerID: 0 },
        CityCommandTypes: { CHANGE_GROWTH_MODE: "CHANGE_GROWTH_MODE" },
        Game: {
          CityCommands: {
            canStart: () => ({ Success: true }),
          },
        },
      },
    );

    expect(result).toMatchObject({
      sent: false,
      beforeValidation: { valid: true },
      afterValidation: { valid: true },
      postcondition: {
        classification: "not-sent",
      },
    });
  });

  test("executes technology progression choice through game UI service dependency", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      notificationTypeName: "NOTIFICATION_CHOOSE_TECH",
      progressionChoice: {
        kind: "technology",
        clearBlockerOnSend: true,
        onSend: (operationType, args) => sendCalls.push({ operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "game-ui-progression-readiness-1",
    });
    expect(readiness).toMatchObject({
      ok: true,
      output: {
        capability: {
          canObserve: true,
          canMutate: false,
          reason:
            "The game UI controller can read supported procedure evidence; broad runtime mutation remains unavailable.",
        },
        controller: {
          supportedProcedures: expect.arrayContaining([
            {
              procedureKey: "progression.technology.choice.request",
              risk: "mutation",
            },
            {
              procedureKey: "progression.culture.choice.request",
              risk: "mutation",
            },
          ]),
        },
      },
    });

    const response = await bridge.invoke({
      procedureKey: "progression.technology.choice.request",
      input: {
        playerId: 2,
        node: 18_001,
        notificationId,
      },
      correlationId: "game-ui-progression-tech-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "progression.technology.choice.request",
      correlationId: "game-ui-progression-tech-1",
      output: {
        playerId: 0,
        node: 18_001,
        notificationId,
        sent: true,
        status: "sent-confirmed",
        evidence: {
          beforeBlockerPresent: true,
          afterReadStatus: "read",
          afterBlockerPresent: false,
        },
        postcondition: {
          classification: "technology-choice-cleared",
          confidence: "confirmed",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
        nextSteps: [{
          kind: "refresh-attention",
          source: "progression.technology.choice.request",
        }],
      },
    });
    expect(sendCalls).toEqual([
      {
        operationType: "SET_TECH_TREE_NODE",
        args: { ProgressionTreeNodeType: 18_001 },
      },
      {
        operationType: "SET_TECH_TREE_TARGET_NODE",
        args: { ProgressionTreeNodeType: -1 },
      },
    ]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("SET_TECH_TREE_NODE");
    expect(serialized).not.toContain("SET_TECH_TREE_TARGET_NODE");
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");
    expect(serialized).not.toContain("\"rawCommand\"");
  });

  test("keeps sticky game UI culture progression choices no-repeat guarded", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      notificationTypeName: "NOTIFICATION_CHOOSE_CULTURE_NODE",
      progressionChoice: {
        kind: "culture",
        clearBlockerOnSend: false,
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "progression.culture.choice.request",
      input: {
        playerId: 0,
        node: 27_001,
        notificationId,
      },
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        playerId: 0,
        sent: true,
        status: "sent-unverified",
        evidence: {
          beforeBlockerPresent: true,
          afterReadStatus: "read",
          afterBlockerPresent: true,
        },
        postcondition: {
          classification: "culture-choice-sticky-blocker",
          confidence: "unverified",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "do-not-repeat",
          source: "progression.culture.choice.request",
        }],
      },
    });
  });

  test("keeps game UI progression validator blocks semantic and not sent", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      notificationTypeName: "NOTIFICATION_CHOOSE_TECH",
      progressionChoice: {
        kind: "technology",
        canChoose: false,
        onSend: (operationType, args) => sendCalls.push({ operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "progression.technology.choice.request",
      input: {
        playerId: 0,
        node: 18_001,
        notificationId,
      },
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: false,
        status: "not-sent",
        evidence: {
          beforeBlockerPresent: true,
          afterReadStatus: "skipped-not-sent",
        },
        postcondition: {
          classification: "not-sent",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "inspect-progression-choice",
          source: "progression.technology.choice.request",
        }],
      },
    });
    expect(sendCalls).toEqual([]);
  });

  test("executes progression targets through game UI service dependencies", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      progressionRequest: {
        onSend: (operationType, args) => sendCalls.push({ operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
    });
    expect(readiness).toMatchObject({
      ok: true,
      output: {
        controller: {
          supportedProcedures: expect.arrayContaining([
            {
              procedureKey: "progression.technology.target.request",
              risk: "mutation",
            },
            {
              procedureKey: "progression.culture.target.request",
              risk: "mutation",
            },
          ]),
        },
      },
    });

    const response = await bridge.invoke({
      procedureKey: "progression.technology.target.request",
      input: {
        playerId: 2,
        node: 18_001,
      },
      correlationId: "game-ui-progression-target-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "progression.technology.target.request",
      correlationId: "game-ui-progression-target-1",
      output: {
        playerId: 0,
        node: 18_001,
        sent: true,
        status: "sent-unverified",
        validation: {
          beforeValid: true,
          afterValid: true,
        },
        postcondition: {
          classification: "pending-runtime-proof",
          confidence: "pending-runtime-proof",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "do-not-repeat",
          source: "progression.technology.target.request",
        }],
      },
    });
    expect(sendCalls).toEqual([{
      operationType: "SET_TECH_TREE_TARGET_NODE",
      args: { ProgressionTreeNodeType: 18_001 },
    }]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("SET_TECH_TREE_TARGET_NODE");
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"operation\"");
    expect(serialized).not.toContain("\"verified\"");
  });

  test("does not advertise progression requests without local-player notification evidence", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      progressionRequest: {},
    });
    if (target.Game?.Notifications != null) {
      target.Game.Notifications.getIdsForPlayer = undefined;
    }
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
    });

    expect(readiness).toMatchObject({
      ok: true,
      output: {
        controller: {
          supportedProcedures: expect.not.arrayContaining([
            expect.objectContaining({
              procedureKey: "progression.technology.target.request",
            }),
            expect.objectContaining({
              procedureKey: "progression.attribute.purchase.request",
            }),
          ]),
        },
      },
    });
  });

  test("executes progression attribute and tradition requests through game UI service dependencies", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      progressionRequest: {
        onSend: (operationType, args) => sendCalls.push({ operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const attribute = await bridge.invoke({
      procedureKey: "progression.attribute.purchase.request",
      input: { node: attributeNode },
      correlationId: "game-ui-attribute-purchase-1",
    });
    const tradition = await bridge.invoke({
      procedureKey: "progression.tradition.change.request",
      input: {
        traditionType,
        action: traditionAction,
      },
      correlationId: "game-ui-tradition-change-1",
    });

    expect(attribute).toMatchObject({
      ok: true,
      procedureKey: "progression.attribute.purchase.request",
      output: {
        playerId: 0,
        node: attributeNode,
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "pending-runtime-proof",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
      },
    });
    expect(tradition).toMatchObject({
      ok: true,
      procedureKey: "progression.tradition.change.request",
      output: {
        playerId: 0,
        traditionType,
        action: traditionAction,
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "pending-runtime-proof",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
      },
    });
    expect(sendCalls).toEqual([
      {
        operationType: "BUY_ATTRIBUTE_TREE_NODE",
        args: { ProgressionTreeNodeType: attributeNode },
      },
      {
        operationType: "CHANGE_TRADITION",
        args: {
          TraditionType: traditionType,
          Action: traditionAction,
        },
      },
    ]);
    const serialized = JSON.stringify({ attribute, tradition });
    expect(serialized).not.toContain("BUY_ATTRIBUTE_TREE_NODE");
    expect(serialized).not.toContain("CHANGE_TRADITION");
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"operation\"");
    expect(serialized).not.toContain("\"verified\"");
  });

  test("keeps game UI progression review validator blocks semantic and not sent", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      progressionRequest: {
        canAttributeReview: false,
        onSend: (operationType, args) => sendCalls.push({ operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "progression.attribute.review.request",
      input: {},
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        playerId: 0,
        sent: false,
        status: "not-sent",
        validation: {
          beforeValid: false,
          afterValid: false,
        },
        postcondition: {
          classification: "not-sent",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "inspect-progression-attribute",
          source: "progression.attribute.review.request",
        }],
      },
    });
    expect(sendCalls).toEqual([]);
  });

  test("blocks game UI progression sends for non-local players", async () => {
    const sendCalls: unknown[] = [];
    const result = await requestCiv7GameUiTechnologyTarget(
      {
        playerId: 2,
        node: 18_001,
      },
      {
        GameContext: { localPlayerID: 0 },
        PlayerOperationTypes: {
          SET_TECH_TREE_TARGET_NODE: "SET_TECH_TREE_TARGET_NODE",
        },
        Game: {
          PlayerOperations: {
            canStart: () => ({ Success: true }),
            sendRequest: (_playerId, operationType, args) => {
              sendCalls.push({ operationType, args });
              return true;
            },
          },
        },
      },
    );

    expect(result).toMatchObject({
      playerId: 2,
      sent: false,
      beforeValidation: { valid: false },
      afterValidation: { valid: false },
      postcondition: { classification: "not-sent" },
    });
    expect(sendCalls).toEqual([]);
  });

  test("keeps partial game UI progression targets from reporting sent", async () => {
    const result = await requestCiv7GameUiTechnologyTarget(
      {
        playerId: 0,
        node: 18_001,
      },
      {
        GameContext: { localPlayerID: 0 },
        PlayerOperationTypes: {
          SET_TECH_TREE_TARGET_NODE: "SET_TECH_TREE_TARGET_NODE",
        },
        Game: {
          PlayerOperations: {
            canStart: () => ({ Success: true }),
          },
        },
      },
    );

    expect(result).toMatchObject({
      playerId: 0,
      sent: false,
      beforeValidation: { valid: true },
      afterValidation: { valid: true },
      postcondition: { classification: "not-sent" },
    });
  });

  test("executes narrative choice through game UI service dependency", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      notificationTypeName: "NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION",
      narrativeChoice: {
        clearBlockerOnSend: true,
        onSend: (playerId, args) => sendCalls.push({ playerId, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "game-ui-narrative-readiness-1",
    });
    expect(readiness).toMatchObject({
      ok: true,
      output: {
        controller: {
          supportedProcedures: expect.arrayContaining([
            {
              procedureKey: "narrative.choice.request",
              risk: "mutation",
            },
          ]),
        },
      },
    });

    const response = await bridge.invoke({
      procedureKey: "narrative.choice.request",
      input: {
        playerId: 2,
        targetType: "DISCOVERY_STORY",
        target: notificationId,
        action: 1,
      },
      correlationId: "game-ui-narrative-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "narrative.choice.request",
      correlationId: "game-ui-narrative-1",
      output: {
        playerId: 0,
        targetType: "DISCOVERY_STORY",
        target: notificationId,
        action: 1,
        sent: true,
        status: "sent-confirmed",
        validation: {
          beforeValid: true,
          afterValid: true,
        },
        postcondition: {
          classification: "narrative-blocker-cleared",
          confidence: "confirmed",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
        nextSteps: [{
          kind: "refresh-attention",
          source: "narrative.choice.request",
        }],
      },
    });
    expect(sendCalls).toEqual([{
      playerId: 0,
      args: {
        TargetType: "DISCOVERY_STORY",
        Target: notificationId,
        Action: 1,
      },
    }]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("CHOOSE_NARRATIVE_STORY_DIRECTION");
    expect(serialized).not.toContain("sendRequest");
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");
    expect(serialized).not.toContain("\"rawCommand\"");
  });

  test("keeps sticky game UI narrative choices no-repeat guarded", async () => {
    const target = {
      ...gameUiNotificationTarget(notificationId, {
        notificationTypeName: "NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION",
        narrativeChoice: {
          clearBlockerOnSend: false,
        },
      }),
      document: {
        querySelectorAll: () => {
          throw new Error("narrative panel read failed");
        },
      },
    };
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "narrative.choice.request",
      input: {
        playerId: 0,
        targetType: "DISCOVERY_STORY",
        target: notificationId,
        action: 1,
      },
      correlationId: "game-ui-narrative-sticky-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        playerId: 0,
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "no-state-change",
          confidence: "unverified",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "do-not-repeat",
          source: "narrative.choice.request",
        }],
      },
    });
  });

  test("keeps game UI narrative validator blocks semantic and not sent", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      notificationTypeName: "NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION",
      narrativeChoice: {
        canChoose: false,
        onSend: (playerId, args) => sendCalls.push({ playerId, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "narrative.choice.request",
      input: {
        playerId: 0,
        targetType: "DISCOVERY_STORY",
        target: notificationId,
        action: 1,
      },
      correlationId: "game-ui-narrative-blocked-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: false,
        status: "not-sent",
        validation: {
          beforeValid: false,
          afterValid: false,
        },
        postcondition: {
          classification: "not-sent",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "inspect-narrative-choice",
          source: "narrative.choice.request",
        }],
      },
    });
    expect(sendCalls).toEqual([]);
  });

  test("executes diplomacy response through game UI service dependency", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      notificationTypeName: "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
      notificationTarget: { owner: 0, id: diplomacyActionId, type: 20 },
      diplomacyResponse: {
        clearBlockerOnSend: true,
        onSend: (playerId, args) => sendCalls.push({ playerId, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "game-ui-diplomacy-readiness-1",
    });
    expect(readiness).toMatchObject({
      ok: true,
      output: {
        controller: {
          supportedProcedures: expect.arrayContaining([
            {
              procedureKey: "diplomacy.response.request",
              risk: "mutation",
            },
          ]),
        },
      },
    });

    const response = await bridge.invoke({
      procedureKey: "diplomacy.response.request",
      input: {
        playerId: 2,
        actionId: diplomacyActionId,
        responseType: diplomacyResponseType,
        notificationId,
      },
      correlationId: "game-ui-diplomacy-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "diplomacy.response.request",
      correlationId: "game-ui-diplomacy-1",
      output: {
        playerId: 0,
        actionId: diplomacyActionId,
        responseType: diplomacyResponseType,
        notificationId,
        sent: true,
        status: "sent-confirmed",
        validation: {
          beforeValid: true,
          afterValid: true,
        },
        postcondition: {
          classification: "diplomacy-blocker-cleared",
          confidence: "confirmed",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
        nextSteps: [{
          kind: "refresh-attention",
          source: "diplomacy.response.request",
        }],
      },
    });
    expect(sendCalls).toEqual([{
      playerId: 0,
      args: {
        ID: diplomacyActionId,
        Type: diplomacyResponseType,
      },
    }]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("RESPOND_DIPLOMATIC_ACTION");
    expect(serialized).not.toContain("sendRequest");
    expect(serialized).not.toContain("DiplomacyManager");
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");
    expect(serialized).not.toContain("\"rawCommand\"");
  });

  test("keeps sticky game UI diplomacy responses no-repeat guarded", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      notificationTypeName: "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
      notificationTarget: { owner: 0, id: diplomacyActionId, type: 20 },
      diplomacyResponse: {
        clearBlockerOnSend: false,
        blockerReadFailsAfterSend: true,
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "diplomacy.response.request",
      input: {
        playerId: 0,
        actionId: diplomacyActionId,
        responseType: diplomacyResponseType,
        notificationId,
      },
      correlationId: "game-ui-diplomacy-sticky-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        playerId: 0,
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "no-state-change",
          confidence: "unverified",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "do-not-repeat",
          source: "diplomacy.response.request",
        }],
      },
    });
  });

  test("keeps game UI diplomacy validator blocks semantic and not sent", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      notificationTypeName: "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
      notificationTarget: { owner: 0, id: diplomacyActionId, type: 20 },
      diplomacyResponse: {
        canRespond: false,
        onSend: (playerId, args) => sendCalls.push({ playerId, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "diplomacy.response.request",
      input: {
        playerId: 0,
        actionId: diplomacyActionId,
        responseType: diplomacyResponseType,
        notificationId,
      },
      correlationId: "game-ui-diplomacy-blocked-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: false,
        status: "not-sent",
        validation: {
          beforeValid: false,
          afterValid: false,
        },
        postcondition: {
          classification: "not-sent",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "inspect-diplomacy-response",
          source: "diplomacy.response.request",
        }],
      },
    });
    expect(sendCalls).toEqual([]);
  });

  test("does not advertise game UI diplomacy without notification blocking APIs", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      notificationTypeName: "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
      notificationTarget: { owner: 0, id: diplomacyActionId, type: 20 },
      diplomacyResponse: {},
    });
    const game = target.Game;
    if (game?.Notifications != null) {
      game.Notifications.getEndTurnBlockingType = undefined;
    }
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "diplomacy.response.request",
      input: {
        playerId: 0,
        actionId: diplomacyActionId,
        responseType: diplomacyResponseType,
      },
    });

    expect(response).toEqual({
      ok: false,
      error: {
        code: "BRIDGE_PROCEDURE_NOT_SUPPORTED",
        message:
          "Civ7 controller bridge procedure is not supported by this controller context.",
        reason: "procedure-not-supported",
      },
    });
  });

  test("reads strategy front summary through game UI service dependency", async () => {
    const target = gameUiStrategyFrontTarget();
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "game-ui-strategy-readiness-1",
    });
    expect(readiness).toMatchObject({
      ok: true,
      output: {
        capability: {
          canObserve: true,
          canMutate: false,
          reason:
            "The game UI controller can read supported procedure evidence; broad runtime mutation remains unavailable.",
        },
        controller: {
          supportedProcedures: expect.arrayContaining([
            {
              procedureKey: "strategy.frontSummary",
              risk: "read-only",
            },
          ]),
        },
        nextSteps: [{
          kind: "read-strategy-front",
          source: "readiness.current",
          label: "Read strategy front summary before choosing tactical support actions.",
        }],
      },
    });

    const response = await bridge.invoke({
      procedureKey: "strategy.frontSummary",
      input: {
        playerId: 0,
        origins: [{ x: 10, y: 20 }],
        candidateLimit: 3,
        scanRadius: 6,
      },
      correlationId: "game-ui-strategy-front-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "strategy.frontSummary",
      correlationId: "game-ui-strategy-front-1",
      output: {
        playerId: 0,
        localPlayerId: 0,
        origins: [{ x: 10, y: 20 }],
        sourceStatus: {
          targetCandidates: "read",
          battlefieldScan: "read",
        },
        relationshipLabelPolicy: {
          relationshipSource: "not-classified",
          relationshipProof: "none",
          unprovenLabel: "relationship-unproven",
        },
        summary: {
          targetCandidateCount: 1,
          pointOfInterestCount: expect.any(Number),
          observedOwnerCount: 2,
        },
        targetCandidates: [{
          owner: 1,
          relationship: "relationship-unproven",
          relationshipProof: "none",
          nearestDistance: 5,
          cityCount: 1,
          unitCount: 1,
          routeKind: "land",
        }],
        observedOwners: expect.arrayContaining([
          expect.objectContaining({
            owner: 0,
            relationship: "self",
            relationshipProof: "self",
          }),
          expect.objectContaining({
            owner: 1,
            relationship: "relationship-unproven",
            relationshipProof: "none",
          }),
        ]),
      },
    });
    expect(response.ok && response.output.nextSteps.map((step) => step.kind))
      .toContain("inspect-target-candidate");

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("Game.turn");
    expect(serialized).not.toContain("rawCommand");
    expect(serialized).not.toContain("Game.UnitOperations");
    expect(serialized).not.toContain("Game.UnitCommands");
    expect(serialized).not.toContain("sendRequest");
    expect(serialized).not.toContain("friendly");
    expect(serialized).not.toContain("enemy");
    expect(serialized).not.toContain("hostile");
    expect(serialized).not.toContain("opponent");
    expect(serialized).not.toContain("threat");
    expect(serialized).not.toContain("war");
    expect(serialized).not.toContain("ally");
    expect(serialized).not.toContain("suzerain");
  });

  test("does not advertise game UI strategy front without owner unit APIs", async () => {
    const target = gameUiStrategyFrontTarget();
    if (target.Players != null) {
      target.Players.Units = undefined;
    }
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
    });

    expect(readiness).toMatchObject({
      ok: true,
      output: {
        controller: {
          supportedProcedures: [
            {
              procedureKey: "world.current",
              risk: "read-only",
            },
          ],
        },
      },
    });

    const response = await bridge.invoke({
      procedureKey: "strategy.frontSummary",
      input: { origins: [{ x: 10, y: 20 }] },
    });

    expect(response).toEqual({
      ok: false,
      error: {
        code: "BRIDGE_PROCEDURE_NOT_SUPPORTED",
        message:
          "Civ7 controller bridge procedure is not supported by this controller context.",
        reason: "procedure-not-supported",
      },
    });
  });

  test("executes first-meet response through game UI service dependency", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      notificationTypeName: "NOTIFICATION_PLAYER_MET",
      notificationTarget: { owner: 2, id: 2, type: 0 },
      firstMeetResponse: {
        canRespond: true,
        clearBlockerOnSend: true,
        onSend: (playerId, args) => sendCalls.push({ playerId, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "game-ui-first-meet-readiness-1",
    });
    expect(readiness).toMatchObject({
      ok: true,
      output: {
        controller: {
          supportedProcedures: expect.arrayContaining([
            {
              procedureKey: "diplomacy.firstMeet.response.request",
              risk: "mutation",
            },
          ]),
        },
      },
    });

    const response = await bridge.invoke({
      procedureKey: "diplomacy.firstMeet.response.request",
      input: {
        playerId: 2,
        metPlayerId: 2,
        responseType: firstMeetResponseType,
      },
      correlationId: "game-ui-first-meet-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "diplomacy.firstMeet.response.request",
      correlationId: "game-ui-first-meet-1",
      output: {
        playerId: 0,
        metPlayerId: 2,
        responseType: firstMeetResponseType,
        sent: true,
        status: "sent-confirmed",
        validation: {
          beforeValid: true,
          afterValid: true,
        },
        postcondition: {
          classification: "first-meet-cleared",
          confidence: "confirmed",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
        nextSteps: [{
          kind: "refresh-attention",
          source: "diplomacy.firstMeet.response.request",
        }],
      },
    });
    expect(sendCalls).toEqual([{
      playerId: 0,
      args: {
        Player1: 0,
        Player2: 2,
        Type: firstMeetResponseType,
      },
    }]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("Game.PlayerOperations");
    expect(serialized).not.toContain("sendRequest");
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");
    expect(serialized).not.toContain("\"operation\"");
    expect(serialized).not.toContain("\"verified\"");
  });

  test("keeps game UI first-meet validator blocks semantic and not sent", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      notificationTypeName: "NOTIFICATION_PLAYER_MET",
      notificationTarget: { owner: 2, id: 2, type: 0 },
      firstMeetResponse: {
        canRespond: false,
        onSend: (playerId, args) => sendCalls.push({ playerId, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "diplomacy.firstMeet.response.request",
      input: {
        playerId: 2,
        metPlayerId: 2,
        responseType: firstMeetResponseType,
      },
      correlationId: "game-ui-first-meet-blocked-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        playerId: 0,
        sent: false,
        status: "not-sent",
        validation: {
          beforeValid: false,
          afterValid: false,
        },
        postcondition: {
          classification: "not-sent",
          confidence: "unverified",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "inspect-first-meet-response",
          source: "diplomacy.firstMeet.response.request",
        }],
      },
    });
    expect(sendCalls).toEqual([]);
  });

  test("keeps unmatched game UI first-meet blockers no-repeat guarded", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      notificationTypeName: "NOTIFICATION_PLAYER_MET",
      notificationTarget: { owner: 5, id: 5, type: 0 },
      firstMeetResponse: {
        canRespond: true,
        clearBlockerOnSend: false,
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "diplomacy.firstMeet.response.request",
      input: {
        playerId: 2,
        metPlayerId: 2,
        responseType: firstMeetResponseType,
      },
      correlationId: "game-ui-first-meet-unmatched-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "first-meet-blocker-unmatched",
          confidence: "unverified",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "do-not-repeat",
          source: "diplomacy.firstMeet.response.request",
        }],
      },
    });
  });

  test("executes government choice through game UI service dependency", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      governmentChoice: {
        canChange: true,
        onSend: (playerId, operationType, args) =>
          sendCalls.push({ playerId, operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "game-ui-government-readiness-1",
    });
    expect(readiness).toMatchObject({
      ok: true,
      output: {
        controller: {
          supportedProcedures: expect.arrayContaining([
            {
              procedureKey: "government.choice.request",
              risk: "mutation",
            },
            {
              procedureKey: "government.celebration.choice.request",
              risk: "mutation",
            },
          ]),
        },
      },
    });

    const response = await bridge.invoke({
      procedureKey: "government.choice.request",
      input: {
        playerId: 2,
        governmentType,
        action: governmentAction,
      },
      correlationId: "game-ui-government-choice-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "government.choice.request",
      correlationId: "game-ui-government-choice-1",
      output: {
        playerId: 0,
        governmentType,
        action: governmentAction,
        sent: true,
        status: "sent-unverified",
        validation: {
          beforeValid: true,
          afterValid: true,
        },
        postcondition: {
          classification: "pending-runtime-proof",
          confidence: "pending-runtime-proof",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "do-not-repeat",
          source: "government.choice.request",
        }],
      },
    });
    expect(sendCalls).toEqual([{
      playerId: 0,
      operationType: "CHANGE_GOVERNMENT",
      args: { GovernmentType: governmentType, Action: governmentAction },
    }]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("Game.PlayerOperations");
    expect(serialized).not.toContain("sendRequest");
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("\"payload\"");
    expect(serialized).not.toContain("\"verified\"");
    expect(serialized).not.toContain("\"result\"");
  });

  test("keeps game UI government validator blocks semantic and not sent", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      governmentChoice: {
        canChange: false,
        onSend: (playerId, operationType, args) =>
          sendCalls.push({ playerId, operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "government.choice.request",
      input: {
        playerId: 2,
        governmentType,
        action: governmentAction,
      },
      correlationId: "game-ui-government-blocked-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        playerId: 0,
        sent: false,
        status: "not-sent",
        validation: {
          beforeValid: false,
          afterValid: false,
        },
        postcondition: {
          classification: "not-sent",
          confidence: "unverified",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "inspect-government-choice",
          source: "government.choice.request",
        }],
      },
    });
    expect(sendCalls).toEqual([]);
  });

  test("executes celebration choice through game UI service dependency", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      governmentChoice: {
        canCelebrate: true,
        onSend: (playerId, operationType, args) =>
          sendCalls.push({ playerId, operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "government.celebration.choice.request",
      input: {
        playerId: 2,
        goldenAgeType,
      },
      correlationId: "game-ui-celebration-choice-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "government.celebration.choice.request",
      correlationId: "game-ui-celebration-choice-1",
      output: {
        playerId: 0,
        goldenAgeType,
        sent: true,
        status: "sent-unverified",
        validation: {
          beforeValid: true,
          afterValid: true,
        },
        postcondition: {
          classification: "pending-runtime-proof",
          confidence: "pending-runtime-proof",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "do-not-repeat",
          source: "government.celebration.choice.request",
        }],
      },
    });
    expect(sendCalls).toEqual([{
      playerId: 0,
      operationType: "CHOOSE_GOLDEN_AGE",
      args: { GoldenAgeType: goldenAgeType },
    }]);
  });

  test("executes unit target action through game UI service dependency", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      unitTargetAction: {
        unitId,
        target: unitTarget,
        onSend: (family, operationType, args) =>
          sendCalls.push({ family, operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "game-ui-unit-target-readiness-1",
    });
    expect(readiness).toMatchObject({
      ok: true,
      output: {
        controller: {
          supportedProcedures: expect.arrayContaining([
            {
              procedureKey: "unit.target.action.request",
              risk: "mutation",
            },
          ]),
        },
      },
    });

    const response = await bridge.invoke({
      procedureKey: "unit.target.action.request",
      input: {
        unitId,
        ...unitTarget,
      },
      correlationId: "game-ui-unit-target-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "unit.target.action.request",
      correlationId: "game-ui-unit-target-1",
      output: {
        unitId,
        target: unitTarget,
        sent: true,
        status: "sent-confirmed",
        validation: {
          selected: {
            family: "unit-operation",
            operationType: "MOVE_TO",
            valid: true,
            targetInReturnedPlots: true,
          },
        },
        postcondition: {
          classification: "target-reached",
          confidence: "confirmed",
          confirmed: true,
          noRepeatAfterUnverified: false,
          destinationReached: true,
        },
        nextSteps: [{
          kind: "refresh-attention",
          source: "unit.target.action.request",
        }],
      },
    });
    expect(sendCalls).toEqual([{
      family: "unit-operation",
      operationType: "MOVE_TO",
      args: { X: 22, Y: 31, Modifiers: 3 },
    }]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("Game.UnitOperations");
    expect(serialized).not.toContain("Game.UnitCommands");
    expect(serialized).not.toContain("sendRequest");
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"sendResult\"");
    expect(serialized).not.toContain("\"result\"");
    expect(serialized).not.toContain("\"rawCommand\"");
  });

  test("blocks game UI unit target sends for non-local unit owners", async () => {
    const sendCalls: unknown[] = [];
    const foreignUnitId = { owner: 2, id: 42, type: 1 };
    const target = gameUiNotificationTarget(notificationId, {
      unitTargetAction: {
        unitId: foreignUnitId,
        target: unitTarget,
        onSend: (family, operationType, args) =>
          sendCalls.push({ family, operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "unit.target.action.request",
      input: {
        unitId: foreignUnitId,
        ...unitTarget,
      },
      correlationId: "game-ui-unit-target-foreign-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: false,
        status: "not-sent",
        validation: {
          candidateCount: 0,
          acceptedCandidateCount: 0,
          selected: null,
        },
        postcondition: {
          classification: "not-sent",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
      },
    });
    expect(sendCalls).toEqual([]);
  });

  test("keeps game UI unit target path shortfalls no-repeat guarded", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      unitTargetAction: {
        unitId,
        target: unitTarget,
        landedLocation: { x: 21, y: 31 },
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "unit.target.action.request",
      input: {
        unitId,
        ...unitTarget,
      },
      correlationId: "game-ui-unit-target-shortfall-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: true,
        status: "sent-guarded",
        postcondition: {
          classification: "path-shortfall",
          confidence: "confirmed",
          confirmed: true,
          noRepeatAfterUnverified: true,
          destinationReached: false,
          landedLocation: { x: 21, y: 31 },
        },
        nextSteps: [{
          kind: "do-not-repeat",
          source: "unit.target.action.request",
        }],
      },
    });
  });

  test("keeps game UI unit target validator blocks semantic and not sent", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      unitTargetAction: {
        unitId,
        target: unitTarget,
        canMoveTo: false,
        onSend: (family, operationType, args) =>
          sendCalls.push({ family, operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "unit.target.action.request",
      input: {
        unitId,
        ...unitTarget,
      },
      correlationId: "game-ui-unit-target-blocked-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: false,
        status: "not-sent",
        validation: {
          acceptedCandidateCount: 0,
          selected: null,
        },
        postcondition: {
          classification: "not-sent",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
      },
    });
    expect(sendCalls).toEqual([]);
  });

  test("does not advertise game UI unit target without unit command APIs", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      unitTargetAction: {
        unitId,
        target: unitTarget,
      },
    });
    if (target.Game != null) {
      target.Game.UnitCommands = undefined;
    }
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "unit.target.action.request",
      input: {
        unitId,
        ...unitTarget,
      },
    });

    expect(response).toEqual({
      ok: false,
      error: {
        code: "BRIDGE_PROCEDURE_NOT_SUPPORTED",
        message:
          "Civ7 controller bridge procedure is not supported by this controller context.",
        reason: "procedure-not-supported",
      },
    });
  });

  test("executes unit upgrade through game UI service dependency", async () => {
    const sendCalls: unknown[] = [];
    const nextReadyUnitId = { owner: 0, id: 500_001, type: 26 };
    const target = gameUiNotificationTarget(notificationId, {
      firstReadyUnitId: unitId,
      unitCommand: {
        unitId,
        nextReadyUnitId,
        onSend: (operationType, args) =>
          sendCalls.push({ operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.invoke({
      procedureKey: "readiness.current",
      input: {},
      correlationId: "game-ui-unit-command-readiness-1",
    });
    expect(readiness).toMatchObject({
      ok: true,
      output: {
        controller: {
          supportedProcedures: expect.arrayContaining([
            {
              procedureKey: "unit.upgrade.request",
              risk: "mutation",
            },
            {
              procedureKey: "unit.resettle.request",
              risk: "mutation",
            },
          ]),
        },
      },
    });

    const response = await bridge.invoke({
      procedureKey: "unit.upgrade.request",
      input: { unitId },
      correlationId: "game-ui-unit-upgrade-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "unit.upgrade.request",
      output: {
        action: {
          kind: "upgrade",
          unitId,
        },
        sent: true,
        status: "sent-confirmed",
        validation: {
          beforeValid: true,
          afterValid: true,
        },
        postcondition: {
          classification: "queue-advanced",
          confidence: "confirmed",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
        nextSteps: [{
          kind: "refresh-attention",
          source: "unit.upgrade.request",
        }],
      },
    });
    expect(sendCalls).toEqual([{
      operationType: "UNITCOMMAND_UPGRADE",
      args: {},
    }]);
    expectSemanticOutputOmitsRawUnitCommand(response);
  });

  test("executes unit resettle through game UI service dependency", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      unitCommand: {
        unitId,
        destination: resettleTarget,
        onSend: (operationType, args) =>
          sendCalls.push({ operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "unit.resettle.request",
      input: {
        unitId,
        destination: resettleTarget,
      },
      correlationId: "game-ui-unit-resettle-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "unit.resettle.request",
      output: {
        action: {
          kind: "resettle",
          unitId,
          destination: resettleTarget,
        },
        sent: true,
        status: "sent-confirmed",
        postcondition: {
          classification: "unit-state-changed",
          confidence: "confirmed",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
      },
    });
    expect(sendCalls).toEqual([{
      operationType: "UNITCOMMAND_RESETTLE",
      args: { X: 22, Y: 31 },
    }]);
    expectSemanticOutputOmitsRawUnitCommand(response);
  });

  test("blocks game UI unit command sends for non-local unit owners", async () => {
    const sendCalls: unknown[] = [];
    const foreignUnitId = { owner: 2, id: 420_001, type: 26 };
    const target = gameUiNotificationTarget(notificationId, {
      unitCommand: {
        unitId: foreignUnitId,
        onSend: (operationType, args) =>
          sendCalls.push({ operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "unit.upgrade.request",
      input: { unitId: foreignUnitId },
      correlationId: "game-ui-unit-upgrade-foreign-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        action: {
          kind: "upgrade",
          unitId: foreignUnitId,
        },
        sent: false,
        status: "not-sent",
        postcondition: {
          classification: "not-sent",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
      },
    });
    expect(sendCalls).toEqual([]);
  });

  test("keeps game UI unit command no-state-change sends no-repeat guarded", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      firstReadyUnitId: unitId,
      unitCommand: {
        unitId,
        advanceQueueOnSend: false,
        changeUnitStateOnSend: false,
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "unit.upgrade.request",
      input: { unitId },
      correlationId: "game-ui-unit-upgrade-no-state-change-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "no-state-change",
          confidence: "unverified",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "do-not-repeat",
          source: "unit.upgrade.request",
        }],
      },
    });
    expectSemanticOutputOmitsRawUnitCommand(response);
  });

  test("keeps blocked game UI turn completion semantic and no-repeat guarded", async () => {
    const sendCalls: string[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      blocksTurnAdvancement: true,
      canEndTurn: false,
      turnCompletion: {
        onSend: () => sendCalls.push("send"),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "turn.complete.request",
      input: {},
      correlationId: "game-ui-turn-blocked-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "turn.complete.request",
      output: {
        sent: false,
        status: "not-sent",
        before: {
          turn: 42,
          hasSentTurnComplete: false,
          canEndTurn: false,
          blocker: notificationId.type,
        },
        after: null,
        postcondition: {
          classification: "turn-completion-blocked",
          outcome: "not-sent",
          confidence: "unverified",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [
          { kind: "inspect-turn-completion" },
          { kind: "do-not-repeat" },
        ],
      },
    });
    expect(sendCalls).toEqual([]);

    expect(JSON.stringify(response)).not.toContain("GameContext.sendTurnComplete");
  });

  test("does not repeat game UI turn completion after already-sent evidence", async () => {
    const sendCalls: string[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      blocksTurnAdvancement: false,
      canEndTurn: true,
      turnCompletion: {
        initiallySent: true,
        onSend: () => sendCalls.push("send"),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "turn.complete.request",
      input: {},
      correlationId: "game-ui-turn-already-sent-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sent: false,
        status: "not-sent",
        before: {
          hasSentTurnComplete: true,
          canEndTurn: true,
        },
        postcondition: {
          classification: "turn-completion-blocked",
          noRepeatAfterUnverified: true,
        },
        nextSteps: [
          { kind: "inspect-turn-completion" },
          { kind: "do-not-repeat" },
        ],
      },
    });
    expect(sendCalls).toEqual([]);
  });

  test("reads supported game UI attention without ready actor overclaim", async () => {
    const target = gameUiNotificationTarget(notificationId);
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "attention.current",
      input: {},
      correlationId: "game-ui-attention-supported-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "attention.current",
      correlationId: "game-ui-attention-supported-1",
      output: {
        playable: false,
        readiness: "app-ui-game",
        summary: {
          blockerCount: 1,
          decisionCount: 1,
          readyActorCount: 0,
        },
        blockers: [{
          source: "notification",
          kind: "blocking-notification",
          label: "Wonder Completed",
          componentId: notificationId,
          evidence: ["end-turn-blocking-notification"],
        }],
        decisions: [{
          source: "notification",
          category: "blocking-notification",
          summary: "Wonder Completed",
          isEndTurnBlocking: true,
          requiredInputs: [],
        }],
        readyActors: [],
        sourceStatus: {
          playableStatus: "read",
          notifications: "read",
          turnCompletion: "read",
          readyUnit: "read",
          readyCity: "skipped-unsupported",
        },
        nextSteps: [{
          kind: "resolve-blocker",
          source: "notification",
          label: "Resolve Wonder Completed.",
        }],
      },
    });
    expect(response.ok && response.output.nextSteps.map((step) => step.kind))
      .not.toContain("end-turn");
    expect(JSON.stringify(response)).not.toContain("Civ7 game UI controller dependency");
    expect(JSON.stringify(response)).not.toContain("Game.Notifications.dismiss");
  });

  test("does not treat selected unit evidence as a ready unit", async () => {
    const selectedUnitId = { owner: 0, id: 501, type: 26 };
    const target = gameUiNotificationTarget(notificationId, {
      blocksTurnAdvancement: false,
      selectedUnitId,
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "attention.current",
      input: {},
      correlationId: "game-ui-attention-selected-unit-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sourceStatus: {
          readyUnit: "read",
          readyCity: "skipped-unsupported",
        },
        summary: {
          blockerCount: 0,
          readyActorCount: 0,
          nextStepCount: 1,
        },
        readyActors: [],
        nextSteps: [{
          kind: "observe",
          source: "attention",
          label:
            "Ready actor coverage is incomplete; inspect ready unit and city evidence before concluding there are no blockers.",
        }],
      },
    });
    expect(JSON.stringify(response)).not.toContain("act-ready-unit");
    expect(response.ok && response.output.nextSteps.map((step) => step.kind))
      .not.toContain("end-turn");
  });

  test("uses first-ready-unit evidence without implying full ready actor coverage", async () => {
    const readyUnitId = { owner: 0, id: 502, type: 26 };
    const target = gameUiNotificationTarget(notificationId, {
      blocksTurnAdvancement: false,
      firstReadyUnitId: readyUnitId,
      canEndTurn: true,
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "attention.current",
      input: {},
      correlationId: "game-ui-attention-first-ready-unit-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        canEndTurn: true,
        sourceStatus: {
          readyUnit: "read",
          readyCity: "skipped-unsupported",
        },
        summary: {
          blockerCount: 1,
          readyActorCount: 1,
          nextStepCount: 1,
        },
        blockers: [{
          source: "ready-unit",
          componentId: readyUnitId,
          evidence: ["game-ui-ready-unit-source"],
        }],
        readyActors: [{
          kind: "unit",
          componentId: readyUnitId,
          operationCount: 0,
          evidence: ["game-ui-ready-unit-source"],
        }],
        nextSteps: [{
          kind: "act-ready-unit",
          source: "ready-unit",
        }],
      },
    });
    expect(response.ok && response.output.nextSteps.map((step) => step.kind))
      .not.toContain("end-turn");
  });

  test("does not treat selected or notification-target city hints as ready city evidence", async () => {
    const cityId = { owner: 0, id: 703, type: 1 };
    const target = gameUiNotificationTarget(notificationId, {
      blocksTurnAdvancement: false,
      selectedCityId: cityId,
      notificationTarget: cityId,
      canEndTurn: true,
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "attention.current",
      input: {},
      correlationId: "game-ui-attention-selected-city-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sourceStatus: {
          readyUnit: "read",
          readyCity: "skipped-unsupported",
        },
        summary: {
          blockerCount: 0,
          readyActorCount: 0,
          nextStepCount: 1,
        },
        readyActors: [],
        nextSteps: [{
          kind: "observe",
          source: "attention",
          label:
            "Ready actor coverage is incomplete; inspect ready unit and city evidence before concluding there are no blockers.",
        }],
      },
    });
    expect(JSON.stringify(response)).not.toContain("act-ready-city");
    expect(response.ok && response.output.nextSteps.map((step) => step.kind))
      .not.toContain("end-turn");
  });

  test("uses blocking notification target city evidence as ready city source", async () => {
    const cityId = { owner: 0, id: 704, type: 1 };
    const target = gameUiNotificationTarget(notificationId, {
      blocksTurnAdvancement: true,
      notificationTarget: cityId,
      readyCity: { cityId },
      canEndTurn: true,
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "attention.current",
      input: {},
      correlationId: "game-ui-attention-blocking-city-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sourceStatus: {
          readyUnit: "read",
          readyCity: "read",
        },
        summary: {
          blockerCount: 2,
          readyActorCount: 1,
        },
        blockers: expect.arrayContaining([
          expect.objectContaining({
            source: "ready-city",
            componentId: cityId,
            evidence: ["game-ui-ready-city-source"],
          }),
        ]),
        readyActors: [{
          kind: "city",
          componentId: cityId,
          operationCount: 0,
          evidence: ["game-ui-ready-city-source"],
        }],
        nextSteps: expect.arrayContaining([
          expect.objectContaining({
            kind: "act-ready-city",
            source: "ready-city",
          }),
        ]),
      },
    });
    expect(response.ok && response.output.nextSteps.map((step) => step.kind))
      .not.toContain("end-turn");
  });

  test("uses population-ready city evidence as ready city source", async () => {
    const cityId = { owner: 0, id: 705, type: 1 };
    const target = gameUiNotificationTarget(notificationId, {
      blocksTurnAdvancement: false,
      readyCity: { cityId, populationReady: true },
      canEndTurn: true,
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "attention.current",
      input: {},
      correlationId: "game-ui-attention-population-city-1",
    });

    expect(response).toMatchObject({
      ok: true,
      output: {
        sourceStatus: {
          readyUnit: "read",
          readyCity: "read",
        },
        summary: {
          blockerCount: 1,
          readyActorCount: 1,
        },
        blockers: [{
          source: "ready-city",
          componentId: cityId,
          evidence: ["game-ui-ready-city-source"],
        }],
        readyActors: [{
          kind: "city",
          componentId: cityId,
          operationCount: 0,
          evidence: ["game-ui-ready-city-source"],
        }],
        nextSteps: [{
          kind: "act-ready-city",
          source: "ready-city",
        }],
      },
    });
    expect(response.ok && response.output.nextSteps.map((step) => step.kind))
      .not.toContain("end-turn");
  });

  test("treats truncated game UI notification coverage as incomplete attention evidence", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      blocksTurnAdvancement: false,
      extraIds: [{ owner: 0, id: 114, type: 20 }],
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "attention.current",
      input: { maxNotifications: 1 },
      correlationId: "game-ui-attention-truncated-1",
    });

    expect(response).toMatchObject({
      ok: true,
      procedureKey: "attention.current",
      correlationId: "game-ui-attention-truncated-1",
      output: {
        summary: {
          blockerCount: 0,
          decisionCount: 1,
          readyActorCount: 0,
          nextStepCount: 1,
        },
        nextSteps: [{
          kind: "observe",
          source: "attention",
          label:
            "Notification coverage is truncated; inspect more attention evidence before concluding there are no blockers.",
        }],
      },
    });
    expect(response.ok && response.output.nextSteps.map((step) => step.kind))
      .not.toContain("end-turn");
    expect(response.ok && response.output.nextSteps.map((step) => step.label))
      .not.toContain("No current blockers found.");
  });

  test("requires game-owned mutation proof before bridge dispatch", async () => {
    const target = gameUiTarget({
      Players: {
        maxPlayers: 8,
        getAliveIds: () => [0, 1],
        getAliveHumanIds: () => [0, 1],
        getNumAliveHumans: () => 2,
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.invoke({
      procedureKey: "notifications.dismiss.request",
      input: { notificationId: { owner: 0, id: 113, type: 20 } },
    });

    expect(response).toEqual({
      ok: false,
      error: {
        code: "BRIDGE_CONTROLLER_PROOF_REQUIRED",
        message:
          "Civ7 controller bridge mutation proof is required before dispatch.",
        reason: "invalid-envelope",
      },
    });

  });

  test("creates context without endpoint or raw command inputs", async () => {
    const createContext = createCiv7GameUiControllerContextFactory({
      target: gameUiTarget(),
      timeoutMs: 250,
    });

    const context = await createContext({
      procedureKey: "readiness.current",
      input: {},
    });

    expect(context.endpointDefaults).toEqual({ timeoutMs: 250 });
    expect(context.controller).toEqual({
      supportedReadProcedures: ["world.current"],
      supportedMutationProcedures: [],
    });
    expect(context.controllerProof).toEqual({
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
    });
    expect(await context.directControl.getCiv7PlayableStatus()).toMatchObject({
      host: "game-ui",
      port: 0,
      playable: false,
      readiness: "app-ui-game",
      appUi: {
        state: { id: "game-ui", name: "Game UI" },
      },
    });
  });

  test("creates context with narrow notification dismissal mutation support", async () => {
    const createContext = createCiv7GameUiControllerContextFactory({
      target: gameUiNotificationTarget(notificationId),
      timeoutMs: 250,
    });

    const context = await createContext({
      procedureKey: "notifications.dismiss.request",
      input: { notificationId },
    });

    expect(context.controller).toEqual({
      supportedReadProcedures: ["attention.current", "world.current"],
      supportedMutationProcedures: ["notifications.dismiss.request"],
    });
    expect(await context.directControl.getCiv7PlayableStatus()).toMatchObject({
      playable: false,
      readiness: "app-ui-game",
    });
  });
});

function gameUiTarget(
  overrides: Partial<Civ7GameUiRuntimeTarget> = {},
): Civ7GameUiRuntimeTarget {
  const target: Civ7GameUiRuntimeTarget = {
    UI: {
      isInGame: () => true,
      isInShell: () => false,
      isInLoading: () => false,
      getGameLoadingState: () => 8,
      notifyUIReady: () => {},
      Player: {
        getHeadSelectedUnit: () => null,
        getFirstReadyUnit: () => null,
        getHeadSelectedCity: () => null,
      },
    },
    UIGameLoadingState: {
      GameStarted: 8,
      WaitingForUIReady: 5,
      WaitingToStart: 6,
    },
    GameContext: {
      localPlayerID: 0,
      localObserverID: 0,
      hasRequestedPause: () => false,
    },
    Game: {
      turn: 42,
      age: 1,
      maxTurns: 500,
      getTurnDate: () => "Ancient Era",
      getHash: () => 123,
    },
    Autoplay: {
      isActive: false,
      turns: 0,
      isPaused: false,
      isPausedOrPending: false,
      observeAsPlayer: 0,
      returnAsPlayer: 0,
    },
    Network: {
      isInSession: true,
      getNumPlayers: () => 1,
      getHostPlayerId: () => 0,
      isConnectedToNetwork: () => true,
      isAuthenticated: () => true,
      isLoggedIn: () => true,
    },
    Players: {
      maxPlayers: 8,
      getAliveIds: () => [0],
      getAliveHumanIds: () => [0],
      getNumAliveHumans: () => 1,
    },
    GameplayMap: {
      getGridWidth: () => 74,
      getGridHeight: () => 46,
      getPlotCount: () => 3_404,
      getMapSize: () => 1,
      getRandomSeed: () => 99,
    },
    Configuration: {
      getGame: () => ({ skipStartButton: false }),
    },
  };
  return {
    ...target,
    ...overrides,
  };
}

function gameUiStrategyFrontTarget(): Civ7GameUiRuntimeTarget {
  const ownUnitId = { owner: 0, id: 501, type: 26 };
  const otherUnitId = { owner: 1, id: 601, type: 27 };
  const ownCityId = { owner: 0, id: 701, type: 1 };
  const otherCityId = { owner: 1, id: 801, type: 1 };
  const units = new Map([
    [
      componentKey(ownUnitId),
      {
        id: ownUnitId,
        owner: 0,
        type: 26,
        location: { x: 10, y: 20 },
        damage: 0,
      },
    ],
    [
      componentKey(otherUnitId),
      {
        id: otherUnitId,
        owner: 1,
        type: 27,
        location: { x: 12, y: 21 },
        damage: 10,
      },
    ],
  ]);
  const cities = new Map([
    [
      componentKey(ownCityId),
      {
        id: ownCityId,
        owner: 0,
        name: "Capital",
        location: { x: 10, y: 20 },
        population: 4,
        isTown: false,
      },
    ],
    [
      componentKey(otherCityId),
      {
        id: otherCityId,
        owner: 1,
        name: "Unproven City",
        location: { x: 15, y: 20 },
        population: 3,
        isTown: false,
      },
    ],
  ]);

  return gameUiTarget({
    UI: {
      ...gameUiTarget().UI,
      Player: {
        getFirstReadyUnit: () => ownUnitId,
        getHeadSelectedUnit: () => null,
        getHeadSelectedCity: () => null,
      },
    },
    GameInfo: {
      Units: {
        lookup: (type) => ({
          UnitType: type === 26 ? "UNIT_WARRIOR" : "UNIT_ARCHER",
          Combat: type === 26 ? 12 : 8,
          RangedCombat: type === 27 ? 10 : 0,
          Bombard: 0,
          AntiAirCombat: 0,
          BaseMoves: 2,
        }),
      },
    },
    GameplayMap: {
      ...gameUiTarget().GameplayMap,
      isWater: () => false,
    },
    Players: {
      ...gameUiTarget().Players,
      getAliveIds: () => [0, 1],
      get: (playerId) => ({
        leaderName: playerId === 0 ? "Local Leader" : "Other Leader",
        civilizationName: playerId === 0 ? "Local Civilization" : "Other Civilization",
        isHuman: playerId === 0,
      }),
      Units: {
        get: (playerId) => ({
          getUnitIds: () => playerId === 0 ? [ownUnitId] : [otherUnitId],
        }),
      },
      Cities: {
        get: (playerId) => ({
          getCityIds: () => playerId === 0 ? [ownCityId] : [otherCityId],
        }),
      },
    },
    Units: {
      get: (id) => units.get(componentKey(id)),
    },
    Cities: {
      get: (id) => cities.get(componentKey(id)),
    },
  });
}

function gameUiNotificationTarget(
  notificationId: { owner: number; id: number; type: number },
  options: Readonly<{
    blocksTurnAdvancement?: boolean;
    extraIds?: Array<{ owner: number; id: number; type: number }>;
    selectedUnitId?: { owner: number; id: number; type: number };
    firstReadyUnitId?: { owner: number; id: number; type: number };
    selectedCityId?: { owner: number; id: number; type: number };
    notificationTarget?: { owner: number; id: number; type: number };
    notificationTypeName?: string;
    canEndTurn?: boolean;
    readyCity?: {
      cityId: { owner: number; id: number; type: number };
      populationReady?: boolean;
    };
    turnCompletion?: {
      initiallySent?: boolean;
      onSend?: () => void;
      onDeselect?: () => void;
    };
    productionChoice?: {
      cityId: { owner: number; id: number; type: number };
      canStart?: boolean;
      clearBlockerOnSend?: boolean;
      blockerReadFailsAfterSend?: boolean;
      changeProductionStateOnSend?: boolean;
      clearSelectedCityOnSend?: boolean;
      onSend?: (args: Readonly<Record<string, number>>) => void;
    };
    populationPlacement?: {
      cityId: { owner: number; id: number; type: number };
      canAssignWorker?: boolean;
      canExpandCity?: boolean;
      readyBefore?: boolean;
      clearReadyOnSend?: boolean;
      changePlacementStateOnSend?: boolean;
      cityReadFailsAfterSend?: boolean;
      onAssignWorkerSend?: (args: Readonly<Record<string, number>>) => void;
      onExpandCitySend?: (args: Readonly<Record<string, number>>) => void;
    };
    townFocus?: {
      canChange?: boolean;
      canReview?: boolean;
      onChangeSend?: (args: Readonly<Record<string, number>>) => void;
      onReviewSend?: (args: Readonly<Record<string, number>>) => void;
    };
    progressionChoice?: {
      kind: "technology" | "culture";
      canChoose?: boolean;
      canClearTarget?: boolean;
      clearBlockerOnSend?: boolean;
      onSend?: (
        operationType: string,
        args: Readonly<Record<string, number>>,
      ) => void;
    };
    progressionRequest?: {
      canTechnologyTarget?: boolean;
      canCultureTarget?: boolean;
      canAttributePurchase?: boolean;
      canAttributeReview?: boolean;
      canTraditionChange?: boolean;
      canTraditionReview?: boolean;
      onSend?: (
        operationType: string,
        args: Readonly<Record<string, number>>,
      ) => void;
    };
    narrativeChoice?: {
      canChoose?: boolean;
      clearBlockerOnSend?: boolean;
      onSend?: (
        playerId: number,
        args: Readonly<{
          TargetType: string;
          Target: { owner: number; id: number; type: number };
          Action: number;
        }>,
      ) => void;
    };
    diplomacyResponse?: {
      canRespond?: boolean;
      clearBlockerOnSend?: boolean;
      blockerReadFailsAfterSend?: boolean;
      onSend?: (
        playerId: number,
        args: Readonly<{
          ID: number;
          Type: number;
        }>,
      ) => void;
    };
    firstMeetResponse?: {
      canRespond?: boolean;
      clearBlockerOnSend?: boolean;
      onSend?: (
        playerId: number,
        args: Readonly<{
          Player1: number;
          Player2: number;
          Type: number;
        }>,
      ) => void;
    };
    governmentChoice?: {
      canChange?: boolean;
      canCelebrate?: boolean;
      onSend?: (
        playerId: number,
        operationType: string,
        args: Readonly<Record<string, number>>,
      ) => void;
    };
    unitTargetAction?: {
      unitId: { owner: number; id: number; type: number };
      target: { x: number; y: number };
      canMoveTo?: boolean;
      landedLocation?: { x: number; y: number };
      moveTargetInReturnedPlots?: boolean;
      targetUnitsChangeOnSend?: boolean;
      onSend?: (
        family: "unit-operation" | "unit-command",
        operationType: string,
        args: Readonly<Record<string, number>>,
      ) => void;
    };
    unitCommand?: {
      unitId: { owner: number; id: number; type: number };
      canUpgrade?: boolean;
      canResettle?: boolean;
      destination?: { x: number; y: number };
      nextReadyUnitId?: { owner: number; id: number; type: number } | null;
      advanceQueueOnSend?: boolean;
      changeUnitStateOnSend?: boolean;
      onSend?: (
        operationType: string,
        args: Readonly<Record<string, number>>,
      ) => void;
    };
  }> = {},
): Civ7GameUiRuntimeTarget {
  const target = gameUiTarget();
  let exists = true;
  let turnCompletionSent = options.turnCompletion?.initiallySent ?? false;
  let productionSent = false;
  let populationSent = false;
  let progressionSent = false;
  let unitTargetSent = false;
  let unitCommandSent = false;
  let lastUnitCommandOperationType: string | null = null;
  let selectedCityCleared = false;
  const blocksTurnAdvancement = options.blocksTurnAdvancement ?? true;
  const notification = {
    Type: notificationId.type,
    Summary: "Wonder Completed",
    Message: "Wonder Completed",
    Target: options.notificationTarget ?? { owner: -1, id: -1, type: 0 },
    Location: { x: -9999, y: -9999 },
    CanUserDismiss: true,
    Expired: false,
    Dismissed: false,
    BlocksTurnAdvancement: blocksTurnAdvancement,
  };

  return {
    ...target,
    CityOperationTypes: options.productionChoice == null && options.townFocus == null
      ? undefined
      : {
          ...(options.productionChoice == null ? {} : { BUILD: "BUILD" }),
          ...(options.townFocus == null
            ? {}
            : { CONSIDER_TOWN_PROJECT: "CONSIDER_TOWN_PROJECT" }),
        },
    CityCommandTypes: options.populationPlacement == null && options.townFocus == null
      ? undefined
      : {
          ...(options.populationPlacement == null ? {} : { EXPAND: "EXPAND" }),
          ...(options.townFocus == null
            ? {}
            : { CHANGE_GROWTH_MODE: "CHANGE_GROWTH_MODE" }),
        },
    UnitCommandTypes: options.unitTargetAction == null && options.unitCommand == null
      ? undefined
      : {
          ...(options.unitTargetAction == null
            ? {}
            : { UNITCOMMAND_ARMY_OVERRUN: "UNITCOMMAND_ARMY_OVERRUN" }),
          ...(options.unitCommand == null
            ? {}
            : {
                UNITCOMMAND_UPGRADE: "UNITCOMMAND_UPGRADE",
                UNITCOMMAND_RESETTLE: "UNITCOMMAND_RESETTLE",
              }),
        },
    UnitOperationMoveModifiers: options.unitTargetAction == null
      ? undefined
      : {
          ATTACK: 1,
          MOVE_IGNORE_UNEXPLORED_DESTINATION: 2,
        },
    UnitOperationTypes: options.unitTargetAction == null
      ? undefined
      : {
          UNITOPERATION_NAVAL_ATTACK: "UNITOPERATION_NAVAL_ATTACK",
          UNITOPERATION_AIR_ATTACK: "UNITOPERATION_AIR_ATTACK",
          UNITOPERATION_RANGE_ATTACK: "UNITOPERATION_RANGE_ATTACK",
          UNITOPERATION_SWAP_UNITS: "UNITOPERATION_SWAP_UNITS",
          MOVE_TO: "MOVE_TO",
        },
    PlayerOperationTypes: {
      ...(options.populationPlacement == null
        ? {}
        : { ASSIGN_WORKER: "ASSIGN_WORKER" }),
      ...(options.progressionChoice == null
        ? {}
        : {
            SET_TECH_TREE_NODE: "SET_TECH_TREE_NODE",
            SET_TECH_TREE_TARGET_NODE: "SET_TECH_TREE_TARGET_NODE",
            SET_CULTURE_TREE_NODE: "SET_CULTURE_TREE_NODE",
            SET_CULTURE_TREE_TARGET_NODE: "SET_CULTURE_TREE_TARGET_NODE",
          }),
      ...(options.progressionRequest == null
        ? {}
        : {
            SET_TECH_TREE_TARGET_NODE: "SET_TECH_TREE_TARGET_NODE",
            SET_CULTURE_TREE_TARGET_NODE: "SET_CULTURE_TREE_TARGET_NODE",
            BUY_ATTRIBUTE_TREE_NODE: "BUY_ATTRIBUTE_TREE_NODE",
            CONSIDER_ASSIGN_ATTRIBUTE: "CONSIDER_ASSIGN_ATTRIBUTE",
            CHANGE_TRADITION: "CHANGE_TRADITION",
            CONSIDER_ASSIGN_TRADITIONS: "CONSIDER_ASSIGN_TRADITIONS",
          }),
      ...(options.narrativeChoice == null
        ? {}
        : {
            CHOOSE_NARRATIVE_STORY_DIRECTION:
              "CHOOSE_NARRATIVE_STORY_DIRECTION",
          }),
      ...(options.diplomacyResponse == null
        ? {}
        : {
            RESPOND_DIPLOMATIC_ACTION: "RESPOND_DIPLOMATIC_ACTION",
          }),
      ...(options.firstMeetResponse == null
        ? {}
        : {
            RESPOND_DIPLOMATIC_FIRST_MEET:
              "RESPOND_DIPLOMATIC_FIRST_MEET",
          }),
      ...(options.governmentChoice == null
        ? {}
        : {
            CHANGE_GOVERNMENT: "CHANGE_GOVERNMENT",
            CHOOSE_GOLDEN_AGE: "CHOOSE_GOLDEN_AGE",
          }),
    },
    ProgressionTreeNodeTypes: options.progressionChoice == null
      ? undefined
      : { NO_NODE: -1 },
    Cities: options.productionChoice == null
        && options.populationPlacement == null
        && options.readyCity == null
      ? undefined
      : {
          get: (id) =>
            componentIdEqual(id, options.productionChoice?.cityId)
              ? {
                isTown: false,
                BuildQueue: {
                  currentProductionTypeHash:
                    productionSent
                      && options.productionChoice?.changeProductionStateOnSend !== false
                      ? 99
                      : 1,
                },
              }
              : componentIdEqual(id, options.populationPlacement?.cityId)
              ? (() => {
                if (
                  populationSent
                  && options.populationPlacement?.cityReadFailsAfterSend === true
                ) {
                  throw new Error("population city read failed");
                }
                return {
                id: options.populationPlacement?.cityId,
                isTown: false,
                population: populationSent
                    && options.populationPlacement?.changePlacementStateOnSend !== false
                  ? 4
                  : 3,
                Growth: {
                  isReadyToPlacePopulation:
                    options.populationPlacement?.readyBefore === true
                    && !(
                      populationSent
                      && options.populationPlacement?.clearReadyOnSend === true
                    ),
                },
                Workers: {
                  getCityWorkerCap: () => populationSent
                      && options.populationPlacement?.changePlacementStateOnSend !== false
                    ? 5
                    : 4,
                  GetAllPlacementInfo: () => [{
                    PlotIndex: 2543,
                    IsBlocked: false,
                  }],
                },
              };
              })()
              : componentIdEqual(id, options.readyCity?.cityId)
              ? {
                id: options.readyCity?.cityId,
                isTown: false,
                population: 3,
                Growth: {
                  isReadyToPlacePopulation:
                    options.readyCity?.populationReady === true,
                },
              }
              : null,
        },
    GameplayMap: {
      ...target.GameplayMap,
      getIndexFromLocation: (location) => location.x * 1_000 + location.y,
      getIndexFromXY: (x, y) => x * 1_000 + y,
    },
    MapUnits: options.unitTargetAction == null
      ? undefined
      : {
          getUnits: (x, y) =>
            x === options.unitTargetAction?.target.x
              && y === options.unitTargetAction.target.y
              && unitTargetSent
              && options.unitTargetAction.targetUnitsChangeOnSend === true
              ? [{ owner: 1, id: 99, type: 1 }]
              : [],
        },
    Units: options.unitTargetAction == null && options.unitCommand == null
      ? undefined
      : {
          get: (id) => {
            if (options.unitTargetAction != null) {
              if (!componentIdEqual(id, options.unitTargetAction.unitId)) {
                return null;
              }
              return {
                id: options.unitTargetAction.unitId,
                owner: options.unitTargetAction.unitId.owner,
                type: options.unitTargetAction.unitId.type,
                location: unitTargetSent
                  ? options.unitTargetAction.landedLocation
                    ?? options.unitTargetAction.target
                  : { x: 20, y: 31 },
                Movement: {
                  movementMovesRemaining: unitTargetSent ? 0 : 1,
                  movementTurnsRemaining: 0,
                },
                Combat: {
                  attacksRemaining: 1,
                  rangedStrength: 5,
                  bombardStrength: 0,
                  getMeleeStrength: () => 10,
                },
                Health: {
                  damage: 0,
                  hitPoints: 100,
                },
              };
            }

            if (!componentIdEqual(id, options.unitCommand?.unitId)) {
              return null;
            }
            const commandDestination = options.unitCommand?.destination
              ?? resettleTarget;
            const unitCommandLocation =
              unitCommandSent
                && lastUnitCommandOperationType === "UNITCOMMAND_RESETTLE"
                && options.unitCommand?.changeUnitStateOnSend !== false
                ? commandDestination
                : { x: 20, y: 31 };
            return {
              id: options.unitCommand?.unitId,
              owner: options.unitCommand?.unitId.owner,
              type: options.unitCommand?.unitId.type,
              location: unitCommandLocation,
              Movement: {
                movementMovesRemaining:
                  unitCommandSent
                    && options.unitCommand?.changeUnitStateOnSend !== false
                    ? 0
                    : 1,
                movementTurnsRemaining: 0,
              },
              Activity: "UNIT_ACTIVITY_AWAKE",
              Combat: {
                attacksRemaining: 1,
                rangedStrength: 5,
                bombardStrength: 0,
                getMeleeStrength: () => 10,
              },
              Health: {
                damage: 0,
                hitPoints: 100,
              },
            };
          },
        },
    UI: {
      ...target.UI,
      Player: {
        getHeadSelectedUnit: () => options.selectedUnitId ?? null,
        getFirstReadyUnit: () =>
          options.unitCommand != null
              && unitCommandSent
              && options.unitCommand.advanceQueueOnSend !== false
            ? options.unitCommand.nextReadyUnitId ?? null
            : options.firstReadyUnitId ?? null,
        getHeadSelectedCity: () =>
          selectedCityCleared ? null : options.selectedCityId ?? null,
        deselectAllCities: () => {
          if (options.productionChoice?.clearSelectedCityOnSend === true) {
            selectedCityCleared = true;
          }
        },
        deselectAllUnits: () => options.turnCompletion?.onDeselect?.(),
      },
    },
    GameContext: {
      ...target.GameContext,
      hasSentTurnComplete: options.turnCompletion == null
        ? target.GameContext?.hasSentTurnComplete
        : () => turnCompletionSent,
      sendTurnComplete: options.turnCompletion == null
        ? undefined
        : () => {
            options.turnCompletion?.onSend?.();
            turnCompletionSent = true;
          },
    },
    canEndTurn: () => options.canEndTurn ?? false,
    Game: {
      ...target.Game,
      ProgressionTrees: options.progressionChoice == null
        ? undefined
        : {
            getTree: () => ({
              activeNodeIndex: 0,
              nodes: [{
                nodeType: progressionSent ? 27_001 : 26_000,
              }],
            }),
          },
      CityCommands: options.populationPlacement == null && options.townFocus == null
        ? undefined
        : {
            canStart: (_cityId, commandType) => ({
              Success: String(commandType) === "CHANGE_GROWTH_MODE"
                ? options.townFocus?.canChange ?? true
                : options.populationPlacement?.canExpandCity ?? true,
              Plots: [2543],
            }),
            sendRequest: (_cityId, commandType, args) => {
              if (String(commandType) === "CHANGE_GROWTH_MODE") {
                options.townFocus?.onChangeSend?.(args);
              } else {
                options.populationPlacement?.onExpandCitySend?.(args);
                populationSent = true;
              }
              return true;
            },
          },
      CityOperations: options.productionChoice == null && options.townFocus == null
        ? undefined
        : {
            canStart: (_cityId, operationType) => ({
              Success: String(operationType) === "CONSIDER_TOWN_PROJECT"
                ? options.townFocus?.canReview ?? true
                : options.productionChoice?.canStart ?? true,
            }),
            sendRequest: (_cityId, operationType, args) => {
              if (String(operationType) === "CONSIDER_TOWN_PROJECT") {
                options.townFocus?.onReviewSend?.(args);
              } else {
                options.productionChoice?.onSend?.(args);
                productionSent = true;
                if (options.productionChoice?.clearBlockerOnSend === true) {
                  exists = false;
                }
              }
              return true;
            },
          },
      UnitCommands: options.unitTargetAction == null && options.unitCommand == null
        ? undefined
        : {
            canStart: (_unitId, commandType) => {
              const operationType = String(commandType);
              return {
                Success: operationType === "UNITCOMMAND_UPGRADE"
                  ? options.unitCommand?.canUpgrade ?? true
                  : operationType === "UNITCOMMAND_RESETTLE"
                  ? options.unitCommand?.canResettle ?? true
                  : false,
                Plots: [],
              };
            },
            sendRequest: (_unitId, commandType, args) => {
              const operationType = String(commandType);
              if (
                operationType === "UNITCOMMAND_UPGRADE"
                || operationType === "UNITCOMMAND_RESETTLE"
              ) {
                options.unitCommand?.onSend?.(operationType, args);
                unitCommandSent = true;
                lastUnitCommandOperationType = operationType;
              } else {
                options.unitTargetAction?.onSend?.(
                  "unit-command",
                  operationType,
                  args,
                );
                unitTargetSent = true;
              }
              return true;
            },
          },
      UnitOperations: options.unitTargetAction == null
        ? undefined
        : {
            canStart: (_unitId, operationType) => {
              const isMove = String(operationType) === "MOVE_TO";
              const targetIndex = options.unitTargetAction == null
                ? -1
                : options.unitTargetAction.target.x * 1_000
                  + options.unitTargetAction.target.y;
              return {
                Success: isMove && (options.unitTargetAction?.canMoveTo ?? true),
                Plots: options.unitTargetAction?.moveTargetInReturnedPlots === false
                  ? []
                  : [targetIndex],
              };
            },
            sendRequest: (_unitId, operationType, args) => {
              options.unitTargetAction?.onSend?.(
                "unit-operation",
                String(operationType),
                args,
              );
              unitTargetSent = true;
              return true;
            },
          },
      PlayerOperations: options.populationPlacement == null
          && options.progressionChoice == null
          && options.progressionRequest == null
          && options.narrativeChoice == null
          && options.diplomacyResponse == null
          && options.firstMeetResponse == null
          && options.governmentChoice == null
        ? undefined
        : {
            canStart: (_playerId, operationType) => ({
              Success: operationType === "ASSIGN_WORKER"
                ? options.populationPlacement?.canAssignWorker ?? true
                : operationType === "CHOOSE_NARRATIVE_STORY_DIRECTION"
                ? options.narrativeChoice?.canChoose ?? true
                : operationType === "RESPOND_DIPLOMATIC_ACTION"
                ? options.diplomacyResponse?.canRespond ?? true
                : operationType === "RESPOND_DIPLOMATIC_FIRST_MEET"
                ? options.firstMeetResponse?.canRespond ?? true
                : operationType === "CHANGE_GOVERNMENT"
                ? options.governmentChoice?.canChange ?? true
                : operationType === "CHOOSE_GOLDEN_AGE"
                ? options.governmentChoice?.canCelebrate ?? true
                : String(operationType).includes("TARGET")
                ? progressionTargetCanStart(
                  String(operationType),
                  options.progressionRequest,
                  options.progressionChoice,
                )
                : operationType === "BUY_ATTRIBUTE_TREE_NODE"
                ? options.progressionRequest?.canAttributePurchase ?? true
                : operationType === "CONSIDER_ASSIGN_ATTRIBUTE"
                ? options.progressionRequest?.canAttributeReview ?? true
                : operationType === "CHANGE_TRADITION"
                ? options.progressionRequest?.canTraditionChange ?? true
                : operationType === "CONSIDER_ASSIGN_TRADITIONS"
                ? options.progressionRequest?.canTraditionReview ?? true
                : options.progressionChoice?.canChoose ?? true,
            }),
            sendRequest: (_playerId, _operationType, args) => {
              const operationType = String(_operationType);
              if (operationType === "ASSIGN_WORKER") {
                options.populationPlacement?.onAssignWorkerSend?.(args);
                populationSent = true;
              } else if (operationType === "CHOOSE_NARRATIVE_STORY_DIRECTION") {
                options.narrativeChoice?.onSend?.(
                  _playerId,
                  args as {
                    TargetType: string;
                    Target: { owner: number; id: number; type: number };
                    Action: number;
                  },
                );
                if (options.narrativeChoice?.clearBlockerOnSend === true) {
                  exists = false;
                }
              } else if (operationType === "RESPOND_DIPLOMATIC_ACTION") {
                options.diplomacyResponse?.onSend?.(
                  _playerId,
                  args as {
                    ID: number;
                    Type: number;
                  },
                );
                if (options.diplomacyResponse?.clearBlockerOnSend === true) {
                  exists = false;
                }
              } else if (operationType === "RESPOND_DIPLOMATIC_FIRST_MEET") {
                options.firstMeetResponse?.onSend?.(
                  _playerId,
                  args as {
                    Player1: number;
                    Player2: number;
                    Type: number;
                  },
                );
                if (options.firstMeetResponse?.clearBlockerOnSend === true) {
                  exists = false;
                }
              } else if (
                operationType === "CHANGE_GOVERNMENT"
                || operationType === "CHOOSE_GOLDEN_AGE"
              ) {
                options.governmentChoice?.onSend?.(
                  _playerId,
                  operationType,
                  args,
                );
              } else {
                if (options.progressionRequest != null) {
                  options.progressionRequest.onSend?.(operationType, args);
                } else {
                  options.progressionChoice?.onSend?.(operationType, args);
                }
                progressionSent = true;
                if (options.progressionChoice?.clearBlockerOnSend === true) {
                  exists = false;
                }
              }
              return true;
            },
          },
      Notifications: {
        find: () => exists ? notification : null,
        getType: () => notificationId.type,
        getTypeName: () =>
          options.notificationTypeName ?? "NOTIFICATION_WONDER_COMPLETED",
        getSummary: () => "Wonder Completed",
        getMessage: () => "Wonder Completed",
        getBlocksTurnAdvancement: () => blocksTurnAdvancement,
        activate: () => true,
        getEndTurnBlockingType: () => {
          if (
            productionSent
            && options.productionChoice?.blockerReadFailsAfterSend === true
          ) {
            throw new Error("production blocker read failed");
          }
          if (options.diplomacyResponse?.blockerReadFailsAfterSend === true) {
            throw new Error("diplomacy blocker read failed");
          }
          return blocksTurnAdvancement ? notificationId.type : 0;
        },
        findEndTurnBlocking: () =>
          exists && blocksTurnAdvancement ? notificationId : null,
        getIdsForPlayer: () =>
          exists ? [notificationId, ...(options.extraIds ?? [])] : [],
      },
      Diplomacy: options.diplomacyResponse == null
        ? undefined
        : {
            getResponseDataForUI: (actionId: number) => ({ actionID: actionId }),
            getDiplomaticEventData: (actionId: number) => ({ actionID: actionId }),
          },
    },
    DiplomacyManager: options.diplomacyResponse == null
      ? undefined
      : {
          currentProjectReactionData: null,
          currentProjectReactionRequest: null,
          selectedActionID: null,
          isShowing: () => true,
          addCurrentDiplomacyProject(project) {
            this.currentProjectReactionData = project as { actionID?: unknown };
          },
          closeCurrentDiplomacyProject: () => true,
          hide: () => true,
        },
    InterfaceMode: options.diplomacyResponse == null
      ? undefined
      : { getCurrent: () => "DIPLOMACY" },
    LeaderModelManager: options.diplomacyResponse == null
      ? undefined
      : { beginAcknowledgePlayerSequence: () => true },
    Players: {
      ...target.Players,
      Cities: options.readyCity == null
        ? target.Players?.Cities
        : {
            get: (playerId: number) => ({
              getCityIds: () =>
                playerId === target.GameContext?.localPlayerID
                  ? [options.readyCity?.cityId]
                  : [],
            }),
          },
      get: (playerId) =>
        playerId === 0 && options.populationPlacement != null
          ? {
            Cities: {
              getCityIds: () => [options.populationPlacement?.cityId],
            },
          }
          : playerId === 0 && (
            options.progressionChoice != null
            || options.progressionRequest != null
          )
          ? {
            Techs: {
              getResearching: () => progressionSent ? 18_001 : 17_000,
              getTargetNode: () => progressionSent ? -1 : 18_001,
            },
            Culture: {
              getActiveTree: () => 1,
              getTargetNode: () => progressionSent ? -1 : 27_001,
              getAllAvailableNodeTypes: () => [27_001],
            },
          }
          : null,
    },
    NotificationModel: {
      QueryBy: { Priority: 2 },
      manager: {
        dismiss: () => {
          exists = false;
          return true;
        },
        findPlayer: () => ({
          getTypesBy: () => exists
            ? [{ notifications: [notificationId] }]
            : [],
        }),
      },
    },
  };
}

function expectSemanticOutputOmitsRawUnitCommand(result: unknown) {
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

function progressionTargetCanStart(
  operationType: string,
  progressionRequest: Readonly<{
    canTechnologyTarget?: boolean;
    canCultureTarget?: boolean;
  }> | undefined,
  progressionChoice: Readonly<{
    canClearTarget?: boolean;
  }> | undefined,
): boolean {
  if (operationType === "SET_TECH_TREE_TARGET_NODE") {
    return progressionRequest?.canTechnologyTarget
      ?? progressionChoice?.canClearTarget
      ?? true;
  }
  if (operationType === "SET_CULTURE_TREE_TARGET_NODE") {
    return progressionRequest?.canCultureTarget
      ?? progressionChoice?.canClearTarget
      ?? true;
  }
  return progressionChoice?.canClearTarget ?? true;
}

function componentIdEqual(
  left: { owner: number; id: number; type?: number } | null | undefined,
  right: { owner: number; id: number; type?: number } | null | undefined,
): boolean {
  return left?.owner === right?.owner
    && left?.id === right?.id
    && (left?.type ?? null) === (right?.type ?? null);
}

function componentKey(
  value: { owner: number; id: number; type?: number } | null | undefined,
): string {
  return `${value?.owner}:${value?.id}:${value?.type ?? "none"}`;
}
