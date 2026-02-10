import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import {
  validateOccupancyArtifact,
  validateScoreLayersArtifact,
} from "../../../ecology/artifact-validation.js";
import ScoreLayersStepContract from "./contract.js";

const TILE_SPACE_ID = "tile.hexOddR" as const;

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
    const hydrography = deps.artifacts.hydrography.read(context);

    const { width, height } = context.dimensions;
    const size = Math.max(0, (width | 0) * (height | 0));

    const vegetationSubstrate = ops.vegetationSubstrate(
      {
        width,
        height,
        landMask: topography.landMask,
        effectiveMoisture: classification.effectiveMoisture,
        surfaceTemperature: classification.surfaceTemperature,
        aridityIndex: classification.aridityIndex,
        freezeIndex: classification.freezeIndex,
        vegetationDensity: classification.vegetationDensity,
        fertility: pedology.fertility,
      },
      config.vegetationSubstrate
    );

    const forestScore = ops.scoreVegetationForest(
      { width, height, landMask: topography.landMask, ...vegetationSubstrate },
      config.scoreVegetationForest
    ).score01;
    const rainforestScore = ops.scoreVegetationRainforest(
      { width, height, landMask: topography.landMask, ...vegetationSubstrate },
      config.scoreVegetationRainforest
    ).score01;
    const taigaScore = ops.scoreVegetationTaiga(
      { width, height, landMask: topography.landMask, ...vegetationSubstrate },
      config.scoreVegetationTaiga
    ).score01;
    const savannaWoodlandScore = ops.scoreVegetationSavannaWoodland(
      { width, height, landMask: topography.landMask, ...vegetationSubstrate },
      config.scoreVegetationSavannaWoodland
    ).score01;
    const sagebrushSteppeScore = ops.scoreVegetationSagebrushSteppe(
      { width, height, landMask: topography.landMask, ...vegetationSubstrate },
      config.scoreVegetationSagebrushSteppe
    ).score01;

    const featureSubstrate = ops.featureSubstrate(
      {
        width,
        height,
        riverClass: hydrography.riverClass,
        landMask: topography.landMask,
      },
      config.featureSubstrate
    );

    const marshScore = ops.scoreWetMarsh(
      {
        width,
        height,
        landMask: topography.landMask,
        nearRiverMask: featureSubstrate.nearRiverMask,
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
        landMask: topography.landMask,
        nearRiverMask: featureSubstrate.nearRiverMask,
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
        landMask: topography.landMask,
        coastalLandMask: featureSubstrate.coastalLandMask,
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
        landMask: topography.landMask,
        isolatedRiverMask: featureSubstrate.isolatedRiverMask,
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
        landMask: topography.landMask,
        isolatedRiverMask: featureSubstrate.isolatedRiverMask,
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
        meta: defineVizMeta(`ecology.scoreLayers.${featureKey}`, {
          visibility: "debug",
        }),
      });
    }

    deps.artifacts.scoreLayers.publish(context, {
      width,
      height,
      layers,
    });

    const featureIndex = new Uint16Array(size);
    const reserved = new Uint8Array(size);

    for (let i = 0; i < size; i++) {
      const deepWater = topography.landMask[i] === 0 && coastline.shelfMask[i] === 0;
      const navigableRiver = featureSubstrate.navigableRiverMask[i] === 1;
      reserved[i] = deepWater || navigableRiver ? 1 : 0;
    }

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
