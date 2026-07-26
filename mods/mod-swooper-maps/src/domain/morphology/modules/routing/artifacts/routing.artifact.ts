import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers publish-once geomorphic routing derived from carved relief before erosion.
 * Morphology erosion and landform planning consume this snapshot; Hydrology derives its
 * separate depression-conditioned drainage evidence from final Morphology topography.
 */
export const artifact = defineArtifact({
  name: "routing",
  id: "artifact:morphology.routing",
  schema: Type.Object(
    {
      flowDir: TypedArraySchemas.i32({
        description: "Steepest-descent receiver index per tile (or -1 for sinks/edges).",
      }),
      flowAccum: TypedArraySchemas.f32({ description: "Drainage area proxy per tile." }),
      basinId: TypedArraySchemas.i32({
        description: "Drainage basin identifier per tile (or -1 when unassigned).",
      }),
    },
    {
      description:
        "Immutable Morphology drainage routing snapshot with one receiver and accumulation value per tile.",
    }
  ),
  refine: (input: unknown, context?: ArtifactValidationContext): ArtifactValidationIssue[] => {
    const value = input as Static<typeof artifact.schema>;
    const errors: ArtifactValidationIssue[] = [];
    const size = artifactCellCount(context);
    const candidate = value as { flowDir?: unknown; flowAccum?: unknown; basinId?: unknown };
    appendArtifactTypedArrayIssues(errors, "routing.flowDir", candidate.flowDir, Int32Array, size);
    appendArtifactTypedArrayIssues(
      errors,
      "routing.flowAccum",
      candidate.flowAccum,
      Float32Array,
      size
    );
    appendArtifactTypedArrayIssues(errors, "routing.basinId", candidate.basinId, Int32Array, size);
    return errors;
  },
});
