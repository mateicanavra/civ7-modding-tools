import {
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/** Runtime schema for the exact habitat, legality, and intensity fields used during planning. */
const Schema = Type.Object(
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

/**
 * Registers the exact habitat, legality, and intensity surfaces under which
 * each symbolic resource demand was planned and later support-adjusted.
 */
export const artifact = defineArtifact({
  name: "resourceEligibility",
  id: "artifact:placement.resourceEligibility",
  schema: Schema,
  refine: validateLocal,
});

function issue(message: string): ArtifactValidationIssue {
  return { message };
}

/** Requires unique resource rows and map-sized habitat, legality, and intensity fields. */
function validateLocal(input: unknown): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  const product = value.width * value.height;
  const size = Number.isSafeInteger(product) && product > 0 ? product : undefined;
  if (size === undefined) {
    issues.push(
      issue(
        `resourceEligibility has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      )
    );
  }
  const seenTypes = new Set<string>();
  for (const row of value.rows) {
    const type = row.resourceType;
    if (seenTypes.has(type))
      issues.push(issue(`resourceEligibility row ${type} appears more than once.`));
    seenTypes.add(type);
    appendArtifactTypedArrayIssues(
      issues,
      `resourceEligibility ${type}.habitatMask`,
      row.habitatMask,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      `resourceEligibility ${type}.legalMask`,
      row.legalMask,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      `resourceEligibility ${type}.intensity`,
      row.intensity,
      Float32Array,
      size
    );
  }
  return issues;
}
