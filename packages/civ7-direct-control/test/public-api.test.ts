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
  Civ7CapabilityCatalogEntrySchema,
  Civ7CapabilityCatalogSchema,
  Civ7ComponentIdSchema,
  Civ7MapLocationSchema,
  Civ7PlayableStatusInputSchema,
  Civ7PlayableStatusProcedureDescriptor,
  Civ7PlayableStatusProcedureSchemaArtifacts,
  Civ7PlayableStatusResultSchema,
  Civ7ProcedureSchemaReferenceSchema,
  Civ7ReadyCityViewProcedureDescriptor,
  Civ7ReadyCityViewProcedureSchemaArtifacts,
  Civ7ReadyCityViewInputSchema,
  Civ7ReadyCityViewResultSchema,
  Civ7ReadyUnitViewProcedureDescriptor,
  Civ7ReadyUnitViewProcedureSchemaArtifacts,
  Civ7ReadyUnitViewInputSchema,
  Civ7ReadyUnitViewResultSchema,
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
  civ7ProcedureSchemaReferenceKey,
  createCiv7ControlRequestId,
  resolveCiv7ProcedureCoreSchemas,
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

  test("exports procedure schema reference schema from the public facade", () => {
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
    expect(civ7ProcedureSchemaReferenceKey(outputSchema)).toContain("Civ7ReadyUnitViewResultSchema");
  });

  test("exports the ready-unit procedure descriptor artifact from the public facade", () => {
    expect(Civ7ReadyUnitViewProcedureDescriptor).toMatchObject({
      procedureKey: "unit.ready.view",
      atomFunction: "getCiv7ReadyUnitView",
      proofBoundary: "local-package-test",
    });
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
      proofBoundary: "local-package-test",
    });
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
      proofBoundary: "local-package-test",
    });
    expect(Civ7UnitMovePreviewProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7UnitMovePreviewProcedureDescriptor.inputSchema)
    ]).toBe(Civ7UnitMovePreviewInputSchema);
    expect(Civ7UnitMovePreviewProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7UnitMovePreviewProcedureDescriptor.outputSchema)
    ]).toBe(Civ7UnitMovePreviewResultSchema);
  });

  test("exports the playable-status procedure descriptor artifact from the public facade", () => {
    expect(Civ7PlayableStatusProcedureDescriptor).toMatchObject({
      procedureKey: "runtime.playable.status",
      atomFunction: "getCiv7PlayableStatus",
      proofBoundary: "local-package-test",
    });
    expect(Civ7PlayableStatusProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7PlayableStatusProcedureDescriptor.inputSchema)
    ]).toBe(Civ7PlayableStatusInputSchema);
    expect(Civ7PlayableStatusProcedureSchemaArtifacts[
      civ7ProcedureSchemaReferenceKey(Civ7PlayableStatusProcedureDescriptor.outputSchema)
    ]).toBe(Civ7PlayableStatusResultSchema);
  });
});
