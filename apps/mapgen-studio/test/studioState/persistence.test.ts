import { describe, expect, it } from "vitest";

import {
  STUDIO_AUTHORING_STATE_KEY,
  loadStudioAuthoringState,
  parseStudioAuthoringState,
  saveStudioAuthoringState,
} from "../../src/features/studioState/persistence";
import type { PipelineConfig, RecipeSettings, WorldSettings } from "../../src/ui/types";

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

const pipelineConfig = {
  morphology: {
    knobs: {
      landmasses: "earthlike",
    },
  },
} as unknown as PipelineConfig;

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
  it("saves and reloads selected config, seed, setup config, world settings, and repo-backed overrides", () => {
    const storage = memoryStorage();
    saveStudioAuthoringState(
      {
        worldSettings,
        recipeSettings,
        setupConfig,
        pipelineConfig,
        overridesDisabled: false,
        repoBackedPresetOverridesByRecipe: {
          "mod-swooper-maps/standard": {
            "swooper-earthlike": {
              id: "swooper-earthlike",
              label: "Swooper Earthlike",
              sourcePath: "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json",
              config: pipelineConfig,
            },
          },
        },
      },
      storage
    );

    const saved = storage.getItem(STUDIO_AUTHORING_STATE_KEY);
    expect(saved).toContain("987654321");
    expect(loadStudioAuthoringState(storage)).toMatchObject({
      worldSettings,
      recipeSettings,
      setupConfig,
      pipelineConfig,
      overridesDisabled: false,
      repoBackedPresetOverridesByRecipe: {
        "mod-swooper-maps/standard": {
          "swooper-earthlike": {
            id: "swooper-earthlike",
            label: "Swooper Earthlike",
          },
        },
      },
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
