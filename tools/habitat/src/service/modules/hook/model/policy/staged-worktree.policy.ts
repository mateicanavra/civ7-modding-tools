import path from "node:path";
import {
  type HabitatCommandResult,
  type SpawnResult,
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "@habitat/cli/resources/command/index";
import { stagedSourceCheckPaths } from "@habitat/cli/service/model/source-check/index";
import { Effect, Match } from "effect";
import type { HookProcedureContext } from "./procedure-context.policy.js";

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

type HookStagedGitPort = Pick<
  HookProcedureContext["git"],
  "add" | "diffNameOnly" | "diffNameStatus"
>;

export function existingStagedPathsEffect(
  git: HookStagedGitPort,
  repoRoot: string,
  pathExists: (targetPath: string) => boolean
) {
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

export const unstagedAmongEffect = Effect.fn("habitat.hook.unstagedAmong")(function* (
  git: HookStagedGitPort,
  repoRoot: string,
  paths: string[]
) {
  return yield* Effect.if(paths.length === 0, {
    onTrue: () => Effect.succeed([]),
    onFalse: () =>
      git.diffNameOnly({ paths, cwd: repoRoot }).pipe(
        Effect.match({
          onFailure: () => [],
          onSuccess: (result) => pathsFromNameOnlyResult(result, repoRoot),
        })
      ),
  });
});

export const gitAddEffect = Effect.fn("habitat.hook.gitAdd")(function* (
  git: HookStagedGitPort,
  repoRoot: string,
  paths: string[]
) {
  return yield* Effect.if(paths.length === 0, {
    onTrue: () => Effect.succeed({ exitCode: 0, stdout: "", stderr: "" } satisfies SpawnResult),
    onFalse: () =>
      git.add(paths, { cwd: repoRoot }).pipe(
        Effect.match({
          onFailure: spawnResultFromCommandProviderError,
          onSuccess: spawnResultFromCommandResult,
        })
      ),
  });
});

const stagedPathsEffect = Effect.fn("habitat.hook.stagedPaths")(function* (
  git: HookStagedGitPort,
  repoRoot: string
) {
  return yield* git.diffNameStatus({ cached: true, cwd: repoRoot }).pipe(
    Effect.match({
      onFailure: () => [],
      onSuccess: (result) => pathsFromNameStatusResult(result, repoRoot),
    })
  );
});

function pathsFromNameOnlyResult(result: HabitatCommandResult, repoRoot: string): string[] {
  return Match.value(result.exit.code === 0 && result.stdout.text.length > 0).pipe(
    Match.when(true, () =>
      result.stdout.text
        .split("\0")
        .filter(Boolean)
        .map((candidate) => toRepoRelative(repoRoot, candidate))
    ),
    Match.orElse(() => [])
  );
}

function pathsFromNameStatusResult(result: HabitatCommandResult, repoRoot: string): string[] {
  return Match.value(result.exit.code === 0 && result.stdout.text.length > 0).pipe(
    Match.when(true, () => parseNameStatus(result.stdout.text, repoRoot)),
    Match.orElse(() => [])
  );
}

function parseNameStatus(stdout: string, repoRoot: string): string[] {
  const tokens = stdout.split("\0").filter(Boolean);
  const parsed = tokens.reduce<NameStatusParserState>(reduceNameStatusToken, {
    kind: "status",
    paths: [],
  });
  return [...new Set(parsed.paths.map((candidate) => toRepoRelative(repoRoot, candidate)))];
}

type NameStatusParserState =
  | { readonly kind: "status"; readonly paths: readonly string[] }
  | { readonly kind: "rename-old"; readonly paths: readonly string[] }
  | { readonly kind: "rename-new"; readonly paths: readonly string[] }
  | { readonly kind: "file"; readonly deleted: boolean; readonly paths: readonly string[] };

function reduceNameStatusToken(state: NameStatusParserState, token: string): NameStatusParserState {
  return Match.value(state).pipe(
    Match.when({ kind: "rename-old" }, ({ paths }) => ({
      kind: "rename-new" as const,
      paths: [...paths, token],
    })),
    Match.when({ kind: "rename-new" }, ({ paths }) => ({
      kind: "status" as const,
      paths: [...paths, token],
    })),
    Match.when({ kind: "file" }, ({ deleted, paths }) => ({
      kind: "status" as const,
      paths: appendUnlessDeleted(deleted, paths, token),
    })),
    Match.orElse(({ paths }) => stateFromStatusToken(paths, token))
  );
}

function appendUnlessDeleted(
  deleted: boolean,
  paths: readonly string[],
  token: string
): readonly string[] {
  return Match.value(deleted).pipe(
    Match.when(true, () => paths),
    Match.orElse(() => [...paths, token])
  );
}

function stateFromStatusToken(paths: readonly string[], token: string): NameStatusParserState {
  return Match.value(token).pipe(
    Match.when(
      (status) => status.startsWith("R") || status.startsWith("C"),
      () => ({ kind: "rename-old" as const, paths })
    ),
    Match.orElse((status) => ({
      kind: "file" as const,
      deleted: status.startsWith("D"),
      paths,
    }))
  );
}

function toRepoRelative(repoRoot: string, candidate: string): string {
  return path.relative(repoRoot, path.resolve(repoRoot, candidate)).split(path.sep).join("/");
}
