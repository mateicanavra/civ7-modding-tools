import { defineArtifact } from "@swooper/mapgen-core/authoring/contracts";
import { PlacementInputsV1Schema } from "../placement-inputs.js";

/** Shared placement planning inputs (`artifact:placementInputs`). One artifact per file by repo convention. */

export const Schema = PlacementInputsV1Schema;

export const artifact = defineArtifact({
  name: "placementInputs",
  id: "artifact:placementInputs",
  schema: Schema,
});

export const placementInputsArtifact = artifact;
