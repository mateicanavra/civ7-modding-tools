import { classifyTargetResult } from "@internal/habitat-harness/core/domains/workspace-graph-integration/index";
import { Effect } from "effect";
import { module as classifyModule } from "./module.js";

export const classifyRouter = {
  run: classifyModule.run.effect(({ context, input }) =>
    Effect.promise(() => classifyTargetResult(input.target, context.classify?.options ?? {}))
  ),
};

export const router = classifyRouter;
