import ecology from "@mapgen/domain/ecology";
import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import { artifacts as pedologyArtifacts } from "@mapgen/domain/ecology/modules/pedology/artifacts/index.js";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "@mapgen/domain/morphology/modules/shelf/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the shared Ecology scoring boundary over final morphology, hydrology, biome, and
 * pedology truth. It computes every feature-family suitability layer once before ordered
 * planning begins.
 */
export const config = defineStep({
  id: "score-layers",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      biomeArtifacts.biomeClassification,
      pedologyArtifacts.pedology,
      climateArtifacts.climateIndices,
      hydrographyArtifacts.hydrography,
      hydrographyArtifacts.lakePlan,
      hydrographyArtifacts.projectedNavigableRivers,
      morphologyLandformsArtifacts.topography,
      morphologyShelfArtifacts.shelf,
      morphologyLandformsArtifacts.mountains,
      morphologyLandformsArtifacts.volcanoes,
    ],
    provides: [featureArtifacts.featureSuitability],
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
        "Computes one shared per-tile suitability layer for every admitted feature intent.",
    }
  ),
});
