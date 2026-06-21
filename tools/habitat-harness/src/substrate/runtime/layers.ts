import { NodeContext } from "@effect/platform-node";
import { HabitatConfigLive } from "@internal/habitat-harness/substrate/config/index";
import { BiomeProviderLive } from "@internal/habitat-harness/substrate/providers/biome/index";
import { CommandRunnerLive } from "@internal/habitat-harness/substrate/providers/command/index";
import {
  GitProviderLive,
  GitStateProviderLive,
} from "@internal/habitat-harness/substrate/providers/git/index";
import { GraphiteProviderLive } from "@internal/habitat-harness/substrate/providers/graphite/index";
import { HuskyProviderLive } from "@internal/habitat-harness/substrate/providers/husky/index";
import { NxProviderLive } from "@internal/habitat-harness/substrate/providers/nx/index";
import { HabitatReporterLive } from "@internal/habitat-harness/substrate/providers/reporter/index";
import { Layer } from "effect";

export const HabitatSubstrateLive = Layer.mergeAll(
  NodeContext.layer,
  HabitatConfigLive,
  GitStateProviderLive,
  CommandRunnerLive,
  GitProviderLive,
  GraphiteProviderLive,
  BiomeProviderLive,
  NxProviderLive,
  HuskyProviderLive,
  HabitatReporterLive
);
