import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";

import {
  configureCiv7Autoplay,
  getCiv7AutoplayStatus,
  startCiv7Autoplay,
  stopCiv7Autoplay,
} from "../src/index";

type FakeTunerServer = {
  received: string[];
  address(): AddressInfo;
  close(): Promise<void>;
};

describe("Civ7 autoplay", () => {
  test("routes autoplay configure and explicit unbounded start through App UI commands", async () => {
    const server = await startAutoplayTunerServer();
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
    const server = await startAutoplayTunerServer({ activeAutoplay: true });
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
});

async function startAutoplayTunerServer(
  options: { activeAutoplay?: boolean } = {}
): Promise<FakeTunerServer> {
  const received: string[] = [];
  let autoplayActive = options.activeAutoplay === true;
  let autoplayTurns = -1;
  let autoplayPaused = false;
  let observeAsPlayer = -1;
  let returnAsPlayer = -1;
  let stopPendingSnapshots = 0;
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
