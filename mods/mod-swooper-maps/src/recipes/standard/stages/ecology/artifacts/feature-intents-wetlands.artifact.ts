import { FeaturePlacementSchema } from "@mapgen/domain/ecology/model/schemas/index.js";
import {
  defineArtifact,
  type Static,
  Type,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Closed row contract for one wetland placement intent selected by Ecology. */
export const FeaturePlacementIntentSchema = FeaturePlacementSchema;

/** Ordered wetland intent list consumed later by map-ecology projection. */
export const FeatureIntentsListArtifactSchema = Type.Array(FeaturePlacementIntentSchema);

export type FeatureIntentsListArtifact = Static<typeof FeatureIntentsListArtifactSchema>;

/** Canonical schema entrypoint for registering and validating wetland intent. */
export const Schema = FeatureIntentsListArtifactSchema;

/**
 * Registers deterministic wetland-family intent selected from Ecology score, hydrology, and
 * occupancy truth. Map projection consumes these rows later, keeping habitat choice separate
 * from Civ7 acceptance.
 */
export const artifact = defineArtifact({
  name: "featureIntentsWetlands",
  id: "artifact:ecology.featureIntents.wetlands",
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

/** Returns combined schema and feature-intent-list issues for wetland intent without throwing. */
export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
