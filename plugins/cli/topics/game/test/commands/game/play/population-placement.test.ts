import { describe, expect, test, vi } from "vitest";
import type { createCiv7GameControlClient } from "../../../../src/adapters/control/service-client";
import GamePlayAssignWorker from "../../../../src/commands/game/play/assign-worker";
import GamePlayExpandCity from "../../../../src/commands/game/play/expand-city";
import { type FakeTunerServer, startFakeTunerServer } from "../../../support/tuner-socket-server";

describe("game play population placement commands", () => {
  test("checks growth worker assignment through the exact city population procedure", async () => {
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
        "--json",
      ]);

      const payload = JSON.parse(writes.join("")) as {
        ok: true;
        result: PopulationPlacementCheckResult;
      };
      expect(payload.result).toEqual({
        placement: {
          mode: "assign-worker",
          playerId: 0,
          cityId: { owner: 0, id: 196610, type: 1 },
          location: 2543,
        },
        available: true,
      });
    } finally {
      log.mockRestore();
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
      expect(payload.result.status).toBe("sent-confirmed");
      expect(payload.result.placement).toEqual({
        mode: "assign-worker",
        playerId: 0,
        cityId: { owner: 0, id: 196610, type: 1 },
        location: 2543,
      });
      expect(payload.result.postcondition).toMatchObject({
        classification: "worker-assignment-confirmed",
        outcome: "worker-assigned",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      });
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

  test("checks city expansion through the exact city population procedure", async () => {
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
        "--json",
      ]);

      const payload = JSON.parse(writes.join("")) as {
        ok: true;
        result: PopulationPlacementCheckResult;
      };
      expect(payload.result).toEqual({
        placement: {
          mode: "expand-city",
          cityId: { owner: 0, id: 196610, type: 1 },
          destination: { x: 16, y: 19 },
        },
        available: true,
      });
    } finally {
      log.mockRestore();
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
      expect(payload.result.status).toBe("sent-confirmed");
      expect(payload.result.placement).toEqual({
        mode: "expand-city",
        cityId: { owner: 0, id: 196610, type: 1 },
        destination: { x: 16, y: 19 },
      });
      expect(payload.result.postcondition).toMatchObject({
        classification: "city-expansion-confirmed",
        outcome: "city-expanded",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      });
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
});

type GameControlClient = ReturnType<typeof createCiv7GameControlClient>;
type PopulationPlacementCheckResult = Awaited<
  ReturnType<GameControlClient["city"]["population"]["place"]["check"]>
>;
type PopulationPlacementSendResult = Awaited<
  ReturnType<GameControlClient["city"]["population"]["place"]["request"]>
>;

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
  let workerSent = false;
  let expansionSent = false;
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
      if (message.includes("return JSON.stringify(checkWorkerAssignment(")) {
        return [JSON.stringify(workerAssignmentCheck(workerSent))];
      }
      if (message.includes("return JSON.stringify(sendWorkerAssignmentEnvelope(")) {
        const before = workerAssignmentSnapshot(false);
        workerSent = true;
        return [JSON.stringify(workerAssignmentSend(before, workerAssignmentSnapshot(true)))];
      }
      if (message.includes("return JSON.stringify(checkCityExpansion(")) {
        return [JSON.stringify(cityExpansionCheck(expansionSent))];
      }
      if (message.includes("return JSON.stringify(sendCityExpansionEnvelope(")) {
        const before = cityExpansionSnapshot(false);
        expansionSent = true;
        return [JSON.stringify(cityExpansionSend(before, cityExpansionSnapshot(true)))];
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

function workerAssignmentSnapshot(sent: boolean) {
  return {
    localPlayerId: 0,
    location: 2543,
    readyCityIds: sent ? [] : [{ owner: 0, id: 196610, type: 1 }],
    candidateCityId: { owner: 0, id: 196610, type: 1 },
    isReadyToPlacePopulation: !sent,
    placementInfo: {
      PlotIndex: 2543,
      IsBlocked: false,
      NumWorkers: sent ? 1 : 0,
    },
    numWorkers: sent ? 1 : 0,
  };
}

function workerAssignmentCheck(sent: boolean) {
  return {
    valid: !sent,
    result: { Success: !sent },
    snapshot: workerAssignmentSnapshot(sent),
  };
}

function workerAssignmentSend(
  before: ReturnType<typeof workerAssignmentSnapshot>,
  after: ReturnType<typeof workerAssignmentSnapshot>
) {
  return {
    ok: true,
    value: {
      sent: true,
      validation: { valid: true, result: { Success: true } },
      before,
      after,
    },
  };
}

function cityExpansionSnapshot(sent: boolean) {
  return {
    localPlayerId: 0,
    cityId: { owner: 0, id: 196610, type: 1 },
    destination: { x: 16, y: 19 },
    plotIndex: 1660,
    isReadyToPlacePopulation: !sent,
    candidate: sent ? null : { plotIndex: 1660, constructibleType: 7 },
    ownership: sent
      ? {
          status: "owned",
          cityId: { owner: 0, id: 196610, type: 1 },
        }
      : { status: "unowned" },
  };
}

function cityExpansionCheck(sent: boolean) {
  return {
    valid: !sent,
    result: {
      Plots: sent ? [] : [1660],
      ConstructibleTypes: sent ? [] : [7],
    },
    snapshot: cityExpansionSnapshot(sent),
  };
}

function cityExpansionSend(
  before: ReturnType<typeof cityExpansionSnapshot>,
  after: ReturnType<typeof cityExpansionSnapshot>
) {
  return {
    ok: true,
    value: {
      sent: true,
      validation: {
        valid: true,
        result: { Plots: [1660], ConstructibleTypes: [7] },
      },
      before,
      after,
    },
  };
}
