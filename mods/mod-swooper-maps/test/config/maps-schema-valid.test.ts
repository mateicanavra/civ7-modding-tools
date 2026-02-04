import { describe, it } from "vitest";

import { normalizeStrictOrThrow } from "../support/compiler-helpers";
import { STANDARD_RECIPE_CONFIG_SCHEMA } from "../../src/recipes/standard/recipe";

import { SWOOPER_EARTHLIKE_CONFIG } from "../../src/maps/configs/swooper-earthlike.config";
import { SWOOPER_DESERT_MOUNTAINS_CONFIG } from "../../src/maps/configs/swooper-desert-mountains.config";
import { SHATTERED_RING_CONFIG } from "../../src/maps/configs/shattered-ring.config";
import { SUNDERED_ARCHIPELAGO_CONFIG } from "../../src/maps/configs/sundered-archipelago.config";

describe("Shipped map configs", () => {
  it("stay schema-valid (prevents Civ pipeline compile failures)", () => {
    normalizeStrictOrThrow(STANDARD_RECIPE_CONFIG_SCHEMA as any, SWOOPER_EARTHLIKE_CONFIG, "/maps/swooper-earthlike");
    normalizeStrictOrThrow(
      STANDARD_RECIPE_CONFIG_SCHEMA as any,
      SWOOPER_DESERT_MOUNTAINS_CONFIG,
      "/maps/swooper-desert-mountains"
    );
    normalizeStrictOrThrow(STANDARD_RECIPE_CONFIG_SCHEMA as any, SHATTERED_RING_CONFIG, "/maps/shattered-ring");
    normalizeStrictOrThrow(
      STANDARD_RECIPE_CONFIG_SCHEMA as any,
      SUNDERED_ARCHIPELAGO_CONFIG,
      "/maps/sundered-archipelago"
    );
  });
});

