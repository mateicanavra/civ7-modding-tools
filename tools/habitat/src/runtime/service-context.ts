import { BiomeProvider } from "@habitat/cli/providers/biome/index";
import { GitProvider } from "@habitat/cli/providers/git/index";
import { GraphiteProvider } from "@habitat/cli/providers/graphite/index";
import { NxProvider } from "@habitat/cli/providers/nx/index";
import { CommandRunner } from "@habitat/cli/resources/command/index";
import { HabitatPlatform } from "@habitat/cli/resources/platform/index";
import { silentHabitatReporter } from "@habitat/cli/resources/reporter/index";
import { RuleDiagnostics } from "@habitat/cli/resources/rule-diagnostics/index";
import { RuleFixPreview } from "@habitat/cli/resources/rule-fix-preview/index";
import { habitatServiceManagedRuntime } from "@habitat/cli/runtime/service-runtime";
import type { HabitatServiceContext, HabitatServiceDeps } from "@habitat/cli/service/base";
import { RuleFacts } from "@habitat/cli/service/model/rules/index";
import { Effect } from "effect";

export type LiveHabitatServiceContextInput = Omit<Partial<HabitatServiceContext>, "deps">;

export async function createLiveHabitatServiceContext(
  input: LiveHabitatServiceContextInput = {},
  options: { readonly signal?: AbortSignal } = {}
): Promise<HabitatServiceContext> {
  const deps = await habitatServiceManagedRuntime.runPromise(
    Effect.gen(function* () {
      const platform = yield* HabitatPlatform;
      const rules = yield* RuleFacts;
      return {
        biome: yield* BiomeProvider,
        commandRunner: yield* CommandRunner,
        git: yield* GitProvider,
        graphite: yield* GraphiteProvider,
        nx: yield* NxProvider,
        platform,
        reporter: silentHabitatReporter,
        ruleDiagnostics: yield* RuleDiagnostics,
        ruleFixPreview: yield* RuleFixPreview,
        rules,
      } satisfies HabitatServiceDeps;
    }),
    { signal: options.signal }
  );

  return {
    ...input,
    deps,
  };
}
