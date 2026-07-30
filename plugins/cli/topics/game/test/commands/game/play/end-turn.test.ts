import { describe, expect, test, vi } from "vitest";

import GamePlayEndTurn from "../../../../src/commands/game/play/end-turn";
import { type FakeTunerServer, startFakeTunerServer } from "../../../support/tuner-socket-server";

describe("game play end-turn command", () => {
  test("checks native availability through turn.complete.check without dispatching", async () => {
    const server = await startEndTurnTunerServer();
    try {
      const payload = await runGamePlayEndTurnJson(endpointArgs(server));

      expect(payload.result).toEqual({ available: true });
      expect(
        server.received.some((message) =>
          message.includes("return JSON.stringify(checkTurnCompletion())")
        )
      ).toBe(true);
      expect(
        server.received.some((message) =>
          message.includes("return JSON.stringify(sendTurnCompletionEnvelope(")
        )
      ).toBe(false);
      expect(
        server.received.some((message) => message.includes("GameContext.sendTurnComplete"))
      ).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("reports unavailable native evidence through the service check", async () => {
    const server = await startEndTurnTunerServer({ canEndTurn: false });
    try {
      const payload = await runGamePlayEndTurnJson(endpointArgs(server));

      expect(payload.result).toEqual({ available: false });
      expect(
        server.received.some((message) =>
          message.includes("return JSON.stringify(sendTurnCompletionEnvelope(")
        )
      ).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("requests end turn through turn.complete.request only when --send is explicit", async () => {
    const server = await startEndTurnTunerServer();
    try {
      const payload = await runGamePlayEndTurnJson([...endpointArgs(server), "--send"]);

      expect(
        server.received.some((message) =>
          message.includes("return JSON.stringify(checkTurnCompletion())")
        )
      ).toBe(true);
      const sendMessage = server.received.find((message) =>
        message.includes("return JSON.stringify(sendTurnCompletionEnvelope(")
      );
      expect(sendMessage).toContain('"expected":');
      expect(
        server.received.some((message) => message.includes("GameContext.sendTurnComplete"))
      ).toBe(false);
      expect(payload.result).toMatchObject({
        status: "sent-confirmed",
        postcondition: {
          classification: "turn-advanced",
          outcome: "cleared",
          confidence: "confirmed",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
        nextSteps: [
          {
            kind: "refresh-attention",
            source: "turn.complete.request",
          },
        ],
      });
      expectSemanticTurnResult(payload.result);
    } finally {
      await server.close();
    }
  });

  test("keeps a blocked service request not-sent without invoking the native send atom", async () => {
    const server = await startEndTurnTunerServer({ canEndTurn: false });
    try {
      const payload = await runGamePlayEndTurnJson([...endpointArgs(server), "--send"]);

      expect(payload.result).toMatchObject({
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
            kind: "inspect-turn-completion",
            source: "turn.complete.request",
          },
        ],
      });
      expect(
        server.received.some((message) =>
          message.includes("return JSON.stringify(sendTurnCompletionEnvelope(")
        )
      ).toBe(false);
      expectSemanticTurnResult(payload.result);
    } finally {
      await server.close();
    }
  });
});

async function runGamePlayEndTurnJson(
  args: string[]
): Promise<{ ok: true; result: Record<string, unknown> }> {
  const writes: string[] = [];
  const log = vi.spyOn(GamePlayEndTurn.prototype, "log").mockImplementation((message?: string) => {
    if (message) writes.push(message);
  });
  try {
    await GamePlayEndTurn.run([...args, "--json"]);
    return JSON.parse(writes.join("")) as { ok: true; result: Record<string, unknown> };
  } finally {
    log.mockRestore();
  }
}

function endpointArgs(server: FakeTunerServer): string[] {
  return ["--host", "127.0.0.1", "--port", String(server.address().port)];
}

async function startEndTurnTunerServer(
  options: Readonly<{ canEndTurn?: boolean }> = {}
): Promise<FakeTunerServer> {
  let turn = 80;
  let hasSentTurnComplete = false;
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes("Network.isInSession")) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes("evalOk") && message.includes("GameplayMap.getGridWidth")) {
        return [JSON.stringify(tunerHealthSnapshot())];
      }
      if (message.includes("return JSON.stringify(sendTurnCompletionEnvelope(")) {
        const before = turnCompletionSnapshot({
          turn,
          hasSentTurnComplete,
          canEndTurn: options.canEndTurn ?? true,
        });
        turn += 1;
        hasSentTurnComplete = true;
        return [
          JSON.stringify({
            ok: true,
            value: {
              sent: true,
              before,
              after: turnCompletionSnapshot({
                turn,
                hasSentTurnComplete,
                canEndTurn: options.canEndTurn ?? true,
              }),
            },
          }),
        ];
      }
      if (message.includes("return JSON.stringify(checkTurnCompletion())")) {
        return [
          JSON.stringify({
            snapshot: turnCompletionSnapshot({
              turn,
              hasSentTurnComplete,
              canEndTurn: options.canEndTurn ?? true,
            }),
          }),
        ];
      }
      return undefined;
    },
  });
}

function turnCompletionSnapshot(input: {
  turn: number;
  hasSentTurnComplete: boolean;
  canEndTurn: boolean;
}) {
  return {
    localPlayerId: 0,
    turn: { ok: true, value: input.turn },
    hasSentTurnComplete: { ok: true, value: input.hasSentTurnComplete },
    canEndTurn: { ok: true, value: input.canEndTurn },
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
      turn: 80,
      age: 0,
      maxTurns: 0,
      turnDate: { ok: true, value: "2025 BCE" },
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
    turn: { ok: true, value: 80 },
    turnDate: { ok: true, value: "2025 BCE" },
    width: { ok: true, value: 84 },
    height: { ok: true, value: 54 },
    aliveIds: { ok: true, value: [0] },
    aliveHumanIds: { ok: true, value: [0] },
    autoplayActive: { ok: true, value: false },
  };
}

function expectSemanticTurnResult(result: Record<string, unknown>): void {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"snapshot"');
  expect(serialized).not.toContain('"before"');
  expect(serialized).not.toContain('"after"');
  expect(serialized).not.toContain("GameContext");
  expect(serialized).not.toContain("sendEndTurn");
}
