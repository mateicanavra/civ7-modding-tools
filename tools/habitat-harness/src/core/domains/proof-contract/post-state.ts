import { repoRoot } from "@internal/habitat-harness/substrate/lib/paths";
import type { SpawnResult } from "@internal/habitat-harness/substrate/providers/command/index";
import {
  GitProvider,
  spawnResultFromCommandResult,
} from "@internal/habitat-harness/substrate/providers/git/index";
import { Effect } from "effect";
import { boundedPreview } from "./command-output.js";
import type { VerifyReceipt } from "./schema.js";

export function observeGitStatusEffect() {
  return GitProvider.pipe(
    Effect.flatMap((git) => git.statusShortBranch()),
    Effect.map(spawnResultFromCommandResult)
  );
}

/**
 * Converts git status output into the receipt post-state contract.
 *
 * @param result - Completed git status command.
 * @returns Clean, dirty, or unavailable post-state with bounded stream metadata.
 */
export function postStateObservation(result: SpawnResult): VerifyReceipt["postState"] {
  const stdout = boundedPreview(result.stdout);
  const stderr = boundedPreview(result.stderr);
  const command = {
    argv: ["git", "status", "--short", "--branch"],
    cwd: repoRoot,
    exitCode: result.exitCode,
    stdoutLength: result.stdout.length,
    stderrLength: result.stderr.length,
    stdoutPreview: stdout.text,
    stderrPreview: stderr.text,
    stdoutTruncated: stdout.truncated,
    stderrTruncated: stderr.truncated,
  };
  if (result.exitCode !== 0) return { kind: "unavailable", gitStatus: command };
  return {
    kind: result.stdout.trim() ? "observed-dirty" : "observed-clean",
    gitStatus: command,
  };
}
