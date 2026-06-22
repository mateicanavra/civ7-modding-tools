import type { BiomeProviderService } from "@internal/habitat-harness/providers/biome/index";
import type { GitProviderService } from "@internal/habitat-harness/providers/git/index";
import type { GraphiteProviderService } from "@internal/habitat-harness/providers/graphite/index";
import type { NxProviderService } from "@internal/habitat-harness/providers/nx/index";
import type {
  HabitatServiceDeps,
  HookServiceModuleContext,
} from "@internal/habitat-harness/service/base";
import { service } from "@internal/habitat-harness/service/impl";

export type {
  HabitatServiceRequirements,
  HookServiceModuleContext,
} from "@internal/habitat-harness/service/base";

export type HookModuleContext = HookServiceModuleContext &
  Pick<HabitatServiceDeps, "repoRoot" | "structuralCheck" | "workspaceGraphTargetNames"> & {
    readonly biome: BiomeProviderService;
    readonly git: GitProviderService;
    readonly graphite: GraphiteProviderService;
    readonly nx: NxProviderService;
  };

export const module = service.hook.use(({ context, next }) =>
  next({
    context: {
      ...(context.hook ?? {}),
      biome: context.deps.biome,
      git: context.deps.git,
      graphite: context.deps.graphite,
      nx: context.deps.nx,
      repoRoot: context.deps.repoRoot,
      runtime: context.hook?.runtime,
      structuralCheck: context.deps.structuralCheck,
      workspaceGraphTargetNames: context.deps.workspaceGraphTargetNames,
    } satisfies HookModuleContext,
  })
);
