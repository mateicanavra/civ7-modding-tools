import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
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

/**
 * Registers Foundation's ordered 5-8 era history and cumulative/recent
 * rollups after projection from mesh cells into tile space.
 */
export const artifact = defineArtifact({
  name: "foundationTectonicHistoryTiles",
  id: "artifact:map.foundationTectonicHistoryTiles",
  schema: Schema,
});

/**
 * Validates the era count/list invariant plus map-sized typed arrays for every
 * era field, rollup, and movement component.
 */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const issues = [...validateArtifactSchema(Schema, value)];
  if (value === null || typeof value !== "object") {
    if (context?.dimensions) {
      issues.push({
        message: "[FoundationArtifact] Missing foundation tectonicHistoryTiles artifact payload.",
      });
    }
    return Object.freeze(issues);
  }

  const history = value as Record<string, unknown>;
  const eraCount = history.eraCount;
  const perEra = history.perEra;
  if (Array.isArray(perEra) && typeof eraCount === "number" && perEra.length !== eraCount) {
    issues.push({
      message: "[FoundationArtifact] Invalid foundation tectonicHistoryTiles.perEra.",
    });
  }

  const size = artifactCellCount(context);
  if (Array.isArray(perEra)) {
    for (let index = 0; index < perEra.length; index++) {
      const era = perEra[index];
      if (era === null || typeof era !== "object") continue;
      const label = `tectonicHistoryTiles.perEra[${index}]`;
      const fields = era as Record<string, unknown>;
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.boundaryType`,
        fields.boundaryType,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.convergentMask`,
        fields.convergentMask,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.divergentMask`,
        fields.divergentMask,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.transformMask`,
        fields.transformMask,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.upliftPotential`,
        fields.upliftPotential,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.collisionPotential`,
        fields.collisionPotential,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.subductionPotential`,
        fields.subductionPotential,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.riftPotential`,
        fields.riftPotential,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.shearStress`,
        fields.shearStress,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.volcanism`,
        fields.volcanism,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.fracture`,
        fields.fracture,
        Uint8Array,
        size
      );
    }
  }

  const rollups = history.rollups;
  if (rollups !== null && typeof rollups === "object") {
    const fields = rollups as Record<string, unknown>;
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.upliftTotal",
      fields.upliftTotal,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.collisionTotal",
      fields.collisionTotal,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.subductionTotal",
      fields.subductionTotal,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.fractureTotal",
      fields.fractureTotal,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.volcanismTotal",
      fields.volcanismTotal,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.upliftRecentFraction",
      fields.upliftRecentFraction,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.collisionRecentFraction",
      fields.collisionRecentFraction,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.subductionRecentFraction",
      fields.subductionRecentFraction,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.lastActiveEra",
      fields.lastActiveEra,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.lastCollisionEra",
      fields.lastCollisionEra,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.lastSubductionEra",
      fields.lastSubductionEra,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.movementU",
      fields.movementU,
      Int8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.movementV",
      fields.movementV,
      Int8Array,
      size
    );
  }

  return Object.freeze(issues);
}
