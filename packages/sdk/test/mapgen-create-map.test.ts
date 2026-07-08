import { afterEach, describe, expect, test, vi } from "vitest";

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
          },
        })
    ),
  };
});

import { createMap } from "../src/mapgen/createMap";

describe("createMap", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as any).engine;
    delete (globalThis as any).GameplayMap;
  });

  test("emits exact-authorship proof and completion markers around a successful recipe run", () => {
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
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.join(" "));
    };

    try {
      const recipeRun = vi.fn(() => {
        logs.push("recipe-run");
      });

      createMap({
        id: "test-map",
        name: "Test Map",
        sourceConfigId: "studio-current",
        configHash: "config-hash",
        envelopeHash: "envelope-hash",
        runCorrelation: {
          requestId: "studio-run-in-game-test",
          runArtifactId: "run-0123456789abcdef0123",
          launchSourceDigest: {
            configContentDigest: "config-hash",
            launchEnvelopeDigest: "envelope-hash",
          },
          launchEnvelopeDigest: "envelope-hash",
          generationManifestDigest: "manifest-digest",
        },
        seed: 123,
        config: {},
        recipe: { run: recipeRun } as any,
      });

      handlers.get("RequestMapInitData")?.([{ mapSize: 4, width: 2, height: 2 }]);
      handlers.get("GenerateMap")?.();

      expect(engineCalls).toContainEqual({
        method: "SetMapInitData",
        args: [{ width: 2, height: 2, topLatitude: 60, bottomLatitude: -60, mapSize: 4 }],
      });
      expect(recipeRun).toHaveBeenCalledTimes(1);

      const proofIndex = logs.findIndex((line) => line.includes("[mapgen-proof]"));
      const recipeIndex = logs.findIndex((line) => line === "recipe-run");
      const completeIndex = logs.findIndex((line) => line.includes("[mapgen-complete]"));
      expect(proofIndex).toBeGreaterThanOrEqual(0);
      expect(recipeIndex).toBeGreaterThan(proofIndex);
      expect(completeIndex).toBeGreaterThan(recipeIndex);

      const proofPayload = payloadAfter(logs[proofIndex]!, "[mapgen-proof]");
      const completePayload = payloadAfter(logs[completeIndex]!, "[mapgen-complete]");
      expect(completePayload).toEqual(proofPayload);
      expect(proofPayload).toMatchObject({
        mapId: "test-map",
        sourceConfigId: "studio-current",
        requestId: "studio-run-in-game-test",
        runArtifactId: "run-0123456789abcdef0123",
        configHash: "config-hash",
        envelopeHash: "envelope-hash",
        generationManifestDigest: "manifest-digest",
        runCorrelation: {
          requestId: "studio-run-in-game-test",
          runArtifactId: "run-0123456789abcdef0123",
          launchSourceDigest: {
            configContentDigest: "config-hash",
            launchEnvelopeDigest: "envelope-hash",
          },
          launchEnvelopeDigest: "envelope-hash",
          generationManifestDigest: "manifest-digest",
        },
        seed: 123,
        mapSize: 4,
        dimensions: { width: 2, height: 2 },
      });
    } finally {
      console.log = originalLog;
    }
  });
});

function payloadAfter(line: string, marker: string): unknown {
  return JSON.parse(line.slice(line.indexOf(marker) + marker.length).trim());
}
