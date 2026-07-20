import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { CIV7_RESTART_COMMAND } from "@civ7/direct-control";
import { describe, expect, test, vi } from "vitest";
import GameRestart from "../../src/commands/game/restart";

describe("game restart command", () => {
  test("requests direct socket restart by default", async () => {
    const received: string[] = [];
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
          } else if (frame.message === `CMD:65535:${CIV7_RESTART_COMMAND}`) {
            socket.write(encodeResponse(frame.listenerId, ["true"]));
          }
        }
      });
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));

    try {
      const { port } = server.address() as AddressInfo;
      await GameRestart.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--request-id",
        "codex-cli-direct-test",
        "--agent",
        "Codex",
        "--json",
      ]);

      expect(received).toEqual(["LSQ:", `CMD:65535:${CIV7_RESTART_COMMAND}`]);
    } finally {
      server.close();
      await once(server, "close");
    }
  });

  test("can follow restart with native begin and tuner readiness", async () => {
    const received: string[] = [];
    let loadingState = 6;
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
          } else if (frame.message === `CMD:65535:${CIV7_RESTART_COMMAND}`) {
            loadingState = 6;
            socket.write(encodeResponse(frame.listenerId, ["true"]));
          } else if (
            frame.message.startsWith("CMD:65535:(() =>") &&
            frame.message.includes("UI.notifyUIReady()")
          ) {
            const beginLoadingState = loadingState;
            loadingState = 8;
            socket.write(
              encodeResponse(frame.listenerId, [
                JSON.stringify({ status: "performed", loadingState: beginLoadingState }),
              ])
            );
          } else if (frame.message.includes("Network.isInSession")) {
            socket.write(
              encodeResponse(frame.listenerId, [JSON.stringify(appUiSnapshot(loadingState))])
            );
          } else if (frame.message.includes("evalOk: 1 + 1")) {
            socket.write(encodeResponse(frame.listenerId, [JSON.stringify(tunerHealth())]));
          }
        }
      });
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));

    try {
      const { port } = server.address() as AddressInfo;
      await GameRestart.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--begin",
        "--wait-tuner",
        "--json",
      ]);

      expect(received).toContain(`CMD:65535:${CIV7_RESTART_COMMAND}`);
      expect(
        received.some(
          (message) =>
            message.startsWith("CMD:65535:(() =>") && message.includes("UI.notifyUIReady()")
        )
      ).toBe(true);
      expect(received.some((message) => message.startsWith("CMD:1:(() =>"))).toBe(true);
    } finally {
      server.close();
      await once(server, "close");
    }
  });

  test("dry-run validates direct config without sending", async () => {
    const writes: string[] = [];
    const log = vi.spyOn(GameRestart.prototype, "log").mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      await expect(
        GameRestart.run([
          "--host",
          "127.0.0.1",
          "--port",
          "4318",
          "--request-id",
          "codex-dry-run",
          "--agent",
          "Codex",
          "--dry-run",
          "--json",
        ])
      ).resolves.toBeUndefined();

      const payload = JSON.parse(writes.join("")) as {
        ok: true;
        dryRun: true;
        line: string;
        request: {
          requestId: string;
          agent: string;
          command: string;
          hosts: string[];
          port: number;
          state: string;
        };
      };
      expect(payload).toEqual({
        ok: true,
        dryRun: true,
        line: `DIRECT codex-dry-run AGENT=Codex HOSTS=127.0.0.1 PORT=4318 STATE=App UI RUN ${CIV7_RESTART_COMMAND}`,
        request: {
          requestId: "codex-dry-run",
          agent: "Codex",
          command: CIV7_RESTART_COMMAND,
          hosts: ["127.0.0.1"],
          port: 4318,
          state: "App UI",
        },
      });
    } finally {
      log.mockRestore();
    }
  });
});

function appUiSnapshot(loadingState: number) {
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
      inLoading: { ok: true, value: loadingState !== 8 },
      loadingState: { ok: true, value: loadingState },
      loadingStateName: loadingState === 8 ? "GameStarted" : "WaitingForUIReady",
      canBeginGame: { ok: true, value: loadingState === 6 },
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

function tunerHealth() {
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
