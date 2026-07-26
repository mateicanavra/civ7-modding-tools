import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

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
              cardinality: ["width", "height"],
              description: "Habitat lane eligibility per map tile.",
            }),
            legalMask: TypedArraySchemas.u8({
              cardinality: ["width", "height"],
              description: "Official resource-placement policy legality per map tile.",
            }),
            intensity: TypedArraySchemas.f32({
              cardinality: ["width", "height"],
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
  refine: (value, { issues }) => {
    const product = value.width * value.height;
    if (!Number.isSafeInteger(product) || product <= 0) {
      issues.add(
        `resourceEligibility has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      );
    }
    const seenTypes = new Set<string>();
    for (const row of value.rows) {
      if (seenTypes.has(row.resourceType)) {
        issues.add(`resourceEligibility row ${row.resourceType} appears more than once.`);
      }
      seenTypes.add(row.resourceType);
    }
  },
});
