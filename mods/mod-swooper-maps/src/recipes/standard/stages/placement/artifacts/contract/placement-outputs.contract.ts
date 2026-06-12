import { defineArtifact } from "@swooper/mapgen-core/authoring";
import { PlacementOutputsV1Schema } from "../../placement-outputs.js";

/** Terminal placement summary (`artifact:placementOutputs`). One artifact per file by repo convention. */
export const placementOutputsArtifact = defineArtifact({
  name: "placementOutputs",
  id: "artifact:placementOutputs",
  schema: PlacementOutputsV1Schema,
});
