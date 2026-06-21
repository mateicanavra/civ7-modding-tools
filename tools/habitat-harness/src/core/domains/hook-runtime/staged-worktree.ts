import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { repoRoot, toRepoRelative } from "@internal/habitat-harness/substrate/lib/paths";
import {
  type SpawnResult,
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "@internal/habitat-harness/substrate/providers/command/index";
import {
  GitProvider,
  type GitProviderRequirements,
} from "@internal/habitat-harness/substrate/providers/git/index";
import { Effect } from "effect";
import { stagedSourceCheckPaths } from "../../domains/structural-check/index.js";
import type { HookRuntime } from "./runtime.js";

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
  runtime: HookRuntime = {}
): Effect.Effect<string[], never, GitProvider | GitProviderRequirements> {
  const pathExists = runtime.pathExists ?? existsSync;
  return stagedPathsEffect().pipe(
    Effect.map((paths) => paths.filter((candidate) => pathExists(path.join(repoRoot, candidate))))
  );
}

export function biomeHookPaths(staged: readonly string[]): string[] {
  return staged.filter((candidate) => biomeCandidateExtensions.has(path.extname(candidate)));
}

export function hookSourceCheckPaths(stagedPaths: readonly string[]): string[] {
  return stagedSourceCheckPaths(stagedPaths);
}

export function unstagedAmongEffect(
  paths: string[]
): Effect.Effect<string[], never, GitProvider | GitProviderRequirements> {
  if (paths.length === 0) return Effect.succeed([]);
  return Effect.gen(function* () {
    const git = yield* GitProvider;
    const result = yield* git
      .diffNameOnly({ paths, cwd: repoRoot })
      .pipe(Effect.catchAll(() => Effect.succeed(undefined)));
    if (!result || result.exit.code !== 0 || !result.stdout.text) return [];
    return result.stdout.text.split("\0").filter(Boolean).map(toRepoRelative);
  });
}

export function gitAddEffect(
  paths: string[]
): Effect.Effect<SpawnResult, never, GitProvider | GitProviderRequirements> {
  if (paths.length === 0) return Effect.succeed({ exitCode: 0, stdout: "", stderr: "" });
  return Effect.gen(function* () {
    const git = yield* GitProvider;
    return yield* git.add(paths, { cwd: repoRoot }).pipe(
      Effect.match({
        onFailure: spawnResultFromCommandProviderError,
        onSuccess: spawnResultFromCommandResult,
      })
    );
  });
}

export function fileHash(repoRelativePath: string): string | null {
  const absolute = path.join(repoRoot, repoRelativePath);
  if (!existsSync(absolute)) return null;
  return createHash("sha256").update(readFileSync(absolute)).digest("hex");
}

function stagedPathsEffect(): Effect.Effect<
  string[],
  never,
  GitProvider | GitProviderRequirements
> {
  return Effect.gen(function* () {
    const git = yield* GitProvider;
    const result = yield* git
      .diffNameStatus({ cached: true, cwd: repoRoot })
      .pipe(Effect.catchAll(() => Effect.succeed(undefined)));
    if (!result || result.exit.code !== 0 || !result.stdout.text) return [];
    return parseNameStatus(result.stdout.text);
  });
}

function parseNameStatus(stdout: string): string[] {
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
  return [...new Set(out.map(toRepoRelative))];
}
