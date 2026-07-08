import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import { describe, expect, it } from "vitest";
import {
  type CanonicalMapConfigEnvelope,
  validateCanonicalMapConfig,
} from "../../src/maps/configs/canonical";
import mountainPatchConfig from "../../src/maps/configs/mountain-patch.config.json";
import mountainRiversPatchConfig from "../../src/maps/configs/mountain-rivers-patch.config.json";
import shatteredRingConfig from "../../src/maps/configs/shattered-ring.config.json";
import sunderedArchipelagoConfig from "../../src/maps/configs/sundered-archipelago.config.json";
import swooperDesertMountainsConfig from "../../src/maps/configs/swooper-desert-mountains.config.json";
import swooperEarthlikeConfig from "../../src/maps/configs/swooper-earthlike.config.json";
import standardRecipe, { STANDARD_STAGES } from "../../src/recipes/standard/recipe";

const shippedMapConfigs = [
  ["shattered-ring.config.json", shatteredRingConfig],
  ["sundered-archipelago.config.json", sunderedArchipelagoConfig],
  ["swooper-desert-mountains.config.json", swooperDesertMountainsConfig],
  ["swooper-earthlike.config.json", swooperEarthlikeConfig],
] as const satisfies readonly (readonly [string, CanonicalMapConfigEnvelope])[];

const mapCatalogConfigs = [
  ...shippedMapConfigs,
  ["mountain-patch.config.json", mountainPatchConfig],
  ["mountain-rivers-patch.config.json", mountainRiversPatchConfig],
] as const satisfies readonly (readonly [string, CanonicalMapConfigEnvelope])[];

const RETIRED_RAW_STAGE_KEYS: Record<string, readonly string[]> = {
  "foundation-mantle": ["mesh"],
  "foundation-lithosphere": ["plate-graph"],
  "foundation-tectonics": ["plate-motion", "tectonics"],
  "foundation-orogeny": ["crust-evolution"],
  "hydrology-climate-baseline": ["climate-baseline"],
  "hydrology-hydrography": ["rivers"],
  "hydrology-climate-refine": ["climate-refine"],
  "ecology-pedology": ["pedology", "resource-basins"],
  "ecology-biomes": ["biomes"],
  "ecology-features": [
    "score-layers",
    "plan-vegetation",
    "plan-wetlands",
    "plan-reefs",
    "plan-ice",
    "plan-floodplains",
    "plan-plot-effects",
  ],
  "map-ecology": ["plot-biomes", "features-apply", "plot-effects"],
  placement: ["plan-resources", "assign-starts", "place-resources"],
};

function retiredStagePublicKeyPaths(config: unknown): string[] {
  if (!config || typeof config !== "object" || Array.isArray(config)) return [];

  const offenders: string[] = [];
  for (const [stageId, retiredKeys] of Object.entries(RETIRED_RAW_STAGE_KEYS)) {
    const stageConfig = (config as Record<string, unknown>)[stageId];
    if (!stageConfig || typeof stageConfig !== "object" || Array.isArray(stageConfig)) continue;
    for (const key of retiredKeys) {
      if (Object.prototype.hasOwnProperty.call(stageConfig, key))
        offenders.push(`${stageId}.${key}`);
    }
  }
  return offenders;
}

function errorPathsFor(value: unknown, path: string): string[] {
  const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
  return normalizeStrict(schema, value, path).errors.map((error) => error.path);
}

describe("Shipped map configs", () => {
  it("stay canonical, complete, and schema-valid", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);

    for (const [fileName, raw] of shippedMapConfigs) {
      const validated = validateCanonicalMapConfig({
        fileName,
        raw,
        recipeSchema: schema,
        stages: STANDARD_STAGES,
      });
      expect(validated.id).toBe(fileName.replace(/\.config\.json$/, ""));
    }
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

  it("does not preserve raw internal step keys in shipped configs", () => {
    for (const [fileName, raw] of mapCatalogConfigs) {
      expect(retiredStagePublicKeyPaths(raw.config), fileName).toEqual([]);
    }
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

  it("rejects retired raw step keys and Civ/resource owner leakage", () => {
    expect(
      errorPathsFor(
        {
          "hydrology-climate-baseline": { "climate-baseline": { seasonality: { modeCount: 2 } } },
          "foundation-orogeny": {
            "crust-evolution": {
              computeCrustEvolution: { strategy: "default", config: {} },
            },
          },
          "map-ecology": { "plot-biomes": { bindings: { marine: "BIOME_DESERT" } } },
          placement: {
            resources: { candidateResourceTypes: [1, 2, 3] },
            starts: { overrides: { startSectors: [] } },
          },
        },
        "/maps/retired-shape"
      )
    ).toEqual(
      expect.arrayContaining([
        "/maps/retired-shape/hydrology-climate-baseline/climate-baseline",
        "/maps/retired-shape/foundation-orogeny/crust-evolution",
        "/maps/retired-shape/map-ecology/plot-biomes",
        "/maps/retired-shape/placement/resources/candidateResourceTypes",
        "/maps/retired-shape/placement/starts/overrides",
      ])
    );
  });

  it("rejects retired map-rivers and morphology projection aliases", () => {
    expect(
      errorPathsFor(
        {
          "map-rivers": { knobs: { riverDensity: "dense" } },
          "map-hydrology": { knobs: { riverDensity: "dense" }, "plot-rivers": {} },
          "map-morphology": { plotCoasts: {}, buildElevation: {} },
        },
        "/maps/retired-aliases"
      )
    ).toEqual(
      expect.arrayContaining([
        "/maps/retired-aliases/map-rivers/knobs/riverDensity",
        "/maps/retired-aliases/map-hydrology/knobs/riverDensity",
        "/maps/retired-aliases/map-hydrology/plot-rivers",
        "/maps/retired-aliases/map-morphology/plotCoasts",
        "/maps/retired-aliases/map-morphology/buildElevation",
      ])
    );
  });
});
