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
 * Registers tile-space plate identity, motion, boundary, stress, and volcanism
 * fields projected from Foundation mesh truth.
 */
export const artifact = defineArtifact({
  name: "foundationPlates",
  id: "artifact:foundation.plates",
  schema: Type.Object(
    {
      id: TypedArraySchemas.i16(),
      boundaryCloseness: TypedArraySchemas.u8(),
      boundaryType: TypedArraySchemas.u8(),
      tectonicStress: TypedArraySchemas.u8(),
      upliftPotential: TypedArraySchemas.u8(),
      riftPotential: TypedArraySchemas.u8(),
      shieldStability: TypedArraySchemas.u8(),
      volcanism: TypedArraySchemas.u8(),
      movementU: TypedArraySchemas.i8(),
      movementV: TypedArraySchemas.i8(),
      rotation: TypedArraySchemas.i8(),
    },
    {
      additionalProperties: false,
      description: "Plate identity, deformation, stability, and motion projected into tile space.",
    }
  ),
  refine: (input, context?: ArtifactValidationContext): readonly ArtifactValidationIssue[] => {
    const issues: ArtifactValidationIssue[] = [];
    const plates = input as Record<string, unknown>;
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
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicStress",
      plates.tectonicStress,
      Uint8Array,
      size
    );
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
  },
});
