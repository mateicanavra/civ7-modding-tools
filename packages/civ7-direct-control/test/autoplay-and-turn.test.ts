import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7TurnCompletionStatusInputSchema,
  Civ7TurnCompletionStatusResultSchema,
  configureCiv7Autoplay,
  getCiv7AutoplayStatus,
  getCiv7TurnCompletionStatus,
  requestCiv7TurnComplete,
  sendCiv7TurnComplete,
  sendCiv7TurnUnready,
  startCiv7Autoplay,
  stopCiv7Autoplay,
} from "../src/index";

type FakeTunerServer = {
  received: string[];
  address(): AddressInfo;
  close(): Promise<void>;
};

describe("Civ7 autoplay and turn completion", () => {
  test("exports turn-completion status schemas with context-owned input", () => {
    expect(Value.Check(Civ7TurnCompletionStatusInputSchema, {})).toBe(true);
    expect(Value.Check(Civ7TurnCompletionStatusInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7TurnCompletionStatusInputSchema, { port: 4318 })).toBe(false);
    expect(Value.Check(Civ7TurnCompletionStatusInputSchema, { state: { role: "app-ui" } })).toBe(
      false
    );
    expect(
      Value.Check(Civ7TurnCompletionStatusInputSchema, {
        rawCommand: "GameContext.sendTurnComplete()",
      })
    ).toBe(false);

    const status = turnCompletionStatusResult();
    expect(Value.Check(Civ7TurnCompletionStatusResultSchema, status)).toBe(true);
    expect(
      Value.Check(Civ7TurnCompletionStatusResultSchema, {
        ...status,
        command: "GameContext.sendTurnComplete()",
      })
    ).toBe(false);
  });

  test("returns guard-blocked turn completion requests without sending", async () => {
    const calls: string[] = [];
    const blockedStatus = turnCompletionStatusResult({
      canEndTurn: { ok: true, value: false },
    });
    const dependencies = {
      executeAppUiCommand: async (options: { command: string }) => {
        calls.push(options.command);
        return commandResult();
      },
      getPlayNotificationView: async () => ({
        notifications: [
          {
            isEndTurnBlocking: true,
            typeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
            canUserDismiss: false,
            decision: { category: "town-focus" },
          },
        ],
      }),
      parseTurnCompletionStatus: () => blockedStatus,
    };

    const request = await requestCiv7TurnComplete({}, dependencies as never);

    expect(request).toMatchObject({
      sent: false,
      reason: "turn-completion-blocked",
      before: {
        canEndTurn: { ok: true, value: false },
      },
    });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toContain("GameContext.hasSentTurnComplete");
    expect(calls).not.toContain("GameContext.sendTurnComplete()");
    await expect(sendCiv7TurnComplete({}, dependencies as never)).rejects.toMatchObject({
      code: "command-failed",
    });
  });

  test("returns sent turn completion request results after command execution", async () => {
    const calls: string[] = [];
    const statuses = [
      turnCompletionStatusResult(),
      turnCompletionStatusResult({
        turn: { ok: true, value: 13 },
        hasSentTurnComplete: { ok: true, value: true },
      }),
    ];
    const dependencies = {
      executeAppUiCommand: async (options: { command: string }) => {
        calls.push(options.command);
        return commandResult();
      },
      getPlayNotificationView: async () => ({ notifications: [] }),
      parseTurnCompletionStatus: () => statuses.shift() ?? turnCompletionStatusResult(),
    };

    const request = await requestCiv7TurnComplete({}, dependencies as never);

    expect(request).toMatchObject({
      sent: true,
      verified: true,
      before: {
        turn: { ok: true, value: 12 },
      },
      after: {
        turn: { ok: true, value: 13 },
      },
    });
    expect(calls.some((command) => command.includes("GameContext.hasSentTurnComplete"))).toBe(true);
    expect(calls).toContain("GameContext.sendTurnComplete()");
  });

  test("routes autoplay configure and explicit unbounded start through App UI commands", async () => {
    const server = await startAutoplayTurnTunerServer();
    try {
      const { port } = server.address();
      const endpoint = { host: "127.0.0.1", port, timeoutMs: 1_000, pollIntervalMs: 5 };
      const status = await getCiv7AutoplayStatus(endpoint);

      const configure = await configureCiv7Autoplay({
        ...endpoint,
        turns: 4,
        observeAsPlayer: 2,
        returnAsPlayer: 0,
        pause: true,
      });
      const start = await startCiv7Autoplay(endpoint);

      expect(configure).toMatchObject({
        state: { id: "65535", name: "App UI" },
        verified: true,
        after: {
          autoplay: {
            turns: 4,
            observeAsPlayer: 2,
            returnAsPlayer: 0,
            isPaused: true,
          },
        },
      });
      expect(start).toMatchObject({
        state: { id: "65535", name: "App UI" },
        verified: true,
        after: {
          autoplay: {
            isActive: true,
            turns: 4,
            isPaused: false,
            observeAsPlayer: 0,
            returnAsPlayer: 0,
          },
        },
      });
      expect(status).toMatchObject({
        state: { id: "65535", name: "App UI" },
        autoplay: {
          isActive: false,
          turns: -1,
        },
        gameContext: {
          localPlayerID: 0,
        },
      });
      expect(start.commands[0]?.output[0]).toContain('"isActive":true');

      const appUiCommands = server.received.filter((message) => message.startsWith("CMD:65535:"));
      expect(appUiCommands.some((message) => message.includes("Autoplay.setTurns(4)"))).toBe(true);
      expect(
        appUiCommands.some((message) => message.includes("Autoplay.setObserveAsPlayer(2)"))
      ).toBe(true);
      expect(appUiCommands.some((message) => message.includes("Autoplay.setPause(true)"))).toBe(
        true
      );
      expect(appUiCommands.some((message) => message.includes("Autoplay.setActive(true)"))).toBe(
        true
      );
      expect(
        appUiCommands.some(
          (message) =>
            message.includes("Autoplay.setTurns(") && message.includes("Autoplay.setActive(true)")
        )
      ).toBe(false);
      expect(server.received.some((message) => message.startsWith("CMD:1:"))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("keeps native pause enabled while waiting for autoplay stop to settle", async () => {
    const server = await startAutoplayTurnTunerServer({ activeAutoplay: true });
    try {
      const { port } = server.address();
      const result = await stopCiv7Autoplay({
        host: "127.0.0.1",
        port,
        timeoutMs: 1_000,
        pollIntervalMs: 5,
        stabilityWindowMs: 5,
      });

      expect(result).toMatchObject({
        state: { id: "65535", name: "App UI" },
        verified: true,
        before: {
          autoplay: {
            isActive: true,
            isPaused: false,
          },
        },
        after: {
          autoplay: {
            isActive: false,
            isPaused: true,
            isPausedOrPending: true,
          },
          game: {
            turn: 12,
          },
          gameContext: {
            localPlayerID: 0,
          },
        },
      });
      expect(result.commands[0]?.output[0]).toContain('"isPaused":true');
      expect(server.received.some((message) => message.includes("Autoplay.setPause(true)"))).toBe(
        true
      );
      expect(server.received.some((message) => message.includes("Autoplay.setActive(false)"))).toBe(
        true
      );
    } finally {
      await server.close();
    }
  });

  test("returns turn-completion status and action result shapes from App UI", async () => {
    const server = await startAutoplayTurnTunerServer();
    try {
      const { port } = server.address();
      const endpoint = { host: "127.0.0.1", port, timeoutMs: 1_000 };

      const status = await getCiv7TurnCompletionStatus(endpoint);
      const complete = await sendCiv7TurnComplete(endpoint);
      const unready = await sendCiv7TurnUnready(endpoint);

      expect(status).toMatchObject({
        host: "127.0.0.1",
        port,
        state: { id: "65535", name: "App UI" },
        localPlayerId: 0,
        turn: { ok: true, value: 12 },
        turnDate: { ok: true, value: "3990 BCE" },
        hasSentTurnComplete: { ok: true, value: false },
        canEndTurn: { ok: true, value: true },
        blocker: { ok: true, value: 0 },
        firstReadyUnitId: { ok: true, value: null },
      });
      expect(complete).toMatchObject({
        verified: true,
        before: {
          hasSentTurnComplete: { ok: true, value: false },
          canEndTurn: { ok: true, value: true },
        },
        after: {
          hasSentTurnComplete: { ok: true, value: true },
        },
        command: {
          state: { id: "65535", name: "App UI" },
          output: ["null"],
        },
      });
      expect(unready).toMatchObject({
        verified: true,
        before: {
          hasSentTurnComplete: { ok: true, value: true },
        },
        after: {
          hasSentTurnComplete: { ok: true, value: false },
        },
        command: {
          state: { id: "65535", name: "App UI" },
          output: ["null"],
        },
      });
      expect(server.received).toContain("CMD:65535:GameContext.sendTurnComplete()");
      expect(server.received).toContain("CMD:65535:GameContext.sendUnreadyTurn()");
      expect(server.received.some((message) => message.startsWith("CMD:1:"))).toBe(false);
    } finally {
      await server.close();
    }
  });
});

function commandResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    output: ["null"],
  };
}

function turnCompletionStatusResult(overrides: Record<string, unknown> = {}) {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    turn: { ok: true as const, value: 12 },
    turnDate: { ok: true as const, value: "3990 BCE" },
    hasSentTurnComplete: { ok: true as const, value: false },
    canEndTurn: { ok: true as const, value: true },
    blocker: { ok: true as const, value: 0 },
    firstReadyUnitId: { ok: true as const, value: null },
    ...overrides,
  };
}

async function startAutoplayTurnTunerServer(
  options: { activeAutoplay?: boolean } = {}
): Promise<FakeTunerServer> {
  const received: string[] = [];
  let autoplayActive = options.activeAutoplay === true;
  let autoplayTurns = -1;
  let autoplayPaused = false;
  let observeAsPlayer = -1;
  let returnAsPlayer = -1;
  let stopPendingSnapshots = 0;
  let hasSentTurnComplete = false;
  let turn = 12;

  const server = createServer((socket) => {
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const frame = parseRequest(buffer);
        if (!frame) return;
        buffer = buffer.subarray(frame.bytesRead);
        received.push(frame.message);

        if (frame.message === "LSQ:") {
          socket.write(encodeResponse(frame.listenerId, ["65535", "App UI", "1", "Tuner"]));
        } else if (frame.message.includes("Network.isInSession")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(appUiSnapshot())]));
        } else if (frame.message.includes("Autoplay.") && frame.message.startsWith("CMD:65535:")) {
          applyAutoplayCommand(frame.message);
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                ok: true,
                isActive: autoplayActive || stopPendingSnapshots > 0,
                turns: autoplayTurns,
                isPaused: autoplayPaused,
                isPausedOrPending: autoplayPaused,
              }),
            ])
          );
        } else if (frame.message.includes("GameContext.hasSentTurnComplete")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(turnCompletionStatus())]));
        } else if (frame.message === "CMD:65535:GameContext.sendTurnComplete()") {
          hasSentTurnComplete = true;
          turn += 1;
          socket.write(encodeResponse(frame.listenerId, ["null"]));
        } else if (frame.message === "CMD:65535:GameContext.sendUnreadyTurn()") {
          hasSentTurnComplete = false;
          socket.write(encodeResponse(frame.listenerId, ["null"]));
        } else {
          socket.write(encodeResponse(frame.listenerId, ["null"]));
        }
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => resolve());
    server.on("error", reject);
  });

  return {
    received,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };

  function applyAutoplayCommand(message: string) {
    const turns = numberArgument(message, "Autoplay.setTurns");
    if (turns !== undefined) autoplayTurns = turns;
    const observe = numberArgument(message, "Autoplay.setObserveAsPlayer");
    if (observe !== undefined) observeAsPlayer = observe;
    const returnAs = numberArgument(message, "Autoplay.setReturnAsPlayer");
    if (returnAs !== undefined) returnAsPlayer = returnAs;
    const pause = booleanArgument(message, "Autoplay.setPause");
    if (pause !== undefined) autoplayPaused = pause;
    if (message.includes("Autoplay.setActive(true)")) autoplayActive = true;
    if (message.includes("Autoplay.setActive(false)")) {
      stopPendingSnapshots = 1;
      autoplayPaused = true;
    }
  }

  function appUiSnapshot() {
    const settling = stopPendingSnapshots > 0;
    if (settling) {
      stopPendingSnapshots -= 1;
      if (stopPendingSnapshots === 0) autoplayActive = false;
    }
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
        isActive: settling ? true : autoplayActive,
        turns: autoplayTurns,
        isPaused: autoplayPaused,
        isPausedOrPending: autoplayPaused,
        observeAsPlayer,
        returnAsPlayer,
      },
      game: {
        turn,
        age: 0,
        maxTurns: 0,
        turnDate: { ok: true, value: "3990 BCE" },
        hash: { ok: true, value: 12345 },
      },
      ui: {
        inGame: { ok: true, value: true },
        inShell: { ok: true, value: false },
        inLoading: { ok: true, value: false },
        loadingState: { ok: true, value: 8 },
        loadingStateName: "GameStarted",
        canBeginGame: { ok: true, value: false },
        canNotifyUIReady: "function",
        skipStartButton: { ok: true, value: false },
        automationActive: { ok: true, value: false },
        activeInputContext: { ok: true, value: 4 },
        activeInputContextName: "World",
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
        randomSeed: { ok: true, value: 111 },
      },
    };
  }

  function turnCompletionStatus() {
    return {
      localPlayerId: 0,
      turn: { ok: true, value: turn },
      turnDate: { ok: true, value: "3990 BCE" },
      hasSentTurnComplete: { ok: true, value: hasSentTurnComplete },
      canEndTurn: { ok: true, value: true },
      blocker: { ok: true, value: 0 },
      firstReadyUnitId: { ok: true, value: null },
    };
  }
}

function numberArgument(message: string, functionName: string): number | undefined {
  const match = message.match(new RegExp(`${escapeRegExp(functionName)}\\((-?\\d+)\\)`));
  return match ? Number(match[1]) : undefined;
}

function booleanArgument(message: string, functionName: string): boolean | undefined {
  const match = message.match(new RegExp(`${escapeRegExp(functionName)}\\((true|false)\\)`));
  if (!match) return undefined;
  return match[1] === "true";
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseRequest(buffer: Buffer): {
  listenerId: number;
  message: string;
  bytesRead: number;
} | null {
  if (buffer.length < 8) return null;
  const messageLength = buffer.readUInt32LE(0);
  const bytesRead = 8 + messageLength;
  if (buffer.length < bytesRead) return null;
  return {
    listenerId: buffer.readUInt32LE(4),
    message: buffer.subarray(8, bytesRead).toString("utf8").replace(/\0$/, ""),
    bytesRead,
  };
}

function encodeResponse(listenerId: number, parts: string[]): Buffer {
  const messageBytes = Buffer.from(`${parts.join("\0")}\0`, "utf8");
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}
