import path from "node:path";
import type { FileSystem } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { GitStateProvider } from "@internal/habitat-harness/providers/git/index";
import {
  type CommandProviderError,
  CommandRunner,
} from "@internal/habitat-harness/resources/command/index";
import type {
  HabitatCommandResult,
  HabitatProcessRequest,
} from "@internal/habitat-harness/resources/command/types";
import type { HabitatConfig } from "@internal/habitat-harness/resources/config/index";
import { FileWriteFailed } from "@internal/habitat-harness/resources/errors/index";
import { repoRoot } from "@internal/habitat-harness/resources/paths";
import {
  acquireTempDirectory,
  ensurePatternCacheRoot,
} from "@internal/habitat-harness/resources/platform/index";
import { Context, Effect, Layer } from "effect";
import { defaultGritCommandTimeoutMs, gritBin } from "./constants.js";
import { gritMachineOutputEnv } from "./env.js";

export type GritProviderRequirements =
  | CommandExecutor
  | HabitatConfig
  | FileSystem.FileSystem
  | CommandRunner
  | GitStateProvider;

export interface GritCheckProviderRequest {
  scanRoots: readonly string[];
  outputFormat?: "json" | "text";
  cacheMode?: "fresh" | "isolated";
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
      Effect.sync(() => {
        const prepared = fakePreparedCacheRequest(request);
        return handler(gritProviderCheckRequest(prepared), { kind: "check", ...prepared });
      }),
    checkRequest: gritProviderCheckRequest,
    applyDryRun: (request) =>
      Effect.sync(() => {
        const prepared = fakePreparedCacheRequest(request);
        return handler(gritProviderApplyDryRunRequest(prepared), {
          kind: "apply-dry-run",
          ...prepared,
        });
      }),
    applyDryRunRequest: gritProviderApplyDryRunRequest,
  });
}

function fakePreparedCacheRequest<T extends { cacheMode?: string; cacheDir?: string }>(
  request: T
): T {
  if (request.cacheMode !== "fresh" || request.cacheDir) return request;
  return {
    ...request,
    cacheDir: path.join(repoRoot, ".habitat", "cache", "habitat-pattern-check-fake"),
  } as T;
}

function makeLiveGritProvider(): GritProviderService {
  return {
    check: (request) =>
      Effect.scoped(
        Effect.gen(function* () {
          const prepared = yield* prepareCacheRequest(request);
          const runner = yield* CommandRunner;
          return yield* runner.run(gritProviderCheckRequest(prepared));
        })
      ),
    checkRequest: gritProviderCheckRequest,
    applyDryRun: (request) =>
      Effect.scoped(
        Effect.gen(function* () {
          const prepared = yield* prepareCacheRequest(request);
          const runner = yield* CommandRunner;
          return yield* runner.run(gritProviderApplyDryRunRequest(prepared));
        })
      ),
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

function prepareCacheRequest<
  T extends { cacheMode?: "disabled" | "fresh" | "isolated"; cacheDir?: string },
>(request: T) {
  if (request.cacheMode === "disabled") return Effect.succeed(request);
  if (request.cacheDir) return Effect.succeed(request);
  if (request.cacheMode === "fresh") {
    return acquireTempDirectory("habitat-pattern-check-").pipe(
      Effect.map((cacheDir) => ({
        ...request,
        cacheDir,
      })),
      Effect.mapError(
        (cause) =>
          new FileWriteFailed({
            path: "habitat-pattern-check-*",
            cause: cause instanceof Error ? cause.message : String(cause),
          })
      )
    );
  }
  return ensurePatternCacheRoot().pipe(
    Effect.map((cacheDir) => ({
      ...request,
      cacheDir,
    }))
  );
}
