import { FEATURE_PLACEMENT_KEYS, type PlotEffectKey } from "@mapgen/domain/ecology";
import {
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

export const BiomeBindingsArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    engineBiomeId: TypedArraySchemas.u16({
      description: "Engine biome id resolved from biome symbols (tile order).",
    }),
    bindingClass: TypedArraySchemas.u8({
      description:
        "Binding class per tile (0=water, 1=unique binding, 2=colliding binding where multiple symbols map to same engine biome).",
    }),
    collapsedBindingCount: Type.Integer({
      minimum: 0,
      description:
        "Count of land tiles whose symbol maps through a colliding engine biome binding.",
    }),
    landWaterMismatchCount: Type.Integer({
      minimum: 0,
      description: "Count of land-mask mismatches between Morphology truth and engine water state.",
    }),
  },
  { additionalProperties: false }
);

export type BiomeBindingsArtifact = Static<typeof BiomeBindingsArtifactSchema>;

export const Schema = BiomeBindingsArtifactSchema;

export const artifact = defineArtifact({
  name: "biomeBindings",
  id: "artifact:ecology.biomeBindings",
  schema: Schema,
});
