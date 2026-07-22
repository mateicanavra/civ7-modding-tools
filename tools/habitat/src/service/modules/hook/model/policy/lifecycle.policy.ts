import type { SpawnResult } from "@habitat/cli/resources/command/index";
import { Effect } from "effect";
import type { PreCommitOutcome, ResourceStateKind } from "../dto/hook.schema.js";

export function finalizePreCommitEffect(
  outcome: PreCommitOutcome,
  result: SpawnResult,
  resourceState?: ResourceStateKind
) {
  void outcome;
  void resourceState;
  return Effect.succeed(result);
}

export function finalizePrePushEffect(
  outcome: "base-refused" | "affected-failed" | "pass",
  result: SpawnResult
) {
  void outcome;
  return Effect.succeed(result);
}
