import { describe, expect, it } from "vitest";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";

import { STANDARD_RECIPE_CONFIG_SCHEMA } from "mod-swooper-maps/recipes/standard-artifacts";
import { SWOOPER_EARTHLIKE_DEFAULT_CONFIG } from "../../src/recipes/defaultConfigs/swooperEarthlike";

describe("Studio default config", () => {
  it("validates against the standard recipe schema (prevents UI drift)", () => {
    const { errors } = normalizeStrict<Record<string, unknown>>(
      STANDARD_RECIPE_CONFIG_SCHEMA as any,
      SWOOPER_EARTHLIKE_DEFAULT_CONFIG as any,
      "/defaultConfig"
    );
    expect(errors).toEqual([]);
  });
});

