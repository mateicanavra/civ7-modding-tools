import { deriveCiv7CoastProjection, WATER_CLASS_OCEAN } from "@civ7/map-policy";
import { ctxStepSeed } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { defineStandardVizMeta } from "../../../../../viz.js";
import { config } from "./config.js";

const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Computes every feature family's suitability layer once over shared ecology,
 * morphology, and hydrology truth before ordered intent planning begins.
 */
export const ScoreLayersStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const classification = deps.artifacts.biomeClassification.read();
    const climateIndices = deps.artifacts.climateIndices.read();
    const pedology = deps.artifacts.pedology.read();
    const topography = deps.artifacts.topography.read();
    const coastline = deps.artifacts.shelf.read();
    const hydrography = deps.artifacts.hydrography.read();
    const lakePlan = deps.artifacts.lakePlan.read();
    const riverProjection = deps.artifacts.projectedNavigableRivers.read();
    const mountains = deps.artifacts.mountains.read();
    const volcanoes = deps.artifacts.volcanoes.read();

    const { width, height } = context.setup.dimensions;
    const size = width * height;
    const ecologyLandMask = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      ecologyLandMask[i] = topography.landMask[i] === 1 && lakePlan.lakeMask[i] !== 1 ? 1 : 0;
    }
    const projectedWaterClass = deriveCiv7CoastProjection({
      width,
      height,
      landMask: topography.landMask,
      shelfMask: coastline.shelfMask,
      coastalWater: coastline.coastalWater,
    }).waterClass;
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
        effectiveMoisture: climateIndices.effectiveMoisture,
        surfaceTemperature: climateIndices.surfaceTemperatureC,
        aridityIndex: climateIndices.aridityIndex,
        freezeIndex: climateIndices.freezeIndex,
        vegetationDensity: classification.vegetationDensity,
        fertility: pedology.fertility,
      },
      stepConfig.vegetationSubstrate
    );

    const forestScore = ops.scoreForest(
      { width, height, landMask: ecologyLandMask, ...vegetationSubstrate },
      stepConfig.scoreForest
    ).score01;
    const rainforestScore = ops.scoreRainforest(
      { width, height, landMask: ecologyLandMask, ...vegetationSubstrate },
      stepConfig.scoreRainforest
    ).score01;
    const taigaScore = ops.scoreTaiga(
      { width, height, landMask: ecologyLandMask, ...vegetationSubstrate },
      stepConfig.scoreTaiga
    ).score01;
    const savannaWoodlandScore = ops.scoreSavannaWoodland(
      { width, height, landMask: ecologyLandMask, ...vegetationSubstrate },
      stepConfig.scoreSavannaWoodland
    ).score01;
    const sagebrushSteppeScore = ops.scoreSagebrushSteppe(
      { width, height, landMask: ecologyLandMask, ...vegetationSubstrate },
      stepConfig.scoreSagebrushSteppe
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
      stepConfig.featureSubstrate
    );

    const marshScore = ops.scoreWetMarsh(
      {
        width,
        height,
        landMask: ecologyLandMask,
        hydromorphicMask: featureSubstrate.hydromorphicMask,
        water01: vegetationSubstrate.water01,
        fertility01: vegetationSubstrate.fertility01,
        surfaceTemperature: climateIndices.surfaceTemperatureC,
        aridityIndex: climateIndices.aridityIndex,
      },
      stepConfig.scoreWetMarsh
    ).score01;

    const tundraBogScore = ops.scoreWetTundraBog(
      {
        width,
        height,
        landMask: ecologyLandMask,
        hydromorphicMask: featureSubstrate.hydromorphicMask,
        water01: vegetationSubstrate.water01,
        fertility01: vegetationSubstrate.fertility01,
        surfaceTemperature: climateIndices.surfaceTemperatureC,
        freezeIndex: climateIndices.freezeIndex,
      },
      stepConfig.scoreWetTundraBog
    ).score01;

    const mangroveScore = ops.scoreWetMangrove(
      {
        width,
        height,
        landMask: ecologyLandMask,
        intertidalCoastMask: featureSubstrate.intertidalCoastMask,
        water01: vegetationSubstrate.water01,
        fertility01: vegetationSubstrate.fertility01,
        surfaceTemperature: climateIndices.surfaceTemperatureC,
        aridityIndex: climateIndices.aridityIndex,
      },
      stepConfig.scoreWetMangrove
    ).score01;

    const oasisScore = ops.scoreWetOasis(
      {
        width,
        height,
        landMask: ecologyLandMask,
        isolatedWaterPointMask: featureSubstrate.isolatedWaterPointMask,
        water01: vegetationSubstrate.water01,
        aridityIndex: climateIndices.aridityIndex,
        surfaceTemperature: climateIndices.surfaceTemperatureC,
      },
      stepConfig.scoreWetOasis
    ).score01;

    const wateringHoleScore = ops.scoreWetWateringHole(
      {
        width,
        height,
        landMask: ecologyLandMask,
        isolatedWaterPointMask: featureSubstrate.isolatedWaterPointMask,
        water01: vegetationSubstrate.water01,
        fertility01: vegetationSubstrate.fertility01,
        aridityIndex: climateIndices.aridityIndex,
        surfaceTemperature: climateIndices.surfaceTemperatureC,
      },
      stepConfig.scoreWetWateringHole
    ).score01;

    const reefScore = ops.scoreReef(
      {
        width,
        height,
        landMask: topography.landMask,
        surfaceTemperature: climateIndices.surfaceTemperatureC,
        bathymetry: topography.bathymetry,
        shelfMask: coastline.shelfMask,
        coastalWater: coastline.coastalWater,
        distanceToCoast: coastline.distanceToCoast,
      },
      stepConfig.scoreReef
    ).score01;

    const coldReefScore = ops.scoreColdReef(
      {
        width,
        height,
        landMask: topography.landMask,
        surfaceTemperature: climateIndices.surfaceTemperatureC,
        bathymetry: topography.bathymetry,
        shelfMask: coastline.shelfMask,
        coastalWater: coastline.coastalWater,
        distanceToCoast: coastline.distanceToCoast,
      },
      stepConfig.scoreColdReef
    ).score01;

    const atollScore = ops.scoreReefAtoll(
      {
        width,
        height,
        landMask: topography.landMask,
        surfaceTemperature: climateIndices.surfaceTemperatureC,
        bathymetry: topography.bathymetry,
        shelfMask: coastline.shelfMask,
        openOceanMask,
        coastalWater: coastline.coastalWater,
        distanceToCoast: coastline.distanceToCoast,
      },
      stepConfig.scoreReefAtoll
    ).score01;

    const lotusScore = ops.scoreReefLotus(
      {
        width,
        height,
        landMask: topography.landMask,
        surfaceTemperature: climateIndices.surfaceTemperatureC,
        bathymetry: topography.bathymetry,
        lakeMask: lakePlan.lakeMask,
        shelfMask: coastline.shelfMask,
        coastalWater: coastline.coastalWater,
        distanceToCoast: coastline.distanceToCoast,
      },
      stepConfig.scoreReefLotus
    ).score01;

    const iceScore = ops.scoreIce(
      {
        width,
        height,
        landMask: topography.landMask,
        surfaceTemperature: climateIndices.surfaceTemperatureC,
        elevation: topography.elevation,
        freezeIndex: climateIndices.freezeIndex,
      },
      stepConfig.scoreIce
    ).score01;

    const floodplainScores = ops.scoreFloodplains(
      {
        width,
        height,
        seed: ctxStepSeed(context, config.id, "ecology/floodplain-alluvial-patches"),
        landMask: ecologyLandMask,
        biomeIndex: classification.biomeIndex,
        fertility: pedology.fertility,
        floodplainMask: featureSubstrate.floodplainMask,
        navigableRiverMask: featureSubstrate.navigableRiverMask,
        discharge: hydrography.discharge,
        elevation: topography.elevation,
        mountainMask: mountains.mountainMask,
        hillMask: mountains.hillMask,
        volcanoMask: volcanoes.volcanoMask,
      },
      stepConfig.scoreFloodplains
    ).layers;

    const layers = {
      forest: forestScore,
      rainforest: rainforestScore,
      taiga: taigaScore,
      "savanna-woodland": savannaWoodlandScore,
      "sagebrush-steppe": sagebrushSteppeScore,
      marsh: marshScore,
      "tundra-bog": tundraBogScore,
      mangrove: mangroveScore,
      oasis: oasisScore,
      "watering-hole": wateringHoleScore,
      ...floodplainScores,
      reef: reefScore,
      "cold-reef": coldReefScore,
      atoll: atollScore,
      lotus: lotusScore,
      ice: iceScore,
    } as const;

    deps.artifacts.featureSuitability.publish({
      width,
      height,
      layers,
    });

    return { layers };
  },
  viz: ({ observation: { layers }, dimensions }) => [
    ...Object.entries(layers).map(([featureKey, values]) => ({
      kind: "grid" as const,
      dataTypeKey: `ecology.featureSuitability.${featureKey}`,
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32" as const, values },
      meta: defineStandardVizMeta(`ecology.featureSuitability.${featureKey}`, "field.intensity"),
    })),
  ],
});
