import { readWorkspaceGraph } from "@habitat/cli/providers/nx/graph";
import {
  CommandRunner,
  type CommandRunnerService,
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "@habitat/cli/resources/command/index";
import type { HabitatCommandResult } from "@habitat/cli/resources/command/types";
import type { WorkspaceGraphReadState } from "@habitat/cli/service/model/workspace/index";
import { Context, Effect, Layer, Option } from "effect";

export interface NxAffectedRequest {
  base: string;
  targets: readonly string[];
  head?: string;
}

export interface NxGraphRequest {
  outputPath: string;
}

export interface NxRunManyRequest {
  projects?: readonly string[];
  targets: readonly string[];
}

export interface NxRunTargetRequest {
  project: string;
  target: string;
}

export type NxProviderService = ReturnType<typeof makeLiveNxProvider>;

export class NxProvider extends Context.Tag("@habitat/cli/NxProvider")<
  NxProvider,
  NxProviderService
>() {}

export function makeNxProviderLayer(repoRoot: string) {
  return Layer.effect(
    NxProvider,
    Effect.map(CommandRunner, (runner) => makeLiveNxProvider(repoRoot, runner))
  );
}

export interface FakeNxProviderHandlers {
  readonly affected?: (request: NxAffectedRequest) => HabitatCommandResult;
  readonly graph?: (request: NxGraphRequest) => HabitatCommandResult;
  readonly runMany?: (request: NxRunManyRequest) => HabitatCommandResult;
  readonly runTarget?: (request: NxRunTargetRequest) => HabitatCommandResult;
  readonly workspaceGraph?: () => WorkspaceGraphReadState;
}

export function makeFakeNxProviderLayer(handlers: FakeNxProviderHandlers = {}) {
  return Layer.succeed(NxProvider, {
    affected: (request: NxAffectedRequest) =>
      Effect.suspend(() =>
        Effect.succeed(requireFakeResult("affected", handlers.affected, request))
      ),
    affectedArgv,
    graph: (request: NxGraphRequest) =>
      Effect.suspend(() => Effect.succeed(requireFakeResult("graph", handlers.graph, request))),
    graphArgv,
    runMany: (request: NxRunManyRequest) =>
      Effect.suspend(() => Effect.succeed(requireFakeResult("runMany", handlers.runMany, request))),
    runManyArgv,
    runTarget: (request: NxRunTargetRequest) =>
      Effect.suspend(() =>
        Effect.succeed(requireFakeResult("runTarget", handlers.runTarget, request))
      ),
    runTargetArgv,
    workspaceGraph: () =>
      Effect.suspend(() => Effect.succeed(requireFakeWorkspaceGraph(handlers.workspaceGraph))),
  });
}

function makeLiveNxProvider(repoRoot: string, runner: CommandRunnerService) {
  return {
    affected: (request: NxAffectedRequest) =>
      runner.run({
        commandId: "nx-affected",
        kind: "workspace-tool",
        executable: "nx",
        argv: affectedArgv(request).slice(1),
        cwd: repoRoot,
        captureGitState: false,
      }),
    affectedArgv,
    graph: (request: NxGraphRequest) =>
      runner.run({
        commandId: "nx-project-graph",
        kind: "workspace-tool",
        executable: "nx",
        argv: graphArgv(request).slice(1),
        cwd: repoRoot,
        captureGitState: false,
      }),
    graphArgv,
    runMany: (request: NxRunManyRequest) =>
      runner.run({
        commandId: "nx-run-many",
        kind: "workspace-tool",
        executable: "nx",
        argv: runManyArgv(request).slice(1),
        cwd: repoRoot,
        captureGitState: false,
      }),
    runManyArgv,
    runTarget: (request: NxRunTargetRequest) =>
      runner.run({
        commandId: "nx-run-target",
        kind: "workspace-tool",
        executable: "nx",
        argv: runTargetArgv(request).slice(1),
        cwd: repoRoot,
        captureGitState: false,
      }),
    runTargetArgv,
    workspaceGraph: () => Effect.promise(() => readWorkspaceGraph(repoRoot)),
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
  return ["nx", "graph", "--file", request.outputPath];
}

export function runManyArgv(request: NxRunManyRequest): string[] {
  const projects = Option.fromNullable(request.projects).pipe(
    Option.filter((selected) => selected.length > 0),
    Option.match({
      onNone: () => [],
      onSome: (selected) => ["--projects", selected.join(",")],
    })
  );
  return [
    "nx",
    "run-many",
    "--targets",
    request.targets.join(","),
    ...projects,
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
