import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { describe, it } from "vitest";
import { realismEarthlikeConfig } from "../../src/maps/presets/realism/earthlike.config";
import { realismOldErosionConfig } from "../../src/maps/presets/realism/old-erosion.config";
import { realismYoungTectonicsConfig } from "../../src/maps/presets/realism/young-tectonics.config";
import { STANDARD_STAGES } from "../../src/recipes/standard/recipe";
import { normalizeStrictOrThrow } from "../support/compiler-helpers";

describe("Standard recipe preset configs", () => {
  it("stay schema-valid (prevents silent drift)", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    normalizeStrictOrThrow(schema, realismEarthlikeConfig, "/presets/earthlike");
    normalizeStrictOrThrow(schema, realismYoungTectonicsConfig, "/presets/young-tectonics");
    normalizeStrictOrThrow(schema, realismOldErosionConfig, "/presets/old-erosion");
  });
});
