import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers tile-space origin, drift, and most-recent-boundary provenance
 * projected from Foundation's reconstructed tectonic history.
 */
export const artifact = defineArtifact({
  name: "foundationTectonicProvenanceTiles",
  id: "artifact:foundation.tectonicProvenanceTiles",
  schema: Type.Object(
    {
      version: Type.Integer({ minimum: 1 }),
      originEra: TypedArraySchemas.u8(),
      originPlateId: TypedArraySchemas.i16(),
      driftDistance: TypedArraySchemas.u8(),
      lastBoundaryEra: TypedArraySchemas.u8(),
      lastBoundaryType: TypedArraySchemas.u8(),
    },
    {
      additionalProperties: false,
      description: "Origin and most-recent-boundary lineage projected into map-tile space.",
    }
  ),
  refine: (input, context?: ArtifactValidationContext): readonly ArtifactValidationIssue[] => {
    const provenance = input as Record<string, unknown>;
    const issues: ArtifactValidationIssue[] = [];
    const size = artifactCellCount(context);
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicProvenanceTiles.originEra",
      provenance.originEra,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicProvenanceTiles.originPlateId",
      provenance.originPlateId,
      Int16Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicProvenanceTiles.driftDistance",
      provenance.driftDistance,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicProvenanceTiles.lastBoundaryEra",
      provenance.lastBoundaryEra,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicProvenanceTiles.lastBoundaryType",
      provenance.lastBoundaryType,
      Uint8Array,
      size
    );
    return Object.freeze(issues);
  },
});
