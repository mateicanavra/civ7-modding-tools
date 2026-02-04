import { describe, it } from "vitest";

import { deriveRecipeConfigSchema, stripSchemaMetadataRoot } from "@swooper/mapgen-core/authoring";
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
});
