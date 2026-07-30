import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  assertCiv7ComponentId,
  CIV7_BEGIN_GAME_COMMAND,
  CIV7_EXIT_TO_MAIN_MENU_COMMAND,
  CIV7_RELOAD_UI_COMMAND,
  CIV7_RESTART_COMMAND,
  CIV7_TUNER_APP_UI_STATE_NAME,
  CIV7_TUNER_STATE_NAME,
  CIV7_UI_LOADING_STATES,
  Civ7AppUiSnapshotInputSchema,
  Civ7AppUiSnapshotResultSchema,
  Civ7BattlefieldScanInputSchema,
  Civ7BattlefieldScanResultSchema,
  Civ7CapabilityCatalogEntrySchema,
  Civ7CapabilityCatalogSchema,
  Civ7CitySummaryInputSchema,
  Civ7CitySummaryResultSchema,
  Civ7ComponentIdSchema,
  Civ7DestinationAnalysisInputSchema,
  Civ7DestinationAnalysisResultSchema,
  Civ7GameInfoRowsInputSchema,
  Civ7GameInfoRowsResultSchema,
  Civ7MapGridInputSchema,
  Civ7MapGridResultSchema,
  Civ7MapLocationSchema,
  Civ7MapSummaryInputSchema,
  Civ7MapSummaryResultSchema,
  Civ7NativeRiverObjectsInputSchema,
  Civ7NativeRiverObjectsResultSchema,
  Civ7NotificationDismissalResultSchema,
  Civ7NotificationDismissRequestInputSchema,
  Civ7PlayableStatusInputSchema,
  Civ7PlayableStatusResultSchema,
  Civ7PlayerSummaryInputSchema,
  Civ7PlayerSummaryResultSchema,
  Civ7PlayNotificationViewInputSchema,
  Civ7PlayNotificationViewResultSchema,
  Civ7PlotSnapshotInputSchema,
  Civ7PlotSnapshotResultSchema,
  Civ7ProductionChoiceCheckResultSchema,
  Civ7ProductionChoiceInputSchema,
  Civ7ProductionChoiceSendResultSchema,
  Civ7ProductionChoiceSnapshotSchema,
  Civ7ProductionChoiceValidationResultSchema,
  Civ7ProgressDashboardInputSchema,
  Civ7ProgressDashboardResultSchema,
  Civ7ReadyCityViewInputSchema,
  Civ7ReadyCityViewResultSchema,
  Civ7ReadyUnitViewInputSchema,
  Civ7ReadyUnitViewResultSchema,
  Civ7SettlementRecommendationInputSchema,
  Civ7SettlementRecommendationResultSchema,
  Civ7TargetCandidatesInputSchema,
  Civ7TargetCandidatesResultSchema,
  Civ7TraditionsViewInputSchema,
  Civ7TraditionsViewResultSchema,
  Civ7TunerHealthInputSchema,
  Civ7TunerHealthResultSchema,
  Civ7TurnCompletionCheckResultSchema,
  Civ7TurnCompletionInputSchema,
  Civ7TurnCompletionSendInputSchema,
  Civ7TurnCompletionSendResultSchema,
  Civ7TurnCompletionSnapshotSchema,
  Civ7UnitMovePreviewInputSchema,
  Civ7UnitMovePreviewResultSchema,
  Civ7UnitSummaryInputSchema,
  Civ7UnitSummaryResultSchema,
  Civ7UnitTargetActionRequestInputSchema,
  Civ7UnitTargetActionResultSchema,
  Civ7VisibilitySummaryInputSchema,
  Civ7VisibilitySummaryResultSchema,
  createCiv7ControlRequestId,
  DEFAULT_CIV7_APP_UI_API_ROOTS,
  DEFAULT_CIV7_AUTOPLAY_MAX_TURNS,
  DEFAULT_CIV7_AUTOPLAY_POLL_INTERVAL_MS,
  DEFAULT_CIV7_AUTOPLAY_STOP_STABILITY_MS,
  DEFAULT_CIV7_AUTOPLAY_STOP_WAIT_MS,
  DEFAULT_CIV7_AUTOPLAY_WAIT_MS,
  DEFAULT_CIV7_CAPABILITY_APP_UI_ROOTS,
  DEFAULT_CIV7_CAPABILITY_TUNER_ROOTS,
  DEFAULT_CIV7_GAMEINFO_LIMIT,
  DEFAULT_CIV7_GAMEINFO_TABLES,
  DEFAULT_CIV7_MAP_GRID_MAX_PLOTS,
  DEFAULT_CIV7_ROOT_MAX_KEYS,
  DEFAULT_CIV7_ROOT_MAX_METHODS,
  DEFAULT_CIV7_SCRIPTING_LOG,
  DEFAULT_CIV7_SETUP_PARAMETER_IDS,
  DEFAULT_CIV7_TUNER_API_ROOTS,
  DEFAULT_CIV7_TUNER_HOST,
  DEFAULT_CIV7_TUNER_PORT,
  DEFAULT_CIV7_TUNER_STATE_NAME,
  DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_POLL_INTERVAL_MS,
  DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_WAIT_MS,
  HARD_CIV7_GAMEINFO_LIMIT,
  HARD_CIV7_MAP_GRID_MAX_PLOTS,
} from "../src/index";

describe("Civ7 direct control public API", () => {
  test("exports the ComponentID schema and assertion helper", () => {
    const componentId = { owner: 0, id: 131073, type: 1 };

    expect(Civ7ComponentIdSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: ["owner", "id"],
      properties: {
        owner: { type: "number" },
        id: { type: "number" },
        type: { type: "number" },
      },
    });
    expect(Value.Check(Civ7ComponentIdSchema, componentId)).toBe(true);
    expect(Value.Check(Civ7ComponentIdSchema, { owner: 0, type: 1 })).toBe(false);
    expect(assertCiv7ComponentId(componentId)).toEqual(componentId);
    expect(() => assertCiv7ComponentId({ owner: 0, type: 1 }, "--city-id")).toThrow(
      /--city-id must be a Civ7 ComponentID/
    );
  });

  test("exports the map location schema with validator-equivalent bounds", () => {
    expect(Value.Check(Civ7MapLocationSchema, { x: 25, y: 35 })).toBe(true);
    expect(Value.Check(Civ7MapLocationSchema, { x: 1.5, y: 0 })).toBe(false);
    expect(Value.Check(Civ7MapLocationSchema, { x: -1, y: 0 })).toBe(false);
    expect(Value.Check(Civ7MapLocationSchema, { x: 0, y: 1_000_001 })).toBe(false);
    expect(Value.Check(Civ7MapLocationSchema, { x: 25, y: 35, rawCommand: "MOVE_TO" })).toBe(false);
  });

  test("exports map summary schemas from the public facade", () => {
    expect(
      Value.Check(Civ7MapSummaryInputSchema, {
        includeAreaRegionCounts: true,
        maxIds: 512,
      })
    ).toBe(true);
    expect(Value.Check(Civ7MapSummaryInputSchema, { maxIds: 1.5 })).toBe(false);
    expect(Value.Check(Civ7MapSummaryInputSchema, { maxIds: 1_000_001 })).toBe(false);
    expect(Value.Check(Civ7MapSummaryInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7MapSummaryInputSchema, { state: { role: "tuner" } })).toBe(false);
    expect(
      Value.Check(Civ7MapSummaryInputSchema, { rawCommand: "GameplayMap.getGridWidth()" })
    ).toBe(false);
    expect(Civ7MapSummaryResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining(["host", "port", "state", "map", "game"]),
    });
  });

  test("exports plot snapshot schemas from the public facade", () => {
    expect(
      Value.Check(Civ7PlotSnapshotInputSchema, {
        x: 3,
        y: 4,
        playerId: 0,
        fields: ["terrain", "resource", "visibility"],
      })
    ).toBe(true);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, { x: 1.5, y: 4 })).toBe(false);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, { x: 3, y: -1 })).toBe(false);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, { x: 3, y: 4, fields: ["enemy"] })).toBe(false);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, { x: 3, y: 4, host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, { x: 3, y: 4, state: { role: "tuner" } })).toBe(
      false
    );
    expect(
      Value.Check(Civ7PlotSnapshotInputSchema, {
        x: 3,
        y: 4,
        rawCommand: "GameplayMap.getTerrainType(3, 4)",
      })
    ).toBe(false);
    expect(Civ7PlotSnapshotResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining([
        "host",
        "port",
        "state",
        "location",
        "hiddenInfoPolicy",
        "facts",
      ]),
    });
  });

  test("exports map grid schemas from the public facade", () => {
    expect(
      Value.Check(Civ7MapGridInputSchema, {
        bounds: { x: 0, y: 0, width: 2, height: 1 },
        fields: ["terrain"],
        maxPlots: 1,
      })
    ).toBe(true);
    expect(
      Value.Check(Civ7MapGridInputSchema, {
        locations: [{ x: 0, y: 0 }],
        fields: ["terrain"],
      })
    ).toBe(true);
    expect(Value.Check(Civ7MapGridInputSchema, { fields: ["terrain"] })).toBe(false);
    expect(
      Value.Check(Civ7MapGridInputSchema, {
        bounds: { x: 0, y: 0, width: 2, height: 1 },
        locations: [{ x: 0, y: 0 }],
        fields: ["terrain"],
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7MapGridInputSchema, {
        bounds: { x: 0, y: 0, width: 2, height: 1 },
        fields: ["enemy"],
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7MapGridInputSchema, {
        bounds: { x: 0, y: 0, width: 2, height: 1 },
        fields: ["terrain"],
        rawCommand: "GameplayMap.getGridWidth()",
      })
    ).toBe(false);
    expect(Civ7MapGridResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining([
        "host",
        "port",
        "state",
        "fields",
        "plotCount",
        "omitted",
        "hiddenInfoPolicy",
        "plots",
      ]),
    });
  });

  test("exports native river object read schemas from the public facade", () => {
    expect(Value.Check(Civ7NativeRiverObjectsInputSchema, { maxSamples: 16 })).toBe(true);
    expect(Value.Check(Civ7NativeRiverObjectsInputSchema, { maxSamples: 257 })).toBe(false);
    expect(
      Value.Check(Civ7NativeRiverObjectsInputSchema, { rawCommand: "MapRivers.numRivers()" })
    ).toBe(false);
    expect(Civ7NativeRiverObjectsResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining([
        "host",
        "port",
        "state",
        "exists",
        "numRivers",
        "samples",
        "truncated",
      ]),
    });
  });

  test("exports visibility summary schemas from the public facade", () => {
    expect(
      Value.Check(Civ7VisibilitySummaryInputSchema, {
        playerId: 0,
        bounds: { x: 0, y: 0, width: 2, height: 1 },
        includeGrid: true,
        maxPlots: 2,
      })
    ).toBe(true);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, { playerId: 0 })).toBe(true);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, { playerId: 1.5 })).toBe(false);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, { playerId: 1_025 })).toBe(false);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, { playerId: 0, includeGrid: true })).toBe(
      false
    );
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, { playerId: 0, host: "127.0.0.1" })).toBe(
      false
    );
    expect(
      Value.Check(Civ7VisibilitySummaryInputSchema, {
        playerId: 0,
        rawCommand: "Visibility.revealAllPlots(0)",
      })
    ).toBe(false);
    expect(Civ7VisibilitySummaryResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining([
        "host",
        "port",
        "state",
        "playerId",
        "numPlotsRevealed",
        "numPlotsVisible",
        "mapPlotCount",
        "counts",
      ]),
    });
  });

  test("exports unit summary schemas from the public facade", () => {
    expect(
      Value.Check(Civ7UnitSummaryInputSchema, {
        playerId: 0,
        unitIds: [{ owner: -1, id: -1, type: 26 }],
        maxItems: 128,
      })
    ).toBe(true);
    expect(Value.Check(Civ7UnitSummaryInputSchema, { playerId: 1025 })).toBe(false);
    expect(Value.Check(Civ7UnitSummaryInputSchema, { maxItems: 1_001 })).toBe(false);
    expect(Value.Check(Civ7UnitSummaryInputSchema, { rawCommand: "Units.get(id)" })).toBe(false);
    expect(Civ7UnitSummaryResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining(["host", "port", "state", "units", "omitted"]),
    });
  });

  test("exports player summary schemas from the public facade", () => {
    expect(
      Value.Check(Civ7PlayerSummaryInputSchema, {
        playerIds: [0],
        includeUnits: true,
        includeCities: true,
        maxItems: 64,
      })
    ).toBe(true);
    expect(Value.Check(Civ7PlayerSummaryInputSchema, { playerIds: [1025] })).toBe(false);
    expect(Value.Check(Civ7PlayerSummaryInputSchema, { maxItems: 513 })).toBe(false);
    expect(Value.Check(Civ7PlayerSummaryInputSchema, { rawCommand: "Players.getAliveIds()" })).toBe(
      false
    );
    expect(Civ7PlayerSummaryResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining(["host", "port", "state", "players", "omitted"]),
    });
  });

  test("exports city summary schemas from the public facade", () => {
    expect(
      Value.Check(Civ7CitySummaryInputSchema, {
        playerId: 0,
        cityIds: [{ owner: -1, id: -1, type: 1 }],
        maxItems: 128,
      })
    ).toBe(true);
    expect(Value.Check(Civ7CitySummaryInputSchema, { playerId: 1025 })).toBe(false);
    expect(Value.Check(Civ7CitySummaryInputSchema, { maxItems: 1_001 })).toBe(false);
    expect(Value.Check(Civ7CitySummaryInputSchema, { rawCommand: "Cities.get(id)" })).toBe(false);
    expect(Civ7CitySummaryResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining(["host", "port", "state", "cities", "omitted"]),
    });
  });

  test("exports GameInfo rows schemas from the public facade", () => {
    expect(
      Value.Check(Civ7GameInfoRowsInputSchema, {
        table: "Resources",
        limit: 2,
        filter: { key: "ResourceType", equals: "RESOURCE_COTTON" },
        includeSchema: true,
        includePrimaryKeys: true,
      })
    ).toBe(true);
    expect(Value.Check(Civ7GameInfoRowsInputSchema, { table: "Resources;DROP" })).toBe(false);
    expect(Value.Check(Civ7GameInfoRowsInputSchema, { table: "Resources", limit: 1_001 })).toBe(
      false
    );
    expect(
      Value.Check(Civ7GameInfoRowsInputSchema, {
        table: "Resources",
        filter: { key: "Resource-Type", equals: "RESOURCE_COTTON" },
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7GameInfoRowsInputSchema, { table: "Resources", host: "127.0.0.1" })
    ).toBe(false);
    expect(
      Value.Check(Civ7GameInfoRowsInputSchema, {
        table: "Resources",
        rawCommand: "GameInfo.Resources",
      })
    ).toBe(false);
    expect(Civ7GameInfoRowsResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining([
        "host",
        "port",
        "state",
        "table",
        "source",
        "rows",
        "limit",
        "offset",
        "total",
        "omittedUnknown",
      ]),
    });
  });

  test("exports default tuner endpoint and state/command constants", () => {
    expect(DEFAULT_CIV7_TUNER_HOST).toBe("127.0.0.1");
    expect(DEFAULT_CIV7_TUNER_PORT).toBe(4318);
    expect(DEFAULT_CIV7_TUNER_STATE_NAME).toBe("App UI");
    expect(CIV7_TUNER_APP_UI_STATE_NAME).toBe("App UI");
    expect(CIV7_TUNER_STATE_NAME).toBe("Tuner");
    expect(CIV7_RESTART_COMMAND).toBe("Network.restartGame()");
    expect(CIV7_BEGIN_GAME_COMMAND).toBe("UI.notifyUIReady()");
    expect(CIV7_EXIT_TO_MAIN_MENU_COMMAND).toBe('engine.call("exitToMainMenu")');
    expect(CIV7_RELOAD_UI_COMMAND).toBe("UI.reloadUI()");
  });

  test("exports the direct-control request id helper", () => {
    expect(createCiv7ControlRequestId()).toMatch(/^civ7-control-[a-z0-9]+-[a-z0-9]+$/);
    expect(createCiv7ControlRequestId("civ7-restart")).toMatch(
      /^civ7-restart-[a-z0-9]+-[a-z0-9]+$/
    );
  });

  test("exports stable loading-state labels and public root catalogs", () => {
    expect(CIV7_UI_LOADING_STATES).toMatchObject({
      WaitingForUIReady: 6,
      WaitingToStart: 7,
      GameStarted: 8,
    });

    expect(DEFAULT_CIV7_APP_UI_API_ROOTS).toEqual([
      "Network",
      "Configuration",
      "GameSetup",
      "Autoplay",
      "Game",
      "UI",
      "GameContext",
      "PlayerIds",
      "Players",
      "GameplayMap",
    ]);
    expect(DEFAULT_CIV7_TUNER_API_ROOTS).toEqual([
      "Game",
      "Autoplay",
      "Players",
      "GameplayMap",
      "ResourceBuilder",
      "GameInfo",
      "PlayerIds",
    ]);
    expect(DEFAULT_CIV7_CAPABILITY_APP_UI_ROOTS).toContain("Database");
    expect(DEFAULT_CIV7_CAPABILITY_TUNER_ROOTS).toEqual(
      expect.arrayContaining([
        "Autoplay",
        "Game",
        "GameplayMap",
        "Players",
        "GameInfo",
        "Database",
        "UnitOperationTypes",
        "PlayerOperationTypes",
      ])
    );
    expect(DEFAULT_CIV7_GAMEINFO_TABLES).toEqual(
      expect.arrayContaining(["Resources", "UnitOperations", "CityCommands", "MapSizes"])
    );
    expect(DEFAULT_CIV7_SETUP_PARAMETER_IDS).toEqual(
      expect.arrayContaining([
        "Ruleset",
        "Difficulty",
        "Map",
        "MapSize",
        "MapRandomSeed",
        "GameRandomSeed",
      ])
    );
  });

  test("exports representative public default and hard limits", () => {
    expect(DEFAULT_CIV7_MAP_GRID_MAX_PLOTS).toBe(512);
    expect(HARD_CIV7_MAP_GRID_MAX_PLOTS).toBe(10_000);
    expect(DEFAULT_CIV7_GAMEINFO_LIMIT).toBe(100);
    expect(HARD_CIV7_GAMEINFO_LIMIT).toBe(1_000);
    expect(DEFAULT_CIV7_ROOT_MAX_KEYS).toBe(100);
    expect(DEFAULT_CIV7_ROOT_MAX_METHODS).toBe(100);
    expect(DEFAULT_CIV7_AUTOPLAY_MAX_TURNS).toBe(50);
    expect(DEFAULT_CIV7_AUTOPLAY_WAIT_MS).toBe(5_000);
    expect(DEFAULT_CIV7_AUTOPLAY_STOP_WAIT_MS).toBe(30_000);
    expect(DEFAULT_CIV7_AUTOPLAY_POLL_INTERVAL_MS).toBe(250);
    expect(DEFAULT_CIV7_AUTOPLAY_STOP_STABILITY_MS).toBe(10_000);
    expect(DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_WAIT_MS).toBe(1_500);
    expect(DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_POLL_INTERVAL_MS).toBe(250);
    expect(DEFAULT_CIV7_SCRIPTING_LOG).toMatch(/Civilization VII[/\\]Logs[/\\]Scripting\.log$/);

    expect(HARD_CIV7_MAP_GRID_MAX_PLOTS).toBeGreaterThan(DEFAULT_CIV7_MAP_GRID_MAX_PLOTS);
    expect(HARD_CIV7_GAMEINFO_LIMIT).toBeGreaterThan(DEFAULT_CIV7_GAMEINFO_LIMIT);
  });

  test("exports capability catalog schemas from the public facade", () => {
    const entry = {
      id: "wrapper.getCiv7PlayableStatus",
      name: "getCiv7PlayableStatus",
      role: "shared",
      kind: "read-wrapper",
      owner: "@civ7/direct-control",
      risk: "read",
      provenance: ["public-api-test"],
      confidence: "source",
    };
    const catalog = {
      generatedAt: "2026-06-03T00:00:00.000Z",
      source: "static",
      version: "direct-control-v1",
      entries: [entry],
    };

    expect(Value.Check(Civ7CapabilityCatalogEntrySchema, entry)).toBe(true);
    expect(Value.Check(Civ7CapabilityCatalogSchema, catalog)).toBe(true);
    expect(Value.Check(Civ7CapabilityCatalogEntrySchema, { ...entry, risk: "runtime-proof" })).toBe(
      false
    );
  });

  test("exports playable-status schemas from the public facade", () => {
    expect(Value.Check(Civ7PlayableStatusInputSchema, {})).toBe(true);
    expect(Value.Check(Civ7PlayableStatusInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7PlayableStatusInputSchema, { port: 4318 })).toBe(false);
    expect(Value.Check(Civ7PlayableStatusInputSchema, { state: { role: "tuner" } })).toBe(false);
    expect(Value.Check(Civ7PlayableStatusInputSchema, { session: { state: "Tuner" } })).toBe(false);
    expect(Value.Check(Civ7PlayableStatusInputSchema, { command: "Game.turn" })).toBe(false);
    expect(Value.Check(Civ7PlayableStatusInputSchema, { rawCommand: "Game.turn" })).toBe(false);
    expect(Civ7PlayableStatusResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining([
        "host",
        "port",
        "playable",
        "readiness",
        "appUi",
        "errors",
      ]),
    });
  });

  test("exports exact turn-completion atom schemas from the public facade", () => {
    const snapshot = {
      localPlayerId: 0,
      turn: { ok: true, value: 12 },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: true },
    };

    expect(Value.Check(Civ7TurnCompletionInputSchema, {})).toBe(true);
    expect(Value.Check(Civ7TurnCompletionInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7TurnCompletionSnapshotSchema, snapshot)).toBe(true);
    expect(Value.Check(Civ7TurnCompletionCheckResultSchema, { snapshot })).toBe(true);
    expect(Value.Check(Civ7TurnCompletionSendInputSchema, { expected: snapshot })).toBe(true);
    expect(
      Value.Check(Civ7TurnCompletionSendResultSchema, {
        sent: true,
        before: snapshot,
        after: snapshot,
      })
    ).toBe(true);
    expect(Civ7TurnCompletionSnapshotSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining([
        "localPlayerId",
        "turn",
        "hasSentTurnComplete",
        "canEndTurn",
      ]),
    });
  });

  test("exports Tuner health schemas from the public facade", () => {
    expect(Value.Check(Civ7TunerHealthInputSchema, {})).toBe(true);
    expect(Value.Check(Civ7TunerHealthInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7TunerHealthInputSchema, { port: 4318 })).toBe(false);
    expect(Value.Check(Civ7TunerHealthInputSchema, { state: { role: "tuner" } })).toBe(false);
    expect(Value.Check(Civ7TunerHealthInputSchema, { session: { state: "Tuner" } })).toBe(false);
    expect(Value.Check(Civ7TunerHealthInputSchema, { command: "Game.turn" })).toBe(false);
    expect(Value.Check(Civ7TunerHealthInputSchema, { rawCommand: "Game.turn" })).toBe(false);
    expect(Civ7TunerHealthResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining(["host", "port", "state", "ready", "snapshot"]),
    });
  });

  test("exports ready-unit view schemas from the public facade", () => {
    expect(
      Value.Check(Civ7ReadyUnitViewInputSchema, {
        unitId: { owner: 0, id: 458752, type: 26 },
        radius: 2,
        maxOperations: 96,
      })
    ).toBe(true);
    expect(Value.Check(Civ7ReadyUnitViewInputSchema, { radius: 6 })).toBe(false);
    expect(Civ7ReadyUnitViewResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining([
        "state",
        "localPlayerId",
        "unitId",
        "legalOperations",
        "promotionReadiness",
      ]),
    });
  });

  test("exports ready-city view schemas from the public facade", () => {
    expect(
      Value.Check(Civ7ReadyCityViewInputSchema, {
        cityId: { owner: 0, id: 131073, type: 1 },
        maxOperations: 96,
      })
    ).toBe(true);
    expect(Value.Check(Civ7ReadyCityViewInputSchema, { maxOperations: 257 })).toBe(false);
    expect(Civ7ReadyCityViewResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining([
        "state",
        "localPlayerId",
        "cityId",
        "legalOperations",
        "productionCandidates",
        "populationPlacement",
      ]),
    });
  });

  test("exports unit move-preview schemas from the public facade", () => {
    expect(
      Value.Check(Civ7UnitMovePreviewInputSchema, {
        unitId: { owner: 0, id: 65536, type: 26 },
        destination: { x: 25, y: 35 },
        maxPlots: 12,
        maxPathPlots: 8,
      })
    ).toBe(true);
    expect(Value.Check(Civ7UnitMovePreviewInputSchema, { destination: { x: 1.5, y: 0 } })).toBe(
      false
    );
    expect(Value.Check(Civ7UnitMovePreviewInputSchema, { maxPathPlots: 257 })).toBe(false);
    expect(Civ7UnitMovePreviewResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining([
        "state",
        "localPlayerId",
        "unitId",
        "reachableMovement",
        "requestedDestination",
        "relationshipPolicy",
      ]),
    });
  });

  test("exports play-notification view schemas from the public facade", () => {
    expect(Value.Check(Civ7PlayNotificationViewInputSchema, { maxNotifications: 25 })).toBe(true);
    expect(Value.Check(Civ7PlayNotificationViewInputSchema, { maxNotifications: 101 })).toBe(false);
    expect(Value.Check(Civ7PlayNotificationViewInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(
      Value.Check(Civ7PlayNotificationViewInputSchema, { rawCommand: "readPlayNotifications()" })
    ).toBe(false);
    expect(Civ7PlayNotificationViewResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining([
        "state",
        "localPlayerId",
        "notifications",
        "decisions",
        "hud",
        "limits",
      ]),
    });
  });

  test("exports settlement recommendation schemas from the public facade", () => {
    expect(
      Value.Check(Civ7SettlementRecommendationInputSchema, {
        locations: [{ x: 18, y: 27 }],
        count: 3,
        includeSettlers: false,
        includeCities: false,
      })
    ).toBe(true);
    expect(Value.Check(Civ7SettlementRecommendationInputSchema, { count: 13 })).toBe(false);
    expect(
      Value.Check(Civ7SettlementRecommendationInputSchema, { locations: [{ x: 1.5, y: 0 }] })
    ).toBe(false);
    expect(Value.Check(Civ7SettlementRecommendationInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(
      Value.Check(Civ7SettlementRecommendationInputSchema, {
        rawCommand: "readSettlementRecommendations()",
      })
    ).toBe(false);
    expect(Civ7SettlementRecommendationResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining([
        "state",
        "localPlayerId",
        "playerId",
        "count",
        "requestedLocations",
        "origins",
        "recommendations",
        "notes",
      ]),
    });
  });

  test("exports target-candidates schemas from the public facade", () => {
    expect(
      Value.Check(Civ7TargetCandidatesInputSchema, {
        origins: [{ x: 18, y: 20 }],
        maxCandidates: 4,
        maxPlayers: 12,
        unitRadius: 3,
      })
    ).toBe(true);
    expect(Value.Check(Civ7TargetCandidatesInputSchema, { maxCandidates: 65 })).toBe(false);
    expect(Value.Check(Civ7TargetCandidatesInputSchema, { origins: [{ x: 1.5, y: 0 }] })).toBe(
      false
    );
    expect(Value.Check(Civ7TargetCandidatesInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(
      Value.Check(Civ7TargetCandidatesInputSchema, { rawCommand: "readTargetCandidates()" })
    ).toBe(false);
    expect(Civ7TargetCandidatesResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining([
        "state",
        "localPlayerId",
        "playerId",
        "origins",
        "unitRadius",
        "hiddenInfoPolicy",
        "relationshipLabelPolicy",
        "candidates",
        "notes",
      ]),
    });
    expect(
      Civ7TargetCandidatesResultSchema.properties.relationshipLabelPolicy.properties
    ).toMatchObject({
      relationshipSource: { const: "not-classified" },
      relationshipProof: { const: "none" },
      unprovenLabel: { const: "relationship-unproven" },
    });
  });

  test("exports battlefield-scan schemas from the public facade", () => {
    expect(
      Value.Check(Civ7BattlefieldScanInputSchema, {
        origins: [{ x: 17, y: 20 }],
        radius: 8,
        maxPlayers: 12,
        maxUnits: 16,
        maxCities: 8,
      })
    ).toBe(true);
    expect(Value.Check(Civ7BattlefieldScanInputSchema, { radius: 33 })).toBe(false);
    expect(Value.Check(Civ7BattlefieldScanInputSchema, { maxUnits: 257 })).toBe(false);
    expect(Value.Check(Civ7BattlefieldScanInputSchema, { origins: [{ x: 1.5, y: 0 }] })).toBe(
      false
    );
    expect(Value.Check(Civ7BattlefieldScanInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(
      Value.Check(Civ7BattlefieldScanInputSchema, { rawCommand: "readBattlefieldScan()" })
    ).toBe(false);
    expect(Civ7BattlefieldScanResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining([
        "state",
        "localPlayerId",
        "playerId",
        "origins",
        "radius",
        "hiddenInfoPolicy",
        "relationshipLabelPolicy",
        "units",
        "cities",
        "owners",
        "pointsOfInterest",
        "notes",
      ]),
    });
    expect(
      Civ7BattlefieldScanResultSchema.properties.relationshipLabelPolicy.properties
    ).toMatchObject({
      relationshipSource: { const: "not-classified" },
      relationshipProof: { const: "none" },
      unprovenLabel: { const: "relationship-unproven" },
    });
  });

  test("exports unit-target action request schemas from the public facade", () => {
    expect(
      Value.Check(Civ7UnitTargetActionRequestInputSchema, {
        unitId: { owner: 0, id: 65536, type: 26 },
        x: 23,
        y: 33,
      })
    ).toBe(true);
    expect(
      Value.Check(Civ7UnitTargetActionRequestInputSchema, {
        unitId: { owner: 0, id: 65536 },
        x: 23,
        y: 1_000_001,
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7UnitTargetActionRequestInputSchema, {
        unitId: { owner: 0, id: 65536 },
        x: 23,
        y: 33,
        rawCommand: "Game.UnitOperations.sendRequest(...)",
      })
    ).toBe(false);
    expect(Civ7UnitTargetActionResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining([
        "host",
        "port",
        "state",
        "unitId",
        "target",
        "candidates",
        "sent",
        "notes",
      ]),
    });
  });

  test("exports exact production-choice wire schemas from the public facade", () => {
    expect(
      Value.Check(Civ7ProductionChoiceInputSchema, {
        cityId: { owner: 0, id: 65536, type: 1 },
        args: { ConstructibleType: 713967338, X: 22, Y: 31 },
      })
    ).toBe(true);
    expect(
      Value.Check(Civ7ProductionChoiceInputSchema, {
        cityId: { owner: 0, id: 65536, type: 1 },
        args: { UnitType: 102, ConstructibleType: 713967338 },
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7ProductionChoiceInputSchema, {
        cityId: { owner: 0, id: 65536, type: 1 },
        args: { ConstructibleType: 713967338 },
        rawCommand: "Game.CityOperations.sendRequest(...)",
      })
    ).toBe(false);
    const cityId = { owner: 0, id: 65536, type: 1 };
    const snapshot = {
      cityId,
      city: { ok: true, value: { id: cityId, observedCityId: cityId } },
      buildQueue: {
        ok: true,
        value: {
          currentProductionTypeHash: 713967338,
          previousProductionTypeHash: null,
          productionProgress: 12,
          turnsLeftForRequestedItem: 4,
          queueLength: 1,
        },
      },
      blocker: { ok: true, value: 1090224621 },
      blockingProductionNotification: {
        ok: true,
        value: {
          id: { owner: 0, id: 6, type: 20 },
          type: 1090224621,
          typeName: "NOTIFICATION_CHOOSE_CITY_PRODUCTION",
          target: cityId,
        },
      },
    };
    expect(
      Value.Check(Civ7ProductionChoiceCheckResultSchema, {
        valid: true,
        result: { Success: true },
        snapshot,
      })
    ).toBe(true);
    expect(Value.Check(Civ7ProductionChoiceSnapshotSchema, snapshot)).toBe(true);
    expect(
      Value.Check(Civ7ProductionChoiceValidationResultSchema, {
        valid: true,
        result: { Success: true },
      })
    ).toBe(true);
    expect(
      Value.Check(Civ7ProductionChoiceSendResultSchema, {
        sent: true,
        validation: { valid: true, result: { Success: true } },
        before: snapshot,
        after: snapshot,
      })
    ).toBe(true);
    expect(
      Value.Check(Civ7ProductionChoiceSendResultSchema, {
        sent: true,
        validation: { valid: false, result: { Success: false } },
        before: snapshot,
        after: snapshot,
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7ProductionChoiceSendResultSchema, {
        sent: false,
        validation: { valid: true, result: { Success: true } },
        before: snapshot,
        after: snapshot,
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7ProductionChoiceSendResultSchema, {
        sent: true,
        validation: { valid: true, result: { Success: true } },
        before: snapshot,
        after: snapshot,
        verified: true,
      })
    ).toBe(false);
  });

  test("exports notification dismissal request schemas from the public facade", () => {
    expect(
      Value.Check(Civ7NotificationDismissRequestInputSchema, {
        notificationId: { owner: 0, id: 113, type: 20 },
      })
    ).toBe(true);
    expect(
      Value.Check(Civ7NotificationDismissRequestInputSchema, {
        notificationId: { owner: 0, type: 20 },
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7NotificationDismissRequestInputSchema, {
        notificationId: { owner: 0, id: 113, type: 20 },
        rawCommand: "Game.Notifications.dismiss(...)",
      })
    ).toBe(false);
    expect(Civ7NotificationDismissalResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining([
        "host",
        "port",
        "state",
        "notificationId",
        "before",
        "after",
        "sent",
        "verified",
        "postcondition",
        "notes",
      ]),
    });
  });
});
