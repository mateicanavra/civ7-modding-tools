import hydrology from "@mapgen/domain/hydrology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { hydrologyClimateBaselineArtifacts } from "../../hydrology-climate-baseline/artifacts.js";
import { morphologyArtifacts } from "../../morphology/artifacts.js";
import { hydrologyHydrographyArtifacts } from "../artifacts.js";

/**
 * River projection + hydrography publication step.
 *
 * This step is where Hydrology’s discharge-derived hydrography becomes the canonical pipeline read-path.
 * Engine “modeled rivers” are projection-only and must not be treated as truth.
 */
const RiversStepConfigSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Rivers step config. Controls Hydrology hydrography publication and river classification inputs; engine projection is handled in map-rivers after elevation.",
  }
);

const RiversStepContract = defineStep({
  id: "rivers",
  phase: "hydrology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [hydrologyClimateBaselineArtifacts.climateField, morphologyArtifacts.topography],
    provides: [hydrologyHydrographyArtifacts.hydrography],
  },
  ops: {
    drainageRouting: hydrology.ops.computeDrainageRouting,
    accumulateDischarge: hydrology.ops.accumulateDischarge,
    projectRiverNetwork: hydrology.ops.projectRiverNetwork,
  },
  schema: RiversStepConfigSchema,
});

export default RiversStepContract;
