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
});
