import { service } from "@internal/habitat-harness/service/impl";
import type { ClassifyOptions } from "./model/index.js";

interface ClassifyModuleContext {
  readonly options?: ClassifyOptions;
}

export const module = service.classify.use(({ context, next }) =>
  next({
    context: {
      options: { nxProjects: context.deps.workspaceProjects },
    } satisfies ClassifyModuleContext,
  })
);
