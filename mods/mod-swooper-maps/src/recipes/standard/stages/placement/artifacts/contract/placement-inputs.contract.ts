import { defineArtifact } from "@swooper/mapgen-core/authoring";
import { PlacementInputsV1Schema } from "../../placement-inputs.js";

/** Shared placement planning inputs (`artifact:placementInputs`). One artifact per file by repo convention. */
export const placementInputsArtifact = defineArtifact({
  name: "placementInputs",
  id: "artifact:placementInputs",
  schema: PlacementInputsV1Schema,
});
