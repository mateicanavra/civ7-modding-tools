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

const RETIRED_STAGE_PUBLIC_KEYS: Record<string, readonly string[]> = {
  "foundation-mantle": ["meshResolution", "mantleSources", "mantleForcing"],
  "foundation-lithosphere": ["lithosphere", "platePartition"],
  "foundation-tectonics": [
    "plateMotion",
    "tectonicSegmentation",
    "tectonicEras",
    "tectonicFields",
    "tectonicRollups",
  ],
  "hydrology-climate-baseline": [
    "seasonalCycle",
    "solarForcing",
    "thermalState",
    "atmosphericCirculation",
    "oceanCurrents",
    "oceanGeometry",
    "oceanThermalState",
    "evaporation",
    "moistureTransport",
    "precipitation",
  ],
  "hydrology-hydrography": ["drainageRouting", "runoff", "riverNetwork"],
  "hydrology-climate-refine": [
    "precipitationRefinement",
    "albedoFeedback",
    "cryosphereState",
    "landWaterBudget",
    "diagnostics",
  ],
  "ecology-pedology": ["soilClassification", "resourceBasinPlanning", "resourceBasinScoring"],
  "ecology-biomes": ["biomeClassification"],
  "ecology-features": [
    "substrateScoring",
    "wetlandScoring",
    "reefScoring",
    "iceScoring",
    "icePlanning",
    "reefPlanning",
    "wetlandPlanning",
    "floodplainPlanning",
    "vegetationPlanning",
    "plotEffectScoring",
    "plotEffectCoverage",
  ],
  "map-ecology": ["biomeBindings"],
  placement: ["naturalWonders", "resources", "starts", "support"],
};

function retiredStagePublicKeyPaths(config: unknown): string[] {
  if (!config || typeof config !== "object" || Array.isArray(config)) return [];

  const offenders: string[] = [];
  for (const [stageId, retiredKeys] of Object.entries(RETIRED_STAGE_PUBLIC_KEYS)) {
    const stageConfig = (config as Record<string, unknown>)[stageId];
    if (!stageConfig || typeof stageConfig !== "object" || Array.isArray(stageConfig)) continue;
    for (const key of retiredKeys) {
      if (Object.prototype.hasOwnProperty.call(stageConfig, key)) offenders.push(`${stageId}.${key}`);
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

  it("does not preserve retired semantic-public mirror keys in shipped configs", () => {
    for (const [fileName, raw] of mapCatalogConfigs) {
      expect(retiredStagePublicKeyPaths(raw.config), fileName).toEqual([]);
    }
  });

  it("keeps authored Swooper Earthlike values in the current flat destinations", () => {
    const config = swooperEarthlikeConfig.config as any;

    expect(config["foundation-mantle"].mesh.computeMesh.config.plateCount).toBe(28);
    expect(config["foundation-lithosphere"]["plate-graph"].computePlateGraph.config.plateCount).toBe(
      42
    );
    expect(config["foundation-tectonics"]["plate-motion"].computePlateMotion.config.omegaFactor).toBe(
      1
    );
    expect(config["hydrology-climate-baseline"]["climate-baseline"].seasonality).toEqual({
      modeCount: 4,
      axialTiltDeg: 23,
    });
    expect(
      config["hydrology-hydrography"].lakes.planLakes.config.highOrderConfluenceUpstreamAreaMin
    ).toBeUndefined();
    expect(
      config["hydrology-hydrography"].lakes.computeRiverNetworkMetrics.config
        .highOrderConfluenceUpstreamAreaMin
    ).toBe(64);
    expect(config["ecology-pedology"].pedology.classify.strategy).toBe("orogeny-boosted");
    expect(config["ecology-pedology"]["resource-basins"].plan.strategy).toBe("mixed");
    expect(config["map-ecology"]).toEqual({ knobs: {} });
    expect(config.placement["assign-starts"].starts.config.desiredSpacingTiles).toBe(9);
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
    expect(compiled["hydrology-climate-baseline"]["climate-baseline"].computePrecipitation.strategy).toBe(
      "default"
    );
    expect(compiled["hydrology-climate-refine"]["climate-refine"].computePrecipitation.strategy).toBe(
      "refine"
    );
    expect(compiled["ecology-pedology"].pedology.classify.strategy).toBe("orogeny-boosted");
    expect(compiled["ecology-pedology"]["resource-basins"].plan.strategy).toBe("mixed");
    expect(compiled["ecology-features"]["plan-plot-effects"].plotEffects.config.snow).not.toHaveProperty(
      "selectors"
    );
    expect(compiled["ecology-features"]["plan-plot-effects"].plotEffects.config.snow.coveragePct).toBe(
      55
    );
    expect(compiled["map-ecology"]["plot-biomes"]).toEqual({});
    expect(compiled.placement["derive-placement-inputs"].naturalWonders.config.minSpacingTiles).toBe(
      6
    );
    expect(compiled.placement["assign-starts"].starts.config.desiredSpacingTiles).toBe(9);
  });

  it("rejects retired authoring keys and Civ/resource owner leakage", () => {
    expect(
      errorPathsFor(
        {
          "hydrology-climate-baseline": { seasonalCycle: { modeCount: 2 } },
          "map-ecology": { biomeBindings: { marine: "BIOME_DESERT" } },
          placement: {
            resources: { candidateResourceTypes: [1, 2, 3] },
            starts: { overrides: { startSectors: [] } },
          },
        },
        "/maps/retired-shape"
      )
    ).toEqual(
      expect.arrayContaining([
        "/maps/retired-shape/hydrology-climate-baseline/seasonalCycle",
        "/maps/retired-shape/map-ecology/biomeBindings",
        "/maps/retired-shape/placement/resources",
        "/maps/retired-shape/placement/starts",
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
