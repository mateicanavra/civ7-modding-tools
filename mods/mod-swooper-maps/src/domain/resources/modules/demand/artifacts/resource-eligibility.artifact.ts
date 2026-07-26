import {
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

type ResourceEligibility = Readonly<{
  width: number;
  height: number;
  rows: readonly Readonly<{
    resourceType: string;
    habitatMask: Uint8Array;
    legalMask: Uint8Array;
    intensity: Float32Array;
  }>[];
}>;

/**
 * Registers the exact habitat, legality, and intensity surfaces under which
 * each symbolic resource demand was planned and later support-adjusted.
 */
export const artifact = defineArtifact({
  name: "resourceEligibility",
  id: "artifact:placement.resourceEligibility",
  schema: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      rows: Type.Array(
        Type.Object(
          {
            resourceType: Type.String({ pattern: "^RESOURCE_[A-Z0-9_]+$" }),
            habitatMask: TypedArraySchemas.u8({
              description: "Habitat lane eligibility per map tile.",
            }),
            legalMask: TypedArraySchemas.u8({
              description: "Official resource-placement policy legality per map tile.",
            }),
            intensity: TypedArraySchemas.f32({
              description: "Habitat suitability intensity per map tile.",
            }),
          },
          { additionalProperties: false }
        )
      ),
    },
    {
      additionalProperties: false,
      description:
        "Per-resource habitat, policy legality, and intensity surfaces retained so adjustment preserves site-selection authority.",
    }
  ),
  refine: (input): readonly ArtifactValidationIssue[] => {
    const value = input as ResourceEligibility;
    const issues: ArtifactValidationIssue[] = [];
    const product = value.width * value.height;
    const size = Number.isSafeInteger(product) && product > 0 ? product : undefined;
    if (size === undefined) {
      issues.push({
        message: `resourceEligibility has invalid dimensions ${String(value.width)}x${String(value.height)}.`,
      });
    }
    const seenTypes = new Set<string>();
    for (const row of value.rows) {
      if (seenTypes.has(row.resourceType)) {
        issues.push({
          message: `resourceEligibility row ${row.resourceType} appears more than once.`,
        });
      }
      seenTypes.add(row.resourceType);
      appendArtifactTypedArrayIssues(
        issues,
        `resourceEligibility ${row.resourceType}.habitatMask`,
        row.habitatMask,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `resourceEligibility ${row.resourceType}.legalMask`,
        row.legalMask,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `resourceEligibility ${row.resourceType}.intensity`,
        row.intensity,
        Float32Array,
        size
      );
    }
    return issues;
  },
});
