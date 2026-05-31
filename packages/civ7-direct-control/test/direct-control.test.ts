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
  canStartCiv7UnitOperation,
  configureCiv7Autoplay,
  encodeCiv7TunerRequest,
  executeCiv7Command,
  executeCiv7AppUiCommand,
  executeCiv7TunerCommand,
  getCiv7GameInfoRows,
  getCiv7MapGrid,
  getCiv7MapSummary,
  getCiv7PlotSnapshot,
  getCiv7PlayableStatus,
  getCiv7VisibilitySummary,
  getCiv7AppUiSnapshot,
  inspectCiv7RuntimeApi,
  parseCiv7TunerFrame,
  queryCiv7TunerStates,
  requestCiv7UnitOperation,
  revealCiv7MapForPlayer,
  restartCiv7GameAndBegin,
  restartCiv7Game,
  selectCiv7TunerState,
  snapshotFile,
  startCiv7Autoplay,
  stopCiv7Autoplay,
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

  test("reports playable status by composing App UI and Tuner readiness", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const status = await getCiv7PlayableStatus({
        host: "127.0.0.1",
        port,
        timeoutMs: 1_000,
      });

      expect(status).toMatchObject({
        playable: true,
        readiness: "tuner-ready",
        appUi: {
          state: { id: "65535", name: "App UI" },
        },
        tuner: {
          state: { id: "1", name: "Tuner" },
          ready: true,
        },
      });
    } finally {
      await server.close();
    }
  });

  test("wraps bounded Tuner map and plot reads", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const summary = await getCiv7MapSummary({
        host: "127.0.0.1",
        port,
        includeAreaRegionCounts: true,
        timeoutMs: 1_000,
      });
      const plot = await getCiv7PlotSnapshot(
        { x: 3, y: 4, playerId: 0, fields: ["terrain", "resource", "visibility"] },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );

      expect(summary.map.width).toEqual({ ok: true, value: 84 });
      expect(summary.areas?.areaIds).toEqual({ ok: true, value: [1, 2] });
      expect(plot).toMatchObject({
        state: { id: "1", name: "Tuner" },
        location: { x: 3, y: 4, index: { ok: true, value: 339 } },
        hiddenInfoPolicy: "visibility-filtered",
        facts: {
          terrain: { ok: true, value: 4 },
          resource: { ok: true, value: -1 },
        },
      });
    } finally {
      await server.close();
    }
  });

  test("caps bounded map grid iteration before Civ-side traversal", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const grid = await getCiv7MapGrid(
        {
          bounds: { x: 0, y: 0, width: 10_000, height: 10_000 },
          fields: ["terrain"],
          maxPlots: 1,
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );

      expect(grid.plotCount).toBe(100_000_000);
      expect(grid.omitted).toBe(99_999_999);
      expect(server.received.some((message) => message.includes("break outer"))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test("wraps visibility, reveal, and GameInfo reads with contracts", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const visibility = await getCiv7VisibilitySummary({
        playerId: 0,
        bounds: { x: 0, y: 0, width: 2, height: 1 },
        includeGrid: true,
      }, {
        host: "127.0.0.1",
        port,
        timeoutMs: 1_000,
      });
      const reveal = await revealCiv7MapForPlayer(
        { playerId: 0 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, disposableSession: true, reason: "test disposable reveal proof" },
      );
      const resources = await getCiv7GameInfoRows(
        { table: "Resources", limit: 2 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );

      expect(visibility.numPlotsRevealed).toEqual({ ok: true, value: 10 });
      expect(visibility.grid?.states).toHaveLength(2);
      expect(reveal.classification).toBe("revealed");
      expect(resources.rows).toEqual([{ ResourceType: "RESOURCE_COTTON" }]);
      await expect(
        getCiv7GameInfoRows({ table: "Resources;DROP" }, { host: "127.0.0.1", port, timeoutMs: 1_000 }),
      ).rejects.toMatchObject({ code: "command-failed" });
    } finally {
      await server.close();
    }
  });

  test("validates and sends approved unit operations without replay", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const unitId = { owner: 0, id: 65536, type: 26 };
      const validation = await canStartCiv7UnitOperation(
        { unitId, operationType: "SKIP_TURN" },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );
      const request = await requestCiv7UnitOperation(
        { unitId, operationType: "SKIP_TURN" },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test unit operation request" },
      );

      expect(validation).toMatchObject({
        family: "unit-operation",
        operationType: "SKIP_TURN",
        valid: true,
      });
      expect(request.sent).toBe(true);
      expect(server.received.filter((message) => message.includes("return JSON.stringify(sendOperation")).length).toBe(1);
    } finally {
      await server.close();
    }
  });

  test("requires approval for autoplay configure but allows explicit unbounded start", async () => {
    await expect(
      configureCiv7Autoplay({ turns: 1 }, undefined as never),
    ).rejects.toMatchObject({ code: "command-failed" });

    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const result = await startCiv7Autoplay(
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test explicit unbounded start" },
      );

      expect(result.verified).toBe(true);
      expect(result.commands[0]?.output[0]).toContain('"isActive":true');
      expect(server.received).toContain("LSQ:");
      expect(server.received.some((message) => message.includes("Autoplay.setReturnAsPlayer(0)"))).toBe(true);
      expect(server.received.some((message) => message.includes("Autoplay.setObserveAsPlayer(0)"))).toBe(true);
      expect(server.received.some((message) => message.includes("Autoplay.setPause(false)"))).toBe(true);
      expect(server.received.some((message) => message.includes("Autoplay.setActive(true)"))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test("waits for autoplay stop to settle and clears pause", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await startCiv7Autoplay(
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test autoplay stop setup" },
      );
      const result = await stopCiv7Autoplay(
        { host: "127.0.0.1", port, timeoutMs: 1_000, pollIntervalMs: 5, stabilityWindowMs: 5 },
        { approved: true, reason: "test autoplay stop" },
      );

      expect(result.verified).toBe(true);
      expect(result.commands[0]?.output[0]).toContain('"isActive":true');
      expect(result.after.autoplay.isActive).toBe(false);
      expect(result.after.autoplay.isPaused).toBe(true);
      expect(server.received.some((message) => message.includes("Autoplay.setPause(true)"))).toBe(true);
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
  let revealedCount = 10;
  let autoplayActive = false;
  let autoplayPaused = false;
  let autoplayStopPendingReads = 0;
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
        } else if (frame.message.includes("Autoplay.setActive(true)")) {
          autoplayActive = true;
          autoplayPaused = frame.message.includes("Autoplay.setPause(true)");
          socket.write(encodeResponse(frame.listenerId, ['{"ok":true,"isActive":true,"turns":-1}']));
        } else if (frame.message.includes("Autoplay.setActive(false)")) {
          autoplayStopPendingReads = 1;
          autoplayPaused = true;
          socket.write(encodeResponse(frame.listenerId, ['{"ok":true,"isActive":true,"turns":-1,"isPaused":true,"isPausedOrPending":true}']));
        } else if (frame.message.includes("Network.isInSession")) {
          const snapshotAutoplayActive = autoplayStopPendingReads > 0 ? true : autoplayActive;
          const snapshotAutoplayPaused = autoplayStopPendingReads > 0 ? true : autoplayPaused;
          if (autoplayStopPendingReads > 0) {
            autoplayStopPendingReads -= 1;
            if (autoplayStopPendingReads === 0) {
              autoplayActive = false;
            }
          }
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
                  isActive: snapshotAutoplayActive,
                  turns: -1,
                  isPaused: snapshotAutoplayPaused,
                  isPausedOrPending: snapshotAutoplayPaused,
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
        } else if (frame.message.includes("MapRegions") && frame.message.includes("randomSeed")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                map: {
                  width: { ok: true, value: 84 },
                  height: { ok: true, value: 54 },
                  plotCount: { ok: true, value: 4536 },
                  mapSize: { ok: true, value: 0 },
                  randomSeed: { ok: true, value: 1 },
                },
                game: {
                  turn: { ok: true, value: 1 },
                  age: { ok: true, value: 0 },
                  maxTurns: { ok: true, value: 0 },
                  turnDate: { ok: true, value: "4000 BCE" },
                  hash: { ok: true, value: 0 },
                },
                areas: {
                  areaIds: { ok: true, value: [1, 2] },
                  regionIds: { ok: true, value: [7] },
                  truncated: false,
                },
              }),
            ]),
          );
        } else if (frame.message.includes("locationsFromBounds")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                bounds: { x: 0, y: 0, width: 10_000, height: 10_000 },
                fields: ["terrain"],
                plotCount: 100_000_000,
                omitted: 99_999_999,
                hiddenInfoPolicy: "not-player-scoped",
                map: { width: { ok: true, value: 84 }, height: { ok: true, value: 54 } },
                plots: [
                  {
                    location: { x: 0, y: 0, index: { ok: true, value: 0 } },
                    hiddenInfoPolicy: "not-player-scoped",
                    facts: { terrain: { ok: true, value: 4 } },
                  },
                ],
              }),
            ]),
          );
        } else if (frame.message.includes("readPlotSnapshot")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                location: { x: 3, y: 4, index: { ok: true, value: 339 } },
                revealedState: { ok: true, value: 1 },
                visible: { ok: true, value: true },
                hiddenInfoPolicy: "visibility-filtered",
                facts: {
                  terrain: { ok: true, value: 4 },
                  resource: { ok: true, value: -1 },
                  revealedState: { ok: true, value: 1 },
                  visible: { ok: true, value: true },
                },
              }),
            ]),
          );
        } else if (frame.message === "CMD:1:Visibility.revealAllPlots(0)") {
          revealedCount = 20;
          socket.write(encodeResponse(frame.listenerId, ["true"]));
        } else if (frame.message.includes("getPlotsRevealedCount")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                playerId: 0,
                numPlotsRevealed: { ok: true, value: revealedCount },
                numPlotsVisible: { ok: true, value: revealedCount },
                counts: { "1": 2 },
                grid: {
                  bounds: { x: 0, y: 0, width: 2, height: 1 },
                  plotCount: 2,
                  omitted: 0,
                  states: [
                    { x: 0, y: 0, state: { ok: true, value: 1 }, visible: { ok: true, value: true } },
                    { x: 1, y: 0, state: { ok: true, value: 1 }, visible: { ok: true, value: true } },
                  ],
                },
              }),
            ]),
          );
        } else if (frame.message.includes("GameInfo[input.table]")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                table: "Resources",
                source: "GameInfo",
                rows: [{ ResourceType: "RESOURCE_COTTON" }],
                limit: 2,
                offset: 0,
                total: { ok: true, value: 1 },
                omittedUnknown: false,
              }),
            ]),
          );
        } else if (frame.message.includes("return JSON.stringify(sendOperation")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                sent: true,
                before: {
                  family: "unit-operation",
                  operationType: "SKIP_TURN",
                  valid: true,
                  result: { Success: true },
                },
                result: { accepted: true },
              }),
            ]),
          );
        } else if (frame.message.includes("return JSON.stringify(validateOperation")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                family: "unit-operation",
                operationType: "SKIP_TURN",
                enumValue: "SKIP_TURN",
                target: { unitId: { owner: 0, id: 65536, type: 26 } },
                args: undefined,
                valid: true,
                result: { Success: true },
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
