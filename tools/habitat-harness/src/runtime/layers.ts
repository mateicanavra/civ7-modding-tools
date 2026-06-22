import { NodeContext } from "@effect/platform-node";
import { BiomeProviderLive } from "@internal/habitat-harness/providers/biome/index";
import {
  GitProviderLive,
  GitStateProviderLive,
} from "@internal/habitat-harness/providers/git/index";
import { GraphiteProviderLive } from "@internal/habitat-harness/providers/graphite/index";
import { GritProviderLive } from "@internal/habitat-harness/providers/grit/index";
import { NxProviderLive } from "@internal/habitat-harness/providers/nx/index";
import { CommandRunnerLive } from "@internal/habitat-harness/resources/command/index";
import { HabitatConfigLive } from "@internal/habitat-harness/resources/config/index";
import { HabitatReporterLive } from "@internal/habitat-harness/resources/reporter/index";
import { BaselineAuthorityLive } from "@internal/habitat-harness/service/modules/check/model/policy/baseline/service.policy";
import {
  runSourceRulesEffect,
  SourceCheck,
} from "@internal/habitat-harness/service/modules/check/model/policy/source/index";
import { StructuralCheckLive } from "@internal/habitat-harness/service/modules/check/model/policy/structural/service.policy";
import { Layer } from "effect";

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
