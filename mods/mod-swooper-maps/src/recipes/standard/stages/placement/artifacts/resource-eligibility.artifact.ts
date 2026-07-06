import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";

/** Per-type eligibility fields (`artifact:placement.resourceEligibility`). One artifact per file by repo convention. */
const ResourceEligibilityArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    rows: Type.Array(
      Type.Object(
        {
          resourceType: Type.String({ pattern: "^RESOURCE_[A-Z0-9_]+$" }),
          habitatMask: TypedArraySchemas.u8({
            description: "Habitat lane eligibility (1=in-lane).",
          }),
          legalMask: TypedArraySchemas.u8({
            description:
              "Per-resource policy legality from Resource_ValidPlacements rows (1=legal).",
          }),
          intensity: TypedArraySchemas.f32({
            description: "Habitat intensity (0..1).",
          }),
        },
        { additionalProperties: false }
      )
    ),
  },
  {
    additionalProperties: false,
    description:
      "Per-type habitat/legality/intensity fields the resource plan was selected under (S5). Published by the planning step so the post-starts support pass adjusts the plan inside the SAME policy constraints instead of re-deriving them.",
  }
);

export const Schema = ResourceEligibilityArtifactSchema;

export const artifact = defineArtifact({
  name: "resourceEligibility",
  id: "artifact:placement.resourceEligibility",
  schema: Schema,
});

type ValidationIssue = { message: string };

function issue(message: string): ValidationIssue {
  return { message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Validate hooks for the resource planning artifacts (placement-realignment
 * S3 artifact hygiene: placement previously registered zero validators).
 * These check cross-field invariants the schemas cannot express.
 */

function validatePayload(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("resourceEligibility artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  const width = Number(value.width);
  const height = Number(value.height);
  const size = width * height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [
      issue(
        `resourceEligibility has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      ),
    ];
  }
  const rows = Array.isArray(value.rows) ? value.rows : null;
  if (!rows) return [issue("resourceEligibility.rows must be an array.")];
  const seenTypes = new Set<string>();
  for (const row of rows) {
    if (!isRecord(row)) {
      issues.push(issue("resourceEligibility row must be an object."));
      continue;
    }
    const type = String(row.resourceType);
    if (seenTypes.has(type))
      issues.push(issue(`resourceEligibility row ${type} appears more than once.`));
    seenTypes.add(type);
    for (const field of ["habitatMask", "legalMask", "intensity"] as const) {
      const mask = row[field] as { length?: number } | undefined;
      if (!mask || mask.length !== size) {
        issues.push(issue(`resourceEligibility ${type}.${field} length must equal ${size}.`));
      }
    }
  }
  return issues;
}

export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
