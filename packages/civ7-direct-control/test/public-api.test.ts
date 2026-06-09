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
  createCiv7ControlRequestId,
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
});
