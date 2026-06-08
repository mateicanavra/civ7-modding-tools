import { describe, expect, it } from "vitest";

import { resolveImportedPreset } from "../../src/features/presets/importFlow";
import { findRecipeArtifacts } from "../../src/recipes/catalog";
import type { StudioPresetExportFileV1 } from "@swooper/mapgen-core/authoring";

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

  it("migrates retired Foundation size-scaling fields before validating imported presets", () => {
    const presetFile: StudioPresetExportFileV1 = {
      $schema: "https://civ7.tools/schemas/mapgen-studio/studio-preset-export.v1.schema.json",
      version: 1,
      recipeId: "mod-swooper-maps/standard",
      preset: {
        label: "Legacy Foundation",
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
      },
    };

    const result = resolveImportedPreset({ presetFile, findRecipeArtifacts });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const foundation = result.config.foundation as Record<string, Record<string, unknown>>;
      expect(foundation.meshResolution.plateCount).toBe(28);
      expect(foundation.meshResolution).not.toHaveProperty("referenceArea");
      expect(foundation.meshResolution).not.toHaveProperty("plateScalePower");
      expect(foundation.platePartition).not.toHaveProperty("referenceArea");
      expect(foundation.platePartition).not.toHaveProperty("plateScalePower");
    }
  });
});
