import { type TObject, type TSchema, Type } from "typebox";
import { assertCompleteConfigSchema } from "../schema/config.js";

type StageSurfaceInput = Readonly<{
  id: string;
  surfaceSchema: TObject;
}>;

/**
 * Derives the required top-level recipe configuration schema from stage-owned surfaces.
 * Each stage remains the sole owner of its closed surface; native `Value.Create` recursively
 * creates complete configuration from schema-defined leaf defaults.
 */
export function deriveRecipeConfigSchema<const TStage extends StageSurfaceInput>(
  stages: readonly TStage[]
): TObject {
  const properties: Record<string, TSchema> = {};
  for (const stage of stages) {
    properties[stage.id] = stage.surfaceSchema;
  }
  const schema = Type.Object(properties, { additionalProperties: false });
  assertCompleteConfigSchema(schema, "recipe");
  return schema;
}
