import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Foundation crust tiles artifact payload (tile-space crust driver tensors). */
export const Schema = Type.Object(
  {
    /** Crust type per tile (0=oceanic, 1=continental), sampled via tileToCellIndex. */
    type: TypedArraySchemas.u8({
      shape: null,
      description: "Crust type per tile (0=oceanic, 1=continental), sampled via tileToCellIndex.",
    }),
    /** Crust maturity per tile (0=basaltic lid, 1=cratonic), sampled via tileToCellIndex. */
    maturity: TypedArraySchemas.f32({
      shape: null,
      description:
        "Crust maturity per tile (0=basaltic lid, 1=cratonic), sampled via tileToCellIndex.",
    }),
    /** Crust thickness proxy per tile (0..1), sampled via tileToCellIndex. */
    thickness: TypedArraySchemas.f32({
      shape: null,
      description: "Crust thickness proxy per tile (0..1), sampled via tileToCellIndex.",
    }),
    /** Crust damage per tile (0..255), sampled via tileToCellIndex. */
    damage: TypedArraySchemas.u8({
      shape: null,
      description: "Crust damage per tile (0..255), sampled via tileToCellIndex.",
    }),
    /** Crust age per tile (0=new, 255=ancient), sampled via tileToCellIndex. */
    age: TypedArraySchemas.u8({
      shape: null,
      description: "Crust thermal age per tile (0=new, 255=ancient), sampled via tileToCellIndex.",
    }),
    /** Crust buoyancy proxy per tile (0..1), sampled via tileToCellIndex. */
    buoyancy: TypedArraySchemas.f32({
      shape: null,
      description: "Crust buoyancy proxy per tile (0..1), sampled via tileToCellIndex.",
    }),
    /** Isostatic base elevation proxy per tile (0..1), sampled via tileToCellIndex. */
    baseElevation: TypedArraySchemas.f32({
      shape: null,
      description: "Isostatic base elevation proxy per tile (0..1), sampled via tileToCellIndex.",
    }),
    /** Lithospheric strength proxy per tile (0..1), sampled via tileToCellIndex. */
    strength: TypedArraySchemas.f32({
      shape: null,
      description: "Lithospheric strength proxy per tile (0..1), sampled via tileToCellIndex.",
    }),
  },
  { description: "Foundation crust tiles artifact payload (tile-space crust driver tensors)." }
);

/**
 * Registers Foundation crust properties sampled from mesh cells into tile
 * space for Morphology and diagnostic consumers.
 */
export const artifact = defineArtifact({
  name: "foundationCrustTiles",
  id: "artifact:map.foundationCrustTiles",
  schema: Schema,
});

/** Validates every crust tensor's typed-array kind and one-value-per-tile cardinality. */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const issues = [...validateArtifactSchema(Schema, value)];
  if (value === null || typeof value !== "object") {
    if (context?.dimensions) {
      issues.push({
        message: "[FoundationArtifact] Missing foundation crustTiles artifact payload.",
      });
    }
    return Object.freeze(issues);
  }

  const crust = value as Record<string, unknown>;
  const size = artifactCellCount(context);
  appendArtifactTypedArrayIssues(issues, "crustTiles.type", crust.type, Uint8Array, size);
  appendArtifactTypedArrayIssues(issues, "crustTiles.maturity", crust.maturity, Float32Array, size);
  appendArtifactTypedArrayIssues(
    issues,
    "crustTiles.thickness",
    crust.thickness,
    Float32Array,
    size
  );
  appendArtifactTypedArrayIssues(issues, "crustTiles.damage", crust.damage, Uint8Array, size);
  appendArtifactTypedArrayIssues(issues, "crustTiles.age", crust.age, Uint8Array, size);
  appendArtifactTypedArrayIssues(issues, "crustTiles.buoyancy", crust.buoyancy, Float32Array, size);
  appendArtifactTypedArrayIssues(
    issues,
    "crustTiles.baseElevation",
    crust.baseElevation,
    Float32Array,
    size
  );
  appendArtifactTypedArrayIssues(issues, "crustTiles.strength", crust.strength, Float32Array, size);

  return Object.freeze(issues);
}
