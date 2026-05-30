import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import morphology from "@mapgen/domain/morphology";

import { morphologyArtifacts } from "../../morphology/artifacts.js";

/**
 * Mountain planning is Morphology truth, not map projection.
 *
 * Ridges and foothills are planned from belt-driver/topography fields so
 * downstream projection can stamp terrain without deciding where mountains
 * should exist.
 */
const MountainsStepContract = defineStep({
  id: "mountains",
  phase: "morphology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyArtifacts.beltDrivers, morphologyArtifacts.topography],
    provides: [morphologyArtifacts.mountains],
  },
  ops: {
    ridges: morphology.ops.planRidges,
    foothills: morphology.ops.planFoothills,
  },
  schema: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Morphology mountain intent config (op envelopes for morphology/plan-ridges + morphology/plan-foothills).",
    }
  ),
});

export default MountainsStepContract;
