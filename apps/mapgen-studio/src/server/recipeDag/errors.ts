import {
  ORPCTaggedError,
  type EffectErrorMap,
  type EffectErrorMapToErrorMap,
} from "effect-orpc";
import { Type, type Static } from "typebox";

import { toStandardSchema } from "./typeboxStandardSchema";

const RecipeDagRecipeNotFoundDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("recipeDag.get"),
    recipeId: Type.String(),
  },
  { additionalProperties: false },
);
export type RecipeDagRecipeNotFoundData = Static<typeof RecipeDagRecipeNotFoundDataSchema>;

export class RecipeDagRecipeNotFoundError extends ORPCTaggedError(
  "RecipeDagRecipeNotFoundError",
  {
    code: "RECIPE_DAG_RECIPE_NOT_FOUND",
    message: "Recipe DAG recipe not found.",
    schema: toStandardSchema(RecipeDagRecipeNotFoundDataSchema),
    status: 404,
  },
) {}

const RecipeDagUnavailableDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("recipeDag.get"),
    recipeId: Type.String(),
    source: Type.Literal("recipe-dag-service"),
  },
  { additionalProperties: false },
);
export type RecipeDagUnavailableData = Static<typeof RecipeDagUnavailableDataSchema>;

export class RecipeDagUnavailableError extends ORPCTaggedError(
  "RecipeDagUnavailableError",
  {
    code: "RECIPE_DAG_UNAVAILABLE",
    message: "Recipe DAG unavailable.",
    schema: toStandardSchema(RecipeDagUnavailableDataSchema),
    status: 503,
  },
) {}

export const recipeDagErrorMap = {
  RECIPE_DAG_RECIPE_NOT_FOUND: RecipeDagRecipeNotFoundError,
  RECIPE_DAG_UNAVAILABLE: RecipeDagUnavailableError,
} satisfies EffectErrorMap;

export type RecipeDagEffectErrorMap = typeof recipeDagErrorMap;
export type RecipeDagErrorMap = EffectErrorMapToErrorMap<RecipeDagEffectErrorMap>;
