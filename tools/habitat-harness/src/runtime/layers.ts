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
import { HabitatConfigLive } from "@internal/habitat-harness/resources/config/index";
import { repoRoot } from "@internal/habitat-harness/resources/paths";
import { HabitatPlatformLive } from "@internal/habitat-harness/resources/platform/index";
import { HabitatReporterLive } from "@internal/habitat-harness/resources/reporter/index";
import { Layer } from "effect";

export const HabitatRuntimeLive = Layer.mergeAll(
  NodeContext.layer,
  HabitatConfigLive,
  makeGitStateProviderLayer(repoRoot),
  CommandRunnerLive,
  makeGitProviderLayer(repoRoot),
  makeGraphiteProviderLayer(repoRoot),
  makeBiomeProviderLayer(repoRoot),
  makeNxProviderLayer(repoRoot),
  HabitatReporterLive,
  HabitatPlatformLive,
  makeGritProviderLayer(repoRoot)
);
