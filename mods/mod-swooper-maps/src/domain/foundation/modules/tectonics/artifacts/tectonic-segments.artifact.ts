import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Registers Foundation's tectonic-segments artifact. */
export const artifact = defineArtifact({
  name: "foundationTectonicSegments",
  id: "artifact:foundation.tectonicSegments",
  schema: Type.Object(
    {
      segmentCount: Type.Integer({ minimum: 0 }),
      aCell: TypedArraySchemas.i32({ cardinality: ["segmentCount"] }),
      bCell: TypedArraySchemas.i32({ cardinality: ["segmentCount"] }),
      plateA: TypedArraySchemas.i16({ cardinality: ["segmentCount"] }),
      plateB: TypedArraySchemas.i16({ cardinality: ["segmentCount"] }),
      regime: TypedArraySchemas.u8({ cardinality: ["segmentCount"] }),
      polarity: TypedArraySchemas.i8({ cardinality: ["segmentCount"] }),
      compression: TypedArraySchemas.u8({ cardinality: ["segmentCount"] }),
      extension: TypedArraySchemas.u8({ cardinality: ["segmentCount"] }),
      shear: TypedArraySchemas.u8({ cardinality: ["segmentCount"] }),
      volcanism: TypedArraySchemas.u8({ cardinality: ["segmentCount"] }),
      fracture: TypedArraySchemas.u8({ cardinality: ["segmentCount"] }),
      driftU: TypedArraySchemas.i8({ cardinality: ["segmentCount"] }),
      driftV: TypedArraySchemas.i8({ cardinality: ["segmentCount"] }),
    },
    {
      additionalProperties: false,
      description: "Index-aligned classified plate-boundary segments and their signals.",
    }
  ),
});
