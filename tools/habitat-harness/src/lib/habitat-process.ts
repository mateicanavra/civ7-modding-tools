import path from "node:path";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import { Context, Effect, Layer } from "effect";
import type { HabitatConfig } from "../config/index.js";
import { CommandFailed, CommandInterrupted, CommandUnavailable } from "../errors/index.js";
import {
  type CommandCachePolicy,
  CommandRunner,
  type GritParseStatus,
  type HabitatCommandKind,
  type HabitatCommandResult,
  type HabitatProcessRequest,
  makeFakeCommandRunnerLayer,
  makeHabitatCommandResult as makeProviderCommandResult,
} from "../providers/command/index.js";
import type { HabitatClock } from "../resources/index.js";
import { GritToolUnavailable } from "./grit-failures.js";

export type {
  CommandCachePolicy,
  GritParseStatus,
  HabitatCommandKind,
  HabitatCommandResult,
  HabitatProcessRequest,
  OutputCapture,
  RedactedEnvValue,
} from "../providers/command/index.js";

export interface HabitatProcessService {
  run: (
    request: HabitatProcessRequest
  ) => Effect.Effect<
    HabitatCommandResult,
    GritToolUnavailable | CommandInterrupted,
    CommandRunner | CommandExecutor | HabitatConfig | HabitatClock
  >;
}

export class HabitatProcess extends Context.Tag("@internal/habitat-harness/HabitatProcess")<
  HabitatProcess,
  HabitatProcessService
>() {}
export type { GritAdapterFailureTag } from "./grit-failures.js";
export { GritToolUnavailable };

/**
 * Temporary migration bridge for existing Grit-backed adapters.
 *
 * The durable execution owner is `providers/command`; Grit-specific behavior
 * must move to `providers/grit` and delete this bridge in the provider cutover.
 */
export const HabitatProcessLive = Layer.succeed(HabitatProcess, {
  run: (request) =>
    Effect.gen(function* () {
      const runner = yield* CommandRunner;
      const result = yield* runner.run(request).pipe(
        Effect.catchTag("CommandInterrupted", (error) =>
          Effect.succeed(makeInterruptedCommandResult(request, error))
        ),
        Effect.mapError((error) => mapCommandProviderError(request, error))
      );
      return withGritCompatibilityFailureTag(result);
    }),
});

export function makeFakeHabitatProcessLayer(
  handler: (request: HabitatProcessRequest) => HabitatCommandResult
) {
  return Layer.mergeAll(
    makeFakeCommandRunnerLayer(handler),
    Layer.succeed(HabitatProcess, {
      run: (request: HabitatProcessRequest) => Effect.sync(() => handler(request)),
    })
  );
}

export function makeHabitatCommandResult(
  request: HabitatProcessRequest,
  overrides: Partial<HabitatCommandResult> = {}
): HabitatCommandResult {
  return withGritCompatibilityFailureTag(makeProviderCommandResult(request, overrides));
}

function mapCommandProviderError(
  request: HabitatProcessRequest,
  error: CommandUnavailable | CommandFailed
): GritToolUnavailable {
  if (error._tag === "CommandFailed") {
    return new GritToolUnavailable({
      commandId: error.commandId,
      executable: error.executable,
      argv: error.argv,
      cwd: path.resolve(error.cwd),
      cause: `command exited ${error.exitCode}`,
    });
  }
  return new GritToolUnavailable({
    commandId: error.commandId,
    executable: error.executable || request.executable,
    argv: error.argv.length > 0 ? error.argv : [...request.argv],
    cwd: path.resolve(error.cwd || request.cwd),
    cause: error.cause,
  });
}

function makeInterruptedCommandResult(
  request: HabitatProcessRequest,
  error: CommandInterrupted
): HabitatCommandResult {
  return makeProviderCommandResult(
    { ...request, executable: error.executable, argv: error.argv, cwd: error.cwd },
    {
      requestedExecutable: request.executable,
      exit: { code: 130, signal: error.signal, interrupted: true },
      stderr: {
        text: `${error.cause}\n`,
        truncated: false,
        sha256: "",
        bytes: error.cause.length + 1,
      },
      failureTag: "CommandFailed",
    }
  );
}

function withGritCompatibilityFailureTag(result: HabitatCommandResult): HabitatCommandResult {
  if (result.failureTag === "CommandFailed") {
    return { ...result, failureTag: "GritCommandFailed" };
  }
  return result;
}
