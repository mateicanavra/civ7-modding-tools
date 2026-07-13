import path from "node:path";
import {
  CommandUnavailable,
  type HabitatCommandResult,
  type HabitatProcessRequest,
} from "@habitat/cli/resources/command/index";
import {
  type DiagnosticCompletedCommandObservation,
  diagnosticCommandObservationFromResult,
  diagnosticCompletedCommandObservationFromResult,
  diagnosticFailedCommandObservation,
  diagnosticInterruptedCommandObservation,
  diagnosticToolUnavailableObservation,
} from "@habitat/cli/service/model/diagnostics/dto/diagnostic-command.schema";
import { Effect, Match } from "effect";
import type { GritCommandFailureCapture } from "./output.js";
import type { GritProviderService } from "./resource.js";

type GritNativeIdentityObservation =
  | {
      readonly kind: "pre-spawn";
      readonly commandId: string;
      readonly executable: string;
      readonly argv: readonly string[];
      readonly cwd: string;
      readonly cause: string;
    }
  | {
      readonly kind: "completed";
      readonly result: HabitatCommandResult;
    };

export class GritNativeIdentityMismatch extends CommandUnavailable {
  readonly mismatchKind = "native-identity-mismatch" as const;
  readonly detail: string;
  readonly observation: GritNativeIdentityObservation;

  constructor(
    input: ConstructorParameters<typeof CommandUnavailable>[0] & {
      readonly detail: string;
      readonly observation: GritNativeIdentityObservation;
    }
  ) {
    super(input);
    this.detail = input.detail;
    this.observation = input.observation;
  }
}

export function nativeIdentityMismatchBeforeSpawn(
  request: HabitatProcessRequest,
  detail: string
): GritNativeIdentityMismatch {
  return new GritNativeIdentityMismatch({
    commandId: request.commandId,
    executable: request.executable,
    argv: request.argv,
    cwd: request.cwd,
    cause: detail,
    detail,
    observation: {
      kind: "pre-spawn",
      commandId: request.commandId,
      executable: request.executable,
      argv: [...request.argv],
      cwd: path.resolve(request.cwd),
      cause: detail,
    },
  });
}

export function nativeIdentityMismatchFromCompleted(
  result: HabitatCommandResult,
  detail: string
): GritNativeIdentityMismatch {
  return new GritNativeIdentityMismatch({
    commandId: result.commandId,
    executable: result.executable,
    argv: result.argv,
    cwd: result.cwd,
    cause: detail,
    detail,
    observation: { kind: "completed", result },
  });
}

export type GritCommandCapture =
  | {
      readonly kind: "completed";
      readonly result: HabitatCommandResult;
      readonly command: DiagnosticCompletedCommandObservation;
    }
  | ({ readonly kind: "command-failed" } & GritCommandFailureCapture);

export const captureGritCommandEffect = Effect.fn("grit.command.capture")(function* (
  request: HabitatProcessRequest,
  effect: ReturnType<GritProviderService["check"]>
) {
  const captured = yield* effect.pipe(
    Effect.map((result) => ({ kind: "result" as const, result })),
    Effect.catchTags({
      CommandUnavailable: (error) => Effect.succeed(commandUnavailableCapture(request, error)),
      CommandFailed: (error) =>
        Effect.succeed({
          kind: "command-failed" as const,
          failure: "GritCommandFailed" as const,
          detail: `Grit command ${error.commandId} exited ${error.exitCode}.`,
          command: diagnosticFailedCommandObservation({
            ...commandErrorMetadata(error, request),
            exitCode: error.exitCode,
          }),
        }),
      CommandInterrupted: (error) =>
        Effect.succeed({
          kind: "command-failed" as const,
          failure: "GritCommandInterrupted" as const,
          detail: `Grit command ${error.commandId} was interrupted: ${error.cause}.`,
          command: diagnosticInterruptedCommandObservation({
            ...commandErrorMetadata(error, request),
            exitCode: null,
            signal: error.signal,
            timeoutMs: error.timeoutMs,
          }),
        }),
    })
  );
  return Match.value(captured).pipe(
    Match.when({ kind: "command-failed" }, (failure) => failure),
    Match.when({ kind: "result" }, ({ result }) => commandResultCapture(result)),
    Match.exhaustive
  );
});

function commandUnavailableCapture(
  request: HabitatProcessRequest,
  error: CommandUnavailable
): Extract<GritCommandCapture, { kind: "command-failed" }> {
  return Match.value(error).pipe(
    Match.when(
      (candidate): candidate is GritNativeIdentityMismatch =>
        candidate instanceof GritNativeIdentityMismatch,
      (identity) => nativeIdentityMismatchCapture(request, identity)
    ),
    Match.orElse((unavailable) => ({
      kind: "command-failed" as const,
      failure: "GritToolUnavailable" as const,
      detail: unavailable.cause,
      command: diagnosticToolUnavailableObservation({
        ...commandErrorMetadata(unavailable, request),
        cause: unavailable.cause,
      }),
    }))
  );
}

function nativeIdentityMismatchCapture(
  request: HabitatProcessRequest,
  error: GritNativeIdentityMismatch
): Extract<GritCommandCapture, { kind: "command-failed" }> {
  const command = Match.value(error.observation).pipe(
    Match.when({ kind: "pre-spawn" }, (observation) =>
      diagnosticToolUnavailableObservation({
        ...commandErrorMetadata(observation, request),
        cause: observation.cause,
      })
    ),
    Match.when({ kind: "completed" }, ({ result }) =>
      diagnosticCompletedCommandObservationFromResult(result)
    ),
    Match.exhaustive
  );
  return {
    kind: "command-failed",
    failure: "GritNativeIdentityMismatch",
    detail: error.detail,
    command,
  };
}

function commandResultCapture(result: HabitatCommandResult): GritCommandCapture {
  const command = diagnosticCommandObservationFromResult(result);
  return Match.value(command).pipe(
    Match.when({ kind: "interrupted" }, (interrupted) => ({
      kind: "command-failed" as const,
      failure: "GritCommandInterrupted" as const,
      detail: `Grit command ${result.commandId} was interrupted.`,
      command: interrupted,
    })),
    Match.when({ kind: "failed" }, (failed) => ({
      kind: "command-failed" as const,
      failure: "GritCommandFailed" as const,
      detail: `Grit command ${result.commandId} exited ${result.exit.code}.`,
      command: failed,
    })),
    Match.when({ kind: "completed" }, (completed) => ({
      kind: "completed" as const,
      result,
      command: completed,
    })),
    Match.exhaustive
  );
}

function commandErrorMetadata(
  error: Pick<HabitatProcessRequest, "commandId" | "executable" | "argv" | "cwd">,
  requestedTarget: HabitatProcessRequest
) {
  const isRequestedTarget =
    error.commandId === requestedTarget.commandId &&
    error.executable === requestedTarget.executable &&
    arraysEqual(error.argv, requestedTarget.argv) &&
    path.resolve(error.cwd) === path.resolve(requestedTarget.cwd);
  const scanRoots = Match.value(isRequestedTarget).pipe(
    Match.when(true, () => [...(requestedTarget.scanRoots ?? [])]),
    Match.orElse(() => [])
  );
  return {
    commandId: error.commandId,
    executable: error.executable,
    argv: [...error.argv],
    cwd: path.resolve(error.cwd),
    scanRoots,
  };
}

function arraysEqual(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
