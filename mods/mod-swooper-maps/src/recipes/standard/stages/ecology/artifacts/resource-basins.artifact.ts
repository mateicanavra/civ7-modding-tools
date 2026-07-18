import {
  defineArtifact,
  type Static,
  Type,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Runtime contract for Ecology's physically scored resource basins, including member plots,
 * per-plot intensity, and basin-level confidence.
 */
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

/** Canonical schema entrypoint for registering and validating resource-basin evidence. */
export const Schema = ResourceBasinsArtifactSchema;

/**
 * Registers Ecology's scored basin groups from pedology, climate, and topography truth.
 * Placement consumes the stable basin evidence without owning or recomputing ecological
 * classification.
 */
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

function validatePayload(value: unknown): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isResourceBasinsArtifact(value)) {
    errors.push({ message: "Invalid resource basins artifact payload." });
    return errors;
  }
  return errors;
}

/**
 * Reports every structural violation in resource-basin evidence.
 *
 * Spatial grid invariants are deliberately absent: this artifact contains sparse basin members,
 * not map-sized fields. Artifact admission uses the returned issues to refuse malformed basin
 * records without creating a second owner for map-setup dimensions.
 */
export function validate(value: unknown): readonly { message: string }[] {
  const schemaIssues = validateArtifactSchema(Schema, value);
  return Object.freeze([...schemaIssues, ...validatePayload(value)]);
}
