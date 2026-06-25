import { service, type HabitatModule } from "@habitat/cli/service/impl";
import { Effect } from "effect";
import { type ClassifyResult, classifyTargetResultEffect } from "./model/index.js";

export interface ClassifyModuleContext {
  readonly classifyTargetResult: (target: string) => Effect.Effect<ClassifyResult>;
}

export const module: HabitatModule<"classify", ClassifyModuleContext> = service.classify.use(
  ({ context, next }) =>
    next({
      context: {
        classifyTargetResult: (target: string) =>
          classifyTargetResultEffect(target, context.deps.nx.workspaceGraph(), {
            fileSystem: {
              isFile: context.deps.platform.isFile,
              readText: context.deps.platform.readTextSync,
              statKind: context.deps.platform.statKind,
            },
            repoRoot: context.deps.platform.repoRoot,
            rules: context.deps.rules,
          }),
      } satisfies ClassifyModuleContext,
    })
);
