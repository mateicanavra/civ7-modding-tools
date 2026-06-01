import { describe, expect, it } from "vitest";

import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import { STANDARD_STAGES } from "../../src/recipes/standard/recipe";
import {
  validateCanonicalMapConfig,
  type CanonicalMapConfigEnvelope,
} from "../../src/maps/configs/canonical";

import shatteredRingConfig from "../../src/maps/configs/shattered-ring.config.json";
import sunderedArchipelagoConfig from "../../src/maps/configs/sundered-archipelago.config.json";
import swooperDesertMountainsConfig from "../../src/maps/configs/swooper-desert-mountains.config.json";
import swooperEarthlikeConfig from "../../src/maps/configs/swooper-earthlike.config.json";

const shippedMapConfigs = [
  ["shattered-ring.config.json", shatteredRingConfig],
  ["sundered-archipelago.config.json", sunderedArchipelagoConfig],
  ["swooper-desert-mountains.config.json", swooperDesertMountainsConfig],
  ["swooper-earthlike.config.json", swooperEarthlikeConfig],
] as const satisfies readonly (readonly [string, CanonicalMapConfigEnvelope])[];

describe("Shipped map configs", () => {
  it("stay canonical, complete, and schema-valid (prevents Civ pipeline compile failures)", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);

    for (const [fileName, raw] of shippedMapConfigs) {
      const validated = validateCanonicalMapConfig({
        fileName,
        raw,
        recipeSchema: schema,
        stages: STANDARD_STAGES,
      });
      expect(validated.id).toBe(fileName.replace(/\.config\.json$/, ""));
    }
  });

  it("rejects legacy map-morphology alias keys", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const { errors } = normalizeStrict(
      schema,
      {
        "map-morphology": {
          plotCoasts: {},
          plotContinents: {},
          mountains: {},
          volcanoes: {},
          plotVolcanoes: {},
          buildElevation: {},
        },
      },
      "/maps/legacy-map-morphology"
    );

    const errorPaths = errors.map((error) => error.path);
    expect(errorPaths).toEqual(
      expect.arrayContaining([
        "/maps/legacy-map-morphology/map-morphology/plotCoasts",
        "/maps/legacy-map-morphology/map-morphology/plotContinents",
        "/maps/legacy-map-morphology/map-morphology/mountains",
        "/maps/legacy-map-morphology/map-morphology/volcanoes",
        "/maps/legacy-map-morphology/map-morphology/plotVolcanoes",
        "/maps/legacy-map-morphology/map-morphology/buildElevation",
      ])
    );
  });

  it("rejects retired map-hydrology river config", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const { errors } = normalizeStrict(
      schema,
      {
        "map-hydrology": {
          knobs: { riverDensity: "dense" },
          "plot-rivers": { minLength: 5 },
        },
      },
      "/maps/legacy-map-hydrology-rivers"
    );

    const errorPaths = errors.map((error) => error.path);
    expect(errorPaths).toEqual(
      expect.arrayContaining([
        "/maps/legacy-map-hydrology-rivers/map-hydrology/knobs/riverDensity",
        "/maps/legacy-map-hydrology-rivers/map-hydrology/plot-rivers",
      ])
    );
  });

  it("rejects morphology truth config under map projection stages", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const { errors } = normalizeStrict(
      schema,
      {
        "map-morphology": {
          knobs: { orogeny: "high" },
          "plot-mountains": {
            ridges: { strategy: "default" },
          },
        },
      },
      "/maps/map-projection-truth-config"
    );

    const errorPaths = errors.map((error) => error.path);
    expect(errorPaths).toEqual(
      expect.arrayContaining([
        "/maps/map-projection-truth-config/map-morphology/knobs/orogeny",
        "/maps/map-projection-truth-config/map-morphology/plot-mountains/ridges",
      ])
    );
  });
});
