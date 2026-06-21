import { classifyTargetResult } from "@internal/habitat-harness/service/modules/graph/workspace/index";
import { Effect } from "effect";
import { implementer } from "./context.js";

export const classifyRouter = {
  run: implementer.run.effect(({ context, input }) =>
    Effect.promise(() => classifyTargetResult(input.target, context.options ?? {}))
  ),
};

export const router = classifyRouter;
