import type { NxProviderService } from "@internal/habitat-harness/providers/nx/index";
import type {
  acquireTempDirectory,
  readText,
} from "@internal/habitat-harness/resources/platform/index";
import { service } from "@internal/habitat-harness/service/impl";

export interface GraphModuleContext {
  readonly acquireTempDirectory: typeof acquireTempDirectory;
  readonly nx: NxProviderService;
  readonly readText: typeof readText;
}

export const module = service.graph.use(({ context, next }) =>
  next({
    context: {
      acquireTempDirectory: context.deps.acquireTempDirectory,
      nx: context.deps.nx,
      readText: context.deps.readText,
    } satisfies GraphModuleContext,
  })
);
