import { once } from "node:events";
import { mkdtemp, rm, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";
import {
  Civ7AppUiSnapshotResultSchema,
  Civ7GameInfoRowsInputSchema,
  Civ7GameInfoRowsResultSchema,
  Civ7PlayableStatusInputSchema,
  Civ7PlayableStatusResultSchema,
  Civ7TunerHealthResultSchema,
  checkCiv7TunerHealth,
  createStaticCiv7CapabilityCatalog,
  DEFAULT_CIV7_APP_UI_API_ROOTS,
  DEFAULT_CIV7_TUNER_API_ROOTS,
  executeCiv7AppUiCommand,
  executeCiv7TunerCommand,
  generateCiv7CapabilityCatalog,
  getCiv7AppUiSnapshot,
  getCiv7GameInfoRows,
  getCiv7PlayableStatus,
  inspectCiv7Root,
  inspectCiv7RuntimeApi,
  loadCiv7OfficialResourceCapabilities,
  snapshotFile,
  waitForFreshLogMarkers,
} from "../src/index";
import { jsLiteral } from "../src/runtime/command-serialization";

describe("Civ7 runtime inspection and capability catalog support", () => {
  test("serializes command-source literals without changing JSON shape", () => {
    expect(jsLiteral({ input: "<city-id>", amount: 2, enabled: true })).toBe(
      '{"input":"<city-id>","amount":2,"enabled":true}',
    );
    expect(jsLiteral(["Game", "UI"])).toBe('["Game","UI"]');
    expect(jsLiteral(null)).toBe("null");
  });

  test("rejects unserializable command-source inputs with command-failed classification", () => {
    expect(() => jsLiteral(undefined)).toThrow("Cannot serialize Civ7 command input");
    try {
      jsLiteral(undefined);
    } catch (err) {
      expect(err).toMatchObject({ code: "command-failed" });
    }
  });

  test("routes commands through App UI and Tuner state selections", async () => {
    const server = await startFocusedTunerServer();
    try {
      const { port } = server.address();
      const appUi = await executeCiv7AppUiCommand({
        host: "127.0.0.1",
        port,
        command: "UI.isInShell()",
        timeoutMs: 1_000,
      });
      const tuner = await executeCiv7TunerCommand({
        host: "127.0.0.1",
        port,
        command: "Game.turn",
        timeoutMs: 1_000,
      });

      expect(appUi.state).toEqual({ id: "65535", name: "App UI" });
      expect(appUi.output).toEqual(["false"]);
      expect(tuner.state).toEqual({ id: "1", name: "Tuner" });
      expect(tuner.output).toEqual(["1"]);
      expect(server.received).toEqual([
        "LSQ:",
        "CMD:65535:UI.isInShell()",
        "LSQ:",
        "CMD:1:Game.turn",
      ]);
    } finally {
      await server.close();
    }
  });

  test("reads App UI snapshots, Tuner readiness, and playable status shapes", async () => {
    const server = await startFocusedTunerServer();
    try {
      const { port } = server.address();
      const options = { host: "127.0.0.1", port, timeoutMs: 1_000 };
      const snapshot = await getCiv7AppUiSnapshot(options);
      const health = await checkCiv7TunerHealth(options);
      const playable = await getCiv7PlayableStatus(options);

      expect(snapshot).toMatchObject({
        state: { id: "65535", name: "App UI" },
        snapshot: {
          network: { isInSession: { ok: true, value: true } },
          ui: {
            inGame: { ok: true, value: true },
            inShell: { ok: true, value: false },
            loadingStateName: "GameStarted",
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
            aliveHumanIds: { ok: true, value: [0] },
            numAliveHumans: { ok: true, value: 1 },
          },
          autoplay: {
            isActive: false,
            isPausedOrPending: false,
          },
          map: {
            width: { ok: true, value: 84 },
            height: { ok: true, value: 54 },
          },
        },
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
        },
      });
      const healthCommand = server.received.find((message) => message.includes("evalOk: 1 + 1"));
      expect(healthCommand).toContain("CMD:1:");
      expect(healthCommand).toContain("g.GameplayMap.getGridWidth()");
      expect(healthCommand).toContain("g.Players.getAliveIds()");
      expect(playable).toMatchObject({
        playable: true,
        readiness: "tuner-ready",
        appUi: { state: { id: "65535", name: "App UI" } },
        tuner: { state: { id: "1", name: "Tuner" }, ready: true },
      });
      expect(Value.Check(Civ7AppUiSnapshotResultSchema, snapshot)).toBe(true);
      expect(Value.Check(Civ7TunerHealthResultSchema, health)).toBe(true);
      expect(Value.Check(Civ7PlayableStatusResultSchema, playable)).toBe(true);
      expect(Value.Check(Civ7PlayableStatusInputSchema, {})).toBe(true);
      expect(Value.Check(Civ7PlayableStatusInputSchema, { host: "127.0.0.1" })).toBe(false);
      expect(Value.Check(Civ7PlayableStatusResultSchema, {
        ...playable,
        rawCommand: "Game.turn",
      })).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("classifies shell status without claiming Tuner gameplay readiness", async () => {
    const server = await startFocusedTunerServer({ shell: true, tunerReady: false });
    try {
      const { port } = server.address();
      const status = await getCiv7PlayableStatus({
        host: "127.0.0.1",
        port,
        timeoutMs: 1_000,
      });

      expect(status.playable).toBe(false);
      expect(status.readiness).toBe("shell");
      expect(status.appUi.snapshot.ui.inShell).toEqual({ ok: true, value: true });
      expect(status.tuner?.ready).toBe(false);
      expect(status.errors).toEqual([]);
      expect(Value.Check(Civ7PlayableStatusResultSchema, status)).toBe(true);
    } finally {
      await server.close();
    }
  });

  test("validates playable status when Tuner health is unavailable", async () => {
    const status = await getCiv7PlayableStatus({}, {
      checkTunerHealth: async () => {
        throw new Error("Tuner socket unavailable");
      },
      errorMessage: (err) => err instanceof Error ? err.message : String(err),
      getAppUiSnapshot: async () => ({
        host: "127.0.0.1",
        port: 4318,
        state: { id: "65535", name: "App UI" },
        snapshot: {
          network: {
            isInSession: { ok: false, error: "Network unavailable" },
            numPlayers: { ok: false, error: "Network unavailable" },
            hostPlayerId: { ok: false, error: "Network unavailable" },
            isConnectedToNetwork: { ok: false, error: "Network unavailable" },
            isAuthenticated: { ok: false, error: "Network unavailable" },
            isLoggedIn: { ok: false, error: "Network unavailable" },
          },
          autoplay: {
            isActive: false,
            turns: 0,
            isPaused: false,
            isPausedOrPending: false,
            observeAsPlayer: -1,
            returnAsPlayer: -1,
          },
          game: {
            turn: -1,
            age: -1,
            maxTurns: 0,
            turnDate: { ok: false, error: "Game unavailable" },
            hash: { ok: false, error: "Game unavailable" },
          },
          ui: {
            inGame: { ok: false, error: "UI unavailable" },
            inShell: { ok: false, error: "UI unavailable" },
            inLoading: { ok: false, error: "UI unavailable" },
            loadingState: { ok: false, error: "UI unavailable" },
            loadingStateName: null,
            canBeginGame: { ok: false, error: "UI unavailable" },
            canNotifyUIReady: "undefined",
            skipStartButton: { ok: false, error: "Configuration unavailable" },
            automationActive: { ok: false, error: "Automation unavailable" },
          },
          gameContext: {
            localPlayerID: -1,
            localObserverID: -1,
            hasRequestedPause: { ok: false, error: "GameContext unavailable" },
          },
          players: {
            maxPlayers: 0,
            aliveIds: { ok: false, error: "Players unavailable" },
            aliveHumanIds: { ok: false, error: "Players unavailable" },
            numAliveHumans: { ok: false, error: "Players unavailable" },
          },
          map: {
            width: { ok: false, error: "Map unavailable" },
            height: { ok: false, error: "Map unavailable" },
            plotCount: { ok: false, error: "Map unavailable" },
            mapSize: { ok: false, error: "Map unavailable" },
            randomSeed: { ok: false, error: "Map unavailable" },
          },
        },
      }),
    });

    expect(status.playable).toBe(false);
    expect(status.readiness).toBe("unavailable");
    expect(status.tuner).toBeUndefined();
    expect(status.errors).toEqual(["Tuner socket unavailable"]);
    expect(Value.Check(Civ7PlayableStatusResultSchema, status)).toBe(true);
  });

  test("inspects runtime roots and targeted GameInfo rows through read helpers", async () => {
    const server = await startFocusedTunerServer();
    try {
      const { port } = server.address();
      const options = { host: "127.0.0.1", port, timeoutMs: 1_000 };
      const inspection = await inspectCiv7RuntimeApi({
        ...options,
        roots: ["Network"],
      });
      const rows = await getCiv7GameInfoRows(
        { table: "Resources", limit: 2, filter: { key: "ResourceType", equals: "RESOURCE_COTTON" } },
        options
      );

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
      expect(rows).toMatchObject({
        table: "Resources",
        source: "GameInfo",
        rows: [{ ResourceType: "RESOURCE_COTTON", Name: "LOC_RESOURCE_COTTON_NAME" }],
        limit: 2,
        offset: 0,
        total: { ok: true, value: 1 },
      });
      expect(Value.Check(Civ7GameInfoRowsInputSchema, {
        table: "Resources",
        limit: 2,
        filter: { key: "ResourceType", equals: "RESOURCE_COTTON" },
      })).toBe(true);
      expect(Value.Check(Civ7GameInfoRowsInputSchema, { table: "Resources;DROP" })).toBe(false);
      expect(Value.Check(Civ7GameInfoRowsInputSchema, { table: "Resources", limit: 1_001 })).toBe(false);
      expect(Value.Check(Civ7GameInfoRowsInputSchema, {
        table: "Resources",
        filter: { key: "Resource-Type", equals: "RESOURCE_COTTON" },
      })).toBe(false);
      expect(Value.Check(Civ7GameInfoRowsInputSchema, { table: "Resources", host: "127.0.0.1" })).toBe(false);
      expect(Value.Check(Civ7GameInfoRowsInputSchema, { table: "Resources", rawCommand: "GameInfo.Resources" })).toBe(false);
      expect(Value.Check(Civ7GameInfoRowsResultSchema, rows)).toBe(true);
      expect(Value.Check(Civ7GameInfoRowsResultSchema, {
        ...rows,
        session: { stateName: "Tuner" },
      })).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("keeps runtime API default roots scoped to the selected state", async () => {
    const server = await startFocusedTunerServer();
    try {
      const { port } = server.address();
      const options = { host: "127.0.0.1", port, timeoutMs: 1_000 };
      await inspectCiv7RuntimeApi(options);
      await inspectCiv7RuntimeApi({ ...options, state: { role: "tuner" } });

      const appUiCommand = server.received.find((message) => message.startsWith("CMD:65535:"));
      const tunerCommand = server.received.find((message) => message.startsWith("CMD:1:"));
      expect(appUiCommand).toBeDefined();
      expect(tunerCommand).toBeDefined();
      for (const root of DEFAULT_CIV7_APP_UI_API_ROOTS) {
        expect(appUiCommand).toContain(JSON.stringify(root));
      }
      for (const root of DEFAULT_CIV7_TUNER_API_ROOTS) {
        expect(tunerCommand).toContain(JSON.stringify(root));
      }
      for (const root of DEFAULT_CIV7_TUNER_API_ROOTS.filter((root) => !DEFAULT_CIV7_APP_UI_API_ROOTS.includes(root))) {
        expect(appUiCommand).not.toContain(JSON.stringify(root));
      }
      for (const root of DEFAULT_CIV7_APP_UI_API_ROOTS.filter((root) => !DEFAULT_CIV7_TUNER_API_ROOTS.includes(root))) {
        expect(tunerCommand).not.toContain(JSON.stringify(root));
      }
    } finally {
      await server.close();
    }
  });

  test("builds static, runtime, official-resource, and proof-log catalog evidence", async () => {
    const server = await startFocusedTunerServer();
    const fixtureRoot = await mkdtemp(join(tmpdir(), "civ7-direct-control-catalog-"));
    try {
      const resourceFixture = join(fixtureRoot, "official-ui.js");
      const logFixture = join(fixtureRoot, "Scripting.log");
      await writeFile(
        resourceFixture,
        "Network.restartGame(); UI.notifyUIReady(); Autoplay.setActive(true);",
        "utf8"
      );
      await writeFile(logFixture, "before\n", "utf8");
      const before = await snapshotFile(logFixture);
      await writeFile(logFixture, "before\nruntime-ready\nproof-complete\n", "utf8");

      const { port } = server.address();
      const staticCatalog = createStaticCiv7CapabilityCatalog();
      const runtimeCatalog = await generateCiv7CapabilityCatalog({
        host: "127.0.0.1",
        port,
        timeoutMs: 1_000,
        includeStatic: false,
        appUiRoots: ["Network"],
        tunerRoots: ["Game"],
      });
      const official = await loadCiv7OfficialResourceCapabilities({
        resourcesRoot: fixtureRoot,
        maxFiles: 5,
      });
      const boundedRoot = await inspectCiv7Root(
        { roots: ["Game"], maxRoots: 32, maxKeys: 128, maxMethods: 128 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );
      const proof = await waitForFreshLogMarkers({
        logPath: logFixture,
        snapshot: before,
        markers: ["runtime-ready", "proof-complete"],
        timeoutMs: 1_000,
        pollIntervalMs: 10,
      });

      expect(staticCatalog.source).toBe("static");
      expect(staticCatalog.entries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "gameinfo.Resources",
            kind: "gameinfo-table",
            confidence: "source",
            risk: "read",
          }),
        ])
      );
      expect(runtimeCatalog).toMatchObject({
        source: "runtime",
        entries: expect.arrayContaining([
          expect.objectContaining({
            id: "app-ui.root.Network",
            role: "app-ui",
            confidence: "runtime",
          }),
          expect.objectContaining({
            id: "app-ui.method.Network.restartGame",
            risk: "medium",
          }),
          expect.objectContaining({
            id: "tuner.method.Game.getTurn",
            risk: "read",
          }),
        ]),
      });
      expect(official).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "official.Network.restartGame",
            owner: "official-resources",
          }),
          expect.objectContaining({ id: "official.UI.notifyUIReady", owner: "official-resources" }),
          expect.objectContaining({ id: "official.Autoplay", owner: "official-resources" }),
        ])
      );
      expect(boundedRoot).toMatchObject({
        state: { id: "1", name: "Tuner" },
        roots: expect.arrayContaining([
          expect.objectContaining({
            name: "Game",
            methods: expect.arrayContaining([
              expect.objectContaining({ name: "getTurn", owner: "prototype" }),
            ]),
          }),
        ]),
        limits: {
          maxRoots: 32,
          maxKeys: 128,
          maxMethods: 128,
          truncated: false,
        },
      });
      expect(proof.matched).toEqual(["runtime-ready", "proof-complete"]);
      expect(proof.startOffset).toBe(before.size);
    } finally {
      await server.close();
      await rm(fixtureRoot, { force: true, recursive: true });
    }
  });

  test("waits for markers when Civ rewrites the log at the same byte length", async () => {
    const dir = await mkdtemp(join(tmpdir(), "civ7-direct-control-log-"));
    const logPath = join(dir, "Scripting.log");
    await writeFile(logPath, "old log padding\n");
    const snapshot = await snapshotFile(logPath);
    await writeFile(logPath, "fresh\nmarker\n".padEnd(snapshot.size, " "));
    await utimes(logPath, new Date(snapshot.mtimeMs + 1_000), new Date(snapshot.mtimeMs + 1_000));

    const proof = await waitForFreshLogMarkers({
      logPath,
      snapshot,
      markers: ["fresh", "marker"],
      timeoutMs: 100,
      pollIntervalMs: 10,
    });

    expect(proof.matched).toEqual(["fresh", "marker"]);
  });

  test("waits for markers when Civ rewrites the log beyond the old offset", async () => {
    const dir = await mkdtemp(join(tmpdir(), "civ7-direct-control-log-"));
    const logPath = join(dir, "Scripting.log");
    await writeFile(logPath, `old\n${"x".repeat(160)}\n`);
    const snapshot = await snapshotFile(logPath);
    await writeFile(logPath, `fresh\nmarker\n${"y".repeat(snapshot.size + 40)}\n`);
    await utimes(logPath, new Date(snapshot.mtimeMs + 1_000), new Date(snapshot.mtimeMs + 1_000));

    const proof = await waitForFreshLogMarkers({
      logPath,
      snapshot,
      markers: ["fresh", "marker"],
      timeoutMs: 100,
      pollIntervalMs: 10,
    });

    expect(proof.startOffset).toBe(0);
    expect(proof.matched).toEqual(["fresh", "marker"]);
  });
});

async function startFocusedTunerServer(
  options: {
    shell?: boolean;
    tunerReady?: boolean;
  } = {}
) {
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
        socket.write(encodeResponse(frame.listenerId, responseForMessage(frame.message, options)));
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

function responseForMessage(
  message: string,
  options: {
    shell?: boolean;
    tunerReady?: boolean;
  }
): string[] {
  if (message === "LSQ:") return ["65535", "App UI", "1", "Tuner"];
  if (message === "CMD:65535:UI.isInShell()") return [String(options.shell === true)];
  if (message === "CMD:1:Game.turn") return ["1"];
  if (message.includes("Network.isInSession")) return [JSON.stringify(appUiSnapshot(options))];
  if (message.includes("evalOk: 1 + 1")) return [JSON.stringify(tunerHealth(options))];
  if (message.includes("GameInfo[input.table]")) return [JSON.stringify(gameInfoRows())];
  if (message.includes("const input =") && message.includes("maxRoots")) {
    return [JSON.stringify(rootInspection(message.includes("CMD:65535:") ? "App UI" : "Tuner"))];
  }
  if (message.includes("const roots =")) return [JSON.stringify(runtimeApiRoots())];
  return ["null"];
}

function appUiSnapshot(options: { shell?: boolean }) {
  const inShell = options.shell === true;
  return {
    network: {
      isInSession: { ok: true, value: !inShell },
      numPlayers: { ok: true, value: inShell ? 0 : 1 },
      hostPlayerId: { ok: true, value: inShell ? -1 : 0 },
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
      turn: inShell ? -1 : 1,
      age: inShell ? -1 : 0,
      maxTurns: 0,
      turnDate: inShell
        ? { ok: false, error: "ReferenceError: Game is not defined" }
        : { ok: true, value: "4000 BCE" },
      hash: inShell
        ? { ok: false, error: "ReferenceError: Game is not defined" }
        : { ok: true, value: 0 },
    },
    ui: {
      inGame: { ok: true, value: !inShell },
      inShell: { ok: true, value: inShell },
      inLoading: { ok: true, value: false },
      loadingState: { ok: true, value: 8 },
      loadingStateName: "GameStarted",
      canBeginGame: { ok: true, value: false },
      canNotifyUIReady: "function",
      skipStartButton: { ok: true, value: false },
      automationActive: { ok: true, value: false },
    },
    gameContext: {
      localPlayerID: inShell ? -1 : 0,
      localObserverID: inShell ? -1 : 0,
      hasRequestedPause: { ok: true, value: false },
    },
    players: {
      maxPlayers: inShell ? 0 : 64,
      aliveIds: inShell
        ? { ok: false, error: "ReferenceError: Players is not defined" }
        : { ok: true, value: [0] },
      aliveHumanIds: inShell
        ? { ok: false, error: "ReferenceError: Players is not defined" }
        : { ok: true, value: [0] },
      numAliveHumans: inShell
        ? { ok: false, error: "ReferenceError: Players is not defined" }
        : { ok: true, value: 1 },
    },
    map: {
      width: inShell
        ? { ok: false, error: "ReferenceError: GameplayMap is not defined" }
        : { ok: true, value: 84 },
      height: inShell
        ? { ok: false, error: "ReferenceError: GameplayMap is not defined" }
        : { ok: true, value: 54 },
      plotCount: inShell
        ? { ok: false, error: "ReferenceError: GameplayMap is not defined" }
        : { ok: true, value: 4536 },
      mapSize: { ok: true, value: 0 },
      randomSeed: { ok: true, value: 111 },
    },
  };
}

function tunerHealth(options: { tunerReady?: boolean }) {
  const ready = options.tunerReady !== false;
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
    turn: ready ? { ok: true, value: 1 } : { ok: false, error: "Game unavailable" },
    turnDate: ready ? { ok: true, value: "4000 BCE" } : { ok: false, error: "Game unavailable" },
    width: ready ? { ok: true, value: 84 } : { ok: false, error: "GameplayMap unavailable" },
    height: ready ? { ok: true, value: 54 } : { ok: false, error: "GameplayMap unavailable" },
    aliveIds: ready ? { ok: true, value: [0, 1] } : { ok: false, error: "Players unavailable" },
    aliveHumanIds: ready ? { ok: true, value: [0] } : { ok: false, error: "Players unavailable" },
    autoplayActive: { ok: true, value: false },
  };
}

function gameInfoRows() {
  return {
    table: "Resources",
    source: "GameInfo",
    rows: [{ ResourceType: "RESOURCE_COTTON", Name: "LOC_RESOURCE_COTTON_NAME" }],
    limit: 2,
    offset: 0,
    total: { ok: true, value: 1 },
    omittedUnknown: false,
  };
}

function rootInspection(stateName: "App UI" | "Tuner") {
  return {
    roots: stateName === "App UI" ? runtimeApiRoots() : tunerRuntimeRoots(),
    limits: {
      maxRoots: 32,
      maxKeys: 128,
      maxMethods: 128,
      truncated: false,
    },
  };
}

function runtimeApiRoots() {
  return [
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
  ];
}

function tunerRuntimeRoots() {
  return [
    {
      name: "Game",
      type: "object",
      exists: true,
      ownKeys: ["turn"],
      prototypeKeys: ["getTurn"],
      enumerableKeys: [],
      methods: [
        {
          name: "getTurn",
          owner: "prototype",
          length: 0,
          signature: "",
        },
      ],
    },
  ];
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
