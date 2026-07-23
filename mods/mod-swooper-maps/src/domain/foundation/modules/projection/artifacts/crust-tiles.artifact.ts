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
 * Registers Foundation crust properties sampled from mesh cells into tile
 * space for Morphology and diagnostic consumers.
 */
export const artifact = defineArtifact({
  name: "foundationCrustTiles",
  id: "artifact:foundation.crustTiles",
  schema: Type.Object(
    {
      type: TypedArraySchemas.u8(),
      maturity: TypedArraySchemas.f32(),
      thickness: TypedArraySchemas.f32(),
      damage: TypedArraySchemas.u8(),
      age: TypedArraySchemas.u8(),
      buoyancy: TypedArraySchemas.f32(),
      baseElevation: TypedArraySchemas.f32(),
      strength: TypedArraySchemas.f32(),
    },
    {
      additionalProperties: false,
      description: "Evolved crust fields sampled from mesh cells into map-tile space.",
    }
  ),
  refine: (input, context?: ArtifactValidationContext): readonly ArtifactValidationIssue[] => {
    const crust = input as Record<string, unknown>;
    const issues: ArtifactValidationIssue[] = [];
    const size = artifactCellCount(context);
    appendArtifactTypedArrayIssues(issues, "crustTiles.type", crust.type, Uint8Array, size);
    appendArtifactTypedArrayIssues(
      issues,
      "crustTiles.maturity",
      crust.maturity,
      Float32Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "crustTiles.thickness",
      crust.thickness,
      Float32Array,
      size
    );
    appendArtifactTypedArrayIssues(issues, "crustTiles.damage", crust.damage, Uint8Array, size);
    appendArtifactTypedArrayIssues(issues, "crustTiles.age", crust.age, Uint8Array, size);
    appendArtifactTypedArrayIssues(
      issues,
      "crustTiles.buoyancy",
      crust.buoyancy,
      Float32Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "crustTiles.baseElevation",
      crust.baseElevation,
      Float32Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "crustTiles.strength",
      crust.strength,
      Float32Array,
      size
    );
    return Object.freeze(issues);
  },
});
