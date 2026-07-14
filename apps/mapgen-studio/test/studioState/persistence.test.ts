import type { WorldSettings } from "@swooper/mapgen-studio-ui/types";
import { describe, expect, it } from "vitest";
import { getRecipeDefaultCanonicalConfig } from "../../src/features/configAuthoring/canonicalConfig";
import {
  loadStudioAuthoringState,
  parseStudioAuthoringState,
  STUDIO_AUTHORING_STATE_KEY,
  saveStudioAuthoringState,
} from "../../src/features/studioState/persistence";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

const worldSettings: WorldSettings = {
  mapSize: "MAPSIZE_STANDARD",
  playerCount: 6,
  resources: "balanced",
};
const setupConfig = { gameOptions: {}, playerOptions: [{ playerId: 0, options: {} }] };
const canonicalConfig = getRecipeDefaultCanonicalConfig("standard");

describe("Studio authoring-state persistence", () => {
  it("persists exactly one complete config envelope with distinct seed and setup state", () => {
    const storage = memoryStorage();
    saveStudioAuthoringState(
      {
        worldSettings,
        seed: "987654321",
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
      "savedAt",
      "schemaVersion",
      "seed",
      "setupConfig",
      "worldSettings",
    ]);
    expect(parsed.schemaVersion).toBe(3);
    expect(parsed.canonicalConfig).toEqual(canonicalConfig);

    const hydrated = loadStudioAuthoringState(storage);
    expect(hydrated).toMatchObject({
      schemaVersion: 3,
      seed: "987654321",
      worldSettings,
      setupConfig,
      canonicalConfig,
    });
    expect(Object.isFrozen(hydrated?.canonicalConfig)).toBe(true);
    expect(Object.isFrozen(hydrated?.canonicalConfig.config)).toBe(true);
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
          schemaVersion: 3,
          savedAt: "2026-06-01T00:00:00.000Z",
          worldSettings,
          seed: "123",
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
        schemaVersion: 3,
        savedAt: "2026-06-01T00:00:00.000Z",
        worldSettings,
        seed: "123",
        setupConfig: candidate,
        canonicalConfig,
      });

    expect(parseStudioAuthoringState(persisted({ gameOptions: [], playerOptions: [] }))).toBeNull();
    expect(
      parseStudioAuthoringState(persisted({ ...setupConfig, unexpectedSetupAuthority: true }))
    ).toBeNull();
  });

  it("refuses invalid configs without overwriting the last valid snapshot", () => {
    const storage = memoryStorage();
    const valid = { worldSettings, seed: "123", setupConfig, canonicalConfig };
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
});
