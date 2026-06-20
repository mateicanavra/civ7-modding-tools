import { Effect } from "effect";
import {
  diagnosticAdapterFailureForCacheObservation,
  diagnosticCacheObservationFromCommand,
  diagnosticCacheRequirementForGritCheck,
  diagnosticCacheRequirementSatisfied,
  diagnosticCommandObservationFromResult,
  diagnosticToolUnavailableObservation,
  nativeGritCheckRequestFromProcessRequest,
  renderDiagnosticScanRootRefusal,
} from "../../domains/diagnostic-pattern-catalog/index.js";
import {
  CommandFailed,
  CommandInterrupted,
  CommandUnavailable,
  FileWriteFailed,
} from "../../errors/index.js";
import {
  captureOutput,
  type HabitatProcessRequest,
  makeHabitatCommandResult,
} from "../../providers/command/index.js";
import { acquireTempDirectory } from "../../resources/index.js";
import { parseGritCheckOutput, parseGritCheckTextOutput } from "./output.js";
import { GritToolUnavailable } from "./provider/failures.js";
import { GritProvider, gritCheckRequest } from "./provider/index.js";
import type { GritCheckOptions, GritCheckRequestOptions } from "./provider/types.js";
import { decidePatternScanRoots } from "./scan-roots/index.js";

export function gritCheckProgram(scanRoots: readonly string[], options: GritCheckOptions = {}) {
  return Effect.scoped(
    Effect.gen(function* () {
      const scanRootDecision = decidePatternScanRoots(scanRoots, {
        allowDocsRoot: options.allowDocsRoot,
      });
      if (scanRootDecision.kind === "refused") {
        return {
          kind: "scan-root-refused" as const,
          decision: scanRootDecision,
          message: renderDiagnosticScanRootRefusal(scanRootDecision),
          command: { kind: "not-run" as const, reason: "scan-root-refused" as const },
        };
      }
      const cacheRequirement = diagnosticCacheRequirementForGritCheck({
        cacheMode: options.cacheMode,
        requireObservableCacheStatus: options.requireObservableCacheStatus,
      });
      const requestOptions =
        options.cacheMode === "fresh"
          ? {
              cacheDir: yield* acquireGritCheckCacheDir(),
              observableCacheStatus: "fresh" as const,
              outputFormat: options.outputFormat,
            }
          : { outputFormat: options.outputFormat };
      const processRequest = gritCheckRequest(scanRoots, requestOptions);
      const grit = yield* GritProvider;
      const nativeRequest = nativeGritCheckRequestFromProcessRequest({
        request: processRequest,
        commandFamily: nativeCommandFamilyForGritCheck(options),
        outputContract: nativeOutputContractForGritCheck(options),
        cacheRequirement,
      });
      const result = yield* grit
        .check({
          scanRoots,
          cacheDir: requestOptions.cacheDir,
          observableCacheStatus: requestOptions.observableCacheStatus,
          outputFormat: requestOptions.outputFormat,
        })
        .pipe(
          Effect.catchTag("CommandInterrupted", (error) =>
            Effect.succeed(interruptedGritResult(processRequest, error))
          ),
          Effect.mapError((error) => gritToolUnavailable(processRequest, error))
        );
      if (
        options.requireObservableCacheStatus &&
        !diagnosticCacheRequirementSatisfied(
          cacheRequirement,
          diagnosticCacheObservationFromCommand(result, cacheRequirement)
        )
      ) {
        const cacheObservation = diagnosticCacheObservationFromCommand(result, cacheRequirement);
        const cacheFailure = diagnosticAdapterFailureForCacheObservation(cacheObservation);
        return {
          kind: "adapter-failed" as const,
          failure: cacheFailure ?? "GritCacheProvenanceMissing",
          parseStatus: "unsupported-mode" as const,
          message: "Grit cache/fresh status is not observable for this command result.",
          request: nativeRequest,
          command: diagnosticCommandObservationFromResult(result, cacheRequirement),
        };
      }
      return options.outputFormat === "text"
        ? parseGritCheckTextOutput(result, cacheRequirement, nativeRequest)
        : parseGritCheckOutput(result, cacheRequirement, nativeRequest);
    }).pipe(
      Effect.catchTag("GritToolUnavailable", (error) =>
        Effect.succeed({
          kind: "adapter-failed" as const,
          failure: "GritToolUnavailable" as const,
          parseStatus: "unparsed" as const,
          message: `Grit executable unavailable: ${error.executable}.`,
          request: nativeGritCheckRequestFromProcessRequest({
            request: {
              commandId: error.commandId,
              kind: "pattern-check",
              executable: error.executable,
              argv: error.argv,
              cwd: error.cwd,
              scanRoots,
            },
            commandFamily: nativeCommandFamilyForGritCheck(options),
            outputContract: nativeOutputContractForGritCheck(options),
            cacheRequirement: diagnosticCacheRequirementForGritCheck({
              cacheMode: options.cacheMode,
              requireObservableCacheStatus: options.requireObservableCacheStatus,
            }),
          }),
          command: diagnosticToolUnavailableObservation({
            commandId: error.commandId,
            executable: error.executable,
            argv: error.argv,
            scanRoots,
            cause: error.cause,
          }),
        })
      )
    )
  );
}

function interruptedGritResult(request: HabitatProcessRequest, error: CommandInterrupted) {
  return makeHabitatCommandResult(request, {
    requestedExecutable: request.executable,
    exit: { code: 130, signal: error.signal, interrupted: true },
    stderr: captureOutput(`${error.cause}\n`),
    failureTag: "GritCommandFailed",
  });
}

function gritToolUnavailable(
  request: HabitatProcessRequest,
  error: CommandUnavailable | CommandFailed | FileWriteFailed
) {
  if (error._tag === "FileWriteFailed") {
    return new GritToolUnavailable({
      commandId: request.commandId,
      executable: request.executable,
      argv: request.argv,
      cwd: request.cwd,
      cause: `cache resource unavailable at ${error.path}: ${error.cause}`,
    });
  }
  if (error._tag === "CommandFailed") {
    return new GritToolUnavailable({
      commandId: error.commandId,
      executable: error.executable,
      argv: error.argv,
      cwd: error.cwd,
      cause: `command exited ${error.exitCode}: ${error.stderr}`,
    });
  }
  return new GritToolUnavailable({
    commandId: error.commandId,
    executable: error.executable || request.executable,
    argv: error.argv.length > 0 ? error.argv : request.argv,
    cwd: error.cwd || request.cwd,
    cause: error.cause,
  });
}

function nativeCommandFamilyForGritCheck(
  options: GritCheckOptions
): "current-tree-json-check" | "docs-text-check" {
  if (options.outputFormat === "text") return "docs-text-check";
  return "current-tree-json-check";
}

function nativeOutputContractForGritCheck(
  options: GritCheckOptions
): "json-report" | "standard-text-report" {
  return options.outputFormat === "text" ? "standard-text-report" : "json-report";
}

export { gritCheckRequest };

function acquireGritCheckCacheDir() {
  return acquireTempDirectory("habitat-pattern-check-");
}
