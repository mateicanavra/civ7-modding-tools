import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact } from "@swooper/mapgen-core/authoring/contracts";
import {
  createMorphologyTopographySchema,
  validateMorphologyTopography,
} from "./topography.schema.js";

/** Closed schema for coastline-carved topography used by routing and erosion. */
export const Schema = createMorphologyTopographySchema(
  "Morphology topography after coastline carving and before geomorphic erosion."
);

/** Registers the carved topography consumed by routing and geomorphology. */
export const artifact = defineArtifact({
  name: "carvedTopography",
  id: "artifact:morphology.topography.carved",
  schema: Schema,
});

/** Admits carved topography with exact per-tile cardinality. */
export function validate(value: unknown, context?: ArtifactValidationContext) {
  return validateMorphologyTopography(Schema, value, context);
}
