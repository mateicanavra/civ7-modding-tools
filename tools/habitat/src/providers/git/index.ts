import {
  type CommandProviderError,
  CommandRunner,
  type CommandRunnerService,
  spawnResultFromCommandResult,
} from "@habitat/cli/resources/command/index";
import type { HabitatCommandResult } from "@habitat/cli/resources/command/types";
import { Context, Effect, Layer } from "effect";

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

type GitCommandEffect = Effect.Effect<HabitatCommandResult, CommandProviderError>;
type GitTextEffect = Effect.Effect<string | null>;

export interface GitCommandOptions {
  cwd?: string;
}

export interface GitProviderService {
  readonly command: (argv: readonly string[], options?: GitCommandOptions) => GitCommandEffect;
  readonly currentBranch: (options?: GitCommandOptions) => GitTextEffect;
  readonly head: (options?: GitCommandOptions) => GitTextEffect;
  readonly statusShort: (options?: GitCommandOptions) => GitCommandEffect;
  readonly statusShortBranch: (options?: GitCommandOptions) => GitCommandEffect;
  readonly remoteDefaultBranch: (options?: GitCommandOptions) => GitTextEffect;
  readonly mergeBase: (ref: string, options?: GitCommandOptions) => GitTextEffect;
  readonly show: (ref: string, repoPath: string, options?: GitCommandOptions) => GitTextEffect;
  readonly lsTreeNameOnly: (
    ref: string,
    repoPath: string,
    options?: GitCommandOptions
  ) => Effect.Effect<readonly string[] | null>;
  readonly add: (paths: readonly string[], options?: GitCommandOptions) => GitCommandEffect;
  readonly diffNameOnly: (
    input?: { cached?: boolean; paths?: readonly string[] } & GitCommandOptions
  ) => GitCommandEffect;
  readonly diffNameStatus: (input?: { cached?: boolean } & GitCommandOptions) => GitCommandEffect;
}

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
  const command: GitProviderService["command"] = (argv, options = {}) =>
    Effect.sync(() => handler(argv, { cwd: options.cwd ?? repoRoot }));
  return providerFromCommand(command);
}

function makeLiveGitProvider(repoRoot: string, runner: CommandRunnerService): GitProviderService {
  const command: GitProviderService["command"] = (argv, options = {}) =>
    runner.run({
      commandId: `git-${argv.join("-")}`,
      kind: "git-state",
      executable: "git",
      argv,
      cwd: options.cwd ?? repoRoot,
      captureGitState: false,
    });
  return providerFromCommand(command);
}

function providerFromCommand(command: GitProviderService["command"]): GitProviderService {
  const textOrNull = (effect: GitCommandEffect): GitTextEffect =>
    effect.pipe(
      Effect.map((result) => (result.exit.code === 0 ? result.stdout.text.trim() || null : null)),
      Effect.catchAll(() => Effect.succeed(null))
    );
  return {
    command,
    currentBranch: (options) => textOrNull(command(["branch", "--show-current"], options)),
    head: (options) => textOrNull(command(["rev-parse", "HEAD"], options)),
    statusShort: (options) => command(["status", "--short"], options),
    statusShortBranch: (options) => command(["status", "--short", "--branch"], options),
    remoteDefaultBranch: (options) =>
      textOrNull(
        command(["symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"], options)
      ),
    mergeBase: (ref, options) => textOrNull(command(["merge-base", "HEAD", ref], options)),
    show: (ref, repoPath, options) => textOrNull(command(["show", `${ref}:${repoPath}`], options)),
    lsTreeNameOnly: (ref, repoPath, options) =>
      textOrNull(command(["ls-tree", "-r", "--name-only", ref, repoPath], options)).pipe(
        Effect.map((stdout) =>
          stdout === null
            ? null
            : stdout
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
        )
      ),
    add: (paths, options) => command(["add", "--", ...paths], options),
    diffNameOnly: (input = {}) =>
      command(
        [
          "diff",
          ...(input.cached ? ["--cached"] : []),
          "--name-only",
          "-z",
          ...(input.paths ? ["--", ...input.paths] : []),
        ],
        input
      ),
    diffNameStatus: (input = {}) =>
      command(["diff", ...(input.cached ? ["--cached"] : []), "--name-status", "-z"], input),
  };
}

export { spawnResultFromCommandResult };
