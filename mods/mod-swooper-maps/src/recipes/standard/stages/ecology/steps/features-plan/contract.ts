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
    vegetationForest: ecology.ops.planVegetationForest,
    vegetationRainforest: ecology.ops.planVegetationRainforest,
    vegetationTaiga: ecology.ops.planVegetationTaiga,
    vegetationSavannaWoodland: ecology.ops.planVegetationSavannaWoodland,
    vegetationSagebrushSteppe: ecology.ops.planVegetationSagebrushSteppe,
    wetlands: ecology.ops.planWetlands,
    reefs: ecology.ops.planReefs,
    ice: ecology.ops.planIce,
    vegetatedPlacementForest: {
      contract: ecology.ops.planVegetatedPlacementForest,
      defaultStrategy: "disabled",
    },
    vegetatedPlacementRainforest: {
      contract: ecology.ops.planVegetatedPlacementRainforest,
      defaultStrategy: "disabled",
    },
    vegetatedPlacementTaiga: {
      contract: ecology.ops.planVegetatedPlacementTaiga,
      defaultStrategy: "disabled",
    },
    vegetatedPlacementSavannaWoodland: {
      contract: ecology.ops.planVegetatedPlacementSavannaWoodland,
      defaultStrategy: "disabled",
    },
    vegetatedPlacementSagebrushSteppe: {
      contract: ecology.ops.planVegetatedPlacementSagebrushSteppe,
      defaultStrategy: "disabled",
    },
    wetFeaturePlacements: {
      contract: ecology.ops.planWetFeaturePlacements,
      defaultStrategy: "disabled",
    },
  },
  schema: Type.Object(
    {},
    { additionalProperties: false, description: "Configuration for planning ecology features." }
  ),
});

export default FeaturesPlanStepContract;
