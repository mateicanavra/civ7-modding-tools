import { describe, expect, it } from "bun:test";
import { BIOME_SYMBOL_TO_INDEX } from "@mapgen/domain/ecology";
import ecology from "@mapgen/domain/ecology/ops";

import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";

describe("ecology op contract surfaces", () => {
  it("classifyPedology validates output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.classifyPedology, {
      strategy: "default",
      config: {},
    });
    const result = ecology.ops.classifyPedology.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array(size).fill(100),
        rainfall: new Uint8Array(size).fill(180),
        humidity: new Uint8Array(size).fill(150),
      },
      selection
    );
    expect(result.soilType.length).toBe(size);
    expect(result.fertility.length).toBe(size);
  });

  it("classifyPedology coastal shelf strategy validates output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.classifyPedology, {
      strategy: "coastal-shelf",
      config: {},
    });
    const result = ecology.ops.classifyPedology.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array(size).fill(5),
        rainfall: new Uint8Array(size).fill(200),
        humidity: new Uint8Array(size).fill(180),
      },
      selection
    );
    expect(result.soilType.length).toBe(size);
  });

  it("classifyPedology orogeny strategy validates output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.classifyPedology, {
      strategy: "orogeny-boosted",
      config: {},
    });
    const result = ecology.ops.classifyPedology.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array(size).fill(1800),
        rainfall: new Uint8Array(size).fill(80),
        humidity: new Uint8Array(size).fill(50),
      },
      selection
    );
    expect(result.soilType.length).toBe(size);
  });

  it("planResourceBasins validates output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.planResourceBasins, {
      strategy: "default",
      config: {
        resources: [
          { id: "RESOURCE_IRON", target: 2, fertilityBias: 1, moistureBias: 1, spacing: 1 },
        ],
      },
    });
    const result = ecology.ops.planResourceBasins.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        fertility: new Float32Array(size).fill(0.8),
        soilType: new Uint8Array(size).fill(2),
        rainfall: new Uint8Array(size).fill(160),
        humidity: new Uint8Array(size).fill(120),
      },
      selection
    );
    expect(result.basins.length).toBe(1);
    expect(result.basins[0]?.resourceId).toBe("RESOURCE_IRON");
  });

  it("planResourceBasins hydro strategy validates output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.planResourceBasins, {
      strategy: "hydro-fluvial",
      config: {
        resources: [
          { id: "RESOURCE_OIL", target: 3, fertilityBias: 0.8, moistureBias: 1.5, spacing: 2 },
        ],
      },
    });
    const result = ecology.ops.planResourceBasins.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        fertility: new Float32Array(size).fill(0.4),
        soilType: new Uint8Array(size).fill(1),
        rainfall: new Uint8Array(size).fill(220),
        humidity: new Uint8Array(size).fill(200),
      },
      selection
    );
    expect(result.basins.length).toBe(1);
  });

  it("refineBiomeEdges validates output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const result = ecology.ops.refineBiomeEdges.run(
      {
        width,
        height,
        biomeIndex: new Uint8Array(size).fill(1),
        landMask: new Uint8Array(size).fill(1),
      },
      ecology.ops.refineBiomeEdges.defaultConfig
    );
    expect(result.biomeIndex.length).toBe(size);
  });

  it("refineBiomeEdges gaussian strategy validates output", () => {
    const width = 3;
    const height = 3;
    const size = width * height;
    const result = ecology.ops.refineBiomeEdges.run(
      {
        width,
        height,
        biomeIndex: new Uint8Array(size).fill(1),
        landMask: new Uint8Array(size).fill(1),
      },
      { strategy: "gaussian", config: { radius: 1, iterations: 1 } }
    );
    expect(result.biomeIndex.length).toBe(size);
  });

  it("computeFeatureSubstrate validates output", () => {
    const width = 3;
    const height = 3;
    const size = width * height;

    const selection = normalizeOpSelectionOrThrow(ecology.ops.computeFeatureSubstrate, {
      strategy: "default",
      config: {},
    });

    const result = ecology.ops.computeFeatureSubstrate.run(
      {
        width,
        height,
        riverClass: new Uint8Array(size),
        landMask: new Uint8Array(size).fill(1),
      },
      selection
    );

    expect(result.navigableRiverMask.length).toBe(size);
    expect(result.nearRiverMask.length).toBe(size);
    expect(result.isolatedRiverMask.length).toBe(size);
    expect(result.coastalLandMask.length).toBe(size);
  });

  it("classifyBiomes validates output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.classifyBiomes, {
      strategy: "default",
      config: { riparian: {} },
    });

    const result = ecology.ops.classifyBiomes.run(
      {
        width,
        height,
        rainfall: new Uint8Array(size).fill(160),
        humidity: new Uint8Array(size).fill(120),
        elevation: new Int16Array(size).fill(400),
        latitude: new Float32Array(size).fill(20),
        landMask: new Uint8Array(size).fill(1),
        riverClass: new Uint8Array(size).fill(0),
      },
      selection
    );

    expect(result.biomeIndex.length).toBe(size);
    expect(result.vegetationDensity.length).toBe(size);
  });

  it("computeVegetationSubstrate validates output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.computeVegetationSubstrate, {
      strategy: "default",
      config: {},
    });

    const result = ecology.ops.computeVegetationSubstrate.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        effectiveMoisture: new Float32Array(size).fill(180),
        surfaceTemperature: new Float32Array(size).fill(15),
        aridityIndex: new Float32Array(size).fill(0.2),
        freezeIndex: new Float32Array(size).fill(0.05),
        vegetationDensity: new Float32Array(size).fill(0.7),
        fertility: new Float32Array(size).fill(0.4),
      },
      selection
    );

    expect(result.energy01.length).toBe(size);
    expect(result.water01.length).toBe(size);
    expect(result.waterStress01.length).toBe(size);
    expect(result.coldStress01.length).toBe(size);
    expect(result.biomass01.length).toBe(size);
    expect(result.fertility01.length).toBe(size);
  });

  it("vegetation score ops validate output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;

    const substrateSelection = normalizeOpSelectionOrThrow(ecology.ops.computeVegetationSubstrate, {
      strategy: "default",
      config: {},
    });

    const substrate = ecology.ops.computeVegetationSubstrate.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        effectiveMoisture: new Float32Array(size).fill(180),
        surfaceTemperature: new Float32Array(size).fill(15),
        aridityIndex: new Float32Array(size).fill(0.2),
        freezeIndex: new Float32Array(size).fill(0.05),
        vegetationDensity: new Float32Array(size).fill(0.7),
        fertility: new Float32Array(size).fill(0.4),
      },
      substrateSelection
    );

    const scoreOps = [
      ecology.ops.scoreVegetationForest,
      ecology.ops.scoreVegetationRainforest,
      ecology.ops.scoreVegetationTaiga,
      ecology.ops.scoreVegetationSavannaWoodland,
      ecology.ops.scoreVegetationSagebrushSteppe,
    ] as const;

    for (const op of scoreOps) {
      const selection = normalizeOpSelectionOrThrow(op, { strategy: "default", config: {} });
      const result = op.run({ width, height, landMask: new Uint8Array(size).fill(1), ...substrate }, selection);
      expect(result.score01.length).toBe(size);
      for (let i = 0; i < size; i++) {
        const score = result.score01[i];
        expect(Number.isFinite(score)).toBe(true);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      }
    }
  });

  it("wet/reef/ice score ops validate output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;

    const expectScore01 = (score01: Float32Array) => {
      expect(score01.length).toBe(size);
      for (let i = 0; i < size; i++) {
        const score = score01[i];
        expect(Number.isFinite(score)).toBe(true);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      }
    };

    {
      const landMask = new Uint8Array(size).fill(1);
      const nearRiverMask = new Uint8Array(size).fill(1);
      const isolatedRiverMask = new Uint8Array(size).fill(1);
      const coastalLandMask = new Uint8Array(size).fill(1);
      const water01 = new Float32Array(size).fill(0.7);
      const fertility01 = new Float32Array(size).fill(0.4);
      const surfaceTemperature = new Float32Array(size).fill(18);
      const aridityIndex = new Float32Array(size).fill(0.5);
      const freezeIndex = new Float32Array(size).fill(0.6);

      const wetScoreOps = [
        {
          op: ecology.ops.scoreWetMarsh,
          input: {
            width,
            height,
            landMask,
            nearRiverMask,
            water01,
            fertility01,
            surfaceTemperature,
            aridityIndex,
          },
        },
        {
          op: ecology.ops.scoreWetTundraBog,
          input: {
            width,
            height,
            landMask,
            nearRiverMask,
            water01,
            fertility01,
            surfaceTemperature,
            freezeIndex,
          },
        },
        {
          op: ecology.ops.scoreWetMangrove,
          input: {
            width,
            height,
            landMask,
            coastalLandMask,
            water01,
            fertility01,
            surfaceTemperature,
            aridityIndex,
          },
        },
        {
          op: ecology.ops.scoreWetOasis,
          input: { width, height, landMask, isolatedRiverMask, water01, aridityIndex, surfaceTemperature },
        },
        {
          op: ecology.ops.scoreWetWateringHole,
          input: {
            width,
            height,
            landMask,
            isolatedRiverMask,
            water01,
            fertility01,
            aridityIndex,
            surfaceTemperature,
          },
        },
      ] as const;

      for (const { op, input } of wetScoreOps) {
        const selection = normalizeOpSelectionOrThrow(op, { strategy: "default", config: {} });
        const result = op.run(input, selection);
        expectScore01(result.score01);
      }
    }

    {
      const landMask = new Uint8Array(size).fill(0);
      const surfaceTemperatureWarm = new Float32Array(size).fill(24);
      const surfaceTemperatureCold = new Float32Array(size).fill(12);
      const bathymetry = new Int16Array(size).fill(-120);

      const reefScoreOps = [
        {
          op: ecology.ops.scoreReef,
          input: { width, height, landMask, surfaceTemperature: surfaceTemperatureWarm, bathymetry },
        },
        {
          op: ecology.ops.scoreColdReef,
          input: { width, height, landMask, surfaceTemperature: surfaceTemperatureCold, bathymetry },
        },
        {
          op: ecology.ops.scoreReefAtoll,
          input: { width, height, landMask, surfaceTemperature: surfaceTemperatureWarm, bathymetry },
        },
        {
          op: ecology.ops.scoreReefLotus,
          input: { width, height, landMask, surfaceTemperature: surfaceTemperatureWarm, bathymetry },
        },
      ] as const;

      for (const { op, input } of reefScoreOps) {
        const selection = normalizeOpSelectionOrThrow(op, { strategy: "default", config: {} });
        const result = op.run(input, selection);
        expectScore01(result.score01);
      }
    }

    {
      const landMask = new Uint8Array(size).fill(1);
      const surfaceTemperature = new Float32Array(size).fill(-8);
      const elevation = new Int16Array(size).fill(3000);
      const freezeIndex = new Float32Array(size).fill(0.8);
      const selection = normalizeOpSelectionOrThrow(ecology.ops.scoreIce, { strategy: "default", config: {} });
      const result = ecology.ops.scoreIce.run(
        { width, height, landMask, surfaceTemperature, elevation, freezeIndex },
        selection
      );
      expectScore01(result.score01);
    }
  });

  it("planWetlands validates output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.planWetlands, {
      strategy: "default",
      config: { minScore01: 0.55 },
    });
    const result = ecology.ops.planWetlands.run(
      {
        width,
        height,
        seed: 1337,
        scoreMarsh01: new Float32Array(size).fill(1),
        scoreTundraBog01: new Float32Array(size).fill(1),
        scoreMangrove01: new Float32Array(size).fill(1),
        scoreOasis01: new Float32Array(size).fill(1),
        scoreWateringHole01: new Float32Array(size).fill(1),
        featureIndex: new Uint16Array(size),
        reserved: new Uint8Array(size),
      },
      selection
    );
    expect(result.placements.length).toBeGreaterThan(0);
  });

  it("planVegetation validates output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.planVegetation, {
      strategy: "default",
      config: { minScore01: 0.15 },
    });
    const result = ecology.ops.planVegetation.run(
      {
        width,
        height,
        seed: 1337,
        scoreForest01: new Float32Array(size).fill(1),
        scoreRainforest01: new Float32Array(size).fill(1),
        scoreTaiga01: new Float32Array(size).fill(1),
        scoreSavannaWoodland01: new Float32Array(size).fill(1),
        scoreSagebrushSteppe01: new Float32Array(size).fill(1),
        landMask: new Uint8Array(size).fill(1),
        featureIndex: new Uint16Array(size),
        reserved: new Uint8Array(size),
      },
      selection
    );
    expect(result.placements.length).toBeGreaterThan(0);
  });

  it("planReefs validates output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.planReefs, {
      strategy: "default",
      config: {},
    });
    const result = ecology.ops.planReefs.run(
      {
        width,
        height,
        seed: 1337,
        scoreReef01: new Float32Array(size).fill(1),
        scoreColdReef01: new Float32Array(size).fill(1),
        scoreAtoll01: new Float32Array(size).fill(1),
        scoreLotus01: new Float32Array(size).fill(1),
        featureIndex: new Uint16Array(size),
        reserved: new Uint8Array(size),
      },
      selection
    );
    expect(result.placements.length).toBeGreaterThan(0);
  });

  it("planReefs shipping lanes strategy validates output", () => {
    const width = 3;
    const height = 3;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.planReefs, {
      strategy: "shipping-lanes",
      config: {},
    });
    const result = ecology.ops.planReefs.run(
      {
        width,
        height,
        seed: 1337,
        scoreReef01: new Float32Array(size).fill(1),
        scoreColdReef01: new Float32Array(size).fill(1),
        scoreAtoll01: new Float32Array(size).fill(1),
        scoreLotus01: new Float32Array(size).fill(1),
        featureIndex: new Uint16Array(size),
        reserved: new Uint8Array(size),
      },
      selection
    );
    expect(result.placements.length).toBeGreaterThan(0);
  });

  it("planIce validates output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.planIce, {
      strategy: "default",
      config: {},
    });
    const result = ecology.ops.planIce.run(
      {
        width,
        height,
        seed: 1337,
        score01: new Float32Array(size).fill(1),
        featureIndex: new Uint16Array(size),
        reserved: new Uint8Array(size),
      },
      selection
    );
    expect(result.placements.length).toBeGreaterThan(0);
  });

  it("planIce continentality strategy validates output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.planIce, {
      strategy: "continentality",
      config: {},
    });
    const result = ecology.ops.planIce.run(
      {
        width,
        height,
        seed: 1337,
        score01: new Float32Array(size).fill(1),
        featureIndex: new Uint16Array(size),
        reserved: new Uint8Array(size),
      },
      selection
    );
    expect(result.placements.length).toBeGreaterThan(0);
  });

  it("applyFeatures merges placements", () => {
    const result = ecology.ops.applyFeatures.run(
      {
        vegetation: [{ x: 0, y: 0, feature: "FEATURE_FOREST" }],
        wetlands: [],
        reefs: [],
        ice: [],
      },
      ecology.ops.applyFeatures.defaultConfig
    );
    expect(result.placements.length).toBe(1);
  });

  it("planPlotEffects validates output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const tundra = BIOME_SYMBOL_TO_INDEX.tundra ?? 1;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.planPlotEffects, {
      strategy: "default",
      config: {
        snow: {
          enabled: true,
          elevationStrategy: "absolute",
          elevationMin: 0,
          elevationMax: 3000,
          coverageChance: 100,
          lightThreshold: 0,
          mediumThreshold: 0,
          heavyThreshold: 0,
        },
        sand: { enabled: false },
        burned: { enabled: false },
      },
    });

    const result = ecology.ops.planPlotEffects.run(
      {
        width,
        height,
        seed: 0,
        biomeIndex: new Uint8Array(size).fill(tundra),
        vegetationDensity: new Float32Array(size).fill(0.1),
        effectiveMoisture: new Float32Array(size).fill(120),
        surfaceTemperature: new Float32Array(size).fill(-6),
        aridityIndex: new Float32Array(size).fill(0.2),
        freezeIndex: new Float32Array(size).fill(0.95),
        elevation: new Int16Array(size).fill(2400),
        landMask: new Uint8Array(size).fill(1),
      },
      selection
    );

    expect(result.placements.length).toBeGreaterThan(0);
  });
});
