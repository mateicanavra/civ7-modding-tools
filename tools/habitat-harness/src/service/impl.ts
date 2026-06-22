import { BiomeProvider } from "@internal/habitat-harness/providers/biome/index";
import { GitProvider } from "@internal/habitat-harness/providers/git/index";
import { GraphiteProvider } from "@internal/habitat-harness/providers/graphite/index";
import { GritProvider } from "@internal/habitat-harness/providers/grit/index";
import { NxProvider } from "@internal/habitat-harness/providers/nx/index";
import { workspaceGraphTargetNames } from "@internal/habitat-harness/providers/nx/targets";
import { repoRoot } from "@internal/habitat-harness/resources/paths";
import {
  acquireTempDirectory,
  epochMillisToIsoString,
  readText,
} from "@internal/habitat-harness/resources/platform/index";
import { HabitatRuntimeLive } from "@internal/habitat-harness/runtime/layers";
import {
  type HabitatServiceContext,
  type HabitatServiceDeps,
  type HabitatServiceRequirements,
  type HabitatServiceResolvedContext,
  HabitatServiceRuntime,
  type HabitatServiceRuntimeError,
} from "@internal/habitat-harness/service/base";
import {
  type HabitatServiceContract,
  habitatServiceContract,
} from "@internal/habitat-harness/service/contract";
import { StructuralCheck } from "@internal/habitat-harness/service/model/check/policy/structural/index";
import { Effect, Layer, ManagedRuntime } from "effect";
import { type EffectImplementerInternal, eoc, implementEffect } from "effect-orpc";

const habitatServiceOrpcContract = eoc.router(habitatServiceContract);
export const habitatServiceEffectRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    HabitatRuntimeLive,
    Layer.succeed(HabitatServiceRuntime, { service: "habitat" as const })
  )
);

export const service: EffectImplementerInternal<
  HabitatServiceContract,
  HabitatServiceContext & Record<never, never>,
  HabitatServiceResolvedContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError
> = implementEffect(habitatServiceOrpcContract, habitatServiceEffectRuntime)
  .$context<HabitatServiceContext>()
  .use(async ({ context, next }) => {
    const deps = await resolveHabitatServiceDeps(context);
    return next({
      context: {
        ...context,
        ...deps,
        options: context.classify?.options,
        runtime: context.hook?.runtime,
      },
    });
  });

function resolveHabitatServiceDeps(context: HabitatServiceContext): Promise<HabitatServiceDeps> {
  return habitatServiceEffectRuntime.runPromise(
    Effect.gen(function* () {
      return {
        acquireTempDirectory:
          context.deps?.acquireTempDirectory ??
          context.graph?.acquireTempDirectory ??
          acquireTempDirectory,
        biome: context.deps?.biome ?? context.hook?.biome ?? (yield* BiomeProvider),
        epochMillisToIsoString:
          context.deps?.epochMillisToIsoString ??
          context.verify?.epochMillisToIsoString ??
          epochMillisToIsoString,
        git: context.deps?.git ?? context.hook?.git ?? context.verify?.git ?? (yield* GitProvider),
        graphite:
          context.deps?.graphite ??
          context.hook?.graphite ??
          context.verify?.graphite ??
          (yield* GraphiteProvider),
        grit: context.deps?.grit ?? context.fix?.grit ?? (yield* GritProvider),
        nx:
          context.deps?.nx ??
          context.graph?.nx ??
          context.hook?.nx ??
          context.verify?.nx ??
          (yield* NxProvider),
        readText: context.deps?.readText ?? context.graph?.readText ?? readText,
        repoRoot:
          context.deps?.repoRoot ?? context.hook?.repoRoot ?? context.verify?.repoRoot ?? repoRoot,
        structuralCheck: context.deps?.structuralCheck ?? (yield* StructuralCheck),
        workspaceGraphTargetNames:
          context.deps?.workspaceGraphTargetNames ??
          context.hook?.workspaceGraphTargetNames ??
          workspaceGraphTargetNames,
      };
    })
  );
}
