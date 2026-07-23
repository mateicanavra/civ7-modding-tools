import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { TectonicEraFieldsSchema } from "../../model/atoms/tectonic-era-fields.schema.js";
import { TectonicEventSchema } from "../../model/atoms/tectonic-event.schema.js";

const StrategySchema = Type.Object(
  {
    beltInfluenceDistance: Type.Integer({
      default: 8,
      minimum: 1,
      maximum: 64,
      description: "Controls how far tectonic belt influence spreads across mesh-neighbor steps.",
    }),
    beltDecay: Type.Number({
      default: 0.55,
      minimum: 0.01,
      maximum: 10,
      description:
        "Controls the exponential decay rate for tectonic belt influence per mesh-neighbor step.",
    }),
    orogenyActivityGain: Type.Number({
      default: 1,
      minimum: 0,
      maximum: 10,
      description:
        "Activity gain on convergent-uplift and subduction-volcanism emission intensity, applied AFTER boundary-regime classification (so regime topology is fixed and the lever stays smooth/monotonic). Set by the foundation-tectonics plateActivity knob; a direct authored value is overwritten by the knob. 1 is an exact no-op.",
    }),
  },
  { additionalProperties: false }
);

/**
 * Contract for converting one era's tectonic events into aligned mesh-wide activity fields.
 * Its strategy may change how events decay without changing the downstream history atom.
 */
const ComputeEraTectonicFieldsContract = defineOp({
  kind: "compute",
  id: "foundation/compute-era-tectonic-fields",
  input: Type.Object(
    {
      mesh: Type.Object(
        {
          cellCount: Type.Integer({ minimum: 1 }),
          wrapWidth: Type.Number(),
          siteX: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          siteY: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          neighborsOffsets: TypedArraySchemas.i32({
            cardinality: { factors: ["mesh.cellCount"], addend: 1 },
          }),
          neighbors: TypedArraySchemas.i32({ cardinality: "constructor-only" }),
        },
        { additionalProperties: false }
      ),
      segmentEvents: Type.Array(TectonicEventSchema),
      hotspotEvents: Type.Array(TectonicEventSchema),
      weight: Type.Number({ minimum: 0, maximum: 10 }),
      eraGain: Type.Number({ minimum: 0, maximum: 10 }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      eraFields: TectonicEraFieldsSchema,
    },
    {
      additionalProperties: false,
      description:
        "Mesh-wide boundary, deformation, volcanism, and drift fields for one weighted tectonic era; history rollups and current-state projection consume this record.",
    }
  ),
  strategies: {
    "event-distance-decay": StrategySchema,
  },
});

export default ComputeEraTectonicFieldsContract;
