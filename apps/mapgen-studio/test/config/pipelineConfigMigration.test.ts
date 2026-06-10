import { describe, expect, it } from "vitest";
import type { StudioPresetExportFileV1 } from "@swooper/mapgen-core/authoring";
import {
  PipelineConfigMigrationError,
  migratePipelineConfigUnknown,
} from "../../src/features/configMigrations/pipelineConfig";
import { resolveImportedPreset } from "../../src/features/presets/importFlow";
import { findRecipeArtifacts } from "../../src/recipes/catalog";

describe("migratePipelineConfigUnknown", () => {
  it("migrates retired map-rivers riverDensity without touching Hydrology riverDensity", () => {
    const input = {
      "hydrology-hydrography": {
        knobs: {
          riverDensity: "dense",
          lakeiness: "many",
        },
      },
      "map-rivers": {
        knobs: {
          riverDensity: "sparse",
        },
      },
    };

    const migrated = migratePipelineConfigUnknown(input) as any;

    expect(migrated["hydrology-hydrography"].knobs).toEqual({
      riverDensity: "dense",
      lakeiness: "many",
    });
    expect(migrated["map-rivers"].knobs).toEqual({
      navigableRiverDensity: "sparse",
    });
    expect(input["map-rivers"].knobs).toEqual({
      riverDensity: "sparse",
    });
  });

  it("removes duplicate retired map-rivers riverDensity when it matches the current knob", () => {
    const migrated = migratePipelineConfigUnknown({
      "map-rivers": {
        knobs: {
          riverDensity: "dense",
          navigableRiverDensity: "dense",
        },
      },
    }) as any;

    expect(migrated["map-rivers"].knobs).toEqual({
      navigableRiverDensity: "dense",
    });
  });

  it("rejects conflicting retired and current map-rivers density values", () => {
    expect(() =>
      migratePipelineConfigUnknown({
        "map-rivers": {
          knobs: {
            riverDensity: "sparse",
            navigableRiverDensity: "dense",
          },
        },
      })
    ).toThrow(PipelineConfigMigrationError);
  });
});

describe("resolveImportedPreset migration conflicts", () => {
  it("reports precise retired map-rivers density conflicts as invalid config", () => {
    const presetFile: StudioPresetExportFileV1 = {
      $schema: "https://civ7.tools/schemas/mapgen-studio/studio-preset-export.v1.schema.json",
      version: 1,
      recipeId: "mod-swooper-maps/standard",
      preset: {
        label: "Conflicting Rivers",
        config: {
          "map-rivers": {
            knobs: {
              riverDensity: "sparse",
              navigableRiverDensity: "dense",
            },
          },
        },
      },
    };

    const result = resolveImportedPreset({ presetFile, findRecipeArtifacts });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe("invalid-config");
      expect(result.message).toBe("Conflicting map-rivers river density knobs.");
      expect(result.details?.join("\n")).toContain("/map-rivers/knobs/riverDensity is retired");
    }
  });
});
