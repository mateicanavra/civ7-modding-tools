import { BaselineAuthorityLive } from "@internal/habitat-harness/core/domains/baseline-authority/service";
import {
  runSourceRulesEffect,
  SourceCheck,
} from "@internal/habitat-harness/core/domains/source-check/index";
import { StructuralCheckLive } from "@internal/habitat-harness/core/domains/structural-check/service";
import { GritProviderLive } from "@internal/habitat-harness/substrate/providers/grit/index";
import { HabitatSubstrateLive } from "@internal/habitat-harness/substrate/runtime/index";
import { Layer } from "effect";

const SourceCheckLive = Layer.succeed(SourceCheck, {
  runSourceRules: runSourceRulesEffect,
});

export const HabitatRuntimeLive = Layer.mergeAll(
  HabitatSubstrateLive,
  GritProviderLive,
  BaselineAuthorityLive,
  SourceCheckLive,
  StructuralCheckLive
);
