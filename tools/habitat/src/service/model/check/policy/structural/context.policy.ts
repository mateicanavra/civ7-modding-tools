import type {
  CommandProviderError,
  HabitatCommandResult,
  HabitatProcessRequest,
} from "@habitat/cli/resources/command/index";
import type { HabitatFileSystemReadPort } from "@habitat/cli/resources/platform/index";
import type { RuleDiagnosticsService } from "@habitat/cli/resources/rule-diagnostics/index";
import type { BaselineFileSystemPort } from "@habitat/cli/service/model/baseline/index";
import type {
  RuleExecutionDisposition,
  RuleExecutionTiming,
} from "@habitat/cli/service/model/check/index";
import type { RuleRunResult } from "@habitat/cli/service/model/diagnostics/policy/rule-runtime/architecture.policy";
import type { RuleFactsCatalog } from "@habitat/cli/service/model/rules/index";
import type { Effect } from "effect";

export interface RuleExecutionRecord {
  result: RuleRunResult;
  durationMs: number;
  timing?: RuleExecutionTiming;
  disposition: RuleExecutionDisposition;
}

export interface StructuralExecutionContext<R = never> {
  readonly baselineFileSystem: BaselineFileSystemPort<R>;
  readonly repoRoot: string;
  readonly biome: StructuralBiomePort<R>;
  readonly command: StructuralCommandPort<R>;
  readonly git: StructuralGitPort<R>;
  readonly ruleDiagnostics: RuleDiagnosticsService;
  readonly nx: StructuralNxPort<R>;
  readonly rules: RuleFactsCatalog;
  readonly structureFileSystem: HabitatFileSystemReadPort<R>;
}

export interface StructuralBiomePort<R = never> {
  readonly run: (request: {
    readonly kind: "ci";
  }) => Effect.Effect<HabitatCommandResult, CommandProviderError, R>;
}

export interface StructuralCommandPort<R = never> {
  readonly run: (
    request: HabitatProcessRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, R>;
}

export interface StructuralGitPort<R = never> {
  readonly diffNameOnly: (input?: {
    readonly cached?: boolean;
    readonly cwd?: string;
  }) => Effect.Effect<HabitatCommandResult, CommandProviderError, R>;
  readonly diffNameStatus: (input?: {
    readonly cached?: boolean;
    readonly cwd?: string;
  }) => Effect.Effect<HabitatCommandResult, CommandProviderError, R>;
  readonly lsTreeNameOnly: (
    ref: string,
    repoPath: string,
    options?: { readonly cwd?: string }
  ) => Effect.Effect<readonly string[] | null, never, R>;
  readonly mergeBase: (
    ref: string,
    options?: { readonly cwd?: string }
  ) => Effect.Effect<string | null, never, R>;
  readonly show: (
    ref: string,
    repoPath: string,
    options?: { readonly cwd?: string }
  ) => Effect.Effect<string | null, never, R>;
}

export interface StructuralNxPort<R = never> {
  readonly runMany: (
    request: StructuralNxRunManyRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, R>;
  readonly runTarget: (
    request: StructuralNxRunTargetRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, R>;
}

export interface StructuralNxRunManyRequest {
  readonly projects: readonly string[];
  readonly targets: readonly string[];
}

export interface StructuralNxRunTargetRequest {
  readonly project: string;
  readonly target: string;
}
