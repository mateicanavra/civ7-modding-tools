import { describe, expect, test, vi } from "vitest";
import GamePlayAssignWorker from "../../src/commands/game/play/assign-worker";
import GamePlayExpandCity from "../../src/commands/game/play/expand-city";
import { type FakeTunerServer, startFakeTunerServer } from "./fixtures/tuner-socket-server";

describe("game play population placement commands", () => {
  test("wraps growth worker assignment as ASSIGN_WORKER", async () => {
    const server = await startPopulationPlacementTunerServer();
    try {
      const { port } = server.address();
      await GamePlayAssignWorker.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--player-id",
        "0",
        "--location",
        "2543",
        "--amount",
        "1",
        "--json",
      ]);

      expect(server.received.some((message) => message.includes("ASSIGN_WORKER"))).toBe(true);
      expect(server.received.some((message) => message.includes('"Location":2543'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Amount":1'))).toBe(true);
      expect(server.received.some((message) => message.includes("sendOperation("))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("reports population postconditions for sent worker assignments", async () => {
    const server = await startPopulationPlacementTunerServer();
    const writes: string[] = [];
    const log = vi
      .spyOn(GamePlayAssignWorker.prototype, "log")
      .mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
    try {
      const { port } = server.address();
      await GamePlayAssignWorker.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--location",
        "2543",
        "--send",
        "--json",
      ]);

      const payload = JSON.parse(writes.join("")) as {
        ok: true;
        result: PopulationPlacementSendResult;
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe("sent-confirmed");
      expect(payload.result.placement).toEqual({
        mode: "assign-worker",
        playerId: 0,
        location: 2543,
      });
      expect(payload.result.validation).toEqual({ beforeValid: true, afterValid: true });
      expect(payload.result.postcondition).toMatchObject({
        classification: "population-ready-cleared",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
        readyCleared: true,
        placementStateChanged: true,
      });
      expect(payload.result.postcondition.reason).toMatch(
        /Growth\.isReadyToPlacePopulation cleared/
      );
      expect(payload.result.nextSteps[0]).toMatchObject({
        kind: "refresh-attention",
        source: "city.population.place.request",
      });
      expectSemanticPopulationPlacementOmitsRawRuntimeDetails(payload.result);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test("wraps city expansion placement as city-command EXPAND", async () => {
    const server = await startPopulationPlacementTunerServer();
    try {
      const { port } = server.address();
      await GamePlayExpandCity.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--city-id",
        '{"owner":0,"id":196610,"type":1}',
        "--x",
        "16",
        "--y",
        "19",
        "--json",
      ]);

      expect(
        server.received.some((message) => message.includes('validateOperation("city-command"'))
      ).toBe(true);
      expect(server.received.some((message) => message.includes("EXPAND"))).toBe(true);
      expect(server.received.some((message) => message.includes('"X":16'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Y":19'))).toBe(true);
      expect(server.received.some((message) => message.includes("sendOperation("))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("reports population postconditions for sent city expansions", async () => {
    const server = await startPopulationPlacementTunerServer();
    const writes: string[] = [];
    const log = vi
      .spyOn(GamePlayExpandCity.prototype, "log")
      .mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
    try {
      const { port } = server.address();
      await GamePlayExpandCity.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--city-id",
        '{"owner":0,"id":196610,"type":1}',
        "--x",
        "16",
        "--y",
        "19",
        "--send",
        "--json",
      ]);

      const payload = JSON.parse(writes.join("")) as {
        ok: true;
        result: PopulationPlacementSendResult;
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe("sent-confirmed");
      expect(payload.result.placement).toEqual({
        mode: "expand-city",
        cityId: { owner: 0, id: 196610, type: 1 },
        destination: { x: 16, y: 19 },
      });
      expect(payload.result.validation).toEqual({ beforeValid: true, afterValid: true });
      expect(payload.result.postcondition).toMatchObject({
        classification: "population-ready-cleared",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
        readyCleared: true,
        placementStateChanged: true,
      });
      expect(payload.result.postcondition.reason).toMatch(
        /Growth\.isReadyToPlacePopulation cleared/
      );
      expect(payload.result.nextSteps[0]).toMatchObject({
        kind: "refresh-attention",
        source: "city.population.place.request",
      });
      expectSemanticPopulationPlacementOmitsRawRuntimeDetails(payload.result);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test("rejects non-default worker amount for the semantic assign-worker send atom", async () => {
    await expect(
      GamePlayAssignWorker.run([
        "--player-id",
        "0",
        "--location",
        "2543",
        "--amount",
        "2",
        "--send",
        "--json",
      ])
    ).rejects.toThrow(/one-worker placement atom/);
  });
});

type PopulationPlacementSendResult = {
  placement:
    | { mode: "assign-worker"; playerId: number; location: number }
    | {
        mode: "expand-city";
        cityId: { owner: number; id: number; type: number };
        destination: { x: number; y: number };
      };
  sent: boolean;
  status: string;
  validation: { beforeValid: boolean; afterValid: boolean };
  postcondition: {
    classification: string;
    reason: string;
    outcome: string;
    confidence: string;
    confirmed: boolean;
    noRepeatAfterUnverified: boolean;
    readyCleared: boolean | null;
    placementStateChanged: boolean | null;
  };
  nextSteps: Array<{ kind: string; source: string; label: string }>;
};

function expectSemanticPopulationPlacementOmitsRawRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"session"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"payload"');
  expect(serialized).not.toContain('"sendResult"');
  expect(serialized).not.toContain('"verified"');
  expect(serialized).not.toContain('"beforePopulationPostcondition"');
  expect(serialized).not.toContain('"afterPopulationPostcondition"');
  expect(serialized).not.toContain('"populationPostcondition"');
  expect(serialized).not.toContain("Game.PlayerOperations");
  expect(serialized).not.toContain("Game.CityCommands");
}

async function startPopulationPlacementTunerServer(): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes("Network.isInSession")) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes("evalOk") && message.includes("GameplayMap.getGridWidth")) {
        return [JSON.stringify(tunerHealthSnapshot())];
      }
      if (message.includes("GameContext.localPlayerID") && message.includes("decisionQueue")) {
        return [JSON.stringify(playNotificationView())];
      }
      if (message.includes("return JSON.stringify(validateOperation")) {
        return [JSON.stringify(operationValidation(message))];
      }
      if (message.includes("return JSON.stringify(sendOperation")) {
        return [
          JSON.stringify({
            sent: true,
            beforePopulationPostcondition: populationPlacementPostconditionSnapshot(true),
            afterPopulationPostcondition: populationPlacementPostconditionSnapshot(false),
          }),
        ];
      }
      return undefined;
    },
  });
}

function playNotificationView() {
  return {
    host: "127.0.0.1",
    port: 0,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    turn: { ok: true, value: 1 },
    turnDate: { ok: true, value: "4000 BCE" },
    loadingStateName: null,
    blocker: { ok: true, value: 0 },
    blockingNotificationId: { ok: true, value: null },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: null },
    nextDecision: null,
    hud: {
      decisionQueue: [],
      currentBlocker: null,
      advisories: [],
      units: [],
      cities: [],
      localPlayer: { ok: true, value: 0 },
      selectedUnit: { ok: true, value: null },
      selectedCity: { ok: true, value: null },
      firstReadyUnit: { ok: true, value: null },
    },
    limits: {
      maxNotifications: 25,
      truncated: false,
    },
    notes: [],
  };
}

function appUiSnapshot() {
  return {
    network: {
      isInSession: { ok: true, value: true },
      numPlayers: { ok: true, value: 1 },
      hostPlayerId: { ok: true, value: 0 },
      isConnectedToNetwork: { ok: true, value: true },
      isAuthenticated: { ok: true, value: false },
      isLoggedIn: { ok: true, value: true },
    },
    autoplay: {
      isActive: false,
      turns: -1,
      isPaused: false,
      isPausedOrPending: false,
      observeAsPlayer: -1,
      returnAsPlayer: -1,
    },
    game: {
      turn: 1,
      age: 0,
      maxTurns: 0,
      turnDate: { ok: true, value: "4000 BCE" },
      hash: { ok: true, value: 0 },
    },
    ui: {
      inGame: { ok: true, value: true },
      inShell: { ok: true, value: false },
      inLoading: { ok: true, value: false },
      loadingState: { ok: true, value: 6 },
      loadingStateName: "WaitingForUIReady",
      canBeginGame: { ok: true, value: true },
      canNotifyUIReady: "function",
      skipStartButton: { ok: true, value: false },
      automationActive: { ok: true, value: false },
    },
    gameContext: {
      localPlayerID: 0,
      localObserverID: 0,
      hasRequestedPause: { ok: true, value: false },
    },
    players: {
      maxPlayers: 64,
      aliveIds: { ok: true, value: [0] },
      aliveHumanIds: { ok: true, value: [0] },
      numAliveHumans: { ok: true, value: 1 },
    },
    map: {
      width: { ok: true, value: 84 },
      height: { ok: true, value: 54 },
      plotCount: { ok: true, value: 4536 },
      mapSize: { ok: true, value: 0 },
      randomSeed: { ok: true, value: 1 },
    },
  };
}

function tunerHealthSnapshot() {
  return {
    evalOk: 2,
    ready: true,
    globals: {
      Game: "object",
      Autoplay: "object",
      GameplayMap: "object",
      Players: "object",
      Network: "undefined",
    },
    turn: { ok: true, value: 1 },
    turnDate: { ok: true, value: "4000 BCE" },
    width: { ok: true, value: 84 },
    height: { ok: true, value: 54 },
    aliveIds: { ok: true, value: [0] },
    aliveHumanIds: { ok: true, value: [0] },
    autoplayActive: { ok: true, value: false },
  };
}

function operationValidation(message: string) {
  const operationType = operationTypeFromMessage(message);
  const family = operationType === "EXPAND" ? "city-command" : "player-operation";
  return {
    host: "127.0.0.1",
    port: 0,
    state: { id: "1", name: "Tuner", role: "tuner" },
    family,
    operationType,
    enumValue: operationType,
    target:
      family === "city-command" ? { cityId: { owner: 0, id: 65536, type: 25 } } : { playerId: 0 },
    args: operationType === "EXPAND" ? { X: 16, Y: 19 } : { Location: 2543, Amount: 1 },
    valid: true,
    result: { Success: true },
  };
}

function operationTypeFromMessage(message: string) {
  const validateIndex = message.lastIndexOf('validateOperation("');
  const sendIndex = message.lastIndexOf('sendOperation("');
  const callIndex = Math.max(validateIndex, sendIndex);
  const callSource = callIndex >= 0 ? message.slice(callIndex) : message;
  return callSource.match(/"operationType":"([^"]+)"/)?.[1] ?? "ASSIGN_WORKER";
}

function populationPlacementPostconditionSnapshot(isReadyToPlacePopulation: boolean) {
  return {
    cityId: { owner: 0, id: 196610, type: 1 },
    city: {
      ok: true,
      value: {
        id: { owner: 0, id: 196610, type: 1 },
        population: isReadyToPlacePopulation ? 4 : 5,
        isTown: true,
        location: { x: 20, y: 20 },
      },
    },
    isReadyToPlacePopulation: { ok: true, value: isReadyToPlacePopulation },
    cityWorkerCap: { ok: true, value: isReadyToPlacePopulation ? 4 : 5 },
    workablePlotIndexes: {
      ok: true,
      value: isReadyToPlacePopulation ? [2543, 2544] : [2543, 2544, 2545],
    },
    blockedPlotIndexes: { ok: true, value: isReadyToPlacePopulation ? [2545] : [] },
    expansionPlotIndexes: { ok: true, value: isReadyToPlacePopulation ? [1660] : [1661] },
  };
}
