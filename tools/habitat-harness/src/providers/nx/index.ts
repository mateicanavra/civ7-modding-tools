import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { GitStateProvider } from "@internal/habitat-harness/providers/git/index";
import { readWorkspaceGraph } from "@internal/habitat-harness/providers/nx/graph";
import type { WorkspaceGraphReadState } from "@internal/habitat-harness/providers/nx/schema";
import {
  type CommandProviderError,
  CommandRunner,
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "@internal/habitat-harness/resources/command/index";
import type { HabitatCommandResult } from "@internal/habitat-harness/resources/command/types";
import type { HabitatConfig } from "@internal/habitat-harness/resources/config/index";
import { repoRoot } from "@internal/habitat-harness/resources/paths";
import { Context, Effect, Layer } from "effect";

type NxProviderRequirements = CommandExecutor | HabitatConfig | CommandRunner | GitStateProvider;

export interface NxAffectedRequest {
  base: string;
  targets: readonly string[];
  head?: string;
  excludeTaskDependencies?: boolean;
}

export interface NxGraphRequest {
  outputPath: string;
}

export interface NxRunManyRequest {
  projects: readonly string[];
  targets: readonly string[];
}

export interface NxRunTargetRequest {
  project: string;
  target: string;
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
  readonly runMany: (
    request: NxRunManyRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, NxProviderRequirements>;
  readonly runManyArgv: (request: NxRunManyRequest) => string[];
  readonly runTarget: (
    request: NxRunTargetRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, NxProviderRequirements>;
  readonly runTargetArgv: (request: NxRunTargetRequest) => string[];
  readonly workspaceGraph: () => Effect.Effect<WorkspaceGraphReadState>;
}

export class NxProvider extends Context.Tag("@internal/habitat-harness/NxProvider")<
  NxProvider,
  NxProviderService
>() {}

export const NxProviderLive = Layer.succeed(NxProvider, makeLiveNxProvider());

export interface FakeNxProviderHandlers {
  readonly affected?: (request: NxAffectedRequest) => HabitatCommandResult;
  readonly graph?: (request: NxGraphRequest) => HabitatCommandResult;
  readonly runMany?: (request: NxRunManyRequest) => HabitatCommandResult;
  readonly runTarget?: (request: NxRunTargetRequest) => HabitatCommandResult;
  readonly workspaceGraph?: () => WorkspaceGraphReadState;
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
    runMany: (request) =>
      Effect.sync(() => requireFakeResult("runMany", handlers.runMany, request)),
    runManyArgv,
    runTarget: (request) =>
      Effect.sync(() => requireFakeResult("runTarget", handlers.runTarget, request)),
    runTargetArgv,
    workspaceGraph: () => Effect.sync(() => requireFakeWorkspaceGraph(handlers.workspaceGraph)),
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
            executable: "nx",
            argv: graphArgv(request).slice(1),
            cwd: repoRoot,
            captureGitState: false,
          })
        )
      ),
    graphArgv,
    runMany: (request) =>
      CommandRunner.pipe(
        Effect.flatMap((runner) =>
          runner.run({
            commandId: "nx-run-many",
            kind: "workspace-tool",
            executable: "nx",
            argv: runManyArgv(request).slice(1),
            cwd: repoRoot,
            captureGitState: false,
          })
        )
      ),
    runManyArgv,
    runTarget: (request) =>
      CommandRunner.pipe(
        Effect.flatMap((runner) =>
          runner.run({
            commandId: "nx-run-target",
            kind: "workspace-tool",
            executable: "nx",
            argv: runTargetArgv(request).slice(1),
            cwd: repoRoot,
            captureGitState: false,
          })
        )
      ),
    runTargetArgv,
    workspaceGraph: () => Effect.promise(() => readWorkspaceGraph()),
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
    ...(request.excludeTaskDependencies ? ["--excludeTaskDependencies"] : []),
  ];
}

export function graphArgv(request: NxGraphRequest): string[] {
  return ["nx", "graph", "--file", request.outputPath];
}

export function runManyArgv(request: NxRunManyRequest): string[] {
  return [
    "nx",
    "run-many",
    "--targets",
    request.targets.join(","),
    "--projects",
    request.projects.join(","),
    "--outputStyle=static",
  ];
}

export function runTargetArgv(request: NxRunTargetRequest): string[] {
  return ["nx", "run", `${request.project}:${request.target}`, "--outputStyle=static"];
}

function requireFakeResult<Request>(
  name: keyof FakeNxProviderHandlers,
  handler: ((request: Request) => HabitatCommandResult) | undefined,
  request: Request
): HabitatCommandResult {
  if (!handler) throw new Error(`Fake Nx provider missing ${name} handler.`);
  return handler(request);
}

function requireFakeWorkspaceGraph(
  handler: (() => WorkspaceGraphReadState) | undefined
): WorkspaceGraphReadState {
  if (!handler) throw new Error("Fake Nx provider missing workspaceGraph handler.");
  return handler();
}

export { spawnResultFromCommandProviderError, spawnResultFromCommandResult };
