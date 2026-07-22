import type { HabitatServiceDeps } from "@habitat/cli/service/base";
import { type HabitatModule, service } from "@habitat/cli/service/impl";
import { classifyTargetResultEffect } from "./model/index.js";

export type ClassifyModuleContext = ReturnType<typeof makeClassifyModuleContext>;

export const module: HabitatModule<"classify", ClassifyModuleContext> = service.classify.use(
  ({ context, next }) => next({ context: makeClassifyModuleContext(context.deps) })
);

function makeClassifyModuleContext(deps: HabitatServiceDeps) {
  return {
    classifyTargetResult: (target: string) =>
      classifyTargetResultEffect(target, deps.nx.workspaceGraph(), {
        fileSystem: {
          isFile: deps.platform.isFile,
          readText: deps.platform.readTextSync,
          statKind: deps.platform.statKind,
        },
        repoRoot: deps.platform.repoRoot,
        rules: deps.rules,
      }),
  };
}
