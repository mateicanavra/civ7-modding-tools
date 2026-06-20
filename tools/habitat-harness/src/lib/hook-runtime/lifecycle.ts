import type { SpawnResult } from "../spawn.js";
import { captureRepoSnapshot } from "./repo-snapshot.js";
import { type HookRuntime, hookNow } from "./runtime.js";
import type { HookTrace, PreCommitOutcome } from "./schema.js";

export function finalizePreCommit(
  runtime: HookRuntime,
  outcome: PreCommitOutcome,
  result: SpawnResult
): SpawnResult {
  if (runtime.trace?.preCommit) {
    runtime.trace.preCommit.outcome = outcome;
    runtime.trace.preCommit.exitCode = result.exitCode;
    runtime.trace.preCommit.postState = captureRepoSnapshot(runtime);
    runtime.trace.preCommit.endedAtMs = hookNow(runtime);
    runtime.trace.preCommit.durationMs = Math.max(
      0,
      runtime.trace.preCommit.endedAtMs - runtime.trace.preCommit.startedAtMs
    );
  }
  return result;
}

export function finalizePrePush(
  runtime: HookRuntime,
  outcome: NonNullable<HookTrace["prePush"]>["outcome"],
  result: SpawnResult
): SpawnResult {
  if (runtime.trace?.prePush) {
    runtime.trace.prePush.outcome = outcome;
    runtime.trace.prePush.exitCode = result.exitCode;
    runtime.trace.prePush.postState = captureRepoSnapshot(runtime);
    runtime.trace.prePush.endedAtMs = hookNow(runtime);
    runtime.trace.prePush.durationMs = Math.max(
      0,
      runtime.trace.prePush.endedAtMs - runtime.trace.prePush.startedAtMs
    );
  }
  return result;
}
