import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { PlateSchema } from "../../../lithosphere/model/atoms/plate.schema.js";
import { ProjectedTectonicHistoryEraSchema } from "../../model/atoms/tectonic-history-era.schema.js";
import { ProjectedTectonicHistoryRollupsSchema } from "../../model/atoms/tectonic-history-rollups.schema.js";
import foundationModelProjectionDefinition from "./strategies/foundation-model-projection/config.js";

/**
 * Contract for projecting mesh-space crust and tectonic evidence onto the map tile grid.
 * Its input exposes only the fields the projection consumes; publication artifacts remain separate.
 */
const ComputePlatesTensorsContract = defineOp({
  kind: "compute",
  id: "foundation/compute-plates-tensors",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
      height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
      mesh: Type.Object(
        {
          cellCount: Type.Integer({ minimum: 1 }),
          wrapWidth: Type.Number(),
          siteX: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          siteY: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
        },
        { additionalProperties: false }
      ),
      crust: Type.Object(
        {
          type: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          maturity: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          thickness: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          damage: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          age: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          buoyancy: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          baseElevation: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          strength: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
        },
        { additionalProperties: false }
      ),
      plateGraph: Type.Object(
        {
          cellToPlate: TypedArraySchemas.i16({ cardinality: ["mesh.cellCount"] }),
          plates: Type.Immutable(Type.Array(PlateSchema)),
        },
        { additionalProperties: false }
      ),
      plateMotion: Type.Object(
        {
          plateCount: Type.Integer({ minimum: 1 }),
          plateVelocityX: TypedArraySchemas.f32({ cardinality: ["plateMotion.plateCount"] }),
          plateVelocityY: TypedArraySchemas.f32({ cardinality: ["plateMotion.plateCount"] }),
          plateOmega: TypedArraySchemas.f32({ cardinality: ["plateMotion.plateCount"] }),
        },
        { additionalProperties: false }
      ),
      tectonics: Type.Object(
        {
          boundaryType: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          upliftPotential: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          riftPotential: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          shearStress: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          volcanism: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          cumulativeUplift: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
        },
        { additionalProperties: false }
      ),
      tectonicHistory: Type.Object(
        {
          eraCount: Type.Integer({ minimum: 1 }),
          eras: Type.Immutable(
            Type.Array(
              Type.Object(
                {
                  boundaryType: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
                  upliftPotential: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
                  collisionPotential: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
                  subductionPotential: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
                  riftPotential: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
                  shearStress: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
                  volcanism: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
                  fracture: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
                },
                { additionalProperties: false }
              )
            )
          ),
          upliftTotal: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          collisionTotal: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          subductionTotal: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          fractureTotal: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          volcanismTotal: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          upliftRecentFraction: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          collisionRecentFraction: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          subductionRecentFraction: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          lastActiveEra: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          lastCollisionEra: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          lastSubductionEra: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
        },
        { additionalProperties: false }
      ),
      tectonicProvenance: Type.Optional(
        Type.Object(
          {
            provenance: Type.Object(
              {
                originEra: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
                originPlateId: TypedArraySchemas.i16({ cardinality: ["mesh.cellCount"] }),
                lastBoundaryEra: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
                lastBoundaryType: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
              },
              { additionalProperties: false }
            ),
          },
          { additionalProperties: false }
        )
      ),
    },
    {
      additionalProperties: false,
      description: "Fields required to project Foundation evidence into tile space.",
    }
  ),
  output: Type.Object(
    {
      tileToCellIndex: TypedArraySchemas.i32({
        description: "Nearest mesh cell index for each map tile.",
      }),
      crustTiles: Type.Object(
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
        { additionalProperties: false }
      ),
      plates: Type.Object(
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
        { additionalProperties: false }
      ),
      tectonicHistoryTiles: Type.Object(
        {
          version: Type.Integer({ minimum: 1 }),
          eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
          perEra: Type.Immutable(Type.Array(ProjectedTectonicHistoryEraSchema)),
          rollups: ProjectedTectonicHistoryRollupsSchema,
        },
        { additionalProperties: false }
      ),
      tectonicProvenanceTiles: Type.Object(
        {
          version: Type.Integer({ minimum: 1 }),
          originEra: TypedArraySchemas.u8(),
          originPlateId: TypedArraySchemas.i16(),
          driftDistance: TypedArraySchemas.u8(),
          lastBoundaryEra: TypedArraySchemas.u8(),
          lastBoundaryType: TypedArraySchemas.u8(),
        },
        { additionalProperties: false }
      ),
    },
    {
      additionalProperties: false,
      description: "Tile-space projection outputs published by the Foundation projection step.",
    }
  ),
  strategies: [foundationModelProjectionDefinition],
});

export default ComputePlatesTensorsContract;
