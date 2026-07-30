import { describe, expect, test } from "vitest";

import {
  type Civ7GameUiRuntimeTarget,
  createCiv7GameUiControllerContextFactory,
  installCiv7GameUiIntelligenceBridge,
} from "../../src/controller/game-ui";
import { requestCiv7GameUiTechnologyTarget } from "../../src/controller/game-ui/progression";
import { sendCiv7GameUiTownFocusChange } from "../../src/controller/game-ui/town-focus";

const populationDestination = { x: 22, y: 31 };
const firstMeetResponseType = 673_478_009;
const diplomacyActionId = 8_821;
const diplomacyResponseType = -1_713_616_684;

describe("Civ7 game UI controller bootstrap", () => {
  const notificationId = { owner: 0, id: 113, type: 20 };
  const cityId = { owner: 0, id: 65_536, type: 1 };
  const productionArgs = { ConstructibleType: 713_967_338, X: 22, Y: 31 };
  const townFocusGrowthType = -284_569_333;
  const townFocusProjectType = -548_685_232;
  const attributeNode = 20;
  const traditionType = -331_546_976;
  const traditionAction = -1_326_475_004;
  const resettleTarget = { x: 22, y: 31 };
  const unitId = { owner: 0, id: 42, type: 1 };
  const unitTarget = { x: 22, y: 31 };

  test("installs the intelligence bridge with a game UI readiness context", async () => {
    const target = gameUiTarget();
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    expect(target.Civ7IntelligenceBridge).toBe(bridge);

    const response = await bridge.readiness.current(
      {},
      { context: { correlationId: "game-ui-readiness-1" } }
    );

    expect(response).toMatchObject({
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
    });
    expect(response.nextSteps).toEqual([
      {
        kind: "read-world",
        source: "readiness.current",
        label: "Read current world facts before choosing support actions.",
      },
    ]);
  });

  test("reads current world through game UI service dependency", async () => {
    const bridge = installCiv7GameUiIntelligenceBridge({ target: gameUiTarget() });

    const response = await bridge.world.current(
      {},
      { context: { correlationId: "game-ui-world-1" } }
    );

    expect(response).toMatchObject({
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
    });

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain('"session"');
    expect(serialized).not.toContain("rawCommand");
    expect(serialized).not.toContain("Game.");
    expect(serialized).not.toMatch(/\benemy\b/i);
    expect(serialized).not.toMatch(/\bhostile\b/i);
    expect(serialized).not.toMatch(/\bopponent\b/i);
    expect(serialized).not.toMatch(/\bthreat\b/i);
    expect(serialized).not.toMatch(/\bwar\b/i);
    expect(serialized).not.toMatch(/\bally\b/i);
    expect(serialized).not.toMatch(/\bsuzerain\b/i);
  });

  test("reads world plot and grid through game UI map service dependencies", async () => {
    const bridge = installCiv7GameUiIntelligenceBridge({
      target: gameUiMapReadTarget(),
    });

    const readiness = await bridge.readiness.current({});
    expect(readiness).toMatchObject({
      controller: {
        supportedProcedures: expect.arrayContaining([
          { procedureKey: "world.current", risk: "read-only" },
          { procedureKey: "world.plot.read", risk: "read-only" },
          { procedureKey: "world.grid.read", risk: "read-only" },
        ]),
      },
    });

    const plot = await bridge.world.plot(
      {
        location: { x: 3, y: 4 },
        fields: ["terrain", "owner", "visibility"],
        playerId: 0,
      },
      { context: { correlationId: "game-ui-world-plot-1" } }
    );
    expect(plot).toMatchObject({
      sourceStatus: { plot: "read" },
      plot: {
        location: { x: 3, y: 4, index: 3_004 },
        hiddenInfoPolicy: "visibility-filtered",
        facts: {
          terrain: { ok: true, value: 7 },
          owner: { ok: true, value: 0 },
          visible: { ok: true, value: true },
        },
      },
    });

    const grid = await bridge.world.grid(
      {
        bounds: { x: 3, y: 4, width: 2, height: 1 },
        fields: ["terrain"],
        maxPlots: 1,
      },
      { context: { correlationId: "game-ui-world-grid-1" } }
    );
    expect(grid).toMatchObject({
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
    });

    const serialized = JSON.stringify({ plot, grid });
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain('"session"');
    expect(serialized).not.toContain("rawCommand");
    expect(serialized).not.toContain("Game.");
    expect(serialized).not.toContain("relationship");
    expect(serialized).not.toMatch(/\benemy\b/i);
    expect(serialized).not.toMatch(/\bhostile\b/i);
    expect(serialized).not.toMatch(/\bopponent\b/i);
    expect(serialized).not.toMatch(/\bthreat\b/i);
    expect(serialized).not.toMatch(/\bwar\b/i);
    expect(serialized).not.toMatch(/\bally\b/i);
    expect(serialized).not.toMatch(/\bsuzerain\b/i);
  });

  test("does not advertise world plot/grid without plot-level map APIs", async () => {
    const bridge = installCiv7GameUiIntelligenceBridge({ target: gameUiTarget() });

    const readiness = await bridge.readiness.current({});
    expect(readiness).toMatchObject({
      controller: {
        supportedProcedures: [{ procedureKey: "world.current", risk: "read-only" }],
      },
    });

    await expect(
      bridge.world.plot({
        location: { x: 3, y: 4 },
        fields: ["terrain"],
      })
    ).rejects.toMatchObject({
      code: "CONTROLLER_CAPABILITY_UNAVAILABLE",
      data: {
        procedureKey: "world.plot.read",
        reason: "procedure-not-supported",
      },
    });
  });

  test("does not advertise current world without player count APIs", async () => {
    const bridge = installCiv7GameUiIntelligenceBridge({
      target: gameUiTarget({ Players: undefined }),
    });

    const readiness = await bridge.readiness.current({});

    expect(readiness).toMatchObject({
      capability: {
        canObserve: false,
        canMutate: false,
      },
      controller: {
        supportedProcedures: [],
      },
    });

    await expect(bridge.world.current({})).rejects.toMatchObject({
      code: "CONTROLLER_CAPABILITY_UNAVAILABLE",
      data: {
        procedureKey: "world.current",
        reason: "procedure-not-supported",
      },
    });
  });

  test("reports narrow notification mutation and attention read support", async () => {
    const target = gameUiNotificationTarget(notificationId);
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.readiness.current(
      {},
      { context: { correlationId: "game-ui-readiness-supported-1" } }
    );

    expect(response).toMatchObject({
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
            procedureKey: "notifications.dismiss.check",
            risk: "read-only",
          },
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
    });
    expect(response.nextSteps).toEqual([
      {
        kind: "read-attention",
        source: "readiness.current",
        label: "Read current attention before choosing support actions.",
      },
    ]);
  });

  test("executes notification dismissal through game UI runtime", async () => {
    const target = gameUiNotificationTarget(notificationId);
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    await expect(
      bridge.notifications.dismiss.check(
        { notificationId },
        { context: { correlationId: "game-ui-notification-dismiss-check-1" } }
      )
    ).resolves.toEqual({
      notificationId,
      available: true,
    });

    const response = await bridge.notifications.dismiss.request(
      { notificationId },
      { context: { correlationId: "game-ui-notification-dismiss-1" } }
    );

    expect(response).toMatchObject({
      notificationId,
      status: "sent-confirmed",
      postcondition: {
        classification: "notification-disappeared",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
    });
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("NotificationModel.manager.dismiss");
    expect(serialized).not.toContain("Game.Notifications.dismiss");

    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
  });

  test("keeps unsupported mutation ports bounded by the existing bridge projection", async () => {
    const target = gameUiTarget();
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const request = bridge.notifications.dismiss.request({
      notificationId: { owner: 0, id: 113, type: 20 },
    });

    await expect(request).rejects.toMatchObject({
      code: "CONTROLLER_CAPABILITY_UNAVAILABLE",
      data: {
        procedureKey: "notifications.dismiss.request",
        reason: "procedure-not-supported",
      },
    });
  });

  test("keeps unsupported game UI mutations bounded when notification dismissal is available", async () => {
    const target = gameUiNotificationTarget(notificationId);
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    await expect(bridge.turn.complete.request({})).rejects.toMatchObject({
      code: "CONTROLLER_CAPABILITY_UNAVAILABLE",
      data: {
        procedureKey: "turn.complete.request",
        reason: "procedure-not-supported",
      },
    });
  });

  test("executes turn completion through game UI service dependency", async () => {
    const sendCalls: string[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      blocksTurnAdvancement: false,
      canEndTurn: true,
      turnCompletion: {
        onSend: () => sendCalls.push("send"),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    await expect(bridge.turn.complete.check({})).resolves.toEqual({ available: true });
    const response = await bridge.turn.complete.request(
      {},
      { context: { correlationId: "game-ui-turn-complete-1" } }
    );

    expect(response).toMatchObject({
      status: "sent-guarded",
      postcondition: {
        classification: "turn-complete-sent",
        confirmed: true,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "turn.complete.request",
        },
      ],
    });
    expect(sendCalls).toEqual(["send"]);
    const serialized = JSON.stringify(response);

    expect(serialized).not.toContain("GameContext");
    expect(serialized).not.toContain("sendEndTurn");
    expect(serialized).not.toContain("game-ui-turn-completion-requested");
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain('"command"');
  });

  test("checks and requests production choice through game UI service procedures", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      notificationTarget: cityId,
      notificationTypeName: "NOTIFICATION_CHOOSE_CITY_PRODUCTION",
      productionChoice: {
        cityId,
        canStart: true,
        clearBlockerOnSend: true,
        onSend: (args) => sendCalls.push(args),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.readiness.current(
      {},
      { context: { correlationId: "game-ui-production-readiness-1" } }
    );
    expect(readiness).toMatchObject({
      capability: {
        canObserve: true,
        canMutate: false,
        reason:
          "The game UI controller can read supported procedure evidence; broad runtime mutation remains unavailable.",
      },
      controller: {
        supportedProcedures: expect.arrayContaining([
          {
            procedureKey: "city.production.choice.check",
            risk: "read-only",
          },
          {
            procedureKey: "city.production.choice.request",
            risk: "mutation",
          },
        ]),
      },
    });

    const check = await bridge.city.production.choice.check(
      { cityId, args: productionArgs },
      { context: { correlationId: "game-ui-production-check-1" } }
    );
    expect(check).toEqual({
      cityId,
      args: productionArgs,
      available: true,
    });
    expect(sendCalls).toEqual([]);

    const response = await bridge.city.production.choice.request(
      { cityId, args: productionArgs },
      { context: { correlationId: "game-ui-production-choice-1" } }
    );

    expect(response).toMatchObject({
      cityId,
      args: productionArgs,
      status: "sent-confirmed",
      postcondition: {
        classification: "production-choice-cleared",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "city.production.choice.request",
        },
      ],
    });
    expect(sendCalls).toEqual([productionArgs]);
    expect(target.UI?.Player).not.toHaveProperty("lookAtID");
    expect(target.UI?.Player).not.toHaveProperty("selectCity");
    expect(target.UI?.Player).not.toHaveProperty("deselectAllCities");
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("Game.CityOperations");
    expect(serialized).not.toContain("sendRequest");
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain('"command"');
    expect(serialized).not.toContain('"payload"');
  });

  test("keeps game UI production validator blocks semantic and not sent", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      notificationTarget: cityId,
      notificationTypeName: "NOTIFICATION_CHOOSE_CITY_PRODUCTION",
      productionChoice: {
        cityId,
        canStart: false,
        onSend: (args) => sendCalls.push(args),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.city.production.choice.request(
      { cityId, args: productionArgs },
      { context: { correlationId: "game-ui-production-blocked-1" } }
    );

    expect(response).toMatchObject({
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "inspect-production",
          source: "city.production.choice.request",
        },
      ],
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

    const response = await bridge.city.production.choice.request({ cityId, args: productionArgs });

    expect(response).toMatchObject({
      status: "sent-unverified",
      postcondition: {
        classification: "missing-postcondition",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "city.production.choice.request",
        },
      ],
    });
  });

  test("confirms changed production state independently of an unrelated blocker", async () => {
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

    const response = await bridge.city.production.choice.request({ cityId, args: productionArgs });

    expect(response).toMatchObject({
      status: "sent-confirmed",
      postcondition: {
        classification: "production-state-changed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
    });
  });

  test("keeps live matching game UI production blockers guarded", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      notificationTarget: cityId,
      notificationTypeName: "NOTIFICATION_CHOOSE_CITY_PRODUCTION",
      productionChoice: {
        cityId,
        canStart: true,
        clearBlockerOnSend: false,
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.city.production.choice.request({ cityId, args: productionArgs });

    expect(response).toMatchObject({
      status: "sent-unverified",
      postcondition: {
        classification: "production-state-changed-blocker-still-live",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
    });
  });

  test("rejects malformed production validator evidence without sending", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      productionChoice: {
        cityId,
        onSend: (args) => sendCalls.push(args),
      },
    });
    if (target.Game?.CityOperations != null) {
      target.Game.CityOperations.canStart = () => ({ Success: "yes" });
    }
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    await expect(
      bridge.city.production.choice.request({ cityId, args: productionArgs })
    ).rejects.toMatchObject({
      code: "PRODUCTION_CHOICE_UNAVAILABLE",
      data: {
        procedureKey: "city.production.choice.request",
        source: "direct-control-facade",
      },
    });
    expect(sendCalls).toEqual([]);
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

    const readiness = await bridge.readiness.current(
      {},
      { context: { correlationId: "game-ui-population-readiness-1" } }
    );
    expect(readiness).toMatchObject({
      capability: {
        canObserve: true,
        canMutate: false,
        reason:
          "The game UI controller can read supported procedure evidence; broad runtime mutation remains unavailable.",
      },
      controller: {
        supportedProcedures: expect.arrayContaining([
          {
            procedureKey: "city.population.place.check",
            risk: "read-only",
          },
          {
            procedureKey: "city.population.place.request",
            risk: "mutation",
          },
        ]),
      },
    });

    const response = await bridge.city.population.place.request(
      { mode: "assign-worker", location: 2543 },
      { context: { correlationId: "game-ui-population-assign-worker-1" } }
    );

    expect(response).toMatchObject({
      placement: {
        mode: "assign-worker",
        playerId: 0,
        cityId,
        location: 2543,
      },
      status: "sent-confirmed",
      postcondition: {
        classification: "worker-assignment-confirmed",
        outcome: "worker-assigned",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "city.population.place.request",
        },
      ],
    });
    expect(sendCalls).toEqual([{ Location: 2543, Amount: 1 }]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("Game.PlayerOperations");
    expect(serialized).not.toContain("sendRequest");
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain('"command"');
    expect(serialized).not.toContain('"payload"');
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

    const response = await bridge.city.population.place.request({
      mode: "expand-city",
      cityId,
      destination: populationDestination,
    });

    expect(response).toMatchObject({
      placement: {
        mode: "expand-city",
        cityId,
        destination: populationDestination,
      },
      status: "sent-confirmed",
      postcondition: {
        classification: "city-expansion-confirmed",
        outcome: "city-expanded",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
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

    const response = await bridge.city.population.place.request({
      mode: "assign-worker",
      location: 2543,
    });

    expect(response).toMatchObject({
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "inspect-population-placement",
          source: "city.population.place.request",
        },
      ],
    });
    expect(sendCalls).toEqual([]);
  });

  test("rejects caller player ids on game UI assign-worker bridge input", async () => {
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

    await expect(
      bridge.city.population.place.request({
        mode: "assign-worker",
        playerId: 2,
        location: 2543,
      } as unknown as never)
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(sendCalls).toEqual([]);
  });

  test("executes town focus change through game UI service dependency", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      notificationTarget: cityId,
      notificationTypeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
      townFocus: {
        cityId,
        canChange: true,
        onChangeSend: (args) => sendCalls.push(args),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.readiness.current(
      {},
      { context: { correlationId: "game-ui-town-focus-readiness-1" } }
    );
    expect(readiness).toMatchObject({
      controller: {
        supportedProcedures: expect.arrayContaining([
          {
            procedureKey: "city.townFocus.change.check",
            risk: "read-only",
          },
          {
            procedureKey: "city.townFocus.change.request",
            risk: "mutation",
          },
          {
            procedureKey: "city.townFocus.review.check",
            risk: "read-only",
          },
          {
            procedureKey: "city.townFocus.review.request",
            risk: "mutation",
          },
        ]),
      },
    });

    const check = await bridge.city.townFocus.change.check({
      cityId,
      growthType: townFocusGrowthType,
      projectType: townFocusProjectType,
    });
    expect(check).toEqual({
      cityId,
      growthType: townFocusGrowthType,
      projectType: townFocusProjectType,
      status: "available",
    });
    expect(sendCalls).toEqual([]);

    const response = await bridge.city.townFocus.change.request(
      {
        cityId,
        growthType: townFocusGrowthType,
        projectType: townFocusProjectType,
      },
      { context: { correlationId: "game-ui-town-focus-change-1" } }
    );

    expect(response).toMatchObject({
      cityId,
      growthType: townFocusGrowthType,
      projectType: townFocusProjectType,
      status: "sent-confirmed",
      postcondition: {
        classification: "town-focus-selected",
        outcome: "selected",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "city.townFocus.change.request",
        },
      ],
    });
    expect(sendCalls).toEqual([
      {
        Type: townFocusGrowthType,
        ProjectType: townFocusProjectType,
        City: cityId.id,
      },
    ]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("Game.CityCommands");
    expect(serialized).not.toContain("CHANGE_GROWTH_MODE");
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain('"command"');
    expect(serialized).not.toContain('"payload"');
    expect(serialized).not.toContain('"verified"');
  });

  test("executes town project review through game UI service dependency", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      notificationTarget: cityId,
      notificationTypeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
      townFocus: {
        cityId,
        clearBlockerOnReviewSend: true,
        onReviewSend: (args) => sendCalls.push(args),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const check = await bridge.city.townFocus.review.check({ cityId });
    expect(check).toEqual({
      cityId,
      status: "available",
    });
    expect(sendCalls).toEqual([]);

    const response = await bridge.city.townFocus.review.request(
      { cityId },
      { context: { correlationId: "game-ui-town-focus-review-1" } }
    );

    expect(response).toMatchObject({
      cityId,
      status: "sent-confirmed",
      postcondition: {
        classification: "town-focus-review-cleared",
        outcome: "review-cleared",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
    });
    expect(sendCalls).toEqual([{}]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("Game.CityOperations");
    expect(serialized).not.toContain("CONSIDER_TOWN_PROJECT");
    expect(serialized).not.toContain('"command"');
    expect(serialized).not.toContain('"payload"');
  });

  test("keeps game UI town focus validator blocks semantic and not sent", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      notificationTarget: cityId,
      notificationTypeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
      townFocus: {
        cityId,
        canChange: false,
        onChangeSend: (args) => sendCalls.push(args),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.city.townFocus.change.request({
      cityId,
      growthType: townFocusGrowthType,
      projectType: townFocusProjectType,
    });

    expect(response).toMatchObject({
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
    });
    expect(sendCalls).toEqual([]);
  });

  test("keeps native town focus rejection for a non-local city not sent", async () => {
    const sendCalls: unknown[] = [];
    const otherCityId = { owner: 2, id: cityId.id, type: cityId.type };
    const target = gameUiNotificationTarget(notificationId, {
      notificationTarget: otherCityId,
      notificationTypeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
      townFocus: {
        cityId: otherCityId,
        canChange: false,
        onChangeSend: (args) => sendCalls.push(args),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.city.townFocus.change.request({
      cityId: otherCityId,
      growthType: townFocusGrowthType,
      projectType: townFocusProjectType,
    });

    expect(response).toMatchObject({
      cityId: otherCityId,
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
    });
    expect(sendCalls).toEqual([]);
  });

  test("surfaces partial game UI town focus targets before dispatch", async () => {
    await expect(
      sendCiv7GameUiTownFocusChange(
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
        }
      )
    ).rejects.toMatchObject({
      message: "Game.CityCommands.sendRequest is unavailable.",
      dispatchStatus: "not-dispatched",
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

    const readiness = await bridge.readiness.current(
      {},
      { context: { correlationId: "game-ui-progression-readiness-1" } }
    );
    expect(readiness).toMatchObject({
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
    });

    const response = await bridge.progression.technology.choice.request(
      {
        node: 18_001,
        notificationId,
      },
      { context: { correlationId: "game-ui-progression-tech-1" } }
    );

    expect(response).toMatchObject({
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
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "progression.technology.choice.request",
        },
      ],
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
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain('"command"');
    expect(serialized).not.toContain('"payload"');
    expect(serialized).not.toContain('"rawCommand"');
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

    const response = await bridge.progression.culture.choice.request({
      node: 27_001,
      notificationId,
    });

    expect(response).toMatchObject({
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
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "progression.culture.choice.request",
        },
      ],
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

    const response = await bridge.progression.technology.choice.request({
      node: 18_001,
      notificationId,
    });

    expect(response).toMatchObject({
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
      nextSteps: [
        {
          kind: "inspect-progression-choice",
          source: "progression.technology.choice.request",
        },
      ],
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

    const readiness = await bridge.readiness.current({});
    expect(readiness).toMatchObject({
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
    });

    const response = await bridge.progression.technology.target.request(
      {
        node: 18_001,
      },
      { context: { correlationId: "game-ui-progression-target-1" } }
    );

    expect(response).toMatchObject({
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
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "progression.technology.target.request",
        },
      ],
    });
    expect(sendCalls).toEqual([
      {
        operationType: "SET_TECH_TREE_TARGET_NODE",
        args: { ProgressionTreeNodeType: 18_001 },
      },
    ]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("SET_TECH_TREE_TARGET_NODE");
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain('"command"');
    expect(serialized).not.toContain('"operation"');
    expect(serialized).not.toContain('"verified"');
  });

  test("does not advertise progression requests without local-player notification evidence", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      progressionRequest: {},
    });
    if (target.Game?.Notifications != null) {
      target.Game.Notifications.getIdsForPlayer = undefined;
    }
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.readiness.current({});

    expect(readiness).toMatchObject({
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

    const attribute = await bridge.progression.attribute.purchase.request(
      { node: attributeNode },
      { context: { correlationId: "game-ui-attribute-purchase-1" } }
    );
    const tradition = await bridge.progression.tradition.change.request(
      {
        traditionType,
        action: traditionAction,
      },
      { context: { correlationId: "game-ui-tradition-change-1" } }
    );

    expect(attribute).toMatchObject({
      playerId: 0,
      node: attributeNode,
      sent: true,
      status: "sent-unverified",
      postcondition: {
        classification: "pending-runtime-proof",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
    });
    expect(tradition).toMatchObject({
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
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain('"operation"');
    expect(serialized).not.toContain('"verified"');
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

    const response = await bridge.progression.attribute.review.request({});

    expect(response).toMatchObject({
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
      nextSteps: [
        {
          kind: "inspect-progression-attribute",
          source: "progression.attribute.review.request",
        },
      ],
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
      }
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
      }
    );

    expect(result).toMatchObject({
      playerId: 0,
      sent: false,
      beforeValidation: { valid: true },
      afterValidation: { valid: true },
      postcondition: { classification: "not-sent" },
    });
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

    const readiness = await bridge.readiness.current(
      {},
      { context: { correlationId: "game-ui-diplomacy-readiness-1" } }
    );
    expect(readiness).toMatchObject({
      controller: {
        supportedProcedures: expect.arrayContaining([
          {
            procedureKey: "diplomacy.response.check",
            risk: "read-only",
          },
          {
            procedureKey: "diplomacy.response.request",
            risk: "mutation",
          },
        ]),
      },
    });

    const response = await bridge.diplomacy.response.request(
      {
        actionId: diplomacyActionId,
        responseType: diplomacyResponseType,
      },
      { context: { correlationId: "game-ui-diplomacy-1" } }
    );

    expect(response).toMatchObject({
      actionId: diplomacyActionId,
      responseType: diplomacyResponseType,
      status: "sent-confirmed",
      postcondition: {
        classification: "diplomacy-response-cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "diplomacy.response.request",
        },
      ],
    });
    expect(sendCalls).toEqual([
      {
        playerId: 0,
        args: {
          ID: diplomacyActionId,
          Type: diplomacyResponseType,
        },
      },
    ]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("RESPOND_DIPLOMATIC_ACTION");
    expect(serialized).not.toContain("sendRequest");
    expect(serialized).not.toContain("DiplomacyManager");
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain('"command"');
    expect(serialized).not.toContain('"payload"');
    expect(serialized).not.toContain('"rawCommand"');
  });

  test("reads strategy front summary through game UI service dependency", async () => {
    const target = gameUiStrategyFrontTarget();
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.readiness.current(
      {},
      { context: { correlationId: "game-ui-strategy-readiness-1" } }
    );
    expect(readiness).toMatchObject({
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
      nextSteps: [
        {
          kind: "read-strategy-front",
          source: "readiness.current",
          label: "Read strategy front summary before choosing tactical support actions.",
        },
      ],
    });

    const response = await bridge.strategy.frontSummary(
      {
        playerId: 0,
        origins: [{ x: 10, y: 20 }],
        candidateLimit: 3,
        scanRadius: 6,
      },
      { context: { correlationId: "game-ui-strategy-front-1" } }
    );

    expect(response).toMatchObject({
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
      targetCandidates: [
        {
          owner: 1,
          relationship: "relationship-unproven",
          relationshipProof: "none",
          nearestDistance: 5,
          cityCount: 1,
          unitCount: 1,
          routeKind: "land",
        },
      ],
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
    });
    expect(response.nextSteps.map((step) => step.kind)).toContain("inspect-target-candidate");

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain("Game.turn");
    expect(serialized).not.toContain("rawCommand");
    expect(serialized).not.toContain("Game.UnitOperations");
    expect(serialized).not.toContain("Game.UnitCommands");
    expect(serialized).not.toContain("sendRequest");
    expect(serialized).not.toContain("friendly");
    expect(serialized).not.toMatch(/\benemy\b/i);
    expect(serialized).not.toMatch(/\bhostile\b/i);
    expect(serialized).not.toMatch(/\bopponent\b/i);
    expect(serialized).not.toMatch(/\bthreat\b/i);
    expect(serialized).not.toMatch(/\bwar\b/i);
    expect(serialized).not.toMatch(/\bally\b/i);
    expect(serialized).not.toMatch(/\bsuzerain\b/i);
  });

  test("does not advertise game UI strategy front without owner unit APIs", async () => {
    const target = gameUiStrategyFrontTarget();
    if (target.Players != null) {
      target.Players.Units = undefined;
    }
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.readiness.current({});

    expect(readiness).toMatchObject({
      controller: {
        supportedProcedures: [
          {
            procedureKey: "world.current",
            risk: "read-only",
          },
        ],
      },
    });

    await expect(
      bridge.strategy.frontSummary({ origins: [{ x: 10, y: 20 }] })
    ).rejects.toMatchObject({
      code: "CONTROLLER_CAPABILITY_UNAVAILABLE",
      data: {
        procedureKey: "strategy.frontSummary",
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

    const readiness = await bridge.readiness.current(
      {},
      { context: { correlationId: "game-ui-first-meet-readiness-1" } }
    );
    expect(readiness).toMatchObject({
      controller: {
        supportedProcedures: expect.arrayContaining([
          {
            procedureKey: "diplomacy.firstMeet.response.check",
            risk: "read-only",
          },
          {
            procedureKey: "diplomacy.firstMeet.response.request",
            risk: "mutation",
          },
        ]),
      },
    });

    const response = await bridge.diplomacy.firstMeet.response.request(
      {
        metPlayerId: 2,
        response: "friendly",
      },
      { context: { correlationId: "game-ui-first-meet-1" } }
    );

    expect(response).toMatchObject({
      metPlayerId: 2,
      response: "friendly",
      status: "sent-confirmed",
      postcondition: {
        classification: "first-meet-cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "diplomacy.firstMeet.response.request",
        },
      ],
    });
    expect(sendCalls).toEqual([
      {
        playerId: 0,
        args: {
          Player1: 0,
          Player2: 2,
          Type: firstMeetResponseType,
        },
      },
    ]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("Game.PlayerOperations");
    expect(serialized).not.toContain("sendRequest");
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain('"command"');
    expect(serialized).not.toContain('"payload"');
    expect(serialized).not.toContain('"operation"');
    expect(serialized).not.toContain('"verified"');
  });

  test("executes unit target action through game UI service dependency", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      unitTargetAction: {
        unitId,
        target: unitTarget,
        onSend: (family, operationType, args) => sendCalls.push({ family, operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.readiness.current(
      {},
      { context: { correlationId: "game-ui-unit-target-readiness-1" } }
    );
    expect(readiness).toMatchObject({
      controller: {
        supportedProcedures: expect.arrayContaining([
          {
            procedureKey: "unit.target.action.request",
            risk: "mutation",
          },
        ]),
      },
    });

    const response = await bridge.unit.target.action.request(
      {
        unitId,
        ...unitTarget,
      },
      { context: { correlationId: "game-ui-unit-target-1" } }
    );

    expect(response).toMatchObject({
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
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "unit.target.action.request",
        },
      ],
    });
    expect(sendCalls).toEqual([
      {
        family: "unit-operation",
        operationType: "MOVE_TO",
        args: { X: 22, Y: 31, Modifiers: 3 },
      },
    ]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("Game.UnitOperations");
    expect(serialized).not.toContain("Game.UnitCommands");
    expect(serialized).not.toContain("sendRequest");
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain('"sendResult"');
    expect(serialized).not.toContain('"result"');
    expect(serialized).not.toContain('"rawCommand"');
  });

  test("blocks game UI unit target sends for non-local unit owners", async () => {
    const sendCalls: unknown[] = [];
    const foreignUnitId = { owner: 2, id: 42, type: 1 };
    const target = gameUiNotificationTarget(notificationId, {
      unitTargetAction: {
        unitId: foreignUnitId,
        target: unitTarget,
        onSend: (family, operationType, args) => sendCalls.push({ family, operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.unit.target.action.request(
      {
        unitId: foreignUnitId,
        ...unitTarget,
      },
      { context: { correlationId: "game-ui-unit-target-foreign-1" } }
    );

    expect(response).toMatchObject({
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

    const response = await bridge.unit.target.action.request(
      {
        unitId,
        ...unitTarget,
      },
      { context: { correlationId: "game-ui-unit-target-shortfall-1" } }
    );

    expect(response).toMatchObject({
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
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "unit.target.action.request",
        },
      ],
    });
  });

  test("keeps game UI unit target validator blocks semantic and not sent", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      unitTargetAction: {
        unitId,
        target: unitTarget,
        canMoveTo: false,
        onSend: (family, operationType, args) => sendCalls.push({ family, operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.unit.target.action.request(
      {
        unitId,
        ...unitTarget,
      },
      { context: { correlationId: "game-ui-unit-target-blocked-1" } }
    );

    expect(response).toMatchObject({
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

    await expect(
      bridge.unit.target.action.request({
        unitId,
        ...unitTarget,
      })
    ).rejects.toMatchObject({
      code: "CONTROLLER_CAPABILITY_UNAVAILABLE",
      data: {
        procedureKey: "unit.target.action.request",
        reason: "procedure-not-supported",
      },
    });
  });

  test("executes unit upgrade through game UI service dependency", async () => {
    const checkCalls: unknown[] = [];
    const sendCalls: unknown[] = [];
    const nextReadyUnitId = { owner: 0, id: 500_001, type: 26 };
    const target = gameUiNotificationTarget(notificationId, {
      firstReadyUnitId: unitId,
      unitCommand: {
        unitId,
        nextReadyUnitId,
        onCheck: (operationType, args) => checkCalls.push({ operationType, args }),
        onSend: (operationType, args) => sendCalls.push({ operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const readiness = await bridge.readiness.current(
      {},
      { context: { correlationId: "game-ui-unit-command-readiness-1" } }
    );
    expect(readiness).toMatchObject({
      controller: {
        supportedProcedures: expect.arrayContaining([
          {
            procedureKey: "unit.upgrade.check",
            risk: "read-only",
          },
          {
            procedureKey: "unit.resettle.check",
            risk: "read-only",
          },
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
    });

    const check = await bridge.unit.upgrade.check(
      { unitId },
      { context: { correlationId: "game-ui-unit-upgrade-check-1" } }
    );
    expect(check).toEqual({
      action: {
        kind: "upgrade",
        unitId,
      },
      available: true,
    });
    expect(sendCalls).toEqual([]);

    const response = await bridge.unit.upgrade.request(
      { unitId },
      { context: { correlationId: "game-ui-unit-upgrade-1" } }
    );

    expect(response).toMatchObject({
      action: {
        kind: "upgrade",
        unitId,
      },
      status: "sent-confirmed",
      postcondition: {
        classification: "queue-advanced",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "unit.upgrade.request",
        },
      ],
    });
    expect(sendCalls).toEqual([
      {
        operationType: "UNITCOMMAND_UPGRADE",
        args: {},
      },
    ]);
    expect(checkCalls).toEqual(
      Array.from({ length: 4 }, () => ({
        operationType: "UNITCOMMAND_UPGRADE",
        args: {},
      }))
    );
    expectSemanticOutputOmitsRawUnitCommand(response);
  });

  test("executes unit resettle through game UI service dependency", async () => {
    const checkCalls: unknown[] = [];
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      unitCommand: {
        unitId,
        destination: resettleTarget,
        onCheck: (operationType, args) => checkCalls.push({ operationType, args }),
        onSend: (operationType, args) => sendCalls.push({ operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const check = await bridge.unit.resettle.check(
      {
        unitId,
        destination: resettleTarget,
      },
      { context: { correlationId: "game-ui-unit-resettle-check-1" } }
    );
    expect(check).toEqual({
      action: {
        kind: "resettle",
        unitId,
        destination: resettleTarget,
      },
      available: true,
    });
    expect(sendCalls).toEqual([]);

    const response = await bridge.unit.resettle.request(
      {
        unitId,
        destination: resettleTarget,
      },
      { context: { correlationId: "game-ui-unit-resettle-1" } }
    );

    expect(response).toMatchObject({
      action: {
        kind: "resettle",
        unitId,
        destination: resettleTarget,
      },
      status: "sent-confirmed",
      postcondition: {
        classification: "unit-state-changed",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
    });
    expect(sendCalls).toEqual([
      {
        operationType: "UNITCOMMAND_RESETTLE",
        args: { X: 22, Y: 31 },
      },
    ]);
    expect(checkCalls).toEqual(
      Array.from({ length: 4 }, () => ({
        operationType: "UNITCOMMAND_RESETTLE",
        args: { X: 22, Y: 31 },
      }))
    );
    expectSemanticOutputOmitsRawUnitCommand(response);
  });

  test("surfaces game UI unit validator failures instead of treating them as rejection", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      unitCommand: {
        unitId,
      },
    });
    if (target.Game?.UnitCommands != null) {
      target.Game.UnitCommands.canStart = () => {
        throw new Error("private Game.UnitCommands.canStart failure");
      };
    }
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    await expect(bridge.unit.upgrade.check({ unitId })).rejects.toMatchObject({
      code: "UNIT_REQUEST_UNAVAILABLE",
      data: {
        procedureKey: "unit.upgrade.check",
        source: "direct-control-facade",
      },
    });
    await expect(bridge.unit.upgrade.check({ unitId })).rejects.not.toThrow(/private|canStart/);
  });

  test("blocks game UI unit command sends for non-local unit owners", async () => {
    const sendCalls: unknown[] = [];
    const foreignUnitId = { owner: 2, id: 420_001, type: 26 };
    const target = gameUiNotificationTarget(notificationId, {
      unitCommand: {
        unitId: foreignUnitId,
        onSend: (operationType, args) => sendCalls.push({ operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.unit.upgrade.request(
      { unitId: foreignUnitId },
      { context: { correlationId: "game-ui-unit-upgrade-foreign-1" } }
    );

    expect(response).toMatchObject({
      action: {
        kind: "upgrade",
        unitId: foreignUnitId,
      },
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        confirmed: false,
        noRepeatAfterUnverified: true,
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

    const response = await bridge.unit.upgrade.request(
      { unitId },
      { context: { correlationId: "game-ui-unit-upgrade-no-state-change-1" } }
    );

    expect(response).toMatchObject({
      status: "sent-unverified",
      postcondition: {
        classification: "no-state-change",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "unit.upgrade.request",
        },
      ],
    });
    expectSemanticOutputOmitsRawUnitCommand(response);
  });

  test("keeps an uncertain game UI unit command send no-repeat guarded", async () => {
    const sendCalls: unknown[] = [];
    const target = gameUiNotificationTarget(notificationId, {
      firstReadyUnitId: unitId,
      unitCommand: {
        unitId,
        sendThrows: true,
        onSend: (operationType, args) => sendCalls.push({ operationType, args }),
      },
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.unit.upgrade.request(
      { unitId },
      { context: { correlationId: "game-ui-unit-upgrade-uncertain-send-1" } }
    );

    expect(response).toMatchObject({
      status: "dispatch-unknown",
      postcondition: {
        classification: "missing-postcondition",
        outcome: "unknown",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "unit.upgrade.request",
        },
      ],
    });
    expect(sendCalls).toEqual([
      {
        operationType: "UNITCOMMAND_UPGRADE",
        args: {},
      },
    ]);
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

    const response = await bridge.turn.complete.request(
      {},
      { context: { correlationId: "game-ui-turn-blocked-1" } }
    );

    expect(response).toMatchObject({
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{ kind: "inspect-turn-completion" }],
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

    const response = await bridge.turn.complete.request(
      {},
      { context: { correlationId: "game-ui-turn-already-sent-1" } }
    );

    expect(response).toMatchObject({
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{ kind: "inspect-turn-completion" }],
    });
    expect(sendCalls).toEqual([]);
  });

  test("reads supported game UI attention without ready actor overclaim", async () => {
    const target = gameUiNotificationTarget(notificationId);
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.attention.current(
      {},
      { context: { correlationId: "game-ui-attention-supported-1" } }
    );

    expect(response).toMatchObject({
      playable: false,
      readiness: "app-ui-game",
      summary: {
        blockerCount: 1,
        decisionCount: 1,
        readyActorCount: 0,
      },
      blockers: [
        {
          source: "notification",
          kind: "blocking-notification",
          label: "Wonder Completed",
          componentId: notificationId,
          evidence: ["end-turn-blocking-notification"],
        },
      ],
      decisions: [
        {
          source: "notification",
          category: "blocking-notification",
          summary: "Wonder Completed",
          isEndTurnBlocking: true,
          requiredInputs: [],
        },
      ],
      readyActors: [],
      sourceStatus: {
        playableStatus: "read",
        notifications: "read",
        turnCompletion: "read",
        readyUnit: "read",
        readyCity: "skipped-unsupported",
      },
      nextSteps: [
        {
          kind: "resolve-blocker",
          source: "notification",
          label: "Resolve Wonder Completed.",
        },
      ],
    });
    expect(response.nextSteps.map((step) => step.kind)).not.toContain("end-turn");
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain("Civ7 game UI controller dependency");
    expect(serialized).not.toContain("Game.Notifications.dismiss");
    expect(serialized).not.toContain('"cli"');
    expect(serialized).not.toContain("game play ");
  });

  test("does not treat selected unit evidence as a ready unit", async () => {
    const selectedUnitId = { owner: 0, id: 501, type: 26 };
    const target = gameUiNotificationTarget(notificationId, {
      blocksTurnAdvancement: false,
      selectedUnitId,
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.attention.current(
      {},
      { context: { correlationId: "game-ui-attention-selected-unit-1" } }
    );

    expect(response).toMatchObject({
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
      nextSteps: [
        {
          kind: "observe",
          source: "attention",
          label:
            "Ready actor coverage is incomplete; inspect ready unit and city evidence before concluding there are no blockers.",
        },
      ],
    });
    expect(JSON.stringify(response)).not.toContain("act-ready-unit");
    expect(response.nextSteps.map((step) => step.kind)).not.toContain("end-turn");
  });

  test("uses first-ready-unit evidence without implying full ready actor coverage", async () => {
    const readyUnitId = { owner: 0, id: 502, type: 26 };
    const target = gameUiNotificationTarget(notificationId, {
      blocksTurnAdvancement: false,
      firstReadyUnitId: readyUnitId,
      canEndTurn: true,
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.attention.current(
      {},
      { context: { correlationId: "game-ui-attention-first-ready-unit-1" } }
    );

    expect(response).toMatchObject({
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
      blockers: [
        {
          source: "ready-unit",
          componentId: readyUnitId,
          evidence: ["game-ui-ready-unit-source"],
        },
      ],
      readyActors: [
        {
          kind: "unit",
          componentId: readyUnitId,
          operationCount: 0,
          evidence: ["game-ui-ready-unit-source"],
        },
      ],
      nextSteps: [
        {
          kind: "act-ready-unit",
          source: "ready-unit",
        },
      ],
    });
    expect(response.nextSteps.map((step) => step.kind)).not.toContain("end-turn");
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

    const response = await bridge.attention.current(
      {},
      { context: { correlationId: "game-ui-attention-selected-city-1" } }
    );

    expect(response).toMatchObject({
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
      nextSteps: [
        {
          kind: "observe",
          source: "attention",
          label:
            "Ready actor coverage is incomplete; inspect ready unit and city evidence before concluding there are no blockers.",
        },
      ],
    });
    expect(JSON.stringify(response)).not.toContain("act-ready-city");
    expect(response.nextSteps.map((step) => step.kind)).not.toContain("end-turn");
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

    const response = await bridge.attention.current(
      {},
      { context: { correlationId: "game-ui-attention-blocking-city-1" } }
    );
    const nextStepKinds = response.nextSteps.map((step) => step.kind);

    expect(response).toMatchObject({
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
      readyActors: [
        {
          kind: "city",
          componentId: cityId,
          operationCount: 0,
          evidence: ["game-ui-ready-city-source"],
        },
      ],
      nextSteps: expect.arrayContaining([
        expect.objectContaining({
          kind: "act-ready-city",
          source: "ready-city",
        }),
      ]),
    });
    expect(nextStepKinds).not.toContain("end-turn");
  });

  test("uses population-ready city evidence as ready city source", async () => {
    const cityId = { owner: 0, id: 705, type: 1 };
    const target = gameUiNotificationTarget(notificationId, {
      blocksTurnAdvancement: false,
      readyCity: { cityId, populationReady: true },
      canEndTurn: true,
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.attention.current(
      {},
      { context: { correlationId: "game-ui-attention-population-city-1" } }
    );

    expect(response).toMatchObject({
      sourceStatus: {
        readyUnit: "read",
        readyCity: "read",
      },
      summary: {
        blockerCount: 1,
        readyActorCount: 1,
      },
      blockers: [
        {
          source: "ready-city",
          componentId: cityId,
          evidence: ["game-ui-ready-city-source"],
        },
      ],
      readyActors: [
        {
          kind: "city",
          componentId: cityId,
          operationCount: 0,
          evidence: ["game-ui-ready-city-source"],
        },
      ],
      nextSteps: [
        {
          kind: "act-ready-city",
          source: "ready-city",
        },
      ],
    });
    expect(response.nextSteps.map((step) => step.kind)).not.toContain("end-turn");
  });

  test("treats truncated game UI notification coverage as incomplete attention evidence", async () => {
    const target = gameUiNotificationTarget(notificationId, {
      blocksTurnAdvancement: false,
      extraIds: [{ owner: 0, id: 114, type: 20 }],
    });
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    const response = await bridge.attention.current(
      { maxNotifications: 1 },
      { context: { correlationId: "game-ui-attention-truncated-1" } }
    );

    expect(response).toMatchObject({
      summary: {
        blockerCount: 0,
        decisionCount: 1,
        readyActorCount: 0,
        nextStepCount: 1,
      },
      nextSteps: [
        {
          kind: "observe",
          source: "attention",
          label:
            "Notification coverage is truncated; inspect more attention evidence before concluding there are no blockers.",
        },
      ],
    });
    expect(response.nextSteps.map((step) => step.kind)).not.toContain("end-turn");
    expect(response.nextSteps.map((step) => step.label)).not.toContain(
      "No current blockers found."
    );
  });

  test("does not advertise game UI mutations without game-owned proof", async () => {
    const target = gameUiNotificationTarget(notificationId);
    target.Players = {
      maxPlayers: 8,
      getAliveIds: () => [0, 1],
      getAliveHumanIds: () => [0, 1],
      getNumAliveHumans: () => 2,
    };
    const bridge = installCiv7GameUiIntelligenceBridge({ target });

    await expect(
      bridge.notifications.dismiss.request({
        notificationId: { owner: 0, id: 113, type: 20 },
      })
    ).rejects.toMatchObject({
      code: "CONTROLLER_CAPABILITY_UNAVAILABLE",
      data: {
        procedureKey: "notifications.dismiss.request",
        reason: "procedure-not-supported",
      },
    });
  });

  test("creates context without endpoint or raw command inputs", async () => {
    const createContext = createCiv7GameUiControllerContextFactory({
      target: gameUiTarget(),
      timeoutMs: 250,
    });

    const context = await createContext();

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

    const context = await createContext();

    expect(context.controller).toEqual({
      supportedReadProcedures: [
        "notifications.dismiss.check",
        "attention.current",
        "world.current",
      ],
      supportedMutationProcedures: ["notifications.dismiss.request"],
    });
    expect(await context.directControl.getCiv7PlayableStatus()).toMatchObject({
      playable: false,
      readiness: "app-ui-game",
    });
  });
});

function gameUiTarget(overrides: Partial<Civ7GameUiRuntimeTarget> = {}): Civ7GameUiRuntimeTarget {
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

function gameUiMapReadTarget(): Civ7GameUiRuntimeTarget {
  const base = gameUiTarget();
  return gameUiTarget({
    GameplayMap: {
      ...(base.GameplayMap ?? {}),
      isValidXY: (x, y) => x >= 0 && y >= 0 && x < 74 && y < 46,
      getIndexFromXY: (x, y) => x * 1_000 + y,
      getTerrainType: () => 7,
      getOwner: () => 0,
      getOwnerName: () => "Local Player",
      getRevealedState: () => 1,
    },
    Visibility: {
      isVisible: () => true,
    },
  });
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
          getUnitIds: () => (playerId === 0 ? [ownUnitId] : [otherUnitId]),
        }),
      },
      Cities: {
        get: (playerId) => ({
          getCityIds: () => (playerId === 0 ? [ownCityId] : [otherCityId]),
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
    };
    productionChoice?: {
      cityId: { owner: number; id: number; type: number };
      canStart?: boolean;
      clearBlockerOnSend?: boolean;
      blockerReadFailsAfterSend?: boolean;
      changeProductionStateOnSend?: boolean;
      onSend?: (args: Readonly<Record<string, number>>) => void;
    };
    populationPlacement?: {
      cityId: { owner: number; id: number; type: number };
      canAssignWorker?: boolean;
      canExpandCity?: boolean;
      readyBefore?: boolean;
      clearReadyOnSend?: boolean;
      onAssignWorkerSend?: (args: Readonly<Record<string, number>>) => void;
      onExpandCitySend?: (args: Readonly<Record<string, number>>) => void;
    };
    townFocus?: {
      cityId?: { owner: number; id: number; type: number };
      canChange?: boolean;
      clearBlockerOnReviewSend?: boolean;
      onChangeSend?: (args: Readonly<Record<string, number>>) => void;
      onReviewSend?: (args: Readonly<Record<string, number>>) => void;
    };
    progressionChoice?: {
      kind: "technology" | "culture";
      canChoose?: boolean;
      canClearTarget?: boolean;
      clearBlockerOnSend?: boolean;
      onSend?: (operationType: string, args: Readonly<Record<string, number>>) => void;
    };
    progressionRequest?: {
      canTechnologyTarget?: boolean;
      canCultureTarget?: boolean;
      canAttributePurchase?: boolean;
      canAttributeReview?: boolean;
      canTraditionChange?: boolean;
      canTraditionReview?: boolean;
      onSend?: (operationType: string, args: Readonly<Record<string, number>>) => void;
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
        }>
      ) => void;
    };
    diplomacyResponse?: {
      canRespond?: boolean;
      clearBlockerOnSend?: boolean;
      onSend?: (
        playerId: number,
        args: Readonly<{
          ID: number;
          Type: number;
        }>
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
        }>
      ) => void;
    };
    governmentChoice?: {
      canChange?: boolean;
      canCelebrate?: boolean;
      onSend?: (
        playerId: number,
        operationType: string,
        args: Readonly<Record<string, number>>
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
        args: Readonly<Record<string, number>>
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
      sendThrows?: boolean;
      onCheck?: (operationType: string, args: Readonly<Record<string, number>>) => void;
      onSend?: (operationType: string, args: Readonly<Record<string, number>>) => void;
    };
  }> = {}
): Civ7GameUiRuntimeTarget {
  const target = gameUiTarget();
  let exists = true;
  let turnCompletionSent = options.turnCompletion?.initiallySent ?? false;
  let productionSent = false;
  let populationSent = false;
  let townFocusGrowthType = 101;
  let townFocusProjectType = 202;
  let progressionSent = false;
  let unitTargetSent = false;
  let unitCommandSent = false;
  let lastUnitCommandOperationType: string | null = null;
  const readyCity = options.readyCity;
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
    ...(options.firstMeetResponse == null
      ? {}
      : { Player: options.notificationTarget?.owner ?? -1 }),
  };

  return {
    ...target,
    document: {
      querySelector: (selector) =>
        selector === ".action-panel"
          ? {
              maybeComponent: {
                canEndTurn: () => options.canEndTurn ?? false,
                ...(options.turnCompletion == null
                  ? {}
                  : {
                      sendEndTurn: () => {
                        options.turnCompletion?.onSend?.();
                        turnCompletionSent = true;
                      },
                    }),
              },
            }
          : null,
    },
    CityOperationTypes:
      options.productionChoice == null && options.townFocus == null
        ? undefined
        : {
            ...(options.productionChoice == null ? {} : { BUILD: "BUILD" }),
            ...(options.townFocus == null
              ? {}
              : { CONSIDER_TOWN_PROJECT: "CONSIDER_TOWN_PROJECT" }),
          },
    CityCommandTypes:
      options.populationPlacement == null && options.townFocus == null
        ? undefined
        : {
            ...(options.populationPlacement == null ? {} : { EXPAND: "EXPAND" }),
            ...(options.townFocus == null ? {} : { CHANGE_GROWTH_MODE: "CHANGE_GROWTH_MODE" }),
          },
    UnitCommandTypes:
      options.unitTargetAction == null && options.unitCommand == null
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
    UnitOperationMoveModifiers:
      options.unitTargetAction == null
        ? undefined
        : {
            ATTACK: 1,
            MOVE_IGNORE_UNEXPLORED_DESTINATION: 2,
          },
    UnitOperationTypes:
      options.unitTargetAction == null
        ? undefined
        : {
            UNITOPERATION_NAVAL_ATTACK: "UNITOPERATION_NAVAL_ATTACK",
            UNITOPERATION_AIR_ATTACK: "UNITOPERATION_AIR_ATTACK",
            UNITOPERATION_RANGE_ATTACK: "UNITOPERATION_RANGE_ATTACK",
            UNITOPERATION_SWAP_UNITS: "UNITOPERATION_SWAP_UNITS",
            MOVE_TO: "MOVE_TO",
          },
    PlayerOperationTypes: {
      ...(options.populationPlacement == null ? {} : { ASSIGN_WORKER: "ASSIGN_WORKER" }),
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
            CHOOSE_NARRATIVE_STORY_DIRECTION: "CHOOSE_NARRATIVE_STORY_DIRECTION",
          }),
      ...(options.diplomacyResponse == null
        ? {}
        : {
            RESPOND_DIPLOMATIC_ACTION: "RESPOND_DIPLOMATIC_ACTION",
          }),
      ...(options.firstMeetResponse == null
        ? {}
        : {
            RESPOND_DIPLOMATIC_FIRST_MEET: "RESPOND_DIPLOMATIC_FIRST_MEET",
          }),
      ...(options.governmentChoice == null
        ? {}
        : {
            CHANGE_GOVERNMENT: "CHANGE_GOVERNMENT",
            CHOOSE_GOLDEN_AGE: "CHOOSE_GOLDEN_AGE",
          }),
    },
    DiplomacyPlayerFirstMeets:
      options.firstMeetResponse == null
        ? undefined
        : {
            PLAYER_REALATIONSHIP_FIRSTMEET_FRIENDLY: firstMeetResponseType,
            PLAYER_REALATIONSHIP_FIRSTMEET_NEUTRAL: firstMeetResponseType + 1,
            PLAYER_REALATIONSHIP_FIRSTMEET_UNFRIENDLY: firstMeetResponseType + 2,
          },
    DiplomacyActionTypes:
      options.diplomacyResponse == null
        ? undefined
        : {
            DIPLOMACY_ACTION_DENOUNCE_MILITARY_PRESENCE: 729_061_548,
          },
    DiplomaticResponseTypes:
      options.diplomacyResponse == null
        ? undefined
        : {
            DIPLOMACY_RESPONSE_REJECT: -308_560_490,
          },
    EndTurnBlockingTypes: {
      NONE: 0,
    },
    ProgressionTreeNodeTypes: options.progressionChoice == null ? undefined : { NO_NODE: -1 },
    Cities:
      options.productionChoice == null &&
      options.populationPlacement == null &&
      options.readyCity == null &&
      options.townFocus?.cityId == null
        ? undefined
        : {
            get: (id) =>
              componentIdEqual(id, options.productionChoice?.cityId)
                ? {
                    id,
                    isTown: false,
                    location: { x: 26, y: 36 },
                    BuildQueue: {
                      currentProductionTypeHash:
                        productionSent &&
                        options.productionChoice?.changeProductionStateOnSend !== false
                          ? 99
                          : 1,
                    },
                  }
                : componentIdEqual(id, options.populationPlacement?.cityId)
                  ? (() => {
                      return {
                        id: options.populationPlacement?.cityId,
                        isTown: false,
                        population: populationSent ? 4 : 3,
                        Growth: {
                          isReadyToPlacePopulation:
                            options.populationPlacement?.readyBefore === true &&
                            !(
                              populationSent &&
                              options.populationPlacement?.clearReadyOnSend === true
                            ),
                        },
                        Workers: {
                          getCityWorkerCap: () => (populationSent ? 5 : 4),
                          GetAllPlacementInfo: () => [
                            {
                              PlotIndex: 2543,
                              IsBlocked: false,
                              NumWorkers: populationSent ? 1 : 0,
                            },
                          ],
                        },
                      };
                    })()
                  : componentIdEqual(id, options.readyCity?.cityId)
                    ? {
                        id: options.readyCity?.cityId,
                        isTown: false,
                        population: 3,
                        Growth: {
                          isReadyToPlacePopulation: options.readyCity?.populationReady === true,
                        },
                      }
                    : componentIdEqual(id, options.townFocus?.cityId)
                      ? {
                          id: options.townFocus?.cityId,
                          owner: options.townFocus?.cityId?.owner,
                          isTown: true,
                          Growth: {
                            growthType: townFocusGrowthType,
                            projectType: townFocusProjectType,
                          },
                        }
                      : null,
          },
    GameplayMap: {
      ...target.GameplayMap,
      getIndexFromLocation: (location) => location.x * 1_000 + location.y,
      getIndexFromXY: (x, y) => x * 1_000 + y,
      getOwningCityFromXY: (x, y) =>
        populationSent && x === populationDestination.x && y === populationDestination.y
          ? options.populationPlacement?.cityId
          : null,
    },
    MapUnits:
      options.unitTargetAction == null
        ? undefined
        : {
            getUnits: (x, y) =>
              x === options.unitTargetAction?.target.x &&
              y === options.unitTargetAction.target.y &&
              unitTargetSent &&
              options.unitTargetAction.targetUnitsChangeOnSend === true
                ? [{ owner: 1, id: 99, type: 1 }]
                : [],
          },
    Units:
      options.unitTargetAction == null && options.unitCommand == null
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
                    ? (options.unitTargetAction.landedLocation ?? options.unitTargetAction.target)
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
              const commandDestination = options.unitCommand?.destination ?? { x: 22, y: 31 };
              const unitCommandLocation =
                unitCommandSent &&
                lastUnitCommandOperationType === "UNITCOMMAND_RESETTLE" &&
                options.unitCommand?.changeUnitStateOnSend !== false
                  ? commandDestination
                  : { x: 20, y: 31 };
              return {
                id: options.unitCommand?.unitId,
                owner: options.unitCommand?.unitId.owner,
                type: options.unitCommand?.unitId.type,
                location: unitCommandLocation,
                Movement: {
                  movementMovesRemaining:
                    unitCommandSent && options.unitCommand?.changeUnitStateOnSend !== false ? 0 : 1,
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
          options.unitCommand != null &&
          unitCommandSent &&
          options.unitCommand.advanceQueueOnSend !== false
            ? (options.unitCommand.nextReadyUnitId ?? null)
            : (options.firstReadyUnitId ?? null),
        getHeadSelectedCity: () => options.selectedCityId ?? null,
      },
    },
    GameContext: {
      ...target.GameContext,
      hasSentTurnComplete:
        options.turnCompletion == null
          ? target.GameContext?.hasSentTurnComplete
          : () => turnCompletionSent,
    },
    Game: {
      ...target.Game,
      ProgressionTrees:
        options.progressionChoice == null
          ? undefined
          : {
              getTree: () => ({
                activeNodeIndex: 0,
                nodes: [
                  {
                    nodeType: progressionSent ? 27_001 : 26_000,
                  },
                ],
              }),
            },
      CityCommands:
        options.populationPlacement == null && options.townFocus == null
          ? undefined
          : {
              canStart: (_cityId, commandType) =>
                String(commandType) === "CHANGE_GROWTH_MODE"
                  ? {
                      Success: options.townFocus?.canChange ?? true,
                      Plots: [],
                      ConstructibleTypes: [],
                    }
                  : {
                      Success: options.populationPlacement?.canExpandCity ?? true,
                      Plots: populationSent
                        ? []
                        : [populationDestination.x * 1_000 + populationDestination.y],
                      ConstructibleTypes: populationSent ? [] : [713_967_338],
                    },
              sendRequest: (_cityId, commandType, args) => {
                if (String(commandType) === "CHANGE_GROWTH_MODE") {
                  options.townFocus?.onChangeSend?.(args);
                  townFocusGrowthType = args.Type ?? townFocusGrowthType;
                  townFocusProjectType = args.ProjectType ?? townFocusProjectType;
                } else {
                  options.populationPlacement?.onExpandCitySend?.(args);
                  populationSent = true;
                }
                return true;
              },
            },
      CityOperations:
        options.productionChoice == null && options.townFocus == null
          ? undefined
          : {
              canStart:
                options.productionChoice == null
                  ? undefined
                  : () => ({
                      Success: options.productionChoice?.canStart ?? true,
                    }),
              sendRequest: (_cityId, operationType, args) => {
                if (String(operationType) === "CONSIDER_TOWN_PROJECT") {
                  options.townFocus?.onReviewSend?.(args);
                  if (options.townFocus?.clearBlockerOnReviewSend === true) {
                    exists = false;
                  }
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
      UnitCommands:
        options.unitTargetAction == null && options.unitCommand == null
          ? undefined
          : {
              canStart: (_unitId, commandType, args) => {
                const operationType = String(commandType);
                options.unitCommand?.onCheck?.(operationType, args);
                return {
                  Success:
                    operationType === "UNITCOMMAND_UPGRADE"
                      ? (options.unitCommand?.canUpgrade ?? true)
                      : operationType === "UNITCOMMAND_RESETTLE"
                        ? (options.unitCommand?.canResettle ?? true)
                        : false,
                  Plots: [],
                };
              },
              sendRequest: (_unitId, commandType, args) => {
                const operationType = String(commandType);
                if (
                  operationType === "UNITCOMMAND_UPGRADE" ||
                  operationType === "UNITCOMMAND_RESETTLE"
                ) {
                  options.unitCommand?.onSend?.(operationType, args);
                  unitCommandSent = true;
                  lastUnitCommandOperationType = operationType;
                  if (options.unitCommand?.sendThrows === true) {
                    throw new Error("Game.UnitCommands.sendRequest outcome is unknown.");
                  }
                } else {
                  options.unitTargetAction?.onSend?.("unit-command", operationType, args);
                  unitTargetSent = true;
                }
                return true;
              },
            },
      UnitOperations:
        options.unitTargetAction == null
          ? undefined
          : {
              canStart: (_unitId, operationType) => {
                const isMove = String(operationType) === "MOVE_TO";
                const targetIndex =
                  options.unitTargetAction == null
                    ? -1
                    : options.unitTargetAction.target.x * 1_000 + options.unitTargetAction.target.y;
                return {
                  Success: isMove && (options.unitTargetAction?.canMoveTo ?? true),
                  Plots:
                    options.unitTargetAction?.moveTargetInReturnedPlots === false
                      ? []
                      : [targetIndex],
                };
              },
              sendRequest: (_unitId, operationType, args) => {
                options.unitTargetAction?.onSend?.("unit-operation", String(operationType), args);
                unitTargetSent = true;
                return true;
              },
            },
      PlayerOperations:
        options.populationPlacement == null &&
        options.progressionChoice == null &&
        options.progressionRequest == null &&
        options.narrativeChoice == null &&
        options.diplomacyResponse == null &&
        options.firstMeetResponse == null &&
        options.governmentChoice == null
          ? undefined
          : {
              canStart: (_playerId, operationType) => ({
                Success:
                  operationType === "ASSIGN_WORKER"
                    ? (options.populationPlacement?.canAssignWorker ?? true)
                    : operationType === "CHOOSE_NARRATIVE_STORY_DIRECTION"
                      ? (options.narrativeChoice?.canChoose ?? true)
                      : operationType === "RESPOND_DIPLOMATIC_ACTION"
                        ? (options.diplomacyResponse?.canRespond ?? true)
                        : operationType === "RESPOND_DIPLOMATIC_FIRST_MEET"
                          ? (options.firstMeetResponse?.canRespond ?? true)
                          : operationType === "CHANGE_GOVERNMENT"
                            ? (options.governmentChoice?.canChange ?? true)
                            : operationType === "CHOOSE_GOLDEN_AGE"
                              ? (options.governmentChoice?.canCelebrate ?? true)
                              : String(operationType).includes("TARGET")
                                ? progressionTargetCanStart(
                                    String(operationType),
                                    options.progressionRequest,
                                    options.progressionChoice
                                  )
                                : operationType === "BUY_ATTRIBUTE_TREE_NODE"
                                  ? (options.progressionRequest?.canAttributePurchase ?? true)
                                  : operationType === "CONSIDER_ASSIGN_ATTRIBUTE"
                                    ? (options.progressionRequest?.canAttributeReview ?? true)
                                    : operationType === "CHANGE_TRADITION"
                                      ? (options.progressionRequest?.canTraditionChange ?? true)
                                      : operationType === "CONSIDER_ASSIGN_TRADITIONS"
                                        ? (options.progressionRequest?.canTraditionReview ?? true)
                                        : (options.progressionChoice?.canChoose ?? true),
              }),
              sendRequest: (_playerId, _operationType, args) => {
                const operationType = String(_operationType);
                if (operationType === "ASSIGN_WORKER") {
                  options.populationPlacement?.onAssignWorkerSend?.(numericOperationArgs(args));
                  populationSent = true;
                } else if (operationType === "CHOOSE_NARRATIVE_STORY_DIRECTION") {
                  options.narrativeChoice?.onSend?.(_playerId, narrativeOperationArgs(args));
                  if (options.narrativeChoice?.clearBlockerOnSend === true) {
                    exists = false;
                  }
                } else if (operationType === "RESPOND_DIPLOMATIC_ACTION") {
                  options.diplomacyResponse?.onSend?.(_playerId, diplomacyOperationArgs(args));
                  if (options.diplomacyResponse?.clearBlockerOnSend === true) {
                    exists = false;
                  }
                } else if (operationType === "RESPOND_DIPLOMATIC_FIRST_MEET") {
                  options.firstMeetResponse?.onSend?.(_playerId, firstMeetOperationArgs(args));
                  if (options.firstMeetResponse?.clearBlockerOnSend === true) {
                    exists = false;
                  }
                } else if (
                  operationType === "CHANGE_GOVERNMENT" ||
                  operationType === "CHOOSE_GOLDEN_AGE"
                ) {
                  options.governmentChoice?.onSend?.(
                    _playerId,
                    operationType,
                    numericOperationArgs(args)
                  );
                } else {
                  if (options.progressionRequest != null) {
                    options.progressionRequest.onSend?.(operationType, numericOperationArgs(args));
                  } else {
                    options.progressionChoice?.onSend?.(operationType, numericOperationArgs(args));
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
        find: () => (exists ? notification : null),
        getType: () => notificationId.type,
        getTypeName: () => options.notificationTypeName ?? "NOTIFICATION_WONDER_COMPLETED",
        canUserDismissNotification: () => true,
        getSummary: () => "Wonder Completed",
        getMessage: () => "Wonder Completed",
        getBlocksTurnAdvancement: () => blocksTurnAdvancement,
        activate: () => true,
        getEndTurnBlockingType: () => {
          if (productionSent && options.productionChoice?.blockerReadFailsAfterSend === true) {
            throw new Error("production blocker read failed");
          }
          return exists && blocksTurnAdvancement ? notificationId.type : 0;
        },
        findEndTurnBlocking: () => (exists && blocksTurnAdvancement ? notificationId : null),
        getIdsForPlayer: () => (exists ? [notificationId, ...(options.extraIds ?? [])] : []),
        dismiss: () => {
          notification.Dismissed = true;
          exists = false;
          return true;
        },
      },
      Diplomacy:
        options.diplomacyResponse == null
          ? undefined
          : {
              getResponseDataForUI: (actionId: number) => ({
                actionID: actionId,
                responseList: [{ responseType: diplomacyResponseType }],
              }),
              getDiplomaticEventData: () => ({ actionType: -963_359_821 }),
            },
    },
    Players: {
      ...target.Players,
      Cities:
        readyCity == null
          ? target.Players?.Cities
          : {
              get: (playerId: number) => ({
                getCityIds: () =>
                  playerId === target.GameContext?.localPlayerID ? [readyCity.cityId] : [],
              }),
            },
      get: (playerId) =>
        playerId === 0 && options.populationPlacement != null
          ? {
              Cities: {
                getCityIds: () => [options.populationPlacement?.cityId],
              },
            }
          : playerId === 0 &&
              (options.progressionChoice != null || options.progressionRequest != null)
            ? {
                Techs: {
                  getResearching: () => (progressionSent ? 18_001 : 17_000),
                  getTargetNode: () => (progressionSent ? -1 : 18_001),
                },
                Culture: {
                  getActiveTree: () => 1,
                  getTargetNode: () => (progressionSent ? -1 : 27_001),
                  getAllAvailableNodeTypes: () => [27_001],
                },
              }
            : null,
    },
  };
}

function expectSemanticOutputOmitsRawUnitCommand(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain("CMD");
  expect(serialized).not.toContain("Game.UnitCommands");
  expect(serialized).not.toContain("Game.UnitOperations");
  expect(serialized).not.toContain("sendRequest");
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"session"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"operationType"');
  expect(serialized).not.toContain('"sendResult"');
  expect(serialized).not.toContain('"result"');
  expect(serialized).not.toContain('"verified"');
  expect(serialized).not.toContain('"before"');
  expect(serialized).not.toContain('"after"');
}

function progressionTargetCanStart(
  operationType: string,
  progressionRequest:
    | Readonly<{
        canTechnologyTarget?: boolean;
        canCultureTarget?: boolean;
      }>
    | undefined,
  progressionChoice:
    | Readonly<{
        canClearTarget?: boolean;
      }>
    | undefined
): boolean {
  if (operationType === "SET_TECH_TREE_TARGET_NODE") {
    return progressionRequest?.canTechnologyTarget ?? progressionChoice?.canClearTarget ?? true;
  }
  if (operationType === "SET_CULTURE_TREE_TARGET_NODE") {
    return progressionRequest?.canCultureTarget ?? progressionChoice?.canClearTarget ?? true;
  }
  return progressionChoice?.canClearTarget ?? true;
}

function componentIdEqual(
  left: { owner: number; id: number; type?: number } | null | undefined,
  right: { owner: number; id: number; type?: number } | null | undefined
): boolean {
  return (
    left?.owner === right?.owner &&
    left?.id === right?.id &&
    (left?.type ?? null) === (right?.type ?? null)
  );
}

function componentKey(
  value: { owner: number; id: number; type?: number } | null | undefined
): string {
  return `${value?.owner}:${value?.id}:${value?.type ?? "none"}`;
}

function operationRecord(value: unknown): Readonly<Record<string, unknown>> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Expected operation args object");
  }
  return Object.fromEntries(Object.entries(value));
}

function numericOperationArgs(value: unknown): Readonly<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const [key, entry] of Object.entries(operationRecord(value))) {
    if (typeof entry !== "number") throw new Error(`Expected numeric operation arg ${key}`);
    out[key] = entry;
  }
  return out;
}

function narrativeOperationArgs(value: unknown): Readonly<{
  TargetType: string;
  Target: { owner: number; id: number; type: number };
  Action: number;
}> {
  const args = operationRecord(value);
  const target = operationRecord(args.Target);
  return {
    TargetType: stringOperationArg(args, "TargetType"),
    Target: {
      owner: numberOperationArg(target, "owner"),
      id: numberOperationArg(target, "id"),
      type: numberOperationArg(target, "type"),
    },
    Action: numberOperationArg(args, "Action"),
  };
}

function diplomacyOperationArgs(value: unknown): Readonly<{ ID: number; Type: number }> {
  const args = operationRecord(value);
  return {
    ID: numberOperationArg(args, "ID"),
    Type: numberOperationArg(args, "Type"),
  };
}

function firstMeetOperationArgs(
  value: unknown
): Readonly<{ Player1: number; Player2: number; Type: number }> {
  const args = operationRecord(value);
  return {
    Player1: numberOperationArg(args, "Player1"),
    Player2: numberOperationArg(args, "Player2"),
    Type: numberOperationArg(args, "Type"),
  };
}

function numberOperationArg(args: Readonly<Record<string, unknown>>, key: string): number {
  const value = args[key];
  if (typeof value !== "number") throw new Error(`Expected numeric operation arg ${key}`);
  return value;
}

function stringOperationArg(args: Readonly<Record<string, unknown>>, key: string): string {
  const value = args[key];
  if (typeof value !== "string") throw new Error(`Expected string operation arg ${key}`);
  return value;
}
