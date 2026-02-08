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
      ecologyArtifacts.featureIntentsWetlands,
      ecologyArtifacts.featureIntentsReefs,
      ecologyArtifacts.featureIntentsIce,
    ],
  },
  ops: {
    vegetationSubstrate: ecology.ops.computeVegetationSubstrate,
    vegetationScoreForest: ecology.ops.scoreVegetationForest,
    vegetationScoreRainforest: ecology.ops.scoreVegetationRainforest,
    vegetationScoreTaiga: ecology.ops.scoreVegetationTaiga,
    vegetationScoreSavannaWoodland: ecology.ops.scoreVegetationSavannaWoodland,
    vegetationScoreSagebrushSteppe: ecology.ops.scoreVegetationSagebrushSteppe,
    wetlands: ecology.ops.planWetlands,
    reefs: ecology.ops.planReefs,
    ice: ecology.ops.planIce,
    wetPlacementMarsh: {
      contract: ecology.ops.planWetPlacementMarsh,
      defaultStrategy: "disabled",
    },
    wetPlacementTundraBog: {
      contract: ecology.ops.planWetPlacementTundraBog,
      defaultStrategy: "disabled",
    },
    wetPlacementMangrove: {
      contract: ecology.ops.planWetPlacementMangrove,
      defaultStrategy: "disabled",
    },
    wetPlacementOasis: {
      contract: ecology.ops.planWetPlacementOasis,
      defaultStrategy: "disabled",
    },
    wetPlacementWateringHole: {
      contract: ecology.ops.planWetPlacementWateringHole,
      defaultStrategy: "disabled",
    },
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
        { additionalProperties: false, default: {} }
      ),
    },
    { additionalProperties: false, description: "Configuration for planning ecology features." }
  ),
});

export default FeaturesPlanStepContract;
