import type { FileSystem } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { HabitatConfig } from "@internal/habitat-harness/substrate/config/index";
import type { BiomeProvider } from "@internal/habitat-harness/substrate/providers/biome/index";
import type { CommandRunner } from "@internal/habitat-harness/substrate/providers/command/index";
import type {
  GitProvider,
  GitProviderRequirements,
} from "@internal/habitat-harness/substrate/providers/git/index";
import type {
  GritProvider,
  GritProviderRequirements,
} from "@internal/habitat-harness/substrate/providers/grit/index";
import type { NxProvider } from "@internal/habitat-harness/substrate/providers/nx/index";
import { Context, Effect, Layer } from "effect";
import type { RuleSelection } from "../../domains/rule-selection/index.js";
import type { BaselineAuthority } from "../baseline-authority/index.js";
import type { SourceCheck } from "../source-check/index.js";
import type { BaselineExpansionResult } from "./baseline-expansion.js";
import { expandBaselinesEffect } from "./baseline-expansion.js";
import { createCheckReportEffect } from "./report.js";
import type { CheckOptions } from "./request.js";
import type { CheckReport } from "./schema.js";

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
    | SourceCheck
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
    | SourceCheck
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
