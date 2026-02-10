import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import ecology from "@mapgen/domain/ecology";

import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../../hydrology-hydrography/artifacts.js";
import { morphologyArtifacts } from "../../../morphology/artifacts.js";

const ScoreLayersStepContract = defineStep({
  id: "score-layers",
  phase: "ecology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      ecologyArtifacts.biomeClassification,
      ecologyArtifacts.pedology,
      hydrologyHydrographyArtifacts.hydrography,
      morphologyArtifacts.topography,
      morphologyArtifacts.coastlineMetrics,
    ],
    provides: [ecologyArtifacts.scoreLayers, ecologyArtifacts.occupancyBase],
  },
  ops: {
    vegetationSubstrate: ecology.ops.computeVegetationSubstrate,
    featureSubstrate: ecology.ops.computeFeatureSubstrate,
    vegetationScoreForest: ecology.ops.scoreVegetationForest,
    vegetationScoreRainforest: ecology.ops.scoreVegetationRainforest,
    vegetationScoreTaiga: ecology.ops.scoreVegetationTaiga,
    vegetationScoreSavannaWoodland: ecology.ops.scoreVegetationSavannaWoodland,
    vegetationScoreSagebrushSteppe: ecology.ops.scoreVegetationSagebrushSteppe,
  },
  schema: Type.Object(
    {},
    {
      description:
        "Computes a shared score store (one per-tile suitability layer per FeatureKey) and publishes the base occupancy snapshot.",
    }
  ),
});

export default ScoreLayersStepContract;

