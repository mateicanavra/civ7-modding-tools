import { FEATURE_PLACEMENT_KEYS, type PlotEffectKey } from "@mapgen/domain/ecology";
import {
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

export const FeaturePlacementIntentSchema = Type.Object({
  x: Type.Integer({ minimum: 0 }),
  y: Type.Integer({ minimum: 0 }),
  feature: Type.String(),
  weight: Type.Optional(Type.Number()),
});

export const FeatureIntentsListArtifactSchema = Type.Array(FeaturePlacementIntentSchema);

export const Schema = FeatureIntentsListArtifactSchema;

export const artifact = defineArtifact({
  name: "featureIntentsReefs",
  id: "artifact:ecology.featureIntents.reefs",
  schema: Schema,
});
