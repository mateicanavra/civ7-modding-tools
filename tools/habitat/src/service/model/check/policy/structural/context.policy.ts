import type { FileSystem } from "@effect/platform";
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

export interface StructuralExecutionContext {
  readonly baselineFileSystem: BaselineFileSystemPort;
  readonly repoRoot: string;
  readonly biome: StructuralBiomePort;
  readonly command: StructuralCommandPort;
  readonly git: StructuralGitPort;
  readonly ruleDiagnostics: RuleDiagnosticsService;
  readonly nx: StructuralNxPort;
  readonly rules: RuleFactsCatalog;
  readonly structureFileSystem: HabitatFileSystemReadPort<FileSystem.FileSystem>;
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
