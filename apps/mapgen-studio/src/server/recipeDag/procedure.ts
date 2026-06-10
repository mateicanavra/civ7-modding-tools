import { ORPCError } from "@orpc/server";
import { Effect, Layer, ManagedRuntime } from "effect";
import { implementEffect, type EffectImplementer, type EffectImplementerInternal } from "effect-orpc";

import { RecipeDagContract } from "./contract";
import type { RecipeDagContext } from "./context";

export const recipeDagEffectRuntime = ManagedRuntime.make(Layer.empty);

const recipeDagBaseImplementer =
  implementEffect(RecipeDagContract, recipeDagEffectRuntime).$context<RecipeDagContext>() satisfies EffectImplementer<
    typeof RecipeDagContract,
    RecipeDagContext & Record<never, never>,
    RecipeDagContext,
    never,
    never
  >;

const recipeDagSafeErrorMiddleware = recipeDagBaseImplementer.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (err) {
    throw publicRecipeDagError(err);
  }
});

export type RecipeDagImplementer = EffectImplementerInternal<
  typeof RecipeDagContract,
  RecipeDagContext & Record<never, never>,
  RecipeDagContext,
  never,
  never
>;

export const recipeDagImplementer: RecipeDagImplementer =
  recipeDagBaseImplementer.use(recipeDagSafeErrorMiddleware);

export const recipeDagGetProcedure =
  recipeDagImplementer.recipeDag.get.effect(function* ({ input, context, errors }) {
    return yield* Effect.tryPromise({
      try: async () => context.recipeDagService.getRecipeDag(input.recipeId),
      catch: (err) => {
        if (err instanceof Error && err.name === "RecipeDagNotFound") {
          return errors.RECIPE_DAG_RECIPE_NOT_FOUND({
            data: {
              procedureKey: "recipeDag.get",
              recipeId: input.recipeId,
            },
          });
        }
        return errors.RECIPE_DAG_UNAVAILABLE({
          data: {
            procedureKey: "recipeDag.get",
            recipeId: input.recipeId,
            source: "recipe-dag-service",
          },
        });
      },
    });
  });

function publicRecipeDagError(err: unknown): ORPCError<any, any> {
  if (err instanceof ORPCError) return err;
  return new ORPCError("INTERNAL_SERVER_ERROR", {
    message: "Recipe DAG procedure failed.",
  });
}
