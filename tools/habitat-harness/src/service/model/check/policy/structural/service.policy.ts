import type { FileSystem } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { BiomeProvider } from "@internal/habitat-harness/providers/biome/index";
import type {
  GitProvider,
  GitProviderRequirements,
} from "@internal/habitat-harness/providers/git/index";
import type {
  GritProvider,
  GritProviderRequirements,
} from "@internal/habitat-harness/providers/grit/index";
import type { NxProvider } from "@internal/habitat-harness/providers/nx/index";
import type { CommandRunner } from "@internal/habitat-harness/resources/command/index";
import type { HabitatConfig } from "@internal/habitat-harness/resources/config/index";
import type {
  CheckOptions,
  CheckReport,
} from "@internal/habitat-harness/service/model/check/index";
import type { BaselineAuthority } from "@internal/habitat-harness/service/model/check/policy/baseline/index";
import type { RuleSelection } from "@internal/habitat-harness/service/model/rules/policy/selection.policy";
import { Context, Effect, Layer } from "effect";
import type { BaselineExpansionResult } from "./baseline-expansion.policy.js";
import { expandBaselinesEffect } from "./baseline-expansion.policy.js";
import { createCheckReportEffect } from "./report.policy.js";

export interface StructuralCheckService {
  readonly createReport: (
    options?: CheckOptions
  ) => Effect.Effect<
    CheckReport,
    never,
    | BaselineAuthority
    | BiomeProvider
    | CommandRunner
    | NxProvider
    | CommandExecutor
    | HabitatConfig
    | FileSystem.FileSystem
    | GitProvider
    | GitProviderRequirements
    | GritProvider
    | GritProviderRequirements
  >;
  readonly expandBaselines: (
    selection?: RuleSelection,
    options?: { base?: string }
  ) => Effect.Effect<
    BaselineExpansionResult,
    never,
    | BaselineAuthority
    | BiomeProvider
    | CommandRunner
    | NxProvider
    | CommandExecutor
    | HabitatConfig
    | FileSystem.FileSystem
    | GitProvider
    | GitProviderRequirements
    | GritProvider
    | GritProviderRequirements
  >;
}

export class StructuralCheck extends Context.Tag("@internal/habitat-harness/StructuralCheck")<
  StructuralCheck,
  StructuralCheckService
>() {}

export const StructuralCheckLive = Layer.succeed(StructuralCheck, {
  createReport: createCheckReportEffect,
  expandBaselines: expandBaselinesEffect,
});

export function makeFakeStructuralCheckLayer(service: StructuralCheckService) {
  return Layer.succeed(StructuralCheck, service);
}
