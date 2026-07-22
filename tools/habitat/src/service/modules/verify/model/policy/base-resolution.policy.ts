import type { GitProviderService } from "@habitat/cli/providers/git/index";
import type { GraphiteProviderService } from "@habitat/cli/providers/graphite/index";
import { Effect, Match } from "effect";
import { Value } from "typebox/value";
import { type VerifyBaseResolution, VerifyBaseResolutionSchema } from "../dto/verify.schema.js";

export type VerifyBaseGitPort = Pick<GitProviderService, "mergeBase" | "remoteDefaultBranch">;

export type VerifyBaseGraphitePort = Pick<GraphiteProviderService, "parent">;

interface VerifyBaseContext {
  readonly git: VerifyBaseGitPort;
  readonly graphite: VerifyBaseGraphitePort;
  readonly repoRoot: string;
}

/**
 * Resolves the affected base for verify.
 *
 * The command must either respect an explicit `--base` value, use the Graphite
 * parent for stacked local work, or find the merge-base with the repository's
 * remote default branch. When none are possible, verify refuses before running
 * affected targets.
 *
 * @param base - Optional base ref supplied by the caller.
 * @returns A TypeBox-validated resolution or refusal.
 */
export const resolveVerifyBaseEffect = Effect.fn("habitat.verify.resolveBase")(function* (
  context: VerifyBaseContext,
  base?: string
) {
  return yield* Match.value(base).pipe(
    Match.when(Match.string, (explicitBase) => Effect.succeed(resolvedBase(explicitBase, "flag"))),
    Match.orElse(() => resolveImplicitBaseEffect(context))
  );
});

const resolveImplicitBaseEffect = Effect.fn("habitat.verify.resolveImplicitBase")(function* (
  context: VerifyBaseContext
) {
  const graphiteParent = yield* context.graphite.parent({ cwd: context.repoRoot });
  return yield* resolveAfterGraphiteParent(context, graphiteParent);
});

function resolveAfterGraphiteParent(context: VerifyBaseContext, graphiteParent: string | null) {
  return Match.value(graphiteParent).pipe(
    Match.when(Match.string, (parent) => Effect.succeed(resolvedBase(parent, "graphite-parent"))),
    Match.orElse(() => resolveRemoteDefaultBaseEffect(context))
  );
}

const resolveRemoteDefaultBaseEffect = Effect.fn("habitat.verify.resolveRemoteDefaultBase")(
  function* (context: VerifyBaseContext) {
    const defaultBranch = yield* context.git.remoteDefaultBranch({ cwd: context.repoRoot });
    return yield* resolveMergeBaseEffect(context, defaultBranch);
  }
);

function resolveMergeBaseEffect(context: VerifyBaseContext, defaultBranch: string | null) {
  return Match.value(defaultBranch).pipe(
    Match.when(Match.string, (branch) => resolveSelectedMergeBaseEffect(context, branch)),
    Match.orElse(() => Effect.succeed(refusedBase()))
  );
}

const resolveSelectedMergeBaseEffect = Effect.fn("habitat.verify.resolveSelectedMergeBase")(
  function* (context: VerifyBaseContext, branch: string) {
    const mergeBase = yield* context.git.mergeBase(branch, { cwd: context.repoRoot });
    return resolveMergeBaseResult(mergeBase);
  }
);

function resolveMergeBaseResult(mergeBase: string | null): VerifyBaseResolution {
  return Match.value(mergeBase).pipe(
    Match.when(Match.string, (base) => resolvedBase(base, "merge-base")),
    Match.orElse(refusedBase)
  );
}

function resolvedBase(
  base: string,
  source: "flag" | "graphite-parent" | "merge-base"
): VerifyBaseResolution {
  return Value.Parse(VerifyBaseResolutionSchema, { kind: "resolved", base, source });
}

function refusedBase(): VerifyBaseResolution {
  return Value.Parse(VerifyBaseResolutionSchema, {
    kind: "refused",
    message:
      "could not resolve verify base from the remote default branch; pass --base explicitly.",
  });
}
