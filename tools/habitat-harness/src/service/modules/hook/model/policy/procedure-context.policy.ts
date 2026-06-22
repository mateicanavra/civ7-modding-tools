import type {
  CommandProviderError,
  HabitatCommandResult,
  SpawnResult,
} from "@internal/habitat-harness/resources/command/index";
import type {
  CheckOptions,
  CheckReport,
  HookCheckSummary,
} from "@internal/habitat-harness/service/model/check/index";
import type { RuleFactsCatalog } from "@internal/habitat-harness/service/model/rules/policy/catalog.policy";
import type { workspaceGraphTargetNames } from "@internal/habitat-harness/service/model/workspace/index";
import type { Effect } from "effect";
import type { PreCommitOutcome } from "../dto/hook.schema.js";
import type { HookCheckCommandResult } from "./check-command.policy.js";
import type { HookResourcePolicy } from "./runtime.policy.js";
import { createHookOutput } from "./runtime.policy.js";

export type HookRouterEffect<T> = Effect.Effect<T, never, any>;

export type HookProcedureContext = {
  readonly biome: HookBiomePort;
  readonly git: HookGitPort;
  readonly graphite: HookGraphitePort;
  readonly nx: HookNxPort;
  readonly platform: HookPlatformPort;
  readonly reporter: HookReporterPort;
  readonly rules: RuleFactsCatalog;
  readonly createCheckReport: (options?: CheckOptions) => HookRouterEffect<CheckReport>;
  readonly workspaceGraphTargetNames: typeof workspaceGraphTargetNames;
};

export interface HookBiomeCommandRequest {
  readonly kind: "format" | "check";
  readonly paths?: readonly string[];
  readonly write?: boolean;
  readonly noErrorsOnUnmatched?: boolean;
}

export interface HookBiomePort {
  readonly argv: (request: HookBiomeCommandRequest) => string[];
  readonly run: (
    request: HookBiomeCommandRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
}

export interface HookGitPort {
  readonly add: (
    paths: readonly string[],
    options?: { readonly cwd?: string }
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
  readonly command: (
    argv: readonly string[],
    options?: { readonly cwd?: string }
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
  readonly diffNameOnly: (input?: {
    readonly paths?: readonly string[];
    readonly cwd?: string;
  }) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
  readonly diffNameStatus: (input?: {
    readonly cached?: boolean;
    readonly cwd?: string;
  }) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
  readonly mergeBase: (
    ref: string,
    options?: { readonly cwd?: string }
  ) => Effect.Effect<string | null, never, any>;
  readonly remoteDefaultBranch: (options?: {
    readonly cwd?: string;
  }) => Effect.Effect<string | null, never, any>;
}

export interface HookGraphitePort {
  readonly parent: (options?: {
    readonly cwd?: string;
  }) => Effect.Effect<string | null, never, any>;
  readonly parentArgv: () => readonly string[];
}

export interface HookNxAffectedRequest {
  readonly base: string;
  readonly targets: readonly string[];
  readonly head?: string;
  readonly excludeTaskDependencies?: boolean;
}

export interface HookNxRunTargetRequest {
  readonly project: string;
  readonly target: string;
}

export interface HookNxPort {
  readonly affected: (
    request: HookNxAffectedRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
  readonly affectedArgv: (request: HookNxAffectedRequest) => string[];
  readonly runTarget: (
    request: HookNxRunTargetRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
  readonly runTargetArgv: (request: HookNxRunTargetRequest) => string[];
}

export interface HookPlatformPort {
  readonly hashFile: (filePath: string) => string | null;
  readonly pathExists: (targetPath: string) => boolean;
  readonly repoRoot: string;
}

type HookReportEvent =
  | { readonly kind: "stdout"; readonly text: string }
  | { readonly kind: "stderr"; readonly text: string }
  | { readonly kind: "trace"; readonly message: string };

export interface HookReporterPort {
  readonly emit: (event: HookReportEvent) => Effect.Effect<void>;
}

export type StagedHookCheckTool = "file-layer" | "source-check";

export type StagedHookCheckResult = SpawnResult & {
  readonly check: {
    readonly report: CheckReport;
    readonly summary: HookCheckSummary;
  };
};

export type HookOutput = ReturnType<typeof createHookOutput>;

export interface PreCommitState {
  readonly context: HookProcedureContext;
  readonly resourcePolicy?: HookResourcePolicy;
  readonly output: HookOutput;
  readonly staged: readonly string[];
}

export interface PreCommitBiomeState extends PreCommitState {
  readonly biomePaths: readonly string[];
  readonly beforeHashes: ReadonlyMap<string, string | null>;
}

export interface PreCommitSourceCheckState extends PreCommitState {
  readonly sourceCheckPaths: readonly string[];
}

export type PreCommitStep<T> =
  | { readonly kind: "done"; readonly outcome: PreCommitOutcome; readonly result: SpawnResult }
  | { readonly kind: "continue"; readonly state: T };

export type PrePushChangedPathsResult =
  | { readonly kind: "available"; readonly paths: readonly string[] }
  | { readonly kind: "unavailable"; readonly message: string };

export type PrePushBaseDecision =
  | {
      readonly kind: "resolved";
      readonly base: string;
      readonly source: "explicit" | "graphite-parent" | "merge-base";
    }
  | {
      readonly kind: "refused";
      readonly message: string;
    };

export type ParsedHookCheckResult = Extract<HookCheckCommandResult, { readonly kind: "parsed" }>;

export type PrePushHookSourceCheckResult = SpawnResult & ParsedHookCheckResult;

export type HookCommandRecordPhase =
  | "partial-staging"
  | "staged-paths"
  | "formatter-restage"
  | "biome-format"
  | "biome-check"
  | "pre-push-base"
  | "pre-push-target"
  | "pre-push-affected";

export const localHookNotice = "hook result: workstation check only; CI remains authoritative.\n";
