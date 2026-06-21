import path from "node:path";
import type { FileSystem } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import { Context, Effect, Layer } from "effect";
import type { HabitatConfig } from "../../../config/index.js";
import type { FileWriteFailed } from "../../../errors/index.js";
import { repoRoot } from "../../../lib/paths.js";
import { type CommandProviderError, CommandRunner } from "../../../providers/command/index.js";
import type {
  HabitatCommandResult,
  HabitatProcessRequest,
} from "../../../providers/command/types.js";
import { ensurePatternCacheRoot } from "../../../resources/index.js";
import {
  defaultGritCommandTimeoutMs,
  docsLocalCheckoutPathsRewritePattern,
  gritBin,
} from "./constants.js";
import { gritMachineOutputEnv } from "./env.js";

export type GritProviderRequirements =
  | CommandExecutor
  | HabitatConfig
  | FileSystem.FileSystem
  | CommandRunner;

export interface GritCheckProviderRequest {
  scanRoots: readonly string[];
  outputFormat?: "json" | "text";
  cacheDir?: string;
  timeoutMs?: number;
  observableCacheStatus?: "unknown" | "fresh" | "cache-hit" | "replay";
}

export interface GritApplyDryRunProviderRequest {
  commandId: string;
  patternPath: string;
  scanRoots: readonly string[];
  output: "compact" | "standard";
  cacheMode?: "disabled" | "isolated";
  cacheDir?: string;
  timeoutMs?: number;
  observableCacheStatus?: "unknown" | "fresh" | "cache-hit" | "replay";
}

export type GritProviderCommandRequest =
  | ({ readonly kind: "check" } & GritCheckProviderRequest)
  | ({ readonly kind: "apply-dry-run" } & GritApplyDryRunProviderRequest);

export interface GritProviderService {
  readonly check: (
    request: GritCheckProviderRequest
  ) => Effect.Effect<
    HabitatCommandResult,
    CommandProviderError | FileWriteFailed,
    GritProviderRequirements
  >;
  readonly checkRequest: (request: GritCheckProviderRequest) => HabitatProcessRequest;
  readonly applyDryRun: (
    request: GritApplyDryRunProviderRequest
  ) => Effect.Effect<
    HabitatCommandResult,
    CommandProviderError | FileWriteFailed,
    GritProviderRequirements
  >;
  readonly applyDryRunRequest: (request: GritApplyDryRunProviderRequest) => HabitatProcessRequest;
}

export class GritProvider extends Context.Tag("@internal/habitat-harness/GritProvider")<
  GritProvider,
  GritProviderService
>() {}

export const GritProviderLive = Layer.succeed(GritProvider, makeLiveGritProvider());

export function makeFakeGritProviderLayer(
  handler: (
    request: HabitatProcessRequest,
    providerRequest: GritProviderCommandRequest
  ) => HabitatCommandResult
) {
  return Layer.succeed(GritProvider, {
    check: (request) =>
      Effect.sync(() => handler(gritProviderCheckRequest(request), { kind: "check", ...request })),
    checkRequest: gritProviderCheckRequest,
    applyDryRun: (request) =>
      Effect.sync(() =>
        handler(gritProviderApplyDryRunRequest(request), { kind: "apply-dry-run", ...request })
      ),
    applyDryRunRequest: gritProviderApplyDryRunRequest,
  });
}

function makeLiveGritProvider(): GritProviderService {
  return {
    check: (request) =>
      Effect.gen(function* () {
        const prepared = yield* prepareCacheRequest(request);
        const runner = yield* CommandRunner;
        return yield* runner.run(gritProviderCheckRequest(prepared));
      }),
    checkRequest: gritProviderCheckRequest,
    applyDryRun: (request) =>
      Effect.gen(function* () {
        const prepared = yield* prepareCacheRequest(request);
        const runner = yield* CommandRunner;
        return yield* runner.run(gritProviderApplyDryRunRequest(prepared));
      }),
    applyDryRunRequest: gritProviderApplyDryRunRequest,
  };
}

export function gritCheckRequest(
  scanRoots: readonly string[],
  options: {
    cacheDir?: string;
    outputFormat?: "json" | "text";
    timeoutMs?: number;
    observableCacheStatus?: "unknown" | "fresh" | "cache-hit" | "replay";
  } = {}
): HabitatProcessRequest {
  const cacheDir = options.cacheDir ?? path.join(repoRoot, ".habitat", "cache", "patterns");
  return {
    commandId: "pattern-check-current-tree",
    kind: "pattern-check",
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
    timeoutMs: options.timeoutMs ?? defaultGritCommandTimeoutMs,
    cachePolicy: {
      mode: "isolated",
      cacheDir,
      observableStatus: options.observableCacheStatus ?? "unknown",
    },
  };
}

function gritProviderCheckRequest(request: GritCheckProviderRequest): HabitatProcessRequest {
  return gritCheckRequest(request.scanRoots, {
    cacheDir: request.cacheDir,
    observableCacheStatus: request.observableCacheStatus,
    outputFormat: request.outputFormat,
    timeoutMs: request.timeoutMs,
  });
}

export function gritApplyDryRunRequest(
  request: GritApplyDryRunProviderRequest
): HabitatProcessRequest {
  const cacheMode = request.cacheMode ?? "disabled";
  const cacheDir =
    cacheMode === "isolated"
      ? (request.cacheDir ?? path.join(repoRoot, ".habitat", "cache", "patterns"))
      : request.cacheDir;
  return {
    commandId: request.commandId,
    kind: "pattern-apply",
    executable: gritBin,
    argv: [
      "apply",
      request.patternPath,
      ...request.scanRoots,
      "--dry-run",
      "--force",
      "--output",
      request.output,
    ],
    cwd: repoRoot,
    timeoutMs: request.timeoutMs ?? defaultGritCommandTimeoutMs,
    env: {
      ...gritMachineOutputEnv,
      ...(cacheDir
        ? {
            GRIT_CACHE_DIR: cacheDir,
            GRIT_TELEMETRY_DISABLED: "true",
          }
        : {}),
    },
    scanRoots: request.scanRoots,
    cachePolicy: {
      mode: cacheMode,
      cacheDir,
      observableStatus: request.observableCacheStatus ?? "unknown",
    },
  };
}

function gritProviderApplyDryRunRequest(
  request: GritApplyDryRunProviderRequest
): HabitatProcessRequest {
  return gritApplyDryRunRequest(request);
}

function prepareCacheRequest<T extends { cacheMode?: "disabled" | "isolated"; cacheDir?: string }>(
  request: T
) {
  if (request.cacheMode === "disabled") return Effect.succeed(request);
  if (request.cacheDir) return Effect.succeed(request);
  return ensurePatternCacheRoot().pipe(
    Effect.map((cacheDir) => ({
      ...request,
      cacheDir,
    }))
  );
}
