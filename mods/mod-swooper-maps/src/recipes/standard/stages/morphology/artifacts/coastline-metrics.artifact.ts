import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const MorphologyCoastlineMetricsArtifactSchema = Type.Object(
  {
    coastalLand: TypedArraySchemas.u8({ description: "Mask (1/0): land tiles adjacent to water." }),
    coastalWater: TypedArraySchemas.u8({
      description: "Mask (1/0): water tiles adjacent to land.",
    }),
    distanceToCoast: TypedArraySchemas.u16({
      description:
        "Minimum tile-graph distance to any coastline tile (0=coast), using wrapX=true and wrapY=false.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "CARVED coastline metrics snapshot (stage morphology-coasts; pre-island). The shelf and the post-island coastline live in artifact:morphology.shelf.",
  }
);

export const Schema = MorphologyCoastlineMetricsArtifactSchema;

export const artifact = defineArtifact({
  name: "coastlineMetrics",
  id: "artifact:morphology.coastlineMetrics",
  schema: Schema,
});
