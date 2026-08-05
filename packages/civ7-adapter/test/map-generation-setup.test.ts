import { afterEach, describe, expect, it } from "bun:test";
import {
  CIV7_GAME_OPTION_DESCRIPTORS,
  CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR,
  CIV7_MAP_OPTION_DESCRIPTORS,
  CIV7_PLAYER_OPTION_DESCRIPTORS,
} from "@civ7/map-policy/setup";

import {
  type Civ7MapGenerationSetupCaptureInput,
  captureCiv7MapGenerationSetup,
} from "../src/index.js";

const configurationDescriptor = Object.getOwnPropertyDescriptor(globalThis, "Configuration");
const playersDescriptor = Object.getOwnPropertyDescriptor(globalThis, "Players");
const GAME_RANDOM_SEED_KEY = CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR.authoredValueRead.key;
const MAP_SEA_LEVEL_OPTION = descriptorById(CIV7_MAP_OPTION_DESCRIPTORS, "MapSeaLevel");
const START_POSITION_OPTION = descriptorById(CIV7_MAP_OPTION_DESCRIPTORS, "StartPosition");
const RULESET_OPTION = descriptorById(CIV7_GAME_OPTION_DESCRIPTORS, "Ruleset");
const AGE_OPTION = descriptorById(CIV7_GAME_OPTION_DESCRIPTORS, "Age");
const DIFFICULTY_OPTION = descriptorById(CIV7_GAME_OPTION_DESCRIPTORS, "Difficulty");
const CRISES_OPTION = descriptorById(CIV7_GAME_OPTION_DESCRIPTORS, "Crises");
const MAX_TURNS_OPTION = descriptorById(CIV7_GAME_OPTION_DESCRIPTORS, "MaxTurns");
const GAME_START_CIV_SELECTION_MODE_OPTION = descriptorById(
  CIV7_GAME_OPTION_DESCRIPTORS,
  "GameStartCivSelectionMode"
);
const PLAYER_TEAM_OPTION = descriptorById(CIV7_PLAYER_OPTION_DESCRIPTORS, "PlayerTeam");
const PLAYER_CIVILIZATION_OPTION = descriptorById(
  CIV7_PLAYER_OPTION_DESCRIPTORS,
  "PlayerCivilization"
);
const PLAYER_DIFFICULTY_OPTION = descriptorById(CIV7_PLAYER_OPTION_DESCRIPTORS, "PlayerDifficulty");

afterEach(() => {
  restoreGlobal("Configuration", configurationDescriptor);
  restoreGlobal("Players", playersDescriptor);
});

describe("Civ7 GenerateMap setup capture", () => {
  it("captures one detached immutable setup without bulk or inferred reads", () => {
    const gameReads: string[] = [];
    const mapReads: string[] = [];
    const playerReads: [number, string][] = [];
    installGlobal("Configuration", {
      getGameValue(key: string): unknown {
        gameReads.push(key);
        if (key === GAME_RANDOM_SEED_KEY) return -29;
        if (key === "RuleSet") return "RULESET_STANDARD";
        if (key === "ExcludeCrises") return ["CRISIS_ONE", "CRISIS_TWO"];
        if (key === "HandicapTypeName") throw new Error("not available in this game");
        return undefined;
      },
      getMapValue(key: string): unknown {
        mapReads.push(key);
        if (key === "SeaLevel") return "SEA_LEVEL_HIGH";
        return undefined;
      },
      getPlayer(playerId: number): unknown {
        if (playerId === 2) throw new Error("player configuration unavailable");
        return {
          getValue(key: string): unknown {
            playerReads.push([playerId, key]);
            if (playerId === 7 && key === "Team") return 2;
            if (playerId === 7 && key === "CivilizationTypeName") return "CIVILIZATION_ROME";
            return undefined;
          },
        };
      },
    });
    installGlobal("Players", {
      getAliveMajorIds: () => [7, 2, 11],
    });

    const dimensions = { width: 106, height: 66 };
    const latitudeBounds = { topLatitude: 90, bottomLatitude: -90 };
    const mapInfo = {
      MapSizeType: "MAPSIZE_HUGE",
      AllOnLargestLandmass: false,
      Continents: 6,
      DefaultPlayers: 10,
      Description: "LOC_MAPSIZE_HUGE_DESCRIPTION",
      GridWidth: 106,
      GridHeight: 66,
      LakeGenerationFrequency: 25,
      LakeSizeCutoff: 10,
      Name: "LOC_MAPSIZE_HUGE_NAME",
      NumNaturalWonders: 7,
      OceanWidth: 8,
      PlayersLandmass1: 6,
      PlayersLandmass2: 6,
      StartSectorRows: 4,
      StartSectorCols: 3,
    };

    const captured = captureCiv7MapGenerationSetup({
      mapSeed: 17,
      dimensions,
      latitudeBounds,
      mapSizeId: "MAPSIZE_HUGE",
      mapInfo,
      requestedMapOptions: [START_POSITION_OPTION, MAP_SEA_LEVEL_OPTION],
      requestedGameOptions: [
        CRISES_OPTION,
        RULESET_OPTION,
        AGE_OPTION,
        DIFFICULTY_OPTION,
        GAME_START_CIV_SELECTION_MODE_OPTION,
      ],
      requestedPlayerOptions: [
        PLAYER_TEAM_OPTION,
        PLAYER_CIVILIZATION_OPTION,
        PLAYER_DIFFICULTY_OPTION,
      ],
    });

    dimensions.width = 1;
    latitudeBounds.topLatitude = 45;
    mapInfo.PlayersLandmass1 = 1;

    expect(gameReads).toEqual([
      GAME_RANDOM_SEED_KEY,
      "ExcludeCrises",
      "RuleSet",
      "StartAgeTypeName",
      "HandicapTypeName",
    ]);
    expect(mapReads).toEqual(["SeaLevel"]);
    expect(playerReads).toEqual([
      [7, "Team"],
      [7, "CivilizationTypeName"],
      [11, "Team"],
      [11, "CivilizationTypeName"],
    ]);
    expect(captured).toEqual({
      mapSeed: 17,
      gameSeed: -29,
      dimensions: { width: 106, height: 66 },
      latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
      mapSizeId: "MAPSIZE_HUGE",
      mapInfo: {
        MapSizeType: "MAPSIZE_HUGE",
        Description: "LOC_MAPSIZE_HUGE_DESCRIPTION",
        Name: "LOC_MAPSIZE_HUGE_NAME",
        Continents: 6,
        DefaultPlayers: 10,
        GridWidth: 106,
        GridHeight: 66,
        LakeGenerationFrequency: 25,
        LakeSizeCutoff: 10,
        NumNaturalWonders: 7,
        OceanWidth: 8,
        PlayersLandmass1: 6,
        PlayersLandmass2: 6,
        StartSectorRows: 4,
        StartSectorCols: 3,
        AllOnLargestLandmass: false,
      },
      aliveMajorPlayerIds: [7, 2, 11],
      startSlotCapacity: { west: 6, east: 6, total: 12 },
      options: {
        map: [
          { status: "unavailable", key: "StartPosition", reason: "no-authored-value-key" },
          { status: "available", key: "MapSeaLevel", value: "SEA_LEVEL_HIGH" },
        ],
        game: [
          {
            status: "available",
            key: "Crises",
            value: ["CRISIS_ONE", "CRISIS_TWO"],
          },
          { status: "available", key: "Ruleset", value: "RULESET_STANDARD" },
          { status: "unavailable", key: "Age", reason: "value-unavailable" },
          { status: "unavailable", key: "Difficulty", reason: "read-failed" },
          {
            status: "unavailable",
            key: "GameStartCivSelectionMode",
            reason: "overlapping-projection-keys",
          },
        ],
        player: [
          {
            playerId: 7,
            options: [
              { status: "available", key: "PlayerTeam", value: 2 },
              {
                status: "available",
                key: "PlayerCivilization",
                value: "CIVILIZATION_ROME",
              },
              {
                status: "unavailable",
                key: "PlayerDifficulty",
                reason: "no-authored-value-key",
              },
            ],
          },
          {
            playerId: 2,
            options: [
              { status: "unavailable", key: "PlayerTeam", reason: "read-failed" },
              { status: "unavailable", key: "PlayerCivilization", reason: "read-failed" },
              {
                status: "unavailable",
                key: "PlayerDifficulty",
                reason: "no-authored-value-key",
              },
            ],
          },
          {
            playerId: 11,
            options: [
              { status: "unavailable", key: "PlayerTeam", reason: "value-unavailable" },
              {
                status: "unavailable",
                key: "PlayerCivilization",
                reason: "value-unavailable",
              },
              {
                status: "unavailable",
                key: "PlayerDifficulty",
                reason: "no-authored-value-key",
              },
            ],
          },
        ],
      },
    });
    expect(Object.isFrozen(captured)).toBe(true);
    expect(Object.isFrozen(captured.dimensions)).toBe(true);
    expect(Object.isFrozen(captured.mapInfo)).toBe(true);
    expect(Object.isFrozen(captured.aliveMajorPlayerIds)).toBe(true);
    expect(Object.isFrozen(captured.options.map)).toBe(true);
    expect(Object.isFrozen(captured.options.player)).toBe(true);
    expect(Object.isFrozen(captured.options.player[0])).toBe(true);
    const firstPlayerId: 7 | number = captured.options.player[0]!.playerId;
    const playerTeamKey: "PlayerTeam" = captured.options.player[0]!.options[0].key;
    void firstPlayerId;
    void playerTeamKey;
    const startPositionEvidence = captured.options.map[0];
    const seaLevelKey: "MapSeaLevel" = captured.options.map[1].key;
    const crisesEvidence = captured.options.game[0];
    const rulesetEvidence = captured.options.game[1];
    expect(startPositionEvidence).toEqual({
      status: "unavailable",
      key: "StartPosition",
      reason: "no-authored-value-key",
    });
    void seaLevelKey;
    expect(crisesEvidence?.status).toBe("available");
    if (crisesEvidence?.status !== "available" || !Array.isArray(crisesEvidence.value)) {
      throw new Error("Expected captured Crises array evidence.");
    }
    if (rulesetEvidence.status === "available") {
      const rulesetValue: string = rulesetEvidence.value;
      void rulesetValue;
    }
    expect(Object.isFrozen(crisesEvidence.value)).toBe(true);
    expect(Reflect.has(captured, "Configuration")).toBe(false);
    expect(Reflect.has(captured, "Players")).toBe(false);
  });

  it("preserves an exact empty alive-major observation instead of synthesizing slot ids", () => {
    installGlobal("Configuration", {
      getGameValue: (key: string) => (key === GAME_RANDOM_SEED_KEY ? 23 : undefined),
    });
    installGlobal("Players", { getAliveMajorIds: () => [] });

    const captured = captureCiv7MapGenerationSetup(
      captureInput({
        mapSizeId: "42",
        mapInfo: { ...captureInput().mapInfo, Description: null },
        requestedMapOptions: [MAP_SEA_LEVEL_OPTION],
      })
    );

    expect(captured.mapSizeId).toBe("42");
    expect(captured.aliveMajorPlayerIds).toEqual([]);
    expect(captured.mapInfo.Description).toBeNull();
    expect(captured.startSlotCapacity).toEqual({ west: 5, east: 3, total: 8 });
    expect(captured.options.map).toEqual([
      {
        status: "unavailable",
        key: "MapSeaLevel",
        reason: "configuration-api-unavailable",
      },
    ]);
    expect(captured.options.player).toEqual([]);
  });

  it("decodes negative game seeds exposed through the unsigned MapGeneration bridge", () => {
    installGlobal("Players", { getAliveMajorIds: () => [0] });

    for (const [observed, expected] of [
      [0x8000_0000, -0x8000_0000],
      [0xc5b3_ccfc, -978_072_324],
      [0xffff_ffff, -1],
    ] as const) {
      installGlobal("Configuration", {
        getGameValue: (key: string) => (key === GAME_RANDOM_SEED_KEY ? observed : undefined),
      });
      expect(captureCiv7MapGenerationSetup(captureInput()).gameSeed).toBe(expected);
    }

    installGlobal("Configuration", {
      getGameValue: (key: string) =>
        key === GAME_RANDOM_SEED_KEY ? 0x1_0000_0000 : undefined,
    });
    expect(() => captureCiv7MapGenerationSetup(captureInput())).toThrow(
      "Civ7 game seed must be between"
    );
  });

  it("fails closed for coerced seeds, malformed ids, duplicate players, and missing capacity", () => {
    installGlobal("Configuration", {
      getGameValue: (key: string) => (key === GAME_RANDOM_SEED_KEY ? "23" : undefined),
      getMapValue: () => undefined,
    });
    installGlobal("Players", { getAliveMajorIds: () => [3, 1] });
    expect(() => captureCiv7MapGenerationSetup(captureInput())).toThrow(
      "Civ7 game seed must be a signed 32-bit integer without coercion"
    );

    installGlobal("Configuration", {
      getGameValue: (key: string) => (key === GAME_RANDOM_SEED_KEY ? 23 : undefined),
      getMapValue: () => undefined,
    });
    installGlobal("Players", { getAliveMajorIds: () => [3, 1, 3] });
    expect(() => captureCiv7MapGenerationSetup(captureInput())).toThrow(
      "Civ7 alive-major player ids must be unique"
    );

    installGlobal("Players", { getAliveMajorIds: () => [3, "1"] });
    expect(() => captureCiv7MapGenerationSetup(captureInput())).toThrow(
      "Civ7 alive-major player ids must be integers between 0 and 63"
    );

    const sparsePlayerIds = Array<number>(1);
    installGlobal("Players", { getAliveMajorIds: () => sparsePlayerIds });
    expect(() => captureCiv7MapGenerationSetup(captureInput())).toThrow("sparse entries");

    let accessorReads = 0;
    const accessorPlayerIds = [3];
    Object.defineProperty(accessorPlayerIds, "0", {
      get: () => {
        accessorReads += 1;
        return 3;
      },
    });
    installGlobal("Players", { getAliveMajorIds: () => accessorPlayerIds });
    expect(() => captureCiv7MapGenerationSetup(captureInput())).toThrow("not accessors");
    expect(accessorReads).toBe(0);
    installGlobal("Players", { getAliveMajorIds: () => [3, 1] });

    expect(() =>
      captureCiv7MapGenerationSetup({
        ...captureInput(),
        mapSeed: "17",
      } as unknown as Civ7MapGenerationSetupCaptureInput)
    ).toThrow("Civ7 map seed must be a signed 32-bit integer without coercion");
    expect(() =>
      captureCiv7MapGenerationSetup(
        captureInput({
          mapSizeId: " MAPSIZE_STANDARD",
        })
      )
    ).toThrow("Civ7 mapSizeId must be a non-empty unpadded string or safe integer");
    expect(() =>
      captureCiv7MapGenerationSetup(
        captureInput({
          mapInfo: {
            ...captureInput().mapInfo,
            MapSizeType: " MAPSIZE_STANDARD",
          },
        })
      )
    ).toThrow("Civ7 mapInfo.MapSizeType must be a non-empty unpadded string when present");
    expect(() =>
      captureCiv7MapGenerationSetup(
        captureInput({
          mapInfo: {
            ...captureInput().mapInfo,
            AllOnLargestLandmass: "false",
          } as unknown as Civ7MapGenerationSetupCaptureInput["mapInfo"],
        })
      )
    ).toThrow("Civ7 mapInfo.AllOnLargestLandmass must be a boolean when present");
    expect(() =>
      captureCiv7MapGenerationSetup(
        captureInput({
          mapInfo: {
            ...captureInput().mapInfo,
            Name: 1,
          } as unknown as Civ7MapGenerationSetupCaptureInput["mapInfo"],
        })
      )
    ).toThrow("Civ7 mapInfo.Name must be a string when present");
    expect(() =>
      captureCiv7MapGenerationSetup(
        captureInput({
          requestedGameOptions: [RULESET_OPTION, RULESET_OPTION],
        })
      )
    ).toThrow("Civ7 requested game options must contain unique parameterId values");
    expect(() =>
      captureCiv7MapGenerationSetup(
        captureInput({
          mapInfo: {
            PlayersLandmass1: 5,
          },
        })
      )
    ).toThrow("Civ7 mapInfo.PlayersLandmass2 must be a non-negative safe integer");
  });

  it("marks non-snapshotable explicitly requested values unavailable", () => {
    installGlobal("Configuration", {
      getGameValue: (key: string) => (key === GAME_RANDOM_SEED_KEY ? 23 : Number.NaN),
      getMapValue: () => ({ nested: true }),
    });
    installGlobal("Players", { getAliveMajorIds: () => [0] });

    const captured = captureCiv7MapGenerationSetup(
      captureInput({
        requestedMapOptions: [MAP_SEA_LEVEL_OPTION],
        requestedGameOptions: [MAX_TURNS_OPTION],
      })
    );

    expect(captured.options.map).toEqual([
      { status: "unavailable", key: "MapSeaLevel", reason: "value-not-snapshotable" },
    ]);
    expect(captured.options.game).toEqual([
      { status: "unavailable", key: "MaxTurns", reason: "value-not-snapshotable" },
    ]);
  });

  it("snapshots admitted descriptor tuples before any Civ7 runtime read can mutate the caller", () => {
    const requestedGameOptions = [RULESET_OPTION, MAX_TURNS_OPTION];
    installGlobal("Configuration", {
      getGameValue(key: string): unknown {
        if (key === GAME_RANDOM_SEED_KEY) {
          requestedGameOptions.splice(0);
          return 23;
        }
        if (key === RULESET_OPTION.authoredValueRead.key) return "RULESET_STANDARD";
        if (key === MAX_TURNS_OPTION.authoredValueRead.key) return 300;
        return undefined;
      },
    });
    installGlobal("Players", { getAliveMajorIds: () => [] });

    const captured = captureCiv7MapGenerationSetup(captureInput({ requestedGameOptions }));

    expect(requestedGameOptions).toEqual([]);
    expect(captured.options.game).toEqual([
      { status: "available", key: "Ruleset", value: "RULESET_STANDARD" },
      { status: "available", key: "MaxTurns", value: 300 },
    ]);
  });

  it("rejects accessor-backed option-array elements without invoking them", () => {
    let accessorReads = 0;
    const crises: string[] = [];
    Object.defineProperty(crises, "0", {
      configurable: true,
      enumerable: true,
      get() {
        accessorReads += 1;
        return "CRISIS_ONE";
      },
    });

    installGlobal("Configuration", {
      getGameValue(key: string): unknown {
        if (key === GAME_RANDOM_SEED_KEY) return 23;
        if (key === CRISES_OPTION.authoredValueRead.key) return crises;
        return undefined;
      },
    });
    installGlobal("Players", { getAliveMajorIds: () => [] });

    const captured = captureCiv7MapGenerationSetup(
      captureInput({ requestedGameOptions: [CRISES_OPTION] })
    );

    expect(accessorReads).toBe(0);
    expect(captured.options.game).toEqual([
      { status: "unavailable", key: "Crises", reason: "value-not-snapshotable" },
    ]);
  });

  it("refuses copied and hand-forged descriptors before reading Civ7 setup state", () => {
    const copiedMapDescriptor = { ...MAP_SEA_LEVEL_OPTION };
    expect(() =>
      captureCiv7MapGenerationSetup(captureInput({ requestedMapOptions: [copiedMapDescriptor] }))
    ).toThrow("Civ7 requested map options must contain exact generated descriptor identities");

    const forgedGameDescriptor = {
      ...RULESET_OPTION,
      parameterId: "ForgedRuleset",
    };
    const forgedInput = {
      ...captureInput(),
      requestedGameOptions: [forgedGameDescriptor],
    } as unknown as Civ7MapGenerationSetupCaptureInput;
    expect(() => captureCiv7MapGenerationSetup(forgedInput)).toThrow(
      "Civ7 requested game options must contain exact generated descriptor identities"
    );

    const copiedPlayerDescriptor = { ...PLAYER_TEAM_OPTION };
    expect(() =>
      captureCiv7MapGenerationSetup(
        captureInput({ requestedPlayerOptions: [copiedPlayerDescriptor] })
      )
    ).toThrow("Civ7 requested player options must contain exact generated descriptor identities");
  });
});

function captureInput(
  overrides: Partial<Civ7MapGenerationSetupCaptureInput> = {}
): Civ7MapGenerationSetupCaptureInput {
  return {
    mapSeed: 17,
    dimensions: { width: 84, height: 54 },
    latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
    mapSizeId: "MAPSIZE_STANDARD",
    mapInfo: {
      MapSizeType: "MAPSIZE_STANDARD",
      AllOnLargestLandmass: false,
      Continents: 4,
      DefaultPlayers: 8,
      Description: "LOC_MAPSIZE_STANDARD_DESCRIPTION",
      GridWidth: 84,
      GridHeight: 54,
      LakeGenerationFrequency: 25,
      LakeSizeCutoff: 8,
      Name: "LOC_MAPSIZE_STANDARD_NAME",
      NumNaturalWonders: 5,
      OceanWidth: 4,
      PlayersLandmass1: 5,
      PlayersLandmass2: 3,
      StartSectorRows: 4,
      StartSectorCols: 3,
    },
    requestedMapOptions: [],
    requestedGameOptions: [],
    requestedPlayerOptions: [],
    ...overrides,
  };
}

function descriptorById<
  Descriptor extends Readonly<{ parameterId: string }>,
  const ParameterId extends Descriptor["parameterId"],
>(
  descriptors: readonly Descriptor[],
  parameterId: ParameterId
): Extract<Descriptor, { parameterId: ParameterId }> {
  const descriptor = descriptors.find(
    (candidate): candidate is Extract<Descriptor, { parameterId: ParameterId }> =>
      candidate.parameterId === parameterId
  );
  if (!descriptor) throw new Error(`Missing generated Civ7 setup descriptor: ${parameterId}`);
  return descriptor;
}

function installGlobal(name: string, value: unknown): void {
  Object.defineProperty(globalThis, name, {
    configurable: true,
    enumerable: true,
    value,
    writable: true,
  });
}

function restoreGlobal(name: string, descriptor: PropertyDescriptor | undefined): void {
  if (descriptor === undefined) {
    Reflect.deleteProperty(globalThis, name);
    return;
  }
  Object.defineProperty(globalThis, name, descriptor);
}
