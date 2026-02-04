import { describe, expect, it } from "bun:test";

import {
  RecipePresetDefinitionV1Schema,
  StudioPresetExportFileV1Schema,
  derivePresetLabel,
  isPresetWrapper,
} from "@mapgen/authoring/index.js";

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
  });

  it("exposes schema metadata", () => {
    expect(readSchemaTitle(RecipePresetDefinitionV1Schema)).toBe("");
    expect(readSchemaTitle(StudioPresetExportFileV1Schema)).toBe("");
  });
});
