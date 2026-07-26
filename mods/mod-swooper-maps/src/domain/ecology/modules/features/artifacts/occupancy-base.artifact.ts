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
 * Registers the initial Ecology occupancy snapshot produced with score layers. Zero means
 * claimable, nonzero means claimed, and the blocked mask prevents every later family planner
 * from independently redefining eligibility.
 */
export const artifact = defineArtifact({
  name: "occupancyBase",
  id: "artifact:ecology.occupancy.base",
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
      description: "Initial Ecology feature claims and permanent reservations.",
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
