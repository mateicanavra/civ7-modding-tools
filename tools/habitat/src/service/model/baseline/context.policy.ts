import type { Effect } from "effect";
import type {
  BaselineRuleContractInput,
  RuleIntroductionBaselineManifest,
} from "./dto/baseline.schema.js";

export interface BaselineDirectoryEntry {
  readonly name: string;
  readonly kind: "directory" | "file" | "other";
}

export interface BaselineFileSystemPort<R = never> {
  readonly isDirectory: (targetPath: string) => Effect.Effect<boolean, unknown, R>;
  readonly isFile: (targetPath: string) => Effect.Effect<boolean, unknown, R>;
  readonly makeDirectory: (targetPath: string) => Effect.Effect<void, unknown, R>;
  readonly readDirectory: (
    targetPath: string
  ) => Effect.Effect<readonly BaselineDirectoryEntry[], unknown, R>;
  readonly readText: (targetPath: string) => Effect.Effect<string, unknown, R>;
  readonly writeText: (targetPath: string, contents: string) => Effect.Effect<void, unknown, R>;
}

export interface BaselineGitPort<R = never> {
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

export interface BaselineAuthorityContext<R = never> {
  fileSystem: BaselineFileSystemPort<R>;
  git: BaselineGitPort<R>;
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
