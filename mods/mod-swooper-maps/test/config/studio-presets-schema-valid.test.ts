import { describe, expect, it } from "vitest";

import { deriveRecipeConfigSchema, isPresetWrapper, stripSchemaMetadataRoot } from "@swooper/mapgen-core/authoring";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import { STANDARD_STAGES } from "../../src/recipes/standard/recipe";
import earthlikePresetRaw from "../../src/presets/standard/earthlike.json";

describe("Studio built-in preset wrappers", () => {
  it("stay schema-valid (prevents Studio preset drift)", () => {
    const preset: unknown = earthlikePresetRaw;
    expect(isPresetWrapper(preset)).toBe(true);
    if (!isPresetWrapper(preset)) throw new Error("Invalid preset wrapper");

    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const sanitized = stripSchemaMetadataRoot(preset.config);
    const { errors } = normalizeStrict<Record<string, unknown>>(schema, sanitized, "/presets/standard/earthlike");
    expect(errors).toEqual([]);
  });
});
