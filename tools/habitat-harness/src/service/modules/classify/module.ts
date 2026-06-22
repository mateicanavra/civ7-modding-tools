import { service } from "@internal/habitat-harness/service/impl";
import { Effect } from "effect";
import { type ClassifyOptions, classifyTargetResult } from "./model/index.js";

interface ClassifyModuleContext {
  readonly classifyTargetResult: typeof classifyTargetResultEffect;
  readonly options?: ClassifyOptions;
}

export const module = service.classify.use(({ context, next }) =>
  next({
    context: {
      classifyTargetResult: classifyTargetResultEffect,
      options: { nxProjects: context.deps.workspaceProjects },
    } satisfies ClassifyModuleContext,
  })
);

function classifyTargetResultEffect(target: string, options: ClassifyOptions) {
  return Effect.promise(() => classifyTargetResult(target, options));
}
