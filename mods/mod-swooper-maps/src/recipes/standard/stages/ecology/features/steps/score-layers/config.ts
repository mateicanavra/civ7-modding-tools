import {
  default as ecology,
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "@mapgen/domain/ecology";
import { artifacts as hydrologyArtifacts } from "@mapgen/domain/hydrology";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { artifacts as mapRiversArtifacts } from "../../../../map/rivers/artifacts/index.js";

/**
 * Defines the shared Ecology scoring boundary over final morphology, hydrology, biome, and
 * pedology truth. It computes every feature-family suitability layer once and seeds occupancy
 * before ordered planning begins.
 */
export const ScoreLayersStepContract = defineStep({
  id: "score-layers",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      ecologyArtifacts.biomeClassification,
      ecologyArtifacts.pedology,
      hydrologyArtifacts.climateIndices,
      hydrologyArtifacts.hydrography,
      hydrologyArtifacts.lakePlan,
      mapRiversArtifacts.projectedNavigableRivers,
      morphologyArtifacts.topography,
      morphologyArtifacts.shelf,
      morphologyArtifacts.mountains,
      morphologyArtifacts.volcanoes,
    ],
    provides: [ecologyArtifactModules.scoreLayers, ecologyArtifactModules.occupancyBase],
  },
  ops: {
    vegetationSubstrate: ecology.ops.computeVegetationSubstrate,
    featureSubstrate: ecology.ops.computeFeatureSubstrate,
    scoreForest: ecology.ops.scoreVegetationForest,
    scoreRainforest: ecology.ops.scoreVegetationRainforest,
    scoreTaiga: ecology.ops.scoreVegetationTaiga,
    scoreSavannaWoodland: ecology.ops.scoreVegetationSavannaWoodland,
    scoreSagebrushSteppe: ecology.ops.scoreVegetationSagebrushSteppe,
    scoreWetMarsh: ecology.ops.scoreWetMarsh,
    scoreWetTundraBog: ecology.ops.scoreWetTundraBog,
    scoreWetMangrove: ecology.ops.scoreWetMangrove,
    scoreWetOasis: ecology.ops.scoreWetOasis,
    scoreWetWateringHole: ecology.ops.scoreWetWateringHole,
    scoreReef: ecology.ops.scoreReef,
    scoreColdReef: ecology.ops.scoreColdReef,
    scoreReefAtoll: ecology.ops.scoreReefAtoll,
    scoreReefLotus: ecology.ops.scoreReefLotus,
    scoreIce: ecology.ops.scoreIce,
  },
  schema: Type.Object(
    {},
    {
      description:
        "Computes a shared score store (one per-tile suitability layer per FeatureKey) and publishes the base occupancy snapshot.",
    }
  ),
});
