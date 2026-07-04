import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const MorphologyShelfArtifactSchema = Type.Object(
  {
    shelfMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): continental-shelf water (margin-aware, depth-gated, shore-connected) eligible for TERRAIN_COAST projection. Derived from POST-island morphology truth so island peaks get shelves.",
    }),
    coastalLand: TypedArraySchemas.u8({
      description: "Mask (1/0): POST-island land tiles adjacent to water.",
    }),
    coastalWater: TypedArraySchemas.u8({
      description: "Mask (1/0): POST-island water tiles adjacent to land.",
    }),
    distanceToCoast: TypedArraySchemas.u16({
      description: "POST-island minimum hex distance to the nearest coastline tile (0=coast).",
    }),
    activeMarginMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): water tiles treated as active margin (convergent/transform, high closeness) => shallower break.",
    }),
    depthGateMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): water tiles passing the per-tile depth gate (bathymetry >= break depth).",
    }),
    nearshoreCandidateMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): water tiles within breakDepthSampleRadius used to sample the break depth.",
    }),
    shelfBreakDepthByTile: TypedArraySchemas.i16({
      description:
        "Per-tile shelf-break depth (engine elevation units, <=0) after margin modulation; deeper => wider local shelf.",
    }),
    shallowCutoff: Type.Number({
      description:
        "Base shelf-break depth (engine elevation units, <=0): nearshore quantile before margin modulation.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Continental-shelf truth + post-island coastline metrics (stage morphology-shelf, after islands/mountains).",
  }
);

export const Schema = MorphologyShelfArtifactSchema;

export const artifact = defineArtifact({
  name: "shelf",
  id: "artifact:morphology.shelf",
  schema: Schema,
});
