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

/** Registers the carved topography consumed by routing and geomorphology. */
export const artifact = defineArtifact({
  name: "carvedTopography",
  id: "artifact:morphology.topography.carved",
  schema: Type.Object(
    {
      elevation: ElevationFieldSchema,
      seaLevel: SeaLevelDatumSchema,
      landMask: LandMaskSchema,
      bathymetry: BathymetryFieldSchema,
    },
    {
      additionalProperties: false,
      description: "Coastline-carved Morphology topography used by routing and erosion.",
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
