import type { Effect } from "effect";
import type {
  BaselineRuleContractInput,
  RuleIntroductionBaselineManifest,
} from "./dto/baseline.schema.js";

export interface BaselineDirectoryEntry {
  readonly name: string;
  readonly kind: "directory" | "file" | "other";
}

export interface BaselineFileSystemPort {
  readonly isDirectory: (targetPath: string) => Effect.Effect<boolean, unknown, any>;
  readonly isFile: (targetPath: string) => Effect.Effect<boolean, unknown, any>;
  readonly makeDirectory: (targetPath: string) => Effect.Effect<void, unknown, any>;
  readonly readDirectory: (
    targetPath: string
  ) => Effect.Effect<readonly BaselineDirectoryEntry[], unknown, any>;
  readonly readText: (targetPath: string) => Effect.Effect<string, unknown, any>;
  readonly writeText: (targetPath: string, contents: string) => Effect.Effect<void, unknown, any>;
}

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
  fileSystem: BaselineFileSystemPort;
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
