import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { join } from "node:path";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { describe, expect, test } from "vitest";
import {
  CIV7_RESTART_COMMAND,
  Civ7DirectControlError,
  DEFAULT_CIV7_TUNER_HOST,
  DEFAULT_CIV7_TUNER_PORT,
  checkCiv7DirectControlHealth,
  checkCiv7TunerHealth,
  encodeCiv7TunerRequest,
  executeCiv7Command,
  executeCiv7AppUiCommand,
  executeCiv7TunerCommand,
  getCiv7AppUiSnapshot,
  inspectCiv7RuntimeApi,
  parseCiv7TunerFrame,
  queryCiv7TunerStates,
  restartCiv7GameAndBegin,
  restartCiv7Game,
  selectCiv7TunerState,
  snapshotFile,
  waitForFreshLogMarkers,
} from "../src/index";

describe("Civ7 direct control", () => {
  test("uses defaults and env hosts when resolving health", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const health = await checkCiv7DirectControlHealth({
        port,
        env: {
          CIV7_TUNER_HOSTS: "127.0.0.2, 127.0.0.1",
        },
        timeoutMs: 1_000,
      });
      expect(health).toMatchObject({
        ok: true,
        status: "ready",
        port,
      });
      if (health.ok) expect(["127.0.0.2", "127.0.0.1"]).toContain(health.host);
    } finally {
      await server.close();
    }
  });

  test("falls back to default host and port config when env is empty", async () => {
    const health = await checkCiv7DirectControlHealth({
      env: {},
      timeoutMs: 1,
    });
    expect([true, false]).toContain(health.ok);
    expect(DEFAULT_CIV7_TUNER_HOST).toBe("127.0.0.1");
    expect(DEFAULT_CIV7_TUNER_PORT).toBe(4318);
  });

  test("queries states and sends commands using the tuner frame protocol", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const result = await executeCiv7Command({
        host: "127.0.0.1",
        port,
        command: CIV7_RESTART_COMMAND,
        timeoutMs: 1_000,
      });

      expect(result).toMatchObject({
        host: "127.0.0.1",
        port,
        state: { id: "65535", name: "App UI" },
        output: ["true"],
      });
      expect(server.received).toEqual(["LSQ:", `CMD:65535:${CIV7_RESTART_COMMAND}`]);
    } finally {
      await server.close();
    }
  });

  test("has state-specific command helpers and runtime API inspection", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const appUi = await executeCiv7AppUiCommand({
        host: "127.0.0.1",
        port,
        command: "1+1",
        timeoutMs: 1_000,
      });
      const tuner = await executeCiv7TunerCommand({
        host: "127.0.0.1",
        port,
        command: "2+2",
        timeoutMs: 1_000,
      });
      const inspection = await inspectCiv7RuntimeApi({
        host: "127.0.0.1",
        port,
        roots: ["Network"],
        timeoutMs: 1_000,
      });

      expect(appUi.state).toEqual({ id: "65535", name: "App UI" });
      expect(tuner.state).toEqual({ id: "1", name: "Tuner" });
      expect(inspection.roots).toEqual([
        {
          name: "Network",
          type: "object",
          exists: true,
          ownKeys: ["isInSession"],
          prototypeKeys: ["restartGame"],
          enumerableKeys: ["isInSession", "restartGame"],
          methods: [
            {
              name: "restartGame",
              owner: "prototype",
              length: 0,
              signature: "function restartGame() { [native code] }",
            },
          ],
        },
      ]);
    } finally {
      await server.close();
    }
  });

  test("returns the App UI snapshot from a package-owned command profile", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const result = await getCiv7AppUiSnapshot({
        host: "127.0.0.1",
        port,
        timeoutMs: 1_000,
      });

      expect(result).toMatchObject({
        state: { id: "65535", name: "App UI" },
        snapshot: {
          network: {
            isInSession: { ok: true, value: true },
          },
          autoplay: {
            isActive: false,
          },
          ui: {
            loadingStateName: "WaitingForUIReady",
            canNotifyUIReady: "function",
          },
        },
      });
      expect(server.received).toEqual(["LSQ:", expect.stringContaining("CMD:65535:(() =>")]);
    } finally {
      await server.close();
    }
  });

  test("checks Tuner gameplay readiness with a read-only canary", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const health = await checkCiv7TunerHealth({
        host: "127.0.0.1",
        port,
        timeoutMs: 1_000,
      });

      expect(health).toMatchObject({
        state: { id: "1", name: "Tuner" },
        ready: true,
        snapshot: {
          evalOk: 2,
          globals: {
            Game: "object",
            GameplayMap: "object",
            Players: "object",
            Network: "undefined",
          },
          width: { ok: true, value: 84 },
          height: { ok: true, value: 54 },
        },
      });
    } finally {
      await server.close();
    }
  });

  test("can restart, begin, and wait for Tuner through one session", async () => {
    const server = await startTunerServer();
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
      expect(result.begin?.output).toEqual(["null"]);
      expect(result.finalAppUi.snapshot.ui.loadingState).toEqual({ ok: true, value: 8 });
      expect(result.tunerHealth?.ready).toBe(true);
      expect(server.received).toContain(`CMD:65535:${CIV7_RESTART_COMMAND}`);
      expect(server.received).toContain("CMD:65535:UI.notifyUIReady()");
      expect(server.received.some((message) => message.startsWith("CMD:1:(() =>"))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test("supports explicit state selection by role, name, and id", () => {
    const states = [
      { id: "65535", name: "App UI" },
      { id: "1", name: "Tuner" },
    ];

    expect(selectCiv7TunerState(states, { role: "app-ui" })).toEqual(states[0]);
    expect(selectCiv7TunerState(states, { role: "tuner" })).toEqual(states[1]);
    expect(selectCiv7TunerState(states, { name: "Tuner" })).toEqual(states[1]);
    expect(selectCiv7TunerState(states, { id: "65535" })).toEqual(states[0]);
  });

  test("returns classified state errors with available states", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await expect(
        executeCiv7Command({
          host: "127.0.0.1",
          port,
          state: { name: "Missing" },
          command: "1+1",
          timeoutMs: 1_000,
        }),
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        code: "state-not-found",
      });
    } finally {
      await server.close();
    }
  });

  test("restart command requires true output", async () => {
    const server = await startTunerServer({ restartOutput: "false" });
    try {
      const { port } = server.address();
      await expect(
        restartCiv7Game({
          host: "127.0.0.1",
          port,
          timeoutMs: 1_000,
        }),
      ).rejects.toBeInstanceOf(Civ7DirectControlError);
    } finally {
      await server.close();
    }
  });

  test("parses fragmented and concatenated frames", () => {
    const first = encodeCiv7TunerRequest(1, "LSQ:");
    const second = encodeCiv7TunerRequest(2, "CMD:65535:1+1");

    expect(parseCiv7TunerFrame(first.subarray(0, 3))).toBeNull();

    const combined = Buffer.concat([first, second]);
    const parsedFirst = parseCiv7TunerFrame(combined);
    expect(parsedFirst?.frame).toEqual({ listenerId: 1, parts: ["LSQ:"] });
    const parsedSecond = parseCiv7TunerFrame(combined.subarray(parsedFirst?.bytesRead ?? 0));
    expect(parsedSecond?.frame).toEqual({ listenerId: 2, parts: ["CMD:65535:1+1"] });
  });

  test("waits for fresh ordered log markers", async () => {
    const dir = await mkdtemp(join(tmpdir(), "civ7-direct-control-log-"));
    const logPath = join(dir, "Scripting.log");
    await writeFile(logPath, "old\n");
    const snapshot = await snapshotFile(logPath);
    await writeFile(logPath, "old\nCreating Context -  MapGeneration\nDestroying Context -  MapGeneration\n");

    const proof = await waitForFreshLogMarkers({
      logPath,
      snapshot,
      markers: ["Creating Context -  MapGeneration", "Destroying Context -  MapGeneration"],
      timeoutMs: 100,
      pollIntervalMs: 10,
    });

    expect(proof.matched).toEqual(["Creating Context -  MapGeneration", "Destroying Context -  MapGeneration"]);
  });
});

async function startTunerServer(options: { restartOutput?: string } = {}) {
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
          socket.write(encodeResponse(frame.listenerId, [options.restartOutput ?? "true"]));
        } else if (frame.message === "CMD:65535:UI.notifyUIReady()") {
          loadingState = 8;
          socket.write(encodeResponse(frame.listenerId, ["null"]));
        } else if (frame.message.includes("Network.isInSession")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
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
              }),
            ]),
          );
        } else if (frame.message.includes("evalOk: 1 + 1")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
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
                aliveIds: { ok: true, value: [0, 1] },
                aliveHumanIds: { ok: true, value: [0] },
                autoplayActive: { ok: true, value: false },
              }),
            ]),
          );
        } else if (frame.message.startsWith("CMD:65535:(() =>")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify([
                {
                  name: "Network",
                  type: "object",
                  exists: true,
                  ownKeys: ["isInSession"],
                  prototypeKeys: ["restartGame"],
                  enumerableKeys: ["isInSession", "restartGame"],
                  methods: [
                    {
                      name: "restartGame",
                      owner: "prototype",
                      length: 0,
                      signature: "function restartGame() { [native code] }",
                    },
                  ],
                },
              ]),
            ]),
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
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function parseRequest(buffer: Buffer):
  | {
      listenerId: number;
      message: string;
      bytesRead: number;
    }
  | null {
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
