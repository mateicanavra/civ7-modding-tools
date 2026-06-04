import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  CIV7_BEGIN_GAME_COMMAND,
  CIV7_EXIT_TO_MAIN_MENU_COMMAND,
  CIV7_RELOAD_UI_COMMAND,
  CIV7_RESTART_COMMAND,
  CIV7_TUNER_APP_UI_STATE_NAME,
  CIV7_TUNER_STATE_NAME,
  CIV7_UI_LOADING_STATES,
  Civ7AppUiSnapshotInputSchema,
  Civ7AppUiSnapshotProcedureDescriptor,
  Civ7AppUiSnapshotProcedureSchemaArtifacts,
  Civ7AppUiSnapshotResultSchema,
  Civ7CapabilityCatalogEntrySchema,
  Civ7CapabilityCatalogSchema,
  Civ7ComponentIdSchema,
  Civ7GameInfoRowsInputSchema,
  Civ7GameInfoRowsResultSchema,
  Civ7MapGridInputSchema,
  Civ7MapGridResultSchema,
  Civ7MapLocationSchema,
  Civ7MapSummaryInputSchema,
  Civ7MapSummaryResultSchema,
  Civ7PlotSnapshotInputSchema,
  Civ7PlotSnapshotResultSchema,
  Civ7BattlefieldScanInputSchema,
  Civ7BattlefieldScanProcedureDescriptor,
  Civ7BattlefieldScanProcedureSchemaArtifacts,
  Civ7BattlefieldScanResultSchema,
  Civ7DestinationAnalysisInputSchema,
  Civ7DestinationAnalysisProcedureDescriptor,
  Civ7DestinationAnalysisProcedureSchemaArtifacts,
  Civ7DestinationAnalysisResultSchema,
  Civ7PlayNotificationViewInputSchema,
  Civ7PlayNotificationViewProcedureDescriptor,
  Civ7PlayNotificationViewProcedureSchemaArtifacts,
  Civ7PlayNotificationViewResultSchema,
  Civ7PlayableStatusInputSchema,
  Civ7PlayableStatusProcedureDescriptor,
  Civ7PlayableStatusProcedureSchemaArtifacts,
  Civ7PlayableStatusResultSchema,
  Civ7ProgressDashboardInputSchema,
  Civ7ProgressDashboardProcedureDescriptor,
  Civ7ProgressDashboardProcedureSchemaArtifacts,
  Civ7ProgressDashboardResultSchema,
  Civ7ProcedureCoreCallDiagnosticsSchema,
  Civ7ProcedureCoreCallResultSchema,
  Civ7ProcedureContextRequirementSchema,
  Civ7ProcedureSchemaReferenceSchema,
  Civ7ProcedureSchemaTechnologySchema,
  Civ7ReadyCityViewProcedureDescriptor,
  Civ7ReadyCityViewProcedureSchemaArtifacts,
  Civ7ReadyCityViewInputSchema,
  Civ7ReadyCityViewResultSchema,
  Civ7ReadyUnitViewProcedureDescriptor,
  Civ7ReadyUnitViewProcedureSchemaArtifacts,
  Civ7ReadyUnitViewInputSchema,
  Civ7ReadyUnitViewResultSchema,
  Civ7SettlementRecommendationInputSchema,
  Civ7SettlementRecommendationResultSchema,
  Civ7SettlementRecommendationsProcedureDescriptor,
  Civ7SettlementRecommendationsProcedureSchemaArtifacts,
  Civ7TargetCandidatesInputSchema,
  Civ7TargetCandidatesProcedureDescriptor,
  Civ7TargetCandidatesProcedureSchemaArtifacts,
  Civ7TargetCandidatesResultSchema,
  Civ7TraditionsViewInputSchema,
  Civ7TraditionsViewProcedureDescriptor,
  Civ7TraditionsViewProcedureSchemaArtifacts,
  Civ7TraditionsViewResultSchema,
  Civ7TunerHealthInputSchema,
  Civ7TunerHealthProcedureDescriptor,
  Civ7TunerHealthProcedureSchemaArtifacts,
  Civ7TunerHealthResultSchema,
  Civ7TurnCompletionStatusInputSchema,
  Civ7TurnCompletionStatusProcedureDescriptor,
  Civ7TurnCompletionStatusProcedureSchemaArtifacts,
  Civ7TurnCompletionStatusResultSchema,
  Civ7VisibilitySummaryInputSchema,
  Civ7VisibilitySummaryResultSchema,
  Civ7UnitMovePreviewProcedureDescriptor,
  Civ7UnitMovePreviewProcedureSchemaArtifacts,
  Civ7UnitMovePreviewInputSchema,
  Civ7UnitMovePreviewResultSchema,
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
  DEFAULT_CIV7_SETUP_PARAMETER_IDS,
  DEFAULT_CIV7_SCRIPTING_LOG,
  DEFAULT_CIV7_TUNER_API_ROOTS,
  DEFAULT_CIV7_TUNER_HOST,
  DEFAULT_CIV7_TUNER_PORT,
  DEFAULT_CIV7_TUNER_STATE_NAME,
  DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_POLL_INTERVAL_MS,
  DEFAULT_CIV7_UNIT_TARGET_VERIFICATION_WAIT_MS,
  HARD_CIV7_GAMEINFO_LIMIT,
  HARD_CIV7_MAP_GRID_MAX_PLOTS,
  assertCiv7ComponentId,
  callCiv7AppUiSnapshotProcedure,
  callCiv7BattlefieldScanProcedure,
  callCiv7DestinationAnalysisProcedure,
  callCiv7PlayableStatusProcedure,
  callCiv7PlayNotificationViewProcedure,
  callCiv7ProcedureCore,
  callCiv7ProgressDashboardProcedure,
  callCiv7ReadyCityViewProcedure,
  callCiv7ReadyUnitViewProcedure,
  callCiv7SettlementRecommendationsProcedure,
  callCiv7TargetCandidatesProcedure,
  callCiv7TraditionsViewProcedure,
  callCiv7TunerHealthProcedure,
  callCiv7TurnCompletionStatusProcedure,
  callCiv7UnitMovePreviewProcedure,
  civ7ProcedureSchemaReferenceKey,
  createCiv7ControlRequestId,
  resolveCiv7ProcedureCoreSchemas,
  validateCiv7ProcedureCoreInput,
  validateCiv7ProcedureCoreOutput,
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
      /--city-id must be a Civ7 ComponentID/,
    );
  });

  test("exports the map location schema with validator-equivalent bounds", () => {
    expect(Value.Check(Civ7MapLocationSchema, { x: 25, y: 35 })).toBe(true);
    expect(Value.Check(Civ7MapLocationSchema, { x: 1.5, y: 0 })).toBe(false);
    expect(Value.Check(Civ7MapLocationSchema, { x: -1, y: 0 })).toBe(false);
    expect(Value.Check(Civ7MapLocationSchema, { x: 0, y: 1_000_001 })).toBe(false);
    expect(Value.Check(Civ7MapLocationSchema, { x: 25, y: 35, rawCommand: "MOVE_TO" })).toBe(false);
  });

  test("exports map summary procedure candidate schemas from the public facade", () => {
    expect(Value.Check(Civ7MapSummaryInputSchema, {
      includeAreaRegionCounts: true,
      maxIds: 512,
    })).toBe(true);
    expect(Value.Check(Civ7MapSummaryInputSchema, { maxIds: 1.5 })).toBe(false);
    expect(Value.Check(Civ7MapSummaryInputSchema, { maxIds: 1_000_001 })).toBe(false);
    expect(Value.Check(Civ7MapSummaryInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7MapSummaryInputSchema, { state: { role: "tuner" } })).toBe(false);
    expect(Value.Check(Civ7MapSummaryInputSchema, { rawCommand: "GameplayMap.getGridWidth()" })).toBe(false);
    expect(Civ7MapSummaryResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining([
        "host",
        "port",
        "state",
        "map",
        "game",
      ]),
    });
  });

  test("exports plot snapshot procedure candidate schemas from the public facade", () => {
    expect(Value.Check(Civ7PlotSnapshotInputSchema, {
      x: 3,
      y: 4,
      playerId: 0,
      fields: ["terrain", "resource", "visibility"],
    })).toBe(true);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, { x: 1.5, y: 4 })).toBe(false);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, { x: 3, y: -1 })).toBe(false);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, { x: 3, y: 4, fields: ["enemy"] })).toBe(false);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, { x: 3, y: 4, host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, { x: 3, y: 4, state: { role: "tuner" } })).toBe(false);
    expect(Value.Check(Civ7PlotSnapshotInputSchema, {
      x: 3,
      y: 4,
      rawCommand: "GameplayMap.getTerrainType(3, 4)",
    })).toBe(false);
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

  test("exports map grid procedure candidate schemas from the public facade", () => {
    expect(Value.Check(Civ7MapGridInputSchema, {
      bounds: { x: 0, y: 0, width: 2, height: 1 },
      fields: ["terrain"],
      maxPlots: 1,
    })).toBe(true);
    expect(Value.Check(Civ7MapGridInputSchema, {
      locations: [{ x: 0, y: 0 }],
      fields: ["terrain"],
    })).toBe(true);
    expect(Value.Check(Civ7MapGridInputSchema, { fields: ["terrain"] })).toBe(false);
    expect(Value.Check(Civ7MapGridInputSchema, {
      bounds: { x: 0, y: 0, width: 2, height: 1 },
      locations: [{ x: 0, y: 0 }],
      fields: ["terrain"],
    })).toBe(false);
    expect(Value.Check(Civ7MapGridInputSchema, {
      bounds: { x: 0, y: 0, width: 2, height: 1 },
      fields: ["enemy"],
    })).toBe(false);
    expect(Value.Check(Civ7MapGridInputSchema, {
      bounds: { x: 0, y: 0, width: 2, height: 1 },
      fields: ["terrain"],
      rawCommand: "GameplayMap.getGridWidth()",
    })).toBe(false);
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

  test("exports visibility summary procedure candidate schemas from the public facade", () => {
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, {
      playerId: 0,
      bounds: { x: 0, y: 0, width: 2, height: 1 },
      includeGrid: true,
      maxPlots: 2,
    })).toBe(true);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, { playerId: 0 })).toBe(true);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, { playerId: 1.5 })).toBe(false);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, { playerId: 1_025 })).toBe(false);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, { playerId: 0, includeGrid: true })).toBe(false);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, { playerId: 0, host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7VisibilitySummaryInputSchema, {
      playerId: 0,
      rawCommand: "Visibility.revealAllPlots(0)",
    })).toBe(false);
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
        "counts",
      ]),
    });
  });

  test("exports GameInfo rows procedure candidate schemas from the public facade", () => {
    expect(Value.Check(Civ7GameInfoRowsInputSchema, {
      table: "Resources",
      limit: 2,
      filter: { key: "ResourceType", equals: "RESOURCE_COTTON" },
      includeSchema: true,
      includePrimaryKeys: true,
    })).toBe(true);
    expect(Value.Check(Civ7GameInfoRowsInputSchema, { table: "Resources;DROP" })).toBe(false);
    expect(Value.Check(Civ7GameInfoRowsInputSchema, { table: "Resources", limit: 1_001 })).toBe(false);
    expect(Value.Check(Civ7GameInfoRowsInputSchema, {
      table: "Resources",
      filter: { key: "Resource-Type", equals: "RESOURCE_COTTON" },
    })).toBe(false);
    expect(Value.Check(Civ7GameInfoRowsInputSchema, { table: "Resources", host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7GameInfoRowsInputSchema, { table: "Resources", rawCommand: "GameInfo.Resources" })).toBe(false);
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
    expect(createCiv7ControlRequestId("civ7-restart")).toMatch(/^civ7-restart-[a-z0-9]+-[a-z0-9]+$/);
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
      ]),
    );
    expect(DEFAULT_CIV7_GAMEINFO_TABLES).toEqual(
      expect.arrayContaining(["Resources", "UnitOperations", "CityCommands", "MapSizes"]),
    );
    expect(DEFAULT_CIV7_SETUP_PARAMETER_IDS).toEqual(
      expect.arrayContaining(["Ruleset", "Difficulty", "Map", "MapSize", "MapRandomSeed", "GameRandomSeed"]),
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
    expect(Value.Check(Civ7CapabilityCatalogEntrySchema, { ...entry, risk: "runtime-proof" })).toBe(false);
  });

  test("exports playable-status procedure candidate schemas from the public facade", () => {
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

  test("exports turn-completion status procedure candidate schemas from the public facade", () => {
    expect(Value.Check(Civ7TurnCompletionStatusInputSchema, {})).toBe(true);
    expect(Value.Check(Civ7TurnCompletionStatusInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7TurnCompletionStatusInputSchema, { port: 4318 })).toBe(false);
    expect(Value.Check(Civ7TurnCompletionStatusInputSchema, { state: { role: "app-ui" } })).toBe(false);
    expect(Value.Check(Civ7TurnCompletionStatusInputSchema, { rawCommand: "GameContext.sendTurnComplete()" })).toBe(false);
    expect(Civ7TurnCompletionStatusResultSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: expect.arrayContaining([
        "host",
        "port",
        "state",
        "localPlayerId",
        "turn",
        "hasSentTurnComplete",
        "canEndTurn",
        "blocker",
        "firstReadyUnitId",
      ]),
    });
  });

  test("exports Tuner health procedure candidate schemas from the public facade", () => {
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
      required: expect.arrayContaining([
        "host",
        "port",
        "state",
        "ready",
        "snapshot",
      ]),
    });
  });

  test("exports ready-unit view procedure candidate schemas from the public facade", () => {
    expect(Value.Check(Civ7ReadyUnitViewInputSchema, {
      unitId: { owner: 0, id: 458752, type: 26 },
      radius: 2,
      maxOperations: 96,
    })).toBe(true);
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

  test("exports ready-city view procedure candidate schemas from the public facade", () => {
    expect(Value.Check(Civ7ReadyCityViewInputSchema, {
      cityId: { owner: 0, id: 131073, type: 1 },
      maxOperations: 96,
    })).toBe(true);
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

  test("exports unit move-preview procedure candidate schemas from the public facade", () => {
    expect(Value.Check(Civ7UnitMovePreviewInputSchema, {
      unitId: { owner: 0, id: 65536, type: 26 },
      destination: { x: 25, y: 35 },
      maxPlots: 12,
      maxPathPlots: 8,
    })).toBe(true);
    expect(Value.Check(Civ7UnitMovePreviewInputSchema, { destination: { x: 1.5, y: 0 } })).toBe(false);
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

  test("exports play-notification view procedure candidate schemas from the public facade", () => {
    expect(Value.Check(Civ7PlayNotificationViewInputSchema, { maxNotifications: 25 })).toBe(true);
    expect(Value.Check(Civ7PlayNotificationViewInputSchema, { maxNotifications: 101 })).toBe(false);
    expect(Value.Check(Civ7PlayNotificationViewInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7PlayNotificationViewInputSchema, { rawCommand: "readPlayNotifications()" })).toBe(false);
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

  test("exports settlement recommendation procedure candidate schemas from the public facade", () => {
    expect(Value.Check(Civ7SettlementRecommendationInputSchema, {
      locations: [{ x: 18, y: 27 }],
      count: 3,
      includeSettlers: false,
      includeCities: false,
    })).toBe(true);
    expect(Value.Check(Civ7SettlementRecommendationInputSchema, { count: 13 })).toBe(false);
    expect(Value.Check(Civ7SettlementRecommendationInputSchema, { locations: [{ x: 1.5, y: 0 }] })).toBe(false);
    expect(Value.Check(Civ7SettlementRecommendationInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7SettlementRecommendationInputSchema, { rawCommand: "readSettlementRecommendations()" })).toBe(false);
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

  test("exports target-candidates procedure candidate schemas from the public facade", () => {
    expect(Value.Check(Civ7TargetCandidatesInputSchema, {
      origins: [{ x: 18, y: 20 }],
      maxCandidates: 4,
      maxPlayers: 12,
      unitRadius: 3,
    })).toBe(true);
    expect(Value.Check(Civ7TargetCandidatesInputSchema, { maxCandidates: 65 })).toBe(false);
    expect(Value.Check(Civ7TargetCandidatesInputSchema, { origins: [{ x: 1.5, y: 0 }] })).toBe(false);
    expect(Value.Check(Civ7TargetCandidatesInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7TargetCandidatesInputSchema, { rawCommand: "readTargetCandidates()" })).toBe(false);
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
    expect(Civ7TargetCandidatesResultSchema.properties.relationshipLabelPolicy.properties).toMatchObject({
      relationshipSource: { const: "not-classified" },
      relationshipProof: { const: "none" },
      unprovenLabel: { const: "relationship-unproven" },
    });
  });

  test("exports battlefield-scan procedure candidate schemas from the public facade", () => {
    expect(Value.Check(Civ7BattlefieldScanInputSchema, {
      origins: [{ x: 17, y: 20 }],
      radius: 8,
      maxPlayers: 12,
      maxUnits: 16,
      maxCities: 8,
    })).toBe(true);
    expect(Value.Check(Civ7BattlefieldScanInputSchema, { radius: 33 })).toBe(false);
    expect(Value.Check(Civ7BattlefieldScanInputSchema, { maxUnits: 257 })).toBe(false);
    expect(Value.Check(Civ7BattlefieldScanInputSchema, { origins: [{ x: 1.5, y: 0 }] })).toBe(false);
    expect(Value.Check(Civ7BattlefieldScanInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(Civ7BattlefieldScanInputSchema, { rawCommand: "readBattlefieldScan()" })).toBe(false);
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
    expect(Civ7BattlefieldScanResultSchema.properties.relationshipLabelPolicy.properties).toMatchObject({
      relationshipSource: { const: "not-classified" },
      relationshipProof: { const: "none" },
      unprovenLabel: { const: "relationship-unproven" },
    });
  });

  test("exports procedure schema reference schema from the public facade", () => {
    expect(Value.Check(Civ7ProcedureContextRequirementSchema, "direct-control-facade")).toBe(true);
    expect(Value.Check(Civ7ProcedureContextRequirementSchema, "raw-socket")).toBe(false);
    expect(Value.Check(Civ7ProcedureCoreCallDiagnosticsSchema, {
      procedureKey: "unit.ready.view",
      correlationId: "corr-1",
      proofBoundary: "local-package-test",
      playerScope: "local-player-scoped",
      context: ["direct-control-facade"],
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    })).toBe(true);
    expect(Value.Check(Civ7ProcedureCoreCallResultSchema, {
      output: { ok: true },
      diagnostics: {
        procedureKey: "unit.ready.view",
        correlationId: "corr-1",
        proofBoundary: "local-package-test",
        playerScope: "local-player-scoped",
        context: ["direct-control-facade"],
        debugServiceCorrelation: true,
        telemetryCorrelation: false,
      },
    })).toBe(true);
    expect(Value.Check(Civ7ProcedureSchemaReferenceSchema, {
      owner: "packages/civ7-direct-control/src/play/ready/unit.ts",
      exportName: "Civ7ReadyUnitViewInputSchema",
    })).toBe(true);
    expect(Value.Check(Civ7ProcedureSchemaReferenceSchema, {
      owner: "packages/civ7-direct-control/src/play/ready/unit.ts",
      exportName: "Civ7ReadyUnitViewInputSchema",
      rawCommand: "readReadyUnitView()",
    })).toBe(false);
  });

  test("exports procedure schema reference resolution helpers from the public facade", () => {
    const inputSchema = {
      owner: "packages/civ7-direct-control/src/play/ready/unit.ts",
      exportName: "Civ7ReadyUnitViewInputSchema",
    };
    const outputSchema = {
      owner: "packages/civ7-direct-control/src/play/ready/unit.ts",
      exportName: "Civ7ReadyUnitViewResultSchema",
    };

    expect(civ7ProcedureSchemaReferenceKey(inputSchema)).toBe(
      "packages/civ7-direct-control/src/play/ready/unit.ts#Civ7ReadyUnitViewInputSchema",
    );
    expect(typeof resolveCiv7ProcedureCoreSchemas).toBe("function");
    expect(typeof validateCiv7ProcedureCoreInput).toBe("function");
    expect(typeof validateCiv7ProcedureCoreOutput).toBe("function");
    expect(typeof callCiv7ProcedureCore).toBe("function");
    expect(civ7ProcedureSchemaReferenceKey(outputSchema)).toContain("Civ7ReadyUnitViewResultSchema");
  });

  test("exports procedure schema technology ownership from the public facade", () => {
    expect(Value.Check(Civ7ProcedureSchemaTechnologySchema, "typebox")).toBe(true);
    expect(Value.Check(Civ7ProcedureSchemaTechnologySchema, "effect-schema")).toBe(true);
    expect(Value.Check(Civ7ProcedureSchemaTechnologySchema, "zod-adapter")).toBe(true);
    expect(Value.Check(Civ7ProcedureSchemaTechnologySchema, "json-schema")).toBe(false);
  });

  test("exports the ready-unit procedure descriptor artifact from the public facade", () => {
    expect(Civ7ReadyUnitViewProcedureDescriptor).toMatchObject({
      procedureKey: "unit.ready.view",
      atomFunction: "getCiv7ReadyUnitView",
      schemaTechnology: "typebox",
      proofBoundary: "local-package-test",
      context: expect.arrayContaining(["direct-control-facade", "endpoint-defaults", "state-selection"]),
    });
    expect(typeof callCiv7ReadyUnitViewProcedure).toBe("function");
    expect(Civ7ReadyUnitViewProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7ReadyUnitViewProcedureDescriptor.inputSchema)
    ]).toBe(Civ7ReadyUnitViewInputSchema);
    expect(Civ7ReadyUnitViewProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7ReadyUnitViewProcedureDescriptor.outputSchema)
    ]).toBe(Civ7ReadyUnitViewResultSchema);
  });

  test("exports the ready-city procedure descriptor artifact from the public facade", () => {
    expect(Civ7ReadyCityViewProcedureDescriptor).toMatchObject({
      procedureKey: "city.ready.view",
      atomFunction: "getCiv7ReadyCityView",
      schemaTechnology: "typebox",
      proofBoundary: "local-package-test",
      context: expect.arrayContaining(["direct-control-facade", "endpoint-defaults", "state-selection"]),
    });
    expect(typeof callCiv7ReadyCityViewProcedure).toBe("function");
    expect(Civ7ReadyCityViewProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7ReadyCityViewProcedureDescriptor.inputSchema)
    ]).toBe(Civ7ReadyCityViewInputSchema);
    expect(Civ7ReadyCityViewProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7ReadyCityViewProcedureDescriptor.outputSchema)
    ]).toBe(Civ7ReadyCityViewResultSchema);
  });

  test("exports the unit move-preview procedure descriptor artifact from the public facade", () => {
    expect(Civ7UnitMovePreviewProcedureDescriptor).toMatchObject({
      procedureKey: "unit.move.preview",
      atomFunction: "getCiv7UnitMovePreview",
      schemaTechnology: "typebox",
      proofBoundary: "local-package-test",
      context: expect.arrayContaining(["direct-control-facade", "endpoint-defaults", "state-selection"]),
    });
    expect(typeof callCiv7UnitMovePreviewProcedure).toBe("function");
    expect(Civ7UnitMovePreviewProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7UnitMovePreviewProcedureDescriptor.inputSchema)
    ]).toBe(Civ7UnitMovePreviewInputSchema);
    expect(Civ7UnitMovePreviewProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7UnitMovePreviewProcedureDescriptor.outputSchema)
    ]).toBe(Civ7UnitMovePreviewResultSchema);
  });

  test("exports the play-notification view procedure descriptor artifact from the public facade", () => {
    expect(Civ7PlayNotificationViewProcedureDescriptor).toMatchObject({
      procedureKey: "notifications.view",
      atomFunction: "getCiv7PlayNotificationView",
      schemaTechnology: "typebox",
      proofBoundary: "local-package-test",
      context: expect.arrayContaining(["direct-control-facade", "endpoint-defaults", "state-selection"]),
    });
    expect(typeof callCiv7PlayNotificationViewProcedure).toBe("function");
    expect(Civ7PlayNotificationViewProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7PlayNotificationViewProcedureDescriptor.inputSchema)
    ]).toBe(Civ7PlayNotificationViewInputSchema);
    expect(Civ7PlayNotificationViewProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7PlayNotificationViewProcedureDescriptor.outputSchema)
    ]).toBe(Civ7PlayNotificationViewResultSchema);
  });

  test("exports the settlement recommendations procedure descriptor artifact from the public facade", () => {
    expect(Civ7SettlementRecommendationsProcedureDescriptor).toMatchObject({
      procedureKey: "strategy.settlement.recommendations",
      family: "strategy",
      atomFunction: "getCiv7SettlementRecommendations",
      schemaTechnology: "typebox",
      proofBoundary: "local-package-test",
      context: expect.arrayContaining(["direct-control-facade", "endpoint-defaults", "state-selection"]),
    });
    expect(typeof callCiv7SettlementRecommendationsProcedure).toBe("function");
    expect(Civ7SettlementRecommendationsProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7SettlementRecommendationsProcedureDescriptor.inputSchema)
    ]).toBe(Civ7SettlementRecommendationInputSchema);
    expect(Civ7SettlementRecommendationsProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7SettlementRecommendationsProcedureDescriptor.outputSchema)
    ]).toBe(Civ7SettlementRecommendationResultSchema);
  });

  test("exports the target-candidates procedure descriptor artifact from the public facade", () => {
    expect(Civ7TargetCandidatesProcedureDescriptor).toMatchObject({
      procedureKey: "strategy.target.candidates",
      family: "strategy",
      atomFunction: "getCiv7TargetCandidates",
      schemaTechnology: "typebox",
      proofBoundary: "local-package-test",
      context: expect.arrayContaining(["direct-control-facade", "endpoint-defaults", "state-selection"]),
    });
    expect(typeof callCiv7TargetCandidatesProcedure).toBe("function");
    expect(Civ7TargetCandidatesProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7TargetCandidatesProcedureDescriptor.inputSchema)
    ]).toBe(Civ7TargetCandidatesInputSchema);
    expect(Civ7TargetCandidatesProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7TargetCandidatesProcedureDescriptor.outputSchema)
    ]).toBe(Civ7TargetCandidatesResultSchema);
  });

  test("exports the battlefield-scan procedure descriptor artifact from the public facade", () => {
    expect(Civ7BattlefieldScanProcedureDescriptor).toMatchObject({
      procedureKey: "strategy.battlefield.scan",
      family: "strategy",
      atomFunction: "getCiv7BattlefieldScan",
      schemaTechnology: "typebox",
      proofBoundary: "local-package-test",
      context: expect.arrayContaining(["direct-control-facade", "endpoint-defaults", "state-selection"]),
    });
    expect(typeof callCiv7BattlefieldScanProcedure).toBe("function");
    expect(Civ7BattlefieldScanProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7BattlefieldScanProcedureDescriptor.inputSchema)
    ]).toBe(Civ7BattlefieldScanInputSchema);
    expect(Civ7BattlefieldScanProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7BattlefieldScanProcedureDescriptor.outputSchema)
    ]).toBe(Civ7BattlefieldScanResultSchema);
  });

  test("exports the destination-analysis procedure descriptor artifact from the public facade", () => {
    expect(Civ7DestinationAnalysisProcedureDescriptor).toMatchObject({
      procedureKey: "strategy.destination.analysis",
      family: "strategy",
      atomFunction: "getCiv7DestinationAnalysis",
      schemaTechnology: "typebox",
      proofBoundary: "local-package-test",
      context: expect.arrayContaining(["direct-control-facade", "endpoint-defaults", "state-selection"]),
    });
    expect(typeof callCiv7DestinationAnalysisProcedure).toBe("function");
    expect(Civ7DestinationAnalysisProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7DestinationAnalysisProcedureDescriptor.inputSchema)
    ]).toBe(Civ7DestinationAnalysisInputSchema);
    expect(Civ7DestinationAnalysisProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7DestinationAnalysisProcedureDescriptor.outputSchema)
    ]).toBe(Civ7DestinationAnalysisResultSchema);
  });

  test("exports the traditions-view procedure descriptor artifact from the public facade", () => {
    expect(Civ7TraditionsViewProcedureDescriptor).toMatchObject({
      procedureKey: "strategy.traditions.view",
      family: "strategy",
      atomFunction: "getCiv7TraditionsView",
      schemaTechnology: "typebox",
      proofBoundary: "local-package-test",
      context: expect.arrayContaining(["direct-control-facade", "endpoint-defaults", "state-selection"]),
    });
    expect(typeof callCiv7TraditionsViewProcedure).toBe("function");
    expect(Civ7TraditionsViewProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7TraditionsViewProcedureDescriptor.inputSchema)
    ]).toBe(Civ7TraditionsViewInputSchema);
    expect(Civ7TraditionsViewProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7TraditionsViewProcedureDescriptor.outputSchema)
    ]).toBe(Civ7TraditionsViewResultSchema);
  });

  test("exports the progress-dashboard procedure descriptor artifact from the public facade", () => {
    expect(Civ7ProgressDashboardProcedureDescriptor).toMatchObject({
      procedureKey: "strategy.progress.dashboard",
      family: "strategy",
      atomFunction: "getCiv7ProgressDashboard",
      schemaTechnology: "typebox",
      proofBoundary: "local-package-test",
      context: expect.arrayContaining(["direct-control-facade", "endpoint-defaults", "state-selection"]),
    });
    expect(typeof callCiv7ProgressDashboardProcedure).toBe("function");
    expect(Civ7ProgressDashboardProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7ProgressDashboardProcedureDescriptor.inputSchema)
    ]).toBe(Civ7ProgressDashboardInputSchema);
    expect(Civ7ProgressDashboardProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7ProgressDashboardProcedureDescriptor.outputSchema)
    ]).toBe(Civ7ProgressDashboardResultSchema);
  });

  test("exports the playable-status procedure descriptor artifact from the public facade", () => {
    expect(Civ7PlayableStatusProcedureDescriptor).toMatchObject({
      procedureKey: "runtime.playable.status",
      atomFunction: "getCiv7PlayableStatus",
      schemaTechnology: "typebox",
      proofBoundary: "local-package-test",
      context: expect.arrayContaining([
        "direct-control-facade",
        "endpoint-defaults",
        "state-selection",
        "live-session-policy",
      ]),
    });
    expect(typeof callCiv7PlayableStatusProcedure).toBe("function");
    expect(Civ7PlayableStatusProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7PlayableStatusProcedureDescriptor.inputSchema)
    ]).toBe(Civ7PlayableStatusInputSchema);
    expect(Civ7PlayableStatusProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7PlayableStatusProcedureDescriptor.outputSchema)
    ]).toBe(Civ7PlayableStatusResultSchema);
  });

  test("exports the turn-completion status procedure descriptor artifact from the public facade", () => {
    expect(Civ7TurnCompletionStatusProcedureDescriptor).toMatchObject({
      procedureKey: "runtime.turn.completion.status",
      atomFunction: "getCiv7TurnCompletionStatus",
      schemaTechnology: "typebox",
      proofBoundary: "local-package-test",
      context: expect.arrayContaining(["direct-control-facade", "endpoint-defaults", "state-selection"]),
    });
    expect(typeof callCiv7TurnCompletionStatusProcedure).toBe("function");
    expect(Civ7TurnCompletionStatusProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7TurnCompletionStatusProcedureDescriptor.inputSchema)
    ]).toBe(Civ7TurnCompletionStatusInputSchema);
    expect(Civ7TurnCompletionStatusProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7TurnCompletionStatusProcedureDescriptor.outputSchema)
    ]).toBe(Civ7TurnCompletionStatusResultSchema);
  });

  test("exports the App UI snapshot procedure descriptor artifact from the public facade", () => {
    expect(Civ7AppUiSnapshotProcedureDescriptor).toMatchObject({
      procedureKey: "runtime.app.ui.snapshot",
      atomFunction: "getCiv7AppUiSnapshot",
      schemaTechnology: "typebox",
      proofBoundary: "local-package-test",
      context: expect.arrayContaining([
        "direct-control-facade",
        "endpoint-defaults",
        "state-selection",
        "live-session-policy",
      ]),
    });
    expect(typeof callCiv7AppUiSnapshotProcedure).toBe("function");
    expect(Civ7AppUiSnapshotProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7AppUiSnapshotProcedureDescriptor.inputSchema)
    ]).toBe(Civ7AppUiSnapshotInputSchema);
    expect(Civ7AppUiSnapshotProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7AppUiSnapshotProcedureDescriptor.outputSchema)
    ]).toBe(Civ7AppUiSnapshotResultSchema);
  });

  test("exports the Tuner health procedure descriptor artifact from the public facade", () => {
    expect(Civ7TunerHealthProcedureDescriptor).toMatchObject({
      procedureKey: "runtime.tuner.health",
      atomFunction: "checkCiv7TunerHealth",
      schemaTechnology: "typebox",
      proofBoundary: "local-package-test",
      context: expect.arrayContaining([
        "direct-control-facade",
        "endpoint-defaults",
        "state-selection",
        "live-session-policy",
      ]),
    });
    expect(typeof callCiv7TunerHealthProcedure).toBe("function");
    expect(Civ7TunerHealthProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7TunerHealthProcedureDescriptor.inputSchema)
    ]).toBe(Civ7TunerHealthInputSchema);
    expect(Civ7TunerHealthProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7TunerHealthProcedureDescriptor.outputSchema)
    ]).toBe(Civ7TunerHealthResultSchema);
  });
});
