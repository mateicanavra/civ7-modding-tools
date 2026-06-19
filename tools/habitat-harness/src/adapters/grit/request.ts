import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
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
} from "../../lib/diagnostic-catalog/index.js";
import { gritMachineOutputEnv } from "../../lib/grit-env.js";
import {
  GritToolUnavailable,
  HabitatProcess,
  type HabitatProcessRequest,
} from "../../lib/habitat-process.js";
import { repoRoot } from "../../lib/paths.js";
import { gritBin } from "./constants.js";
import { parseGritCheckOutput, parseGritCheckTextOutput } from "./output/index.js";
import { decideGritScanRoots } from "./scan-roots/index.js";
import type { GritCheckOptions, GritCheckRequestOptions } from "./types.js";

export function gritCheckProgram(scanRoots: readonly string[], options: GritCheckOptions = {}) {
  return Effect.scoped(
    Effect.gen(function* () {
      const scanRootDecision = decideGritScanRoots(scanRoots, {
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
      const process = yield* HabitatProcess;
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
      const nativeRequest = nativeGritCheckRequestFromProcessRequest({
        request: processRequest,
        commandFamily: nativeCommandFamilyForGritCheck(options),
        outputContract: nativeOutputContractForGritCheck(options),
        cacheRequirement,
      });
      const result = yield* process.run(processRequest).pipe(
        Effect.catchTag("GritToolUnavailable", (error) =>
          Effect.fail(
            new GritToolUnavailable({
              commandId: error.commandId,
              executable: error.executable,
              argv: error.argv,
              cwd: error.cwd,
              cause: error.cause,
            })
          )
        )
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
              kind: "grit-check",
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

export function gritCheckRequest(
  scanRoots: readonly string[],
  options: GritCheckRequestOptions = {}
): HabitatProcessRequest {
  const cacheDir = options.cacheDir ?? path.join(repoRoot, ".grit", "cache");
  mkdirSync(cacheDir, { recursive: true });
  return {
    commandId: "grit-check-current-tree",
    kind: "grit-check",
    executable: gritBin,
    argv:
      options.outputFormat === "text"
        ? ["check", "--level", "error", ...scanRoots]
        : ["--json", "check", "--level", "error", ...scanRoots],
    cwd: repoRoot,
    env: {
      ...gritMachineOutputEnv,
      GRIT_CACHE_DIR: cacheDir,
      GRIT_TELEMETRY_DISABLED: "true",
    },
    scanRoots,
    cachePolicy: {
      mode: "isolated",
      cacheDir,
      observableStatus: options.observableCacheStatus ?? "unknown",
    },
  };
}

function acquireGritCheckCacheDir() {
  return Effect.acquireRelease(
    Effect.sync(() => mkdtempSync(path.join(tmpdir(), "habitat-grit-check-"))),
    (cacheDir) => Effect.sync(() => rmSync(cacheDir, { recursive: true, force: true }))
  );
}
