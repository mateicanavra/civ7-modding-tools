import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";
import {
  BathymetryFieldSchema,
  ElevationFieldSchema,
  LandMaskSchema,
  SeaLevelDatumSchema,
} from "../../../model/atoms/index.js";

/** Registers the base topography consumed only by coastline carving. */
export const artifact = defineArtifact({
  name: "baseTopography",
  id: "artifact:morphology.topography.base",
  schema: Type.Object(
    {
      elevation: ElevationFieldSchema,
      seaLevel: SeaLevelDatumSchema,
      landMask: LandMaskSchema,
      bathymetry: BathymetryFieldSchema,
    },
    {
      additionalProperties: false,
      description: "Initial Morphology topography before coastline carving.",
    }
  ),
  refine: (
    value: unknown,
    context?: ArtifactValidationContext
  ): readonly ArtifactValidationIssue[] => {
    const candidate = value as Record<string, unknown>;
    const size = artifactCellCount(context);
    const issues: ArtifactValidationIssue[] = [];
    appendArtifactTypedArrayIssues(
      issues,
      "topography.elevation",
      candidate.elevation,
      Int16Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "topography.landMask",
      candidate.landMask,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "topography.bathymetry",
      candidate.bathymetry,
      Int16Array,
      size
    );
    return issues;
  },
});
