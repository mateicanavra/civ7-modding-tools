import type { Effect } from "effect";
import type { BaselineRuleContractInput, RuleIntroductionBaselineManifest } from "./schema.js";

export interface BaselineGitPort<R = any> {
  readonly lsTreeNameOnly: (
    ref: string,
    repoPath: string,
    options?: { readonly cwd?: string }
  ) => Effect.Effect<readonly string[] | null, never, R>;
  readonly mergeBase: (
    ref: string,
    options?: { readonly cwd?: string }
  ) => Effect.Effect<string | null, never, R>;
  readonly show: (
    ref: string,
    repoPath: string,
    options?: { readonly cwd?: string }
  ) => Effect.Effect<string | null, never, R>;
}

export interface BaselineAuthorityContext {
  git: BaselineGitPort;
  repoRoot: string;
  baselinesDir?: string;
  registry?: readonly BaselineRuleContractInput[];
  ruleIntroductionManifests?: readonly RuleIntroductionBaselineManifest[];
}

export function externalSourceFilePath(sourcePath: string): string {
  return sourcePath.split("#")[0] ?? sourcePath;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
