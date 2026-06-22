import path from "node:path";
import {
  CommandProviderError,
  HabitatCommandResult,
  type SpawnResult,
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "@internal/habitat-harness/resources/command/index";
import { stagedSourceCheckPaths } from "@internal/habitat-harness/service/model/check/index";
import { Effect } from "effect";

const biomeCandidateExtensions = new Set([
  ".cjs",
  ".css",
  ".cts",
  ".graphql",
  ".html",
  ".js",
  ".json",
  ".jsonc",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);

interface HookStagedGitPort<R = never> {
  readonly add: (
    paths: readonly string[],
    options?: { readonly cwd?: string }
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, R>;
  readonly diffNameOnly: (input?: {
    readonly cached?: boolean;
    readonly paths?: readonly string[];
    readonly cwd?: string;
  }) => Effect.Effect<HabitatCommandResult, CommandProviderError, R>;
  readonly diffNameStatus: (input?: {
    readonly cached?: boolean;
    readonly cwd?: string;
  }) => Effect.Effect<HabitatCommandResult, CommandProviderError, R>;
}

export function existingStagedPathsEffect(
  git: HookStagedGitPort,
  repoRoot: string,
  pathExists: (targetPath: string) => boolean
): Effect.Effect<string[]>;
export function existingStagedPathsEffect<R>(
  git: HookStagedGitPort<R>,
  repoRoot: string,
  pathExists: (targetPath: string) => boolean
): Effect.Effect<string[], never, R>;
export function existingStagedPathsEffect<R>(
  git: HookStagedGitPort<R>,
  repoRoot: string,
  pathExists: (targetPath: string) => boolean
): Effect.Effect<string[], never, R> {
  return stagedPathsEffect(git, repoRoot).pipe(
    Effect.map((paths) => paths.filter((candidate) => pathExists(path.join(repoRoot, candidate))))
  );
}

export function biomeHookPaths(staged: readonly string[]): string[] {
  return staged.filter((candidate) => biomeCandidateExtensions.has(path.extname(candidate)));
}

export function hookSourceCheckPaths(
  stagedPaths: readonly string[],
  repoRoot: string,
  approvedScanRoots: readonly string[]
): string[] {
  return stagedSourceCheckPaths(stagedPaths, approvedScanRoots, { repoRoot });
}

export function unstagedAmongEffect(
  git: HookStagedGitPort,
  repoRoot: string,
  paths: string[]
): Effect.Effect<string[]>;
export function unstagedAmongEffect<R>(
  git: HookStagedGitPort<R>,
  repoRoot: string,
  paths: string[]
): Effect.Effect<string[], never, R>;
export function unstagedAmongEffect<R>(
  git: HookStagedGitPort<R>,
  repoRoot: string,
  paths: string[]
): Effect.Effect<string[], never, R> {
  if (paths.length === 0) return Effect.succeed([]);
  return Effect.gen(function* () {
    const result = yield* git
      .diffNameOnly({ paths, cwd: repoRoot })
      .pipe(Effect.catchAll(() => Effect.succeed(undefined)));
    if (!result || result.exit.code !== 0 || !result.stdout.text) return [];
    return result.stdout.text
      .split("\0")
      .filter(Boolean)
      .map((candidate) => toRepoRelative(repoRoot, candidate));
  });
}

export function gitAddEffect(
  git: HookStagedGitPort,
  repoRoot: string,
  paths: string[]
): Effect.Effect<SpawnResult>;
export function gitAddEffect<R>(
  git: HookStagedGitPort<R>,
  repoRoot: string,
  paths: string[]
): Effect.Effect<SpawnResult, never, R>;
export function gitAddEffect<R>(
  git: HookStagedGitPort<R>,
  repoRoot: string,
  paths: string[]
): Effect.Effect<SpawnResult, never, R> {
  if (paths.length === 0) return Effect.succeed({ exitCode: 0, stdout: "", stderr: "" });
  return Effect.gen(function* () {
    return yield* git.add(paths, { cwd: repoRoot }).pipe(
      Effect.match({
        onFailure: spawnResultFromCommandProviderError,
        onSuccess: spawnResultFromCommandResult,
      })
    );
  });
}

function stagedPathsEffect(git: HookStagedGitPort, repoRoot: string): Effect.Effect<string[]>;
function stagedPathsEffect<R>(
  git: HookStagedGitPort<R>,
  repoRoot: string
): Effect.Effect<string[], never, R>;
function stagedPathsEffect<R>(
  git: HookStagedGitPort<R>,
  repoRoot: string
): Effect.Effect<string[], never, R> {
  return Effect.gen(function* () {
    const result = yield* git
      .diffNameStatus({ cached: true, cwd: repoRoot })
      .pipe(Effect.catchAll(() => Effect.succeed(undefined)));
    if (!result || result.exit.code !== 0 || !result.stdout.text) return [];
    return parseNameStatus(result.stdout.text, repoRoot);
  });
}

function parseNameStatus(stdout: string, repoRoot: string): string[] {
  const tokens = stdout.split("\0").filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < tokens.length; ) {
    const status = tokens[i++] ?? "";
    if (status.startsWith("R") || status.startsWith("C")) {
      const oldPath = tokens[i++];
      const newPath = tokens[i++];
      if (oldPath) out.push(oldPath);
      if (newPath) out.push(newPath);
      continue;
    }
    const file = tokens[i++];
    if (!file || status.startsWith("D")) continue;
    out.push(file);
  }
  return [...new Set(out.map((candidate) => toRepoRelative(repoRoot, candidate)))];
}

function toRepoRelative(repoRoot: string, candidate: string): string {
  return path.relative(repoRoot, path.resolve(repoRoot, candidate)).split(path.sep).join("/");
}
