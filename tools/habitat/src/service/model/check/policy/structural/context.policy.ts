import type { BiomeProviderService } from "@habitat/cli/providers/biome/index";
import type { GitProviderService } from "@habitat/cli/providers/git/index";
import type { NxProviderService } from "@habitat/cli/providers/nx/index";
import type { CommandRunnerService } from "@habitat/cli/resources/command/index";
import type { HabitatStructureFileSystemReadPort } from "@habitat/cli/resources/platform/index";
import type { RuleDiagnosticsService } from "@habitat/cli/resources/rule-diagnostics/index";
import type { BaselineFileSystemPort } from "@habitat/cli/service/model/baseline/index";
import type {
  RuleExecutionDisposition,
  RuleExecutionTiming,
} from "@habitat/cli/service/model/check/index";
import type { RuleRunResult } from "@habitat/cli/service/model/diagnostics/policy/rule-runtime/architecture.policy";
import type { RuleFactsCatalog } from "@habitat/cli/service/model/rules/index";

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
  readonly structureFileSystem: HabitatStructureFileSystemReadPort;
}

export type StructuralBiomePort = Pick<BiomeProviderService, "run">;

export type StructuralCommandPort = Pick<CommandRunnerService, "run">;

export type StructuralGitPort = Pick<
  GitProviderService,
  "diffNameOnly" | "diffNameStatus" | "listVisiblePaths" | "lsTreeNameOnly" | "mergeBase" | "show"
>;

export type StructuralNxPort = Pick<NxProviderService, "runMany" | "runTarget">;

export interface StructuralNxRunManyRequest {
  readonly projects: readonly string[];
  readonly targets: readonly string[];
}

export interface StructuralNxRunTargetRequest {
  readonly project: string;
  readonly target: string;
}
