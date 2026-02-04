import { describe, it } from "vitest";

import { normalizeStrictOrThrow } from "../support/compiler-helpers";
import { STANDARD_RECIPE_CONFIG_SCHEMA } from "../../src/recipes/standard/recipe";
import { realismEarthlikeConfig } from "../../src/maps/presets/realism/earthlike.config";
import { realismYoungTectonicsConfig } from "../../src/maps/presets/realism/young-tectonics.config";
import { realismOldErosionConfig } from "../../src/maps/presets/realism/old-erosion.config";

describe("Standard recipe preset configs", () => {
  it("stay schema-valid (prevents silent drift)", () => {
    normalizeStrictOrThrow(STANDARD_RECIPE_CONFIG_SCHEMA as any, realismEarthlikeConfig, "/presets/earthlike");
    normalizeStrictOrThrow(
      STANDARD_RECIPE_CONFIG_SCHEMA as any,
      realismYoungTectonicsConfig,
      "/presets/young-tectonics"
    );
    normalizeStrictOrThrow(STANDARD_RECIPE_CONFIG_SCHEMA as any, realismOldErosionConfig, "/presets/old-erosion");
  });
});

