import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { describe, expect, it } from "vitest";
import {
  type CanonicalMapConfigEnvelope,
} from "../../src/maps/configs/canonical";
import { loadSwooperMapConfigRegistry } from "../../scripts/generate-map-artifacts";
import mountainPatchConfig from "../../src/maps/configs/mountain-patch.config.json";
import mountainRiversPatchConfig from "../../src/maps/configs/mountain-rivers-patch.config.json";
import swooperEarthlikeConfig from "../../src/maps/configs/swooper-earthlike.config.json";
import standardRecipe, { STANDARD_STAGES } from "../../src/recipes/standard/recipe";

describe("Shipped map configs", () => {
  it("stay canonical, complete, schema-valid, and catalog-index backed", async () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const configs = await loadSwooperMapConfigRegistry();

    expect(configs.map((config) => config.id).sort()).toEqual([
      "latest-juicy",
      "mountain-patch",
      "mountain-rivers-patch",
      "mountains-of-time-earthlike",
      "mountains-of-time-original",
      "shattered-ring",
      "sundered-archipelago",
      "swooper-desert-mountains",
      "swooper-earthlike",
    ]);
    expect(configs.every((config) => config.recipe === "standard")).toBe(true);
    expect(schema).toHaveProperty("properties");
  });

  it("keeps mountain-rivers-patch as a visible-river projection comparison config", () => {
    const normalizeComparison = (raw: CanonicalMapConfigEnvelope) => {
      const copy = JSON.parse(JSON.stringify(raw)) as Record<string, any>;
      delete copy.id;
      delete copy.name;
      delete copy.description;
      delete copy.sortIndex;
      delete copy.config?.["map-rivers"]?.knobs?.riverDensity;
      delete copy.config?.["map-rivers"]?.knobs?.navigableRiverDensity;
      return copy;
    };

    expect(mountainPatchConfig.id).toBe("mountain-patch");
    expect(mountainRiversPatchConfig.id).toBe("mountain-rivers-patch");
    expect((mountainPatchConfig.config as any)["map-rivers"].knobs.riverDensity).toBeUndefined();
    expect((mountainPatchConfig.config as any)["map-rivers"].knobs.navigableRiverDensity).toBe(
      "normal"
    );
    expect(
      (mountainRiversPatchConfig.config as any)["map-rivers"].knobs.riverDensity
    ).toBeUndefined();
    expect(
      (mountainRiversPatchConfig.config as any)["map-rivers"].knobs.navigableRiverDensity
    ).toBe("normal");
    expect(normalizeComparison(mountainRiversPatchConfig)).toEqual(
      normalizeComparison(mountainPatchConfig)
    );
  });

  it("keeps authored Swooper Earthlike values in the current semantic public destinations", () => {
    const config = swooperEarthlikeConfig.config as any;

    expect(config["foundation-mantle"].meshResolution.plateCount).toBe(28);
    expect(config["foundation-lithosphere"].platePartition.plateCount).toBe(42);
    expect(config["foundation-tectonics"].plateMotion.omegaFactor).toBe(1);
    expect(config["hydrology-climate-baseline"].seasonalCycle).toEqual({
      modeCount: 4,
      axialTiltDeg: 23,
    });
    expect(
      config["hydrology-hydrography"].lakes.highOrderConfluenceUpstreamAreaMin
    ).toBeUndefined();
    expect(config["hydrology-hydrography"].riverNetwork.minorPercentile).toBe(0.74);
    expect(config["ecology-pedology"].soilClassification.profile).toBe("orogenyBoosted");
    expect(config["ecology-pedology"].resourceBasinPlanning.profile).toBe("mixed");
    expect(config["map-ecology"].biomeBindings.marine).toBe("BIOME_MARINE");
    expect(config.placement.starts.desiredSpacingTiles).toBe(9);
  });

  it("compiles the current Swooper Earthlike config into executable stage plans", () => {
    const compiled = standardRecipe.compileConfig(
      {
        seed: 123,
        dimensions: { width: 80, height: 60 },
        latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      },
      swooperEarthlikeConfig.config
    ) as any;

    expect(compiled["foundation-mantle"].mesh.computeMesh.strategy).toBe("default");
    expect(
      compiled["hydrology-climate-baseline"]["climate-baseline"].computePrecipitation.strategy
    ).toBe("default");
    expect(
      compiled["hydrology-climate-refine"]["climate-refine"].computePrecipitation.strategy
    ).toBe("refine");
    expect(compiled["ecology-pedology"].pedology.classify.strategy).toBe("orogeny-boosted");
    expect(compiled["ecology-pedology"]["resource-basins"].plan.strategy).toBe("mixed");
    expect(
      compiled["ecology-features"]["plan-plot-effects"].plotEffects.config.snow
    ).not.toHaveProperty("selectors");
    expect(
      compiled["ecology-features"]["plan-plot-effects"].plotEffects.config.snow.coveragePct
    ).toBe(55);
    expect(compiled["map-ecology"]["plot-biomes"].bindings.marine).toBe("BIOME_MARINE");
    expect(
      compiled.placement["derive-placement-inputs"].naturalWonders.config.minSpacingTiles
    ).toBe(6);
    expect(compiled.placement["assign-starts"].starts.config.desiredSpacingTiles).toBe(9);
  });

});
