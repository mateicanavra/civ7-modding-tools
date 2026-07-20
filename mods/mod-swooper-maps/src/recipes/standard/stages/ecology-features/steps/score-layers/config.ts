import ecology from "@mapgen/domain/ecology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "../../../ecology/artifacts/index.js";
import { artifacts as hydrologyHydrographyArtifacts } from "../../../hydrology-hydrography/artifacts/index.js";
import { artifacts as mapMorphologyArtifacts } from "../../../map-morphology/artifacts/index.js";
import { artifacts as mapRiversArtifacts } from "../../../map-rivers/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";

/**
 * Defines the shared Ecology scoring boundary over final morphology, hydrology, biome, and
 * pedology truth. It computes every feature-family suitability layer once and seeds occupancy
 * before ordered planning begins.
 */
export const ScoreLayersStepContract = defineStep({
  id: "score-layers",
  phase: "ecology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      ecologyArtifacts.biomeClassification,
      ecologyArtifacts.pedology,
      hydrologyHydrographyArtifacts.hydrography,
      hydrologyHydrographyArtifacts.lakePlan,
      mapRiversArtifacts.projectedNavigableRivers,
      morphologyArtifacts.topography,
      morphologyArtifacts.shelf,
      mapMorphologyArtifacts.coastClassification,
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
