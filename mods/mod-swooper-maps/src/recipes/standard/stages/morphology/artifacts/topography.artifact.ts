import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact } from "@swooper/mapgen-core/authoring/contracts";
import {
  createMorphologyTopographySchema,
  validateMorphologyTopography,
} from "./topography.schema.js";

/** Closed schema for the final topography consumed throughout the remaining recipe. */
export const Schema = createMorphologyTopographySchema(
  "Final Morphology topography after erosion and island-chain edits."
);

/** Registers the canonical final topography consumed by downstream stages. */
export const artifact = defineArtifact({
  name: "topography",
  id: "artifact:morphology.topography",
  schema: Schema,
});

/** Admits final topography with exact per-tile cardinality. */
export function validate(value: unknown, context?: ArtifactValidationContext) {
  return validateMorphologyTopography(Schema, value, context);
}
