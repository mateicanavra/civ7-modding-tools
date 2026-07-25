import type { HabitatCommandResult } from "@habitat/cli/resources/command/index";
import { renderHabitatError } from "@habitat/cli/resources/errors/index";
import {
  parseStagedPathsFromNameStatus,
  type StagedMutationPath,
} from "@habitat/cli/service/model/host/index";
import { Effect, Either, Match } from "effect";
import type { StructuralGitPort } from "./context.policy.js";

export type StagedPathActionReadResult =
  | readonly StagedMutationPath[]
  | { readonly ok: false; readonly message: string };

/** Reads lossless A/M/D/R/C actions from the cached Git index. */
export const currentStagedPathActionsEffect = Effect.fn("check.readStagedPathActions")(function* <
  R,
>(context: {
  readonly repoRoot: string;
  readonly git: StructuralGitPort<R>;
}): Effect.fn.Return<StagedPathActionReadResult, never, R> {
  const result = yield* context.git
    .diffNameStatus({ cached: true, cwd: context.repoRoot })
    .pipe(Effect.either);
  return Either.match(result, {
    onLeft: (error) => ({
      ok: false as const,
      message: renderHabitatError(error),
    }),
    onRight: stagedPathActionsFromResult,
  });
});

function stagedPathActionsFromResult(result: HabitatCommandResult): StagedPathActionReadResult {
  return Match.value({
    exitCode: result.exit.code,
    truncated: result.stdout.truncated,
  }).pipe(
    Match.when({ truncated: true }, () => ({
      ok: false as const,
      message: "Staged path action output was truncated; refusing a partial Git index view.",
    })),
    Match.when({ exitCode: 0 }, () => stagedPathActionsFromOutput(result.stdout.text)),
    Match.orElse(() => ({
      ok: false as const,
      message:
        result.stderr.text.trim() ||
        `Unable to read staged path actions with git diff --cached --name-status -z (exit ${result.exit.code}).`,
    }))
  );
}

function stagedPathActionsFromOutput(output: string): StagedPathActionReadResult {
  return Match.value(parseStagedPathsFromNameStatus(output)).pipe(
    Match.when({ ok: true }, ({ paths }) => paths),
    Match.when({ ok: false }, ({ message }) => ({ ok: false as const, message })),
    Match.exhaustive
  );
}

/** Narrows a fail-closed staged-action acquisition result for diagnostic projection. */
export function isStagedPathActionReadFailure(
  result: StagedPathActionReadResult
): result is { readonly ok: false; readonly message: string } {
  return "ok" in result && !result.ok;
}
