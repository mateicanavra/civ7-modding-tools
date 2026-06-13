import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import { describe, expect, it } from "vitest";
import {
  type CanonicalMapConfigEnvelope,
  validateCanonicalMapConfig,
} from "../../src/maps/configs/canonical";
import earthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";
import { STANDARD_STAGES } from "../../src/recipes/standard/recipe";

describe("Studio built-in map configs", () => {
  it("load from canonical shipped map configs instead of duplicate preset wrappers", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const validated = validateCanonicalMapConfig({
      fileName: "swooper-earthlike.config.json",
      raw: earthlikeConfigRaw as CanonicalMapConfigEnvelope,
      recipeSchema: schema,
      stages: STANDARD_STAGES,
    });
    const { errors } = normalizeStrict<Record<string, unknown>>(
      schema,
      validated.config,
      "/maps/configs/swooper-earthlike"
    );
    expect(errors).toEqual([]);
  });
});
