import ecology from "@mapgen/domain/ecology";
import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import { artifacts as pedologyArtifacts } from "@mapgen/domain/ecology/modules/pedology/artifacts/index.js";
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
      biomeArtifacts.biomeClassification,
      pedologyArtifacts.pedology,
      hydrologyArtifacts.climateIndices,
      hydrologyArtifacts.hydrography,
      hydrologyArtifacts.lakePlan,
      mapRiversArtifacts.projectedNavigableRivers,
      morphologyArtifacts.topography,
      morphologyArtifacts.shelf,
      morphologyArtifacts.mountains,
      morphologyArtifacts.volcanoes,
    ],
    provides: [featureArtifacts.scoreLayers, featureArtifacts.occupancyBase],
  },
  ops: {
    vegetationSubstrate: ecology.features.ops.computeVegetationSubstrate,
    featureSubstrate: ecology.features.ops.computeFeatureSubstrate,
    scoreForest: ecology.features.ops.scoreVegetationForest,
    scoreRainforest: ecology.features.ops.scoreVegetationRainforest,
    scoreTaiga: ecology.features.ops.scoreVegetationTaiga,
    scoreSavannaWoodland: ecology.features.ops.scoreVegetationSavannaWoodland,
    scoreSagebrushSteppe: ecology.features.ops.scoreVegetationSagebrushSteppe,
    scoreWetMarsh: ecology.features.ops.scoreWetMarsh,
    scoreWetTundraBog: ecology.features.ops.scoreWetTundraBog,
    scoreWetMangrove: ecology.features.ops.scoreWetMangrove,
    scoreWetOasis: ecology.features.ops.scoreWetOasis,
    scoreWetWateringHole: ecology.features.ops.scoreWetWateringHole,
    scoreReef: ecology.features.ops.scoreReef,
    scoreColdReef: ecology.features.ops.scoreColdReef,
    scoreReefAtoll: ecology.features.ops.scoreReefAtoll,
    scoreReefLotus: ecology.features.ops.scoreReefLotus,
    scoreIce: ecology.features.ops.scoreIce,
  },
  schema: Type.Object(
    {},
    {
      description:
        "Computes a shared score store (one per-tile suitability layer per FeatureKey) and publishes the base occupancy snapshot.",
    }
  ),
});
