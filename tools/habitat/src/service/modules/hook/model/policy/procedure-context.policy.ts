import type { BiomeProviderService } from "@habitat/cli/providers/biome/index";
import type { GitProviderService } from "@habitat/cli/providers/git/index";
import type { GraphiteProviderService } from "@habitat/cli/providers/graphite/index";
import type { NxProviderService } from "@habitat/cli/providers/nx/index";
import type { SpawnResult } from "@habitat/cli/resources/command/index";
import type {
  CheckOptions,
  CheckReport,
  HookCheckSummary,
} from "@habitat/cli/service/model/check/index";
import type { createCheckReportEffect } from "@habitat/cli/service/model/check/policy/structural/index";
import type { RuleFactsCatalog } from "@habitat/cli/service/model/rules/policy/catalog.policy";
import type { workspaceGraphTargetNames } from "@habitat/cli/service/model/workspace/index";
import type { PreCommitOutcome } from "../dto/hook.schema.js";
import type { HookCheckCommandResult } from "./check-command.policy.js";
import type { createHookOutput, HookReporterPort, HookResourcePolicy } from "./runtime.policy.js";

export interface HookBiomeCommandRequest {
  readonly kind: "format" | "check";
  readonly paths?: readonly string[];
  readonly write?: boolean;
  readonly noErrorsOnUnmatched?: boolean;
}

export interface HookGitCommandOptions {
  readonly cwd?: string;
}

export interface HookNxAffectedRequest {
  readonly base: string;
  readonly targets: readonly string[];
  readonly head?: string;
}

export interface HookNxRunManyRequest {
  readonly projects?: readonly string[];
  readonly targets: readonly string[];
}

export interface HookPlatformPort {
  readonly hashFile: (filePath: string) => string | null;
  readonly pathExists: (targetPath: string) => boolean;
  readonly repoRoot: string;
}

export function makeHookProcedureContext(input: {
  readonly biome: BiomeProviderService;
  readonly git: GitProviderService;
  readonly graphite: GraphiteProviderService;
  readonly nx: NxProviderService;
  readonly platform: HookPlatformPort;
  readonly reporter: HookReporterPort;
  readonly rules: RuleFactsCatalog;
  readonly createCheckReport: (
    options?: CheckOptions
  ) => ReturnType<typeof createCheckReportEffect>;
  readonly workspaceGraphTargetNames: typeof workspaceGraphTargetNames;
}) {
  return {
    biome: {
      run: (request: HookBiomeCommandRequest) => input.biome.run(request),
    },
    git: {
      add: (paths: readonly string[], options?: HookGitCommandOptions) =>
        input.git.add(paths, options),
      command: (argv: readonly string[], options?: HookGitCommandOptions) =>
        input.git.command(argv, options),
      diffNameOnly: (options?: {
        readonly cached?: boolean;
        readonly paths?: readonly string[];
        readonly cwd?: string;
      }) => input.git.diffNameOnly(options),
      diffNameStatus: (options?: { readonly cached?: boolean; readonly cwd?: string }) =>
        input.git.diffNameStatus(options),
      mergeBase: (ref: string, options?: HookGitCommandOptions) =>
        input.git.mergeBase(ref, options),
      remoteDefaultBranch: (options?: HookGitCommandOptions) =>
        input.git.remoteDefaultBranch(options),
    },
    graphite: {
      parent: (options?: HookGitCommandOptions) => input.graphite.parent(options),
    },
    nx: {
      affected: (request: HookNxAffectedRequest) => input.nx.affected(request),
      runMany: (request: HookNxRunManyRequest) => input.nx.runMany(request),
    },
    platform: input.platform,
    reporter: input.reporter,
    rules: input.rules,
    createCheckReport: input.createCheckReport,
    workspaceGraphTargetNames: input.workspaceGraphTargetNames,
  };
}

export type HookProcedureContext = ReturnType<typeof makeHookProcedureContext>;

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

export function renderLocalHookNotice(): string {
  return "hook result: workstation check only; CI remains authoritative.\n";
}
