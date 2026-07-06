import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  defineArtifact,
  type Static,
  Type,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

export const ResourceBasinsArtifactSchema = Type.Object({
  basins: Type.Array(
    Type.Object({
      resourceId: Type.String(),
      plots: Type.Array(Type.Integer({ minimum: 0 })),
      intensity: Type.Array(Type.Number({ minimum: 0 })),
      confidence: Type.Number({ minimum: 0 }),
    })
  ),
});

export type ResourceBasinsArtifact = Static<typeof ResourceBasinsArtifactSchema>;

export const Schema = ResourceBasinsArtifactSchema;

export const artifact = defineArtifact({
  name: "resourceBasins",
  id: "artifact:ecology.resourceBasins",
  schema: Schema,
});

export type ArtifactValidationIssue = Readonly<{ message: string }>;

function isResourceBasinsArtifact(value: unknown): value is ResourceBasinsArtifact {
  if (!value || typeof value !== "object") return false;
  const candidate = value as ResourceBasinsArtifact;
  if (!Array.isArray(candidate.basins)) return false;
  return candidate.basins.every(
    (basin) =>
      basin &&
      typeof basin.resourceId === "string" &&
      Array.isArray(basin.plots) &&
      Array.isArray(basin.intensity) &&
      typeof basin.confidence === "number"
  );
}

function validatePayload(
  value: unknown,
  _dimensions: NonNullable<ArtifactValidationContext["dimensions"]>
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isResourceBasinsArtifact(value)) {
    errors.push({ message: "Invalid resource basins artifact payload." });
    return errors;
  }
  return errors;
}

export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const schemaIssues = validateArtifactSchema(Schema, value);
  if (!context?.dimensions) return schemaIssues;
  return Object.freeze([...schemaIssues, ...validatePayload(value, context.dimensions)]);
}
