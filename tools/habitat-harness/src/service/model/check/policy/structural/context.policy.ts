import type { FileSystem } from "@effect/platform";
import type {
  CommandProviderError,
  HabitatCommandResult,
  HabitatProcessRequest,
} from "@internal/habitat-harness/resources/command/index";
import type { BaselineFileSystemPort } from "@internal/habitat-harness/service/model/baseline/index";
import type {
  RuleExecutionDisposition,
  RuleExecutionTiming,
} from "@internal/habitat-harness/service/model/check/index";
import type { RuleRunResult } from "@internal/habitat-harness/service/model/diagnostics/policy/rule-runtime/architecture.policy";
import type {
  RuleFactsCatalog,
  RuleSourceFacts,
} from "@internal/habitat-harness/service/model/rules/index";
import type { SourceRuleFileSystem } from "@internal/habitat-harness/service/model/source-check/index";
import type { Effect } from "effect";

export interface RuleExecutionRecord {
  result: RuleRunResult;
  durationMs: number;
  timing?: RuleExecutionTiming;
  disposition: RuleExecutionDisposition;
}

export interface StructuralExecutionContext {
  readonly baselineFileSystem: BaselineFileSystemPort;
  readonly repoRoot: string;
  readonly biome: StructuralBiomePort;
  readonly command: StructuralCommandPort;
  readonly git: StructuralGitPort;
  readonly grit: StructuralGritPort;
  readonly nx: StructuralNxPort;
  readonly rules: RuleFactsCatalog;
  readonly sourceFileSystem: SourceRuleFileSystem<FileSystem.FileSystem>;
}

export interface StructuralBiomePort {
  readonly run: (request: {
    readonly kind: "ci";
  }) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
}

export interface StructuralCommandPort {
  readonly run: (
    request: HabitatProcessRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
}

export interface StructuralGitPort {
  readonly diffNameOnly: (input?: {
    readonly cached?: boolean;
    readonly cwd?: string;
  }) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
  readonly diffNameStatus: (input?: {
    readonly cached?: boolean;
    readonly cwd?: string;
  }) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
  readonly lsTreeNameOnly: (
    ref: string,
    repoPath: string,
    options?: { readonly cwd?: string }
  ) => Effect.Effect<readonly string[] | null, never, any>;
  readonly mergeBase: (
    ref: string,
    options?: { readonly cwd?: string }
  ) => Effect.Effect<string | null, never, any>;
  readonly show: (
    ref: string,
    repoPath: string,
    options?: { readonly cwd?: string }
  ) => Effect.Effect<string | null, never, any>;
}

export interface StructuralGritPort {
  readonly runRules: (
    selectedRules: readonly RuleSourceFacts[],
    options: { readonly repoRoot: string; readonly scanRoots?: readonly string[] }
  ) => Effect.Effect<Map<string, RuleRunResult>, never, any>;
}

export interface StructuralNxPort {
  readonly runMany: (
    request: StructuralNxRunManyRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
  readonly runTarget: (
    request: StructuralNxRunTargetRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
}

export interface StructuralNxRunManyRequest {
  readonly projects: readonly string[];
  readonly targets: readonly string[];
}

export interface StructuralNxRunTargetRequest {
  readonly project: string;
  readonly target: string;
}
