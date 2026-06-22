import type { FileSystem } from "@effect/platform";
import type { RuleSourceFacts } from "@internal/habitat-harness/service/model/rules/index";
import { Context, Effect } from "effect";
import { runSourceRulesEffect } from "./source-rules.js";

export interface SourceCheckOptions {
  readonly scanRoots?: readonly string[];
}

export interface SourceCheckService {
  readonly runSourceRules: (
    rules: readonly RuleSourceFacts[],
    options?: SourceCheckOptions
  ) => ReturnType<typeof runSourceRulesEffect>;
}

export class SourceCheck extends Context.Tag("@internal/habitat-harness/SourceCheck")<
  SourceCheck,
  SourceCheckService
>() {}

export type SourceCheckRequirements = FileSystem.FileSystem;
