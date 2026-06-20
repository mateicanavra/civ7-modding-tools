import { Value } from "typebox/value";
import { repoRoot } from "../paths.js";
import { run } from "../spawn.js";
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
 * The command must either respect an explicit `--base` value or find the merge-base
 * with the repository's remote default branch; when neither is possible, verify
 * refuses before running affected targets.
 *
 * @param base - Optional base ref supplied by the caller.
 * @returns A TypeBox-validated resolution or refusal.
 */
export function resolveVerifyBase(base?: string): VerifyBaseResolution {
  if (base)
    return Value.Parse(VerifyBaseResolutionSchema, { kind: "resolved", base, source: "flag" });
  const defaultBranch = remoteDefaultBranch();
  const resolved = defaultBranch ? mergeBaseForRef(defaultBranch) : null;
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
}

function remoteDefaultBranch(): string | null {
  const result = run(["git", "symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"], {
    cwd: repoRoot,
  });
  if (result.exitCode !== 0) return null;
  const ref = result.stdout.trim();
  return ref || null;
}

function mergeBaseForRef(ref: string): string | null {
  const result = run(["git", "merge-base", "HEAD", ref], { cwd: repoRoot });
  if (result.exitCode !== 0) return null;
  return result.stdout.trim() || null;
}
