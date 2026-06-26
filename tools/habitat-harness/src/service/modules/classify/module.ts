import type {
  HabitatServiceContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError,
} from "@internal/habitat-harness/service/base";
import type { HabitatServiceContract } from "@internal/habitat-harness/service/contract";
import { service } from "@internal/habitat-harness/service/impl";
import { Effect } from "effect";
import type { EffectImplementerInternal } from "effect-orpc";
import { type ClassifyResult, classifyTargetResultEffect } from "./model/index.js";

export interface ClassifyModuleContext {
  readonly classifyTargetResult: (target: string) => Effect.Effect<ClassifyResult>;
}

type ClassifyModule = EffectImplementerInternal<
  HabitatServiceContract["classify"],
  HabitatServiceContext,
  HabitatServiceContext & ClassifyModuleContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError
>;

export const module: ClassifyModule = service.classify.use(({ context, next }) =>
  next({
    context: {
      classifyTargetResult: (target: string) =>
        classifyTargetResultEffect(target, context.deps.nx.workspaceGraph()),
    } satisfies ClassifyModuleContext,
  })
);
