import { FEATURE_PLACEMENT_KEYS, type PlotEffectKey } from "@mapgen/domain/ecology";
import {
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

export const ResourceBasinsArtifactSchema = Type.Object({
  basins: Type.Array(
    Type.Object({
      resourceId: Type.String(),
      plots: Type.Array(Type.Integer({ minimum: 0 })),
      intensity: Type.Array(Type.Number({ minimum: 0 })),
      confidence: Type.Number({ minimum: 0 }),
    })
  ),
});

export type ResourceBasinsArtifact = Static<typeof ResourceBasinsArtifactSchema>;

export const Schema = ResourceBasinsArtifactSchema;

export const artifact = defineArtifact({
  name: "resourceBasins",
  id: "artifact:ecology.resourceBasins",
  schema: Schema,
});
