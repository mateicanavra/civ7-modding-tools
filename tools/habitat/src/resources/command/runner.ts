import path from "node:path";
import {
  GitStateProvider,
  type GitStateProviderService,
  unknownGitState,
} from "@habitat/cli/providers/git/state";
import { HabitatConfig, type HabitatConfigService } from "@habitat/cli/resources/config/index";
import { epochMillisToIsoString } from "@habitat/cli/resources/platform/index";
import { Clock, Context, Duration, Effect, Layer, Match } from "effect";
import { CommandInterrupted, CommandUnavailable } from "./errors.js";
import { materializeHabitatCommandWithConfig } from "./materialize.js";
import { collectOutputCapture, makeCommandResultFromObservation } from "./output.js";
import { acquireOwnedCommandProcess } from "./process.js";
import type { HabitatCommandResult, HabitatProcessRequest } from "./types.js";

export class CommandRunner extends Context.Tag("@habitat/cli/CommandRunner")<
  CommandRunner,
  CommandRunnerService
>() {}

const makeCommandRunner = Effect.gen(function* () {
  const config = yield* HabitatConfig;
  const gitState = yield* GitStateProvider;
  return {
    run: (request: HabitatProcessRequest) => runLiveCommand(request, { config, gitState }),
  };
});

export interface CommandRunnerService extends Effect.Effect.Success<typeof makeCommandRunner> {}

export const CommandRunnerLive = Layer.effect(CommandRunner, makeCommandRunner);

interface LiveCommandDependencies {
  readonly config: HabitatConfigService;
  readonly gitState: GitStateProviderService;
}

const runLiveCommand = Effect.fn("habitat.command.run")(function* (
  request: HabitatProcessRequest,
  dependencies: LiveCommandDependencies
) {
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
    dependencies.gitState
  );
  return yield* interruptCommandOnTimeout(execution, request, effectiveRequest, timeoutMs);
});

const executeLiveCommand = Effect.fn("habitat.command.execute")(function* (
  originalRequest: HabitatProcessRequest,
  effectiveRequest: HabitatProcessRequest,
  executionPlane: HabitatCommandResult["executionPlane"],
  gitStateProvider: GitStateProviderService
) {
  const captured = captureLiveCommandGitStateAround(
    gitStateProvider,
    effectiveRequest.cwd,
    effectiveRequest.captureGitState,
    originalRequest,
    effectiveRequest
  ).pipe(
    Effect.map(({ gitState, value }) =>
      makeCommandResultFromObservation(effectiveRequest, {
        requestedExecutable: originalRequest.executable,
        executionPlane,
        gitState,
        ...value,
      })
    )
  );
  return yield* captured.pipe(
    Effect.scoped,
    Effect.catchAll((cause) => Effect.fail(commandUnavailableFromCause(originalRequest, cause)))
  );
});

const observeLiveCommand = Effect.fn("habitat.command.observe")(function* (
  originalRequest: HabitatProcessRequest,
  effectiveRequest: HabitatProcessRequest
) {
  const startedMs = yield* Clock.currentTimeMillis;
  const startedAt = epochMillisToIsoString(startedMs);
  const process = yield* acquireOwnedCommandProcess({
    executable: effectiveRequest.executable,
    argv: effectiveRequest.argv,
    cwd: path.resolve(effectiveRequest.cwd),
    env: commandEnv(originalRequest.env),
  });
  yield* process.awaitStarted;
  const [stdout, stderr, exit] = yield* Effect.all(
    [collectOutputCapture(process.stdout), collectOutputCapture(process.stderr), process.awaitExit],
    { concurrency: "unbounded" }
  );
  const endedMs = yield* Clock.currentTimeMillis;
  return {
    startedAt,
    endedAt: epochMillisToIsoString(endedMs),
    durationMs: Math.max(0, endedMs - startedMs),
    exitCode: commandExitCode(exit),
    signal: exit.signal,
    interrupted: exit.signal !== null,
    stdout,
    stderr,
  };
});

const captureLiveCommandGitStateAround = Effect.fn("habitat.command.captureGitState")(function* (
  gitStateProvider: GitStateProviderService,
  cwd: string,
  captureGitState: boolean | undefined,
  originalRequest: HabitatProcessRequest,
  effectiveRequest: HabitatProcessRequest
) {
  const observation = observeLiveCommand(originalRequest, effectiveRequest);
  const withoutGitState = observation.pipe(
    Effect.map((value) => ({ gitState: unknownGitState(), value }))
  );
  const withGitState = Effect.gen(function* () {
    const before = yield* gitStateProvider.read(cwd);
    const value = yield* observation;
    const after = yield* gitStateProvider.read(cwd);
    return { gitState: { before, after }, value };
  });
  return yield* Match.value(captureGitState).pipe(
    Match.when(false, () => withoutGitState),
    Match.orElse(() => withGitState)
  );
});

function interruptCommandOnTimeout(
  effect: ReturnType<typeof executeLiveCommand>,
  originalRequest: HabitatProcessRequest,
  effectiveRequest: HabitatProcessRequest,
  timeoutMs: number | undefined
) {
  const boundedTimeoutMs = timeoutMs ?? 0;
  const timedEffect = effect.pipe(
    Effect.timeoutFail({
      duration: Duration.millis(boundedTimeoutMs),
      onTimeout: () =>
        new CommandInterrupted({
          commandId: originalRequest.commandId,
          executable: effectiveRequest.executable,
          argv: [...effectiveRequest.argv],
          cwd: path.resolve(effectiveRequest.cwd),
          timeoutMs: boundedTimeoutMs,
          signal: "SIGTERM",
          cause: `command exceeded timeout policy (${boundedTimeoutMs}ms)`,
        }),
    })
  );
  return Match.value(timeoutMs).pipe(
    Match.when(Match.undefined, () => effect),
    Match.when(
      (candidate) => candidate <= 0,
      () => effect
    ),
    Match.orElse(() => timedEffect)
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

function commandExitCode(exit: {
  readonly code: number | null;
  readonly signal: NodeJS.Signals | null;
}): number {
  const signalExitCode = Match.value(exit.signal).pipe(
    Match.when("SIGINT", () => 130),
    Match.when("SIGKILL", () => 137),
    Match.when("SIGTERM", () => 143),
    Match.orElse(() => 1)
  );
  return Match.value(exit.code).pipe(
    Match.when(Match.number, (code) => code),
    Match.orElse(() => signalExitCode)
  );
}

function commandUnavailableFromCause(request: HabitatProcessRequest, cause: unknown) {
  const renderedCause = Match.value(cause).pipe(
    Match.when(Match.instanceOf(Error), (error) => error.message),
    Match.orElse(String)
  );
  return new CommandUnavailable({
    commandId: request.commandId,
    executable: request.executable,
    argv: [...request.argv],
    cwd: path.resolve(request.cwd),
    cause: renderedCause,
  });
}
