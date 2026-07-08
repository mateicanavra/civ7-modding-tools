import type { StudioPresetExportFileV1 } from "@swooper/mapgen-core/authoring";
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

  it("rejects imported legacy Foundation Orogeny envelopes instead of migrating them", () => {
    const presetFile: StudioPresetExportFileV1 = {
      $schema: "https://civ7.tools/schemas/mapgen-studio/studio-preset-export.v1.schema.json",
      version: 1,
      recipeId: "mod-swooper-maps/standard",
      preset: {
        label: "Legacy Foundation Orogeny",
        config: {
          "foundation-orogeny": {
            "crust-evolution": {
              computeCrustEvolution: {
                strategy: "default",
                config: {
                  continentalSurvivalMaturity: 0.6,
                  continentalFreeboard: 0.35,
                  hyperextensionBreakupBase: 0.1,
                  thinningThicknessLoss: 0.55,
                  oceanicAbyssalDepth: 0.75,
                },
              },
            },
          },
        },
      },
    };

    const result = resolveImportedPreset({ presetFile, findRecipeArtifacts });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe("invalid-config");
      expect(result.details).toEqual(
        expect.arrayContaining([
          expect.stringContaining("/preset/import/foundation-orogeny/crust-evolution"),
        ])
      );
    }
  });
});
