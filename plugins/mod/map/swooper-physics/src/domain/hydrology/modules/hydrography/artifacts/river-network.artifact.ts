import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers Hydrology-owned network hierarchy, mouth, slope, and permanence. Benchmark evidence
 * is projected separately into the metrics sink so it cannot become pipeline state or
 * river-placement authority.
 */
export const artifact = defineArtifact({
  name: "riverNetwork",
  id: "artifact:hydrology.riverNetwork",
  schema: Type.Object(
    {
      upstreamArea: TypedArraySchemas.i32({
        cardinality: "map-grid",
        description: "Contributing land-tile count draining through each land tile.",
      }),
      streamOrderProxy: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Strahler-like river hierarchy (0 on non-river tiles).",
      }),
      mouthType: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Drainage mouth class: 0=unresolved, 1=ocean, 2=accepted lake, 3=closed basin, 4=spill path.",
      }),
      slopeClass: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Channel slope class: 0=none/water, 1=flat, 2=low, 3=moderate, 4=steep, 5=mountain-blocked basin.",
      }),
      flowPermanenceProxy: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Flow persistence: 0=dry, 1=ephemeral, 2=intermittent, 3=perennial.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Hydrology river hierarchy, mouth, slope, and flow-permanence classifications before Civ7 projection.",
    }
  ),
});
