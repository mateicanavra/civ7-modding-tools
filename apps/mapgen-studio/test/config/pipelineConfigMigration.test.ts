import type { StudioPresetExportFileV1 } from "@swooper/mapgen-core/authoring";
import { describe, expect, it } from "vitest";
import {
  migratePipelineConfigUnknown,
  PipelineConfigMigrationError,
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

  it("drops retired placement.discoveries while preserving sibling placement keys", () => {
    const input = {
      placement: {
        knobs: {},
        naturalWonders: { minSpacingTiles: 6 },
        discoveries: { densityPer100Tiles: 3, minSpacingTiles: 3 },
        resources: { density: 1 },
        starts: { fertilityWeight: 3 },
      },
    };

    const migrated = migratePipelineConfigUnknown(input) as any;

    expect(migrated.placement).toEqual({
      knobs: {},
      naturalWonders: { minSpacingTiles: 6 },
      resources: { density: 1 },
      starts: { fertilityWeight: 3 },
    });
    expect("discoveries" in migrated.placement).toBe(false);
    // input is cloned, not mutated in place
    expect("discoveries" in input.placement).toBe(true);
  });

  it("leaves placement untouched when it carries no retired discoveries block", () => {
    const migrated = migratePipelineConfigUnknown({
      placement: { resources: { density: 1 }, starts: { fertilityWeight: 3 } },
    }) as any;

    expect(migrated.placement).toEqual({
      resources: { density: 1 },
      starts: { fertilityWeight: 3 },
    });
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
