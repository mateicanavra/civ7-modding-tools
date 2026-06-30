import path from "node:path";
import type { FileSystem } from "@effect/platform";
import { BiomeProvider } from "@habitat/cli/providers/biome/index";
import { GitProvider } from "@habitat/cli/providers/git/index";
import { GraphiteProvider } from "@habitat/cli/providers/graphite/index";
import { GritProvider } from "@habitat/cli/providers/grit/index";
import { NxProvider } from "@habitat/cli/providers/nx/index";
import { ruleRegistryRepoPath } from "@habitat/cli/resources/authority-paths";
import { CommandRunner } from "@habitat/cli/resources/command/index";
import { HabitatPlatform } from "@habitat/cli/resources/platform/index";
import { silentHabitatReporter } from "@habitat/cli/resources/reporter/index";
import { habitatServiceManagedRuntime } from "@habitat/cli/runtime/service-runtime";
import type { HabitatServiceContext, HabitatServiceDeps } from "@habitat/cli/service/base";
import {
  loadRuleRegistryDocumentEffect,
  type RuleRegistryFileSystem,
} from "@habitat/cli/service/model/rules/index";
import { ruleFactsCatalog } from "@habitat/cli/service/model/rules/policy/catalog.policy";
import { Effect } from "effect";

export type LiveHabitatServiceContextInput = Omit<Partial<HabitatServiceContext>, "deps"> & {
  readonly deps?: Partial<HabitatServiceDeps>;
};

export async function createLiveHabitatServiceContext(
  input: LiveHabitatServiceContextInput = {}
): Promise<HabitatServiceContext> {
  const deps = await habitatServiceManagedRuntime.runPromise(
    Effect.gen(function* () {
      const platform = input.deps?.platform ?? (yield* HabitatPlatform);
      const registryFileSystem: RuleRegistryFileSystem<FileSystem.FileSystem> = {
        isDirectory: platform.isDirectory,
        readDirectory: platform.readDirectory,
        readText: platform.readText,
      };
      return {
        biome: input.deps?.biome ?? (yield* BiomeProvider),
        commandRunner: input.deps?.commandRunner ?? (yield* CommandRunner),
        git: input.deps?.git ?? (yield* GitProvider),
        graphite: input.deps?.graphite ?? (yield* GraphiteProvider),
        grit: input.deps?.grit ?? (yield* GritProvider),
        nx: input.deps?.nx ?? (yield* NxProvider),
        platform,
        reporter: input.deps?.reporter ?? silentHabitatReporter,
        rules:
          input.deps?.rules ??
          (yield* loadRuleRegistryDocumentEffect(
            path.join(platform.repoRoot, ruleRegistryRepoPath),
            registryFileSystem
          ).pipe(Effect.map(ruleFactsCatalog))),
        ...input.deps,
      } satisfies HabitatServiceDeps;
    })
  );

  return {
    ...input,
    deps,
  };
}
