import type { BiomeProviderService } from "@internal/habitat-harness/providers/biome/index";
import type { GitProviderService } from "@internal/habitat-harness/providers/git/index";
import type { GraphiteProviderService } from "@internal/habitat-harness/providers/graphite/index";
import type { NxProviderService } from "@internal/habitat-harness/providers/nx/index";
import type { HookServiceModuleContext } from "@internal/habitat-harness/service/base";
import { service } from "@internal/habitat-harness/service/impl";
import type { StructuralCheckService } from "@internal/habitat-harness/service/model/check/policy/structural/index";

export type {
  HabitatServiceRequirements,
  HookServiceModuleContext,
} from "@internal/habitat-harness/service/base";

export type HookModuleContext = Required<Omit<HookServiceModuleContext, "runtime">> &
  Pick<HookServiceModuleContext, "runtime"> & {
    readonly biome: BiomeProviderService;
    readonly git: GitProviderService;
    readonly graphite: GraphiteProviderService;
    readonly nx: NxProviderService;
    readonly structuralCheck: StructuralCheckService;
  };

export const module = service.hook.use(({ context, next }) =>
  next({
    context: {
      ...(context.hook ?? {}),
      biome: context.biome,
      git: context.git,
      graphite: context.graphite,
      nx: context.nx,
      repoRoot: context.repoRoot,
      runtime: context.runtime,
      structuralCheck: context.structuralCheck,
      workspaceGraphTargetNames: context.workspaceGraphTargetNames,
    } satisfies HookModuleContext,
  })
);
