import type {
  GitProviderRequirements,
  GitProviderService,
} from "@internal/habitat-harness/providers/git/index";
import type { SpawnResult } from "@internal/habitat-harness/resources/command/index";
import { Effect } from "effect";
import type { PreCommitOutcome, ResourceStateKind } from "../dto/hook.schema.js";

export function finalizePreCommitEffect(
  context: { readonly git: GitProviderService; readonly repoRoot: string },
  outcome: PreCommitOutcome,
  result: SpawnResult,
  resourceState?: ResourceStateKind
): Effect.Effect<SpawnResult, never, GitProviderRequirements> {
  void context;
  void outcome;
  void resourceState;
  return Effect.succeed(result);
}

export function finalizePrePushEffect(
  context: { readonly git: GitProviderService; readonly repoRoot: string },
  outcome: "base-refused" | "affected-failed" | "pass",
  result: SpawnResult
): Effect.Effect<SpawnResult, never, GitProviderRequirements> {
  void context;
  void outcome;
  return Effect.succeed(result);
}
