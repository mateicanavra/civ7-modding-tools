import { describe, expect, test, vi } from "vitest";
import GamePlayConsiderTownProject from "../../../../src/commands/game/play/consider-town-project";
import GamePlaySetTownFocus from "../../../../src/commands/game/play/set-town-focus";
import { type FakeTunerServer, startFakeTunerServer } from "../../../support/tuner-socket-server";

const cityId = { owner: 0, id: 131_073, type: 1 };
const growthType = -284_569_333;
const projectType = -548_685_232;

describe("game play town focus commands", () => {
  test("routes town-focus dry runs through the exact service check", async () => {
    const server = await startTownFocusTunerServer();
    const output = await captureCommandOutput(GamePlaySetTownFocus, [
      ...townFocusChangeArgs(server),
      "--json",
    ]);
    try {
      expect(output.result).toEqual({
        cityId,
        growthType,
        projectType,
        status: "available",
      });
      expect(townFocusCalls(server.received, "checkTownFocusChange")).toHaveLength(1);
      expect(townFocusCalls(server.received, "sendTownFocusChangeEnvelope")).toHaveLength(0);
      expectNoGenericTownFocusWire(server.received);
    } finally {
      await server.close();
    }
  });

  test("routes focus changes through the exact city service request", async () => {
    const server = await startTownFocusTunerServer();
    const output = await captureCommandOutput(GamePlaySetTownFocus, [
      ...townFocusChangeArgs(server),
      "--send",
      "--json",
    ]);
    try {
      expect(output.result).toMatchObject({
        cityId,
        growthType,
        projectType,
        status: "sent-confirmed",
        postcondition: {
          classification: "town-focus-selected",
          outcome: "selected",
          confidence: "confirmed",
          confirmed: true,
        },
        nextSteps: [{ kind: "refresh-attention" }],
      });
      expect(townFocusCalls(server.received, "checkTownFocusChange")).toHaveLength(1);
      expect(townFocusCalls(server.received, "sendTownFocusChangeEnvelope")).toHaveLength(1);
      expectNoGenericTownFocusWire(server.received);
      expectSemanticTownFocusOmitsRawRuntimeDetails(output.result);
    } finally {
      await server.close();
    }
  });

  test("derives town-project review availability from native state", async () => {
    const server = await startTownFocusTunerServer();
    const output = await captureCommandOutput(GamePlayConsiderTownProject, [
      ...townFocusReviewArgs(server),
      "--json",
    ]);
    try {
      expect(output.result).toEqual({
        cityId,
        status: "available",
      });
      expect(townFocusCalls(server.received, "checkTownFocusReview")).toHaveLength(1);
      expect(townFocusCalls(server.received, "sendTownFocusReviewEnvelope")).toHaveLength(0);
      expectNoGenericTownFocusWire(server.received);
      expect(server.received.some((message) => message.includes("CityOperations.canStart"))).toBe(
        false
      );
    } finally {
      await server.close();
    }
  });

  test("confirms review completion through exact blocker readback", async () => {
    const server = await startTownFocusTunerServer();
    const output = await captureCommandOutput(GamePlayConsiderTownProject, [
      ...townFocusReviewArgs(server),
      "--send",
      "--json",
    ]);
    try {
      expect(output.result).toMatchObject({
        cityId,
        status: "sent-confirmed",
        postcondition: {
          classification: "town-focus-review-cleared",
          outcome: "review-cleared",
          confidence: "confirmed",
          confirmed: true,
        },
        nextSteps: [{ kind: "refresh-attention" }],
      });
      expect(townFocusCalls(server.received, "checkTownFocusReview")).toHaveLength(1);
      expect(townFocusCalls(server.received, "sendTownFocusReviewEnvelope")).toHaveLength(1);
      expectNoGenericTownFocusWire(server.received);
      expectSemanticTownFocusOmitsRawRuntimeDetails(output.result);
    } finally {
      await server.close();
    }
  });
});

async function captureCommandOutput(
  command: typeof GamePlaySetTownFocus | typeof GamePlayConsiderTownProject,
  args: string[]
): Promise<{ ok: true; result: Record<string, unknown> }> {
  const writes: string[] = [];
  const log = vi.spyOn(command.prototype, "log").mockImplementation((message?: string) => {
    if (message) writes.push(message);
  });
  try {
    await command.run(args);
  } finally {
    log.mockRestore();
  }
  return JSON.parse(writes.join("")) as { ok: true; result: Record<string, unknown> };
}

async function startTownFocusTunerServer(): Promise<FakeTunerServer> {
  let focusChanged = false;
  let reviewCleared = false;
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes("Network.isInSession")) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes("evalOk") && message.includes("GameplayMap.getGridWidth")) {
        return [JSON.stringify(tunerHealthSnapshot())];
      }
      if (message.includes("return JSON.stringify(checkTownFocusChange")) {
        return [
          JSON.stringify({
            valid: true,
            result: { Success: true },
            snapshot: townFocusSnapshot({
              selected: focusChanged,
              reviewCleared,
            }),
          }),
        ];
      }
      if (message.includes("return JSON.stringify(sendTownFocusChangeEnvelope")) {
        const before = townFocusSnapshot({ selected: focusChanged, reviewCleared });
        focusChanged = true;
        return [
          JSON.stringify({
            ok: true,
            value: {
              sent: true,
              validation: { valid: true, result: { Success: true } },
              before,
              after: townFocusSnapshot({ selected: focusChanged, reviewCleared }),
            },
          }),
        ];
      }
      if (message.includes("return JSON.stringify(checkTownFocusReview")) {
        return [
          JSON.stringify({
            snapshot: townFocusSnapshot({ selected: focusChanged, reviewCleared }),
          }),
        ];
      }
      if (message.includes("return JSON.stringify(sendTownFocusReviewEnvelope")) {
        const before = townFocusSnapshot({ selected: focusChanged, reviewCleared });
        reviewCleared = true;
        return [
          JSON.stringify({
            ok: true,
            value: {
              sent: true,
              before,
              after: townFocusSnapshot({ selected: focusChanged, reviewCleared }),
            },
          }),
        ];
      }
      return undefined;
    },
  });
}

function townFocusSnapshot(options: { selected: boolean; reviewCleared: boolean }) {
  return {
    cityId,
    city: {
      ok: true,
      value: {
        observedCityId: cityId,
        owner: cityId.owner,
        isTown: true,
        growthType: options.selected ? growthType : 10,
        projectType: options.selected ? projectType : 20,
      },
    },
    blocker: { ok: true, value: options.reviewCleared ? 0 : 1_234 },
    blockingTownFocusNotification: {
      ok: true,
      value: options.reviewCleared
        ? null
        : {
            id: { owner: 0, id: 42, type: 20 },
            type: 1_234,
            typeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
            target: cityId,
          },
    },
  };
}

function townFocusChangeArgs(server: FakeTunerServer): string[] {
  return [
    "--host",
    "127.0.0.1",
    "--port",
    String(server.address().port),
    "--city-id",
    JSON.stringify(cityId),
    "--growth-type",
    String(growthType),
    "--project-type",
    String(projectType),
  ];
}

function townFocusReviewArgs(server: FakeTunerServer): string[] {
  return [
    "--host",
    "127.0.0.1",
    "--port",
    String(server.address().port),
    "--city-id",
    JSON.stringify(cityId),
  ];
}

function townFocusCalls(messages: ReadonlyArray<string>, helper: string): string[] {
  return messages.filter((message) => message.includes(`return JSON.stringify(${helper}`));
}

function expectNoGenericTownFocusWire(messages: ReadonlyArray<string>): void {
  expect(messages.some((message) => message.includes("validateOperation("))).toBe(false);
  expect(messages.some((message) => message.includes("sendOperation("))).toBe(false);
}

function expectSemanticTownFocusOmitsRawRuntimeDetails(result: unknown) {
  const json = JSON.stringify(result);
  expect(json).not.toContain('"operation"');
  expect(json).not.toContain('"before"');
  expect(json).not.toContain('"after"');
  expect(json).not.toContain('"snapshot"');
  expect(json).not.toContain("Game.CityCommands");
  expect(json).not.toContain("Game.CityOperations");
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
      turn: 42,
      age: 0,
      maxTurns: 0,
      turnDate: { ok: true, value: "3550 BCE" },
      hash: { ok: true, value: 0 },
    },
    ui: {
      inGame: { ok: true, value: true },
      inShell: { ok: true, value: false },
      inLoading: { ok: true, value: false },
      loadingState: { ok: true, value: 6 },
      loadingStateName: "WaitingForUIReady",
      canBeginGame: { ok: true, value: false },
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
    turn: { ok: true, value: 42 },
    turnDate: { ok: true, value: "3550 BCE" },
    width: { ok: true, value: 84 },
    height: { ok: true, value: 54 },
    aliveIds: { ok: true, value: [0] },
    aliveHumanIds: { ok: true, value: [0] },
    autoplayActive: { ok: true, value: false },
  };
}
