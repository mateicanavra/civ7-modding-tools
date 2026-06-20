import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import { Context, Effect, Layer } from "effect";
import type { HabitatConfig } from "../../config/index.js";
import type { RuleSelection } from "../../lib/rule-selection.js";
import type { CommandRunner } from "../../providers/command/index.js";
import type { GritProvider, GritProviderRequirements } from "../../providers/grit/index.js";
import type { HabitatClock } from "../../resources/index.js";
import type { BaselineAuthority } from "../baseline-authority/index.js";
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
    | CommandRunner
    | CommandExecutor
    | GritProvider
    | GritProviderRequirements
    | HabitatConfig
    | HabitatClock
  >;
  readonly expandBaselines: (
    selection?: RuleSelection,
    options?: { base?: string }
  ) => Effect.Effect<
    BaselineExpansionResult,
    never,
    | BaselineAuthority
    | CommandRunner
    | CommandExecutor
    | GritProvider
    | GritProviderRequirements
    | HabitatConfig
    | HabitatClock
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
