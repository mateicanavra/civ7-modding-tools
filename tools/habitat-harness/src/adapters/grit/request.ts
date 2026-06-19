import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Effect } from "effect";
import { gritMachineOutputEnv } from "../../lib/grit-env.js";
import {
  GritToolUnavailable,
  HabitatProcess,
  type HabitatProcessRequest,
} from "../../lib/habitat-process.js";
import { repoRoot } from "../../lib/paths.js";
import { gritBin } from "./constants.js";
import { parseGritCheckOutput, parseGritCheckTextOutput } from "./output/index.js";
import { validateScanRoots } from "./scan-roots/index.js";
import type { GritCheckOptions, GritCheckRequestOptions } from "./types.js";

export function gritCheckProgram(scanRoots: readonly string[], options: GritCheckOptions = {}) {
  return Effect.scoped(
    Effect.gen(function* () {
      const emptyRootFailure = validateScanRoots(scanRoots, {
        allowInjectedProbeRoot: options.allowInjectedProbeRoot,
        allowDocsRoot: options.allowDocsRoot,
      });
      if (emptyRootFailure) {
        return {
          ok: false as const,
          failureTag: "GritEmptyScanRoots" as const,
          parseStatus: "unsupported-mode" as const,
          message: emptyRootFailure,
        };
      }
      const process = yield* HabitatProcess;
      const requestOptions =
        options.cacheMode === "fresh"
          ? {
              cacheDir: yield* acquireGritCheckCacheDir(),
              observableCacheStatus: "fresh" as const,
              outputFormat: options.outputFormat,
            }
          : { outputFormat: options.outputFormat };
      const result = yield* process.run(gritCheckRequest(scanRoots, requestOptions)).pipe(
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
        result.cachePolicy.observableStatus === "unknown"
      ) {
        return {
          ok: false as const,
          failureTag: "GritCacheProvenanceMissing" as const,
          parseStatus: "unsupported-mode" as const,
          message: "Grit cache/fresh status is not observable for this command result.",
          commandResult: {
            ...result,
            parseStatus: "unsupported-mode" as const,
            failureTag: "GritCacheProvenanceMissing" as const,
          },
        };
      }
      return options.outputFormat === "text"
        ? parseGritCheckTextOutput(result)
        : parseGritCheckOutput(result);
    }).pipe(
      Effect.catchTag("GritToolUnavailable", (error) =>
        Effect.succeed({
          ok: false as const,
          failureTag: "GritToolUnavailable" as const,
          parseStatus: "unparsed" as const,
          message: `Grit executable unavailable: ${error.executable}.`,
        })
      )
    )
  );
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
    nonClaims: [
      "does-not-prove-injected-violation",
      "does-not-prove-baseline-shrink",
      "does-not-prove-apply-transaction",
      "does-not-prove-product-runtime",
    ],
  };
}

function acquireGritCheckCacheDir() {
  return Effect.acquireRelease(
    Effect.sync(() => mkdtempSync(path.join(tmpdir(), "habitat-grit-check-"))),
    (cacheDir) => Effect.sync(() => rmSync(cacheDir, { recursive: true, force: true }))
  );
}
