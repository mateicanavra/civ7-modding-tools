import type { SpawnResult } from "@internal/habitat-harness/resources/command/index";
import { Effect } from "effect";
import type { PreCommitOutcome, ResourceStateKind } from "../dto/hook.schema.js";

export function finalizePreCommitEffect(
  outcome: PreCommitOutcome,
  result: SpawnResult,
  resourceState?: ResourceStateKind
): Effect.Effect<SpawnResult> {
  void outcome;
  void resourceState;
  return Effect.succeed(result);
}

export function finalizePrePushEffect(
  outcome: "base-refused" | "affected-failed" | "pass",
  result: SpawnResult
): Effect.Effect<SpawnResult> {
  void outcome;
  return Effect.succeed(result);
}
