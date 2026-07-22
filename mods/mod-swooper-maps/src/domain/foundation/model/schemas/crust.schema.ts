import { type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Domain model for the parallel physical fields that describe one Foundation crust state. */
export const CrustSchema = Type.Object(
  {
    maturity: TypedArraySchemas.f32({
      cardinality: null,
      description: "Per-cell normalized continental differentiation maturity.",
    }),
    thickness: TypedArraySchemas.f32({
      cardinality: null,
      description: "Per-cell normalized crustal thickness.",
    }),
    thermalAge: TypedArraySchemas.u8({
      cardinality: null,
      description: "Per-cell quantized thermal age accumulated across tectonic eras.",
    }),
    damage: TypedArraySchemas.u8({
      cardinality: null,
      description: "Per-cell quantized structural damage from rifting, shear, and fracture.",
    }),
    type: TypedArraySchemas.u8({
      cardinality: null,
      description: "Per-cell crust class where 0 is oceanic and 1 is continental.",
    }),
    age: TypedArraySchemas.u8({
      cardinality: null,
      description: "Per-cell quantized crust age used by downstream product projection.",
    }),
    buoyancy: TypedArraySchemas.f32({
      cardinality: null,
      description: "Per-cell normalized isostatic buoyancy.",
    }),
    baseElevation: TypedArraySchemas.f32({
      cardinality: null,
      description: "Per-cell normalized elevation tendency before Morphology projection.",
    }),
    strength: TypedArraySchemas.f32({
      cardinality: null,
      description: "Per-cell normalized lithospheric strength.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Parallel mesh-cell fields describing crustal maturity, structure, buoyancy, and strength.",
  }
);

/** Foundation crust fields shared by crust-producing and crust-consuming operations. */
export type Crust = Static<typeof CrustSchema>;
