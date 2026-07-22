import { once } from "node:events";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { type AddressInfo, createServer, type Socket } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { CIV7_SIGNED_INT_SEED_MAX } from "@civ7/map-policy/setup";
import { describe, expect, test } from "vitest";
import {
  admitCiv7SetupShell,
  applyCiv7SinglePlayerSetupIdentity,
  applyCiv7SinglePlayerSetupOptions,
  assertPreparedSetupMatches,
  beginCiv7Game,
  CIV7_BEGIN_GAME_COMMAND,
  CIV7_EXIT_TO_MAIN_MENU_COMMAND,
  CIV7_RELOAD_UI_COMMAND,
  Civ7DirectControlSession,
  type Civ7SetupMapRow,
  type Civ7SetupSnapshot,
  type Civ7SinglePlayerSetupValues,
  getCiv7SetupMapRows,
  getCiv7SetupSnapshot,
  hostPreparedCiv7SinglePlayerGame,
  listCiv7SavedGameConfigurations,
  reconcileCiv7RequiredTargetMod,
  reloadCiv7SetupUiInShell,
  requestCiv7SavedGameConfigurationLoad,
} from "../src/index";
import {
  buildApplySinglePlayerSetupIdentityCommand,
  buildApplySinglePlayerSetupOptionsCommand,
  buildReconcileTargetModCommand,
  normalizeSinglePlayerSetupInput,
  setupExpectationScriptSource,
} from "../src/setup/prepare";
import { buildSetupSnapshotCommand, defaultSetupReadDependencies } from "../src/setup/reads";
import { buildStartPreparedSinglePlayerCommand } from "../src/setup/start";

const HOST = "127.0.0.1";
const MAP_SCRIPT = "{swooper-maps}/maps/swooper-earthlike.js";
const PREVIOUS_MAP_SCRIPT = "{swooper-maps}/maps/previous-selection.js";
const HIDDEN_MAP_SCRIPT = "{swooper-maps}/maps/studio-current.js";

function setupValues(
  overrides: Partial<Civ7SinglePlayerSetupValues> = {}
): Civ7SinglePlayerSetupValues {
  return {
    mapScript: MAP_SCRIPT,
    mapSize: "MAPSIZE_STANDARD",
    mapSeed: 111,
    gameSeed: 112,
    gameOptions: {},
    mapOptions: {},
    playerOptions: [],
    ...overrides,
  };
}

function civ7CfgRandomSeedRecord(seed: number, type: 8 | 9): Buffer {
  const record = Buffer.alloc(24);
  Buffer.from([0x33, 0x13, 0xe5, 0x0d]).copy(record, 0);
  record.writeUInt32LE(type, 4);
  record.writeUInt32LE(0, 8);
  record.writeUInt32LE(1, 12);
  record.writeUInt32LE(4, 16);
  record.writeInt32LE(seed, 20);
  return record;
}

function civ7CfgMaxMajorPlayersRecord(playerCount: number, hash = 0x0f9f_225c): Buffer {
  const record = Buffer.alloc(24);
  record.writeUInt32LE(hash, 0);
  record.writeUInt32LE(9, 4);
  record.writeUInt32LE(0, 8);
  record.writeUInt32LE(1, 12);
  record.writeUInt32LE(4, 16);
  record.writeInt32LE(playerCount, 20);
  return record;
}

function civ7CfgFixture(
  records: readonly Buffer[],
  maxMajorPlayers = civ7CfgMaxMajorPlayersRecord(6)
): Buffer {
  const [mapSeed, ...laterSeeds] = records;
  return Buffer.concat([
    Buffer.from(["CIV7", "3507297712", "MAPSIZE_SMALL"].join("\0")),
    Buffer.from([0]),
    ...(mapSeed ? [mapSeed, maxMajorPlayers] : []),
    ...laterSeeds,
  ]);
}

describe("Civ7 setup and lifecycle orchestration", () => {
  test("reads exact Civ7Cfg setup scalars without reinterpreting numeric metadata", async () => {
    const directory = await mkdtemp(join(tmpdir(), "civ7-saved-config-"));
    try {
      await writeFile(
        join(directory, "exact-seeds.Civ7Cfg"),
        civ7CfgFixture([
          civ7CfgRandomSeedRecord(-978_072_323, 8),
          civ7CfgRandomSeedRecord(-978_072_324, 9),
        ])
      );

      const result = await listCiv7SavedGameConfigurations({ directory });

      expect(result.configurations).toHaveLength(1);
      expect(result.configurations[0]?.summary).toMatchObject({
        mapSeed: -978_072_323,
        gameSeed: -978_072_324,
        playerCount: 6,
      });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  test("omits Civ7Cfg seed evidence for malformed or non-exact record cardinality", async () => {
    const directory = await mkdtemp(join(tmpdir(), "civ7-saved-config-"));
    try {
      const malformed = civ7CfgRandomSeedRecord(-123, 8);
      malformed.writeUInt32LE(8, 16);
      await Promise.all([
        writeFile(join(directory, "one.Civ7Cfg"), civ7CfgFixture([civ7CfgRandomSeedRecord(-1, 8)])),
        writeFile(
          join(directory, "three.Civ7Cfg"),
          civ7CfgFixture([
            civ7CfgRandomSeedRecord(-1, 8),
            civ7CfgRandomSeedRecord(-2, 9),
            civ7CfgRandomSeedRecord(-3, 8),
          ])
        ),
        writeFile(
          join(directory, "malformed.Civ7Cfg"),
          civ7CfgFixture([malformed, civ7CfgRandomSeedRecord(-2, 9)])
        ),
        writeFile(
          join(directory, "wrong-map-key.Civ7Cfg"),
          civ7CfgFixture(
            [civ7CfgRandomSeedRecord(-1, 8), civ7CfgRandomSeedRecord(-2, 9)],
            civ7CfgMaxMajorPlayersRecord(6, 0xdead_beef)
          )
        ),
        writeFile(
          join(directory, "invalid-player-count.Civ7Cfg"),
          civ7CfgFixture(
            [civ7CfgRandomSeedRecord(-1, 8), civ7CfgRandomSeedRecord(-2, 9)],
            civ7CfgMaxMajorPlayersRecord(0)
          )
        ),
      ]);

      const result = await listCiv7SavedGameConfigurations({ directory });

      expect(result.configurations).toHaveLength(5);
      for (const configuration of result.configurations) {
        expect(configuration.summary).not.toHaveProperty("mapSeed");
        expect(configuration.summary).not.toHaveProperty("gameSeed");
        expect(configuration.summary).not.toHaveProperty("playerCount");
      }
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  test("rejects setup seeds Civ7 would wrap before mutating setup state", async () => {
    const server = await startSetupLifecycleServer();
    try {
      const { port } = server.address();
      await expect(
        applyCiv7SinglePlayerSetupIdentity(
          setupValues({
            mapScript: MAP_SCRIPT,
            mapSize: "MAPSIZE_SMALL",
            mapSeed: CIV7_SIGNED_INT_SEED_MAX + 1,
            gameSeed: 112,
            gameOptions: {},
            mapOptions: {},
            playerOptions: [],
          }),
          { host: HOST, port, timeoutMs: 1_000 }
        )
      ).rejects.toMatchObject({ code: "setup-parameter-invalid" });
      expect(server.operations()).toHaveLength(0);
    } finally {
      await server.close();
    }
  });

  test("reads setup snapshots and filters frontend map rows through App UI", async () => {
    const server = await startSetupLifecycleServer();
    try {
      const { port } = server.address();
      const snapshot = await getCiv7SetupSnapshot({ host: HOST, port, timeoutMs: 1_000 });
      const rows = await getCiv7SetupMapRows(
        { file: MAP_SCRIPT },
        { host: HOST, port, timeoutMs: 1_000 }
      );

      expect(snapshot.state).toEqual({ id: "65535", name: "App UI" });
      expect(snapshot.snapshot).toMatchObject({
        phase: "shell",
        selectedMapRow: {
          source: "setup-domain",
          file: MAP_SCRIPT,
        },
        config: {
          mapScript: { ok: true, value: MAP_SCRIPT },
          mapSize: { ok: true, value: "MAPSIZE_STANDARD" },
          mapSeed: { ok: true, value: 111 },
          gameSeed: { ok: true, value: 112 },
        },
      });
      expect(rows).toMatchObject({
        state: { id: "65535", name: "App UI" },
        matchedFile: MAP_SCRIPT,
        rows: [
          { source: "setup-domain", file: MAP_SCRIPT },
          { source: "config-db", domain: "StandardMaps", file: MAP_SCRIPT },
        ],
      });
      expect(server.operationsFor("setup-snapshot")).toEqual([
        { stateId: "65535", operation: "setup-snapshot" },
      ]);
      expect(server.operationsFor("setup-map-rows")).toEqual([
        { stateId: "65535", operation: "setup-map-rows" },
      ]);
    } finally {
      await server.close();
    }
  });

  test("resolves a decimal Configuration map-size id canonically and retries only its changed raw form", () => {
    const lookupCalls: Array<string | number> = [];
    const command = buildSetupSnapshotCommand(defaultSetupReadDependencies);
    const result = JSON.parse(
      runInNewContext(command, {
        Configuration: {
          getMap: () => ({
            script: MAP_SCRIPT,
            mapSize: "370405108",
            mapSeed: 111,
            maxMajorPlayers: 0,
          }),
          getGame: () => ({ gameSeed: 112 }),
        },
        GameInfo: {
          Maps: {
            lookup: (id: string | number) => {
              lookupCalls.push(id);
              return id === "370405108" ? { MapSizeType: "MAPSIZE_STANDARD" } : undefined;
            },
          },
        },
        GameSetup: {
          currentRevision: 19,
          findGameParameter: () => undefined,
          findPlayerParameter: () => undefined,
        },
        GameplayMap: {
          getMapSize: () => {
            throw new Error("App UI must not read the active runtime map size");
          },
        },
        UI: {
          getGameLoadingState: () => 0,
          isInGame: () => false,
          isInLoading: () => false,
          isInShell: () => true,
        },
      }) as string
    ) as { snapshot: Civ7SetupSnapshot };

    expect(result.snapshot.config.mapSize).toEqual({ ok: true, value: "370405108" });
    expect(result.snapshot.config.mapSizeType).toEqual({
      ok: true,
      value: "MAPSIZE_STANDARD",
    });
    expect(lookupCalls).toEqual([370405108, "370405108"]);
  });

  test("prefers the shell-owned Configuration map-size type without requiring GameInfo", () => {
    const command = buildSetupSnapshotCommand(defaultSetupReadDependencies);
    const result = JSON.parse(
      runInNewContext(command, {
        Configuration: {
          getMap: () => ({
            script: MAP_SCRIPT,
            mapSize: -1837222328,
            mapSizeTypeName: "MAPSIZE_SMALL",
            mapSeed: 111,
            maxMajorPlayers: 6,
          }),
          getGame: () => ({ gameSeed: 112 }),
        },
        GameSetup: {
          currentRevision: 19,
          findGameParameter: () => undefined,
          findPlayerParameter: () => undefined,
        },
        GameplayMap: {
          getMapSize: () => {
            throw new Error("App UI must not read the active runtime map size");
          },
        },
        UI: {
          getGameLoadingState: () => 0,
          isInGame: () => false,
          isInLoading: () => false,
          isInShell: () => true,
        },
      }) as string
    ) as { snapshot: Civ7SetupSnapshot };

    expect(result.snapshot.config.mapSizeType).toEqual({
      ok: true,
      value: "MAPSIZE_SMALL",
    });
  });

  test("applies and verifies custom setup selections in the shell without GameInfo", () => {
    const mapConfig = {
      script: MAP_SCRIPT,
      mapSize: "MAPSIZE_SMALL",
      mapSizeTypeName: "MAPSIZE_SMALL",
      mapSeed: 111,
      maxMajorPlayers: 0,
    };
    const gameConfig = { gameSeed: 112 };
    const gameParameters = new Map<string, { value: unknown; domain?: unknown }>([
      [
        "Map",
        {
          value: MAP_SCRIPT,
          domain: { possibleValues: [{ Domain: "StandardMaps", File: MAP_SCRIPT }] },
        },
      ],
      ["MapSize", { value: "MAPSIZE_SMALL" }],
      ["MapRandomSeed", { value: 111 }],
      ["GameRandomSeed", { value: 112 }],
      ["Difficulty", { value: "DIFFICULTY_SOVEREIGN" }],
    ]);
    const playerParameters = new Map<string, { value: unknown }>([
      ["3:PlayerDifficulty", { value: "DIFFICULTY_SOVEREIGN" }],
    ]);
    const globals = {
      Configuration: {
        getMap: () => mapConfig,
        getGame: () => gameConfig,
        getPlayer: (playerId: number) =>
          playerId === 0 || playerId === 3 || playerId === 5 ? { playerId, slotStatus: 2 } : null,
        editMap: () => ({
          setScript: (value: string) => {
            mapConfig.script = value;
          },
          setMapSize: (value: string) => {
            mapConfig.mapSize = value;
            mapConfig.mapSizeTypeName = value;
          },
          setMapSeed: (value: number) => {
            mapConfig.mapSeed = value;
          },
        }),
        editGame: () => ({
          setGameSeed: (value: number) => {
            gameConfig.gameSeed = value;
          },
        }),
      },
      GameContext: { localPlayerID: 0 },
      SlotStatus: { SS_OPEN: 0, SS_CLOSED: 1, SS_TAKEN: 2 },
      GameSetup: {
        currentRevision: 19,
        findGameParameter: (id: string) => gameParameters.get(id),
        findPlayerParameter: (playerId: number, id: string) =>
          playerParameters.get(`${playerId}:${id}`),
        setGameParameterValue: (id: string, value: unknown) => {
          const parameter = gameParameters.get(id);
          if (parameter) parameter.value = value;
        },
        setPlayerParameterValue: (playerId: number, id: string, value: unknown) => {
          const parameter = playerParameters.get(`${playerId}:${id}`);
          if (parameter) parameter.value = value;
        },
      },
      Network: { hostGame: () => true },
      ServerType: { SERVER_TYPE_NONE: 0 },
      UI: {
        getGameLoadingState: () => 0,
        isInGame: () => false,
        isInLoading: () => false,
        isInShell: () => true,
      },
    };
    const expected = normalizeSinglePlayerSetupInput(
      {
        mapScript: MAP_SCRIPT,
        mapSize: "MAPSIZE_SMALL",
        mapSeed: 111,
        gameSeed: 112,
        gameOptions: { Difficulty: "DIFFICULTY_DEITY" },
        mapOptions: {},
        playerOptions: [
          { playerId: 3, options: { PlayerDifficulty: "DIFFICULTY_DEITY" } },
          { playerId: 5, options: {} },
        ],
      },
      {
        boundedInteger: defaultSetupReadDependencies.boundedInteger,
      }
    );

    const identityCommand = buildApplySinglePlayerSetupIdentityCommand(
      expected,
      defaultSetupReadDependencies
    );
    const optionsCommand = buildApplySinglePlayerSetupOptionsCommand(
      expected,
      defaultSetupReadDependencies
    );
    const hostCommand = buildStartPreparedSinglePlayerCommand(
      expected,
      defaultSetupReadDependencies
    );
    const identityApplied = JSON.parse(runInNewContext(identityCommand, globals) as string) as {
      status: string;
    };
    const optionsApplied = JSON.parse(runInNewContext(optionsCommand, globals) as string) as {
      status: string;
    };
    const hosted = JSON.parse(runInNewContext(hostCommand, globals) as string) as {
      status: string;
      before: Civ7SetupSnapshot;
      accepted: boolean;
    };

    expect(identityApplied).toMatchObject({ status: "performed" });
    expect(optionsApplied).toMatchObject({ status: "performed" });
    expect(hosted).toMatchObject({
      status: "performed",
      accepted: true,
      before: {
        setup: {
          parameters: expect.arrayContaining([
            expect.objectContaining({ id: "Difficulty", exists: true, value: "DIFFICULTY_DEITY" }),
          ]),
          playerParameters: expect.arrayContaining([
            expect.objectContaining({
              playerId: 3,
              parameters: expect.arrayContaining([
                expect.objectContaining({
                  id: "PlayerDifficulty",
                  exists: true,
                  value: "DIFFICULTY_DEITY",
                }),
              ]),
            }),
            expect.objectContaining({ playerId: 5 }),
          ]),
        },
      },
    });
    const missingPlayer = {
      ...expected,
      playerOptions: [{ playerId: 6, options: {} }],
    };
    const refusedOptions = JSON.parse(
      runInNewContext(
        buildApplySinglePlayerSetupOptionsCommand(missingPlayer, defaultSetupReadDependencies),
        globals
      ) as string
    ) as { status: string; reason: string; detail: string };
    const refusedHost = JSON.parse(
      runInNewContext(
        buildStartPreparedSinglePlayerCommand(missingPlayer, defaultSetupReadDependencies),
        globals
      ) as string
    ) as { status: string; mismatch: string };

    expect(refusedOptions).toMatchObject({
      status: "refused",
      reason: "parameter",
      detail: "player:6:inactive",
    });
    expect(refusedHost).toMatchObject({ status: "refused", mismatch: "player-identity:6" });
  });

  test("preflights every requested option mutator before the first option mutation", () => {
    const mutations: string[] = [];
    const mapParameter = {
      value: MAP_SCRIPT,
      domain: { possibleValues: [{ Domain: "StandardMaps", File: MAP_SCRIPT }] },
    };
    const command = buildApplySinglePlayerSetupOptionsCommand(
      {
        mapScript: MAP_SCRIPT,
        mapSize: "MAPSIZE_SMALL",
        mapSeed: 111,
        gameSeed: 112,
        gameOptions: {},
        mapOptions: {},
        playerOptions: [{ playerId: 3, options: { PlayerDifficulty: "DIFFICULTY_DEITY" } }],
      },
      defaultSetupReadDependencies
    );

    const globals = {
      Configuration: {
        getMap: () => ({
          script: MAP_SCRIPT,
          mapSize: "MAPSIZE_SMALL",
          mapSizeTypeName: "MAPSIZE_SMALL",
          mapSeed: 111,
          maxMajorPlayers: 0,
        }),
        getGame: () => ({ gameSeed: 112 }),
        getPlayer: (playerId: number) => (playerId === 3 ? { playerId, slotStatus: 2 } : null),
        editMap: () => ({
          setScript: () => mutations.push("setScript"),
          setMapSize: () => mutations.push("setMapSize"),
          setMapSeed: () => mutations.push("setMapSeed"),
        }),
        editGame: () => ({
          setGameSeed: () => mutations.push("setGameSeed"),
        }),
      },
      GameContext: { localPlayerID: 0 },
      SlotStatus: { SS_OPEN: 0, SS_CLOSED: 1, SS_TAKEN: 2 },
      GameInfo: { Maps: { lookup: () => ({ MapSizeType: "MAPSIZE_SMALL" }) } },
      GameSetup: {
        currentRevision: 19,
        findGameParameter: (id: string) =>
          id === "Map"
            ? mapParameter
            : id === "MapSize"
              ? { value: "MAPSIZE_SMALL" }
              : id === "MapRandomSeed"
                ? { value: 111 }
                : id === "GameRandomSeed"
                  ? { value: 112 }
                  : undefined,
        findPlayerParameter: () => ({ value: "DIFFICULTY_SOVEREIGN" }),
        setGameParameterValue: () => mutations.push("setGameParameterValue"),
      },
      UI: {
        getGameLoadingState: () => 0,
        isInGame: () => false,
        isInLoading: () => false,
        isInShell: () => true,
      },
    };
    const result = JSON.parse(runInNewContext(command, globals) as string) as {
      status: string;
      reason: string;
      detail: string;
    };
    expect(result).toMatchObject({
      status: "refused",
      reason: "parameter",
      detail: "player-setter:unavailable",
    });
    expect(mutations).toEqual([]);

    const invalidOptionCommand = buildApplySinglePlayerSetupOptionsCommand(
      {
        mapScript: MAP_SCRIPT,
        mapSize: "MAPSIZE_SMALL",
        mapSeed: 111,
        gameSeed: 112,
        gameOptions: { Difficulty: "DIFFICULTY_DEITY" },
        mapOptions: {},
        playerOptions: [],
      },
      defaultSetupReadDependencies
    );
    const invalidOptionResult = JSON.parse(
      runInNewContext(invalidOptionCommand, {
        ...globals,
        GameSetup: {
          ...globals.GameSetup,
          findGameParameter: (id: string) =>
            id === "Difficulty"
              ? { value: "DIFFICULTY_SOVEREIGN", hidden: true }
              : globals.GameSetup.findGameParameter(id),
        },
      }) as string
    ) as { status: string; reason: string; detail: string };
    expect(invalidOptionResult).toMatchObject({
      status: "refused",
      reason: "parameter",
      detail: "Difficulty:hidden",
    });
    expect(mutations).toEqual([]);

    const hiddenCandidateResult = JSON.parse(
      runInNewContext(invalidOptionCommand, {
        ...globals,
        GameSetup: {
          ...globals.GameSetup,
          findGameParameter: (id: string) =>
            id === "Difficulty"
              ? {
                  value: "DIFFICULTY_SOVEREIGN",
                  domain: {
                    possibleValues: [{ value: "DIFFICULTY_DEITY", hidden: true }],
                  },
                }
              : globals.GameSetup.findGameParameter(id),
        },
      }) as string
    ) as { status: string; reason: string; detail: string };
    expect(hiddenCandidateResult).toMatchObject({
      status: "refused",
      reason: "parameter",
      detail: "Difficulty:value-not-admitted",
    });
    expect(mutations).toEqual([]);
  });

  test("admits authored options against target-map metadata after identity readback", () => {
    const mutations: string[] = [];
    const observedDifficultyContexts: string[] = [];
    const mapConfig = {
      script: PREVIOUS_MAP_SCRIPT,
      mapSize: "MAPSIZE_STANDARD",
      mapSizeTypeName: "MAPSIZE_STANDARD",
      mapSeed: 7,
      maxMajorPlayers: 0,
    };
    const gameConfig = { gameSeed: 8 };
    const parameterValues = new Map<string, unknown>([
      ["Map", PREVIOUS_MAP_SCRIPT],
      ["MapSize", "MAPSIZE_STANDARD"],
      ["MapRandomSeed", 7],
      ["GameRandomSeed", 8],
      ["Difficulty", "DIFFICULTY_SOVEREIGN"],
    ]);
    const input = setupValues({
      gameOptions: { Difficulty: "DIFFICULTY_DEITY" },
    });
    const mapDomain = {
      possibleValues: [
        { Domain: "StandardMaps", File: PREVIOUS_MAP_SCRIPT },
        { Domain: "StandardMaps", File: MAP_SCRIPT },
      ],
    };
    const globals = {
      Configuration: {
        getMap: () => mapConfig,
        getGame: () => gameConfig,
        getPlayer: () => null,
        editMap: () => ({
          setScript: (value: string) => {
            mutations.push("identity:setScript");
            mapConfig.script = value;
          },
          setMapSize: (value: string) => {
            mutations.push("identity:setMapSize");
            mapConfig.mapSize = value;
            mapConfig.mapSizeTypeName = value;
          },
          setMapSeed: (value: number) => {
            mutations.push("identity:setMapSeed");
            mapConfig.mapSeed = value;
          },
        }),
        editGame: () => ({
          setGameSeed: (value: number) => {
            mutations.push("identity:setGameSeed");
            gameConfig.gameSeed = value;
          },
        }),
      },
      GameContext: { localPlayerID: 0 },
      SlotStatus: { SS_OPEN: 0, SS_CLOSED: 1, SS_TAKEN: 2 },
      GameSetup: {
        currentRevision: 19,
        findGameParameter: (id: string) => {
          if (id === "Difficulty") {
            observedDifficultyContexts.push(mapConfig.script);
            return {
              value: parameterValues.get(id),
              hidden: mapConfig.script === MAP_SCRIPT,
              domain: { possibleValues: [{ value: "DIFFICULTY_DEITY" }] },
            };
          }
          const value = parameterValues.get(id);
          return value === undefined
            ? undefined
            : { value, ...(id === "Map" ? { domain: mapDomain } : {}) };
        },
        findPlayerParameter: () => undefined,
        setGameParameterValue: (id: string, value: unknown) => {
          mutations.push(id === "Difficulty" ? "option:Difficulty" : `identity:${id}`);
          parameterValues.set(id, value);
        },
      },
      UI: {
        getGameLoadingState: () => 0,
        isInGame: () => false,
        isInLoading: () => false,
        isInShell: () => true,
      },
    };

    const identity = JSON.parse(
      runInNewContext(
        buildApplySinglePlayerSetupIdentityCommand(input, defaultSetupReadDependencies),
        globals
      ) as string
    ) as { status: string };
    const options = JSON.parse(
      runInNewContext(
        buildApplySinglePlayerSetupOptionsCommand(input, defaultSetupReadDependencies),
        globals
      ) as string
    ) as { status: string; reason?: string; detail?: string };

    expect(identity).toMatchObject({ status: "performed" });
    expect(options).toMatchObject({
      status: "refused",
      reason: "parameter",
      detail: "Difficulty:hidden",
    });
    expect(observedDifficultyContexts).toContain(PREVIOUS_MAP_SCRIPT);
    expect(observedDifficultyContexts).toContain(MAP_SCRIPT);
    expect(mutations).not.toContain("option:Difficulty");
  });

  test("target mod reconciliation appends to editable saved-config metadata without dropping existing mods", () => {
    const result = evaluateReconcileTargetModCommand({
      Modding: {
        getInstalledMods: () => [
          {
            Id: "mod-swooper-studio-run",
            Enabled: true,
            Version: "1",
            Name: "Studio Run",
            handle: 42,
          },
        ],
        getModHandle: () => 42,
      },
      Configuration: createReconcileConfiguration({
        editMeta: {
          mods: [
            { modid: "tot-basic-mod-a", version: "1", title: "Basic Mod A" },
            { modid: "tot-basic-mod-b", version: "7", title: "Basic Mod B" },
          ],
        },
      }),
    });

    expect(result).toMatchObject({
      targetActive: true,
      enabledModsMetaSource: "Configuration.editGame",
      enabledModsMetaUpdated: true,
      enabledModCount: 3,
      enabledModsMetaModCount: 3,
      enabledModsMetaContainsTarget: true,
    });
    expect("enabledModsMeta" in result).toBe(false);
  });

  test("target mod reconciliation falls back to installed mod handles", () => {
    const result = evaluateReconcileTargetModCommand({
      Modding: {
        getInstalledMods: () => [
          {
            Id: "mod-swooper-studio-run",
            Enabled: false,
            Version: "1",
            Name: "Studio Run",
            handle: 42,
          },
        ],
        getModHandle: () => -1,
        canEnableMods: (handles: number[]) => ({ status: handles[0] === 42 ? 0 : 1 }),
        enableMods: (handles: number[]) => ({ status: handles[0] === 42 ? 0 : 1 }),
      },
      Configuration: createReconcileConfiguration({
        editMeta: {
          mods: [{ modid: "tot-basic-mod-a", version: "1", title: "Basic Mod A" }],
        },
      }),
    });

    expect(result).toMatchObject({
      targetActive: true,
      canEnableResult: { status: 0 },
      enableResult: { status: 0 },
      enabledModsMetaUpdated: true,
      enabledModCount: 2,
      enabledModsMetaModCount: 2,
      enabledModsMetaContainsTarget: true,
    });
  });

  test("prepared setup readback rejects player count drift before Begin", () => {
    expect(() =>
      assertPreparedSetupMatches(
        setupValues({
          mapScript: MAP_SCRIPT,
          mapSize: "MAPSIZE_HUGE",
          mapSeed: 1538316511,
          gameSeed: 1538316511,
          playerCount: 10,
        }),
        preparedSetupSnapshot({
          setupMapScript: MAP_SCRIPT,
          setupMapSize: "MAPSIZE_HUGE",
          setupMapSeed: 1538316511,
          setupGameSeed: 1538316511,
          playerCount: 8,
        })
      )
    ).toThrow("Civ7 setup player count readback mismatch: 8");
  });

  test.each([
    ["MapRandomSeed", null, 0, "setup-map-seed"],
    ["MapRandomSeed", true, 1, "setup-map-seed"],
    ["MapRandomSeed", "111", 111, "setup-map-seed"],
    ["GameRandomSeed", null, 0, "setup-game-seed"],
    ["GameRandomSeed", true, 1, "setup-game-seed"],
    ["GameRandomSeed", "112", 112, "setup-game-seed"],
  ] as const)("rejects coerced %s readback %j in host and embedded expectation owners", (parameterId, malformedValue, numericMatch, mismatch) => {
    const input = setupValues({
      mapScript: MAP_SCRIPT,
      mapSize: "MAPSIZE_HUGE",
      mapSeed: parameterId === "MapRandomSeed" ? numericMatch : 111,
      gameSeed: parameterId === "GameRandomSeed" ? numericMatch : 112,
    });
    const base = preparedSetupSnapshot({
      setupMapScript: MAP_SCRIPT,
      setupMapSize: "MAPSIZE_HUGE",
      setupMapSeed: input.mapSeed,
      setupGameSeed: input.gameSeed,
      playerCount: 10,
    });
    const snapshot: Civ7SetupSnapshot = {
      ...base,
      setup: {
        ...base.setup,
        parameters: base.setup.parameters.map((parameter) =>
          parameter.id === parameterId ? { ...parameter, value: malformedValue } : parameter
        ),
      },
    };

    expect(() => assertPreparedSetupMatches(input, snapshot)).toThrow(
      `Civ7 setup ${parameterId} readback mismatch`
    );
    const embeddedMismatch = runInNewContext(`(() => {
        ${setupExpectationScriptSource()}
        return setupExpectationMismatch(${JSON.stringify(input)}, ${JSON.stringify(snapshot)});
      })()`);
    expect(embeddedMismatch).toBe(mismatch);
  });

  test("prepared setup readback requires runtime identity for an explicit empty player", () => {
    expect(() =>
      assertPreparedSetupMatches(
        setupValues({
          mapScript: MAP_SCRIPT,
          mapSize: "MAPSIZE_HUGE",
          mapSeed: 1538316511,
          gameSeed: 1538316511,
          playerOptions: [{ playerId: 5, options: {} }],
        }),
        preparedSetupSnapshot({
          setupMapScript: MAP_SCRIPT,
          setupMapSize: "MAPSIZE_HUGE",
          setupMapSeed: 1538316511,
          setupGameSeed: 1538316511,
          playerCount: 10,
        })
      )
    ).toThrow("Civ7 player 5 identity was not observed");
  });

  test("prepared setup readback rejects runtime map config drift before Begin", () => {
    const snapshot = preparedSetupSnapshot({
      setupMapScript: MAP_SCRIPT,
      setupMapSize: "MAPSIZE_HUGE",
      setupMapSeed: 1538316511,
      setupGameSeed: 1538316511,
      playerCount: 10,
    });

    expect(() =>
      assertPreparedSetupMatches(
        setupValues({
          mapScript: MAP_SCRIPT,
          mapSize: "MAPSIZE_HUGE",
          mapSeed: 1538316511,
          gameSeed: 1538316511,
          playerCount: 10,
        }),
        {
          ...snapshot,
          config: {
            ...snapshot.config,
            mapScript: { ok: true, value: "{swooper-maps}/maps/stale.js" },
          },
        }
      )
    ).toThrow("Civ7 runtime mapScript readback mismatch");
  });

  test("prepared setup readback accepts Civ7 internal numeric map size when setup parameter matches", () => {
    expect(() =>
      assertPreparedSetupMatches(
        setupValues({
          mapScript: MAP_SCRIPT,
          mapSize: "MAPSIZE_HUGE",
          mapSeed: 1538316511,
          gameSeed: 1538316511,
          playerCount: 10,
        }),
        preparedSetupSnapshot({
          setupMapScript: MAP_SCRIPT,
          setupMapSize: "MAPSIZE_HUGE",
          setupMapSeed: 1538316511,
          setupGameSeed: 1538316511,
          playerCount: 10,
          runtimeMapSize: 370405108,
        })
      )
    ).not.toThrow();
  });

  test("prepared setup readback requires exact map-row file identity", () => {
    const snapshot = preparedSetupSnapshot({
      setupMapScript: MAP_SCRIPT,
      setupMapSize: "MAPSIZE_HUGE",
      setupMapSeed: 1538316511,
      setupGameSeed: 1538316511,
      playerCount: 10,
    });

    expect(() =>
      assertPreparedSetupMatches(
        setupValues({
          mapScript: MAP_SCRIPT,
          mapSize: "MAPSIZE_HUGE",
          mapSeed: 1538316511,
          gameSeed: 1538316511,
          playerCount: 10,
        }),
        {
          ...snapshot,
          mapRows: [
            {
              source: "setup-domain",
              file: "{another-mod}/maps/not-studio-current.js",
              value: MAP_SCRIPT,
            },
          ],
        }
      )
    ).toThrow("Civ7 setup map row did not read back");
  });

  test("target mod reconciliation fails closed instead of overwriting missing enabled mod metadata", () => {
    expect(() =>
      evaluateReconcileTargetModCommand({
        Modding: {
          getInstalledMods: () => [{ Id: "mod-swooper-studio-run", Enabled: true, handle: 42 }],
          getModHandle: () => 42,
        },
        Configuration: createReconcileConfiguration({ editMeta: undefined, gameMeta: undefined }),
      })
    ).toThrow("Current enabled mod metadata unavailable");
  });

  test("preflights target-mod refresh before enabling the target", () => {
    let enableCalls = 0;

    expect(() =>
      evaluateReconcileTargetModCommand({
        Modding: {
          getInstalledMods: () => [{ Id: "mod-swooper-studio-run", Enabled: false, handle: 42 }],
          getModHandle: () => 42,
          enableMods: () => {
            enableCalls += 1;
            return { status: 0 };
          },
        },
        Configuration: {
          getMap: () => ({}),
          getGame: () => ({
            enableModsMetaString: '{"mods":[]}',
            enabledModCount: 0,
            getEnabledModId: () => undefined,
          }),
          editGame: () => ({ enableModsMetaString: '{"mods":[]}' }),
        },
      })
    ).toThrow("Configuration.editGame().refreshEnabledMods unavailable");
    expect(enableCalls).toBe(0);
  });

  test("preflights target-mod active identity readback before enabling the target", () => {
    let enableCalls = 0;

    expect(() =>
      evaluateReconcileTargetModCommand({
        Modding: {
          getInstalledMods: () => [{ Id: "mod-swooper-studio-run", Enabled: false, handle: 42 }],
          getModHandle: () => 42,
          enableMods: () => {
            enableCalls += 1;
            return { status: 0 };
          },
        },
        Configuration: {
          getMap: () => ({}),
          getGame: () => ({ enableModsMetaString: '{"mods":[]}', enabledModCount: 0 }),
          editGame: () => ({
            enableModsMetaString: '{"mods":[]}',
            refreshEnabledMods: () => undefined,
          }),
        },
      })
    ).toThrow("Configuration.getGame().getEnabledModId unavailable");
    expect(enableCalls).toBe(0);
  });

  test("required target reconciliation uses the narrow editable setup metadata path", async () => {
    const server = await startSetupLifecycleServer();
    try {
      const { port } = server.address();
      const reconciliation = await reconcileCiv7RequiredTargetMod("mod-swooper-studio-run", {
        host: HOST,
        port,
        timeoutMs: 1_000,
      });

      expect(reconciliation).toMatchObject({
        refreshed: true,
        verified: true,
        result: {
          enabledModsMetaContainsTarget: true,
          targetActive: true,
        },
      });
      expect(server.operationsFor("target-mod-reconcile")).toHaveLength(1);
    } finally {
      await server.close();
    }
  });

  test("binds a saved-config request to its same-command shell revision", async () => {
    const server = await startSetupLifecycleServer();
    try {
      const { port } = server.address();
      const request = await requestCiv7SavedGameConfigurationLoad(
        {
          id: "tot-basic-mods",
          displayName: "Test of Time Basic Mods",
          fileName: "ToT_BasicModsEnabled.Civ7Cfg",
          path: "/tmp/ToT_BasicModsEnabled.Civ7Cfg",
        },
        { host: HOST, port, timeoutMs: 1_000 }
      );

      expect(request.before.snapshot).toMatchObject({
        phase: "shell",
        setup: { revision: { ok: true, value: 19 } },
      });
      expect(request.accepted).toBe(true);
      expect(server.operationsFor("load-saved-config")).toHaveLength(1);
    } finally {
      await server.close();
    }
  });

  test("same-command guards refuse drift before load, apply, target-mod refresh, or host", async () => {
    const runningServer = await startSetupLifecycleServer({ initialPhase: "running-game" });
    try {
      const { port } = runningServer.address();
      const options = { host: HOST, port, timeoutMs: 1_000 };
      const savedConfig = {
        id: "tot-basic-mods",
        displayName: "Test of Time Basic Mods",
        fileName: "ToT_BasicModsEnabled.Civ7Cfg",
        path: "/tmp/ToT_BasicModsEnabled.Civ7Cfg",
      };

      await expect(
        requestCiv7SavedGameConfigurationLoad(savedConfig, options)
      ).rejects.toMatchObject({ code: "setup-phase-refused" });
      await expect(
        applyCiv7SinglePlayerSetupIdentity(setupValues(), options)
      ).rejects.toMatchObject({ code: "setup-phase-refused" });
      await expect(
        reconcileCiv7RequiredTargetMod("mod-swooper-studio-run", options)
      ).rejects.toMatchObject({ code: "setup-phase-refused" });

      expect(runningServer.operationsFor("load-saved-config")).toHaveLength(0);
      expect(runningServer.operationsFor("prepare-setup")).toHaveLength(0);
      expect(runningServer.operationsFor("target-mod-reconcile")).toHaveLength(0);
    } finally {
      await runningServer.close();
    }

    const shellServer = await startSetupLifecycleServer();
    try {
      const { port } = shellServer.address();
      const options = { host: HOST, port, timeoutMs: 1_000 };
      await expect(
        applyCiv7SinglePlayerSetupIdentity(setupValues({ mapScript: HIDDEN_MAP_SCRIPT }), options)
      ).rejects.toMatchObject({ code: "setup-map-row-missing" });
      await expect(
        hostPreparedCiv7SinglePlayerGame(
          setupValues({ mapSize: "MAPSIZE_SMALL", mapSeed: 222 }),
          options
        )
      ).rejects.toMatchObject({ code: "setup-readback-mismatch" });

      expect(shellServer.operationsFor("prepare-setup")).toHaveLength(0);
      expect(shellServer.operationsFor("host-game")).toHaveLength(0);
    } finally {
      await shellServer.close();
    }
  });

  test("fails closed on unknown mutation payload statuses", async () => {
    const savedConfig = {
      id: "tot-basic-mods",
      displayName: "Test of Time Basic Mods",
      fileName: "ToT_BasicModsEnabled.Civ7Cfg",
      path: "/tmp/ToT_BasicModsEnabled.Civ7Cfg",
    };
    const cases: ReadonlyArray<
      Readonly<{
        operation: SetupMutationOperation;
        invoke: (port: number) => Promise<unknown>;
      }>
    > = [
      {
        operation: "load-saved-config",
        invoke: (port) =>
          requestCiv7SavedGameConfigurationLoad(savedConfig, {
            host: HOST,
            port,
            timeoutMs: 1_000,
          }),
      },
      {
        operation: "prepare-setup",
        invoke: (port) =>
          applyCiv7SinglePlayerSetupIdentity(setupValues(), { host: HOST, port, timeoutMs: 1_000 }),
      },
      {
        operation: "target-mod-reconcile",
        invoke: (port) =>
          reconcileCiv7RequiredTargetMod("mod-swooper-studio-run", {
            host: HOST,
            port,
            timeoutMs: 1_000,
          }),
      },
      {
        operation: "host-game",
        invoke: (port) =>
          hostPreparedCiv7SinglePlayerGame(setupValues(), { host: HOST, port, timeoutMs: 1_000 }),
      },
      {
        operation: "begin-game",
        invoke: (port) => beginCiv7Game({ host: HOST, port, timeoutMs: 1_000 }),
      },
    ];

    for (const { operation, invoke } of cases) {
      const server = await startSetupLifecycleServer({ malformedStatusFor: operation });
      try {
        await expect(invoke(server.address().port)).rejects.toMatchObject({
          code: "command-failed",
        });
      } finally {
        await server.close();
      }
    }
  });

  test("keeps setup admission and shell reload as independent one-wire atoms", async () => {
    const rowServer = await startSetupLifecycleServer({
      initialPhase: "running-game",
      hiddenMapScript: HIDDEN_MAP_SCRIPT,
      revealHiddenMapRowOnShellExit: true,
    });
    const session = new Civ7DirectControlSession({
      host: HOST,
      port: rowServer.address().port,
      timeoutMs: 1_000,
    });
    try {
      const { port } = rowServer.address();
      const options = { host: HOST, port, session, timeoutMs: 1_000 };

      const admission = await admitCiv7SetupShell("exit-active-game", options);
      expect(admission).toMatchObject({
        transition: "exit-sent",
        initial: { snapshot: { phase: "running-game" } },
      });
      const reload = await reloadCiv7SetupUiInShell(options);
      expect(reload).toMatchObject({ reloaded: true, snapshot: { phase: "shell" } });
      await expect(
        getCiv7SetupMapRows({ file: HIDDEN_MAP_SCRIPT }, options)
      ).resolves.toMatchObject({
        rows: [
          { source: "setup-domain", file: HIDDEN_MAP_SCRIPT },
          { source: "config-db", file: HIDDEN_MAP_SCRIPT },
        ],
      });
      expect(rowServer.operationsFor("exit-to-main-menu")).toEqual([
        { stateId: "65535", operation: "exit-to-main-menu" },
      ]);
      expect(rowServer.operationsFor("reload-ui")).toEqual([
        { stateId: "65535", operation: "reload-ui" },
      ]);
      expect(rowServer.connections()).toBe(2);
    } finally {
      await session.close();
      await rowServer.close();
    }
  });

  test("keeps an already-shell admission on the current physical connection", async () => {
    const server = await startSetupLifecycleServer();
    const session = new Civ7DirectControlSession({
      host: HOST,
      port: server.address().port,
      timeoutMs: 1_000,
    });
    try {
      const options = { host: HOST, port: server.address().port, session, timeoutMs: 1_000 };

      await expect(admitCiv7SetupShell("exit-active-game", options)).resolves.toMatchObject({
        transition: "shell",
      });
      await reloadCiv7SetupUiInShell(options);

      expect(server.connections()).toBe(1);
      expect(server.operationsFor("exit-to-main-menu")).toHaveLength(0);
    } finally {
      await session.close();
      await server.close();
    }
  });

  test.each([
    "loading",
    "begin-ready",
    "unavailable",
  ] as const)("refuses every exit-to-shell path from the %s phase", async (initialPhase) => {
    const server = await startSetupLifecycleServer({
      initialPhase,
      hiddenMapScript: HIDDEN_MAP_SCRIPT,
    });
    try {
      const { port } = server.address();
      const options = { host: HOST, port, timeoutMs: 1_000 };
      await expect(admitCiv7SetupShell("exit-active-game", options)).rejects.toMatchObject({
        code: "setup-phase-refused",
      });

      expect(server.operationsFor("exit-to-main-menu")).toHaveLength(0);
      expect(server.operationsFor("prepare-setup")).toHaveLength(0);
      expect(server.operationsFor("reload-ui")).toHaveLength(0);
    } finally {
      await server.close();
    }
  });

  test("refuses shell-only row reload without exiting a running game", async () => {
    const server = await startSetupLifecycleServer({
      initialPhase: "running-game",
      hiddenMapScript: HIDDEN_MAP_SCRIPT,
    });
    try {
      const { port } = server.address();
      const reload = await reloadCiv7SetupUiInShell({ host: HOST, port, timeoutMs: 1_000 });
      expect(reload).toMatchObject({ reloaded: false, snapshot: { phase: "running-game" } });

      expect(server.operationsFor("exit-to-main-menu")).toHaveLength(0);
      expect(server.operationsFor("reload-ui")).toHaveLength(0);
    } finally {
      await server.close();
    }
  });
});

type SetupLifecycleOperation =
  | "begin-game"
  | "exit-to-main-menu"
  | "host-game"
  | "load-saved-config"
  | "map-summary"
  | "prepare-setup"
  | "setup-options"
  | "reload-ui"
  | "reload-ui-in-shell"
  | "setup-shell-admission"
  | "setup-map-rows"
  | "setup-snapshot"
  | "target-mod-reconcile"
  | "tuner-health";

type SetupMutationOperation = Extract<
  SetupLifecycleOperation,
  | "begin-game"
  | "host-game"
  | "load-saved-config"
  | "prepare-setup"
  | "setup-options"
  | "target-mod-reconcile"
>;

type ObservedOperation = Readonly<{
  stateId: string;
  operation: SetupLifecycleOperation;
}>;

type SetupLifecycleServer = Readonly<{
  address: () => AddressInfo;
  close: () => Promise<void>;
  connections: () => number;
  operations: () => ReadonlyArray<ObservedOperation>;
  operationsFor: (operation: SetupLifecycleOperation) => ReadonlyArray<ObservedOperation>;
}>;

type SetupLifecycleServerOptions = Readonly<{
  closeOnBegin?: boolean;
  closeOnSetupMutation?: boolean;
  hiddenMapScript?: string;
  initialPhase?: "shell" | "running-game" | "loading" | "begin-ready" | "unavailable";
  malformedStatusFor?: SetupMutationOperation;
  malformedPostStartInGameProbe?: boolean;
  postStartSeedOverride?: number;
  revealHiddenMapRowOnShellExit?: boolean;
}>;

async function startSetupLifecycleServer(
  options: SetupLifecycleServerOptions = {}
): Promise<SetupLifecycleServer> {
  const observed: ObservedOperation[] = [];
  const sockets = new Set<Socket>();
  let connections = 0;
  const fixedRefusedPhase =
    options.initialPhase === "loading" || options.initialPhase === "unavailable"
      ? options.initialPhase
      : undefined;
  let inShell = options.initialPhase === undefined || options.initialPhase === "shell";
  let loadingState = options.initialPhase === "begin-ready" ? 6 : 8;
  let setupRevision = 19;
  let setupMapScript = MAP_SCRIPT;
  let setupMapSize = "MAPSIZE_STANDARD";
  let setupMapSeed = 111;
  let setupGameSeed = 112;
  let hiddenMapRowVisible = false;
  const visibleMapRows = (): Civ7SetupMapRow[] => [
    {
      source: "setup-domain",
      file: MAP_SCRIPT,
      value: MAP_SCRIPT,
      name: "LOC_MAP_SWOOPER_EARTHLIKE_NAME",
      sortIndex: 501,
    },
    {
      source: "config-db",
      domain: "StandardMaps",
      file: MAP_SCRIPT,
      value: MAP_SCRIPT,
      name: "LOC_MAP_SWOOPER_EARTHLIKE_NAME",
      description: "LOC_MAP_SWOOPER_EARTHLIKE_DESCRIPTION",
      sortIndex: 501,
    },
    ...(hiddenMapRowVisible && options.hiddenMapScript
      ? [
          {
            source: "setup-domain" as const,
            file: options.hiddenMapScript,
            value: options.hiddenMapScript,
            name: "LOC_MAP_STUDIO_CURRENT_NAME",
            sortIndex: 9999,
          },
          {
            source: "config-db" as const,
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
  const setupSnapshot = (): Civ7SetupSnapshot => ({
    phase:
      fixedRefusedPhase ??
      (inShell ? "shell" : loadingState === 8 ? "running-game" : "begin-ready"),
    ui: {
      inGame: { ok: true, value: fixedRefusedPhase ? false : !inShell },
      inShell: { ok: true, value: fixedRefusedPhase ? false : inShell },
      inLoading: {
        ok: true,
        value:
          fixedRefusedPhase === "loading"
            ? true
            : fixedRefusedPhase === "unavailable"
              ? false
              : loadingState !== 8 && !inShell,
      },
      loadingState: { ok: true, value: loadingState },
      loadingStateName: loadingState === 8 ? "GameStarted" : "WaitingForUIReady",
      canBeginGame: {
        ok: true,
        value: fixedRefusedPhase ? false : loadingState === 6 && !inShell,
      },
    },
    setup: {
      revision: { ok: true, value: setupRevision },
      parameters: [
        {
          id: "Map",
          exists: true,
          value: setupMapScript,
          possibleValues: visibleMapRows().map((row) => ({ value: row.file })),
        },
        {
          id: "MapSize",
          exists: true,
          value: setupMapSize,
          possibleValues: [{ value: "MAPSIZE_SMALL" }, { value: "MAPSIZE_STANDARD" }],
        },
        { id: "MapRandomSeed", exists: true, value: setupMapSeed, possibleValues: [] },
        { id: "GameRandomSeed", exists: true, value: setupGameSeed, possibleValues: [] },
      ],
      playerParameters: [
        {
          playerId: 0,
          exists: { ok: true, value: true },
          active: { ok: true, value: true },
          slotStatus: { ok: true, value: 2 },
          parameters: [
            {
              id: "PlayerLeader",
              exists: true,
              value: "LEADER_HARRIET_TUBMAN",
              possibleValues: [],
            },
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
      mapSizeType: { ok: true, value: setupMapSize },
      mapSeed: { ok: true, value: setupMapSeed },
      gameSeed: { ok: true, value: setupGameSeed },
      playerCount: { ok: true, value: 8 },
    },
  });
  const server = createServer((socket) => {
    connections += 1;
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const frame = parseRequest(buffer);
        if (!frame) return;
        buffer = buffer.subarray(frame.bytesRead);

        if (frame.message === "LSQ:") {
          socket.write(encodeResponse(frame.listenerId, ["65535", "App UI", "1", "Tuner"]));
          continue;
        }

        const command = parseCommand(frame.message);
        if (!command) {
          socket.write(encodeResponse(frame.listenerId, ["2"]));
          continue;
        }
        const operation = classifyCommand(command.script);
        if (
          operation &&
          operation !== "load-saved-config" &&
          operation !== "target-mod-reconcile" &&
          operation !== "prepare-setup" &&
          operation !== "host-game"
        ) {
          observed.push({ stateId: command.stateId, operation });
        }

        if (options.malformedStatusFor !== undefined && operation === options.malformedStatusFor) {
          const before = setupSnapshot();
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                status: "corrupt",
                before,
                after: before,
                accepted: true,
                applied: {},
                loadingState,
                result: {
                  enabledModsMetaContainsTarget: true,
                  targetActive: true,
                },
              }),
            ])
          );
          continue;
        }

        if (operation === "setup-shell-admission") {
          const initial = setupSnapshot();
          const policy = parseShellAdmissionPolicy(command.script);
          if (initial.phase === "shell") {
            socket.write(
              encodeResponse(frame.listenerId, [JSON.stringify({ initial, transition: "shell" })])
            );
          } else if (initial.phase === "running-game" && policy === "exit-active-game") {
            observed.push({ stateId: command.stateId, operation: "exit-to-main-menu" });
            inShell = true;
            loadingState = 8;
            if (options.revealHiddenMapRowOnShellExit) hiddenMapRowVisible = true;
            socket.write(
              encodeResponse(frame.listenerId, [
                JSON.stringify({ initial, transition: "exit-sent" }),
              ])
            );
          } else {
            socket.write(
              encodeResponse(frame.listenerId, [JSON.stringify({ initial, transition: "refused" })])
            );
          }
        } else if (operation === "reload-ui-in-shell") {
          const snapshot = setupSnapshot();
          const reloaded = snapshot.phase === "shell";
          if (reloaded) observed.push({ stateId: command.stateId, operation: "reload-ui" });
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify({ snapshot, reloaded })]));
        } else if (operation === "exit-to-main-menu") {
          inShell = true;
          loadingState = 8;
          if (options.revealHiddenMapRowOnShellExit) hiddenMapRowVisible = true;
          socket.write(encodeResponse(frame.listenerId, ["null"]));
        } else if (operation === "reload-ui") {
          socket.write(encodeResponse(frame.listenerId, ["null"]));
        } else if (operation === "load-saved-config") {
          const before = setupSnapshot();
          if (before.phase !== "shell") {
            socket.write(
              encodeResponse(frame.listenerId, [
                JSON.stringify({ status: "refused", before, reason: "phase" }),
              ])
            );
            continue;
          }
          observed.push({ stateId: command.stateId, operation: "load-saved-config" });
          setupRevision += 1;
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({ status: "performed", before, accepted: true }),
            ])
          );
        } else if (operation === "target-mod-reconcile") {
          const before = setupSnapshot();
          if (before.phase !== "shell") {
            socket.write(
              encodeResponse(frame.listenerId, [
                JSON.stringify({ status: "refused", before, reason: "phase" }),
              ])
            );
            continue;
          }
          observed.push({ stateId: command.stateId, operation: "target-mod-reconcile" });
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                status: "performed",
                before,
                result: {
                  targetModId: "mod-swooper-studio-run",
                  targetInstalled: true,
                  targetWasEnabled: true,
                  refreshed: true,
                  enabledModCount: 1,
                  enabledModsMetaSource: "Configuration.editGame",
                  enabledModsMetaUpdated: true,
                  enabledModsMetaModCount: 1,
                  enabledModsMetaContainsTarget: true,
                  targetActive: true,
                },
              }),
            ])
          );
        } else if (operation === "prepare-setup") {
          const input = parseSetupInput(command.script);
          const before = setupSnapshot();
          if (before.phase !== "shell") {
            socket.write(
              encodeResponse(frame.listenerId, [
                JSON.stringify({ status: "refused", before, reason: "phase" }),
              ])
            );
            continue;
          }
          if (!before.mapRows.some((row) => row.file === input.mapScript)) {
            socket.write(
              encodeResponse(frame.listenerId, [
                JSON.stringify({ status: "refused", before, reason: "map-row" }),
              ])
            );
            continue;
          }
          observed.push({ stateId: command.stateId, operation: "prepare-setup" });
          if (options.closeOnSetupMutation) {
            socket.destroy();
            continue;
          }
          setupMapScript = input.mapScript;
          setupMapSize = input.mapSize;
          setupMapSeed = input.mapSeed;
          setupGameSeed = input.gameSeed;
          setupRevision += 1;
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                status: "performed",
                before,
                applied: {
                  Map: setupMapScript,
                  MapSize: setupMapSize,
                  MapRandomSeed: setupMapSeed,
                  GameRandomSeed: setupGameSeed,
                },
              }),
            ])
          );
        } else if (operation === "setup-options") {
          const before = setupSnapshot();
          observed.push({ stateId: command.stateId, operation: "setup-options" });
          if (options.closeOnSetupMutation) {
            socket.destroy();
            continue;
          }
          setupRevision += 1;
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({ status: "performed", before, applied: {} }),
            ])
          );
        } else if (operation === "host-game") {
          const before = setupSnapshot();
          const expected = parseHostExpected(command.script);
          let mismatch: string | undefined;
          try {
            assertPreparedSetupMatches(expected, before);
          } catch (cause) {
            mismatch =
              cause && typeof cause === "object" && "code" in cause
                ? String(cause.code).replace(/^setup-/, "")
                : "readback-mismatch";
          }
          if (mismatch) {
            socket.write(
              encodeResponse(frame.listenerId, [
                JSON.stringify({ status: "refused", before, mismatch }),
              ])
            );
            continue;
          }
          observed.push({ stateId: command.stateId, operation: "host-game" });
          inShell = false;
          loadingState = 6;
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                status: "performed",
                before,
                accepted: true,
              }),
            ])
          );
        } else if (operation === "begin-game") {
          if (options.closeOnBegin) {
            socket.destroy();
            continue;
          }
          if (loadingState === 6 || loadingState === 7) {
            const before = loadingState;
            inShell = false;
            loadingState = 8;
            socket.write(
              encodeResponse(frame.listenerId, [
                JSON.stringify({ status: "performed", loadingState: before }),
              ])
            );
          } else {
            socket.write(
              encodeResponse(frame.listenerId, [
                JSON.stringify({ status: "refused", loadingState, reason: "loading-state" }),
              ])
            );
          }
        } else if (operation === "setup-map-rows") {
          const requestedFile = parseRequestedMapFile(command.script);
          const rows = visibleMapRows().filter(
            (row) => !requestedFile || row.file === requestedFile
          );
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                rows,
                limit: 100,
                ...(requestedFile ? { matchedFile: requestedFile } : {}),
              }),
            ])
          );
        } else if (operation === "setup-snapshot") {
          socket.write(
            encodeResponse(frame.listenerId, [JSON.stringify({ snapshot: setupSnapshot() })])
          );
        } else if (operation === "tuner-health") {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                evalOk: 2,
                ready: true,
                globals: {
                  Game: "object",
                  Autoplay: "object",
                  GameplayMap: "object",
                  Players: "object",
                  Network: "undefined",
                },
                turn: { ok: true, value: 1 },
                turnDate: { ok: true, value: "4000 BCE" },
                width: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 74 : 84 },
                height: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 46 : 54 },
                aliveIds: { ok: true, value: [0, 1] },
                aliveHumanIds: { ok: true, value: [0] },
                autoplayActive: { ok: true, value: false },
              }),
            ])
          );
        } else if (operation === "map-summary") {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                map: {
                  width: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 74 : 84 },
                  height: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 46 : 54 },
                  plotCount: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 3404 : 4536 },
                  mapSize: { ok: true, value: 0 },
                  mapSizeType: { ok: true, value: setupMapSize },
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
            ])
          );
        } else if (command.script.includes("Network.isInSession")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
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
                  turnDate: { ok: true, value: "4000 BCE" },
                  hash: { ok: true, value: 0 },
                },
                ui: {
                  inGame: options.malformedPostStartInGameProbe
                    ? { ok: "true", value: !inShell }
                    : { ok: true, value: !inShell },
                  inShell: { ok: true, value: inShell },
                  inLoading: { ok: true, value: loadingState !== 8 && !inShell },
                  loadingState: { ok: true, value: loadingState },
                  loadingStateName: loadingState === 8 ? "GameStarted" : "WaitingForUIReady",
                  canBeginGame: { ok: true, value: loadingState === 6 && !inShell },
                  canNotifyUIReady: "function",
                  skipStartButton: { ok: true, value: false },
                  automationActive: { ok: true, value: false },
                  activeInputContext: { ok: true, value: 4 },
                  activeInputContextName: "World",
                },
                gameContext: {
                  localPlayerID: inShell ? -1 : 0,
                  localObserverID: inShell ? -1 : 0,
                  hasRequestedPause: { ok: true, value: false },
                },
                players: {
                  maxPlayers: inShell ? 0 : 64,
                  aliveIds: { ok: true, value: inShell ? [] : [0] },
                  aliveHumanIds: { ok: true, value: inShell ? [] : [0] },
                  numAliveHumans: { ok: true, value: inShell ? 0 : 1 },
                },
                map: {
                  width: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 74 : 84 },
                  height: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 46 : 54 },
                  plotCount: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 3404 : 4536 },
                  mapSize: { ok: true, value: 0 },
                  randomSeed: { ok: true, value: options.postStartSeedOverride ?? setupMapSeed },
                },
              }),
            ])
          );
        } else {
          socket.write(encodeResponse(frame.listenerId, ["2"]));
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, HOST, resolve));
  return {
    address: () => server.address() as AddressInfo,
    connections: () => connections,
    operations: () => observed,
    operationsFor: (operation) => observed.filter((entry) => entry.operation === operation),
    close: async () => {
      for (const socket of sockets) socket.destroy();
      server.close();
      await once(server, "close");
    },
  };
}

function evaluateReconcileTargetModCommand(globals: Record<string, unknown>) {
  const command = buildReconcileTargetModCommand(
    { targetModId: "mod-swooper-studio-run" },
    defaultSetupReadDependencies
  );
  const payload = JSON.parse(
    runInNewContext(command, {
      UI: {
        isInGame: () => false,
        isInShell: () => true,
        isInLoading: () => false,
        getGameLoadingState: () => 0,
      },
      ...globals,
    }) as string
  ) as {
    status: "performed";
    result: {
      targetActive: boolean;
      enabledModCount: number;
      enabledModsMetaSource: string;
      enabledModsMetaUpdated: boolean;
      enabledModsMetaModCount: number;
      enabledModsMetaContainsTarget: boolean;
    };
  };
  return payload.result as {
    targetActive: boolean;
    enabledModCount: number;
    enabledModsMetaSource: string;
    enabledModsMetaUpdated: boolean;
    enabledModsMetaModCount: number;
    enabledModsMetaContainsTarget: boolean;
  };
}

function preparedSetupSnapshot(input: {
  setupMapScript: string;
  setupMapSize: string;
  setupMapSeed: number;
  setupGameSeed: number;
  playerCount: number;
  runtimeMapSize?: string | number;
}): Civ7SetupSnapshot {
  const mapRow: Civ7SetupMapRow = {
    source: "setup-domain",
    file: input.setupMapScript,
    value: input.setupMapScript,
    name: "LOC_MAP_TEST_NAME",
    sortIndex: 1,
  };
  return {
    phase: "shell",
    ui: {
      inGame: { ok: true, value: false },
      inShell: { ok: true, value: true },
      inLoading: { ok: true, value: false },
      loadingState: { ok: true, value: 0 },
      loadingStateName: "NotStarted",
      canBeginGame: { ok: true, value: false },
    },
    setup: {
      revision: { ok: true, value: 1 },
      parameters: [
        { id: "Map", exists: true, value: input.setupMapScript, possibleValues: [] },
        { id: "MapSize", exists: true, value: input.setupMapSize, possibleValues: [] },
        { id: "MapRandomSeed", exists: true, value: input.setupMapSeed, possibleValues: [] },
        { id: "GameRandomSeed", exists: true, value: input.setupGameSeed, possibleValues: [] },
      ],
      playerParameters: [],
      localPlayerId: { ok: true, value: 0 },
    },
    selectedMapRow: mapRow,
    mapRows: [mapRow],
    config: {
      mapScript: { ok: true, value: input.setupMapScript },
      mapSize: { ok: true, value: input.runtimeMapSize ?? input.setupMapSize },
      mapSizeType: { ok: true, value: input.setupMapSize },
      mapSeed: { ok: true, value: input.setupMapSeed },
      gameSeed: { ok: true, value: input.setupGameSeed },
      playerCount: { ok: true, value: input.playerCount },
    },
  };
}

function createReconcileConfiguration(input: {
  editMeta?: { mods: ReadonlyArray<Record<string, unknown>> };
  gameMeta?: { mods: ReadonlyArray<Record<string, unknown>> };
}) {
  let meta =
    input.editMeta === undefined ? undefined : JSON.stringify({ mods: [...input.editMeta.mods] });
  const gameMetaMods = input.gameMeta?.mods;
  const gameMeta =
    gameMetaMods === undefined ? () => meta : () => JSON.stringify({ mods: [...gameMetaMods] });
  return {
    editGame: () => ({
      get enableModsMetaString() {
        return meta;
      },
      set enableModsMetaString(value: string | undefined) {
        meta = value;
      },
      setValue: (_key: string, value: string) => {
        meta = value;
      },
      refreshEnabledMods: () => null,
    }),
    getGame: () => {
      const parsed = JSON.parse(gameMeta() ?? '{"mods":[]}') as {
        mods?: ReadonlyArray<Record<string, unknown>>;
      };
      const mods = parsed.mods ?? [];
      return {
        enableModsMetaString: gameMeta(),
        enabledModCount: mods.length,
        getEnabledModId: (index: number) => mods[index]?.modid ?? mods[index]?.id,
      };
    },
  };
}

function classifyCommand(script: string): SetupLifecycleOperation | undefined {
  if (script === CIV7_EXIT_TO_MAIN_MENU_COMMAND) return "exit-to-main-menu";
  if (script === CIV7_RELOAD_UI_COMMAND) return "reload-ui";
  if (script.includes(CIV7_BEGIN_GAME_COMMAND)) return "begin-game";
  if (script.includes("setScript.call(editMap")) return "prepare-setup";
  if (script.includes("const gameOptions = { ...input.gameOptions")) return "setup-options";
  if (script.includes("Network.loadGame")) return "load-saved-config";
  if (script.includes("Network.hostGame")) return "host-game";
  if (script.includes("refreshEnabledMods")) return "target-mod-reconcile";
  if (script.includes("const rows = readSetupMapRows")) return "setup-map-rows";
  if (script.includes("const policy =") && script.includes('transition: "exit-sent"')) {
    return "setup-shell-admission";
  }
  if (script.includes("reloaded: false") && script.includes("readSetupSnapshot")) {
    return "reload-ui-in-shell";
  }
  if (script.includes("readSetupSnapshot")) return "setup-snapshot";
  if (script.includes("evalOk: 1 + 1")) return "tuner-health";
  if (script.includes("MapRegions") && script.includes("randomSeed")) return "map-summary";
  return undefined;
}

function parseShellAdmissionPolicy(script: string): "reject" | "exit-active-game" {
  const match = /const policy = ("[^"]+");/.exec(script);
  if (!match) throw new Error("Could not parse setup shell admission policy");
  const policy = JSON.parse(match[1]);
  if (policy !== "reject" && policy !== "exit-active-game") {
    throw new Error("Unknown setup shell admission policy");
  }
  return policy;
}

function parseSetupInput(script: string): Civ7SinglePlayerSetupValues {
  const match = /const input = (\{.*?\});\n\s+const before = readSetupSnapshot\(\);/s.exec(script);
  if (!match) throw new Error("Could not parse setup input from command");
  return JSON.parse(match[1]) as Civ7SinglePlayerSetupValues;
}

function parseHostExpected(script: string): Civ7SinglePlayerSetupValues {
  const match = /const expected = (\{.*?\});\n\s+const before = readSetupSnapshot\(\);/s.exec(
    script
  );
  if (!match) throw new Error("Could not parse expected setup from host command");
  return JSON.parse(match[1]) as Civ7SinglePlayerSetupValues;
}

function parseRequestedMapFile(script: string): string | undefined {
  const match = /const input = (\{.*?\});\n\s+const rows = readSetupMapRows/s.exec(script);
  if (!match) return undefined;
  const input = JSON.parse(match[1]) as { file?: string };
  return input.file;
}

function parseCommand(message: string): { stateId: string; script: string } | undefined {
  const match = /^CMD:([^:]+):([\s\S]*)$/.exec(message);
  if (!match) return undefined;
  return { stateId: match[1], script: match[2] };
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
