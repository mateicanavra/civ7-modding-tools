import { spawnSync } from "node:child_process";
import path from "node:path";
import { Command } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { PlatformError } from "@effect/platform/Error";
import { Chunk, Context, Duration, Effect, Layer, Stream } from "effect";
import { HabitatConfig, makeHabitatConfig } from "../../config/index.js";
import { CommandInterrupted, CommandUnavailable } from "../../errors/index.js";
import { readGitState, unknownGitState } from "../../lib/git-state.js";
import { HabitatClock } from "../../resources/index.js";
import { materializeHabitatCommandWithConfig } from "./materialize.js";
import { makeCommandResultFromObservation } from "./output.js";
import type { CommandRunnerService, HabitatCommandResult, HabitatProcessRequest } from "./types.js";

export class CommandRunner extends Context.Tag("@internal/habitat-harness/CommandRunner")<
  CommandRunner,
  CommandRunnerService
>() {}

export const CommandRunnerLive = Layer.succeed(CommandRunner, {
  run: runLiveCommand,
  runSync: runSyncHabitatCommand,
});

function runLiveCommand(
  request: HabitatProcessRequest
): Effect.Effect<
  HabitatCommandResult,
  CommandUnavailable | CommandInterrupted,
  CommandExecutor | HabitatConfig | HabitatClock
> {
  return Effect.gen(function* () {
    const configService = yield* HabitatConfig;
    const config = yield* configService.get;
    const commandRequest = materializeHabitatCommandWithConfig(
      config,
      request.executable,
      request.argv
    );
    const effectiveRequest = {
      ...request,
      executable: commandRequest.executable,
      argv: commandRequest.argv,
      cwd: commandRequest.cwd ?? request.cwd,
    };
    const timeoutMs = request.timeoutMs ?? config.timeoutPolicy.commandTimeoutMs;
    const execution = executeLiveCommand(request, effectiveRequest, commandRequest.executionPlane);
    return yield* applyCommandTimeout(execution, request, effectiveRequest, timeoutMs);
  });
}

function executeLiveCommand(
  originalRequest: HabitatProcessRequest,
  effectiveRequest: HabitatProcessRequest,
  executionPlane: HabitatCommandResult["executionPlane"]
): Effect.Effect<HabitatCommandResult, CommandUnavailable, CommandExecutor | HabitatClock> {
  return Effect.scoped(
    Effect.gen(function* () {
      const clock = yield* HabitatClock;
      const startedMs = yield* clock.currentTimeMillis;
      const startedAt = new Date(startedMs).toISOString();
      const beforeGitState =
        effectiveRequest.captureGitState === false
          ? unknownGitState().before
          : readGitState(effectiveRequest.cwd);
      const command = Command.make(effectiveRequest.executable, ...effectiveRequest.argv).pipe(
        Command.workingDirectory(path.resolve(effectiveRequest.cwd)),
        Command.env(commandEnv(originalRequest.env))
      );
      const process = yield* Command.start(command);
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
      const endedMs = yield* clock.currentTimeMillis;
      const afterGitState =
        effectiveRequest.captureGitState === false
          ? unknownGitState().after
          : readGitState(effectiveRequest.cwd);
      return makeCommandResultFromObservation(effectiveRequest, {
        requestedExecutable: originalRequest.executable,
        executionPlane,
        gitState: { before: beforeGitState, after: afterGitState },
        startedAt,
        endedAt: new Date(endedMs).toISOString(),
        durationMs: Math.max(0, endedMs - startedMs),
        exitCode: Number(exitCode),
        stdout,
        stderr,
      });
    })
  ).pipe(Effect.catchAll((cause) => Effect.fail(commandUnavailable(originalRequest, cause))));
}

function applyCommandTimeout<R>(
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

export function runSyncHabitatCommand(request: HabitatProcessRequest): HabitatCommandResult {
  const config = makeHabitatConfig();
  const command = materializeHabitatCommandWithConfig(config, request.executable, request.argv);
  const effectiveRequest = {
    ...request,
    executable: command.executable,
    argv: command.argv,
    cwd: command.cwd ?? request.cwd,
  };
  const startedMs = Date.now();
  const startedAt = new Date(startedMs).toISOString();
  const beforeGitState =
    effectiveRequest.captureGitState === false
      ? unknownGitState().before
      : readGitState(effectiveRequest.cwd);
  const result = spawnSync(command.executable, command.argv, {
    cwd: path.resolve(effectiveRequest.cwd),
    env: { ...process.env, ...commandEnv(request.env) },
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    timeout: request.timeoutMs ?? config.timeoutPolicy.commandTimeoutMs,
    killSignal: "SIGTERM",
  });
  const endedMs = Date.now();
  const afterGitState =
    effectiveRequest.captureGitState === false
      ? unknownGitState().after
      : readGitState(effectiveRequest.cwd);
  const interrupted = result.signal !== null || result.error?.name === "TimeoutError";
  return makeCommandResultFromObservation(effectiveRequest, {
    requestedExecutable: request.executable,
    executionPlane: command.executionPlane,
    gitState: { before: beforeGitState, after: afterGitState },
    startedAt,
    endedAt: new Date(endedMs).toISOString(),
    durationMs: Math.max(0, endedMs - startedMs),
    exitCode: result.status ?? (result.error ? 127 : 0),
    signal: result.signal,
    interrupted,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? (result.error ? `${String(result.error)}\n` : ""),
  });
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
      Object.entries(env ?? {}).filter((entry): entry is [string, string] => entry[1] !== undefined)
    ),
  };
}

function commandUnavailable(request: HabitatProcessRequest, cause: unknown) {
  return new CommandUnavailable({
    commandId: request.commandId,
    executable: request.executable,
    argv: [...request.argv],
    cwd: path.resolve(request.cwd),
    cause: cause instanceof Error ? cause.message : String(cause),
  });
}
