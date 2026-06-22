import {
  type GitProviderService,
  spawnResultFromCommandResult,
} from "@internal/habitat-harness/providers/git/index";
import type { SpawnResult } from "@internal/habitat-harness/resources/command/index";
import type { VerifyReceipt } from "@internal/habitat-harness/service/model/verify/index";
import { Effect } from "effect";
import { boundedPreview } from "./command-output.policy.js";

export function observeGitStatusEffect(context: {
  readonly git: GitProviderService;
  readonly repoRoot: string;
}) {
  return context.git
    .statusShortBranch({ cwd: context.repoRoot })
    .pipe(Effect.map(spawnResultFromCommandResult));
}

/**
 * Converts git status output into the receipt post-state contract.
 *
 * @param result - Completed git status command.
 * @returns Clean, dirty, or unavailable post-state with bounded stream metadata.
 */
export function postStateObservation(
  result: SpawnResult,
  context: { readonly repoRoot: string }
): VerifyReceipt["postState"] {
  const stdout = boundedPreview(result.stdout);
  const stderr = boundedPreview(result.stderr);
  const command = {
    argv: ["git", "status", "--short", "--branch"],
    cwd: context.repoRoot,
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
