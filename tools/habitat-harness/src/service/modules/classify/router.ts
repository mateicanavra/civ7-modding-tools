import { Effect } from "effect";
import { classifyTargetResult } from "./model/index.js";
import { module } from "./module.js";

export const classifyRouter = {
  run: module.run.effect(function* ({ context, input }) {
    return yield* Effect.promise(() => classifyTargetResult(input.target, context.options ?? {}));
  }),
};

export const router = classifyRouter;
