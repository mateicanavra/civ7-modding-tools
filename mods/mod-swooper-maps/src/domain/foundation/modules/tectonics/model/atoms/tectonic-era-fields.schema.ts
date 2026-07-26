import { type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Mesh-wide deformation, volcanism, fracture, and provenance signals for one tectonic era. */
export const TectonicEraFieldsSchema = Type.Object(
  {
    boundaryType: TypedArraySchemas.u8({
      cardinality: null,
      description: "Quantized tectonic boundary regime at each mesh cell for this era.",
    }),
    boundaryPolarity: TypedArraySchemas.i8({
      cardinality: null,
      description: "Signed convergent-boundary polarity at each mesh cell for this era.",
    }),
    boundaryIntensity: TypedArraySchemas.u8({
      cardinality: null,
      description: "Combined tectonic boundary intensity at each mesh cell for this era.",
    }),
    upliftPotential: TypedArraySchemas.u8({
      cardinality: null,
      description: "Quantized orogenic uplift potential at each mesh cell for this era.",
    }),
    collisionPotential: TypedArraySchemas.u8({
      cardinality: null,
      description: "Quantized collision potential at each mesh cell for this era.",
    }),
    subductionPotential: TypedArraySchemas.u8({
      cardinality: null,
      description: "Quantized subduction potential at each mesh cell for this era.",
    }),
    riftPotential: TypedArraySchemas.u8({
      cardinality: null,
      description: "Quantized extensional rift potential at each mesh cell for this era.",
    }),
    shearStress: TypedArraySchemas.u8({
      cardinality: null,
      description: "Quantized transform-boundary shear stress at each mesh cell for this era.",
    }),
    volcanism: TypedArraySchemas.u8({
      cardinality: null,
      description: "Quantized volcanic activity potential at each mesh cell for this era.",
    }),
    fracture: TypedArraySchemas.u8({
      cardinality: null,
      description: "Quantized accumulated fracture potential at each mesh cell for this era.",
    }),
    riftOriginPlate: TypedArraySchemas.i16({
      cardinality: null,
      description: "Originating plate identifier for the rift signal at each mesh cell.",
    }),
    volcanismOriginPlate: TypedArraySchemas.i16({
      cardinality: null,
      description: "Originating plate identifier for the volcanic signal at each mesh cell.",
    }),
    volcanismEventType: TypedArraySchemas.u8({
      cardinality: null,
      description: "Tectonic event class responsible for the volcanic signal at each mesh cell.",
    }),
    boundaryDriftU: TypedArraySchemas.i8({
      cardinality: null,
      description: "Quantized east-west boundary drift at each mesh cell for this era.",
    }),
    boundaryDriftV: TypedArraySchemas.i8({
      cardinality: null,
      description: "Quantized north-south boundary drift at each mesh cell for this era.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Mesh-space tectonic signals emitted for one reconstructed era before history rollup.",
  }
);

/** Ordered tectonic-era fields carried between Foundation history operations. */
export const TectonicEraFieldsByEraSchema = Type.Array(TectonicEraFieldsSchema, {
  minItems: 1,
  description: "Tectonic signal fields ordered from the oldest reconstructed era to the newest.",
});

/** One era of mesh-space tectonic signals. */
export type TectonicEraFields = Static<typeof TectonicEraFieldsSchema>;

/** Multi-era tectonic signals consumed by history, current-state, and provenance operations. */
export type TectonicEraFieldsByEra = Static<typeof TectonicEraFieldsByEraSchema>;
