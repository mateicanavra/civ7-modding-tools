import { describe, expect, test } from "bun:test";
import { Value } from "typebox/value";
import {
  CIV7_GAME_OPTION_IDS,
  CIV7_MAP_OPTION_IDS,
  CIV7_PLAYER_OPTION_IDS,
  CIV7_SETUP_DOMAIN_EVIDENCE,
  CIV7_SETUP_PARAMETER_FACTS,
  CIV7_SETUP_PARAMETER_GROUPS,
  CIV7_SETUP_PARAMETER_SOURCE,
  Civ7GameOptionsSchema,
  Civ7MapOptionsSchema,
  Civ7PlayerOptionsSchema,
  Civ7PlayerSetupsSchema,
} from "../src/setup.js";

const parameterId = (row: (typeof CIV7_SETUP_PARAMETER_FACTS)[number]) => row.columns.ParameterID;

describe("official Civ7 setup parameter authority", () => {
  test("preserves the complete declared source corpus and provenance", () => {
    expect(CIV7_SETUP_PARAMETER_SOURCE).toMatchObject({
      files: [
        "Base/modules/core/config/SetupParameters.xml",
        "Base/modules/base-standard/config/config.xml",
      ],
      schema: "Base/Assets/schema/frontend/schema-frontend-10-setup-parameters.sql",
    });
    expect(CIV7_SETUP_PARAMETER_SOURCE.commit).toMatch(/^[0-9a-f]{40}$/);
    expect(CIV7_SETUP_PARAMETER_FACTS).toHaveLength(61);
    expect(new Set(CIV7_SETUP_PARAMETER_FACTS.map(parameterId)).size).toBe(54);
    expect(CIV7_SETUP_PARAMETER_GROUPS).toHaveLength(14);
  });

  test("retains contextual and multiplayer variants instead of manufacturing one default", () => {
    const rowsFor = (id: string) =>
      CIV7_SETUP_PARAMETER_FACTS.filter((row) => parameterId(row) === id);

    expect(rowsFor("MapSeaLevel")).toHaveLength(5);
    expect(rowsFor("MapSeaLevel").every((row) => row.columns.Key1 === "Map")).toBe(true);
    expect(rowsFor("GameSpeeds")).toHaveLength(2);
    expect(rowsFor("StartPosition")).toHaveLength(2);
    expect(rowsFor("Map")).toHaveLength(2);
    expect(new Set(rowsFor("GameSpeeds").map((row) => row.columns.DefaultValue))).toEqual(
      new Set(["GAMESPEED_STANDARD", "GAMESPEED_ONLINE"])
    );
  });

  test("resolves SQL defaults without erasing explicit support profiles", () => {
    const ruleset = CIV7_SETUP_PARAMETER_FACTS.find((row) => parameterId(row) === "Ruleset");
    const playerCivilization = CIV7_SETUP_PARAMETER_FACTS.find(
      (row) => parameterId(row) === "PlayerCivilization"
    );
    const gameName = CIV7_SETUP_PARAMETER_FACTS.find((row) => parameterId(row) === "GameName");

    expect(ruleset?.columns).toMatchObject({
      Array: false,
      Hidden: false,
      ReadOnly: false,
      SupportsSinglePlayer: true,
      SupportsLANMultiplayer: true,
      SupportsInternetMultiplayer: true,
      SupportsHotseatMultiplayer: true,
      IsUGC: false,
      ChangeableAfterGameStart: false,
      ChangeableAfterAgeTransition: false,
    });
    expect(playerCivilization?.columns.SortIndex).toBe(100);
    expect(gameName?.columns).toMatchObject({
      SupportsSinglePlayer: false,
      SupportsLANMultiplayer: true,
      SupportsInternetMultiplayer: true,
      SupportsHotseatMultiplayer: false,
      IsUGC: true,
    });
  });

  test("keeps exclusion-set arrays and dynamic domains explicit", () => {
    for (const id of ["Crises", "LegacyPaths"]) {
      const row = CIV7_SETUP_PARAMETER_FACTS.find((candidate) => parameterId(candidate) === id);
      expect(row?.columns.Array).toBe(true);
      expect(row?.columns.UxHint).toBe("InvertSelection");
    }

    const leaders = CIV7_SETUP_DOMAIN_EVIDENCE.find((domain) => domain.id === "StandardLeaders");
    expect(leaders).toMatchObject({
      source: "resource-domain",
      valueKind: "string",
    });
    expect(leaders?.declaredValues).toContain("RANDOM");
    expect(
      CIV7_SETUP_DOMAIN_EVIDENCE.find((domain) => domain.id === "StandardCrises")?.valueKind
    ).toBe("string");
  });

  test("keeps every parameter attached to a declared UI group", () => {
    const groupIds = new Set(CIV7_SETUP_PARAMETER_GROUPS.map((group) => group.attributes.GroupId));
    expect(CIV7_SETUP_PARAMETER_FACTS.every((row) => groupIds.has(row.columns.GroupID))).toBe(true);
  });
});

describe("authored Civ7 setup option schemas", () => {
  test("admit omitted and extensible game values without applying defaults", () => {
    expect(Value.Parse(Civ7GameOptionsSchema, {})).toEqual({});
    expect(
      Value.Check(Civ7GameOptionsSchema, {
        Difficulty: "DIFFICULTY_PRINCE",
        Ruleset: "RULESET_FROM_FUTURE_DLC",
        Crises: ["CRISIS_ONE", "CRISIS_TWO"],
      })
    ).toBe(true);
  });

  test("reject lifecycle-owned, unknown, and malformed option states", () => {
    expect(Value.Check(Civ7GameOptionsSchema, { GameRandomSeed: 123 })).toBe(false);
    expect(Value.Check(Civ7GameOptionsSchema, { Crises: ["DUPLICATE", "DUPLICATE"] })).toBe(false);
    expect(Value.Check(Civ7GameOptionsSchema, { Crises: "CRISIS_ONE" })).toBe(false);
    expect(Value.Check(Civ7GameOptionsSchema, { UnknownGameOption: true })).toBe(false);

    expect(Value.Check(Civ7MapOptionsSchema, { StartPosition: "START_POSITION_STANDARD" })).toBe(
      true
    );
    expect(Value.Check(Civ7MapOptionsSchema, { Map: "map.js" })).toBe(false);
    expect(Value.Check(Civ7MapOptionsSchema, { MapSize: "MAPSIZE_STANDARD" })).toBe(false);
    expect(Value.Check(Civ7MapOptionsSchema, { MapRandomSeed: 123 })).toBe(false);
    expect(Value.Check(Civ7MapOptionsSchema, { MapSeaLevel: "SEA_LEVEL_STANDARD" })).toBe(true);

    expect(Value.Check(Civ7PlayerOptionsSchema, { PlayerTeam: 2 })).toBe(true);
    expect(Value.Check(Civ7PlayerOptionsSchema, { PlayerTeam: "2" })).toBe(false);
    expect(Value.Check(Civ7PlayerOptionsSchema, { UnknownPlayerOption: true })).toBe(false);
  });

  test("emit closed partial JSON Schema objects", () => {
    for (const schema of [Civ7GameOptionsSchema, Civ7MapOptionsSchema, Civ7PlayerOptionsSchema]) {
      expect(Reflect.get(schema, "additionalProperties")).toBe(false);
      expect(Reflect.has(schema, "required")).toBe(false);
    }
  });

  test("publish option identities from the schema authority", () => {
    const gameIds: readonly string[] = CIV7_GAME_OPTION_IDS;
    const mapIds: readonly string[] = CIV7_MAP_OPTION_IDS;
    const playerIds: readonly string[] = CIV7_PLAYER_OPTION_IDS;
    expect(gameIds).toEqual(Object.keys(Civ7GameOptionsSchema.properties));
    expect(mapIds).toEqual(Object.keys(Civ7MapOptionsSchema.properties));
    expect(playerIds).toEqual(Object.keys(Civ7PlayerOptionsSchema.properties));
    expect(CIV7_GAME_OPTION_IDS).toContain("Crises");
    expect(CIV7_MAP_OPTION_IDS).toContain("StartPosition");
    expect(CIV7_PLAYER_OPTION_IDS).toContain("PlayerTeam");
  });

  test("admit each initial player slot at most once", () => {
    expect(
      Value.Check(Civ7PlayerSetupsSchema, [
        { playerId: 0, options: { PlayerLeader: "LEADER_ONE" } },
        { playerId: 63, options: { PlayerLeader: "LEADER_TWO" } },
      ])
    ).toBe(true);
    expect(
      Value.Check(Civ7PlayerSetupsSchema, [
        { playerId: 2, options: { PlayerLeader: "LEADER_ONE" } },
        { playerId: 2, options: { PlayerLeader: "LEADER_TWO" } },
      ])
    ).toBe(false);
    expect(Value.Check(Civ7PlayerSetupsSchema, [{ playerId: 64, options: {} }])).toBe(false);
  });
});
