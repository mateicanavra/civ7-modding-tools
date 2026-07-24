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

/** Registers the eroded topography consumed only by island planning. */
export const artifact = defineArtifact({
  name: "erodedTopography",
  id: "artifact:morphology.topography.eroded",
  schema: Type.Object(
    {
      elevation: ElevationFieldSchema,
      seaLevel: SeaLevelDatumSchema,
      landMask: LandMaskSchema,
      bathymetry: BathymetryFieldSchema,
    },
    {
      additionalProperties: false,
      description: "Eroded Morphology topography before island-chain edits.",
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
