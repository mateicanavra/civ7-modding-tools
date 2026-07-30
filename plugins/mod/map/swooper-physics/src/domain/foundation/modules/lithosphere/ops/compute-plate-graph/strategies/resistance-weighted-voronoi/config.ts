import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Semantic identity and authored controls for resistance-weighted Voronoi plate partitioning.
 * Plate-graph input and output remain owned by the shared operation contract.
 */
export default defineStrategy({
  id: "resistance-weighted-voronoi",
  config: Type.Object(
    {
      plateCount: Type.Integer({
        default: 8,
        minimum: 2,
        maximum: 256,
        description: "Sets the authored tectonic plate count before polar policy normalization.",
      }),
      polarCaps: Type.Object(
        {
          capFraction: Type.Number({
            default: 0.1,
            minimum: 0.02,
            maximum: 0.25,
            description:
              "Reserves this fraction of mesh Y-span as a locked cap in each polar hemisphere.",
          }),
          microplateBandFraction: Type.Number({
            default: 0.2,
            minimum: 0.02,
            maximum: 0.5,
            description:
              "Sets the fraction of mesh Y-span eligible for microplate seeds outside each locked cap.",
          }),
          microplatesPerPole: Type.Integer({
            default: 0,
            minimum: 0,
            maximum: 8,
            description:
              "Caps the number of optional microplates seeded near each pole after major plates are reserved.",
          }),
          microplatesMinPlateCount: Type.Integer({
            default: 14,
            minimum: 0,
            maximum: 256,
            description:
              "Enables polar microplates only when the normalized plate count reaches this threshold.",
          }),
          microplateMinAreaCells: Type.Integer({
            default: 8,
            minimum: 1,
            maximum: 10_000,
            description:
              "Requires this many connected mesh cells for a polar microplate to survive filtering.",
          }),
        },
        {
          additionalProperties: false,
          description:
            "Polar cap reservation and optional polar microplate policy for plate partitioning.",
        }
      ),
    },
    {
      additionalProperties: false,
      description:
        "Plate-count and polar partition controls for resistance-weighted Voronoi lithosphere regions.",
    }
  ),
});
