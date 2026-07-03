import type {
  CommandProviderError,
  HabitatCommandResult,
  SpawnResult,
} from "@habitat/cli/resources/command/index";
import type {
  CheckOptions,
  CheckReport,
  HookCheckSummary,
  renderCheckReport,
} from "@habitat/cli/service/model/check/index";
import type { RuleFactsCatalog } from "@habitat/cli/service/model/rules/policy/catalog.policy";
import type { workspaceGraphTargetNames } from "@habitat/cli/service/model/workspace/index";
import type { Effect } from "effect";
import type { PreCommitOutcome } from "../dto/hook.schema.js";
import type { HookCheckCommandResult } from "./check-command.policy.js";
import type { finalizePreCommitEffect, finalizePrePushEffect } from "./lifecycle.policy.js";
import type { HookResourcePolicy } from "./runtime.policy.js";
import { createHookOutput, type hookNow, type section } from "./runtime.policy.js";

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

export type StagedHookCheckPhase = "file-layer" | "source-check";

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

// TODO: THIS IS COMPLETELY FUCKING WRONG. STOP FUCKING DISREGARDING MY NOTES. THIS, WHAT YOU ARE DOING HERE, MAKES NO SENSE AT ALL. THIS IS ALL ACTUAL ROUTER LOGIC FOR THE HOOK MODULE. STOP SMUGGLIGN THIS INTO POLICY. THIS IS NOT POLICY. THESE ARE LITERALY THE CORE OPERATIONS OF THE HOOK MODULE. STOP OUTSOURCING THE CORE LOGIC. STOP PRETENDING CORE LOGIC IS EXTERNAL TO THE MODULE. THE MODULE IS THE ENTIRE POINT.

export interface HookModuleContext {
  readonly lifecycle: {
    readonly finalizePreCommit: typeof finalizePreCommitEffect;
    readonly finalizePrePush: typeof finalizePrePushEffect;
  };
  readonly output: {
    readonly create: () => HookOutput;
    readonly localNotice: typeof localHookNotice;
    readonly renderCheckReport: typeof renderCheckReport;
    readonly result: (output: HookOutput, exitCode: number) => HookRouterEffect<SpawnResult>;
    readonly section: typeof section;
  };
  readonly preCommit: {
    readonly begin: (
      resourcePolicy: HookResourcePolicy | undefined
    ) => HookRouterEffect<PreCommitStep<PreCommitState>>;
    readonly continueAfterFileLayer: (
      state: PreCommitState,
      fileLayer: StagedHookCheckResult
    ) => HookRouterEffect<PreCommitStep<PreCommitBiomeState>>;
    readonly finish: (
      state: PreCommitSourceCheckState,
      sourceCheckResult: StagedHookCheckResult | undefined
    ) => HookRouterEffect<SpawnResult>;
    readonly runBiome: (
      state: PreCommitBiomeState
    ) => HookRouterEffect<PreCommitStep<PreCommitSourceCheckState>>;
    readonly stagedCheck: (
      phase: StagedHookCheckPhase,
      stagedPaths: readonly string[]
    ) => HookRouterEffect<StagedHookCheckResult>;
    readonly summaryAllowsNextStage: (result: HookCheckCommandResult) => boolean;
  };
  readonly prePush: {
    readonly affectedArgv: (request: HookNxAffectedRequest) => string[];
    readonly changedPaths: (base: string) => HookRouterEffect<PrePushChangedPathsResult>;
    readonly hookSourceCheck: (
      changedPaths: readonly string[]
    ) => HookRouterEffect<PrePushHookSourceCheckResult>;
    readonly hookSourceCheckPaths: (changedPaths: readonly string[]) => readonly string[];
    readonly recordCommand: (
      phase: HookCommandRecordPhase,
      argv: readonly string[],
      startedAtMs: number,
      exitCode: number
    ) => Effect.Effect<void>;
    readonly resolveBase: () => HookRouterEffect<PrePushBaseDecision>;
    readonly runAffected: (request: HookNxAffectedRequest) => HookRouterEffect<SpawnResult>;
    readonly runTarget: (target: HookNxRunTargetRequest) => HookRouterEffect<SpawnResult>;
    readonly runTargetArgv: (target: HookNxRunTargetRequest) => string[];
    readonly targetPlanForChangedPaths: (changedPaths: readonly string[]) => {
      readonly affectedTargets: readonly string[];
      readonly runTargets: readonly HookNxRunTargetRequest[];
    };
  };
  readonly time: {
    readonly now: typeof hookNow;
  };
}
