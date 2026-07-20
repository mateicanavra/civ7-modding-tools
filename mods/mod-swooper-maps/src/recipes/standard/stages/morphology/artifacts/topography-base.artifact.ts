import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact } from "@swooper/mapgen-core/authoring/contracts";
import {
  createMorphologyTopographySchema,
  validateMorphologyTopography,
} from "./topography.schema.js";

/** Closed schema for the initial landmass topography before coastline carving. */
export const Schema = createMorphologyTopographySchema(
  "Initial Morphology topography after tectonic relief, sea-level solving, and land classification."
);

/** Registers the base topography consumed only by coastline carving. */
export const artifact = defineArtifact({
  name: "baseTopography",
  id: "artifact:morphology.topography.base",
  schema: Schema,
});

/** Admits base topography with exact per-tile cardinality. */
export function validate(value: unknown, context?: ArtifactValidationContext) {
  return validateMorphologyTopography(Schema, value, context);
}
