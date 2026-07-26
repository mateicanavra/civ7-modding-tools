import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers Foundation's ordered 5-8 era history and cumulative/recent
 * rollups after projection from mesh cells into tile space.
 */
export const artifact = defineArtifact({
  name: "foundationTectonicHistoryTiles",
  id: "artifact:foundation.tectonicHistoryTiles",
  schema: Type.Object(
    {
      version: Type.Integer({ minimum: 1 }),
      eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
      perEra: Type.Immutable(
        Type.Array(
          Type.Object(
            {
              boundaryType: TypedArraySchemas.u8({ cardinality: "map-grid" }),
              convergentMask: TypedArraySchemas.u8({ cardinality: "map-grid" }),
              divergentMask: TypedArraySchemas.u8({ cardinality: "map-grid" }),
              transformMask: TypedArraySchemas.u8({ cardinality: "map-grid" }),
              upliftPotential: TypedArraySchemas.u8({ cardinality: "map-grid" }),
              collisionPotential: TypedArraySchemas.u8({ cardinality: "map-grid" }),
              subductionPotential: TypedArraySchemas.u8({ cardinality: "map-grid" }),
              riftPotential: TypedArraySchemas.u8({ cardinality: "map-grid" }),
              shearStress: TypedArraySchemas.u8({ cardinality: "map-grid" }),
              volcanism: TypedArraySchemas.u8({ cardinality: "map-grid" }),
              fracture: TypedArraySchemas.u8({ cardinality: "map-grid" }),
            },
            {
              additionalProperties: false,
              description: "One reconstructed era's tectonic fields projected into map-tile space.",
            }
          )
        )
      ),
      rollups: Type.Object(
        {
          upliftTotal: TypedArraySchemas.u8({ cardinality: "map-grid" }),
          collisionTotal: TypedArraySchemas.u8({ cardinality: "map-grid" }),
          subductionTotal: TypedArraySchemas.u8({ cardinality: "map-grid" }),
          fractureTotal: TypedArraySchemas.u8({ cardinality: "map-grid" }),
          volcanismTotal: TypedArraySchemas.u8({ cardinality: "map-grid" }),
          upliftRecentFraction: TypedArraySchemas.u8({ cardinality: "map-grid" }),
          collisionRecentFraction: TypedArraySchemas.u8({ cardinality: "map-grid" }),
          subductionRecentFraction: TypedArraySchemas.u8({ cardinality: "map-grid" }),
          lastActiveEra: TypedArraySchemas.u8({ cardinality: "map-grid" }),
          lastCollisionEra: TypedArraySchemas.u8({ cardinality: "map-grid" }),
          lastSubductionEra: TypedArraySchemas.u8({ cardinality: "map-grid" }),
          movementU: TypedArraySchemas.i8({ cardinality: "map-grid" }),
          movementV: TypedArraySchemas.i8({ cardinality: "map-grid" }),
        },
        {
          additionalProperties: false,
          description: "Cumulative, recency, and plate-motion fields in map-tile space.",
        }
      ),
    },
    {
      additionalProperties: false,
      description: "Reconstructed tectonic eras and rollups projected into map-tile space.",
    }
  ),
  refine: (value, { issues }) => {
    if (value.perEra.length !== value.eraCount) {
      issues.add("[FoundationArtifact] Invalid foundation tectonicHistoryTiles.perEra.");
    }
  },
});
