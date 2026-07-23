import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { TectonicProvenanceFieldsSchema } from "../../model/atoms/tectonic-provenance-fields.schema.js";
import { TracerIndexSchema } from "../../model/atoms/tracer-index.schema.js";
import strategies from "./strategies/contract.js";

/**
 * Contract for reconstructing each cell's tectonic lineage from advected tracers and era fields.
 * Provenance remains distinct from current state so projection can expose both cause and outcome.
 */
const ComputeTectonicProvenanceContract = defineOp({
  kind: "compute",
  id: "foundation/compute-tectonic-provenance",
  input: Type.Object(
    {
      mesh: Type.Object(
        { cellCount: Type.Integer({ minimum: 1 }) },
        { additionalProperties: false }
      ),
      plateGraph: Type.Object(
        { cellToPlate: TypedArraySchemas.i16({ cardinality: ["mesh.cellCount"] }) },
        { additionalProperties: false }
      ),
      eras: Type.Array(
        Type.Object(
          {
            boundaryType: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
            boundaryPolarity: TypedArraySchemas.i8({ cardinality: ["mesh.cellCount"] }),
            boundaryIntensity: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
            riftPotential: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
            volcanism: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
            riftOriginPlate: TypedArraySchemas.i16({ cardinality: ["mesh.cellCount"] }),
            volcanismOriginPlate: TypedArraySchemas.i16({ cardinality: ["mesh.cellCount"] }),
            volcanismEventType: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          },
          { additionalProperties: false }
        ),
        { minItems: 1 }
      ),
      tracerIndex: Type.Array(TypedArraySchemas.u32({ cardinality: ["mesh.cellCount"] }), {
        minItems: 1,
      }),
      eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      tectonicProvenance: Type.Object(
        {
          version: Type.Integer({ minimum: 1 }),
          eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
          cellCount: Type.Integer({ minimum: 1 }),
          tracerIndex: Type.Immutable(Type.Array(TracerIndexSchema)),
          provenance: TectonicProvenanceFieldsSchema,
        },
        { additionalProperties: false }
      ),
    },
    {
      additionalProperties: false,
      description:
        "Per-cell tectonic provenance linking present locations to advected origin eras and plates, crust age, and the most recent boundary encounter.",
    }
  ),
  strategies,
});

export default ComputeTectonicProvenanceContract;
