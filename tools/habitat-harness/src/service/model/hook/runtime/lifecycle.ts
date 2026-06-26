import type { SpawnResult } from "@internal/habitat-harness/resources/command/index";
import type {
  GitProviderRequirements,
  GitProviderService,
} from "@internal/habitat-harness/providers/git/index";
import { Effect } from "effect";
import { captureRepoSnapshotEffect } from "./repo-snapshot.js";
import { type HookRuntime, hookNow } from "./runtime.js";
import type { HookTrace, PreCommitOutcome, ResourceStateKind } from "./schema.js";

export function finalizePreCommitEffect(
  context: { readonly git: GitProviderService; readonly repoRoot: string },
  runtime: HookRuntime,
  outcome: PreCommitOutcome,
  result: SpawnResult,
  resourceState?: ResourceStateKind
): Effect.Effect<SpawnResult, never, GitProviderRequirements> {
  return Effect.gen(function* () {
    if (runtime.trace?.preCommit) {
      runtime.trace.preCommit.outcome = outcome;
      runtime.trace.preCommit.exitCode = result.exitCode;
      runtime.trace.preCommit.postState = yield* captureRepoSnapshotEffect(
        context,
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
  context: { readonly git: GitProviderService; readonly repoRoot: string },
  runtime: HookRuntime,
  outcome: NonNullable<HookTrace["prePush"]>["outcome"],
  result: SpawnResult
): Effect.Effect<SpawnResult, never, GitProviderRequirements> {
  return Effect.gen(function* () {
    if (runtime.trace?.prePush) {
      runtime.trace.prePush.outcome = outcome;
      runtime.trace.prePush.exitCode = result.exitCode;
      runtime.trace.prePush.postState = yield* captureRepoSnapshotEffect(context, runtime);
      runtime.trace.prePush.endedAtMs = yield* hookNow(runtime);
      runtime.trace.prePush.durationMs = Math.max(
        0,
        runtime.trace.prePush.endedAtMs - runtime.trace.prePush.startedAtMs
      );
    }
    return result;
  });
}
