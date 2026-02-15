import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import ecology from "@mapgen/domain/ecology";
import { ecologyArtifacts } from "../../artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../../hydrology-hydrography/artifacts.js";
import { morphologyArtifacts } from "../../../morphology/artifacts.js";

const FeaturesPlanStepContract = defineStep({
  id: "features-plan",
  phase: "ecology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      ecologyArtifacts.biomeClassification,
      ecologyArtifacts.pedology,
      hydrologyHydrographyArtifacts.hydrography,
      morphologyArtifacts.topography,
    ],
    provides: [
      ecologyArtifacts.featureIntentsVegetation,
    ],
  },
  ops: {
    vegetationSubstrate: ecology.ops.computeVegetationSubstrate,
    scoreForest: ecology.ops.scoreVegetationForest,
    scoreRainforest: ecology.ops.scoreVegetationRainforest,
    scoreTaiga: ecology.ops.scoreVegetationTaiga,
    scoreSavannaWoodland: ecology.ops.scoreVegetationSavannaWoodland,
    scoreSagebrushSteppe: ecology.ops.scoreVegetationSagebrushSteppe,
  },
  schema: Type.Object(
    {
      vegetation: Type.Object(
        {
          minScoreThreshold: Type.Number({
            description:
              "Minimum score required for a tile to receive a vegetation feature intent.",
            default: 0.15,
            minimum: 0,
            maximum: 1,
          }),
        },
        { default: {} }
      ),
    },
    { description: "Configuration for planning ecology features." }
  ),
});

export default FeaturesPlanStepContract;
