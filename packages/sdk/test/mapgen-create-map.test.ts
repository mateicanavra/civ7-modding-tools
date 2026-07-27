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
            GridWidth: 2,
            GridHeight: 2,
            MinLatitude: -60,
            MaxLatitude: 60,
            PlayersLandmass1: 1,
            PlayersLandmass2: 1,
          },
        })
    ),
  };
});

import { admitMapSetup } from "@swooper/mapgen-core";
import {
  basePhysicalInitialSetupDefinition,
  defineInitialSetup,
  type RecipeModule,
  Type,
} from "@swooper/mapgen-core/authoring";
import { createMap } from "../src/mapgen/createMap";

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
    (globalThis as any).Configuration = {
      getGameValue: vi.fn((key: string) => (key === "RandomSeed" ? 456 : undefined)),
      getMapValue: vi.fn(() => undefined),
    };
    (globalThis as any).Players = {
      getAliveMajorIds: vi.fn(() => [0, 1]),
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
      const run = vi.fn();

      const recipe = {
        id: "test.base",
        initialSetup: basePhysicalInitialSetupDefinition,
        compile,
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
      handlers.get("RequestMapInitData")?.({ mapSize: 4, width: 2, height: 2 });
      handlers.get("GenerateMap")?.();

      expect(engineCalls).toContainEqual({
        method: "SetMapInitData",
        args: [{ width: 2, height: 2, topLatitude: 60, bottomLatitude: -60, mapSize: 4 }],
      });
      expect(compile).toHaveBeenCalledTimes(1);
      expect(execute).toHaveBeenCalledTimes(1);
      expect(run).not.toHaveBeenCalled();
      expect(lifecycle).toEqual(["compile", "context", "execute"]);
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

      const evidencePayload = payloadAfter(logs[evidenceIndex]!, "[mapgen-evidence]");
      const completePayload = payloadAfter(logs[completeIndex]!, "[mapgen-complete]");
      expect(completePayload).toEqual(evidencePayload);
      expect(logs[evidenceIndex]!.length).toBeLessThan(1_000);
      expect(logs[completeIndex]!.length).toBeLessThan(1_000);
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
      if (key === "Ruleset") return "RULESET_STANDARD";
      return undefined;
    });
    const getMapValue = vi.fn((key: string) => {
      if (key === "SeaLevel") return "SEA_LEVEL_NORMAL";
      return undefined;
    });
    const getAliveMajorIds = vi.fn(() => [7, 3]);
    (globalThis as any).Configuration = { getGameValue, getMapValue };
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
    const execute = vi.fn();

    createMap({
      id: "product-map",
      name: "Product Map",
      config: {},
      recipe: {
        id: "test.product",
        initialSetup: { id: "test/product" },
        compile,
        execute,
      } as any,
      initialSetup: {
        requestedMapOptionKeys: ["SeaLevel"],
        requestedGameOptionKeys: ["Ruleset"],
        project,
      },
    });

    handlers.get("RequestMapInitData")?.({ mapSize: 4, width: 2, height: 2 });
    handlers.get("GenerateMap")?.();

    expect(project).toHaveBeenCalledTimes(1);
    expect(compile).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(getAliveMajorIds).toHaveBeenCalledTimes(1);
    expect(getMapValue.mock.calls).toEqual([["SeaLevel"]]);
    expect(getGameValue.mock.calls).toEqual([["RandomSeed"], ["Ruleset"]]);

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
        map: [{ status: "available", key: "SeaLevel", value: "SEA_LEVEL_NORMAL" }],
        game: [{ status: "available", key: "Ruleset", value: "RULESET_STANDARD" }],
      },
    });
    expect(compile.mock.calls[0]?.[0]).toEqual(project.mock.results[0]?.value);
    expect(execute.mock.calls[0]?.[1]).toEqual({
      setup: expect.any(Object),
      marker: "product-plan",
    });
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

function payloadAfter(line: string, marker: string): unknown {
  return JSON.parse(line.slice(line.indexOf(marker) + marker.length).trim());
}
