import hydrology from "@mapgen/domain/hydrology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { morphologyArtifacts } from "../../morphology/artifacts.js";
import { hydrologyHydrographyArtifacts } from "../artifacts.js";

/**
 * Lake intent step contract.
 *
 * `planLakes` is declared through `contract.ops`, so the authoring layer owns
 * the op envelope and default strategy injection. The step schema stays empty
 * to avoid a second, divergent config surface for the same operation.
 */
const LakesStepConfigSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Hydrology lake planning config. Produces deterministic lake intent; map-hydrology projects it.",
  }
);

const LakesStepContract = defineStep({
  id: "lakes",
  phase: "hydrology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyArtifacts.topography, hydrologyHydrographyArtifacts.hydrography],
    provides: [
      hydrologyHydrographyArtifacts.lakePlan,
      hydrologyHydrographyArtifacts.riverNetworkMetrics,
    ],
  },
  ops: {
    planLakes: hydrology.ops.planLakes,
    computeRiverNetworkMetrics: hydrology.ops.computeRiverNetworkMetrics,
  },
  schema: LakesStepConfigSchema,
});

export default LakesStepContract;
