import { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";
import morphology, { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Plans volcanic placements (truth-only intent).
 */
export const VolcanoesStepContract = defineStep({
  id: "volcanoes",
  requires: [],
  artifacts: {
    requires: [foundationArtifacts.plates, morphologyArtifacts.topography],
    provides: [morphologyArtifacts.volcanoes],
  },
  provides: [],
  ops: {
    volcanoes: morphology.ops.planVolcanoes,
  },
  schema: Type.Object({}),
});
