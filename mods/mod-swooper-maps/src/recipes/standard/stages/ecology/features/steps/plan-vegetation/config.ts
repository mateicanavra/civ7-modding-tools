import {
  default as ecology,
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "@mapgen/domain/ecology";
import { artifacts as hydrologyArtifacts } from "@mapgen/domain/hydrology";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the final ordered Ecology family planner. It combines habitat truth with
 * post-wetland occupancy, publishes vegetation intent, and closes the deterministic occupancy
 * chain before projection.
 */
export const PlanVegetationStepContract = defineStep({
  id: "plan-vegetation",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      ecologyArtifacts.biomeClassification,
      ecologyArtifacts.scoreLayers,
      ecologyArtifacts.occupancyWetlands,
      hydrologyArtifacts.climateIndices,
      hydrologyArtifacts.hydrography,
      hydrologyArtifacts.lakePlan,
      morphologyArtifacts.topography,
      morphologyArtifacts.mountains,
      morphologyArtifacts.volcanoes,
    ],
    provides: [ecologyArtifactModules.featureIntentsVegetation],
  },
  ops: {
    planVegetation: ecology.ops.planVegetation,
  },
  schema: Type.Object(
    {},
    {
      description:
        "Deterministic vegetation-family planning. Consumes score layers and the final upstream occupancy vintage, then publishes vegetation intent.",
    }
  ),
});
