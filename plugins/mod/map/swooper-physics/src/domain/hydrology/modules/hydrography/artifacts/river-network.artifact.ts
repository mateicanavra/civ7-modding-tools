import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const common = {
  upstreamArea: TypedArraySchemas.i32({
    cardinality: "map-grid",
    description:
      "Contributing tile count. Each certified wet member reports the same body aggregate, not additive per-member area.",
  }),
  streamOrderProxy: TypedArraySchemas.u8({
    cardinality: "map-grid",
    description:
      "Strahler-like hierarchy; certified body aggregate is independent of internal wet connectivity.",
  }),
  mouthType: TypedArraySchemas.u8({
    cardinality: "map-grid",
    description:
      "0 unresolved, 1 ocean, 2 first downstream accepted lake, 3 legacy closed basin, 4 legacy spill path.",
  }),
  slopeClass: TypedArraySchemas.u8({
    cardinality: "map-grid",
    description:
      "0 none/water, 1 flat, 2 low, 3 moderate, 4 steep, 5 legacy mountain-blocked basin.",
  }),
  flowPermanenceProxy: TypedArraySchemas.u8({
    cardinality: "map-grid",
    description: "0 dry, 1 ephemeral, 2 intermittent, 3 perennial.",
  }),
};

/** Metadata over the physical network; never an alternative router. */
export const artifact = defineArtifact({
  name: "riverNetwork",
  id: "artifact:hydrology.riverNetwork",
  schema: Type.Union([
    Type.Object(
      { model: Type.Literal("legacy-sink-budget"), ...common },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        model: Type.Literal("certified-sill-spill"),
        ...common,
        mouthBodyId: TypedArraySchemas.i32({
          cardinality: "map-grid",
          description:
            "First downstream accepted lake root ID on its incoming dry reach; 0 for marine destinations and wet cells.",
        }),
      },
      { additionalProperties: false }
    ),
  ]),
});
