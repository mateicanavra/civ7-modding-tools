import { FEATURE_PLACEMENT_KEYS, type PlotEffectKey } from "@mapgen/domain/ecology";
import {
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

export const OccupancyArtifactSchema = Type.Object({
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  featureIndex: TypedArraySchemas.u16({
    description: "0 = unoccupied, otherwise 1 + FEATURE_KEY_INDEX",
  }),
  reserved: TypedArraySchemas.u8({
    description: "0 = tile can be claimed, 1 = permanently blocked",
  }),
});

export const Schema = OccupancyArtifactSchema;

export const artifact = defineArtifact({
  name: "occupancyWetlands",
  id: "artifact:ecology.occupancy.wetlands",
  schema: Schema,
});
