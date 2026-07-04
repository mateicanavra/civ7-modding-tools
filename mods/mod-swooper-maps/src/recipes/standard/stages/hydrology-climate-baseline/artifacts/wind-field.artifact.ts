import { HydrologyWindFieldSchema } from "@mapgen/domain/hydrology";
import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

export const Schema = HydrologyWindFieldSchema;

export const artifact = defineArtifact({
  name: "windField",
  id: "artifact:hydrology._internal.windField",
  schema: Schema,
});
