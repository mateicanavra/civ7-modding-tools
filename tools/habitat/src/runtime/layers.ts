import { NodeContext } from "@effect/platform-node";
import { makeBiomeProviderLayer } from "@habitat/cli/providers/biome/index";
import {
  makeGitProviderLayer,
  makeGitStateProviderLayer,
} from "@habitat/cli/providers/git/index";
import { makeGraphiteProviderLayer } from "@habitat/cli/providers/graphite/index";
import { makeGritProviderLayer } from "@habitat/cli/providers/grit/index";
import { makeNxProviderLayer } from "@habitat/cli/providers/nx/index";
import { CommandRunnerLive } from "@habitat/cli/resources/command/index";
import { HabitatConfig, HabitatConfigLive } from "@habitat/cli/resources/config/index";
import { makeHabitatPlatformLayer } from "@habitat/cli/resources/platform/index";
import { HabitatReporterLive } from "@habitat/cli/resources/reporter/index";
import { Effect, Layer } from "effect";

const HabitatRuntimeBaseLive = Layer.mergeAll(
  NodeContext.layer,
  HabitatConfigLive,
  CommandRunnerLive,
  HabitatReporterLive
);

const HabitatRepoScopedLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const configResource = yield* HabitatConfig;
    const config = yield* configResource.get;
    return Layer.mergeAll(
      makeGitStateProviderLayer(config.repoRoot),
      makeGitProviderLayer(config.repoRoot),
      makeGraphiteProviderLayer(config.repoRoot),
      makeBiomeProviderLayer(config.repoRoot),
      makeNxProviderLayer(config.repoRoot),
      makeHabitatPlatformLayer({ repoRoot: config.repoRoot }),
      makeGritProviderLayer(config.repoRoot)
    );
  })
);

export const HabitatRuntimeLive = Layer.provideMerge(HabitatRepoScopedLive, HabitatRuntimeBaseLive);
