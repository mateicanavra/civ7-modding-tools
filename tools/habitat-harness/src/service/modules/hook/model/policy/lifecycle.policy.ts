import type {
  GitProviderRequirements,
  GitProviderService,
} from "@internal/habitat-harness/providers/git/index";
import type { SpawnResult } from "@internal/habitat-harness/resources/command/index";
import { Effect } from "effect";
import type { PreCommitOutcome, ResourceStateKind } from "../dto/hook.schema.js";
import type { HookRuntime } from "./runtime.policy.js";

export function finalizePreCommitEffect(
  context: { readonly git: GitProviderService; readonly repoRoot: string },
  runtime: HookRuntime,
  outcome: PreCommitOutcome,
  result: SpawnResult,
  resourceState?: ResourceStateKind
): Effect.Effect<SpawnResult, never, GitProviderRequirements> {
  void context;
  void runtime;
  void outcome;
  void resourceState;
  return Effect.succeed(result);
}

export function finalizePrePushEffect(
  context: { readonly git: GitProviderService; readonly repoRoot: string },
  runtime: HookRuntime,
  outcome: "base-refused" | "affected-failed" | "pass",
  result: SpawnResult
): Effect.Effect<SpawnResult, never, GitProviderRequirements> {
  void context;
  void runtime;
  void outcome;
  return Effect.succeed(result);
}
