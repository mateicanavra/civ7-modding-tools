import { defineArtifact } from "@swooper/mapgen-core/authoring/contracts";
import { PlacementOutputsV1Schema } from "../placement-outputs.js";

/** Terminal placement summary (`artifact:placementOutputs`). One artifact per file by repo convention. */

export const Schema = PlacementOutputsV1Schema;

export const artifact = defineArtifact({
  name: "placementOutputs",
  id: "artifact:placementOutputs",
  schema: Schema,
});

export const placementOutputsArtifact = artifact;
