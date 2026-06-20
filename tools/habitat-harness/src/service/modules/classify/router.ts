import { Effect } from "effect";
import { classifyTargetResult } from "../../../lib/classify-core/index.js";
import type { ClassifyServiceOptions } from "./context.js";
import type { ClassifyServiceRunInput } from "./contract.js";
import { module as classifyModule } from "./module.js";

export const classifyRouter = {
  run: classifyModule.run.effect(({ context, input }) =>
    runClassifyService(input, context.classify)
  ),
};

export const router = classifyRouter;

export function runClassifyService(
  input: ClassifyServiceRunInput,
  serviceOptions: ClassifyServiceOptions = {}
) {
  return Effect.promise(() => classifyTargetResult(input.target, serviceOptions.options));
}
