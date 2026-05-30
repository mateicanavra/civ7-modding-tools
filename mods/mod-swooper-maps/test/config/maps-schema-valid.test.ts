import { describe, expect, it } from "vitest";

import { deriveRecipeConfigSchema, stripSchemaMetadataRoot } from "@swooper/mapgen-core/authoring";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import { normalizeStrictOrThrow } from "../support/compiler-helpers";
import { STANDARD_STAGES } from "../../src/recipes/standard/recipe";

import swooperEarthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";
import { SWOOPER_DESERT_MOUNTAINS_CONFIG } from "../../src/maps/configs/swooper-desert-mountains.config";
import { SHATTERED_RING_CONFIG } from "../../src/maps/configs/shattered-ring.config";
import { SUNDERED_ARCHIPELAGO_CONFIG } from "../../src/maps/configs/sundered-archipelago.config";

describe("Shipped map configs", () => {
  it("stay schema-valid (prevents Civ pipeline compile failures)", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);

    normalizeStrictOrThrow(
      schema,
      stripSchemaMetadataRoot(swooperEarthlikeConfigRaw),
      "/maps/swooper-earthlike"
    );
    normalizeStrictOrThrow(
      schema,
      SWOOPER_DESERT_MOUNTAINS_CONFIG,
      "/maps/swooper-desert-mountains"
    );
    normalizeStrictOrThrow(schema, SHATTERED_RING_CONFIG, "/maps/shattered-ring");
    normalizeStrictOrThrow(
      schema,
      SUNDERED_ARCHIPELAGO_CONFIG,
      "/maps/sundered-archipelago"
    );
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
