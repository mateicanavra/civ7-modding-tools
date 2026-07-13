import path from "node:path";
import { FileSystem } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { GitStateProvider } from "@habitat/cli/providers/git/index";
import {
  CommandFailed,
  CommandInterrupted,
  CommandRunner,
  type CommandRunnerService,
  CommandUnavailable,
} from "@habitat/cli/resources/command/index";
import type {
  HabitatCommandResult,
  HabitatProcessRequest,
} from "@habitat/cli/resources/command/types";
import type { HabitatConfig } from "@habitat/cli/resources/config/index";
import type { DiagnosticSelectedScanRoots } from "@habitat/cli/service/model/diagnostics/index";
import type { RuleSourceFacts } from "@habitat/cli/service/model/rules/index";
import { Context, Effect, Layer, Match } from "effect";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import { defaultGritCommandTimeoutMs } from "./constants.js";
import { gritHermeticEnv } from "./env.js";
import {
  nativeIdentityMismatchBeforeSpawn,
  nativeIdentityMismatchFromCompleted,
} from "./request.js";
import { runGritRulesEffect } from "./runner.js";
import { parseGritJsonText } from "./types.js";

const pinnedGritIdentity = {
  packageVersion: "0.1.0-alpha.1743007075",
  nativeVersion: "grit 0.1.1",
} as const;

export type GritProviderRequirements =
  | CommandExecutor
  | HabitatConfig
  | FileSystem.FileSystem
  | CommandRunner
  | GitStateProvider;

export interface GritCheckProviderRequest {
  readonly scanRoots: Readonly<DiagnosticSelectedScanRoots>;
  readonly cwd: string;
  readonly gritDir: string;
  readonly cacheDir: string;
  readonly gritUserConfigDir: string;
  readonly timeoutMs?: number;
}

export interface GritApplyDryRunProviderRequest {
  readonly commandId: string;
  readonly patternPath: string;
  readonly scanRoots: Readonly<DiagnosticSelectedScanRoots>;
  readonly output: "compact" | "standard";
  readonly serialization?: "standard" | "jsonl";
  readonly cacheMode?: "disabled" | "isolated";
  readonly cwd?: string;
  readonly cacheDir?: string;
  readonly gritUserConfigDir?: string;
  readonly timeoutMs?: number;
}

export type GritProviderCommandRequest =
  | ({ readonly kind: "check" } & GritCheckProviderRequest)
  | ({ readonly kind: "apply-dry-run" } & GritApplyDryRunProviderRequest);

export interface GritProviderService {
  readonly check: (request: GritCheckProviderRequest) => ReturnType<typeof runLiveRequest>;
  readonly checkRequest: (request: GritCheckProviderRequest) => HabitatProcessRequest;
  readonly applyDryRun: (
    request: GritApplyDryRunProviderRequest
  ) => ReturnType<typeof runLiveRequest>;
  readonly applyDryRunRequest: (request: GritApplyDryRunProviderRequest) => HabitatProcessRequest;
  readonly runRules: (
    selectedRules: readonly RuleSourceFacts[],
    options: { readonly repoRoot: string; readonly scanRoots?: readonly string[] }
  ) => ReturnType<typeof runGritRulesEffect>;
}

export class GritProvider extends Context.Tag("@habitat/cli/GritProvider")<
  GritProvider,
  GritProviderService
>() {}

export function makeGritProviderLayer(repoRoot: string) {
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
    check: (request) => {
      const command = gritCheckRequest(repoRoot, request);
      return Effect.try({
        try: () => handler(command, { kind: "check", ...request }),
        catch: (error) => preflightUnavailable(command, String(error)),
      });
    },
    checkRequest: (request) => gritCheckRequest(repoRoot, request),
    applyDryRun: (request) => {
      const command = gritApplyDryRunRequest(repoRoot, request);
      return Effect.try({
        try: () => handler(command, { kind: "apply-dry-run", ...request }),
        catch: (error) => preflightUnavailable(command, String(error)),
      });
    },
    applyDryRunRequest: (request) => gritApplyDryRunRequest(repoRoot, request),
    runRules: (selectedRules, runOptions) =>
      runGritRulesEffect(selectedRules, { ...runOptions, grit: provider }),
  };
  return provider;
}

function makeLiveGritProvider(repoRoot: string): GritProviderService {
  const provider: GritProviderService = {
    check: (request) => runLiveRequest(repoRoot, gritCheckRequest(repoRoot, request)),
    checkRequest: (request) => gritCheckRequest(repoRoot, request),
    applyDryRun: (request) => runLiveRequest(repoRoot, gritApplyDryRunRequest(repoRoot, request)),
    applyDryRunRequest: (request) => gritApplyDryRunRequest(repoRoot, request),
    runRules: (selectedRules, options) =>
      runGritRulesEffect(selectedRules, { ...options, grit: provider }),
  };
  return provider;
}

const runLiveRequest = Effect.fn("grit.live.run")(function* (
  repoRoot: string,
  request: HabitatProcessRequest
) {
  const runner = yield* CommandRunner;
  yield* preflightPinnedGritEffect(
    repoRoot,
    runner.run,
    effectiveGritCommandTimeoutMs(request.timeoutMs)
  );
  return yield* runner.run(request);
});

export function pinnedGritNativePath(repoRoot: string): string {
  return path.join(
    repoRoot,
    "node_modules",
    "@getgrit",
    "cli",
    "node_modules",
    ".bin_real",
    "grit"
  );
}

export function gritCheckRequest(
  repoRoot: string,
  request: GritCheckProviderRequest
): HabitatProcessRequest {
  return {
    commandId: "grit-selected-rule-json-check",
    kind: "pattern-check",
    executable: pinnedGritNativePath(repoRoot),
    argv: [
      "--json",
      "check",
      "--level",
      "error",
      "--no-cache",
      "--grit-dir",
      request.gritDir,
      ...request.scanRoots,
    ],
    cwd: request.cwd,
    env: {
      ...gritHermeticEnv,
      GRIT_CACHE_DIR: request.cacheDir,
      GRIT_USER_CONFIG: request.gritUserConfigDir,
    },
    scanRoots: request.scanRoots,
    timeoutMs: effectiveGritCommandTimeoutMs(request.timeoutMs),
    captureGitState: false,
    cachePolicy: {
      mode: "isolated",
      cacheDir: request.cacheDir,
      observableStatus: "fresh",
    },
  };
}

export function gritApplyDryRunRequest(
  repoRoot: string,
  request: GritApplyDryRunProviderRequest
): HabitatProcessRequest {
  const cacheMode = request.cacheMode ?? "disabled";
  const cacheEnv = Match.value(request.cacheDir).pipe(
    Match.when(undefined, () => ({})),
    Match.orElse((cacheDir) => ({ GRIT_CACHE_DIR: cacheDir }))
  );
  const userConfigEnv = Match.value(request.gritUserConfigDir).pipe(
    Match.when(undefined, () => ({})),
    Match.orElse((userConfigDir) => ({ GRIT_USER_CONFIG: userConfigDir }))
  );
  const capturePolicy = Match.value(request.serialization).pipe(
    Match.when("jsonl", () => ({ captureGitState: false as const })),
    Match.orElse(() => ({}))
  );
  const observableStatus = Match.value(request.cacheDir).pipe(
    Match.when(undefined, () => "unknown" as const),
    Match.orElse(() => "fresh" as const)
  );
  return {
    commandId: request.commandId,
    kind: "pattern-apply",
    executable: pinnedGritNativePath(repoRoot),
    argv: [
      ...Match.value(request.serialization).pipe(
        Match.when("jsonl", () => ["--jsonl"]),
        Match.orElse(() => [])
      ),
      "apply",
      request.patternPath,
      ...request.scanRoots,
      "--dry-run",
      "--force",
      "--output",
      request.output,
    ],
    cwd: request.cwd ?? repoRoot,
    env: {
      ...gritHermeticEnv,
      ...cacheEnv,
      ...userConfigEnv,
    },
    scanRoots: request.scanRoots,
    timeoutMs: effectiveGritCommandTimeoutMs(request.timeoutMs),
    ...capturePolicy,
    cachePolicy: {
      mode: cacheMode,
      cacheDir: request.cacheDir,
      observableStatus,
    },
  };
}

const GritPackageSchema = Type.Object(
  { version: Type.Literal(pinnedGritIdentity.packageVersion) },
  { additionalProperties: true }
);
type GritPackage = Static<typeof GritPackageSchema>;

const preflightPinnedGritEffect = Effect.fn("grit.native.preflight")(function* (
  repoRoot: string,
  run: CommandRunnerService["run"],
  timeoutMs: number
) {
  const executable = pinnedGritNativePath(repoRoot);
  const packagePath = path.join(repoRoot, "node_modules", "@getgrit", "cli", "package.json");
  const preflightRequest: HabitatProcessRequest = {
    commandId: "grit-pinned-native-preflight",
    kind: "pattern-check",
    executable,
    argv: ["--version"],
    cwd: repoRoot,
    env: gritHermeticEnv,
    scanRoots: [],
    timeoutMs,
    captureGitState: false,
    cachePolicy: { mode: "disabled", observableStatus: "unknown" },
  };
  const fs = yield* FileSystem.FileSystem;
  const packageSource = yield* fs
    .readFileString(packagePath)
    .pipe(Effect.mapError((error) => preflightUnavailable(preflightRequest, String(error))));
  const packageJson = yield* parsePinnedPackage(packageSource, preflightRequest);
  yield* Effect.succeed(packageJson satisfies GritPackage);
  const result = yield* run(preflightRequest);
  const completed = yield* classifyPreflightExecution(result);
  const validIdentity = !(
    result.stdout.truncated ||
    result.stderr.truncated ||
    result.stderr.text.trim().length > 0 ||
    result.stdout.text.trim() !== pinnedGritIdentity.nativeVersion
  );
  const observedVersion = Match.value(result.stdout.text.trim()).pipe(
    Match.when("", () => "no version"),
    Match.orElse((version) => version)
  );
  return yield* Effect.succeed(completed).pipe(
    Effect.filterOrFail(
      () => validIdentity,
      () =>
        nativeIdentityMismatchFromCompleted(
          completed,
          `Pinned Grit preflight expected completed exit 0 with ${pinnedGritIdentity.nativeVersion}, observed exit ${result.exit.code} with ${observedVersion}.`
        )
    )
  );
});

const classifyPreflightExecution = Effect.fn("grit.native.preflight.classify")(function* (
  result: HabitatCommandResult
) {
  return yield* Match.value({
    interrupted: result.exit.interrupted,
    nonzero: result.exit.code !== 0,
  }).pipe(
    Match.when({ interrupted: true }, () =>
      Effect.fail(
        new CommandInterrupted({
          commandId: result.commandId,
          executable: result.executable,
          argv: result.argv,
          cwd: result.cwd,
          signal: result.exit.signal ?? "unknown",
          cause: "Pinned Grit preflight was interrupted.",
        })
      )
    ),
    Match.when({ nonzero: true }, () =>
      Effect.fail(
        new CommandFailed({
          commandId: result.commandId,
          executable: result.executable,
          argv: result.argv,
          cwd: result.cwd,
          exitCode: result.exit.code,
          stderr: result.stderr.text,
        })
      )
    ),
    Match.orElse(() => Effect.succeed(result))
  );
});

const parsePinnedPackage = Effect.fn("grit.package.decode")(function* (
  source: string,
  request: HabitatProcessRequest
) {
  return yield* Effect.try({
    try: () => Value.Parse(GritPackageSchema, parseGritJsonText(source)),
    catch: (error) =>
      nativeIdentityMismatchBeforeSpawn(
        request,
        `Grit package identity mismatch: ${String(error)}.`
      ),
  });
});

function preflightUnavailable(request: HabitatProcessRequest, cause: string): CommandUnavailable {
  return new CommandUnavailable({
    commandId: request.commandId,
    executable: request.executable,
    argv: request.argv,
    cwd: request.cwd,
    cause,
  });
}

function effectiveGritCommandTimeoutMs(timeoutMs: number | undefined): number {
  return Match.value(timeoutMs).pipe(
    Match.when(
      (candidate): candidate is number => candidate !== undefined && candidate > 0,
      (candidate) => candidate
    ),
    Match.orElse(() => defaultGritCommandTimeoutMs)
  );
}
