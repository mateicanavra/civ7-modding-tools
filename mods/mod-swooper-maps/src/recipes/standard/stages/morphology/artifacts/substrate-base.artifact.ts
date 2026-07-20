import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact } from "@swooper/mapgen-core/authoring/contracts";
import {
  createMorphologySubstrateSchema,
  validateMorphologySubstrate,
} from "./substrate.schema.js";

/** Closed schema for tectonically derived substrate before geomorphic erosion. */
export const Schema = createMorphologySubstrateSchema(
  "Initial Morphology erodibility and sediment fields before geomorphic erosion."
);

/** Registers the base substrate consumed only by geomorphology. */
export const artifact = defineArtifact({
  name: "baseSubstrate",
  id: "artifact:morphology.substrate.base",
  schema: Schema,
});

/** Admits base substrate with exact per-tile cardinality. */
export function validate(value: unknown, context?: ArtifactValidationContext) {
  return validateMorphologySubstrate(Schema, value, context);
}
