import { describe, expect, it, beforeEach, afterEach } from "vitest";

import { createEmptyStore, loadPresetStore, STUDIO_PRESET_STORE_KEY } from "../../src/features/presets/storage";

const makeStorage = () => {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
    clear: () => {
      data.clear();
    },
    _dump: () => data,
  };
};

type StorageLike = ReturnType<typeof makeStorage>;

const setWindowStorage = (storage: StorageLike) => {
  const stub = { localStorage: storage };
  Object.defineProperty(globalThis, "window", {
    value: stub,
    configurable: true,
    writable: true,
  });
};

const clearWindowStorage = () => {
  Object.defineProperty(globalThis, "window", {
    value: undefined,
    configurable: true,
    writable: true,
  });
};

describe("preset storage", () => {
  let storage: StorageLike;

  beforeEach(() => {
    storage = makeStorage();
    setWindowStorage(storage);
  });

  afterEach(() => {
    clearWindowStorage();
  });

  it("returns empty store when missing", () => {
    const result = loadPresetStore();
    expect(result.store).toEqual(createEmptyStore());
    expect(result.warning).toBeUndefined();
  });

  it("warns and resets on invalid JSON", () => {
    storage.setItem(STUDIO_PRESET_STORE_KEY, "not-json");
    const result = loadPresetStore();
    expect(result.store).toEqual(createEmptyStore());
    expect(result.warning).toBeDefined();
  });

  it("warns and resets on unknown version", () => {
    storage.setItem(
      STUDIO_PRESET_STORE_KEY,
      JSON.stringify({ version: 2, presetsByRecipeId: {} })
    );
    const result = loadPresetStore();
    expect(result.store).toEqual(createEmptyStore());
    expect(result.warning).toBeDefined();
  });

  it("migrates retired Foundation size-scaling fields from saved scratch configs", () => {
    storage.setItem(
      STUDIO_PRESET_STORE_KEY,
      JSON.stringify({
        version: 1,
        presetsByRecipeId: {
          "mod-swooper-maps/standard": [
            {
              id: "legacy",
              label: "Legacy",
              config: {
                foundation: {
                  meshResolution: {
                    plateCount: 28,
                    cellsPerPlate: 2,
                    relaxationSteps: 2,
                    referenceArea: 4536,
                    plateScalePower: 0.8,
                  },
                  platePartition: {
                    plateCount: 28,
                    referenceArea: 4536,
                    plateScalePower: 0.8,
                  },
                },
              },
              createdAtIso: "2026-06-01T00:00:00.000Z",
              updatedAtIso: "2026-06-01T00:00:00.000Z",
            },
          ],
        },
      })
    );

    const result = loadPresetStore();
    const config = result.store.presetsByRecipeId["mod-swooper-maps/standard"]![0]!.config as any;
    expect(config.foundation.meshResolution.plateCount).toBe(28);
    expect(config.foundation.meshResolution).not.toHaveProperty("referenceArea");
    expect(config.foundation.meshResolution).not.toHaveProperty("plateScalePower");
    expect(config.foundation.platePartition).not.toHaveProperty("referenceArea");
    expect(config.foundation.platePartition).not.toHaveProperty("plateScalePower");
  });
});
