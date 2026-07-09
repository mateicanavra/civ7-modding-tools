import type {
  PipelineConfig,
  RecipeSettings,
  WorldSettings,
} from "@swooper/mapgen-studio-ui/types";
import { STANDARD_RECIPE_CONFIG } from "mod-swooper-maps/recipes/standard-artifacts";
import { describe, expect, it } from "vitest";
import {
  loadStudioAuthoringState,
  parseStudioAuthoringState,
  STUDIO_AUTHORING_STATE_KEY,
  saveStudioAuthoringState,
} from "../../src/features/studioState/persistence";
import { useAuthoringStore } from "../../src/stores/authoringStore";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

const worldSettings: WorldSettings = {
  mapSize: "MAPSIZE_STANDARD",
  playerCount: 6,
  resources: "balanced",
};

const recipeSettings: RecipeSettings = {
  recipe: "mod-swooper-maps/standard",
  preset: "builtin:swooper-earthlike",
  seed: "987654321",
};

const pipelineConfig = useAuthoringStore.getState().pipelineConfig;

const setupConfig = {
  gameOptions: {
    Difficulty: "DIFFICULTY_PRINCE",
  },
  playerOptions: [
    {
      playerId: 0,
      options: {
        PlayerLeader: "LEADER_HARRIET_TUBMAN",
        PlayerCivilization: "CIVILIZATION_AMERICA",
      },
    },
  ],
};

describe("Studio authoring-state persistence", () => {
  it("saves and reloads selected config, seed, setup config, and world settings", () => {
    const storage = memoryStorage();
    saveStudioAuthoringState(
      {
        worldSettings,
        recipeSettings,
        setupConfig,
        pipelineConfig,
        overridesDisabled: false,
      },
      storage
    );

    const saved = storage.getItem(STUDIO_AUTHORING_STATE_KEY);
    expect(saved).toContain("987654321");
    expect(saved).not.toContain("repoBackedPresetOverridesByRecipe");
    expect(loadStudioAuthoringState(storage)).toMatchObject({
      worldSettings,
      recipeSettings,
      setupConfig,
      pipelineConfig,
      overridesDisabled: false,
    });
  });

  it("ignores stale persisted built-in replacement payloads", () => {
    const parsed = parseStudioAuthoringState(
      JSON.stringify({
        schemaVersion: 1,
        savedAt: "2026-06-01T00:00:00.000Z",
        worldSettings,
        recipeSettings,
        setupConfig,
        pipelineConfig,
        overridesDisabled: false,
        repoBackedPresetOverridesByRecipe: {
          "mod-swooper-maps/standard": {
            "swooper-earthlike": {
              id: "swooper-earthlike",
              label: "Stale Replacement",
              config: { stale: true },
            },
          },
        },
      })
    );

    expect(parsed).toMatchObject({ recipeSettings, pipelineConfig });
    expect(parsed).not.toHaveProperty("repoBackedPresetOverridesByRecipe");
  });

  it("hydrates no authoring state when the persisted recipe config is not exact JSON", () => {
    const storage = memoryStorage();
    storage.setItem(
      STUDIO_AUTHORING_STATE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        savedAt: "2026-06-01T00:00:00.000Z",
        worldSettings,
        recipeSettings,
        setupConfig,
        pipelineConfig: { stale: true },
        overridesDisabled: false,
      })
    );

    expect(loadStudioAuthoringState(storage)).toBeNull();
  });

  it("does not overwrite the last good snapshot with invalid draft config", () => {
    const storage = memoryStorage();
    saveStudioAuthoringState(
      {
        worldSettings,
        recipeSettings,
        setupConfig,
        pipelineConfig,
        overridesDisabled: false,
      },
      storage
    );
    const before = storage.getItem(STUDIO_AUTHORING_STATE_KEY);

    saveStudioAuthoringState(
      {
        worldSettings,
        recipeSettings,
        setupConfig,
        pipelineConfig: { stale: true } as unknown as PipelineConfig,
        overridesDisabled: false,
      },
      storage
    );

    expect(storage.getItem(STUDIO_AUTHORING_STATE_KEY)).toBe(before);
  });

  it("persists the recipe default config when overrides are disabled", () => {
    const storage = memoryStorage();
    saveStudioAuthoringState(
      {
        worldSettings,
        recipeSettings,
        setupConfig,
        pipelineConfig: { staleDraft: true } as unknown as PipelineConfig,
        overridesDisabled: true,
      },
      storage
    );

    expect(loadStudioAuthoringState(storage)).toMatchObject({
      pipelineConfig: STANDARD_RECIPE_CONFIG,
      overridesDisabled: true,
    });
  });

  it("rejects partial snapshots instead of falling back to none/123-shaped data", () => {
    expect(
      parseStudioAuthoringState(
        JSON.stringify({
          schemaVersion: 1,
          savedAt: "2026-06-01T00:00:00.000Z",
          recipeSettings,
          pipelineConfig,
        })
      )
    ).toBeNull();
  });
});
