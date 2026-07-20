import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Foundation tectonic provenance tiles artifact payload (tile-space provenance scalars). */
export const Schema = Type.Object(
  {
    /** Schema major version. */
    version: Type.Integer({ minimum: 1, description: "Schema major version." }),
    /** Era index of first appearance per tile (0..eraCount-1). */
    originEra: TypedArraySchemas.u8({
      description: "Era index of first appearance per tile (0..eraCount-1).",
    }),
    /** Origin plate id per tile (plate id; -1 for unknown). */
    originPlateId: TypedArraySchemas.i16({
      description: "Origin plate id per tile (plate id; -1 for unknown).",
    }),
    /** Drift distance bucket per tile (0..255). */
    driftDistance: TypedArraySchemas.u8({
      description: "Drift distance bucket per tile (0..255).",
    }),
    /** Era index of most recent boundary event per tile (255 = none). */
    lastBoundaryEra: TypedArraySchemas.u8({
      description: "Era index of most recent boundary event per tile (255 = none).",
    }),
    /** Boundary regime associated with lastBoundaryEra (BOUNDARY_TYPE; 255 = none). */
    lastBoundaryType: TypedArraySchemas.u8({
      description: "Boundary regime associated with lastBoundaryEra (BOUNDARY_TYPE; 255 = none).",
    }),
  },
  {
    description:
      "Foundation tectonic provenance tiles artifact payload (tile-space provenance scalars).",
  }
);

/**
 * Registers tile-space origin, drift, and most-recent-boundary provenance
 * projected from Foundation's reconstructed tectonic history.
 */
export const artifact = defineArtifact({
  name: "foundationTectonicProvenanceTiles",
  id: "artifact:map.foundationTectonicProvenanceTiles",
  schema: Schema,
});

/** Validates the version and map-sized typed arrays, preserving `-1`/`255` sentinels. */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const issues = [...validateArtifactSchema(Schema, value)];
  if (value === null || typeof value !== "object") {
    if (context?.dimensions) {
      issues.push({
        message:
          "[FoundationArtifact] Missing foundation tectonicProvenanceTiles artifact payload.",
      });
    }
    return Object.freeze(issues);
  }

  const provenance = value as Record<string, unknown>;
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
}
