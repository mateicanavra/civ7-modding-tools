import type { FileSystem } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import { Context, Effect, Layer } from "effect";
import type { HabitatConfig } from "../../config/index.js";
import type { RuleSelection } from "../../domains/rule-selection/index.js";
import type { BiomeProvider } from "../../providers/biome/index.js";
import type { CommandRunner } from "../../providers/command/index.js";
import type { GitProvider, GitProviderRequirements } from "../../providers/git/index.js";
import type { NxProvider } from "../../providers/nx/index.js";
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
