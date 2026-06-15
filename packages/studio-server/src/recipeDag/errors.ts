import { type Static, Type } from "typebox";

import { toStandardSchema } from "../typeboxStandardSchema.js";

const RecipeDagRecipeNotFoundDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("recipeDag.get"),
    recipeId: Type.String(),
  },
  { additionalProperties: false }
);
export type RecipeDagRecipeNotFoundData = Static<typeof RecipeDagRecipeNotFoundDataSchema>;

const RecipeDagUnavailableDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("recipeDag.get"),
    recipeId: Type.String(),
    source: Type.Literal("recipe-dag-service"),
  },
  { additionalProperties: false }
);
export type RecipeDagUnavailableData = Static<typeof RecipeDagUnavailableDataSchema>;

export const recipeDagErrorMap = {
  RECIPE_DAG_RECIPE_NOT_FOUND: {
    status: 404,
    message: "Recipe DAG recipe not found.",
    data: toStandardSchema(RecipeDagRecipeNotFoundDataSchema),
  },
  RECIPE_DAG_UNAVAILABLE: {
    status: 503,
    message: "Recipe DAG unavailable.",
    data: toStandardSchema(RecipeDagUnavailableDataSchema),
  },
} as const;

export type RecipeDagErrorMap = typeof recipeDagErrorMap;
