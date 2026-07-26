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

/** Registers the canonical final topography consumed by downstream stages. */
export const artifact = defineArtifact({
  name: "topography",
  id: "artifact:morphology.topography",
  schema: Type.Object(
    {
      elevation: ElevationFieldSchema,
      seaLevel: SeaLevelDatumSchema,
      landMask: LandMaskSchema,
      bathymetry: BathymetryFieldSchema,
    },
    {
      additionalProperties: false,
      description: "Final Morphology topography consumed throughout the remaining recipe.",
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
