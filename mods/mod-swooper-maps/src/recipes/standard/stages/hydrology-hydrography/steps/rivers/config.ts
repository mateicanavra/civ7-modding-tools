import hydrology from "@mapgen/domain/hydrology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { artifacts as hydrologyClimateBaselineArtifacts } from "../../../hydrology-climate-baseline/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";
import { artifactModules as hydrologyHydrographyArtifactModules } from "../../artifacts/index.js";

/**
 * River projection + hydrography publication step.
 *
 * This step is where Hydrology’s discharge-derived hydrography becomes the canonical pipeline read-path.
 * Engine “modeled rivers” are projection-only and must not replace the authored source evidence.
 */
const RiversStepConfigSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Rivers step config. Controls Hydrology hydrography publication and river classification inputs; engine projection is handled in map-rivers after elevation.",
  }
);

/**
 * Defines canonical drainage, discharge, and river classification from baseline climate and
 * final topography. It publishes Hydrology evidence before map-rivers performs any engine
 * projection.
 */
export const RiversStepContract = defineStep({
  id: "rivers",
  phase: "hydrology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      hydrologyClimateBaselineArtifacts.baselineClimateField,
      morphologyArtifacts.topography,
    ],
    provides: [hydrologyHydrographyArtifactModules.hydrography],
  },
  ops: {
    drainageRouting: hydrology.ops.computeDrainageRouting,
    accumulateDischarge: hydrology.ops.accumulateDischarge,
    projectRiverNetwork: hydrology.ops.projectRiverNetwork,
  },
  schema: RiversStepConfigSchema,
});
