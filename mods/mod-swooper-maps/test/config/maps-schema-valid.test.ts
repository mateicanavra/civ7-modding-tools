import { describe, it } from "vitest";

import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { normalizeStrictOrThrow } from "../support/compiler-helpers";
import { STANDARD_STAGES } from "../../src/recipes/standard/recipe";

import swooperEarthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";
import { SWOOPER_DESERT_MOUNTAINS_CONFIG } from "../../src/maps/configs/swooper-desert-mountains.config";
import { SHATTERED_RING_CONFIG } from "../../src/maps/configs/shattered-ring.config";
import { SUNDERED_ARCHIPELAGO_CONFIG } from "../../src/maps/configs/sundered-archipelago.config";

function stripSchemaMetadataRoot(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const record = value as Record<string, unknown>;
  const { $schema: _schema, $id: _id, $comment: _comment, ...rest } = record;
  return rest;
}

describe("Shipped map configs", () => {
  it("stay schema-valid (prevents Civ pipeline compile failures)", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES as any);

    normalizeStrictOrThrow(
      schema as any,
      stripSchemaMetadataRoot(swooperEarthlikeConfigRaw) as any,
      "/maps/swooper-earthlike"
    );
    normalizeStrictOrThrow(
      schema as any,
      SWOOPER_DESERT_MOUNTAINS_CONFIG,
      "/maps/swooper-desert-mountains"
    );
    normalizeStrictOrThrow(schema as any, SHATTERED_RING_CONFIG, "/maps/shattered-ring");
    normalizeStrictOrThrow(
      schema as any,
      SUNDERED_ARCHIPELAGO_CONFIG,
      "/maps/sundered-archipelago"
    );
  });
});
