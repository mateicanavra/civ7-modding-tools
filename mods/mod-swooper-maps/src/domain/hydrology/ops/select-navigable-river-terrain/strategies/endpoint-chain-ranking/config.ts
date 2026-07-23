import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Connected discharge and chain quality rank coherent endpoint pairs that the engine can project. */
export default defineStrategy({
  id: "endpoint-chain-ranking",
  config: Type.Object(
    {
      endpointDischargePercentileMin: Type.Number({
        default: 0.94,
        minimum: 0,
        maximum: 1,
        description:
          "Minimum endpoint-discharge percentile admitted into navigable-trunk selection (0..1). Higher values keep only the strongest outlets.",
      }),
      targetMajorTileFraction: Type.Number({
        default: 0.28,
        minimum: 0,
        maximum: 1,
        description:
          "Target share of eligible major-river tiles to preserve as Civ-visible navigable terrain.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Default navigable-river terrain selection controls. These are internal profile parameters, not the public authoring surface.",
    }
  ),
});
