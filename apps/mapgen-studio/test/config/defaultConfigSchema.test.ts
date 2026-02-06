import { describe, expect, it } from "vitest";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";

import { STANDARD_RECIPE_CONFIG, STANDARD_RECIPE_CONFIG_SCHEMA } from "mod-swooper-maps/recipes/standard-artifacts";

describe("Studio default config", () => {
  it("validates against the standard recipe schema (prevents UI drift)", () => {
    const { errors } = normalizeStrict<Record<string, unknown>>(STANDARD_RECIPE_CONFIG_SCHEMA, STANDARD_RECIPE_CONFIG, "/defaultConfig");
    expect(errors).toEqual([]);
  });

  it("matches the authored swooper-earthlike posture (prevents accidental skeleton defaults)", () => {
    expect(STANDARD_RECIPE_CONFIG.foundation.version).toBe(1);
    expect(STANDARD_RECIPE_CONFIG.foundation.profiles.resolutionProfile).toBe("balanced");
    expect(STANDARD_RECIPE_CONFIG.foundation.knobs.plateCount).toBe(28);
  });
});
