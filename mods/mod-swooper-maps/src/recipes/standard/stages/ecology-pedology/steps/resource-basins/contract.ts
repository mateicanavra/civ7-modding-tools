import ecology from "@mapgen/domain/ecology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "../../../ecology/artifacts/index.js";
import { artifacts as hydrologyClimateBaselineArtifacts } from "../../../hydrology-climate-baseline/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";

/**
 * Defines Ecology's resource-basin scoring and planning boundary over pedology, climate, and
 * topography truth. It publishes basin evidence for placement without selecting or stamping
 * Civ7 resources.
 */
const ResourceBasinsStepContract = defineStep({
  id: "resource-basins",
  phase: "ecology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      ecologyArtifacts.pedology,
      morphologyArtifacts.topography,
      hydrologyClimateBaselineArtifacts.climateField,
    ],
    provides: [ecologyArtifactModules.resourceBasins],
  },
  ops: {
    plan: ecology.ops.planResourceBasins,
    score: ecology.ops.scoreResourceBasins,
  },
  schema: Type.Object(
    {},
    {
      description: "Configuration for planning and scoring resource basins.",
    }
  ),
});

export default ResourceBasinsStepContract;
