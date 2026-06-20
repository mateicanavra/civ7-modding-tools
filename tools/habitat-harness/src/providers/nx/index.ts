import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import { Context, Effect, Layer } from "effect";
import type { HabitatConfig } from "../../config/index.js";
import type { CommandProviderError } from "../../errors/index.js";
import { repoRoot } from "../../lib/paths.js";
import {
  CommandRunner,
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "../command/index.js";
import type { HabitatCommandResult } from "../command/types.js";

type NxProviderRequirements = CommandExecutor | HabitatConfig | CommandRunner;

export interface NxAffectedRequest {
  base: string;
  targets: readonly string[];
  head?: string;
}

export interface NxGraphRequest {
  outputPath: string;
}

export interface NxProviderService {
  readonly affected: (
    request: NxAffectedRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, NxProviderRequirements>;
  readonly affectedArgv: (request: NxAffectedRequest) => string[];
  readonly graph: (
    request: NxGraphRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, NxProviderRequirements>;
  readonly graphArgv: (request: NxGraphRequest) => string[];
}

export class NxProvider extends Context.Tag("@internal/habitat-harness/NxProvider")<
  NxProvider,
  NxProviderService
>() {}

export const NxProviderLive = Layer.succeed(NxProvider, makeLiveNxProvider());

export interface FakeNxProviderHandlers {
  readonly affected?: (request: NxAffectedRequest) => HabitatCommandResult;
  readonly graph?: (request: NxGraphRequest) => HabitatCommandResult;
}

export function makeFakeNxProviderLayer(
  handlerOrHandlers: ((request: NxAffectedRequest) => HabitatCommandResult) | FakeNxProviderHandlers
) {
  const handlers =
    typeof handlerOrHandlers === "function" ? { affected: handlerOrHandlers } : handlerOrHandlers;
  return Layer.succeed(NxProvider, {
    affected: (request) =>
      Effect.sync(() => requireFakeResult("affected", handlers.affected, request)),
    affectedArgv,
    graph: (request) => Effect.sync(() => requireFakeResult("graph", handlers.graph, request)),
    graphArgv,
  });
}

function makeLiveNxProvider(): NxProviderService {
  return {
    affected: (request) =>
      CommandRunner.pipe(
        Effect.flatMap((runner) =>
          runner.run({
            commandId: "nx-affected",
            kind: "workspace-tool",
            executable: "nx",
            argv: affectedArgv(request).slice(1),
            cwd: repoRoot,
            captureGitState: false,
          })
        )
      ),
    affectedArgv,
    graph: (request) =>
      CommandRunner.pipe(
        Effect.flatMap((runner) =>
          runner.run({
            commandId: "nx-project-graph",
            kind: "workspace-tool",
            executable: "target-check",
            argv: graphArgv(request).slice(1),
            cwd: repoRoot,
            captureGitState: false,
          })
        )
      ),
    graphArgv,
  };
}

export function affectedArgv(request: NxAffectedRequest): string[] {
  return [
    "nx",
    "affected",
    "-t",
    request.targets.join(","),
    "--base",
    request.base,
    "--head",
    request.head ?? "HEAD",
    "--outputStyle=static",
  ];
}

export function graphArgv(request: NxGraphRequest): string[] {
  return ["target-check", "graph", "--file", request.outputPath];
}

function requireFakeResult<Request>(
  name: keyof FakeNxProviderHandlers,
  handler: ((request: Request) => HabitatCommandResult) | undefined,
  request: Request
): HabitatCommandResult {
  if (!handler) throw new Error(`Fake Nx provider missing ${name} handler.`);
  return handler(request);
}

export { spawnResultFromCommandProviderError, spawnResultFromCommandResult };
