import ecology from "@mapgen/domain/ecology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { artifacts as ecologyArtifacts } from "../../../ecology/artifacts/index.js";
import { artifacts as hydrologyClimateBaselineArtifacts } from "../../../hydrology-climate-baseline/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";

/**
 * Defines soil and fertility classification from topography, substrate, and baseline climate.
 * The published pedology truth is shared by biome and resource-basin work rather than
 * recomputed in either consumer.
 */
const PedologyStepContract = defineStep({
  id: "pedology",
  phase: "ecology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      morphologyArtifacts.topography,
      morphologyArtifacts.substrate,
      hydrologyClimateBaselineArtifacts.climateField,
    ],
    provides: [ecologyArtifacts.pedology],
  },
  ops: {
    classify: ecology.ops.classifyPedology,
  },
  schema: Type.Object(
    {},
    {
      description: "Configuration for classifying soils and fertility in the pedology step.",
    }
  ),
});

export default PedologyStepContract;
