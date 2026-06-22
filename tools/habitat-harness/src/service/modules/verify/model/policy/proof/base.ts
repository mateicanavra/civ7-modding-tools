import { GitProvider } from "@internal/habitat-harness/providers/git/index";
import { GraphiteProvider } from "@internal/habitat-harness/providers/graphite/index";
import { repoRoot } from "@internal/habitat-harness/resources/paths";
import { Effect } from "effect";
import { Value } from "typebox/value";
import { type VerifyBaseResolution, VerifyBaseResolutionSchema } from "./schema.js";

/** Options accepted by the verify orchestration layer after Oclif parses CLI flags. */
export interface VerifyOptions {
  /** Explicit Git base ref for affected verification. */
  base?: string;
  /** Raw command args recorded into the receipt for handoff context. */
  commandArgs?: readonly string[];
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
export function resolveVerifyBaseEffect(base?: string) {
  if (base)
    return Effect.succeed(
      Value.Parse(VerifyBaseResolutionSchema, { kind: "resolved", base, source: "flag" })
    );
  return Effect.gen(function* () {
    const graphiteParent = yield* resolveGraphiteParentEffect();
    if (graphiteParent) {
      return Value.Parse(VerifyBaseResolutionSchema, {
        kind: "resolved",
        base: graphiteParent,
        source: "graphite-parent",
      });
    }

    const git = yield* GitProvider;
    const defaultBranch = yield* git.remoteDefaultBranch();
    const resolved = defaultBranch ? yield* git.mergeBase(defaultBranch) : null;
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

function resolveGraphiteParentEffect() {
  return GraphiteProvider.pipe(Effect.flatMap((graphite) => graphite.parent({ cwd: repoRoot })));
}
