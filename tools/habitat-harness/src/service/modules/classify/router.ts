import { classifyTargetResult } from "@internal/habitat-harness/service/model/workspace/index";
import { Effect } from "effect";
import { module } from "./module.js";

export const classifyRouter = {
  run: module.run.effect(function* ({ context, input }) {
    return yield* Effect.promise(() => classifyTargetResult(input.target, context.options ?? {}));
  }),
};

export const router = classifyRouter;
