import path from "node:path";
import type { FileSystem } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { GitStateProvider } from "@habitat/cli/providers/git/index";
import { type CommandProviderError, CommandRunner } from "@habitat/cli/resources/command/index";
import type {
  HabitatCommandResult,
  HabitatProcessRequest,
} from "@habitat/cli/resources/command/types";
import type { HabitatConfig } from "@habitat/cli/resources/config/index";
import { FileWriteFailed } from "@habitat/cli/resources/errors/index";
import {
  acquireTempDirectory,
  ensurePatternCacheRoot,
} from "@habitat/cli/resources/platform/index";
import type { RuleRunResult } from "@habitat/cli/service/model/diagnostics/policy/rule-runtime/architecture.policy";
import type { RuleSourceFacts } from "@habitat/cli/service/model/rules/index";
import { Context, Effect, Layer } from "effect";
import { defaultGritCommandTimeoutMs, gritBin } from "./constants.js";
import { gritMachineOutputEnv } from "./env.js";
import { runGritRulesEffect } from "./runner.js";

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
  cwd?: string;
  cacheDir?: string;
  gritDir?: string;
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
  readonly runRules: (
    selectedRules: readonly RuleSourceFacts[],
    options: { readonly repoRoot: string; readonly scanRoots?: readonly string[] }
  ) => Effect.Effect<Map<string, RuleRunResult>, never, GritProviderRequirements>;
}

export class GritProvider extends Context.Tag("@habitat/cli/GritProvider")<
  GritProvider,
  GritProviderService
>() {}

export function makeGritProviderLayer(repoRoot: string): Layer.Layer<GritProvider> {
  return Layer.succeed(GritProvider, makeLiveGritProvider(repoRoot));
}

export function makeFakeGritProviderLayer(
  handler: (
    request: HabitatProcessRequest,
    providerRequest: GritProviderCommandRequest
  ) => HabitatCommandResult,
  options: { readonly repoRoot?: string } = {}
) {
  return Layer.succeed(GritProvider, makeFakeGritProviderService(handler, options));
}

export function makeFakeGritProviderService(
  handler: (
    request: HabitatProcessRequest,
    providerRequest: GritProviderCommandRequest
  ) => HabitatCommandResult,
  options: { readonly repoRoot?: string } = {}
): GritProviderService {
  const repoRoot = options.repoRoot ?? ".";
  const provider: GritProviderService = {
    check: (request) =>
      Effect.sync(() => {
        const prepared = fakePreparedCacheRequest(request, repoRoot);
        return handler(gritProviderCheckRequest(repoRoot, prepared), {
          kind: "check",
          ...prepared,
        });
      }),
    checkRequest: (request) => gritProviderCheckRequest(repoRoot, request),
    applyDryRun: (request) =>
      Effect.sync(() => {
        const prepared = fakePreparedCacheRequest(request, repoRoot);
        return handler(gritProviderApplyDryRunRequest(repoRoot, prepared), {
          kind: "apply-dry-run",
          ...prepared,
        });
      }),
    applyDryRunRequest: (request) => gritProviderApplyDryRunRequest(repoRoot, request),
    runRules: (selectedRules, runOptions) =>
      runGritRulesEffect(selectedRules, { ...runOptions, grit: provider }),
  };
  return provider;
}

function fakePreparedCacheRequest<T extends { cacheMode?: string; cacheDir?: string }>(
  request: T,
  repoRoot: string
): T {
  if (request.cacheMode !== "fresh" || request.cacheDir) return request;
  return {
    ...request,
    cacheDir: path.join(repoRoot, ".habitat", "cache", "habitat-pattern-check-fake"),
  } as T;
}

function makeLiveGritProvider(repoRoot: string): GritProviderService {
  const provider: GritProviderService = {
    check: (request) =>
      Effect.scoped(
        Effect.gen(function* () {
          const prepared = yield* prepareCacheRequest(request);
          const runner = yield* CommandRunner;
          return yield* runner.run(gritProviderCheckRequest(repoRoot, prepared));
        })
      ),
    checkRequest: (request) => gritProviderCheckRequest(repoRoot, request),
    applyDryRun: (request) =>
      Effect.scoped(
        Effect.gen(function* () {
          const prepared = yield* prepareCacheRequest(request);
          const runner = yield* CommandRunner;
          return yield* runner.run(gritProviderApplyDryRunRequest(repoRoot, prepared));
        })
      ),
    applyDryRunRequest: (request) => gritProviderApplyDryRunRequest(repoRoot, request),
    runRules: (selectedRules, options) =>
      runGritRulesEffect(selectedRules, { ...options, grit: provider }),
  };
  return provider;
}

export function gritCheckRequest(
  scanRoots: readonly string[],
  options: {
    repoRoot: string;
    cwd?: string;
    cacheDir?: string;
    gritDir?: string;
    outputFormat?: "json" | "text";
    timeoutMs?: number;
    observableCacheStatus?: "unknown" | "fresh" | "cache-hit" | "replay";
  }
): HabitatProcessRequest {
  const { repoRoot } = options;
  const cacheDir = options.cacheDir ?? path.join(repoRoot, ".habitat", "cache", "patterns");
  return {
    commandId: "pattern-check-current-tree",
    kind: "pattern-check",
    executable: path.join(repoRoot, "node_modules", ".bin", gritBin),
    argv:
      options.outputFormat === "text"
        ? [
            "check",
            "--level",
            "error",
            ...(options.gritDir ? ["--grit-dir", options.gritDir] : []),
            ...scanRoots,
          ]
        : [
            "--json",
            "check",
            "--level",
            "error",
            ...(options.gritDir ? ["--grit-dir", options.gritDir] : []),
            ...scanRoots,
          ],
    cwd: options.cwd ?? repoRoot,
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

function gritProviderCheckRequest(
  repoRoot: string,
  request: GritCheckProviderRequest
): HabitatProcessRequest {
  return gritCheckRequest(request.scanRoots, {
    repoRoot,
    cwd: request.cwd,
    cacheDir: request.cacheDir,
    gritDir: request.gritDir,
    observableCacheStatus: request.observableCacheStatus,
    outputFormat: request.outputFormat,
    timeoutMs: request.timeoutMs,
  });
}

export function gritApplyDryRunRequest(
  repoRoot: string,
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
    executable: path.join(repoRoot, "node_modules", ".bin", gritBin),
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
  repoRoot: string,
  request: GritApplyDryRunProviderRequest
): HabitatProcessRequest {
  return gritApplyDryRunRequest(repoRoot, request);
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
