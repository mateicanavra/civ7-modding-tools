import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import morphology from "../../../../../../../domain/morphology/index.js";
import { artifacts as coastsArtifacts } from "../../../../../../../domain/morphology/modules/coasts/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "../../../../../../../domain/hydrology/modules/hydrography/artifacts/index.js";

export const config = defineStep({
  id: "resolved-coastline",
  requires: [hydrographyArtifacts.hydrography],
  provides: [coastsArtifacts.resolvedCoastline],
  ops: {
    adjacency: morphology.coasts.ops.computeCoastalAdjacency,
    distanceToCoast: morphology.coasts.ops.computeDistanceToCoast,
  },
});
