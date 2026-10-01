import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { Type } from "typebox";
import { describe, expect, it } from "vitest";
import { loadSwooperMapConfigCatalog } from "../../scripts/catalog-source";
import { createSwooperMapConfigSourceStore } from "../../scripts/config-source-store";
import ecology from "../../src/domain/ecology/router.js";
import { admitMapConfigCatalogConfig } from "../../src/maps/catalog/admission";
import { MAP_CONFIG_CATALOG_IDS } from "../../src/maps/catalog/membership";
import {
  admitStandardMapConfig,
  validateCanonicalMapConfig,
} from "../../src/maps/configs/canonical";
import standardRecipe, { STANDARD_STAGES } from "../../src/recipes/standard/recipe";
import { createStandardRecipeTestInitialSetup } from "../recipes/swooper-physics-standard/fixtures/standard-recipe.js";
import { TEST_MAP_SIZE } from "../setup.js";

async function loadSwooperMapConfigRegistry() {
  return loadSwooperMapConfigCatalog();
}

function authoredEnvelope(
  config: Awaited<ReturnType<typeof loadSwooperMapConfigRegistry>>[number]
) {
  return config.canonicalConfig;
}

describe("Shipped map configs", () => {
  it("stay canonical, complete, and catalog-id backed", async () => {
    const configs = await loadSwooperMapConfigRegistry();

    expect(configs).toHaveLength(MAP_CONFIG_CATALOG_IDS.length);

    for (const [index, config] of configs.entries()) {
      expect(config.canonicalConfig.id).toBe(MAP_CONFIG_CATALOG_IDS[index]);
    }
  });

  it("owns authored source writes and exact rollback behind one opaque transaction", async () => {
    const [fixture] = await loadSwooperMapConfigRegistry();
    if (!fixture) throw new Error("Expected a shipped Swooper map config");
    const root = await mkdtemp(join(tmpdir(), "swooper-config-source-"));
    const source = createSwooperMapConfigSourceStore(root);
    const target = join(root, `${fixture.canonicalConfig.id}.config.json`);
    const previous = "{\"preserved\":true}\n";

    try {
      await writeFile(target, previous);
      const write = await source.prepareWrite(fixture.canonicalConfig);
      await write.write();
      expect(JSON.parse(await readFile(target, "utf8"))).toEqual(fixture.canonicalConfig);
      await expect(write.rollback()).resolves.toEqual({ restored: true });
      expect(await readFile(target, "utf8")).toBe(previous);

      const transient = {
        ...structuredClone(fixture.canonicalConfig),
        id: "transient-studio-config",
      };
      const transientWrite = await source.prepareWrite(transient);
      await transientWrite.write();
      const [loadedTransient] = await source.loadCatalog([transient.id]);
      expect(loadedTransient?.canonicalConfig).toEqual(transient);
      await expect(transientWrite.rollback()).resolves.toEqual({ deleted: true });
      await expect(readFile(join(root, "transient-studio-config.config.json"))).rejects.toThrow();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects incomplete and unknown config JSON without backfilling defaults", async () => {
    const [fixture] = await loadSwooperMapConfigRegistry();
    if (!fixture) throw new Error("Expected shipped Swooper map configs");
    const schema = Type.Object(
      { authoredAmount: Type.Number({ default: 3 }) },
      { additionalProperties: false }
    );
    const missingDefaultedValue = {
      ...structuredClone(authoredEnvelope(fixture)),
      config: {},
    };
    expect(() =>
      validateCanonicalMapConfig({
        fileName: `${fixture.canonicalConfig.id}.config.json`,
        raw: missingDefaultedValue,
        recipeSchema: schema,
      })
    ).toThrow("complete recipe config JSON");

    const unknownProperty = {
      ...structuredClone(authoredEnvelope(fixture)),
      config: { authoredAmount: 3, unexpected: true },
    };

    expect(() =>
      validateCanonicalMapConfig({
        fileName: `${fixture.canonicalConfig.id}.config.json`,
        raw: unknownProperty,
        recipeSchema: schema,
      })
    ).toThrow("Unknown key");
  });

  it("admits against the freshly supplied recipe schema into an immutable exact snapshot", async () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
    const freshSchema = Type.Object(
      {
        ...schema.properties,
        "fresh-schema-property": Type.Object({}, { additionalProperties: false }),
      },
      { additionalProperties: false }
    );
    const [fixture] = await loadSwooperMapConfigRegistry();
    if (!fixture) throw new Error("Expected a shipped Swooper map config");
    const raw = structuredClone(fixture.canonicalConfig) as Record<string, unknown>;
    const config = raw.config as Record<string, unknown>;
    config["fresh-schema-property"] = {};
    const submittedJson = JSON.stringify(raw);

    expect(() => admitStandardMapConfig(raw)).toThrow("Unknown key");
    const admitted = admitMapConfigCatalogConfig({
      configId: fixture.canonicalConfig.id,
      canonicalConfig: raw,
      recipeSchema: freshSchema,
    });

    expect(JSON.stringify(admitted.canonicalConfig)).toBe(submittedJson);
    expect(admitted.canonicalConfig).toEqual(raw);
    expect(admitted.canonicalConfig).not.toBe(raw);
    expect(Object.isFrozen(admitted.canonicalConfig)).toBe(true);
    expect(Object.isFrozen(admitted.canonicalConfig.config)).toBe(true);
    raw.name = "Mutated source alias";
    expect(admitted.canonicalConfig.name).not.toBe(raw.name);
  });

  it("rejects a canonical envelope whose id disagrees with its id-derived filename", async () => {
    const [fixture] = await loadSwooperMapConfigRegistry();
    if (!fixture) throw new Error("Expected a shipped Swooper map config");
    expect(() =>
      admitMapConfigCatalogConfig({
        configId: `not-${fixture.canonicalConfig.id}`,
        canonicalConfig: fixture.canonicalConfig,
      })
    ).toThrow("must match file stem");
  });

  it("compiles every shipped config into an executable stage plan", async () => {
    const configs = await loadSwooperMapConfigRegistry();

    for (const config of configs) {
      const canonicalConfig = config.canonicalConfig;
      const compiled = standardRecipe.compileConfig(
        createStandardRecipeTestInitialSetup({
          preset: TEST_MAP_SIZE,
          mapConfig: canonicalConfig,
        }),
        canonicalConfig.config
      );

      expect(Object.keys(compiled).length, canonicalConfig.id).toBeGreaterThan(0);
      const authored = canonicalConfig.config["hydrology-climate-baseline"];
      const baseline = compiled["hydrology-climate-baseline"]["climate-baseline"];
      const thermal = authored["climate-baseline"].computeThermalState;
      expect(authored["climate-baseline"].computeSeasonalSampling).toEqual({
        strategy: "periodic-cycle", config: { phaseCount: 24 },
      });
      expect(authored["climate-baseline"].computeRadiativeForcing).toEqual({
        strategy: "daily-solar-fourier", config: {},
      });
      expect(thermal.strategy).toBe("periodic-response");
      for (const [key, strategy] of [
        ["computeAtmosphericCirculation", "geostrophic-proxy"],
        ["computeOceanSurfaceCurrents", "wind-gyre-projection"],
        ["transportMoisture", "vector-advection"],
        ["computePrecipitation", "vector"],
      ] as const) {
        expect(authored["climate-baseline"][key].strategy).toBe(strategy);
        expect(baseline[key].strategy).toBe(strategy);
      }
      const temperatureOffset = authored.knobs.temperature === "hot" ? 5 : authored.knobs.temperature === "cold" ? -5 : 0;
      expect(baseline.computeThermalState.config).toEqual({
        ...thermal.config, annualOffsetC: thermal.config.annualOffsetC + temperatureOffset,
      });
    }
  });

  it("refuses saved retired climate selectors and controls rather than translating them", async () => {
    const configs = await loadSwooperMapConfigRegistry();
    for (const { canonicalConfig } of configs) {
      const stage = canonicalConfig.config["hydrology-climate-baseline"];
      const baseline = stage["climate-baseline"];
      for (const [key, obsolete] of [
        ["computeSeasonalSampling", { strategy: "legacy-snapshots", config: {} }],
        ["computeRadiativeForcing", { strategy: "latitude-insolation", config: {} }],
        ["computeThermalState", { strategy: "insolation-lapse-rate", config: {} }],
        ["computeAtmosphericCirculation", {
          strategy: "latitude",
          config: { windJetStreaks: 0, windJetStrength: 0, windVariance: 0 },
        }],
        ["computeOceanSurfaceCurrents", { strategy: "latitude", config: { strength: 0 } }],
        ["transportMoisture", {
          strategy: "cardinal", config: { iterations: 0, advection: 0.65, retention: 0.92 },
        }],
        ["computePrecipitation", {
          strategy: "baseline",
          config: {
            rainfallScale: 180, humidityExponent: 1, noiseAmplitude: 0, noiseScale: 0.12,
            waterGradient: { radius: 5, perRingBonus: 4, lowlandBonus: 2, lowlandElevationMax: 150 },
            orographic: { steps: 4, reductionBase: 8, reductionPerStep: 6, barrierElevationM: 500 },
          },
        }],
        ["computeRadiativeForcing", { ...baseline.computeRadiativeForcing, config: { latitudeExponent: 1.2 } }],
        ["computeThermalState", { ...baseline.computeThermalState, config: { ...baseline.computeThermalState.config, landCoolingC: 3.2 } }],
      ] as const) {
        expect(() => admitStandardMapConfig({
          ...canonicalConfig,
          config: { ...canonicalConfig.config, "hydrology-climate-baseline": {
            ...stage, "climate-baseline": { ...baseline, [key]: obsolete },
          } },
        })).toThrow();
      }
    }
  });

  it("retains Earthlike's supported seasonal habitat", async () => {
    const configs = await loadSwooperMapConfigRegistry();
    const earthlike = configs.find(({ canonicalConfig }) => canonicalConfig.id === "swooper-earthlike")!.canonicalConfig;
    const classifier = earthlike.config["ecology-biomes"].biomes.classify.config;
    expect(classifier.aridity.moistureShiftThresholds[0]).toBe(
      ecology.biomes.ops.classifyBiomes.defaultConfig.config.aridity.moistureShiftThresholds[0]
    );
    expect(classifier.aridity.moistureShiftThresholds).toEqual([0.45, 0.66]);
    expect(classifier.temperature.tropicalThreshold).toBe(24);
  });

  it("compiles Earthlike to neutral periodic thermal controls with 24 integration phases and four observations", async () => {
    const configs = await loadSwooperMapConfigRegistry();
    const earthlike = configs.find((entry) => entry.canonicalConfig.id === "swooper-earthlike");
    if (!earthlike) throw new Error("Expected the shipped Earthlike config");
    const canonicalConfig = earthlike.canonicalConfig;
    const compiled = standardRecipe.compileConfig(
      createStandardRecipeTestInitialSetup({ mapConfig: canonicalConfig }),
      canonicalConfig.config
    );
    const baseline = compiled["hydrology-climate-baseline"]["climate-baseline"];
    const refine = compiled["hydrology-climate-refine"]["climate-refine"];
    if (
      baseline.computeThermalState.strategy !== "periodic-response" ||
      baseline.computeRadiativeForcing.strategy !== "daily-solar-fourier" ||
      baseline.computeSeasonalSampling.strategy !== "periodic-cycle" ||
      baseline.computeAtmosphericCirculation.strategy !== "geostrophic-proxy" ||
      baseline.computePrecipitation.strategy !== "vector"
    ) {
      throw new Error("Expected Earthlike's matching periodic thermal, solar, sampling, circulation, and precipitation strategies");
    }

    // Check effective values so a broad knob cannot silently stack on exact authored controls.
    expect({
      seasonality: baseline.seasonality,
      integrationPhaseCount: baseline.computeSeasonalSampling.config.phaseCount,
      solarConfig: baseline.computeRadiativeForcing.config,
      thermalConfig: baseline.computeThermalState.config,
      atmosphericAggregate: baseline.computeAtmosphericAggregate,
      moistureAggregate: baseline.computeMoistureAggregate,
      pressureDrivenRms: baseline.computeAtmosphericCirculation.config.pressureDrivenRms,
      precipitationNoiseAmplitude: baseline.computePrecipitation.config.noiseAmplitude,
    }).toEqual({
      seasonality: { modeCount: 4, axialTiltDeg: 23.44 },
      integrationPhaseCount: 24,
      solarConfig: {},
      thermalConfig: { annualOffsetC: 0, lapseRateCPerElevationUnit: -0.0065, minC: -40, maxC: 50 },
      atmosphericAggregate: { strategy: "phase-reduction", config: {} },
      moistureAggregate: { strategy: "phase-reduction", config: {} },
      pressureDrivenRms: 95,
      precipitationNoiseAmplitude: 14,
    });
    expect(refine).not.toHaveProperty("computeRadiativeForcing");
    expect(refine).not.toHaveProperty("computeThermalState");
  });

  it("compiles all three reef selections with unchanged atoll and planner controls", async () => {
    const configs = await loadSwooperMapConfigRegistry();
    expect(configs).toHaveLength(MAP_CONFIG_CATALOG_IDS.length);
    expect(ecology.features.ops.scoreReefAtoll.defaultConfig).toEqual({
      strategy: "warm-ocean-bank",
      config: {
        tempWarmStartC: 18,
        tempWarmEndC: 30,
        shallowDepthM: 0,
        deepDepthM: 100,
        minDistanceToCoast: 4,
        maxDistanceToCoast: 8,
      },
    });
    const actual: Record<string, unknown> = {};
    for (const { canonicalConfig } of configs) {
      const compiled = standardRecipe.compileConfig(
        createStandardRecipeTestInitialSetup({ preset: TEST_MAP_SIZE, mapConfig: canonicalConfig }),
        canonicalConfig.config
      );
      const authoredAtoll = canonicalConfig.config["ecology-features"]["score-layers"].scoreReefAtoll;
      const atoll = compiled["ecology-features"]["score-layers"].scoreReefAtoll;
      expect(atoll, canonicalConfig.id).toEqual(authoredAtoll);
      expect(atoll.strategy, canonicalConfig.id).toBe("warm-ocean-bank");
      expect(atoll.config, canonicalConfig.id).toMatchObject({
        tempWarmStartC: 18,
        tempWarmEndC: 30,
        shallowDepthM: 0,
        deepDepthM: 100,
        minDistanceToCoast: 4,
      });
      const reef = compiled["ecology-features"]["plan-reefs"].planReefs;
      expect(reef.strategy).toBe("habitat");
      expect(reef.config).not.toHaveProperty("stride");
      actual[canonicalConfig.id] = reef.config;
    }
    expect(actual).toEqual({
      "swooper-earthlike": { minConfidence01: 0.84, minSpacingTiles: 2 },
      "swooper-desert-mountains": { minConfidence01: 0.62, minSpacingTiles: 2 },
      "sundered-archipelago": { minConfidence01: 0.52, minSpacingTiles: 3 },
    });
  });

  it("admits historical ids only as explicitly supplied current-schema user envelopes", async () => {
    const [fixture] = await loadSwooperMapConfigRegistry();
    if (!fixture) throw new Error("Expected the shipped Earthlike config");
    for (const id of [
      "shattered-ring", "mountains-of-time-earthlike", "latest-juicy",
      "mountain-patch", "mountains-of-time-original",
    ]) {
      const submitted = { ...structuredClone(fixture.canonicalConfig), id };
      expect(admitStandardMapConfig(submitted)).toEqual(submitted);
      expect(MAP_CONFIG_CATALOG_IDS).not.toContain(id);
    }
  });

  it("rejects retired reef strategy and stride controls through canonical admission", async () => {
    const configs = await loadSwooperMapConfigRegistry();
    for (const { canonicalConfig } of configs) {
      const stage = canonicalConfig.config["ecology-features"];
      const reef = stage["plan-reefs"].planReefs;
      for (const obsolete of [
        { ...reef, config: { ...reef.config, stride: 2 } },
        { strategy: "habitat", config: { minConfidence01: reef.config.minConfidence01, stride: 2 } },
        { strategy: "diagonal-stride", config: { minConfidence01: reef.config.minConfidence01, stride: 10 } },
      ]) {
        expect(() => admitStandardMapConfig({
          ...canonicalConfig,
          config: {
            ...canonicalConfig.config,
            "ecology-features": { ...stage, "plan-reefs": { planReefs: obsolete } },
          },
        })).toThrow();
      }
    }
  });

  it("bounds reef spacing to integers from one through twelve and provides a complete spacing-one default", async () => {
    const [fixture] = await loadSwooperMapConfigRegistry();
    if (!fixture) throw new Error("Expected a shipped Swooper map config");
    const { canonicalConfig } = fixture;
    const stage = canonicalConfig.config["ecology-features"];
    const reef = stage["plan-reefs"].planReefs;
    for (const minSpacingTiles of [-1, 0, 1.5, 13]) {
      expect(() => admitStandardMapConfig({
        ...canonicalConfig,
        config: {
          ...canonicalConfig.config,
          "ecology-features": {
            ...stage,
            "plan-reefs": { planReefs: { ...reef, config: { ...reef.config, minSpacingTiles } } },
          },
        },
      })).toThrow();
    }
    for (const minSpacingTiles of [1, 12]) {
      const admitted = admitStandardMapConfig({
        ...canonicalConfig,
        config: {
          ...canonicalConfig.config,
          "ecology-features": {
            ...stage,
            "plan-reefs": { planReefs: { ...reef, config: { ...reef.config, minSpacingTiles } } },
          },
        },
      });
      expect(admitted.config["ecology-features"]["plan-reefs"].planReefs.config.minSpacingTiles).toBe(minSpacingTiles);
    }
    const compiled = standardRecipe.compileConfig(
      createStandardRecipeTestInitialSetup({ mapConfig: canonicalConfig }),
      {
        ...canonicalConfig.config,
        "ecology-features": { ...stage, "plan-reefs": { planReefs: ecology.features.ops.planReefs.defaultConfig } },
      }
    );
    expect(compiled["ecology-features"]["plan-reefs"].planReefs).toEqual({
      strategy: "habitat",
      config: { minConfidence01: 0.55, minSpacingTiles: 1 },
    });
  });

  it("rejects retired refinement thermal controls through public admission", async () => {
    const configs = await loadSwooperMapConfigRegistry();
    for (const { canonicalConfig } of configs) {
      const stage = canonicalConfig.config["hydrology-climate-refine"];
      const baseline = canonicalConfig.config["hydrology-climate-baseline"]["climate-baseline"];
      const obsoleteStages = [
        { ...stage, knobs: { ...stage.knobs, temperature: "temperate" } },
        ...["computeRadiativeForcing", "computeThermalState"].map((key) => ({
          ...stage,
          "climate-refine": {
            ...stage["climate-refine"],
            [key]: baseline[key as "computeRadiativeForcing" | "computeThermalState"],
          },
        })),
      ];
      for (const obsolete of obsoleteStages) {
        expect(() => admitStandardMapConfig({
          ...canonicalConfig,
          config: { ...canonicalConfig.config, "hydrology-climate-refine": obsolete },
        })).toThrow("Unknown key");
      }
    }
  });

  it("rejects retired physical-water models and projection selectors across the catalog", async () => {
    const configs = await loadSwooperMapConfigRegistry();
    for (const { canonicalConfig } of configs) {
      const raw = structuredClone(canonicalConfig);
      for (const model of ["legacy-procedural", "authored-network"]) {
        expect(() => admitStandardMapConfig({
          ...raw,
          config: { ...raw.config, "map-rivers": { projection: { model } } },
        })).toThrow("Unknown key");
      }
      const waterStage = raw.config["hydrology-hydrography"];
      expect(() => admitStandardMapConfig({
        ...raw,
        config: { ...raw.config, "hydrology-hydrography": {
          ...waterStage, water: { ...waterStage.water, model: "legacy-sink-budget" },
        } },
      })).toThrow();
    }
  });

  it("rejects obsolete sink-budget controls on certified water", async () => {
    const configs = await loadSwooperMapConfigRegistry();
    const raw = structuredClone(configs.find((entry) => entry.canonicalConfig.id === "swooper-earthlike")!.canonicalConfig);
    const stage = raw.config["hydrology-hydrography"];
    if (!stage || typeof stage !== "object" || !("water" in stage)) throw new Error("Missing water selection");
    const water = stage.water;
    if (!water || typeof water !== "object") throw new Error("Missing certified water");
    expect(() => admitStandardMapConfig({
      ...raw,
      config: { ...raw.config, "hydrology-hydrography": { ...stage, water: { ...water, lakeiness: "many" } } },
    })).toThrow();
  });
});
