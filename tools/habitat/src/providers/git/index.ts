import {
  type CommandProviderError,
  CommandRunner,
  type CommandRunnerService,
  spawnResultFromCommandResult,
} from "@habitat/cli/resources/command/index";
import type { HabitatCommandResult } from "@habitat/cli/resources/command/types";
import { Context, Effect, Layer, Match } from "effect";

export {
  GitStateProvider,
  type GitStateProviderService,
  type HabitatCommandGitState,
  type HabitatGitState,
  makeFakeGitStateProviderLayer,
  makeGitStateProviderLayer,
  readGitState,
  unknownGitState,
} from "./state.js";

export interface GitCommandOptions {
  cwd?: string;
}

export interface GitVisiblePath {
  readonly mode: string | null;
  readonly repoPath: string;
}

type GitCommand = (
  argv: readonly string[],
  options?: GitCommandOptions
) => ReturnType<CommandRunnerService["run"]>;

export interface GitProviderService extends ReturnType<typeof providerFromCommand> {}

export class GitProvider extends Context.Tag("@habitat/cli/GitProvider")<
  GitProvider,
  GitProviderService
>() {}

export function makeGitProviderLayer(repoRoot: string) {
  return Layer.effect(
    GitProvider,
    Effect.map(CommandRunner, (runner) => makeLiveGitProvider(repoRoot, runner))
  );
}

export function makeFakeGitProviderLayer(
  handler: (argv: readonly string[], options: Required<GitCommandOptions>) => HabitatCommandResult,
  options: { readonly repoRoot?: string } = {}
) {
  return Layer.succeed(GitProvider, makeGitProviderFromCommandHandler(handler, options));
}

export function makeGitProviderFromCommandHandler(
  handler: (argv: readonly string[], options: Required<GitCommandOptions>) => HabitatCommandResult,
  { repoRoot = "." }: { readonly repoRoot?: string } = {}
): GitProviderService {
  return providerFromCommand((argv, options = {}) =>
    Effect.succeed(handler(argv, { cwd: options.cwd ?? repoRoot }))
  );
}

function makeLiveGitProvider(repoRoot: string, runner: CommandRunnerService): GitProviderService {
  return providerFromCommand((argv, options = {}) =>
    runner.run({
      commandId: `git-${argv.join("-")}`,
      kind: "git-state",
      executable: "git",
      argv,
      cwd: options.cwd ?? repoRoot,
      captureGitState: false,
    })
  );
}

function providerFromCommand(command: GitCommand) {
  return {
    command,
    currentBranch: (options?: GitCommandOptions) =>
      gitTextOrNull(command(["branch", "--show-current"], options)),
    head: (options?: GitCommandOptions) => gitTextOrNull(command(["rev-parse", "HEAD"], options)),
    listVisiblePaths: (options?: GitCommandOptions) =>
      command(
        [
          "ls-files",
          "--cached",
          "--others",
          "--exclude-standard",
          "--stage",
          "--abbrev=1",
          "-t",
          "-z",
        ],
        options
      ).pipe(
        Effect.map(visiblePathsFromCommandResult),
        Effect.catchAll(() => Effect.succeed(null))
      ),
    statusShort: (options?: GitCommandOptions) => command(["status", "--short"], options),
    statusShortBranch: (options?: GitCommandOptions) =>
      command(["status", "--short", "--branch"], options),
    remoteDefaultBranch: (options?: GitCommandOptions) =>
      gitTextOrNull(
        command(["symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"], options)
      ),
    mergeBase: (ref: string, options?: GitCommandOptions) =>
      gitTextOrNull(command(["merge-base", "HEAD", ref], options)),
    show: (ref: string, repoPath: string, options?: GitCommandOptions) =>
      gitTextOrNull(command(["show", `${ref}:${repoPath}`], options)),
    lsTreeNameOnly: (ref: string, repoPath: string, options?: GitCommandOptions) =>
      gitTextOrNull(command(["ls-tree", "-r", "--name-only", ref, repoPath], options)).pipe(
        Effect.map(gitTreeNames)
      ),
    add: (paths: readonly string[], options?: GitCommandOptions) =>
      command(["add", "--", ...paths], options),
    diffNameOnly: (
      input: { cached?: boolean; paths?: readonly string[] } & GitCommandOptions = {}
    ) =>
      command(
        ["diff", ...gitCachedArg(input.cached), "--name-only", "-z", ...gitPathsArg(input.paths)],
        input
      ),
    diffNameStatus: (input: { cached?: boolean } & GitCommandOptions = {}) =>
      command(["diff", ...gitCachedArg(input.cached), "--name-status", "-z"], input),
  };
}

function visiblePathsFromCommandResult(
  result: HabitatCommandResult
): readonly GitVisiblePath[] | null {
  return Match.value(result.exit.code === 0 && !result.stdout.truncated).pipe(
    Match.when(true, () => parseVisiblePaths(result.stdout.text)),
    Match.when(false, () => null),
    Match.exhaustive
  );
}

function parseVisiblePaths(stdout: string): readonly GitVisiblePath[] | null {
  const parsed = stdout
    .split("\0")
    .filter((entry) => entry.length > 0)
    .map(parseVisiblePath);
  return Match.value(parsed.some((entry) => !entry.ok)).pipe(
    Match.when(true, () => null),
    Match.when(false, () =>
      parsed
        .filter((entry): entry is { readonly ok: true; readonly value: GitVisiblePath } => entry.ok)
        .map((entry) => entry.value)
    ),
    Match.exhaustive
  );
}

function parseVisiblePath(
  candidate: string
): { readonly ok: true; readonly value: GitVisiblePath } | { readonly ok: false } {
  return Match.value(candidate.startsWith("? ") && candidate.length > 2).pipe(
    Match.when(true, () => ({
      ok: true,
      value: { mode: null, repoPath: candidate.slice(2) },
    })),
    Match.when(false, () => parseTrackedVisiblePath(candidate)),
    Match.exhaustive
  );
}

function parseTrackedVisiblePath(
  candidate: string
): { readonly ok: true; readonly value: GitVisiblePath } | { readonly ok: false } {
  const separator = candidate.indexOf("\t");
  const metadata = candidate.slice(0, separator);
  const match = /^[A-Z] ([0-7]{6}) [0-9a-f]+ [0-3]$/u.exec(metadata);
  const repoPath = candidate.slice(separator + 1);
  return Match.value(separator >= 0 && match?.[1] !== undefined && repoPath.length > 0).pipe(
    Match.when(true, () => ({
      ok: true as const,
      value: { mode: match?.[1] ?? null, repoPath },
    })),
    Match.when(false, () => ({ ok: false as const })),
    Match.exhaustive
  );
}

function gitTextOrNull(effect: ReturnType<GitCommand>) {
  return effect.pipe(
    Effect.map(gitCommandTextOrNull),
    Effect.catchAll(() => Effect.succeed(null))
  );
}

function gitCommandTextOrNull(result: HabitatCommandResult): string | null {
  return Match.value(result.exit.code).pipe(
    Match.when(0, () => result.stdout.text.trim() || null),
    Match.orElse(() => null)
  );
}

function gitTreeNames(stdout: string | null): readonly string[] | null {
  return Match.value(stdout).pipe(
    Match.when(Match.null, () => null),
    Match.orElse((text) =>
      text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    )
  );
}

function gitCachedArg(cached: boolean | undefined): readonly string[] {
  return Match.value(cached).pipe(
    Match.when(true, () => ["--cached"]),
    Match.orElse(() => [])
  );
}

function gitPathsArg(paths: readonly string[] | undefined): readonly string[] {
  return Match.value(paths).pipe(
    Match.when(Match.undefined, () => []),
    Match.orElse((selectedPaths) => ["--", ...selectedPaths])
  );
}

export { spawnResultFromCommandResult };
