import type { WorldSettings } from "@swooper/mapgen-studio-ui/types";
import { describe, expect, it } from "vitest";
import { getRecipeDefaultCanonicalConfig } from "../../src/features/configAuthoring/canonicalConfig";
import {
  loadStudioAuthoringState,
  parseStudioAuthoringState,
  retireStudioAuthoringState,
  STUDIO_AUTHORING_STATE_KEY,
  saveStudioAuthoringState,
} from "../../src/features/studioState/persistence";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

const worldSettings: WorldSettings = {
  mapSize: "MAPSIZE_STANDARD",
  playerCount: 6,
  resources: "balanced",
};
const setupConfig = {
  gameOptions: {},
  mapOptions: {},
  playerOptions: [{ playerId: 0, options: {} }],
};
const legacySetupConfig = {
  gameOptions: { Difficulty: "DIFFICULTY_PRINCE", StartPosition: "START_POSITION_STANDARD" },
  playerOptions: [{ playerId: 0, options: {} }],
};
const canonicalConfig = getRecipeDefaultCanonicalConfig("standard");

describe("Studio authoring-state persistence", () => {
  it("persists independent map and game seeds with one complete setup/config state", () => {
    const storage = memoryStorage();
    saveStudioAuthoringState(
      {
        worldSettings,
        seed: "-987654321",
        gameSeed: "-123456789",
        setupConfig,
        canonicalConfig,
      },
      storage
    );

    const raw = storage.getItem(STUDIO_AUTHORING_STATE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as Record<string, unknown>;
    expect(Object.keys(parsed).sort()).toEqual([
      "canonicalConfig",
      "gameSeed",
      "savedAt",
      "schemaVersion",
      "seed",
      "setupConfig",
      "worldSettings",
    ]);
    expect(parsed.schemaVersion).toBe(5);
    expect(parsed.canonicalConfig).toEqual(canonicalConfig);

    const hydrated = loadStudioAuthoringState(storage);
    expect(hydrated).toMatchObject({
      schemaVersion: 5,
      seed: "-987654321",
      gameSeed: "-123456789",
      worldSettings,
      setupConfig,
      canonicalConfig,
    });
    expect(Object.isFrozen(hydrated?.canonicalConfig)).toBe(true);
    expect(Object.isFrozen(hydrated?.canonicalConfig.config)).toBe(true);
  });

  it("migrates one exact valid v3 snapshot once by projecting its seed to both authorities", () => {
    const storage = memoryStorage();
    storage.setItem(
      "mapgen-studio.authoring-state.v3",
      JSON.stringify({
        schemaVersion: 3,
        savedAt: "2026-06-01T00:00:00.000Z",
        worldSettings,
        seed: "987654321",
        setupConfig: legacySetupConfig,
        canonicalConfig,
      })
    );

    expect(loadStudioAuthoringState(storage)).toMatchObject({
      schemaVersion: 5,
      seed: "987654321",
      gameSeed: "987654321",
      worldSettings,
      setupConfig: {
        gameOptions: { Difficulty: "DIFFICULTY_PRINCE" },
        mapOptions: { StartPosition: "START_POSITION_STANDARD" },
        playerOptions: [{ playerId: 0, options: {} }],
      },
      canonicalConfig,
    });
    const migrated = storage.getItem(STUDIO_AUTHORING_STATE_KEY);
    expect(migrated).not.toBeNull();
    expect(storage.getItem("mapgen-studio.authoring-state.v3")).toBeNull();

    expect(loadStudioAuthoringState(storage)).toMatchObject({
      schemaVersion: 5,
      seed: "987654321",
      gameSeed: "987654321",
    });
    expect(storage.getItem(STUDIO_AUTHORING_STATE_KEY)).toBe(migrated);
  });

  it("migrates one exact valid v4 snapshot without conflating map and game options", () => {
    const storage = memoryStorage();
    storage.setItem(
      "mapgen-studio.authoring-state.v4",
      JSON.stringify({
        schemaVersion: 4,
        savedAt: "2026-06-01T00:00:00.000Z",
        worldSettings,
        seed: "123",
        gameSeed: "456",
        setupConfig: legacySetupConfig,
        canonicalConfig,
      })
    );

    expect(loadStudioAuthoringState(storage)).toMatchObject({
      schemaVersion: 5,
      seed: "123",
      gameSeed: "456",
      setupConfig: {
        gameOptions: { Difficulty: "DIFFICULTY_PRINCE" },
        mapOptions: { StartPosition: "START_POSITION_STANDARD" },
      },
    });
    expect(storage.getItem("mapgen-studio.authoring-state.v4")).toBeNull();
  });

  it("clears current and legacy state without allowing the legacy snapshot to resurrect", () => {
    const storage = memoryStorage();
    storage.setItem(
      "mapgen-studio.authoring-state.v3",
      JSON.stringify({
        schemaVersion: 3,
        savedAt: "2026-06-01T00:00:00.000Z",
        worldSettings,
        seed: "123",
        setupConfig: legacySetupConfig,
        canonicalConfig,
      })
    );
    expect(loadStudioAuthoringState(storage)).not.toBeNull();

    retireStudioAuthoringState(storage);

    expect(storage.getItem(STUDIO_AUTHORING_STATE_KEY)).toBeNull();
    expect(storage.getItem("mapgen-studio.authoring-state.v3")).toBeNull();
    expect(loadStudioAuthoringState(storage)).toBeNull();
  });

  it("does not reinterpret malformed or open v3 state as migration input", () => {
    const storage = memoryStorage();
    storage.setItem(
      "mapgen-studio.authoring-state.v3",
      JSON.stringify({
        schemaVersion: 3,
        savedAt: "2026-06-01T00:00:00.000Z",
        worldSettings,
        seed: "123",
        setupConfig,
        canonicalConfig,
        extra: true,
      })
    );

    expect(loadStudioAuthoringState(storage)).toBeNull();
    expect(storage.getItem(STUDIO_AUTHORING_STATE_KEY)).toBeNull();
  });

  it("rejects superseded persisted shapes rather than migrating or defaulting them", () => {
    expect(
      parseStudioAuthoringState(
        JSON.stringify({
          schemaVersion: 2,
          savedAt: "2026-06-01T00:00:00.000Z",
          worldSettings,
          recipeSettings: { recipe: "standard", preset: "none", seed: "123" },
          setupConfig,
          authoringConfigSource: { kind: "editor", canonicalConfig },
        })
      )
    ).toBeNull();
  });

  it("rejects unknown root keys in the current persisted shape", () => {
    expect(
      parseStudioAuthoringState(
        JSON.stringify({
          schemaVersion: 5,
          savedAt: "2026-06-01T00:00:00.000Z",
          worldSettings,
          seed: "123",
          gameSeed: "456",
          setupConfig,
          canonicalConfig,
          source: { kind: "editor" },
        })
      )
    ).toBeNull();
  });

  it("rejects malformed and open setup state instead of normalizing it", () => {
    const persisted = (candidate: unknown) =>
      JSON.stringify({
        schemaVersion: 5,
        savedAt: "2026-06-01T00:00:00.000Z",
        worldSettings,
        seed: "123",
        gameSeed: "456",
        setupConfig: candidate,
        canonicalConfig,
      });

    expect(parseStudioAuthoringState(persisted({ gameOptions: [], playerOptions: [] }))).toBeNull();
    expect(
      parseStudioAuthoringState(persisted({ ...setupConfig, unexpectedSetupAuthority: true }))
    ).toBeNull();
  });

  it("rejects invalid persisted map and game seed strings", () => {
    const persisted = (seed: string, gameSeed: string) =>
      JSON.stringify({
        schemaVersion: 5,
        savedAt: "2026-06-01T00:00:00.000Z",
        worldSettings,
        seed,
        gameSeed,
        setupConfig,
        canonicalConfig,
      });

    expect(parseStudioAuthoringState(persisted("-2147483649", "456"))).toBeNull();
    expect(parseStudioAuthoringState(persisted("123", "not-a-seed"))).toBeNull();
  });

  it("refuses invalid configs without overwriting the last valid snapshot", () => {
    const storage = memoryStorage();
    const valid = { worldSettings, seed: "123", gameSeed: "456", setupConfig, canonicalConfig };
    saveStudioAuthoringState(valid, storage);
    const before = storage.getItem(STUDIO_AUTHORING_STATE_KEY);

    saveStudioAuthoringState(
      {
        ...valid,
        canonicalConfig: { ...canonicalConfig, config: {} },
      },
      storage
    );

    expect(storage.getItem(STUDIO_AUTHORING_STATE_KEY)).toBe(before);
  });

  it("refuses invalid seeds without overwriting the last valid snapshot", () => {
    const storage = memoryStorage();
    const valid = { worldSettings, seed: "123", gameSeed: "456", setupConfig, canonicalConfig };
    saveStudioAuthoringState(valid, storage);
    const before = storage.getItem(STUDIO_AUTHORING_STATE_KEY);

    saveStudioAuthoringState({ ...valid, seed: "-2147483649" }, storage);
    expect(storage.getItem(STUDIO_AUTHORING_STATE_KEY)).toBe(before);

    saveStudioAuthoringState({ ...valid, gameSeed: "not-a-seed" }, storage);
    expect(storage.getItem(STUDIO_AUTHORING_STATE_KEY)).toBe(before);
  });
});
