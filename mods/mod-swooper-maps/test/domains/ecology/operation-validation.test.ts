import { describe, expect, it } from "bun:test";
import { BIOME_SYMBOL_TO_INDEX } from "@mapgen/domain/ecology/model/schemas/index.js";
import ecology from "@mapgen/domain/ecology/ops";
import { RIVER_CLASS_MINOR } from "@mapgen/domain/hydrology/model/policy/river-class.js";
import { Value } from "typebox/value";
import { normalizeOpSelectionOrThrow, runOpValidated } from "../../support/compiler-helpers.js";

function broadVegetationHabitatFields(size: number) {
  return {
    flatLandMask: new Uint8Array(size).fill(1),
    biomeIndex: new Uint8Array(size).fill(BIOME_SYMBOL_TO_INDEX.temperateHumid),
    surfaceTemperature: new Float32Array(size).fill(20),
    effectiveMoisture: new Float32Array(size).fill(120),
    aridityIndex: new Float32Array(size).fill(0.4),
    vegetationDensity: new Float32Array(size).fill(0.35),
  };
}

describe("ecology op contract surfaces", () => {
  it("classifyPedology validates output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(
      ecology.ops.classifyPedology,
      ecology.ops.classifyPedology.defaultConfig
    );
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
      config: Value.Create(ecology.ops.classifyPedology.strategies["coastal-shelf"].config),
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
      config: Value.Create(ecology.ops.classifyPedology.strategies["orogeny-boosted"].config),
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
      ...ecology.ops.planResourceBasins.defaultConfig,
      config: {
        ...ecology.ops.planResourceBasins.defaultConfig.config,
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
        ...Value.Create(ecology.ops.planResourceBasins.strategies["hydro-fluvial"].config),
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
    const selection = normalizeOpSelectionOrThrow(ecology.ops.refineBiomeEdges, {
      strategy: "gaussian",
      config: {
        ...Value.Create(ecology.ops.refineBiomeEdges.strategies.gaussian.config),
        radius: 1,
        iterations: 1,
      },
    });
    const result = ecology.ops.refineBiomeEdges.run(
      {
        width,
        height,
        biomeIndex: new Uint8Array(size).fill(1),
        landMask: new Uint8Array(size).fill(1),
      },
      selection
    );
    expect(result.biomeIndex.length).toBe(size);
  });

  it("computeFeatureSubstrate validates output", () => {
    const width = 3;
    const height = 3;
    const size = width * height;

    const selection = normalizeOpSelectionOrThrow(
      ecology.ops.computeFeatureSubstrate,
      ecology.ops.computeFeatureSubstrate.defaultConfig
    );

    const result = ecology.ops.computeFeatureSubstrate.run(
      {
        width,
        height,
        riverClass: new Uint8Array(size),
        navigableRiverMask: new Uint8Array(size),
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array(size).fill(40),
        seaLevel: 0,
        discharge: new Float32Array(size),
        sinkMask: new Uint8Array(size),
      },
      selection
    );

    expect(result.navigableRiverMask.length).toBe(size);
    expect(result.nearRiverMask.length).toBe(size);
    expect(result.isolatedRiverMask.length).toBe(size);
    expect(result.coastalLandMask.length).toBe(size);
    expect(result.lowlandMask.length).toBe(size);
    expect(result.floodplainMask.length).toBe(size);
    expect(result.intertidalCoastMask.length).toBe(size);
    expect(result.sinkBasinMask.length).toBe(size);
    expect(result.hydromorphicMask.length).toBe(size);
    expect(result.wellDrainedMask.length).toBe(size);
    expect(result.isolatedWaterPointMask.length).toBe(size);
  });

  it("computeFeatureSubstrate separates minor river adjacency from projected navigable terrain", () => {
    const width = 3;
    const height = 3;
    const size = width * height;
    const riverClass = new Uint8Array(size);
    const navigableRiverMask = new Uint8Array(size);
    riverClass[1] = RIVER_CLASS_MINOR;
    navigableRiverMask[4] = 1;

    const selection = normalizeOpSelectionOrThrow(
      ecology.ops.computeFeatureSubstrate,
      ecology.ops.computeFeatureSubstrate.defaultConfig
    );

    const result = ecology.ops.computeFeatureSubstrate.run(
      {
        width,
        height,
        riverClass,
        navigableRiverMask,
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array(size).fill(40),
        seaLevel: 0,
        discharge: new Float32Array(size).fill(100),
        sinkMask: new Uint8Array(size),
      },
      selection
    );

    expect(result.navigableRiverMask[1]).toBe(0);
    expect(result.navigableRiverMask[4]).toBe(1);
    expect(result.nearRiverMask[1]).toBe(1);
  });

  it("classifyBiomes validates output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(
      ecology.ops.classifyBiomes,
      ecology.ops.classifyBiomes.defaultConfig
    );

    const result = ecology.ops.classifyBiomes.run(
      {
        width,
        height,
        effectiveMoisture: new Float32Array(size).fill(160 + 0.35 * 120),
        surfaceTemperatureC: new Float32Array(size).fill(15),
        aridityIndex: new Float32Array(size).fill(0.2),
        freezeIndex: new Float32Array(size).fill(0.05),
        landMask: new Uint8Array(size).fill(1),
        soilType: new Uint8Array(size).fill(0),
        fertility: new Float32Array(size).fill(0.5),
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
    const selection = normalizeOpSelectionOrThrow(
      ecology.ops.computeVegetationSubstrate,
      ecology.ops.computeVegetationSubstrate.defaultConfig
    );

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

    const substrateSelection = normalizeOpSelectionOrThrow(
      ecology.ops.computeVegetationSubstrate,
      ecology.ops.computeVegetationSubstrate.defaultConfig
    );

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
      const selection = normalizeOpSelectionOrThrow(op, op.defaultConfig);
      const result = op.run(
        { width, height, landMask: new Uint8Array(size).fill(1), ...substrate },
        selection
      );
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
      const hydromorphicMask = new Uint8Array(size).fill(1);
      const intertidalCoastMask = new Uint8Array(size).fill(1);
      const isolatedWaterPointMask = new Uint8Array(size).fill(1);
      const water01 = new Float32Array(size).fill(0.7);
      const fertility01 = new Float32Array(size).fill(0.4);
      const surfaceTemperature = new Float32Array(size).fill(18);
      const aridityIndex = new Float32Array(size).fill(0.5);
      const freezeIndex = new Float32Array(size).fill(0.6);

      const wetScores = [
        runOpValidated(
          ecology.ops.scoreWetMarsh,
          {
            width,
            height,
            landMask,
            hydromorphicMask,
            water01,
            fertility01,
            surfaceTemperature,
            aridityIndex,
          },
          ecology.ops.scoreWetMarsh.defaultConfig
        ).score01,
        runOpValidated(
          ecology.ops.scoreWetTundraBog,
          {
            width,
            height,
            landMask,
            hydromorphicMask,
            water01,
            fertility01,
            surfaceTemperature,
            freezeIndex,
          },
          ecology.ops.scoreWetTundraBog.defaultConfig
        ).score01,
        runOpValidated(
          ecology.ops.scoreWetMangrove,
          {
            width,
            height,
            landMask,
            intertidalCoastMask,
            water01,
            fertility01,
            surfaceTemperature,
            aridityIndex,
          },
          ecology.ops.scoreWetMangrove.defaultConfig
        ).score01,
        runOpValidated(
          ecology.ops.scoreWetOasis,
          {
            width,
            height,
            landMask,
            isolatedWaterPointMask,
            water01,
            aridityIndex,
            surfaceTemperature,
          },
          ecology.ops.scoreWetOasis.defaultConfig
        ).score01,
        runOpValidated(
          ecology.ops.scoreWetWateringHole,
          {
            width,
            height,
            landMask,
            isolatedWaterPointMask,
            water01,
            fertility01,
            aridityIndex,
            surfaceTemperature,
          },
          ecology.ops.scoreWetWateringHole.defaultConfig
        ).score01,
      ];

      for (const score of wetScores) expectScore01(score);
    }

    {
      const landMask = new Uint8Array(size).fill(0);
      const surfaceTemperatureWarm = new Float32Array(size).fill(24);
      const surfaceTemperatureCold = new Float32Array(size).fill(12);
      const bathymetry = new Int16Array(size).fill(-120);
      const shelfMask = new Uint8Array(size).fill(1);
      const openOceanMask = new Uint8Array(size).fill(1);
      const lakeMask = new Uint8Array(size).fill(1);
      const coastalWater = new Uint8Array(size).fill(1);
      const distanceToCoast = new Uint16Array(size).fill(1);
      const isolatedCoastalWater = new Uint8Array(size).fill(0);
      const isolatedDistanceToCoast = new Uint16Array(size).fill(5);

      const reefScores = [
        runOpValidated(
          ecology.ops.scoreReef,
          {
            width,
            height,
            landMask,
            surfaceTemperature: surfaceTemperatureWarm,
            bathymetry,
            shelfMask,
            coastalWater,
            distanceToCoast,
          },
          ecology.ops.scoreReef.defaultConfig
        ).score01,
        runOpValidated(
          ecology.ops.scoreColdReef,
          {
            width,
            height,
            landMask,
            surfaceTemperature: surfaceTemperatureCold,
            bathymetry,
            shelfMask,
            coastalWater,
            distanceToCoast,
          },
          ecology.ops.scoreColdReef.defaultConfig
        ).score01,
        runOpValidated(
          ecology.ops.scoreReefAtoll,
          {
            width,
            height,
            landMask,
            surfaceTemperature: surfaceTemperatureWarm,
            bathymetry,
            shelfMask,
            openOceanMask,
            coastalWater: isolatedCoastalWater,
            distanceToCoast: isolatedDistanceToCoast,
          },
          ecology.ops.scoreReefAtoll.defaultConfig
        ).score01,
        runOpValidated(
          ecology.ops.scoreReefLotus,
          {
            width,
            height,
            landMask,
            surfaceTemperature: surfaceTemperatureWarm,
            bathymetry,
            lakeMask,
            shelfMask,
            coastalWater,
            distanceToCoast,
          },
          ecology.ops.scoreReefLotus.defaultConfig
        ).score01,
      ];

      for (const score of reefScores) expectScore01(score);
    }

    {
      const landMask = new Uint8Array(size).fill(1);
      const surfaceTemperature = new Float32Array(size).fill(-8);
      const elevation = new Int16Array(size).fill(3000);
      const freezeIndex = new Float32Array(size).fill(0.8);
      const selection = normalizeOpSelectionOrThrow(
        ecology.ops.scoreIce,
        ecology.ops.scoreIce.defaultConfig
      );
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
    const selection = normalizeOpSelectionOrThrow(
      ecology.ops.planWetlands,
      ecology.ops.planWetlands.defaultConfig
    );
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
        flatLandMask: new Uint8Array(size).fill(1),
        featureOccupancyMask: new Uint8Array(size),
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
    const selection = normalizeOpSelectionOrThrow(
      ecology.ops.planVegetation,
      ecology.ops.planVegetation.defaultConfig
    );
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
        ...broadVegetationHabitatFields(size),
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      selection
    );
    expect(result.placements.length).toBeGreaterThan(0);
  });

  it("planFloodplains validates output", () => {
    const width = 3;
    const height = 3;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(
      ecology.ops.planFloodplains,
      ecology.ops.planFloodplains.defaultConfig
    );
    const result = ecology.ops.planFloodplains.run(
      {
        width,
        height,
        seed: 1337,
        scoreDesertMinor01: new Float32Array(size),
        scoreDesertNavigable01: new Float32Array(size),
        scoreGrasslandMinor01: new Float32Array(size).fill(1),
        scoreGrasslandNavigable01: new Float32Array(size),
        scorePlainsMinor01: new Float32Array(size),
        scorePlainsNavigable01: new Float32Array(size),
        scoreTropicalMinor01: new Float32Array(size),
        scoreTropicalNavigable01: new Float32Array(size),
        scoreTundraMinor01: new Float32Array(size),
        scoreTundraNavigable01: new Float32Array(size),
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      selection
    );
    expect(result.placements.length).toBe(size);
    expect(result.placements[0]?.feature).toBe("grassland-floodplain-minor");
  });

  it("planReefs validates output", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(
      ecology.ops.planReefs,
      ecology.ops.planReefs.defaultConfig
    );
    const result = ecology.ops.planReefs.run(
      {
        width,
        height,
        seed: 1337,
        scoreReef01: new Float32Array(size).fill(1),
        scoreColdReef01: new Float32Array(size).fill(1),
        scoreAtoll01: new Float32Array(size).fill(1),
        scoreLotus01: new Float32Array(size).fill(1),
        lakeMask: new Uint8Array(size).fill(1),
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      selection
    );
    expect(result.placements.length).toBeGreaterThan(0);
  });

  it("planReefs diagonal-stride strategy validates output", () => {
    const width = 3;
    const height = 3;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.planReefs, {
      strategy: "diagonal-stride",
      config: Value.Create(ecology.ops.planReefs.strategies["diagonal-stride"].config),
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
        lakeMask: new Uint8Array(size).fill(1),
        featureOccupancyMask: new Uint8Array(size),
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
    const selection = normalizeOpSelectionOrThrow(
      ecology.ops.planIce,
      ecology.ops.planIce.defaultConfig
    );
    const result = ecology.ops.planIce.run(
      {
        width,
        height,
        seed: 1337,
        score01: new Float32Array(size).fill(1),
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      selection
    );
    expect(result.placements.length).toBeGreaterThan(0);
  });

  it("applyFeatures merges placements", () => {
    const result = ecology.ops.applyFeatures.run(
      {
        vegetation: [{ x: 0, y: 0, feature: "forest" }],
        wetlands: [],
        floodplains: [],
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

    const scoreSnowSelection = normalizeOpSelectionOrThrow(
      ecology.ops.scorePlotEffectsSnow,
      ecology.ops.scorePlotEffectsSnow.defaultConfig
    );

    const scoreSnowResult = ecology.ops.scorePlotEffectsSnow.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array(size).fill(2400),
        effectiveMoisture: new Float32Array(size).fill(120),
        surfaceTemperature: new Float32Array(size).fill(-6),
        aridityIndex: new Float32Array(size).fill(0.2),
        freezeIndex: new Float32Array(size).fill(0.95),
      },
      scoreSnowSelection
    );

    const planSelection = normalizeOpSelectionOrThrow(ecology.ops.planPlotEffects, {
      ...ecology.ops.planPlotEffects.defaultConfig,
      config: {
        ...ecology.ops.planPlotEffects.defaultConfig.config,
        snow: {
          ...ecology.ops.planPlotEffects.defaultConfig.config.snow,
          enabled: true,
          coveragePct: 100,
          lightThreshold: 0,
          mediumThreshold: 0,
          heavyThreshold: 0,
        },
      },
    });

    const result = ecology.ops.planPlotEffects.run(
      {
        width,
        height,
        seed: 0,
        snowScore01: scoreSnowResult.score01,
        snowEligibleMask: scoreSnowResult.eligibleMask,
        sandScore01: new Float32Array(size),
        sandEligibleMask: new Uint8Array(size),
        burnedScore01: new Float32Array(size),
        burnedEligibleMask: new Uint8Array(size),
        jungleScore01: new Float32Array(size),
        jungleEligibleMask: new Uint8Array(size),
      },
      planSelection
    );

    expect(result.placements.length).toBeGreaterThan(0);
  });
});
