import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact } from "@swooper/mapgen-core/authoring/contracts";
import {
  createMorphologyTopographySchema,
  validateMorphologyTopography,
} from "./topography.schema.js";

/** Closed schema for eroded topography before island-chain edits. */
export const Schema = createMorphologyTopographySchema(
  "Morphology topography after geomorphic erosion and before island-chain edits."
);

/** Registers the eroded topography consumed only by island planning. */
export const artifact = defineArtifact({
  name: "erodedTopography",
  id: "artifact:morphology.topography.eroded",
  schema: Schema,
});

/** Admits eroded topography with exact per-tile cardinality. */
export function validate(value: unknown, context?: ArtifactValidationContext) {
  return validateMorphologyTopography(Schema, value, context);
}
