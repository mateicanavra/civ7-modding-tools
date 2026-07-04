import { FEATURE_PLACEMENT_KEYS, type PlotEffectKey } from "@mapgen/domain/ecology";
import {
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

export const ScoreLayersArtifactSchema = Type.Object({
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  layers: Type.Object(
    Object.fromEntries(
      FEATURE_PLACEMENT_KEYS.map((featureKey) => [
        featureKey,
        TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
      ])
    )
  ),
});

export type ScoreLayersArtifact = Static<typeof ScoreLayersArtifactSchema>;

export const Schema = ScoreLayersArtifactSchema;

export const artifact = defineArtifact({
  name: "scoreLayers",
  id: "artifact:ecology.scoreLayers",
  schema: Schema,
});
