import { describe, expect, test } from "bun:test";
import { Value } from "typebox/value";
import {
  CIV7_GAME_OPTION_DESCRIPTORS,
  CIV7_GAME_OPTION_IDS,
  CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR,
  CIV7_MAP_OPTION_DESCRIPTORS,
  CIV7_MAP_OPTION_IDS,
  CIV7_PLAYER_OPTION_DESCRIPTORS,
  CIV7_PLAYER_OPTION_IDS,
  CIV7_SETUP_DOMAIN_EVIDENCE,
  CIV7_SETUP_LIFECYCLE_PARAMETER_IDS,
  CIV7_SETUP_PARAMETER_FACTS,
  CIV7_SETUP_PARAMETER_GROUPS,
  CIV7_SETUP_PARAMETER_SOURCE,
  Civ7GameOptionEvidenceSchema,
  Civ7GameOptionsSchema,
  Civ7MapOptionEvidenceSchema,
  Civ7MapOptionsSchema,
  Civ7PlayerOptionEvidenceSchema,
  Civ7PlayerOptionsSchema,
  Civ7PlayerSetupsSchema,
} from "../src/setup.js";
import {
  CIV7_GAME_SETUP_PARAMETER_DESCRIPTORS,
  CIV7_MAP_SETUP_PARAMETER_DESCRIPTORS,
  CIV7_PLAYER_SETUP_PARAMETER_DESCRIPTORS,
} from "../src/setup-parameters.gen.js";

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
    expect(CIV7_GAME_OPTION_IDS as readonly string[]).toEqual(
      CIV7_GAME_OPTION_DESCRIPTORS.map(({ parameterId }) => parameterId)
    );
    expect(CIV7_MAP_OPTION_IDS as readonly string[]).toEqual(
      CIV7_MAP_OPTION_DESCRIPTORS.map(({ parameterId }) => parameterId)
    );
    expect(CIV7_PLAYER_OPTION_IDS as readonly string[]).toEqual(
      CIV7_PLAYER_OPTION_DESCRIPTORS.map(({ parameterId }) => parameterId)
    );
  });

  test("select authored-value reads from official physical projection facts", () => {
    const gameDescriptor = (parameterId: string) =>
      CIV7_GAME_SETUP_PARAMETER_DESCRIPTORS.find(
        (descriptor) => descriptor.parameterId === parameterId
      );
    const mapDescriptor = (parameterId: string) =>
      CIV7_MAP_SETUP_PARAMETER_DESCRIPTORS.find(
        (descriptor) => descriptor.parameterId === parameterId
      );
    const playerDescriptor = (parameterId: string) =>
      CIV7_PLAYER_SETUP_PARAMETER_DESCRIPTORS.find(
        (descriptor) => descriptor.parameterId === parameterId
      );

    expect(gameDescriptor("Ruleset")).toMatchObject({
      cardinality: "scalar",
      valueKind: "string",
      physicalProjections: {
        configuration: { key: "RuleSet", encoding: "literal" },
        authoredValue: null,
      },
      authoredValueRead: {
        kind: "configuration",
        key: "RuleSet",
        source: "configuration-key",
      },
    });
    expect(gameDescriptor("Age")).toMatchObject({
      physicalProjections: {
        configuration: { key: "StartAge", encoding: "hash" },
        authoredValue: { key: "StartAgeTypeName" },
      },
      authoredValueRead: {
        kind: "configuration",
        key: "StartAgeTypeName",
        source: "value-configuration-key",
      },
    });
    expect(gameDescriptor("DifficultyIndependentsCombat")?.authoredValueRead).toEqual({
      kind: "unsupported",
      reason: "no-authored-value-key",
    });
    expect(gameDescriptor("GameStartCivSelectionMode")?.authoredValueRead).toEqual({
      kind: "unsupported",
      reason: "overlapping-projection-keys",
    });
    expect(gameDescriptor("Crises")).toMatchObject({
      cardinality: "array",
      valueKind: "string",
      authoredValueRead: {
        kind: "configuration",
        key: "ExcludeCrises",
        source: "configuration-key",
      },
    });
    expect(mapDescriptor("StartPosition")?.authoredValueRead).toEqual({
      kind: "unsupported",
      reason: "no-authored-value-key",
    });
    expect(playerDescriptor("PlayerCivilization")).toMatchObject({
      cardinality: "scalar",
      valueKind: "string",
      physicalProjections: {
        configuration: { key: "CivilizationTypeID", encoding: "hash" },
        authoredValue: { key: "CivilizationTypeName" },
      },
      authoredValueRead: {
        kind: "configuration",
        key: "CivilizationTypeName",
        source: "value-configuration-key",
      },
    });
    expect(playerDescriptor("PlayerMementoMajorSlot")?.authoredValueRead).toEqual({
      kind: "configuration",
      key: "MajorMemento",
      source: "configuration-key",
    });
    expect(gameDescriptor("MaxTurns")?.valueKind).toBe("integer");
    expect(gameDescriptor("NoCivUnlocks")?.valueKind).toBe("boolean");
  });

  test("exports one deeply immutable generated GameRandomSeed lifecycle identity", () => {
    const generatedIndex = CIV7_GAME_SETUP_PARAMETER_DESCRIPTORS.findIndex(
      ({ parameterId }) => parameterId === "GameRandomSeed"
    );
    expect(generatedIndex).toBe(
      CIV7_GAME_SETUP_PARAMETER_DESCRIPTORS.indexOf(CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR)
    );
    expect(CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR).toMatchObject({
      configurationGroup: "Game",
      parameterId: "GameRandomSeed",
      authoredValueRead: {
        kind: "configuration",
        key: "RandomSeed",
        source: "configuration-key",
      },
    });

    expect(Object.isFrozen(CIV7_GAME_SETUP_PARAMETER_DESCRIPTORS)).toBe(true);
    expect(Object.isFrozen(CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR)).toBe(true);
    expect(Object.isFrozen(CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR.physicalProjections)).toBe(
      true
    );
    expect(
      Object.isFrozen(CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR.physicalProjections.configuration)
    ).toBe(true);
    expect(Object.isFrozen(CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR.authoredValueRead)).toBe(
      true
    );
    expect(
      Reflect.set(CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR.authoredValueRead, "key", "Forged")
    ).toBe(false);
    expect(CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR.authoredValueRead.key).toBe("RandomSeed");

    for (const descriptors of [
      CIV7_GAME_SETUP_PARAMETER_DESCRIPTORS,
      CIV7_MAP_SETUP_PARAMETER_DESCRIPTORS,
      CIV7_PLAYER_SETUP_PARAMETER_DESCRIPTORS,
    ]) {
      expect(Object.isFrozen(descriptors)).toBe(true);
      for (const descriptor of descriptors) {
        expect(Object.isFrozen(descriptor)).toBe(true);
        expect(Object.isFrozen(descriptor.physicalProjections)).toBe(true);
        expect(Object.isFrozen(descriptor.physicalProjections.configuration)).toBe(true);
        if (descriptor.physicalProjections.authoredValue) {
          expect(Object.isFrozen(descriptor.physicalProjections.authoredValue)).toBe(true);
        }
        expect(Object.isFrozen(descriptor.authoredValueRead)).toBe(true);
      }
    }
  });

  test("derives exact option-evidence schemas from generated ParameterID value schemas", () => {
    expect(
      Value.Check(Civ7MapOptionEvidenceSchema, {
        status: "available",
        key: "MapSeaLevel",
        value: "SEA_LEVEL_STANDARD",
      })
    ).toBe(true);
    expect(
      Value.Check(Civ7MapOptionEvidenceSchema, {
        status: "available",
        key: "MapSeaLevel",
        value: true,
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7GameOptionEvidenceSchema, {
        status: "available",
        key: "MaxTurns",
        value: 300,
      })
    ).toBe(true);
    expect(
      Value.Check(Civ7GameOptionEvidenceSchema, {
        status: "available",
        key: "Crises",
        value: ["CRISIS_ONE", "CRISIS_TWO"],
      })
    ).toBe(true);
    expect(
      Value.Check(Civ7GameOptionEvidenceSchema, {
        status: "available",
        key: "GameRandomSeed",
        value: 123,
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7PlayerOptionEvidenceSchema, {
        status: "available",
        key: "PlayerTeam",
        value: 2,
      })
    ).toBe(true);
    expect(
      Value.Check(Civ7PlayerOptionEvidenceSchema, {
        status: "unavailable",
        key: "PlayerTeam",
        reason: "read-failed",
      })
    ).toBe(true);
  });

  test("collapses contextual rows only into one stable projection descriptor", () => {
    expect(
      CIV7_MAP_SETUP_PARAMETER_DESCRIPTORS.filter(
        ({ parameterId }) => parameterId === "MapSeaLevel"
      )
    ).toHaveLength(1);
    expect(
      CIV7_GAME_SETUP_PARAMETER_DESCRIPTORS.filter(
        ({ parameterId }) => parameterId === "GameSpeeds"
      )
    ).toHaveLength(1);
    for (const descriptors of [
      CIV7_GAME_SETUP_PARAMETER_DESCRIPTORS,
      CIV7_MAP_SETUP_PARAMETER_DESCRIPTORS,
      CIV7_PLAYER_SETUP_PARAMETER_DESCRIPTORS,
    ]) {
      expect(new Set(descriptors.map(({ parameterId }) => parameterId)).size).toBe(
        descriptors.length
      );
    }
  });

  test("exclude lifecycle fields while preserving exact option descriptor identity", () => {
    const lifecycleIds = new Set<string>(CIV7_SETUP_LIFECYCLE_PARAMETER_IDS);
    expect(CIV7_GAME_OPTION_IDS as readonly string[]).toEqual(
      CIV7_GAME_SETUP_PARAMETER_DESCRIPTORS.filter(
        ({ parameterId }) => !lifecycleIds.has(parameterId)
      ).map(({ parameterId }) => parameterId)
    );
    expect(CIV7_MAP_OPTION_IDS as readonly string[]).toEqual(
      CIV7_MAP_SETUP_PARAMETER_DESCRIPTORS.filter(
        ({ parameterId }) => !lifecycleIds.has(parameterId)
      ).map(({ parameterId }) => parameterId)
    );
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
