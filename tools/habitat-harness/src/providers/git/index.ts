import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import { Context, Effect, Layer } from "effect";
import type { HabitatConfig } from "../../config/index.js";
import type { CommandProviderError } from "../../errors/index.js";
import { repoRoot } from "../../lib/paths.js";
import type { HabitatClock } from "../../resources/index.js";
import { CommandRunner, spawnResultFromCommandResult } from "../command/index.js";
import type { HabitatCommandResult } from "../command/types.js";

type GitProviderRequirements = CommandExecutor | HabitatConfig | HabitatClock | CommandRunner;
type GitCommandEffect = Effect.Effect<
  HabitatCommandResult,
  CommandProviderError,
  GitProviderRequirements
>;
type GitTextEffect = Effect.Effect<string | null, never, GitProviderRequirements>;

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
  readonly add: (paths: readonly string[], options?: GitCommandOptions) => GitCommandEffect;
  readonly diffNameOnly: (
    input?: { cached?: boolean; paths?: readonly string[] } & GitCommandOptions
  ) => GitCommandEffect;
  readonly diffNameStatus: (input?: { cached?: boolean } & GitCommandOptions) => GitCommandEffect;
}

export class GitProvider extends Context.Tag("@internal/habitat-harness/GitProvider")<
  GitProvider,
  GitProviderService
>() {}

export const GitProviderLive = Layer.succeed(GitProvider, makeLiveGitProvider());

export function makeFakeGitProviderLayer(
  handler: (argv: readonly string[], options: Required<GitCommandOptions>) => HabitatCommandResult
) {
  return Layer.succeed(GitProvider, makeGitProviderFromCommandHandler(handler));
}

export function makeGitProviderFromCommandHandler(
  handler: (argv: readonly string[], options: Required<GitCommandOptions>) => HabitatCommandResult
): GitProviderService {
  const command: GitProviderService["command"] = (argv, options = {}) =>
    Effect.sync(() => handler(argv, { cwd: options.cwd ?? repoRoot }));
  return providerFromCommand(command);
}

function makeLiveGitProvider(): GitProviderService {
  const command: GitProviderService["command"] = (argv, options = {}) =>
    CommandRunner.pipe(
      Effect.flatMap((runner) =>
        runner.run({
          commandId: `git-${argv.join("-")}`,
          kind: "git-state",
          executable: "git",
          argv,
          cwd: options.cwd ?? repoRoot,
          captureGitState: false,
        })
      )
    );
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
