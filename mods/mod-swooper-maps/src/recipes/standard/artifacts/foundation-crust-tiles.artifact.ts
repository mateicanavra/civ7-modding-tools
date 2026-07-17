import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
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
    throw new Error("[FoundationArtifact] Missing foundation crustTiles artifact payload.");
  }
  const crust = value as {
    type?: unknown;
    maturity?: unknown;
    thickness?: unknown;
    damage?: unknown;
    age?: unknown;
    buoyancy?: unknown;
    baseElevation?: unknown;
    strength?: unknown;
  };
  if (!(crust.type instanceof Uint8Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crustTiles.type.");
  }
  if (!(crust.maturity instanceof Float32Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crustTiles.maturity.");
  }
  if (!(crust.thickness instanceof Float32Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crustTiles.thickness.");
  }
  if (!(crust.damage instanceof Uint8Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crustTiles.damage.");
  }
  if (!(crust.age instanceof Uint8Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crustTiles.age.");
  }
  if (!(crust.buoyancy instanceof Float32Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crustTiles.buoyancy.");
  }
  if (!(crust.baseElevation instanceof Float32Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crustTiles.baseElevation.");
  }
  if (!(crust.strength instanceof Float32Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation crustTiles.strength.");
  }

  const expectedLen = Math.max(0, (dims.width | 0) * (dims.height | 0));
  if (
    crust.type.length !== expectedLen ||
    crust.maturity.length !== expectedLen ||
    crust.thickness.length !== expectedLen ||
    crust.damage.length !== expectedLen ||
    crust.age.length !== expectedLen ||
    crust.buoyancy.length !== expectedLen ||
    crust.baseElevation.length !== expectedLen ||
    crust.strength.length !== expectedLen
  ) {
    throw new Error("[FoundationArtifact] Invalid foundation crustTiles tensor lengths.");
  }
}

/** Validates every crust tensor's typed-array kind and one-value-per-tile cardinality. */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  return wrapValidation(value, context);
}
