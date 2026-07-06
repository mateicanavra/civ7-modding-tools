import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
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

export const artifact = defineArtifact({
  name: "foundationPlates",
  id: "artifact:map.foundationPlates",
  schema: Schema,
});

function validateTensorLength(
  issues: { message: string }[],
  name: string,
  tensor: { length: number } | null | undefined,
  size: number
): void {
  if (!tensor || typeof tensor.length !== "number") {
    issues.push({ message: `[FoundationArtifact] Missing ${name} tensor.` });
    return;
  }
  if (tensor.length !== size) {
    issues.push({
      message: `[FoundationArtifact] ${name} tensor length mismatch (expected ${size}, received ${tensor.length}).`,
    });
  }
}

export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const schemaIssues = validateArtifactSchema(Schema, value);
  if (!context?.dimensions) return schemaIssues;
  if (!value || typeof value !== "object") {
    return Object.freeze([
      ...schemaIssues,
      { message: "[FoundationArtifact] Missing foundation plates artifact payload." },
    ]);
  }

  const plates = value as {
    id?: { length: number };
    boundaryCloseness?: { length: number };
    boundaryType?: { length: number };
    tectonicStress?: { length: number };
    upliftPotential?: { length: number };
    riftPotential?: { length: number };
    shieldStability?: { length: number };
    volcanism?: { length: number };
    movementU?: { length: number };
    movementV?: { length: number };
    rotation?: { length: number };
  };
  const width = context.dimensions.width | 0;
  const height = context.dimensions.height | 0;
  const size = Math.max(0, width * height) | 0;
  const issues = [...schemaIssues];

  validateTensorLength(issues, "plateId", plates.id, size);
  validateTensorLength(issues, "boundaryCloseness", plates.boundaryCloseness, size);
  validateTensorLength(issues, "boundaryType", plates.boundaryType, size);
  validateTensorLength(issues, "tectonicStress", plates.tectonicStress, size);
  validateTensorLength(issues, "upliftPotential", plates.upliftPotential, size);
  validateTensorLength(issues, "riftPotential", plates.riftPotential, size);
  validateTensorLength(issues, "shieldStability", plates.shieldStability, size);
  validateTensorLength(issues, "volcanism", plates.volcanism, size);
  validateTensorLength(issues, "plateMovementU", plates.movementU, size);
  validateTensorLength(issues, "plateMovementV", plates.movementV, size);
  validateTensorLength(issues, "plateRotation", plates.rotation, size);

  return Object.freeze(issues);
}
