import type { FileSystem } from "@effect/platform";
import { Context, Effect, Layer } from "effect";
import type { RulePatternFacts } from "../rule-registry/index.js";
import { runSourcePatternRulesEffect } from "./source-patterns.js";

export interface SourceCheckOptions {
  readonly scanRoots?: readonly string[];
}

export interface SourceCheckService {
  readonly runPatternRules: (
    rules: readonly RulePatternFacts[],
    options?: SourceCheckOptions
  ) => ReturnType<typeof runSourcePatternRulesEffect>;
}

export class SourceCheck extends Context.Tag("@internal/habitat-harness/SourceCheck")<
  SourceCheck,
  SourceCheckService
>() {}

export const SourceCheckLive = Layer.succeed(SourceCheck, {
  runPatternRules: runSourcePatternRulesEffect,
});

export function makeFakeSourceCheckLayer(service: SourceCheckService) {
  return Layer.succeed(SourceCheck, service);
}

export type SourceCheckRequirements = FileSystem.FileSystem;
