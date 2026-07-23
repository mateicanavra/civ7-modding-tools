import hydrology, {
  artifactModules as hydrologyHydrographyArtifactModules,
  artifacts as hydrologyHydrographyArtifacts,
} from "@mapgen/domain/hydrology";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

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

/**
 * Defines deterministic lake intent and river-network metrics from canonical hydrography and
 * topography. It plans Hydrology truth only; map-hydrology owns later Civ7 water
 * materialization.
 */
export const LakesStepContract = defineStep({
  id: "lakes",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyArtifacts.topography, hydrologyHydrographyArtifacts.hydrography],
    provides: [
      hydrologyHydrographyArtifactModules.lakePlan,
      hydrologyHydrographyArtifactModules.riverNetwork,
    ],
  },
  ops: {
    planLakes: hydrology.ops.planLakes,
    computeRiverNetworkMetrics: hydrology.ops.computeRiverNetworkMetrics,
  },
  schema: LakesStepConfigSchema,
});
