import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
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

function wrapValidation(
  value: unknown,
  context: ArtifactValidationContext | undefined
): readonly { message: string }[] {
  const schemaIssues = validateArtifactSchema(Schema, value);
  if (!context?.dimensions) return schemaIssues;
  try {
    validatePayload(value, context.dimensions);
    return schemaIssues;
  } catch (error) {
    return Object.freeze([
      ...schemaIssues,
      { message: error instanceof Error ? error.message : String(error) },
    ]);
  }
}

function validatePayload(
  value: unknown,
  dims: NonNullable<ArtifactValidationContext["dimensions"]>
): void {
  if (!value || typeof value !== "object") {
    throw new Error(
      "[FoundationArtifact] Missing foundation tectonicProvenanceTiles artifact payload."
    );
  }
  const provenance = value as {
    version?: unknown;
    originEra?: unknown;
    originPlateId?: unknown;
    driftDistance?: unknown;
    lastBoundaryEra?: unknown;
    lastBoundaryType?: unknown;
  };
  const version = typeof provenance.version === "number" ? provenance.version | 0 : 0;
  if (version <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicProvenanceTiles.version.");
  }

  const expectedLen = Math.max(0, (dims.width | 0) * (dims.height | 0));
  if (
    !(provenance.originEra instanceof Uint8Array) ||
    provenance.originEra.length !== expectedLen
  ) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicProvenanceTiles.originEra.");
  }
  if (
    !(provenance.originPlateId instanceof Int16Array) ||
    provenance.originPlateId.length !== expectedLen
  ) {
    throw new Error(
      "[FoundationArtifact] Invalid foundation tectonicProvenanceTiles.originPlateId."
    );
  }
  if (
    !(provenance.driftDistance instanceof Uint8Array) ||
    provenance.driftDistance.length !== expectedLen
  ) {
    throw new Error(
      "[FoundationArtifact] Invalid foundation tectonicProvenanceTiles.driftDistance."
    );
  }
  if (
    !(provenance.lastBoundaryEra instanceof Uint8Array) ||
    provenance.lastBoundaryEra.length !== expectedLen
  ) {
    throw new Error(
      "[FoundationArtifact] Invalid foundation tectonicProvenanceTiles.lastBoundaryEra."
    );
  }
  if (
    !(provenance.lastBoundaryType instanceof Uint8Array) ||
    provenance.lastBoundaryType.length !== expectedLen
  ) {
    throw new Error(
      "[FoundationArtifact] Invalid foundation tectonicProvenanceTiles.lastBoundaryType."
    );
  }
}

/** Validates the version and map-sized typed arrays, preserving `-1`/`255` sentinels. */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  return wrapValidation(value, context);
}
