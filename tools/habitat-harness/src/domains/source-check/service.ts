import type { FileSystem } from "@effect/platform";
import { Context, Effect, Layer } from "effect";
import type { RuleSourceFacts } from "../rule-registry/index.js";
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

export const SourceCheckLive = Layer.succeed(SourceCheck, {
  runSourceRules: runSourceRulesEffect,
});

export function makeFakeSourceCheckLayer(service: SourceCheckService) {
  return Layer.succeed(SourceCheck, service);
}

export type SourceCheckRequirements = FileSystem.FileSystem;
