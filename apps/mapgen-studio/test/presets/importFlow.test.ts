import type { StudioPresetExportFileV1 } from "@swooper/mapgen-core/authoring";
import { STANDARD_RECIPE_CONFIG } from "mod-swooper-maps/recipes/standard-artifacts";
import { describe, expect, it } from "vitest";
import { resolveImportedPreset } from "../../src/features/presets/importFlow";
import { findRecipeArtifacts } from "../../src/recipes/catalog";

describe("resolveImportedPreset", () => {
  it("rejects unknown recipe ids", () => {
    const presetFile: StudioPresetExportFileV1 = {
      $schema: "https://civ7.tools/schemas/mapgen-studio/studio-preset-export.v1.schema.json",
      version: 1,
      recipeId: "unknown/recipe",
      preset: {
        label: "Mystery",
        config: {},
      },
    };

    const result = resolveImportedPreset({ presetFile, findRecipeArtifacts });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe("unknown-recipe");
    }
  });

  it("rejects invalid configs", () => {
    const presetFile: StudioPresetExportFileV1 = {
      $schema: "https://civ7.tools/schemas/mapgen-studio/studio-preset-export.v1.schema.json",
      version: 1,
      recipeId: "mod-swooper-maps/standard",
      preset: {
        label: "Invalid",
        config: { "not-a-stage": { bogus: true } },
      },
    };

    const result = resolveImportedPreset({ presetFile, findRecipeArtifacts });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe("invalid-config");
      expect(result.details?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("accepts complete config JSON exactly", () => {
    const config = STANDARD_RECIPE_CONFIG as Record<string, unknown>;
    const presetFile: StudioPresetExportFileV1 = {
      $schema: "https://civ7.tools/schemas/mapgen-studio/studio-preset-export.v1.schema.json",
      version: 1,
      recipeId: "mod-swooper-maps/standard",
      preset: {
        label: "Complete",
        config,
      },
    };

    const result = resolveImportedPreset({ presetFile, findRecipeArtifacts });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config).toEqual(config);
    }
  });

  it("rejects config JSON that would need recipe default materialization", () => {
    const [firstStage] = Object.keys(STANDARD_RECIPE_CONFIG);
    const config = { ...(STANDARD_RECIPE_CONFIG as Record<string, unknown>) };
    delete config[firstStage!];
    const presetFile: StudioPresetExportFileV1 = {
      $schema: "https://civ7.tools/schemas/mapgen-studio/studio-preset-export.v1.schema.json",
      version: 1,
      recipeId: "mod-swooper-maps/standard",
      preset: {
        label: "Incomplete",
        config,
      },
    };

    const result = resolveImportedPreset({ presetFile, findRecipeArtifacts });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe("invalid-config");
      expect(result.details).toEqual(
        expect.arrayContaining([
          expect.stringContaining("complete recipe config JSON"),
        ])
      );
    }
  });
});
