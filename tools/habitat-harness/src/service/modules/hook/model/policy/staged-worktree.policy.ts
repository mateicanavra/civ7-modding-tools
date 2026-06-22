import path from "node:path";
import type {
  GitProviderRequirements,
  GitProviderService,
} from "@internal/habitat-harness/providers/git/index";
import {
  type SpawnResult,
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "@internal/habitat-harness/resources/command/index";
import { pathExistsSync } from "@internal/habitat-harness/resources/platform/index";
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

export function existingStagedPathsEffect(
  git: GitProviderService,
  repoRoot: string,
  pathExists: (targetPath: string) => boolean = pathExistsSync
): Effect.Effect<string[], never, GitProviderRequirements> {
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
  git: GitProviderService,
  repoRoot: string,
  paths: string[]
): Effect.Effect<string[], never, GitProviderRequirements> {
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
  git: GitProviderService,
  repoRoot: string,
  paths: string[]
): Effect.Effect<SpawnResult, never, GitProviderRequirements> {
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

function stagedPathsEffect(
  git: GitProviderService,
  repoRoot: string
): Effect.Effect<string[], never, GitProviderRequirements> {
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
