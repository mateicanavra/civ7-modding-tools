import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { MockAdapter } from "@civ7/adapter";
import { build } from "esbuild";
import {
  civ7MapScriptTextEncoderBanner,
  civ7TypeBoxCompatibilityPlugin,
} from "../../src/runtime/map-script/compiler.js";

const mapContextProbe = {
  adapterCreationCount: 0,
  onCreate: null as (() => void) | null,
};

mock.module("../../src/runtime/map-script/adapter.js", () => {
  return {
    createCiv7Adapter: () => {
      mapContextProbe.adapterCreationCount += 1;
      if (mapContextProbe.adapterCreationCount > 1) mapContextProbe.onCreate?.();
      return new MockAdapter({
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
      });
    },
  };
});

import {
  CIV7_GAME_OPTION_DESCRIPTORS,
  CIV7_MAP_OPTION_DESCRIPTORS,
  CIV7_PLAYER_OPTION_DESCRIPTORS,
} from "@civ7/map-policy/setup";
import { admitMapSetup } from "@swooper/mapgen-core";
import {
  basePhysicalInitialSetupDefinition,
  createRecipe,
  defineInitialSetup,
  type RecipeModule,
  Type,
} from "@swooper/mapgen-core/authoring";
import {
  BOUNDED_JSON_LOG_MAX_LINE_LENGTH,
  decodeBoundedJsonLogSeries,
} from "@swooper/mapgen-core/lib/log";

const { createMap } = await import("../../src/runtime/map-script/entrypoint.js");

const MAP_SEA_LEVEL_OPTION = descriptorById(CIV7_MAP_OPTION_DESCRIPTORS, "MapSeaLevel");
const RULESET_OPTION = descriptorById(CIV7_GAME_OPTION_DESCRIPTORS, "Ruleset");
const PLAYER_TEAM_OPTION = descriptorById(CIV7_PLAYER_OPTION_DESCRIPTORS, "PlayerTeam");

describe("createMap", () => {
  afterEach(() => {
    mock.restore();
    mapContextProbe.adapterCreationCount = 0;
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
      on: mock((event: string, handler: (...args: unknown[]) => void) => {
        handlers.set(event, handler);
      }),
      call: mock((method: string, ...args: unknown[]) => {
        engineCalls.push({ method, args });
      }),
    };
    (globalThis as any).GameplayMap = {
      getMapSize: mock(() => 4),
      getRandomSeed: mock(() => 999),
    };
    const logs: string[] = [];
    const lifecycle: string[] = [];
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.join(" "));
    };

    try {
      const compile = mock((initialSetup: any, config: unknown) => {
        lifecycle.push("compile");
        expect(config).toEqual({});
        return {
          setup: admitMapSetup(initialSetup),
          marker: "exact-plan",
        };
      });
      const execute = mock((context: { setup: unknown }, plan: any) => {
        lifecycle.push("execute");
        expect(context.setup).toBe(plan.setup);
        expect(plan.marker).toBe("exact-plan");
        logs.push("recipe-execute");
      });
      const inspectPlan = mock((plan: any) => {
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
      const run = mock();

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
    spyOn(console, "log").mockImplementation((...args: unknown[]) => logs.push(args.join(" ")));
    (globalThis as any).engine = {
      on: mock((event: string, handler: (...args: unknown[]) => void) => {
        handlers.set(event, handler);
      }),
      call: mock(),
    };
    (globalThis as any).GameplayMap = {
      getMapSize: mock(() => 4),
      getRandomSeed: mock(() => 321),
    };
    const getGameValue = mock((key: string) => {
      if (key === "RandomSeed") return 654;
      if (key === "RuleSet") return "RULESET_STANDARD";
      return undefined;
    });
    const getMapValue = mock((key: string) => {
      if (key === "SeaLevel") return "SEA_LEVEL_NORMAL";
      return undefined;
    });
    const getAliveMajorIds = mock(() => [7, 3]);
    (globalThis as any).Configuration = {
      getGameValue,
      getMapValue,
      getPlayer: mock((playerId: number) => ({
        getValue: mock((key: string) => (playerId === 7 && key === "Team" ? 3 : undefined)),
      })),
    };
    (globalThis as any).Players = { getAliveMajorIds };

    const project = mock((capture: any) => ({
      physical: {
        mapSeed: capture.mapSeed,
        dimensions: capture.dimensions,
        latitudeBounds: capture.latitudeBounds,
      },
      gameSeed: capture.gameSeed,
      aliveMajorPlayerIds: capture.aliveMajorPlayerIds,
      options: capture.options,
    }));
    const compile = mock((initialSetup: any) => ({
      setup: admitMapSetup(initialSetup.physical),
      marker: "product-plan",
    }));
    const inspectPlan = mock(() => ({
      recipeId: "test.product",
      planFingerprint: "b".repeat(64),
      initialSetup: {
        definitionId: "test/product",
        value: project.mock.results[0]?.value,
      },
    }));
    const execute = mock();

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
      on: mock((event: string, handler: (...args: unknown[]) => void) =>
        handlers.set(event, handler)
      ),
      call: mock(),
    };
    (globalThis as any).GameplayMap = {
      getMapSize: mock(() => 4),
      getRandomSeed: mock(() => 1),
    };
    (globalThis as any).Configuration = {
      getGameValue: mock((key: string) => (key === "RandomSeed" ? 2 : undefined)),
      getMapValue: mock(),
    };
    (globalThis as any).Players = { getAliveMajorIds: mock(() => [0]) };
    const log = spyOn(console, "log").mockImplementation(() => {});
    const error = spyOn(console, "error").mockImplementation(() => {});
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
        compile: mock(() => {
          throw failure;
        }),
        inspectPlan: mock(),
        execute: mock(),
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
      on: mock((event: string, handler: (...args: unknown[]) => void) => {
        handlers.set(event, handler);
      }),
      call: mock(),
    };
    (globalThis as any).GameplayMap = {
      getMapSize: mock(() => 4),
      getRandomSeed: mock(() => 1),
    };
    (globalThis as any).Configuration = {
      getGameValue: mock(() => 2),
      getMapValue: mock(),
    };
    (globalThis as any).Players = {
      getAliveMajorIds: mock(() => [0]),
    };

    expect(() =>
      createMap({
        id: "invalid-product-map",
        name: "Invalid Product Map",
        config: {},
        recipe: {
          id: "test.product",
          initialSetup: { id: "test/product" },
          compile: mock(),
          execute: mock(),
        },
      } as never)
    ).toThrow('Recipe "test.product" requires an initialSetup projector');
    expect(handlers.size).toBe(0);
  });

  test("requires explicit RequestMapInitData latitude evidence or an authored override", () => {
    const handlers = new Map<string, (...args: unknown[]) => void>();
    const setMapInitData = mock();
    (globalThis as any).engine = {
      on: mock((event: string, handler: (...args: unknown[]) => void) => {
        handlers.set(event, handler);
      }),
      call: setMapInitData,
    };

    const recipe = {
      id: "test.base",
      initialSetup: basePhysicalInitialSetupDefinition,
      compile: mock(),
      execute: mock(),
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
          compile: mock(),
          execute: mock(),
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
        recipe: { run: mock() } as any,
      },
      {
        id: "test-map",
        name: "Test Map",
        runCorrelation: { requestId: "studio-run-in-game-test" },
        config: {},
        recipe: { run: mock() } as any,
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
type CompatibleTextEncoder = Readonly<{
  encoding: string;
  encode: (input?: string) => Uint8Array;
  encodeInto: (
    source: string,
    destination: Uint8Array
  ) => Readonly<{ read: number; written: number }>;
}>;
type CompatibleTextEncoderConstructor = new () => CompatibleTextEncoder;

function evaluateBanner(
  existing?: CompatibleTextEncoderConstructor
): CompatibleTextEncoderConstructor {
  const sandbox: {
    TextEncoder?: CompatibleTextEncoderConstructor;
    Uint8Array: Uint8ArrayConstructor;
  } = { TextEncoder: existing, Uint8Array };
  runInNewContext(civ7MapScriptTextEncoderBanner, sandbox);
  if (!sandbox.TextEncoder) throw new Error("Civ7 TextEncoder banner installed no constructor");
  return sandbox.TextEncoder;
}

type TypeBoxCompatibilityProof = Readonly<{
  urls: readonly Readonly<{ href: string; pathname: string; hash: string }>[];
  plain: boolean;
  recursive: boolean;
  recursiveRefusal: boolean;
  fragment: boolean;
  fragmentRefusal: boolean;
}>;

async function evaluateTypeBoxCompatibility(): Promise<TypeBoxCompatibilityProof> {
  const result = await build({
    stdin: {
      contents: `
        import { Type } from "typebox";
        import { Compile } from "typebox/compile";
        import { TypeBoxURL } from "civ7:typebox-url";

        const recursiveSchema = Type.Cyclic(
          {
            JsonValue: Type.Union([
              Type.Null(),
              Type.Array(Type.Ref("JsonValue")),
            ]),
          },
          "JsonValue"
        );
        const fragmentSchema = {
          $id: "Root",
          $defs: { Leaf: Type.Object({ value: Type.Number() }) },
          $ref: "#/$defs/Leaf",
        };
        const urls = [
          new TypeBoxURL("http://unknown"),
          new TypeBoxURL("JsonValue", "http://unknown/"),
          new TypeBoxURL("#/$defs/Leaf", "http://unknown/Root"),
        ];
        globalThis.__typeBoxCompatibilityProof = {
          urls: urls.map(({ href, pathname, hash }) => ({ href, pathname, hash })),
          plain: Compile(Type.Object({ value: Type.Number() })).Check({ value: 1 }),
          recursive: Compile(recursiveSchema).Check([null, [null]]),
          recursiveRefusal: Compile(recursiveSchema).Check([1]),
          fragment: Compile(fragmentSchema).Check({ value: 1 }),
          fragmentRefusal: Compile(fragmentSchema).Check({ value: "one" }),
        };
      `,
      loader: "js",
      resolveDir: join(import.meta.dir, "..", "..", ".."),
      sourcefile: "civ7-typebox-url-compatibility.js",
    },
    banner: { js: civ7MapScriptTextEncoderBanner },
    bundle: true,
    format: "iife",
    logLevel: "silent",
    platform: "neutral",
    plugins: [civ7TypeBoxCompatibilityPlugin],
    write: false,
  });
  const sandbox: { __typeBoxCompatibilityProof?: TypeBoxCompatibilityProof } = {};
  runInNewContext(result.outputFiles[0]!.text, sandbox);
  if (!sandbox.__typeBoxCompatibilityProof) {
    throw new Error("Civ7 TypeBox compatibility bundle emitted no proof.");
  }
  return JSON.parse(JSON.stringify(sandbox.__typeBoxCompatibilityProof));
}

describe("Civ7 map-script build support", () => {
  test("preserves an existing TextEncoder implementation", () => {
    class ExistingTextEncoder implements CompatibleTextEncoder {
      readonly encoding = "utf-8";

      encode(): Uint8Array {
        return new Uint8Array();
      }

      encodeInto(): Readonly<{ read: number; written: number }> {
        return { read: 0, written: 0 };
      }
    }

    expect(evaluateBanner(ExistingTextEncoder)).toBe(ExistingTextEncoder);
  });

  test("installs deterministic UTF-8 encoding when the host omits TextEncoder", () => {
    const Encoder = evaluateBanner();
    const encoder = new Encoder();

    expect(encoder.encoding).toBe("utf-8");
    expect(Array.from(encoder.encode("map"))).toEqual([0x6d, 0x61, 0x70]);
    expect(Array.from(encoder.encode("é"))).toEqual([0xc3, 0xa9]);
    expect(Array.from(encoder.encode("🗺"))).toEqual([0xf0, 0x9f, 0x97, 0xba]);
    expect(Array.from(encoder.encode("\ud800"))).toEqual([0xef, 0xbf, 0xbd]);
  });

  test("encodes only complete code points into bounded destinations", () => {
    const encoder = new (evaluateBanner())();

    const oneByte = new Uint8Array(1);
    expect(encoder.encodeInto("é", oneByte)).toEqual({ read: 0, written: 0 });
    expect(Array.from(oneByte)).toEqual([0]);

    const threeBytes = new Uint8Array(3);
    expect(encoder.encodeInto("🗺", threeBytes)).toEqual({ read: 0, written: 0 });
    expect(Array.from(threeBytes)).toEqual([0, 0, 0]);

    const fourBytes = new Uint8Array(4);
    expect(encoder.encodeInto("🗺", fourBytes)).toEqual({ read: 2, written: 4 });
    expect(Array.from(fourBytes)).toEqual([0xf0, 0x9f, 0x97, 0xba]);

    const twoBytes = new Uint8Array(2);
    expect(encoder.encodeInto("aé", twoBytes)).toEqual({ read: 1, written: 1 });
    expect(Array.from(twoBytes)).toEqual([0x61, 0]);
  });

  test("keeps TypeBox compilation and reference resolution host-independent", async () => {
    const proof = await evaluateTypeBoxCompatibility();
    const oracle = [
      new URL("http://unknown"),
      new URL("JsonValue", "http://unknown/"),
      new URL("#/$defs/Leaf", "http://unknown/Root"),
    ].map(({ href, pathname, hash }) => ({ href, pathname, hash }));

    expect(proof.urls).toEqual(oracle);
    expect(proof).toMatchObject({
      plain: true,
      recursive: true,
      recursiveRefusal: false,
      fragment: true,
      fragmentRefusal: false,
    });
  });
});
const START_POSITION_OPTION = descriptorById(CIV7_MAP_OPTION_DESCRIPTORS, "StartPosition");
const FORGED_MAP_OPTION = {
  configurationGroup: "Map",
  parameterId: "ForgedMapOption",
  cardinality: "scalar",
  valueKind: "string",
  physicalProjections: {
    configuration: { key: "ForgedMapOption", encoding: "literal" },
    authoredValue: { key: "ForgedMapOption" },
  },
  authoredValueRead: {
    kind: "configuration",
    key: "ForgedMapOption",
    source: "configuration-key",
  },
} as const;

const ProductInitialSetup = defineInitialSetup({
  id: "test/product",
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
      gameSeed: Type.Integer(),
      seaLevel: Type.String(),
    },
    { additionalProperties: false }
  ),
  physical: (value) => value.physical,
});

const CollidingPhysicalInitialSetup = defineInitialSetup({
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
      marker: Type.Literal("custom"),
    },
    { additionalProperties: false }
  ),
  physical: (value) => value.physical,
});

declare const baseRecipe: RecipeModule<Readonly<Record<string, never>>>;
declare const productRecipe: RecipeModule<
  Readonly<Record<string, never>>,
  Readonly<Record<string, never>>,
  typeof ProductInitialSetup
>;
declare const collidingPhysicalRecipe: RecipeModule<
  Readonly<Record<string, never>>,
  Readonly<Record<string, never>>,
  typeof CollidingPhysicalInitialSetup
>;

const concreteProductRecipe = createRecipe({
  id: "concrete-product",
  initialSetup: ProductInitialSetup,
  stages: [],
  operations: {},
});

function mapDefinitionTypeAssertions(): void {
  createMap({
    id: "base",
    name: "Base",
    recipe: baseRecipe,
    config: {},
  });

  // @ts-expect-error Textual id equality does not make a custom authority Core's branded base.
  createMap({
    id: "missing-colliding-projector",
    name: "Missing Colliding Projector",
    recipe: collidingPhysicalRecipe,
    config: {},
  });

  createMap({
    id: "colliding-projector",
    name: "Colliding Projector",
    recipe: collidingPhysicalRecipe,
    config: {},
    initialSetup: {
      requestedMapOptions: [],
      requestedGameOptions: [],
      requestedPlayerOptions: [],
      project: (capture) => ({
        physical: {
          mapSeed: capture.mapSeed,
          dimensions: capture.dimensions,
          latitudeBounds: capture.latitudeBounds,
        },
        marker: "custom",
      }),
    },
  });

  createMap({
    id: "product",
    name: "Product",
    recipe: productRecipe,
    config: {},
    initialSetup: {
      requestedMapOptions: [START_POSITION_OPTION, MAP_SEA_LEVEL_OPTION],
      requestedGameOptions: [RULESET_OPTION],
      requestedPlayerOptions: [PLAYER_TEAM_OPTION],
      project: (capture) => {
        const firstMapKey: "StartPosition" = capture.options.map[0].key;
        const secondMapKey: "MapSeaLevel" = capture.options.map[1].key;
        const gameKey: "Ruleset" = capture.options.game[0].key;
        const playerKey: "PlayerTeam" = capture.options.player[0]!.options[0].key;
        if (capture.options.map[1].status === "available") {
          const seaLevel: string = capture.options.map[1].value;
          void seaLevel;
        }
        if (capture.options.game[0].status === "available") {
          const ruleset: string = capture.options.game[0].value;
          void ruleset;
        }
        void firstMapKey;
        void secondMapKey;
        void gameKey;
        void playerKey;
        return {
          physical: {
            mapSeed: capture.mapSeed,
            dimensions: capture.dimensions,
            latitudeBounds: capture.latitudeBounds,
          },
          gameSeed: capture.gameSeed,
          seaLevel: "normal",
        };
      },
    },
  });

  createMap({
    id: "concrete-product",
    name: "Concrete Product",
    recipe: concreteProductRecipe,
    config: {},
    initialSetup: {
      requestedMapOptions: [],
      requestedGameOptions: [],
      requestedPlayerOptions: [],
      project: (capture) => ({
        physical: {
          mapSeed: capture.mapSeed,
          dimensions: capture.dimensions,
          latitudeBounds: capture.latitudeBounds,
        },
        gameSeed: capture.gameSeed,
        seaLevel: "normal",
      }),
    },
  });

  createMap({
    id: "forged-option",
    name: "Forged Option",
    recipe: productRecipe,
    config: {},
    initialSetup: {
      // @ts-expect-error Map capture accepts only exact generated descriptor unions.
      requestedMapOptions: [FORGED_MAP_OPTION],
      requestedGameOptions: [],
      requestedPlayerOptions: [],
      project: (capture) => ({
        physical: {
          mapSeed: capture.mapSeed,
          dimensions: capture.dimensions,
          latitudeBounds: capture.latitudeBounds,
        },
        gameSeed: capture.gameSeed,
        seaLevel: "normal",
      }),
    },
  });

  // @ts-expect-error A recipe-owned initial setup requires its Civ7 capture projector.
  createMap({
    id: "missing-product-projector",
    name: "Missing Product Projector",
    recipe: productRecipe,
    config: {},
  });

  createMap({
    id: "wrong-product-projector",
    name: "Wrong Product Projector",
    recipe: productRecipe,
    config: {},
    initialSetup: {
      requestedMapOptions: [],
      requestedGameOptions: [],
      requestedPlayerOptions: [],
      // @ts-expect-error The projector must return the recipe's complete exact initial input.
      project: (capture) => ({
        physical: {
          mapSeed: capture.mapSeed,
          dimensions: capture.dimensions,
          latitudeBounds: capture.latitudeBounds,
        },
      }),
    },
  });
}

void mapDefinitionTypeAssertions;
