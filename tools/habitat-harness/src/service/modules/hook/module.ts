import type { BiomeProviderService } from "@internal/habitat-harness/providers/biome/index";
import type { GitProviderService } from "@internal/habitat-harness/providers/git/index";
import type { GraphiteProviderService } from "@internal/habitat-harness/providers/graphite/index";
import type { NxProviderService } from "@internal/habitat-harness/providers/nx/index";
import { service } from "@internal/habitat-harness/service/impl";
import type { StructuralCheckService } from "@internal/habitat-harness/service/model/check/policy/structural/index";
import type { HookRuntime } from "./model/policy/runtime.policy.js";

interface HookModuleContext {
  readonly biome: BiomeProviderService;
  readonly git: GitProviderService;
  readonly graphite: GraphiteProviderService;
  readonly nx: NxProviderService;
  readonly repoRoot: string;
  readonly runtime: HookRuntime;
  readonly structuralCheck: StructuralCheckService;
  readonly workspaceGraphTargetNames: typeof import("@internal/habitat-harness/providers/nx/targets").workspaceGraphTargetNames;
}

export const module = service.hook.use(({ context, next }) =>
  next({
    context: {
      biome: context.deps.biome,
      git: context.deps.git,
      graphite: context.deps.graphite,
      nx: context.deps.nx,
      repoRoot: context.deps.repoRoot,
      runtime: context.deps.hookRuntime,
      structuralCheck: context.deps.structuralCheck,
      workspaceGraphTargetNames: context.deps.workspaceGraphTargetNames,
    } satisfies HookModuleContext,
  })
);
