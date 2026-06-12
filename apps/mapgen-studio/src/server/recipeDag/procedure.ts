import { Effect, Layer, ManagedRuntime } from "effect";
import { implementEffect, type EffectImplementer, type EffectImplementerInternal } from "effect-orpc";

import { RecipeDagContract } from "./contract";
import type { RecipeDagContext } from "./context";

export const recipeDagEffectRuntime = ManagedRuntime.make(Layer.empty);

// NOTE: no error-sanitizing middleware — oRPC already wraps unknown throws/defects
// as INTERNAL_SERVER_ERROR (effect-orpc's `toORPCErrorFromCause` + the handler's
// `toORPCError`), and declared failures are raised through the typed
// `errors.RECIPE_DAG_*` constructors below, so the former
// `recipeDagSafeErrorMiddleware`/`publicRecipeDagError` pair was redundant.
export const recipeDagImplementer =
  implementEffect(RecipeDagContract, recipeDagEffectRuntime).$context<RecipeDagContext>() satisfies EffectImplementer<
    typeof RecipeDagContract,
    RecipeDagContext & Record<never, never>,
    RecipeDagContext,
    never,
    never
  >;

export type RecipeDagImplementer = EffectImplementerInternal<
  typeof RecipeDagContract,
  RecipeDagContext & Record<never, never>,
  RecipeDagContext,
  never,
  never
>;

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
