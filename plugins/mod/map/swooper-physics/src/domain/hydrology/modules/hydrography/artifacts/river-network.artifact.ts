import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const common = {
  upstreamArea: TypedArraySchemas.i32({
    cardinality: "map-grid",
    description:
      "Contributing tile count. Each certified hydraulic-component member reports the same aggregate, not additive per-member area.",
  }),
  streamOrderProxy: TypedArraySchemas.u8({
    cardinality: "map-grid",
    description:
      "Strahler-like hierarchy; certified component aggregate is independent of internal exchange branches.",
  }),
  mouthType: TypedArraySchemas.u8({
    cardinality: "map-grid",
    description:
      "0 unresolved/water, 1 ocean, 2 first downstream accepted lake, 3 closed basin, 4 legacy spill path, 5 boundary export, 6 subtile, 7 dry.",
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
            "First downstream accepted wet-body identity on its incoming dry reach; 0 for other destinations and wet cells.",
        }),
      },
      { additionalProperties: false }
    ),
  ]),
  refine: (value, { issues }) => {
    if (value.mouthType.some((tag) => tag > (value.model === "legacy-sink-budget" ? 4 : 7)))
      issues.add("Invalid riverNetwork.mouthType for selected model.");
    if (
      value.model === "certified-sill-spill" &&
      value.mouthBodyId.some((id, cell) => id < 0 || (value.mouthType[cell] === 2) !== id > 0)
    )
      issues.add("Accepted-lake mouths require exactly one positive wet-body identity.");
  },
});
