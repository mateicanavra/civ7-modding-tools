import { afterEach, describe, expect, test, vi } from "vitest";

const mapContextProbe = vi.hoisted(() => ({
  onCreate: null as (() => void) | null,
}));

vi.mock("@swooper/mapgen-core", async () => {
  const actual =
    await vi.importActual<typeof import("@swooper/mapgen-core")>("@swooper/mapgen-core");
  return {
    ...actual,
    createMapContext: (...args: Parameters<typeof actual.createMapContext>) => {
      mapContextProbe.onCreate?.();
      return actual.createMapContext(...args);
    },
  };
});

vi.mock("@civ7/adapter/civ7", async () => {
  const { MockAdapter } = await vi.importActual<typeof import("@civ7/adapter")>("@civ7/adapter");
  return {
    createCiv7Adapter: vi.fn(
      () =>
        new MockAdapter({
          width: 2,
          height: 2,
          mapSizeId: 4,
          mapInfo: {
            MapSizeType: "MAPSIZE_TINY",
            GridWidth: 2,
            GridHeight: 2,
            PlayersLandmass1: 1,
            PlayersLandmass2: 1,
          },
        })
    ),
  };
});

import {
  CIV7_GAME_OPTION_DESCRIPTORS,
  CIV7_MAP_OPTION_DESCRIPTORS,
  CIV7_PLAYER_OPTION_DESCRIPTORS,
} from "@civ7/adapter";
import { admitMapSetup } from "@swooper/mapgen-core";
import {
  basePhysicalInitialSetupDefinition,
  defineInitialSetup,
  type RecipeModule,
  Type,
} from "@swooper/mapgen-core/authoring";
import {
  BOUNDED_JSON_LOG_MAX_LINE_LENGTH,
  decodeBoundedJsonLogSeries,
} from "@swooper/mapgen-core/lib/log";
import { createMap } from "../src/mapgen/createMap";

const MAP_SEA_LEVEL_OPTION = descriptorById(CIV7_MAP_OPTION_DESCRIPTORS, "MapSeaLevel");
const RULESET_OPTION = descriptorById(CIV7_GAME_OPTION_DESCRIPTORS, "Ruleset");
const PLAYER_TEAM_OPTION = descriptorById(CIV7_PLAYER_OPTION_DESCRIPTORS, "PlayerTeam");

describe("createMap", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mapContextProbe.onCreate = null;
    delete (globalThis as any).engine;
    delete (globalThis as any).GameplayMap;
    delete (globalThis as any).Configuration;
    delete (globalThis as any).Players;
  });

  test("compiles before context creation and executes the exact plan for a base recipe", () => {
    const handlers = new Map<string, (...args: unknown[]) => void>();
    const engineCalls: Array<{ method: string; args: unknown[] }> = [];
    (globalThis as any).engine = {
      on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
        handlers.set(event, handler);
      }),
      call: vi.fn((method: string, ...args: unknown[]) => {
        engineCalls.push({ method, args });
      }),
    };
    (globalThis as any).GameplayMap = {
      getMapSize: vi.fn(() => 4),
      getRandomSeed: vi.fn(() => 999),
    };
    const logs: string[] = [];
    const lifecycle: string[] = [];
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.join(" "));
    };

    try {
      const compile = vi.fn((initialSetup: any, config: unknown) => {
        lifecycle.push("compile");
        expect(config).toEqual({});
        return {
          setup: admitMapSetup(initialSetup),
          marker: "exact-plan",
        };
      });
      const execute = vi.fn((context: { setup: unknown }, plan: any) => {
        lifecycle.push("execute");
        expect(context.setup).toBe(plan.setup);
        expect(plan.marker).toBe("exact-plan");
        logs.push("recipe-execute");
      });
      const inspectPlan = vi.fn((plan: any) => {
        lifecycle.push("inspect");
        return {
          recipeId: "test.base",
          planFingerprint: "a".repeat(64),
          initialSetup: {
            definitionId: basePhysicalInitialSetupDefinition.id,
            value: plan.setup,
          },
        };
      });
      const run = vi.fn();

      const recipe = {
        id: "test.base",
        initialSetup: basePhysicalInitialSetupDefinition,
        compile,
        inspectPlan,
        execute,
        run,
      } as unknown as RecipeModule<Readonly<Record<string, never>>>;

      createMap({
        id: "test-map",
        name: "Test Map",
        sourceConfigId: "studio-current",
        runCorrelation: {
          requestId: "studio-run-in-game-test",
          runArtifactId: "run-0123456789abcdef0123",
          canonicalConfigDigest: "canonical-config-digest",
          launchEnvelopeDigest: "envelope-hash",
          generationManifestDigest: "manifest-digest",
        },
        seed: 123,
        config: {},
        recipe,
      });

      mapContextProbe.onCreate = () => lifecycle.push("context");
      handlers.get("RequestMapInitData")?.({
        mapSize: 4,
        width: 2,
        height: 2,
        topLatitude: 60,
        bottomLatitude: -60,
      });
      handlers.get("GenerateMap")?.();

      expect(engineCalls).toContainEqual({
        method: "SetMapInitData",
        args: [{ width: 2, height: 2, topLatitude: 60, bottomLatitude: -60, mapSize: 4 }],
      });
      expect(compile).toHaveBeenCalledTimes(1);
      expect(inspectPlan).toHaveBeenCalledTimes(1);
      expect(execute).toHaveBeenCalledTimes(1);
      expect(run).not.toHaveBeenCalled();
      expect(lifecycle).toEqual(["compile", "inspect", "context", "execute"]);
      expect(compile.mock.calls[0]?.[0]).toEqual({
        mapSeed: 123,
        dimensions: { width: 2, height: 2 },
        latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      });

      const evidenceIndex = logs.findIndex((line) => line.includes("[mapgen-evidence]"));
      const recipeIndex = logs.findIndex((line) => line === "recipe-execute");
      const completeIndex = logs.findIndex((line) => line.includes("[mapgen-complete]"));
      expect(evidenceIndex).toBeGreaterThanOrEqual(0);
      expect(recipeIndex).toBeGreaterThan(evidenceIndex);
      expect(completeIndex).toBeGreaterThan(recipeIndex);

      const evidencePayload = payloadAfter(logs, "[mapgen-evidence]");
      const completePayload = payloadAfter(logs, "[mapgen-complete]");
      expect(completePayload).toEqual(evidencePayload);
      expect(logs.some((line) => line.includes("studio-run-in-game-test"))).toBe(true);
      expect(logs.some((line) => line.includes("canonical-config-digest"))).toBe(true);
      expect(logs.some((line) => line.includes("envelope-hash"))).toBe(true);
      expect(evidencePayload).toMatchObject({
        mapId: "test-map",
        sourceConfigId: "studio-current",
        requestId: "studio-run-in-game-test",
        runArtifactId: "run-0123456789abcdef0123",
        canonicalConfigDigest: "canonical-config-digest",
        launchEnvelopeDigest: "envelope-hash",
        generationManifestDigest: "manifest-digest",
        seed: 123,
        mapSize: 4,
        dimensions: { width: 2, height: 2 },
        recipePlan: {
          recipeId: "test.base",
          planFingerprint: "a".repeat(64),
          initialSetup: {
            definitionId: "mapgen/physical",
            value: {
              mapSeed: 123,
              dimensions: { width: 2, height: 2 },
              latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
            },
          },
        },
      });
      expect(evidencePayload).not.toHaveProperty("runCorrelation");
      expect(evidencePayload).not.toHaveProperty("configContentDigest");
      expect(evidencePayload).not.toHaveProperty("configHash");
      expect(evidencePayload).not.toHaveProperty("envelopeHash");
    } finally {
      console.log = originalLog;
    }
  });

  test("captures requested Civ7 setup evidence once and projects it for a product recipe", () => {
    const handlers = new Map<string, (...args: unknown[]) => void>();
    const logs: string[] = [];
    vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => logs.push(args.join(" ")));
    (globalThis as any).engine = {
      on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
        handlers.set(event, handler);
      }),
      call: vi.fn(),
    };
    (globalThis as any).GameplayMap = {
      getMapSize: vi.fn(() => 4),
      getRandomSeed: vi.fn(() => 321),
    };
    const getGameValue = vi.fn((key: string) => {
      if (key === "RandomSeed") return 654;
      if (key === "RuleSet") return "RULESET_STANDARD";
      return undefined;
    });
    const getMapValue = vi.fn((key: string) => {
      if (key === "SeaLevel") return "SEA_LEVEL_NORMAL";
      return undefined;
    });
    const getAliveMajorIds = vi.fn(() => [7, 3]);
    (globalThis as any).Configuration = {
      getGameValue,
      getMapValue,
      getPlayer: vi.fn((playerId: number) => ({
        getValue: vi.fn((key: string) => (playerId === 7 && key === "Team" ? 3 : undefined)),
      })),
    };
    (globalThis as any).Players = { getAliveMajorIds };

    const project = vi.fn((capture: any) => ({
      physical: {
        mapSeed: capture.mapSeed,
        dimensions: capture.dimensions,
        latitudeBounds: capture.latitudeBounds,
      },
      gameSeed: capture.gameSeed,
      aliveMajorPlayerIds: capture.aliveMajorPlayerIds,
      options: capture.options,
    }));
    const compile = vi.fn((initialSetup: any) => ({
      setup: admitMapSetup(initialSetup.physical),
      marker: "product-plan",
    }));
    const inspectPlan = vi.fn(() => ({
      recipeId: "test.product",
      planFingerprint: "b".repeat(64),
      initialSetup: {
        definitionId: "test/product",
        value: project.mock.results[0]?.value,
      },
    }));
    const execute = vi.fn();

    createMap({
      id: "product-map",
      name: "Product Map",
      config: {},
      recipe: {
        id: "test.product",
        initialSetup: { id: "test/product" },
        compile,
        inspectPlan,
        execute,
      } as any,
      initialSetup: {
        requestedMapOptions: [MAP_SEA_LEVEL_OPTION],
        requestedGameOptions: [RULESET_OPTION],
        requestedPlayerOptions: [PLAYER_TEAM_OPTION],
        project,
      },
    });

    handlers.get("RequestMapInitData")?.({
      mapSize: 4,
      width: 2,
      height: 2,
      topLatitude: 60,
      bottomLatitude: -60,
    });
    handlers.get("GenerateMap")?.();

    expect(project).toHaveBeenCalledTimes(1);
    expect(compile).toHaveBeenCalledTimes(1);
    expect(inspectPlan).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(getAliveMajorIds).toHaveBeenCalledTimes(1);
    expect(getMapValue.mock.calls).toEqual([["SeaLevel"]]);
    expect(getGameValue.mock.calls).toEqual([["RandomSeed"], ["RuleSet"]]);

    const capture = project.mock.calls[0]?.[0];
    expect(capture).toMatchObject({
      mapSeed: 321,
      gameSeed: 654,
      dimensions: { width: 2, height: 2 },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      mapSizeId: 4,
      aliveMajorPlayerIds: [7, 3],
      startSlotCapacity: { west: 1, east: 1, total: 2 },
      options: {
        map: [{ status: "available", key: "MapSeaLevel", value: "SEA_LEVEL_NORMAL" }],
        game: [{ status: "available", key: "Ruleset", value: "RULESET_STANDARD" }],
        player: [
          {
            playerId: 7,
            options: [{ status: "available", key: "PlayerTeam", value: 3 }],
          },
          {
            playerId: 3,
            options: [{ status: "unavailable", key: "PlayerTeam", reason: "value-unavailable" }],
          },
        ],
      },
    });
    expect(compile.mock.calls[0]?.[0]).toEqual(project.mock.results[0]?.value);
    expect(execute.mock.calls[0]?.[1]).toEqual({
      setup: expect.any(Object),
      marker: "product-plan",
    });
    const evidenceLines = logs.filter((line) => line.includes("[mapgen-evidence]"));
    const engineObservedLogs = logs.map((line) => line.slice(0, 1_022));
    expect(evidenceLines.length).toBeGreaterThan(1);
    expect(evidenceLines.every((line) => line.length <= BOUNDED_JSON_LOG_MAX_LINE_LENGTH)).toBe(
      true
    );
    expect(engineObservedLogs).toEqual(logs);
    expect(payloadAfter(engineObservedLogs, "[mapgen-evidence]")).toMatchObject({
      recipePlan: {
        recipeId: "test.product",
        planFingerprint: "b".repeat(64),
        initialSetup: {
          definitionId: "test/product",
          value: {
            options: {
              map: [{ status: "available", key: "MapSeaLevel", value: "SEA_LEVEL_NORMAL" }],
              game: [{ status: "available", key: "Ruleset", value: "RULESET_STANDARD" }],
            },
          },
        },
      },
    });
  });

  test("emits no run evidence when recipe compilation fails", () => {
    const handlers = new Map<string, (...args: unknown[]) => void>();
    (globalThis as any).engine = {
      on: vi.fn((event: string, handler: (...args: unknown[]) => void) =>
        handlers.set(event, handler)
      ),
      call: vi.fn(),
    };
    (globalThis as any).GameplayMap = {
      getMapSize: vi.fn(() => 4),
      getRandomSeed: vi.fn(() => 1),
    };
    (globalThis as any).Configuration = {
      getGameValue: vi.fn((key: string) => (key === "RandomSeed" ? 2 : undefined)),
      getMapValue: vi.fn(),
    };
    (globalThis as any).Players = { getAliveMajorIds: vi.fn(() => [0]) };
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const failure = new Error("compile refused");

    createMap({
      id: "failed-map",
      name: "Failed Map",
      seed: 1,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      config: {},
      recipe: {
        id: "test.failed",
        initialSetup: basePhysicalInitialSetupDefinition,
        compile: vi.fn(() => {
          throw failure;
        }),
        inspectPlan: vi.fn(),
        execute: vi.fn(),
      } as unknown as RecipeModule<Readonly<Record<string, never>>>,
    });

    handlers.get("RequestMapInitData")?.({ mapSize: 4, width: 2, height: 2 });
    expect(() => handlers.get("GenerateMap")?.()).toThrow(failure);
    expect(log.mock.calls.flat().join(" ")).not.toContain("[mapgen-evidence]");
    expect(log.mock.calls.flat().join(" ")).not.toContain("[mapgen-complete]");
    expect(error).toHaveBeenCalled();
  });

  test("fails closed when an untyped non-base recipe omits its product projector", () => {
    const handlers = new Map<string, (...args: unknown[]) => void>();
    (globalThis as any).engine = {
      on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
        handlers.set(event, handler);
      }),
      call: vi.fn(),
    };
    (globalThis as any).GameplayMap = {
      getMapSize: vi.fn(() => 4),
      getRandomSeed: vi.fn(() => 1),
    };
    (globalThis as any).Configuration = {
      getGameValue: vi.fn(() => 2),
      getMapValue: vi.fn(),
    };
    (globalThis as any).Players = {
      getAliveMajorIds: vi.fn(() => [0]),
    };

    expect(() =>
      createMap({
        id: "invalid-product-map",
        name: "Invalid Product Map",
        config: {},
        recipe: {
          id: "test.product",
          initialSetup: { id: "test/product" },
          compile: vi.fn(),
          execute: vi.fn(),
        },
      } as never)
    ).toThrow('Recipe "test.product" requires an initialSetup projector');
    expect(handlers.size).toBe(0);
  });

  test("requires explicit RequestMapInitData latitude evidence or an authored override", () => {
    const handlers = new Map<string, (...args: unknown[]) => void>();
    const setMapInitData = vi.fn();
    (globalThis as any).engine = {
      on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
        handlers.set(event, handler);
      }),
      call: setMapInitData,
    };

    const recipe = {
      id: "test.base",
      initialSetup: basePhysicalInitialSetupDefinition,
      compile: vi.fn(),
      execute: vi.fn(),
    } as unknown as RecipeModule<Readonly<Record<string, never>>>;

    createMap({
      id: "runtime-latitude-map",
      name: "Runtime Latitude Map",
      config: {},
      recipe,
    });
    expect(() => handlers.get("RequestMapInitData")?.({ mapSize: 4, width: 2, height: 2 })).toThrow(
      "RequestMapInitData did not provide finite top/bottom latitude"
    );

    createMap({
      id: "authored-latitude-map",
      name: "Authored Latitude Map",
      latitudeBounds: { topLatitude: 70, bottomLatitude: -50 },
      config: {},
      recipe,
    });
    expect(() =>
      handlers.get("RequestMapInitData")?.({ mapSize: 4, width: 2, height: 2 })
    ).not.toThrow();
    expect(setMapInitData).toHaveBeenLastCalledWith("SetMapInitData", {
      width: 2,
      height: 2,
      topLatitude: 70,
      bottomLatitude: -50,
      mapSize: 4,
    });
  });

  test("requires a projector when a custom setup reuses the base textual id", () => {
    const collidingInitialSetup = defineInitialSetup({
      id: "mapgen/physical",
      schema: Type.Object(
        {
          physical: Type.Object(
            {
              mapSeed: Type.Integer(),
              dimensions: Type.Object(
                { width: Type.Integer(), height: Type.Integer() },
                { additionalProperties: false }
              ),
              latitudeBounds: Type.Object(
                { topLatitude: Type.Number(), bottomLatitude: Type.Number() },
                { additionalProperties: false }
              ),
            },
            { additionalProperties: false }
          ),
        },
        { additionalProperties: false }
      ),
      physical: (value) => value.physical,
    });

    expect(() =>
      createMap({
        id: "colliding-setup-map",
        name: "Colliding Setup Map",
        config: {},
        recipe: {
          id: "test.colliding-setup",
          initialSetup: collidingInitialSetup,
          compile: vi.fn(),
          execute: vi.fn(),
        },
      } as never)
    ).toThrow('Recipe "test.colliding-setup" requires an initialSetup projector');
  });

  test("rejects incomplete Run in Game identity", () => {
    const incompleteDefinitions = [
      {
        id: "test-map",
        name: "Test Map",
        requestId: "studio-run-in-game-test",
        launchEnvelopeDigest: "envelope-hash",
        config: {},
        recipe: { run: vi.fn() } as any,
      },
      {
        id: "test-map",
        name: "Test Map",
        runCorrelation: { requestId: "studio-run-in-game-test" },
        config: {},
        recipe: { run: vi.fn() } as any,
      },
    ];

    for (const definition of incompleteDefinitions) {
      expect(() => createMap(definition as never)).toThrow(
        "Run maps require a complete runCorrelation"
      );
    }
  });
});

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

function payloadAfter(lines: readonly string[], marker: string): unknown {
  const decoded = decodeBoundedJsonLogSeries(lines, marker);
  const payload = decoded.at(-1)?.payload;
  if (payload === undefined) throw new Error(`Missing complete bounded JSON log series: ${marker}`);
  return payload;
}
