import { Effect } from "effect";
import { Value } from "typebox/value";
import { type VerifyBaseResolution, VerifyBaseResolutionSchema } from "../dto/verify.schema.js";

export interface VerifyBaseGitPort<R = never> {
  readonly remoteDefaultBranch: (options?: {
    readonly cwd?: string;
  }) => Effect.Effect<string | null, never, R>;
  readonly mergeBase: (
    ref: string,
    options?: { readonly cwd?: string }
  ) => Effect.Effect<string | null, never, R>;
}

export interface VerifyBaseGraphitePort<R = never> {
  readonly parent: (options?: { readonly cwd?: string }) => Effect.Effect<string | null, never, R>;
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
export function resolveVerifyBaseEffect<R>(
  context: {
    readonly git: VerifyBaseGitPort<R>;
    readonly graphite: VerifyBaseGraphitePort<R>;
    readonly repoRoot: string;
  },
  base?: string
): Effect.Effect<VerifyBaseResolution, never, R> {
  if (base)
    return Effect.succeed(
      Value.Parse(VerifyBaseResolutionSchema, { kind: "resolved", base, source: "flag" })
    );
  return Effect.gen(function* () {
    const graphiteParent = yield* context.graphite.parent({ cwd: context.repoRoot });
    if (graphiteParent) {
      return Value.Parse(VerifyBaseResolutionSchema, {
        kind: "resolved",
        base: graphiteParent,
        source: "graphite-parent",
      });
    }

    const defaultBranch = yield* context.git.remoteDefaultBranch({ cwd: context.repoRoot });
    const resolved = defaultBranch
      ? yield* context.git.mergeBase(defaultBranch, { cwd: context.repoRoot })
      : null;
    if (resolved) {
      return Value.Parse(VerifyBaseResolutionSchema, {
        kind: "resolved",
        base: resolved,
        source: "merge-base",
      });
    }
    return Value.Parse(VerifyBaseResolutionSchema, {
      kind: "refused",
      message:
        "could not resolve verify base from the remote default branch; pass --base explicitly.",
    });
  });
}
