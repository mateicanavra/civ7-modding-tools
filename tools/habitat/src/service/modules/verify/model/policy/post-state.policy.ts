import type { GitProviderService } from "@habitat/cli/providers/git/index";
import {
  type SpawnResult,
  spawnResultFromCommandResult,
} from "@habitat/cli/resources/command/index";
import { Effect, Match } from "effect";
import type { VerifyReceipt } from "../dto/verify.schema.js";
import { boundedPreview } from "./command-output.policy.js";

export type VerifyGitStatusPort = Pick<GitProviderService, "statusShortBranch">;

export function observeGitStatusEffect(context: {
  readonly git: VerifyGitStatusPort;
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
  const observedKind = Match.value(result.stdout.trim().length > 0).pipe(
    Match.when(true, () => "observed-dirty" as const),
    Match.orElse(() => "observed-clean" as const)
  );
  return Match.value(result.exitCode).pipe(
    Match.when(0, () => ({ kind: observedKind, gitStatus: command })),
    Match.orElse(() => ({ kind: "unavailable" as const, gitStatus: command }))
  );
}
