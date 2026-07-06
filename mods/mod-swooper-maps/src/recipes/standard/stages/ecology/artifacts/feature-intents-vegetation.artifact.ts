import { FeaturePlacementSchema } from "@mapgen/domain/ecology/model/schemas/index.js";
import {
  defineArtifact,
  type Static,
  Type,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

export const FeaturePlacementIntentSchema = FeaturePlacementSchema;

export type FeaturePlacementIntent = Static<typeof FeaturePlacementIntentSchema>;

export const FeatureIntentsListArtifactSchema = Type.Array(FeaturePlacementIntentSchema);

export type FeatureIntentsListArtifact = Static<typeof FeatureIntentsListArtifactSchema>;

export const Schema = FeatureIntentsListArtifactSchema;

export const artifact = defineArtifact({
  name: "featureIntentsVegetation",
  id: "artifact:ecology.featureIntents.vegetation",
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

export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
