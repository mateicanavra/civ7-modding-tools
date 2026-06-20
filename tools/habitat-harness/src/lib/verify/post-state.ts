import { Effect } from "effect";
import type { SpawnResult } from "../../providers/command/index.js";
import { GitProvider, spawnResultFromCommandResult } from "../../providers/git/index.js";
import { runHabitatEffect } from "../../runtime/index.js";
import { repoRoot } from "../paths.js";
import { boundedPreview } from "./command-output.js";
import type { VerifyReceipt } from "./schema.js";

/**
 * Reads the current repository status for verify handoff.
 *
 * @returns Spawn result for `git status --short --branch`.
 */
export function observeGitStatus(): Promise<SpawnResult> {
  return runHabitatEffect(observeGitStatusEffect());
}

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
