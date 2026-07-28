import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Declares authored controls for plate-aware island-chain and microcontinent formation.
 */
export default defineStrategy({
  id: "plate-aware-volcanic",
  config: Type.Object(
    {
      fractalThresholdPercent: Type.Number({
        default: 90,
        minimum: 0,
        maximum: 100,
        description:
          "Controls the noise cutoff for island-chain seeds and microcontinent candidates; higher values admit fewer formations.",
      }),
      minDistFromLandRadius: Type.Integer({
        default: 2,
        minimum: 0,
        maximum: 128,
        description:
          "Controls the minimum wrapped-hex spacing between new islands and the base coastline.",
      }),
      baseIslandDenNearActive: Type.Integer({
        default: 5,
        minimum: 1,
        maximum: 256,
        description:
          "Controls island frequency near active plate margins; lower denominators admit more chains.",
      }),
      baseIslandDenElse: Type.Integer({
        default: 7,
        minimum: 1,
        maximum: 256,
        description:
          "Controls island frequency away from active margins; lower denominators admit more chains.",
      }),
      hotspotSeedDenom: Type.Integer({
        default: 2,
        minimum: 1,
        maximum: 256,
        description:
          "Controls island frequency along volcanism signals; lower denominators admit more hotspot chains.",
      }),
      clusterMax: Type.Integer({
        default: 3,
        minimum: 1,
        maximum: 256,
        description:
          "Controls the maximum ordinary patch size and the bounded area scale used for a microcontinent.",
      }),
      microcontinentChance: Type.Number({
        default: 0,
        minimum: 0,
        maximum: 1,
        description:
          "Controls the single per-map probability of admitting one larger microcontinent patch.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Plate-margin, hotspot, spacing, patch-size, and per-map microcontinent controls.",
    }
  ),
});
