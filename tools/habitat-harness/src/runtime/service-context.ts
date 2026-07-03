import { BiomeProvider } from "@internal/habitat-harness/providers/biome/index";
import { GitProvider } from "@internal/habitat-harness/providers/git/index";
import { GraphiteProvider } from "@internal/habitat-harness/providers/graphite/index";
import { GritProvider } from "@internal/habitat-harness/providers/grit/index";
import { NxWorkspaceGraphProjectReader } from "@internal/habitat-harness/providers/nx/graph";
import { NxProvider } from "@internal/habitat-harness/providers/nx/index";
import { repoRoot } from "@internal/habitat-harness/resources/paths";
import { acquireTempDirectory, readText } from "@internal/habitat-harness/resources/platform/index";
import { HabitatRuntimeLive } from "@internal/habitat-harness/runtime/layers";
import type {
  HabitatServiceContext,
  HabitatServiceDeps,
} from "@internal/habitat-harness/service/base";
import { StructuralCheck } from "@internal/habitat-harness/service/model/check/policy/structural/index";
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
      return {
        acquireTempDirectory,
        biome: input.deps?.biome ?? (yield* BiomeProvider),
        git: input.deps?.git ?? (yield* GitProvider),
        graphite: input.deps?.graphite ?? (yield* GraphiteProvider),
        grit: input.deps?.grit ?? (yield* GritProvider),
        hookRuntime: input.deps?.hookRuntime ?? {},
        nx: input.deps?.nx ?? (yield* NxProvider),
        readText,
        repoRoot,
        structuralCheck: input.deps?.structuralCheck ?? (yield* StructuralCheck),
        workspaceProjects: input.deps?.workspaceProjects ?? new NxWorkspaceGraphProjectReader(),
        ...input.deps,
      } satisfies HabitatServiceDeps;
    })
  );

  return {
    ...input,
    deps,
  };
}
