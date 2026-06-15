import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring";

/** Per-type eligibility fields (`artifact:placement.resourceEligibility`). One artifact per file by repo convention. */
const ResourceEligibilityArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    rows: Type.Array(
      Type.Object(
        {
          resourceType: Type.String({ pattern: "^RESOURCE_[A-Z0-9_]+$" }),
          resourceTypeId: Type.Integer({ minimum: 0 }),
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

export const resourceEligibilityArtifact = defineArtifact({
  name: "resourceEligibility",
  id: "artifact:placement.resourceEligibility",
  schema: ResourceEligibilityArtifactSchema,
});
