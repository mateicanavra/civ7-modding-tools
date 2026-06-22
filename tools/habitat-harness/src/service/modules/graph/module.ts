import type { NxProviderService } from "@internal/habitat-harness/providers/nx/index";
import { acquireTempDirectory, readText } from "@internal/habitat-harness/resources/platform/index";
import {
  type GraphServiceModuleContext,
  requiredHabitatServiceDependency,
} from "@internal/habitat-harness/service/base";
import { service } from "@internal/habitat-harness/service/impl";

export type GraphModuleContext = GraphServiceModuleContext & {
  readonly acquireTempDirectory: typeof acquireTempDirectory;
  readonly nx: NxProviderService;
  readonly readText: typeof readText;
};

export const module = service.graph.use(({ context, next }) =>
  next({
    context: {
      ...(context.graph ?? {}),
      acquireTempDirectory: requiredHabitatServiceDependency(
        context.deps.acquireTempDirectory,
        "acquireTempDirectory"
      ),
      nx: requiredHabitatServiceDependency(context.deps.nx, "nx"),
      readText: requiredHabitatServiceDependency(context.deps.readText, "readText"),
    } satisfies GraphModuleContext,
  })
);
