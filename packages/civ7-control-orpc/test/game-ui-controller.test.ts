import { describe, expect, test } from "vitest";

import {
  createCiv7GameUiControllerContextFactory,
  installCiv7GameUiIntelligenceBridge,
  type Civ7GameUiRuntimeTarget,
} from "../src/game-ui";

describe("Civ7 game UI controller bootstrap", () => {
  const notificationId = { owner: 0, id: 113, type: 20 };
  const cityId = { owner: 0, id: 65_536, type: 1 };
  const productionArgs = { ConstructibleType: 713_967_338, X: 22, Y: 31 };
  const populationDestination = { x: 22, y: 31 };

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
          canObserve: false,
          canMutate: false,
        },
        controller: {
          supportedProcedures: [],
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
            "The game UI controller can read supported attention; broad runtime mutation remains unavailable.",
        },
        controller: {
          supportedProcedures: [
            {
              procedureKey: "attention.current",
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
        code: "MUTATION_READINESS_REQUIRED",
        message: "Playable Civ7 readiness is required before mutation.",
        reason: "procedure-failed",
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
        code: "MUTATION_READINESS_REQUIRED",
        message: "Playable Civ7 readiness is required before mutation.",
        reason: "procedure-failed",
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
      supportedReadProcedures: [],
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
      supportedReadProcedures: ["attention.current"],
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
  }> = {},
): Civ7GameUiRuntimeTarget {
  const target = gameUiTarget();
  let exists = true;
  let turnCompletionSent = options.turnCompletion?.initiallySent ?? false;
  let productionSent = false;
  let populationSent = false;
  let progressionSent = false;
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
    CityOperationTypes: options.productionChoice == null
      ? undefined
      : { BUILD: "BUILD" },
    CityCommandTypes: options.populationPlacement == null
      ? undefined
      : { EXPAND: "EXPAND" },
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
      ...(options.narrativeChoice == null
        ? {}
        : {
            CHOOSE_NARRATIVE_STORY_DIRECTION:
              "CHOOSE_NARRATIVE_STORY_DIRECTION",
          }),
    },
    ProgressionTreeNodeTypes: options.progressionChoice == null
      ? undefined
      : { NO_NODE: -1 },
    Cities: options.productionChoice == null && options.populationPlacement == null
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
              : null,
        },
    UI: {
      ...target.UI,
      Player: {
        getHeadSelectedUnit: () => options.selectedUnitId ?? null,
        getFirstReadyUnit: () => options.firstReadyUnitId ?? null,
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
      CityCommands: options.populationPlacement == null
        ? undefined
        : {
            canStart: () => ({
              Success: options.populationPlacement?.canExpandCity ?? true,
              Plots: [2543],
            }),
            sendRequest: (_cityId, _commandType, args) => {
              options.populationPlacement?.onExpandCitySend?.(args);
              populationSent = true;
              return true;
            },
          },
      CityOperations: options.productionChoice == null
        ? undefined
        : {
            canStart: () => ({ Success: options.productionChoice?.canStart ?? true }),
            sendRequest: (_cityId, _operationType, args) => {
              options.productionChoice?.onSend?.(args);
              productionSent = true;
              if (options.productionChoice?.clearBlockerOnSend === true) {
                exists = false;
              }
              return true;
            },
          },
      PlayerOperations: options.populationPlacement == null
          && options.progressionChoice == null
          && options.narrativeChoice == null
        ? undefined
        : {
            canStart: (_playerId, operationType) => ({
              Success: operationType === "ASSIGN_WORKER"
                ? options.populationPlacement?.canAssignWorker ?? true
                : operationType === "CHOOSE_NARRATIVE_STORY_DIRECTION"
                ? options.narrativeChoice?.canChoose ?? true
                : String(operationType).includes("TARGET")
                ? options.progressionChoice?.canClearTarget ?? true
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
              } else {
                options.progressionChoice?.onSend?.(operationType, args);
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
          return blocksTurnAdvancement ? notificationId.type : 0;
        },
        findEndTurnBlocking: () =>
          exists && blocksTurnAdvancement ? notificationId : null,
        getIdsForPlayer: () =>
          exists ? [notificationId, ...(options.extraIds ?? [])] : [],
      },
    },
    Players: {
      ...target.Players,
      get: (playerId) =>
        playerId === 0 && options.populationPlacement != null
          ? {
            Cities: {
              getCityIds: () => [options.populationPlacement?.cityId],
            },
          }
          : playerId === 0 && options.progressionChoice != null
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

function componentIdEqual(
  left: { owner: number; id: number; type?: number } | null | undefined,
  right: { owner: number; id: number; type?: number } | null | undefined,
): boolean {
  return left?.owner === right?.owner
    && left?.id === right?.id
    && (left?.type ?? null) === (right?.type ?? null);
}
