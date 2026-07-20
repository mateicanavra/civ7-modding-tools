import type { RecipeSettings, WorldSettings } from "@swooper/mapgen-studio-ui/types";
import { describe, expect, it } from "vitest";
import { createStudioEditorCanonicalConfig } from "../../src/features/configAuthoring/canonicalConfig";
import {
  loadStudioAuthoringState,
  parseStudioAuthoringState,
  STUDIO_AUTHORING_STATE_KEY,
  saveStudioAuthoringState,
} from "../../src/features/studioState/persistence";
import { getRecipeArtifacts } from "../../src/recipes/catalog";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

const recipeSettings: RecipeSettings = {
  recipe: "mod-swooper-maps/standard",
  preset: "builtin:swooper-earthlike",
  seed: "987654321",
};
const worldSettings: WorldSettings = {
  mapSize: "MAPSIZE_STANDARD",
  playerCount: 6,
  resources: "balanced",
};
const setupConfig = { gameOptions: {}, playerOptions: [{ playerId: 0, options: {} }] };
const catalog = getRecipeArtifacts(recipeSettings.recipe).studioBuiltInPresets?.[0];
if (!catalog) throw new Error("Expected a generated catalog config for persistence tests");

describe("Studio authoring-state persistence", () => {
  it("persists catalog authoring as its source path only and resolves it fresh on hydration", () => {
    const storage = memoryStorage();
    saveStudioAuthoringState(
      {
        worldSettings,
        recipeSettings,
        setupConfig,
        authoringConfigSource: { kind: "catalog", sourcePath: catalog.sourcePath },
        configEditingEnabled: false,
      },
      storage
    );

    const raw = storage.getItem(STUDIO_AUTHORING_STATE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as { authoringConfigSource: Record<string, unknown> };
    expect(parsed.authoringConfigSource).toEqual({
      kind: "catalog",
      sourcePath: catalog.sourcePath,
    });
    expect(parsed.authoringConfigSource).not.toHaveProperty("canonicalConfig");
    expect(loadStudioAuthoringState(storage)).toMatchObject({
      recipeSettings,
      authoringConfigSource: { kind: "catalog", sourcePath: catalog.sourcePath },
      configEditingEnabled: false,
    });
  });

  it("persists an editor as exactly one complete canonicalConfig envelope", () => {
    const storage = memoryStorage();
    const canonicalConfig = createStudioEditorCanonicalConfig();
    saveStudioAuthoringState(
      {
        worldSettings,
        recipeSettings: { ...recipeSettings, preset: "none" },
        setupConfig,
        authoringConfigSource: { kind: "editor", canonicalConfig },
        configEditingEnabled: false,
      },
      storage
    );

    const parsed = JSON.parse(storage.getItem(STUDIO_AUTHORING_STATE_KEY)!) as {
      schemaVersion: number;
      authoringConfigSource: Record<string, unknown>;
    };
    expect(parsed.schemaVersion).toBe(2);
    expect(parsed.authoringConfigSource).toEqual({ kind: "editor", canonicalConfig });
    expect(parsed.authoringConfigSource).not.toHaveProperty("envelope");
    expect(parsed.authoringConfigSource).not.toHaveProperty("pipelineConfig");

    const snapshot = loadStudioAuthoringState(storage);
    expect(snapshot?.configEditingEnabled).toBe(false);
    const hydrated = snapshot?.authoringConfigSource;
    if (hydrated?.kind !== "editor") throw new Error("Expected persisted editor source");
    expect(Object.isFrozen(hydrated.canonicalConfig)).toBe(true);
    expect(Object.isFrozen(hydrated.canonicalConfig.config)).toBe(true);
  });

  it("blocks a non-current persisted shape instead of migrating or defaulting it", () => {
    const parsed = parseStudioAuthoringState(
      JSON.stringify({
        schemaVersion: 1,
        savedAt: "2026-06-01T00:00:00.000Z",
        worldSettings,
        recipeSettings,
        setupConfig,
        configEditingEnabled: false,
      })
    );

    expect(parsed?.authoringConfigSource).toEqual({
      kind: "blocked",
      reason: "invalid-persistence",
    });
  });

  it("hydrates a missing catalog path as blocked without synthesizing editor bytes", () => {
    const missingPath = "mods/mod-swooper-maps/src/maps/configs/removed-from-catalog.config.json";
    const parsed = parseStudioAuthoringState(
      JSON.stringify({
        schemaVersion: 2,
        savedAt: "2026-06-01T00:00:00.000Z",
        worldSettings,
        recipeSettings: { ...recipeSettings, preset: "builtin:removed-from-catalog" },
        setupConfig,
        authoringConfigSource: { kind: "catalog", sourcePath: missingPath },
        configEditingEnabled: false,
      })
    );

    expect(parsed?.authoringConfigSource).toEqual({
      kind: "blocked",
      reason: "missing-catalog-source",
      sourcePath: missingPath,
    });
    expect(parsed?.authoringConfigSource).not.toHaveProperty("canonicalConfig");
  });

  it("refuses invalid editor drafts without overwriting the last valid snapshot", () => {
    const storage = memoryStorage();
    const canonicalConfig = createStudioEditorCanonicalConfig();
    const valid = {
      worldSettings,
      recipeSettings,
      setupConfig,
      authoringConfigSource: { kind: "editor" as const, canonicalConfig },
      configEditingEnabled: false,
    };
    saveStudioAuthoringState(valid, storage);
    const before = storage.getItem(STUDIO_AUTHORING_STATE_KEY);

    saveStudioAuthoringState(
      {
        ...valid,
        authoringConfigSource: {
          kind: "editor",
          canonicalConfig: { ...canonicalConfig, config: {} },
        },
      },
      storage
    );

    expect(storage.getItem(STUDIO_AUTHORING_STATE_KEY)).toBe(before);
  });
});
