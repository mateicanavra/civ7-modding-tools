import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { PlateMembershipSchema } from "../../model/atoms/plate-membership.schema.js";
import { TectonicHistoryEraSchema } from "../../model/atoms/tectonic-history-era.schema.js";

const StrategySchema = Type.Object(
  {
    activityThreshold: Type.Integer({
      default: 1,
      minimum: 0,
      maximum: 255,
      description: "Threshold used to compute lastActiveEra (0..255).",
    }),
  },
  { additionalProperties: false }
);

/**
 * Contract for reducing era fields into cumulative tectonic-history evidence.
 * The rollup retains aligned era detail while exposing stable totals to later subdomains.
 */
const ComputeTectonicHistoryRollupsContract = defineOp({
  kind: "compute",
  id: "foundation/compute-tectonic-history-rollups",
  input: Type.Object(
    {
      cellCount: Type.Integer({ minimum: 1 }),
      eras: Type.Array(
        Type.Object(
          {
            boundaryType: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
            boundaryPolarity: TypedArraySchemas.i8({ cardinality: ["cellCount"] }),
            boundaryIntensity: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
            upliftPotential: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
            collisionPotential: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
            subductionPotential: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
            riftPotential: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
            shearStress: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
            volcanism: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
            fracture: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
            riftOriginPlate: TypedArraySchemas.i16({ cardinality: ["cellCount"] }),
            volcanismOriginPlate: TypedArraySchemas.i16({ cardinality: ["cellCount"] }),
            volcanismEventType: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
            boundaryDriftU: TypedArraySchemas.i8({ cardinality: ["cellCount"] }),
            boundaryDriftV: TypedArraySchemas.i8({ cardinality: ["cellCount"] }),
          },
          { additionalProperties: false }
        ),
        {
          minItems: 1,
          description: "Tectonic signal fields ordered from the oldest era to the newest.",
        }
      ),
      plateIdByEra: Type.Array(TypedArraySchemas.i16({ cardinality: ["cellCount"] }), {
        minItems: 1,
      }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      tectonicHistory: Type.Object(
        {
          eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
          eras: Type.Immutable(Type.Array(TectonicHistoryEraSchema)),
          plateIdByEra: Type.Immutable(Type.Array(PlateMembershipSchema)),
          upliftTotal: TypedArraySchemas.u8({ cardinality: null }),
          collisionTotal: TypedArraySchemas.u8({ cardinality: null }),
          subductionTotal: TypedArraySchemas.u8({ cardinality: null }),
          fractureTotal: TypedArraySchemas.u8({ cardinality: null }),
          volcanismTotal: TypedArraySchemas.u8({ cardinality: null }),
          upliftRecentFraction: TypedArraySchemas.u8({ cardinality: null }),
          collisionRecentFraction: TypedArraySchemas.u8({ cardinality: null }),
          subductionRecentFraction: TypedArraySchemas.u8({ cardinality: null }),
          lastActiveEra: TypedArraySchemas.u8({ cardinality: null }),
          lastCollisionEra: TypedArraySchemas.u8({ cardinality: null }),
          lastSubductionEra: TypedArraySchemas.u8({ cardinality: null }),
        },
        { additionalProperties: false }
      ),
    },
    {
      additionalProperties: false,
      description:
        "Mesh-wide tectonic history that preserves every reconstructed era and plate assignment while aggregating cumulative, recent, and last-active signals per cell.",
    }
  ),
  strategies: {
    "cumulative-era-rollup": StrategySchema,
  },
});

export default ComputeTectonicHistoryRollupsContract;
