import { describe, expect, it } from "bun:test";

import {
  STANDARD_RECIPE_CONFIG,
  STANDARD_RECIPE_CONFIG_SCHEMA,
} from "mod-swooper-maps/recipes/standard-artifacts";

import { deriveStandardRecipeArtifacts } from "../../src/recipes/standard/artifacts";

function stableJson(value: unknown): unknown {
  const text = JSON.stringify(value);
  if (!text) throw new Error("Value is not JSON-serializable");
  return JSON.parse(text) as unknown;
}

describe("standard recipe source artifact guards", () => {
  it("keeps generated standard schema and defaults aligned with source stages", () => {
    const sourceArtifacts = deriveStandardRecipeArtifacts();
    const sourceSchema = stableJson(sourceArtifacts.schema);
    const sourceDefaults = stableJson(sourceArtifacts.defaults);

    expect(sourceSchema).toEqual(STANDARD_RECIPE_CONFIG_SCHEMA);
    expect(sourceDefaults).toEqual(STANDARD_RECIPE_CONFIG);
  });
});
