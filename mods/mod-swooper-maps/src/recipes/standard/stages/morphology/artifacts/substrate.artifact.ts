import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact } from "@swooper/mapgen-core/authoring/contracts";
import {
  createMorphologySubstrateSchema,
  validateMorphologySubstrate,
} from "./substrate.schema.js";

/** Closed schema for the final substrate consumed by landform and Ecology stages. */
export const Schema = createMorphologySubstrateSchema(
  "Final Morphology erodibility and sediment fields after geomorphic erosion and deposition."
);

/** Registers the canonical final substrate consumed by downstream stages. */
export const artifact = defineArtifact({
  name: "substrate",
  id: "artifact:morphology.substrate",
  schema: Schema,
});

/** Admits final substrate with exact per-tile cardinality. */
export function validate(value: unknown, context?: ArtifactValidationContext) {
  return validateMorphologySubstrate(Schema, value, context);
}
