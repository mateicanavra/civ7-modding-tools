import { Effect } from "effect";
import { classifyTargetResult } from "../../../domains/workspace-graph-integration/index.js";
import { module as classifyModule } from "./module.js";

export const classifyRouter = {
  run: classifyModule.run.effect(({ context, input }) =>
    Effect.promise(() => classifyTargetResult(input.target, context.classify?.options ?? {}))
  ),
};

export const router = classifyRouter;
