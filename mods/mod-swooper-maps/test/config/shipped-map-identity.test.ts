import { describe, expect, it } from "bun:test";
import {
  type CanonicalMapConfigWithRecipe,
  canonicalRecipeConfig,
} from "../../src/maps/configs/canonical.js";
import shatteredRingRaw from "../../src/maps/configs/shattered-ring.config.json";
import sunderedArchipelagoRaw from "../../src/maps/configs/sundered-archipelago.config.json";
import swooperDesertMountainsRaw from "../../src/maps/configs/swooper-desert-mountains.config.json";
import swooperEarthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";
import standardRecipe from "../../src/recipes/standard/recipe";
import type { StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";

function recipeConfig(config: CanonicalMapConfigWithRecipe): StandardRecipeConfig {
  return canonicalRecipeConfig<StandardRecipeConfig>(config);
}

function hasRawOpEnvelope(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(hasRawOpEnvelope);
  const obj = value as Record<string, unknown>;
  if (
    Object.prototype.hasOwnProperty.call(obj, "strategy") &&
    Object.prototype.hasOwnProperty.call(obj, "config")
  ) {
    return true;
  }
  return Object.values(obj).some(hasRawOpEnvelope);
}

const VEGETATION_THRESHOLDS = [
  "forestMinConfidence01",
  "rainforestMinConfidence01",
  "taigaMinConfidence01",
  "savannaWoodlandMinConfidence01",
  "sagebrushSteppeMinConfidence01",
] as const;

const CASES = [
  { label: "swooper-earthlike", raw: swooperEarthlikeConfigRaw, reefStrategy: "default" },
  { label: "shattered-ring", raw: shatteredRingRaw, reefStrategy: "default" },
  { label: "sundered-archipelago", raw: sunderedArchipelagoRaw, reefStrategy: "shipping-lanes" },
  { label: "desert-mountains", raw: swooperDesertMountainsRaw, reefStrategy: "default" },
] as const;

describe("shipped map config identity", () => {
  it("keeps Swooper Earthlike on the tuned current-schema baseline", () => {
    const earthlike = recipeConfig(swooperEarthlikeConfigRaw) as any;

    expect(swooperEarthlikeConfigRaw.description).toContain("Earth-analogue world");
    expect(swooperEarthlikeConfigRaw.sortIndex).toBe(501);
    expect(earthlike.foundation.knobs.plateActivity).toBe(0.85);
    expect(earthlike.foundation.meshResolution.plateCount).toBe(28);
    expect(earthlike.foundation.platePartition.plateCount).toBe(42);
    expect(earthlike["morphology-coasts"].knobs.shelfWidth).toBe("wide");
    expect(earthlike["morphology-coasts"].shelf).toMatchObject({
      nearshoreDistance: 8,
      shallowQuantile: 0.45,
      capTilesActive: 4,
      capTilesPassive: 10,
      capTilesMax: 14,
    });
    expect(earthlike["morphology-features"].mountainRanges).toMatchObject({
      rangeSystemSpacingTiles: 19.7,
      rangeSystemLengthTiles: 30,
      provinceRadiusTiles: 5,
    });
    expect(earthlike["ecology-pedology"].soilClassification).toMatchObject({
      profile: "orogenyBoosted",
      reliefWeight: 1.18,
      bedrockWeight: 0.82,
    });
    expect(earthlike["ecology-biomes"].biomeClassification.moisture.thresholds).toEqual([
      90, 188, 228, 252,
    ]);
    expect(earthlike["ecology-features"].reefPlanning).toMatchObject({
      minConfidence01: 0.84,
      stride: 4,
    });
    expect(earthlike.placement.resources).toEqual({
      density: 1,
      sparsity: 0,
      rarityFidelity: 1,
      siteSpacingTiles: 3,
    });

    expect(earthlike.placement).not.toHaveProperty("floodplains");
    expect(earthlike["map-rivers"].knobs.navigableRiverDensity).toBe("normal");
    expect(earthlike.foundation.meshResolution).not.toHaveProperty("referenceArea");
    expect(earthlike.foundation.platePartition).not.toHaveProperty("plateScalePower");
  });

  it("keeps Ecology feature authoring semantic while compiled planners preserve tuned identity", () => {
    const env = {
      seed: 123,
      dimensions: { width: 80, height: 60 },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };

    for (const { label, raw, reefStrategy } of CASES) {
      const config = recipeConfig(raw);
      const features = config["ecology-features"];
      expect(features, `${label} ecology-features`).toBeDefined();
      expect(
        hasRawOpEnvelope(features),
        `${label} public ecology-features has no raw envelopes`
      ).toBe(false);
      expect(features, `${label} public ecology-features`).toHaveProperty("vegetationPlanning");
      expect(features, `${label} public ecology-features`).not.toHaveProperty("plan-vegetation");
      expect(features, `${label} public ecology-features`).not.toHaveProperty("plan-wetlands");
      expect(features, `${label} public ecology-features`).not.toHaveProperty("plan-ice");
      expect(features, `${label} public ecology-features`).not.toHaveProperty("plan-reefs");

      const compiled = standardRecipe.compileConfig(env, config) as any;
      const compiledFeatures = compiled["ecology-features"];
      const vegetation = compiledFeatures?.["plan-vegetation"]?.planVegetation;
      expect(vegetation?.strategy, `${label} vegetation strategy`).toBe("default");
      expect(vegetation?.config, `${label} vegetation config`).not.toHaveProperty(
        "minConfidence01"
      );
      for (const key of VEGETATION_THRESHOLDS) {
        const value = vegetation?.config?.[key];
        expect(typeof value, `${label} ${key}`).toBe("number");
        expect(value, `${label} ${key}`).toBeGreaterThanOrEqual(0);
        expect(value, `${label} ${key}`).toBeLessThanOrEqual(0.45);
      }

      expect(
        compiledFeatures?.["plan-wetlands"]?.planWetlands?.strategy,
        `${label} wetlands strategy`
      ).toBe("default");
      expect(compiledFeatures?.["plan-ice"]?.planIce?.strategy, `${label} ice strategy`).toBe(
        "continentality"
      );
      expect(compiledFeatures?.["plan-reefs"]?.planReefs?.strategy, `${label} reef strategy`).toBe(
        reefStrategy
      );
    }
  });
});
