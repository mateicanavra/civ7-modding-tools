import path from "node:path";
import { BiomeProvider } from "@internal/habitat-harness/providers/biome/index";
import { GitProvider } from "@internal/habitat-harness/providers/git/index";
import { GraphiteProvider } from "@internal/habitat-harness/providers/graphite/index";
import { GritProvider } from "@internal/habitat-harness/providers/grit/index";
import { NxProvider } from "@internal/habitat-harness/providers/nx/index";
import { ruleRegistryRepoPath } from "@internal/habitat-harness/resources/artifact-paths";
import { CommandRunner } from "@internal/habitat-harness/resources/command/index";
import { HabitatPlatform } from "@internal/habitat-harness/resources/platform/index";
import { silentHabitatReporter } from "@internal/habitat-harness/resources/reporter/index";
import { HabitatRuntimeLive } from "@internal/habitat-harness/runtime/layers";
import type {
  HabitatServiceContext,
  HabitatServiceDeps,
} from "@internal/habitat-harness/service/base";
import { loadRuleRegistryDocumentEffect } from "@internal/habitat-harness/service/model/rules/index";
import { ruleFactsCatalog } from "@internal/habitat-harness/service/model/rules/policy/catalog.policy";
import { Effect, ManagedRuntime } from "effect";

const serviceContextRuntime = ManagedRuntime.make(HabitatRuntimeLive);

export type LiveHabitatServiceContextInput = Omit<Partial<HabitatServiceContext>, "deps"> & {
  readonly deps?: Partial<HabitatServiceDeps>;
};

export async function createLiveHabitatServiceContext(
  input: LiveHabitatServiceContextInput = {}
): Promise<HabitatServiceContext> {
  const deps = await serviceContextRuntime.runPromise(
    Effect.gen(function* () {
      const platform = input.deps?.platform ?? (yield* HabitatPlatform);
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
            path.join(platform.repoRoot, ruleRegistryRepoPath)
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
