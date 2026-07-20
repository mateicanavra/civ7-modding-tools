import { describe, expect, it } from "bun:test";

import {
  buildCompleteSchemaDefaults,
  buildSchemaDefaults,
  derivePresetLabel,
  isPresetWrapper,
  RecipePresetDefinitionV1Schema,
  StudioPresetExportFileV1Schema,
} from "@mapgen/authoring/index.js";
import { Type } from "typebox";

function readSchemaTitle(schema: { title?: unknown }): string {
  return typeof schema.title === "string" ? schema.title : "";
}

describe("authoring preset schemas", () => {
  it("derives human-friendly labels", () => {
    expect(derivePresetLabel("earthlike")).toBe("Earthlike");
    expect(derivePresetLabel("young-tectonics")).toBe("Young Tectonics");
    expect(derivePresetLabel("old_erosion")).toBe("Old Erosion");
  });

  it("recognizes valid preset wrappers", () => {
    expect(
      isPresetWrapper({
        id: "earthlike",
        label: "Earthlike",
        description: "Baseline",
        config: { foo: 1 },
      })
    ).toBe(true);
  });

  it("rejects invalid preset wrappers", () => {
    expect(isPresetWrapper({ config: [] })).toBe(false);
    expect(isPresetWrapper({ id: 42, config: {} })).toBe(false);
    expect(isPresetWrapper({ label: true, config: {} })).toBe(false);
    expect(isPresetWrapper({ config: {}, "ecology-features": { knobs: {} } })).toBe(false);
  });

  it("exposes schema metadata", () => {
    expect(readSchemaTitle(RecipePresetDefinitionV1Schema)).toBe("");
    expect(readSchemaTitle(StudioPresetExportFileV1Schema)).toBe("");
  });

  it("materializes schema-level defaults through TypeBox", () => {
    const schema = Type.String({ default: () => "generated" });

    expect(buildSchemaDefaults(schema)).toBe("generated");
  });

  it("does not emit optional object shells for generic defaulting", () => {
    const schema = Type.Object({
      optionalGroup: Type.Optional(
        Type.Object({
          requiredChild: Type.String(),
        })
      ),
    });

    expect(buildSchemaDefaults(schema)).toBeUndefined();
  });

  it("can build complete recipe-style object defaults deliberately", () => {
    const schema = Type.Object({
      emptyGroup: Type.Object({}),
      nestedGroup: Type.Object({
        enabled: Type.Boolean({ default: true }),
      }),
    });

    expect(buildCompleteSchemaDefaults(schema)).toEqual({
      emptyGroup: {},
      nestedGroup: { enabled: true },
    });
  });
});
