import { type MapConfigEnvelope, runInGame } from "@civ7/studio-contract";
import { Effect } from "effect";
import { describe, expect, test } from "vitest";

import { resolveRunInGameLaunchSource } from "../src/operationRuntime/launchSource.js";
import { hashRunInGameEvidenceValue } from "../src/operationRuntime/sourceSnapshot.js";

describe("Run in Game portable JSON admission", () => {
  test("uses the TypeBox Standard Schema adapter to reject non-portable canonical config", () => {
    const standardInput = runInGame.start["~orpc"].inputSchema;
    if (standardInput === undefined) throw new Error("runInGame.start must expose an input schema");

    const valid = standardInput["~standard"].validate(runInGameStartInput({ nested: [1, true] }));
    expect("value" in valid).toBe(true);

    for (const [label, value] of nonPortableValues()) {
      const result = standardInput["~standard"].validate(runInGameStartInput({ nested: value }));
      expect("issues" in result, label).toBe(true);
    }
  });

  test("returns structured issues when hostile proxies trap Standard Schema inspection", () => {
    const standardInput = runInGame.start["~orpc"].inputSchema;
    if (standardInput === undefined) throw new Error("runInGame.start must expose an input schema");
    const hostileRoot = new Proxy(
      {},
      {
        getOwnPropertyDescriptor: () => {
          throw new Error("hostile root descriptor");
        },
      }
    );
    const hostileNested = new Proxy(
      {},
      {
        getPrototypeOf: () => {
          throw new Error("hostile nested prototype");
        },
      }
    );

    for (const value of [hostileRoot, runInGameStartInput({ nested: hostileNested })]) {
      expect(() => standardInput["~standard"].validate(value)).not.toThrow();
      const result = standardInput["~standard"].validate(value);
      expect("issues" in result).toBe(true);
      if ("issues" in result) expect(result.issues.length).toBeGreaterThan(0);
    }
  });

  test("rejects non-portable direct server input before Swooper admission", async () => {
    for (const [label, value] of nonPortableValues()) {
      let admissionCalls = 0;
      const result = await Effect.runPromise(
        Effect.either(
          resolveRunInGameLaunchSource({
            input: {
              source: runInGameStartInput({ nested: value }).source,
              recipeSettings: { recipe: "mod-swooper-maps/standard", seed: 43 },
              worldSettings: { mapSize: "MAPSIZE_STANDARD" },
              setupConfig: { gameOptions: {}, playerOptions: [{ playerId: 0, options: {} }] },
            },
            ports: {
              runInGameCanonicalConfigAdmission: {
                resolveCatalogSource: async () => undefined,
                admit: async (canonicalConfig) => {
                  admissionCalls += 1;
                  return canonicalConfig;
                },
              },
            },
          })
        )
      );

      expect(result._tag, label).toBe("Left");
      expect(admissionCalls, label).toBe(0);
    }
  });

  test("clones and freezes the launch snapshot before asynchronous Swooper admission", async () => {
    const mutableConfig = { nested: { label: "before" } };
    const source = runInGameStartInput(mutableConfig).source;
    const admitted = deferred<MapConfigEnvelope>();
    const releaseAdmission = deferred<void>();
    const resolutionPromise = Effect.runPromise(
      resolveRunInGameLaunchSource({
        input: {
          source,
          recipeSettings: { recipe: "mod-swooper-maps/standard", seed: 43 },
          worldSettings: { mapSize: "MAPSIZE_STANDARD" },
          setupConfig: { gameOptions: {}, playerOptions: [{ playerId: 0, options: {} }] },
        },
        ports: {
          runInGameCanonicalConfigAdmission: {
            resolveCatalogSource: async () => undefined,
            admit: async (canonicalConfig) => {
              admitted.resolve(canonicalConfig);
              await releaseAdmission.promise;
              return canonicalConfig;
            },
          },
        },
      })
    );

    const canonicalConfig = await admitted.promise;
    mutableConfig.nested.label = "after";
    releaseAdmission.resolve();
    const resolution = await resolutionPromise;

    expect(canonicalConfig.config).toEqual({ nested: { label: "before" } });
    expect(Object.isFrozen(canonicalConfig)).toBe(true);
    expect(Object.isFrozen(canonicalConfig.config)).toBe(true);
    expect(Object.isFrozen(Object.values(canonicalConfig.config)[0])).toBe(true);
    expect(Object.isFrozen(resolution.launchEnvelope)).toBe(true);
    expect(resolution.launchEnvelope.source.canonicalConfig).toEqual(canonicalConfig);
    expect(resolution.launchEnvelope.source.canonicalConfig).not.toBe(canonicalConfig);
    expect(resolution.launchSourceDigest.canonicalConfigDigest).toBe(
      hashRunInGameEvidenceValue(canonicalConfig)
    );
    expect(resolution.launchEnvelopeDigest).toBe(
      hashRunInGameEvidenceValue(resolution.launchEnvelope)
    );
  });

  test("uses the catalog envelope already admitted by the Swooper resolver", async () => {
    const calls: string[] = [];
    const resolution = await Effect.runPromise(
      resolveRunInGameLaunchSource({
        input: {
          source: {
            kind: "catalog",
            sourcePath: "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json",
          },
          recipeSettings: { recipe: "mod-swooper-maps/standard", seed: 43 },
          worldSettings: { mapSize: "MAPSIZE_STANDARD" },
          setupConfig: { gameOptions: {}, playerOptions: [{ playerId: 0, options: {} }] },
        },
        ports: {
          runInGameCanonicalConfigAdmission: {
            resolveCatalogSource: async (sourcePath) => {
              calls.push(`catalog:${sourcePath}`);
              return canonicalConfigFixture({ id: "swooper-earthlike", name: "Swooper Earthlike" });
            },
            admit: async () => {
              throw new Error("catalog envelopes must not be admitted twice");
            },
          },
        },
      })
    );

    expect(calls).toEqual([
      "catalog:mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json",
    ]);
    expect(resolution.launchEnvelope.source).toMatchObject({
      kind: "catalog",
      sourcePath: "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json",
      canonicalConfig: { id: "swooper-earthlike" },
    });
  });
});

function runInGameStartInput(config: Record<string, unknown>) {
  return {
    source: {
      kind: "editor" as const,
      editorSessionId: "portable-json-test",
      canonicalConfig: {
        id: "studio-current",
        name: "Studio Current",
        description: "Portable JSON fixture.",
        recipe: "standard",
        sortIndex: 9999,
        latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
        config,
      },
    },
    recipeSettings: { recipe: "mod-swooper-maps/standard", seed: 43 },
    worldSettings: { mapSize: "MAPSIZE_STANDARD" },
  };
}

function canonicalConfigFixture(args: Readonly<{ id: string; name: string }>) {
  return {
    id: args.id,
    name: args.name,
    description: "Catalog fixture.",
    recipe: "standard",
    sortIndex: 1,
    latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
    config: {},
  };
}

function nonPortableValues(): ReadonlyArray<readonly [string, unknown]> {
  class ConfigInstance {}
  const cycle: { self?: unknown } = {};
  cycle.self = cycle;
  const sparse: unknown[] = [];
  sparse.length = 1;
  const accessor: Record<string, unknown> = {};
  Object.defineProperty(accessor, "value", {
    enumerable: true,
    get: () => "not portable",
  });
  const symbolBearing: Record<string, unknown> = {};
  Object.defineProperty(symbolBearing, Symbol("not-json"), {
    enumerable: true,
    value: "not portable",
  });

  return [
    ["Date", new Date()],
    ["Map", new Map([["value", true]])],
    ["RegExp", /portable/],
    ["function", () => true],
    ["class instance", new ConfigInstance()],
    ["cycle", cycle],
    ["sparse array", sparse],
    ["accessor", accessor],
    ["symbol-bearing object", symbolBearing],
    ["non-finite number", Number.POSITIVE_INFINITY],
  ];
}

function deferred<Value>() {
  let resolve: (value: Value | PromiseLike<Value>) => void = () => undefined;
  const promise = new Promise<Value>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}
