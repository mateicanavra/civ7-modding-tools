import { describe, expect, it } from "bun:test";

import swooperEarthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";
import shatteredRingRaw from "../../src/maps/configs/shattered-ring.config.json";
import sunderedArchipelagoRaw from "../../src/maps/configs/sundered-archipelago.config.json";
import swooperDesertMountainsRaw from "../../src/maps/configs/swooper-desert-mountains.config.json";
import { canonicalRecipeConfig, type CanonicalMapConfigWithRecipe } from "../../src/maps/configs/canonical.js";
import type { StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";

function recipeConfig(config: CanonicalMapConfigWithRecipe): StandardRecipeConfig {
  return canonicalRecipeConfig<StandardRecipeConfig>(config);
}

const VEGETATION_THRESHOLDS = [
  "forestMinConfidence01",
  "rainforestMinConfidence01",
  "taigaMinConfidence01",
  "savannaWoodlandMinConfidence01",
  "sagebrushSteppeMinConfidence01",
] as const;

const CASES = [
  { label: "swooper-earthlike", config: recipeConfig(swooperEarthlikeConfigRaw) },
  { label: "shattered-ring", config: recipeConfig(shatteredRingRaw) },
  { label: "sundered-archipelago", config: recipeConfig(sunderedArchipelagoRaw) },
  { label: "desert-mountains", config: recipeConfig(swooperDesertMountainsRaw) },
] as const;

describe("shipped map config identity", () => {
  it("uses current feature-family planner strategies and explicit vegetation thresholds", () => {
    for (const { label, config } of CASES) {
      const features = config["ecology-features"];
      expect(features, `${label} ecology-features`).toBeDefined();
      const vegetation = features?.["plan-vegetation"]?.planVegetation;
      expect(vegetation?.strategy, `${label} vegetation strategy`).toBe("default");
      expect(vegetation?.config, `${label} vegetation config`).not.toHaveProperty("minConfidence01");
      for (const key of VEGETATION_THRESHOLDS) {
        const value = vegetation?.config?.[key];
        expect(typeof value, `${label} ${key}`).toBe("number");
        expect(value, `${label} ${key}`).toBeGreaterThanOrEqual(0);
        expect(value, `${label} ${key}`).toBeLessThanOrEqual(0.45);
      }

      expect(features?.["plan-wetlands"]?.planWetlands?.strategy, `${label} wetlands strategy`).toBe(
        "default"
      );
      expect(features?.["plan-ice"]?.planIce?.strategy, `${label} ice strategy`).toBe(
        "continentality"
      );
      expect(
        ["default", "shipping-lanes"].includes(features?.["plan-reefs"]?.planReefs?.strategy ?? ""),
        `${label} reef strategy`
      ).toBe(true);
    }
  });
});
