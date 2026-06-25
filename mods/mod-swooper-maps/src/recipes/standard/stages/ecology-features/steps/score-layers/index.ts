import { WATER_CLASS_OCEAN } from "@civ7/map-policy";
import { BIOME_SYMBOL_TO_INDEX } from "@mapgen/domain/ecology";
import { clamp01, ctxStepSeed, defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ, getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import { PerlinNoise } from "@swooper/mapgen-core/lib/noise";
import {
  validateOccupancyArtifact,
  validateScoreLayersArtifact,
} from "../../../ecology/artifact-validation.js";
import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import ScoreLayersStepContract from "./contract.js";

const TILE_SPACE_ID = "tile.hexOddQ" as const;
const MINOR_FLOODPLAIN_DISCHARGE_NORMALIZER = 1000;
const FLOODPLAIN_RELIEF_NORMALIZER_M = 260;
const FLOODPLAIN_PATCH_NOISE_SCALE = 0.11;

function maxAdjacentNavigableDischarge(
  tileIndex: number,
  width: number,
  height: number,
  navigableRiverMask: Uint8Array,
  discharge: Float32Array
): number {
  const y = (tileIndex / width) | 0;
  const x = tileIndex - y * width;
  let max = 0;
  for (const neighbor of getHexNeighborIndicesOddQ(x, y, width, height)) {
    if ((navigableRiverMask[neighbor] ?? 0) !== 1) continue;
    max = Math.max(max, discharge[neighbor] ?? 0);
  }
  return max;
}

function localReliefM(
  tileIndex: number,
  width: number,
  height: number,
  landMask: Uint8Array,
  elevation: Int16Array
): number {
  if (landMask[tileIndex] !== 1) return Number.POSITIVE_INFINITY;
  const y = (tileIndex / width) | 0;
  const x = tileIndex - y * width;
  const here = elevation[tileIndex] ?? 0;
  let relief = 0;
  forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
    const neighbor = ny * width + nx;
    if (landMask[neighbor] !== 1) return;
    relief = Math.max(relief, Math.abs(here - (elevation[neighbor] ?? 0)));
  });
  return relief;
}

export default createStep(ScoreLayersStepContract, {
  artifacts: implementArtifacts([ecologyArtifacts.scoreLayers, ecologyArtifacts.occupancyBase], {
    scoreLayers: {
      validate: (value, context) => validateScoreLayersArtifact(value, context.dimensions),
    },
    occupancyBase: {
      validate: (value, context) => validateOccupancyArtifact(value, context.dimensions),
    },
  }),
  run: (context, config, ops, deps) => {
    const classification = deps.artifacts.biomeClassification.read(context);
    const pedology = deps.artifacts.pedology.read(context);
    const topography = deps.artifacts.topography.read(context);
    const coastline = deps.artifacts.coastlineMetrics.read(context);
    const coastClassification = deps.artifacts.coastClassification.read(context);
    const hydrography = deps.artifacts.hydrography.read(context);
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const riverProjection = deps.artifacts.projectedNavigableRivers.read(context);
    const mountains = deps.artifacts.mountains.read(context);
    const volcanoes = deps.artifacts.volcanoes.read(context);

    const { width, height } = context.dimensions;
    const size = Math.max(0, (width | 0) * (height | 0));
    const ecologyLandMask = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      ecologyLandMask[i] = topography.landMask[i] === 1 && lakePlan.lakeMask[i] !== 1 ? 1 : 0;
    }
    // Open ocean is the authoritative engine projection (shelf + coast ring), not a local
    // recomputation: read the coastClassification waterClass stamped by map-morphology/plot-coasts.
    const projectedWaterClass = coastClassification.waterClass;
    const openOceanMask = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      openOceanMask[i] = projectedWaterClass[i] === WATER_CLASS_OCEAN ? 1 : 0;
    }

    // Ecology features consume post-Hydrology lake truth, not just Morphology's
    // pre-lake land mask. Otherwise vegetation and wetland features can be
    // planned on tiles that the player later sees as filled lake water.
    const vegetationSubstrate = ops.vegetationSubstrate(
      {
        width,
        height,
        landMask: ecologyLandMask,
        effectiveMoisture: classification.effectiveMoisture,
        surfaceTemperature: classification.surfaceTemperature,
        aridityIndex: classification.aridityIndex,
        freezeIndex: classification.freezeIndex,
        vegetationDensity: classification.vegetationDensity,
        fertility: pedology.fertility,
      },
      config.vegetationSubstrate
    );

    const forestScore = ops.scoreForest(
      { width, height, landMask: ecologyLandMask, ...vegetationSubstrate },
      config.scoreForest
    ).score01;
    const rainforestScore = ops.scoreRainforest(
      { width, height, landMask: ecologyLandMask, ...vegetationSubstrate },
      config.scoreRainforest
    ).score01;
    const taigaScore = ops.scoreTaiga(
      { width, height, landMask: ecologyLandMask, ...vegetationSubstrate },
      config.scoreTaiga
    ).score01;
    const savannaWoodlandScore = ops.scoreSavannaWoodland(
      { width, height, landMask: ecologyLandMask, ...vegetationSubstrate },
      config.scoreSavannaWoodland
    ).score01;
    const sagebrushSteppeScore = ops.scoreSagebrushSteppe(
      { width, height, landMask: ecologyLandMask, ...vegetationSubstrate },
      config.scoreSagebrushSteppe
    ).score01;

    const featureSubstrate = ops.featureSubstrate(
      {
        width,
        height,
        riverClass: hydrography.riverClass,
        navigableRiverMask: riverProjection.riverMask,
        landMask: ecologyLandMask,
        elevation: topography.elevation,
        seaLevel: topography.seaLevel,
        discharge: hydrography.discharge,
        sinkMask: hydrography.sinkMask,
      },
      config.featureSubstrate
    );

    const marshScore = ops.scoreWetMarsh(
      {
        width,
        height,
        landMask: ecologyLandMask,
        hydromorphicMask: featureSubstrate.hydromorphicMask,
        water01: vegetationSubstrate.water01,
        fertility01: vegetationSubstrate.fertility01,
        surfaceTemperature: classification.surfaceTemperature,
        aridityIndex: classification.aridityIndex,
      },
      config.scoreWetMarsh
    ).score01;

    const tundraBogScore = ops.scoreWetTundraBog(
      {
        width,
        height,
        landMask: ecologyLandMask,
        hydromorphicMask: featureSubstrate.hydromorphicMask,
        water01: vegetationSubstrate.water01,
        fertility01: vegetationSubstrate.fertility01,
        surfaceTemperature: classification.surfaceTemperature,
        freezeIndex: classification.freezeIndex,
      },
      config.scoreWetTundraBog
    ).score01;

    const mangroveScore = ops.scoreWetMangrove(
      {
        width,
        height,
        landMask: ecologyLandMask,
        intertidalCoastMask: featureSubstrate.intertidalCoastMask,
        water01: vegetationSubstrate.water01,
        fertility01: vegetationSubstrate.fertility01,
        surfaceTemperature: classification.surfaceTemperature,
        aridityIndex: classification.aridityIndex,
      },
      config.scoreWetMangrove
    ).score01;

    const oasisScore = ops.scoreWetOasis(
      {
        width,
        height,
        landMask: ecologyLandMask,
        isolatedWaterPointMask: featureSubstrate.isolatedWaterPointMask,
        water01: vegetationSubstrate.water01,
        aridityIndex: classification.aridityIndex,
        surfaceTemperature: classification.surfaceTemperature,
      },
      config.scoreWetOasis
    ).score01;

    const wateringHoleScore = ops.scoreWetWateringHole(
      {
        width,
        height,
        landMask: ecologyLandMask,
        isolatedWaterPointMask: featureSubstrate.isolatedWaterPointMask,
        water01: vegetationSubstrate.water01,
        fertility01: vegetationSubstrate.fertility01,
        aridityIndex: classification.aridityIndex,
        surfaceTemperature: classification.surfaceTemperature,
      },
      config.scoreWetWateringHole
    ).score01;

    const reefScore = ops.scoreReef(
      {
        width,
        height,
        landMask: topography.landMask,
        surfaceTemperature: classification.surfaceTemperature,
        bathymetry: topography.bathymetry,
        shelfMask: coastline.shelfMask,
        coastalWater: coastline.coastalWater,
        distanceToCoast: coastline.distanceToCoast,
      },
      config.scoreReef
    ).score01;

    const coldReefScore = ops.scoreColdReef(
      {
        width,
        height,
        landMask: topography.landMask,
        surfaceTemperature: classification.surfaceTemperature,
        bathymetry: topography.bathymetry,
        shelfMask: coastline.shelfMask,
        coastalWater: coastline.coastalWater,
        distanceToCoast: coastline.distanceToCoast,
      },
      config.scoreColdReef
    ).score01;

    const atollScore = ops.scoreReefAtoll(
      {
        width,
        height,
        landMask: topography.landMask,
        surfaceTemperature: classification.surfaceTemperature,
        bathymetry: topography.bathymetry,
        shelfMask: coastline.shelfMask,
        openOceanMask,
        coastalWater: coastline.coastalWater,
        distanceToCoast: coastline.distanceToCoast,
      },
      config.scoreReefAtoll
    ).score01;

    const lotusScore = ops.scoreReefLotus(
      {
        width,
        height,
        landMask: topography.landMask,
        surfaceTemperature: classification.surfaceTemperature,
        bathymetry: topography.bathymetry,
        lakeMask: lakePlan.lakeMask,
        shelfMask: coastline.shelfMask,
        coastalWater: coastline.coastalWater,
        distanceToCoast: coastline.distanceToCoast,
      },
      config.scoreReefLotus
    ).score01;

    const iceScore = ops.scoreIce(
      {
        width,
        height,
        landMask: topography.landMask,
        surfaceTemperature: classification.surfaceTemperature,
        elevation: topography.elevation,
        freezeIndex: classification.freezeIndex,
      },
      config.scoreIce
    ).score01;

    const floodplainScores = {
      FEATURE_DESERT_FLOODPLAIN_MINOR: new Float32Array(size),
      FEATURE_DESERT_FLOODPLAIN_NAVIGABLE: new Float32Array(size),
      FEATURE_GRASSLAND_FLOODPLAIN_MINOR: new Float32Array(size),
      FEATURE_GRASSLAND_FLOODPLAIN_NAVIGABLE: new Float32Array(size),
      FEATURE_PLAINS_FLOODPLAIN_MINOR: new Float32Array(size),
      FEATURE_PLAINS_FLOODPLAIN_NAVIGABLE: new Float32Array(size),
      FEATURE_TROPICAL_FLOODPLAIN_MINOR: new Float32Array(size),
      FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE: new Float32Array(size),
      FEATURE_TUNDRA_FLOODPLAIN_MINOR: new Float32Array(size),
      FEATURE_TUNDRA_FLOODPLAIN_NAVIGABLE: new Float32Array(size),
    } as const;
    const floodplainNoise = new PerlinNoise(
      ctxStepSeed(context, ScoreLayersStepContract.id, "ecology/floodplain-alluvial-patches")
    );

    for (let i = 0; i < size; i++) {
      if (
        ecologyLandMask[i] !== 1 ||
        lakePlan.lakeMask[i] === 1 ||
        mountains.mountainMask[i] === 1 ||
        mountains.hillMask[i] === 1 ||
        volcanoes.volcanoMask[i] === 1
      ) {
        continue;
      }

      const isFloodplainSubstrate = featureSubstrate.floodplainMask[i] === 1;
      const isNavigableFloodplain =
        isFloodplainSubstrate && featureSubstrate.navigableRiverMask[i] === 1;
      const adjacentNavigableDischarge = maxAdjacentNavigableDischarge(
        i,
        width,
        height,
        featureSubstrate.navigableRiverMask,
        hydrography.discharge
      );
      const isMinorFloodplain =
        isFloodplainSubstrate && !isNavigableFloodplain && adjacentNavigableDischarge > 0;
      if (!isMinorFloodplain && !isNavigableFloodplain) continue;

      const dischargeScore = isNavigableFloodplain
        ? 1
        : clamp01(adjacentNavigableDischarge / MINOR_FLOODPLAIN_DISCHARGE_NORMALIZER);
      const y = (i / width) | 0;
      const x = i - y * width;
      const reliefScore =
        1 -
        clamp01(
          localReliefM(i, width, height, ecologyLandMask, topography.elevation) /
            FLOODPLAIN_RELIEF_NORMALIZER_M
        );
      const fertilityScore = clamp01(pedology.fertility[i] ?? 0);
      const patchScore = clamp01(
        (floodplainNoise.noise2D(
          x * FLOODPLAIN_PATCH_NOISE_SCALE,
          y * FLOODPLAIN_PATCH_NOISE_SCALE
        ) +
          1) /
          2
      );
      const score =
        dischargeScore *
        (0.35 + reliefScore * 0.65) *
        (0.55 + fertilityScore * 0.45) *
        (0.3 + patchScore * 0.7);
      switch (classification.biomeIndex[i]) {
        case BIOME_SYMBOL_TO_INDEX.desert:
          (isNavigableFloodplain
            ? floodplainScores.FEATURE_DESERT_FLOODPLAIN_NAVIGABLE
            : floodplainScores.FEATURE_DESERT_FLOODPLAIN_MINOR)[i] = score;
          break;
        case BIOME_SYMBOL_TO_INDEX.temperateHumid:
          (isNavigableFloodplain
            ? floodplainScores.FEATURE_GRASSLAND_FLOODPLAIN_NAVIGABLE
            : floodplainScores.FEATURE_GRASSLAND_FLOODPLAIN_MINOR)[i] = score;
          break;
        case BIOME_SYMBOL_TO_INDEX.temperateDry:
        case BIOME_SYMBOL_TO_INDEX.tropicalSeasonal:
          (isNavigableFloodplain
            ? floodplainScores.FEATURE_PLAINS_FLOODPLAIN_NAVIGABLE
            : floodplainScores.FEATURE_PLAINS_FLOODPLAIN_MINOR)[i] = score;
          break;
        case BIOME_SYMBOL_TO_INDEX.tropicalRainforest:
          (isNavigableFloodplain
            ? floodplainScores.FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE
            : floodplainScores.FEATURE_TROPICAL_FLOODPLAIN_MINOR)[i] = score;
          break;
        case BIOME_SYMBOL_TO_INDEX.snow:
        case BIOME_SYMBOL_TO_INDEX.tundra:
        case BIOME_SYMBOL_TO_INDEX.boreal:
          (isNavigableFloodplain
            ? floodplainScores.FEATURE_TUNDRA_FLOODPLAIN_NAVIGABLE
            : floodplainScores.FEATURE_TUNDRA_FLOODPLAIN_MINOR)[i] = score;
          break;
      }
    }

    const layers = {
      FEATURE_FOREST: forestScore,
      FEATURE_RAINFOREST: rainforestScore,
      FEATURE_TAIGA: taigaScore,
      FEATURE_SAVANNA_WOODLAND: savannaWoodlandScore,
      FEATURE_SAGEBRUSH_STEPPE: sagebrushSteppeScore,
      FEATURE_MARSH: marshScore,
      FEATURE_TUNDRA_BOG: tundraBogScore,
      FEATURE_MANGROVE: mangroveScore,
      FEATURE_OASIS: oasisScore,
      FEATURE_WATERING_HOLE: wateringHoleScore,
      ...floodplainScores,
      FEATURE_REEF: reefScore,
      FEATURE_COLD_REEF: coldReefScore,
      FEATURE_ATOLL: atollScore,
      FEATURE_LOTUS: lotusScore,
      FEATURE_ICE: iceScore,
    } as const;

    // Score layers are a primary debugging surface in M3; dump them for deterministic diffs.
    for (const [featureKey, values] of Object.entries(layers)) {
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: `ecology.scoreLayers.${featureKey}`,
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "f32",
        values: values as Float32Array,
        meta: defineVizMeta(`ecology.scoreLayers.${featureKey}`),
      });
    }

    deps.artifacts.scoreLayers.publish(context, {
      width,
      height,
      layers,
    });

    const featureIndex = new Uint16Array(size);
    const reserved = new Uint8Array(size);

    reserved.fill(0);

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "ecology.occupancy.base.reserved",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: reserved,
      meta: defineVizMeta("ecology.occupancy.base.reserved", { visibility: "debug" }),
    });

    deps.artifacts.occupancyBase.publish(context, {
      width,
      height,
      featureIndex,
      reserved,
    });
  },
});
