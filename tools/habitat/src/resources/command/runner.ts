import path from "node:path";
import { Command } from "@effect/platform";
import {
  CommandExecutor,
  type CommandExecutor as CommandExecutorService,
} from "@effect/platform/CommandExecutor";
import type { PlatformError } from "@effect/platform/Error";
import {
  GitStateProvider,
  type GitStateProviderService,
  type HabitatCommandGitState,
  unknownGitState,
} from "@habitat/cli/providers/git/state";
import { HabitatConfig, type HabitatConfigService } from "@habitat/cli/resources/config/index";
import { epochMillisToIsoString } from "@habitat/cli/resources/platform/index";
import { Chunk, Clock, Context, Duration, Effect, Layer, Stream } from "effect";
import { CommandInterrupted, CommandUnavailable } from "./errors.js";
import { materializeHabitatCommandWithConfig } from "./materialize.js";
import { makeCommandResultFromObservation } from "./output.js";
import type { CommandRunnerService } from "./service.js";
import type { HabitatCommandResult, HabitatProcessRequest } from "./types.js";

export class CommandRunner extends Context.Tag("@habitat/cli/CommandRunner")<
  CommandRunner,
  CommandRunnerService
>() {}

export const CommandRunnerLive = Layer.effect(
  CommandRunner,
  Effect.gen(function* () {
    const commandExecutor = yield* CommandExecutor;
    const config = yield* HabitatConfig;
    const gitState = yield* GitStateProvider;
    return {
      run: (request: HabitatProcessRequest) =>
        runLiveCommand(request, { commandExecutor, config, gitState }),
    };
  })
);

interface LiveCommandDependencies {
  readonly commandExecutor: CommandExecutorService;
  readonly config: HabitatConfigService;
  readonly gitState: GitStateProviderService;
}

function runLiveCommand(
  request: HabitatProcessRequest,
  dependencies: LiveCommandDependencies
): Effect.Effect<HabitatCommandResult, CommandUnavailable | CommandInterrupted> {
  return Effect.gen(function* () {
    const config = yield* dependencies.config.get;
    const commandRequest = materializeHabitatCommandWithConfig(
      config,
      request.executable,
      request.argv
    );
    const effectiveRequest = {
      ...request,
      executable: commandRequest.executable,
      argv: commandRequest.argv,
      cwd: request.cwd,
    };
    const timeoutMs = request.timeoutMs ?? config.timeoutPolicy.commandTimeoutMs;
    const execution = executeLiveCommand(
      request,
      effectiveRequest,
      commandRequest.executionPlane,
      dependencies.commandExecutor,
      dependencies.gitState
    );
    return yield* interruptCommandOnTimeout(execution, request, effectiveRequest, timeoutMs);
  });
}

function executeLiveCommand(
  originalRequest: HabitatProcessRequest,
  effectiveRequest: HabitatProcessRequest,
  executionPlane: HabitatCommandResult["executionPlane"],
  commandExecutor: CommandExecutorService,
  gitStateProvider: GitStateProviderService
): Effect.Effect<HabitatCommandResult, CommandUnavailable> {
  return Effect.scoped(
    Effect.gen(function* () {
      const { gitState, value } = yield* captureCommandGitStateAroundWith(
        gitStateProvider,
        effectiveRequest.cwd,
        effectiveRequest.captureGitState,
        Effect.gen(function* () {
          const startedMs = yield* Clock.currentTimeMillis;
          const startedAt = epochMillisToIsoString(startedMs);
          const command = Command.make(effectiveRequest.executable, ...effectiveRequest.argv).pipe(
            Command.workingDirectory(path.resolve(effectiveRequest.cwd)),
            Command.env(commandEnv(originalRequest.env))
          );
          const process = yield* commandExecutor.start(command);
          yield* Effect.addFinalizer(() =>
            process.isRunning.pipe(
              Effect.flatMap((running) => (running ? process.kill("SIGTERM") : Effect.void)),
              Effect.ignore
            )
          );
          const [stdout, stderr, exitCode] = yield* Effect.all(
            [collectStream(process.stdout), collectStream(process.stderr), process.exitCode],
            { concurrency: "unbounded" }
          );
          const endedMs = yield* Clock.currentTimeMillis;
          return {
            startedAt,
            endedAt: epochMillisToIsoString(endedMs),
            durationMs: Math.max(0, endedMs - startedMs),
            exitCode: Number(exitCode),
            stdout,
            stderr,
          };
        })
      );
      return makeCommandResultFromObservation(effectiveRequest, {
        requestedExecutable: originalRequest.executable,
        executionPlane,
        gitState,
        ...value,
      });
    })
  ).pipe(
    Effect.catchAll((cause) => Effect.fail(commandUnavailableFromCause(originalRequest, cause)))
  );
}

export function captureCommandGitStateAround<A, E, R>(
  cwd: string,
  captureGitState: boolean | undefined,
  effect: Effect.Effect<A, E, R>
): Effect.Effect<
  { readonly gitState: HabitatCommandGitState; readonly value: A },
  E,
  R | GitStateProvider
> {
  return GitStateProvider.pipe(
    Effect.flatMap((gitState) =>
      captureCommandGitStateAroundWith(gitState, cwd, captureGitState, effect)
    )
  );
}

function captureCommandGitStateAroundWith<A, E, R>(
  gitStateProvider: GitStateProviderService,
  cwd: string,
  captureGitState: boolean | undefined,
  effect: Effect.Effect<A, E, R>
): Effect.Effect<{ readonly gitState: HabitatCommandGitState; readonly value: A }, E, R> {
  return Effect.gen(function* () {
    if (captureGitState === false) {
      return { gitState: unknownGitState(), value: yield* effect };
    }
    const before = yield* gitStateProvider.read(cwd);
    const value = yield* effect;
    const after = yield* gitStateProvider.read(cwd);
    return { gitState: { before, after }, value };
  });
}

export function interruptCommandOnTimeout<R>(
  effect: Effect.Effect<HabitatCommandResult, CommandUnavailable, R>,
  originalRequest: HabitatProcessRequest,
  effectiveRequest: HabitatProcessRequest,
  timeoutMs: number | undefined
) {
  if (timeoutMs === undefined || timeoutMs <= 0) return effect;
  return effect.pipe(
    Effect.timeoutFail({
      duration: Duration.millis(timeoutMs),
      onTimeout: () =>
        new CommandInterrupted({
          commandId: originalRequest.commandId,
          executable: effectiveRequest.executable,
          argv: [...effectiveRequest.argv],
          cwd: path.resolve(effectiveRequest.cwd),
          timeoutMs,
          signal: "SIGTERM",
          cause: `command exceeded timeout policy (${timeoutMs}ms)`,
        }),
    })
  );
}

function collectStream(
  stream: Stream.Stream<Uint8Array, PlatformError>
): Effect.Effect<string, PlatformError> {
  return Stream.runCollect(stream).pipe(
    Effect.map((chunks) => Buffer.concat(Chunk.toReadonlyArray(chunks)).toString("utf8"))
  );
}

function commandEnv(env: HabitatProcessRequest["env"]): Record<string, string> {
  return {
    ...Object.fromEntries(
      Object.entries(process.env).filter(
        (entry): entry is [string, string] => entry[1] !== undefined
      )
    ),
    ...Object.fromEntries(
      Object.entries(env ?? {}).filter((entry): entry is [string, string] => entry[1] !== undefined)
    ),
  };
}

export function commandUnavailableFromCause(request: HabitatProcessRequest, cause: unknown) {
  return new CommandUnavailable({
    commandId: request.commandId,
    executable: request.executable,
    argv: [...request.argv],
    cwd: path.resolve(request.cwd),
    cause: cause instanceof Error ? cause.message : String(cause),
  });
}
