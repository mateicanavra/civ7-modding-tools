import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";
import {
  beginCiv7Game,
  CIV7_BEGIN_GAME_COMMAND,
  CIV7_RESTART_COMMAND,
  Civ7DirectControlError,
  restartCiv7Game,
  restartCiv7GameAndBegin,
  waitForCiv7TunerReady,
} from "../src/index";

describe("Civ7 restart lifecycle", () => {
  test("restarts, begins, and waits for Tuner readiness through one session", async () => {
    const server = await startRestartLifecycleServer();
    try {
      const { port } = server.address();
      const result = await restartCiv7GameAndBegin({
        host: "127.0.0.1",
        port,
        waitForTuner: true,
        timeoutMs: 1_000,
        waitTimeoutMs: 5_000,
        pollIntervalMs: 10,
      });

      expect(result.restart.output).toEqual(["true"]);
      expect(result.begin?.output).toEqual([
        JSON.stringify({ status: "performed", loadingState: 6 }),
      ]);
      expect(result.finalAppUi.snapshot.ui.loadingState).toEqual({ ok: true, value: 8 });
      expect(result.tunerHealth?.ready).toBe(true);
      expect(server.received).toContain(`CMD:65535:${CIV7_RESTART_COMMAND}`);
      expect(
        server.received.some(
          (message) =>
            message.startsWith("CMD:65535:(() =>") && message.includes(CIV7_BEGIN_GAME_COMMAND)
        )
      ).toBe(true);
      expect(server.notifyCount()).toBe(1);
      expect(server.received.some((message) => message.startsWith("CMD:1:(() =>"))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test("does not admit malformed truthy in-game probe evidence", async () => {
    const server = await startRestartLifecycleServer({ malformedInGameProbe: true });
    try {
      const { port } = server.address();
      await expect(
        restartCiv7GameAndBegin({
          host: "127.0.0.1",
          port,
          timeoutMs: 100,
          waitTimeoutMs: 100,
          pollIntervalMs: 10,
        })
      ).rejects.toMatchObject({ code: "connection-timeout" });
      expect(server.notifyCount()).toBe(1);
    } finally {
      await server.close();
    }
  });

  test("waits for Tuner readiness through the public wrapper", async () => {
    const server = await startRestartLifecycleServer();
    try {
      const { port } = server.address();
      const health = await waitForCiv7TunerReady({
        host: "127.0.0.1",
        port,
        timeoutMs: 1_000,
        waitTimeoutMs: 1_000,
        pollIntervalMs: 10,
      });

      expect(health.ready).toBe(true);
      expect(health.state).toEqual({ id: "1", name: "Tuner" });
      expect(server.received.some((message) => message.startsWith("CMD:1:(() =>"))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test("rejects restart output that does not confirm true", async () => {
    const server = await startRestartLifecycleServer({ restartOutput: "false" });
    try {
      const { port } = server.address();
      await expect(
        restartCiv7Game({
          host: "127.0.0.1",
          port,
          timeoutMs: 1_000,
        })
      ).rejects.toBeInstanceOf(Civ7DirectControlError);
    } finally {
      await server.close();
    }
  });

  test.each([
    6, 7,
  ] as const)("begins exactly once from admitted loading state %s", async (state) => {
    const server = await startRestartLifecycleServer({ initialLoadingState: state });
    try {
      const { port } = server.address();
      await expect(
        beginCiv7Game({ host: "127.0.0.1", port, timeoutMs: 1_000 })
      ).resolves.toMatchObject({ accepted: true, loadingState: state });
      expect(server.notifyCount()).toBe(1);
    } finally {
      await server.close();
    }
  });

  test.each([
    0, 8,
  ] as const)("refuses non-begin loading state %s without notifying", async (state) => {
    const server = await startRestartLifecycleServer({ initialLoadingState: state });
    try {
      const { port } = server.address();
      await expect(
        beginCiv7Game({ host: "127.0.0.1", port, timeoutMs: 1_000 })
      ).resolves.toMatchObject({
        accepted: false,
        loadingState: state,
        reason: "loading-state",
      });
      expect(server.notifyCount()).toBe(0);
    } finally {
      await server.close();
    }
  });
});

async function startRestartLifecycleServer(
  options: {
    initialLoadingState?: number;
    malformedInGameProbe?: boolean;
    restartOutput?: string;
    tunerReady?: boolean;
  } = {}
) {
  const received: string[] = [];
  let loadingState = options.initialLoadingState ?? 6;
  let inShell = true;
  let notifyCount = 0;
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
          inShell = false;
          socket.write(encodeResponse(frame.listenerId, [options.restartOutput ?? "true"]));
        } else if (
          frame.message.startsWith("CMD:65535:(() =>") &&
          frame.message.includes(CIV7_BEGIN_GAME_COMMAND)
        ) {
          if (loadingState === 6 || loadingState === 7) {
            const before = loadingState;
            notifyCount += 1;
            loadingState = 8;
            inShell = false;
            socket.write(
              encodeResponse(frame.listenerId, [
                JSON.stringify({ status: "performed", loadingState: before }),
              ])
            );
          } else {
            socket.write(
              encodeResponse(frame.listenerId, [
                JSON.stringify({ status: "refused", loadingState, reason: "loading-state" }),
              ])
            );
          }
        } else if (frame.message.includes("Network.isInSession")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify(
                appUiSnapshot({
                  inShell,
                  loadingState,
                  malformedInGameProbe: options.malformedInGameProbe === true,
                })
              ),
            ])
          );
        } else if (frame.message.includes("evalOk: 1 + 1")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify(tunerHealth({ ready: options.tunerReady !== false })),
            ])
          );
        } else {
          socket.write(encodeResponse(frame.listenerId, ["2"]));
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    received,
    notifyCount: () => notifyCount,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function appUiSnapshot({
  inShell,
  loadingState,
  malformedInGameProbe,
}: {
  inShell: boolean;
  loadingState: number;
  malformedInGameProbe: boolean;
}) {
  return {
    network: {
      isInSession: { ok: true, value: !inShell },
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
      inGame: malformedInGameProbe
        ? { ok: "true", value: !inShell }
        : { ok: true, value: !inShell },
      inShell: { ok: true, value: inShell },
      inLoading: { ok: true, value: loadingState !== 8 && !inShell },
      loadingState: { ok: true, value: loadingState },
      loadingStateName: loadingState === 8 ? "GameStarted" : "WaitingForUIReady",
      canBeginGame: { ok: true, value: loadingState === 6 && !inShell },
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

function tunerHealth({ ready }: { ready: boolean }) {
  return {
    evalOk: 2,
    ready,
    globals: {
      Game: ready ? "object" : "undefined",
      Autoplay: "object",
      GameplayMap: ready ? "object" : "undefined",
      Players: ready ? "object" : "undefined",
      Network: "undefined",
    },
    turn: { ok: true, value: 1 },
    turnDate: { ok: true, value: "4000 BCE" },
    width: ready ? { ok: true, value: 84 } : { ok: false, error: "GameplayMap unavailable" },
    height: ready ? { ok: true, value: 54 } : { ok: false, error: "GameplayMap unavailable" },
    aliveIds: ready ? { ok: true, value: [0, 1] } : { ok: false, error: "Players unavailable" },
    aliveHumanIds: ready ? { ok: true, value: [0] } : { ok: false, error: "Players unavailable" },
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
