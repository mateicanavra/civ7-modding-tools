import { FeaturePlacementSchema } from "@mapgen/domain/ecology/model/schemas/index.js";
import {
  defineArtifact,
  type Static,
  Type,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Closed row contract for one ice placement intent selected by Ecology. */
export const FeaturePlacementIntentSchema = FeaturePlacementSchema;

/** Ordered ice intent list consumed later by map-ecology projection. */
export const FeatureIntentsListArtifactSchema = Type.Array(FeaturePlacementIntentSchema);

export type FeatureIntentsListArtifact = Static<typeof FeatureIntentsListArtifactSchema>;

/** Canonical schema entrypoint for registering and validating ice intent. */
export const Schema = FeatureIntentsListArtifactSchema;

/**
 * Registers deterministic ice intent selected from Ecology score, biome, and occupancy truth.
 * Map projection consumes these rows later, keeping feature choice separate from Civ7
 * acceptance.
 */
export const artifact = defineArtifact({
  name: "featureIntentsIce",
  id: "artifact:ecology.featureIntents.ice",
  schema: Schema,
});

export type ArtifactValidationIssue = Readonly<{ message: string }>;

function isFeatureIntentsListArtifact(value: unknown): value is FeatureIntentsListArtifact {
  return Array.isArray(value);
}

function validatePayload(value: unknown): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isFeatureIntentsListArtifact(value)) {
    errors.push({ message: "Invalid feature intents artifact payload." });
    return errors;
  }
  return errors;
}

/** Returns combined schema and feature-intent-list issues for ice intent without throwing. */
export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
