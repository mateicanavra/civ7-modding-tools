import ecology from "@mapgen/domain/ecology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { artifacts as ecologyArtifacts } from "../../../ecology/artifacts/index.js";
import { artifacts as hydrologyClimateBaselineArtifacts } from "../../../hydrology-climate-baseline/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";

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
