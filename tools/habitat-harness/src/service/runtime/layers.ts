import { NodeContext } from "@effect/platform-node";
import { BaselineAuthorityLive } from "@internal/habitat-harness/service/modules/check/baseline/service";
import {
  runSourceRulesEffect,
  SourceCheck,
} from "@internal/habitat-harness/service/modules/check/source/index";
import { StructuralCheckLive } from "@internal/habitat-harness/service/modules/check/structural/service";
import { Layer } from "effect";
import { BiomeProviderLive } from "./biome/index.js";
import { CommandRunnerLive } from "./command/index.js";
import { HabitatConfigLive } from "./config/index.js";
import { GitProviderLive, GitStateProviderLive } from "./git/index.js";
import { GraphiteProviderLive } from "./graphite/index.js";
import { GritProviderLive } from "./grit/index.js";
import { NxProviderLive } from "./nx/index.js";
import { HabitatReporterLive } from "./reporter/index.js";

const SourceCheckLive = Layer.succeed(SourceCheck, {
  runSourceRules: runSourceRulesEffect,
});

export const HabitatRuntimeLive = Layer.mergeAll(
  NodeContext.layer,
  HabitatConfigLive,
  GitStateProviderLive,
  CommandRunnerLive,
  GitProviderLive,
  GraphiteProviderLive,
  BiomeProviderLive,
  NxProviderLive,
  HabitatReporterLive,
  GritProviderLive,
  BaselineAuthorityLive,
  SourceCheckLive,
  StructuralCheckLive
);
