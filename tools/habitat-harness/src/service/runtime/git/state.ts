import { createHash } from "node:crypto";
import { repoRoot } from "@internal/habitat-harness/service/runtime/paths";
import { Context, Effect, Layer } from "effect";
import { runSyncHostCommand } from "../command/sync.js";

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

export interface GitStateProviderService {
  readonly read: (cwd?: string) => Effect.Effect<HabitatGitState>;
}

export class GitStateProvider extends Context.Tag("@internal/habitat-harness/GitStateProvider")<
  GitStateProvider,
  GitStateProviderService
>() {}

export const GitStateProviderLive = Layer.succeed(GitStateProvider, {
  read: (cwd) => Effect.sync(() => readGitState(cwd)),
});

export function makeFakeGitStateProviderLayer(
  handler: (cwd: string) => HabitatGitState
): Layer.Layer<GitStateProvider> {
  return Layer.succeed(GitStateProvider, {
    read: (cwd) => Effect.sync(() => handler(cwd ?? repoRoot)),
  });
}

export function readGitState(cwd = repoRoot): HabitatGitState {
  const branch = gitValue(["branch", "--show-current"], cwd);
  const head = gitValue(["rev-parse", "HEAD"], cwd);
  const status = gitOutput(["status", "--short"], cwd);
  const statusShort = status.exitCode === 0 ? status.stdout : `${status.stdout}${status.stderr}`;
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
  return result.exitCode === 0 ? result.stdout.trim() : "";
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
    exitCode: result.status ?? (result.error ? 127 : 0),
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? (result.error ? `${String(result.error)}\n` : ""),
  };
}
