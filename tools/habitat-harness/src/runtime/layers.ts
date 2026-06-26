import { NodeContext } from "@effect/platform-node";
import { makeBiomeProviderLayer } from "@internal/habitat-harness/providers/biome/index";
import {
  makeGitProviderLayer,
  makeGitStateProviderLayer,
} from "@internal/habitat-harness/providers/git/index";
import { makeGraphiteProviderLayer } from "@internal/habitat-harness/providers/graphite/index";
import { makeGritProviderLayer } from "@internal/habitat-harness/providers/grit/index";
import { makeNxProviderLayer } from "@internal/habitat-harness/providers/nx/index";
import { CommandRunnerLive } from "@internal/habitat-harness/resources/command/index";
import { HabitatConfig, HabitatConfigLive } from "@internal/habitat-harness/resources/config/index";
import { makeHabitatPlatformLayer } from "@internal/habitat-harness/resources/platform/index";
import { HabitatReporterLive } from "@internal/habitat-harness/resources/reporter/index";
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
