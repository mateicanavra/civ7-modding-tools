import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { validateStrict } from "@swooper/mapgen-core/compiler/normalize";
import { describe, expect, it } from "vitest";
import { validateCanonicalMapConfig } from "../../src/maps/configs/canonical";
import earthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";
import { STANDARD_STAGES } from "../../src/recipes/standard/recipe";

describe("Studio built-in map configs", () => {
  it("load from canonical shipped map configs instead of duplicate preset wrappers", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const validated = validateCanonicalMapConfig({
      fileName: "swooper-earthlike.config.json",
      raw: earthlikeConfigRaw,
      recipeSchema: schema,
    });
    const { errors } = validateStrict<Record<string, unknown>>(
      schema,
      validated.canonicalConfig.config,
      "/maps/configs/swooper-earthlike"
    );
    expect(errors).toEqual([]);
  });
});
