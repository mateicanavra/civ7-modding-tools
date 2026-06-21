import type { SpawnResult } from "@internal/habitat-harness/substrate/providers/command/index";
import type {
  GitProvider,
  GitProviderRequirements,
} from "@internal/habitat-harness/substrate/providers/git/index";
import { Effect } from "effect";
import { captureRepoSnapshotEffect } from "./repo-snapshot.js";
import { type HookRuntime, hookNow } from "./runtime.js";
import type { HookTrace, PreCommitOutcome, ResourceStateKind } from "./schema.js";

export function finalizePreCommitEffect(
  runtime: HookRuntime,
  outcome: PreCommitOutcome,
  result: SpawnResult,
  resourceState?: ResourceStateKind
): Effect.Effect<SpawnResult, never, GitProvider | GitProviderRequirements> {
  return Effect.gen(function* () {
    if (runtime.trace?.preCommit) {
      runtime.trace.preCommit.outcome = outcome;
      runtime.trace.preCommit.exitCode = result.exitCode;
      runtime.trace.preCommit.postState = yield* captureRepoSnapshotEffect(
        runtime,
        resourceState ?? runtime.trace.preCommit.resourceState
      );
      runtime.trace.preCommit.endedAtMs = yield* hookNow(runtime);
      runtime.trace.preCommit.durationMs = Math.max(
        0,
        runtime.trace.preCommit.endedAtMs - runtime.trace.preCommit.startedAtMs
      );
    }
    return result;
  });
}

export function finalizePrePushEffect(
  runtime: HookRuntime,
  outcome: NonNullable<HookTrace["prePush"]>["outcome"],
  result: SpawnResult
): Effect.Effect<SpawnResult, never, GitProvider | GitProviderRequirements> {
  return Effect.gen(function* () {
    if (runtime.trace?.prePush) {
      runtime.trace.prePush.outcome = outcome;
      runtime.trace.prePush.exitCode = result.exitCode;
      runtime.trace.prePush.postState = yield* captureRepoSnapshotEffect(runtime);
      runtime.trace.prePush.endedAtMs = yield* hookNow(runtime);
      runtime.trace.prePush.durationMs = Math.max(
        0,
        runtime.trace.prePush.endedAtMs - runtime.trace.prePush.startedAtMs
      );
    }
    return result;
  });
}
