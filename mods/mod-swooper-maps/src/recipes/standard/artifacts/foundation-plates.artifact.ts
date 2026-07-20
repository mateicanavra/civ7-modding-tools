import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Foundation plates artifact payload (tile-space plate tensors). */
export const Schema = Type.Object(
  {
    /** Plate id per tile. */
    id: TypedArraySchemas.i16({ description: "Plate id per tile." }),
    /** Boundary proximity per tile (0..255). */
    boundaryCloseness: TypedArraySchemas.u8({
      description: "Boundary proximity per tile (0..255).",
    }),
    /** Boundary type per tile (BOUNDARY_TYPE values). */
    boundaryType: TypedArraySchemas.u8({
      description: "Boundary type per tile (BOUNDARY_TYPE values).",
    }),
    /** Tectonic stress per tile (0..255). */
    tectonicStress: TypedArraySchemas.u8({ description: "Tectonic stress per tile (0..255)." }),
    /** Uplift potential per tile (0..255). */
    upliftPotential: TypedArraySchemas.u8({ description: "Uplift potential per tile (0..255)." }),
    /** Rift potential per tile (0..255). */
    riftPotential: TypedArraySchemas.u8({ description: "Rift potential per tile (0..255)." }),
    /** Shield stability per tile (0..255). */
    shieldStability: TypedArraySchemas.u8({ description: "Shield stability per tile (0..255)." }),
    /** Volcanism per tile (0..255). */
    volcanism: TypedArraySchemas.u8({ description: "Volcanism per tile (0..255)." }),
    /** Plate movement U component per tile (-127..127). */
    movementU: TypedArraySchemas.i8({
      description: "Plate movement U component per tile (-127..127).",
    }),
    /** Plate movement V component per tile (-127..127). */
    movementV: TypedArraySchemas.i8({
      description: "Plate movement V component per tile (-127..127).",
    }),
    /** Plate rotation per tile (-127..127). */
    rotation: TypedArraySchemas.i8({ description: "Plate rotation per tile (-127..127)." }),
  },
  { description: "Foundation plates artifact payload (tile-space plate tensors)." }
);

/**
 * Registers tile-space plate identity, motion, boundary, stress, and volcanism
 * fields projected from Foundation mesh truth.
 */
export const artifact = defineArtifact({
  name: "foundationPlates",
  id: "artifact:map.foundationPlates",
  schema: Schema,
});

/** Validates the plate-field schema and exact map-sized cardinality of every tensor. */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const issues = [...validateArtifactSchema(Schema, value)];
  if (value === null || typeof value !== "object") {
    if (context?.dimensions) {
      issues.push({ message: "[FoundationArtifact] Missing foundation plates artifact payload." });
    }
    return Object.freeze(issues);
  }

  const plates = value as Record<string, unknown>;
  const size = artifactCellCount(context);
  appendArtifactTypedArrayIssues(issues, "plateId", plates.id, Int16Array, size);
  appendArtifactTypedArrayIssues(
    issues,
    "boundaryCloseness",
    plates.boundaryCloseness,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(issues, "boundaryType", plates.boundaryType, Uint8Array, size);
  appendArtifactTypedArrayIssues(issues, "tectonicStress", plates.tectonicStress, Uint8Array, size);
  appendArtifactTypedArrayIssues(
    issues,
    "upliftPotential",
    plates.upliftPotential,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(issues, "riftPotential", plates.riftPotential, Uint8Array, size);
  appendArtifactTypedArrayIssues(
    issues,
    "shieldStability",
    plates.shieldStability,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(issues, "volcanism", plates.volcanism, Uint8Array, size);
  appendArtifactTypedArrayIssues(issues, "plateMovementU", plates.movementU, Int8Array, size);
  appendArtifactTypedArrayIssues(issues, "plateMovementV", plates.movementV, Int8Array, size);
  appendArtifactTypedArrayIssues(issues, "plateRotation", plates.rotation, Int8Array, size);

  return Object.freeze(issues);
}
