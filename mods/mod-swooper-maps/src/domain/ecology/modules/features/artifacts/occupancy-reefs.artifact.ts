import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";
import {
  FeatureOccupancyMaskSchema,
  FeatureReservationMaskSchema,
} from "../model/atoms/feature-occupancy.schema.js";

type Occupancy = Readonly<{
  width: number;
  height: number;
  featureOccupancyMask: Uint8Array;
  reserved: Uint8Array;
}>;

/**
 * Registers occupancy after reef planning. Wetland planning consumes this exact snapshot,
 * making family ordering deterministic and preventing a tile from being claimed twice.
 */
export const artifact = defineArtifact({
  name: "occupancyReefs",
  id: "artifact:ecology.occupancy.reefs",
  schema: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map-grid width represented by both masks." }),
      height: Type.Integer({
        minimum: 1,
        description: "Map-grid height represented by both masks.",
      }),
      featureOccupancyMask: FeatureOccupancyMaskSchema,
      reserved: FeatureReservationMaskSchema,
    },
    {
      additionalProperties: false,
      description: "Ecology feature claims and reservations after reef planning.",
    }
  ),
  refine: (
    input: unknown,
    context?: ArtifactValidationContext
  ): readonly ArtifactValidationIssue[] => {
    const value = input as Occupancy;
    const issues: ArtifactValidationIssue[] = [];
    const dimensions = context?.dimensions;
    const size = artifactCellCount(context);
    if (dimensions && (value.width !== dimensions.width || value.height !== dimensions.height)) {
      issues.push({ message: "Occupancy dimensions mismatch." });
    }
    appendArtifactTypedArrayIssues(
      issues,
      "featureOccupancyMask",
      value.featureOccupancyMask,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(issues, "reserved", value.reserved, Uint8Array, size);
    return issues;
  },
});
