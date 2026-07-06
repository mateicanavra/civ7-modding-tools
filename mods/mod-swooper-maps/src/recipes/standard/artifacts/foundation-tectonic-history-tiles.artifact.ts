import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Foundation tectonic history tiles era payload (tile-space era fields). */
const FoundationTectonicHistoryTilesEraArtifactSchema = Type.Object(
  {
    /** Boundary type per tile (BOUNDARY_TYPE values). */
    boundaryType: TypedArraySchemas.u8({
      description: "Boundary type per tile (BOUNDARY_TYPE values).",
    }),
    /** Convergent mask per tile (0/1). */
    convergentMask: TypedArraySchemas.u8({ description: "Convergent mask per tile (0/1)." }),
    /** Divergent mask per tile (0/1). */
    divergentMask: TypedArraySchemas.u8({ description: "Divergent mask per tile (0/1)." }),
    /** Transform mask per tile (0/1). */
    transformMask: TypedArraySchemas.u8({ description: "Transform mask per tile (0/1)." }),
    /** Uplift potential per tile (0..255). */
    upliftPotential: TypedArraySchemas.u8({ description: "Uplift potential per tile (0..255)." }),
    /** Collision-driven uplift potential per tile (0..255). */
    collisionPotential: TypedArraySchemas.u8({
      description: "Collision-driven uplift potential per tile (0..255).",
    }),
    /** Subduction-driven uplift potential per tile (0..255). */
    subductionPotential: TypedArraySchemas.u8({
      description: "Subduction-driven uplift potential per tile (0..255).",
    }),
    /** Rift potential per tile (0..255). */
    riftPotential: TypedArraySchemas.u8({ description: "Rift potential per tile (0..255)." }),
    /** Shear stress per tile (0..255). */
    shearStress: TypedArraySchemas.u8({ description: "Shear stress per tile (0..255)." }),
    /** Volcanism per tile (0..255). */
    volcanism: TypedArraySchemas.u8({ description: "Volcanism per tile (0..255)." }),
    /** Fracture potential per tile (0..255). */
    fracture: TypedArraySchemas.u8({ description: "Fracture potential per tile (0..255)." }),
  },
  { description: "Foundation tectonic history tiles era payload (tile-space era fields)." }
);

/** Foundation tectonic history tiles rollup payload (tile-space rollups). */
const FoundationTectonicHistoryTilesRollupArtifactSchema = Type.Object(
  {
    /** Accumulated uplift total per tile (0..255). */
    upliftTotal: TypedArraySchemas.u8({
      description: "Accumulated uplift total per tile (0..255).",
    }),
    /** Accumulated collision uplift total per tile (0..255). */
    collisionTotal: TypedArraySchemas.u8({
      description: "Accumulated collision uplift total per tile (0..255).",
    }),
    /** Accumulated subduction uplift total per tile (0..255). */
    subductionTotal: TypedArraySchemas.u8({
      description: "Accumulated subduction uplift total per tile (0..255).",
    }),
    /** Accumulated fracture total per tile (0..255). */
    fractureTotal: TypedArraySchemas.u8({
      description: "Accumulated fracture total per tile (0..255).",
    }),
    /** Accumulated volcanism total per tile (0..255). */
    volcanismTotal: TypedArraySchemas.u8({
      description: "Accumulated volcanism total per tile (0..255).",
    }),
    /** Fraction of uplift attributable to recent eras per tile (0..255). */
    upliftRecentFraction: TypedArraySchemas.u8({
      description: "Fraction of uplift attributable to recent eras per tile (0..255).",
    }),
    /** Fraction of collision uplift attributable to recent eras per tile (0..255). */
    collisionRecentFraction: TypedArraySchemas.u8({
      description: "Fraction of collision uplift attributable to recent eras per tile (0..255).",
    }),
    /** Fraction of subduction uplift attributable to recent eras per tile (0..255). */
    subductionRecentFraction: TypedArraySchemas.u8({
      description: "Fraction of subduction uplift attributable to recent eras per tile (0..255).",
    }),
    /** Last active era index per tile (0..255; 255 = never). */
    lastActiveEra: TypedArraySchemas.u8({
      description: "Last active era index per tile (0..255; 255 = never).",
    }),
    /** Last collision-active era index per tile (0..255; 255 = never). */
    lastCollisionEra: TypedArraySchemas.u8({
      description: "Last collision-active era index per tile (0..255; 255 = never).",
    }),
    /** Last subduction-active era index per tile (0..255; 255 = never). */
    lastSubductionEra: TypedArraySchemas.u8({
      description: "Last subduction-active era index per tile (0..255; 255 = never).",
    }),
    /** Plate movement U component per tile (-127..127). */
    movementU: TypedArraySchemas.i8({
      description: "Plate movement U component per tile (-127..127).",
    }),
    /** Plate movement V component per tile (-127..127). */
    movementV: TypedArraySchemas.i8({
      description: "Plate movement V component per tile (-127..127).",
    }),
  },
  { description: "Foundation tectonic history tiles rollup payload (tile-space rollups)." }
);

/** Foundation tectonic history tiles artifact payload (tile-space era fields + rollups). */
export const Schema = Type.Object(
  {
    /** Schema major version. */
    version: Type.Integer({ minimum: 1, description: "Schema major version." }),
    /** Number of eras included in the history tiles payload. */
    eraCount: Type.Integer({
      minimum: 5,
      maximum: 8,
      description: "Number of eras included in the history tiles payload.",
    }),
    /** Per-era tile fields (length = eraCount). */
    perEra: Type.Immutable(
      Type.Array(FoundationTectonicHistoryTilesEraArtifactSchema, {
        description: "Per-era tile fields (length = eraCount).",
      })
    ),
    /** Rollup fields across eras. */
    rollups: FoundationTectonicHistoryTilesRollupArtifactSchema,
  },
  {
    description:
      "Foundation tectonic history tiles artifact payload (tile-space era fields + rollups).",
  }
);

export const artifact = defineArtifact({
  name: "foundationTectonicHistoryTiles",
  id: "artifact:map.foundationTectonicHistoryTiles",
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
      "[FoundationArtifact] Missing foundation tectonicHistoryTiles artifact payload."
    );
  }
  const history = value as {
    version?: unknown;
    eraCount?: unknown;
    perEra?: unknown;
    rollups?: unknown;
  };

  const version = typeof history.version === "number" ? history.version | 0 : 0;
  if (version <= 0) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicHistoryTiles.version.");
  }
  const eraCount = typeof history.eraCount === "number" ? history.eraCount | 0 : -1;
  if (eraCount < 5 || eraCount > 8) {
    throw new Error(
      "[FoundationArtifact] Invalid foundation tectonicHistoryTiles.eraCount (expected 5..8)."
    );
  }
  if (!Array.isArray(history.perEra) || history.perEra.length !== eraCount) {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicHistoryTiles.perEra.");
  }

  const expectedLen = Math.max(0, (dims.width | 0) * (dims.height | 0));
  for (let e = 0; e < history.perEra.length; e++) {
    const era = history.perEra[e] as Record<string, unknown> | undefined;
    if (!era) {
      throw new Error(
        "[FoundationArtifact] Invalid foundation tectonicHistoryTiles.perEra payload."
      );
    }
    const fields = [
      "boundaryType",
      "upliftPotential",
      "collisionPotential",
      "subductionPotential",
      "riftPotential",
      "shearStress",
      "volcanism",
      "fracture",
    ] as const;
    for (const field of fields) {
      const v = era[field] as unknown;
      if (!(v instanceof Uint8Array) || v.length !== expectedLen) {
        throw new Error(
          `[FoundationArtifact] Invalid foundation tectonicHistoryTiles.perEra.${field}.`
        );
      }
    }
  }

  const rollups = history.rollups as Record<string, unknown> | undefined;
  if (!rollups || typeof rollups !== "object") {
    throw new Error("[FoundationArtifact] Invalid foundation tectonicHistoryTiles.rollups.");
  }
  const rollupFields = [
    ["upliftTotal", rollups.upliftTotal],
    ["collisionTotal", rollups.collisionTotal],
    ["subductionTotal", rollups.subductionTotal],
    ["fractureTotal", rollups.fractureTotal],
    ["volcanismTotal", rollups.volcanismTotal],
    ["upliftRecentFraction", rollups.upliftRecentFraction],
    ["collisionRecentFraction", rollups.collisionRecentFraction],
    ["subductionRecentFraction", rollups.subductionRecentFraction],
    ["lastActiveEra", rollups.lastActiveEra],
    ["lastCollisionEra", rollups.lastCollisionEra],
    ["lastSubductionEra", rollups.lastSubductionEra],
  ] as const;
  for (const [label, arr] of rollupFields) {
    if (!(arr instanceof Uint8Array) || arr.length !== expectedLen) {
      throw new Error(
        `[FoundationArtifact] Invalid foundation tectonicHistoryTiles.rollups.${label}.`
      );
    }
  }

  const movementU = (rollups as { movementU?: unknown }).movementU;
  if (!(movementU instanceof Int8Array) || movementU.length !== expectedLen) {
    throw new Error(
      "[FoundationArtifact] Invalid foundation tectonicHistoryTiles.rollups.movementU."
    );
  }
  const movementV = (rollups as { movementV?: unknown }).movementV;
  if (!(movementV instanceof Int8Array) || movementV.length !== expectedLen) {
    throw new Error(
      "[FoundationArtifact] Invalid foundation tectonicHistoryTiles.rollups.movementV."
    );
  }
}

export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  return wrapValidation(value, context);
}
