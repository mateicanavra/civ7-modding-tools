import path from "node:path";
import type { CheckOptions, HabitatDiagnostic } from "@habitat/cli/service/model/check/index";
import { runFileLayerProtectedMutationRule } from "@habitat/cli/service/model/host/index";
import type { RuleFileLayerFacts } from "@habitat/cli/service/model/rules/index";
import { Clock, Effect } from "effect";
import type {
  RuleExecutionRecord,
  StructuralExecutionContext,
  StructuralGitPort,
} from "./context.policy.js";
import {
  currentStagedPathActionsEffect,
  isStagedPathActionReadFailure,
} from "./staged-path-actions.policy.js";

export function executeFileLayerRulesEffect<R>(
  fileLayerRules: readonly RuleFileLayerFacts[],
  results: Map<string, RuleExecutionRecord>,
  options: Pick<CheckOptions, "staged">,
  context: Pick<StructuralExecutionContext<R>, "git" | "repoRoot">
): Effect.Effect<void, never, R> {
  return Effect.gen(function* () {
    const stagedPathsResult = options.staged
      ? yield* currentStagedPathActionsEffect<R>(context)
      : undefined;
    for (const rule of fileLayerRules) {
      const started = yield* Clock.currentTimeMillis;
      if (stagedPathsResult && isStagedPathActionReadFailure(stagedPathsResult)) {
        const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
        results.set(rule.id, {
          result: {
            exitCode: 1,
            diagnostics: [stagedPathReadFailureDiagnostic(rule, stagedPathsResult.message)],
          },
          durationMs,
          disposition: { kind: "executed", durationMs },
        });
        continue;
      }
      const stagedPaths = stagedPathsResult ? stagedPathsResult : undefined;
      const result = runFileLayerProtectedMutationRule(rule, {
        staged: options.staged,
        ...(stagedPaths ? { stagedPaths } : {}),
      });
      const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
      results.set(rule.id, { result, durationMs, disposition: { kind: "executed", durationMs } });
    }
  });
}

export function currentStagedPathsEffect<R>(context: {
  readonly repoRoot: string;
  readonly git: StructuralGitPort<R>;
}): Effect.Effect<string[], never, R> {
  return Effect.gen(function* () {
    const result = yield* context.git
      .diffNameOnly({ cached: true, cwd: context.repoRoot })
      .pipe(Effect.either);
    if (result._tag === "Left" || result.right.exit.code !== 0 || !result.right.stdout.text) {
      return [];
    }
    return result.right.stdout.text
      .split("\0")
      .filter(Boolean)
      .map((candidate) => toRepoRelative(context, candidate));
  });
}

function stagedPathReadFailureDiagnostic(
  rule: RuleFileLayerFacts,
  detail: string
): HabitatDiagnostic {
  return {
    ruleId: rule.id,
    path: ".",
    message: `Unable to read staged path actions for protected-zone checks. ${detail}`,
    severity: "error",
    baselined: false,
  };
}

function toRepoRelative(context: { readonly repoRoot: string }, candidate: string): string {
  return path
    .relative(context.repoRoot, path.resolve(context.repoRoot, candidate))
    .split(path.sep)
    .join("/");
}
