import { mkdirSync } from "node:fs";
import path from "node:path";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import { Context, Effect, Layer } from "effect";
import { defaultGritCommandTimeoutMs, gritBin } from "../../adapters/grit/constants.js";
import type { HabitatConfig } from "../../config/index.js";
import type { CommandProviderError } from "../../errors/index.js";
import { gritMachineOutputEnv } from "../../lib/grit-env.js";
import { repoRoot } from "../../lib/paths.js";
import type { HabitatClock } from "../../resources/index.js";
import { CommandRunner } from "../command/index.js";
import type { HabitatCommandResult, HabitatProcessRequest } from "../command/types.js";

type GritProviderRequirements = CommandExecutor | HabitatConfig | HabitatClock | CommandRunner;

export interface GritCheckProviderRequest {
  scanRoots: readonly string[];
  outputFormat?: "json" | "text";
  cacheDir?: string;
  timeoutMs?: number;
  observableCacheStatus?: "unknown" | "fresh" | "cache-hit" | "replay";
}

export interface GritProviderService {
  readonly check: (
    request: GritCheckProviderRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, GritProviderRequirements>;
  readonly checkRequest: (request: GritCheckProviderRequest) => HabitatProcessRequest;
}

export class GritProvider extends Context.Tag("@internal/habitat-harness/GritProvider")<
  GritProvider,
  GritProviderService
>() {}

export const GritProviderLive = Layer.succeed(GritProvider, makeLiveGritProvider());

export function makeFakeGritProviderLayer(
  handler: (request: GritCheckProviderRequest) => HabitatCommandResult
) {
  return Layer.succeed(GritProvider, {
    check: (request) => Effect.sync(() => handler(request)),
    checkRequest: gritProviderCheckRequest,
  });
}

function makeLiveGritProvider(): GritProviderService {
  return {
    check: (request) =>
      CommandRunner.pipe(Effect.flatMap((runner) => runner.run(gritProviderCheckRequest(request)))),
    checkRequest: gritProviderCheckRequest,
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
  mkdirSync(cacheDir, { recursive: true });
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
