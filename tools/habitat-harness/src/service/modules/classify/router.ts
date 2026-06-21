import { classifyTargetResult } from "@internal/habitat-harness/core/domains/workspace-graph-integration/index";
import { Effect } from "effect";
import { module } from "./context.js";

export const classifyRouter = {
  run: module.run.effect(({ context, input }) =>
    Effect.promise(() => classifyTargetResult(input.target, context.options ?? {}))
  ),
};

export const router = classifyRouter;
