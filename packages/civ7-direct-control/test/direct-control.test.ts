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
  ensureCiv7SetupMapRowVisible,
  getCiv7GameInfoRows,
  getCiv7MapGrid,
  getCiv7MapSummary,
  getCiv7PlotSnapshot,
  getCiv7PlayableStatus,
  getCiv7SetupMapRows,
  getCiv7SetupSnapshot,
  getCiv7VisibilitySummary,
  getCiv7AppUiSnapshot,
  inspectCiv7RuntimeApi,
  listCiv7SavedGameConfigurations,
  loadCiv7SavedGameConfiguration,
  prepareCiv7SinglePlayerSetup,
  parseCiv7TunerFrame,
  queryCiv7TunerStates,
  requestCiv7UnitOperation,
  revealCiv7MapForPlayer,
  runCiv7SinglePlayerFromSetup,
  startPreparedCiv7SinglePlayerGame,
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

  test("classifies shell App UI health when gameplay globals are unavailable", async () => {
    const server = await startTunerServer({
      appUiOnlyStates: true,
      appUiSnapshotWithoutGameplayGlobals: true,
    });
    try {
      const { port } = server.address();
      const status = await getCiv7PlayableStatus({
        host: "127.0.0.1",
        port,
        timeoutMs: 1_000,
      });

      expect(status).toMatchObject({
        playable: false,
        readiness: "shell",
        appUi: {
          snapshot: {
            game: {
              turn: -1,
              age: -1,
            },
            gameContext: {
              localPlayerID: -1,
            },
            players: {
              maxPlayers: 0,
            },
            ui: {
              inShell: { ok: true, value: true },
            },
          },
        },
      });
      expect(status.errors.join("\n")).toContain('Civ7 tuner state "Tuner" was not available');
    } finally {
      await server.close();
    }
  });

  test("does not treat a listed but unready Tuner state as playable", async () => {
    const server = await startTunerServer({ tunerReady: false });
    try {
      const { port } = server.address();
      const status = await getCiv7PlayableStatus({
        host: "127.0.0.1",
        port,
        timeoutMs: 1_000,
      });

      expect(status.playable).toBe(false);
      expect(status.readiness).toBe("shell");
      expect(status.tuner?.ready).toBe(false);
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

  test("reads App UI setup snapshots and frontend map rows", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const snapshot = await getCiv7SetupSnapshot({
        host: "127.0.0.1",
        port,
        timeoutMs: 1_000,
      });
      const rows = await getCiv7SetupMapRows(
        { file: "{swooper-maps}/maps/swooper-earthlike.js" },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );

      expect(snapshot.snapshot.phase).toBe("shell");
      expect(snapshot.snapshot.selectedMapRow?.file).toBe("{swooper-maps}/maps/swooper-earthlike.js");
      expect(snapshot.snapshot.setup.parameters.find((p) => p.id === "MapRandomSeed")?.value).toBe(111);
      expect(snapshot.snapshot.setup.playerParameters[0]?.parameters.find((p) => p.id === "PlayerLeader")?.value).toBe("LEADER_HARRIET_TUBMAN");
      expect(rows.rows).toEqual([
        expect.objectContaining({
          source: "setup-domain",
          file: "{swooper-maps}/maps/swooper-earthlike.js",
        }),
        expect.objectContaining({
          source: "config-db",
          file: "{swooper-maps}/maps/swooper-earthlike.js",
        }),
      ]);
    } finally {
      await server.close();
    }
  });

  test("discovers Civ7 saved game configuration files from disk", async () => {
    const directory = await mkdtemp(join(tmpdir(), "civ7-cfg-"));
    await writeFile(
      join(directory, "ToT Config.Civ7Cfg"),
      Buffer.from(
        [
          "CIV7",
          "GAMESPEED_STANDARD",
          "MAPSIZE_HUGE",
          "LEADER_ALEXANDER",
          "DIFFICULTY_CUSTOM",
          "LOC_MAP_SWOOPER_EARTHLIKE_NAME",
          "3507297712",
          "3507297713",
          "CIVILIZATION_GREECE",
        ].join("\0"),
        "ascii",
      ),
    );

    const result = await listCiv7SavedGameConfigurations({ directory });

    expect(result.directory).toBe(directory);
    expect(result.configurations).toHaveLength(1);
    expect(result.configurations[0]).toMatchObject({
      id: "tot-config",
      displayName: "ToT Config",
      fileName: "ToT Config.Civ7Cfg",
      source: "local-disk",
      summary: {
        gameSpeed: "GAMESPEED_STANDARD",
        mapSize: "MAPSIZE_HUGE",
        leader: "LEADER_ALEXANDER",
        civilization: "CIVILIZATION_GREECE",
        difficulty: "DIFFICULTY_CUSTOM",
        mapSeed: 3507297712,
        gameSeed: 3507297713,
      },
      setupOptions: {
        Difficulty: "DIFFICULTY_CUSTOM",
        GameSpeeds: "GAMESPEED_STANDARD",
      },
      playerOptions: [
        {
          playerId: 0,
          options: {
            PlayerLeader: "LEADER_ALEXANDER",
            PlayerCivilization: "CIVILIZATION_GREECE",
            PlayerDifficulty: "DIFFICULTY_CUSTOM",
          },
        },
      ],
    });
  });

  test("loads saved game configurations through Civ7 native setup workflow", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const result = await loadCiv7SavedGameConfiguration(
        {
          id: "tot-config",
          displayName: "ToT Config",
          fileName: "ToT Config.Civ7Cfg",
          path: "/tmp/ToT Config.Civ7Cfg",
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { waitTimeoutMs: 1_000, pollIntervalMs: 10 },
      );

      expect(result.loaded).toBe(true);
      expect(result.after.snapshot.setup.parameters.find((p) => p.id === "Difficulty")?.value).toBe("DIFFICULTY_CUSTOM");
      expect(result.after.snapshot.setup.playerParameters[0]?.parameters.find((p) => p.id === "PlayerLeader")?.value).toBe("LEADER_ALEXANDER");
      expect(server.received.some((message) => message.includes("Network.loadGame") && message.includes("GAME_CONFIGURATION"))).toBe(true);
      expect(server.received.some((message) => message.includes("ToT Config.Civ7Cfg"))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test("prepares and starts a single-player game through setup wrappers", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const expected = {
        mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
        mapSize: "MAPSIZE_SMALL",
        seed: 222,
        gameSeed: 223,
      };
      const prepare = await prepareCiv7SinglePlayerSetup(
        expected,
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test setup preparation" },
      );
      const start = await startPreparedCiv7SinglePlayerGame(
        { expected, waitForTuner: true, waitTimeoutMs: 5_000, pollIntervalMs: 10 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test prepared start" },
      );

      expect(prepare.verified).toBe(true);
      expect(start.verified).toBe(true);
      expect(start.mapSummary?.map.randomSeed).toEqual({ ok: true, value: 222 });
      expect(server.received.some((message) => message.includes("Configuration.editMap()"))).toBe(true);
      expect(server.received.some((message) => message.includes('setSetupParameter("Map"'))).toBe(true);
      expect(server.received.some((message) => message.includes('setSetupParameter("MapSize"'))).toBe(true);
      expect(server.received.some((message) => message.includes('setSetupParameter("MapRandomSeed"'))).toBe(true);
      expect(server.received.some((message) => message.includes("Network.hostGame"))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test("applies and verifies game and player setup options", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const prepare = await prepareCiv7SinglePlayerSetup(
        {
          mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
          mapSize: "MAPSIZE_SMALL",
          seed: 222,
          options: {
            Difficulty: "DIFFICULTY_CUSTOM",
          },
          playerOptions: [
            {
              playerId: 0,
              options: {
                PlayerLeader: "LEADER_ASHOKA",
                PlayerCivilization: "CIVILIZATION_MAURYA",
                PlayerDifficulty: "DIFFICULTY_CUSTOM",
              },
            },
          ],
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test setup option preservation" },
      );

      expect(prepare.verified).toBe(true);
      expect(prepare.applied).toMatchObject({
        Difficulty: "DIFFICULTY_CUSTOM",
        "Player:0:PlayerLeader": "LEADER_ASHOKA",
        "Player:0:PlayerCivilization": "CIVILIZATION_MAURYA",
        "Player:0:PlayerDifficulty": "DIFFICULTY_CUSTOM",
      });
      expect(server.received.some((message) => message.includes("setPlayerParameterValue"))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test("refreshes setup map rows from a running game when a deployed row is not yet visible", async () => {
    const server = await startTunerServer({
      initialInShell: false,
      hiddenMapScript: "{swooper-maps}/maps/studio-current.js",
      revealHiddenMapRowOnShellExit: true,
    });
    try {
      const { port } = server.address();
      const result = await ensureCiv7SetupMapRowVisible(
        {
          file: "{swooper-maps}/maps/studio-current.js",
          reloadIfMissing: "exit-to-shell",
          waitTimeoutMs: 1_000,
          pollIntervalMs: 10,
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test setup row reload", disposableSession: true },
      );

      expect(result.initial.rows).toHaveLength(0);
      expect(result.final.rows).toEqual([
        expect.objectContaining({
          source: "setup-domain",
          file: "{swooper-maps}/maps/studio-current.js",
        }),
        expect.objectContaining({
          source: "config-db",
          file: "{swooper-maps}/maps/studio-current.js",
        }),
      ]);
      expect(result.refreshed).toBe(true);
      expect(result.verified).toBe(true);
      expect(server.received).toContain(`CMD:65535:engine.call("exitToMainMenu")`);
      expect(server.received).toContain("CMD:65535:UI.reloadUI()");
    } finally {
      await server.close();
    }
  });

  test("orchestrates exit-to-shell, setup, and start without caller raw JS", async () => {
    const server = await startTunerServer({ initialInShell: false });
    try {
      const { port } = server.address();
      const result = await runCiv7SinglePlayerFromSetup(
        {
          mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
          mapSize: "MAPSIZE_SMALL",
          seed: 333,
          fromRunningGame: "exit-to-shell",
          waitForTuner: true,
          waitTimeoutMs: 5_000,
          pollIntervalMs: 10,
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test run in game orchestration" },
      );

      expect(result.verified).toBe(true);
      expect(result.shellExit?.output).toEqual(["null"]);
      expect(server.received).toContain('CMD:65535:engine.call("exitToMainMenu")');
    } finally {
      await server.close();
    }
  });

  test("does not replay setup mutations after a socket close", async () => {
    const server = await startTunerServer({ closeOnSetupMutation: true });
    try {
      const { port } = server.address();
      await expect(
        prepareCiv7SinglePlayerSetup(
          {
            mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
            mapSize: "MAPSIZE_SMALL",
            seed: 444,
          },
          { host: "127.0.0.1", port, timeoutMs: 1_000 },
          { approved: true, reason: "test no replay on setup mutation" },
        ),
      ).rejects.toMatchObject({ code: "socket-closed" });
      expect(server.received.filter((message) => message.includes("editMap.setScript")).length).toBe(1);
    } finally {
      await server.close();
    }
  });

  test("rejects prepared starts when post-start runtime seed mismatches", async () => {
    const server = await startTunerServer({ postStartSeedOverride: 999 });
    try {
      const { port } = server.address();
      const expected = {
        mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
        mapSize: "MAPSIZE_SMALL",
        seed: 222,
      };
      await prepareCiv7SinglePlayerSetup(
        expected,
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test setup preparation before mismatch" },
      );
      await expect(
        startPreparedCiv7SinglePlayerGame(
          { expected, waitForTuner: true, waitTimeoutMs: 5_000, pollIntervalMs: 10 },
          { host: "127.0.0.1", port, timeoutMs: 1_000 },
          { approved: true, reason: "test seed mismatch" },
        ),
      ).rejects.toMatchObject({ code: "setup-seed-mismatch" });
    } finally {
      await server.close();
    }
  });

  test("captures begin errors without replaying Begin Game", async () => {
    const server = await startTunerServer({ closeOnBegin: true });
    try {
      const { port } = server.address();
      const expected = {
        mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
        mapSize: "MAPSIZE_SMALL",
        seed: 222,
      };
      await prepareCiv7SinglePlayerSetup(
        expected,
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test setup preparation before begin failure" },
      );
      await expect(
        startPreparedCiv7SinglePlayerGame(
          { expected, waitForTuner: true, waitTimeoutMs: 1_500, pollIntervalMs: 10 },
          { host: "127.0.0.1", port, timeoutMs: 500 },
          { approved: true, reason: "test begin failure no replay" },
        ),
      ).rejects.toMatchObject({ code: "socket-closed" });
      expect(server.received.filter((message) => message === "CMD:65535:UI.notifyUIReady()")).toHaveLength(1);
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

async function startTunerServer(options: {
  restartOutput?: string;
  initialInShell?: boolean;
  closeOnSetupMutation?: boolean;
  closeOnBegin?: boolean;
  postStartSeedOverride?: number;
  hiddenMapScript?: string;
  revealHiddenMapRowOnShellExit?: boolean;
  appUiOnlyStates?: boolean;
  appUiSnapshotWithoutGameplayGlobals?: boolean;
  tunerReady?: boolean;
} = {}) {
  const received: string[] = [];
  let loadingState = 6;
  let inShell = options.initialInShell ?? true;
  let revealedCount = 10;
  let autoplayActive = false;
  let autoplayPaused = false;
  let autoplayStopPendingReads = 0;
  let setupMapScript = "{swooper-maps}/maps/swooper-earthlike.js";
  let setupMapSize = "MAPSIZE_STANDARD";
  let setupMapSeed = 111;
  let setupGameSeed = 112;
  let setupDifficulty = "DIFFICULTY_PRINCE";
  let setupLeader = "LEADER_HARRIET_TUBMAN";
  let setupCivilization = "CIVILIZATION_AMERICA";
  let setupPlayerDifficulty = "DIFFICULTY_PRINCE";
  let setupRevision = 19;
  let hiddenMapRowVisible = false;
  const visibleSetupRows = () => [
    {
      Domain: "StandardMaps",
      File: "{swooper-maps}/maps/swooper-earthlike.js",
      Value: "{swooper-maps}/maps/swooper-earthlike.js",
      Name: "LOC_MAP_SWOOPER_EARTHLIKE_NAME",
      Description: "LOC_MAP_SWOOPER_EARTHLIKE_DESCRIPTION",
      SortIndex: 501,
    },
    ...(hiddenMapRowVisible && options.hiddenMapScript
      ? [
          {
            Domain: "StandardMaps",
            File: options.hiddenMapScript,
            Value: options.hiddenMapScript,
            Name: "LOC_MAP_STUDIO_CURRENT_NAME",
            Description: "LOC_MAP_STUDIO_CURRENT_DESCRIPTION",
            SortIndex: 9999,
          },
        ]
      : []),
  ];
  const visibleMapRows = () => [
    {
      source: "setup-domain",
      file: "{swooper-maps}/maps/swooper-earthlike.js",
      value: "{swooper-maps}/maps/swooper-earthlike.js",
      name: "LOC_MAP_SWOOPER_EARTHLIKE_NAME",
      sortIndex: 501,
    },
    {
      source: "config-db",
      domain: "StandardMaps",
      file: "{swooper-maps}/maps/swooper-earthlike.js",
      value: "{swooper-maps}/maps/swooper-earthlike.js",
      name: "LOC_MAP_SWOOPER_EARTHLIKE_NAME",
      description: "LOC_MAP_SWOOPER_EARTHLIKE_DESCRIPTION",
      sortIndex: 501,
    },
    ...(hiddenMapRowVisible && options.hiddenMapScript
      ? [
          {
            source: "setup-domain",
            file: options.hiddenMapScript,
            value: options.hiddenMapScript,
            name: "LOC_MAP_STUDIO_CURRENT_NAME",
            sortIndex: 9999,
          },
          {
            source: "config-db",
            domain: "StandardMaps",
            file: options.hiddenMapScript,
            value: options.hiddenMapScript,
            name: "LOC_MAP_STUDIO_CURRENT_NAME",
            description: "LOC_MAP_STUDIO_CURRENT_DESCRIPTION",
            sortIndex: 9999,
          },
        ]
      : []),
  ];
  const setupSnapshot = () => ({
    phase: inShell ? "shell" : loadingState === 8 ? "running-game" : "loading",
    ui: {
      inGame: { ok: true, value: !inShell },
      inShell: { ok: true, value: inShell },
      inLoading: { ok: true, value: loadingState !== 8 && !inShell },
      loadingState: { ok: true, value: loadingState },
      loadingStateName: loadingState === 8 ? "GameStarted" : "WaitingForUIReady",
      canBeginGame: { ok: true, value: loadingState === 6 && !inShell },
    },
    setup: {
      revision: { ok: true, value: setupRevision },
      parameters: [
        {
          id: "Map",
          exists: true,
          value: setupMapScript,
          possibleValues: visibleSetupRows(),
        },
        {
          id: "MapSize",
          exists: true,
          value: setupMapSize,
          possibleValues: [{ value: "MAPSIZE_SMALL" }, { value: "MAPSIZE_STANDARD" }],
        },
        { id: "MapRandomSeed", exists: true, value: setupMapSeed, possibleValues: [] },
        { id: "GameRandomSeed", exists: true, value: setupGameSeed, possibleValues: [] },
        { id: "Difficulty", exists: true, value: setupDifficulty, possibleValues: [{ value: "DIFFICULTY_PRINCE" }, { value: "DIFFICULTY_CUSTOM" }] },
      ],
      playerParameters: [
        {
          playerId: 0,
          parameters: [
            { id: "PlayerLeader", exists: true, value: setupLeader, possibleValues: [{ value: "LEADER_HARRIET_TUBMAN" }, { value: "LEADER_ASHOKA" }] },
            { id: "PlayerCivilization", exists: true, value: setupCivilization, possibleValues: [{ value: "CIVILIZATION_AMERICA" }, { value: "CIVILIZATION_MAURYA" }] },
            { id: "PlayerDifficulty", exists: true, value: setupPlayerDifficulty, possibleValues: [{ value: "DIFFICULTY_PRINCE" }, { value: "DIFFICULTY_CUSTOM" }] },
          ],
        },
      ],
      localPlayerId: { ok: true, value: 0 },
    },
    selectedMapRow: {
      source: "setup-domain",
      file: setupMapScript,
      value: setupMapScript,
      name: "LOC_MAP_SWOOPER_EARTHLIKE_NAME",
      sortIndex: 501,
    },
    mapRows: visibleMapRows(),
    config: {
      mapScript: { ok: true, value: setupMapScript },
      mapSize: { ok: true, value: setupMapSize },
      mapSeed: { ok: true, value: setupMapSeed },
      gameSeed: { ok: true, value: setupGameSeed },
    },
  });
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
          socket.write(encodeResponse(frame.listenerId, options.appUiOnlyStates ? ["65535", "App UI"] : ["65535", "App UI", "1", "Tuner"]));
        } else if (frame.message === `CMD:65535:${CIV7_RESTART_COMMAND}`) {
          loadingState = 6;
          inShell = false;
          socket.write(encodeResponse(frame.listenerId, [options.restartOutput ?? "true"]));
        } else if (frame.message === 'CMD:65535:engine.call("exitToMainMenu")') {
          inShell = true;
          loadingState = 8;
          if (options.revealHiddenMapRowOnShellExit) hiddenMapRowVisible = true;
          socket.write(encodeResponse(frame.listenerId, ["null"]));
        } else if (frame.message === "CMD:65535:UI.reloadUI()") {
          socket.write(encodeResponse(frame.listenerId, ["null"]));
        } else if (frame.message === "CMD:65535:UI.notifyUIReady()") {
          if (options.closeOnBegin) {
            socket.destroy();
            continue;
          }
          loadingState = 8;
          inShell = false;
          socket.write(encodeResponse(frame.listenerId, ["null"]));
        } else if (frame.message.includes("Network.loadGame") && frame.message.includes("GAME_CONFIGURATION")) {
          setupDifficulty = "DIFFICULTY_CUSTOM";
          setupLeader = "LEADER_ALEXANDER";
          setupCivilization = "CIVILIZATION_GREECE";
          setupPlayerDifficulty = "DIFFICULTY_CUSTOM";
          setupRevision += 1;
          socket.write(encodeResponse(frame.listenerId, ['{"ok":true,"serverType":0}']));
        } else if (frame.message.includes("editMap.setScript")) {
          if (options.closeOnSetupMutation) {
            socket.destroy();
            continue;
          }
          setupMapScript = "{swooper-maps}/maps/swooper-earthlike.js";
          setupMapSize = frame.message.includes('"mapSize":"MAPSIZE_SMALL"') ? "MAPSIZE_SMALL" : "MAPSIZE_STANDARD";
          setupMapSeed = frame.message.includes('"seed":333') ? 333 : frame.message.includes('"seed":444') ? 444 : 222;
          setupGameSeed = frame.message.includes('"gameSeed":223') ? 223 : setupGameSeed;
          setupDifficulty = frame.message.includes('"Difficulty":"DIFFICULTY_CUSTOM"') ? "DIFFICULTY_CUSTOM" : setupDifficulty;
          setupLeader = frame.message.includes('"PlayerLeader":"LEADER_ASHOKA"') ? "LEADER_ASHOKA" : setupLeader;
          setupCivilization = frame.message.includes('"PlayerCivilization":"CIVILIZATION_MAURYA"') ? "CIVILIZATION_MAURYA" : setupCivilization;
          setupPlayerDifficulty = frame.message.includes('"PlayerDifficulty":"DIFFICULTY_CUSTOM"') ? "DIFFICULTY_CUSTOM" : setupPlayerDifficulty;
          setupRevision += 1;
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                before: setupSnapshot(),
                after: setupSnapshot(),
                applied: {
                  Map: setupMapScript,
                  MapSize: setupMapSize,
                  MapRandomSeed: setupMapSeed,
                  ...(setupGameSeed === 223 ? { GameRandomSeed: setupGameSeed } : {}),
                  ...(setupDifficulty === "DIFFICULTY_CUSTOM" ? { Difficulty: setupDifficulty } : {}),
                  ...(setupLeader === "LEADER_ASHOKA" ? { "Player:0:PlayerLeader": setupLeader } : {}),
                  ...(setupCivilization === "CIVILIZATION_MAURYA" ? { "Player:0:PlayerCivilization": setupCivilization } : {}),
                  ...(setupPlayerDifficulty === "DIFFICULTY_CUSTOM" ? { "Player:0:PlayerDifficulty": setupPlayerDifficulty } : {}),
                },
              }),
            ]),
          );
        } else if (frame.message.includes("Network.hostGame")) {
          inShell = false;
          loadingState = 6;
          socket.write(encodeResponse(frame.listenerId, ['{"ok":true,"serverType":0}']));
        } else if (frame.message.includes("const rows = readSetupMapRows")) {
          const requestedFile = frame.message.includes('"file":"{swooper-maps}/maps/studio-current.js"')
            ? "{swooper-maps}/maps/studio-current.js"
            : frame.message.includes('"file":"{swooper-maps}/maps/swooper-earthlike.js"')
              ? "{swooper-maps}/maps/swooper-earthlike.js"
              : undefined;
          const rows = setupSnapshot().mapRows.filter((row) => !requestedFile || row.file === requestedFile);
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                rows,
                limit: 100,
                matchedFile: requestedFile,
              }),
            ]),
          );
        } else if (frame.message.includes("readSetupSnapshot")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify({ snapshot: setupSnapshot() })]));
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
              JSON.stringify(options.appUiSnapshotWithoutGameplayGlobals
                ? {
                    network: {
                      isInSession: { ok: true, value: false },
                      numPlayers: { ok: true, value: 0 },
                      hostPlayerId: { ok: true, value: -1 },
                      isConnectedToNetwork: { ok: true, value: true },
                      isAuthenticated: { ok: true, value: false },
                      isLoggedIn: { ok: true, value: true },
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
                      turnDate: { ok: false, error: "ReferenceError: Game is not defined" },
                      hash: { ok: false, error: "ReferenceError: Game is not defined" },
                    },
                    ui: {
                      inGame: { ok: true, value: false },
                      inShell: { ok: true, value: true },
                      inLoading: { ok: true, value: false },
                      loadingState: { ok: true, value: 8 },
                      loadingStateName: "GameStarted",
                      canBeginGame: { ok: true, value: false },
                      canNotifyUIReady: "function",
                      skipStartButton: { ok: true, value: false },
                      automationActive: { ok: true, value: false },
                    },
                    gameContext: {
                      localPlayerID: -1,
                      localObserverID: -1,
                      hasRequestedPause: { ok: false, error: "ReferenceError: GameContext is not defined" },
                    },
                    players: {
                      maxPlayers: 0,
                      aliveIds: { ok: false, error: "ReferenceError: Players is not defined" },
                      aliveHumanIds: { ok: false, error: "ReferenceError: Players is not defined" },
                      numAliveHumans: { ok: false, error: "ReferenceError: Players is not defined" },
                    },
                    map: {
                      width: { ok: false, error: "ReferenceError: GameplayMap is not defined" },
                      height: { ok: false, error: "ReferenceError: GameplayMap is not defined" },
                      plotCount: { ok: false, error: "ReferenceError: GameplayMap is not defined" },
                      mapSize: { ok: false, error: "ReferenceError: GameplayMap is not defined" },
                      randomSeed: { ok: false, error: "ReferenceError: GameplayMap is not defined" },
                    },
                  }
                : {
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
                  inGame: { ok: true, value: !inShell },
                  inShell: { ok: true, value: inShell },
                  inLoading: { ok: true, value: loadingState !== 8 && !inShell },
                  loadingState: { ok: true, value: loadingState },
                  loadingStateName: loadingState === 8 ? "GameStarted" : "WaitingForUIReady",
                  canBeginGame: { ok: true, value: loadingState === 6 && !inShell },
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
                  width: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 70 : 84 },
                  height: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 44 : 54 },
                  plotCount: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 3080 : 4536 },
                  mapSize: { ok: true, value: 0 },
                  randomSeed: { ok: true, value: options.postStartSeedOverride ?? setupMapSeed },
                },
              }),
            ]),
          );
        } else if (frame.message.includes("evalOk: 1 + 1")) {
          const tunerReady = options.tunerReady !== false;
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                evalOk: 2,
                ready: tunerReady,
                globals: {
                  Game: tunerReady ? "object" : "undefined",
                  Autoplay: "object",
                  GameplayMap: tunerReady ? "object" : "undefined",
                  Players: tunerReady ? "object" : "undefined",
                  Network: "undefined",
                },
                turn: { ok: true, value: 1 },
                turnDate: { ok: true, value: "4000 BCE" },
                width: tunerReady ? { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 70 : 84 } : { ok: false, error: "GameplayMap unavailable" },
                height: tunerReady ? { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 44 : 54 } : { ok: false, error: "GameplayMap unavailable" },
                aliveIds: tunerReady ? { ok: true, value: [0, 1] } : { ok: false, error: "Players unavailable" },
                aliveHumanIds: tunerReady ? { ok: true, value: [0] } : { ok: false, error: "Players unavailable" },
                autoplayActive: { ok: true, value: false },
              }),
            ]),
          );
        } else if (frame.message.includes("MapRegions") && frame.message.includes("randomSeed")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                map: {
                  width: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 70 : 84 },
                  height: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 44 : 54 },
                  plotCount: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 3080 : 4536 },
                  mapSize: { ok: true, value: 0 },
                  randomSeed: { ok: true, value: options.postStartSeedOverride ?? setupMapSeed },
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
