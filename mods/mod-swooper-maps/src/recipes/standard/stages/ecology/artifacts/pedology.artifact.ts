import { FEATURE_PLACEMENT_KEYS, type PlotEffectKey } from "@mapgen/domain/ecology";
import {
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

export const PedologyArtifactSchema = Type.Object({
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  soilType: TypedArraySchemas.u8({ description: "Soil type index per tile." }),
  fertility: TypedArraySchemas.f32({ description: "Fertility per tile (0..1)." }),
});

export type PedologyArtifact = Static<typeof PedologyArtifactSchema>;

export const Schema = PedologyArtifactSchema;

export const artifact = defineArtifact({
  name: "pedology",
  id: "artifact:ecology.soils",
  schema: Schema,
});
