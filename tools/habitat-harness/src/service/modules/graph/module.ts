import type { HabitatServiceDeps } from "@internal/habitat-harness/service/base";
import { service } from "@internal/habitat-harness/service/impl";

export type GraphModuleContext = Pick<
  HabitatServiceDeps,
  "acquireTempDirectory" | "nx" | "readText"
>;

export const module = service.graph.use(({ context, next }) =>
  next({
    context: {
      acquireTempDirectory: context.deps.acquireTempDirectory,
      nx: context.deps.nx,
      readText: context.deps.readText,
    } satisfies GraphModuleContext,
  })
);
