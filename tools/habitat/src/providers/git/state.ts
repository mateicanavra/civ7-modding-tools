import { createHash } from "node:crypto";
import { runSyncHostCommand } from "@habitat/cli/resources/command/sync";
import { Context, Effect, Layer, Match } from "effect";

export interface HabitatGitState {
  branch: string | null;
  head: string | null;
  dirty: boolean;
  statusShort: string;
  statusDigest: string;
}

export interface HabitatCommandGitState {
  before: HabitatGitState;
  after: HabitatGitState;
}

export interface GitStateProviderService extends ReturnType<typeof makeGitStateProvider> {}

export class GitStateProvider extends Context.Tag("@habitat/cli/GitStateProvider")<
  GitStateProvider,
  GitStateProviderService
>() {}

export function makeGitStateProviderLayer(repoRoot: string) {
  return Layer.succeed(GitStateProvider, makeGitStateProvider(repoRoot));
}

export function makeFakeGitStateProviderLayer(
  handler: (cwd: string) => HabitatGitState,
  { repoRoot = "." }: { readonly repoRoot?: string } = {}
) {
  return Layer.succeed(GitStateProvider, {
    read: (cwd?: string) => Effect.suspend(() => Effect.succeed(handler(cwd ?? repoRoot))),
  });
}

function makeGitStateProvider(repoRoot: string) {
  return {
    read: (cwd?: string) => Effect.suspend(() => Effect.succeed(readGitState(cwd ?? repoRoot))),
  };
}

export function readGitState(cwd: string): HabitatGitState {
  const branch = gitValue(["branch", "--show-current"], cwd);
  const head = gitValue(["rev-parse", "HEAD"], cwd);
  const status = gitOutput(["status", "--short"], cwd);
  const statusShort = Match.value(status.exitCode).pipe(
    Match.when(0, () => status.stdout),
    Match.orElse(() => `${status.stdout}${status.stderr}`)
  );
  return {
    branch: branch || null,
    head: head || null,
    dirty: statusShort.trim().length > 0,
    statusShort,
    statusDigest: createHash("sha256").update(statusShort).digest("hex"),
  };
}

export function unknownGitState(): HabitatCommandGitState {
  const unknown: HabitatGitState = {
    branch: null,
    head: null,
    dirty: false,
    statusShort: "",
    statusDigest: createHash("sha256").update("").digest("hex"),
  };
  return { before: unknown, after: unknown };
}

function gitValue(argv: readonly string[], cwd: string): string {
  const result = gitOutput(argv, cwd);
  return Match.value(result.exitCode).pipe(
    Match.when(0, () => result.stdout.trim()),
    Match.orElse(() => "")
  );
}

function gitOutput(
  argv: readonly string[],
  cwd: string
): { readonly exitCode: number; readonly stdout: string; readonly stderr: string } {
  const result = runSyncHostCommand("git", argv, {
    cwd,
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    exitCode:
      result.status ??
      Match.value(result.error).pipe(
        Match.when(Match.undefined, () => 0),
        Match.orElse(() => 127)
      ),
    stdout: result.stdout ?? "",
    stderr:
      result.stderr ??
      Match.value(result.error).pipe(
        Match.when(Match.undefined, () => ""),
        Match.orElse((error) => `${String(error)}\n`)
      ),
  };
}
