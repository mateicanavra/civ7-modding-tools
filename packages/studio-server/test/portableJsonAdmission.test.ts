import { type MapConfigEnvelope, runInGame } from "@civ7/studio-contract";
import { canonicalValueDigest } from "@civ7/studio-run-workspace";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { Effect, Match } from "effect";
import { describe, expect, test } from "vitest";
import { admitRunInGameLaunchEnvelope } from "../src/operationRuntime/launchEnvelope.js";

describe("Run in Game portable JSON admission", () => {
  test("uses the TypeBox Standard Schema adapter to reject non-portable canonical config", async () => {
    const standardInput = runInGame.start["~orpc"].inputSchema;
    if (standardInput === undefined) throw new Error("runInGame.start must expose an input schema");

    const valid = await standardInput["~standard"].validate(
      runInGameStartInput({ nested: [1, true] })
    );
    expect("value" in valid).toBe(true);

    for (const [label, value] of nonPortableValues()) {
      const result = await standardInput["~standard"].validate(
        runInGameStartInput({ nested: value })
      );
      expect("issues" in result, label).toBe(true);
    }
  });

  test("returns structured issues when hostile proxies trap Standard Schema inspection", async () => {
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
      const result = await standardInput["~standard"].validate(value);
      expect("issues" in result).toBe(true);
      expect(validationIssues(result).length).toBeGreaterThan(0);
    }
  });

  test("rejects non-portable direct server input before Swooper admission", async () => {
    for (const [label, value] of nonPortableValues()) {
      let admissionCalls = 0;
      const admission = admitRunInGameLaunchEnvelope({
        input: {
          canonicalConfig: runInGameStartInput({ nested: value }).canonicalConfig,
          seed: 43,
          worldSettings: { mapSize: "MAPSIZE_STANDARD" },
          setupConfig: { gameOptions: {}, playerOptions: [{ playerId: 0, options: {} }] },
        },
        ports: {
          runInGameCanonicalConfigAdmission: {
            admit: async (canonicalConfig) => {
              admissionCalls += 1;
              return canonicalConfig;
            },
          },
        },
      });
      const result = await admission.pipe(Effect.either, Effect.runPromise);

      expect(result._tag, label).toBe("Left");
      expect(admissionCalls, label).toBe(0);
    }
  });

  test("clones and freezes the launch snapshot before asynchronous Swooper admission", async () => {
    const mutableConfig = { nested: { label: "before" } };
    const canonicalConfigInput = runInGameStartInput(mutableConfig).canonicalConfig;
    const admitted = deferred<MapConfigEnvelope>();
    const releaseAdmission = deferred<void>();
    const resolutionPromise = Effect.runPromise(
      admitRunInGameLaunchEnvelope({
        input: {
          canonicalConfig: canonicalConfigInput,
          seed: 43,
          worldSettings: { mapSize: "MAPSIZE_STANDARD" },
          setupConfig: { gameOptions: {}, playerOptions: [{ playerId: 0, options: {} }] },
        },
        ports: {
          runInGameCanonicalConfigAdmission: {
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
    expect(resolution.launchEnvelope.canonicalConfig).toEqual(canonicalConfig);
    expect(resolution.launchEnvelope.canonicalConfig).not.toBe(canonicalConfig);
    expect(resolution.canonicalConfigDigest).toBe(canonicalValueDigest(canonicalConfig));
    expect(resolution.launchEnvelopeDigest).toBe(canonicalValueDigest(resolution.launchEnvelope));
  });
});

function validationIssues(
  result: StandardSchemaV1.Result<unknown>
): ReadonlyArray<StandardSchemaV1.Issue> {
  return Match.value(result).pipe(
    Match.when(isValidationFailure, (failure) => failure.issues),
    Match.orElse(unexpectedValidationSuccess)
  );
}

function isValidationFailure(
  result: StandardSchemaV1.Result<unknown>
): result is StandardSchemaV1.FailureResult {
  return result.issues !== undefined;
}

function unexpectedValidationSuccess(): never {
  throw new Error("Expected hostile input validation issues");
}

function runInGameStartInput(config: Record<string, unknown>) {
  return {
    canonicalConfig: {
      id: "studio-current",
      name: "Studio Current",
      description: "Portable JSON fixture.",
      recipe: "standard",
      sortIndex: 9999,
      latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
      config,
    },
    seed: 43,
    worldSettings: { mapSize: "MAPSIZE_STANDARD" },
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
