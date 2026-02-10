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
    scoreVegetationForest: ecology.ops.scoreVegetationForest,
    scoreVegetationRainforest: ecology.ops.scoreVegetationRainforest,
    scoreVegetationTaiga: ecology.ops.scoreVegetationTaiga,
    scoreVegetationSavannaWoodland: ecology.ops.scoreVegetationSavannaWoodland,
    scoreVegetationSagebrushSteppe: ecology.ops.scoreVegetationSagebrushSteppe,
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

export default ScoreLayersStepContract;
