import ecology from "@mapgen/domain/ecology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "../../../ecology/artifacts/index.js";
import { artifacts as hydrologyHydrographyArtifacts } from "../../../hydrology-hydrography/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";

/**
 * Defines the final ordered Ecology family planner. It combines habitat truth with
 * post-wetland occupancy, publishes vegetation intent, and closes the deterministic occupancy
 * chain before projection.
 */
const PlanVegetationStepContract = defineStep({
  id: "plan-vegetation",
  phase: "ecology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      ecologyArtifacts.biomeClassification,
      ecologyArtifacts.scoreLayers,
      ecologyArtifacts.occupancyWetlands,
      hydrologyHydrographyArtifacts.hydrography,
      hydrologyHydrographyArtifacts.lakePlan,
      morphologyArtifacts.topography,
      morphologyArtifacts.mountains,
      morphologyArtifacts.volcanoes,
    ],
    provides: [
      ecologyArtifactModules.featureIntentsVegetation,
      ecologyArtifactModules.occupancyVegetation,
    ],
  },
  ops: {
    planVegetation: ecology.ops.planVegetation,
  },
  schema: Type.Object(
    {},
    {
      description:
        "Deterministic vegetation-family planning. Consumes scoreLayers + occupancy and publishes vegetation intents + an updated occupancy snapshot.",
    }
  ),
});

export default PlanVegetationStepContract;
