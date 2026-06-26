import { habitatServiceManagedRuntime } from "@habitat/cli/runtime/service-runtime";
import {
  type HabitatModule as BaseHabitatModule,
  type HabitatServiceContext,
  type HabitatServiceRequirements,
  type HabitatServiceRuntimeError,
  type HabitatServiceSharedContext,
} from "@habitat/cli/service/base";
import { type HabitatServiceContract, habitatServiceContract } from "@habitat/cli/service/contract";
import type { EffectImplementerInternal } from "effect-orpc";
import { eoc, implementEffect } from "effect-orpc";

const habitatServiceOrpcContract = eoc.router(habitatServiceContract);

export type HabitatModule<
  TPath extends keyof HabitatServiceContract,
  TContext extends object,
> = BaseHabitatModule<HabitatServiceContract[TPath], TContext>;

export const service: EffectImplementerInternal<
  HabitatServiceContract,
  HabitatServiceContext,
  HabitatServiceSharedContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError
> = implementEffect(habitatServiceOrpcContract, habitatServiceManagedRuntime)
  .$context<HabitatServiceContext>()
  .use(({ context, next }) => {
    const structuralCheck: HabitatServiceSharedContext["structuralCheck"] = {
      baselineFileSystem: {
        isDirectory: context.deps.platform.isDirectory,
        isFile: context.deps.platform.isFileEffect,
        makeDirectory: context.deps.platform.makeDirectory,
        readDirectory: context.deps.platform.readDirectory,
        readText: context.deps.platform.readText,
        writeText: context.deps.platform.writeText,
      },
      biome: context.deps.biome,
      command: context.deps.commandRunner,
      git: context.deps.git,
      grit: {
        runRules: context.deps.grit.runRules,
      },
      nx: context.deps.nx,
      repoRoot: context.deps.platform.repoRoot,
      rules: context.deps.rules,
      sourceFileSystem: {
        isDirectory: context.deps.platform.isDirectory,
        isFile: context.deps.platform.isFileEffect,
        readDirectory: context.deps.platform.readDirectory,
        readText: context.deps.platform.readText,
      },
    };

    return next({
      context: {
        structuralCheck,
      },
    });
  });
