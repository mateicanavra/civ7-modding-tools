import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { join } from "node:path";
import { mkdtemp, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { describe, expect, test } from "vitest";
import {
  CIV7_SIGNED_INT_SEED_MAX,
  CIV7_RESTART_COMMAND,
  Civ7DirectControlError,
  assertCiv7ComponentId,
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
  getCiv7FeaturePlacementFeasibility,
  getCiv7GameInfoRows,
  getCiv7FullMapGrid,
  getCiv7MapGrid,
  getCiv7MapSummary,
  getCiv7PlayNotificationView,
  getCiv7NotificationDismissal,
  getCiv7PlotSnapshot,
  getCiv7PlayableStatus,
  getCiv7ResourceBuilderDiagnostics,
  getCiv7ResourcePlacementFeasibility,
  getCiv7SetupMapRows,
  getCiv7SetupSnapshot,
  getCiv7UnitTargetAction,
  getCiv7ReadyUnitView,
  getCiv7ReadyCityView,
  getCiv7VisibilitySummary,
  getCiv7AppUiSnapshot,
  inspectCiv7RuntimeApi,
  listCiv7SavedGameConfigurations,
  loadCiv7SavedGameConfiguration,
  prepareCiv7SinglePlayerSetup,
  parseCiv7TunerFrame,
  planCiv7MapGridReadBounds,
  requestCiv7ProductionChoice,
  queryCiv7TunerStates,
  requestCiv7UnitOperation,
  requestCiv7UnitTargetAction,
  requestCiv7NotificationDismissal,
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
  test("validates Civ7 ComponentID payloads through the shared TypeBox schema", () => {
    expect(assertCiv7ComponentId({ owner: 0, id: 131073, type: 1 })).toEqual({ owner: 0, id: 131073, type: 1 });
    expect(() => assertCiv7ComponentId({ owner: 0, type: 1 }, "--city-id")).toThrow(/--city-id must be a Civ7 ComponentID/);
  });

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

  test("rejects setup seeds Civ7 would wrap before mutating setup state", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await expect(
        prepareCiv7SinglePlayerSetup(
          {
            mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
            mapSize: "MAPSIZE_SMALL",
            seed: CIV7_SIGNED_INT_SEED_MAX + 1,
          },
          { host: "127.0.0.1", port, timeoutMs: 1_000 },
          { approved: true, reason: "test seed range policy" },
        ),
      ).rejects.toMatchObject({ code: "setup-parameter-invalid" });
      expect(server.received.some((message) => message.includes("editMap.setMapSeed"))).toBe(false);
    } finally {
      await server.close();
    }
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

  test("materializes play notifications with decision hints", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const view = await getCiv7PlayNotificationView({
        host: "127.0.0.1",
        port,
        timeoutMs: 1_000,
      });

      expect(view).toMatchObject({
        state: { id: "65535", name: "App UI" },
        localPlayerId: 0,
        blocker: { ok: true, value: -2026570723 },
        blockingNotificationId: { ok: true, value: { owner: 0, id: 42, type: 20 } },
        notifications: [
          {
            typeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
            isEndTurnBlocking: true,
            decision: {
              category: "town-focus",
              operationFamily: "city-command",
              operationType: "CHANGE_GROWTH_MODE",
              requiredInputs: expect.arrayContaining([
                expect.objectContaining({ name: "City" }),
              ]),
              commonActions: expect.arrayContaining([
                expect.objectContaining({ cli: expect.stringContaining("game play set-town-focus") }),
              ]),
            },
          },
        ],
        hud: {
          nextDecision: {
            category: "town-focus",
            isEndTurnBlocking: true,
          },
        },
      });
      expect(view.decisions.some((decision) => decision.category === "town-focus")).toBe(true);
      expect(server.received.some((message) => message.includes("readPlayNotifications"))).toBe(true);
      const notificationRead = server.received.find((message) => message.includes("readPlayNotifications")) ?? "";
      expect(notificationRead).toContain("CHOOSE_AUTO_NARRATIVE_STORY_DIRECTION");
      expect(notificationRead).toContain("getFirstPendingDiscoveryLastMetID");
    } finally {
      await server.close();
    }
  });

  test("plans and sends guarded notification dismissal", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const notificationId = { owner: 0, id: 113, type: 20 };
      const plan = await getCiv7NotificationDismissal(
        { notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );
      const request = await requestCiv7NotificationDismissal(
        { notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test reviewed notification dismissal" },
      );

      expect(plan).toMatchObject({
        notificationId,
        canDismiss: true,
        sent: false,
        before: {
          typeName: "NOTIFICATION_WONDER_COMPLETED",
          canUserDismiss: true,
          isEndTurnBlocking: { ok: true, value: true },
        },
      });
      expect(request).toMatchObject({
        notificationId,
        sent: true,
        verified: true,
        after: {
          isEndTurnBlocking: { ok: true, value: false },
        },
      });
      expect(request.verificationAttempts?.length).toBeGreaterThan(1);
      const dismissalReads = server.received.filter((message) => message.includes("readNotificationDismissal"));
      expect(dismissalReads.length).toBeGreaterThan(2);
      expect(dismissalReads.filter((message) => message.includes('"send":true'))).toHaveLength(1);
      expect(dismissalReads.filter((message) => message.includes('"send":false')).length).toBeGreaterThan(1);
    } finally {
      await server.close();
    }
  });

  test("does not verify dismissal from train absence while engine queue still fronts the target", async () => {
    const server = await startTunerServer({ notificationDismissalMode: "engine-front-train-absent" });
    try {
      const { port } = server.address();
      const notificationId = { owner: 0, id: 113, type: 20 };
      const request = await requestCiv7NotificationDismissal(
        { notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test stale engine-front notification dismissal" },
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(false);
      expect(request.after).toMatchObject({
        engineQueueContains: { ok: true, value: true },
        isEngineQueueFront: { ok: true, value: true },
        notificationTrainContains: { ok: true, value: false },
        isNotificationTrainFront: { ok: true, value: false },
      });
      expect(request.verificationAttempts?.length).toBeGreaterThan(1);
    } finally {
      await server.close();
    }
  });

  test("does not verify dismissal from dismissed flag while engine queue still fronts the target", async () => {
    const server = await startTunerServer({ notificationDismissalMode: "engine-front-dismissed" });
    try {
      const { port } = server.address();
      const notificationId = { owner: 0, id: 113, type: 20 };
      const request = await requestCiv7NotificationDismissal(
        { notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test dismissed flag with stale engine-front notification" },
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(false);
      expect(request.after).toMatchObject({
        dismissed: true,
        engineQueueContains: { ok: true, value: true },
        isEngineQueueFront: { ok: true, value: true },
      });
      expect(request.verificationAttempts?.length).toBeGreaterThan(1);
    } finally {
      await server.close();
    }
  });

  test("uses panel dismiss when blocker enum is none despite stale engine-front identity", async () => {
    const server = await startTunerServer({ notificationDismissalMode: "engine-front-none-blocker" });
    try {
      const { port } = server.address();
      const notificationId = { owner: 0, id: 113, type: 20 };
      const request = await requestCiv7NotificationDismissal(
        { notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test panel close control for none blocker enum" },
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(true);
      expect(request.result?.panelCloseControl).toMatchObject({
        ok: true,
        attempted: true,
        available: true,
        path: "Game.Notifications.dismiss",
      });
      expect(request.before).toMatchObject({
        endTurnBlockingType: { ok: true, value: 0 },
        isEngineQueueFront: { ok: true, value: true },
      });
      expect(request.after).toMatchObject({
        exists: false,
        engineQueueContains: { ok: true, value: false },
        isEngineQueueFront: { ok: true, value: false },
      });
    } finally {
      await server.close();
    }
  });

  test("uses panel dismiss for expired non-user-dismissible stale front notifications when blocker enum is none", async () => {
    const server = await startTunerServer({ notificationDismissalMode: "expired-engine-front-none-blocker" });
    try {
      const { port } = server.address();
      const notificationId = { owner: 0, id: 113, type: 20 };
      const plan = await getCiv7NotificationDismissal(
        { notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );
      const request = await requestCiv7NotificationDismissal(
        { notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test expired stale front panel close control" },
      );

      expect(plan).toMatchObject({
        canDismiss: true,
        before: {
          canUserDismiss: false,
          expired: true,
          endTurnBlockingType: { ok: true, value: 0 },
          isEngineQueueFront: { ok: true, value: true },
        },
      });
      expect(request.sent).toBe(true);
      expect(request.verified).toBe(true);
      expect(request.result?.panelCloseControl).toMatchObject({
        ok: true,
        attempted: true,
        available: true,
        path: "Game.Notifications.dismiss",
      });
      expect(request.after).toMatchObject({
        exists: false,
        engineQueueContains: { ok: true, value: false },
        isEngineQueueFront: { ok: true, value: false },
      });
    } finally {
      await server.close();
    }
  });

  test("plans and sends unit target actions through official target order", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const unitId = { owner: 0, id: 65536, type: 26 };
      const plan = await getCiv7UnitTargetAction(
        { unitId, x: 23, y: 33 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );
      const request = await requestCiv7UnitTargetAction(
        { unitId, x: 23, y: 33 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test unit target action" },
      );

      expect(plan).toMatchObject({
        unitId,
        target: { x: 23, y: 33 },
        selected: {
          family: "unit-operation",
          operationType: "UNITOPERATION_RANGE_ATTACK",
        },
        sent: false,
      });
      expect(request.sent).toBe(true);
      expect(request.verified).toBe(true);
      expect(server.received.filter((message) => message.includes("readUnitTargetAction"))).toHaveLength(2);
    } finally {
      await server.close();
    }
  });

  test("reports sent unit target no-ops as unverified postcondition misses", async () => {
    const server = await startTunerServer({ unitTargetMode: "no-op-after-send" });
    try {
      const { port } = server.address();
      const unitId = { owner: 0, id: 65536, type: 26 };
      const request = await requestCiv7UnitTargetAction(
        { unitId, x: 23, y: 33 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test no-op unit target action" },
      );

      expect(request.selected).toMatchObject({
        family: "unit-operation",
        operationType: "UNITOPERATION_NAVAL_ATTACK",
      });
      expect(request.sent).toBe(true);
      expect(request.verified).toBe(false);
      expect(request.verification).toMatchObject({
        status: "no-state-change",
        unitChanged: false,
        targetUnitsChanged: false,
      });
      expect(request.verification?.reason).toMatch(/re-read .* before repeating/);
    } finally {
      await server.close();
    }
  });

  test("reads the first ready unit view without sending operations", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const view = await getCiv7ReadyUnitView({}, {
        host: "127.0.0.1",
        port,
        timeoutMs: 1_000,
      });

      expect(view).toMatchObject({
        state: { id: "65535", name: "App UI" },
        unitId: { owner: 0, id: 458752, type: 26 },
        legalOperations: [
          {
            family: "unit-operation",
            operationType: "SKIP_TURN",
            valid: true,
          },
        ],
      });
      expect(server.received.some((message) => message.includes("readReadyUnitView"))).toBe(true);
      expect(server.received.some((message) => message.includes("sendRequest"))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("reads ready-city view for city blockers without sending operations", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const view = await getCiv7ReadyCityView({}, {
        host: "127.0.0.1",
        port,
        timeoutMs: 1_000,
      });

      expect(view).toMatchObject({
        state: { id: "65535", name: "App UI" },
        localPlayerId: 0,
        requestedCityId: null,
        selectedCityId: { ok: true, value: { owner: 0, id: 131073, type: 1 } },
        cityId: { owner: 0, id: 131073, type: 1 },
        city: {
          ok: true,
          value: {
            id: { owner: 0, id: 131073, type: 1 },
            identity: {
              source: "Players.Cities.getCityIds",
              ok: true,
            },
            name: "Dur-Sharrukin",
            isTown: true,
            population: 4,
          },
        },
        legalOperations: [
          expect.objectContaining({
            family: "city-operation",
            operationType: "CONSIDER_TOWN_PROJECT",
          }),
        ],
      });
      expect(view.notes.some((note) => note.includes("does not choose production"))).toBe(true);
      expect(view.populationPlacement.ok && view.populationPlacement.value?.cliHints).toContain(
        "game play expand-city --city-id '<city-id>' --x <x> --y <y>",
      );
      expect(server.received.some((message) => message.includes("readReadyCityView"))).toBe(true);
      expect(server.received.some((message) => message.includes('source: "Players.Cities.getCityIds"'))).toBe(true);
      expect(server.received.some((message) => message.includes("toComponentId(city.id ?? cityId) ?? cityId"))).toBe(false);
      expect(server.received.some((message) => message.includes("sendRequest"))).toBe(false);
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
        {
          x: 3,
          y: 4,
          playerId: 0,
          fields: ["terrain", "resource", "hydrology", "visibility"],
        },
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
          riverType: { ok: true, value: -1 },
          water: { ok: true, value: false },
          lake: { ok: true, value: false },
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

  test("plans full-grid map reads without exceeding the per-read cap", () => {
    const chunks = planCiv7MapGridReadBounds({ x: 0, y: 0, width: 106, height: 66 }, 512);

    expect(chunks.length).toBe(17);
    expect(chunks[0]).toEqual({ x: 0, y: 0, width: 106, height: 4 });
    expect(chunks.at(-1)).toEqual({ x: 0, y: 64, width: 106, height: 2 });
    expect(chunks.reduce((sum, chunk) => sum + chunk.width * chunk.height, 0)).toBe(6996);
    expect(chunks.every((chunk) => chunk.width * chunk.height <= 512)).toBe(true);
  });

  test("wraps full-grid map reads through bounded chunks", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const grid = await getCiv7FullMapGrid(
        {
          bounds: { x: 0, y: 0, width: 6, height: 4 },
          fields: ["terrain"],
          maxPlotsPerRead: 10,
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );

      expect(grid.bounds).toEqual({ x: 0, y: 0, width: 6, height: 4 });
      expect(grid.plotCount).toBe(24);
      expect(grid.omitted).toBe(0);
      expect(grid.identityCheck).toEqual({
        stable: true,
        checked: ["map.width", "map.height", "map.plotCount", "map.randomSeed", "game.turn", "game.hash"],
      });
      expect(grid.chunks).toEqual([
        { bounds: { x: 0, y: 0, width: 6, height: 1 }, plotCount: 6, omitted: 0 },
        { bounds: { x: 0, y: 1, width: 6, height: 1 }, plotCount: 6, omitted: 0 },
        { bounds: { x: 0, y: 2, width: 6, height: 1 }, plotCount: 6, omitted: 0 },
        { bounds: { x: 0, y: 3, width: 6, height: 1 }, plotCount: 6, omitted: 0 },
      ]);
      expect(grid.plots).toHaveLength(24);
      expect(server.received.filter((message) => message.includes("locationsFromBounds")).length).toBe(4);
      expect(server.received.filter((message) => message.includes("MapRegions") && message.includes("randomSeed")).length).toBe(2);
    } finally {
      await server.close();
    }
  });

  test("rejects full-grid map reads when live identity changes between chunks", async () => {
    const server = await startTunerServer({ mapSummaryHashes: [0, 1] });
    try {
      const { port } = server.address();
      await expect(getCiv7FullMapGrid(
        {
          bounds: { x: 0, y: 0, width: 6, height: 4 },
          fields: ["terrain"],
          maxPlotsPerRead: 10,
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      )).rejects.toMatchObject({
        code: "command-failed",
        message: expect.stringContaining("Civ7 full-grid identity changed during read: game.hash 0 -> 1"),
      });
    } finally {
      await server.close();
    }
  });

  test("wraps resource placement feasibility through ResourceBuilder", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const feasibility = await getCiv7ResourcePlacementFeasibility(
        {
          cells: [
            { x: 9, y: 9, resourceTypes: [3, 12] },
            { x: 10, y: 9, resourceTypes: [53] },
          ],
          maxCells: 1,
          maxResourceTypesPerCell: 1,
          ignoreWeight: true,
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );

      expect(feasibility).toMatchObject({
        cellCount: 2,
        omittedCells: 1,
        ignoreWeight: true,
        cells: [
          {
            location: { x: 9, y: 9, index: { ok: true, value: 765 } },
            resourceTypes: [3],
            omittedResourceTypes: 1,
            feasibility: {
              "3": { ok: true, value: true },
            },
          },
        ],
      });
      expect(server.received.some((message) => message.includes("ResourceBuilder"))).toBe(true);
      expect(server.received.some((message) => message.includes("readResourcePlacementFeasibility"))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test("wraps feature placement feasibility through TerrainBuilder", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const feasibility = await getCiv7FeaturePlacementFeasibility(
        {
          cells: [
            { x: 48, y: 6, featureTypes: [11, 35] },
            { x: 49, y: 13, featureTypes: [35] },
          ],
          maxCells: 1,
          maxFeatureTypesPerCell: 1,
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );

      expect(feasibility).toMatchObject({
        cellCount: 2,
        omittedCells: 1,
        cells: [
          {
            location: { x: 48, y: 6, index: { ok: true, value: 684 } },
            featureTypes: [11],
            omittedFeatureTypes: 1,
            feasibility: {
              "11": { ok: true, value: false },
            },
          },
        ],
      });
      expect(server.received.some((message) => message.includes("TerrainBuilder"))).toBe(true);
      expect(server.received.some((message) => message.includes("readFeaturePlacementFeasibility"))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test("wraps ResourceBuilder diagnostics through package-owned readback", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const diagnostics = await getCiv7ResourceBuilderDiagnostics(
        {
          cells: [
            { x: 9, y: 9, resourceTypes: [3, 12] },
            { x: 10, y: 9, resourceTypes: [53] },
          ],
          resourceTypes: [53],
          maxCells: 1,
          maxResourceTypesPerCell: 1,
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );

      expect(diagnostics).toMatchObject({
        cellCount: 2,
        omittedCells: 1,
        resources: [
          {
            resourceType: 3,
            row: { ok: true, value: expect.objectContaining({ ResourceType: "RESOURCE_CLAY" }) },
            hash: { ok: true, value: 333 },
            count: { ok: true, value: 7 },
            landmass: { ok: true, value: 255 },
            validForAge: { ok: true, value: true },
            requiredForAge: { ok: true, value: false },
            ignoringWeightForRiverPlacement: { ok: true, value: false },
          },
          {
            resourceType: 53,
            row: { ok: true, value: expect.objectContaining({ ResourceType: "RESOURCE_SUGAR" }) },
            hash: { ok: true, value: 555 },
            count: { ok: true, value: 9 },
          },
        ],
        cells: [
          {
            location: { x: 9, y: 9, index: { ok: true, value: 765 } },
            resourceTypes: [3],
            omittedResourceTypes: 1,
            resources: {
              "3": {
                canHaveResource: {
                  strict: { ok: true, value: false },
                  ignoreWeight: { ok: true, value: true },
                },
                resourceLandmassAtCell: { ok: true, value: 255 },
                bestMapResourceCutHashes: { ok: true, value: [333, 444] },
                bestMapResourceCuts: {
                  ok: true,
                  value: [
                    expect.objectContaining({ hash: 333, resourceType: 3, resourceTypeName: "RESOURCE_CLAY" }),
                    expect.objectContaining({ hash: 444, resourceType: 12, resourceTypeName: "RESOURCE_RICE" }),
                  ],
                },
              },
            },
          },
        ],
      });
      expect(server.received.some((message) => message.includes("getBestMapResourceCuts"))).toBe(true);
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
      expect(snapshot.snapshot.config.playerCount).toEqual({ ok: true, value: 8 });
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

  test("blocks setup preparation when Civ7 refuses a saved game configuration load", async () => {
    const server = await startTunerServer({ savedConfigLoadOk: false });
    try {
      const { port } = server.address();
      await expect(
        prepareCiv7SinglePlayerSetup(
          {
            mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
            mapSize: "MAPSIZE_SMALL",
            seed: 222,
            savedConfig: {
              id: "tot-config",
              displayName: "ToT Config",
              fileName: "ToT Config.Civ7Cfg",
              path: "/tmp/ToT Config.Civ7Cfg",
            },
          },
          { host: "127.0.0.1", port, timeoutMs: 1_000 },
          { approved: true, reason: "test failed saved config load" },
        ),
      ).rejects.toMatchObject({ code: "setup-config-load-failed" });
      expect(server.received.some((message) => message.includes("Network.loadGame") && message.includes("GAME_CONFIGURATION"))).toBe(true);
      expect(server.received.some((message) => message.includes("editMap.setScript"))).toBe(false);
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
      expect(request.verified).toBe(true);
      expect(request.postcondition).toMatchObject({
        family: "unit-operation",
        operationType: "SKIP_TURN",
        classification: "queue-advanced",
      });
      expect(server.received.filter((message) => message.includes("return JSON.stringify(sendOperation")).length).toBe(1);
    } finally {
      await server.close();
    }
  });

  test("requests production choices through the official App UI production path", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const cityId = { owner: 0, id: 65536, type: 1 };
      const request = await requestCiv7ProductionChoice(
        { cityId, args: { ConstructibleType: 713967338, X: 22, Y: 31 } },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test official production choice" },
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(true);
      expect(request.productionPostcondition).toMatchObject({
        classification: "production-choice-cleared",
        blockerStillLive: false,
      });
      expect(request.payload?.ui?.cityActivation).toMatchObject({ ok: true });
      expect(request.payload?.ui?.interfaceClose).toMatchObject({ ok: true });
      expect(server.received.some((message) => message.includes("readProductionChoice"))).toBe(true);
      expect(server.received.some((message) => message.includes("UI?.Player?.selectCity"))).toBe(true);
      expect(server.received.some((message) => message.includes("InterfaceMode?.switchToDefault"))).toBe(true);
      expect(server.received.some((message) => message.includes("return JSON.stringify(sendOperation"))).toBe(false);
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

function extractMapGridInput(message: string):
  | {
      bounds?: { x: number; y: number; width: number; height: number };
      fields?: string[];
      maxPlots?: number;
    }
  | undefined {
  const marker = "const input = ";
  const start = message.indexOf(marker);
  if (start < 0) return undefined;
  const afterMarker = message.slice(start + marker.length);
  const endMarker = ";\n    const width";
  const end = afterMarker.indexOf(endMarker);
  if (end < 0) return undefined;
  try {
    const parsed = JSON.parse(afterMarker.slice(0, end)) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;
    return parsed as {
      bounds?: { x: number; y: number; width: number; height: number };
      fields?: string[];
      maxPlots?: number;
    };
  } catch {
    return undefined;
  }
}

async function startTunerServer(options: {
  restartOutput?: string;
  initialInShell?: boolean;
  closeOnSetupMutation?: boolean;
  closeOnBegin?: boolean;
  savedConfigLoadOk?: boolean;
  postStartSeedOverride?: number;
  hiddenMapScript?: string;
  revealHiddenMapRowOnShellExit?: boolean;
  appUiOnlyStates?: boolean;
  appUiSnapshotWithoutGameplayGlobals?: boolean;
  tunerReady?: boolean;
  mapSummaryHashes?: ReadonlyArray<number>;
  unitTargetMode?: "verified" | "no-op-after-send";
  notificationDismissalMode?: "verified" | "engine-front-train-absent" | "engine-front-dismissed" | "engine-front-none-blocker" | "expired-engine-front-none-blocker";
} = {}) {
  const received: string[] = [];
  let loadingState = 6;
  let inShell = options.initialInShell ?? true;
  let revealedCount = 10;
  let mapSummaryReadCount = 0;
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
  let notificationDismissalSent = false;
  let productionChoiceSent = false;
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
      playerCount: { ok: true, value: 8 },
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
          if (options.savedConfigLoadOk === false) {
            socket.write(encodeResponse(frame.listenerId, ['{"ok":false,"serverType":0}']));
          } else {
            setupDifficulty = "DIFFICULTY_CUSTOM";
            setupLeader = "LEADER_ALEXANDER";
            setupCivilization = "CIVILIZATION_GREECE";
            setupPlayerDifficulty = "DIFFICULTY_CUSTOM";
            setupRevision += 1;
            socket.write(encodeResponse(frame.listenerId, ['{"ok":true,"serverType":0}']));
          }
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
        } else if (frame.message.includes("readPlayNotifications")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                localPlayerId: 0,
                turn: { ok: true, value: 80 },
                turnDate: { ok: true, value: "2025 BCE" },
                hasSentTurnComplete: { ok: true, value: false },
                canEndTurn: { ok: true, value: false },
                blocker: { ok: true, value: -2026570723 },
                blockingNotificationId: { ok: true, value: { owner: 0, id: 42, type: 20 } },
                selectedUnitId: { ok: true, value: null },
                selectedCityId: { ok: true, value: { owner: 0, id: 131073, type: 1 } },
                firstReadyUnitId: { ok: true, value: null },
                notifications: [
                  {
                    id: { owner: 0, id: 42, type: 20 },
                    type: -123,
                    typeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
                    groupType: null,
                    summary: "Choose Town Project",
                    message: "Choose a town focus project",
                    target: { owner: 0, id: 131073, type: 1 },
                    location: null,
                    canUserDismiss: false,
                    expired: false,
                    dismissed: false,
                    isEndTurnBlocking: true,
                    decision: {
                      category: "town-focus",
                      operationFamily: "city-command",
                      operationType: "CHANGE_GROWTH_MODE",
                      argsShape: "{ Type, ProjectType, City }",
                      cli: "game play set-town-focus",
                      requiredInputs: [
                        { name: "City", source: "notification target or selected city", required: true },
                        { name: "Type", source: "live town focus option", required: true },
                        { name: "ProjectType", source: "live town focus option", required: true },
                      ],
                      commonActions: [
                        {
                          label: "set town focus and close review",
                          cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type> --send --closeout --reason '<why this focus was selected>'",
                          operationFamily: "sequence",
                          operationType: "CHANGE_GROWTH_MODE then CONSIDER_TOWN_PROJECT",
                          argsShape: "{ Type, ProjectType, City } then {}",
                          when: "when the selected focus should be applied and the blocker closed as one caller workflow",
                        },
                        {
                          label: "set town focus",
                          cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type>",
                          operationFamily: "city-command",
                          operationType: "CHANGE_GROWTH_MODE",
                          argsShape: "{ Type, ProjectType, City }",
                          when: "after selecting the focus from live options",
                        },
                      ],
                      confidence: "live-proof",
                      notes: ["Town focus is not city-operation BUILD; use --closeout when one caller action should apply the focus and clear the review surface."],
                    },
                  },
                ],
                decisions: [
                  {
                    category: "town-focus",
                    operationFamily: "city-command",
                    operationType: "CHANGE_GROWTH_MODE",
                    argsShape: "{ Type, ProjectType, City }",
                    cli: "game play set-town-focus",
                    requiredInputs: [
                      { name: "City", source: "notification target or selected city", required: true },
                      { name: "Type", source: "live town focus option", required: true },
                      { name: "ProjectType", source: "live town focus option", required: true },
                    ],
                    commonActions: [
                      {
                        label: "set town focus and close review",
                        cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type> --send --closeout --reason '<why this focus was selected>'",
                        operationFamily: "sequence",
                        operationType: "CHANGE_GROWTH_MODE then CONSIDER_TOWN_PROJECT",
                        argsShape: "{ Type, ProjectType, City } then {}",
                        when: "when the selected focus should be applied and the blocker closed as one caller workflow",
                      },
                      {
                        label: "set town focus",
                        cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type>",
                        operationFamily: "city-command",
                        operationType: "CHANGE_GROWTH_MODE",
                        argsShape: "{ Type, ProjectType, City }",
                        when: "after selecting the focus from live options",
                      },
                    ],
                    confidence: "live-proof",
                    notes: ["Town focus is not city-operation BUILD; use --closeout when one caller action should apply the focus and clear the review surface."],
                  },
                ],
                hud: {
                  nextDecision: {
                    notificationId: { owner: 0, id: 42, type: 20 },
                    isEndTurnBlocking: true,
                    typeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
                    summary: "Choose Town Project",
                    message: "Choose a town focus project",
                    target: { owner: 0, id: 131073, type: 1 },
                    location: null,
                    category: "town-focus",
                    operationFamily: "city-command",
                    operationType: "CHANGE_GROWTH_MODE",
                    argsShape: "{ Type, ProjectType, City }",
                    cli: "game play set-town-focus",
                    requiredInputs: [
                      { name: "City", source: "notification target or selected city", required: true },
                      { name: "Type", source: "live town focus option", required: true },
                      { name: "ProjectType", source: "live town focus option", required: true },
                    ],
                    commonActions: [],
                    notes: ["Town focus is not city-operation BUILD; use --closeout when one caller action should apply the focus and clear the review surface."],
                  },
                  decisionQueue: [
                    {
                      notificationId: { owner: 0, id: 42, type: 20 },
                      isEndTurnBlocking: true,
                      typeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
                      summary: "Choose Town Project",
                      message: "Choose a town focus project",
                      target: { owner: 0, id: 131073, type: 1 },
                      location: null,
                      category: "town-focus",
                      operationFamily: "city-command",
                      operationType: "CHANGE_GROWTH_MODE",
                      argsShape: "{ Type, ProjectType, City }",
                      cli: "game play set-town-focus",
                      requiredInputs: [
                        { name: "City", source: "notification target or selected city", required: true },
                        { name: "Type", source: "live town focus option", required: true },
                        { name: "ProjectType", source: "live town focus option", required: true },
                      ],
                      commonActions: [],
                      notes: ["Town focus is not city-operation BUILD; use --closeout when one caller action should apply the focus and clear the review surface."],
                    },
                  ],
                },
                limits: { maxNotifications: 25, truncated: false },
              }),
            ]),
          );
        } else if (frame.message.includes("readUnitTargetAction")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(unitTargetAction(frame.message.includes('"send":true'), options.unitTargetMode))]));
        } else if (frame.message.includes("readReadyUnitView")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(readyUnitView())]));
        } else if (frame.message.includes("readReadyCityView")) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(readyCityView())]));
        } else if (frame.message.includes("readNotificationDismissal")) {
          const send = frame.message.includes('"send":true');
          if (send) notificationDismissalSent = true;
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(notificationDismissal(
            send,
            notificationDismissalSent && !send,
            options.notificationDismissalMode ?? "verified",
          ))]));
        } else if (frame.message.includes("readProductionChoice")) {
          const send = frame.message.includes('"send":true');
          if (send) productionChoiceSent = true;
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(productionChoicePayload(send, productionChoiceSent && !send))]));
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
	          const mapSummaryHash = options.mapSummaryHashes?.[mapSummaryReadCount] ?? 0;
	          mapSummaryReadCount += 1;
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
	                  hash: { ok: true, value: mapSummaryHash },
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
          const gridInput = extractMapGridInput(frame.message);
          const bounds = gridInput?.bounds ?? { x: 0, y: 0, width: 10_000, height: 10_000 };
          const fields = gridInput?.fields ?? ["terrain"];
          const maxPlots = gridInput?.maxPlots ?? 1;
          const plotCount = bounds.width * bounds.height;
          const selectedPlots = [];
          outer: for (let y = bounds.y; y < bounds.y + bounds.height; y += 1) {
            for (let x = bounds.x; x < bounds.x + bounds.width; x += 1) {
              selectedPlots.push({
                location: { x, y, index: { ok: true, value: y * 84 + x } },
                hiddenInfoPolicy: "not-player-scoped",
                facts: {
                  terrain: { ok: true, value: 4 },
                  ...(fields.includes("biome") ? { biome: { ok: true, value: 1 } } : {}),
                  ...(fields.includes("feature") ? { feature: { ok: true, value: -1 } } : {}),
                  ...(fields.includes("resource") ? { resource: { ok: true, value: -1 } } : {}),
                  ...(fields.includes("hydrology") ? { riverType: { ok: true, value: -1 }, water: { ok: true, value: false }, lake: { ok: true, value: false } } : {}),
                },
              });
              if (selectedPlots.length >= maxPlots) break outer;
            }
          }
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                bounds,
                fields,
                plotCount,
                omitted: Math.max(0, plotCount - selectedPlots.length),
                hiddenInfoPolicy: "not-player-scoped",
                map: { width: { ok: true, value: 84 }, height: { ok: true, value: 54 } },
                plots: selectedPlots,
              }),
            ]),
          );
        } else if (frame.message.includes("readResourcePlacementFeasibility")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                cellCount: 2,
                omittedCells: 1,
                ignoreWeight: true,
                cells: [
                  {
                    location: { x: 9, y: 9, index: { ok: true, value: 765 } },
                    resourceTypes: [3],
                    omittedResourceTypes: 1,
                    feasibility: {
                      "3": { ok: true, value: true },
                    },
                  },
                ],
              }),
            ]),
          );
        } else if (frame.message.includes("readFeaturePlacementFeasibility")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                cellCount: 2,
                omittedCells: 1,
                cells: [
                  {
                    location: { x: 48, y: 6, index: { ok: true, value: 684 } },
                    featureTypes: [11],
                    omittedFeatureTypes: 1,
                    feasibility: {
                      "11": { ok: true, value: false },
                    },
                  },
                ],
              }),
            ]),
          );
        } else if (frame.message.includes("readCellResource")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                cellCount: 2,
                omittedCells: 1,
                resources: [
                  {
                    resourceType: 3,
                    row: { ok: true, value: { $index: 3, $hash: 333, ResourceType: "RESOURCE_CLAY" } },
                    hash: { ok: true, value: 333 },
                    count: { ok: true, value: 7 },
                    landmass: { ok: true, value: 255 },
                    validForAge: { ok: true, value: true },
                    requiredForAge: { ok: true, value: false },
                    ignoringWeightForRiverPlacement: { ok: true, value: false },
                  },
                  {
                    resourceType: 53,
                    row: { ok: true, value: { $index: 53, $hash: 555, ResourceType: "RESOURCE_SUGAR" } },
                    hash: { ok: true, value: 555 },
                    count: { ok: true, value: 9 },
                    landmass: { ok: true, value: 255 },
                    validForAge: { ok: true, value: true },
                    requiredForAge: { ok: true, value: false },
                    ignoringWeightForRiverPlacement: { ok: true, value: false },
                  },
                ],
                cells: [
                  {
                    location: { x: 9, y: 9, index: { ok: true, value: 765 } },
                    resourceTypes: [3],
                    omittedResourceTypes: 1,
                    resources: {
                      "3": {
                        canHaveResource: {
                          strict: { ok: true, value: false },
                          ignoreWeight: { ok: true, value: true },
                        },
                        resourceLandmassAtCell: { ok: true, value: 255 },
                        bestMapResourceCutHashes: { ok: true, value: [333, 444] },
                        bestMapResourceCuts: {
                          ok: true,
                          value: [
                            { hash: 333, resourceType: 3, resourceTypeName: "RESOURCE_CLAY" },
                            { hash: 444, resourceType: 12, resourceTypeName: "RESOURCE_RICE" },
                          ],
                        },
                      },
                    },
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
                  riverType: { ok: true, value: -1 },
                  water: { ok: true, value: false },
                  lake: { ok: true, value: false },
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
                beforePostcondition: unitOperationPostconditionSnapshot({ owner: 0, id: 65536, type: 26 }),
                afterPostcondition: unitOperationPostconditionSnapshot({ owner: 0, id: 131072, type: 26 }),
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

function unitTargetAction(send: boolean, mode: "verified" | "no-op-after-send" = "verified") {
  const unitId = { owner: 0, id: 65536, type: 26 };
  const beforeUnit = { ok: true, value: { id: unitId, location: { x: 22, y: 33 }, movementMovesRemaining: 2, attacksRemaining: 1 } };
  const beforeTargetUnits = { ok: true, value: [{ owner: 62, id: 123, type: 26 }] };
  const noOp = mode === "no-op-after-send";
  return {
    unitId,
    target: { x: 23, y: 33, index: { ok: true, value: 1457 } },
    beforeUnit,
    beforeTargetUnits,
    candidates: [
      {
        family: "unit-operation",
        operationType: "UNITOPERATION_NAVAL_ATTACK",
        args: { X: 23, Y: 33, Modifiers: 3 },
        valid: noOp,
        result: { Success: noOp, ...(noOp ? { Plots: [1457] } : {}) },
        targetInReturnedPlots: noOp ? true : null,
      },
      {
        family: "unit-operation",
        operationType: "UNITOPERATION_RANGE_ATTACK",
        args: { X: 23, Y: 33, Modifiers: 3 },
        valid: true,
        result: { Success: true, Plots: [1457] },
        targetInReturnedPlots: true,
      },
    ],
    selected: {
      family: "unit-operation",
      operationType: noOp ? "UNITOPERATION_NAVAL_ATTACK" : "UNITOPERATION_RANGE_ATTACK",
      args: { X: 23, Y: 33, Modifiers: 3 },
      valid: true,
      result: { Success: true, Plots: [1457] },
      targetInReturnedPlots: true,
    },
    sent: send,
    ...(send
      ? {
          sendResult: { accepted: true },
          afterUnit: noOp
            ? beforeUnit
            : { ok: true, value: { id: unitId, location: { x: 22, y: 33 }, movementMovesRemaining: 2, attacksRemaining: 0 } },
          afterTargetUnits: beforeTargetUnits,
          verified: !noOp,
          verification: {
            status: noOp ? "no-state-change" : "verified",
            unitChanged: !noOp,
            targetUnitsChanged: false,
            reason: noOp
              ? "send returned but unit and target-plot probes did not change; re-read before repeating"
              : "unit or target-plot state changed after send",
          },
        }
      : {
          verification: {
            status: "not-sent",
            unitChanged: false,
            targetUnitsChanged: false,
            reason: "read-only target resolution; use --send with an approval reason to mutate",
          },
        }),
    notes: ["Selection follows the official right-click WorldInput target order."],
  };
}

function unitOperationPostconditionSnapshot(firstReadyUnitId: { owner: number; id: number; type: number }) {
  return {
    unit: {
      ok: true,
      value: {
        id: { owner: 0, id: 65536, type: 26 },
        location: { x: 22, y: 33 },
        movement: 2,
        activity: "UNIT_ACTIVITY_AWAKE",
        damage: 0,
        attacks: 1,
      },
    },
    selectedUnitId: { ok: true, value: { owner: 0, id: 65536, type: 26 } },
    firstReadyUnitId: { ok: true, value: firstReadyUnitId },
    blocker: { ok: true, value: 0 },
  };
}

function readyUnitView() {
  const unitId = { owner: 0, id: 458752, type: 26 };
  return {
    localPlayerId: 0,
    requestedUnitId: null,
    selectedUnitId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: unitId },
    unitId,
    unit: {
      ok: true,
      value: {
        id: unitId,
        owner: 0,
        type: 111,
        typeName: "UNIT_ARMY_COMMANDER",
        location: { x: 22, y: 31 },
        movementMovesRemaining: 2,
        attacksRemaining: 0,
        damage: 0,
        hitPoints: 100,
      },
    },
    legalOperations: [
      {
        family: "unit-operation",
        operationType: "SKIP_TURN",
        enumValue: 1,
        valid: true,
        result: { Success: true },
      },
    ],
    nearby: {
      ok: true,
      value: [
        {
          x: 22,
          y: 31,
          units: [{ id: unitId, owner: 0, typeName: "UNIT_ARMY_COMMANDER" }],
        },
      ],
    },
    notes: ["Read-only ready-unit view. Use operation validation before any send."],
  };
}

function readyCityView() {
  const cityId = { owner: 0, id: 131073, type: 1 };
  return {
    localPlayerId: 0,
    requestedCityId: null,
    selectedCityId: { ok: true, value: cityId },
    blockingCityId: { ok: true, value: cityId },
    cityId,
    city: {
      ok: true,
      value: {
        id: cityId,
        owner: 0,
        identity: {
          source: "Players.Cities.getCityIds",
          ok: true,
          observedCityId: cityId,
          reason: null,
        },
        name: "Dur-Sharrukin",
        location: { x: 22, y: 31 },
        population: 4,
        isTown: true,
        growth: { growthType: -284569333, turnsUntilGrowth: 3 },
        buildQueue: { currentProductionTypeHash: null, turnsLeft: null },
      },
    },
    legalOperations: [
      {
        family: "city-operation",
        operationType: "CONSIDER_TOWN_PROJECT",
        enumValue: 1,
        valid: true,
        result: { Success: true },
      },
    ],
    productionCandidates: {
      ok: true,
      value: [
        {
          kind: "constructible",
          type: 713967338,
          typeName: "BUILDING_WALLS",
          name: "LOC_BUILDING_WALLS_NAME",
          args: { ConstructibleType: 713967338 },
          valid: true,
          result: { Success: true, Plots: [1457] },
          placementPlots: [{ index: 1457, x: 22, y: 31 }],
          cli: "game play build-production --city-id '<city-id>' --constructible-type 713967338 --x <x> --y <y>",
        },
      ],
    },
    townFocusOptions: {
      ok: true,
      value: [
        {
          name: "LOC_PROJECT_FISHING_TOWN_NAME",
          description: "LOC_PROJECT_FISHING_TOWN_DESCRIPTION",
          args: { Type: -284569333, ProjectType: -548685232, City: 131073 },
          valid: true,
          result: { Success: true },
          cli: "game play set-town-focus --city-id '<city-id>' --growth-type -284569333 --project-type -548685232",
        },
      ],
    },
    populationPlacement: {
      ok: true,
      value: {
        isReadyToPlacePopulation: { ok: true, value: true },
        cityWorkerCap: { ok: true, value: 4 },
        allPlacementInfo: { ok: true, value: [{ PlotIndex: 1457, IsBlocked: false }] },
        workablePlotIndexes: { ok: true, value: [1457] },
        blockedPlotIndexes: { ok: true, value: [] },
        cliHints: [
          "game play assign-worker --player-id <id> --location <plot-index>",
          "game play expand-city --city-id '<city-id>' --x <x> --y <y>",
        ],
      },
    },
    notes: ["Read-only ready-city view. This view intentionally does not choose production."],
  };
}

function notificationDismissal(
  send: boolean,
  settled = false,
  mode: "verified" | "engine-front-train-absent" | "engine-front-dismissed" | "engine-front-none-blocker" | "expired-engine-front-none-blocker" = "verified",
) {
  const notificationId = { owner: 0, id: 113, type: 20 };
  const trainAbsent = mode === "engine-front-train-absent";
  const noneBlocker = mode === "engine-front-none-blocker" || mode === "expired-engine-front-none-blocker";
  const expiredNonDismissible = mode === "expired-engine-front-none-blocker";
  const present = {
    id: notificationId,
    exists: true,
    type: 2091697919,
    typeName: "NOTIFICATION_WONDER_COMPLETED",
    summary: "An unmet player has finished constructing the World Wonder Great Stele.",
    message: "Wonder Completed",
    target: { owner: -1, id: -1, type: 0 },
    location: { x: -9999, y: -9999 },
    canUserDismiss: !expiredNonDismissible,
    expired: expiredNonDismissible,
    dismissed: false,
    blocksTurnAdvancement: { ok: true, value: true },
    endTurnBlockingType: { ok: true, value: noneBlocker ? 0 : 2091697919 },
    isEndTurnBlocking: { ok: true, value: true },
    engineQueueCount: { ok: true, value: 1 },
    engineQueueContains: { ok: true, value: true },
    engineQueueFirstId: { ok: true, value: notificationId },
    isEngineQueueFront: { ok: true, value: true },
    notificationTrainCount: { ok: true, value: trainAbsent ? 0 : 1 },
    notificationTrainContains: { ok: true, value: !trainAbsent },
    notificationTrainFirstId: { ok: true, value: trainAbsent ? null : notificationId },
    isNotificationTrainFront: { ok: true, value: !trainAbsent },
  };
  const cleared = {
    ...present,
    exists: false,
    dismissed: true,
    blocksTurnAdvancement: { ok: true, value: false },
    endTurnBlockingType: { ok: true, value: 0 },
    isEndTurnBlocking: { ok: true, value: false },
    engineQueueCount: { ok: true, value: 0 },
    engineQueueContains: { ok: true, value: false },
    engineQueueFirstId: { ok: true, value: null },
    isEngineQueueFront: { ok: true, value: false },
    notificationTrainCount: { ok: true, value: 0 },
    notificationTrainContains: { ok: true, value: false },
    notificationTrainFirstId: { ok: true, value: null },
    isNotificationTrainFront: { ok: true, value: false },
  };
  const engineFrontDismissed = {
    ...present,
    dismissed: true,
  };
  const current = mode === "engine-front-train-absent"
    ? present
    : mode === "engine-front-dismissed"
      ? engineFrontDismissed
      : settled
        ? cleared
        : present;
  return {
    notificationId,
    before: current,
    after: send ? present : null,
    canDismiss: true,
    sent: send,
    result: send
      ? {
          notificationTrainManager: {
            ok: true,
            attempted: true,
            available: true,
            path: "NotificationModel.manager.dismiss",
          },
          panelCloseControl: noneBlocker
            ? {
                ok: true,
                attempted: true,
                available: true,
                path: "Game.Notifications.dismiss",
                value: true,
              }
            : {
                ok: false,
                attempted: false,
                available: false,
                path: "Game.Notifications.dismiss",
                reason: "official panel close control does not dismiss the active end-turn blocker",
              },
        }
      : null,
    verificationAttempts: send ? [present] : [],
    verified: false,
    notes: ["This is an App UI notification action, not a gameplay operation family."],
  };
}

function productionChoicePayload(send: boolean, settled = false) {
  const cityId = { owner: 0, id: 65536, type: 1 };
  const before = productionPostconditionSnapshot("before", "cleared");
  const after = productionPostconditionSnapshot(settled || send ? "after" : "before", "cleared");
  return {
    cityId,
    args: { ConstructibleType: 713967338, X: 22, Y: 31 },
    beforeValidation: { ok: true, value: { Success: true } },
    afterValidation: { ok: true, value: { Success: true } },
    sent: send,
    sendResult: send ? { ok: true, value: true } : { ok: false, skipped: true, reason: "send not requested" },
    beforeProductionPostcondition: before,
    afterProductionPostcondition: after,
    ui: {
      cityActivation: send ? { ok: true, value: { selectedCityId: cityId } } : { ok: false, skipped: true, reason: "read-only production choice status" },
      interfaceClose: send ? { ok: true, value: { selectedCityId: null, interfaceMode: "INTERFACEMODE_DEFAULT" } } : { ok: false, skipped: true, reason: "send not requested" },
    },
    notes: ["This mirrors the official production chooser path."],
  };
}

function productionPostconditionSnapshot(
  phase: "before" | "after",
  mode: "cleared" | "blocker-still-live",
) {
  const cityId = { owner: 0, id: 65536, type: 1 };
  const notification = {
    id: { owner: 0, id: 6, type: 20 },
    type: 1090224621,
    typeName: "NOTIFICATION_CHOOSE_CITY_PRODUCTION",
    target: cityId,
    matchesCity: true,
    canUserDismiss: false,
    expired: true,
    dismissed: false,
  };
  return {
    cityId,
    city: {
      ok: true,
      value: {
        id: cityId,
        population: 3,
        isTown: false,
        location: { x: 26, y: 36 },
      },
    },
    buildQueue: {
      ok: true,
      value: {
        currentProductionTypeHash: phase === "before" ? 713967338 : 1558890441,
        previousProductionTypeHash: 0,
        productionProgress: phase === "before" ? 12 : 0,
        turnsLeftForRequestedItem: phase === "before" ? -1 : 4,
        queueLength: 1,
      },
    },
    selectedCityId: { ok: true, value: phase === "before" ? cityId : null },
    blocker: { ok: true, value: mode === "cleared" && phase === "after" ? 0 : 1090224621 },
    canEndTurn: { ok: true, value: mode === "cleared" && phase === "after" },
    blockingProductionNotification: {
      ok: true,
      value: mode === "blocker-still-live" || phase === "before" ? notification : null,
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
