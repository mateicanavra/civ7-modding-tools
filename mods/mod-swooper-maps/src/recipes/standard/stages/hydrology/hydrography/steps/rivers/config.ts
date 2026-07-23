import hydrology, { artifacts as hydrologyArtifacts } from "@mapgen/domain/hydrology";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

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
  requires: [],
  provides: [],
  artifacts: {
    requires: [hydrologyArtifacts.baselineClimateField, morphologyArtifacts.topography],
    provides: [hydrologyArtifacts.hydrography],
  },
  ops: {
    drainageRouting: hydrology.ops.computeDrainageRouting,
    accumulateDischarge: hydrology.ops.accumulateDischarge,
    projectRiverNetwork: hydrology.ops.projectRiverNetwork,
  },
  schema: RiversStepConfigSchema,
});
